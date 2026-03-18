<template>
    <div :class="'container-fluid p-0 m-0 ' + (isSelected && !multiSelect ? ' selected-row' : showHover) + ' hide-focus-rectangle'" tabindex="-1" @mouseenter="focus" @keyup.delete="deleteRow($event)">
        <div :class="'row mr-0 ml-0' + (showBottomBorder ? ' border-bottom' : '')" :style="rowStyle">
            <div v-if="draggable" class="col-pixel-width-15 ps-1 pb-1"><vue-feather type="menu" size="0.8em"></vue-feather></div>
            <div v-else-if="locked" class="col-pixel-width-15 ps-1 pb-1"><vue-feather type="paperclip" size="0.8em"></vue-feather></div>
            <div v-if="multiSelect" class="col-pixel-width-15 ps-1 pb-1" ><input type="checkbox" @change="$emit('row-selection-changed', record)" :checked="isSelected" /></div>
            <div class="col">
                <div class="row">
                    <div v-for="(column, index) in columns" :key="column.field" :class="createRowClass(column)" @click="click($event, column)">
                        <small class="d-block d-lg-none text-secondary font-weight-bold border-bottom">{{ column.title }}</small>
                        <span  v-if="isChild && index === 0"><vue-feather type="corner-down-right" size="1.0em" style="vertical-align: text-top"></vue-feather>&nbsp;</span>
                        <span v-if="column.hasOwnProperty('editor') && !disabled">
                             <vue-numeric v-if="column.editor.hasOwnProperty('type') && column.editor.type === 'currency'"
                                          :class="getEditInputClass(column) + ' '  + editorTextAlign(column)"
                                          currency="$"
                                          :precision="2"
                                          separator=","
                                          :value="getValue(record, column.field)"
                                          v-on:change.native="editFieldChanged(column, $event)"
                                          @focus="focusEditInput($event.target, column)"
                                          @input="setValue(record, column.field, $event)"></vue-numeric>
                            <input v-else
                                   :class="getEditInputClass(column) + ' ' + editorTextAlign(column)"
                                   type="text"
                                   :value="getValue(record, column.field)"
                                   @input="setValue(record, column.field, $event.target.value)"
                                   @change="editFieldChanged(column, $event)"
                                   @focus="focusEditInput($event.target, column)" />
                        </span>
                        <span v-else v-html="output(column, record)"></span>
                    </div>

                    <slot name="child"></slot>
                </div>
            </div>
            <div v-if="hasFlags" class="ps-1 pe-1">
                <span v-for="(flag, index) in flags" :key="index" class="col-pixel-width-15 text-nowrap">
                    <vue-feather v-if="flagChecked(record[flag.field], flag)" :type="flag.iconName" size="0.8em" class="pb-1"></vue-feather>
                    <vue-feather v-else :type="flag.iconName" size="0.8em" stroke="none" class="pb-1"></vue-feather>
                </span>
            </div>
        </div>
        <small v-if="!showBottomBorder" class="d-block d-lg-none text-secondary font-weight-bold row-border-bottom"></small>
    </div>
</template>

