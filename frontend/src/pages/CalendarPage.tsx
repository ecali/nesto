import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { useStore } from '@/store'
import { format } from 'date-fns'
import { useTranslation } from '@/i18n'
import { dateLocale } from '@/lib/date-locale'
import { useAuth } from '@/hooks/use-auth'

export default function CalendarPage() {
  const { t, locale } = useTranslation()
  const { appointments, fetchAppointments, addAppointment, deleteAppointment } = useStore()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date>(new Date())
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('60')

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const selectedDateStr = date ? format(date, 'yyyy-MM-dd') : ''
  const dayAppointments = appointments.filter((a) => a.date === selectedDateStr)

  async function handleAdd() {
    if (!title || !date) return
    await addAppointment({
      title,
      description,
      date: selectedDateStr,
      time,
      duration: parseInt(duration),
      created_by: user?.id ?? '',
    })
    setTitle('')
    setTime('')
    setDescription('')
    setDuration('60')
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.calendar.title}</h1>
          <p className="text-muted-foreground">{t.calendar.subtitle}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" />
              {t.calendar.newAppointment}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.calendar.newAppointment}</DialogTitle>
              <DialogDescription>{t.calendar.addAppointment}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">{t.calendar.titleField}</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.calendar.appointmentTitle} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="desc">{t.calendar.descriptionField}</Label>
                <Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t.calendar.appointmentDesc} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="time">{t.calendar.time}</Label>
                  <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration">{t.calendar.duration}</Label>
                  <Input id="duration" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>{t.app.cancel}</Button>
              <Button onClick={handleAdd}>{t.app.save}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-[auto_1fr]">
        <Card>
          <CardContent className="p-3">
            <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} locale={dateLocale(locale)} className="rounded-md" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {date ? format(date, 'EEEE d MMMM yyyy', { locale: dateLocale(locale) }) : t.calendar.selectDay}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dayAppointments.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">{t.calendar.noAppointments}</p>
            ) : (
              <div className="space-y-3">
                {dayAppointments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-start gap-4">
                      {a.time && (
                        <div className="text-center">
                          <p className="text-lg font-bold text-primary">{a.time}</p>
                          <p className="text-xs text-muted-foreground">{a.duration} min</p>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{a.title}</p>
                        {a.description && <p className="text-sm text-muted-foreground">{a.description}</p>}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => deleteAppointment(a.id)}>
                      <Trash2 className="size-4" />
                    </Button>
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
