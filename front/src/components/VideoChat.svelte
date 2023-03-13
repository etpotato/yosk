<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import type { Unsubscriber } from 'svelte/store'
  import { Button, Modal, ModalBody } from 'sveltestrap'
  import Peer from 'simple-peer'
  import type { SignalData, Instance } from 'simple-peer'
  import { EEventRoom, type SignalPayload, type TRoom, type TUser } from '@dto'
  import { user } from '../store/user'
  import { mediaInfo, setMediaInfo, type MediaInfo } from '../store/mediaInfo'
  import socket from '../lib/ws'
  import Video from './Video.svelte'
  import { getMedia } from '../utils/getMedia'

  type VideoInfo = {
    micActive?: boolean
    camActive?: boolean
  }

  type MateVideo = {
    mate: TUser
    stream?: MediaStream
  } & VideoInfo

  export let roomId: TRoom['id']

  let peerMates: { peer: Instance, mate: TUser, active: boolean }[] = [] 
  let errorModalOpen = false
  let myVideo: MediaStream | null = null
  let matesVideo: MateVideo[] = []
  let userUnsuscribe: Unsubscriber
  let mediaInfoUnsubscribe: Unsubscriber

  async function getInitialMedia() {
    const { error, stream, hasMic, hasCam } = await getMedia()
    errorModalOpen = Boolean(error)
    myVideo = stream
    setMediaInfo({ hasMic, hasCam })
  }

  async function initPeerMates(user: TUser | null) {
    if (!user) return

    await getInitialMedia()

    socket.emit(EEventRoom.getMates, { userId: user.id, roomId }, (mates) => {
      if (!mates) return
      peerMates = Object.values(mates).map((mate) => createPeerInitiator({ user, mate }))
    })
  }

  function createPeerInitiator({ user, mate }: { user: TUser, mate: TUser}) {
    const peer = new Peer({ initiator: true, trickle: false, objectMode: true })

    peer.on('signal', (data) => {
      socket.emit(EEventRoom.signal, { data, fromId: user.id, toId: mate.id })
    })

    peer.on('connect', () => {
      peerMates.forEach((peerMate) => {
        if (peerMate.mate.id === mate.id) {
          peerMate.active = true
        }
      })

      const data = JSON.stringify({
        micActive: $mediaInfo.micActive,
        camActive: $mediaInfo.camActive
      })
      peer.send(data)

      if (myVideo) {
        peer.addStream(myVideo)
      }
    })

    peer.on('data', (data) => {
      handleMatesVideo({ mate, ...JSON.parse(data) })
    })

    peer.on('stream', (stream) => {
      handleMatesVideo({ mate, stream })
    })

    peer.on('error', (err) => console.error(err))

    return { peer, mate, active: false }
  }

  function handleMateJoined(mate: TUser) {
    const peer = new Peer({ trickle: false, objectMode: true })

    peer.on('signal', (data) => {
      if (!$user) return
      socket.emit(EEventRoom.signal, { data, fromId: $user.id, toId: mate.id })
    })

    peer.on('connect', () => {
      peerMates.forEach((peerMate) => {
        if (peerMate.mate.id === mate.id) {
          peerMate.active = true
        }
      })

      const data = JSON.stringify({
        micActive: $mediaInfo.micActive,
        camActive: $mediaInfo.camActive
      })
      peer.send(data)
      if (myVideo) {
        peer.addStream(myVideo)
      }
    })

    peer.on('data', (data) => {
      handleMatesVideo({ mate, ...JSON.parse(data) })
    })

    peer.on('stream', (stream) => {
      handleMatesVideo({ mate, stream })
    })

    peer.on('error', (err) => console.error(err))

    peerMates = [...peerMates, { mate, peer: peer, active: false }]
  }

  function handleMateLeaved(mate: TUser) {
    matesVideo = matesVideo.filter((mateVideo) => mateVideo.mate.id !== mate.id)
    peerMates = peerMates.filter((peerMate) => {
      if (peerMate.mate.id === mate.id) {
        peerMate.peer.destroy()
        return false
      }
      return true
    })
  }

  function handleMateSignaled({ data, fromId }: SignalPayload) {
    const { peer } = peerMates.find((peerMate) => peerMate.mate.id === fromId) || {}
    peer?.signal(data as SignalData)
  }

  function handleMatesVideo(newMateVideo: MateVideo) {
    const mateVideoIndex = matesVideo.findIndex(
      (mateVideo) => mateVideo.mate.id === newMateVideo.mate.id
    )

    if (mateVideoIndex < 0) {
      matesVideo = [...matesVideo, newMateVideo]
      return
    }

    matesVideo = matesVideo.map((mateVideo) => {
      if (mateVideo.mate.id === newMateVideo.mate.id) {
        return { ...mateVideo, ...newMateVideo }
      }
      return mateVideo
    })
  }

  function handleMyMediaChange(newMediaInfo: MediaInfo) {
    myVideo?.getAudioTracks().forEach((track) => {
      track.enabled = newMediaInfo.micActive
    })
    myVideo?.getVideoTracks().forEach((track) => {
      track.enabled = newMediaInfo.camActive
    })

    for (const peerMate of peerMates) {
      if (!$user) break
      if (!peerMate.active) continue
      const data = JSON.stringify({ 
        micActive: newMediaInfo.micActive,
        camActive: newMediaInfo.camActive,
        mate: $user,
      })
      peerMate.peer.send(data)
    }
  }

  function handleModalClose(evt: Event) {
    evt.preventDefault()
    errorModalOpen = false
  }

  onMount(async () => {
    userUnsuscribe = user.subscribe(initPeerMates)
    mediaInfoUnsubscribe = mediaInfo.subscribe(handleMyMediaChange)
    socket.on(EEventRoom.userJoined, handleMateJoined)
    socket.on(EEventRoom.userLeaved, handleMateLeaved)
    socket.on(EEventRoom.userSignaled, handleMateSignaled)
  })

  onDestroy(() => {
    userUnsuscribe?.()
    mediaInfoUnsubscribe?.()
    socket.off(EEventRoom.userJoined, handleMateJoined)
    socket.off(EEventRoom.userLeaved, handleMateLeaved)
    myVideo?.getTracks().forEach((track) => track.stop())
  })
