import {Suspense} from 'react'
import {Catalog} from '@/components/commerce/Catalog'
export default function Search(){return <div className="pm-container pm-section"><h1 className="pm-h2">Find your next favourite</h1><Suspense fallback={<p>Loading products…</p>}><Catalog/></Suspense></div>}
