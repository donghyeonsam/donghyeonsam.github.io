import { Link } from 'react-router-dom'
import ClassifiedRows from './ClassifiedRows'
import type { ClassifiedItem } from '../data/types'

interface ClassifiedListProps {
  id: string
  title: string
  desc: string
  items: ClassifiedItem[]
  basePath: 'til' | 'techlogs'
  seeAllHref: string
  maxItems?: number
}

function ClassifiedList({ id, title, desc, items, basePath, seeAllHref, maxItems = 5 }: ClassifiedListProps) {
  // items is already newest-first, so this is simply "most recent N".
  const visibleItems = items.slice(0, maxItems)

  return (
    <div className="classified-box" id={id}>
      <div className="cap-bar">{title}</div>
      <div className="desc">{desc}</div>
      <ClassifiedRows items={visibleItems} basePath={basePath} />
      <div className="see-all-row">
        <Link to={seeAllHref}>전체보기 →</Link>
      </div>
    </div>
  )
}

export default ClassifiedList
