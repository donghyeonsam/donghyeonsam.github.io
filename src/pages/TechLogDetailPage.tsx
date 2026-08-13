import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { techlogsList } from '../data/techlogs'
import MagazineFooter from '../components/MagazineFooter'

function TechLogDetailPage() {
  const { id } = useParams()
  const item = techlogsList.find((it) => it.id === id)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  return (
    <div className="sheet">
      <div className="vintage-tone">
        <div className="page-nav">
          <Link to="/">← 매거진으로 돌아가기</Link> · <Link to="/techlogs">TECH LOGs 전체보기</Link>
        </div>
        <div className="article-header">
          <div className="kicker">Tech Log</div>
          <h1>{item?.title ?? 'Tech Log'}</h1>
          {item?.date && <div className="dt">{item.date}</div>}
        </div>

        <div className="md-article">
          {item?.notionUrl ? (
            <p style={{ textAlign: 'center' }}>
              <a href={item.notionUrl} target="_blank" rel="noreferrer">
                Notion에서 원문 보기 ↗
              </a>
            </p>
          ) : (
            <p className="article-status">본문이 아직 준비되지 않았습니다.</p>
          )}
        </div>
      </div>
      <MagazineFooter text="Published Daily by Dongsam · Printed via GitHub Pages · All Rights Reserved" />
    </div>
  )
}

export default TechLogDetailPage