<script>
    import VueNumeric from 'vue-numeric'
    import Formatter from '../helpers/Formatter'
    import { Parser } from 'expr-eval'

    /**
     * The data row should only be used by the data grid to display a row should not be accessed by anyone else.
     */
    export default {
        name: "DataRow",
        components: {
            VueNumeric,
        },
        props: {
            record: { type: Object, default: null, required: true },

            columns: { type: Array, default: () => [
                    { field: "name", width: 12, format: "string", title: "Name", class: "" },
            ] },

            showBottomBorder: { type: Boolean, default: true },

            isSelected: { type: Boolean, default: false },

            rowStyle: { type: String, default: '' },

            isChild: { type: Boolean, default: false },

            lookups: { type: Array, default: () => []},

            draggable: { type: Boolean, default: false },

            formatter: { type: Function, default: function(data, format) { return this.format.format(data, format) } },

            lookupUrl: { type: Function, default: function(column, objectId) { return window.Prefix + column.format.url + '/' + objectId; } },

            flags: { type: Array, default: () => [] },

            trackMouse: { type: Boolean, default: true },

            locked: { type: Boolean, default: false },

            disabled: { type: Boolean, default: false },

            flagChecked: { type: Function, default: function(data, flag) { return data; } },

            allowRowFocus: { type: Boolean, default: true },

            multiSelect: {type: Boolean, default: false },
        },
        data() {
            return {
                format: new Formatter(),
                loginChanges: false,
                // checkValue: this.multiSelectValue,
            }
        },
        // watch: {
        //     checkValue: function (value){
        //         this.$emit("rowSelected",  this.record);
        //     }
        // },
        computed: {
            hasFlags: function() {
                this.$emit("rowChecked",  [this.record, this.checkValue] );
                // Has Flags
                return this.flags.length > 0;
            },
            showHover: function () {
                return this.trackMouse ? ' detail-row' : '';
            }
        },
        methods: {
            focusEditInput(target, column) {
                column.hasOwnProperty('onEditInputFocus') ? column.onEditInputFocus(target) : this.selectText(target);
            },

            getEditInputClass(column) {
                return column.hasOwnProperty('editInputClass') ? column.editInputClass : 'form-input';
            },

            createRowClass(column) {
                return 'col-lg-' + column.width + ' ' + column.class + ' ' + this.editorTextAlign(column)
            },

            /**
             * Focus's the target
             */
            focus(e) {
                if(this.allowRowFocus)
                {
                    e.target.focus();
                }
            },

            /**
             * Fires the row delete-row event so you can remove the row.
             * @param e The element that was active.
             */
            deleteRow(e) {
                if(e.target.nodeName === "DIV") {
                    this.$emit('delete-row', this.record, e);
                }
            },

            setInput(column, event) {
                this.$emit('input', event);
            },

            /**
             * Gets the data value for a dot notation key eg supplier_balances.currentTotal
             * @param data The data object to search in.
             * @param key The key to look for.
             */
            getValue(data, key) {
                let tmp = key.split('.');
                if(tmp.length > 1) {
                    let d = data[tmp[0]];
                    tmp.splice(0, 1);
                    return this.getValue(d, tmp.join('.'));
                }

                return data[key];
            },

            setValue(data, key, value) {
                let tmp = key.split('.');
                if(tmp.length > 1) {
                    let d = data[tmp[0]];
                    tmp.splice(0, 1);
                    return this.setValue(d, tmp.join('.'), value);
                }

                data[key] = value;
            },

            /**
             * Gets the output for the cell to be printed.
             * @param column The column that we are getting the output for.
             * @param data The data that we want to display the cell for.
             */
            output(column, data) {
                if(column.hasOwnProperty('formula')) {
                    var value = 0;

                    let fields = column.formula.split(/[ ,+\-*/\)\(]+/)
                    let values = {};

                    fields.forEach(element => {
                        let item = this.getValue(data, element)
                        if(typeof item !== 'undefined') {values[element] = item}
                    });

                    var output = '';

                    output = this.formatter(Parser.evaluate(column.formula, values), column.format);

                    return output === "" ? '&nbsp;' : output;
                }
                else {
                    var key = column.field;
                    var formatStyle = column.format;
                    var fieldValue = this.getValue(data, key);

                    // Lookup fields
                    if((column.format instanceof Object) && column.format.type === 'lookup') {
                        var items = [];

                        // Sets the key to lookup
                        key = column.format.hasOwnProperty('key') ? column.format.key.split('.') : column.format.field.split('.');

                        var found = false;
                        // If we have data for this lookup
                        if (this.lookups.hasOwnProperty(key)) {
                            // If we have a matching record for this item.
                            if (this.lookups[key].hasOwnProperty(data[key])) {
                                let obj = this.lookups[key][data[key]];
                                found = true;
                                if (obj && (obj[column.format.field] || obj.hasOwnProperty(column.format.field))) {
                                    formatStyle = column.format.format;
                                    fieldValue = obj[column.format.field];
                                }
                            }
                        }

                        if(!found) {
                            // Lets add a blank copy so we do not try and get this record multiple times.
                            let trackField = column.format.hasOwnProperty("trackField") ? column.format.trackField : "guid";
                            let tmp = {};
                            tmp[trackField] = data[key];
                            if(typeof data[key] !== 'undefined') {
                                this.$emit('lookup-added', {column: column, data: tmp, doUpdate: false});

                                // Lets get the actual copy.
                                axios.get(this.lookupUrl(column, data[key])).then(response => {
                                    if (response.status === 200) {
                                        let data = response.data;
                                        if (data.hasOwnProperty(column.format.field)) {
                                            this.$emit('lookup-added', {column: column, data: data});
                                        }
                                    }
                                });
                            }
                        }
                    }

                    var output = '';

                    output = this.formatter(fieldValue, formatStyle);

                    return output === "" ? '&nbsp;' : output;
                }
            },

            /**
             * Fires on row clicked.
             * @param event
             * @param column
             */
            click(event, column) {
                console.log(event);
                if(!column.hasOwnProperty('editor')) {
                    this.$emit('on-clicked');
                }
            },

            selectText(target) {
                if (navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i)) {
                    setTimeout(function () {
                        target.setSelectionRange(0, 9999);
                    }, 1);
                } else {
                    target.select();
                }
            },

            editorTextAlign(column) {
                if(column.hasOwnProperty('align')) {
                    if(column.align === 'left') {
                        return 'text-start';
                    } else if (column.align === 'center') {
                        return 'text-center';
                    } else {
                        return 'text-end';
                    }
                }

                var format = column.format;

                if(column.format instanceof Object === true) {
                    format = column.format.type;
                }

                if(format === 'number') {
                    return 'text-end';
                } else {
                    return 'text-start';
                }
            },

            editFieldChanged(column, event) {
                // Edit Field Changed on row
                this.$forceUpdate();
                this.$emit('field-changed', {column: column, data: this.record})
            }
        }
    }
