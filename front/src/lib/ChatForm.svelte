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

<script lang="ts">
  import { EEventMsg } from '@dto'
  import type { TMessageReq } from '@dto'
  import socket from './ws'
  import Send from './Send.svelte'

  let textarea: HTMLTextAreaElement
  let input: TMessageReq = ''

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

  function resizeInput() {
    textarea.style.height = `${textarea.scrollHeight}px`
  }

  function resetInput() {
    input = ''
    textarea.style.height = 'auto'
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
  />
  <span class="chat-send">
    <Send active={input.length > 0}/>
  </span>
</form>
