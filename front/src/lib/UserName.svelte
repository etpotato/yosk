<script lang="ts">
  import { Button } from 'sveltestrap'

  export let name = ''
</script>

<Button class="user-name rounded-pill" color="dark" size="sm" disabled>{name}</Button>
