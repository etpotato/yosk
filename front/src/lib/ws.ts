import { io, Socket } from 'socket.io-client'
import type { TServerToClientEvents, TClientToServerEvents } from '@dto'

const socket: Socket<TServerToClientEvents, TClientToServerEvents> = io(
  'ws://localhost:3012',
)

socket.on('connect', () => {
  console.log('connected')

  // socket.on('roomid', (payload: string) => {
  //   console.log('roomid', payload)
  // })
})

export default socket
