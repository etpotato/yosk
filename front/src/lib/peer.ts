import { Peer } from 'peerjs'
import type { DataConnection, MediaConnection } from 'peerjs'
import type { TUser } from '@dto'

export type TVideo = MediaStream | null

export type VideoInfo = {
  micActive?: boolean
  camActive?: boolean
}

export type MateVideo = {
  mate: TUser
  stream: MediaStream
} & VideoInfo

export type GetVideoInfo = () => VideoInfo
export type GetVideo = () => TVideo
export type HandleVideoInfo = ({ info, mateId }: { info: VideoInfo; mateId: TUser['id'] }) => void
export type HandleMatesVideo = (video: MateVideo) => void
export type HandleMateLeaved = (mateId: TUser['id']) => void

let localUser: TUser | null = null
let myPeer: Peer | null = null
let peerCons: DataConnection[] = []
let callbacks: {
  getVideoInfo: GetVideoInfo
  getVideo: GetVideo
  handleVideoInfo: HandleVideoInfo
  handleMatesVideo: HandleMatesVideo
  handleMateLeaved: HandleMateLeaved
} | null = null
let retryTimeout: NodeJS.Timeout | null = null

function handleVideoInfoChange(info: VideoInfo) {
  for (const conn of peerCons) {
    conn.send(info)
  }
}

function destroy() {
  myPeer?.disconnect()
  myPeer?.destroy()
  if (retryTimeout) {
    clearTimeout(retryTimeout)
  }
  localUser = null
  myPeer = null
  peerCons = []
  callbacks = null
  retryTimeout = null
}

function handleMateJoined(mate: TUser): void {
  // new mate joined the room
  if (!callbacks || !myPeer || !mate.id) return
  // I'm setting up peer connection with new mate
  const conn = myPeer.connect(mate.id)
  if (!conn) return

  peerCons.push(conn)
  _getConnListeners({ conn })

  // I'm calling new mate with my video stream
  const myStream = callbacks?.getVideo()
  if (!myStream) return
  const call = myPeer.call(mate.id, myStream, { metadata: { user: localUser } })
  _getCallListeners({ call, mate })
}

export function createMyPeer({
  user,
  getVideoInfo,
  getVideo,
  handleVideoInfo,
  handleMatesVideo,
  handleMateLeaved,
}: {
  user: TUser | null
  getVideoInfo: GetVideoInfo
  getVideo: GetVideo
  handleVideoInfo: HandleVideoInfo
  handleMatesVideo: HandleMatesVideo
  handleMateLeaved: HandleMateLeaved
}) {
  myPeer?.destroy()

  if (!user) {
    return null
  }

  localUser = user
  callbacks = { getVideoInfo, getVideo, handleVideoInfo, handleMatesVideo, handleMateLeaved }

  // I'm joining the room, mates are getting my info
  myPeer = new Peer(user.id)
  // mates will connect
  myPeer.on('connection', (conn) => {
    peerCons.push(conn)
    _getConnListeners({ conn })
  })
  // mates will call
  myPeer.on('call', (call) => {
    const myStream = callbacks?.getVideo() || undefined
    call.answer(myStream)
    _getCallListeners({ call, mate: call.metadata.user as TUser })
  })

  myPeer.on('error', (error) => {
    console.log('myPeer error')
    console.error(error)
    _handleConnError()
  })

  return {
    handleMateJoined,
    handleVideoInfoChange,
    destroy,
  }
}

function _getCallListeners({ call, mate }: { call: MediaConnection; mate: TUser }) {
  call.on('stream', (stream) => {
    callbacks?.handleMatesVideo({ mate, stream })
  })
  call.on('close', () => {
    callbacks?.handleMateLeaved(mate.id)
  })
  call.on('error', (error) => {
    console.log('call err')
    console.error(error)
  })
}

function _getConnListeners({ conn }: { conn: DataConnection }) {
  conn.on('open', () => {
    conn.send(callbacks?.getVideoInfo())
  })
  conn.on('data', (info) =>
    callbacks?.handleVideoInfo({ info: info as VideoInfo, mateId: conn.peer }),
  )
  conn.on('close', () => {
    callbacks?.handleMateLeaved(conn.peer)
  })
  conn.on('error', (error) => {
    console.log('conn error')
    console.error(error)
  })
}

function _handleConnError() {
  const TIMEOUT_MILTUPLIER = 2
  const MAX_RETRIES = 6
  let retryCount = 1
  let timeout = 500

  console.log(`Retrying connection in ${timeout / 1000} seconds...`)
  console.log('Attempting connection retry #' + retryCount)

  if (retryCount < MAX_RETRIES && myPeer) {
    retryCount++
    timeout *= TIMEOUT_MILTUPLIER
    setTimeout(() => {
      myPeer?.reconnect()
    }, timeout)
  } else {
    console.log('Max retry count reached. Aborting connection.')
    destroy()
  }
}
