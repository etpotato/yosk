import { io, Socket } from 'socket.io-client'
import type { TServerToClientEvents, TClientToServerEvents } from '@dto'

const socket: Socket<TServerToClientEvents, TClientToServerEvents> = io(import.meta.env.VITE_API)

socket.on('connect', () => {
  console.log('ws connected')
})

export default socket
