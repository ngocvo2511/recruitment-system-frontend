"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowDownCircle,
  BarChart3,
  Box,
  CheckCircle2,
  Clock,
  Database,
  Loader2,
  Play,
  RefreshCw,
  Search,
  Server,
  Trash2,
  XCircle,
  Zap,
} from "lucide-react";
import {
  ApiError,
  getOperationsOverview,
  getSearchLatency,
  getPipelineHealth,
  getAlerts,
  getCacheStats,
  evictAllCaches,
  startReEmbedCvs,
  startReEmbedJobs,
  startRebuildFts,
  cancelPipelineJob,
  type OperationsOverview,
  type SearchLatency,
  type PipelineHealth,
  type Alert,
  type CacheStats,
  type PipelineJobSummary,
} from "@/lib/api/operations";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatNumber(value?: number | null): string {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

function formatMs(value?: number | null): string {
  if (value == null) return "—";
  return `${value.toFixed(1)}ms`;
}

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function relativeTime(value?: string | null): string {
  if (!value) return "";
  const diff = Date.now() - new Date(value).getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 24 },
  },
};

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/* ------------------------------------------------------------------ */
/*  Skeleton loaders                                                   */
/* ------------------------------------------------------------------ */

function SkeletonCard() {
  return (
    <div className="glass-card p-6 rounded-2xl border border-white/60 shadow-sm animate-pulse">
      <div className="flex justify-between items-start">
        <div className="h-11 w-11 rounded-xl bg-slate-200" />
        <div className="h-6 w-20 rounded-full bg-slate-200" />
      </div>
      <div className="mt-5 space-y-2">
        <div className="h-3 w-24 bg-slate-200 rounded" />
        <div className="h-8 w-32 bg-slate-200 rounded" />
        <div className="h-3 w-40 bg-slate-200 rounded" />
      </div>
    </div>
  );
}

