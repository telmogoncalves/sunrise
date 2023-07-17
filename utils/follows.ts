import millify from 'millify'

export function formatFollows(value: number | string): string | number {
  if (Number(value) >= 10000) {
    return millify(Number(value))
  }

  return value
}
