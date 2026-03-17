 <template>
  <div class="col-span-12 border rounded-lg shadow-sm m-1.5 overflow-hidden">
    <div class="flex cursor-pointer" @click="showModal">
      <div class="hidden md:flex flex-col justify-between w-1/3 bg-gray-100 p-3">
        <div>
          <h4 class="text-lg font-bold">{{ itemName }}</h4>
          <p class="text-sm text-gray-600">{{ descriptionShort }}</p>
        </div>
        <div class="mt-2">
          <span class="text-gray-900 font-semibold">${{ price }}</span>
        </div>
      </div>
      <div class="w-full md:w-2/3">
        <img class="w-full h-auto object-cover" :src="thumbnail" alt="item thumbnail" />
      </div>
      <div class="flex flex-col justify-between w-full md:hidden bg-gray-100 p-3">
        <div>
          <h4 class="text-lg font-bold">{{ itemName }}</h4>
          <p class="text-sm text-gray-600">{{ descriptionShort }}</p>
        </div>
        <div class="mt-2">
          <span class="text-gray-900 font-semibold">${{ price }}</span>
        </div>
      </div>
    </div>

    <!-- Modal using headless or simple tailwind -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
        <div :class="['px-4 py-3 border-b flex justify-between items-center rounded-t-lg', headerClass]" :style="headerStyle">
          <h5 v-if="!titleInBody" :class="['text-lg font-bold', titleClass]">{{ itemName }}</h5>
          <button type="button" class="text-gray-400 hover:text-red-500 transition-colors" @click="closeModal">
            <vue-feather type="x" size="1.4em"></vue-feather>
          </button>
        </div>

        <div class="p-4 overflow-y-auto flex-grow">
          <h5 v-if="titleInBody" :class="['text-xl font-bold mb-2', titleClass]" :style="titleStyle">{{ itemName }}</h5>
          <p class="text-gray-700 mb-4"><span v-html="description"></span></p>

          <div v-for="(profile, key) in menuItem.profiles" :key="key" class="mb-6">
            <div v-if="profile.max === 1 && profile.min === 1">
              <h5 class="text-md font-semibold mb-2">{{ profile.name }} <span class="text-sm text-gray-500 font-normal">(Choose 1)</span></h5>
              <div v-for="(condiment, cKey) in profile.condiments" :key="cKey" class="flex items-center justify-between py-1 px-2 hover:bg-gray-50 rounded">
                <label class="flex items-center space-x-2 cursor-pointer flex-grow">
                  <input
                    type="radio"
                    class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    v-model="profile.selected"
                    :value="condiment.guid"
                    :name="'p_' + profile.guid"
                    @change="condimentSelected($event, profile, condiment)"
                  />
                  <span class="text-sm text-gray-900">{{ condiment.name }}</span>
                </label>
                <span v-if="Number(condiment.price) > 0" class="text-sm text-gray-500">+${{ condiment.price }}</span>
              </div>
            </div>

            <div v-else-if="profile.max === profile.min">
              <h5 class="text-md font-semibold mb-2">
                {{ profile.name }}
                <span v-if="profile.min > 0" class="text-sm text-gray-500 font-normal"> (Choose {{ profile.min }})</span>
                <span v-else class="text-sm text-gray-500 font-normal"> (Choose between 0 and {{ profile.condiments.length }})</span>
              </h5>
              <div v-for="(condiment, cKey) in profile.condiments" :key="cKey" class="flex items-center justify-between py-1 px-2 hover:bg-gray-50 rounded">
                <label class="flex items-center space-x-2 cursor-pointer flex-grow">
                  <input
                    type="checkbox"
                    class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    v-model="condiment.selected"
                    :value="condiment.guid"
                    @change="condimentSelected($event, profile, condiment)"
                  />
                  <span class="text-sm text-gray-900">{{ condiment.name }}</span>
                </label>
                <span v-if="Number(condiment.price) > 0" class="text-sm text-gray-500">+${{ condiment.price }}</span>
              </div>
            </div>

            <div v-else>
              <h5 class="text-md font-semibold mb-2">{{ profile.name }} <span class="text-sm text-gray-500 font-normal">(Choose between {{ profile.min }} and {{ profile.max }})</span></h5>
              <p v-if="errors.has('p_' + profile.guid)" class="mb-2 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded inline-block">
                You must select at least {{ profile.min }} items.
              </p>
              <div v-for="(condiment, cKey) in profile.condiments" :key="cKey" class="flex items-center justify-between py-1 px-2 hover:bg-gray-50 rounded">
                <label class="flex items-center space-x-2 cursor-pointer flex-grow">
                  <input
                    type="checkbox"
                    class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    v-model="condiment.selected"
                    :value="condiment.guid"
                    @change="condimentSelected($event, profile, condiment)"
                  />
                  <span class="text-sm text-gray-900">{{ condiment.name }}</span>
                </label>
                <span v-if="Number(condiment.price) > 0" class="text-sm text-gray-500">+${{ condiment.price }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="px-4 py-3 border-t bg-gray-50 rounded-b-lg flex items-center justify-between">
          <div v-if="!loading" class="flex items-center space-x-3 w-full">
            <div class="flex items-center space-x-2">
              <button
                type="button"
                class="inline-flex items-center p-1 border border-gray-300 rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                :disabled="menuItem.qty <= 1"
                @click="incrementQty(-1)"
              >
                <vue-feather type="minus" size="1.2em"></vue-feather>
              </button>
              <span class="text-lg font-semibold min-w-[1.5rem] text-center">{{ menuItem.qty }}</span>
              <button
                type="button"
                class="inline-flex items-center p-1 border border-gray-300 rounded-full text-gray-500 hover:bg-gray-100"
                @click="incrementQty(1)"
              >
                <vue-feather type="plus" size="1.2em"></vue-feather>
              </button>
            </div>
            <div class="flex-grow flex justify-end space-x-2">
              <button
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                :disabled="errors.any()"
                @click="buy"
              >
                Buy ${{ menuItem.total }}
              </button>
              <button
                type="button"
                class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                @click="closeModal"
              >
                Close
              </button>
            </div>
          </div>
          <div v-else class="w-full flex justify-center">
            <vue-feather type="loader" animation="spin" animation-speed="fast" size="1.4em"></vue-feather>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { FormErrors } from './libraries/jl-general/helpers/Form'
import Big from 'big.js'
import { MenuItem as MenuItemModel } from '../Cart'
import uuid from 'uuid-random'
import { useCartStore } from '@/stores/CartStore'
import { push } from 'notivue'
import axios from 'axios'

interface Condiment {
  guid: string
  name: string
  price: string
  stockGuid: string
  sortOrder: number
  qty: number
  selected: boolean
}

interface Profile {
  guid: string
  name: string
  max: number
  min: number
  selected: string
  sortOrder: number
  condiments: Condiment[]
}

const props = defineProps<{
  itemName: string
  item: string
  price: string | number
  description?: string
  thumbnail?: string
  headerStyle?: string
  headerClass?: string
  titleClass?: string
  isOpen?: boolean
  descriptionLength?: number
  minHeight?: number
  titleInBody?: boolean
  titleStyle?: string
}>()

const cartStore = useCartStore()
const errors = ref(new FormErrors())
const loading = ref(false)
const isModalOpen = ref(false)

const menuItem = ref({
  key: '',
  guid: '',
  name: '',
  stockGuid: '',
  price: props.price,
  total: '0.00',
  qty: 1,
  stockBoxWeight: 0,
  profiles: [] as Profile[]
})

const descriptionShort = computed(() => {
  const clamp = '...'
  const length = props.descriptionLength || 105
  const desc = props.description || ''
  const node = document.createElement('div')
  node.innerHTML = desc
  const content = node.textContent || ''
  return content.length > length ? content.slice(0, length) + clamp : content
})

const loadMenuItem = async () => {
  loading.value = true
  menuItem.value.price = props.price

  try {
    const response = await axios.get(`/api/v1/menu-items/${props.item}`)
    const data = response.data

    menuItem.value.key = uuid()
    menuItem.value.guid = data.guid
    menuItem.value.stockGuid = data.stockGuid
    menuItem.value.name = data.name
    menuItem.value.stockBoxWeight = data.stock.boxWeight

    const pros: Profile[] = []
    const tmpErrors: Record<string, any> = {}

    data.condiment_profiles.forEach((profileData: any) => {
      const profile: Profile = {
        guid: profileData.guid,
        name: profileData.name,
        max: profileData.maxSelection,
        min: profileData.minSelection,
        selected: '',
        sortOrder: profileData.orderBy,
        condiments: profileData.condiments.map((condData: any) => ({
          guid: condData.guid,
          name: condData.name,
          price: Big(condData.priceInc).toFixed(2),
          stockGuid: condData.stockGuid,
          sortOrder: condData.orderBy,
          qty: 1,
          selected: false
        }))
      }

      if (profile.min === 1 && profile.max === 1) {
        profile.selected = profile.condiments[0].guid
      } else if (profile.min > 0) {
        tmpErrors[`p_${profile.guid}`] = { description: 'Missing condiments' }
      }

      pros.push(profile)
    })

    errors.value.record(tmpErrors)
    menuItem.value.profiles = pros
    setTotal()
  } catch (error) {
    console.error('Failed to load menu item', error)
  } finally {
    loading.value = false
  }
}

const showModal = () => {
  if (props.isOpen !== false) {
    loadMenuItem()
    isModalOpen.value = true
  }
}

const closeModal = () => {
  isModalOpen.value = false
}

const setTotal = () => {
  let total = Big(menuItem.value.price).times(menuItem.value.qty)

  menuItem.value.profiles.forEach((profile) => {
    if (profile.min === 1 && profile.max === 1) {
      const selected = profile.condiments.find((c) => c.guid === profile.selected)
      if (selected) {
        total = Big(selected.price).times(menuItem.value.qty).plus(total)
      }
    } else {
      profile.condiments.forEach((condiment) => {
        if (condiment.selected && Number(condiment.price) > 0) {
          total = Big(condiment.price).times(menuItem.value.qty).plus(total)
        }
      })
    }
  })

  menuItem.value.total = total.toFixed(2)
}

const isMinimumSelected = (profile: Profile) => {
  if (profile.min === 1 && profile.max === 1) {
    return true
  }
  const count = profile.condiments.filter((c) => c.selected).length
  return count >= profile.min
}

const resetMinimumSelectedErrors = () => {
  const tmp: Record<string, any> = {}
  menuItem.value.profiles.forEach((profile) => {
    if (!isMinimumSelected(profile)) {
      tmp[`p_${profile.guid}`] = { description: 'Missing condiments' }
    }
  })
  errors.value.record(tmp)
}

const condimentSelected = (event: any, profile: Profile, cond: Condiment) => {
  nextTick(() => {
    resetMinimumSelectedErrors()

    if (event.target.type === 'checkbox' && event.target.checked) {
      const count = profile.condiments.filter((c) => c.selected).length
      if (profile.max > 0 && count > profile.max) {
        // Enforce max selection by unselecting first other selected item
        const other = profile.condiments.find((c) => c.selected && c.guid !== cond.guid)
        if (other) {
          other.selected = false
        }
      }
    }
    setTotal()
  })
}

const incrementQty = (incrementor: number) => {
  const newQty = menuItem.value.qty + incrementor
  if (newQty >= 1) {
    menuItem.value.qty = newQty
    setTotal()
  }
}

const buy = () => {
  resetMinimumSelectedErrors()

  if (!errors.value.any()) {
    const item = new MenuItemModel()
    item.key = menuItem.value.key
    item.guid = menuItem.value.guid
    item.name = menuItem.value.name
    item.price = Big(menuItem.value.price)
    item.profiles = menuItem.value.profiles as any
    item.Qty = menuItem.value.qty
    item.stockGuid = menuItem.value.stockGuid
    item.weight = menuItem.value.stockBoxWeight

    cartStore.cart.addItem('menuItem', item.key, item)
    closeModal()
    push.success(`${menuItem.value.qty} ${menuItem.value.name} added to cart`)
  }
}
</script>
