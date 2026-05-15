# Task: Redesign MarketplacePage and ProductDetailPage with Horizon Design System

## Task ID: redesign-marketplace-product-detail

## Summary
Redesigned both `MarketplacePage.tsx` and `ProductDetailPage.tsx` to use the "Horizon" design system with Tailwind semantic tokens instead of hardcoded hex colors.

## Changes Made

### MarketplacePage.tsx
- **Header**: Uses `text-foreground`, `text-muted-foreground`, `bg-card`, `rounded-xl`, `border-border` for search input
- **Filter row**: Category and Sterility Selects with `bg-card rounded-xl border-border`, "Clear filters" with X icon in `text-accent`
- **Product Grid** (1/2/3 cols responsive):
  - Card: `bg-card rounded-xl border border-border overflow-hidden card-hover btn-press`
  - Image area: `aspect-[4/3] bg-secondary` with Package icon fallback in `text-muted-foreground/30`
  - "Sterile" badge: `bg-card/90 text-primary backdrop-blur-sm` with ShieldCheck icon
  - Card body: `label-overline text-accent`, `font-heading text-foreground`, `text-muted-foreground`
  - Pricing: `border-t border-border/50`, "From ₹X / per unit" in `text-foreground`, "as low as ₹X" in `text-primary`
  - Uses `.stagger-children` for grid entry animation
- **Empty state**: Centered Search icon, "No products found" in `text-foreground`, "Try adjusting your filters"
- **Loading state**: `.skeleton` placeholders with `bg-card rounded-xl border border-border`
- Debounced search (300ms) preserved

### ProductDetailPage.tsx
- **Back link**: `text-primary` with ArrowLeft icon
- **Two-column layout** (1 col mobile, 2 cols md):
  - Left: `bg-secondary rounded-2xl aspect-[4/3]` with Package fallback
  - Right:
    - Category `label-overline text-accent`, name `font-heading text-3xl text-foreground`, seller `text-muted-foreground` with Building2 icon
    - Status chips: Sterile (emerald Badge), Disposable (teal)/Reusable (orange) with dark mode variants
    - Description: `text-muted-foreground leading-relaxed`
    - Tier Pricing Table: `bg-card rounded-xl border border-border`, header `bg-secondary`, columns: Min qty, Unit price (formatINR), Savings % in `text-primary`
    - Specifications grid (2 cols): `text-muted-foreground` labels, `text-foreground` values
    - Certifications: Badge components with `border-border bg-secondary/60 text-muted-foreground`
    - Cart action box: `bg-secondary rounded-xl border border-border p-5`
      - Quantity Input with `bg-card border-border`
      - Unit price `text-foreground`, Line total `text-primary`
      - Add to cart: `bg-primary hover:bg-primary/90 text-primary-foreground btn-press`
      - Restriction messages: `text-accent` with AlertTriangle icon

## Semantic Token Mapping
| Old (hex) | New (semantic) |
|-----------|---------------|
| `text-[#1F2321]` | `text-foreground` |
| `text-[#5C635F]` | `text-muted-foreground` |
| `text-[#4A675B]` | `text-primary` |
| `text-[#C47055]` | `text-accent` |
| `bg-[#FDFBF7]` | `bg-card` |
| `bg-[#F4F1EA]` | `bg-secondary` |
| `bg-[#EAE5D9]` | `bg-secondary` |
| `border-[#D5CEBD]` | `border-border` |
| `border-[#C47055]/30` | `border-accent/30` (via Badge classes) |

## Verification
- `bun run lint` passes with no errors
- Dev server compiles successfully
- HTTP 200 on localhost:3000
