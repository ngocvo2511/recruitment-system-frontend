"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building, CheckCircle2, Hourglass, Loader2, Send, ShieldCheck } from "lucide-react";
import { joinCompany, type CompanyMemberResponse } from "@/lib/api/company";

export default function JoinCompanyPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState("");
  const [member, setMember] = useState<CompanyMemberResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const result = await joinCompany(companyId.trim());
      setMember(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send join request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center p-6 pt-24 pb-20 w-full animate-fade-in-up">
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] -z-10 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-secondary/5 blur-[100px] -z-10 pointer-events-none"></div>

      <div className="w-full max-w-2xl mb-12 text-center relative z-10">
        <span className="text-[10px] font-bold tracking-[0.1em] text-primary uppercase mb-4 block">Company Verification</span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-4">Join Your Team</h1>
        <p className="text-on-surface-variant text-lg max-w-lg mx-auto">
          Enter an existing company ID to request access as a recruiter.
        </p>
      </div>

      <div className="w-full max-w-xl glass-card p-8 md:p-12 rounded-[2rem] shadow-[0_40px_60px_-15px_rgba(44,47,49,0.06)] relative border border-white/40 z-10">
        {!member ? (
          <form className="space-y-8 animate-fade-in" onSubmit={handleJoin}>
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-100/10 border border-red-500/20 rounded-xl">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <label className="text-sm font-bold tracking-wider text-on-surface-variant uppercase flex items-center gap-2">
                <Building className="w-4 h-4" />
                Company ID
              </label>
              <input
                required
                className="w-full bg-surface-container-high/50 border-none rounded-xl py-4 px-6 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all duration-300 outline-none"
                placeholder="Paste company UUID"
                type="text"
                value={companyId}
                onChange={(event) => setCompanyId(event.target.value)}
              />
              <p className="text-xs text-on-surface-variant">
                Backend hiện chưa có API tìm kiếm công ty, nên bước này cần company UUID thật.
              </p>
            </div>

            <button disabled={isSubmitting} className="w-full signature-gradient text-white py-4 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] hover:shadow-xl active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none" type="submit">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Request to Join"}
              {!isSubmitting && <Send className="w-4 h-4 ml-1" />}
            </button>

            <p className="text-center text-xs text-on-surface-variant">
              Can't find your company?
              <Link className="text-primary font-bold hover:underline underline-offset-2 ml-1" href="/company/create">
                Register a new organization
              </Link>
            </p>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-6 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-secondary-container/50 border border-secondary/20 flex items-center justify-center mb-2">
              <Hourglass className="text-secondary w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-on-surface mb-2">Request Submitted</h3>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary/10 text-secondary font-bold text-[11px] uppercase tracking-wider mb-4 border border-secondary/20">
                {member.joinStatus} Approval
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed max-w-sm">
                Your request for company <strong className="text-on-surface">{member.companyId}</strong> was submitted as role <strong className="text-on-surface">{member.role}</strong>.
              </p>
            </div>
            <button onClick={() => router.push("/recruiter/dashboard")} className="px-6 py-3 rounded-full bg-primary text-white font-bold hover:opacity-90 transition-opacity">
              Go to Dashboard
            </button>
          </div>
        )}
      </div>

      <div className="w-full max-w-4xl mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        <div className="glass-card p-8 rounded-3xl border border-outline-variant/10">
          <CheckCircle2 className="text-primary w-8 h-8 mb-4" />
          <h3 className="text-xl font-extrabold tracking-tight mb-3">Owner Approval</h3>
          <p className="text-on-surface-variant text-sm leading-relaxed">A company owner can approve or reject your pending membership request.</p>
        </div>
        <div className="bg-gradient-to-br from-primary to-secondary text-white p-8 rounded-3xl relative overflow-hidden shadow-xl shadow-primary/10">
          <ShieldCheck className="w-10 h-10 mb-4" />
          <h3 className="text-xl font-bold mb-2">Verified Workspace</h3>
          <p className="text-white/80 text-sm leading-relaxed">Approved recruiters can collaborate under the company workspace.</p>
        </div>
      </div>
    </main>
  );
}
