export default function resolveHref(item, useTailscale) {
  return useTailscale && item.tailscaleHref ? item.tailscaleHref : item.href;
}
