# components/

## Structure

- `ui/` — shadcn/ui primitives (Button, Dialog, Slider, etc.). Never add business logic here.
- `features/generate/` — everything on the generate page
- `features/collections/` — everything on the collections/saved/compare pages
- `features/auth/` — login, signup, OAuth buttons

## Rules

- **No data fetching in components.** Receive data as props from server components or server actions.
- **Default to Server Components.** Add `"use client"` only when the component needs: event handlers, browser APIs, useState, useEffect.
- **No Supabase imports in components.** Call server actions or pass data as props.
- **Feature components go in `features/`**, not `ui/`. If it's reusable across features with no business logic, it's a `ui/` component.
- File names: PascalCase for components (`GenerateLayout.tsx`), kebab-case for pages (`page.tsx`).
