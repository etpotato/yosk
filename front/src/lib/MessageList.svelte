<script lang="ts">
  import Message, { type MountedDetail } from './Message.svelte'
  import { EEventMsg, EMsgType, type TMessageRes } from '@dto'
  import Autolinker from 'autolinker'
  import { onDestroy, onMount, tick } from 'svelte'
  import socket from './ws'
  import { user } from '../store/user'
  import { unread } from '../store/unread'

  let messages: TMessageRes[] = []
  let chatList: HTMLElement
  let observer: IntersectionObserver

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
    await tick()
    // chatList?.scrollTo(0, chatList.scrollHeight)
  }

  async function handleNewMessage(msg: TMessageRes) {
    messages = [...messages, formatText(msg)]
    if (msg.type !== EMsgType.user) return
    
    if (msg.author.id !== $user?.id) {
      unread.update((state) => [...state, msg.id])
      return
    }

    await tick()
    chatList?.scrollTo(0, chatList.scrollHeight)
  }

  function handleMsgMounted(evt: CustomEvent<MountedDetail['mounted']>) {
    const needToObserve = $unread.includes(evt.detail.id)
    if (needToObserve && observer) {
      observer.observe(evt.detail.ref)
    }
  }

  const observerCb: IntersectionObserverCallback = (entries, observerInstance) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        observerInstance.unobserve(entry.target)
        unread.update((state) => state.filter((msgId) => msgId !== entry.target.getAttribute('data-id')))
      }
    })
  }

  onMount(() => {
    socket.on(EEventMsg.all, handleAllMessages)
    socket.on(EEventMsg.new, handleNewMessage)
    observer = new IntersectionObserver(observerCb, { root: chatList, rootMargin: '-30px' })
  })

  onDestroy(() => {
    socket.removeAllListeners(EEventMsg.all)
    socket.removeAllListeners(EEventMsg.new)
    observer?.disconnect()
  })
</script>

<ul class="msg-list flex-grow-1 mb-1 bg-primary bg-opacity-10 rounded p-2 border" bind:this={chatList}>
  {#each messages as message (message.id)}
    <Message 
      {message} 
      my={message.type === EMsgType.user && message.author.id === $user?.id}
      on:mounted={handleMsgMounted}
    />
  {/each}
</ul>

<style>
  .msg-list {
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
</style>