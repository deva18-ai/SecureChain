# KIRO EXECUTION PROMPT - Complete UI Redesign

Redesign the entire SecureChain frontend with a professional white & blue theme. Follow the design system in `UI_REDESIGN_PROMPT.md`.

## Color Palette
- **Primary**: Blue-600 (#2563EB)
- **Background**: White (#FFFFFF)
- **Surface**: Gray-50 (#F9FAFB)
- **Text**: Gray-900 (#111827)
- **Border**: Gray-200 (#E5E7EB)

## Implementation Order

### Phase 1: Foundation
1. Update `frontend/src/index.css` with new color variables
2. Update Button component (`frontend/src/components/ui/Button.tsx`)
3. Update Input component (`frontend/src/components/ui/Input.tsx`)
4. Update Card component (`frontend/src/components/ui/Card.tsx`)

### Phase 2: Layouts
5. Update MainLayout (`frontend/src/components/layout/MainLayout.tsx`) - white sidebar, gray-50 main area
6. Update Sidebar (`frontend/src/components/layout/Sidebar.tsx`) - white bg, blue active states
7. Update Header (`frontend/src/components/layout/Header.tsx`) - white bg, gray-200 border

### Phase 3: Pages (Priority Order)
8. LoginPage - White card, blue buttons, gradient background (blue-50 to white)
9. LandingPage - White sections, blue CTAs
10. DashboardPage - White cards, blue accents, gray-50 background
11. UsersPage - White table, blue actions
12. AssetsPage - White cards, blue filters
13. RequestsPage - White cards, status badges
14. IdentitiesPage - White cards, blue verification
15. BlockchainPage - White cards, blue transaction info
16. AuditPage - White cards, blue filters
17. SecurityCenterPage - White cards, blue alerts
18. RequestAccessPage - White form, blue submit

### Phase 4: Shared Components
19. Badge component - Colored backgrounds (blue-100, green-100, etc.)
20. Table component - White bg, gray-50 header, blue hover
21. Modal component - White bg, gray-50 footer

## Key Design Rules

### Buttons
```tsx
Primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
Secondary: "bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-900"
Outline: "bg-transparent hover:bg-blue-50 border-2 border-blue-600 text-blue-600"
```

### Cards
```tsx
"bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md p-6"
```

### Inputs
```tsx
"bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-lg px-4 py-3"
```

### Sidebar Navigation
```tsx
Active: "bg-blue-50 text-blue-600 font-semibold"
Inactive: "text-gray-700 hover:bg-gray-100"
```

## Execution Steps

1. Read `UI_REDESIGN_PROMPT.md` for complete specifications
2. Update files in the order listed above
3. After each file, run `npm run build` to check for errors
4. Fix any TypeScript errors immediately
5. Test the page in browser before moving to next
6. Maintain all existing functionality
7. Keep all props and API integrations intact

## Success Criteria
✅ All pages compile without errors
✅ White backgrounds everywhere
✅ Blue as primary color (blue-600)
✅ Consistent spacing and typography
✅ Professional, enterprise-grade appearance
✅ Responsive on all screen sizes
✅ All existing features work

## Important Notes
- Do NOT change any API calls or business logic
- Do NOT modify TypeScript types or interfaces
- ONLY change UI/styling (className, inline styles, JSX structure)
- Keep all existing state management
- Maintain all event handlers
- Preserve all accessibility attributes

Start with Phase 1, then proceed sequentially through all phases. Report completion after each phase.
