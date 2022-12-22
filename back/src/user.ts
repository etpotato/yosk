import { TUser } from '@dto'

class User implements TUser {
  id: string
  name: string
  roomId: string

  constructor({ id, name, roomId }: TUser) {
    this.id = id
    this.name = name
    this.roomId = roomId
  }
}

export default User
