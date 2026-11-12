# PunjabiMarts image assets

The storefront uses a complete, art-directed set of AI-generated catalogue imagery.
These are illustrative concepts for the demo catalogue, not photographs of actual
seller stock or premises. The site explains this at `/photo-credits` and in its footer.

## Art direction

Warm ivory limestone and linen, natural side light, deep maroon and saffron accents,
clear fabric and metal textures, and centred products with breathing room. Garment
and product colours follow the catalogue title. Packaging is unbranded.

## Coverage

| Group | Slots | Directory |
|---|---:|---|
| Products | 99 | `products/<category>/` |
| Categories | 19 | `categories/` |
| Ceremonies | 10 | `ceremonies/` |
| Shop concepts | 4 | `sellers/` |
| Hero composition | 1 | `editorial/` |
| Total | 133 | |

## Provenance and updates

- Generator: built-in OpenAI image generation tool.
- Exact final prompts: `apps/storefront/image-generation-prompts.json`.
- Generated originals and installed destinations: `apps/storefront/image-generation-results.json`.
- Web assets live entirely under this directory; the app does not load files from the generator's original output directory.
- `src/lib/product-images.ts` defines the paths and accessible descriptions.
- `npm run images:scan` refreshes the availability manifest after adding images.
- The scan also fingerprints each file so replaced images refresh the optimized browser URLs.
- `node scripts/install-generated-images.mjs` can re-encode the recorded originals on the generating machine.

Images use WebP, with a maximum width of 1200px for catalogue assets and 1800px
for landscape images. Next.js serves responsive sizes and lazy-loads images below
the fold. Product shots use 4:5, pantry/category tiles 1:1, and editorial interiors
16:9. SVG art remains only as an error fallback.

For a real inventory launch, replace illustrative product and shop images with
verified seller photography at the same paths, and update the imagery disclosure.
