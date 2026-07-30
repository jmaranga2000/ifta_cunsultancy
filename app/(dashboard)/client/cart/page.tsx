import { ClientCart } from "@/components/dashboard/client/client-cart";
import { cookies } from "next/headers";
import { requireUser } from "@/features/auth/server";
import { getClientCart } from "@/repositories/client-commerce-repository";

export default async function ClientCartPage() {
  const [principal, cookieStore] = await Promise.all([requireUser(), cookies()]);
  const cart = await getClientCart({ clientUserId: principal.id, guestToken: cookieStore.get("ifta_guest_cart")?.value });
  return <ClientCart cart={cart} checkoutHref="/client/checkout" returnPath="/client/cart" />;
}
