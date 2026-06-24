import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useStore } from '@/store'
import { format } from 'date-fns'
import { useTranslation } from '@/i18n'
import { dateLocale } from '@/lib/date-locale'
import { useAuth } from '@/hooks/use-auth'

const defaultCategories = [
  { value: 'alimentari', label: 'Alimentari' },
  { value: 'bollette', label: 'Bollette' },
  { value: 'casa', label: 'Casa' },
  { value: 'trasporti', label: 'Trasporti' },
  { value: 'salute', label: 'Salute' },
  { value: 'tempo-libero', label: 'Tempo libero' },
  { value: 'abbigliamento', label: 'Abbigliamento' },
  { value: 'ristorante', label: 'Ristorante' },
  { value: 'altro', label: 'Altro' },
]

export default function ExpensesPage() {
  const { t, locale } = useTranslation()
  const { expenses, fetchExpenses, addExpense, deleteExpense } = useStore()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7))

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const filtered = expenses.filter((e) => e.date.startsWith(filterMonth))

  const total = filtered.reduce((acc, e) => acc + e.amount, 0)

  const byCategory = filtered.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {})

  async function handleAdd() {
    if (!amount || !category || !description) return
    await addExpense({
      amount: parseFloat(amount),
      category,
      description,
      date,
      paid_by: user?.id ?? '',
    })
    setAmount('')
    setCategory('')
    setDescription('')
    setDate(new Date().toISOString().split('T')[0])
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.expenses.title}</h1>
          <p className="text-muted-foreground">{t.expenses.subtitle}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" />
              {t.expenses.newExpense}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.expenses.newExpense}</DialogTitle>
              <DialogDescription>{t.expenses.addExpense}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">{t.expenses.amount}</Label>
                <Input id="amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">{t.expenses.category}</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder={t.expenses.selectCategory} />
                  </SelectTrigger>
                  <SelectContent>
                    {defaultCategories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">{t.expenses.description}</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t.expenses.whatDidYouBuy} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">{t.expenses.date}</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>{t.app.cancel}</Button>
              <Button onClick={handleAdd}>{t.app.save}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t.expenses.summary}</CardTitle>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1 text-sm"
          />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">&euro;{total.toFixed(2)}</div>
          <p className="text-sm text-muted-foreground">{filtered.length} {t.expenses.expensesInMonth}</p>
          {Object.keys(byCategory).length > 0 && (
            <div className="mt-4 space-y-2">
              {Object.entries(byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, tot]) => (
                  <div key={cat} className="flex items-center justify-between text-sm">
                    <span>{defaultCategories.find((c) => c.value === cat)?.label || cat}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-primary/20" style={{ width: `${(tot / total) * 100}%` }} />
                      <span className="font-medium w-16 text-right">&euro;{tot.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.expenses.expensesList} ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.expenses.date}</TableHead>
                <TableHead>{t.expenses.description}</TableHead>
                <TableHead>{t.expenses.category}</TableHead>
                <TableHead className="text-right">{t.expenses.amount}</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    {t.expenses.noExpenses}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{format(new Date(e.date), 'd MMM', { locale: dateLocale(locale) })}</TableCell>
                    <TableCell className="font-medium">{e.description}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                        {defaultCategories.find((c) => c.value === e.category)?.label || e.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold">&euro;{e.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => deleteExpense(e.id)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