</script>

<ul class="grid">
  {#if myVideo}
    <li class="grid-item bg-dark rounded">
      <Video 
        src={myVideo}
        name={$user?.name}
        micActive={$mediaInfo.micActive}
        camActive={$mediaInfo.camActive}
        mine
      />
    </li>
  {/if}
  {#each matesVideo as mateVideo (mateVideo.mate.id)}
    <li class="grid-item bg-dark rounded">
      <Video
        src={mateVideo.stream || null}
        name={mateVideo.mate.name}
        micActive={mateVideo.micActive}
        camActive={mateVideo.camActive}
      />
    </li>
  {/each}
</ul>
<Modal isOpen={errorModalOpen} size="md" centered>
  <ModalBody class="p-4">
    <p class="text-center">
      There is an&nbsp;error with your media. Please, allow this page to&nbsp;use your&nbsp;camera and&nbsp;microphone in&nbsp;the&nbsp;site settings
    </p>
    <Button on:click={handleModalClose} color="dark" outline type="submit" class="d-block w-100" size="lg"
      >Ok</Button>
  </ModalBody>
</Modal>

<style>
  .grid {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: center;
    gap: 0.25rem;

    max-height: calc((var(--vh, 1vh) * 100) - 46px);
    margin: auto 0;
    padding: 0.5rem 0;
    list-style: none;
    overflow: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  @media (hover: hover) {
    .grid {
      max-height: calc((var(--vh, 1vh) * 100) - 42px);
    }
  }

  .grid::-webkit-scrollbar {
    display: none;
  }

  .grid-item {
    flex: 0 0 calc(50% - 0.125rem);
  }

  .grid-item:only-child {
    flex: 0 1 100%;
  }

  @media (min-aspect-ratio: 1 / 1) {
    .grid-item:only-child {
      flex: 0 1 70%;
    }
  }

  @media (min-width: 900px) {
    .grid-item:only-child {
      flex: 0 1 60%;
    }

    .grid-item {
      flex: 0 0 min(49%, 35vw);
    }
  }

  @media (min-width: 1280px) {
    .grid-item {
      flex: 0 0 min(49%, 32vw);
    }
  }
</style>
