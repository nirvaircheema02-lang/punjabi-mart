import type { Product } from "@/lib/mock-data";
export type Shop = {
  id: string;
  name: string;
  status: string;
  commission_bps: number | null;
};
export type ManagedProduct = Product & {
  description?: string;
  commission?: number | null;
};
