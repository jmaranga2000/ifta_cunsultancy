import Link from "next/link";
import { ArrowLeft, CheckCircle2, ClipboardCheck } from "lucide-react";
import { AdminPageSurface } from "@/components/dashboard/admin/admin-page-surface";
import { buttonClassName } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { submitCheckoutAction } from "@/features/client/commerce-actions";
import type { ClientCartRecord } from "@/repositories/client-commerce-repository";

export function ClientCheckout({ cart }: { cart: ClientCartRecord }) {
  return (
    <AdminPageSurface
      actions={<Link className={buttonClassName({ variant: "secondary" })} href="/client/cart"><ArrowLeft aria-hidden="true" className="h-4 w-4" />Back to cart</Link>}
      description="Check your request. We will reply with a price and what we need from you before any work starts."
      icon={ClipboardCheck}
      title="Send your request"
    >
      <ol className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-border px-5 py-3 text-sm">
        <li className="font-medium text-muted-foreground">1. Choose services <span aria-hidden="true">✓</span></li>
        <li className="font-bold text-primary">2. Tell us what you need</li>
        <li className="text-muted-foreground">3. We review and reply</li>
      </ol>
      <form action={submitCheckoutAction} className="grid lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid content-start gap-5 p-5">
          <div className="grid gap-2"><Label htmlFor="expectedOutcome">What result do you need?</Label><Textarea id="expectedOutcome" maxLength={1000} name="expectedOutcome" placeholder="What do you want IFTA to help you achieve?" required rows={5} /></div>
          <div className="grid gap-2"><Label htmlFor="clientNotes">Anything else we should know? (optional)</Label><Textarea id="clientNotes" maxLength={2000} name="clientNotes" placeholder="Add deadlines or anything we should know." rows={6} /></div>
          <div className="rounded-md border border-border bg-brand-soft p-4 text-sm leading-6 text-brand-deep"><p className="flex items-center gap-2 font-bold"><CheckCircle2 aria-hidden="true" className="h-4 w-4" />What happens next</p><p className="mt-2">We reply with a price and what we need from you. You pay nothing now, and nothing starts until you agree.</p></div>
        </div>
        <aside className="border-t border-border bg-muted/20 p-5 lg:border-l lg:border-t-0">
          <h2 className="font-bold text-foreground">Selected services</h2>
          <div className="mt-4 divide-y divide-border border-y border-border">{cart.items.map((item) => <div className="py-3" key={item.serviceId}><p className="text-sm font-semibold text-foreground">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.priceLabel}</p></div>)}</div>
          <SubmitButton className="mt-5 w-full" pendingText="Sending your request...">Send my request</SubmitButton>
        </aside>
      </form>
    </AdminPageSurface>
  );
}
