<!-- https://www.svgrepo.com/collection/nova-circular-line-icons -->
<style>
  .icon {
    display: block;
    width: 1em;
    height: 1em;
  }

  .fixed-size {
    width: 1rem;
    height: 1rem;
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

  export let type: 'mic' | 'cam'
  export let active: boolean
  export let disabled = false
  export let info = false
  export let size: ButtonProps['size'] = 'lg'

  // normalize icon size for btn-sm on touch device 
  const iconClass = `icon ${size === 'sm' ? 'fixed-size' : ''}`
</script>

<Button on:click {size} {disabled} class="{info ? 'opacity-100 bg-transparent border-0' : ''}" color="dark" type="button">
  {#if type === 'mic'}
    {#if  active}
      <svg fill="none" class={iconClass} viewBox="0 0 24 24">
        <path stroke="#fff" stroke-width="2" d="M8 6a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3V6Z"/>
        <path stroke="#fff" stroke-linecap="round" stroke-width="2" d="M19 11v1a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6v-1M12 18v3"/>
      </svg>
    {:else}
      <svg fill="none" class={iconClass} viewBox="0 0 24 24">
        <path fill="#EE4B2B" d="M15 11.5a1 1 0 1 0 2 0h-2ZM8.019 3.333a1 1 0 1 0 1.49 1.334l-1.49-1.334ZM11 4h2V2h-2v2Zm4 2v5.5h2V6h-2Zm-2 8h-2v2h2v-2Zm-2 0a2 2 0 0 1-2-2H7a4 4 0 0 0 4 4v-2Zm2-10a2 2 0 0 1 2 2h2a4 4 0 0 0-4-4v2Zm-2-2c-1.185 0-2.25.516-2.981 1.333l1.49 1.334C9.877 4.257 10.408 4 11 4V2ZM9 12V8H7v4h2Zm4.897 1.788A1.988 1.988 0 0 1 13 14v2c.644 0 1.255-.153 1.796-.425l-.899-1.787Z"/>
        <path stroke="#EE4B2B" stroke-linecap="round" stroke-width="2" d="M19 11v1a5.99 5.99 0 0 1-.341 2M5 11v1a6 6 0 0 0 6 6h2a5.973 5.973 0 0 0 3.5-1.126M12 18v3"/>
        <path stroke="#EE4B2B" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m3 3 18 18"/>
      </svg>
    {/if}
  {:else}
    {#if active}
    <svg fill="none" class={iconClass} viewBox="0 0 24 24">
      <path stroke="#fff" stroke-width="2" d="M3 8a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8Z"/>
      <path stroke="#fff" stroke-linejoin="round" stroke-width="2" d="m19.331 16.498-3-2.7a1 1 0 0 1-.331-.743v-2.11a1 1 0 0 1 .331-.743l3-2.7c.644-.58 1.669-.122 1.669.743v7.51c0 .865-1.025 1.322-1.669.743Z"/>
    </svg>
    {:else}
    <svg fill="none" class={iconClass} viewBox="0 0 24 24">
      <path fill="#EE4B2B" d="M10 4a1 1 0 0 0 0 2V4Zm5 7.5a1 1 0 1 0 2 0h-2ZM13 18H6v2h7v-2Zm-9-2V7H2v9h2Zm6-10h3V4h-3v2Zm5 2v3.5h2V8h-2ZM6 18a2 2 0 0 1-2-2H2a4 4 0 0 0 4 4v-2Zm7 2a4 4 0 0 0 4-4h-2a2 2 0 0 1-2 2v2Zm0-14a2 2 0 0 1 2 2h2a4 4 0 0 0-4-4v2ZM4 7a1 1 0 0 1 1-1V4a3 3 0 0 0-3 3h2Z"/>
      <path fill="#EE4B2B" d="m19.331 7.502-.669-.743.669.743ZM20 16a1 1 0 1 0 2 0h-2Zm-1.338-9.241-3.331 2.998 1.338 1.486L20 8.245 18.662 6.76ZM20 8.245h2c0-1.731-2.05-2.645-3.338-1.486L20 8.245ZM22 16V8.245h-2V16h2Z"/>
      <path stroke="#EE4B2B" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m3 3 18 18"/>
    </svg>
    {/if}
  {/if}
</Button>
