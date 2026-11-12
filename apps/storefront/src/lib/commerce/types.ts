export interface Account { id: number; name: string; email: string; role: 'customer' | 'seller' | 'admin'; seller_id: string | null }
export interface Address { id?: number; name: string; phone: string; line1: string; line2?: string; city: string; state: string; pincode: string }
export interface OrderLine { productId: string; slug: string; title: string; variant?: string; qty: number; price: number; sellerId: string | null; commission: number }
export interface Shipment { id: number; seller_id: string | null; status: string; tracking: string | null; carrier: string | null; lines: OrderLine[] }
export interface Order { id: string; created_at: string; total: number; subtotal: number; shipping: number; payment: string; address: Address; shipments: Shipment[]; is_demo: boolean; payment_status: string }
export interface ShopSettings { freeDeliveryThreshold: number; deliveryFee: number; codEnabled: boolean; checkoutEnabled: boolean; demo: boolean; commission: number; supportEmail: string; serviceablePrefixes: string[] }
