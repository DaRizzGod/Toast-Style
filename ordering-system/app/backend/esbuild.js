import { build } from "esbuild";

await build({
  entryPoints: [
    "src/handlers/getMenu.ts",
    "src/handlers/stripeWebhook.ts",
    "src/handlers/createCheckout.ts",
    "src/handlers/orderStatus.ts",
    "src/ai/incidentTriage.ts"
  ],
  bundle: true,
  platform: "node",
  target: "node20",
  outdir: "dist",
  format: "cjs",
  sourcemap: true,
  external: []
});
