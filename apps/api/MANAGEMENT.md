# Management milestone

The demo catalogue is retained. No demo rows were deleted by this milestone.

## Available screens

- `/admin`: products, owner assignment (PunjabiMarts or shop), image upload, variants, publication, stock, shop review and commission, orders and shipment tracking, COD collection recording.
- `/seller`: same interface scoped by Laravel to the approved seller. Product edits require approval. Customer accounts cannot use management APIs.
- Register an account through `/login`, then grant admin access from the backend directory with `php artisan shop:admin your-email@example.com`. There is no default admin password. Sign out and back in afterwards.

## Verified

`php artisan test --filter=ManagementTest` checks anonymous/customer access rejection, admin-owned product publication without a shop, preservation of the seeded catalogue, seller ownership/publication restrictions, and suspension. Tests use an isolated in-memory database.

## Remaining before launch

Seller onboarding UI; operational settings UI; returns/refunds; seller settlement ledger and reconciliation; payment and courier integrations; email delivery; deployment packaging and full browser checkout validation. Variant stock is currently product-level, not per size/colour. This milestone is not a production-readiness claim.

## October 28 update

Seller applications at `/sell`, store ordering/delivery/commission settings and support inbox are connected to Laravel. `/help/contact` submits messages to the inbox. Registration returns a normalized email and customer role; request fields cannot grant admin access. Checkout quote invalidation includes address changes. The product editor is shared between seller and admin screens and isolated from the dashboard component.

Backend tests now cover registration, seller applications, address ownership, checkout totals/stock, retry idempotency, cancellation/restocking, variant selection, commission snapshots and management permissions. Live integrations, settlement and returns remain pending. The root README is an older design brief, not a current completion checklist.
