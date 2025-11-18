import { Request, Response } from 'express'

/**
 * Generic duplicate handler for multiple content types
 * Supports: Page, Blog, Application, FaqItem
 */
export const duplicateItemHandler = async (req: Request, res: Response) => {
  try {
    const context = (req as any).context
    const { itemId, itemType } = req.body

    if (!itemId || !itemType) {
      return res.status(400).json({
        success: false,
        error: 'Item ID and type are required'
      })
    }

    const sudoContext = context.sudo()
    const timestamp = Date.now()
    const suffix = `-copy-${timestamp}`

    let result: any

    switch (itemType) {
      case 'Page':
        result = await duplicatePage(sudoContext, itemId, suffix)
        break
      case 'Blog':
        result = await duplicateBlog(sudoContext, itemId, suffix)
        break
      case 'Application':
        result = await duplicateApplication(sudoContext, itemId, suffix)
        break
      case 'FaqItem':
        result = await duplicateFaqItem(sudoContext, itemId, suffix)
        break
      default:
        return res.status(400).json({
          success: false,
          error: `Unsupported item type: ${itemType}`
        })
    }

    res.json({
      success: true,
      ...result
    })
  } catch (error: any) {
    console.error('Error duplicating item:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to duplicate item'
    })
  }
}

/**
 * Duplicate a Page with its content translations
 */
async function duplicatePage(context: any, pageId: string, suffix: string) {
  const original = await context.prisma.page.findUnique({
    where: { id: pageId },
    include: {
      contentTranslations: true,
      heroMediaTags: true,
    },
  })

  if (!original) {
    throw new Error('Page not found')
  }

  // Modify title JSON to add "-copy" suffix
  let newTitle = original.title
  if (newTitle && typeof newTitle === 'object') {
    newTitle = { ...newTitle }
    for (const lang of Object.keys(newTitle)) {
      if (typeof newTitle[lang] === 'string') {
        newTitle[lang] = `${newTitle[lang]}-copy`
      }
    }
  }

  // Create duplicated page
  const duplicated = await context.prisma.page.create({
    data: {
      slug: original.slug ? `${original.slug}${suffix}` : null,
      path: original.path ? `${original.path}${suffix}` : null,
      pageType: original.pageType,
      template: original.template,
      title: newTitle,
      heroText: original.heroText,
      heroSubtitle: original.heroSubtitle,
      isSystem: false, // Never copy as system page
      status: 'DRAFT',
      publishedAt: null,
      order: original.order,
      // Connect to same author
      ...(original.authorId && {
        author: { connect: { id: original.authorId } },
      }),
      // Connect to same heroMediaTags
      ...(original.heroMediaTags.length > 0 && {
        heroMediaTags: {
          connect: original.heroMediaTags.map((tag: any) => ({ id: tag.id })),
        },
      }),
    },
  })

  // Duplicate content translations
  const duplicatedTranslations = []
  for (const translation of original.contentTranslations) {
    const duplicatedTranslation = await context.prisma.pageContentTranslation.create({
      data: {
        locale: translation.locale,
        content: translation.content,
        page: { connect: { id: duplicated.id } },
      },
    })
    duplicatedTranslations.push(duplicatedTranslation)
  }

  return {
    duplicatedItem: {
      id: duplicated.id,
      slug: duplicated.slug,
      path: duplicated.path,
    },
    translationsCount: duplicatedTranslations.length,
  }
}

/**
 * Duplicate a Blog with its content translations
 */
