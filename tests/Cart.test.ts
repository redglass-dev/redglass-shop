import { describe, it, expect, beforeEach, vi } from 'vitest'
import Cart, { StockItem, MenuItem, Invoice } from '../src/js/Cart'
import Big from 'big.js'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    clear: () => {
      store = {}
    },
  }
})()

vi.stubGlobal('localStorage', localStorageMock)

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(() => Promise.resolve({ data: JSON.stringify({}) })),
  },
}))

describe('Cart', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('initializes with empty items', () => {
    const cart = new Cart()
    expect(cart.items).toEqual([])
    expect(cart.count).toBe(0)
    expect(cart.total.toString()).toBe('0')
  })

  it('adds a stock item', () => {
    const cart = new Cart()
    cart.addStockItem('guid-1', 'Test Product', 2, 10.50)

    expect(cart.count).toBe(1)
    expect(cart.items.length).toBe(1)
    expect(cart.items[0].name).toBe('Test Product')
    expect(cart.items[0].Qty).toBe(2)
    expect(cart.total.toString()).toBe('21')
  })

  it('removes a stock item', () => {
    const cart = new Cart()
    cart.addStockItem('guid-1', 'Test Product', 2, 10.50)
    expect(cart.count).toBe(1)

    cart.removeItem('stockItem', '0')
    expect(cart.count).toBe(0)
    expect(cart.items.length).toBe(0)
    expect(cart.total.toString()).toBe('0')
  })

  it('increments quantity', () => {
    const cart = new Cart()
    cart.addStockItem('guid-1', 'Test Product', 1, 10)

    cart.incrementQty('stockItem', '0', 2)

    expect(cart.items[0].Qty).toBe(3)
    expect(cart.total.toString()).toBe('30')
  })

  it('clears the cart', () => {
    const cart = new Cart()
    cart.addStockItem('guid-1', 'Test Product', 1, 10)
    cart.clear()

    expect(cart.items.length).toBe(0)
    expect(cart.total.toString()).toBe('0')
    expect(cart.count).toBe(0)
  })

  it('calculates total with multiple items', () => {
    const cart = new Cart()
    cart.addStockItem('guid-1', 'Product 1', 2, 10) // 20
    cart.addStockItem('guid-2', 'Product 2', 1, 15) // 15

    expect(cart.total.toString()).toBe('35')
  })
})

describe('StockItem', () => {
  it('calculates total correctly', () => {
    const item = new StockItem()
    item.value = Big(10.5)
    item.Qty = 3
    expect(item.calTotal().toString()).toBe('31.5')
  })

  it('handles negative quantity by resetting to 0', () => {
    const item = new StockItem()
    item.value = Big(10)
    item.Qty = -5
    expect(item.Qty).toBe(0)
  })
})
