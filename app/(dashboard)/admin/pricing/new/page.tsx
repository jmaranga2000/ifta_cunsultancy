import Link from "next/link";
import { ArrowLeft, BadgeDollarSign } from "lucide-react";
import { AdminPageSurface } from "@/components/dashboard/admin/admin-page-surface";
import { PricingPlanForm } from "@/components/dashboard/admin/pricing-plan-form";
import { buttonClassName } from "@/components/ui/button";
import { requirePermission } from "@/features/auth/server";
import { createPricingPlanAction } from "@/features/services/actions";
import { listServices } from "@/repositories/service-catalog-repository";

export default async function NewAdminPricingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; fromService?: string; serviceId?: string }>;
}) {
  await requirePermission("services.manage");
  const [query, services] = await Promise.all([searchParams, listServices()]);

  return (
    <AdminPageSurface
      actions={
        <Link
          className={buttonClassName({ variant: "secondary" })}
          href="/admin/pricing"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to pricing
        </Link>
      }
      description={query.fromService === "1"
        ? "Add the price clients will see before you publish this service."
        : "Add a price option for clients and publish it when the wording is ready."}
      icon={BadgeDollarSign}
      title="New pricing option"
    >
      {query.error ? (
        <p className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-800">
          Check the required fields and try again.
        </p>
      ) : null}
      <PricingPlanForm
        action={createPricingPlanAction}
        selectedServiceId={query.fromService === "1" ? query.serviceId : undefined}
        services={services}
        submitLabel={query.fromService === "1" ? "Save price and continue" : "Create pricing option"}
      />
    </AdminPageSurface>
  );
}
