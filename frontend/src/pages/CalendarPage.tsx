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
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function CalendarPage() {
  const { t, locale } = useTranslation()
  const { appointments, activeSpace, fetchAppointments, addAppointment, deleteAppointment } = useStore()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date>(() => {
    var focusDate = searchParams.get('date')
    if (focusDate) {
      var d = new Date(focusDate + 'T12:00:00')
      if (!isNaN(d.getTime())) return d
    }
    return new Date()
  })
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('60')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apptDate, setApptDate] = useState(new Date().toISOString().split('T')[0])
  const [detailAppt, setDetailAppt] = useState<typeof appointments[0] | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  useEffect(() => {
    fetchAppointments(activeSpace ?? undefined)
  }, [fetchAppointments, activeSpace])

  const validDate = date && !isNaN(date.getTime()) ? date : null
  const selectedDateStr = validDate ? format(validDate, 'yyyy-MM-dd') : ''
  const dayAppointments = appointments.filter((a) => a.date === selectedDateStr)
  const appointmentDates = appointments.filter((a) => a.date).map((a) => new Date(a.date + 'T12:00:00'))

  function validate(): boolean {
    var errs: Record<string, string> = {}
    if (!title) errs.title = t.validation.required
    if (!apptDate) errs.date = t.validation.required
    if (!activeSpace) errs.space = t.validation.selectSpaceFirst
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleAdd() {
    if (!validate()) return
    try {
      await addAppointment({
        title,
        description,
        date: apptDate,
        time,
        duration: parseInt(duration),
        space: activeSpace!,
        created_by: user?.id ?? '',
      })
      setTitle('')
      setTime('')
      setDescription('')
      setErrors({})
      setDuration('60')
      setApptDate(new Date().toISOString().split('T')[0])
      setOpen(false)
    } catch (e) {
      console.error('Failed to create appointment:', e)
    }
  }

  return (
    <div className="space-y-6">
      {!activeSpace ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-lg text-muted-foreground mb-4">{t.common.selectSpace}</p>
            <Button onClick={() => navigate('/spaces')}>{t.common.createSpace}</Button>
          </CardContent>
        </Card>
      ) : (
        <>
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
                <Input id="title" value={title} onChange={(e) => { setTitle(e.target.value); setErrors({}) }} placeholder={t.calendar.appointmentTitle} />
                {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="desc">{t.calendar.descriptionField}</Label>
                <Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t.calendar.appointmentDesc} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="apptDate">{t.calendar.date}</Label>
                <Input id="apptDate" type="date" value={apptDate} onChange={(e) => setApptDate(e.target.value)} />
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
              {errors.space && <p className="text-xs text-destructive">{errors.space}</p>}
              <Button variant="outline" onClick={() => setOpen(false)}>{t.app.cancel}</Button>
              <Button onClick={handleAdd}>{t.app.save}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-[auto_1fr]">
        <Card>
          <CardContent className="p-3">
            <Calendar mode="single" selected={validDate ?? new Date()} onSelect={(d) => d && setDate(d)} locale={dateLocale(locale)} className="rounded-md"
              modifiers={{ hasAppointments: appointmentDates }}
              modifiersClassNames={{ hasAppointments: "font-bold" }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {validDate ? format(validDate, 'EEEE d MMMM yyyy', { locale: dateLocale(locale) }) : t.calendar.selectDay}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dayAppointments.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">{t.calendar.noAppointments}</p>
            ) : (
              <div className="space-y-3">
                {dayAppointments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border p-4 cursor-pointer" onClick={() => { setDetailAppt(a); setDetailOpen(true) }}>
                    <div className="grid grid-cols-[auto_1fr] gap-4 items-start">
                      {a.time ? (
                        <div className="text-center min-w-[4rem]">
                          <p className="text-lg font-bold text-primary">{a.time}</p>
                          {a.duration && <p className="text-xs text-muted-foreground">{a.duration} min</p>}
                        </div>
                      ) : (
                        <div className="min-w-[4rem]" />
                      )}
                      <div>
                        <p className="font-medium">{a.title}</p>
                        {a.description && <p className="text-sm text-muted-foreground">{a.description}</p>}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0" onClick={(ev) => { ev.stopPropagation(); deleteAppointment(a.id) }}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.calendar.title} ({appointments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">{t.calendar.noAppointments}</p>
          ) : (
            <div className="space-y-2">
              {[...appointments].sort((a, b) => a.date.localeCompare(b.date)).map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border p-3 cursor-pointer" onClick={() => { setDetailAppt(a); setDetailOpen(true) }}>
                  <div className="grid grid-cols-[auto_1fr] gap-3 items-start">
                    <div className="text-center min-w-[3rem]">
                      <p className="text-sm font-semibold">{format(new Date(a.date + 'T12:00:00'), 'd MMM', { locale: dateLocale(locale) })}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.time || ''}{a.description ? ' — ' + a.description : ''}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0" onClick={(ev) => { ev.stopPropagation(); deleteAppointment(a.id) }}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{detailAppt?.title}</DialogTitle>
            <DialogDescription>{t.calendar.appointmentDesc}</DialogDescription>
          </DialogHeader>
          {detailAppt && (
            <div className="grid gap-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.calendar.date}</span>
                <span>{detailAppt.date}</span>
              </div>
              {detailAppt.time && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.calendar.time}</span>
                  <span>{detailAppt.time}</span>
                </div>
              )}
              {detailAppt.duration && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.calendar.duration}</span>
                  <span>{detailAppt.duration} min</span>
                </div>
              )}
              {detailAppt.description && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.calendar.descriptionField}</span>
                  <span>{detailAppt.description}</span>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="destructive" onClick={() => { if (detailAppt) deleteAppointment(detailAppt.id); setDetailOpen(false) }}>
              <Trash2 className="size-4" />
              {t.app.delete}
            </Button>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>{t.app.close}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </>
      )}
    </div>
  )
}
