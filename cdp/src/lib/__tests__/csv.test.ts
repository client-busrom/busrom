import { describe, expect, it } from 'vitest'
import { toCsv } from '../csv'

describe('toCsv', () => {
  it('renders headers and rows', () => {
    const csv = toCsv(
      [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ],
      [
        { key: 'name', label: 'Name' },
        { key: 'age', label: 'Age' },
      ]
    )

    expect(csv).toBe('Name,Age\nAlice,30\nBob,25')
  })

  it('escapes fields containing commas', () => {
    const csv = toCsv(
      [{ title: 'Hello, world' }],
      [{ key: 'title', label: 'Title' }]
    )

    expect(csv).toBe('Title\n"Hello, world"')
  })

  it('escapes fields containing quotes', () => {
    const csv = toCsv(
      [{ title: 'Say "hello"' }],
      [{ key: 'title', label: 'Title' }]
    )

    expect(csv).toBe('Title\n"Say ""hello"""')
  })

  it('escapes fields containing newlines', () => {
    const csv = toCsv(
      [{ description: 'Line 1\nLine 2' }],
      [{ key: 'description', label: 'Description' }]
    )

    expect(csv).toBe('Description\n"Line 1\nLine 2"')
  })

  it('serializes objects as JSON', () => {
    const csv = toCsv(
      [{ meta: { a: 1 } }],
      [{ key: 'meta', label: 'Meta' }]
    )

    expect(csv).toBe('Meta\n"{""a"":1}"')
  })

  it('returns only headers for empty rows', () => {
    const csv = toCsv([], [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
    ])

    expect(csv).toBe('ID,Name')
  })

  it('renders null and undefined as empty strings', () => {
    const csv = toCsv(
      [{ a: null, b: undefined, c: 'value' }],
      [
        { key: 'a', label: 'A' },
        { key: 'b', label: 'B' },
        { key: 'c', label: 'C' },
      ]
    )

    expect(csv).toBe('A,B,C\n,,value')
  })
})
