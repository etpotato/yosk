import { TUser, TRoom, TMessageRes } from '@dto'
import { nanoid } from 'nanoid'

class Room implements TRoom {
  id: string
  users: Map<TUser['id'], TUser>
  messages: TMessageRes[]

  constructor(id: TRoom['id']) {
    this.id = id
    this.users = new Map()
    this.messages = []
  }
}

class Rooms {
  private rooms

  constructor() {
    this.rooms = new Map<TRoom['id'], TRoom>()
  }

  create(): TRoom['id'] {
    const roomid = nanoid(8)
    this.rooms.set(roomid, new Room(roomid))
    return roomid
  }

  delete(roomid: TRoom['id']) {
    this.rooms.delete(roomid)
  }

  has(roomid: TRoom['id']) {
    return this.rooms.has(roomid)
  }

  addUser({ user, roomId }: { user: TUser; roomId: TRoom['id'] }) {
    try {
      const room = this.rooms.get(roomId)

      if (!room) {
        throw new Error(`room ${roomId} not found`)
      }

      user.roomId = room.id
      room.users.set(user.id, user)

      return true
    } catch (err) {
      console.error(err)

      return false
    }
  }

  deleteUser({ id, roomId }: TUser) {
    try {
      if (!roomId) {
        throw new Error('roomId is not provided')
      }

      const room = this.rooms.get(roomId)

      if (!room) {
        throw new Error(`room ${id} not found`)
      }

      room.users.delete(id)

      if (room.users.size === 0) {
        this.rooms.delete(roomId)
      }

      return true
    } catch (err) {
      console.error(err)

      return false
    }
  }

  getUsers(roomId: TRoom['id']) {
    try {
      const room = this.rooms.get(roomId)

      if (!room) {
        throw new Error(`room ${roomId} not found`)
      }

      return room.users
    } catch (err) {
      console.error(err)

      return []
    }
  }

  addMessage({
    message,
    roomId,
  }: {
    message: TMessageRes
    roomId: TRoom['id']
  }) {
    try {
      if (!roomId) {
        throw new Error('roomId is not provided')
      }

      const room = this.rooms.get(roomId)

      if (!room) {
        throw new Error(`room ${roomId} not found`)
      }

      room.messages.push(message)

      return true
    } catch (err) {
      console.error(err)

      return false
    }
  }

  getAllMessages(roomId: TRoom['id']) {
    try {
      if (!roomId) {
        throw new Error('roomId is not provided')
      }

      const room = this.rooms.get(roomId)

      if (!room) {
        throw new Error(`room ${roomId} not found`)
      }

      return room.messages
    } catch (err) {
      console.error(err)

      return []
    }
  }
}

export default Rooms
