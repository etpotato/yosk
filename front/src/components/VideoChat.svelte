<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import type { Unsubscriber } from 'svelte/store'
  import { Button, Modal, ModalBody } from 'sveltestrap'
  import { Peer } from 'peerjs'
  import type { DataConnection } from 'peerjs'
  import { EEventRoom, type TUser } from '@dto'
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
    peerCons.forEach((conn) => {
      conn.send({ micActive, camActive })
    })
  }

  async function getInitialMedia() {
    const getMediaResult = await getMedia({ micActive, camActive })

    if (getMediaResult.error) {
      errorModalOpen = true
    }

    myVideo = getMediaResult.stream
  }

  function handleVideoInfo(data: VideoInfo, peer: string) {
    matesVideo = matesVideo.map((mateVideo) => {
      if (mateVideo.mate.id === peer) {
        return { ...mateVideo, micActive: data.micActive, camActive: data.camActive }
      }
      return mateVideo
    })
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
      conn.on('open', () => conn.send({ micActive, camActive }))
      conn.on('data', (data) => handleVideoInfo(data as VideoInfo, conn.peer))
      conn.on('error', (error) => {
        console.log('conn error')
        console.log(error)
      })
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
      call.on('error', (error) => {
        console.log('call err')
        console.log(error)
      })
    })

    myPeer.on('error', (error) => {
      console.log('myPeer error')
      console.log(error)
    })
  }

  async function handleMateJoined(mate: TUser) {
    // new mate joined the room
    if (!myPeer || !mate.id) return
    // I'm setting up peer connection with new mate
    const conn = myPeer.connect(mate.id)
    if (!conn) return

    peerCons.push(conn)
    conn.on('open', () => conn.send({ micActive, camActive }))
    conn.on('data', (data) => handleVideoInfo(data as VideoInfo, conn.peer))
    conn.on('close', () => handleMateLeaved(mate))
    conn.on('error', (error) => {
      console.log('conn error')
      console.log(error)
    })

    // I'm calling new mate with my video stream
    const myStream = myVideo
    if (!myStream) return
    const call = myPeer.call(mate.id, myStream, { metadata: { user: $user } })
    call.once('stream', (stream) => showVideo({ mate, stream }))
    
    call.on('error', (error) => {
      console.log('call err')
      console.log(error)
    })

    myPeer.on('error', (error) => {
      console.log('myPeer error')
      console.log(error)
    })
  }

  function handleMateLeaved(mate: TUser) {
    // do we need to close this peer connection?
    if (!mate?.id) return
    matesVideo = matesVideo.filter((item) => item.mate?.id !== mate.id)
  }

  function showVideo(video: MateVideo) {
    matesVideo = [...matesVideo, video]
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
