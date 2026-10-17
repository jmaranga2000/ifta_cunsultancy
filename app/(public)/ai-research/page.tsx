import Link from "next/link";
import { ArrowRight, BookOpenCheck, LockKeyhole, UserCheck } from "lucide-react";
import { PublicPageIntro } from "@/components/public/public-page-intro";
import { buttonClassName } from "@/components/ui/button";

const points = [
  { id: "staff", icon: LockKeyhole, title: "For IFTA experts only", text: "Only assigned team members can open the AI research tools." },
  { id: "tools", icon: BookOpenCheck, title: "Helps us work faster", text: "It helps with tax research, KRA assessments and draft objections." },
  { id: "checked", icon: UserCheck, title: "Always checked by a person", text: "An expert reviews every AI answer before anything reaches you." },
] as const;

export default function AiResearchPage() {
  return (
    <main>
      <PublicPageIntro
        description="Our team uses AI to research faster. A qualified person always checks the result."
        title="AI research at IFTA"
      />
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {points.map((point) => {
            const Icon = point.icon;
            return (
              <div className="rounded-xl border border-border bg-card p-6" key={point.id}>
                <Icon aria-hidden="true" className="h-8 w-8 text-accent" />
                <h2 className="mt-4 text-xl font-bold text-foreground">{point.title}</h2>
                <p className="mt-2 text-base leading-7 text-muted-foreground">{point.text}</p>
              </div>
            );
          })}
        </div>
        <Link className={buttonClassName({ className: "mt-10", size: "lg" })} href="/contact">
          Ask us a question
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}
