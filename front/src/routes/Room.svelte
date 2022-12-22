<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { Link, navigate } from 'svelte-navigator'
  import {Button, Input, Label, Modal, ModalBody, Row, Col} from 'sveltestrap'

  import { EEventRoom } from '@dto'
  import type { TRoom } from '@dto'
  import socket from '../utils/ws'
  import { user } from '../store/user';
  import Chat from '../lib/Chat.svelte'

  export let roomId: TRoom['id']
  let roomExist: boolean = true
  let modalOpen: boolean = true
  let name: string = ''

  const checkRoom = (id: TRoom['id']) => {
    console.log('room:check')
    socket.emit(EEventRoom.check, id, (ack) => {
      roomExist = ack
      console.log(`room:check - ${ack}`)
    })
  }

  const joinRoom = (evt: Event) => {
    evt.preventDefault()
    socket.emit(EEventRoom.join, { roomId, name }, (userInfo) => {
      user.set(userInfo)
    });
    modalOpen = false
  }

  // TODO: add toast on userJoined

  onMount(() => {
    checkRoom(roomId)
  })

  onDestroy(() => {
    socket.emit(EEventRoom.leave)
  })

  console.log('roomId', roomId)
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
</style>
