import { createServer as createViteServer } from "vite";
import { Express } from "express";
import express from "express";
import fs from "fs";
import path from "path";

export async function setupVite(app: Express) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });

  app.use(vite.ssrFixStacktrace);
  app.use(vite.middlewares);
}

export function serveStatic(app: Express) {
  const distPath = path.resolve("dist/public");
  const indexPath = path.join(distPath, "index.html");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Static files not found at ${distPath}. Run 'npm run build' first.`
    );
  }

  app.use(express.static(distPath));

  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/")) {
      res.status(404).json({ error: "API endpoint not found" });
    } else {
      res.sendFile(indexPath);
    }
  });
}
