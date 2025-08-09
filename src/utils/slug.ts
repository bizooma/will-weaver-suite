
export function generateSlug() {
  // Compact unguessable slug like wd-3h9k8n2q
  const rand = Math.random().toString(36).slice(2, 10);
  return `wd-${rand}`;
}
