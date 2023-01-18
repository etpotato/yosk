<script lang="ts">
  import { Button } from 'sveltestrap'
  
  export let name = ''
</script>

<Button class="ms-auto rounded-pill" color="dark" disabled>{name}</Button>