export enum EEventRoom {
  create = 'room:create',
  check = 'room:check',
  join = 'room:join',
  leave = 'room:leave',
  userJoined = 'room:userjoined',
  userLeaved = 'room:userleaved',
}

export enum EEventMsg {
  sent = 'msg:sent',
  new = 'msg:new',
  all = 'msg:all',
}

export type TUser = {
  id: string
  name: string
  roomId: string
}

export type TMessageReq = string

export type TMessageRes = {
  id: string;
  timestamp: number;
  text: string;
  author: {
    id: string;
    name: string;
  };
};

export type TRoom = {
  id: string
  users: Map<TUser['id'], TUser>
  messages: TMessageRes[]
}

export type TServerToClientEvents = {
  [EEventRoom.userJoined]: (user: TUser) => void
  [EEventRoom.userLeaved]: (user: TUser) => void
  [EEventMsg.new]: (msg: TMessageRes) => void
  [EEventMsg.all]: (allMsg: TMessageRes[]) => void
}

export type TClientToServerEvents = {
  [EEventRoom.create]: (callback: (roomId: TRoom['id']) => void) => void
  [EEventRoom.check]: (roomId: TRoom['id'], callback: (check: boolean) => void) => void
  [EEventRoom.join]: ({ roomId, name }: {roomId: TRoom['id'], name: TUser['name']}, callback: (user: TUser) => void) => void
  [EEventRoom.leave]: () => void
  [EEventMsg.sent]: (msg: TMessageReq) => void
}

