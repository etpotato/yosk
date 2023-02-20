<script lang="ts">
  import { onMount } from 'svelte'
  import UserName from './UserName.svelte';
  import Mic from './Mic.svelte';
  import Cam from './Cam.svelte';

  export let muted = false
  export let src: MediaStream | null
  export let mirrored = false
  export let name = ''
  export let micActive = true
  export let camActive = true

  let videoEl: HTMLVideoElement

  async function playVideo() {
    try {
      videoEl?.play()
    } catch {}
  }

  onMount(() => {
    if (src) {
      videoEl.srcObject = src
      document.addEventListener('click', playVideo, { once: true })
    }
  })
</script>

<div class="video-wrap">
  <video bind:this={videoEl} {muted} class:mirrored class="video rounded" autoplay playsinline/>
  <div class="controls">
    {#if !micActive}
      <Mic active={micActive} disabled/>
    {/if}
    {#if !camActive}
      <Cam active={camActive} disabled/>
    {/if}
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
    user-select: none;
    pointer-events: none;
  }

  .name {
    position: absolute;
    top: 0.25rem;
    left: 0.25rem;
    right: 0.25rem;
    opacity: 0;
    transition: 0.2s opacity ease-in-out;
  }

  .video-wrap:hover .name,
  .video-wrap:focus-within .name {
    opacity: 0.8;
  }

  @media (min-width: 900px) {
    .name {
      position: static;
      margin-left: auto;
    }
  }
</style>
