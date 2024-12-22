import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import UnoCSS from "unocss/astro";

export default defineConfig({
  site: process.env.VERCEL_ENV === "production"
    ? "https://traceback.in/"
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/`
      : "https://traceback.in/",
  trailingSlash: "ignore",
  integrations: [sitemap(), UnoCSS({ injectReset: true })],
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
});
