import PocketBase from 'pocketbase'

const PB_URL = import.meta.env.VITE_PB_URL || 'http://127.0.0.1:8090'

export const pb = new PocketBase(PB_URL)
pb.autoCancellation(false)

export function isAuthenticated() {
  return pb.authStore.isValid
}

export function currentUser() {
  return pb.authStore.model
}

export function logout() {
  pb.authStore.clear()
}
