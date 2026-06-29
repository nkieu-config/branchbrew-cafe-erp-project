#!/usr/bin/env node
/**
 * One-off: split `from "@/lib/theme"` barrel imports into domain modules.
 * Run: node scripts/migrate-theme-imports.mjs
 */
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "../src");
const THEME_DIR = path.join(SRC, "lib/theme");

const SKIP_FILES = new Set([
  path.join(SRC, "lib/theme/index.ts"),
  path.join(SRC, "lib/theme/hub-ui.ts"),
]);

const SECTION_ALIAS_HUB = {
  crm: "hub-crm",
  products: "hub-products",
  procurement: "hub-procurement",
  kitchen: "hub-kitchen",
  hr: "hub-hr",
  pos: "hub-section-aliases",
};

function buildSymbolMap() {
  const map = new Map();

  const assign = (symbol, mod) => {
    if (!map.has(symbol)) map.set(symbol, mod);
  };

  for (const file of fs.readdirSync(THEME_DIR)) {
    if (!file.endsWith(".ts") || file.endsWith(".test.ts")) continue;
    if (file === "index.ts" || file === "hub-ui.ts") continue;
    const mod = `@/lib/theme/${file.replace(/\.ts$/, "")}`;
    const content = fs.readFileSync(path.join(THEME_DIR, file), "utf8");
    for (const m of content.matchAll(/^export (?:async )?function ([A-Za-z0-9_]+)/gm)) {
      assign(m[1], mod);
    }
    for (const m of content.matchAll(/^export const ([A-Za-z0-9_]+)/gm)) {
      assign(m[1], mod);
    }
    for (const m of content.matchAll(/^export type ([A-Za-z0-9_]+)/gm)) {
      assign(m[1], mod);
    }
  }

  const aliases = fs.readFileSync(path.join(THEME_DIR, "hub-section-aliases.ts"), "utf8");
  for (const m of aliases.matchAll(/^export function ([A-Za-z0-9_]+)/gm)) {
    const name = m[1];
    const hubKey = Object.keys(SECTION_ALIAS_HUB).find((k) => name.startsWith(k));
    const target = hubKey ? `@/lib/theme/${SECTION_ALIAS_HUB[hubKey]}` : "@/lib/theme/hub-section-aliases";
    assign(name, target);
  }

  return map;
}

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, acc);
    else if (/\.(tsx?)$/.test(entry) && !entry.endsWith(".test.ts")) acc.push(full);
  }
  return acc;
}

function migrateFile(filePath, symbolMap) {
  if (SKIP_FILES.has(filePath)) return false;
  if (filePath.includes(`${path.sep}lib${path.sep}theme${path.sep}`)) return false;

  let content = fs.readFileSync(filePath, "utf8");
  const barrelPattern =
    /import\s+(type\s+)?\{([^}]+)\}\s+from\s+['"]@\/lib\/theme['"];?/g;

  if (!barrelPattern.test(content)) return false;
  barrelPattern.lastIndex = 0;

  const unknown = new Set();
  let changed = false;

  content = content.replace(barrelPattern, (full, typeKeyword, inner) => {
    const isTypeOnly = Boolean(typeKeyword);
    const specs = inner
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const byModule = new Map();
    for (const spec of specs) {
      const typePrefix = spec.startsWith("type ") ? "type " : "";
      const name = spec.replace(/^type\s+/, "").trim();
      const mod = symbolMap.get(name);
      if (!mod) {
        unknown.add(name);
        continue;
      }
      const key = `${isTypeOnly || typePrefix ? "type:" : "val:"}${mod}`;
      if (!byModule.has(key)) byModule.set(key, { mod, names: [] });
      byModule.get(key).names.push(typePrefix ? `type ${name}` : name);
    }

    if (byModule.size === 0) return full;

    changed = true;
    const lines = [...byModule.values()]
      .sort((a, b) => a.mod.localeCompare(b.mod))
      .map(({ mod, names }) => {
        const hasType = names.some((n) => n.startsWith("type "));
        const hasVal = names.some((n) => !n.startsWith("type "));
        if (hasType && hasVal) {
          const typeNames = names.filter((n) => n.startsWith("type ")).join(", ");
          const valNames = names.filter((n) => !n.startsWith("type ")).join(", ");
          return `import { ${valNames} } from "${mod}";\nimport type { ${typeNames.replace(/type\s+/g, "")} } from "${mod}";`;
        }
        if (hasType) {
          return `import type { ${names.map((n) => n.replace(/^type\s+/, "")).join(", ")} } from "${mod}";`;
        }
        return `import { ${names.join(", ")} } from "${mod}";`;
      });

    return lines.join("\n");
  });

  if (unknown.size > 0) {
    console.error(`UNKNOWN in ${path.relative(SRC, filePath)}:`, [...unknown].join(", "));
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
  }
  return changed;
}

const symbolMap = buildSymbolMap();
let count = 0;
for (const file of walk(SRC)) {
  if (migrateFile(file, symbolMap)) {
    count += 1;
    console.log("migrated", path.relative(SRC, file));
  }
}
console.log(`Done. ${count} files updated.`);
