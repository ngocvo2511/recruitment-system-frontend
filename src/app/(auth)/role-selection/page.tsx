import Link from 'next/link';
import { ArrowRight, User, Briefcase } from 'lucide-react';
import { BRAND_NAME } from '@/lib/brand';

export default function RoleSelection() {
  return (
    <main className="flex-grow flex flex-col items-center justify-center px-6 pt-24 pb-12 w-full">
      <div className="w-full max-w-4xl space-y-12 text-center">
        
        {/* Step Indicator & Header */}
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-center gap-2">
            <div className="w-12 h-1.5 rounded-full signature-gradient shadow-sm shadow-primary/20"></div>
            <div className="w-12 h-1.5 rounded-full bg-surface-container-highest"></div>
            <div className="w-12 h-1.5 rounded-full bg-surface-container-highest"></div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-[-0.02em] text-on-surface">Chọn Hành Trình Của Bạn</h1>
          <p className="text-lg text-on-surface-variant max-w-xl mx-auto">
            Chọn cách bạn muốn sử dụng {BRAND_NAME}. Bạn luôn có thể thay đổi sau này trong cài đặt tài khoản.
          </p>
        </div>

        {/* Role Selection Grid */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          
          {/* Candidate Card */}
          <Link href="/register?role=candidate" className="glass-card group relative p-10 rounded-xl border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-left flex flex-col justify-between">
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl signature-gradient flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                <User className="text-on-primary w-8 h-8" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-on-surface">Ứng Viên</h2>
                <p className="text-on-surface-variant leading-relaxed">
                  Tìm công việc mơ ước và nhận các cơ hội được AI khớp với kỹ năng của bạn.
                </p>
              </div>
              <div className="pt-4 border-t border-outline-variant/10">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                    Công cụ xây dựng hồ sơ chuyên nghiệp
                  </li>
                  <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                    Khám phá việc làm bằng AI
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 flex items-center text-primary font-bold group-hover:translate-x-2 transition-transform duration-300">
              Tiếp tục với tư cách Ứng viên
              <ArrowRight className="ml-2 w-5 h-5" />
            </div>
          </Link>

          {/* Recruiter Card */}
          <Link href="/register?role=recruiter" className="glass-card group relative p-10 rounded-xl border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-left flex flex-col justify-between overflow-hidden">
            {/* Subtle Gradient Overlap */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-secondary/5 rounded-full blur-3xl"></div>
            <div className="space-y-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Briefcase className="text-on-secondary w-8 h-8" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-on-surface">Nhà Tuyển Dụng</h2>
                <p className="text-on-surface-variant leading-relaxed">
                  Tuyển dụng nhân tài hàng đầu và quản lý nhóm của bạn hiệu quả với các công cụ chuyên nghiệp.
                </p>
              </div>
              <div className="pt-4 border-t border-outline-variant/10">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-lg">check_circle</span>
                    Tìm kiếm nhân tài nâng cao
                  </li>
                  <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-lg">check_circle</span>
                    Bộ công cụ cộng tác nhóm
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 flex items-center text-secondary font-bold group-hover:translate-x-2 transition-transform duration-300 relative z-10">
              Tiếp tục với tư cách Nhà tuyển dụng
              <ArrowRight className="ml-2 w-5 h-5" />
            </div>
          </Link>

        </div>

        {/* Additional Help */}
        <p className="text-sm text-slate-500 font-medium tracking-wider uppercase">
          Bạn đã có tài khoản? <Link className="text-primary hover:underline underline-offset-4" href="/login">Đăng nhập tại đây</Link>
        </p>

      </div>
    </main>
  );
}
