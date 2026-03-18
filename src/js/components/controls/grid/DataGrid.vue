<template>
  <div :class="useCard ? 'mb-1 rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 ' + cardClass : 'mb-1 w-full'">
    <!-- Header -->
    <div v-if="useCard || title !== ''" class="hidden border-b border-gray-200 p-2 lg:block dark:border-gray-700">
      <div v-if="title !== ''" class="mb-2">
        <h6 class="text-sm font-bold text-gray-900 dark:text-white">{{ title }}</h6>
      </div>
      <div class="flex items-center px-4">
        <div class="grow">
          <div class="grid grid-cols-12 gap-x-4">
            <div
              v-for="(column, index) in workingColumns"
              :key="column.field"
              class="flex cursor-pointer items-center truncate text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
              :class="[editorTextAlign(column), headingClass, getColumnSpanClass(column.width)]"
              :style="allowColumnChooser && index === 0 ? 'padding-left: 0px' : ''"
              @click="sortBy(column)"
            >
              <a
                class="mr-1 text-blue-500 hover:text-blue-600"
                @click="columnChooser($event)"
                v-if="allowColumnChooser && index === 0"
              >
                <vue-feather type="list" size="1.0em"></vue-feather>
              </a>
              {{ column.title }}
              <span
                v-if="column.field === sortColumn || column.sortField === sortColumn"
                class="ml-1"
                :class="reverse ? 'caret-down' : 'caret-up'"
              >
                <vue-feather :type="reverse ? 'chevron-down' : 'chevron-up'" size="0.8em"></vue-feather>
              </span>
            </div>
          </div>
        </div>
        <div v-if="hasFlags" class="ml-2 flex shrink-0 items-center space-x-1">
          <span
            v-for="(flag, index) in workingFlags"
            :key="index"
            class="flex h-5 w-4 items-center justify-center text-gray-400"
            :class="headingClass"
          >
            <vue-feather :type="flag.iconName" size="0.8em"></vue-feather>
          </span>
        </div>
      </div>
    </div>

    <!-- Data Area -->
    <div :class="dataAreaClass">
      <div :class="[useCard ? 'p-1' : '']" :style="cardStyle">
        <div v-if="allowSearch" class="mb-2 px-2">
          <div class="relative">
            <input
              class="w-full border-0 border-b border-gray-300 bg-transparent py-1.5 pl-1 pr-10 text-sm focus:border-blue-500 focus:ring-0 dark:border-gray-700"
              type="text"
              placeholder="Search ..."
              v-model="filter"
              @keyup.enter="asyncLoad(1)"
            />
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <vue-feather type="search" size="1em" class="text-gray-400"></vue-feather>
            </div>
          </div>
        </div>

        <button
          type="button"
          v-if="showAddRow"
          class="mb-1 w-full rounded py-2 text-sm font-medium transition-colors"
          :class="[addRowClass === 'add-row' ? 'bg-gray-50 text-blue-600 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-750' : addRowClass]"
          @click="addNewRow"
        >
          {{ newItemText }}
        </button>

        <draggable
          v-if="!loading && !errorLoading"
          v-model="rows"
          item-key="guid"
          class="w-full"
          ref="grid"
          :disabled="!isDraggable"
          @end="reorder"
        >
          <template #item="{ element: detail }">
            <data-row
              :key="detail[trackBy]"
              ref="dataRows"
              :flags="workingFlags"
              :allow-row-focus="allowRowFocus"
              :row-style="rowStyle(detail)"
              :flag-checked="flagChecked"
              :track-mouse="rowDeletable(detail)"
              :locked="isDraggable && !rowDraggable(detail)"
              :record="detail"
              :lookups="lookups"
              @lookup-added="addLookup"
              :draggable="isDraggable && rowDraggable(detail)"
              :disabled="rowDisabled(detail)"
              :lookup-url="lookupUrl"
              :formatter="formatter"
              :is-selected="isSelected(detail)"
              :columns="workingColumns"
              @on-clicked="internalRowClicked(detail)"
              @delete-row="rowDeleted"
              @field-changed="$emit('field-changed', $event.data)"
              :show-bottom-border="showBottomRowBorder"
              :multi-select="multiSelect"
              @row-selection-changed="rowSelectionChanged"
            >
              <template v-if="childField !== ''" #child>
                <data-row
                  v-for="child in detail[childField]"
                  :lookups="lookups"
                  @lookup-added="addLookup"
                  :is-child="true"
                  :lookup-url="lookupUrl"
                  :formatter="formatter"
                  :record="child"
                  :key="child[trackBy]"
                  :columns="childColumns"
                  :show-bottom-border="false"
                ></data-row>
              </template>
            </data-row>
          </template>
        </draggable>

        <div v-else class="flex w-full flex-col items-center justify-center py-12">
          <div v-if="loading" class="w-full max-w-xs px-4 text-center">
            <div class="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Loading ...</div>
            <div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div class="h-full animate-progress bg-yellow-400" style="width: 100%"></div>
            </div>
          </div>
          <div v-else class="text-center">
            <div class="mb-2 text-sm font-bold text-red-600">Error loading ...</div>
            <div class="mb-4 text-xs text-red-500">{{ errorMsg }}</div>
            <button
              id="btn_reload"
              type="button"
              class="rounded border border-green-600 px-3 py-1 text-xs font-medium text-green-600 transition-colors hover:bg-green-600 hover:text-white"
              @click="asyncLoad(1)"
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Running Totals -->
    <div
      v-if="showRunningTotals"
      class="flex items-center border-t border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="grow">
        <div class="grid grid-cols-12 gap-x-4">
          <div
            v-for="column in workingColumns"
            :key="column.field"
            class="truncate text-xs font-bold"
            :class="[column.class, editorTextAlign(column), getColumnSpanClass(column.width)]"
          >
            <span v-if="runningTotals.hasOwnProperty(column.field)">{{ output(runningTotals[column.field]) }}</span>
          </div>
        </div>
      </div>
    </div>

    <slot name="footer"></slot>

    <!-- Footer / Pagination -->
    <div
      class="flex flex-col items-center justify-between gap-4 border-t border-gray-100 p-2 md:flex-row dark:border-gray-800"
      :class="[useCard ? '' : 'mt-2']"
    >
      <div v-if="asyncUrl !== ''" class="flex w-full flex-col items-center justify-between gap-4 md:flex-row">
        <div class="flex-grow">
          <pagination
            :data="asyncPage"
            @pagination-change-page="asyncLoad"
            :limit="2"
            align="center"
          ></pagination>
        </div>

        <div class="flex items-center gap-4">
          <div v-if="draggable" class="flex items-center">
            <label class="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" class="peer sr-only" v-model="isDraggable" />
              <div
                class="peer h-5 w-9 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"
              ></div>
              <span class="ms-3 text-xs font-medium text-gray-900 dark:text-gray-300">Draggable</span>
            </label>
          </div>

          <select
            class="rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-800"
            v-model="limit"
            @change="limitChanged"
          >
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>
      </div>
      <div v-else class="flex w-full items-center justify-end">
        <div v-if="draggable" class="flex items-center">
          <label class="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" class="peer sr-only" v-model="isDraggable" />
            <div
              class="peer h-5 w-9 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"
            ></div>
            <span class="ms-3 text-xs font-medium text-gray-900 dark:text-gray-300">Allow Row Reorder</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import axios from 'axios'
