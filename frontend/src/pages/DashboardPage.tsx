import { useEffect } from 'react'
import { Wallet, Calendar, Bell, TrendingUp } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useStore } from '@/store'
import { format } from 'date-fns'
import { useTranslation } from '@/i18n'
import { dateLocale } from '@/lib/date-locale'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const { t, locale } = useTranslation()
  const { expenses, appointments, reminders, activeSpace, fetchExpenses, fetchAppointments, fetchReminders, loading } = useStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchExpenses(activeSpace ?? undefined)
    fetchAppointments(activeSpace ?? undefined)
    fetchReminders(activeSpace ?? undefined)
  }, [fetchExpenses, fetchAppointments, fetchReminders, activeSpace])

  const totalMonth = expenses
    .filter((e) => {
      const d = new Date(e.date)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((acc, e) => acc + e.amount, 0)

  const pendingReminders = reminders.filter((r) => !r.done).length
  const todayAppointments = appointments.filter((a) => {
    const d = new Date(a.date)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  })

  const recentExpenses = [...expenses].slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.dashboard.title}</h1>
        <p className="text-muted-foreground">{t.dashboard.subtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.monthExpenses}</CardTitle>
            <Wallet className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">&euro;{totalMonth.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{expenses.length} {t.dashboard.transactions}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.todayAppointments}</CardTitle>
            <Calendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              {todayAppointments.length > 0
                ? todayAppointments.map((a) => a.title).join(', ')
                : t.dashboard.noAppointments}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.pendingReminders}</CardTitle>
            <Bell className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReminders}</div>
            <p className="text-xs text-muted-foreground">{t.dashboard.toComplete}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.dashboard.recentExpenses}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">{t.app.loading}</p>
            ) : recentExpenses.length === 0 ? (
              <p className="text-muted-foreground">{t.dashboard.noExpenses}</p>
            ) : (
              <div className="space-y-3">
                {recentExpenses.map((e) => (
                  <div key={e.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{e.description}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(e.date), 'd MMM', { locale: dateLocale(locale) })}</p>
                    </div>
                    <span className={`text-sm font-semibold ${e.type === 'income' ? 'text-emerald-500' : 'text-destructive'}`}>
                      {e.type === 'income' ? '+' : '–'}&euro;{e.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.dashboard.upcomingAppointments}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">{t.app.loading}</p>
            ) : appointments.length === 0 ? (
              <p className="text-muted-foreground">{t.dashboard.noAppointments}</p>
            ) : (
              <div className="space-y-3">
                {appointments.slice(0, 5).map((a) => (
                  <div key={a.id} className="flex items-center justify-between cursor-pointer" onClick={() => navigate('/calendar?date=' + a.date)}>
                    <div>
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(a.date), 'EEEE d MMMM', { locale: dateLocale(locale) })} {a.time && `alle ${a.time}`}
                      </p>
                    </div>
                    <TrendingUp className="size-4 text-muted-foreground shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
