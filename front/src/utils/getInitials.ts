export default function getInitials(name: string) {
  const [first, second] = name.split(' ')

  if (!second) return first.slice(0, 2)

  return first.slice(0, 1) + second.slice(0, 1)
}
