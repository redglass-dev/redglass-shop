<template>
    <div class="row p-1 m-0 w-100">
        <div class="col-auto p-1">
            {{ group.name }}:
        </div>
        <div class="col text-end p-1">
            <div v-if="!useRadioButtons" class="btn-group btn-group-xs btn-group-toggle" data-toggle="buttons">
                    <label :class="'btn btn-xs btn-secondary bg-transparent text-black ' + (selected === item ? ' active ' : ' ')  + btnClass" v-for="(item, i) in group.items" :key="i">
                    <input type="radio" class="me-1" :name="optionId" :id="item" @click="selectionChanged(item)" :value="item" v-model="localSelected">{{ item }}</label>
            </div>
            <div v-else v-for="(item, i) in group.items" class="custom-control custom-radio custom-control-inline">
                <input type="radio" :id="'radio_group_item_' + item" :name="optionId" :value="item" class="custom-control-input" v-model="localSelected" @click="selectionChanged(item)">
                <label class="custom-control-label ps-1 bg-transparent text-black" :for="'radio_group_item_' + item">{{ item }}</label>
            </div>
        </div>
    </div>
</template>

<script>
import  { v4 as uuidv4 } from "uuid";

export default {
    name: "StockOptionControl",
    props: {
        group: { type: Object, required: true },
        btnClass: { type: String, default: "btn-dark border-0 rounded-0"},
        selected: {type: String, required: true},
        useRadioButtons: {type: Boolean, default: false},
    },
    mounted() {
        this.localSelected = this.selected;
    },
    data() {
        return {
            localSelected: "",
            optionId: uuidv4(),
        }
    },
    watch: {
        selected: function (val) {
            this.localSelected = val;
        }
    },
    methods: {
        selectionChanged(item) {
            this.$emit("selection-changed", {group: this.group, selected: item });
        }
    }
}
</script>
