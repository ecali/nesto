import { useEffect } from 'react'
import { Wallet, Calendar, Bell, TrendingUp } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useStore } from '@/store'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

export default function DashboardPage() {
  const { expenses, appointments, reminders, fetchExpenses, fetchAppointments, fetchReminders, loading } = useStore()

  useEffect(() => {
    fetchExpenses()
    fetchAppointments()
    fetchReminders()
  }, [fetchExpenses, fetchAppointments, fetchReminders])

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
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Benvenuto su Nesto</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Spese del mese</CardTitle>
            <Wallet className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">&euro;{totalMonth.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{expenses.length} transazioni</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Appuntamenti oggi</CardTitle>
            <Calendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              {todayAppointments.length > 0
                ? todayAppointments.map((a) => a.title).join(', ')
                : 'Nessun appuntamento'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Promemoria in sospeso</CardTitle>
            <Bell className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReminders}</div>
            <p className="text-xs text-muted-foreground">da completare</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Spese recenti</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Caricamento...</p>
            ) : recentExpenses.length === 0 ? (
              <p className="text-muted-foreground">Nessuna spesa registrata</p>
            ) : (
              <div className="space-y-3">
                {recentExpenses.map((e) => (
                  <div key={e.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{e.description}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(e.date), 'd MMM', { locale: it })}</p>
                    </div>
                    <span className="text-sm font-semibold text-destructive">&euro;{e.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Prossimi appuntamenti</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Caricamento...</p>
            ) : appointments.length === 0 ? (
              <p className="text-muted-foreground">Nessun appuntamento</p>
            ) : (
              <div className="space-y-3">
                {appointments.slice(0, 5).map((a) => (
                  <div key={a.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(a.date), 'EEEE d MMMM', { locale: it })} {a.time && `alle ${a.time}`}
                      </p>
                    </div>
                    <TrendingUp className="size-4 text-muted-foreground" />
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
