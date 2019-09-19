<template>
    <div>
        <div class="opx-quick-nav__list-value"
             :class="{'opx-quick-nav__list-value-active': isActive()}"
             @click="selected(item['id'])"
        >
            <span class="opx-quick-nav__list-expand"
                  v-if="has_children"
                  :class="{'opx-quick-nav__list-expand-expanded': expanded}"
                  @click.stop="expanded = !expanded"
            ></span>
            <span>{{ item['caption'] }}</span>
            <span class="opx-quick-nav__value-id">{{ item['id'] }}</span>
        </div>

        <div class="opx-quick-nav__list-sub-container" v-if="has_children" v-show="expanded">
            <opx-list-quick-nav-item
                    v-for="children in items"
                    :key="children['id']"
                    :item="children"
                    :options="options"
                    :selected_id="selected_id"
                    :level="level + 1"
                    @selected="selected"
                    @has-active="expanded = true; $emit('has-active')"
            ></opx-list-quick-nav-item>
        </div>
    </div>
</template>

<script>
    export default {
        name: "opx-list-quick-nav-item",
        props: {
            item: Object,
            options: Array,
            selected_id: {
                type: [String, Number],
                default: null,
            },
            level: Number,
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
                this.$emit('selected', id);
            },

            isActive() {
                const active = String(this.selected_id) === String(this.item['id']);
                if (active) this.$emit('has-active');
                return active;
            },
        }
    }
</script>