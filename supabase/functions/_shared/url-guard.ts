// SSRF protection for edge functions that fetch user-supplied URLs.
//
// Rejects non-http(s) schemes and blocks any URL whose host resolves to a
// private / loopback / link-local / cloud-metadata IP. Call assertSafeUrl
// before every outbound fetch of a caller-controlled URL.

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "ip6-localhost",
  "ip6-loopback",
  "metadata.google.internal",
  "metadata",
]);

/** True if a numeric IPv4 address falls inside a private / reserved range. */
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map((n) => parseInt(n, 10));
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n) || n < 0 || n > 255)) {
    return true; // malformed -> treat as unsafe
  }
  const [a, b] = parts;
  if (a === 10) return true;                          // 10.0.0.0/8
  if (a === 127) return true;                         // loopback
  if (a === 0) return true;                           // 0.0.0.0/8
  if (a === 169 && b === 254) return true;            // link-local (AWS metadata)
  if (a === 172 && b >= 16 && b <= 31) return true;   // 172.16.0.0/12
  if (a === 192 && b === 168) return true;            // 192.168.0.0/16
  if (a === 100 && b >= 64 && b <= 127) return true;  // CGNAT 100.64.0.0/10
  if (a >= 224) return true;                          // multicast / reserved
  return false;
}

/** True for IPv6 loopback, link-local, unique-local, or embedded-v4-private. */
function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::1" || lower === "::") return true;
  if (lower.startsWith("fe80:") || lower.startsWith("fe80::")) return true; // link-local
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true;         // ULA fc00::/7
  if (lower.startsWith("::ffff:")) {
    // IPv4-mapped IPv6 — check the embedded v4
    const v4 = lower.slice("::ffff:".length);
    if (/^\d+\.\d+\.\d+\.\d+$/.test(v4)) return isPrivateIPv4(v4);
  }
  return false;
}

/**
 * Throws if the URL is unsafe to fetch server-side. Validates scheme, host
 * shape, hostname denylist, and resolves DNS to check for private ranges.
 */
export async function assertSafeUrl(input: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    throw new Error("Invalid URL");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`Blocked scheme: ${parsed.protocol}`);
  }
  const host = parsed.hostname.toLowerCase();
  if (!host) throw new Error("URL has no host");
  if (BLOCKED_HOSTNAMES.has(host)) throw new Error(`Blocked host: ${host}`);
  if (host.endsWith(".localhost") || host.endsWith(".internal")) {
    throw new Error(`Blocked host: ${host}`);
  }

  // If the host is already a literal IP, check it directly.
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    if (isPrivateIPv4(host)) throw new Error(`Blocked private IPv4: ${host}`);
    return parsed;
  }
  if (host.includes(":")) {
    if (isPrivateIPv6(host)) throw new Error(`Blocked private IPv6: ${host}`);
    return parsed;
  }

  // Resolve DNS and reject any private answer. Query A and AAAA in
  // parallel; treat resolution failure as unsafe.
  const [aRes, aaaaRes] = await Promise.allSettled([
    Deno.resolveDns(host, "A"),
    Deno.resolveDns(host, "AAAA"),
  ]);
  const ips: string[] = [];
  if (aRes.status === "fulfilled") ips.push(...aRes.value);
  if (aaaaRes.status === "fulfilled") ips.push(...aaaaRes.value);
  if (ips.length === 0) throw new Error(`Could not resolve host: ${host}`);

  for (const ip of ips) {
    if (ip.includes(":")) {
      if (isPrivateIPv6(ip)) throw new Error(`Blocked private IPv6 for ${host}: ${ip}`);
    } else {
      if (isPrivateIPv4(ip)) throw new Error(`Blocked private IPv4 for ${host}: ${ip}`);
    }
  }
  return parsed;
}
