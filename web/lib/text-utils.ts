/**
 * 自动为无换行文本插入换行符
 *
 * 适用场景：多语言翻译后的文本没有手动换行，但前端设计需要固定行数。
 * 如果文本已包含 \n，则保持原样（尊重人工控制）。
 *
 * @param text 原始文本
 * @param targetLines 目标行数（从英文版的设计换行数推断）
 * @returns 插入 \n 后的文本
 */
export type BreakStrategy = "even" | "first-word-first"

/**
 * 自动为无换行文本插入换行符
 *
 * 适用场景：多语言翻译后的文本没有手动换行，但前端设计需要固定行数。
 * 如果文本已包含 \n，则保持原样（尊重人工控制）。
 *
 * @param text 原始文本
 * @param targetLines 目标行数（从英文版的设计换行数推断）
 * @param strategy 分行策略："even" 均匀分配（默认），"first-word-first" 第一行只放第一个单词
 * @returns 插入 \n 后的文本
 */
export function autoBreakLines(
  text: string | undefined,
  targetLines: number,
  strategy: BreakStrategy = "even",
): string {
  if (!text || targetLines <= 1) return text || ""

  // 已有手动换行 → 尊重人工控制，保持原样
  if (text.includes("\n")) return text

  const hasCJK =
    /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/.test(text)

  if (hasCJK) {
    // CJK 文字：按字符数均匀分配（每行至少 1 个字符）
    const chars = Array.from(text)
    const actualLines = Math.min(targetLines, chars.length)
    if (actualLines <= 1) return text

    const base = Math.floor(chars.length / actualLines)
    const remainder = chars.length % actualLines

    const lines: string[] = []
    let start = 0
    for (let i = 0; i < actualLines; i++) {
      const extra = i < remainder ? 1 : 0
      const end = start + base + extra
      lines.push(chars.slice(start, end).join(""))
      start = end
    }
    return lines.join("\n")
  }

  // 非 CJK（拉丁/阿拉伯等）：按空格分词后分配，尽量不在词中间断开
  const words = text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  const actualLines = Math.min(targetLines, words.length)
  if (actualLines <= 1) return text

  // "first-word-first" 策略：优先把第一个单词单独放第一行，剩余均匀分配
  if (strategy === "first-word-first" && actualLines >= 2 && words.length > actualLines) {
    const firstWord = words[0]
    const remainingWords = words.slice(1)
    const remainingLines = actualLines - 1

    const base = Math.floor(remainingWords.length / remainingLines)
    const remainder = remainingWords.length % remainingLines

    const lines = [firstWord]
    let start = 0
    for (let i = 0; i < remainingLines; i++) {
      const extra = i < remainder ? 1 : 0
      const end = start + base + extra
      lines.push(remainingWords.slice(start, end).join(" "))
      start = end
    }
    return lines.join("\n")
  }

  // "even" 策略（默认）：均匀分配
  const base = Math.floor(words.length / actualLines)
  const remainder = words.length % actualLines

  const lines: string[] = []
  let start = 0
  for (let i = 0; i < actualLines; i++) {
    const extra = i < remainder ? 1 : 0
    const end = start + base + extra
    lines.push(words.slice(start, end).join(" "))
    start = end
  }
  return lines.join("\n")
}

/**
 * 从英文文本推断目标行数
 * @param enText 英文版文本（从 CMS 或 API 中获取）
 * @returns 行数（\n 数量 + 1），无换行返回 1
 */
export function getTargetLinesFromEn(enText: string | undefined): number {
  if (!enText) return 1
  const lineCount = enText.split("\n").length
  return Math.max(1, lineCount)
}
