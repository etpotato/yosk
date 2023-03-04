<!-- https://www.svgrepo.com/collection/nova-circular-line-icons/1 -->
<script lang="ts">
  import { Button } from 'sveltestrap'
  import Counter from './Counter.svelte'
</script>

<div class="position-relative">
  <span class="background bg-body rounded rounded-pill"></span>
  <Button on:click class="d-block position-relative rounded rounded-pill bg-body text-dark border-dark border-opacity-50" color="dark" type="button" size="lg" outline>
    <svg class="icon" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12h18m0 0-7 7m7-7-7-7"/>
    </svg>
    <span class="count">
      <Counter />
    </span>
  </Button>
</div>

<style>
  .background {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  .icon {
    display: block;
    width: 1em;
    height: 1em;
    transform: rotate(90deg);
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
    transform: translate(0.2em, -0.2em);
  }
</style>