"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, FileText, Mail, Phone, Loader2, Verified, User, Send, CheckCircle2, AlertCircle, X } from "lucide-react";
import { getPublicCandidateProfile, CandidateProfileResponse } from "@/lib/api/profile";
import { getJobById, JobResponse } from "@/lib/api/jobs";
import { sendInviteToApplyNotification, checkInviteStatus } from "@/lib/api/notifications";

export default function AISuggestedCandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const searchParams = useSearchParams();
  const cvId = searchParams.get("cvId");
  const jobId = searchParams.get("jobId");
  
  const [profile, setProfile] = useState<CandidateProfileResponse | null>(null);
  const [job, setJob] = useState<JobResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [hasInvited, setHasInvited] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const profileData = await getPublicCandidateProfile(unwrappedParams.id);
        setProfile(profileData);
        if (jobId) {
          const jobData = await getJobById(jobId);
          setJob(jobData);
          
          try {
            const hasInvitedFromBackend = await checkInviteStatus(jobId, unwrappedParams.id);
            if (hasInvitedFromBackend) {
              setHasInvited(true);
            }
          } catch (e) {
            console.error("Failed to check invite status", e);
          }
        }
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message || "Failed to load candidate profile.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [unwrappedParams.id, jobId]);

  const handleInviteToApply = async () => {
    if (!profile?.email) {
      setToast({ message: "Ứng viên chưa cung cấp email.", type: "error" });
      return;
    }
    if (!job) {
      setToast({ message: "Không tìm thấy thông tin công việc.", type: "error" });
      return;
    }
    
    try {
      setIsInviting(true);
      const appUrl = `${window.location.origin}/candidate/jobs/${job.id}`;
      
      await sendInviteToApplyNotification({
        email: profile.email,
        candidateName: profile.fullName || "bạn",
        companyName: job.companyName || "công ty chúng tôi",
        jobTitle: job.title,
        jobUrl: appUrl,
        idempotencyKey: `invite-to-apply-${job.id}-${unwrappedParams.id}`
      });
      
      setHasInvited(true);
      setToast({ message: "Đã gửi thư mời ứng tuyển thành công!", type: "success" });
    } catch (err) {
      setToast({ message: "Gặp lỗi khi gửi thư mời ứng tuyển.", type: "error" });
    } finally {
      setIsInviting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-on-surface-variant font-medium">Đang tải hồ sơ ứng viên...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)]">
        <div className="glass-card rounded-[2rem] p-12 text-center border border-white/40 shadow-sm">
          <User className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-on-surface mb-2">Không tìm thấy hồ sơ</h2>
          <p className="text-on-surface-variant max-w-md">{error}</p>
          <Link href="/recruiter/ai-suggest" className="mt-6 inline-block px-6 py-3 rounded-full bg-primary text-white font-bold">
            Quay lại trang gợi ý
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] animate-fade-in-up -mx-8 -my-6 bg-surface-container-lowest">
      {/* Action Header */}
      <div className="px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container-low/30 backdrop-blur-sm border-b border-outline-variant/10">
        <div className="flex items-center gap-4">
          <Link href="/recruiter/ai-suggest" className="p-2 rounded-full hover:bg-surface-container-high transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-on-surface">{profile.fullName || "Không rõ"}</h1>
            <p className="text-sm text-on-surface-variant font-medium">{profile.headline || "Ứng viên tiềm năng"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleInviteToApply}
            disabled={isInviting || hasInvited || !job}
            className={`flex-[2] md:flex-none px-8 py-2.5 rounded-full text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 group ${hasInvited ? "bg-green-600 shadow-green-600/20" : "signature-gradient shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"}`}
          >
            {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : hasInvited ? (
              <>
                Đã gửi lời mời
                <CheckCircle2 className="w-4 h-4" />
              </>
            ) : (
              <>
                Mời ứng tuyển
                <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-start justify-center custom-scrollbar">
        <div className="max-w-4xl w-full">
          
          <div className="bg-white shadow-xl shadow-black/5 rounded-[2rem] p-8 md:p-12 relative overflow-hidden border border-outline-variant/10">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-8 mb-8 border-surface-container-high gap-6">
                <div className="flex items-center gap-8">
                  {profile.profilePictureUrl ? (
                    <img 
                      src={profile.profilePictureUrl} 
                      alt={profile.fullName || ""} 
                      className="w-32 h-32 md:w-36 md:h-36 rounded-full object-cover border-4 border-white shadow-xl bg-primary/10"
                    />
                  ) : (
                    <div className="w-32 h-32 md:w-36 md:h-36 rounded-full flex items-center justify-center border-4 border-white bg-primary/10 text-primary shadow-xl">
                      <User className="w-16 h-16" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-3xl font-black tracking-tight mb-2 bg-gradient-to-br from-blue-700 to-purple-600 bg-clip-text text-transparent uppercase">
                      {profile.fullName || "Hồ sơ ứng viên"}
                    </h2>
                    <p className="text-on-surface-variant font-medium flex items-center gap-2 mb-3">
                      <Verified className="w-4 h-4 text-primary fill-primary/20" />
                      <span className="uppercase tracking-widest text-xs text-primary font-bold">{profile.headline || "Ứng viên"}</span>
                    </p>
                    {profile.openToWork && (
                       <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full border border-green-200">
                         Sẵn sàng làm việc
                       </span>
                    )}
                  </div>
                </div>
                
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm shrink-0 min-w-[250px]">
                  <p className="text-[10px] font-bold text-secondary uppercase mb-4 tracking-widest">Thông tin liên hệ</p>
                  <div className="text-sm text-on-surface-variant space-y-3 flex flex-col">
                    {profile.email ? (
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-primary" />
                        <span className="font-medium text-on-surface">{profile.email}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-on-surface-variant opacity-50" />
                        <span className="italic">Chưa có email</span>
                      </div>
                    )}
                    {profile.phoneNumber ? (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-primary" />
                        <span className="font-medium text-on-surface">{profile.phoneNumber}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-on-surface-variant opacity-50" />
                        <span className="italic">Chưa có SĐT</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-10">
                <section>
                  <h3 className="text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    Giới thiệu chung
                  </h3>
                  <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10">
                    <p className="text-sm text-on-surface leading-relaxed">
                        Ứng viên chưa cung cấp phần giới thiệu chi tiết trên hồ sơ cá nhân. Vui lòng liên hệ với ứng viên để biết thêm thông tin về lịch sử làm việc, kinh nghiệm và học vấn.
                    </p>
                  </div>
                </section>
                
                <section>
                  <h3 className="text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-4">Kỹ năng chuyên môn</h3>
                  {profile.skills && profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, i) => (
                        <span key={i} className="inline-flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-full text-xs font-bold text-on-surface shadow-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10">
                      <p className="text-sm text-on-surface-variant italic">Chưa cập nhật kỹ năng</p>
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 animate-fade-in-up">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border ${
            toast.type === "success" 
              ? "bg-white border-green-100 text-green-800" 
              : "bg-white border-red-100 text-red-800"
          }`}>
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <p className="text-sm font-bold">{toast.message}</p>
            <button 
              onClick={() => setToast(null)}
              className="ml-4 p-1 hover:bg-black/5 rounded-full transition-colors"
            >
              <X className="w-4 h-4 opacity-50" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
