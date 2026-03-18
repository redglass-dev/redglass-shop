<template>
  <div
    class="relative w-full overflow-hidden focus:outline-none"
    :class="[isSelected && !multiSelect ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800']"
    tabindex="-1"
    @mouseenter="focus"
    @keyup.delete="deleteRow($event)"
  >
    <div
      class="flex flex-wrap items-center px-4 py-2"
      :class="[showBottomBorder ? 'border-b border-gray-200 dark:border-gray-700' : '']"
      :style="rowStyle"
    >
      <div v-if="draggable" class="mr-2 flex h-5 w-4 shrink-0 items-center text-gray-400">
        <vue-feather type="menu" size="0.8em"></vue-feather>
      </div>
      <div v-else-if="locked" class="mr-2 flex h-5 w-4 shrink-0 items-center text-gray-400">
        <vue-feather type="paperclip" size="0.8em"></vue-feather>
      </div>
      <div v-if="multiSelect" class="mr-2 flex h-5 w-4 shrink-0 items-center">
        <input
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          @change="$emit('row-selection-changed', record)"
          :checked="isSelected"
        />
      </div>

      <div class="grow">
        <div class="grid grid-cols-12 gap-x-4">
          <div
            v-for="(column, index) in columns"
            :key="column.field"
            :class="createRowClass(column)"
            @click="click($event, column)"
          >
            <!-- Mobile label -->
            <small class="mb-1 block border-b border-gray-100 font-bold text-gray-500 lg:hidden dark:border-gray-700">
              {{ column.title }}
            </small>

            <div class="flex items-center">
              <span v-if="isChild && index === 0" class="mr-1">
                <vue-feather type="corner-down-right" size="1.0em" class="align-text-top"></vue-feather>
              </span>

              <template v-if="column.editor && !disabled">
                <vue-numeric
                  v-if="column.editor.type === 'currency'"
                  :class="[getEditInputClass(column), editorTextAlign(column)]"
                  currency="$"
                  :precision="2"
                  separator=","
                  :value="getValue(record, column.field)"
                  @change.native="editFieldChanged(column, $event)"
                  @focus="focusEditInput($event.target, column)"
                  @input="setValue(record, column.field, $event)"
                ></vue-numeric>
                <input
                  v-else
                  :class="[getEditInputClass(column), editorTextAlign(column)]"
                  type="text"
                  :value="getValue(record, column.field)"
                  @input="setValue(record, column.field, ($event.target as HTMLInputElement).value)"
                  @change="editFieldChanged(column, $event)"
                  @focus="focusEditInput($event.target, column)"
                />
              </template>
              <span v-else class="w-full truncate" v-html="output(column, record)"></span>
            </div>
          </div>

          <slot name="child"></slot>
        </div>
      </div>

      <div v-if="hasFlags" class="ml-2 flex shrink-0 items-center space-x-1">
        <span v-for="(flag, index) in flags" :key="index" class="text-gray-400">
          <vue-feather
            v-if="flagChecked(record[flag.field], flag)"
            :type="flag.iconName"
            size="0.8em"
            class="pb-1"
          ></vue-feather>
          <vue-feather v-else :type="flag.iconName" size="0.8em" stroke="none" class="pb-1"></vue-feather>
        </span>
      </div>
    </div>
    <small
      v-if="!showBottomBorder"
      class="block border-b border-gray-400 lg:hidden dark:border-gray-600"
    ></small>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import axios from 'axios'
import VueNumeric from 'vue-numeric'
import Formatter from '../../../models/general/Formatter'
import { Parser } from 'expr-eval'

const props = withDefaults(defineProps<{
  record: any
  columns?: any[]
  showBottomBorder?: boolean
  isSelected?: boolean
  rowStyle?: any
  isChild?: boolean
  lookups?: any
  draggable?: boolean
  formatter?: (data: any, format: any) => string
  lookupUrl?: (column: any, objectId: any) => string
  flags?: any[]
  trackMouse?: boolean
  locked?: boolean
  disabled?: boolean
  flagChecked?: (data: any, flag: any) => boolean
  allowRowFocus?: boolean
  multiSelect?: boolean
}>(), {
  columns: () => [{ field: 'name', width: 12, format: 'string', title: 'Name', class: '' }],
  showBottomBorder: true,
  isSelected: false,
  rowStyle: '',
  isChild: false,
  lookups: () => ({}),
  draggable: false,
  formatter: function(data: any, format: any) {
    // @ts-ignore
    return (new Formatter()).format(data, format)
  },
  lookupUrl: function(column: any, objectId: any) {
    // @ts-ignore
    return (window.Prefix || '') + column.format.url + '/' + objectId
  },
  flags: () => [],
  trackMouse: true,
  locked: false,
  disabled: false,
  flagChecked: (data: any, flag: any) => !!data,
  allowRowFocus: true,
  multiSelect: false
})

