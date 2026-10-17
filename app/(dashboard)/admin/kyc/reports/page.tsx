import { KycSimpleTablePage } from "@/components/dashboard/kyc/kyc-support-pages";
import { getKycReports } from "@/features/kyc/service";

export default async function AdminKycReportsPage() {
  const rows = await getKycReports();

  return (
    <KycSimpleTablePage
      columns={["name", "metric", "href"]}
      description="KYC reports on pending reviews, approvals, response times, risk and workload."
      eyebrow="KYC reports"
      rows={rows}
      title="KYC reports"
    />
  );
}
