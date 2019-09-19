<template>
    <div class="opx-toolbar__item">
        <div class="opx-toolbar__item-button" @click="showPopup">
            <opx-icon :icon="'filter'"></opx-icon>
        </div>
        <div class="opx-overlay" v-if="show">
            <div class="opx-overlay__container">
                <div class="opx-overlay__close" @click="closePopup"></div>
                <div class="opx-toolbar__item-popup-line" v-for="(filter, name) in this.original" :key="name">

                    <!-- icon -->
                    <span class="opx-toolbar__item-popup-line-button"
                          v-on:click="toggleState(name)"
                          :class="{'active': getState(name)}"
                    ><opx-icon :icon="getState(name) ? 'switch-on' : 'switch-off'"></opx-icon></span>
                    <!-- end of icon -->

                    <!-- caption -->
                    <span class="opx-toolbar__item-popup-line-text">{{ $trans(filter['caption']) }}</span>
                    <!-- end of caption -->

                    <!-- filter -->
                    <div class="opx-toolbar__item-popup-line-filter">
                        <div :is="getComponent(name)"
                             :name="name"
                             :options="original[name]['options']"
                             :value="filters[name]['value']"
                             :enabled="filters[name]['enabled']"
                             @update="update"
                        ></div>
                    </div>
                    <!-- end of filter -->

                </div>
                <div>
                    <span class="button success" v-on:click="apply">{{ $trans('actions.apply') }}</span>
                    <span class="button" v-on:click="reset">{{ $trans('actions.reset') }}</span>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
    import Vue from "vue";

    export default {
        name: "opx-list-filter",

        props: {
            original: Object,
            values: {
                type: Object,
                default: () => {
                    return {};
                },
            },
        },

        data() {
            return {
                show: false,
                filters: {},
            }
        },

        created() {
        },

        methods: {
            showPopup() {
                let filters = {};

                Object.keys(this.original).map((filter) => {
                    filters[filter] = {
                        enabled: this.values.hasOwnProperty(filter),
                        value: this.values.hasOwnProperty(filter) ? this.values[filter] : String(this.original[filter]['value']),
                    };
                });

                this.filters = filters;

                this.show = true;
            },

            closePopup() {
                this.show = false;
            },

            getState(name) {
                return !!this.filters[name]['enabled'];
            },

            toggleState(name) {
                Vue.set(this.filters[name], 'enabled', !this.filters[name]['enabled']);
            },

            getComponent(name) {
                const componentName = this.original[name]['type'];

                let component = Vue.component('opx-list-filter-' + componentName);

                if (!component) component = Vue.component('opx-list-filter-switch');

                return component;
            },

            update(name, value, enabled = true) {
                Vue.set(this.filters[name], 'value', value);
                Vue.set(this.filters[name], 'enabled', enabled);
            },

            apply() {
                let filters = {};

                Object.keys(this.filters).map((filter) => {
                    if (this.filters[filter]['enabled'] === true) {
                        filters[filter] = this.filters[filter]['value']
                    }
                });

                this.$emit('update', 'filters', filters);

                this.show = false;
            },
            reset() {
                Object.keys(this.filters).map((filter) => {
                    this.filters[filter]['enabled'] = this.original[filter]['enabled'];
                    this.filters[filter]['value'] = this.original[filter]['value'];
                });

                this.apply();
            },
        }
    }
</script>