const emit = defineEmits<{
  (e: 'row-selection-changed', record: any): void
  (e: 'lookup-added', payload: { column: any, data: any, doUpdate?: boolean }): void
  (e: 'on-clicked'): void
  (e: 'field-changed', data: any): void
  (e: 'delete-row', record: any, event: any): void
  (e: 'rowChecked', data: any): void
}>()

const hasFlags = computed(() => {
  return props.flags.length > 0
})

const focusEditInput = (target: any, column: any) => {
  if (column.onEditInputFocus) {
    column.onEditInputFocus(target)
  } else {
    selectText(target)
  }
}

const getEditInputClass = (column: any) => {
  return column.editInputClass || 'form-input'
}

const createRowClass = (column: any) => {
  const widthClasses: Record<number, string> = {
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
  return [
    widthClasses[column.width] || 'lg:col-span-12',
    column.class || '',
    editorTextAlign(column)
  ].join(' ')
}

const focus = (e: any) => {
  if (props.allowRowFocus) {
    e.target.focus()
  }
}

const deleteRow = (e: any) => {
  if (e.target.nodeName === 'DIV') {
    emit('delete-row', props.record, e)
  }
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

const setValue = (data: any, key: string, value: any) => {
  if (!data) return
  const tmp = key.split('.')
  if (tmp.length > 1) {
    const d = data[tmp[0]]
    tmp.splice(0, 1)
    return setValue(d, tmp.join('.'), value)
  }
  data[key] = value
}

const output = (column: any, data: any): string => {
  if (column.formula) {
    const fields = column.formula.split(/[ ,+\-*/\)\(]+/)
    const values: Record<string, any> = {}

    fields.forEach((element: string) => {
      const item = getValue(data, element)
      if (typeof item !== 'undefined') {
        values[element] = item
      }
    })

    const result = Parser.evaluate(column.formula, values)
    const formatted = props.formatter(result, column.format)
    return formatted === '' ? '&nbsp;' : formatted
  } else {
    let key = column.field
    let formatStyle = column.format
    let fieldValue = getValue(data, key)

    // Lookup fields
    if (column.format && column.format.type === 'lookup') {
      key = column.format.key ? column.format.key.split('.') : column.format.field.split('.')

      let found = false
      if (props.lookups[key]) {
        if (props.lookups[key][data[key]]) {
          const obj = props.lookups[key][data[key]]
          found = true
          if (obj && (obj[column.format.field] !== undefined)) {
            formatStyle = column.format.format
            fieldValue = obj[column.format.field]
          }
        }
      }

      if (!found) {
        const trackField = column.format.trackField || 'guid'
        const tmp: any = {}
        tmp[trackField] = data[key]
        if (data[key] !== undefined) {
          emit('lookup-added', { column, data: tmp, doUpdate: false })

          axios.get(props.lookupUrl(column, data[key])).then((response) => {
            if (response.status === 200) {
              const resData = response.data
              if (resData[column.format.field] !== undefined) {
                emit('lookup-added', { column, data: resData })
              }
            }
          })
        }
      }
    }

    const formatted = props.formatter(fieldValue, formatStyle)
    return formatted === '' ? '&nbsp;' : formatted
  }
}

const click = (event: any, column: any) => {
  if (!column.editor) {
    emit('on-clicked')
  }
}

const selectText = (target: any) => {
  if (navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i)) {
    setTimeout(() => {
      target.setSelectionRange(0, 9999)
    }, 1)
  } else {
    target.select()
  }
}

const editorTextAlign = (column: any) => {
  if (column.align) {
    if (column.align === 'left') return 'text-left'
    if (column.align === 'center') return 'text-center'
    return 'text-right'
  }

  let format = column.format
  if (column.format && typeof column.format === 'object') {
    format = column.format.type
  }

  if (format === 'number' || format === 'currency') return 'text-right'
  return 'text-left'
}

const editFieldChanged = (column: any, event: any) => {
  emit('field-changed', { column, data: props.record })
}
</script>

<style scoped>
@reference "tailwindcss";

.form-input {
  @apply w-full border-0 border-b border-gray-300 bg-transparent px-0.5 py-0.5 text-sm leading-none outline-none focus:border-blue-500 focus:ring-0 dark:border-gray-600;
}

.form-input[readonly] {
  @apply bg-gray-100 dark:bg-gray-800;
}

.form-input:disabled {
  @apply bg-gray-100 opacity-60 dark:bg-gray-800;
}
</style>
