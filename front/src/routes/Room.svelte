<style>
  .room {
    display: flex;
    flex-direction: column;
    height: 100vh;
    height: calc(var(--vh, 1vh) * 100);
  }

  @media (min-width: 900px) {
    .room {
      flex-direction: row;
      gap: 0.5rem;
    }
  }

  .room-video {
    flex: 1 0 100%;
    display: flex;
    flex-direction: column;
    padding: 0.5rem 0;
  }

  @media (min-width: 900px) {
    .room-video {
      flex: 1 0 auto;
    }
  }

  .room-controls {
    position: relative;
    display: flex;
    gap: 0.25rem;
    isolation: isolate;
  }

  .room-controls::before {
    content: '';
    position: absolute;
    top: -0.5rem;
    right: -0.5rem;
    left: -0.5rem;
    height: 0.6rem;
    background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
    z-index: -1;
  }

  .room-chat {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: grid;
    grid-template-rows: auto calc(100% - 30px);
    grid-gap: 0.25rem;
    padding: 0.5rem;
    transform: translateY(100%);
    transition: transform 0.3s ease-in;
  }

  .room-chat.open {
    transform: none;
    transition: transform 0.3s ease-out;
  }

  @media (min-width: 900px) {
    .room-chat {
      position: static;
      display: none;
      padding: 0.5rem 0;
      transform: none;
    }

    .room-chat.open {
      display: flex;
    }
  }

  .room-chat-close {
    max-width: max-content;
    margin-left: auto;
  }

  @media (min-width: 900px) {
    .room-chat-close {
      display: none;
    }
  }

  .noroom {
    display: grid;
    place-content: center;
    min-height: 100vh;
    min-height: calc(var(--vh, 1vh) * 100);
  }

  .toast-list {
    position: absolute;
    top: 8px;
    left: 50%;
    max-width: calc(100vw - 16px);
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
  import ChatBtn from '../lib/ChatBtn.svelte'
  import Close from '../lib/Close.svelte'
  import Home from '../lib/Home.svelte'
  import { getEscHandler } from '../utils/getEscHandler'

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
  let chatOpen = false
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

  function handleMateJoined(mate: TUser) {
    addToast({ id: toastId++, type: EEventRoom.userJoined, name: mate.name })
  }

  function handleMateLeaved(mate: TUser) {
    addToast({ id: toastId++, type: EEventRoom.userLeaved, name: mate.name })
  }

  function handleShare() {
    addToast({ id: toastId++, type: SHARE })
  }

  const handleChatEsc = getEscHandler(handleChatToggle)

  function handleChatToggle(evt?: Event) {
    (evt?.currentTarget as HTMLButtonElement)?.blur()
    chatOpen = !chatOpen

    if (chatOpen) {
      window.addEventListener('keydown', handleChatEsc)
    } else {
      window.removeEventListener('keydown', handleChatEsc)
    }
  }

  function addToast(newToast: TToast) {
    toasts = [...toasts, newToast]
    const timeout = setTimeout(() => {
      toasts = toasts.filter((toast) => toast !== newToast)
      toastTimeouts.filter((to) => to !== timeout)
    }, 3000)
    toastTimeouts.push(timeout)
  }

  onMount(() => {
    checkRoom(roomId)
    socket.on(EEventRoom.userJoined, handleMateJoined)
    socket.on(EEventRoom.userLeaved, handleMateLeaved)
    window.addEventListener('beforeunload unload', () => {
      socket.emit(EEventRoom.leave)
      socket.disconnect()
    })
  })

  onDestroy(() => {
    socket.emit(EEventRoom.leave)
    socket.off(EEventRoom.userJoined, handleMateJoined)
    socket.off(EEventRoom.userLeaved, handleMateLeaved)
    toastTimeouts.forEach((timeout) => clearTimeout(timeout))
    user.set(null)
    window.removeEventListener('keydown', handleChatEsc)
  })
</script>

{#if roomExist}
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
  {#if !modalOpen}
    <div class="room">
      <div class="room-video">
        <VideoChat />
        <div class="room-controls">
          <Home on:click={() => navigate('/')} />
          <Share on:click={handleShare} />
          <ChatBtn count={33} on:click={handleChatToggle}/>
        </div>
      </div>
      <div class="room-chat bg-white {chatOpen ? 'open' : ''}">
        <div class="room-chat-close">
          <Close on:click={handleChatToggle} />
        </div>
        <Chat />
      </div>
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
  {/if}
{:else}
  <div class="noroom">
    <h1 class="h2 mb-4">Room not found :(</h1>
    <Link class="btn btn-outline-dark" to="/">Home</Link>
  </div>
{/if}
