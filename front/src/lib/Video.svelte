<style>
  .video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .video.mirrored {
    -webkit-transform: rotateY(180deg);
    transform: rotateY(180deg);
  }

  @media (min-width: 900px) {
    .video {
      object-fit: contain;
    }
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
      document.addEventListener('click', () => videoEl?.play(), { once: true })
    }
  })
</script>

<video bind:this={videoEl} {muted} class:mirrored class="video" autoplay playsinline/>
