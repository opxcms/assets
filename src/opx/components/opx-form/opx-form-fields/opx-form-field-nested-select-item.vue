<template>
    <div>
        <div class="opx-form-field-select__list-value"
             :class="{'opx-form-field-select__list-value-active': isActive(), 'opx-form-field-select__list-value-disabled': !isEnabled()}"
             @click="selected(item['id'])"
        >
            <span class="opx-form-field-select__list-expand"
                  v-if="has_children"
                  :class="{'opx-form-field-select__list-expand-expanded': expanded}"
                  @click.stop="expandItem"
            ></span>
            <span>{{ item['caption'] }}</span>
            <span class="opx-form-field-select__value-id">{{ item['id'] }}</span>
        </div>

        <div class="opx-form-field-select__list-sub-container" v-if="has_children" v-show="expanded">
            <opx-form-field-nested-select-item
                    v-for="children in items"
                    :key="children['id']"
                    :item="children"
                    :options="options"
                    :selected_id="selected_id"
                    :id="id"
                    :safe="safe"
                    :level="level + 1"
                    :disabled="!isEnabled()"
                    @selected="selected"
                    @has-active="expanded = true; $emit('has-active')"
                    @update-height="$emit('update-height')"
            ></opx-form-field-nested-select-item>
        </div>
    </div>
</template>

<script>
    export default {
        name: "opx-form-field-nested-select-item",
        props: {
            item: Object,
            options: Array,
            selected_id: {
                type: [String, Number],
                default: null,
            },
            id: String,
            safe: Boolean,
            level: Number,
            disabled: Boolean,
        },

        data() {
            return {
                expanded: false,
                items: null,
                has_children: false,
            }
        },

        created() {
            this.items = this.options.filter(item => item['parent_id'] === this.item['id']);
            this.has_children = !!this.items.length;
        },

        methods: {
            selected(id) {
                if (this.isEnabled()) this.$emit('selected', id);
            },

            isActive() {
                const active = String(this.selected_id) === String(this.item['id']);
                if (active) this.$emit('has-active');
                return active;
            },

            isEnabled() {
                return !this.safe || (!this.disabled && this.id !== String(this.item['id']));
            },

            expandItem() {
                this.expanded = !this.expanded;
                this.$emit('update-height');
            }
        }
    }
</script>