async function duplicateBlog(context: any, blogId: string, suffix: string) {
  const original = await context.prisma.blog.findUnique({
    where: { id: blogId },
    include: {
      contentTranslations: true,
      categories: true,
    },
  })

  if (!original) {
    throw new Error('Blog not found')
  }

  // Modify title JSON to add "-copy" suffix
  let newTitle = original.title
  if (newTitle && typeof newTitle === 'object') {
    newTitle = { ...newTitle }
    for (const lang of Object.keys(newTitle)) {
      if (typeof newTitle[lang] === 'string') {
        newTitle[lang] = `${newTitle[lang]}-copy`
      }
    }
  }

  // Create duplicated blog
  const duplicated = await context.prisma.blog.create({
    data: {
      slug: original.slug ? `${original.slug}${suffix}` : null,
      title: newTitle,
      excerpt: original.excerpt,
      coverImage: original.coverImage,
      author: original.author,
      status: 'DRAFT',
      publishedAt: null,
      // Connect to same categories
      ...(original.categories.length > 0 && {
        categories: {
          connect: original.categories.map((cat: any) => ({ id: cat.id })),
        },
      }),
    },
  })

  // Duplicate content translations
  const duplicatedTranslations = []
  for (const translation of original.contentTranslations) {
    const duplicatedTranslation = await context.prisma.blogContentTranslation.create({
      data: {
        locale: translation.locale,
        content: translation.content,
        blog: { connect: { id: duplicated.id } },
      },
    })
    duplicatedTranslations.push(duplicatedTranslation)
  }

  return {
    duplicatedItem: {
      id: duplicated.id,
      slug: duplicated.slug,
    },
    translationsCount: duplicatedTranslations.length,
  }
}

/**
 * Duplicate an Application with its content translations
 */
async function duplicateApplication(context: any, applicationId: string, suffix: string) {
  const original = await context.prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      contentTranslations: true,
      category: true,
    },
  })

  if (!original) {
    throw new Error('Application not found')
  }

  // Modify name JSON to add "-copy" suffix
  let newName = original.name
  if (newName && typeof newName === 'object') {
    newName = { ...newName }
    for (const lang of Object.keys(newName)) {
      if (typeof newName[lang] === 'string') {
        newName[lang] = `${newName[lang]}-copy`
      }
    }
  }

  // Create duplicated application
  const duplicated = await context.prisma.application.create({
    data: {
      slug: original.slug ? `${original.slug}${suffix}` : null,
      name: newName,
      shortDescription: original.shortDescription,
      description: original.description,
      mainImage: original.mainImage,
      images: original.images,
      status: 'DRAFT',
      // Connect to same category
      ...(original.categoryId && {
        category: { connect: { id: original.categoryId } },
      }),
    },
  })

  // Duplicate content translations
  const duplicatedTranslations = []
  for (const translation of original.contentTranslations) {
    const duplicatedTranslation = await context.prisma.applicationContentTranslation.create({
      data: {
        locale: translation.locale,
        content: translation.content,
        application: { connect: { id: duplicated.id } },
      },
    })
    duplicatedTranslations.push(duplicatedTranslation)
  }

  return {
    duplicatedItem: {
      id: duplicated.id,
      slug: duplicated.slug,
    },
    translationsCount: duplicatedTranslations.length,
  }
}

/**
 * Duplicate a FaqItem (no content translations)
 */
async function duplicateFaqItem(context: any, faqItemId: string, suffix: string) {
  const original = await context.prisma.faqItem.findUnique({
    where: { id: faqItemId },
    include: {
      category: true,
    },
  })

  if (!original) {
    throw new Error('FaqItem not found')
  }

  // Modify question JSON to add "-copy" suffix
  let newQuestion = original.question
  if (newQuestion && typeof newQuestion === 'object') {
    newQuestion = { ...newQuestion }
    for (const lang of Object.keys(newQuestion)) {
      if (typeof newQuestion[lang] === 'string') {
        newQuestion[lang] = `${newQuestion[lang]}-copy`
      }
    }
  }

  // Create duplicated FaqItem
  const duplicated = await context.prisma.faqItem.create({
    data: {
      internalId: original.internalId ? `${original.internalId}${suffix}` : null,
      question: newQuestion,
      answer: original.answer,
      order: original.order,
      status: 'DRAFT',
      // Connect to same category
      ...(original.categoryId && {
        category: { connect: { id: original.categoryId } },
      }),
    },
  })

  return {
    duplicatedItem: {
      id: duplicated.id,
      internalId: duplicated.internalId,
    },
    translationsCount: 0,
  }
}
