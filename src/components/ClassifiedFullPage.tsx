import { Link } from 'react-router-dom'
import ClassifiedRows from './ClassifiedRows'
import MagazineFooter from './MagazineFooter'
import type { ClassifiedItem } from '../data/types'

interface ClassifiedFullPageProps {
  title: string
  desc: string
  items: ClassifiedItem[]
  basePath: 'til' | 'techlogs'
}

function ClassifiedFullPage({ title, desc, items, basePath }: ClassifiedFullPageProps) {
  return (
    <div className="sheet">
      <div className="vintage-tone">
        <div className="page-nav">
          <Link to="/">← 매거진으로 돌아가기</Link>
        </div>
        <div className="classified-box classified-box--full">
          <div className="cap-bar">{title}</div>
          <div className="desc">
            {desc} · 총 {items.length}건
          </div>
          <ClassifiedRows items={items} basePath={basePath} />
        </div>
      </div>
      <MagazineFooter text="Published Daily by Dongsam · Printed via GitHub Pages · All Rights Reserved" />
    </div>
  )
}

export default ClassifiedFullPage
