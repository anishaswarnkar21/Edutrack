import app from "./src/app.js";
import config from "./src/config/config.js";
import { connectDB } from "./src/config/db.js";
import axios from "axios";
import net from "net";
import { URL } from "url";

async function waitForMlModelReady({ baseUrl, timeoutMs = 30000, intervalMs = 2000 }) {
  const deadline = Date.now() + timeoutMs;
  const healthUrl = `${baseUrl.replace(/\/+$/, "")}/health`;
  // Parse baseUrl for TCP-level diagnostics
  let parsedUrl;
  try {
    parsedUrl = new URL(baseUrl);
  } catch (e) {
    parsedUrl = null;
  }
  while (Date.now() < deadline) {
    // If we can, try a raw TCP connect first to give faster, clearer failures
    if (parsedUrl) {
      const requestedHost = parsedUrl.hostname || "127.0.0.1";
      const portToTest = parsedUrl.port
        ? Number(parsedUrl.port)
        : parsedUrl.protocol === "https:" ? 443 : 80;

      // If hostname is 'localhost' try common fallbacks (IPv4/IPv6) to avoid
      // resolution issues on some platforms where 'localhost' prefers IPv6.
      const hostsToTry = [requestedHost];
      if (requestedHost === "localhost") {
        hostsToTry.push("127.0.0.1", "::1");
      }

      let tcpOk = false;
      for (const hostToTest of hostsToTry) {
        // eslint-disable-next-line no-await-in-loop
        const ok = await new Promise((resolve) => {
          const socket = net.createConnection({ host: hostToTest, port: portToTest }, () => {
            socket.end();
            resolve(true);
          });
          socket.setTimeout(1500, () => {
            try { socket.destroy(); } catch {};
            resolve(false);
          });
          socket.on("error", () => resolve(false));
        });
        if (ok) {
          console.log(`[server] TCP connect to ${hostToTest}:${portToTest} ok`);
          tcpOk = true;
          break;
        } else {
          console.log(`[server] TCP connect to ${hostToTest}:${portToTest} failed`);
        }
      }
      if (!tcpOk) {
        console.log(`[server] service likely unreachable at ${requestedHost}:${portToTest}`);
      }
    }
    try {
      const res = await axios.get(healthUrl, { timeout: 5000 });
      const data = res.data || {};
      if (data.modelLoaded === true) {
        console.log(`[server] ML service ready (model: ${data.modelSource})`);
        return true;
      }
      console.log("[server] ML service reachable but model not yet loaded, retrying...", data);
    } catch (err) {
      // Provide richer diagnostics so logs aren't empty for unexpected errors
      try {
        if (err.response) {
          console.log(
            `[server] ML health HTTP ${err.response.status}:`,
            err.response.data || err.response.statusText
          );
        } else if (err.request) {
          console.log("[server] ML health check: no response received (request made)");
        } else {
          console.log("[server] ML health check error:", err.message);
        }
      } catch (logErr) {
        console.log("[server] ML health check unknown error", err && err.toString());
      }
      // log stack if available for deeper inspection
      if (err && err.stack) console.debug(err.stack);
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  console.warn("[server] ML service did not report a loaded model within timeout");
  return false;
}

async function main() {
  await connectDB();
  app.listen(config.port, async () => {
    console.log(`[server] EduTrack backend listening on port ${config.port}`);
    const mlReady = await waitForMlModelReady({ baseUrl: config.mlService.baseUrl });
    if (!mlReady) {
      console.warn("[server] Proceeding with backend startup even though ML model isn't reported ready.");
    }
  });
}

main().catch((err) => {
  console.error("[server] Failed to start:", err);
  process.exit(1);
});
