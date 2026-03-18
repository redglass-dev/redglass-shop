<template>
    <div :class="(useCard ? ('card mb-1 '  + cardClass) : 'container-fluid p-0 m-0 mb-1')">
        <div :class="(useCard ? 'card-header ' : '') + 'p-1 pe-2 d-none d-lg-block'">
            <div v-if="title !== ''" class="row">
                <div class="col-12"><h6>{{ title }}</h6></div>
            </div>
            <div :class="'row mr-0 ml-0' + (useCard ? '' : ' border-bottom')">
                <div class="col">
                    <div class="row">
                        <div v-for="(column, index) in workingColumns" :key="column.field" :class="'text-nowrap font-weight-bold col-' + column.width + ' ' + editorTextAlign(column) + ' ' + headingClass" :style="(allowColumnChooser && index === 0) ? 'padding-left: 0px' : ''" @click="sortBy(column)">
                            <a style="color: #00AAFF" @click="columnChooser($event)" v-if="(allowColumnChooser && index === 0)"><vue-feather type="list" size="1.0em"></vue-feather>&nbsp;</a>{{ column.title }}&nbsp;<span v-if="(column.field === sortColumn || column.sortField === sortColumn)" :class="reverse ? 'caretdown' : 'caretup'"></span>
                        </div>
                    </div>
                </div>
                <div v-if="hasFlags" class="ps-1 pe-1">
                    <span v-for="(flag, index) in workingFlags" :key="index" :class="'col-pixel-width-15 text-nowrap ' + headingClass">
                        <vue-feather :type="flag.iconName" size="0.8em" class="pb-1"></vue-feather>
                    </span>
                </div>
            </div>
        </div>
        <div :class="dataAreaClass">
            <div :class="(useCard ? 'card-body ' : '') + 'p-1 pe-2'" :style="cardStyle">
                <div v-if="allowSearch" class="row mr-0 ml-0">
                    <input class="search-input" type="text" placeholder="Search ..." v-model="filter" @keyup.enter="asyncLoad(1)" />
                </div>
                <button type="button" v-if="showAddRow" :class="'row mr-0 ml-0 w-100 ' + addRowClass" @click="addNewRow">
                    <span class="col text-center text-small">{{ newItemText }}</span>
                </button>
                <draggable v-if="!loading && !errorLoading" class="container-fluid p-0 m-0" ref="grid" :disabled="!isDraggable" @end="reorder">
                    <transition-group>
                        <data-row v-for="detail in rows"
                            :key="detail[trackBy]"
                            ref="dataRows"
                            :flags="workingFlags"
                            :allow-row-focus="allowRowFocus"
                            :row-style="rowStyle(detail)"
                            :flag-checked="flagChecked"
                            :track-mouse="rowDeletable(detail)"
                            :locked="(isDraggable && !rowDraggable(detail))"
                            :record="detail"
                            :lookups="lookups"
                            @lookup-added="addLookup"
                            :draggable="(isDraggable && rowDraggable(detail))"
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
                            @row-selection-changed="rowSelectionChanged">
                            <template v-if="childField !== ''" slot="child">
                                <data-row v-for="child in detail[childField]"
                                    :lookups="lookups"
                                    @lookup-added="addLookup"
                                    :is-child="true"
                                    :lookup-url="lookupUrl"
                                    :formatter="formatter"
                                    :record="child"
                                    :key="child[trackBy]"
                                    :columns="childColumns"
                                    :show-bottom-border="false"></data-row>
                            </template>
                        </data-row>
                    </transition-group>
                </draggable>
                <div v-else class="col-12 text-center p-5">
                    <div class="container w-100">
                        <div class="row w-100 justify-content-center">
                            <div v-if="loading" class="col">
                                <div class="h6">Loading ...</div>
                                <div class="row justify-content-center">
                                    <div class="col-6">
                                        <div class="progress">
                                            <div class="progress-bar progress-bar-striped progress-bar-animated bg-warning" role="progressbar" style="width: 100%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="col">
                                <div class="h6 text-danger">Error loading ...</div>
                                <div class="text-danger">{{ errorMsg }}</div>
                                <br /><br />
                                <button id="btn_reload" type="button" class="btn btn-sm btn-outline-success" @click="asyncLoad(1)">Reload</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div :class="'row mr-0 ml-0 pe-1 ps-1 border-top border-top-1'" v-if="showRunningTotals">
            <div v-for="(column, index) in workingColumns" :key="column.field" :class="'text-nowrap col-' + column.width + ' ' + column.class + ' ' + editorTextAlign(column)">
                <span v-if="runningTotals.hasOwnProperty(column.field)">{{ output(runningTotals[column.field]) }}</span>
            </div>
        </div>
        <slot name="footer"></slot>
        <div :class="useCard ? 'card-footer p-1' : ' p-1'" style="">
            <div v-if="asyncUrl !== ''" class="row p-0 m-0">
                <div class="col p-0">
                    <pagination :data="asyncPage" v-on:pagination-change-page="asyncLoad" :limit="2" align="center" size="small"></pagination>
                </div>
                <div class="col col-md-1 p-0">
                    <div v-if="draggable" class="custom-control custom-switch">
                        <input type="checkbox" class="custom-control-input" id="dragableSwitch" v-model="isDraggable">
                        <label class="custom-control-label" for="dragableSwitch">Dragable</label>
                    </div>
                    <select class="form-control form-conrol-sm" v-model="limit" @change="limitChanged" style="height: 36px !important; font-size: 14px !important;">
                        <option :value="25">25</option>
                        <option :value="50">50</option>
                        <option :value="100">100</option>
                    </select>
                </div>
            </div>
            <div v-else class="row p-0 m-0">
                <div v-if="draggable" class="custom-control custom-switch">
                    <input type="checkbox" class="custom-control-input" id="dragableSwitch" v-model="isDraggable">
                    <label class="custom-control-label" for="dragableSwitch">Allow Row Reorder</label>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import DataRow from './DataRow.vue'
    import {Bootstrap4Pagination as Pagination} from 'laravel-vue-pagination'
    import draggable from 'vuedraggable'
    import Formatter from '../helpers/Formatter'
    //import { EventBus }  from '../../../../EventBus'

    /**
     * Data grid by redglass
     */
    export default {
        name: "DataGrid",
        components: {
            DataRow, Pagination, draggable
        },
        beforeMount() {
            var gridLimit = Number(localStorage.getItem('grid-limit'));
            this.limit = gridLimit > 0 ? gridLimit : 25;

            if(this.columnsLayout !== '') {
                // Lets try loading the workingColumns
                axios.get(this.columnsLayout).then(response => {
                    console.log(response.data);
                    if(response.data.hasOwnProperty('columns')) {
                        this.workingColumns = response.data.columns;
                    }

                    if(response.data.hasOwnProperty('flags')) {
                        this.workingFlags = response.data.flags;
                    }

                    if(response.data.hasOwnProperty('headingClass')) {
                        this.headingClass = response.data.headingClass;
                    }
                });
            }
        },
        mounted() {
            this.isDraggable = this.draggable && this.settings.RowOrderChangeable;

            if(typeof window.Prefix !== 'undefined') {
                this.prefix = window.Prefix;
            }

            // Lets add all our columns if we have not set a searchable list.
            if(this.searchColumns.length === 0) {
                for(let key in this.workingColumns) {
                    this.searchColumns.push(this.workingColumns[key].field);
                }
            }

            // Lets pre-cache lookups if required
            this.cacheLookups().then( success => {
                if (this.loadOnCreate) {
                    this.asyncLoad(1);
                }
            });

            // Lets setup the running totals
            this.runningTotals = {};
            for(let key in this.workingColumns) {
                if(this.workingColumns[key].hasOwnProperty("runningTotal")) {
                    this.runningTotals[this.workingColumns[key].field] = {value: 0, functionType: this.workingColumns[key]['runningTotal']['functionType'], format:this.workingColumns[key]['runningTotal']['format'] }
                }
            }

            if(this.runningTotals.hasOwnProperty("qty")) {
                console.log("Running Totals");
                console.log(this.runningTotals);
            }
        },
        props: {
            /**
             * The rows that will be checked on load.
             **/
            selected: { type: Array, default: () => [] },

            /**
             * Does the rows support multiSelect.
             *
             * If true this object will emit an event called "rowChecked" with the object, when the checkbox state changes, this object will have a property
             **/
            multiSelect: {type: Boolean, default: false },

            /**
             * Do you want the grid inside of a card.
             */
            useCard: { type: Boolean, default: true },

            /**
             * The data records if you are using a fixed list.
             */
            records: { type: Array, default: () => [] },

            /**
             * The url to load the data from.
             */
            asyncUrl: { type: String, default: "" },

            allowSearch: { type: Boolean, default:true },

            allowAddNew: { type: Boolean, default:true },

            availableColumns: { type: Array, default: () => [] },

            columns: { type: Array, default: () => [
                    { field: "name", width: 12, format: "string", title: "Name", class: "", align: 'left', sortField: "name", editInputClass: 'form-input'},
                ] },

            flags: { type: Array, default: () => [] },

            searchColumns: {type: Array, default: () => []},

            title: { type: String, default: "" },

            trackSelected: { type: Boolean, default: false },

            selectedId: { type: [String, Number], default: "" },

            trackBy: { type: String, default: 'guid' },

            childField: { type: String, default: ''},

            childColumns: { type: Array, default: () => [] },

            totalRowLimit: { type: Number, default: 0 },

            columnsLayout: { type: String, default: ''},

            dataAreaClass: { type: String, default: ''},

            /**
             * Filter description.
             * Use a comma separated list field and value pares separated by a :
             * eg accountGuid:234,isOpen:true
             */
            filters: { type: String, default: '' },

            newItemText: { type: String, default: 'Click to add new item'},

            cardClass: { type: String, default: ''},

            loadOnCreate: { type: Boolean, default: true },

            /**
             * Rows are draggable
             */
            draggable: { type: Boolean, default: false },

            rowIndexField: { type: String, default: '' },

            formatter: { type: Function },

            /**
             * Use to specify if a flag should be checked or not
             */
            flagChecked: { type: Function, default: function(data, flag) { return data; } },

            /**
             * Used to override the setting of data for use in lookup columns.
             */
            lookupDataSetter: { type: Function, default: function(data, column) { return data; } },

            lookupUrl: { type: Function },

            /**
             * Process the record before it is loaded into the grid.
             */
            processRecord: { type: Function, default: function(record) { return record; } },

            /**
             * Show the running totals at the bottom of the grid.
             */
            showRunningTotals: { type: Boolean, default: false },

            /**
             * Used to see if the row should be disabled or not.
             */
            rowDisabled: { type: Function, default: function(record) { return false; } },

            /**
             * Can this row be deleted
             */
            rowDeletable: { type: Function, default: function (record) { return true; } },

            /**
             * Used to customize the row style.
             */
            rowStyle: { type: Function, default: function (record) { return ''; }},

            /**
             * Add Row Class
             */
            addRowClass: { type: String, default: 'add-row' },

            /**
             * Force Minimum Height
             */
            dynamicHeight: { type: Boolean, default: false },

            /**
             * Show the bottom row border.
             */
            showBottomRowBorder: { type: Boolean, default: false },

            /**
             * The sends the settings for this grid to be written.
             */
            updateSettings: { type: Function, default: function(settings) { } },

            settings: { type: Object, default: function() { return { RowOrderChangeable: false }; } },

            /**
             * Sets if we allow row focus if it is off then you can not use the delete key on the keyboard to delete the focused row.
             * It can make it easier for editing row data.
             */
            allowRowFocus: { type: Boolean, default: true },

        },
        data() {
            return {
                loading: false,
                asyncPage: {},
                reverse: false,
                sortColumn: "",
                isSorting: false,
                filter: "",
                localSelected: null,
                errorLoading: false,
                errorMsg: '',
                prefix: '',
                lookups: [],
                runningTotals: {},
                format: new Formatter(),
                limit: 25,
                workingColumns: this.columns,
                workingFlags: this.flags,
                headingClass: "",
                isDraggable: false,
                selectedIds: [],
            }
        },
        computed: {
            rows: function () {
                var list = [];
                if(this.asyncUrl && this.asyncUrl !== '') {
                    list = this.asyncPage.data;
                }
                else {
                    list = this.filterRows();
                }

                this.calculateTotals(list);
                return list;
            },

            allowColumnChooser: function () {
                return this.availableColumns.length > 0;
            },

            showAddRow: function() {
                if(!this.allowAddNew) {
                    return false;
                }

                if(this.asyncUrl && this.asyncUrl !== '') {
                    return true;
                }

                return !(this.totalRowLimit > 0 && this.records.length > this.totalRowLimit);
            },

            hasFlags: function() {
                return this.workingFlags.length > 0;
            },

            cardStyle: function () {
                if(this.dynamicHeight || !(this.asyncUrl && this.asyncUrl !== '')) {
                    return '';
                }

                return 'min-height: ' + (22 * (this.limit - 1)) + 'px';
            }
        },
        watch: {
            selected: function (newValue) {
                this.selectedIds = newValue;
            },
            selectedId: function (newValue, oldValue) {
                console.log("Selection changed by prent");
                if(this.asyncPage.hasOwnProperty('data')) {
                    if (this.localSelected === null) {
                        //set
                        this.localSelected = this.asyncPage.data.find(obj => obj[this.trackBy] === newValue);
                    } else if (newValue !== '' && oldValue !== newValue) {
                        this.localSelected = this.asyncPage.data.find(obj => obj[this.trackBy] === newValue);
                    }
                }
            },

            filters: function (newValue, oldValue) {
                console.log("Filters changed");
                if(this.asyncUrl && this.asyncUrl !== '') {
                    this.asyncLoad(1);
                }
            },

            asyncUrl:  function (newValue, oldValue) {
                console.log("Async url change: " + newValue);
                this.refresh();
            },

            isDraggable: function(newValue) {
                this.settings.RowOrderChangeable = newValue;

                if(newValue && !(this.asyncUrl && this.asyncUrl !== '')) {
                    this.sorter(this.rowIndexField, false);
                }

                this.updateSettings(this.settings);
            }
        },
        methods: {
            getSelectedRows() {
                return this.selectedIds;
            },

            rowSelectionChanged(item) {
                let index = this.selectedIds.findIndex(obj => obj[this.trackBy] === item[this.trackBy])

                if(index >= 0 ) {
                    // It is checked so remove it
                    this.selectedIds.splice(index, 1);
                    this.$emit("remove-from-selected", item);
                } else {
                    // Add to selected.
                    this.selectedIds.push(item);
                    this.$emit("add-to-selected", item);
                }
            },

            /**
             * Allows us to set the loading progress for the grid.
             */
            setLoading(value) {
                this.loading = value;
            },

            rowDraggable(record) {
                return this.isDraggable && !this.rowDisabled(record);
            },

            output(total) {
                return this.format.format(total.value, total.format )
            },

            visableRows() {
                return this.rows;
            },

            isSelected(row) {
                if(this.multiSelect) {
                    if(typeof row === "undefined") {
                        return false;
                    }

                    return this.selectedIds.findIndex(obj => obj[this.trackBy] === row[this.trackBy]) >= 0;
                }

                if(typeof this.localSelected === "undefined"  || typeof row === "undefined") {
                    return false;
                }

                return this.trackSelected && this.localSelected[this.trackBy] === row[this.trackBy];
            },

            filterRows() {
                if(!this.filter || this.filter === "") {
                    return this.records;
                }

                console.log(this.records);

                // Lets filter the results
                return this.records.filter(record => this.search(record));
            },

            search(record) {
                let filterText = this.filter.toLowerCase();
                for(let key in this.searchColumns) {
                    if((record[this.searchColumns[key]] + '').toLowerCase().indexOf(filterText) !== -1) {
                        return true;
                    }
                }

                return false;
            },

            sortBy(column) {
                if(!column || this.isDraggable){
                    return;
                }

                let key = column.hasOwnProperty('sortField') ? column.sortField : column.field;
                if(this.asyncUrl && this.asyncUrl !== '') {
                   // let column = this.workingColumns.find(col => col.field === key);
                    if(column.hasOwnProperty("allowSort") && !column.allowSort) {
                        return;
                    }
                }

                this.isSorting = true;
                if(key !== this.sortColumn) {
                    this.sortColumn = key;
                    this.reverse = false;
                } else {
                    this.reverse = !this.reverse;
                }

                // Lets sort it
                this.sorter(key, this.reverse);

                this.$nextTick(() => {
                    this.isSorting = false;
                });
            },

            getValue(data, key) {
                let tmp = key.split('.');
                if(tmp.length > 1) {
                    let d = data[tmp[0]];
                    tmp.splice(0, 1);
                    return this.getValue(d, tmp.join('.'));
                }

                return data[key];
            },

            sorter(key, direction) {
                if(this.asyncUrl && this.asyncUrl !== '') {
                    this.asyncLoad(1)
                } else {
                    let local = this;
                    this.rows.sort(function (a, b) {
                        var result = 0;
                        let valueA = local.getValue(a, key);
                        let valueB = local.getValue(b, key);
                        if (typeof valueA === "number") {
                            result = (valueA - valueB);
                        } else {
                            result = ((valueA < valueB) ? -1 : ((valueA > valueB) ? 1 : 0));
                        }

                        return direction ? result * -1 : result;
                    });
                }
            },

            asyncDeleteRow(guid) {
                // Async Delete Row
                let index = this.asyncPage.data.findIndex(item => item[this.trackBy] === guid);
                if(index >= 0) {
                    this.asyncPage.data.splice(index, 1);
                    if(this.asyncPage.hasOwnProperty("current_page")) {
                        if(this.asyncPage.current_page !== this.asyncPage.last_page) {
                            this.asyncLoad(null, false);
                        }
                    }
                }
            },

            internalRowClicked(item) {
                if(this.rowDisabled(item)) {
                    return;
                }

                console.log("Row Clicked: " + this.trackSelected + " clicked row: " + this.localSelected + " item: " + item);

                this.$emit('row-clicked', item);

                if(window.EventBus) {
                    window.EventBus.$emit('row-clicked', item);
                }
            },

            addNewRow() {
                console.log("New Row");
                this.$emit('new-row');
            },

            rowDeleted(item, e) {
                if(!this.rowDeletable(item)) {
                    return;
                }

                this.$emit('delete-row', item, e);
            },

            limitChanged() {
                localStorage.setItem('grid-limit', this.limit);
                this.asyncPage.per_page = this.limit;
                if(this.asyncPage.hasOwnProperty("current_page")) {
                    this.asyncLoad(this.asyncPage.current_page);
                } else {
                    this.asyncLoad(1);
                }
            },

            asyncLoad(page, withLoading = true) {
                var limit = this.limit;
                this.errorLoading = false;

                if(!this.asyncUrl || this.asyncUrl === "")
                {
                    return;
                }

                if (typeof page === 'undefined' || page == null) {
                    if(this.asyncPage.hasOwnProperty("current_page")) {
                        page = this.asyncPage.current_page;
                    } else {
                        page = 1;
                    }
                }

                if(this.asyncPage.hasOwnProperty("per_page")) {
                    limit = this.asyncPage.per_page;
                }

                var order = '';
                if(this.sortColumn && this.sortColumn !== '') {
                    order = "&sc=" + this.sortColumn + "&d=" + (this.reverse ? "up" : "down");
                }

                var search = '';
                if(this.filter && this.filter !== ''){
                    search = "&s=" + this.filter.toLowerCase().replace(/ /g, '+');
                }

                var tmpFilter = '';
                if(this.filters && this.filters !== '') {
                    tmpFilter = "&f=" + this.filters;
                }

                if(withLoading) {
                    this.loading = true;
                }

                console.log(this.prefix + this.asyncUrl + '?page=' + page + order + search + tmpFilter + '&per_page=' + limit);
                axios.get(this.prefix + this.asyncUrl + '?page=' + page + order + search + tmpFilter + '&per_page=' + limit).then( response => {
                    if(response.data.hasOwnProperty("data")) {
                        this.localSelected = response.data.data.find(obj => obj[this.trackBy] === this.selectedId);
                    }

                    this.asyncPage = response.data;
                    this.asyncPage.data = response.data.data.map( record => this.processRecord(record));

                    this.$forceUpdate();
                    console.log("Page Loaded event emitted!");
                    this.$emit('page-loaded', this.asyncPage);
                    this.loading = false;
                }).catch( error => {
                    console.log(error);

                    this.errorMsg = error.message;
                    this.loading = false;
                    this.errorLoading = true;
                });
            },

            async calculateTotals(records) {
                if(!this.showRunningTotals) {
                    return;
                }

                // Lets clear the running totals
                for(let key in this.runningTotals) {
                    this.runningTotals[key].value = 0;
                }

                // Lets set the running totals
                for(let index in records) {
                    let record = records[index];

                    for(let key in this.runningTotals) {
                        let total = this.runningTotals[key];
                        if(record.hasOwnProperty(key)) {
                            if(total.functionType === "sum") {
                                total.value += Number(record[key]);
                            } else if (total.functionType === "count") {
                                total.value++;
                            }
                        }
                    }
                }

                console.log(this.runningTotals);
            },

            /**
             * Caches the lookup records.
             */
            async cacheLookups() {
                // Lets pre-cache lookups if required
                for(let index in this.workingColumns) {
                    let column = this.workingColumns[index];
                    if(column.format instanceof Object && column.format.type === 'lookup' && column.format.hasOwnProperty('preCache')) {
                        if(column.format.preCache === 'all') {
                            console.log('Pre caching: ' + column.format.url);
                            // Lets update the lookup object
                            let key = column.format.hasOwnProperty('key') ? column.format.key : column.format.field;
                             await axios.get(window.Prefix + column.format.url).then(response => {
                                if (response.status === 200) {
                                    for (let i in response.data) {
                                        if (response.data[i].data.hasOwnProperty(column.format.field)) {
                                            this.addLookup({column: column, data: response.data[i].data}, false);
                                        }
                                    }

                                    console.log('Finished pre caching: ' + column.format.url);
                                }
                            });
                        } else {

                        }
                    }
                }

                return true;
            },

            refresh() {
                this.lookups = [];
                this.asyncLoad(1);
            },

            /**
             * Updates or Adds an object to the grid.
             * @param obj The object to update or add.
             * @param addIfMissing Add the object if it is missing from the current list.
             */
            updateObject(obj, addIfMissing = true) {
                //Lets take out any lookup items for this record.
                for(let key in this.workingColumns) {
                    let format = this.workingColumns[key].format;
                    if((format instanceof Object) &&  format.type === 'lookup') {
                        if(this.lookups.hasOwnProperty(format.key)) {
                            delete this.lookups[format.key][obj[format.key]];
                        }
                    }
                }

                if(obj.hasOwnProperty(this.trackBy) && this.asyncPage.hasOwnProperty('data')) {
                    let index = this.asyncPage.data.findIndex( item => item[this.trackBy] === obj[this.trackBy]);
                    if(index < 0) {
                        if(addIfMissing) {
                            this.asyncPage.data.splice(0, 0, obj);
                        }
                    } else {
                        this.asyncPage.data.splice(index, 1, obj);
                    }

                    // Lets make sure the local selected object is set.
                    this.localSelected = this.asyncPage.data.find(obj => obj[this.trackBy] === this.selectedId);
                } else {
                    let index = this.records.findIndex( item => item[this.trackBy] === obj[this.trackBy]);
                    if(index < 0) {
                        if(addIfMissing) {
                            this.records.splice(0, 0, obj);
                        }
                    } else {
                        this.records.splice(index, 1, obj);
                    }

                    // Lets make sure the local selected object is set.
                    this.localSelected = this.records.find(obj => obj[this.trackBy] === this.selectedId);
                }
            },

            /**
             * Removes and object from the grid.
             * @param obj The object to remove.
             */
            removeObject(obj) {
                if(obj.hasOwnProperty(this.trackBy) && this.asyncPage.hasOwnProperty('data')) {
                    let index = this.asyncPage.data.findIndex( item => item[this.trackBy] === obj[this.trackBy]);
                    if(index >= 0) {
                        this.asyncPage.data.splice(index, 1);
                    }

                    // Lets make sure the local selected object is set.
                    if(this.asyncPage.data.length > 0) {
                        this.localSelected = this.asyncPage.data[0];
                    }
                } else {
                    let index = this.records.findIndex( item => item[this.trackBy] === obj[this.trackBy]);
                    if(index >= 0) {
                        this.records.splice(index, 1);
                    }

                    // Lets make sure the local selected object is set.
                    if(this.records.length > 0) {
                        this.localSelected = this.records[0];
                    }
                }
            },

            removeAll() {
                if( this.asyncPage.hasOwnProperty('data')) {
                    let index = this.asyncPage.data.findIndex( item => item[this.trackBy] === obj[this.trackBy]);
                    if(index >= 0) {
                        this.asyncPage.data.splice(0, this.asyncPage.data.length);
                    }

                    // // Lets make sure the local selected object is set.
                    // if(this.asyncPage.data.length > 0) {
                    //     this.localSelected = this.asyncPage.data[0];
                    // }
                } else {
                    // let index = this.records.findIndex( item => item[this.trackBy] === obj[this.trackBy]);
                    // if(index >= 0) {
                        this.records.splice(0, this.records.length);
                    // }

                    // // Lets make sure the local selected object is set.
                    // if(this.records.length > 0) {
                    //     this.localSelected = this.records[0];
                    // }
                }
            },

            columnChooser(e) {
                e.stopPropagation();
                console.log("Show column chooser");
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

                if(column.format instanceof Object) {
                    format = column.format.type;
                }

                if(format === 'number') {
                    return 'text-end';
                } else {
                    return 'text-start';
                }
            },

            addLookup(item, doUpdate = true) {
                let trackField = item.column.format.hasOwnProperty("trackField") ? item.column.format.trackField : "guid";

                let key = item.column.format.hasOwnProperty('key') ? item.column.format.key : item.column.format.field;
                if(!this.lookups.hasOwnProperty(key)) {
                    this.lookups[key] = {};
                }

                this.lookups[key][item.data[trackField]] = this.lookupDataSetter(item.data, item.column);

                // Lets override the do update with the instructions from the item.
                if(item.hasOwnProperty('doUpdate')) {
                    doUpdate = item.doUpdate;
                }

                // Lets reload the data
                if(doUpdate) {
                    this.$forceUpdate();
                }
            },

            /***************************************** Drag and drop **************************************************/
            reorder(evt) {
                // If the row is not draggable then lets cancel the action
                if(!this.rowDraggable(this.rows[evt.oldIndex])) {
                    if(this.rowIndexField !== '') {
                        this.sorter(this.rowIndexField, false);
                        this.$forceUpdate();
                    }
                    return;
                }

                // move the item in the underlying array
                this.rows.splice(evt.newIndex, 0, this.rows.splice(evt.oldIndex, 1)[0]);

                if(this.rowIndexField === '') {
                    return;
                }

                // update order property based on position in array
                var vm = this;
                var i = 1;
                this.rows.forEach(function (item, index) {
                    if(item[vm.rowIndexField] < 10000) {
                        // Lets check if we need to change the index field for the row
                        if (item[vm.rowIndexField] !== i) {
                            item[vm.rowIndexField] = i;
                            vm.$emit('row-changed', item);
                        }

                        i++;
                    }
                });
            }
        }
    }
</script>

<style scoped>
    .search-input {
        border: none;
        width: 100%;
        outline: none !important;
        box-shadow:none;
        border-bottom: lightgray solid 1px;
        margin-bottom: 2px;
        background-color: transparent;
    }

    .search-input:hover {
        border-color: #00AAFF !important;
    }

    .col-pixel-width-15 { flex: 0 0 10px; color: darkgray; }
</style>

<!--<docs>-->
<!--A Basic async grid-->
<!--```-->
<!--    <data-grid ref="grid" async-url="/api/v1/stocks" :columns="[{field: 'name', width: 6, title: 'Name'},{field: 'description', width: 6, title: 'Description'}]"></data-grid>-->
<!--```-->
<!--</docs>-->
