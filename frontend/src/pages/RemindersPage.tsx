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
import { it } from 'date-fns/locale'
import { useAuth } from '@/hooks/use-auth'
import type { ReminderType } from '@/types'

const typeIcons = {
  'todo': Sparkles,
  'recurring': Repeat,
  'one-time': Clock,
}

const typeLabels = {
  'todo': 'Da fare',
  'recurring': 'Ricorrente',
  'one-time': 'Una tantum',
}

export default function RemindersPage() {
  const { reminders, fetchReminders, addReminder, toggleReminder, deleteReminder } = useStore()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<ReminderType>('todo')
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0])
  const [recurringRule, setRecurringRule] = useState('')

  useEffect(() => {
    fetchReminders()
  }, [fetchReminders])

  const activeReminders = reminders.filter((r) => !r.done)
  const doneReminders = reminders.filter((r) => r.done)

  async function handleAdd() {
    if (!title) return
    await addReminder({
      title,
      description,
      type,
      due_date: dueDate,
      recurring_rule: type === 'recurring' ? recurringRule : '',
      done: false,
      created_by: user?.id ?? '',
    })
    setTitle('')
    setDescription('')
    setType('todo')
    setDueDate(new Date().toISOString().split('T')[0])
    setRecurringRule('')
    setOpen(false)
  }

  function renderList(items: typeof reminders, showDoneToggle = true) {
    if (items.length === 0) {
      return <p className="text-muted-foreground py-8 text-center">Nessun promemoria</p>
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
                    {format(new Date(r.due_date), 'd MMM yyyy', { locale: it })}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Promemoria</h1>
          <p className="text-muted-foreground">Todo list, appuntamenti ricorrenti e promemoria</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" />
              Nuovo promemoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuovo promemoria</DialogTitle>
              <DialogDescription>Cosa devi ricordare?</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Titolo</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titolo del promemoria" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="desc">Descrizione</Label>
                <Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrizione (opzionale)" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo</Label>
                <Select value={type} onValueChange={(v) => setType(v as ReminderType)}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Tipo promemoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">Da fare</SelectItem>
                    <SelectItem value="recurring">Ricorrente</SelectItem>
                    <SelectItem value="one-time">Una tantum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Scadenza</Label>
                <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              {type === 'recurring' && (
                <div className="grid gap-2">
                  <Label htmlFor="rule">Regola ricorrenza</Label>
                  <Select value={recurringRule} onValueChange={setRecurringRule}>
                    <SelectTrigger id="rule">
                      <SelectValue placeholder="Ogni quanto?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ogni giorno">Ogni giorno</SelectItem>
                      <SelectItem value="ogni settimana">Ogni settimana</SelectItem>
                      <SelectItem value="ogni 2 settimane">Ogni 2 settimane</SelectItem>
                      <SelectItem value="ogni mese">Ogni mese</SelectItem>
                      <SelectItem value="ogni 3 mesi">Ogni 3 mesi</SelectItem>
                      <SelectItem value="ogni anno">Ogni anno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Annulla</Button>
              <Button onClick={handleAdd}>Salva</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Attivi ({activeReminders.length})</TabsTrigger>
          <TabsTrigger value="done">Completati ({doneReminders.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Promemoria attivi</CardTitle>
            </CardHeader>
            <CardContent>{renderList(activeReminders)}</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="done" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Promemoria completati</CardTitle>
            </CardHeader>
            <CardContent>{renderList(doneReminders)}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
