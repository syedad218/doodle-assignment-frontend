const ADJECTIVES = [
  'Swift', 'Calm', 'Brave', 'Clever', 'Gentle',
  'Bright', 'Bold', 'Merry', 'Quiet', 'Lively',
]
const ANIMALS = [
  'Otter', 'Fox', 'Panda', 'Heron', 'Lynx',
  'Robin', 'Koala', 'Badger', 'Marten', 'Sparrow',
]

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

export function generateName(): string {
  const number = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, '0')
  return `${pick(ADJECTIVES)}${pick(ANIMALS)}${number}`
}