<template>
    <div class="opx-scroll-page">
        <div class="opx-scroll-page__header">
            <h1 class="opx-scroll-page__header-title">{{ list_caption }}</h1>
            <div class="opx-scroll-page__header-line">
                <div class="opx-toolbar">
                    <div class="opx-toolbar__group">
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
                    </div>

                    <!-- add -->
                    <div class="opx-toolbar__group">
                        <div class="opx-toolbar__item">
                            <div class="opx-toolbar__item-button opx-toolbar__item-button-green"
                                 v-if="!!original['add']"
                                 @click="clickAdd">
                                <opx-icon-external v-if="!!original['icons'] && !!original['icons']['add']"
                                                   :icon="original['icons']['add']"></opx-icon-external>
                                <opx-icon v-else :icon="'add'"></opx-icon>
                            </div>
                        </div>
                    </div>

                    <!-- refresh -->
                    <div class="opx-toolbar__group">
                        <div class="opx-toolbar__item">
                            <div class="opx-toolbar__item-button" @click="load">
                                <opx-icon :icon="'refresh'"></opx-icon>
                            </div>
                        </div>
                    </div>

                    <!-- actions -->
                    <div class="opx-toolbar__group">
                        <div class="opx-toolbar__item"
                             v-for="action in Object.keys(actions)"
                             v-if="original[action]"
                             :key="action"
                             @click="perform(action)"
                        >
                            <div class="opx-toolbar__item-button"
                                 :class="{'opx-toolbar__item-button-disabled': !can(action)}"
                            >
                                <opx-icon :icon="action"></opx-icon>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="opx-scroll-page__body">
            <opx-scroll-box v-if="!is_loading"
                            :containerClass="'opx-scroll-page__body-container'"
                            :scrollableClass="'opx-scroll-page__body-scroller'"
                            :mode="'both'"
                            :initial="initial_scroll"
                            @changed="scrolled">
                <!-- navigation -->
                <div class="opx-list-item">
                    <div class="opx-list-item__checkbox" v-if="has_actions"
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
                               :edit_url="edit_url"
                               :children="children_enabled"
                               :before_edit="storeCurrentParams"
                               :last="last_edited"
                               :selected="selected_items"
                               :selectable="has_actions"
                               @selection="toggleItemSelection"
                               @change-parent="changeParent"
                               @refreshed="refreshed"
                ></opx-list-item>
            </opx-scroll-box>
            <opx-loading v-if="is_loading"></opx-loading>
        </div>
        <div class="opx-scroll-page__footer">
            <opx-pagination :pagination="pagination" @update="update"></opx-pagination>
        </div>
    </div>

</template>

