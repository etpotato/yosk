<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { Link, navigate } from 'svelte-navigator'
  import { Button, Input, Label, Modal, ModalBody } from 'sveltestrap'

  import { EEventRoom, type TUser } from '@dto'
  import type { TRoom } from '@dto'
  import socket from '../lib/ws'
  import { user } from '../store/user'
  import Chat from '../lib/Chat.svelte'
  import VideoChat from '../lib/VideoChat.svelte'
  import Share from '../lib/Share.svelte'
  import ChatBtn from '../lib/ChatBtn.svelte'
  import EndCall from '../lib/EndCall.svelte'
  import VideoControl from '../lib/VideoControl.svelte'
  import InitialLayout from '../lib/InitialLayout.svelte';
  import Toast, { SHARE,  type ToastData } from '../lib/Toast.svelte';
  import { getEscHandler } from '../utils/getEscHandler'

  export let roomId: TRoom['id']

  const LOCAL_NAME = 'yosk_name'

  let initialLoad = true
  let roomExist = true
  let modalOpen = true
  let chatOpen = false
  let name = ''
  let toasts: ToastData[] = []
  let toastId = 0
  let toastTimeouts: ReturnType<typeof setTimeout>[] = []
  let micActive = true
  let camActive = true

  function checkRoom(id: TRoom['id']) {
    socket.emit(EEventRoom.check, id, (ack) => {
      roomExist = ack
      initialLoad = false
    })
  }

  function joinRoom(evt: Event) {
    evt.preventDefault()
    socket.emit(EEventRoom.join, { roomId, name }, (userInfo) => {
      user.set(userInfo)
      roomExist = Boolean(userInfo)
    })
    window.localStorage.setItem(LOCAL_NAME, name)
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

  function addToast(newToast: ToastData) {
    toasts = [...toasts, newToast]
    const timeout = setTimeout(() => {
      toasts = toasts.filter((toast) => toast !== newToast)
      toastTimeouts.filter((to) => to !== timeout)
    }, 3000)
    toastTimeouts.push(timeout)
  }

  function handleMic(evt: Event) {
    evt.preventDefault()
    ;(evt.currentTarget as HTMLButtonElement)?.blur()
    micActive = !micActive
  }

  function handleCam(evt: Event) {
    evt.preventDefault()
    ;(evt.currentTarget as HTMLButtonElement)?.blur()
    camActive = !camActive
  }

  onMount(() => {
    name = window.localStorage.getItem(LOCAL_NAME) || ''
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

{#if initialLoad || !roomExist}
  <InitialLayout>
    {#if !roomExist}
      <h1 class="noroom h2 mb-4">Room not found :(</h1>
      <Link class="btn btn-outline-dark" to="/">Home</Link>
    {/if}
  </InitialLayout>
{:else}
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
        <VideoChat {micActive} {camActive}/>
        <div class="room-controls">
          <div class="room-control-wrap room-control-left">
            <EndCall on:click={() => navigate('/')} />
            <Share on:click={handleShare} />
          </div>
          <div class="room-control-wrap">
            <VideoControl type="mic" active={micActive} on:click={handleMic} />
            <VideoControl type="cam" active={camActive} on:click={handleCam} />
          </div>
          <div class="room-control-wrap room-control-right">
            <ChatBtn {chatOpen} on:click={handleChatToggle}/>
          </div>
        </div>
      </div>
      <Chat open={chatOpen} on:close={handleChatToggle}/>
    </div>
    <div class="toast-list">
      {#each toasts as toast (toast.id)}
        <Toast data={toast} />
      {/each}
    </div>
  {/if}
{/if}

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
    padding: 0;
    padding-bottom: 0.5rem;
  }

  @media (min-width: 900px) {
    .room-video {
      flex: 1 0 auto;
    }
  }

  .room-controls {
    position: relative;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    justify-items: center;
    grid-gap: 0.25rem;
    isolation: isolate;
  }

  .room-controls::before {
    content: '';
    position: absolute;
    top: -0.6rem;
    right: -0.5rem;
    left: -0.5rem;
    height: 0.7rem;
    background-image: linear-gradient(to bottom,rgba(255,255,255,0),rgba(255,255,255,1) 90%, rgba(255,255,255,1));
  }

  .room-control-wrap {
    position: relative;
    display: flex;
    gap: 0.25rem;
  }

  .room-control-left {
    justify-self: start;
  }

  .room-control-right {
    justify-self: end;
  }

  .noroom {
    text-align: center;
    white-space: nowrap;
  }

  .toast-list {
    position: absolute;
    top: 48px;
    left: 50%;
    max-width: calc(100vw - 16px);
    transform: translateX(-50%);
  }
</style>