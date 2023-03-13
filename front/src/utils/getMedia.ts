const DENIED = 'Permission denied'
const RESOLUTION = {
  width: 848,
  height: 480,
}

export async function getMedia(): Promise<{
  stream: MediaStream | null
  error: unknown
  hasMic: boolean
  hasCam: boolean
}> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        facingMode: 'user',
        ...RESOLUTION,
      },
    })

    return { stream, error: null, hasMic: true, hasCam: true }
  } catch (error) {
    console.error('all media failed')
    if (error instanceof Error && error.message.includes(DENIED)) {
      return { stream: null, error, hasMic: false, hasCam: false }
    }
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        ...RESOLUTION,
      },
    })

    return { stream, error: null, hasMic: false, hasCam: true }
  } catch (err) {
    console.error('video failed')
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    })

    return { stream, error: null, hasMic: true, hasCam: false }
  } catch (error) {
    console.error('audio failed')
    return { stream: null, error, hasMic: false, hasCam: false }
  }
}
