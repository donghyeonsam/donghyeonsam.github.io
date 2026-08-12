import { useEffect, useState } from 'react'

const GITHUB_USERNAME = 'donghyeonsam'
const CACHE_KEY = 'gh-commit-count'
const CACHE_TTL_MS = 60 * 60 * 1000 // 1h — GitHub's unauthenticated search API is rate-limited

function readCache(): number | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { value, ts } = JSON.parse(raw) as { value: number; ts: number }
    return Date.now() - ts < CACHE_TTL_MS ? value : null
  } catch {
    return null
  }
}

function writeCache(value: number) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ value, ts: Date.now() }))
  } catch {
    // storage unavailable (private browsing, quota) — animation just won't be cached
  }
}

/** Real commit count for the GitHub account, via the public search API
 * (`search/commits?q=author:`). Returns null while unresolved so callers
 * can show a loading state instead of a stale/placeholder number. */
export function useGithubCommitCount(): number | null {
  const [count, setCount] = useState<number | null>(readCache)

  useEffect(() => {
    let cancelled = false

    fetch(`https://api.github.com/search/commits?q=author:${GITHUB_USERNAME}`, {
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: { total_count?: number }) => {
        if (cancelled || typeof data.total_count !== 'number') return
        setCount(data.total_count)
        writeCache(data.total_count)
      })
      .catch(() => {
        // keep whatever we already have (cache or null) — no UI error needed
      })

    return () => {
      cancelled = true
    }
  }, [])

  return count
}
