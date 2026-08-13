import { Routes, Route } from 'react-router-dom'
import MagazinePage from './pages/MagazinePage'
import TilListPage from './pages/TilListPage'
import TilDetailPage from './pages/TilDetailPage'
import TechLogsListPage from './pages/TechLogsListPage'
import TechLogDetailPage from './pages/TechLogDetailPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MagazinePage />} />
      <Route path="/til" element={<TilListPage />} />
      <Route path="/til/:id" element={<TilDetailPage />} />
      <Route path="/techlogs" element={<TechLogsListPage />} />
      <Route path="/techlogs/:id" element={<TechLogDetailPage />} />
    </Routes>
  )
}

export default App
