import { Link } from 'react-router-dom'

interface PlaceholderPageProps {
  heading: string
  /** When the item was synced from Notion, link straight to the source page. */
  notionUrl?: string
}

// Routing placeholder — swap in a real detail/list page later without
// touching the route wiring in App.tsx.
function PlaceholderPage({ heading, notionUrl }: PlaceholderPageProps) {
  return (
    <div className="sheet" style={{ padding: '40px 30px', textAlign: 'center' }}>
      <p style={{ fontFamily: "'Special Elite', monospace", fontSize: 12 }}>{heading}</p>
      {notionUrl && (
        <p>
          <a href={notionUrl} target="_blank" rel="noreferrer" style={{ borderBottom: '1px solid var(--ink)' }}>
            Notion에서 원문 보기 ↗
          </a>
        </p>
      )}
      <Link to="/" style={{ borderBottom: '1px solid var(--ink)' }}>
        ← 매거진으로 돌아가기
      </Link>
    </div>
  )
}

export default PlaceholderPage
