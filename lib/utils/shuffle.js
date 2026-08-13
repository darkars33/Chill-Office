/**
 * Fisher-Yates over everything except `first`, which is pinned to the front so
 * turning shuffle on never interrupts the track that is already playing.
 */
export function shuffledFrom(indices, first) {
  const rest = indices.filter((i) => i !== first)
  for (let i = rest.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[rest[i], rest[j]] = [rest[j], rest[i]]
  }
  return first === undefined ? rest : [first, ...rest]
}
