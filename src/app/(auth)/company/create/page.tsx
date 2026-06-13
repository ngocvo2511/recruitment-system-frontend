"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AtSign, Building2, ChevronDown, Loader2, MapPin, Phone, ShieldCheck } from "lucide-react";
import { createCompany, type CompanyRequest } from "@/lib/api/company";
import { BRAND_NAME } from "@/lib/brand";

export default function CreateCompanyPage() {
  const router = useRouter();
  const [form, setForm] = useState<CompanyRequest>({
    name: "",
    website: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Vietnam",
    description: "",
    industry: "",
    companySize: 1,
    taxCode: "",
    businessLicense: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field: keyof CompanyRequest, value: string | number) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await createCompany(form);
      router.push("/recruiter/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo công ty. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative z-10 w-full max-w-3xl mx-auto px-6 py-24 flex-grow min-h-screen animate-fade-in-up">
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[60%] signature-gradient opacity-10 blur-[120px] rounded-full rotate-12 -z-10 pointer-events-none"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[50%] bg-secondary opacity-5 blur-[100px] rounded-full -rotate-12 -z-10 pointer-events-none"></div>

      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {BRAND_NAME}
        </h1>
        <p className="text-on-surface-variant mt-2 font-medium tracking-tight">Đăng ký Nhà tuyển dụng - Thiết lập Công ty</p>
      </div>

      <div className="glass-card border border-outline-variant/10 rounded-3xl p-8 md:p-12 shadow-xl bg-white/70">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-on-surface tracking-tight mb-2">Tạo Hồ Sơ Công Ty</h2>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Thao tác này sẽ tạo công ty đang chờ xử lý và biến tài khoản nhà tuyển dụng của bạn thành chủ sở hữu công ty.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-100/10 border border-red-500/20 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2 space-y-2 group">
              <label className="block text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">Tên Công Ty</label>
              <div className="relative">
                <input required value={form.name} onChange={(event) => updateField("name", event.target.value)} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/40 transition-all duration-300 outline-none" placeholder="ví dụ: ABC Corporation" type="text" />
                <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="block text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">Email Công Ty</label>
              <div className="relative">
                <input required value={form.email} onChange={(event) => updateField("email", event.target.value)} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/40 transition-all duration-300 outline-none" placeholder="hr@abc.com" type="email" />
                <AtSign className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="block text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">Điện thoại</label>
              <div className="relative">
                <input required value={form.phone} onChange={(event) => updateField("phone", event.target.value)} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/40 transition-all duration-300 outline-none" placeholder="+84..." type="tel" />
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="block text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">Website</label>
              <input value={form.website} onChange={(event) => updateField("website", event.target.value)} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/40 transition-all duration-300 outline-none" placeholder="https://abc.com" type="url" />
            </div>

            <div className="space-y-2 group">
              <label className="block text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">Ngành nghề</label>
              <input required value={form.industry} onChange={(event) => updateField("industry", event.target.value)} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/40 transition-all duration-300 outline-none" placeholder="Phần mềm, Tài chính..." type="text" />
            </div>

            <div className="space-y-2 group">
              <label className="block text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">Quy mô công ty</label>
              <div className="relative">
                <select required value={form.companySize} onChange={(event) => updateField("companySize", Number(event.target.value))} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 text-on-surface appearance-none focus:ring-2 focus:ring-primary/40 transition-all duration-300 outline-none cursor-pointer">
                  <option value={1}>1-10 Nhân viên</option>
                  <option value={50}>11-50 Nhân viên</option>
                  <option value={200}>51-200 Nhân viên</option>
                  <option value={500}>201-500 Nhân viên</option>
                  <option value={1000}>501-1,000 Nhân viên</option>
                  <option value={1001}>1,001+ Nhân viên</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="block text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">Mã số thuế</label>
              <input required value={form.taxCode} onChange={(event) => updateField("taxCode", event.target.value)} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/40 transition-all duration-300 outline-none" placeholder="Mã số thuế công ty" type="text" />
            </div>

            <div className="space-y-2 group">
              <label className="block text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">Giấy phép kinh doanh</label>
              <div className="relative">
                <input required value={form.businessLicense} onChange={(event) => updateField("businessLicense", event.target.value)} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/40 transition-all duration-300 outline-none" placeholder="Số giấy phép" type="text" />
                <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2 group">
              <label className="block text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">Địa chỉ</label>
              <div className="relative">
                <input required value={form.address} onChange={(event) => updateField("address", event.target.value)} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/40 transition-all duration-300 outline-none" placeholder="Địa chỉ đường" type="text" />
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="block text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">Thành phố</label>
              <input required value={form.city} onChange={(event) => updateField("city", event.target.value)} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/40 transition-all duration-300 outline-none" placeholder="Thành phố Hồ Chí Minh" type="text" />
            </div>

            <div className="space-y-2 group">
              <label className="block text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">Quốc gia</label>
              <input required value={form.country} onChange={(event) => updateField("country", event.target.value)} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/40 transition-all duration-300 outline-none" placeholder="Việt Nam" type="text" />
            </div>

            <div className="md:col-span-2 space-y-2 group">
              <label className="block text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">Mô tả</label>
              <textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/40 transition-all duration-300 outline-none" placeholder="Giới thiệu ngắn về công ty" rows={4} />
            </div>
          </div>

          <button disabled={isSubmitting} className="w-full signature-gradient text-white py-4 rounded-full font-bold text-sm tracking-wide shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none" type="submit">
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Đăng Ký Công Ty & Tiếp Tục"}
          </button>
        </form>
      </div>
    </main>
  );
}
