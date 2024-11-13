import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import UnoCSS from "unocss/astro";

export default defineConfig({
  // used to generate images
  // site:
  site: "https://memoryview.in",
  // process.env.VERCEL_ENV === "production"
  //   ? "https://memoryview.in/"
  //   : process.env.VERCEL_URL
  //     ? `https://${process.env.VERCEL_URL}/`
  //     : // : "https://localhost:3000/",
  //       "https://memoryview.in/",
  trailingSlash: "ignore",
  integrations: [sitemap(), UnoCSS({ injectReset: true })],
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
});
