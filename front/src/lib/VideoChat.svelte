<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 0.25rem;
    max-height: calc((var(--vh, 1vh) * 100) - 54px);
    margin: 0;
    margin-bottom: auto;
    padding: 0;
    padding-bottom: 0.5rem;
    list-style: none;
    overflow: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  @media (hover: hover) {
    .grid {
      max-height: calc((var(--vh, 1vh) * 100) - 50px);
    }
  }

  @media (min-width: 900px) {
    .grid {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      justify-content: center;
      gap: 0.25rem;
      margin: auto 0;
    }
  }

  .grid::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 900px) {
    .grid-item {
      flex: 0 0 min(49%, 35vw);
    }
  }

  @media (min-width: 1280px) {
    .grid-item {
      flex: 0 0 min(49%, 32vw);
    }
  }

  .video-wrap {
    position: relative;
    display: grid;
    place-content: center;
    padding-top: 100%;
    overflow: hidden;
  }

  @media (min-aspect-ratio: 1 / 1) {
    .video-wrap {
      padding-top: 56.25%;
    }
  }

  .controls {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: flex-end;
    gap: 0.25rem;
    padding: 0.25rem;
    opacity: 0;
    transition: 0.2s opacity ease-in-out;
  }

  .grid-item:hover .controls,
  .grid-item:focus-within .controls {
    opacity: 0.8;
  }

  .name {
    position: absolute;
    top: 0.25rem;
    left: 0.25rem;
    right: 0.25rem;
  }

  @media (min-width: 900px) {
    .name {
      position: static;
      margin-left: auto;
    }
  }
</style>

<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import type { Unsubscriber } from 'svelte/store'
  import { Button, Modal, ModalBody } from 'sveltestrap'
  import { Peer } from 'peerjs'
  import type { DataConnection } from 'peerjs'
  import { EEventRoom, type TUser } from '@dto'
  import { user } from '../store/user'
  import socket from './ws'
  import Video from './Video.svelte'
  import UserName from './UserName.svelte'
  import { getMedia } from '../utils/getMedia'

  type MateVideo = { mate: TUser; stream: MediaStream }

  export let micActive = true
  export let camActive = true

  let myPeer: Peer | null = null
  let peerCons: DataConnection[] = []
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
  }

  async function getInitialMedia() {
    const getMediaResult = await getMedia({ micActive, camActive })

    if (getMediaResult.error) {
      errorModalOpen = true
    }

    myVideo = getMediaResult.stream
  }

  function createMyPeer(user: TUser | null) {
    if (!user) {
      myPeer?.destroy()
      myPeer = null
      return
    }
    // I'm joining the room, mates are getting my info
    myPeer = new Peer(user.id)
    // mates will connect
    myPeer.on('connection', (conn) => {
      peerCons.push(conn)
      conn.on('data', (data) => console.log(data))
      conn.on('open', () => conn.send('hi from new user!'))
    })
    // mates will call
    myPeer.on('call', async (call) => {
      const myStream = myVideo || undefined
      call.answer(myStream)
      const mate = call.metadata.user as TUser
      call.once('stream', (stream) => {
        showVideo({ mate, stream })
      })
      call.on('close', () => handleMateLeaved(mate))
    })
  }

  async function handleMateJoined(mate: TUser) {
    // new mate joined the room
    if (!myPeer || !mate.id) return
    // I'm setting up peer connection with new mate
    const conn = myPeer.connect(mate.id)
    if (!conn) return

    peerCons.push(conn)
    conn.on('open', () => conn.send('hi from existing mate'))
    conn.on('data', (data) => console.log(data))
    // I'm calling new mate with my video stream
    const myStream = myVideo
    if (!myStream) return
    const call = myPeer.call(mate.id, myStream, { metadata: { user: $user } })
    call.once('stream', (stream) => showVideo({ mate, stream }))
    conn.on('close', () => handleMateLeaved(mate))
  }

  function handleMateLeaved(mate: TUser) {
    // do we need to close this peer connection?
    if (!mate?.id) return
    matesVideo = matesVideo.filter((item) => item.mate?.id !== mate.id)
  }

  function showVideo({ mate, stream }: MateVideo) {
    matesVideo = [...matesVideo, { mate, stream }]
  }

  function handleReload(evt: Event) {
    evt.preventDefault()
    errorModalOpen = false
  }

  onMount(async () => {
    await getInitialMedia()
    userUnsuscribe = user.subscribe(createMyPeer)
    socket.on(EEventRoom.userJoined, handleMateJoined)
    socket.on(EEventRoom.userLeaved, handleMateLeaved)
  })

  onDestroy(() => {
    userUnsuscribe?.()
    myPeer?.destroy()
    socket.off(EEventRoom.userJoined, handleMateJoined)
    socket.off(EEventRoom.userLeaved, handleMateLeaved)

    myVideo?.getTracks().forEach((track) => track.stop())
  })
</script>

<ul class="grid">
  {#if myVideo}
    <li class="grid-item bg-dark rounded">
      <div class="video-wrap">
        <Video src={myVideo} mirrored muted />
        <div class="controls">
          <div class="name">
            <UserName name={$user?.name} />
          </div>
        </div>
      </div>
    </li>
  {/if}
  {#each matesVideo as mateVideo (mateVideo.mate.id)}
    <li class="grid-item bg-dark rounded">
      <div class="video-wrap">
        <Video src={mateVideo.stream} />
        <div class="controls">
          <div class="name">
            <UserName name={mateVideo.mate.name} />
          </div>
        </div>
      </div>
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
