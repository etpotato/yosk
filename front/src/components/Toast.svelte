<script context="module" lang="ts">
  export const SHARE = 'share'
  export type ToastData =
    | {
        id: number
        type: EEventRoom.userLeaved | EEventRoom.userJoined
        name: TUser['name']
      }
    | {
        id: number
        type: typeof SHARE
      }
</script>

<script lang="ts">
  import { scale } from 'svelte/transition'
  import { Toast, ToastBody } from 'sveltestrap'
  import { EEventRoom, type TUser } from '@dto'

  export let data: ToastData
</script>

<div transition:scale={{ opacity: 0, start: 0.7 }} class="toast-wrap">
  <Toast>
    <ToastBody>
      {#if data.type === EEventRoom.userJoined}
        Say hi to <b>{data.name}</b> 👋
      {:else if data.type === EEventRoom.userLeaved}
        Bye <b>{data.name}</b> 🤙
      {:else if data.type === SHARE}
        Link copied to clipboard
      {/if}
    </ToastBody>
  </Toast>
</div>

<style>
  .toast-wrap {
    margin-bottom: 2px;
    text-align: center;
  }
</style>