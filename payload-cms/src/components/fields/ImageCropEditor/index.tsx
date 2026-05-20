'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import Cropper from 'react-easy-crop'
import type { Area, Point, MediaSize } from 'react-easy-crop'
import './styles.scss'

// ============================================================
// Types
// ============================================================

export type VariantType = 'original' | 'thumbnail' | 'card' | 'tablet' | 'desktop'

export interface ImageCropData {
  /** 选中的变体 */
  variant: VariantType
  /** 变体图片的实际宽度 */
  variantWidth: number
  /** 变体图片的实际高度 */
  variantHeight: number
  /** 裁剪框宽度 */
  cropWidth: number
  /** 裁剪框高度 */
  cropHeight: number
  /** 图片缩放比例 (1 = 100%) */
  scale: number
  /** react-easy-crop 的 crop position */
  cropPosition: Point
  /** 裁剪区域（百分比，0-100） */
  croppedArea: Area
  /** 裁剪区域（像素，基于原始图片尺寸） */
  croppedAreaPixels: Area
}

export interface MediaSizes {
  thumbnail?: { url?: string; width?: number; height?: number }
  card?: { url?: string; width?: number; height?: number }
  tablet?: { url?: string; width?: number; height?: number }
  desktop?: { url?: string; width?: number; height?: number }
}

interface ImageCropEditorProps {
  /** 原始图片 URL */
  imageUrl: string
  /** 原始图片宽度 */
  imageWidth?: number
  /** 原始图片高度 */
  imageHeight?: number
  /** 图片变体尺寸数据 */
  sizes?: MediaSizes
  /** 已有的裁剪数据（用于恢复编辑状态） */
  initialCropData?: ImageCropData | null
  /** 确认回调 */
  onConfirm: (cropData: ImageCropData) => void
  /** 取消/关闭回调 */
  onClose: () => void
}

// ============================================================
// 变体配置
// ============================================================

// 变体显示名（不带尺寸，因为实际尺寸取决于原图大小）
const VARIANT_NAMES: Record<VariantType, string> = {
  original: '原图',
  desktop: 'Desktop',
  tablet: 'Tablet',
  card: 'Card',
  thumbnail: 'Thumbnail',
}

const MIN_CROP_SIZE = 50
const MAX_CROP_WIDTH = 1920
const MAX_CROP_HEIGHT = 1080

// ============================================================
// Component
// ============================================================

