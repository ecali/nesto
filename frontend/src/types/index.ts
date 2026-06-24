export type ExpenseType = 'expense' | 'income'

export interface Expense {
  id: string
  amount: number
  category: string
  description: string
  type?: ExpenseType
  paid_by: string
  date: string
  space?: string
  created: string
  updated: string
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: 'expense' | 'appointment' | 'reminder'
  created: string
  updated: string
}

export interface Appointment {
  id: string
  title: string
  description: string
  date: string
  time: string
  duration: number
  created_by: string
  space?: string
  created: string
  updated: string
}

export type ReminderType = 'todo' | 'recurring' | 'one-time'

export interface Reminder {
  id: string
  title: string
  description: string
  type: ReminderType
  due_date: string
  recurring_rule: string
  done: boolean
  created_by: string
  space?: string
  created: string
  updated: string
}

export interface User {
  id: string
  email: string
  name: string
  avatar: string
  role?: 'user' | 'admin'
  language?: 'en' | 'it' | 'es'
  created: string
  updated: string
}

export interface Space {
  id: string
  name: string
  type: 'private' | 'public'
  created_by: string
  members: string[]
  created: string
  updated: string
}
