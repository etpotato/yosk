<script lang="ts">
  import Autolinker from 'autolinker'
  import { onDestroy, onMount, tick } from 'svelte'
  import { scale, fade } from 'svelte/transition'
  import { EEventMsg, EMsgType, type TMessageRes } from '@dto'
  import Message, { type MountedDetail } from './Message.svelte'
  import Scrolldown from './Scrolldown.svelte'
  import socket from './ws'
  import { user } from '../store/user'
  import { unread } from '../store/unread'

  export let open: boolean

  let messages: TMessageRes[] = []
  let chatList: HTMLElement
  let bottom: HTMLLIElement
  let msgObserver: IntersectionObserver
  let bottomObserver: IntersectionObserver
  let bottomVisible = true

  function formatText(msg: TMessageRes) {
    return msg.type === EMsgType.user
      ? {
          ...msg,
          text: Autolinker.link(msg.text, { className: 'text-link' }),
        }
      : msg
  }

  async function handleAllMessages(allMsg: TMessageRes[]) {
    messages = allMsg.map(formatText)
    unread.set(allMsg.flatMap((msg) => msg.type === EMsgType.user ? [msg.id] : []))
  }

  async function handleNewMessage(msg: TMessageRes) {
    messages = [...messages, formatText(msg)]

    const chatIsActive = open && $unread.length === 0 && bottomVisible && document.hasFocus()
    const msgIsMine = msg.type === EMsgType.user && msg.author.id === $user?.id
    const msgIsMates = msg.type === EMsgType.user && msg.author.id !== $user?.id

    if (msgIsMine || chatIsActive) {
      await tick()
      chatList?.scroll({top: chatList.scrollHeight, behavior: 'smooth'})
      return
    }

    if (msgIsMates) {
      unread.update((state) => [...state, msg.id])
    }
  }

  function handleMsgMounted(evt: CustomEvent<MountedDetail['mounted']>) {
    const needToObserve = $unread.includes(evt.detail.id)
    if (needToObserve && msgObserver) {
      msgObserver.observe(evt.detail.ref)
    }
  }

  const msgObserverCb: IntersectionObserverCallback = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        observer.unobserve(entry.target)
        unread.update((state) => state.filter((msgId) => msgId !== entry.target.getAttribute('data-id')))
      }
    })
  }

  const bottomObserverCb: IntersectionObserverCallback = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        bottomVisible = true
        unread.set([])
      } else {
        bottomVisible = false
      }
    })
  }

  function handleScrollDown(evt: Event) {
    evt.preventDefault();
    (evt.currentTarget as HTMLButtonElement).blur()
    chatList?.scroll({top: chatList.scrollHeight, behavior: 'smooth'})
    msgObserver?.disconnect()
  }

  onMount(() => {
    socket.on(EEventMsg.all, handleAllMessages)
    socket.on(EEventMsg.new, handleNewMessage)
    msgObserver = new IntersectionObserver(msgObserverCb, { root: chatList, rootMargin: '-30px' })
    bottomObserver = new IntersectionObserver(bottomObserverCb, { root: chatList, rootMargin: '30px' })
    bottomObserver.observe(bottom)
  })

  onDestroy(() => {
    socket.removeAllListeners(EEventMsg.all)
    socket.removeAllListeners(EEventMsg.new)
    msgObserver?.disconnect()
    bottomObserver?.disconnect()
  })
</script>

<div class="msg-list-wrap flex-grow-1 mb-1 bg-primary bg-opacity-10 rounded border">
  <ul class="msg-list p-2" bind:this={chatList}>
    {#each messages as message (message.id)}
      <Message
        {message} 
        my={message.type === EMsgType.user && message.author.id === $user?.id}
        on:mounted={handleMsgMounted}
        visible={!$unread.length || Number(message.id) < Number($unread[0])}
      />
    {/each}
    <li bind:this={bottom}></li>
  </ul>
  {#if $unread.length > 0}
    <div transition:scale={{ opacity: 0, duration: 200, start: 0.5 }} class="scrolldown">
      <Scrolldown on:click={handleScrollDown}/>  
    </div>
  {/if}
</div>

<style>
  .msg-list-wrap {
    position: relative;
    overflow: hidden;
  }

  .msg-list {
    max-height: 100%;
    margin: 0;
    padding: 0;
    list-style: none; 
    overflow: auto;

    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  @media (min-width: 900px) {
    .msg-list {
      width: 320px;
      min-width: 30vw;
    }
  }

  .msg-list::-webkit-scrollbar {
    display: none;
  }

  .scrolldown {
    position: absolute;
    right: 0.4rem;
    bottom: 1rem;
  }
</style>