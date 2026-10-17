import Link from "next/link";
import { ArrowRight, CreditCard, FileCheck2, FolderOpen, MessageSquareText, ScrollText, UserCheck } from "lucide-react";
import { PublicPageIntro } from "@/components/public/public-page-intro";
import { buttonClassName } from "@/components/ui/button";

const features = [
  { id: "request", icon: ScrollText, title: "Ask for a service", text: "Choose what you need and send your request." },
  { id: "verify", icon: UserCheck, title: "Verify who you are", text: "Answer a few questions and upload your ID once." },
  { id: "sign", icon: FileCheck2, title: "Sign online", text: "Read and sign your engagement letter on your phone." },
  { id: "files", icon: FolderOpen, title: "Share files safely", text: "Send and receive documents in one private place." },
  { id: "chat", icon: MessageSquareText, title: "Chat with your team", text: "Ask questions and get answers without long emails." },
  { id: "pay", icon: CreditCard, title: "See and pay invoices", text: "Pay by M-Pesa, bank or card and keep your receipts." },
] as const;

export default function ClientPortalPage() {
  return (
    <main>
      <PublicPageIntro description="Everything for your work with IFTA, in one safe place." title="Your client account" />
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link className={buttonClassName({ size: "lg" })} href="/client">
            Sign in
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
          <Link className={buttonClassName({ size: "lg", variant: "secondary" })} href="/sign-up">
            Create a free account
          </Link>
        </div>
        <h2 className="mt-12 text-3xl font-bold text-foreground">What you can do</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div className="rounded-xl border border-border bg-card p-6" key={feature.id}>
                <Icon aria-hidden="true" className="h-8 w-8 text-accent" />
                <h3 className="mt-4 text-xl font-bold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-base leading-7 text-muted-foreground">{feature.text}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
