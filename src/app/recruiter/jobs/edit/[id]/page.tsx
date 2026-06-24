"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronDown, Loader2, MapPin, Plus, Save, Sparkles, Trash2 } from "lucide-react";
import {
  getJobById,
  updateJob,
  getJobCategories,
  getLocations,
  type EmploymentType,
  type JobCategory,
  type JobLevel,
  type JobLocation,
  type JobPayload,
  type JobRequirementSection,
  type RequirementSectionType,
  type WorkMode,
} from "@/lib/api/jobs";

const employmentTypeOptions: Array<{ value: EmploymentType; label: string }> = [
  { value: "FULL_TIME", label: "Toàn thời gian" },
  { value: "PART_TIME", label: "Bán thời gian" },
  { value: "CONTRACT", label: "Hợp đồng" },
  { value: "INTERNSHIP", label: "Thực tập" },
];

const workModeOptions: Array<{ value: WorkMode; label: string }> = [
  { value: "ONSITE", label: "Tại văn phòng" },
  { value: "REMOTE", label: "Từ xa" },
  { value: "HYBRID", label: "Kết hợp" },
];

const levelOptions: Array<{ value: JobLevel; label: string }> = [
  { value: "INTERN", label: "Thực tập" },
  { value: "FRESHER", label: "Fresher" },
  { value: "JUNIOR", label: "Junior" },
  { value: "MIDDLE", label: "Middle" },
  { value: "SENIOR", label: "Senior" },
  { value: "LEAD", label: "Lead" },
];

const sectionTypeOptions: Array<{ value: RequirementSectionType; label: string }> = [
  { value: "REQUIRED", label: "Bắt buộc" },
  { value: "PREFERRED", label: "Ưu tiên" },
  { value: "OTHER", label: "Khác" },
];

const defaultSection = (): JobRequirementSection => ({
  title: "Yêu cầu bắt buộc",
  sectionType: "REQUIRED",
  displayOrder: 0,
  items: [{ content: "", displayOrder: 0 }],
});

