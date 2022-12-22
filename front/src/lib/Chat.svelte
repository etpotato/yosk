<script lang="ts">
  import { tick } from 'svelte'
  import { EEventMsg, type TUser } from '@dto'

  import type { TMessageReq, TMessageRes } from '@dto'
  import socket from '../utils/ws'
  import formatTime from '../utils/formatTime'
  import getInitials from '../utils/getInitials'
  import { user } from '../store/user'

  let input: TMessageReq  = ''
  let messages: TMessageRes[] = []
  let chatList: HTMLUListElement

  const sendMessage = (evt?: Event) => {
    evt?.preventDefault()
    const msg = input.trim()

    if (!msg) return

    socket.emit(EEventMsg.sent, msg)

    input = ''
  }

  const handleEnter = (evt: KeyboardEvent) => {
    if (evt.key === 'Enter') {
      sendMessage(evt)
    }
  }

  socket.on(EEventMsg.all, async (allMsg) => {
    console.log(EEventMsg.all, allMsg)
    messages = [...allMsg, ...messages]

    await tick()
    console.log(chatList)
    chatList?.scrollTo(0, chatList.scrollHeight)
  })

  socket.on(EEventMsg.new, async (msg) => {
    console.log(EEventMsg.new, msg)
    messages = [...messages, msg]

    await tick()
    chatList?.scrollTo(0, chatList.scrollHeight)
  })
</script>

<div class="d-flex flex-column vh-100 py-2">
  <ul class="chat-list flex-grow-1 mb-1 bg-secondary bg-opacity-10 rounded p-2" bind:this={chatList}>
    {#each messages as message (message.id)}
      <li class="chat-message">
        <div class="chat-left">
          {#if $user?.id !== message.author.id}
            <div class="chat-avatar bg-body rounded">
              <img
                src="https://avatars.dicebear.com/api/croodles-neutral/{message.author.id}.svg"
                alt={message.author.name}
                width="36"
                height="36"
              >
              <!-- {getInitials(message.author.name)} -->
            </div>
          {/if}
        </div>
        <div class="chat-right rounded small {
          $user?.id !== message.author.id
            ? 'bg-body'
            : 'bg-dark text-bg-dark'}"
        >
          <p class="fw-bold mb-1">{message.author.name}</p>
          <p class="chat-text">{message.text}</p>
          <p class="chat-time">{formatTime(new Date(message.timestamp * 1000))}</p>
        </div>
      </li>
    {/each}
  </ul>

  <form action="/" on:submit={sendMessage}>
    <textarea class="chat-input form-control" bind:value={input} on:keydown={handleEnter} placeholder="Enter message" rows={3} />
  </form>
</div>

<style>
  .chat-list {
    display: grid;
    grid-template-columns: 36px 1fr;
    grid-gap: 0.3em;
    align-content: start;
    margin: 0;
    padding: 0;
    width: 320px;
    list-style: none;
    overflow: auto;
  }

  .chat-list::-webkit-scrollbar {
    display: none;
  }

  .chat-list {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .chat-message {
    display: contents;
  }

  .chat-left {
    align-self: end;
    min-width: 36px;
  }

  .chat-avatar {
    display: grid;
    place-content: center;
    width: 36px;
    height: 36px;
  }

  .chat-right {
    flex: 1 0 auto;
    padding: 0.3em 0.5em;
  }

  .chat-text {
    margin-bottom: 0;
    word-break: break-word;
  }

  .chat-time {
    margin: 0;
    font-size: 0.8em;
    text-align: right;
  }

  .chat-input {
    resize: none;
  }

  .chat-input::-webkit-scrollbar {
    display: none;
  }

  .chat-input {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
