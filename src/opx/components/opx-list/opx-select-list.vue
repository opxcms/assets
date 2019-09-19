<template>
    <div class="opx-scroll-page">
        <opx-loading v-if="is_component_loading"></opx-loading>
        <div v-if="!is_component_loading" class="opx-scroll-page__header">
            <h1 class="opx-scroll-page__header-title">{{ list_caption }}</h1>
            <div class="opx-scroll-page__header-line">
                <div class="opx-toolbar">
                    <div class="opx-toolbar__item">
                        <!-- order -->
                        <opx-list-order v-if="original['order']"
                                        :original="original['order']"
                                        :values="query['order']"
                                        @update="update"
                        ></opx-list-order>
                        <!-- filters -->
                        <opx-list-filter v-if="original['filters']"
                                         :original="original['filters']"
                                         :values="query['filters']"
                                         @update="update"
                        ></opx-list-filter>
                        <!-- search -->
                        <opx-list-search v-if="original['search']"
                                         :original="original['search']"
                                         :values="query['search']"
                                         @update="update"
                        ></opx-list-search>

                        <!-- refresh -->
                        <div class="opx-toolbar__item-button" @click="load">
                            <opx-icon :icon="'refresh'"></opx-icon>
                        </div>

                    </div>
                </div>
            </div>
        </div>
        <div v-if="!is_component_loading" class="opx-scroll-page__body">
            <opx-scroll-box v-if="!is_loading"
                            :containerClass="'opx-scroll-page__body-container'"
                            :scrollableClass="'opx-scroll-page__body-scroller'"
                            :mode="'both'">
                <!-- navigation -->
                <div class="opx-list-item">
                    <div class="opx-list-item__checkbox"
                         :class="{'opx-list-item__checkbox-selected': is_all_selected}"
                         @click="selectAll"></div>
                    <div class="opx-list-item__action" v-if="parent !== null" @click="changeParent(0, false)">
                        <opx-icon :icon="'folder-root'"></opx-icon>
                    </div>
                    <div class="opx-list-item__action" v-if="parent !== null" @click="changeParent(parent, false)">
                        <opx-icon :icon="'folder-up'"></opx-icon>
                    </div>
                    <div class="opx-list-item__action" v-if="quicknav !== null">
                        <opx-list-quick-nav :nav="quicknav" :current="query.scope"
                                            @change-scope="changeScope"></opx-list-quick-nav>
                    </div>
                </div>
                <!-- End of navigation -->
                <opx-list-item v-for="(item, key) in list"
                               :key="key"
                               :item="item"
                               :children="children_enabled"
                               :selected="selected_items"
                               :selectable="true"
                               :check_hidden="String(item['id']) === current"
                               :check_disabled="disabled.indexOf(item['id']) !== -1"
                               @selection="toggleItemSelection"
                               @change-parent="changeParent"
                ></opx-list-item>
            </opx-scroll-box>
            <opx-loading v-if="is_loading"></opx-loading>
        </div>
        <div v-if="!is_component_loading" class="opx-scroll-page__footer">
            <opx-pagination :pagination="pagination" @update="update"></opx-pagination>
            <slot></slot>
        </div>
    </div>

</template>

<script>
    import Vue from "vue";
    import client from "../../api-client/api-client"

    export default {
        name: 'opx-select-list',

        props: {
            loaderUrl: String,
            selected: Array,
            disabled: {
                type: Array,
                default: () => [],
            },
            current: {
                type: String,
                default: null,
            }
        },

        data() {
            return {
                original: null,

                componentLoading: true,
                loading: true,

                query: {
                    order: {},
                    filters: {},
                    search: {},
                    page: null,
                    parent_id: null,
                    scope: null,
                },

                pagination: {
                    current: null,
                    last: null,
                    from: null,
                    to: null,
                    total: null,
                },

                parent: null,

                list: [],
                description: null,
            }
        },

        computed: {

            children_enabled: function () {
                return !!this.original['children'];
            },

            list_caption: function () {
                let caption = this.$trans(this.original['caption']);
                if (!!this.description) {
                    caption += ' - ' + this.description;
                }
                return caption;
            },

            is_loading: function () {
                return this.loading;
            },

            is_component_loading: function () {
                return this.componentLoading;
            },

            selected_items: function () {
                return Array.from(this.selected);
            },

            is_all_selected: function () {
                if (this.list.length === 0) return false;
                let all = true;
                this.list.some(item => {
                    const id = item['id'];
                    if ((this.current !== String(id) && this.disabled.indexOf(id) === -1) && this.selected.indexOf(id) === -1) {
                        all = false;
                        return true;
                    }
                    return false;
                });
                return all;
            },

            quicknav: function () {
                return !this.original['quick_nav'] ? null : this.original['quick_nav'];
            },
        },

        created() {
            // load list component parameters
            client.get(this.loaderUrl)
                .then(response => {

                    // store parameters
                    Vue.set(this, 'original', response.data['data']);

                    // update query
                    if (!!this.original['order']) {
                        this.query.order = {
                            by: this.original['order']['current'],
                            direction: this.original['order']['direction'],
                        };
                    }
                    if (!!this.original['filters']) {
                        Object.keys(this.original['filters']).map(key => {
                            if (this.original['filters'][key]['enabled'] === true) {
                                this.query.filters[key] = this.original['filters'][key]['value'];
                            }
                        });
                    }

                    this.componentLoading = false;

                    // load list
                    this.load();
                })
                .catch(error => {
                    const message = error.message + ':<br>' + error.response.data.message;
                    this.$toast.error(message, 0);
                });
        },

        methods: {

            changeParent(parentId) {
                this.query.parent_id = parentId;
                this.load();
            },

            update(subject, value) {
                this.query.page = 1;
                Vue.set(this.query, subject, value);

                this.load();
            },

            changeScope(scope) {
                this.query.scope = scope;
                this.query.page = 1;
                this.load();
            },

            load() {
                //params
                this.loading = true;
                client.post(this.original['source'], this.query)
                    .then((response => {
                        this.pagination = {
                            current: response.data['current_page'],
                            last: response.data['last_page'],
                            from: response.data['from'],
                            to: response.data['to'],
                            total: response.data['total'],
                        };
                        this.list = response.data['data'];
                        this.parent = (typeof response.data['parent'] !== 'undefined') ? response.data['parent'] : null;
                        this.description = (typeof response.data['description'] !== 'undefined') ? response.data['description'] : null;
                        this.loading = false;
                    }))
                    .catch(error => {
                        const message = error.message + ':<br>' + error.response.data.message;
                        this.$toast.error(message, 0);
                    });
            },

            /**
             * SELECTION
             */

            toggleItemSelection(id) {
                this.$emit('selected', [id], this.selected_items.indexOf(id) === -1);
            },

            selectAll() {
                let ids = [];

                this.list.map(item => {
                    let id = item['id'];
                    if (this.disabled.indexOf(id) === -1 && this.current !== String(id)) {
                        ids.push(id);
                    }
                });

                this.$emit('selected', ids, !this.is_all_selected);
            },

        },
    }
</script>