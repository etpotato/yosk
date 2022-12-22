import { TUser, TMessageReq, TMessageRes } from '@dto'

let count = 0
const getId = () => (count++ % 1000000).toString()

export function createMessage({
  text,
  user,
}: {
  text: TMessageReq
  user: TUser & { name: string }
}): TMessageRes {
  return {
    id: getId(),
    text,
    timestamp: Math.floor(Date.now() / 1000),
    author: {
      id: user.id,
      name: user.name,
    },
  }
}
