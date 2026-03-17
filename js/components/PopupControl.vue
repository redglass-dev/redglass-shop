<template>
    <div v-if="shown" id="popper" ref="popper" class="popover">
        <transition name="fade">
            <div class="popover-content">
                <div class="popover-header">
                    <slot name="header">
                    </slot>
                </div>

                <div class="popover-body">
                    <slot name="body">
                    </slot>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
    import {computed, nextTick, ref} from 'vue'
    import { createPopper } from '@popperjs/core';

    const popper = ref(null)

    const props = defineProps({
        show: { type: Boolean, default: false },
        parent: { type: String, default: '' }
    })

    const shown = computed(() => {
        if(props.show) {
            nextTick(() => {
                console.log(props.parent, popper.value)
                createPopper(document.getElementById(props.parent), popper.value)
            });
        }

        return props.show;
    })
</script>
