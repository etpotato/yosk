require('module-alias/register')
import { Server } from 'socket.io'
import {
  TServerToClientEvents,
  TClientToServerEvents,
  EEventRoom,
  EEventMsg,
  TUser,
} from '@dto'

import User from './user'
import { createUserMessage, createInfoMessage, createName } from './utils'
import Rooms from './rooms'

const PORT = 3012

const rooms = new Rooms()
const users = new Map<TUser['id'], TUser>()

const io = new Server<TClientToServerEvents, TServerToClientEvents>({
  cors: {
    origin: 'http://localhost:5173',
  },
})

io.on('connection', (socket) => {
  console.log('new connection', socket.id)

  socket.on(EEventRoom.create, (ackFn) => {
    const roomid = rooms.create()
    ackFn(roomid)

    console.log('new room:', roomid)
  })

  socket.on(EEventRoom.check, (roomId, ackFn) => {
    const check = rooms.has(roomId)
    ackFn(check)

    console.log(EEventRoom.check, roomId, ':', check)
  })

  socket.on(EEventRoom.join, ({ roomId, name }, ackFn) => {
    console.log('user', socket.id, 'wants to join room', roomId)

    const user = new User({
      id: socket.id,
      name: name || createName(),
      roomId,
    })

    users.set(user.id, user)
    rooms.addUser({ user, roomId })
    ackFn(user)

    const message = createInfoMessage({ user, action: EEventRoom.userJoined })
    rooms.addMessage({ message, roomId })
    socket.emit(EEventMsg.all, rooms.getAllMessages(roomId))

    const neighbors = rooms.getUsers(roomId)
    neighbors.forEach((neighbor) => {
      if (neighbor.id !== user.id) {
        io.to(neighbor.id).emit(EEventMsg.new, message)
        io.to(neighbor.id).emit(EEventRoom.userJoined, user)
      }
    })
  })

  socket.on(EEventRoom.leave, () => {
    const user = users.get(socket.id)
    const roomId = user?.roomId

    if (!roomId) return

    const message = createInfoMessage({ user, action: EEventRoom.userLeaved })
    rooms.addMessage({ message, roomId })
    rooms.deleteUser({ id: socket.id, roomId })

    if (rooms.has(roomId)) {
      rooms.getUsers(roomId).forEach((neighbor) => {
        io.to(neighbor.id).emit(EEventMsg.new, message)
        io.to(neighbor.id).emit(EEventRoom.userLeaved, user)
      })
    }

    console.log('user', user.id, `"${user.name}"`, 'leaved room', roomId)
  })

  socket.on(EEventMsg.sent, (msg) => {
    const user = users.get(socket.id)
    const roomId = user?.roomId

    if (!roomId) {
      return
    }

    const message = createUserMessage({ text: msg, user })

    rooms.addMessage({ message, roomId })

    const neighbors = rooms.getUsers(roomId)

    neighbors.forEach((neighbor) => {
      io.to(neighbor.id).emit(EEventMsg.new, message)
    })
  })

  socket.on('disconnect', () => {
    const user = users.get(socket.id)
    const roomId = user?.roomId

    if (!user || !roomId) return

    rooms.deleteUser(user)

    if (rooms.has(roomId)) {
      const message = createInfoMessage({ user, action: EEventRoom.userLeaved })
      rooms.addMessage({ message, roomId })

      rooms.getUsers(roomId).forEach((neighbor) => {
        io.to(neighbor.id).emit(EEventMsg.new, message)
        io.to(neighbor.id).emit(EEventRoom.userLeaved, user)
      })
    }

    users.delete(user.id)
    console.log('user', user.id, `"${user.name}"`, 'disconnected')
  })
})

/**
 * connect from the root route
 * add button to request roomid
 * get room id and redirect to this room
 * add client route /room/:id
 * use param (:id) to request to join the room
 * add client to socket room
 * setup peer connection
 */

io.listen(PORT)

console.log(`server is listening on port ${PORT} \n`)
