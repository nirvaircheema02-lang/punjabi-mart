import { notFound } from "next/navigation";
import { InfoPage } from "@/components/commerce/InfoPage";
import { policyPages } from "@/lib/info-pages";
export function generateStaticParams() {
  return Object.keys(policyPages).map((slug) => ({ slug }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = policyPages[slug];
  if (!page) notFound();
  return <InfoPage page={page} />;
}
