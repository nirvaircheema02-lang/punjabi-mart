import {Suspense} from 'react'
import {LiveProduct} from '@/components/commerce/LiveProduct'
export default function Product(){return <div className="pm-container pm-section"><Suspense fallback={<p>Loading product…</p>}><LiveProduct/></Suspense></div>}
