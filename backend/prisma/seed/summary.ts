export function logSeedSummary(): void {
  console.log('Seeding completed!');
  console.log('');
  console.log('Demo logins (password: password123):');
  console.log('  admin@branchbrew.dev            — Super Admin (all branches)');
  console.log('  manager@branchbrew.dev          — Downtown Manager (primary demo)');
  console.log('  staff.downtown@branchbrew.dev   — Downtown Cashier');
  console.log('  manager.riverside@branchbrew.dev — Riverside Manager');
  console.log('  staff.riverside@branchbrew.dev  — Riverside Barista');
  console.log('');
  console.log('Core demo data:');
  console.log('  Member — 0811111111 (Demo Member, SILVER)');
  console.log('  Promos — WELCOME10 | SAVE20 | SUMMER24 (inactive)');
  console.log('  Procurement — PO-DEMO-001 ready to receive');
  console.log('  Ledger story — PO-DEMO-003 → ORD-{id}');
  console.log('');
  console.log('See docs/demo.md for the 15-minute demo script.');
  console.log('');
  console.log('Suggested walkthrough:');
  console.log('  1. Dashboard / POS / KDS');
  console.log('  2. Procurement / Inventory');
  console.log('  3. HR / Finance ledger');
}
