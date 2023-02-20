<style>
  .counter {
    display: block;
    min-width: 1.8em;
    padding: 0.3em;
    font-size: 0.5em;
    font-weight: 600;
    line-height: 1.2;
    /* color: var(--bs-white);
    background-color: var(--bs-primary); */
    border-radius: 100em;
  }
</style>

<script lang="ts">
  import { unread } from '../store/unread'

  export let className = ''
</script>

{#if $unread.length > 0}
  <span class="counter bg-primary text-white {className}">{$unread.length}</span>
{/if}
