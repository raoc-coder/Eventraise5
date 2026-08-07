/**
 * Validate NEXT_PUBLIC_APP_URL for CORS safety (Sprint 8 / M4).
 *
 *   npm run audit:cors
 *   npm run audit:cors -- --strict   # exit 1 on failure (CI)
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { validateAppUrl } from "@/lib/config/app-url";

function loadEnv(): Record<string, string> {
  const path = resolve(process.cwd(), ".env.local");
  const out: Record<string, string> = { ...process.env } as Record<string, string>;
  if (!existsSync(path)) return out;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

function main() {
  const strict = process.argv.includes("--strict");
  const env = loadEnv();
  const result = validateAppUrl(env.NEXT_PUBLIC_APP_URL);

  console.log("=== CORS / App URL check (Sprint 8) ===\n");
  if (result.ok) {
    console.log(`PASS  NEXT_PUBLIC_APP_URL → origin ${result.origin}`);
    console.log("       Use this exact origin in Vercel Production + Preview.");
    process.exit(0);
  }

  console.log(`FAIL  ${result.error}`);
  console.log("       Set NEXT_PUBLIC_APP_URL to an absolute URL, e.g. https://www.eventraisehub.com");
  console.log("       Do not use * or wildcard patterns (credentials + CORS).");
  process.exit(strict ? 1 : 0);
}

main();