export default function EditJobPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [form, setForm] = useState<JobPayload>({
    title: "",
    description: "",
    workingTime: "",
    location: "",
    locationCode: null,
    employmentType: "FULL_TIME",
    workMode: "HYBRID",
    level: "MIDDLE",
    minSalary: null,
    maxSalary: null,
    currency: "VND",
    salaryNegotiable: false,
    headcount: 1,
    deadline: null,
    categories: [],
    requirementSections: [defaultSection()],
  });

  const [categoryOptions, setCategoryOptions] = useState<JobCategory[]>([]);
  const [locationOptions, setLocationOptions] = useState<JobLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getJobCategories(),
      getLocations(),
      getJobById(id),
    ])
      .then(([categories, locations, job]) => {
        setCategoryOptions(categories);
        setLocationOptions(locations);
        setForm({
          title: job.title || "",
          description: job.description || "",
          workingTime: job.workingTime || "",
          location: job.location || "",
          locationCode: job.locationCode || null,
          employmentType: job.employmentType || "FULL_TIME",
          workMode: job.workMode || "HYBRID",
          level: job.level || "MIDDLE",
          minSalary: job.minSalary ?? null,
          maxSalary: job.maxSalary ?? null,
          currency: job.currency || "VND",
          salaryNegotiable: Boolean(job.salaryNegotiable),
          headcount: job.headcount ?? 1,
          deadline: job.deadline ? job.deadline.slice(0, 10) : null,
          categories: job.categories || [],
          requirementSections: job.requirementSections && job.requirementSections.length > 0
            ? job.requirementSections.map((s) => ({
                title: s.title || "",
                sectionType: s.sectionType || "OTHER",
                displayOrder: s.displayOrder ?? 0,
                items: s.items && s.items.length > 0
                  ? s.items.map((i) => ({ content: i.content || "", displayOrder: i.displayOrder ?? 0 }))
                  : [{ content: "", displayOrder: 0 }],
              }))
            : [defaultSection()],
        });
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Không thể tải thông tin tin tuyển dụng.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const updateField = <K extends keyof JobPayload>(field: K, value: JobPayload[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateSection = (sectionIndex: number, patch: Partial<JobRequirementSection>) => {
    setForm((current) => ({
      ...current,
      requirementSections: current.requirementSections.map((section, index) =>
        index === sectionIndex ? { ...section, ...patch } : section,
      ),
    }));
  };

  const updateItem = (sectionIndex: number, itemIndex: number, content: string) => {
    setForm((current) => ({
      ...current,
      requirementSections: current.requirementSections.map((section, index) => {
        if (index !== sectionIndex) return section;
        return {
          ...section,
          items: section.items.map((item, itemPosition) =>
            itemPosition === itemIndex ? { ...item, content } : item,
          ),
        };
      }),
    }));
  };

  const addSection = () => {
    setForm((current) => ({
      ...current,
      requirementSections: [
        ...current.requirementSections,
        {
          title: "Điểm cộng",
          sectionType: "PREFERRED",
          displayOrder: current.requirementSections.length,
          items: [{ content: "", displayOrder: 0 }],
        },
      ],
    }));
  };

  const removeSection = (sectionIndex: number) => {
    setForm((current) => ({
      ...current,
      requirementSections: current.requirementSections.filter((_, index) => index !== sectionIndex),
    }));
  };

  const addItem = (sectionIndex: number) => {
    setForm((current) => ({
      ...current,
      requirementSections: current.requirementSections.map((section, index) =>
        index === sectionIndex
          ? { ...section, items: [...section.items, { content: "", displayOrder: section.items.length }] }
          : section,
      ),
    }));
  };

  const removeItem = (sectionIndex: number, itemIndex: number) => {
    setForm((current) => ({
      ...current,
      requirementSections: current.requirementSections.map((section, index) =>
        index === sectionIndex
          ? { ...section, items: section.items.filter((_, position) => position !== itemIndex) }
          : section,
      ),
    }));
  };

  const cleanPayload = (): JobPayload => ({
    ...form,
    minSalary: form.salaryNegotiable ? null : form.minSalary,
    maxSalary: form.salaryNegotiable ? null : form.maxSalary,
    deadline: form.deadline ? `${form.deadline}T23:59:59` : null,
    requirementSections: form.requirementSections
      .map((section, sectionIndex) => ({
        ...section,
        title: section.title.trim(),
        displayOrder: sectionIndex,
        items: section.items
          .map((item, itemIndex) => ({ ...item, content: item.content.trim(), displayOrder: itemIndex }))
          .filter((item) => item.content.length > 0),
      }))
      .filter((section) => section.title.length > 0 && section.items.length > 0),
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (form.categories.length === 0) {
      setError("Vui lòng chọn ít nhất một ngành nghề.");
      return;
    }
    if (!form.locationCode) {
      setError("Vui lòng chọn tỉnh/thành phố.");
      return;
    }
    setSubmitting(true);

    try {
      await updateJob(id, cleanPayload());
      router.push("/recruiter/jobs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật tin tuyển dụng.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="font-semibold text-on-surface">Đang tải thông tin tin tuyển dụng...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in-up relative z-10 w-full pb-20">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-on-surface mb-2">Chỉnh sửa tin tuyển dụng</h1>
          <p className="text-on-surface-variant text-lg max-w-xl">Cập nhật thông tin chi tiết để nâng cao hiệu quả so khớp ứng viên từ AI.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm font-bold uppercase tracking-widest self-start shadow-sm border border-secondary/20">
          <Sparkles className="w-4 h-4 fill-secondary/20" />
          AI matching
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 border border-red-100 text-sm font-medium">
          {error}
        </div>
      )}

      <form className="space-y-8" onSubmit={handleSubmit}>
        <section className="bg-white/75 rounded-lg border border-outline-variant/15 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-on-surface mb-5">Thông tin chung</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <label className="md:col-span-2 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Tên vị trí</span>
              <input required value={form.title} onChange={(event) => updateField("title", event.target.value)} className="w-full bg-surface-container-high/50 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30" placeholder="Backend Developer" />
            </label>
            <fieldset className="md:col-span-2 space-y-3">
              <legend className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Ngành nghề
              </legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {categoryOptions.map((category) => {
                  const checked = form.categories.some((item) => item.code === category.code);
                  return (
                    <label
                      key={category.code}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${
                        checked
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-outline-variant/20 bg-surface-container-lowest text-on-surface"
                      }`}
                    >
                      <input
                        checked={checked}
                        className="h-4 w-4 accent-primary"
                        type="checkbox"
                        onChange={() =>
                          updateField(
                            "categories",
                            checked
                              ? form.categories.filter((item) => item.code !== category.code)
                              : [...form.categories, category],
                          )
                        }
                      />
                      <span>{category.name}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <SelectField
              label="Tỉnh/thành phố"
              value={form.locationCode ?? ""}
              onChange={(value) => updateField("locationCode", value || null)}
              options={[
                { value: "", label: "Chọn tỉnh/thành phố" },
                ...locationOptions.map((location) => ({ value: location.code, label: location.name })),
              ]}
            />
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Địa chỉ chi tiết</span>
              <div className="relative">
                <input value={form.location ?? ""} onChange={(event) => updateField("location", event.target.value)} className="w-full bg-surface-container-high/50 rounded-lg px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-primary/30" placeholder="Quận 1, TP.HCM / Pleiku, Gia Lai..." />
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5 pointer-events-none" />
              </div>
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Thời gian làm việc</span>
              <input value={form.workingTime ?? ""} onChange={(event) => updateField("workingTime", event.target.value)} className="w-full bg-surface-container-high/50 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30" placeholder="Thứ 2 - Thứ 6, 9:00 - 18:00" />
            </label>
            <SelectField label="Hình thức" value={form.employmentType ?? "FULL_TIME"} onChange={(value) => updateField("employmentType", value as EmploymentType)} options={employmentTypeOptions} />
            <SelectField label="Chế độ làm việc" value={form.workMode ?? "HYBRID"} onChange={(value) => updateField("workMode", value as WorkMode)} options={workModeOptions} />
            <SelectField label="Cấp bậc" value={form.level ?? "MIDDLE"} onChange={(value) => updateField("level", value as JobLevel)} options={levelOptions} />
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Số lượng cần tuyển</span>
              <input min={1} value={form.headcount ?? ""} onChange={(event) => updateField("headcount", Number(event.target.value))} className="w-full bg-surface-container-high/50 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30" type="number" />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Hạn ứng tuyển</span>
              <input value={form.deadline?.slice(0, 10) ?? ""} onChange={(event) => updateField("deadline", event.target.value || null)} className="w-full bg-surface-container-high/50 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30" type="date" />
            </label>
          </div>
        </section>

        <section className="bg-white/75 rounded-lg border border-outline-variant/15 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-on-surface mb-5">Mức lương</h2>
          <label className="flex items-center gap-3 mb-5">
            <input checked={Boolean(form.salaryNegotiable)} onChange={(event) => updateField("salaryNegotiable", event.target.checked)} className="w-5 h-5 accent-primary" type="checkbox" />
            <span className="font-semibold text-on-surface">Lương thỏa thuận</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Từ</span>
              <input disabled={Boolean(form.salaryNegotiable)} value={form.minSalary ?? ""} onChange={(event) => updateField("minSalary", event.target.value ? Number(event.target.value) : null)} className="w-full bg-surface-container-high/50 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50" type="number" />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Đến</span>
              <input disabled={Boolean(form.salaryNegotiable)} value={form.maxSalary ?? ""} onChange={(event) => updateField("maxSalary", event.target.value ? Number(event.target.value) : null)} className="w-full bg-surface-container-high/50 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50" type="number" />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Tiền tệ</span>
              <input value={form.currency ?? "VND"} onChange={(event) => updateField("currency", event.target.value.toUpperCase())} className="w-full bg-surface-container-high/50 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30" />
            </label>
          </div>
        </section>

        <section className="bg-white/75 rounded-lg border border-outline-variant/15 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-on-surface mb-5">Mô tả công việc</h2>
          <textarea required value={form.description} onChange={(event) => updateField("description", event.target.value)} className="w-full bg-surface-container-high/50 rounded-lg px-5 py-4 leading-relaxed outline-none focus:ring-2 focus:ring-primary/30" placeholder="Mô tả vai trò, trách nhiệm chính và bối cảnh làm việc..." rows={9} />
        </section>

        <section className="bg-white/75 rounded-lg border border-outline-variant/15 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="text-xl font-bold text-on-surface">Yêu cầu ứng viên</h2>
            <button className="px-4 py-2 rounded-lg border border-outline-variant/20 text-primary text-sm font-bold flex items-center gap-2" onClick={addSection} type="button">
              <Plus className="w-4 h-4" />
              Thêm nhóm
            </button>
          </div>
          <div className="space-y-5">
            {form.requirementSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="rounded-lg border border-outline-variant/20 p-4 bg-surface-container-lowest">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_auto] gap-3 mb-4">
                  <input value={section.title} onChange={(event) => updateSection(sectionIndex, { title: event.target.value })} className="bg-surface-container-high/50 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30" placeholder="Nice to have / Điểm cộng..." />
                  <SelectField label="" value={section.sectionType} onChange={(value) => updateSection(sectionIndex, { sectionType: value as RequirementSectionType })} options={sectionTypeOptions} />
                  <button className="p-3 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-40" disabled={form.requirementSections.length === 1} onClick={() => removeSection(sectionIndex)} type="button">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex gap-2">
                      <input value={item.content} onChange={(event) => updateItem(sectionIndex, itemIndex, event.target.value)} className="flex-1 bg-surface-container-high/50 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30" placeholder="Nhập một yêu cầu dạng gạch đầu dòng" />
                      <button className="p-3 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-40" disabled={section.items.length === 1} onClick={() => removeItem(sectionIndex, itemIndex)} type="button">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button className="text-sm font-bold text-primary flex items-center gap-2" onClick={() => addItem(sectionIndex)} type="button">
                    <Plus className="w-4 h-4" />
                    Thêm yêu cầu
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="pt-4 flex items-center justify-end gap-4">
          <button
            onClick={() => router.push("/recruiter/jobs")}
            className="px-6 py-4 text-on-surface-variant hover:text-primary font-semibold transition-all"
            type="button"
          >
            Hủy bỏ
          </button>
          <button className="signature-gradient text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-60" disabled={submitting} type="submit">
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="space-y-2">
      {label && <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{label}</span>}
      <div className="relative">
        <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full appearance-none bg-surface-container-high/50 rounded-lg px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-primary/30">
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5 pointer-events-none" />
      </div>
    </label>
  );
}
