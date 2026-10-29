// Mengembalikan path internal yang aman untuk pengalihan setelah login/reset sandi.
// Nilai diperiksa menggunakan parser URL browser agar variasi slash/backslash
// atau karakter kontrol tidak dapat mengarahkan pengguna ke origin lain.
const BASE = 'http://internal.invalid'

export function safeRedirectPath(
  value: string | null | undefined,
  fallback = '/'
): string {
  if (!value || !value.startsWith('/')) return fallback

  try {
    const url = new URL(value, BASE)
    if (url.origin !== BASE) return fallback
    return url.pathname + url.search + url.hash
  } catch {
    return fallback
  }
}
