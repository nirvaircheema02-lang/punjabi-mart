import {Suspense} from 'react'
import {notFound} from 'next/navigation'
import {categories} from '@/lib/taxonomy'
import {FilterForm} from '@/components/commerce/Catalog'
export function generateStaticParams(){return categories.map(c=>({slug:c.slug}))}
export default async function Filters({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!categories.some(c=>c.slug===slug))notFound();return <div className="pm-container pm-section"><Suspense fallback={<p>Loading filters…</p>}><FilterForm category={slug}/></Suspense></div>}
