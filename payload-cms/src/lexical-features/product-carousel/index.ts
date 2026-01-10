/**
 * Product Carousel Feature
 *
 * Displays a carousel of products with manual or auto selection
 * - Manual: specific product selected
 * - Auto: random product from a product series (fetched at runtime)
 */

export { ProductCarouselFeature } from './feature.server'
export { ProductCarouselNode, $createProductCarouselNode, $isProductCarouselNode } from './node'
export type { ProductCarouselData, ProductCarouselItem } from './node'
export { INSERT_PRODUCT_CAROUSEL_COMMAND } from './plugin'
