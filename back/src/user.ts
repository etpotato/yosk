import { TUser } from '@dto'

class User implements TUser {
  id: string
  name?: string | undefined
  roomId?: string | undefined

  constructor(id: TUser['id']) {
    this.id = id
  }
}

export default User
