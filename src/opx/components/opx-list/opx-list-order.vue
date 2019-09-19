<template>
    <div class="opx-toolbar__item">
        <div class="opx-toolbar__item-button" @click="toggle">
            <opx-icon :icon="'order'"></opx-icon>
        </div>
        <div class="opx-overlay" v-if="show">
            <div class="opx-overlay__container">
                <div class="opx-overlay__close" @click="toggle"></div>
                <div class="opx-toolbar__item-popup-line" v-for="(caption, field) in original['fields']">
                <span class="opx-toolbar__item-popup-line-button"
                      @click="select(field, 'asc')"
                      :class="{'active': isActive(field, 'asc')}">
                    <opx-icon :icon="'order-asc'"></opx-icon>
                </span>
                    <span class="opx-toolbar__item-popup-line-button"
                          @click="select(field, 'desc')"
                          :class="{'active': isActive(field, 'desc')}">
                    <opx-icon :icon="'order-desc'"></opx-icon>
                </span>
                    <span class="opx-toolbar__item-popup-line-text">{{ $trans(caption) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "opx-list-order",
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
            }
        },
        methods: {
            toggle() {
                this.show = !this.show;
            },
            select(field, direction) {
                this.toggle();
                this.$emit('update', 'order', {by: field, direction: direction});
            },
            isActive(field, direction) {
                return (field === this.values['by']) && (this.values['direction'] === direction);
            }
        }
    }
</script>