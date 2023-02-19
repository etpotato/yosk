<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import MessageList from './MessageList.svelte'
  import ChatForm from './ChatForm.svelte'
  import Close from '../lib/Close.svelte'

  export let open: boolean

	const dispatch = createEventDispatcher();
  function handleClose(evt: Event) {
    dispatch('close', evt);
  }

  onMount(async () => {
    try {
      const smoothscroll = await import('smoothscroll-polyfill')
      smoothscroll.polyfill();
    } catch {}
  })
</script>

<div class="chat bg-white" class:open>
  <div class="chat-close">
    <Close on:click={handleClose} />
  </div>
  <div class="d-flex flex-column">
    <MessageList {open} />
    <ChatForm />
  </div>
</div>

<style>
  .chat {
    position: fixed;
    top: 100%;
    right: 0;
    bottom: 0;
    left: 0;
    display: grid;
    grid-template-rows: auto calc(100% - 33px);
    grid-gap: 0.25rem;
    padding: 0.5rem;
    transition: top 0.3s ease-in;
  }

  .chat.open {
    top: 0;
    transition: top 0.3s ease-out;
  }

  @media (min-width: 900px) {
    .chat {
      position: static;
      display: none;
      padding: 0.5rem 0;
      transform: none;
    }

    .chat.open {
      display: flex;
    }
  }

  .chat-close {
    max-width: max-content;
    margin-left: auto;
  }

  @media (min-width: 900px) {
    .chat-close {
      display: none;
    }
  }
</style>