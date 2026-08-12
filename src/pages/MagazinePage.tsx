import MastheadBar from '../components/MastheadBar'
import BylineNav from '../components/BylineNav'
import Headline from '../components/Headline'
import ProjectBriefs from '../components/ProjectBriefs'
import IllustratedProjects from '../components/IllustratedProjects'
import ClassifiedList from '../components/ClassifiedList'
import MagazineFooter from '../components/MagazineFooter'
import { statCaptions } from '../data/stats'
import { projectBriefs } from '../data/projects'
import { illustratedProjects } from '../data/illustrations'
import { tilList } from '../data/til'
import { techlogsList } from '../data/techlogs'
import { useGithubCommitCount } from '../hooks/useGithubCommitCount'
import type { StatBox } from '../data/types'

function MagazinePage() {
  const commitCount = useGithubCommitCount()
  const stats: [StatBox, StatBox] = [
    { id: 'commits', num: commitCount, cap: statCaptions.commits },
    { id: 'til-techlogs', num: tilList.length + techlogsList.length, cap: statCaptions.tilTechlogs },
  ]

  return (
    <div className="sheet">
      <div className="vintage-tone">
        <MastheadBar stats={stats} issueNo="제 1호" city="Seoul, Korea" />
        <BylineNav publisher="발행인 Dongsam" />
        <Headline id="projects" kicker="FEATURE STORY" lines={["DONGSAM's Magazine 창간", '셰프에서 개발자로-']} />
        <ProjectBriefs briefs={projectBriefs} />
      </div>

      {/* Left out of .vintage-tone on purpose: filter rasterizes its whole
          subtree, so real project logos inside would get washed out along
          with everything else. Panels keep the paper/ink chrome regardless. */}
      <IllustratedProjects caption="THE PROJECTS, ILLUSTRATED" projects={illustratedProjects} />

      <div className="vintage-tone">
        <div className="classifieds">
          <ClassifiedList
            id="til"
            title="TIL List"
            desc="Today I Learned"
            items={tilList}
            basePath="til"
            seeAllHref="/til"
          />
          <ClassifiedList
            id="techlogs"
            title="TECH LOGS List"
            desc="더 깊이 파고든 것들의 기록"
            items={techlogsList}
            basePath="techlogs"
            seeAllHref="/techlogs"
          />
        </div>

        <MagazineFooter text="Published Daily by Dongsam · Printed via GitHub Pages · All Rights Reserved" />
      </div>
    </div>
  )
}

export default MagazinePage
