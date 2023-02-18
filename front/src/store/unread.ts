import type { TMessageRes } from '@dto'
import { writable, type Writable } from 'svelte/store'

export const unread: Writable<TMessageRes['id'][]> = writable([])
