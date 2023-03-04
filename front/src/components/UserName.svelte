<script lang="ts">
  import { Button } from 'sveltestrap'

  export let name = ''
  export let mine = false
</script>

{#if mine}
  <Button class="opacity-50 bg-transparent border-0 px-0" color="dark" size="sm" disabled>{name}</Button>
{:else}
  <Button class="opacity-100 bg-transparent border-0 text-start" color="dark" size="sm" disabled>
    <span class="wrap">{name}</span>
  </Button>
{/if}

<style>
  .wrap {
    word-break: break-word; 
  }
</style>