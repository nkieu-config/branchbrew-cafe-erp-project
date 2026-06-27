## Summary

<!-- 1–3 bullets: what changed and why -->

-

## Test plan

### Automated

- [ ] `npm run type-check` (root / backend / frontend as applicable)
- [ ] `npm run lint`
- [ ] `npm run test` (backend and/or frontend)
- [ ] `npm run build` in `frontend` (if UI touched)

### UI / UX (required for frontend UI changes)

Reference: [`design-system/qafacafe-erp/MASTER.md`](../design-system/qafacafe-erp/MASTER.md)

- [ ] **375px** — no horizontal scroll; mobile nav (hamburger) works
- [ ] **768px** — tablet layout readable (POS/KDS if touched)
- [ ] **1024px+** — sidebar + hub tabs visible
- [ ] **Keyboard** — Tab through one flow (e.g. Login → Inventory → tab switch) without trap
- [ ] **Focus** — skip link works; route change focuses main content
- [ ] **Dark mode** — spot-check contrast on changed screens
- [ ] **Reduced motion** — OS “reduce motion” on: no jarring page/tab animation

### Domain smoke (check what applies)

- [ ] Branch picker / branch scope
- [ ] POS checkout or KDS status update
- [ ] Inventory / procurement flow
- [ ] HR or finance form submit

## Screenshots

<!-- Optional but recommended for UI PRs -->

| Viewport | Screenshot |
|----------|------------|
| Mobile (375px) | |
| Desktop | |
