<!-- https://www.svgrepo.com/collection/nova-circular-line-icons -->
<style>
  .text {
    position: relative;
  }

  .icon {
    display: block;
    width: 1rem;
    height: 1rem;
  }

  .count {
    position: absolute;
    top: 0;
    right: 0;
    min-width: 20px;
    padding: 0.3em;
    font-size: 0.7em;
    font-weight: 600;
    line-height: 1.2;
    color: var(--bs-white);
    background-color: var(--bs-primary);
    border-radius: 100em;
    transform: translate(18px, -18px);
  }
</style>

<script lang="ts">
  import { Button } from 'sveltestrap'

  export let count: number
</script>

<Button on:click color="dark" type="submit" class="ms-auto" outline>
  <span class="text">
    <svg class="icon" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" stroke-width="2" d="M12 21a9 9 0 1 0-7.403-3.88c.105.15.126.345.048.512l-1.218 2.62a.5.5 0 0 0 .435.748H12Z"/>
      <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M9 14h6M9 10h2"/>
    </svg>
    {#if count > 0}
      <span class="count">{count}</span>  
    {/if}
  </span>
</Button>