import { redirect } from "next/navigation";

interface PaypalReturnFallbackPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function buildQueryString(params: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
      return;
    }
    if (typeof value === "string") {
      query.append(key, value);
    }
  });

  return query.toString();
}

export default async function PaypalReturnFallbackPage({
  searchParams,
}: PaypalReturnFallbackPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const queryString = buildQueryString(resolvedSearchParams);
  const target = queryString
    ? `/user/booking/paypal-return?${queryString}`
    : "/user/booking/paypal-return";

  redirect(target);
}
