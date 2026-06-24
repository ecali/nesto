import { create } from 'zustand'
import { pb } from '@/lib/pocketbase'
import type { Expense, Appointment, Reminder, Category, Space } from '@/types'

interface NestoStore {
  expenses: Expense[]
  appointments: Appointment[]
  reminders: Reminder[]
  categories: Category[]
  spaces: Space[]
  activeSpace: string | null
  loading: boolean

  fetchExpenses: (space?: string) => Promise<void>
  fetchAppointments: (space?: string) => Promise<void>
  fetchReminders: (space?: string) => Promise<void>
  fetchCategories: () => Promise<void>
  fetchSpaces: () => Promise<void>
  setActiveSpace: (id: string | null) => void
  addExpense: (data: Omit<Expense, 'id' | 'created' | 'updated'>) => Promise<void>
  addAppointment: (data: Omit<Appointment, 'id' | 'created' | 'updated'>) => Promise<void>
  addReminder: (data: Omit<Reminder, 'id' | 'created' | 'updated'>) => Promise<void>
  addCategory: (data: Omit<Category, 'id' | 'created' | 'updated'>) => Promise<void>
  addSpace: (name: string, type: 'private' | 'public') => Promise<Space>
  deleteSpace: (id: string) => Promise<void>
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
  spaces: [],
  activeSpace: localStorage.getItem('nesto-active-space'),
  loading: false,

  fetchExpenses: async (space) => {
    const filter = space ? `space = "${space}"` : ''
    const records = await pb.collection('expenses').getFullList<Expense>({ sort: '-date', filter: filter || undefined })
    set({ expenses: records })
  },

  fetchAppointments: async (space) => {
    const filter = space ? `space = "${space}"` : ''
    const records = await pb.collection('appointments').getFullList<Appointment>({ sort: 'date', filter: filter || undefined })
    set({ appointments: records })
  },

  fetchReminders: async (space) => {
    const filter = space ? `space = "${space}"` : ''
    const records = await pb.collection('reminders').getFullList<Reminder>({ sort: 'due_date', filter: filter || undefined })
    set({ reminders: records })
  },

  fetchCategories: async () => {
    const records = await pb.collection('categories').getFullList<Category>({ sort: 'name' })
    set({ categories: records })
  },

  fetchSpaces: async () => {
    const records = await pb.collection('spaces').getFullList<Space>({ sort: 'name' })
    set({ spaces: records })
  },

  setActiveSpace: (id) => {
    localStorage.setItem('nesto-active-space', id ?? '')
    set({ activeSpace: id })
  },

  addExpense: async (data) => {
    await pb.collection('expenses').create(data)
    get().fetchExpenses(get().activeSpace ?? undefined)
  },

  addAppointment: async (data) => {
    await pb.collection('appointments').create(data)
    get().fetchAppointments(get().activeSpace ?? undefined)
  },

  addReminder: async (data) => {
    await pb.collection('reminders').create(data)
    get().fetchReminders(get().activeSpace ?? undefined)
  },

  addCategory: async (data) => {
    await pb.collection('categories').create(data)
    get().fetchCategories()
  },

  addSpace: async (name, type) => {
    const user = pb.authStore.record
    const record = await pb.collection('spaces').create<Space>({ name, type, created_by: user?.id, members: [user?.id] })
    get().fetchSpaces()
    return record
  },

  deleteSpace: async (id) => {
    await pb.collection('spaces').delete(id)
    if (get().activeSpace === id) {
      get().setActiveSpace(null)
    }
    set((state) => ({ spaces: state.spaces.filter((s) => s.id !== id) }))
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
