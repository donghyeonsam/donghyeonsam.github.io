import { Link } from 'react-router-dom'
import type { ClassifiedItem } from '../data/types'

interface ClassifiedListProps {
  id: string
  title: string
  desc: string
  items: ClassifiedItem[]
  basePath: 'til' | 'techlogs'
  seeAllHref: string
}

function ClassifiedList({ id, title, desc, items, basePath, seeAllHref }: ClassifiedListProps) {
  return (
    <div className="classified-box" id={id}>
      <div className="cap-bar">{title}</div>
      <div className="desc">{desc}</div>
      <ul className="classified-list">
        {items.map((item, index) => (
          <li key={item.id}>
            <Link to={`/${basePath}/${item.id}`}>
              <span className="idx">{String(index + 1).padStart(2, '0')}</span>
              <span>{item.title}</span>
              <span className="dt">{item.date}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="see-all-row">
        <Link to={seeAllHref}>전체보기 →</Link>
      </div>
    </div>
  )
}

export default ClassifiedList
