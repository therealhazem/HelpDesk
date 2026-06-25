import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { DashboardRouter } from './pages/DashboardPages';
import { TicketsPage } from './pages/TicketsPage';
import { NewTicketPage } from './pages/NewTicketPage';
import { BoardPage } from './pages/BoardPage';
import { BacklogPage } from './pages/BacklogPage';
import { SprintPage } from './pages/SprintPage';
import { GovernancePage } from './pages/GovernancePage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardRouter />} />
            <Route path="tickets" element={<TicketsPage />} />
            <Route path="tickets/new" element={<NewTicketPage />} />
            <Route path="board" element={<BoardPage />} />
            <Route path="backlog" element={<BacklogPage />} />
            <Route path="sprint" element={<SprintPage />} />
            <Route path="governance" element={<GovernancePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
