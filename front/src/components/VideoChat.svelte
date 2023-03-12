<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import type { Unsubscriber } from 'svelte/store'
  import { Button, Modal, ModalBody } from 'sveltestrap'
  import Peer from 'simple-peer'
  import type { SignalData, Instance } from 'simple-peer'
  import { EEventRoom, type SignalPayload, type TRoom, type TUser } from '@dto'
  import { user } from '../store/user'
  import socket from '../lib/ws'
  import Video from './Video.svelte'
  import { getMedia } from '../utils/getMedia'

  type VideoInfo = {
    micActive?: boolean;
    camActive?: boolean;
  }

  type MateVideo = {
    mate: TUser;
    stream: MediaStream;
  } & VideoInfo

  export let micActive: boolean
  export let camActive: boolean
  export let roomId: TRoom['id']

  let peerMates: { peer: Instance, mate: TUser, active: boolean }[] | null = null 
  let errorModalOpen = false
  let myVideo: MediaStream | null = null
  let matesVideo: MateVideo[] = []
  let userUnsuscribe: Unsubscriber

  $: {
    myVideo?.getAudioTracks().forEach((track) => {
      track.enabled = micActive
    })
    myVideo?.getVideoTracks().forEach((track) => {
      track.enabled = camActive
    })
    peerMates?.forEach((peerMate) => {
      if (peerMate.active) {
        peerMate.peer.send(JSON.stringify({ micActive, camActive }))
      }
    })
  }

  async function getInitialMedia() {
    const getMediaResult = await getMedia({ micActive, camActive })

    if (getMediaResult.error) {
      errorModalOpen = true
    }

    myVideo = getMediaResult.stream
  }

  function handleVideoInfo({ info, mateId }: { info: VideoInfo, mateId: string }) {
    matesVideo = matesVideo.map((mateVideo) => {
      if (mateVideo.mate.id === mateId) {
        return { ...mateVideo, micActive: info.micActive, camActive: info.camActive }
      }
      return mateVideo
    })
  }

  async function initPeerMates(user: TUser | null) {
    if (!user) return

    await getInitialMedia()

    socket.emit(EEventRoom.getMates, { userId: user.id, roomId }, (mates) => {
      if (!mates) return

      peerMates = Object.values(mates)
        .map((mate) => {
          const peer = new Peer({ initiator: true, objectMode: true })
  
          peer.on('signal', (data) => {
            socket.emit(EEventRoom.signal, { data, fromId: user.id, toId: mate.id })
          })
  
          peer.on('connect', () => {
            peerMates?.forEach((peerMate) => {
              if (peerMate.mate.id === mate.id) {
                peerMate.active = true
              }
            })
            peer.send(JSON.stringify({ micActive, camActive }))
            if (myVideo) {
              peer.addStream(myVideo)
            }
          })

          peer.on('data', (data) => {
            handleVideoInfo({ info: JSON.parse(data), mateId: mate.id })
          })

          peer.on('stream', (stream) => {
            addMatesVideo({ mate, stream })
          })

          peer.on('error', (err) => console.error(err))
  
          return { peer, mate, active: false }
        })
    })
  }

  function handleMateJoined(mate: TUser) {
    const peer = new Peer({ objectMode: true })

    peer.on('signal', (data) => {
      if (!$user) return
      socket.emit(EEventRoom.signal, { data, fromId: $user.id, toId: mate.id })
    })

    peer.on('connect', () => {
      peerMates?.forEach((peerMate) => {
        if (peerMate.mate.id === mate.id) {
          peerMate.active = true
        }
      })
      peer.send(JSON.stringify({ micActive, camActive }))
      if (myVideo) {
        peer.addStream(myVideo)
      }
    })

    peer.on('data', (data) => {
      handleVideoInfo({ info: JSON.parse(data), mateId: mate.id })
    })

    peer.on('stream', (stream) => {
      addMatesVideo({ mate, stream })
    })

    peer.on('error', (err) => console.error(err))

    peerMates = [...(peerMates || []), { mate, peer: peer, active: false }]
  }

  function handleMateLeaved(mate: TUser) {
    matesVideo = matesVideo.filter((item) => item.mate?.id !== mate.id)

    if (!peerMates) return

    peerMates = peerMates.filter((peerMate) => {
      if (peerMate.mate.id === mate.id) {
        peerMate.peer.destroy()
        return false
      }
      return true
    })
  }

  function handleMateSignaled({ data, fromId }: SignalPayload) {
    if (!peerMates?.length) return
    const { peer } = peerMates.find((peerMate) => peerMate.mate.id === fromId) || {}
    peer?.signal(data as SignalData)
  }

  function addMatesVideo(video: MateVideo) {
    matesVideo = [...matesVideo, video]
  }

  function handleReload(evt: Event) {
    evt.preventDefault()
    errorModalOpen = false
  }

  onMount(async () => {
    userUnsuscribe = user.subscribe(initPeerMates)
    socket.on(EEventRoom.userJoined, handleMateJoined)
    socket.on(EEventRoom.userLeaved, handleMateLeaved)
    socket.on(EEventRoom.userSignaled, handleMateSignaled)
  })

  onDestroy(() => {
    userUnsuscribe?.()
    socket.off(EEventRoom.userJoined, handleMateJoined)
    socket.off(EEventRoom.userLeaved, handleMateLeaved)
    myVideo?.getTracks().forEach((track) => track.stop())
  })
</script>

<ul class="grid">
  {#if myVideo}
    <li class="grid-item bg-dark rounded">
      <Video src={myVideo} name={$user?.name} {micActive} {camActive} mine />
    </li>
  {/if}
  {#each matesVideo as mateVideo (mateVideo.mate.id)}
    <li class="grid-item bg-dark rounded">
      <Video src={mateVideo.stream} name={mateVideo.mate.name} micActive={mateVideo.micActive} camActive={mateVideo.camActive}/>
    </li>
  {/each}
</ul>
<Modal isOpen={errorModalOpen} size="md" centered>
  <ModalBody class="p-4">
    <p class="text-center">
      There is an&nbsp;error with your media. Please, allow this page to&nbsp;use your&nbsp;camera and&nbsp;microphone in&nbsp;the&nbsp;site settings
    </p>
    <Button on:click={handleReload} color="dark" outline type="submit" class="d-block w-100" size="lg"
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
