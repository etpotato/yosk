const DENIED = 'Permission denied'
const RESOLUTION = {
  width: 848,
  height: 480,
}

export async function getMedia({
  micActive,
  camActive,
}: {
  micActive: boolean
  camActive: boolean
}): Promise<{
  stream: MediaStream | null
  error: unknown
}> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        facingMode: 'user',
        ...RESOLUTION,
      },
    })

    stream?.getAudioTracks().forEach((track) => {
      track.enabled = micActive
    })
    stream?.getVideoTracks().forEach((track) => {
      track.enabled = camActive
    })

    return { stream, error: null }
  } catch (error) {
    console.error('all media failed')
    if (error instanceof Error && error.message.includes(DENIED)) {
      return { stream: null, error }
    }
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        ...RESOLUTION,
      },
    })

    stream?.getVideoTracks().forEach((track) => {
      track.enabled = camActive
    })

    return { stream, error: null }
  } catch (err) {
    console.error('video failed')
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    })

    stream?.getAudioTracks().forEach((track) => {
      track.enabled = micActive
    })

    return { stream, error: null }
  } catch (error) {
    console.error('audio failed')
    return { stream: null, error }
  }
}
