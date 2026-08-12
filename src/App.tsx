import { Routes, Route, useParams } from 'react-router-dom'
import MagazinePage from './pages/MagazinePage'
import PlaceholderPage from './pages/PlaceholderPage'

function TilDetail() {
  const { id } = useParams()
  return <PlaceholderPage heading={`TIL #${id} (준비 중)`} />
}

function TechLogDetail() {
  const { id } = useParams()
  return <PlaceholderPage heading={`Tech Log #${id} (준비 중)`} />
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
