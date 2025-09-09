import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import url from "node:url";
import type { BuildOptions } from "vite";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import eslint from "vite-plugin-eslint2";
import svgr from "vite-plugin-svgr";
import viteTsconfigPaths from "vite-tsconfig-paths";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientBuildConfig: BuildOptions = {
  outDir: "dist/client",
  copyPublicDir: true,
  emptyOutDir: true,
  sourcemap: true,
  rollupOptions: {
    input: path.resolve(__dirname, "src/entry-client.tsx"),
    output: {
      entryFileNames: "assets/[name].js",
      manualChunks: {
        "vendor-posthog": ["posthog-js", "posthog-js/react"],
      },
    },
  },
  manifest: true,
};

const ssrBuildConfig: BuildOptions = {
  ssr: true,
  outDir: "dist/server",
  ssrEmitAssets: true,
  copyPublicDir: false,
  emptyOutDir: true,
  rollupOptions: {
    input: path.resolve(__dirname, "src/entry-server.tsx"),
  },
};

// https://vitejs.dev/config/
export default defineConfig((configEnv) => ({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    viteTsconfigPaths(),
    eslint(),
    checker({
      typescript: true,
    }),
    tailwindcss(),
    svgr(),
  ],
  build: configEnv.isSsrBuild ? ssrBuildConfig : clientBuildConfig,
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },
  ssr: {
    noExternal: ["posthog-js"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
