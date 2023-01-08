<style>
  .chat-list {
    display: grid;
    grid-template-columns: 36px 1fr;
    grid-gap: 0.25em;
    align-content: start;
    margin: 0;
    padding: 0;
    width: 320px;
    min-width: 25vw;
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

  .chat-info {
    max-width: max-content;
    margin: 0 auto;
    padding: 0.2em 1.2em;
    border-radius: 100em;
    font-size: 0.7em;
    line-height: 1;
    text-align: center;
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

<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte'
  import Autolinker from 'autolinker'
  import { EEventMsg, EEventRoom, EMsgType } from '@dto'

  import type { TMessageReq, TMessageRes } from '@dto'
  import socket from './ws'
  import formatTime from '../utils/formatTime'
  import { user } from '../store/user'

  let input: TMessageReq = ''
  let messages: TMessageRes[] = []
  let chatList: HTMLElement

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

  function formatText(msg: TMessageRes) {
    return msg.type === EMsgType.user
      ? {
          ...msg,
          text: Autolinker.link(msg.text, { className: 'text-link' }),
        }
      : msg
  }

  onMount(() => {
    socket.on(EEventMsg.all, async (allMsg) => {
      messages = allMsg.map(formatText)
      await tick()
      chatList?.scrollTo(0, chatList.scrollHeight)
    })

    socket.on(EEventMsg.new, async (msg) => {
      messages = [...messages, formatText(msg)]
      await tick()
      chatList?.scrollTo(0, chatList.scrollHeight)
    })
  })

  onDestroy(() => {
    socket.removeAllListeners(EEventMsg.all)
    socket.removeAllListeners(EEventMsg.new)
  })
</script>

<div class="d-flex flex-column vh-100 py-2">
  <ul class="chat-list flex-grow-1 mb-1 bg-primary bg-opacity-10 rounded p-2" bind:this={chatList}>
    {#each messages as message (message.id)}
      <li class="chat-message">
        {#if message.type === EMsgType.info}
          <div />
          <div class="chat-info text-bg-dark bg-opacity-25">
            <b>{message.user.name}</b>
            {message.action === EEventRoom.userJoined ? 'joined' : 'leaved'} the chat
          </div>
        {:else}
          <div class="chat-left">
            <div class="chat-avatar bg-body rounded border border-1">
              <img
                src="https://avatars.dicebear.com/api/croodles-neutral/{message.author.id}.svg"
                alt={message.author.name}
                width="36"
                height="36"
              />
            </div>
          </div>
          <div
            class="chat-right rounded small {$user?.id !== message.author.id
              ? 'bg-body border border-1'
              : 'bg-dark text-bg-dark'}"
          >
            <p class="fw-bold mb-1">{message.author.name}</p>
            <p class="chat-text">{@html message.text}</p>
            <p class="chat-time">
              {formatTime(new Date(message.timestamp * 1000))}
            </p>
          </div>
        {/if}
      </li>
    {/each}
  </ul>

  <form action="/" on:submit={sendMessage}>
    <textarea
      class="chat-input form-control"
      bind:value={input}
      on:keydown={handleEnter}
      placeholder="Enter message"
      rows={3}
    />
  </form>
</div>
