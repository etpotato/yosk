<style>
  .text {
    display: none;
  }

  @media (min-width: 900px) {
    .text {
      display: inline;
    }
  }

  .icon {
    width: 1rem;
    height: 1rem;
  }
</style>

<script lang="ts">
  import { Button } from 'sveltestrap'

  async function handleCopy(evt: Event) {
    evt.preventDefault()
    ;(evt.currentTarget as HTMLButtonElement)?.blur()
    navigator.clipboard.writeText(window.location.href)
  }
</script>

<Button on:click={handleCopy} on:click color="dark" outline class="d-flex align-items-center" type="button">
  <span class="text me-2">Copy link</span>
  <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-width="2" d="M10 13a3 3 0 0 1 3-3h5a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-5a3 3 0 0 1-3-3v-5Z"/>
    <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M14 6.208V6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v5a3 3 0 0 0 3 3h.208"/>
  </svg>
</Button>