import draggable from 'vuedraggable'
import { TailwindPagination as Pagination } from 'laravel-vue-pagination'
import DataRow from './DataRow.vue'
import Formatter from '../../../models/general/Formatter'

const props = withDefaults(defineProps<{
  selected?: any[]
  multiSelect?: boolean
  useCard?: boolean
  records?: any[]
  asyncUrl?: string
  allowSearch?: boolean
  allowAddNew?: boolean
  availableColumns?: any[]
  columns?: any[]
  flags?: any[]
  searchColumns?: any[]
  title?: string
  trackSelected?: boolean
  selectedId?: string | number
  trackBy?: string
  childField?: string
  childColumns?: any[]
  totalRowLimit?: number
  columnsLayout?: string
  dataAreaClass?: string
  filters?: string
  newItemText?: string
  cardClass?: string
  loadOnCreate?: boolean
  draggable?: boolean
  rowIndexField?: string
  formatter?: any
  flagChecked?: (data: any, flag: any) => boolean
  lookupDataSetter?: (data: any, column: any) => any
  lookupUrl?: any
  processRecord?: (record: any) => any
  showRunningTotals?: boolean
  rowDisabled?: (record: any) => boolean
  rowDeletable?: (record: any) => boolean
  rowStyle?: (record: any) => string
  addRowClass?: string
  dynamicHeight?: boolean
  showBottomRowBorder?: boolean
  updateSettings?: (settings: any) => void
  settings?: any
  allowRowFocus?: boolean
}>(), {
  selected: () => [],
  multiSelect: false,
  useCard: true,
  records: () => [],
  asyncUrl: '',
  allowSearch: true,
  allowAddNew: true,
  availableColumns: () => [],
  columns: () => [
    { field: 'name', width: 12, format: 'string', title: 'Name', class: '', align: 'left', sortField: 'name', editInputClass: 'form-input' }
  ],
  flags: () => [],
  searchColumns: () => [],
  title: '',
  trackSelected: false,
  selectedId: '',
  trackBy: 'guid',
  childField: '',
  childColumns: () => [],
  totalRowLimit: 0,
  columnsLayout: '',
  dataAreaClass: '',
  filters: '',
  newItemText: 'Click to add new item',
  cardClass: '',
  loadOnCreate: true,
  draggable: false,
  rowIndexField: '',
  flagChecked: (data: any, flag: any) => data,
  lookupDataSetter: (data: any, column: any) => data,
  processRecord: (record: any) => record,
  showRunningTotals: false,
  rowDisabled: (record: any) => false,
  rowDeletable: (record: any) => true,
  rowStyle: (record: any) => '',
  addRowClass: 'add-row',
  dynamicHeight: false,
  showBottomRowBorder: false,
  updateSettings: (settings: any) => {},
  settings: () => ({ RowOrderChangeable: false }),
  allowRowFocus: true
})

