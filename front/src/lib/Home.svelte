<style>
  .icon {
    display: block;
    width: 1em;
    height: 1em;
  }

  @media (hover: hover) {
    .icon {
      width: 1rem;
      height: 1rem;
    }
  }
</style>

<script lang="ts">
  import { Button } from 'sveltestrap'
</script>

<Button on:click color="dark" type="button" size="lg">
  <svg class="icon" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-width="2" d="M3 10.807A3 3 0 0 1 4.096 8.49l5.366-4.405a4 4 0 0 1 5.076 0l5.366 4.405A3 3 0 0 1 21 10.807V18a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-7.193Z"/>
    <path stroke="currentColor" stroke-width="2" d="M15 21v-5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v5"/>
  </svg>
</Button>