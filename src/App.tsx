import { Routes, Route, useParams } from 'react-router-dom'
import MagazinePage from './pages/MagazinePage'
import PlaceholderPage from './pages/PlaceholderPage'
import { tilList } from './data/til'
import { techlogsList } from './data/techlogs'

function TilDetail() {
  const { id } = useParams()
  const item = tilList.find((it) => it.id === id)
  return <PlaceholderPage heading={`TIL: ${item?.title ?? id} (준비 중)`} notionUrl={item?.notionUrl} />
}

function TechLogDetail() {
  const { id } = useParams()
  const item = techlogsList.find((it) => it.id === id)
  return <PlaceholderPage heading={`Tech Log: ${item?.title ?? id} (준비 중)`} notionUrl={item?.notionUrl} />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<MagazinePage />} />
      <Route path="/til" element={<PlaceholderPage heading="TIL 전체 목록 (준비 중)" />} />
      <Route path="/til/:id" element={<TilDetail />} />
      <Route path="/techlogs" element={<PlaceholderPage heading="Tech Logs 전체 목록 (준비 중)" />} />
      <Route path="/techlogs/:id" element={<TechLogDetail />} />
    </Routes>
  )
}

export default App
