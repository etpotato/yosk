<script lang="ts">
  import { onMount } from 'svelte'
  import UserName from './UserName.svelte';

  export let muted = false
  export let src: MediaStream | null
  export let mirrored = false
  export let name = ''

  let videoEl: HTMLVideoElement

  onMount(() => {
    if (src) {
      videoEl.srcObject = src
      document.addEventListener('click', () => videoEl?.play(), { once: true })
    }
  })
</script>

<div class="video-wrap">
  <video bind:this={videoEl} {muted} class:mirrored class="video rounded" autoplay playsinline/>
  <div class="controls">
    <div class="name">
      <UserName {name} />
    </div>
  </div>
</div>

<style>
  .video-wrap {
    position: relative;
    display: grid;
    place-content: center;
    padding-top: 100%;
    overflow: hidden;
  }

  @media (min-aspect-ratio: 1 / 1) {
    .video-wrap {
      padding-top: 56.25%;
    }
  }

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
    transform: rotateY(180deg);
  }

  @media (min-width: 900px) {
    .video {
      object-fit: contain;
    }
  }

  .controls {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: flex-end;
    gap: 0.25rem;
    padding: 0.25rem;
    opacity: 0;
    transition: 0.2s opacity ease-in-out;
  }

  .video-wrap:hover .controls,
  .video-wrap:focus-within .controls {
    opacity: 0.8;
  }

  .name {
    position: absolute;
    top: 0.25rem;
    left: 0.25rem;
    right: 0.25rem;
  }

  @media (min-width: 900px) {
    .name {
      position: static;
      margin-left: auto;
    }
  }
</style>