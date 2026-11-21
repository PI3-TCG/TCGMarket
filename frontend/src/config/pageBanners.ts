import adsBanner from '@/assets/images/image-ads.webp'
import checkoutBanner from '@/assets/images/image-checkout.png'
import createAdsBanner from '@/assets/images/image-createAds.png'
import managementBanner from '@/assets/images/image-management.png'
import myAdsBanner from '@/assets/images/image-myAds.webp'
import profileBanner from '@/assets/images/image-profile.png'

/** Associação entre páginas e imagens. Home e Minha Coleção importam suas imagens diretamente. */
export const pageBanners = {
  marketplace: adsBanner,
  myAds: myAdsBanner,
  createAd: createAdsBanner,
  profile: profileBanner,
  admin: managementBanner,
  checkout: checkoutBanner,
} as const
