import ClassifiedFullPage from '../components/ClassifiedFullPage'
import { tilList } from '../data/til'

function TilListPage() {
  return <ClassifiedFullPage title="TIL List" desc="Today I Learned" items={tilList} basePath="til" />
}

export default TilListPage
