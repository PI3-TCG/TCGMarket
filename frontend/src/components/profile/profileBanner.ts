import defaultProfileCover from '@/assets/profile-cover-default.svg'

/** Capa responsiva de 1600 × 400; contas sem imagem usam a arte padrão. */
export function getProfileBanner(customImage?: string | null) {
  return customImage || defaultProfileCover
}
