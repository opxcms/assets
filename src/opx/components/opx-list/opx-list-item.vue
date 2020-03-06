<template>
    <div class="opx-list-item" :class="item_class">
        <div class="opx-list-item__checkbox" v-if="is_selectable"
             :class="checkbox_class"
             @click="toggleSelected"
        ></div>
        <div class="opx-list-item__id" :class="id_class"><span>{{ item_id }}</span></div>
        <div class="opx-list-item__action" v-if="children_enabled"
             @click="$emit('change-parent', item_id)"
        >
            <opx-icon :icon="children_icon"></opx-icon>
        </div>
        <router-link v-if="edit_enabled" :class="'opx-list-item__action'" :to="edit_route" :event="''"
                     @click.native.prevent="goingEditing(edit_route)">
            <opx-icon :icon="'edit'"></opx-icon>
        </router-link>
        <!-- Additional actions -->
        <router-link v-if="has_actions" :class="'opx-list-item__action'" v-for="(action, ind) in item['actions']"
                     :key="ind"
                     :to="action['route']"
                     :event="''"
                     @click.native.prevent="goingEditing(action['route'])">
            <opx-icon :icon="action['icon']"></opx-icon>
        </router-link>
        <!-- Refresh action -->
        <div class="opx-list-item__action opx-list-item__action-fixed" v-if="has_refresh"
             @click="refresh"
        >
            <opx-icon :icon="'refresh'" v-if="!refreshing"></opx-icon>
            <opx-loading v-if="refreshing" :fit="true"></opx-loading>
        </div>
        <div class="opx-list-item__body">
            <div class="opx-list-item__body-line">
                <div class="opx-list-item__title">{{ item_title }}</div>
                <div class="opx-list-item__subtitle" v-if="item_subtitle">{{ item_subtitle }}</div>
                <div class="opx-list-item__description" v-if="item_description">{{ item_description }}</div>
            </div>
            <div class="opx-list-item__body-line">
                <div class="opx-list-item__property"
                     v-for="(prop, key) in item_properties"
                     :key="key"
                     v-html="prop"
                ></div>
            </div>
        </div>
    </div>
</template>

<script>
    import {DateTime} from 'luxon';
    import client from "../../api-client/api-client";

    export default {
        name: "opx-list-item",
        props: {
            item: Object,
            children: {
                type: Boolean,
                default: false,
            },
            selectable: {
                type: Boolean,
                default: true,
            },
            selected: {
                type: Array,
                default: () => [],
            },
            check_hidden: {
                type: Boolean,
                default: false,
            },
            check_disabled: {
                type: Boolean,
                default: false,
            },
            last: {
                type: String,
                default: null,
            },
            edit_url: {
                type: String,
                default: () => {
                    return null;
                }
            },
            before_edit: {
                type: Function,
                default: null,
            }
        },

        computed: {
            is_selected: function () {
                return this.selected.indexOf(this.item['id']) !== -1;
            },
            is_selectable: function () {
                return this.selectable;
            },
            checkbox_class: function () {
                let classes = [];
                if (this.is_selected) classes.push('opx-list-item__checkbox-selected');
                if (this.check_hidden) classes.push('opx-list-item__checkbox-hidden');
                if (this.check_disabled) classes.push('opx-list-item__checkbox-disabled');
                return classes;
            },
            id_class: function () {
                let classes = [];
                if (!this.selectable) {
                    classes.push('opx-list-item__id-spaced');
                }
                if (!this.item['enabled']) {
                    classes.push('opx-list-item__id-disabled');
                }
                return classes;
            },
            item_class: function () {
                let classes = [];
                if (this.item['deleted']) classes.push('opx-list-item-deleted');
                if (this.last === String(this.item['id'])) classes.push('opx-list-item-last');

                return classes;
            },
            item_title: function () {
                return this.item['title'];
            },
            item_subtitle: function () {
                return this.item['subtitle'];
            },
            item_description: function () {
                return this.item['description'];
            },
            item_id: function () {
                return this.item['id'];
            },
            children_enabled: function () {
                return !!this.children;
            },
            children_icon: function () {
                return this.item['children_count'] === null || this.item['children_count'] === 0 ? 'folder' : 'folder-full'
            },
            edit_route: function () {
                return {name: this.edit_url, params: {id: this.item['id']}};
            },
            edit_enabled: function () {
                return !!this.edit_url;
            },
            has_actions: function () {
                return !!this.item['actions'];
            },
            has_refresh: function () {
                return !!this.item['refresh'];
            },
            item_properties: function () {
                let props = this.item['properties'];

                if (props === null) return null;

                if (typeof props === 'string') {
                    props = [props];
                }

                let formatted = [];

                props.map(prop => {
                    let value = typeof prop === 'string' ? prop : prop[Object.keys(prop)[0]];
                    let key = typeof prop === 'string' ? null : Object.keys(prop)[0];

                    if (String(value).indexOf('datetime:') !== -1) {
                        const date = DateTime.fromISO(value.slice(9)).setZone().setLocale(window.navigator.language);
                        value = date.toFormat('d MMM yyyy, HH:mm');
                    } else if (String(value).indexOf('date:') !== -1) {
                        const date = DateTime.fromISO(value.slice(5)).setZone().setLocale(window.navigator.language);
                        value = date.toFormat('d MMM yyyy');
                    } else if (String(value).indexOf('time:') !== -1) {
                        const date = DateTime.fromISO(value.slice(5)).setZone().setLocale(window.navigator.language);
                        value = date.toFormat('HH:mm');
                    } else {
                        value = this.$trans(value);
                    }

                    if (key === null) {
                        formatted.push(value);
                    } else {
                        formatted.push('<span class="opx-list-item__property-' + key + '">' + value + '</span>');
                    }
                });

                return formatted;
            }
        },

        data: () => ({
            refreshing: false,
        }),

        methods: {
            toggleSelected() {
                if (this.check_disabled || this.check_hidden) return;

                this.$emit('selection', this.item['id']);
            },

            goingEditing(route) {
                if (this.before_edit) {
                    this.before_edit(String(this.item['id']));
                }
                this.$router.push(route);
            },

            refresh() {
                if (!this.item['refresh'] || this.refreshing) {
                    return;
                }
                this.refreshing = true;
                client.post(this.item['refresh'], {id: this.item_id})
                    .then(response => {
                        this.$emit('refreshed', this.item_id, response.data);
                        this.refreshing = false;
                    })
                    .catch(error => {
                        const message = error.message + ':<br>' + error.response.data.message;
                        this.$toast.error(message);
                        this.refreshing = false;
                    });
            },
        }
    }
</script>