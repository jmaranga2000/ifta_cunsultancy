import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Plus } from "lucide-react";
import { PublicPageIntro } from "@/components/public/public-page-intro";
import { buttonClassName } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { addServiceToCartAction } from "@/features/client/commerce-actions";
import { serviceImageSource } from "@/features/services/presentation";
import { listServices } from "@/repositories/service-catalog-repository";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const services = await listServices({ publishedOnly: true });

  return (
    <main>
      <PublicPageIntro
        description="Pick what you need and add it to your cart. You pay nothing until you agree the price."
        title="Our services"
      />

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          {services.map((service, index) => (
            <article className="scroll-mt-28 overflow-hidden rounded-xl border border-border bg-card" id={service.slug} key={service.id}>
              <div className="relative aspect-[16/8] bg-muted">
                <Image alt={service.imageAlt} className="object-cover" fill sizes="(min-width: 768px) 50vw, 100vw" src={serviceImageSource(service, index)} />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-foreground">{service.title}</h2>
                <p className="mt-3 text-base leading-7 text-muted-foreground">{service.summary}</p>
                <ul className="mt-4 grid gap-2">
                  {service.inclusions.slice(0, 4).map((item) => (
                    <li className="flex items-start gap-2 text-base font-medium text-foreground" key={item}>
                      <Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <form action={addServiceToCartAction} className="sm:flex-1">
                    <input name="serviceId" type="hidden" value={service.id} />
                    <input name="returnPath" type="hidden" value="/services" />
                    <SubmitButton className="w-full" pendingText="Adding...">
                      <Plus aria-hidden="true" className="h-4 w-4" />
                      Add to cart
                    </SubmitButton>
                  </form>
                  <Link className={buttonClassName({ className: "sm:flex-1", variant: "secondary" })} href="/contact">
                    Ask a question
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
