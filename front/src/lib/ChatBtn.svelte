<!-- https://www.svgrepo.com/collection/nova-circular-line-icons -->
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

  .count {
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(0.4em, -0.4em);
  }
</style>

<script lang="ts">
  import { Button } from 'sveltestrap'
  import Counter from './Counter.svelte'

  export let chatOpen: boolean
</script>

<Button on:click color="dark" type="submit" class="ms-auto position-relative" outline size="lg">
  {#if chatOpen}
    <svg class="icon" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12h18m0 0-7 7m7-7-7-7"/>
    </svg>
  {:else}
    <svg class="icon" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" stroke-width="2" d="M12 21a9 9 0 1 0-7.403-3.88c.105.15.126.345.048.512l-1.218 2.62a.5.5 0 0 0 .435.748H12Z"/>
      <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M9 14h6M9 10h2"/>
    </svg>
    <span class="count">
      <Counter /> 
    </span>
  {/if} 
</Button>
