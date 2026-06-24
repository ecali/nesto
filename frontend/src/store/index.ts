import { create } from 'zustand'
import { pb } from '@/lib/pocketbase'
import type { Expense, Appointment, Reminder, Category } from '@/types'

interface NestoStore {
  expenses: Expense[]
  appointments: Appointment[]
  reminders: Reminder[]
  categories: Category[]
  loading: boolean

  fetchExpenses: () => Promise<void>
  fetchAppointments: () => Promise<void>
  fetchReminders: () => Promise<void>
  fetchCategories: () => Promise<void>
  addExpense: (data: Omit<Expense, 'id' | 'created' | 'updated'>) => Promise<void>
  addAppointment: (data: Omit<Appointment, 'id' | 'created' | 'updated'>) => Promise<void>
  addReminder: (data: Omit<Reminder, 'id' | 'created' | 'updated'>) => Promise<void>
  toggleReminder: (id: string, done: boolean) => Promise<void>
  deleteExpense: (id: string) => Promise<void>
  deleteAppointment: (id: string) => Promise<void>
  deleteReminder: (id: string) => Promise<void>
}

export const useStore = create<NestoStore>((set, get) => ({
  expenses: [],
  appointments: [],
  reminders: [],
  categories: [],
  loading: false,

  fetchExpenses: async () => {
    const records = await pb.collection('expenses').getFullList<Expense>({ sort: '-date' })
    set({ expenses: records })
  },

  fetchAppointments: async () => {
    const records = await pb.collection('appointments').getFullList<Appointment>({ sort: 'date' })
    set({ appointments: records })
  },

  fetchReminders: async () => {
    const records = await pb.collection('reminders').getFullList<Reminder>({ sort: 'due_date' })
    set({ reminders: records })
  },

  fetchCategories: async () => {
    const records = await pb.collection('categories').getFullList<Category>({ sort: 'name' })
    set({ categories: records })
  },

  addExpense: async (data) => {
    await pb.collection('expenses').create(data)
    get().fetchExpenses()
  },

  addAppointment: async (data) => {
    await pb.collection('appointments').create(data)
    get().fetchAppointments()
  },

  addReminder: async (data) => {
    await pb.collection('reminders').create(data)
    get().fetchReminders()
  },

  toggleReminder: async (id, done) => {
    await pb.collection('reminders').update(id, { done })
    set((state) => ({
      reminders: state.reminders.map((r) => (r.id === id ? { ...r, done } : r)),
    }))
  },

  deleteExpense: async (id) => {
    await pb.collection('expenses').delete(id)
    set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) }))
  },

  deleteAppointment: async (id) => {
    await pb.collection('appointments').delete(id)
    set((state) => ({ appointments: state.appointments.filter((a) => a.id !== id) }))
  },

  deleteReminder: async (id) => {
    await pb.collection('reminders').delete(id)
    set((state) => ({ reminders: state.reminders.filter((r) => r.id !== id) }))
  },
}))
