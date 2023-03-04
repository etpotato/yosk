<script lang="ts">
  import { EEventMsg } from '@dto'
  import type { TMessageReq } from '@dto'
  import socket from '../lib/ws'
  import Send from './Send.svelte'

  let textarea: HTMLTextAreaElement
  let input: TMessageReq = ''

  const sendMessage = (evt?: Event) => {
    evt?.preventDefault()
    const msg = input.trim()
    if (msg) {
      socket.emit(EEventMsg.sent, msg)
      input = ''
      textarea.style.height = 'auto'
    }
    textarea.focus()
  }

  const handleEnter = (evt: KeyboardEvent) => {
    if (evt.key === 'Enter') {
      sendMessage(evt)
    }
  }

  function resizeInput() {
    textarea.style.height = `${textarea.scrollHeight}px`
  }
</script>

<form action="/" on:submit={sendMessage} class="chat-form">
  <textarea
    class="chat-input form-control form-control-lg"
    bind:this={textarea}
    on:input={resizeInput}
    bind:value={input}
    on:keydown={handleEnter}
    placeholder="Enter message"
    rows={1}
    autocomplete="off"
  />
  <span class="chat-send">
    <Send active={input.trim().length > 0}/>
  </span>
</form>

<style>
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
