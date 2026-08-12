import type { ProjectBrief } from '../data/types'

interface ProjectBriefsProps {
  briefs: ProjectBrief[]
}

function ProjectBriefs({ briefs }: ProjectBriefsProps) {
  return (
    <div className="columns">
      <h3>오늘의 단신 — 진행 프로젝트 헤드라인</h3>
      <ul className="brief-list">
        {briefs.map((brief) => (
          <li key={brief.id}>
            <span className="mark">▶</span>
            <span className="txt">{brief.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ProjectBriefs
