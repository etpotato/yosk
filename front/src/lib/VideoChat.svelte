<style>
  .grid {
    display: grid;
    grid-gap: 0.25rem;
    margin: 0;
    margin-bottom: 0.5rem;
    padding: 0;
    list-style: none;
  }

  @media (min-width: 540px) {
    .grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .grid-item {
    position: relative;
    display: grid;
    place-content: center;
    aspect-ratio: 4/3;
    overflow: hidden;
  }

  .controls {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: flex-end;
    gap: 0.25rem;
    padding: 0.25rem;
    opacity: 0.8;
  }

  @media (hover: hover) {
    .controls {
      opacity: 0.2;
      transition: 0.3s opacity;
    }

    .grid-item:hover .controls,
    .grid-item:focus-within .controls {
      opacity: 0.8;
    }
  }

  @media (min-width: 1280px) {
    .grid {
      grid-template-columns: repeat(3, 1fr);
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
      const stream = myVideo
      if (!stream) return
      const mate = call.metadata.user as TUser
      call.answer(stream)
      call.once('stream', (stream) => {
        showVideo({ mate, stream })
      })
    })
  }

  async function handleMateJoined(mate: TUser) {
    if (!myPeer) return
    // setup peer connection with new mate
    const conn = myPeer.connect(mate.id)
    peerCons.push(conn)
    conn.on('open', () => conn.send('hi from existing mate'))
    conn.on('data', (data) => console.log(data))
    // call mate with my video stream
    const stream = myVideo
    if (!stream) return
    const call = myPeer.call(mate.id, stream, { metadata: { user: $user } })
    call.once('stream', (stream) => showVideo({ mate, stream }))
  }

  function handleMateLeaved(mate: TUser) {
    // do we need to close this peer connection?
    matesVideo = matesVideo.filter((item) => item.mate.id !== mate.id)
  }

  async function getMedia() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          facingMode: 'user',
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
      <Video src={myVideo} mirrored muted />
      <div class="controls">
        <Mic active={micActive} on:click={handleMic} />
        <Cam active={camActive} on:click={handleCam} />
        <UserName name={$user?.name} />
      </div>
    </li>
  {/if}
  {#each matesVideo as mateVideo (mateVideo.mate.id)}
    <li class="grid-item bg-dark rounded">
      <Video src={mateVideo.stream} />
      <div class="controls">
        <UserName name={mateVideo.mate.name} />
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
