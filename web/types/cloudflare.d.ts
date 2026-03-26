declare module "@cloudflare/vite-plugin" {
  import type { PluginOption } from "vite";

  type CloudflarePluginOptions = {
    viteEnvironment?: {
      name?: string;
      childEnvironments?: string[];
    };
  };

  export function cloudflare(options?: CloudflarePluginOptions): PluginOption;
}

interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}
