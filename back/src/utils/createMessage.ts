import {
  TUser,
  TMessageReq,
  TUserMessageRes,
  EMsgType,
  TInfoMessageRes,
} from '@dto'

let count = 0
const getId = () => (count++ % 1000000).toString()

export function createUserMessage({
  text,
  user,
}: {
  text: TMessageReq
  user: TUser & { name: string }
}): TUserMessageRes {
  return {
    type: EMsgType.user,
    id: getId(),
    text,
    timestamp: Math.floor(Date.now() / 1000),
    author: {
      id: user.id,
      name: user.name,
    },
  }
}

export function createInfoMessage({
  action,
  user,
}: {
  action: TInfoMessageRes['action']
  user: TUser
}): TInfoMessageRes {
  return {
    type: EMsgType.info,
    id: getId(),
    action,
    user,
    timestamp: Math.floor(Date.now() / 1000),
  }
}
