#!/usr/bin/env node
/**
 * CLI runner: generate a fresh VAPID keypair for Web Push (ADR-0003 / Sprint
 * 0 item S0.6).
 *
 * Usage:
 *   npm run generate:vapid                            # prints env snippet
 *   npm run generate:vapid -- --subject mailto:a@b.c  # custom contact subject
 *   npm run generate:vapid -- --vercel                # also print Vercel CLI commands
 *
 * The script writes to stdout only; nothing is persisted. Pipe to a file or
 * paste into your secrets manager. Never commit the private key.
 */

import { generateVapidKeypair } from "../lib/notifications/vapid";

interface CliOptions {
  subject: string;
  vercel: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    subject: process.env.VAPID_SUBJECT ?? "mailto:[email protected]",
    vercel: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--subject") {
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) {
        throw new Error("--subject requires a value (e.g. mailto:[email protected])");
      }
      opts.subject = next;
      i += 1;
    } else if (arg.startsWith("--subject=")) {
      opts.subject = arg.slice("--subject=".length);
    } else if (arg === "--vercel") {
      opts.vercel = true;
    } else if (arg === "-h" || arg === "--help") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!/^(mailto:|https?:\/\/)/i.test(opts.subject)) {
    throw new Error(
      `--subject must be a mailto: or https URL, got: ${opts.subject}`,
    );
  }

  return opts;
}

function printHelp(): void {
  process.stdout.write(
    [
      "Generate a VAPID keypair for Web Push (ADR-0003).",
      "",
      "Usage:",
      "  npm run generate:vapid -- [options]",
      "",
      "Options:",
      "  --subject <mailto:...|https://...>   Contact subject (default: VAPID_SUBJECT env or mailto:[email protected])",
      "  --vercel                              Also print Vercel CLI commands",
      "  -h, --help                            Show this help",
      "",
      "Security:",
      "  The private key prints to stdout. Pipe to a secrets manager or paste",
      "  into Vercel env (Production / Preview / Development). NEVER commit it.",
      "",
    ].join("\n"),
  );
}

function main(): void {
  let opts: CliOptions;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    process.stderr.write(`error: ${(err as Error).message}\n\n`);
    printHelp();
    process.exit(2);
  }

  const { publicKey, privateKey } = generateVapidKeypair();
  const timestamp = new Date().toISOString();

  process.stdout.write(
    [
      "",
      `# VAPID keypair (ADR-0003) — generated ${timestamp}`,
      "# Paste into .env.local OR push to Vercel secrets. Do NOT commit the private key.",
      `VAPID_SUBJECT="${opts.subject}"`,
      `VAPID_PUBLIC_KEY="${publicKey}"`,
      `VAPID_PRIVATE_KEY="${privateKey}"`,
      `NEXT_PUBLIC_VAPID_PUBLIC_KEY="${publicKey}"`,
      "",
    ].join("\n"),
  );

  if (opts.vercel) {
    process.stdout.write(
      [
        "",
        "# --- Vercel CLI commands (one block per environment) ---",
        "# Run interactively; the CLI will prompt for the value (paste from above).",
        "",
        "# Production:",
        "vercel env add VAPID_SUBJECT production",
        "vercel env add VAPID_PUBLIC_KEY production",
        "vercel env add VAPID_PRIVATE_KEY production",
        "vercel env add NEXT_PUBLIC_VAPID_PUBLIC_KEY production",
        "",
        "# Preview:",
        "vercel env add VAPID_SUBJECT preview",
        "vercel env add VAPID_PUBLIC_KEY preview",
        "vercel env add VAPID_PRIVATE_KEY preview",
        "vercel env add NEXT_PUBLIC_VAPID_PUBLIC_KEY preview",
        "",
        "# Development:",
        "vercel env add VAPID_SUBJECT development",
        "vercel env add VAPID_PUBLIC_KEY development",
        "vercel env add VAPID_PRIVATE_KEY development",
        "vercel env add NEXT_PUBLIC_VAPID_PUBLIC_KEY development",
        "",
      ].join("\n"),
    );
  }

  process.stderr.write(
    [
      "",
      "✔ VAPID keypair generated.",
      "  Public key length:  " + publicKey.length + " chars",
      "  Private key length: " + privateKey.length + " chars",
      "  Reminder: only the public key may be exposed to the client",
      "  (NEXT_PUBLIC_VAPID_PUBLIC_KEY). Keep VAPID_PRIVATE_KEY server-only.",
      "",
    ].join("\n"),
  );
}

main();
