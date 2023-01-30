<style>
  .video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
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

<video bind:this={videoEl} {muted} class:mirrored class="video" autoplay playsinline/>
