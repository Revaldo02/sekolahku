// Mengembalikan path internal yang aman untuk pengalihan setelah login/reset sandi.
// Tolak backslash dan karakter kontrol sebelum memeriksa origin hasil parsing URL.
const BASE = 'http://internal.invalid'

export function safeRedirectPath(
  value: string | null | undefined,
  fallback = '/'
): string {
  if (!value || !value.startsWith('/')) return fallback
  if (value.includes('\\') || Array.from(value).some((char) => {
    const code = char.charCodeAt(0)
    return code < 32 || code === 127
  })) return fallback

  try {
    const url = new URL(value, BASE)
    if (url.origin !== BASE) return fallback
    return url.pathname + url.search + url.hash
  } catch {
    return fallback
  }
}
