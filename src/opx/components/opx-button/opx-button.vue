<template>
    <span class="button"
          :class="classes"
          v-on:click="onClick"
    >{{ $trans(caption) }}</span>
</template>

<script>
    export default {
        name: "opx-button",
        props: {
            classes: Array,
            caption: {
                type: String,
                default: '',
            }
        },
        methods: {
            onClick() {
                this.$emit('click');
            }
        }
    }
</script>