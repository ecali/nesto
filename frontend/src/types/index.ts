export interface Expense {
  id: string
  amount: number
  category: string
  description: string
  paid_by: string
  date: string
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
  created: string
  updated: string
}

export interface User {
  id: string
  email: string
  name: string
  avatar: string
  created: string
  updated: string
}
