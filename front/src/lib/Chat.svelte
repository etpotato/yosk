<style>
  .chat-list {
    margin: 0;
    padding: 0;
    list-style: none;
    overflow: auto;

    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  @media (min-width: 900px) {
    .chat-list {
      width: 320px;
      min-width: 30vw;
    }
  }

  .chat-list::-webkit-scrollbar {
    display: none;
  }

  .chat-message {
    display: grid;
    grid-template-columns: 48px 1fr 48px;
    grid-gap: 0.25em;
    align-content: start;
    margin-bottom: 0.25rem;
  }

  .chat-message:last-child {
    margin-bottom: 0;
  }

  .chat-info {
    grid-column: 1 / -1;
    max-width: max-content;
    margin: 0 auto;
    padding: 0.2em 1.2em;
    border-radius: 100em;
    font-size: 0.7em;
    line-height: 1;
    text-align: center;
  }

  .avatar-wrap {
    align-self: end;
    min-width: 48px;
  }

  .my.avatar-wrap {
    grid-column: 3 / span 1;
  }

  .chat-avatar {
    display: grid;
    place-content: center;
    width: 48px;
    height: 48px;
  }

  .msg-wrap {
    padding: 0.5em 0.7em;
    grid-column: span 2;
  }

  .my.msg-wrap {
    grid-column: 1 / span 2;
    grid-row: 1;
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

  .chat-form {
    position: relative;
  }

  .chat-input {
    padding-right: 64px;
    max-height: 150px;
    resize: none;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  @media (hover: hover) {
    .chat-input {
      font-size: 1rem;
    }
  }

  .chat-input::-webkit-scrollbar {
    display: none;
  }

  .chat-send {
    position: absolute;
    bottom: 0.33rem;
    right: 0.36rem;
    opacity: 0.8;
  }

  @media (hover: hover) {
    .chat-send {
      bottom: 0.275rem;
      right: 0.3rem;
    }
  }
</style>

<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte'
  import Autolinker from 'autolinker'
  import { EEventMsg, EEventRoom, EMsgType } from '@dto'

  import type { TMessageReq, TMessageRes } from '@dto'
  import socket from './ws'
  import Send from './Send.svelte'
  import formatTime from '../utils/formatTime'
  import { user } from '../store/user'

  let textarea: HTMLTextAreaElement
  let input: TMessageReq = ''
  let messages: TMessageRes[] = []
  let chatList: HTMLElement

  const sendMessage = (evt?: Event) => {
    evt?.preventDefault()
    const msg = input.trim()
    if (!msg) return
    socket.emit(EEventMsg.sent, msg)
    resetInput()
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

  function resizeInput() {
    textarea.style.height = `${textarea.scrollHeight}px`
  }

  function resetInput() {
    input = ''
    textarea.style.height = 'auto'
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

<div class="d-flex flex-column">
  <ul class="chat-list flex-grow-1 mb-1 bg-primary bg-opacity-10 rounded p-2 border" bind:this={chatList}>
    {#each messages as message (message.id)}
      <li class="chat-message">
        {#if message.type === EMsgType.info}
          <div class="chat-info text-bg-dark bg-opacity-25">
            <b>{message.user.name}</b>
            {message.action === EEventRoom.userJoined ? 'joined' : 'leaved'} the chat
          </div>
        {:else}
          <div class="avatar-wrap {$user?.id === message.author.id ? 'my' : ''}">
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
            class="msg-wrap rounded small {$user?.id === message.author.id
              ? 'my bg-dark text-bg-dark'
              : 'bg-body border border-1'}"
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

  <form action="/" on:submit={sendMessage} class="chat-form">
    <textarea
      class="chat-input form-control form-control-lg"
      bind:this={textarea}
      on:input={resizeInput}
      bind:value={input}
      on:keydown={handleEnter}
      placeholder="Enter message"
      rows={1}
    />
    <span class="chat-send">
      <Send />
    </span>
  </form>
</div>
