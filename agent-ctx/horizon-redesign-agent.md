# Task: Redesign 4 Pages with Horizon Design System

## Summary

Redesigned TeamPage, SellerProductsPage, SellerProductFormPage, and CartUploadPage to use the modern "Horizon" design system with Tailwind semantic tokens instead of hardcoded hex colors.

## Key Changes Across All Files

### Color Token Migration
| Old Hardcoded Color | New Semantic Token |
|---|---|
| `text-[#1F2321]` | `text-foreground` |
| `text-[#5C635F]` | `text-muted-foreground` |
| `bg-[#4A675B]` / `text-[#4A675B]` | `bg-primary` / `text-primary` |
| `border-[#D5CEBD]` | `border-border` |
| `bg-[#F4F1EA]` | `bg-secondary` |
| `bg-[#FDFBF7]` | `bg-card` |
| `text-[#C47055]` / `bg-[#C47055]/10` | `text-accent` / `bg-accent/10` |
| `bg-red-600` / `text-red-600` | `bg-destructive` / `text-destructive` |
| `hover:bg-[#3D564C]` | `hover:bg-primary/90` |

### Design System Classes Used
- `.animate-fade-in-up` — page-level entrance animation
- `.animate-scale-in` — collapsible form / modal entrance
- `.premium-table` — table with hover row highlights
- `.label-overline` — uppercase section labels (Basics, Tier pricing, etc.)
- `.modal-overlay` — backdrop blur for delete confirmation
- `.btn-press` — button press micro-interaction
- `.font-heading` — Outfit heading font
- `.stagger-children` — staggered row entrance animations
- `.card-hover` — available for card lift effect

### Per-File Details

1. **TeamPage.tsx** — "Team" overline in `text-accent`, org name heading, add user form with `bg-secondary rounded-xl border border-border`, team table with `bg-card premium-table`, header row `bg-secondary text-xs uppercase tracking-wider`, avatar circles `bg-primary/10 text-primary`, role pills (approver=`bg-primary/10 text-primary`, requestor=`bg-accent/10 text-accent`), delete button with `opacity-0 group-hover:opacity-100` hover reveal, delete modal with `modal-overlay` + `animate-scale-in`

2. **SellerProductsPage.tsx** — Header with "Add product" `bg-primary` button, products table with `bg-card premium-table`, same header styling, empty state with dashed border and `Package` icon, "Edit" link in `text-primary hover:underline`

3. **SellerProductFormPage.tsx** — Back link in `text-primary`, three card sections (`bg-card rounded-xl border border-border p-6`), each with `label-overline text-accent`, tier pricing with dynamic add/remove, submit button `bg-primary rounded-xl btn-press`

4. **CartUploadPage.tsx** — Back link `text-primary`, header with `FileSpreadsheet` icon in `bg-secondary` circle, info card `bg-secondary border border-border rounded-xl`, "Browse marketplace" `bg-primary rounded-xl btn-press`

## Lint & Dev Server
- ESLint: ✅ No errors
- Dev server: ✅ Running on port 3000, compiles successfully
