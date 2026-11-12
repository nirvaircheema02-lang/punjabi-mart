# PunjabiMarts

Multi-vendor commerce platform with a hybrid ownership model (platform-owned + seller-owned inventory).

Plan of record: `~/.claude/plans/i-want-to-make-jiggly-moon.md` — **§0 Implementation Directives is the highest-priority source of truth** wherever older sections conflict.

## Structure

```
punjabimarts/
├── apps/
│   ├── storefront/          Next.js (current active LTS) — customer storefront
│   └── api/                 Laravel + Filament — API, Seller Center, Admin  [BLOCKED: no PHP]
├── packages/
│   └── design-system/       DS V1 — tokens + components (framework-agnostic CSS)
└── docs/
```

## Design System V1 — "Plum Modern"

Selected direction: **Plum Modern** · **General Sans** · craft-led, FMCG as a controlled secondary vertical.

Three-tier token architecture — components bind to component tokens only:

```
primitive.ts     plum-600        raw values, never imported by app code
    ↓
semantic.ts      --action-primary    roles, not hues
    ↓
components.css   --btn-*             component-local bindings
```

**Acceptance test:** a new logo, primary colour or typeface must be absorbable through token edits alone. If a page needs touching, the architecture has failed.

### Run the showcase

```bash
cd packages/design-system && python3 -m http.server 4321
```
Then open http://localhost:4321/showcase/index.html

### Verified in-browser (2026-09-20)

| Spec | Result |
|---|---|
| Action colour token | `#5A226F` ✓ |
| AA-safe accent ink | `#B8431A` ✓ |
| Primary button height | 44px ✓ |
| Compact density override | 40px ✓ |
| Stepper touch target | **44×44** ✓ (Zepto ships 24×28 and fails) |
| Size chip | 52×52, radius 12px ✓ |
| AddControl morph | ADD ↔ stepper, reverts below 1 ✓ |
| Variant gating | sized products never silently add ✓ |
| Editorial variant | swaps display face to serif only ✓ |
| Craft vs FMCG quick-add | `static` vs `absolute` ✓ |
| Console errors | none |

## Key architectural rules

- **Hybrid ownership:** `product_owner_type: platform | seller`, `seller_id` nullable. Platform-owned ⇒ commission = 0.
- **Multi-seller orders:** customer sees one order; backend splits into sub-orders by ownership/seller.
- **Commission:** product → seller → category → global default. Snapshotted at order creation so historical payouts never move. Any percentage configurable; 8–12% is a business guideline, not a technical limit.
- **No paid marketplace/multi-vendor plugin dependency.**
- **Compliance is not a blocker:** GST/FSSAI/payment/courier are configurable and inactive. Never invent registration numbers; never ship unverified tax logic.
- **Adapters, not integrations:** `PaymentProviderInterface` (Mock + COD now), `ShippingProviderInterface` (mock/manual now).

## Consistency rules

1. No hard-coded colour when a token exists.
2. No arbitrary spacing/radius/shadow per screen.
3. Reuse before creating; variant before duplicate.
4. New reusable components go back into the DS.
5. Storefront, Seller Center and Admin share one set of foundations — density may differ, visual product may not.
