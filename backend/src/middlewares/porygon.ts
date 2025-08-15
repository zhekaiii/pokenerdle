import { RequestHandler } from "express";
import httpProxy from "http-proxy";
import { POSTHOG_HOST, POSTHOG_STATIC_HOST } from "../constants/posthog.js";

const proxy = httpProxy.createProxyServer();

export const porygonMiddleware: RequestHandler = (req, res) => {
  const realIp = (req.ip || "").replace(/^::ffff:/, "");
  proxy.web(req, res, {
    target: POSTHOG_HOST,
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
    target: POSTHOG_STATIC_HOST,
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
