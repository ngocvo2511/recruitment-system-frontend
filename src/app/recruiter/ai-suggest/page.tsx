"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, MapPin, ArrowRight, Bookmark, RefreshCw, Star, Loader2, ChevronDown, CheckCircle2, Search } from "lucide-react";
import { getJobs, getJobMatches, CvRecommendationResponse, JobSummaryResponse } from "@/lib/api/jobs";
import { getRecruiterJobApplications } from "@/lib/api/applications";

export default function AISuggestionsPage() {
  const [jobs, setJobs] = useState<JobSummaryResponse[]>([]);
  const [appliedCandidateIds, setAppliedCandidateIds] = useState<Set<string>>(new Set());
  const [rejectedCandidateIds, setRejectedCandidateIds] = useState<Set<string>>(new Set());
  const [selectedJob, setSelectedJob] = useState<JobSummaryResponse | null>(null);
  const [matches, setMatches] = useState<CvRecommendationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      const pageData = await getJobs();
      const activeJobs = (pageData.content || []).filter(job => job.status !== "CLOSED");
      setJobs(activeJobs);
      if (activeJobs.length > 0) {
        setSelectedJob(activeJobs[0]);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMatches = useCallback(async (jobId: string) => {
    try {
      setIsSyncing(true);
      const data = await getJobMatches(jobId, 5);
      setMatches(data);
    } catch (error) {
      console.error("Failed to fetch matches:", error);
      setMatches([]);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const fetchApplications = useCallback(async (jobId: string) => {
    try {
      const apps = await getRecruiterJobApplications(jobId);
      setAppliedCandidateIds(new Set(apps.map((a) => a.candidateId)));
      setRejectedCandidateIds(new Set(apps.filter((a) => a.status === "REJECTED" || a.status === "WITHDRAWN").map((a) => a.candidateId)));
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      setAppliedCandidateIds(new Set());
      setRejectedCandidateIds(new Set());
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    if (selectedJob) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchMatches(selectedJob.id);
      fetchApplications(selectedJob.id);
    }
  }, [fetchMatches, fetchApplications, selectedJob]);

  const handleSync = () => {
    if (selectedJob) {
      fetchMatches(selectedJob.id);
      fetchApplications(selectedJob.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-on-surface-variant font-medium">Đang tải dữ liệu gợi ý AI...</p>
      </div>
    );
  }

  const validMatches = matches.filter((m) => !m.candidateId || !rejectedCandidateIds.has(m.candidateId));

  const topMatch = validMatches.length > 0 ? validMatches[0] : null;
  const secondaryMatch = validMatches.length > 1 ? validMatches[1] : null;
  const otherMatches = validMatches.slice(2);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-12 relative z-20">
        <div className="absolute -top-12 -right-8 w-64 h-64 signature-gradient opacity-5 rounded-full blur-[100px]"></div>
        <div className="grid gap-6 relative z-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="min-w-0">
            <span className="text-primary font-bold text-xs tracking-[0.2em] uppercase mb-3 block">Gợi ý ứng viên bằng AI</span>
            
            {/* Job Selector */}
            <div className="relative mb-4">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="inline-flex max-w-full items-center gap-3 text-3xl font-black text-on-surface hover:text-primary transition-colors text-left md:text-4xl"
              >
                <span className="shrink-0 whitespace-nowrap">Ứng viên phù hợp cho</span>
                <span className="min-w-0 max-w-[min(520px,46vw)] truncate underline decoration-primary/30 decoration-4 underline-offset-8">
                  {selectedJob?.title || "Chọn tin tuyển dụng"}
                </span>
                <ChevronDown className={`h-7 w-7 shrink-0 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-4 w-full md:w-[600px] bg-surface rounded-2xl shadow-2xl border border-outline-variant overflow-hidden z-50">
                  <div className="max-h-[300px] overflow-y-auto p-2">
                    {jobs.length === 0 ? (
                      <p className="p-4 text-center text-on-surface-variant">Chưa có tin tuyển dụng đang hoạt động.</p>
                    ) : (
                      jobs.map(job => (
                        <button
                          key={job.id}
                          onClick={() => {
                            setSelectedJob(job);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-6 py-4 rounded-xl flex items-center justify-between hover:bg-surface-container-low transition-colors ${selectedJob?.id === job.id ? "bg-primary/5 border border-primary/10" : ""}`}
                        >
                          <div>
                            <h4 className={`font-bold ${selectedJob?.id === job.id ? "text-primary" : "text-on-surface"}`}>{job.title}</h4>
                            <p className="text-sm text-on-surface-variant flex items-center gap-2 mt-1">
                              <MapPin className="w-3 h-3" /> {job.location || "Làm việc từ xa"} • {job.level || "Không yêu cầu cấp bậc"}
                            </p>
                          </div>
                          {selectedJob?.id === job.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">AI phân tích CV dựa trên mô tả công việc, yêu cầu kỹ năng, mức độ phù hợp ngữ nghĩa và tín hiệu từ hồ sơ ứng viên.</p>
          </div>
          <div className="flex flex-wrap gap-3 lg:flex-nowrap lg:justify-end">
            <Link href="/recruiter/jobs" className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-full border border-outline-variant px-5 text-sm font-bold text-on-surface-variant transition-all hover:bg-surface-container-low">
              Quản lý tin tuyển dụng
            </Link>
            <button 
              onClick={handleSync}
              disabled={isSyncing || !selectedJob}
              className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-secondary px-5 text-sm font-bold text-white shadow-xl shadow-secondary/20 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Đang đồng bộ..." : "Đồng bộ lại AI"}
            </button>
          </div>
        </div>
      </div>

      {isSyncing ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <Sparkles className="w-8 h-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-xl font-bold text-on-surface">Đang tìm ứng viên phù hợp...</p>
          <p className="text-on-surface-variant">AI đang phân tích CV và so khớp với yêu cầu tuyển dụng.</p>
        </div>
      ) : validMatches.length === 0 ? (
        <div className="glass-card rounded-[2rem] p-12 text-center border border-white/40 shadow-sm">
          <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-on-surface-variant opacity-50" />
          </div>
          <h3 className="text-2xl font-black text-on-surface mb-2">Chưa tìm thấy ứng viên phù hợp</h3>
          <p className="text-on-surface-variant max-w-md mx-auto">
            Hệ thống chưa tìm thấy CV phù hợp với tin tuyển dụng này. Bạn có thể điều chỉnh yêu cầu hoặc quay lại sau khi có thêm ứng viên mới.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
          
          {/* Rank 1 - Featured Match */}
          {topMatch && (
            <div className="lg:col-span-8 group">
              <div className="glass-card rounded-[2rem] p-8 border border-white/40 shadow-sm relative overflow-hidden transition-shadow hover:shadow-2xl hover:shadow-primary/10">
                <div className="absolute top-0 right-0 p-6">
                  <div className="flex flex-col items-end">
                    <div className="text-6xl font-black text-primary opacity-20 tracking-tighter">01</div>
                    <div className="mt-2 flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                      <Star className="w-4 h-4 fill-secondary" />
                      <span className="text-sm font-bold">Phù hợp nhất</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                  <div className="relative shrink-0 mt-4 h-32 w-32 md:h-48 md:w-48">
                    {/* Candidate avatars can come from user-managed external URLs. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      alt={topMatch.candidateName || "Ứng viên"} 
                      className="h-full w-full rounded-[2rem] object-cover shadow-xl bg-surface-container-high" 
                      src={topMatch.candidateAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(topMatch.candidateName || "CV")}&background=0050d4&color=fff&size=200`} 
                    />
                    <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full signature-gradient border-4 border-surface-container-lowest flex flex-col items-center justify-center text-white">
                      <span className="text-[10px] uppercase font-bold leading-none">Điểm</span>
                      <span className="text-xl font-black">{topMatch.matchScore || 0}%</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 mt-4 md:mt-0">
                    <h3 className="text-3xl font-black text-on-surface mb-2">{topMatch.candidateName || topMatch.cv.cvName}</h3>
                    <p className="text-primary font-bold text-sm mb-6 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {topMatch.candidateHeadline || "Sẵn sàng tìm việc"}
                    </p>
                    
                    <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 mb-8">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="text-primary w-4 h-4 fill-primary/20" />
                        <span className="font-bold text-on-surface text-sm uppercase tracking-wider">Vì sao phù hợp?</span>
                      </div>
                      <p className="text-on-surface-variant leading-relaxed text-sm">
                        AI đánh giá ứng viên này là lựa chọn phù hợp nhất với yêu cầu tuyển dụng. CV <strong>{topMatch.cv.cvName}</strong> có mức độ tương đồng cao với mô tả công việc và các kỹ năng cần thiết.
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mb-8">
                      {/* We don't have skills directly in CvRecommendationResponse yet, so we show generic badges or hide them */}
                      <span className="px-4 py-2 rounded-full bg-surface-container-high text-on-surface text-xs font-bold uppercase tracking-widest">Rất phù hợp</span>
                      <span className="px-4 py-2 rounded-full bg-surface-container-high text-on-surface text-xs font-bold uppercase tracking-widest">AI đề xuất</span>
                      {topMatch.candidateId && appliedCandidateIds.has(topMatch.candidateId) && (
                        <span className="px-4 py-2 rounded-full bg-green-100 text-green-700 border border-green-200 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Đã ứng tuyển
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-4">
                      {topMatch.candidateId ? (
                        appliedCandidateIds.has(topMatch.candidateId) ? (
                          <Link href={`/recruiter/candidates/${topMatch.candidateId}?cvId=${topMatch.cv.id}`} className="flex-1 py-4 rounded-2xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/20">
                            Xem đơn ứng tuyển
                            <ArrowRight className="w-5 h-5" />
                          </Link>
                        ) : (
                          <Link href={`/recruiter/ai-suggest/candidates/${topMatch.candidateId}?cvId=${topMatch.cv.id}&jobId=${selectedJob?.id}`} className="flex-1 py-4 rounded-2xl signature-gradient text-white font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                            Xem hồ sơ
                            <ArrowRight className="w-5 h-5" />
                          </Link>
                        )
                      ) : (
                        <button className="flex-1 py-4 rounded-2xl bg-surface-container-high text-on-surface-variant font-bold cursor-not-allowed flex items-center justify-center gap-2">
                          Chưa có hồ sơ
                        </button>
                      )}
                      <button className="w-14 h-14 rounded-2xl border border-outline-variant flex items-center justify-center hover:bg-surface-container-low transition-all group">
                        <Bookmark className="w-6 h-6 text-on-surface-variant group-hover:text-primary transition-colors" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Match Stats Sidebar & Secondary Candidate */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-secondary p-8 rounded-[2rem] text-white shadow-xl shadow-secondary/30 relative overflow-hidden">
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <h4 className="text-xl font-bold mb-6 relative z-10">Phân tích mức độ phù hợp</h4>
              
              <div className="space-y-6 relative z-10">
                <div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2 opacity-80">Điểm phù hợp tổng thể</div>
                  <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white transition-all duration-1000 ease-out" style={{ width: `${topMatch?.matchScore || 0}%` }}></div>
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-white/10">
                  <p className="text-sm italic opacity-80 leading-relaxed">
                    Điểm số được tính bằng thuật toán kết hợp tìm kiếm ngữ nghĩa, phân tích toàn văn và so khớp kỹ năng chính xác.
                  </p>
                </div>
              </div>
            </div>

            {/* Secondary Candidate */}
            {secondaryMatch && (
              <div className="glass-card rounded-[2rem] p-6 border border-white/40 shadow-sm transition-shadow hover:shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <span className="text-4xl font-black">02</span>
                </div>
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="relative h-16 w-16 shrink-0">
                    {/* Candidate avatars can come from user-managed external URLs. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      alt={secondaryMatch.candidateName || "Ứng viên"} 
                      className="h-full w-full rounded-2xl object-cover bg-surface-container-high" 
                      src={secondaryMatch.candidateAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(secondaryMatch.candidateName || "CV")}&background=6a37d4&color=fff&size=100`} 
                    />
                    <div className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      {secondaryMatch.matchScore || 0}%
                    </div>
                  </div>
                  <div>
                    <h5 className="text-lg font-black text-on-surface leading-tight mb-1 line-clamp-1">{secondaryMatch.candidateName || secondaryMatch.cv.cvName}</h5>
                    <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider line-clamp-1">{secondaryMatch.candidateHeadline || "Sẵn sàng tìm việc"}</p>
                    {secondaryMatch.candidateId && appliedCandidateIds.has(secondaryMatch.candidateId) && (
                      <span className="inline-flex mt-2 px-2 py-0.5 rounded bg-green-100 text-green-700 border border-green-200 text-[10px] font-bold uppercase tracking-widest items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Đã ứng tuyển
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-on-surface-variant mb-6 line-clamp-2">Ứng viên có mức độ phù hợp tốt với các yêu cầu cốt lõi của vị trí.</p>
                {secondaryMatch.candidateId ? (
                  appliedCandidateIds.has(secondaryMatch.candidateId) ? (
                    <Link href={`/recruiter/candidates/${secondaryMatch.candidateId}?cvId=${secondaryMatch.cv.id}`} className="w-full py-3 rounded-xl bg-green-50 text-green-700 border border-green-200 font-bold text-sm hover:bg-green-600 hover:text-white transition-all block text-center">
                      Xem đơn ứng tuyển
                    </Link>
                  ) : (
                    <Link href={`/recruiter/ai-suggest/candidates/${secondaryMatch.candidateId}?cvId=${secondaryMatch.cv.id}&jobId=${selectedJob?.id}`} className="w-full py-3 rounded-xl bg-surface-container-high text-on-surface font-bold text-sm hover:bg-primary hover:text-white transition-all block text-center">
                      Xem chi tiết
                    </Link>
                  )
                ) : (
                  <button className="w-full py-3 rounded-xl bg-surface-container-low text-on-surface-variant font-bold text-sm cursor-not-allowed">
                    Chưa có hồ sơ
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bottom Row Candidates */}
          {otherMatches.length > 0 && (
            <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
              {otherMatches.map((match, idx) => (
                <div key={match.cv.id} className="glass-card rounded-[2rem] p-6 border border-white/40 shadow-sm group hover:border-primary/20 transition-colors relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <span className="text-4xl font-black">0{idx + 3}</span>
                  </div>
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="h-14 w-14 shrink-0">
                      {/* Candidate avatars can come from user-managed external URLs. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        alt={match.candidateName || "Ứng viên"} 
                        className="h-full w-full rounded-xl object-cover bg-surface-container-high" 
                        src={match.candidateAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.candidateName || "CV")}&background=0057bd&color=fff&size=100`} 
                      />
                    </div>
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black shadow-inner shadow-primary/5">
                      Phù hợp {match.matchScore || 0}%
                    </div>
                  </div>
                  <h5 className="text-xl font-black text-on-surface mb-1 line-clamp-1 relative z-10">{match.candidateName || match.cv.cvName}</h5>
                  <p className="text-xs text-secondary font-bold uppercase tracking-widest mb-2 line-clamp-1 relative z-10">{match.candidateHeadline || "Ứng viên tiềm năng"}</p>
                  {match.candidateId && appliedCandidateIds.has(match.candidateId) && (
                    <div className="mb-4 relative z-10">
                      <span className="inline-flex px-2 py-0.5 rounded bg-green-100 text-green-700 border border-green-200 text-[10px] font-bold uppercase tracking-widest items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Đã ứng tuyển
                      </span>
                    </div>
                  )}
                  <div className="p-4 bg-surface-container-low rounded-xl mb-6 min-h-[80px] relative z-10">
                    <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-2">Phù hợp với các yêu cầu kỹ thuật được nêu trong mô tả công việc.</p>
                  </div>
                  {match.candidateId ? (
                    appliedCandidateIds.has(match.candidateId) ? (
                      <Link href={`/recruiter/candidates/${match.candidateId}?cvId=${match.cv.id}`} className="w-full py-3 rounded-xl border-2 border-green-200 text-green-700 bg-green-50 font-bold text-sm hover:bg-green-600 hover:text-white hover:border-green-600 transition-all block text-center relative z-10">
                        Xem đơn
                      </Link>
                    ) : (
                      <Link href={`/recruiter/ai-suggest/candidates/${match.candidateId}?cvId=${match.cv.id}&jobId=${selectedJob?.id}`} className="w-full py-3 rounded-xl border-2 border-primary/10 text-primary font-bold text-sm group-hover:bg-primary group-hover:text-white transition-all block text-center relative z-10">
                        Xem hồ sơ
                      </Link>
                    )
                  ) : (
                    <button className="w-full py-3 rounded-xl border-2 border-outline-variant text-on-surface-variant font-bold text-sm cursor-not-allowed">
                      Chưa khả dụng
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Contextual FAB */}
      <button className="fixed bottom-8 right-8 w-16 h-16 rounded-full signature-gradient text-white shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group">
        <Sparkles className="w-8 h-8 fill-white/20" />
        <span className="absolute right-full mr-4 px-4 py-2 bg-inverse-surface text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Bộ phân tích AI</span>
      </button>
    </div>
  );
}
