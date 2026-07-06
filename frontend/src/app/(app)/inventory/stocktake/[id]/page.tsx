import StockCountDetailClient from "./stock-count-detail-client";

export default async function StockCountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StockCountDetailClient id={Number(id)} />;
}
