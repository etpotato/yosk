import type { TUser } from '@dto'
import { writable, type Writable } from 'svelte/store'

export const user: Writable<TUser | null> = writable(null)