const emit = defineEmits<{
  (e: 'remove-from-selected', item: any): void
  (e: 'add-to-selected', item: any): void
  (e: 'row-clicked', item: any): void
  (e: 'new-row'): void
  (e: 'delete-row', item: any, event: any): void
  (e: 'page-loaded', page: any): void
  (e: 'row-changed', item: any): void
  (e: 'field-changed', data: any): void
}>()

const getColumnSpanClass = (width: number) => {
  const spans: Record<number, string> = {
    1: 'lg:col-span-1',
    2: 'lg:col-span-2',
    3: 'lg:col-span-3',
    4: 'lg:col-span-4',
    5: 'lg:col-span-5',
    6: 'lg:col-span-6',
    7: 'lg:col-span-7',
    8: 'lg:col-span-8',
    9: 'lg:col-span-9',
    10: 'lg:col-span-10',
    11: 'lg:col-span-11',
    12: 'lg:col-span-12'
  }
  return spans[width] || 'lg:col-span-12'
}

// State
const loading = ref(false)
const asyncPage = ref<any>({ data: [] })
const reverse = ref(false)
const sortColumn = ref('')
const isSorting = ref(false)
const filter = ref('')
const localSelected = ref<any>(null)
const errorLoading = ref(false)
const errorMsg = ref('')
const prefix = ref(window.Prefix || '')
const lookups = ref<any>({})
const runningTotals = ref<any>({})
const formatter = new Formatter()
const limit = ref(25)
const workingColumns = ref(props.columns)
const workingFlags = ref(props.flags)
const headingClass = ref('')
const isDraggable = ref(false)
const selectedIds = ref<any[]>(props.selected)

