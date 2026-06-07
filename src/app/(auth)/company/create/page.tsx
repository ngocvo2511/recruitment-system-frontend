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
      setError(err instanceof Error ? err.message : "Could not create company. Please try again.");
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
        <p className="text-on-surface-variant mt-2 font-medium tracking-tight">Recruiter Registration - Company Setup</p>
      </div>

      <div className="glass-card border border-outline-variant/10 rounded-3xl p-8 md:p-12 shadow-xl bg-white/70">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-on-surface tracking-tight mb-2">Create Company Profile</h2>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            This creates a pending company and makes your recruiter account the company owner.
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
              <label className="block text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">Company Name</label>
              <div className="relative">
                <input required value={form.name} onChange={(event) => updateField("name", event.target.value)} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/40 transition-all duration-300 outline-none" placeholder="e.g. Acme Corporation" type="text" />
                <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="block text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">Company Email</label>
              <div className="relative">
                <input required value={form.email} onChange={(event) => updateField("email", event.target.value)} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/40 transition-all duration-300 outline-none" placeholder="hr@acme.com" type="email" />
                <AtSign className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="block text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">Phone</label>
              <div className="relative">
                <input required value={form.phone} onChange={(event) => updateField("phone", event.target.value)} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/40 transition-all duration-300 outline-none" placeholder="+84..." type="tel" />
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="block text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">Website</label>
              <input value={form.website} onChange={(event) => updateField("website", event.target.value)} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/40 transition-all duration-300 outline-none" placeholder="https://acme.com" type="url" />
            </div>

            <div className="space-y-2 group">
              <label className="block text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">Industry</label>
              <input required value={form.industry} onChange={(event) => updateField("industry", event.target.value)} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/40 transition-all duration-300 outline-none" placeholder="Software, Finance..." type="text" />
            </div>

            <div className="space-y-2 group">
              <label className="block text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">Company Size</label>
              <div className="relative">
                <select required value={form.companySize} onChange={(event) => updateField("companySize", Number(event.target.value))} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 text-on-surface appearance-none focus:ring-2 focus:ring-primary/40 transition-all duration-300 outline-none cursor-pointer">
                  <option value={1}>1-10 Employees</option>
                  <option value={50}>11-50 Employees</option>
                  <option value={200}>51-200 Employees</option>
                  <option value={500}>201-500 Employees</option>
                  <option value={1000}>501-1,000 Employees</option>
                  <option value={1001}>1,001+ Employees</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="block text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">Tax Code</label>
              <input required value={form.taxCode} onChange={(event) => updateField("taxCode", event.target.value)} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/40 transition-all duration-300 outline-none" placeholder="Company tax code" type="text" />
            </div>

            <div className="space-y-2 group">
              <label className="block text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">Business License</label>
              <div className="relative">
                <input required value={form.businessLicense} onChange={(event) => updateField("businessLicense", event.target.value)} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/40 transition-all duration-300 outline-none" placeholder="License number" type="text" />
                <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2 group">
              <label className="block text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">Address</label>
              <div className="relative">
                <input required value={form.address} onChange={(event) => updateField("address", event.target.value)} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/40 transition-all duration-300 outline-none" placeholder="Street address" type="text" />
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="block text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">City</label>
              <input required value={form.city} onChange={(event) => updateField("city", event.target.value)} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/40 transition-all duration-300 outline-none" placeholder="Ho Chi Minh City" type="text" />
            </div>

            <div className="space-y-2 group">
              <label className="block text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">Country</label>
              <input required value={form.country} onChange={(event) => updateField("country", event.target.value)} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/40 transition-all duration-300 outline-none" placeholder="Vietnam" type="text" />
            </div>

            <div className="md:col-span-2 space-y-2 group">
              <label className="block text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant ml-1">Description</label>
              <textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/40 transition-all duration-300 outline-none" placeholder="Short company introduction" rows={4} />
            </div>
          </div>

          <button disabled={isSubmitting} className="w-full signature-gradient text-white py-4 rounded-full font-bold text-sm tracking-wide shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none" type="submit">
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Register Company & Continue"}
          </button>
        </form>
      </div>
    </main>
  );
}
