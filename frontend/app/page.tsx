import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookCheck, BrainCircuit, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/90 px-6 py-4 shadow-sm backdrop-blur">
          <div className="flex items-center gap-4">
            <Image
              src="/trace-logo.png"
              alt="TRACE"
              width={180}
              height={54}
              priority
              className="h-11 w-auto sm:h-12"
            />
            <div className="hidden border-l border-slate-200 pl-4 sm:block">
              <p className="text-sm font-medium text-slate-900">Teacher-assisted mistake analytics</p>
              <p className="text-sm text-slate-500">Insights for teachers and students</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard">
              <Button size="sm">
                Teacher Login
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/students">
              <Button variant="outline" size="sm">
                Student Login
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex flex-1">
          <section className="relative w-full overflow-hidden rounded-4xl border border-slate-200 bg-white/90 p-7 shadow-sm backdrop-blur sm:p-8 lg:p-10">
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.02),transparent_20%,transparent_80%,rgba(14,165,233,0.03))]" />
            <div className="relative mx-auto max-w-6xl space-y-10">
              <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div className="space-y-5">
                  <h1 className="max-w-2xl font-serif text-4xl leading-tight text-slate-900 sm:text-5xl">
                    Transform assessment mistakes into actionable learning insights.
                  </h1>
                  <p className="max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                    TRACE helps teachers identify recurring misconceptions, procedural errors, and calculation mistakes across assessments, enabling targeted remediation instead of relying only on scores.
                  </p>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <Link href="/dashboard">
                      <Button size="lg">
                        Teacher Login
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/students">
                      <Button variant="outline" size="lg">
                        Student Login
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="flex justify-center lg:justify-end">
                  <div className="w-full max-w-md rounded-4xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl bg-sky-100 p-3">
                        <Users className="h-6 w-6 text-sky-700" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Class Overview</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">Keep rosters and assessment context together for checking and review.</p>
                      </div>
                    </div>
                    <div className="my-5 h-px bg-slate-200" />
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="rounded-2xl bg-sky-100 p-3">
                          <BookCheck className="h-6 w-6 text-sky-700" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Question-by-Question Checking</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">Review each question, note which students missed it, and assign mistake categories.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="rounded-2xl bg-sky-100 p-3">
                          <BrainCircuit className="h-6 w-6 text-sky-700" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Teacher Insight Support</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">Summarize recurring mistakes into clear AI-generated feedback once the needed assessment data is collected.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-200" />

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">How TRACE works</p>
                  <p className="text-sm leading-6 text-slate-600">Set up the assessment, tag mistakes by question, then review grouped insights and feedback.</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Why it matters</p>
                  <p className="text-sm leading-6 text-slate-600">Moves beyond scores to the actual mistake pattern, so remediation is targeted.</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Secondary review</p>
                  <p className="text-sm leading-6 text-slate-600">Supports teachers after marking papers by organizing the mistakes students made and the feedback they need.</p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
