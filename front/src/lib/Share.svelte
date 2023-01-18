<style>
  .icon {
    width: 1.5em;
    height: 1.5em;
    vertical-align: bottom;
  }
</style>

<script lang="ts">
  import { Button } from 'sveltestrap'

  function handleCopy(evt: Event) {
    evt.preventDefault()
    ;(evt.currentTarget as HTMLButtonElement)?.blur()
    navigator.clipboard.writeText(window.location.href)
  }
</script>

<Button on:click={handleCopy} on:click color="dark" outline type="button">
  Copy invite link
  <svg viewBox="0 0 24 24" fill="none" class="icon">
    <path
      d="M5 6C5 4.34315 6.34315 3 8 3H13.1716C13.702 3 14.2107 3.21071 14.5858 3.58579L18.4142 7.41421C18.7893 7.78929 19 8.29799 19 8.82843V18C19 19.6569 17.6569 21 16 21H8C6.34315 21 5 19.6569 5 18V6Z"
      stroke="currentColor"
      stroke-width="1.5"
    />
    <path d="M13 3V5C13 7.20914 14.7909 9 17 9H19" stroke="currentColor" stroke-width="1.5" />
  </svg>
</Button>
