"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Ban, ChevronRight, FileText, Briefcase, History, Mail, Phone, Eye, MessageSquare, ShieldCheck, Activity, Loader2, Verified, User, AlertCircle, CheckCircle2, X } from "lucide-react";
import { getPublicCandidateProfile, CandidateProfileResponse } from "@/lib/api/profile";
import { getPresignedUrl } from "@/lib/api/cv";
import { getRecruiterApplications, updateRecruiterApplicationStatus, ApplicationResponse, ApplicationStatus } from "@/lib/api/applications";

const STATUS_FLOW: ApplicationStatus[] = ["APPLIED", "SCREENING", "INTERVIEW", "OFFERED", "HIRED"];

function getNextStatus(current: ApplicationStatus): ApplicationStatus | null {
  const index = STATUS_FLOW.indexOf(current);
  if (index === -1 || index === STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[index + 1];
}

export default function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const searchParams = useSearchParams();
  const cvId = searchParams.get("cvId");
  
  const [profile, setProfile] = useState<CandidateProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpeningCv, setIsOpeningCv] = useState(false);
  
  const [application, setApplication] = useState<ApplicationResponse | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    async function fetchProfileAndApp() {
      try {
        setIsLoading(true);
        const [profileData, apps] = await Promise.all([
          getPublicCandidateProfile(unwrappedParams.id),
          getRecruiterApplications().catch(() => [])
        ]);
        setProfile(profileData);
        
        // Tìm application gần nhất của ứng viên này
        const candidateApps = apps.filter(a => a.candidateId === unwrappedParams.id);
        if (candidateApps.length > 0) {
          // Nếu có appId trên URL thì ưu tiên, không thì lấy cái mới nhất
          const appId = searchParams.get("appId");
          if (appId) {
            const exactApp = candidateApps.find(a => a.id === appId);
            if (exactApp) setApplication(exactApp);
            else setApplication(candidateApps[0]);
          } else {
            // Sort theo ngày nộp
            candidateApps.sort((a, b) => new Date(b.appliedAt || 0).getTime() - new Date(a.appliedAt || 0).getTime());
            setApplication(candidateApps[0]);
          }
        }
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message || "Failed to load candidate profile.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfileAndApp();
  }, [unwrappedParams.id]);

  const handleViewCv = async () => {
    if (!cvId) {
      setToast({ message: "Không tìm thấy thông tin CV.", type: "error" });
      return;
    }
    try {
      setIsOpeningCv(true);
      const { downloadUrl } = await getPresignedUrl(cvId);
      window.open(downloadUrl, "_blank");
    } catch (err) {
      setToast({ message: "Không thể mở tài liệu CV.", type: "error" });
    } finally {
      setIsOpeningCv(false);
    }
  };

  const confirmReject = () => {
    if (!application) return;
    setShowRejectConfirm(true);
  };

  const handleReject = async () => {
    if (!application) return;
    setShowRejectConfirm(false);
    try {
      setIsUpdatingStatus(true);
      const updated = await updateRecruiterApplicationStatus(application.id, "REJECTED");
      setApplication(updated);
      setToast({ message: "Đã từ chối ứng viên.", type: "success" });
    } catch (err) {
      setToast({ message: "Lỗi khi cập nhật trạng thái.", type: "error" });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleNextStage = async () => {
    if (!application) return;
    const nextStatus = getNextStatus(application.status);
    if (!nextStatus) return;
    try {
      setIsUpdatingStatus(true);
      const updated = await updateRecruiterApplicationStatus(application.id, nextStatus);
      setApplication(updated);
      setToast({ message: "Cập nhật tiến độ thành công.", type: "success" });
    } catch (err) {
      setToast({ message: "Lỗi khi cập nhật trạng thái.", type: "error" });
    } finally {
      setIsUpdatingStatus(false);
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
          <Ban className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-on-surface mb-2">Không tìm thấy hồ sơ</h2>
          <p className="text-on-surface-variant max-w-md">{error}</p>
          <Link href="/recruiter/candidates" className="mt-6 inline-block px-6 py-3 rounded-full bg-primary text-white font-bold">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] animate-fade-in-up -mx-8 -my-6">
      {/* Action Header */}
      <div className="px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container-low/30 backdrop-blur-sm border-b border-outline-variant/10">
        <div className="flex items-center gap-4">
          <Link href="/recruiter/candidates" className="p-2 rounded-full hover:bg-surface-container-high transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-on-surface">{profile.fullName || "Không rõ"}</h1>
            <p className="text-sm text-on-surface-variant font-medium">{profile.headline || "Ứng viên"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {application && application.status !== "REJECTED" && application.status !== "WITHDRAWN" && application.status !== "HIRED" && (
            <button 
              onClick={confirmReject}
              disabled={isUpdatingStatus}
              className="flex-1 md:flex-none px-6 py-2.5 rounded-full text-sm font-bold border border-outline-variant hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all text-on-surface flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isUpdatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />} Từ chối
            </button>
          )}
          <button 
            onClick={handleViewCv}
            disabled={!cvId || isOpeningCv}
            className="flex-1 md:flex-none px-6 py-2.5 rounded-full text-sm font-bold bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isOpeningCv ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            {isOpeningCv ? "Đang tải..." : "Xem CV"}
          </button>
          {application && getNextStatus(application.status) && (
            <button 
              onClick={handleNextStage}
              disabled={isUpdatingStatus}
              className="flex-[2] md:flex-none px-8 py-2.5 rounded-full text-sm font-bold text-white signature-gradient shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:hover:scale-100"
            >
              {isUpdatingStatus ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Chuyển sang giai đoạn tiếp theo
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Split View Content */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        
        {/* Left Side: Profile Information Preview */}
        <section className="flex-1 bg-surface-container overflow-y-auto p-4 md:p-8 flex items-start justify-center custom-scrollbar">
          <div className="max-w-3xl w-full bg-white shadow-xl shadow-black/5 rounded-xl p-12 relative overflow-hidden">
            
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
                <div className="text-right text-sm text-on-surface-variant space-y-2 flex flex-col items-end mt-2">
                  {profile.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-on-surface-variant opacity-70" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                  {profile.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-on-surface-variant opacity-70" />
                      <span>{profile.phoneNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-8">
                <section>
                  <h3 className="text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-3">Giới thiệu chung</h3>
                  <p className="text-sm text-on-surface leading-relaxed">
                      Ứng viên chưa cung cấp phần giới thiệu chi tiết. Vui lòng xem CV để biết thêm thông tin về lịch sử làm việc, kinh nghiệm và học vấn.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-4">Kỹ năng</h3>
                  {profile.skills && profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, i) => (
                        <span key={i} className="inline-flex items-center gap-2 bg-surface-container-highest px-3 py-1 rounded-full text-xs font-semibold text-on-surface-variant">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-on-surface-variant italic">Chưa cập nhật kỹ năng</p>
                  )}
                </section>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Analytics & Action Sidebar */}
        <section className="w-full lg:w-[450px] bg-surface-container-low overflow-y-auto border-l border-outline-variant/10 p-6 md:p-8 space-y-10 custom-scrollbar shrink-0">
          
          {/* Quick Insight Bento Box */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <p className="text-[10px] font-bold text-primary uppercase">Trạng thái hồ sơ</p>
              <p className="text-xl font-black text-on-surface">{profile.openToWork ? "Sẵn sàng" : "Chưa sẵn sàng"}</p>
            </div>
            <div className="p-4 bg-secondary/5 rounded-2xl border border-secondary/10">
              <p className="text-[10px] font-bold text-secondary uppercase">Liên hệ</p>
              <p className="text-sm font-black text-on-surface mt-1 overflow-hidden text-ellipsis whitespace-nowrap" title={profile.email || "N/A"}>{profile.email || "Chưa có"}</p>
            </div>
          </div>

          {/* Application Tracker Component */}
          <div className="p-6 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10">
            <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-6 text-center">Tiến độ tuyển dụng</h3>
            
            {application?.status === "REJECTED" ? (
              <div className="text-center p-4 bg-red-50 border border-red-100 rounded-xl">
                <Ban className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="font-bold text-red-700">Đã từ chối</p>
                <p className="text-xs text-red-600/80 mt-1">Hồ sơ ứng viên này đã bị từ chối.</p>
              </div>
            ) : application?.status === "WITHDRAWN" ? (
              <div className="text-center p-4 bg-surface-container-high rounded-xl">
                <AlertCircle className="w-8 h-8 text-on-surface-variant mx-auto mb-2" />
                <p className="font-bold text-on-surface">Đã rút hồ sơ</p>
                <p className="text-xs text-on-surface-variant mt-1">Ứng viên đã tự rút đơn ứng tuyển.</p>
              </div>
            ) : (
              <div className="flex items-center justify-between relative px-2">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-surface-container-high -translate-y-1/2 z-0"></div>
                
                {/* Calculate progress bar width based on current status */}
                {application && (
                  <div 
                    className="absolute top-1/2 left-0 h-1 bg-secondary -translate-y-1/2 z-0 transition-all duration-500" 
                    style={{ 
                      width: 
                        application.status === "APPLIED" ? "0%" : 
                        application.status === "SCREENING" ? "33%" : 
                        application.status === "INTERVIEW" ? "66%" : 
                        "100%" 
                    }}
                  ></div>
                )}
                
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm transition-colors ${
                    !application || application.status === "APPLIED" ? "bg-secondary-container text-secondary" : 
                    "bg-secondary text-white"
                  }`}>
                    <ShieldCheck className="w-4 h-4"/>
                  </div>
                  <span className={`text-[10px] font-bold ${(!application || application.status === "APPLIED") ? "text-secondary" : "text-on-surface"}`}>Đã nộp</span>
                </div>
                
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm transition-colors ${
                    application?.status === "SCREENING" ? "bg-secondary-container text-secondary" : 
                    (application && STATUS_FLOW.indexOf(application.status) > 1) ? "bg-secondary text-white" :
                    "bg-surface-container-high text-on-surface-variant"
                  }`}>
                    <Eye className="w-4 h-4"/>
                  </div>
                  <span className={`text-[10px] font-bold ${
                    application?.status === "SCREENING" ? "text-secondary" : 
                    (application && STATUS_FLOW.indexOf(application.status) > 1) ? "text-on-surface" :
                    "text-on-surface-variant"
                  }`}>Xét duyệt</span>
                </div>
                
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm transition-colors ${
                    application?.status === "INTERVIEW" ? "bg-secondary-container text-secondary" : 
                    (application && STATUS_FLOW.indexOf(application.status) > 2) ? "bg-secondary text-white" :
                    "bg-surface-container-high text-on-surface-variant"
                  }`}>
                    <MessageSquare className="w-4 h-4"/>
                  </div>
                  <span className={`text-[10px] font-bold ${
                    application?.status === "INTERVIEW" ? "text-secondary" : 
                    (application && STATUS_FLOW.indexOf(application.status) > 2) ? "text-on-surface" :
                    "text-on-surface-variant"
                  }`}>Phỏng vấn</span>
                </div>
                
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm transition-colors ${
                    application?.status === "OFFERED" || application?.status === "HIRED" ? "bg-secondary text-white" : 
                    "bg-surface-container-high text-on-surface-variant"
                  }`}>
                    <Briefcase className="w-4 h-4"/>
                  </div>
                  <span className={`text-[10px] font-bold ${
                    application?.status === "OFFERED" || application?.status === "HIRED" ? "text-on-surface" : 
                    "text-on-surface-variant"
                  }`}>Đề nghị</span>
                </div>
              </div>
            )}
          </div>

        </section>
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

      {/* Reject Confirmation Modal */}
      {showRejectConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-fade-in-up border border-outline-variant/10">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
              <Ban className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-center text-on-surface mb-2">Từ chối ứng viên</h2>
            <p className="text-center text-on-surface-variant mb-8">
              Bạn có chắc chắn muốn từ chối ứng viên này không? Thao tác này không thể hoàn tác và hồ sơ sẽ bị đóng lại.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowRejectConfirm(false)}
                className="flex-1 py-3 rounded-full font-bold text-on-surface border border-outline-variant hover:bg-surface-container-high transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleReject}
                className="flex-1 py-3 rounded-full font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
