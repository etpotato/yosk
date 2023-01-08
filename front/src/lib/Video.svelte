<style>
  .video {
    display: block;
    max-width: 100%;
    aspect-ratio: 4/3;
    object-fit: contain;
    object-position: center;
  }

  .video.mirrored {
    transform: rotateY(180deg);
  }
</style>

<script lang="ts">
  import { onMount } from 'svelte'

  export let muted = false
  export let src: MediaStream | null
  export let mirrored = false

  let videoEl: HTMLVideoElement

  onMount(() => {
    if (src) {
      videoEl.srcObject = src
    }
  })
</script>

<video bind:this={videoEl} {muted} class:mirrored class="video" autoplay />
