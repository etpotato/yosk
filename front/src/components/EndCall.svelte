<style>
  .icon {
    display: block;
    width: 1em;
    height: 1em;
    transform: translateY(10%) rotate(136deg) scale(1.2);
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

<Button on:click color="danger" type="button" size="lg">
  <svg class="icon" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-width="1.5" d="M9.545 8.643c.404 1.458-.05 2.978-1.044 3.916-.189.178-.25.465-.102.678a9.493 9.493 0 0 0 2.358 2.36c.214.149.502.087.68-.103.935-1.002 2.46-1.461 3.922-1.056 1.97.546 3.08 2.455 2.477 4.264-1.765 5.3-8.56.047-10.572-1.967C5.203 14.673.03 7.917 5.284 6.165 7.093 5.56 9 6.67 9.546 8.642Z" clip-rule="evenodd"/>
  </svg>
</Button>