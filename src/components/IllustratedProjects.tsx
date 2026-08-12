import type { IllustratedProject } from '../data/types'
import AccordionGallery from './AccordionGallery/AccordionGallery'

interface IllustratedProjectsProps {
  caption: string
  projects: IllustratedProject[]
}

function IllustratedProjects({ caption, projects }: IllustratedProjectsProps) {
  return (
    <div className="illustration-block">
      <div className="cap-bar">{caption}</div>
      <AccordionGallery
        items={projects.map((project) => ({
          id: project.id,
          label: project.title,
          desc: project.desc,
          tags: project.tags,
          icon: project.icon,
          image: project.image,
        }))}
        tilt={0}
      />
    </div>
  )
}

export default IllustratedProjects
