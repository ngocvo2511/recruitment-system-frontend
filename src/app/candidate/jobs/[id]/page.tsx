import { MOCK_JOBS } from "@/lib/mockData";
import { ArrowLeft, Building2, MapPin, Clock, Briefcase, Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const job = MOCK_JOBS.find(j => j.id === params.id) || MOCK_JOBS[0]; // fallback for demo

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 w-full">
      <Link href="/candidate/jobs" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary font-medium mb-8 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/>
        Back to Jobs
      </Link>

      <div className="glass-card rounded-[2rem] p-8 md:p-12 shadow-lg relative overflow-hidden">
        {/* Abstract Backgrounds */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mb-10 pb-10 border-b border-outline-variant/10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-surface rounded-2xl flex items-center justify-center p-4 shrink-0 shadow-sm">
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg"></div>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-on-surface mb-2">{job.title}</h1>
              <div className="flex flex-wrap gap-4 text-on-surface-variant text-sm font-medium">
                <span className="flex items-center gap-1"><Building2 className="w-4 h-4"/> OrbitX Systems</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {job.location}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> Posted: {job.postedDate}</span>
              </div>
            </div>
          </div>
          <div className="flex md:flex-col items-center md:items-end gap-3 w-full md:w-auto">
            <div className="text-2xl font-black text-primary">{job.salaryRange}</div>
            <button className="signature-gradient text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-all w-full md:w-auto">
              Apply Now
            </button>
          </div>
        </div>

        {/* AI Insight Snippet */}
        <div className="bg-primary-container/20 border border-primary/20 rounded-2xl p-6 mb-10 flex gap-4">
          <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-primary mb-1 text-lg">92% AI Match</h3>
            <p className="text-on-surface-variant leading-relaxed text-sm">
              Your profile aligns strongly with this role. You tick 3 out of 3 key requirements. We highly recommend you apply!
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-bold mb-4 text-on-surface">About the role</h2>
            <p className="text-on-surface-variant leading-relaxed">
              {job.description} We are seeking a highly motivated individual who thrives in a fast-paced, collaborative environment. You will work closely with cross-functional teams to deliver outstanding products.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-on-surface">Requirements</h2>
            <ul className="space-y-4">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-3 text-on-surface-variant">
                  <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
              <li className="flex items-start gap-3 text-on-surface-variant">
                <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <span>Excellent communication and teamwork skills.</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
