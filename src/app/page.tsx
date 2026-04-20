import Link from 'next/link';
import { ArrowRight, Briefcase, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex-grow flex flex-col items-center justify-center w-full">
      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center space-y-10 relative">
        <div className="absolute top-0 right-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px] pointer-events-none -z-10"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-secondary/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-primary/20 text-primary text-sm font-medium animate-fade-in-up">
          <Sparkles className="w-4 h-4" />
          <span>AI-Powered Recruitment for the Modern Era</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary">
          The Curator
        </h1>
        
        <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl leading-relaxed">
          Platform kết nối ứng viên tài năng và nhà tuyển dụng chuyên nghiệp, ứng dụng AI để tối ưu quá trình phân tích CV và đánh giá ứng viên.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link 
            href="/role-selection" 
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-on-primary font-semibold text-lg hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
          >
            Bắt đầu ngay <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            href="/login" 
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl glass-card border border-outline-variant/30 text-on-surface font-semibold text-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
          >
            Đăng nhập
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-surface-container-low py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="glass-card p-8 rounded-2xl border border-white/40 shadow-lg hover:-translate-y-2 transition-all duration-500">
            <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-on-surface">Auto-Matching AI</h3>
            <p className="text-on-surface-variant">Tự động phân tích và chấm điểm CV dựa trên yêu cầu công việc. Khớp nối ứng viên với độ chính xác cao.</p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card p-8 rounded-2xl border border-white/40 shadow-lg hover:-translate-y-2 transition-all duration-500 delay-100">
            <div className="w-14 h-14 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-6">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-on-surface">Smart Pipeline</h3>
            <p className="text-on-surface-variant">Quy trình tuyển dụng Kanban thông minh, dễ dàng kéo thả và quản lý trạng thái của từng ứng viên.</p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card p-8 rounded-2xl border border-white/40 shadow-lg hover:-translate-y-2 transition-all duration-500 delay-200">
            <div className="w-14 h-14 rounded-xl signature-gradient text-white flex items-center justify-center mb-6">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-on-surface">Insights & Analytics</h3>
            <p className="text-on-surface-variant">Theo dõi các chỉ số thành công của chiến dịch tuyển dụng, đo lường thời gian chốt ứng viên.</p>
          </div>
        </div>
      </section>

      {/* Footer area simple for landing */}
      <footer className="w-full py-12 border-t border-outline-variant/10 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xl font-bold signature-gradient bg-clip-text text-transparent">The Curator</div>
          <p className="text-sm text-on-surface-variant">© 2026 Recruitment Platform. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
