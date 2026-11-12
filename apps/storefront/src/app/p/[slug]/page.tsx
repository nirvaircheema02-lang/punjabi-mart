import {Suspense} from 'react'
import {products} from '@/lib/mock-data'
import {LiveProduct} from '@/components/commerce/LiveProduct'
export function generateStaticParams(){return products.map(p=>({slug:p.slug}))}
export default async function Product({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <div className="pm-container pm-section"><Suspense fallback={<p>Loading product…</p>}><LiveProduct slug={slug}/></Suspense></div>}
