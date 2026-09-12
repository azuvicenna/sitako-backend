import { Request, Response, NextFunction } from "express";
import client from "prom-client";

// Registry default, plus default Node.js metrics (CPU, memory, event loop, dsb)
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Contoh custom metric: durasi & jumlah HTTP request
const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Durasi HTTP request dalam detik",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

const httpRequestTotal = new client.Counter({
  name: "http_requests_total",
  help: "Jumlah total HTTP request",
  labelNames: ["method", "route", "status_code"],
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);

// Middleware: pasang di app.use() paling atas, sebelum routes lain
export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const end = httpRequestDuration.startTimer();
  res.on("finish", () => {
    // req.route?.path lebih stabil daripada req.path (menghindari cardinality tinggi dari path dinamis)
    const route = req.route?.path || req.path;
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    };
    end(labels);
    httpRequestTotal.inc(labels);
  });
  next();
}

// Handler untuk endpoint GET /metrics
export async function metricsHandler(_req: Request, res: Response) {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
}
