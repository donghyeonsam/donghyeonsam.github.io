import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { tilList } from '../data/til'
import { hasTilArticle, loadTilArticle, type TilArticle } from '../data/tilContent'
import MagazineFooter from '../components/MagazineFooter'

function TilDetailPage() {
  const { id } = useParams()
  const item = tilList.find((it) => it.id === id)
  const [article, setArticle] = useState<TilArticle | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setArticle(null)
    window.scrollTo(0, 0)

    if (!id || !hasTilArticle(id)) {
      setStatus('missing')
      return
    }

    loadTilArticle(id).then((result) => {
      if (cancelled) return
      if (result) {
        setArticle(result)
        setStatus('ready')
      } else {
        setStatus('missing')
      }
    })

    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <div className="sheet">
      <div className="vintage-tone">
        <div className="page-nav">
          <Link to="/">← 매거진으로 돌아가기</Link> · <Link to="/til">TIL 전체보기</Link>
        </div>
        <div className="article-header">
          <div className="kicker">Today I Learned</div>
          <h1>{item?.title ?? 'TIL'}</h1>
          {item?.date && <div className="dt">{item.date}</div>}
        </div>

        {status === 'loading' && <p className="article-status">불러오는 중…</p>}
        {status === 'missing' && <p className="article-status">이 글의 원문을 찾을 수 없습니다.</p>}
        {status === 'ready' && article && (
          <div className="md-article" dangerouslySetInnerHTML={{ __html: article.html }} />
        )}
      </div>
      <MagazineFooter text="Published Daily by Dongsam · Printed via GitHub Pages · All Rights Reserved" />
    </div>
  )
}

export default TilDetailPage
