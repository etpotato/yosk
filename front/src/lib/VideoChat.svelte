<style>
  .grid {
    display: grid;
    grid-gap: 0.25rem;
    grid-template-columns: repeat(2, 1fr);
    margin: 0;
    padding: 0.5rem 0;
    list-style: none;
  }

  .grid-item {
    display: grid;
    place-content: center;
    aspect-ratio: 4/3;
    overflow: hidden;
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

  let myPeer: Peer | null = null
  let peerCons: DataConnection[] = []
  let modalOpen = false
  let myVideo: MediaStream | null = null
  let matesVideo: { mate: TUser; stream: MediaStream }[] = []
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
      const mate = call.metadata.user
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
    let stream = null
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          facingMode: 'user',
        },
      })
    } catch (err) {
      console.log('getUserMedia error', err)
      modalOpen = true
    }
    return stream
  }

  function showVideo({ mate, stream }: { mate: TUser; stream: MediaStream }) {
    matesVideo = [...matesVideo, { mate, stream }]
  }

  function closeModal(evt: Event) {
    evt.preventDefault()
    modalOpen = false
  }
</script>

<ul class="grid">
  {#if myVideo}
    <li class="grid-item bg-dark rounded">
      <Video src={myVideo} mirrored muted />
    </li>
  {/if}
  {#each matesVideo as mateVideo (mateVideo.mate.id)}
    <li class="grid-item bg-dark rounded">
      <Video src={mateVideo.stream} />
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
