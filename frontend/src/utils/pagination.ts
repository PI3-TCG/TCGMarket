export function pageItems(current: number, total: number): (number | 'gap')[] {
  if (total < 1) return []

  const first = Math.max(1, current - 3)
  const last = Math.min(total, current + 3)
  const pages = new Set([1, total])
  for (let page = first; page <= last; page++) pages.add(page)

  const visible = [...pages].sort((a, b) => a - b)
  return visible.flatMap((page, index) =>
    index > 0 && page - visible[index - 1] > 1 ? ['gap', page] : [page],
  )
}