// Computed
const rows = computed({
  get: () => {
    let list = []
    if (props.asyncUrl && props.asyncUrl !== '') {
      list = asyncPage.value.data || []
    } else {
      list = filterRows()
    }
    calculateTotals(list)
    return list
  },
  set: (val) => {
    if (props.asyncUrl && props.asyncUrl !== '') {
      asyncPage.value.data = val
    } else {
      // For local records, we might need to update the source array
      // but usually vuedraggable handles the splice.
    }
  }
})

const allowColumnChooser = computed(() => props.availableColumns.length > 0)

const showAddRow = computed(() => {
  if (!props.allowAddNew) return false
  if (props.asyncUrl && props.asyncUrl !== '') return true
  return !(props.totalRowLimit > 0 && props.records.length > props.totalRowLimit)
})

const hasFlags = computed(() => workingFlags.value.length > 0)

const cardStyle = computed(() => {
  if (props.dynamicHeight || !(props.asyncUrl && props.asyncUrl !== '')) {
    return ''
  }
  return `min-height: ${22 * (limit.value - 1)}px`
})

// Methods
const getSelectedRows = () => selectedIds.value

const rowSelectionChanged = (item: any) => {
  const index = selectedIds.value.findIndex((obj) => obj[props.trackBy] === item[props.trackBy])
  if (index >= 0) {
    selectedIds.value.splice(index, 1)
    emit('remove-from-selected', item)
  } else {
    selectedIds.value.push(item)
    emit('add-to-selected', item)
  }
}

const setLoading = (value: boolean) => {
  loading.value = value
}

const rowDraggable = (record: any) => isDraggable.value && !props.rowDisabled(record)

const output = (total: any) => formatter.format(total.value, total.format)

const visableRows = () => rows.value

const isSelected = (row: any) => {
  if (!row) return false
  if (props.multiSelect) {
    return selectedIds.value.findIndex((obj) => obj[props.trackBy] === row[props.trackBy]) >= 0
  }
  if (!localSelected.value) return false
  return props.trackSelected && localSelected.value[props.trackBy] === row[props.trackBy]
}

const filterRows = () => {
  if (!filter.value || filter.value === '') return props.records
  return props.records.filter((record) => search(record))
}

const search = (record: any) => {
  const filterText = filter.value.toLowerCase()
  const searchCols = props.searchColumns.length > 0 ? props.searchColumns : workingColumns.value.map((c) => c.field)
  for (const key of searchCols) {
    if ((record[key] + '').toLowerCase().indexOf(filterText) !== -1) {
      return true
    }
  }
  return false
}

const sortBy = (column: any) => {
  if (!column || isDraggable.value) return
  const key = column.sortField || column.field
  if (props.asyncUrl && props.asyncUrl !== '') {
    if (column.allowSort === false) return
  }

  isSorting.value = true
  if (key !== sortColumn.value) {
    sortColumn.value = key
    reverse.value = false
  } else {
    reverse.value = !reverse.value
  }

  sorter(key, reverse.value)
  nextTick(() => { isSorting.value = false })
}

const getValue = (data: any, key: string): any => {
  if (!data) return undefined
  const tmp = key.split('.')
  if (tmp.length > 1) {
    const d = data[tmp[0]]
    tmp.splice(0, 1)
    return getValue(d, tmp.join('.'))
  }
  return data[key]
}

const sorter = (key: string, direction: boolean) => {
  if (props.asyncUrl && props.asyncUrl !== '') {
    asyncLoad(1)
  } else {
    rows.value.sort((a: any, b: any) => {
      const valueA = getValue(a, key)
      const valueB = getValue(b, key)
      let result = 0
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        result = valueA - valueB
      } else {
        result = (valueA < valueB ? -1 : (valueA > valueB ? 1 : 0))
      }
      return direction ? result * -1 : result
    })
  }
}

const asyncDeleteRow = (guid: string) => {
  const index = asyncPage.value.data.findIndex((item: any) => item[props.trackBy] === guid)
  if (index >= 0) {
    asyncPage.value.data.splice(index, 1)
    if (asyncPage.value.current_page && asyncPage.value.current_page !== asyncPage.value.last_page) {
      asyncLoad(null, false)
    }
  }
}

