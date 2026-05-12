"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  User,
  FileText,
  Settings,
  Lightbulb,
  Camera,
  Verified,
  Phone,
  Mail,
  TrendingUp,
  History,
  Bookmark,
  Award,
  Sparkles,
  LoaderCircle,
} from "lucide-react";
import {
  ApiError,
  CandidateProfileResponse,
  getCandidateProfile,
  updateCandidateProfile,
  updateOpenToWork,
} from "@/lib/api/profile";

type ToastItem = {
  id: number;
  type: "success" | "error";
  message: string;
};

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState<CandidateProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingOpenToWork, setSavingOpenToWork] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [openToWork, setOpenToWork] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  const addToast = (type: ToastItem["type"], message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3200);
  };

  const loadProfile = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await getCandidateProfile();
      setProfile(data);
      setFullName(data.fullName ?? "");
      setHeadline(data.headline ?? "");
      setPhoneNumber(data.phoneNumber ?? "");
      setEmail(data.email ?? "");
      setOpenToWork(Boolean(data.openToWork));
      setSkills(data.skills ?? []);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Could not load profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProfile();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const skillChips = useMemo(() => skills.filter(Boolean), [skills]);

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) {
      return;
    }
    if (skills.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      setSkillInput("");
      return;
    }
    setSkills((prev) => [...prev, trimmed]);
    setSkillInput("");
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills((prev) => prev.filter((item) => item !== skill));
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMessage(null);
    try {
      await updateCandidateProfile({
        fullName,
        headline,
        phoneNumber,
        openToWork,
        confirmedSkills: skills,
      });
      addToast("success", "Profile updated successfully.");
      await loadProfile();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
        addToast("error", error.message);
      } else {
        setErrorMessage("Could not save profile.");
        addToast("error", "Could not save profile.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggleOpenToWork = async () => {
    if (savingOpenToWork) {
      return;
    }

    const nextValue = !openToWork;
    setOpenToWork(nextValue);
    setSavingOpenToWork(true);
    setErrorMessage(null);

    try {
      await updateOpenToWork({ openToWork: nextValue });
      addToast("success", "Open to work updated.");
    } catch (error) {
      setOpenToWork((prev) => !prev);
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
        addToast("error", error.message);
      } else {
        setErrorMessage("Could not update open to work status.");
        addToast("error", "Could not update open to work status.");
      }
    } finally {
      setSavingOpenToWork(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 w-full animate-fade-in-up flex flex-col md:flex-row gap-8">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 flex flex-col gap-2 shrink-0">
        <nav className="flex flex-col gap-1">
          <Link href="/candidate/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-container/20 text-primary font-bold">
            <User className="w-5 h-5 fill-primary/20" />
            <span>Personal Info</span>
          </Link>
          <Link href="/candidate/cv" className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors">
            <FileText className="w-5 h-5" />
            <span className="font-medium">CV Management</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors">
            <Lightbulb className="w-5 h-5" />
            <span className="font-medium">AI Insights</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </Link>
        </nav>
        
        {/* Pro Tip Card */}
        <div className="mt-8 signature-gradient rounded-[1.5rem] p-6 text-white overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
            <Lightbulb className="w-24 h-24" />
          </div>
          <h4 className="font-bold text-lg mb-2 relative z-10">Profile Score: 85%</h4>
          <p className="text-white/80 text-sm mb-4 leading-relaxed relative z-10">Add a professional bio to unlock exclusive AI-matched opportunities.</p>
          <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden relative z-10">
            <div className="h-full bg-white w-[85%]"></div>
          </div>
        </div>
      </aside>

      {/* Profile Content */}
      <section className="flex-grow space-y-8 min-w-0">
        <div className="glass-card rounded-[2rem] p-8 md:p-12 shadow-[0_8px_40px_rgba(0,0,0,0.02)] border border-white/40">
          {errorMessage && (
            <div className="rounded-xl border border-error/30 bg-error/10 text-error px-4 py-3 text-sm font-medium mb-6">
              {errorMessage}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl bg-surface-container-high/50 border border-white/40 p-6 text-sm text-on-surface-variant flex items-center gap-2">
              <LoaderCircle className="w-4 h-4 animate-spin" />
              Loading profile...
            </div>
          ) : (
            <>
          
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
            <div className="relative group">
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-white shadow-xl">
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src={profile?.profilePictureUrl ?? "https://i.pravatar.cc/150?img=1"}
                  alt="Profile avatar"
                />
              </div>
              <button className="absolute inset-0 flex items-center justify-center bg-blue-900/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Camera className="w-8 h-8"/>
              </button>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-black tracking-tight mb-2 bg-gradient-to-br from-blue-700 to-purple-600 bg-clip-text text-transparent">
                {fullName || "Your Name"}
              </h2>
              <p className="text-on-surface-variant font-medium flex items-center justify-center md:justify-start gap-2">
                <Verified className="w-4 h-4 text-primary fill-primary/20" />
                {headline || "Add your headline"}
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              
                <div className="group">
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-2 px-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                    <input
                      className="w-full pl-12 pr-4 py-4 bg-surface-container-high/50 border-none rounded-xl focus:ring-2 focus:ring-primary/40 text-on-surface font-medium transition-all outline-none"
                      type="text"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-2 px-1">Headline</label>
                  <div className="relative">
                    <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                    <input
                      className="w-full pl-12 pr-4 py-4 bg-surface-container-high/50 border-none rounded-xl focus:ring-2 focus:ring-primary/40 text-on-surface font-medium transition-all outline-none"
                      type="text"
                      value={headline}
                      onChange={(event) => setHeadline(event.target.value)}
                      placeholder="e.g. Senior Product Designer"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-2 px-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                    <input
                      className="w-full pl-12 pr-4 py-4 bg-surface-container-high/50 border-none rounded-xl focus:ring-2 focus:ring-primary/40 text-on-surface font-medium transition-all outline-none"
                      type="tel"
                      value={phoneNumber}
                      onChange={(event) => setPhoneNumber(event.target.value)}
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-2 px-1">Skills</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {skillChips.length === 0 ? (
                      <span className="text-xs text-on-surface-variant">No skills added yet.</span>
                    ) : (
                      skillChips.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-2 bg-surface-container-highest px-3 py-1 rounded-full text-xs font-semibold text-on-surface-variant"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-xs text-on-surface-variant hover:text-on-surface"
                          >
                            ✕
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 px-4 py-3 bg-surface-container-high/50 border-none rounded-xl focus:ring-2 focus:ring-primary/40 text-on-surface font-medium transition-all outline-none"
                      type="text"
                      value={skillInput}
                      onChange={(event) => setSkillInput(event.target.value)}
                      placeholder="Type a skill and press Add"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-4 py-3 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dim"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-2 px-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                    <input
                      className="w-full pl-12 pr-4 py-4 bg-surface-container-high/50 border-none rounded-xl focus:ring-2 focus:ring-primary/40 text-on-surface font-medium transition-all outline-none"
                      type="email"
                      value={email}
                      readOnly
                    />
                  </div>
                </div>

            </div>

            {/* Side Info / Settings Card */}
            <div className="flex flex-col justify-between">
                <div className="bg-surface-container-high/30 rounded-2xl p-6 border border-white/60 shadow-sm space-y-5">
                  <div>
                    <h5 className="text-sm font-bold text-on-surface mb-2">Open to Work</h5>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      Let recruiters know you are actively exploring new opportunities.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleToggleOpenToWork()}
                    disabled={savingOpenToWork}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                      openToWork
                        ? "border-secondary/40 bg-secondary/10 text-secondary"
                        : "border-white/60 bg-white/70 text-on-surface-variant"
                    }`}
                  >
                    <span className="text-xs font-bold uppercase tracking-widest">
                      {openToWork ? "Actively Looking" : "Not Looking"}
                    </span>
                    <span
                      className={`w-11 h-6 rounded-full relative transition-colors ${
                        openToWork ? "bg-secondary" : "bg-surface-container-high"
                      }`}
                    >
                      <span
                        className={`w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform ${
                          openToWork ? "translate-x-6" : "translate-x-0"
                        }`}
                      ></span>
                    </span>
                  </button>
                </div>

              <div className="mt-8 flex justify-end gap-4 h-min">
                <button
                  className="px-8 py-3 rounded-full font-bold text-sm text-on-surface-variant hover:bg-surface-container-high transition-all"
                  type="button"
                  onClick={() => void loadProfile()}
                  disabled={saving}
                >
                  Discard
                </button>
                <button
                  className="signature-gradient text-white px-10 py-3 rounded-full font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-95 transition-transform flex items-center justify-center gap-2"
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving}
                >
                  {saving && <LoaderCircle className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
            </>
          )}
        </div>

        {/* Experience Bento Grid Concept */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="md:col-span-2 glass-card rounded-[1.5rem] p-6 shadow-sm border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Quick Access</h3>
              <TrendingUp className="text-primary w-5 h-5" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-blue-50/50 hover:bg-blue-100/50 transition-all cursor-pointer border border-blue-100/50">
                <History className="text-blue-600 mb-2 w-6 h-6" />
                <div className="font-bold text-sm text-blue-950">Recent Views</div>
                <div className="text-[10px] uppercase tracking-wider text-blue-400 font-bold mt-1">12 Companies</div>
              </div>
              
              <div className="p-4 rounded-xl bg-purple-50/50 hover:bg-purple-100/50 transition-all cursor-pointer border border-purple-100/50">
                <Bookmark className="text-purple-600 mb-2 w-6 h-6" />
                <div className="font-bold text-sm text-purple-950">Saved Jobs</div>
                <div className="text-[10px] uppercase tracking-wider text-purple-400 font-bold mt-1">4 Opportunities</div>
              </div>
            </div>
          </div>
          
          <div className="bg-secondary/10 rounded-[1.5rem] p-6 flex flex-col justify-center items-center text-center border border-secondary/20">
            <Award className="w-10 h-10 text-secondary mb-3 fill-secondary/20" />
            <h4 className="font-bold mb-2 text-secondary-900">Verify Talent</h4>
            <p className="text-xs text-on-surface-variant px-2 leading-relaxed">Take our assessment to earn a badge.</p>
          </div>
          
        </div>
      </section>

      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`min-w-[240px] max-w-[360px] rounded-xl px-4 py-3 text-sm font-semibold shadow-lg border glass-card ${
              toast.type === "success"
                ? "border-secondary/20 text-on-surface"
                : "border-error/30 text-error"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
