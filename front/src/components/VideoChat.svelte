<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import type { Unsubscriber } from 'svelte/store'
  import { Button, Modal, ModalBody } from 'sveltestrap'
  import { EEventRoom, type TUser } from '@dto'
  import { user } from '../store/user'
  import socket from '../lib/ws'
  import { createMyPeer } from '../lib/peer'
  import type { TVideo, MateVideo, GetVideoInfo, HandleVideoInfo, HandleMateLeaved, HandleMatesVideo, GetVideo } from '../lib/peer'
  import Video from './Video.svelte'
  import { getMedia } from '../utils/getMedia'

  export let micActive = true
  export let camActive = true

  let myPeer: ReturnType<typeof createMyPeer> | null = null
  let mediaError = false
  let networkError = false
  let networkModalOpened = false
  let myVideo: TVideo = null
  let matesVideo: MateVideo[] = []
  let userUnsuscribe: Unsubscriber

  $: {
    myVideo?.getAudioTracks().forEach((track) => {
      track.enabled = micActive
    })
    myVideo?.getVideoTracks().forEach((track) => {
      track.enabled = camActive
    })
    myPeer?.handleVideoInfoChange({ micActive, camActive })
  }

  async function getInitialMedia() {
    const getMediaResult = await getMedia({ micActive, camActive })

    if (getMediaResult.error) {
      mediaError = true
    }

    myVideo = getMediaResult.stream
  }

  const getVideo: GetVideo = () => myVideo

  const getVideoInfo: GetVideoInfo = () => ({ micActive, camActive })

  const handleVideoInfo: HandleVideoInfo = ({ info, mateId }) => {
    matesVideo = matesVideo.map((mateVideo) => {
      if (mateVideo.mate.id === mateId) {
        return { ...mateVideo, micActive: info.micActive, camActive: info.camActive }
      }
      return mateVideo
    })
  }

  const handleMateLeaved: HandleMateLeaved = (mateId) => {
    // do we need to close this peer connection?
    matesVideo = matesVideo.filter((item) => item.mate?.id !== mateId)
  }

  const handleMatesVideo: HandleMatesVideo = (video) => {
    matesVideo = [...matesVideo, video]
  }

  function closeMediaModal(evt: Event) {
    evt.preventDefault()
    mediaError = false
  }

  function handleNetworkError() {
    networkError = true
    networkModalOpened = true
  }

  function closeNetworkModal(evt: Event) {
    evt.preventDefault()
    networkError = false
  }

  function createPeer(user: TUser | null) {
    myPeer = createMyPeer({ 
      user,
      getVideoInfo,
      getVideo,
      handleVideoInfo,
      handleMatesVideo,
      handleMateLeaved,
      handleNetworkError,
    })
  }

  onMount(async () => {
    await getInitialMedia()
    userUnsuscribe = user.subscribe(createPeer)
    socket.on(EEventRoom.userJoined, myPeer?.handleMateJoined)
    socket.on(EEventRoom.userLeaved, (mate) => handleMateLeaved(mate.id))
  })

  onDestroy(() => {
    userUnsuscribe?.()
    myPeer?.destroy()
    socket.off(EEventRoom.userJoined, myPeer?.handleMateJoined)
    socket.off(EEventRoom.userLeaved, (mate) => handleMateLeaved(mate.id))
    myVideo?.getTracks().forEach((track) => track.stop())
  })
</script>

{#if networkError}
  <div class="error-wrap">
    <span class="text-danger fw-bolder">Network error</span>
  </div>  
{:else}
  <ul class="grid">
    {#if myVideo}
      <li class="grid-item bg-dark rounded">
        <Video src={myVideo} name={$user?.name} {micActive} {camActive} mine />
      </li>
    {/if}
    {#each matesVideo as mateVideo (mateVideo.mate.id)}
      <li class="grid-item bg-dark rounded">
        <Video src={mateVideo.stream} name={mateVideo.mate.name} micActive={mateVideo.micActive} camActive={mateVideo.camActive}/>
      </li>
    {/each}
  </ul>
{/if}
<Modal isOpen={mediaError} size="md" centered>
  <ModalBody class="p-4">
    <p class="text-center">
      There is an&nbsp;error with your media. Please, allow this page to&nbsp;use your&nbsp;camera and&nbsp;microphone in&nbsp;the&nbsp;site settings
    </p>
    <Button on:click={closeMediaModal} color="dark" outline type="submit" class="d-block w-100" size="lg"
      >Ok</Button>
  </ModalBody>
</Modal>
<Modal isOpen={networkModalOpened} size="md" centered>
  <ModalBody class="p-4">
    <p class="text-center">
      There is an&nbsp;error with your network. Please, try to&nbsp;reload the&nbsp;page
    </p>
    <Button on:click={closeNetworkModal} color="dark" outline type="submit" class="d-block w-100" size="lg"
      >Ok</Button>
  </ModalBody>
</Modal>

<style>
  .grid {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: center;
    gap: 0.25rem;

    max-height: calc((var(--vh, 1vh) * 100) - 46px);
    margin: auto 0;
    padding: 0.5rem 0;
    list-style: none;
    overflow: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  @media (hover: hover) {
    .grid {
      max-height: calc((var(--vh, 1vh) * 100) - 42px);
    }
  }

  .grid::-webkit-scrollbar {
    display: none;
  }

  .grid-item {
    flex: 0 0 calc(50% - 0.125rem);
  }

  .grid-item:only-child {
    flex: 0 1 100%;
  }

  @media (min-aspect-ratio: 1 / 1) {
    .grid-item:only-child {
      flex: 0 1 70%;
    }
  }

  @media (min-width: 900px) {
    .grid-item:only-child {
      flex: 0 1 60%;
    }

    .grid-item {
      flex: 0 0 min(49%, 35vw);
    }
  }

  @media (min-width: 1280px) {
    .grid-item {
      flex: 0 0 min(49%, 32vw);
    }
  }

  .error-wrap {
    display: grid;
    place-content: center;
    height: 100%;
  }
</style>