const internalRowClicked = (item: any) => {
  if (props.rowDisabled(item)) return
  emit('row-clicked', item)
  // @ts-ignore
  if (window.EventBus) {
    // @ts-ignore
    window.EventBus.$emit('row-clicked', item)
  }
}

const addNewRow = () => emit('new-row')

const rowDeleted = (item: any, e: any) => {
  if (!props.rowDeletable(item)) return
  emit('delete-row', item, e)
}

const limitChanged = () => {
  localStorage.setItem('grid-limit', String(limit.value))
  asyncPage.value.per_page = limit.value
  asyncLoad(asyncPage.value.current_page || 1)
}

const asyncLoad = (page: any = 1, withLoading = true) => {
  if (!props.asyncUrl || props.asyncUrl === '') return
  errorLoading.value = false

  const pageNum = page || asyncPage.value.current_page || 1
  const limitVal = asyncPage.value.per_page || limit.value
  let order = ''
  if (sortColumn.value) {
    order = `&sc=${sortColumn.value}&d=${reverse.value ? 'up' : 'down'}`
  }
  let searchStr = ''
  if (filter.value) {
    searchStr = `&s=${filter.value.toLowerCase().replace(/ /g, '+')}`
  }
  let tmpFilter = ''
  if (props.filters) {
    tmpFilter = `&f=${props.filters}`
  }

  if (withLoading) loading.value = true

  const url = `${prefix.value}${props.asyncUrl}?page=${pageNum}${order}${searchStr}${tmpFilter}&per_page=${limitVal}`
  axios.get(url).then((response) => {
    if (response.data.data) {
      localSelected.value = response.data.data.find((obj: any) => obj[props.trackBy] === props.selectedId)
    }
    asyncPage.value = response.data
    asyncPage.value.data = response.data.data.map((record: any) => props.processRecord(record))
    emit('page-loaded', asyncPage.value)
    loading.value = false
  }).catch((error) => {
    errorMsg.value = error.message
    loading.value = false
    errorLoading.value = true
  })
}

const calculateTotals = (records: any[]) => {
  if (!props.showRunningTotals) return
  for (const key in runningTotals.value) {
    runningTotals.value[key].value = 0
  }
  records.forEach((record) => {
    for (const key in runningTotals.value) {
      const total = runningTotals.value[key]
      if (record.hasOwnProperty(key)) {
        if (total.functionType === 'sum') {
          total.value += Number(record[key])
        } else if (total.functionType === 'count') {
          total.value++
        }
      }
    }
  })
}

const cacheLookups = async () => {
  for (const column of workingColumns.value) {
    if (column.format && typeof column.format === 'object' && column.format.type === 'lookup' && column.format.preCache === 'all') {
      const key = column.format.key || column.format.field
      try {
        const response = await axios.get(prefix.value + column.format.url)
        if (response.status === 200) {
          for (const item of response.data) {
            if (item.data && item.data[column.format.field] !== undefined) {
              addLookup({ column, data: item.data }, false)
            }
          }
        }
      } catch (e) {
        console.error('Pre-cache failed', e)
      }
    }
  }
  return true
}

const refresh = () => {
  lookups.value = {}
  asyncLoad(1)
}

const updateObject = (obj: any, addIfMissing = true) => {
  for (const col of workingColumns.value) {
    const format = col.format
    if (format && typeof format === 'object' && format.type === 'lookup') {
      if (lookups.value[format.key]) {
        delete lookups.value[format.key][obj[format.key]]
      }
    }
  }

  const list = (props.asyncUrl && props.asyncUrl !== '') ? asyncPage.value.data : props.records
  const index = list.findIndex((item: any) => item[props.trackBy] === obj[props.trackBy])

  if (index < 0) {
    if (addIfMissing) list.unshift(obj)
  } else {
    list.splice(index, 1, obj)
  }

  localSelected.value = list.find((o: any) => o[props.trackBy] === props.selectedId)
}

