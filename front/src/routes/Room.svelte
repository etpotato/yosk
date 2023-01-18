<style>
  .room {
    min-height: 100vh;
  }

  @media (min-width: 900px) {
    .room {
      display: grid;
      grid-gap: 8px;
      grid-template-columns: 1fr auto;
    }
  }

  .room-video {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    padding: 0.5rem 0;
  }

  .room-controls {
    display: flex;
    gap: 0.25rem;
    margin-top: auto;
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
  import { Button, Input, Label, Modal, ModalBody, Toast, ToastBody } from 'sveltestrap'

  import { EEventRoom, type TUser } from '@dto'
  import type { TRoom } from '@dto'
  import socket from '../lib/ws'
  import { user } from '../store/user'
  import Chat from '../lib/Chat.svelte'
  import VideoChat from '../lib/VideoChat.svelte'
  import Share from '../lib/Share.svelte'

  const SHARE = 'share'

  type TToast =
    | {
        id: number
        type: EEventRoom.userLeaved | EEventRoom.userJoined
        name: TUser['name']
      }
    | {
        id: number
        type: typeof SHARE
      }

  export let roomId: TRoom['id']
  let roomExist = true
  let modalOpen = true
  let name = ''
  let toasts: TToast[] = []
  let toastId = 0
  let toastTimeouts: ReturnType<typeof setTimeout>[] = []

  function checkRoom(id: TRoom['id']) {
    socket.emit(EEventRoom.check, id, (ack) => {
      roomExist = ack
    })
  }

  function joinRoom(evt: Event) {
    evt.preventDefault()
    socket.emit(EEventRoom.join, { roomId, name }, (userInfo) => {
      user.set(userInfo)
    })
    modalOpen = false
  }

  onMount(() => {
    checkRoom(roomId)
    socket.on(EEventRoom.userJoined, handleMateJoined)
    socket.on(EEventRoom.userLeaved, handleMateLeaved)
  })

  onDestroy(() => {
    socket.emit(EEventRoom.leave)
    socket.off(EEventRoom.userJoined, handleMateJoined)
    socket.off(EEventRoom.userLeaved, handleMateLeaved)
    toastTimeouts.forEach((timeout) => clearTimeout(timeout))
    user.set(null)
  })

  function handleMateJoined(mate: TUser) {
    addToast({ id: toastId++, type: EEventRoom.userJoined, name: mate.name })
  }

  function handleMateLeaved(mate: TUser) {
    addToast({ id: toastId++, type: EEventRoom.userLeaved, name: mate.name })
  }

  function handleShare() {
    addToast({ id: toastId++, type: SHARE })
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
      <VideoChat />
      <div class="room-controls">
        <Button on:click={() => navigate('/')} color="dark">Go Home</Button>
        <Share on:click={handleShare} />
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
            bsSize="lg"
          />
          <Button color="dark" outline type="submit" class="d-block w-100" size="lg">Yes</Button>
        </form>
      </ModalBody>
    </Modal>
  </div>
  <div class="toast-list">
    {#each toasts as toast (toast.id)}
      <div transition:scale={{ opacity: 0, start: 0.7 }} class="toast-wrap">
        <Toast>
          <ToastBody>
            {#if toast.type === EEventRoom.userJoined}
              Say hi to <b>{toast.name}</b> 👋
            {:else if toast.type === EEventRoom.userLeaved}
              Bye <b>{toast.name}</b> 🤙
            {:else if toast.type === 'share'}
              Link copied to clipboard
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
