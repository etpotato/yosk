<style>
  .cam {
    display: block;
    width: 1em;
    height: 1em;
  }

  @media (hover: hover) {
    .cam {
      width: 1rem;
      height: 1rem;
    }
  }

</style>

<script lang="ts">
  import { Button } from 'sveltestrap'

  export let active: boolean
</script>

<Button on:click color="dark" type="button" size="lg">
  {#if active}
    <svg viewBox="0 0 24 24" fill="none" class="cam">
      <path
        d="M3 8C3 6.34315 4.34315 5 6 5H13C14.6569 5 16 6.34315 16 8V16C16 17.6569 14.6569 19 13 19H6C4.34315 19 3 17.6569 3 16V8Z"
        stroke="#ffffff"
        stroke-width="2"
      />
      <path
        d="M19.331 16.4979L16.331 13.7979C16.1203 13.6083 16 13.3381 16 13.0546V10.9454C16 10.6619 16.1203 10.3917 16.331 10.2021L19.331 7.50208C19.9746 6.92291 21 7.3796 21 8.24537V15.7546C21 16.6204 19.9746 17.0771 19.331 16.4979Z"
        stroke="#ffffff"
        stroke-width="2"
        stroke-linejoin="round"
      />
    </svg>
  {:else}
    <svg viewBox="0 0 24 24" fill="none" class="cam">
      <path
        d="M10 4C9.44772 4 9 4.44772 9 5C9 5.55228 9.44772 6 10 6V4ZM15 11.5C15 12.0523 15.4477 12.5 16 12.5C16.5523 12.5 17 12.0523 17 11.5H15ZM13 18H6V20H13V18ZM4 16V7H2V16H4ZM10 6H13V4H10V6ZM15 8V11.5H17V8H15ZM6 18C4.89543 18 4 17.1046 4 16H2C2 18.2091 3.79086 20 6 20V18ZM13 20C15.2091 20 17 18.2091 17 16H15C15 17.1046 14.1046 18 13 18V20ZM13 6C14.1046 6 15 6.89543 15 8H17C17 5.79086 15.2091 4 13 4V6ZM4 7C4 6.44772 4.44772 6 5 6V4C3.34315 4 2 5.34315 2 7H4Z"
        fill="#EE4B2B"
      />
      <path
        d="M19.331 7.50208L18.6621 6.75878L19.331 7.50208ZM20 16C20 16.5523 20.4477 17 21 17C21.5523 17 22 16.5523 22 16H20ZM18.6621 6.75878L15.331 9.75671L16.669 11.2433L20 8.24537L18.6621 6.75878ZM20 8.24537L20 8.24537H22C22 6.51383 19.9491 5.60044 18.6621 6.75878L20 8.24537ZM22 16V8.24537H20V16H22Z"
        fill="#EE4B2B"
      />
      <path
        d="M3 3L21 21"
        stroke="#EE4B2B"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  {/if}
</Button>
