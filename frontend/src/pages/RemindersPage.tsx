import { useEffect, useState } from 'react'
import { Plus, Trash2, Sparkles, Repeat, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card'
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs'
import { useStore } from '@/store'
import { format } from 'date-fns'
import { useTranslation } from '@/i18n'
import { dateLocale } from '@/lib/date-locale'
import { useAuth } from '@/hooks/use-auth'
import { useNavigate } from 'react-router-dom'
import type { ReminderType } from '@/types'

const typeIcons = {
  'todo': Sparkles,
  'recurring': Repeat,
  'one-time': Clock,
}

export default function RemindersPage() {
  const { t, locale } = useTranslation()
  const { reminders, activeSpace, fetchReminders, addReminder, toggleReminder, deleteReminder } = useStore()
  const { user } = useAuth()
  const navigate = useNavigate()

  const typeLabels: Record<string, string> = {
    'todo': t.reminders.todo,
    'recurring': t.reminders.recurring,
    'one-time': t.reminders.oneTime,
  }
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<ReminderType>('todo')
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0])
  const [recurringRule, setRecurringRule] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchReminders(activeSpace ?? undefined)
  }, [fetchReminders, activeSpace])

  const activeReminders = reminders.filter((r) => !r.done)
  const doneReminders = reminders.filter((r) => r.done)

  function validate(): boolean {
    var errs: Record<string, string> = {}
    if (!title) errs.title = t.validation.required
    if (!activeSpace) errs.space = t.validation.selectSpaceFirst
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleAdd() {
    if (!validate()) return
    await addReminder({
      title,
      description,
      type,
      due_date: dueDate,
      recurring_rule: type === 'recurring' ? recurringRule : '',
      space: activeSpace!,
      done: false,
      created_by: user?.id ?? '',
    })
    setTitle('')
    setDescription('')
    setErrors({})
    setType('todo')
    setDueDate(new Date().toISOString().split('T')[0])
    setRecurringRule('')
    setOpen(false)
  }

  function renderList(items: typeof reminders, showDoneToggle = true) {
    if (items.length === 0) {
      return <p className="text-muted-foreground py-8 text-center">{t.reminders.noReminders}</p>
    }
    return (
      <div className="space-y-2">
        {items.map((r) => {
          const Icon = typeIcons[r.type]
          return (
            <div key={r.id} className="flex items-center gap-4 rounded-lg border p-4">
              {showDoneToggle && (
                <Checkbox
                  checked={r.done}
                  onCheckedChange={(checked) => toggleReminder(r.id, checked === true)}
                />
              )}
              <Icon className="size-5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${r.done ? 'line-through text-muted-foreground' : ''}`}>
                  {r.title}
                </p>
                {r.description && (
                  <p className="text-sm text-muted-foreground truncate">{r.description}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {typeLabels[r.type]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(r.due_date), 'd MMM yyyy', { locale: dateLocale(locale) })}
                  </span>
                  {r.recurring_rule && (
                    <span className="text-xs text-muted-foreground">({r.recurring_rule})</span>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => deleteReminder(r.id)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          )
        })}
      </div>
    )
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
          <h1 className="text-2xl font-bold">{t.reminders.title}</h1>
          <p className="text-muted-foreground">{t.reminders.subtitle}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" />
              {t.reminders.newReminder}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.reminders.newReminder}</DialogTitle>
              <DialogDescription>{t.reminders.addReminder}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">{t.reminders.titleField}</Label>
                <Input id="title" value={title} onChange={(e) => { setTitle(e.target.value); setErrors({}) }} placeholder={t.reminders.titleField} />
                {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="desc">{t.reminders.descriptionField}</Label>
                <Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t.reminders.descriptionField + ' (' + t.reminders.optional + ')'} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">{t.reminders.type}</Label>
                <Select value={type} onValueChange={(v) => setType(v as ReminderType)}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder={t.reminders.type} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">{t.reminders.todo}</SelectItem>
                    <SelectItem value="recurring">{t.reminders.recurring}</SelectItem>
                    <SelectItem value="one-time">{t.reminders.oneTime}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">{t.reminders.dueDate}</Label>
                <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              {type === 'recurring' && (
                <div className="grid gap-2">
                  <Label htmlFor="rule">{t.reminders.recurringRule}</Label>
                  <Select value={recurringRule} onValueChange={setRecurringRule}>
                    <SelectTrigger id="rule">
                      <SelectValue placeholder={t.reminders.recurringRule} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">{t.reminders.daily}</SelectItem>
                      <SelectItem value="weekly">{t.reminders.weekly}</SelectItem>
                      <SelectItem value="biweekly">{t.reminders.biweekly}</SelectItem>
                      <SelectItem value="monthly">{t.reminders.monthly}</SelectItem>
                      <SelectItem value="quarterly">{t.reminders.quarterly}</SelectItem>
                      <SelectItem value="yearly">{t.reminders.yearly}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              {errors.space && <p className="text-xs text-destructive">{errors.space}</p>}
              <Button variant="outline" onClick={() => setOpen(false)}>{t.app.cancel}</Button>
              <Button onClick={handleAdd}>{t.app.save}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">{t.reminders.active} ({activeReminders.length})</TabsTrigger>
          <TabsTrigger value="done">{t.reminders.completed} ({doneReminders.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.reminders.activeReminders}</CardTitle>
            </CardHeader>
            <CardContent>{renderList(activeReminders)}</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="done" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.reminders.completedReminders}</CardTitle>
            </CardHeader>
            <CardContent>{renderList(doneReminders)}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </>
      )}
    </div>
  )
}
