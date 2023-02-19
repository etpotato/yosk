<script context="module" lang="ts">
  export type MountedDetail = { mounted: { id: TMessageRes['id'], ref: HTMLLIElement }};
</script>

<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { EEventRoom, EMsgType, type TMessageRes } from '@dto'
  import { getAvatarUrl } from '../utils/getAvatarUrl'
  import { formatTime } from '../utils/formatTime'
  
  export let message: TMessageRes
  export let my: boolean
  export let visible: boolean

  let messageRef: HTMLLIElement
  
  const dispatch = createEventDispatcher<MountedDetail>()

  onMount(() => {
    if (message.type === EMsgType.user) {
      dispatch('mounted', { id: message.id, ref: messageRef })
    }
  })
</script>

<li class="msg" data-id={message.id} bind:this={messageRef}>
  {#if message.type === EMsgType.info}
    <div class="msg-info text-bg-dark bg-opacity-25">
      <b>{message.user.name}</b>
      {message.action === EEventRoom.userJoined ? 'joined' : 'leaved'} the chat
    </div>
  {:else if my}
    <div class="msg-avatar-wrap my">
      <img
        class="msg-avatar bg-dark rounded border border-1"
        src="{getAvatarUrl({ my: true, id: message.author.id })}"
        alt={message.author.name}
        width="46"
        height="46"
      />
    </div>
    <div
      class="msg-wrap rounded small my bg-dark text-bg-dark"
    >
      <p class="fw-bold mb-1 msg-name">{message.author.name} 
        <span class="msg-you fw-normal">you</span>
      </p>
      <p class="msg-text">{@html message.text}</p>
      <p class="msg-time">
        {formatTime(new Date(message.timestamp * 1000))}
      </p>
    </div>
  {:else}
    <div class="msg-avatar-wrap">
      <img
        class="msg-avatar bg-body rounded border border-1"
        src="{getAvatarUrl({ my: false, id: message.author.id })}"
        alt={message.author.name}
        width="46"
        height="46"
      />
    </div>
    <div
      class="msg-wrap rounded small border border-1 {visible ? 'bg-body' : 'bg-primary bg-opacity-10'}"
    >
      <p class="fw-bold mb-1 msg-name">{message.author.name}</p>
      <p class="msg-text">{@html message.text}</p>
      <p class="msg-time">
        {formatTime(new Date(message.timestamp * 1000))}
      </p>
    </div>        
  {/if}
</li>

<style>
  .msg {
    display: grid;
    grid-template-columns: 48px 1fr 48px;
    grid-gap: 0.25em;
    align-content: start;
    margin-bottom: 0.25rem;
  }

  .msg:last-child {
    margin-bottom: 0;
  }

  .msg-info {
    grid-column: 1 / -1;
    max-width: max-content;
    margin: 0 auto;
    padding: 0.2em 1.2em;
    border-radius: 100em;
    font-size: 0.7em;
    line-height: 1;
    text-align: center;
  }

  .msg-avatar-wrap {
    align-self: end;
    width: 48px;
    height: 48px;
  }

  .my.msg-avatar-wrap {
    grid-column: 3 / span 1;
  }

  .msg-avatar {
    display: block;
    width: 100%;
    height: 100%;
  }

  .msg-wrap {
    padding: 0.5em 0.7em;
    grid-column: span 2;
    transition: 0.5s background-color ease-out
  }

  .my.msg-wrap {
    grid-column: 1 / span 2;
    grid-row: 1;
  }

  .msg-name {
    word-break: break-word;
  }

  .msg-text {
    margin-bottom: 0;
    word-break: break-word;
  }

  .msg-time {
    margin: 0;
    font-size: 0.8em;
    text-align: right;
    opacity: 0.6;
  }

  .my .msg-time,
  .msg-you {
    opacity: 0.4;
  }
</style>