<script lang="ts">
  import Button from '@smui/button'
  import Textfield from '@smui/textfield'
  import { EEventMsg } from '@dto'
  import type { TMessageReq, TMessageRes } from '@dto'
  import socket from '../utils/ws'

  let input: TMessageReq  = ''
  let messages: TMessageRes[] = []

  const sendMessage = (evt: Event) => {
    evt.preventDefault()
    const msg = input.trim();

    if (!msg) return

    socket.emit(EEventMsg.sent, msg)

    input = ''
  }

  socket.on(EEventMsg.all, (allMsg) => {
    console.log(EEventMsg.all, allMsg)
    messages = [...allMsg, ...messages]
  })

  socket.on(EEventMsg.new, (msg) => {
    console.log(EEventMsg.new, msg)
    messages = [...messages, msg]
  })
</script>

<div>
  <ul>
    {#each messages as message (message.id)}
      <li>
        <p>{message.text}</p>
        <p>{message.author.name}</p>
        <p>{new Date(message.timestamp * 1000).toLocaleTimeString()}</p>
      </li>
    {/each}
  </ul>

  <form action="/" on:submit={sendMessage}>
    <div>
      <Textfield variant="outlined" bind:value={input} label="Enter message"/>
    </div>
    <Button variant="outlined" type="submit" touch>Send</Button>
  </form>
</div>