<script>
    import Vue from "vue";
    import OpxLoadableComponent from "../opx-component-loader/opx-loadable-component";
    import client from "../../api-client/api-client"

    const flattenQuery = function (query) {
        let flatten = {};

        Object.keys(query).map(key => {
            if (query[key] === null) return;
            if (typeof query[key] === 'object') {
                Object.keys(query[key]).map(subkey => {
                    flatten[key + '[' + subkey + ']'] = String(query[key][subkey]);
                });
            } else {
                flatten[key] = String(query[key]);
            }
        });

        return flatten;
    };

    const unFlattenQuery = function (query) {
        let unFlatten = {};

        Object.keys(query).map(key => {
            let re = /[\[\]]/;
            let parsed = key.split(re);
            if (parsed.length === 1) {
                unFlatten[key] = query[key];
            } else if (parsed.length === 3) {
                if (!unFlatten[parsed[0]]) unFlatten[parsed[0]] = {};
                unFlatten[parsed[0]][parsed[1]] = query[key];
            }
        });

        return unFlatten;
    };

    export default {
        name: 'opx-list',
        mixins: [OpxLoadableComponent],
        props: {
            original: Object,
        },
        data() {
            return {
                loading: true,

                query: {
                    order: {},
                    filters: {},
                    search: {},
                    page: null,
                    parent: null,
                    scope: null,
                },

                actions: {
                    disable: {key: 'enabled', state: false},
                    enable: {key: 'enabled', state: true},
                    delete: {key: 'deleted', state: true},
                    restore: {key: 'deleted', state: false},
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
                selected: [],
                description: null,

                lastEdited: null,
                initialScrollX: 0,
                initialScrollY: 0,
                scrollX: 0,
                scrollY: 0,
            }
        },

        computed: {
            children_enabled: function () {
                return !!this.original['children'];
            },

            edit_url: function () {
                return this.original['edit'];
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
            last_edited: function () {
                return !!this.lastEdited ? String(this.lastEdited) : null;
            },
            selected_items: function () {
                return this.selected;
            },
            initial_scroll: function () {
                return {x: this.initialScrollX, y: this.initialScrollY};
            },
            is_all_selected: function () {
                if (this.list.length === 0) return false;
                let all = true;
                this.list.some(item => {
                    if (this.selected.indexOf(item['id']) === -1) {
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
            has_actions: function () {
                return !!this.original['delete'] || !!this.original['disable'] || !!this.original['enable'] || !!this.original['restore'];
            }
        },

        watch: {
            '$route'(to) {
                this.processQuery(to.query);
                this.loadCurrentParams();
            }
        },
        created() {
            this.processQuery(this.$route.query);
            this.loadCurrentParams();
        },

        methods: {
            makeDefaultQuery(parentId = null, scopeId = null) {
                let query = {
                    order: {},
                    filters: {},
                    search: {},
                    page: 1,
                    parent_id: parentId,
                };

                if (scopeId !== null) {
                    query['scope'] = scopeId;
                }

                if (!!this.original['order']) {
                    query.order = {
                        by: this.original['order']['current'],
                        direction: this.original['order']['direction'],
                    };
                }
                if (!!this.original['filters']) {
                    Object.keys(this.original['filters']).map(key => {
                        if (this.original['filters'][key]['enabled'] === true) {
                            query.filters[key] = this.original['filters'][key]['value'];
                        }
                    });
                }

                return query;
            },

            processQuery(query) {
                // if query is set
                if (Object.keys(query).length > 0) {
                    // parse query to parameters
                    this.query = unFlattenQuery(query);
                    // load list
                    this.load();
                    return;
                }

                // reset scroll behavior
                this.$router.currentRoute.meta['scroll_x'] = 0;
                this.$router.currentRoute.meta['scroll_y'] = 0;
                this.initialScrollX = 0;
                this.initialScrollY = 0;

                // push default query to router
                this.$router.push({query: flattenQuery(this.makeDefaultQuery())});
            },

            changeParent(parentId) {
                this.resetCurrentParams();
                this.$router.push({query: flattenQuery(this.makeDefaultQuery(parentId, this.query.scope))});
            },

            update(subject, value) {
                Vue.set(this.query, 'page', 1);
                Vue.set(this.query, subject, value);
                this.$router.currentRoute.meta['scroll_x'] = 0;
                this.$router.currentRoute.meta['scroll_y'] = 0;
                this.initialScrollX = 0;
                this.initialScrollY = 0;
                this.$router.push({query: flattenQuery(this.query)});
            },

            changeScope(scope) {
                this.query.scope = scope;
                this.query.page = 1;
                this.$router.push({query: flattenQuery(this.query)});
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
                        this.selected = [];
                        this.loading = false;
                    }))
                    .catch(error => {
                        const message = error.message + ':<br>' + error.response.data.message;
                        this.$toast.error(message, 0);
                    });
            },

            toggleItemSelection(key) {
                let ind = this.selected.indexOf(key);
                if (ind === -1) {
                    this.selected.push(key);
                } else {
                    this.selected.splice(ind, 1);
                }
            },

            storeCurrentParams(id = null) {
                this.$router.currentRoute.meta['last_edited'] = id;
                this.$router.currentRoute.meta['scroll_x'] = this.scrollX;
                this.$router.currentRoute.meta['scroll_y'] = this.scrollY;
            },

            resetCurrentParams() {
                this.$router.currentRoute.meta['last_edited'] = null;
                this.$router.currentRoute.meta['scroll_x'] = 0;
                this.$router.currentRoute.meta['scroll_y'] = 0;
                this.lastEdited = null;
                this.scrollX = 0;
                this.scrollY = 0;
            },

            loadCurrentParams() {
                this.lastEdited = !!this.$route.meta['last_edited'] ? this.$route.meta['last_edited'] : null;
                this.initialScrollX = !!this.$route.meta['scroll_x'] ? this.$route.meta['scroll_x'] : 0;
                this.initialScrollY = !!this.$route.meta['scroll_y'] ? this.$route.meta['scroll_y'] : 0;
            },

            scrolled(toX, toY) {
                this.scrollX = toX;
                this.scrollY = toY;
            },

            /**
             * Actions
             */

            refresh() {
                this.load();
            },

            can(action) {
                if (this.selected.length === 0) return false;

                let {key, state} = this.actions[action];

                let can = false;

                this.getSelectedItems().some(item => {
                    if (item[key] === !state) {
                        can = true;
                        return true;
                    }
                    return false;
                });

                return can;
            },

            perform(action) {
                if (!this.can(action)) return;

                client.post(this.original[action], this.selected)
                    .then(response => {
                        const changed = !!response.data['changed'] ? response.data['changed'] : null;

                        this.getSelectedItems().map(item => {
                            if (changed) {
                                if (!!changed[item['id']]) {
                                    Object.assign(item, changed[item['id']]);
                                }
                            } else {
                                Vue.set(item, this.actions[action].key, this.actions[action].state);
                            }
                        });

                        this.selected = [];
                    })
                    .catch(error => {
                        const message = error.message + ':<br>' + error.response.data.message;
                        this.$toast.error(message);
                    });
            },

            /**
             * Selection
             */

            getSelectedItems() {
                return this.list.filter(item => {
                    return this.selected.indexOf(item['id']) !== -1;
                });
            },

            selectAll() {
                if (this.is_all_selected) {
                    this.selected = [];
                } else {
                    this.list.map(item => {
                        if (this.selected.indexOf(item['id']) === -1) this.selected.push(item['id']);
                    });
                }
            },

            clickAdd() {
                const query = {name: this.original['add'], query: {}};

                if (!!this.query['parent_id']) {
                    query['query']['parent_id'] = this.query['parent_id'];
                }

                if (!!this.query['scope']) {
                    query['query']['scope'] = this.query['scope'];
                }

                this.$router.push(query);
            },

            refreshed(id, data) {
                Object.keys(this.list).map(key => {
                    if (this.list[key]['id'] === id) {
                        Vue.set(this.list, key, data);
                    }
                });
            }
        },
    }
</script>