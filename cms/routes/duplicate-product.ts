import { Request, Response } from 'express'

export const duplicateProductHandler = async (req: Request, res: Response) => {
  try {
    const context = (req as any).context
    const { productId } = req.body

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      })
    }

    const sudoContext = context.sudo()

    // Fetch the original product with all its data
    const originalProduct = await sudoContext.prisma.product.findUnique({
      where: { id: productId },
      include: {
        contentTranslations: true,
        series: true,
      },
    })

    if (!originalProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    // Generate unique suffix with timestamp to avoid conflicts
    const timestamp = Date.now()
    const suffix = `-copy-${timestamp}`

    // Generate unique slug for the duplicate
    const newSlug = originalProduct.slug
      ? `${originalProduct.slug}${suffix}`
      : null

    // Parse and modify the name JSON to add "-copy" suffix
    let newName = originalProduct.name
    if (newName && typeof newName === 'object') {
      newName = { ...newName }
      // Add "-copy" suffix to each language
      for (const lang of Object.keys(newName)) {
        if (typeof newName[lang] === 'string') {
          newName[lang] = `${newName[lang]}-copy`
        }
      }
    }

    // Generate new SKU with copy suffix and timestamp
    const newSku = `${originalProduct.sku}-COPY-${timestamp}`

    // Create the duplicated product
    const duplicatedProduct = await sudoContext.prisma.product.create({
      data: {
        sku: newSku,
        slug: newSlug,
        name: newName,
        shortDescription: originalProduct.shortDescription,
        description: originalProduct.description,
        attributes: originalProduct.attributes,
        specifications: originalProduct.specifications,
        showImage: originalProduct.showImage,
        mainImage: originalProduct.mainImage,
        isFeatured: originalProduct.isFeatured,
        order: originalProduct.order,
        status: 'DRAFT', // Set duplicated product as draft
        // Connect to the same series if exists
        ...(originalProduct.seriesId && {
          series: { connect: { id: originalProduct.seriesId } },
        }),
      },
    })

    // Duplicate all content translations
    const duplicatedTranslations = []
    for (const translation of originalProduct.contentTranslations) {
      const duplicatedTranslation = await sudoContext.prisma.productContentTranslation.create({
        data: {
          locale: translation.locale,
          content: translation.content,
          product: { connect: { id: duplicatedProduct.id } },
        },
      })
      duplicatedTranslations.push(duplicatedTranslation)
    }

    res.json({
      success: true,
      duplicatedProduct: {
        id: duplicatedProduct.id,
        sku: duplicatedProduct.sku,
        slug: duplicatedProduct.slug,
      },
      translationsCount: duplicatedTranslations.length,
    })
  } catch (error: any) {
    console.error('Error duplicating product:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to duplicate product'
    })
  }
}
