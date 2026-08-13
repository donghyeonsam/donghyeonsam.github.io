import ClassifiedFullPage from '../components/ClassifiedFullPage'
import { techlogsList } from '../data/techlogs'

function TechLogsListPage() {
  return (
    <ClassifiedFullPage title="TECH LOGs" desc="더 깊이 파고든 것들의 기록" items={techlogsList} basePath="techlogs" />
  )
}

export default TechLogsListPage
