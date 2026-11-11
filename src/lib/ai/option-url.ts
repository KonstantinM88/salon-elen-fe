/** Only known local destinations may be opened by assistant option buttons. */
export function safeAssistantOptionUrl(value: string, origin = 'https://permanent-halle.de'): string | undefined {
  if (!value || /[\\\u0000-\u0020\u007f]/.test(value)) return undefined;
  try {
    const url = new URL(value, origin);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return undefined;
    if (url.origin !== origin && url.origin !== 'https://permanent-halle.de') return undefined;
    if (!url.pathname.startsWith('/booking/') &&
      !['/gutschein', '/fusspflege-halle'].includes(url.pathname)) return undefined;
    return url.pathname + url.search + url.hash;
  } catch {
    return undefined;
  }
}
