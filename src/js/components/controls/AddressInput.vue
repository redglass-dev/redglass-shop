<template>
    <div class="space-y-4">
        <div v-if="showStreet" class="flex flex-col">
            <div class="w-full">
                <div class="flex flex-row justify-between mb-1">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300" :for="streetInput">
                        <slot name="street-label">Address</slot>
                    </label>
                    <slot name="rightStreetLabel"></slot>
                </div>
                <input
                    type="text"
                    :name="streetInput"
                    :id="streetInput"
                    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:ring-white/10"
                    :class="errorStreet !== '' ? 'ring-red-300 placeholder:text-red-300 focus:ring-red-500' : 'ring-gray-300 placeholder:text-gray-400 focus:ring-primary-600 dark:ring-white/10 dark:focus:ring-primary-500'"
                    placeholder="Street"
                    v-model="street"
                />
                <p v-if="errorStreet !== ''" class="mt-2 text-sm text-red-600 dark:text-red-500"><strong>{{ errorStreet }}</strong></p>
            </div>
        </div>
        <div class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-12">
            <div v-if="showCity" class="sm:col-span-6">
                <label :for="cityInput" class="sr-only">
                    <slot name="city-label">City</slot>
                </label>
                <input type="hidden" :name="cityInput" :id="cityInput" :value="selectedCity ? selectedCity.city : ''" placeholder="City" />
                <multiselect
                    class="redglass-input"
                    v-model="selectedCity"
                    label="deliveryCity"
                    track-by="guid"
                    placeholder="City"
                    :options="locations"
                    :searchable="true"
                    :loading="isLoading"
                    :internal-search="false"
                    :clear-on-select="true"
                    :close-on-select="true"
                    :show-no-results="true"
                    :hide-selected="true"
                    @search-change="findCities"
                    @select="selectionChanged"
                    :showLabels="false"
                    :optionHeight="57"
                >
                    <template #singleLabel="props">{{ props.option ? props.option.city : "" }}</template>
                    <template #option="props">
                        <div class="p-0 m-0 leading-tight">
                            <span class="block font-medium">{{ props.option ? props.option.city : "" }}</span>
                            <small class="text-xs text-gray-500 dark:text-gray-400">
                                {{ props.option ? props.option.state : "" }} {{ props.option ? props.option.postcode : "" }}
                            </small>
                        </div>
                    </template>
                    <span slot="noResult">Oops! No elements found. Consider changing the search query.</span>
                </multiselect>
                <p v-if="errorCity !== ''" class="mt-2 text-sm text-red-600 dark:text-red-500"><strong>{{ errorCity }}</strong></p>
            </div>
            <div v-if="showState" class="sm:col-span-3">
                <label :for="stateInput" class="sr-only">
                    <slot name="state-label">State</slot>
                </label>
                <input type="hidden" :name="stateInput" :id="stateInput" :value="selectedCity ? selectedCity.state : ''" />
                <multiselect
                    class="redglass-input"
                    v-model="selectedCity"
                    label="deliveryState"
                    track-by="guid"
                    placeholder="State"
                    :options="locations"
                    :searchable="false"
                    :internal-search="false"
                    :clear-on-select="true"
                    :close-on-select="true"
                    :show-no-results="true"
                    :hide-selected="true"
                    :disabled="true"
                    :showLabels="false"
                    :optionHeight="57"
                >
                    <template #singleLabel="{ option }">{{ option ? option.state : "" }}</template>
                    <template #option="props">
                        <div class="p-0 m-0 leading-tight">
                            <span class="block font-medium">{{ props.option ? props.option.state : "" }}</span>
                            <small class="text-xs text-gray-500 dark:text-gray-400">
                                {{ props.option ? props.option.city : "" }} {{ props.option ? props.option.postcode : "" }}
                            </small>
                        </div>
                    </template>
                    <span slot="noResult">Oops! No elements were found. Consider changing the search query.</span>
                </multiselect>
                <p v-if="errorState !== ''" class="mt-2 text-sm text-red-600 dark:text-red-500"><strong>{{ errorState }}</strong></p>
            </div>
            <div v-if="showPostcode" class="sm:col-span-3">
                <label :for="postcodeInput" class="sr-only">
                    <slot name="postcode-label">Postcode</slot>
                </label>
                <input type="hidden" :name="postcodeInput" :id="postcodeInput" :value="selectedCity ? selectedCity.postcode : ''" />
                <multiselect
                    class="redglass-input"
                    v-model="selectedCity"
                    label="deliveryPostcode"
                    track-by="guid"
                    placeholder="Postcode"
                    :options="locations"
                    :searchable="true"
                    :loading="isLoadingPostcode"
                    :internal-search="false"
                    :clear-on-select="true"
                    :close-on-select="true"
                    :show-no-results="true"
                    @search-change="findPostcodes"
                    @select="selectionChanged"
                    :showLabels="false"
                    :optionHeight="57"
                >
                    <template #singleLabel="{ option }">{{ option ? option.postcode : "" }}</template>
                    <template #option="props">
                        <div class="p-0 m-0 leading-tight">
                            <span class="block font-medium">{{ props.option ? props.option.postcode : "" }}</span>
                            <small class="text-xs text-gray-500 dark:text-gray-400">
                                {{ props.option ? props.option.city : "" }} {{ props.option ? props.option.state : "" }}
                            </small>
                        </div>
                    </template>
                    <span slot="noResult">Oops! No elements found. Consider changing the search query.</span>
                </multiselect>
                <p v-if="errorPostcode !== ''" class="mt-2 text-sm text-red-600 dark:text-red-500"><strong>{{ errorPostcode }}</strong></p>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { EventBus } from '../../EventBus'
    import Multiselect from 'vue-multiselect'
    import {nextTick, ref, watch, onBeforeMount} from "vue";

    const street = defineModel('street')

    const props = defineProps({
        city: { Type: String },
        state: { Type: String },
        postcode: { Type: String },
        streetInput: { Type: String, default: "street" },
        cityInput: { Type: String, default: "city" },
        stateInput: { Type: String, default: "state" },
        postcodeInput: { Type: String, default: "postcode" },
        errorStreet: { Type: String, default: "" },
        errorCity: { Type: String, default: "" },
        errorState: { Type: String, default: "" },
        errorPostcode: { Type: String, default: "" },
        cityApiEndpoint: { Type: String, default: '/api/v1/public/address/find/city'},
        postcodeApiEndpoint: { Type: String, default: '/api/v1/public/address/find/postcode' },
        apiEndpoint: { Type: String, default: '/api/v1/public/postcode'},
        showStreet: { Type: Boolean, default: true },
        showState: { Type: Boolean, default: true },
        showPostcode: { Type: Boolean, default: true },
        showCity: { Type: Boolean, default: true },
    })

    const emits = defineEmits(["update:state", "update:postcode", "update:city", "address-updated"])

    const selectedCity = ref(null)
    const isLoading=  ref(false)
    const isLoadingPostcode = ref(false)
    const locations = ref([{ city: props.city, state: props.state, postcode: props.postcode }])

    onBeforeMount(() => {
        if(props.city !== "" || props.state !== "" || props.postcode !== "") {
            selectedCity.value = { city: props.city, state: props.state, postcode: props.postcode };
        }
    })

    watch(() => props.city, (newValue) => {
        console.log("Updating search", props.city)
        updateSearch();
    })

    watch (() => props.postcode, () => {
        updateSearch();
    })

    watch(selectedCity, (newValue) => {
        console.log(newValue)
        if(newValue == null)
        {
            return;
        }

        if(newValue.city !== props.city) {
            emits('update:city', newValue.city);
        }

        if(newValue.state !== props.state) {
            emits('update:state', newValue.state);
        }

        if(newValue.postcode !== props.postcode) {
            emits('update:postcode', newValue.postcode);
        }
    })

    function updateSearch() {
        if(props.city === '' || props.postcode === '') {
            if(props.city === "" && props.postcode === "") {
                clearAll();
            }

            return;
        }

        let loc = locations.value.find(item => item.city === props.city && item.postcode === props.postcode);
        if(typeof loc !== "undefined") {
            selectedCity.value = loc;
            return;
        } else {
            locations.value.push({ city: props.city, state: props.state, postcode: props.postcode });
            selectionChanged(locations.value.find(item => item.city === props.city && item.postcode === props.postcode));
        }

        window.axios.get(props.apiEndpoint + '/' + props.city + '/' + props.postcode).then( response => {
            if(response.data !== '') {
                let loc = locations.value.find(item => item.city === props.city && item.postcode === props.postcode);
                if(typeof loc === "undefined") {
                    console.log("Adding", response.data)
                    locations.value.push(response.data);
                }
            }
        });
    }

    function clearAll() {
        selectedCity.value = null; //{ guid: '', city: '', state: '', postcode: ''};
    }

    function selectionChanged(selectedOption, id) {
        selectedCity.value = selectedOption;
        nextTick(function() {
            // This allows non vue usage of the even.
            // window.EventBus.$emit('update:location', selectedOption);

            // This allows vue components to listen for the event.
            console.log("Emitting", selectedOption, selectedCity.value)
            emits("address-updated", selectedOption);
        });
    }

    function findCities(query) {
        if(query === "")
        {
            return;
        }

        isLoading.value = true;
        window.axios.get(props.cityApiEndpoint + '/' + query).then( response => {
            locations.value = response.data;
            isLoading.value = false;
        });
    }

    function findPostcodes(query) {
        if(query === "")
        {
            return;
        }

        isLoadingPostcode.value = true;
        window.axios.get(props.postcodeApiEndpoint + '/' + query).then( response => {
            locations.value = response.data;
            isLoadingPostcode.value = false;
        });
    }

    function getAddress() {
        if(selectedCity.value !== null) {
            return {
                street: props.street,
                city: selectedCity.value.city,
                state: selectedCity.value.state,
                postcode: selectedCity.value.postcode,
            }
        } else {
            return {
                street: props.street,
                city: "",
                state: "",
                postcode: "",
            }
        }
    }

    function setLocation(deliveryCity, deliveryPostcode, deliveryState) {
        let loc = locations.value.find(item => item.city === deliveryCity && item.postcode === deliveryPostcode);
        if(typeof loc !== 'undefined') {
            selectionChanged(loc);
            console.log("Found location: " + deliveryCity + " " + deliveryPostcode);
            return;
        }

        // Let's add it.
        loc = {guid: 'custom', city: deliveryCity, state: deliveryState, postcode: deliveryPostcode };
        locations.value = [loc];
        selectionChanged(locations.value.find(item => item.city === deliveryCity && item.postcode === deliveryPostcode));
    }

    defineExpose({setLocation, getAddress})

</script>