</script>

<style>
    .detail-row :hover {
        background: #eeeeee;
    }

    .row-border-bottom {
        border-bottom: rgb(128, 128, 128) solid 1px;
    }

    .selected-row {
        background: #00AAFF;
        color: white;
    }

    .selected-row:hover {
        background: #0362ff;
        color: white;
    }
</style>

<style scoped>
    .col-pixel-width-15 { flex: 0 0 10px; color: lightgrey; }

    /*
    Form input
    */
    .form-input {
        border: none;
        width: 100%;
        outline: none !important;
        -webkit-box-shadow: none;
        box-shadow: none;
        border-bottom: lightgray solid 1px;
        margin-bottom: 0px;
        border-radius: 0px;
        height: 1.25rem;
        padding: 0.125rem 0.125rem;
        font-size: .8rem;
        line-height: 1.0;
    }

    .form-input:hover {
        border-color: #00AAFF;
    }

    .form-input:focus {
        color: #495057;
        background-color: #fff;
        border-color: #80bdff;
        outline: 0;
        -webkit-box-shadow: 0 0 0 0.0rem rgba(0, 123, 255, 0.25);
        box-shadow: 0 0 0 0.0rem rgba(0, 123, 255, 0.25);
    }

    .form-input:hover[readonly] {
        border-color: lightgray;
    }

    .form-input:focus[readonly] {
        background-color: #ebeef6;
        border-color: lightgray;
    }

    .form-input:disabled,
    .form-input[readonly] {
        background-color: #ebeef6;
        opacity: 1;
    }
</style>
