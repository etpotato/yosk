<!-- https://www.svgrepo.com/collection/nova-circular-line-icons -->
<style>
  .icon {
    display: block;
    width: 1rem;
    height: 1rem;
  }
</style>

<script lang="ts">
  import { Button } from 'sveltestrap'
</script>

<Button on:click color="light" class="d-block" type="button">
  <svg class="icon" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="m6 6 12 12M18 6 6 18"/>
  </svg>
</Button>
