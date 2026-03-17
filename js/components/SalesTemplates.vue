<template>
    <div class="container-fluid p-0 m-0">
        <data-grid
            track-by="guid"
            ref="templatesGrid"
            id="templatesGrid"
            :columns="columns"
            @delete-row="deleteItem"
            :allow-add-new="true"
            :useCard="useCard"
            @new-row="newItem"
            async-url="/api/v1/sales/templates"
            new-item-text="Click to create new Template"
            :multi-select="false"
            @row-clicked="showTemplate"
            :settings="{ RowOrderChangeable: false }">
        </data-grid>

        <delete-confirmation-dialog
            ref="deleteWarning"
            id="deleteWarning"
            :is-deleting="isDeleting"
            title="Delete Sales Template"
            :message="'Are you sure you want to delete the ' + selectedItem.name + ' sales template?'"
            @confirm-delete="deleteItem">
        </delete-confirmation-dialog>
    </div>
</template>

<script>

import DataGrid from './libraries/rg-vue-grid/grid/DataGrid.vue'
import DeleteConfirmationDialog from './libraries/jl-general/DeleteConfirmationDialog.vue'
import SalesTemplateForm from './SalesTemplateForm.vue'
import SalesTemplate from './libraries/jl-data-objects/Sales/SalesTemplate'

export default {
    name: "SalesTemplates",
    components: {
        DeleteConfirmationDialog, DataGrid, SalesTemplateForm
    },
    props: {
        useCard: { type: Boolean, default: true }
    },
    data() {
        return {
            selectedItem: new SalesTemplate(),
            isDeleting: false,
            columns: [
                    {field: "name", width: 4, format: {type: "string"}, title: "Name", class: ""},
                    {field: "customerOrderNo", width: 3, format: {type: "string"}, title: "Order#", class: ""},
                    {field: "memo", width: 5, format: {type: "string"}, title: "Memo", class: "text-start"}
                ]
        }
    },
    methods: {
        newItem() {
            window.location.href = '/accounts/salestemplates/create';
        },
        showTemplate(row) {
            // this.selectedItem = new SalesTemplate(row);
            // $("#salesTemplateModal").modal('show');
            window.location.href = '/accounts/salestemplates/' + row.guid;
        },
        saved(item) {
            this.$refs.templatesGrid.updateObject(item);
        },
        updateModal(){
            console.log("Updating modal heights");
            $('#salesTemplateModal').modal('handleUpdate');
        },

        deleteItem(item, e) {
            // Let check if we have a key event
            if(!e || e.ctrlKey) {
                this.isDeleting = true;
                axios.delete("/api/v1/sales/templates/" + item.guid).then(response => {
                    console.log(response);
                    if (response.status === 200) {
                        this.$refs['templatesGrid'].asyncDeleteRow(item.guid);
                    }

                    $('#deleteWarning').modal('hide');
                    this.isDeleting = false;
                });
            } else {
                // slow delete
                // $('#deleteWarning').modal('show');
                this.$refs.deleteWarning.show(item, "Delete Sales Template", 'Are you sure you want to delete the ' + item.name + ' sales template?');
            }
        },
    },
}
</script>

<style>

</style>
