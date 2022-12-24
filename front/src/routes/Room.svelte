<style>
  .room {
    min-height: 100vh;
    display: flex;
    gap: 1em;
  }

  .room-video {
    flex: 1 0 auto;
  }

  .video-grid {
    display: grid;
    grid-template-columns: 1fr, 1fr;
  }

  .noroom {
    display: grid;
    place-content: center;
    min-height: 100vh;
  }

  .toast-list {
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
  }

  .toast-wrap {
    margin-bottom: 2px;
    text-align: center;
  }
</style>

<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { scale } from 'svelte/transition'
  import { Link, navigate } from 'svelte-navigator'
  import {
    Button,
    Input,
    Label,
    Modal,
    ModalBody,
    Toast,
    ToastBody,
  } from 'sveltestrap'
  import { Peer } from 'peerjs'
  import type { DataConnection } from 'peerjs'

  import { EEventRoom, type TUser } from '@dto'
  import type { TRoom } from '@dto'
  import socket from '../lib/ws'
  import { user } from '../store/user'
  import Chat from '../lib/Chat.svelte'

  type TToast = {
    type: EEventRoom.userLeaved | EEventRoom.userJoined
    user: TUser
  }

  export let roomId: TRoom['id']
  let roomExist: boolean = true
  let modalOpen: boolean = true
  let name: string = ''
  let toasts: TToast[] = []
  let toastTimeouts: NodeJS.Timeout[] = []
  let myPeer: Peer
  let peerCons: DataConnection[] = []
  let videoStreams: MediaStream[] = []

  function checkRoom(id: TRoom['id']) {
    socket.emit(EEventRoom.check, id, (ack) => {
      roomExist = ack
    })
  }

  function joinRoom(evt: Event) {
    evt.preventDefault()
    socket.emit(EEventRoom.join, { roomId, name }, (userInfo) => {
      user.set(userInfo)
      myPeer = new Peer(userInfo.id)
      myPeer.on('connection', (conn) => {
        peerCons.push(conn)
        conn.on('data', (data) => console.log(data))
        conn.on('open', () => conn.send('hello!'))
      })
      myPeer.on('call', async (call) => {
        const stream = await getUserMedia()
        if (!stream) return
        call.answer(stream)
        call.on('stream', showVideo)
      })
    })
    modalOpen = false
  }

  socket.on(EEventRoom.userJoined, async (user) => {
    addToast({ type: EEventRoom.userJoined, user })
    // setup peer connection
    const conn = myPeer.connect(user.id)
    peerCons.push(conn)
    conn.on('open', () => conn.send('hi from existing neighbor'))
    conn.on('data', (data) => console.log(data))
    // setup media stream
    const stream = await getUserMedia()
    if (!stream) return
    const call = myPeer.call(user.id, stream)
    call.on('stream', showVideo)
  })

  socket.on(EEventRoom.userLeaved, (user) => {
    addToast({ type: EEventRoom.userLeaved, user })
  })

  onMount(() => {
    checkRoom(roomId)
  })

  onDestroy(() => {
    socket.emit(EEventRoom.leave)
    socket.removeAllListeners(EEventRoom.userJoined)
    socket.removeAllListeners(EEventRoom.userLeaved)
    peerCons.forEach((conn) => conn.close())
    toastTimeouts.forEach((timeout) => clearTimeout(timeout))
  })

  function showVideo(stream: MediaStream) {
    videoStreams.push(stream)
  }

  async function getUserMedia() {
    let stream = null
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      })
    } catch (err) {
      console.log('getUserMedia error', err)
    }
    return stream
  }

  function addToast(newToast: TToast) {
    toasts = [...toasts, newToast]
    const timeout = setTimeout(() => {
      toasts = toasts.filter((toast) => toast !== newToast)
      toastTimeouts.filter((to) => to !== timeout)
    }, 5000)
    toastTimeouts.push(timeout)
  }
</script>

{#if roomExist}
  <div class="room">
    <div class="room-video">
      <Button on:click={() => navigate('/')} outline class="mb-3" color="dark"
        >Home</Button
      >
      <div>
        Room id: {roomId}, user: {$user?.name ? $user?.name : ''}
        <div class="video-grid">
          {#each videoStreams as videoStream}
            <!-- svelte-ignore a11y-media-has-caption -->
            <video src={URL.createObjectURL(videoStream)} />
          {/each}
        </div>
      </div>
    </div>
    <div class="room-chat">
      <Chat />
    </div>

    <Modal isOpen={modalOpen} size="md" centered>
      <ModalBody class="p-4">
        <form action="/" on:submit={joinRoom}>
          <Label for="name">Your name</Label>
          <Input
            bind:value={name}
            name="name"
            type="text"
            id="name"
            placeholder="Name"
            class="mb-3"
            size="lg"
          />
          <Button
            color="dark"
            outline
            type="submit"
            class="d-block w-100"
            size="lg">Yes</Button
          >
        </form>
      </ModalBody>
    </Modal>
  </div>
  <div class="toast-list">
    {#each toasts as toast (toast.user.id)}
      <div transition:scale={{ opacity: 0, start: 0.7 }} class="toast-wrap">
        <Toast>
          <ToastBody>
            {#if toast.type === EEventRoom.userJoined}
              Say hi to <b>{toast.user.name}</b> 👋
            {:else}
              Bye <b>{toast.user.name}</b> 🤙
            {/if}
          </ToastBody>
        </Toast>
      </div>
    {/each}
  </div>
{:else}
  <div class="noroom">
    <h1 class="h2 mb-4">Room not found :(</h1>
    <Link class="btn btn-outline-dark" to="/">Home</Link>
  </div>
{/if}
