import { writable, type Writable } from 'svelte/store'

export type MediaInfo = {
  hasMic: boolean
  hasCam: boolean
  micActive: boolean
  camActive: boolean
}

export const mediaInfo: Writable<MediaInfo> = writable({
  hasMic: true,
  hasCam: true,
  micActive: true,
  camActive: true,
})

export function setMediaInfo(newMediaInfo: Partial<MediaInfo>) {
  mediaInfo.update((state) => {
    const hasMic = newMediaInfo.hasMic ?? state.hasMic
    const hasCam = newMediaInfo.hasCam ?? state.hasCam

    return {
      hasMic,
      hasCam,
      micActive: hasMic && (newMediaInfo.micActive ?? state.micActive),
      camActive: hasCam && (newMediaInfo.camActive ?? state.camActive),
    }
  })
}

export function toggleMic() {
  mediaInfo.update((state) => {
    return {
      ...state,
      micActive: state.hasMic ? !state.micActive : false,
    }
  })
}

export function toggleCam() {
  mediaInfo.update((state) => {
    return {
      ...state,
      camActive: state.hasCam ? !state.camActive : false,
    }
  })
}
