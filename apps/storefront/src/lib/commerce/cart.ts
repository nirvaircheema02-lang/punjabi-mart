export interface CartLine { productId: string; slug: string; qty: number; variant?: string }
export const MAX_QUANTITY = 20
export const sameLine = (a: CartLine, productId: string, variant?: string) => a.productId === productId && (a.variant || undefined) === (variant || undefined)
export function normalizeCart(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return []
  const result: CartLine[] = []
  for (const item of value) {
    if (!item || typeof item.productId !== 'string' || typeof item.slug !== 'string' || !Number.isInteger(item.qty) || item.qty < 1) continue
    const variant = typeof item.variant === 'string' ? item.variant : undefined
    const existing = result.find(l => sameLine(l, item.productId, variant))
    if (existing) existing.qty = Math.min(MAX_QUANTITY, existing.qty + item.qty)
    else result.push({ productId: item.productId, slug: item.slug, variant, qty: Math.min(MAX_QUANTITY, item.qty) })
  }
  return result.slice(0, 100)
}
export function quantity(cart: CartLine[], productId: string, qty: number, variant?: string) {
  if (!Number.isFinite(qty)) return cart
  return cart.flatMap(l => sameLine(l, productId, variant) ? qty <= 0 ? [] : [{ ...l, qty: Math.min(MAX_QUANTITY, Math.floor(qty)) }] : [l])
}
