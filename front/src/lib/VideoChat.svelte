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

  .grid::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 540px) {
    .grid {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      justify-content: center;
      gap: 0.25rem;
      margin: auto 0;
    }
  }

  @media (min-width: 540px) {
    .grid-item {
      flex: 0 0 min(49%, 30vw);
    }
  }

  .video-wrap {
    position: relative;
    display: grid;
    place-content: center;
    padding-top: 100%;
    overflow: hidden;
  }

  @media (min-width: 900px) {
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
  import Mic from './Mic.svelte'
  import Cam from './Cam.svelte'
  import UserName from './UserName.svelte'

  type MateVideo = { mate: TUser; stream: MediaStream }

  let myPeer: Peer | null = null
  let peerCons: DataConnection[] = []
  let modalOpen = false
  let myVideo: MediaStream | null = null
  let micActive = true
  let camActive = true
  let matesVideo: MateVideo[] = []
  let userUnsuscribe: Unsubscriber

  onMount(async () => {
    myVideo = await getMedia()
    userUnsuscribe = user.subscribe(createPeerConn)
    socket.on(EEventRoom.userJoined, handleMateJoined)
    socket.on(EEventRoom.userLeaved, handleMateLeaved)
  })

  onDestroy(() => {
    userUnsuscribe?.()
    myPeer?.destroy()
    socket.off(EEventRoom.userJoined, handleMateJoined)
    socket.off(EEventRoom.userLeaved, handleMateLeaved)

    if (myVideo) {
      myVideo.getTracks().forEach((track) => track.stop())
    }
  })

  function createPeerConn(user: TUser | null) {
    if (!user) {
      myPeer?.destroy()
      myPeer = null
      return
    }
    // user is joined the room, mates get new user info
    myPeer = new Peer(user.id)
    // mates will connect
    myPeer.on('connection', (conn) => {
      peerCons.push(conn)
      conn.on('data', (data) => console.log(data))
      conn.on('open', () => conn.send('hello!'))
    })
    // mates will call
    myPeer.on('call', async (call) => {
      const myStream = myVideo || undefined
      call.answer(myStream)
      const mate = call.metadata.user as TUser
      call.once('stream', (stream) => {
        showVideo({ mate, stream })
      })
    })
  }

  async function handleMateJoined(mate: TUser) {
    if (!myPeer || !mate.id) return
    // setup peer connection with new mate
    const conn = myPeer.connect(mate.id)
    peerCons.push(conn)
    conn.on('open', () => conn.send('hi from existing mate'))
    conn.on('data', (data) => console.log(data))
    // call mate with my video stream
    const myStream = myVideo
    if (!myStream) return
    const call = myPeer.call(mate.id, myStream, { metadata: { user: $user } })
    call.once('stream', (stream) => showVideo({ mate, stream }))
  }

  function handleMateLeaved(mate: TUser) {
    // do we need to close this peer connection?
    if (!mate?.id) return
    matesVideo = matesVideo.filter((item) => item.mate?.id !== mate.id)
  }

  async function getMedia() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          facingMode: 'user',
          width: 1280, 
          height: 720,
        },
      })

      stream?.getAudioTracks().forEach((track) => {
        track.enabled = micActive
      })
      stream?.getVideoTracks().forEach((track) => {
        track.enabled = camActive
      })

      return stream
    } catch (err) {
      console.log('getUserMedia all error:', err)
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: 1280, 
          height: 720,
        },
      })

      stream?.getVideoTracks().forEach((track) => {
        track.enabled = camActive
      })

      return stream
    } catch (err) {
      console.log('getUserMedia video error:', err)
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })

      stream?.getAudioTracks().forEach((track) => {
        track.enabled = micActive
      })

      return stream
    } catch (err) {
      console.log('getUserMedia audio error:', err)
      modalOpen = true
    }

    return null
  }

  function showVideo({ mate, stream }: MateVideo) {
    matesVideo = [...matesVideo, { mate, stream }]
  }

  function closeModal(evt: Event) {
    evt.preventDefault()
    modalOpen = false
  }

  function handleMic(evt: Event) {
    evt.preventDefault()
    ;(evt.currentTarget as HTMLButtonElement)?.blur()

    micActive = !micActive
    myVideo?.getAudioTracks().forEach((track) => {
      track.enabled = micActive
    })
  }

  function handleCam(evt: Event) {
    evt.preventDefault()
    ;(evt.currentTarget as HTMLButtonElement)?.blur()

    camActive = !camActive
    myVideo?.getVideoTracks().forEach((track) => {
      track.enabled = camActive
    })
  }
</script>

<ul class="grid">
  {#if myVideo}
    <li class="grid-item bg-dark rounded">
      <div class="video-wrap">
        <Video src={myVideo} mirrored muted />
        <div class="controls">
          <Mic active={micActive} on:click={handleMic} />
          <Cam active={camActive} on:click={handleCam} />
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
<Modal isOpen={modalOpen} size="md" centered>
  <ModalBody class="p-4">
    <p>
      There is an error with your video. Try to reload the page and give permissions to capture
      video and audio
    </p>
    <Button on:click={closeModal} color="dark" outline type="submit" class="d-block w-100" size="lg"
      >Ok</Button
    >
  </ModalBody>
</Modal>
