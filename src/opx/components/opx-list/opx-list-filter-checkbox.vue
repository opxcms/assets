<template>
    <div>
        <span class="value"
              v-on:click="rotateValues"
              :class="{'disabled': !enabled}"
        >{{ selectedLabel }}</span>
    </div>
</template>

<script>
    import OpxListFilterAbstract from "./opx-list-filter-abstract";

    export default {
        name: "opx-list-filter-checkbox",

        mixins: [OpxListFilterAbstract],

        data() {
            return {
                selectedValue: '',
            }
        },

        computed: {
            selectedLabel() {
                return this.$trans(this.options[this.selectedValue]);
            },
        },

        created() {
            this.selectedValue = this.value;
        },

        methods: {
            rotateValues() {
                const keys = Object.keys(this.options);
                const current = keys.indexOf(this.selectedValue);
                const count = keys.length;
                if (current === count - 1) {
                    this.selectedValue = keys[0];
                } else {
                    this.selectedValue = keys[current + 1];
                }
                this.$emit('update', this.name, this.selectedValue);
            }
        },
    }
</script>