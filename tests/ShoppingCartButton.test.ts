import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ShoppingCartButton from '../src/js/components/ShoppingCartButton.vue'
import { createTestingPinia } from '@pinia/testing'
import { useCartStore } from '../src/js/stores/CartStore'
import Big from 'big.js'

// Mock Notivue because it might use browser APIs or have complex setup
vi.mock('notivue', () => ({
  Notivue: { template: '<div><slot /></div>' },
  Notification: { template: '<div></div>' },
  lightTheme: {},
}))

// Mock PopupControl
vi.mock('../src/js/components/PopupControl.vue', () => ({
  default: { template: '<div><slot name="header" /><slot name="body" /></div>' }
}))

// Mock ShoppingCartList
vi.mock('../src/js/components/ShoppingCartList.vue', () => ({
  default: { template: '<div class="shopping-cart-list"></div>' }
}))

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(() => Promise.resolve({ data: JSON.stringify({}) })),
  },
}))

describe('ShoppingCartButton.vue', () => {
  it('renders correctly with default state', () => {
    const wrapper = mount(ShoppingCartButton, {
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
          stubActions: false,
        })],
      },
      props: {
        id: 'test-cart-btn'
      }
    })

    const store = useCartStore()
    store.cart.count = 0
    store.cart.total = Big(0)

    expect(wrapper.text()).toContain('Total')
    expect(wrapper.text()).toContain('0.00')
  })

  it('shows item count when hidePrices is true', async () => {
    const wrapper = mount(ShoppingCartButton, {
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
          stubActions: false,
        })],
      },
      props: {
        hidePrices: true,
        id: 'test-cart-btn'
      }
    })

    const store = useCartStore()
    store.cart.count = 5
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Items')
    expect(wrapper.text()).toContain('5')
  })

  it('calls cart.clear() when clear button is clicked', async () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
    })
    const store = useCartStore()
    vi.spyOn(store.cart, 'clear')

    const wrapper = mount(ShoppingCartButton, {
      global: {
        plugins: [pinia],
      },
      props: {
        id: 'test-cart-btn'
      }
    })

    const clearBtn = wrapper.find('button.redglass-btn-clear')
    await clearBtn.trigger('click')

    expect(store.cart.clear).toHaveBeenCalled()
  })
})
