import { app } from "./app";

export interface Env {
  DB: D1Database;
  SESSION_SECRET: string;
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // مسارات الواجهة البرمجية تُعالَج بواسطة Hono
    if (url.pathname.startsWith("/api/")) {
      return app.fetch(request, env, ctx);
    }

    // خدمة الملفات الثابتة، مع رجوع تطبيق الصفحة الواحدة (SPA) إلى index.html
    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status === 404 && request.method === "GET") {
      return env.ASSETS.fetch(new Request(new URL("/index.html", url.origin), request));
    }
    return assetResponse;
  },
};
