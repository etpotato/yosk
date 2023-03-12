export enum EEventRoom {
  create = 'room:create',
  check = 'room:check',
  join = 'room:join',
  signal = 'room:signal',
  leave = 'room:leave',
  getMates = 'room:getMates',

  userJoined = 'room:userjoined',
  userLeaved = 'room:userleaved',
  userSignaled = 'room:userSignaled',
}

export enum EEventMsg {
  sent = 'msg:sent',
  new = 'msg:new',
  all = 'msg:all',
}

export enum EMsgType {
  user ='user',
  info = 'info'
}

export type TUser = {
  id: string
  name: string
  roomId: string
}

export type Mates = Record<TUser['id'], TUser> | null

export type SignalPayload = { data: unknown, fromId: TUser['id'], toId: TUser['id'] }

export type TMessageReq = string

export type TUserMessageRes = {
  type: EMsgType.user
  id: string;
  timestamp: number;
  text: string;
  author: {
    id: string;
    name: string;
  };
}

export type TInfoMessageRes = {
  type: EMsgType.info,
  id: string;
  timestamp: number;
  action: EEventRoom.userJoined | EEventRoom.userLeaved,
  user: TUser
};

export type TMessageRes = TUserMessageRes | TInfoMessageRes

export type TRoom = {
  id: string
  users: Map<TUser['id'], TUser>
  messages: TMessageRes[]
  timeout?: ReturnType<typeof setTimeout>
}

export type TServerToClientEvents = {
  [EEventRoom.userJoined]: (user: TUser) => void
  [EEventRoom.userSignaled]: (data: SignalPayload) => void
  [EEventRoom.userLeaved]: (user: TUser) => void

  [EEventMsg.new]: (msg: TMessageRes) => void
  [EEventMsg.all]: (allMsg: TMessageRes[]) => void
}

export type TClientToServerEvents = {
  [EEventRoom.create]: (callback: (roomId: TRoom['id']) => void) => void
  [EEventRoom.check]: (roomId: TRoom['id'], callback: (check: boolean) => void) => void
  [EEventRoom.join]: (
    { roomId, name }: { roomId: TRoom['id'], name: TUser['name'] }, 
    callback: ({ user }: { user: TUser | null }) => void
    ) => void
  [EEventRoom.getMates]: ({ userId, roomId }: { userId: TUser['id'], roomId: TRoom['id'] }, callback: (mates: Mates) => void) => void
  [EEventRoom.signal]: (data: SignalPayload) => void
  [EEventRoom.leave]: () => void
  [EEventMsg.sent]: (msg: TMessageReq) => void
}

