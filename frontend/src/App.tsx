import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { RequireAuth } from '@/components/require-auth'
import Layout from '@/components/layout'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import ExpensesPage from '@/pages/ExpensesPage'
import CalendarPage from '@/pages/CalendarPage'
import RemindersPage from '@/pages/RemindersPage'

export default function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <RequireAuth>
                  <Layout />
                </RequireAuth>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/reminders" element={<RemindersPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <Toaster />
        </ToastProvider>
      </TooltipProvider>
    </BrowserRouter>
  )
}
