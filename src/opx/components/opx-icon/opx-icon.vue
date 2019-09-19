<template>
    <i v-bind:class="classes" @click="onClick"></i>
</template>

<script>
    export default {
        props:{
            icon: String,
        },
        computed: {
            classes() {
                return ['opx-icon', 'opx-icon-' + this.icon];
            }
        },
        methods: {
            onClick(e) {
                this.$emit('click', e);
            }
        }
    }
</script>