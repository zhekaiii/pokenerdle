import { RequestHandler } from "express";
import httpProxy from "http-proxy";

const proxy = httpProxy.createProxyServer();

export const porygonMiddleware: RequestHandler = (req, res) => {
  const realIp = (req.ip || "").replace(/^::ffff:/, "");
  proxy.web(req, res, {
    target: "https://us.i.posthog.com",
    changeOrigin: true,
    secure: true,
    xfwd: true,
    headers: {
      "X-Real-IP": realIp,
      "X-Forwarded-For": realIp,
      "X-Forwarded-Host": req.hostname,
    },
  });
};

export const staticPorygonMiddleware: RequestHandler = (req, res) => {
  const realIp = (req.ip || "").replace(/^::ffff:/, "");
  proxy.web(req, res, {
    target: "https://us-assets.i.posthog.com/static",
    changeOrigin: true,
    secure: true,
    xfwd: true,
    headers: {
      "X-Real-IP": realIp,
      "X-Forwarded-For": realIp,
      "X-Forwarded-Host": req.hostname,
    },
  });
};
