<template>
    <div class="px-3 px-lg-0">
        <div v-for="(group, index) in characteristicGroups" :class="'card mb-1 redglass-filter-card border-0' + filterGroupHeaderClass"  >
            <div class="card-header p-1 d-flex justify-content-between align-items-center" :id="'heading' + group.guid" data-toggle="collapse" @click="expanded[group.guid] = !expanded[group.guid]" :data-target="'#collapse' + group.guid" :aria-controls="'collapse' + group.guid">
                <button class="btn btn-link btn-block text-start py-1" type="button" onclick="blur();">{{ group.name }}</button>
                <vue-feather :type="expanded[group.guid] ? 'chevron-down' : 'chevron-right'" size="0.8em" class="pb-1"></vue-feather>
            </div>

            <b-collapse v-model="expanded[group.guid]">
                <div class="card-body border border-1 border-gray rounded-bottom p-1">
                    <div v-for="item in group.characteristics" class="custom-control custom-checkbox">
                        <div class="custom-control-label text-truncate" :for="item.guid">
                            <input type="checkbox" class="custom-control-input mx-1" :id="item.guid" @change="toggleCharacteristic(item.guid)">{{ item.name }}
                        </div>
                    </div>
                </div>
            </b-collapse>
        </div>
    </div>
</template>

<script setup>

import {onMounted, ref} from "vue";
import {BCollapse}  from "bootstrap-vue-next";

const emit = defineEmits(["no-characteristic-groups", "filter-changed"])

const props = defineProps({
    /**
     * The class of the card header for each filter group
     **/
    filterGroupHeaderClass: {type: String},

    /**
     * Any filter conditions.
     */
    filter: {type: String, default: ''},
})

const characteristicGroups = ref([])
const characteristics = ref([])
const expanded = ref({})

onMounted(() => {
    let filterString = "";
    if(props.filter !== '') {
        filterString = '?f=' + props.filter;
    }

    axios.get('/api/v1/public/stocks/characteristic-groups' + filterString).then(response => {
        let list = {};
        let first = true;
        for(let key in response.data) {
            list[response.data[key].guid] = first;
            first = false;
        }

        expanded.value = list;
        characteristicGroups.value = response.data;

        if(characteristicGroups.value.length === 0) {
            /**
             * Is fired when we have, have characteristic groups to show.
             */
            emit('no-characteristic-groups')
        }
    });
})

function toggleCharacteristic(id) {
    let index = characteristics.value.findIndex( item => item === id);
    if(index < 0) {
        characteristics.value.push(id);
    }
    else
    {
        characteristics.value.splice(index, 1);
    }

    updateFilter();
}

function updateFilter() {
    let filter = characteristics.value.length > 0 ? 'stockCharacteristicGuid|acc_stocks_stock_characteristics|guid|stockGuid|join:' + characteristics.value.join('|') : '';
    emit("filter-changed", filter);
}
</script>