const removeObject = (obj: any) => {
  const list = (props.asyncUrl && props.asyncUrl !== '') ? asyncPage.value.data : props.records
  const index = list.findIndex((item: any) => item[props.trackBy] === obj[props.trackBy])
  if (index >= 0) {
    list.splice(index, 1)
  }
  if (list.length > 0) localSelected.value = list[0]
}

const removeAll = () => {
  const list = (props.asyncUrl && props.asyncUrl !== '') ? asyncPage.value.data : props.records
  list.splice(0, list.length)
}

const columnChooser = (e: MouseEvent) => {
  e.stopPropagation()
  console.log('Show column chooser')
}

const editorTextAlign = (column: any) => {
  if (column.align) {
    if (column.align === 'left') return 'text-left'
    if (column.align === 'center') return 'text-center'
    return 'text-right'
  }
  let format = column.format
  if (column.format && typeof column.format === 'object') format = column.format.type
  return format === 'number' || format === 'currency' ? 'text-right' : 'text-left'
}

const addLookup = (item: any, doUpdate = true) => {
  const trackField = item.column.format.trackField || 'guid'
  const key = item.column.format.key || item.column.format.field
  if (!lookups.value[key]) lookups.value[key] = {}
  lookups.value[key][item.data[trackField]] = props.lookupDataSetter(item.data, item.column)
}

const reorder = (evt: any) => {
  if (!rowDraggable(rows.value[evt.oldIndex])) {
    if (props.rowIndexField) sorter(props.rowIndexField, false)
    return
  }

  if (props.rowIndexField) {
    let i = 1
    rows.value.forEach((item: any) => {
      if (item[props.rowIndexField] < 10000) {
        if (item[props.rowIndexField] !== i) {
          item[props.rowIndexField] = i
          emit('row-changed', item)
        }
        i++
      }
    })
  }
}

// Lifecycle
onMounted(() => {
  const gridLimit = Number(localStorage.getItem('grid-limit'))
  limit.value = gridLimit > 0 ? gridLimit : 25

  if (props.columnsLayout) {
    axios.get(props.columnsLayout).then((response) => {
      if (response.data.columns) workingColumns.value = response.data.columns
      if (response.data.flags) workingFlags.value = response.data.flags
      if (response.data.headingClass) headingClass.value = response.data.headingClass
    })
  }

  isDraggable.value = props.draggable && props.settings.RowOrderChangeable

  if (props.searchColumns.length === 0) {
    workingColumns.value.forEach((col) => {
      // @ts-ignore
      props.searchColumns.push(col.field)
    })
  }

  cacheLookups().then(() => {
    if (props.loadOnCreate) asyncLoad(1)
  })

  workingColumns.value.forEach((col) => {
    if (col.runningTotal) {
      runningTotals.value[col.field] = {
        value: 0,
        functionType: col.runningTotal.functionType,
        format: col.runningTotal.format
      }
    }
  })
})

// Watchers
watch(() => props.selected, (newVal) => { selectedIds.value = newVal })
watch(() => props.selectedId, (newVal, oldVal) => {
  if (asyncPage.value.data) {
    localSelected.value = asyncPage.value.data.find((obj: any) => obj[props.trackBy] === newVal)
  }
})
watch(() => props.filters, () => { if (props.asyncUrl) asyncLoad(1) })
watch(() => props.asyncUrl, () => { refresh() })
watch(isDraggable, (newVal) => {
  // @ts-ignore
  props.settings.RowOrderChangeable = newVal
  if (newVal && !props.asyncUrl) sorter(props.rowIndexField, false)
  props.updateSettings(props.settings)
})

defineExpose({
  getSelectedRows,
  setLoading,
  asyncDeleteRow,
  refresh,
  updateObject,
  removeObject,
  removeAll,
  asyncLoad
})
</script>

<style scoped>
@keyframes progress {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-progress {
  animation: progress 2s infinite linear;
}
</style>
