// Mengembalikan path internal yang aman untuk pengalihan setelah login/reset sandi.
// Tolak backslash dan karakter kontrol sebelum memeriksa origin hasil parsing URL.
const BASE = 'http://internal.invalid'

export function safeRedirectPath(
  value: string | null | undefined,
  fallback = '/'
): string {
  if (!value || !value.startsWith('/')) return fallback
  if (/[\\\\\\u0000-\\u001F\\u007F]/.test(value)) return fallback

  try {
    const url = new URL(value, BASE)
    if (url.origin !== BASE) return fallback
    return url.pathname + url.search + url.hash
  } catch {
    return fallback
  }
}
