
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
</style>

<script lang="ts">
  import { Button } from 'sveltestrap'
  import type { ButtonProps } from 'sveltestrap/src/Button'
  

  export let active = false

  let btnProps: Partial<ButtonProps>
  $: btnProps = active 
    ? {
      color: 'primary',
      class: 'bg-primary bg-opacity-75',
      disabled: !active,
    }: {
      color: 'light',
      disabled: !active,
    }

</script>

<Button on:click {...btnProps} type="submit" size="lg">
  <svg class="icon" fill="none" viewBox="0 0 24 24">
    <path stroke="{active ? '#fff' : 'currentColor'}" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.895 3.615a1.1 1.1 0 0 1 1.36 1.36l-4 13.999c-.428 1.5-2.432 1.781-3.258.458L10.2 14.947a4 4 0 0 0-1.277-1.277l-4.485-2.797c-1.323-.826-1.042-2.83.458-3.258l14-4ZM10.192 13.678l3.536-3.536"/>
  </svg>
</Button>
