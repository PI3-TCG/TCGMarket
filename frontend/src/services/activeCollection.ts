const key = (userId: string) => `tcg.activeCollection.${userId}`

export function readActiveCollectionId(userId: string) {
  try {
    return localStorage.getItem(key(userId))
  } catch {
    return null
  }
}

export function writeActiveCollectionId(userId: string, collectionId: string) {
  localStorage.setItem(key(userId), collectionId)
}
