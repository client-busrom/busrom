
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useField, useDocumentInfo, useTranslation } from '@payloadcms/ui'
import './styles.scss'

interface ProductData {
  id: string
  sku: string
  name: string | Record<string, string>
  showImage?: any
  shopVisibility?: boolean
  isHot?: boolean
  isNew?: boolean
  shopOrder?: number
}

export const CategoryProductManager: React.FC<{ path: string }> = ({ path }) => {
  // If used as a UI field named 'shopProductsManager', target the 'shopProducts' relationship field
  const targetPath = path === 'shopProductsManager' ? 'shopProducts' : path
  const { value: productIds, setValue } = useField<string[]>({ path: targetPath })
  const { id: categoryId } = useDocumentInfo()
  const { i18n } = useTranslation()
  const locale = i18n.language
  
  const [products, setProducts] = useState<ProductData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  // Fetch full product data for the linked IDs
  useEffect(() => {
    if (!productIds || productIds.length === 0) {
      setProducts([])
      return
    }

    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        // Use where[id][in]=id1&where[id][in]=id2... which works for multiple items
        const query = productIds.map((id, index) => `where[id][in][${index}]=${id}`).join('&')
        const response = await fetch(`/api/products?limit=${productIds.length}&depth=1&${query}`)
        if (response.ok) {
          const data = await response.json()
          // Re-sort based on productIds order to maintain user's manual sorting
          const sortedDocs = productIds
            .map(id => data.docs.find((doc: any) => doc.id === id))
            .filter(Boolean)
          setProducts(sortedDocs)
        }
      } catch (err) {
        console.error('Failed to fetch product data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [productIds])

  const updateProduct = useCallback(async (productId: string, updates: Partial<ProductData>) => {
    setIsUpdating(productId)
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const updatedDoc = await response.json()
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p))
      }
    } catch (err) {
      console.error('Failed to update product:', err)
    } finally {
      setIsUpdating(null)
    }
  }, [])

  const removeProduct = useCallback((productId: string) => {
    const newVal = (productIds || []).filter(id => id !== productId)
    setValue(newVal)
  }, [productIds, setValue])

  const moveProduct = useCallback((index: number, direction: 'up' | 'down') => {
    if (!productIds) return
    const newIds = [...productIds]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    if (targetIndex < 0 || targetIndex >= newIds.length) return
    
    const [moved] = newIds.splice(index, 1)
    newIds.splice(targetIndex, 0, moved)
    setValue(newIds)
  }, [productIds, setValue])

  const getProductName = (name: any) => {
    if (!name) return 'Untitled'
    if (typeof name === 'string') return name
    return name[locale] || name.en || name.zh || 'Untitled'
  }

  return (
    <div className="category-product-manager">
      <div className="category-product-manager__header">
        <h4>{i18n.language === 'zh' ? 'Shop 列表管理' : 'Shop List Management'}</h4>
        {isLoading && <span className="loading-spinner">...</span>}
      </div>

      <div className="category-product-manager__content">
        {products.length === 0 ? (
          <div className="category-product-manager__empty">
            {i18n.language === 'zh' ? '暂无关联产品，请在上方选择产品' : 'No products linked. Select products above.'}
          </div>
        ) : (
          <table className="category-product-manager__table">
            <thead>
              <tr>
                <th>{i18n.language === 'zh' ? '排序' : 'Sort'}</th>
                <th>{i18n.language === 'zh' ? '产品信息' : 'Product'}</th>
                <th>{i18n.language === 'zh' ? '展示' : 'Show'}</th>
                <th>{i18n.language === 'zh' ? '爆品' : 'Hot'}</th>
                <th>{i18n.language === 'zh' ? '新品' : 'New'}</th>
                <th>{i18n.language === 'zh' ? '权重' : 'Weight'}</th>
                <th>{i18n.language === 'zh' ? '操作' : 'Action'}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.id} style={{ opacity: isUpdating === product.id ? 0.5 : 1 }}>
                  <td>
                    <div className="category-product-manager__actions-cell" style={{ textAlign: 'left', width: 'auto' }}>
                      <button type="button" className="action-btn" onClick={() => moveProduct(index, 'up')} disabled={index === 0}>▲</button>
                      <button type="button" className="action-btn" onClick={() => moveProduct(index, 'down')} disabled={index === products.length - 1}>▼</button>
                    </div>
                  </td>
                  <td>
                    <div className="category-product-manager__product-info">
                      {product.showImage?.url && <img src={product.showImage.url} alt="" />}
                      <div className="details">
                        <span className="name">{getProductName(product.name)}</span>
                        <span className="sku">{product.sku}</span>
                      </div>
                    </div>
                  </td>
                  <td className="category-product-manager__checkbox-cell">
                    <input 
                      type="checkbox" 
                      checked={product.shopVisibility !== false} 
                      onChange={(e) => updateProduct(product.id, { shopVisibility: e.target.checked })}
                    />
                  </td>
                  <td className="category-product-manager__checkbox-cell">
                    <input 
                      type="checkbox" 
                      checked={!!product.isHot} 
                      onChange={(e) => updateProduct(product.id, { isHot: e.target.checked })}
                    />
                  </td>
                  <td className="category-product-manager__checkbox-cell">
                    <input 
                      type="checkbox" 
                      checked={!!product.isNew} 
                      onChange={(e) => updateProduct(product.id, { isNew: e.target.checked })}
                    />
                  </td>
                  <td className="category-product-manager__order-cell">
                    <input 
                      type="number" 
                      value={product.shopOrder || 0} 
                      onBlur={(e) => updateProduct(product.id, { shopOrder: parseInt(e.target.value) || 0 })}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0
                        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, shopOrder: val } : p))
                      }}
                    />
                  </td>
                  <td className="category-product-manager__actions-cell">
                    <a href={`/admin/collections/products/${product.id}`} target="_blank" className="action-btn" title="Edit Product">↗</a>
                    <button type="button" className="action-btn action-btn--delete" onClick={() => removeProduct(product.id)} title="Remove Link">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="save-hint">
        {i18n.language === 'zh' 
          ? '* 勾选和权重修改会立即同步到产品文档。排序和增删需保存分类文档生效。' 
          : '* Checkbox and weight hits are saved immediately. Sorting and adding/removing require saving the category.'}
      </div>
    </div>
  )
}

export default CategoryProductManager