function SkeletonSection() {
  return (
    <div className="glass-card rounded-3xl p-8 border border-white shadow-sm animate-pulse">
      <div className="h-6 w-48 bg-slate-200 rounded mb-6" />
      <div className="space-y-4">
        <div className="h-12 bg-slate-200 rounded-xl" />
        <div className="h-12 bg-slate-200 rounded-xl" />
        <div className="h-12 bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Status badge                                                       */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; text: string; dot: string; pulse?: boolean }> = {
    RUNNING: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500", pulse: true },
    COMPLETED: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
    FAILED: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
    QUEUED: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
    CANCELLED: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
    STALLED: { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500", pulse: true },
  };
  const c = cfg[status] ?? cfg.QUEUED;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${c.bg} ${c.text}`}>
      <span className="relative flex h-2 w-2">
        {c.pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${c.dot} opacity-75`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${c.dot}`} />
      </span>
      {status}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Alert severity                                                     */
/* ------------------------------------------------------------------ */

function AlertCard({ alert }: { alert: Alert }) {
  const isCritical = alert.severity === "CRITICAL";
  const isWarning = alert.severity === "WARNING";
  return (
    <motion.div
      variants={cardVariants}
      className={`rounded-2xl p-5 border ${
        isCritical
          ? "bg-red-50 border-red-200 shadow-red-100/50 shadow-lg"
          : isWarning
            ? "bg-amber-50 border-amber-200 shadow-amber-100/50 shadow-md"
            : "bg-blue-50 border-blue-200 shadow-blue-100/50 shadow-sm"
      } ${isCritical ? "animate-pulse" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 p-1.5 rounded-lg ${isCritical ? "bg-red-100 text-red-600" : isWarning ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"}`}>
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-black uppercase tracking-wider ${isCritical ? "text-red-600" : isWarning ? "text-amber-600" : "text-blue-600"}`}>
              {alert.severity}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">{alert.type}</span>
          </div>
          <p className="text-sm font-bold text-on-surface">{alert.message}</p>
          <p className="text-xs text-on-surface-variant mt-1">{alert.details}</p>
          <span className="text-[10px] text-slate-400 font-bold mt-2 block">{relativeTime(alert.detectedAt)}</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pipeline progress bar                                              */
/* ------------------------------------------------------------------ */

function ProgressBar({ processed, total }: { processed: number; total: number }) {
  const pct = total > 0 ? Math.min((processed / total) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-3 min-w-[140px]">
      <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
        <motion.div
          className="h-full rounded-full signature-gradient"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <span className="text-[11px] font-bold text-on-surface-variant whitespace-nowrap">
        {processed}/{total}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Latency bucket chart                                               */
/* ------------------------------------------------------------------ */

function LatencyChart({ buckets }: { buckets: Record<string, number> }) {
  const entries = Object.entries(buckets);
  if (entries.length === 0)
    return <p className="text-sm text-on-surface-variant">No latency data available.</p>;
  const max = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div className="flex items-end gap-1 h-44 px-2">
      {entries.map(([label, value], index) => {
        const pct = Math.max((value / max) * 100, 3);
        return (
          <div key={label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
            <span className="text-[10px] font-bold text-on-surface opacity-0 group-hover:opacity-100 transition-opacity">
              {formatNumber(value)}
            </span>
            <motion.div
              className="w-full rounded-t-lg signature-gradient cursor-pointer"
              initial={{ height: 0 }}
              animate={{ height: `${pct}%` }}
              transition={{ delay: index * 0.05, duration: 0.5, ease: "easeOut" }}
              style={{ minHeight: 4 }}
            />
            <span className="text-[9px] font-bold text-on-surface-variant truncate max-w-full">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Latency filter tabs                                                */
/* ------------------------------------------------------------------ */

const LATENCY_TABS = [
  { key: "", label: "ALL" },
  { key: "MATCH", label: "MATCH" },
  { key: "RECOMMEND_JOBS", label: "RECOMMEND JOBS" },
  { key: "RECOMMEND_CVS", label: "RECOMMEND CVS" },
];

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function OperationsDashboardPage() {
  const [overview, setOverview] = useState<OperationsOverview | null>(null);
  const [latency, setLatency] = useState<SearchLatency | null>(null);
  const [pipeline, setPipeline] = useState<PipelineHealth | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [cache, setCache] = useState<CacheStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [latencyTab, setLatencyTab] = useState("");
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ---------- data fetching ---------- */

  const fetchAll = useCallback(
    async (showLoader = false) => {
      if (showLoader) setLoading(true);
      setErrorMessage(null);
      try {
        const [ov, lat, pip, al, ca] = await Promise.all([
          getOperationsOverview(),
          getSearchLatency(latencyTab || undefined),
          getPipelineHealth(),
          getAlerts(),
          getCacheStats(),
        ]);
        setOverview(ov);
        setLatency(lat);
        setPipeline(pip);
        setAlerts(al);
        setCache(ca);
      } catch (error) {
        setErrorMessage(
          error instanceof ApiError ? error.message : "Unable to load operations data.",
        );
      } finally {
        setLoading(false);
      }
    },
    [latencyTab],
  );

  useEffect(() => {
    void fetchAll(true);
  }, [fetchAll]);

  /* auto-refresh every 30s */
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      void fetchAll(false);
    }, 30_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchAll]);

  /* refetch latency on tab change */
  useEffect(() => {
    void (async () => {
      try {
        const lat = await getSearchLatency(latencyTab || undefined);
        setLatency(lat);
      } catch {
        /* keep previous */
      }
    })();
  }, [latencyTab]);

  /* ---------- actions ---------- */

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAction = async (
    key: string,
    fn: () => Promise<unknown>,
    successMsg: string,
  ) => {
    setActionBusy(key);
    try {
      await fn();
      showToast(successMsg);
      void fetchAll(false);
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Action failed.");
    } finally {
      setActionBusy(null);
    }
  };

  /* ---------- loading state ---------- */

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="h-10 w-72 bg-slate-200 rounded-xl animate-pulse" />
          <div className="h-10 w-32 bg-slate-200 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SkeletonSection />
          <SkeletonSection />
        </div>
      </div>
    );
  }

  /* ---------- error state ---------- */

  if (errorMessage) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm font-medium text-error">
          <XCircle className="w-4 h-4" />
          {errorMessage}
        </div>
      </div>
    );
  }

  /* ---------- render ---------- */

  return (
    <motion.div
      className="max-w-7xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-[100] glass-card border border-white/80 shadow-2xl rounded-2xl px-6 py-3 text-sm font-semibold text-on-surface flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header variants={fadeIn} className="mb-10 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2 flex items-center gap-3">
            <span className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
              <Activity className="w-7 h-7" />
            </span>
            Operations Dashboard
          </h1>
          <p className="text-on-surface-variant font-medium">
            Real-time system health, pipeline monitoring, and search performance.
          </p>
        </div>
        <button
          onClick={() => fetchAll(false)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/80 border border-slate-200 text-sm font-semibold text-on-surface hover:bg-white hover:shadow-lg transition-all duration-200 active:scale-95"
          type="button"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </motion.header>

      {/* Overview Cards */}
      <motion.section
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
      >
        {/* Total Embeddings */}
        <motion.div
          variants={cardVariants}
          className="glass-card p-6 rounded-2xl border border-white/60 shadow-sm flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Database className="w-6 h-6" />
            </div>
            <span className="flex items-center text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              vectors
            </span>
          </div>
          <div className="mt-5">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">
              Total Embeddings
            </p>
            <h2 className="text-3xl font-black text-on-surface tracking-tight">
              {formatNumber((overview?.totalCvEmbeddings ?? 0) + (overview?.totalJobEmbeddings ?? 0))}
            </h2>
            <p className="text-xs text-on-surface-variant mt-2 font-medium">
              {formatNumber(overview?.totalCvEmbeddings)} CVs · {formatNumber(overview?.totalJobEmbeddings)} Jobs
            </p>
          </div>
        </motion.div>

        {/* Active Pipeline Jobs */}
        <motion.div
          variants={cardVariants}
          className="glass-card p-6 rounded-2xl border border-white/60 shadow-sm flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-secondary/10 rounded-xl text-secondary">
              <Server className="w-6 h-6" />
            </div>
            {(overview?.activePipelineJobs ?? 0) > 0 ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                </span>
                processing
              </span>
            ) : (
              <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                idle
              </span>
            )}
          </div>
          <div className="mt-5">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">
              Active Pipeline Jobs
            </p>
            <h2 className="text-3xl font-black text-on-surface tracking-tight">
              {formatNumber(overview?.activePipelineJobs)}
            </h2>
            <p className="text-xs text-on-surface-variant mt-2 font-medium">
              {formatNumber(overview?.queuedPipelineJobs)} queued · {formatNumber(overview?.failedPipelineJobs)} failed
            </p>
          </div>
        </motion.div>

        {/* Search Latency */}
        <motion.div
          variants={cardVariants}
          className="glass-card p-6 rounded-2xl border border-white/60 shadow-sm flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600">
              <Zap className="w-6 h-6" />
            </div>
            <span className="flex items-center text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
              p95
            </span>
          </div>
          <div className="mt-5">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">
              Search Latency
            </p>
            <h2 className="text-3xl font-black text-on-surface tracking-tight">
              {formatMs(overview?.avgSearchLatencyMs)}
            </h2>
            <p className="text-xs text-on-surface-variant mt-2 font-medium">
              p95: {formatMs(overview?.p95SearchLatencyMs)}
            </p>
          </div>
        </motion.div>

        {/* Total Search Requests — gradient card */}
        <motion.div
          variants={cardVariants}
          className="glass-card p-6 rounded-2xl border border-white/40 shadow-sm flex flex-col justify-between signature-gradient text-white shadow-lg shadow-primary/20 relative overflow-hidden"
        >
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="flex justify-between items-start relative z-10">
            <div className="p-2.5 bg-white/20 rounded-xl text-white backdrop-blur-sm">
              <Search className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-5 relative z-10">
            <p className="text-[10px] uppercase tracking-widest text-white/80 font-bold mb-1">
              Search Requests
            </p>
            <h2 className="text-3xl font-black tracking-tight text-white mb-2">
              {formatNumber(overview?.totalSearchRequests)}
            </h2>
            <p className="text-[10px] text-white/80 font-medium">
              {formatNumber(overview?.totalCaches)} active caches
            </p>
          </div>
        </motion.div>
      </motion.section>

      {/* Alerts */}
      <AnimatePresence>
        {alerts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-10"
          >
            <motion.div variants={fadeIn}>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-bold text-on-surface">Active Alerts</h2>
                <span className="ml-2 text-[10px] font-black text-white bg-red-500 px-2 py-0.5 rounded-full">
                  {alerts.length}
                </span>
              </div>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {alerts.map((alert, index) => (
                  <AlertCard key={`${alert.type}-${index}`} alert={alert} />
                ))}
              </motion.div>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Pipeline Jobs Section */}
      <motion.section variants={fadeIn} className="mb-10">
        <div className="glass-card rounded-3xl p-8 border border-white shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-on-surface mb-1">Pipeline Jobs</h2>
              <p className="text-sm text-on-surface-variant font-medium">
                Manage embedding pipelines and FTS index rebuilds.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  handleAction("reembed-cvs", startReEmbedCvs, "Re-embed CVs job started!")
                }
                disabled={actionBusy !== null}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dim transition-colors disabled:opacity-50 active:scale-95 shadow-sm shadow-primary/20"
                type="button"
              >
                {actionBusy === "reembed-cvs" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                Re-embed All CVs
              </button>
              <button
                onClick={() =>
                  handleAction("reembed-jobs", startReEmbedJobs, "Re-embed Jobs job started!")
                }
                disabled={actionBusy !== null}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary text-white text-xs font-bold hover:bg-secondary-dim transition-colors disabled:opacity-50 active:scale-95 shadow-sm shadow-secondary/20"
                type="button"
              >
                {actionBusy === "reembed-jobs" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                Re-embed All Jobs
              </button>
              <button
                onClick={() =>
                  handleAction("rebuild-fts", startRebuildFts, "FTS rebuild job started!")
                }
                disabled={actionBusy !== null}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 active:scale-95 shadow-sm shadow-blue-500/20"
                type="button"
              >
                {actionBusy === "rebuild-fts" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ArrowDownCircle className="w-3.5 h-3.5" />
                )}
                Rebuild FTS Index
              </button>
            </div>
          </div>

          {/* Pipeline Health Summary */}
          {pipeline && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
              {[
                { label: "Active", value: pipeline.activeJobs, color: "text-blue-600 bg-blue-50" },
                { label: "Queued", value: pipeline.queuedJobs, color: "text-slate-600 bg-slate-100" },
                { label: "Completed", value: pipeline.completedJobs, color: "text-emerald-600 bg-emerald-50" },
                { label: "Failed", value: pipeline.failedJobs, color: "text-red-600 bg-red-50" },
                { label: "Stalled", value: pipeline.stalledJobs, color: "text-orange-600 bg-orange-50" },
              ].map((item) => (
                <div key={item.label} className={`rounded-xl px-4 py-3 ${item.color}`}>
                  <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">{item.label}</p>
                  <p className="text-2xl font-black">{item.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Jobs Table */}
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200/60">
                  <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                    Progress
                  </th>
                  <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                    Started
                  </th>
                  <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                    Completed
                  </th>
                  <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {(!pipeline?.recentJobs || pipeline.recentJobs.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-on-surface-variant">
                      No pipeline jobs found.
                    </td>
                  </tr>
                ) : (
                  pipeline.recentJobs.map((job: PipelineJobSummary) => (
                    <tr
                      key={job.id}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-on-surface">{job.jobType}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="py-3 px-4">
                        <ProgressBar processed={job.processedItems} total={job.totalItems} />
                      </td>
                      <td className="py-3 px-4 text-on-surface-variant text-xs">{formatDate(job.startedAt)}</td>
                      <td className="py-3 px-4 text-on-surface-variant text-xs">{formatDate(job.completedAt)}</td>
                      <td className="py-3 px-4 text-right">
                        {(job.status === "RUNNING" || job.status === "QUEUED") && (
                          <button
                            onClick={() =>
                              handleAction(
                                `cancel-${job.id}`,
                                () => cancelPipelineJob(job.id),
                                "Pipeline job cancelled.",
                              )
                            }
                            disabled={actionBusy !== null}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors disabled:opacity-40"
                            type="button"
                            title="Cancel job"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.section>

      {/* Bottom grid: Latency + Cache */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Search Latency Section */}
        <motion.div variants={fadeIn} className="lg:col-span-2">
          <div className="glass-card rounded-3xl p-8 border border-white shadow-sm h-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-on-surface mb-1 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Search Latency
                </h2>
                <p className="text-sm text-on-surface-variant font-medium">
                  Distribution of response times by bucket.
                </p>
              </div>
              {/* Filter tabs */}
              <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
                {LATENCY_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setLatencyTab(tab.key)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${
                      latencyTab === tab.key
                        ? "bg-white text-primary shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                    type="button"
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart */}
            <LatencyChart buckets={latency?.latencyBuckets ?? {}} />

            {/* Percentile pills */}
            {latency && (
              <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-slate-200/60">
                {[
                  { label: "p50", value: latency.p50LatencyMs },
                  { label: "p90", value: latency.p90LatencyMs },
                  { label: "p95", value: latency.p95LatencyMs },
                  { label: "p99", value: latency.p99LatencyMs },
                  { label: "min", value: latency.minLatencyMs },
                  { label: "max", value: latency.maxLatencyMs },
                  { label: "avg", value: latency.avgLatencyMs },
                ].map((p) => (
                  <div
                    key={p.label}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/60"
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">
                      {p.label}
                    </span>
                    <span className="text-sm font-bold text-on-surface">{formatMs(p.value)}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/10">
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                    total
                  </span>
                  <span className="text-sm font-bold text-primary">
                    {formatNumber(latency.totalRequests)} reqs
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Cache Stats Section */}
        <motion.div variants={fadeIn} className="lg:col-span-1">
          <div className="glass-card rounded-3xl p-6 border border-white shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <Box className="w-5 h-5 text-secondary" />
                Caches
              </h2>
              <span className="text-xs font-bold text-secondary bg-secondary/10 px-2.5 py-1 rounded-full">
                {cache?.totalCaches ?? 0} active
              </span>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto pr-1 mb-6">
              {(!cache?.cacheNames || cache.cacheNames.length === 0) ? (
                <div className="rounded-2xl bg-surface-container-low/50 p-5 text-sm text-on-surface-variant">
                  No active caches.
                </div>
              ) : (
                cache.cacheNames.map((name) => (
                  <div
                    key={name}
                    className="flex items-center gap-3 rounded-xl bg-surface-container-low/50 p-3 border border-outline-variant/10"
                  >
                    <span className="flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <span className="text-sm font-semibold text-on-surface truncate">{name}</span>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() =>
                handleAction("evict", evictAllCaches, "All caches evicted successfully!")
              }
              disabled={actionBusy !== null}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition-colors disabled:opacity-50 active:scale-95 border border-red-100"
              type="button"
            >
              {actionBusy === "evict" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Evict All Caches
            </button>
          </div>
        </motion.div>
      </div>

      {/* Auto-refresh indicator */}
      <motion.div variants={fadeIn} className="flex items-center justify-center gap-2 pb-6 text-xs text-on-surface-variant font-medium">
        <Clock className="w-3.5 h-3.5" />
        Auto-refreshes every 30 seconds
      </motion.div>
    </motion.div>
  );
}
