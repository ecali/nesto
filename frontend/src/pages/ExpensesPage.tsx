import { useEffect, useState } from 'react'
import { Plus, Trash2, ArrowUpCircle, ArrowDownCircle, FolderPlus } from 'lucide-react'
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
import type { ExpenseType } from '@/types'

export default function ExpensesPage() {
  const { t, locale } = useTranslation()
  const { expenses, categories, activeSpace, fetchExpenses, fetchCategories, addExpense, addCategory, deleteExpense } = useStore()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [expenseType, setExpenseType] = useState<ExpenseType>('expense')
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7))
  const [catDialogOpen, setCatDialogOpen] = useState(false)
  const [catName, setCatName] = useState('')

  useEffect(() => {
    fetchExpenses(activeSpace ?? undefined)
    fetchCategories()
  }, [fetchExpenses, fetchCategories, activeSpace])

  const filtered = expenses.filter((e) => e.date.startsWith(filterMonth))
  const totalExpenses = filtered.filter((e) => e.type !== 'income').reduce((acc, e) => acc + e.amount, 0)
  const totalIncome = filtered.filter((e) => e.type === 'income').reduce((acc, e) => acc + e.amount, 0)
  const netBalance = totalIncome - totalExpenses

  const filteredCategories = categories.filter((c) => c.type === expenseType)
  const catMap = Object.fromEntries(categories.map((c) => [c.name, c.name]))

  const byCategory = filtered.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {})

  async function handleAdd() {
    if (!amount || !category || !description) return
    if (!activeSpace) return
    await addExpense({
      amount: parseFloat(amount),
      category,
      description,
      type: expenseType,
      date,
      space: activeSpace,
      paid_by: user?.id ?? '',
    })
    setAmount('')
    setCategory('')
    setDescription('')
    setExpenseType('expense')
    setDate(new Date().toISOString().split('T')[0])
    setOpen(false)
  }

  async function handleAddCategory() {
    if (!catName) return
    await addCategory({ name: catName, icon: '', color: '#6b7280', type: expenseType })
    setCatName('')
    setCatDialogOpen(false)
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
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="expenseType">{t.expenses.type}</Label>
                  <Select value={expenseType} onValueChange={(v) => setExpenseType(v as ExpenseType)}>
                    <SelectTrigger id="expenseType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">{t.expenses.expense}</SelectItem>
                      <SelectItem value="income">{t.expenses.income}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">{t.expenses.amount}</Label>
                  <Input id="amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>{t.expenses.category}</Label>
                <div className="flex gap-2">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder={t.expenses.selectCategory} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCategories.map((c) => (
                        <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={() => setCatDialogOpen(true)}>
                    <FolderPlus className="size-4" />
                  </Button>
                </div>
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
              <Button onClick={handleAdd} disabled={!activeSpace}>{t.app.save}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.common.createCategory}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t.expenses.category}</Label>
              <Input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder={t.expenses.whatDidYouBuy} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatDialogOpen(false)}>{t.app.cancel}</Button>
            <Button onClick={handleAddCategory}>{t.app.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t.expenses.expense}</p>
              <p className="text-2xl font-bold text-destructive">&euro;{totalExpenses.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.expenses.income}</p>
              <p className="text-2xl font-bold text-emerald-500">&euro;{totalIncome.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.expenses.netBalance}</p>
              <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                &euro;{netBalance.toFixed(2)}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{filtered.length} {t.expenses.expensesInMonth}</p>
          {Object.keys(byCategory).length > 0 && (
            <div className="mt-4 space-y-2">
              {Object.entries(byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, tot]) => (
                  <div key={cat} className="flex items-center justify-between text-sm">
                    <span>{catMap[cat] || cat}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-primary/20" style={{ width: `${(tot / Math.max(totalExpenses, totalIncome, 1)) * 100}%` }} />
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
                <TableHead>{t.expenses.type}</TableHead>
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
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {t.expenses.noExpenses}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      {e.type === 'income' ? (
                        <ArrowUpCircle className="size-4 text-emerald-500" />
                      ) : (
                        <ArrowDownCircle className="size-4 text-destructive" />
                      )}
                    </TableCell>
                    <TableCell>{format(new Date(e.date), 'd MMM', { locale: dateLocale(locale) })}</TableCell>
                    <TableCell className="font-medium">{e.description}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                        {catMap[e.category] || e.category}
                      </span>
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${e.type === 'income' ? 'text-emerald-500' : ''}`}>
                      {e.type === 'income' ? '+' : '–'}&euro;{e.amount.toFixed(2)}
                    </TableCell>
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