export const ImageCropEditor: React.FC<ImageCropEditorProps> = ({
  imageUrl,
  imageWidth,
  imageHeight,
  sizes,
  initialCropData,
  onConfirm,
  onClose,
}) => {
  // --- 变体选择 ---
  const [variant, setVariant] = useState<VariantType>(initialCropData?.variant || 'original')

  // 构建可用变体列表（去重：跳过尺寸与原图相同的变体）
  const availableVariants = useMemo(() => {
    const variants: Array<{ key: VariantType; label: string; url: string; width: number; height: number }> = []
    const seenSizes = new Set<string>()

    // 原图始终可用
    if (imageUrl && imageWidth && imageHeight) {
      const sizeKey = `${imageWidth}x${imageHeight}`
      seenSizes.add(sizeKey)
      variants.push({
        key: 'original',
        label: `${VARIANT_NAMES.original} (${imageWidth}×${imageHeight})`,
        url: imageUrl,
        width: imageWidth,
        height: imageHeight,
      })
    }

    // 各变体 — 按尺寸从大到小排列
    const variantKeys: Array<keyof MediaSizes> = ['desktop', 'tablet', 'card', 'thumbnail']
    for (const key of variantKeys) {
      const sizeData = sizes?.[key]
      if (sizeData?.url && sizeData?.width && sizeData?.height) {
        const sizeKey = `${sizeData.width}x${sizeData.height}`

        // 跳过与已有尺寸完全相同的变体（避免重复）
        if (seenSizes.has(sizeKey)) continue
        seenSizes.add(sizeKey)

        variants.push({
          key,
          label: `${VARIANT_NAMES[key]} (${sizeData.width}×${sizeData.height} webp)`,
          url: sizeData.url,
          width: sizeData.width,
          height: sizeData.height,
        })
      }
    }

    return variants
  }, [imageUrl, imageWidth, imageHeight, sizes])

  // 当前变体信息
  const currentVariant = useMemo(
    () => availableVariants.find((v) => v.key === variant) || availableVariants[0],
    [availableVariants, variant],
  )

  // --- 裁剪框尺寸 ---
  const [cropWidth, setCropWidth] = useState<number>(
    initialCropData?.cropWidth || Math.min(currentVariant?.width || 800, MAX_CROP_WIDTH),
  )
  const [cropHeight, setCropHeight] = useState<number>(
    initialCropData?.cropHeight || Math.min(currentVariant?.height || 600, MAX_CROP_HEIGHT),
  )
  // 宽高输入的临时字符串值
  const [widthInput, setWidthInput] = useState<string>(String(cropWidth))
  const [heightInput, setHeightInput] = useState<string>(String(cropHeight))

  // --- react-easy-crop 状态 ---
  // crop 初始化为 {0,0}，在 displayScale 确定后通过 effect 恢复正确位置
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const initialCropAppliedRef = React.useRef(false)
  const [zoom, setZoom] = useState<number>(initialCropData?.scale || 1)
  const [croppedArea, setCroppedArea] = useState<Area>({ x: 0, y: 0, width: 100, height: 100 })
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>({ x: 0, y: 0, width: 0, height: 0 })
  const [mediaSize, setMediaSize] = useState<MediaSize | null>(null)

  // --- 锁定宽高比 ---
  const [lockAspect, setLockAspect] = useState(false)
  const [aspectRatio, setAspectRatio] = useState<number>(cropWidth / cropHeight)

  // --- 裁剪框显示尺寸（按比例缩放适配容器） ---
  const canvasRef = React.useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 })

  // 监听容器尺寸
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          setCanvasSize({ width, height })
        }
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // 计算显示缩放比例
  const displayScale = useMemo(() => {
    const maxW = canvasSize.width - 40
    const maxH = canvasSize.height - 40
    if (cropWidth <= maxW && cropHeight <= maxH) {
      return 1
    }
    return Math.min(maxW / cropWidth, maxH / cropHeight)
  }, [cropWidth, cropHeight, canvasSize])

  // cropSize 按容器自适应缩放，留 40px padding
  const cropSize = useMemo(() => ({
    width: Math.round(cropWidth * displayScale),
    height: Math.round(cropHeight * displayScale),
  }), [cropWidth, cropHeight, displayScale])

  // 上一次的 displayScale，用于检测变化时调整 crop 位置
  const prevDisplayScaleRef = React.useRef<number>(displayScale)
  useEffect(() => {
    const prevScale = prevDisplayScaleRef.current
    if (prevScale !== displayScale && prevScale > 0) {
      // displayScale 变了，按比例调整 crop 位置
      const ratio = displayScale / prevScale
      setCrop(prev => ({
        x: prev.x * ratio,
        y: prev.y * ratio,
      }))
    }
    prevDisplayScaleRef.current = displayScale
  }, [displayScale])

  // 初始化时恢复 crop 位置（按 displayScale 缩放）
  useEffect(() => {
    if (initialCropAppliedRef.current) return
    if (!initialCropData?.cropPosition) return
    // 等到容器 ResizeObserver 触发后再应用
    if (canvasSize.width === 800 && canvasSize.height === 500) return

    initialCropAppliedRef.current = true
    setCrop({
      x: initialCropData.cropPosition.x * displayScale,
      y: initialCropData.cropPosition.y * displayScale,
    })
  }, [displayScale, canvasSize, initialCropData])

  // --- 变体切换时重置状态 ---
  useEffect(() => {
    // 不要在初始化时覆盖 initialCropData 的值
    if (initialCropData && variant === initialCropData.variant) return

    setCrop({ x: 0, y: 0 })
    setZoom(1)
    if (currentVariant) {
      const w = Math.min(currentVariant.width, MAX_CROP_WIDTH)
      const h = Math.min(currentVariant.height, MAX_CROP_HEIGHT)
      setCropWidth(w)
      setCropHeight(h)
      setWidthInput(String(w))
      setHeightInput(String(h))
      setAspectRatio(w / h)
    }
  }, [variant, currentVariant]) // eslint-disable-line react-hooks/exhaustive-deps

  // --- 裁剪完成回调 ---
  const onCropComplete = useCallback((_croppedArea: Area, _croppedAreaPixels: Area) => {
    setCroppedArea(_croppedArea)
    setCroppedAreaPixels(_croppedAreaPixels)
  }, [])

  // --- 宽度输入 ---
  const handleWidthChange = (val: string) => {
    setWidthInput(val)
  }

  const applyWidth = () => {
    let w = parseInt(widthInput, 10)
    if (isNaN(w)) w = cropWidth
    w = Math.max(MIN_CROP_SIZE, Math.min(w, MAX_CROP_WIDTH))
    setCropWidth(w)
    setWidthInput(String(w))
    if (lockAspect) {
      const h = Math.max(MIN_CROP_SIZE, Math.min(Math.round(w / aspectRatio), MAX_CROP_HEIGHT))
      setCropHeight(h)
      setHeightInput(String(h))
    }
  }

  // --- 高度输入 ---
  const handleHeightChange = (val: string) => {
    setHeightInput(val)
  }

  const applyHeight = () => {
    let h = parseInt(heightInput, 10)
    if (isNaN(h)) h = cropHeight
    h = Math.max(MIN_CROP_SIZE, Math.min(h, MAX_CROP_HEIGHT))
    setCropHeight(h)
    setHeightInput(String(h))
    if (lockAspect) {
      const w = Math.max(MIN_CROP_SIZE, Math.min(Math.round(h * aspectRatio), MAX_CROP_WIDTH))
      setCropWidth(w)
      setWidthInput(String(w))
    }
  }

  // --- 预设尺寸分组 ---
  const presetGroups = [
    {
      label: '通用',
      options: [
        { label: 'Banner (1920×600)', w: 1920, h: 600 },
        { label: '16:9 (1920×1080)', w: 1920, h: 1080 },
        { label: '4:3 (1024×768)', w: 1024, h: 768 },
        { label: '1:1 (800×800)', w: 800, h: 800 },
        { label: 'Card (768×512)', w: 768, h: 512 },
        { label: 'Mobile (375×200)', w: 375, h: 200 },
      ],
    },
    {
      label: 'HeroBanner1',
      options: [
        { label: 'Frame1 (666×627)', w: 666, h: 627 },
        { label: 'Frame2 (583×691)', w: 583, h: 691 },
      ],
    },
    {
      label: 'HeroBanner2',
      options: [
        { label: '大图 (559×510)', w: 559, h: 510 },
        { label: '小图 (327×299)', w: 327, h: 299 },
      ],
    },
    {
      label: 'HeroBanner3',
      options: [
        { label: '列图 (240×880)', w: 240, h: 880 },
      ],
    },
    {
      label: 'HeroBanner6',
      options: [
        { label: '左侧 (1253×922)', w: 1253, h: 922 },
        { label: '右侧 (957×1121)', w: 957, h: 1121 },
      ],
    },
    {
      label: 'HeroBanner7',
      options: [
        { label: '主图 (952×922)', w: 952, h: 922 },
        { label: '菱形Top (506×336)', w: 506, h: 336 },
        { label: '菱形Mid (338×338)', w: 338, h: 338 },
        { label: '菱形Bot (506×347)', w: 506, h: 347 },
      ],
    },
    {
      label: 'HeroBanner8',
      options: [
        { label: '主图 (1134×922)', w: 1134, h: 922 },
        { label: '小图 (318×291)', w: 318, h: 291 },
      ],
    },
    {
      label: 'HeroBanner9',
      options: [
        { label: '主背景 (1292×922)', w: 1292, h: 922 },
        { label: '左下角 (433×400)', w: 433, h: 400 },
      ],
    },
    {
      label: 'FeatureImageLayout',
      options: [
        { label: 'L0-图1 (243×170)', w: 243, h: 170 },
        { label: 'L0-图2 (332×170)', w: 332, h: 170 },
        { label: 'L0-图3 (382×232)', w: 382, h: 232 },
        { label: 'L0-图4 (192×232)', w: 192, h: 232 },
        { label: 'L1-图 (298×416)', w: 298, h: 416 },
        { label: 'L2-图 (188×203)', w: 188, h: 203 },
        { label: 'L3-图 (346×400)', w: 346, h: 400 },
      ],
    },
    {
      label: 'ProductSeries',
      options: [
        { label: '封面 (640×640)', w: 640, h: 640 },
        { label: '场景 (1920×1080)', w: 1920, h: 1080 },
        { label: '静态 (480×480)', w: 480, h: 480 },
      ],
    },
  ]

  const allPresets = presetGroups.flatMap(g => g.options)

  const getCurrentPresetLabel = () => {
    const matched = allPresets.find(p => p.w === cropWidth && p.h === cropHeight)
    return matched ? matched.label : '自定义'
  }

  const applyPreset = (w: number, h: number) => {
    setCropWidth(w)
    setCropHeight(h)
    setWidthInput(String(w))
    setHeightInput(String(h))
    setAspectRatio(w / h)
    // 重置 crop 位置
    setCrop({ x: 0, y: 0 })
  }

  // --- 确认 ---
  const handleConfirm = () => {
    const data: ImageCropData = {
      variant,
      variantWidth: currentVariant?.width || 0,
      variantHeight: currentVariant?.height || 0,
      cropWidth,
      cropHeight,
      scale: zoom,
      // 保存未缩放的 crop 位置（除以 displayScale），确保跨屏幕一致
      cropPosition: {
        x: displayScale !== 1 ? crop.x / displayScale : crop.x,
        y: displayScale !== 1 ? crop.y / displayScale : crop.y,
      },
      croppedArea,
      croppedAreaPixels,
    }
    onConfirm(data)
  }

  // --- 媒体加载回调 ---
  const handleMediaLoaded = useCallback((size: MediaSize) => {
    setMediaSize(size)
  }, [])

  // --- 清除裁剪数据 ---
  const handleClear = () => {
    onConfirm(null as any) // 传 null 表示清除
  }

  if (!currentVariant) {
    return (
      <div className="crop-editor__overlay" onClick={onClose}>
        <div className="crop-editor__panel" onClick={(e) => e.stopPropagation()}>
          <p>没有可用的图片变体</p>
          <button onClick={onClose}>关闭</button>
        </div>
      </div>
    )
  }

  return (
    <div className="crop-editor__overlay">
      <div className="crop-editor__panel" onClick={(e) => e.stopPropagation()}>
        {/* ========== Header ========== */}
        <div className="crop-editor__header">
          <h3>图片裁剪编辑器</h3>
          <button type="button" className="crop-editor__close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* ========== Toolbar ========== */}
        <div className="crop-editor__toolbar">
          {/* 变体选择 */}
          <div className="crop-editor__toolbar-group">
            <label className="crop-editor__toolbar-label">变体</label>
            <select
              value={variant}
              onChange={(e) => setVariant(e.target.value as VariantType)}
              className="crop-editor__select"
            >
              {availableVariants.map((v) => (
                <option key={v.key} value={v.key}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          {/* 分隔线 */}
          <div className="crop-editor__toolbar-divider" />

          {/* 裁剪框尺寸 */}
          <div className="crop-editor__toolbar-group">
            <label className="crop-editor__toolbar-label">裁剪尺寸</label>
            <div className="crop-editor__size-inputs">
              <span className="crop-editor__size-label">W</span>
              <input
                type="number"
                value={widthInput}
                onChange={(e) => handleWidthChange(e.target.value)}
                onBlur={applyWidth}
                onKeyDown={(e) => {
                  e.stopPropagation()
                  if (e.key === 'Enter') applyWidth()
                }}
                min={MIN_CROP_SIZE}
                max={MAX_CROP_WIDTH}
                className="crop-editor__size-input"
              />
              <span className="crop-editor__size-separator">×</span>
              <span className="crop-editor__size-label">H</span>
              <input
                type="number"
                value={heightInput}
                onChange={(e) => handleHeightChange(e.target.value)}
                onBlur={applyHeight}
                onKeyDown={(e) => {
                  e.stopPropagation()
                  if (e.key === 'Enter') applyHeight()
                }}
                min={MIN_CROP_SIZE}
                max={MAX_CROP_HEIGHT}
                className="crop-editor__size-input"
              />
              <button
                type="button"
                className={`crop-editor__lock-btn ${lockAspect ? 'active' : ''}`}
                onClick={() => {
                  if (!lockAspect) {
                    setAspectRatio(cropWidth / cropHeight)
                  }
                  setLockAspect(!lockAspect)
                }}
                title={lockAspect ? '解锁宽高比' : '锁定宽高比'}
              >
                {lockAspect ? '🔒' : '🔓'}
              </button>
            </div>
          </div>

          {/* 分隔线 */}
          <div className="crop-editor__toolbar-divider" />

          {/* 预设尺寸 */}
          <div className="crop-editor__toolbar-group">
            <label className="crop-editor__toolbar-label">预设</label>
            <select
              value={`${cropWidth}×${cropHeight}`}
              onChange={(e) => {
                const [w, h] = e.target.value.split('×').map(Number)
                applyPreset(w, h)
              }}
              className="crop-editor__select"
              style={{ minWidth: '160px' }}
            >
              <option value={`${cropWidth}×${cropHeight}`}>{getCurrentPresetLabel()}</option>
              {presetGroups.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((p) => (
                    <option key={p.label} value={`${p.w}×${p.h}`}>
                      {p.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* 分隔线 */}
          <div className="crop-editor__toolbar-divider" />

          {/* 缩放控制 */}
          <div className="crop-editor__toolbar-group">
            <label className="crop-editor__toolbar-label">缩放</label>
            <input
              type="range"
              min={0.1}
              max={5}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="crop-editor__zoom-slider"
            />
            <input
              type="number"
              value={(zoom * 100).toFixed(1)}
              onChange={(e) => {
                const val = parseFloat(e.target.value)
                if (!isNaN(val) && val >= 10 && val <= 500) {
                  setZoom(val / 100)
                }
              }}
              onBlur={(e) => {
                const val = parseFloat(e.target.value)
                if (isNaN(val) || val < 10) setZoom(0.1)
                else if (val > 500) setZoom(5)
              }}
              min={10}
              max={500}
              step={0.1}
              className="crop-editor__size-input"
              style={{ width: '56px', textAlign: 'center' }}
            />
            <span className="crop-editor__size-label" style={{ width: 'auto', marginLeft: '-2px' }}>%</span>
            <button
              type="button"
              className="crop-editor__preset-btn"
              onClick={() => setZoom(1)}
              title="重置为 100%"
            >
              重置
            </button>
          </div>
        </div>

        {/* ========== Crop Area ========== */}
        <div className="crop-editor__canvas" ref={canvasRef}>
          <Cropper
            image={currentVariant.url}
            crop={crop}
            zoom={zoom}
            cropSize={cropSize}
            cropShape="rect"
            showGrid={true}
            restrictPosition={false}
            objectFit="contain"
            minZoom={0.1}
            maxZoom={5}
            zoomSpeed={0.3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            onMediaLoaded={handleMediaLoaded}
            style={{
              containerStyle: {
                background: 'repeating-conic-gradient(#e0e0e0 0% 25%, transparent 0% 50%) 50% / 20px 20px',
              },
              cropAreaStyle: {
                border: '2px dashed rgba(255, 0, 0, 0.9)',
                color: 'rgba(0, 0, 0, 0.5)',
              },
            }}
            classes={{
              containerClassName: 'crop-editor__cropper-container',
              cropAreaClassName: 'crop-editor__crop-area',
            }}
          />
        </div>

        {/* ========== Footer ========== */}
        <div className="crop-editor__footer">
          <div className="crop-editor__info">
            <span className="crop-editor__info-item">
              变体: <strong>{currentVariant.label}</strong>
            </span>
            <span className="crop-editor__info-item">
              裁剪框: <strong>{cropWidth}×{cropHeight}</strong>
            </span>
            <span className="crop-editor__info-item">
              缩放: <strong>{Math.round(zoom * 100)}%</strong>
            </span>
            {croppedAreaPixels.width > 0 && (
              <span className="crop-editor__info-item">
                输出区域: <strong>{Math.round(croppedAreaPixels.width)}×{Math.round(croppedAreaPixels.height)}</strong> px
              </span>
            )}
          </div>
          <div className="crop-editor__actions">
            <button type="button" className="crop-editor__btn crop-editor__btn--clear" onClick={handleClear}>
              清除裁剪
            </button>
            <button type="button" className="crop-editor__btn crop-editor__btn--cancel" onClick={onClose}>
              取消
            </button>
            <button type="button" className="crop-editor__btn crop-editor__btn--confirm" onClick={handleConfirm}>
              确认裁剪
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageCropEditor
