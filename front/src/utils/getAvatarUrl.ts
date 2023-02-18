const BASE_URL = 'https://api.dicebear.com/5.x/thumbs/svg?'

const COMMON_PROPS = {
  size: '48',
  shapeColor: [
    '4a92fe',
    'f55f80',
    '70facb',
    'ffc6a4',
    '8190bb',
    '757fe6',
    '90f58b',
    '9b4a91',
    'f55f80',
    '2b6562',
    '00b7ff',
    '8b7356',
    '887c90',
    '3faa85',
    'e67a54',
    'ffbcd7',
  ].join(','),
}

const MY_PROPS = {
  ...COMMON_PROPS,
  backgroundColor: '212529',
  mouthColor: '212529',
  eyesColor: '212529',
  faceOffsetX: '-10',
}

const MATES_PROPS = {
  ...COMMON_PROPS,
  backgroundColor: 'ffffff',
  mouthColor: 'ffffff',
  eyesColor: 'ffffff',
  faceOffsetX: '10',
}

export function getAvatarUrl({ my, id }: { my: boolean; id: string }) {
  const props = my ? MY_PROPS : MATES_PROPS
  const searchParams = new URLSearchParams({ ...props, seed: id }).toString()
  return BASE_URL + searchParams
}
