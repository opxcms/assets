<template>
    <div></div>
</template>

<script>
    import OpxListFilterAbstract from "./opx-list-filter-abstract";

    export default {
        name: "opx-list-filter-switch",

        mixins: [OpxListFilterAbstract],

        created() {
            let value;

            if (this.value === true || String(this.value) === "true" || parseInt(String(this.value)) === 1) {
                value = 'true';
            } else {
                value = 'false';
            }

            this.$emit('update', this.name, value, this.enabled);
        },
    }
</script>