/**
 * 将对象数组序列化为 CSV 字符串。
 *
 * @param rows  数据行，每行是一个对象
 * @param headers 表头定义：key 为对象字段名，label 为 CSV 列标题
 * @returns UTF-8 CSV 字符串
 */
export function toCsv(
  rows: Record<string, unknown>[],
  headers: { key: string; label: string }[]
): string {
  const lines: string[] = []

  // 表头
  lines.push(headers.map((h) => escapeCsvCell(h.label)).join(','))

  // 数据行
  for (const row of rows) {
    const cells = headers.map((h) => {
      const value = row[h.key]
      if (value === null || value === undefined) {
        return ''
      }
      if (typeof value === 'object') {
        return escapeCsvCell(JSON.stringify(value))
      }
      return escapeCsvCell(String(value))
    })
    lines.push(cells.join(','))
  }

  return lines.join('\n')
}

function escapeCsvCell(value: string): string {
  const needsEscape = /[",\n\r]/.test(value)
  if (!needsEscape) {
    return value
  }
  const escaped = value.replace(/"/g, '""')
  return `"${escaped}"`
}
