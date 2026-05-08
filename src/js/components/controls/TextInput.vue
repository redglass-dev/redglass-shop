<script setup lang="ts">

const value = defineModel<string>()

const { error = undefined, label = '', type = 'text' } = defineProps<{ error?: string|undefined, label?: string, type?: string }>()

</script>

<template>
    <div class="w-full">
        <div class="flex justify-between items-center mb-1">
            <label class="redglass-input-label">{{ label }}</label>
            <slot />
        </div>
        <textarea
            v-if="type === 'multiline'"
            class="block w-full redglass-input"
            :class="{ 'border-red-500': error !== undefined}"
            v-model="value"
            v-bind="$attrs"
            required
        >
        </textarea>
        <input
            v-else
            type="text"
            class="block w-full redglass-input"
            :class="{ 'border-red-500': error !== undefined}"
            v-model="value"
            v-bind="$attrs"
            required
        />
        <p v-if="error" class="pl-2 mt-1 text-xs text-red-600">{{ error }}</p>
    </div>
</template>
