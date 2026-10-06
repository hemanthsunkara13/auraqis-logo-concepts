import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("./public/", import.meta.url));
const port = Number(process.env.PORT) || 3000;

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".txt": "text/plain; charset=utf-8",
};

// Internal review page: never indexed, never framed, never cached by shared proxies.
const headers = {
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Cache-Control": "private, max-age=300",
};

const send = (res, status, body, extra = {}) => {
  res.writeHead(status, { ...headers, "Content-Type": "text/plain; charset=utf-8", ...extra });
  res.end(body);
};

createServer(async (req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, "Method Not Allowed", { Allow: "GET, HEAD" });

  let path;
  try {
    path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  } catch {
    return send(res, 400, "Bad Request");
  }
  if (path.endsWith("/")) path += "index.html";

  const file = normalize(join(root, path));
  if (file !== root.slice(0, -1) && !file.startsWith(root)) return send(res, 403, "Forbidden");

  try {
    const info = await stat(file);
    if (!info.isFile()) throw new Error("not a file");
    res.writeHead(200, { ...headers, "Content-Type": types[extname(file).toLowerCase()] ?? "application/octet-stream", "Content-Length": info.size });
    if (req.method === "HEAD") return res.end();
    createReadStream(file).pipe(res);
  } catch {
    send(res, 404, "Not found");
  }
}).listen(port, () => console.log(`Listening on port ${port}`));
