/**
 * Runtime configuration. Nothing here is hard-coded into components.
 *
 * WhatsApp support is DISABLED by default and stays disabled until a real
 * business number is configured — a personal number must never be committed
 * into a component. Set NEXT_PUBLIC_WHATSAPP_NUMBER to enable.
 */

export const support = {
  whatsapp_enabled:
    process.env.NEXT_PUBLIC_WHATSAPP_ENABLED === 'true' &&
    Boolean(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER),
  /** E.164 without the +, e.g. 919876543210. Empty until configured. */
  whatsapp_number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '',
  whatsapp_message: 'Hi PunjabiMarts, I have a question about',
} as const

export const commerce = {
  freeDeliveryThreshold: 999,
  currency: 'INR',
} as const

export function whatsappHref(context?: string): string | null {
  if (!support.whatsapp_enabled) return null
  const text = encodeURIComponent(
    context ? `${support.whatsapp_message} ${context}` : support.whatsapp_message.replace(/ about$/, ''),
  )
  return `https://wa.me/${support.whatsapp_number}?text=${text}`
}
