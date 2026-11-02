/** Issue #181: associacao entre paginas e imagens. Sem imports estaticos. */
const images = import.meta.glob<string>(
  '../assets/images/*.{png,jpg,jpeg,webp}',
  { eager: true, query: '?url', import: 'default' },
)

function findBanner(...names: string[]): string | undefined {
  for (const name of names) {
    for (const extension of ['png', 'webp', 'jpg', 'jpeg']) {
      const match = images[`../assets/images/${name}.${extension}`]
      if (match) return match
    }
  }
  return undefined
}

/** Home e Minha Colecao usam imagens aprovadas diretamente; nao sao alteradas aqui. */
export const pageBanners = {
  marketplace: findBanner('image-ads', 'banner-marketplace'),
  myAds: findBanner('image-myAds', 'banner-meus-anuncios'),
  createAd: findBanner('image-createAds', 'banner-criar-anuncio'),
  profile: findBanner('image-profile', 'banner-perfil'),
  admin: findBanner('image-management', 'banner-administracao'),
  checkout: findBanner('image-checkout', 'banner-checkout'),
} as const
