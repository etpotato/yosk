<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { fade, scale } from 'svelte/transition'
  import { Link, navigate } from 'svelte-navigator'
  import { Button, Input, Label, Modal, ModalBody, Toast, ToastBody } from 'sveltestrap'

  import { EEventRoom, type TUser } from '@dto'
  import type { TRoom } from '@dto'
  import socket from '../lib/ws'
  import { user } from '../store/user';
  import Chat from '../lib/Chat.svelte'

  type TToast = { type: EEventRoom.userLeaved | EEventRoom.userJoined, user: TUser }

  export let roomId: TRoom['id']
  let roomExist: boolean = true
  let modalOpen: boolean = true
  let name: string = ''
  let toasts: TToast[] = []
  let toastTimeouts: NodeJS.Timeout[] = []

  function checkRoom(id: TRoom['id']) {
    console.log('room:check')
    socket.emit(EEventRoom.check, id, (ack) => {
      roomExist = ack
      console.log(`room:check - ${ack}`)
    })
  }

  function joinRoom(evt: Event) {
    evt.preventDefault()
    socket.emit(EEventRoom.join, { roomId, name }, (userInfo) => {
      user.set(userInfo)
    });
    modalOpen = false
  }

  function addToast(newToast: TToast) {
    toasts = [...toasts, newToast]
    const timeout = setTimeout(() => {
      toasts = toasts.filter((toast) => toast !== newToast)
      toastTimeouts.filter((to) => to !== timeout)
    }, 5000)
    toastTimeouts.push(timeout)
  }

  socket.on((EEventRoom.userJoined), (user) => {
    addToast({type: EEventRoom.userJoined, user})
  })

  socket.on((EEventRoom.userLeaved), (user) => {
    addToast({type: EEventRoom.userLeaved, user})
  })

  onMount(() => {
    checkRoom(roomId)
  })

  onDestroy(() => {
    socket.emit(EEventRoom.leave)
    socket.removeAllListeners(EEventRoom.userJoined)
    socket.removeAllListeners(EEventRoom.userLeaved)
    toastTimeouts.forEach((timeout) => clearTimeout(timeout))
  })
</script>

{#if roomExist}
  <div class="room">
    <div class="room-video">
      <Button on:click={() => navigate('/')} outline class="mb-3" color="dark">Home</Button>
      <div>
        Room id: {roomId}, user: {$user?.name ? $user?.name : ''}
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
          <Button color="dark" outline type="submit" class="d-block w-100" size="lg">Yes</Button>
        </form>
      </ModalBody>
    </Modal>
  </div>
  <div class="toast-list">
  {#each toasts as toast (toast.user.id) }
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

<style>
  .room {
    min-height: 100vh;
    display: flex;
    gap: 1em;
  }

  .room-video {
    flex: 1 0 auto;
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
