<template>
    <div>
        <span class="value" v-if="!editing"
              :class="{'disabled': !enabled}"
              @click="enterEditingMode"
        >{{ selectedValue }}</span>
        <input class="value" v-if="editing"
               :class="{'disabled': !enabled}"
               v-number
               v-model="valueModel"
               v-on:blur="exitEditingMode"
        >
    </div>
</template>

<script>
    import OpxListFilterAbstract from "./opx-list-filter-abstract";

    export default {
        name: "opx-list-filter-number",
        mixins: [OpxListFilterAbstract],
        data() {
            return {
                selectedValue: '',
                editing: false,
            }
        },
        computed: {
            valueModel: {
                get() {
                    return this.selectedValue;
                },
                set(value) {
                    const int = parseInt(value);
                    if(value === String(int)) {
                        this.selectedValue = value;
                        this.$emit('update', this.name, this.selectedValue);
                    }
                }
            },
        },
        directives: {
            number: {
                bind: (el) => {
                    this.inputHandler = function (e) {
                        const ch = String.fromCharCode(e.which);
                        const re = new RegExp('[0-9]');
                        if (!ch.match(re)) {
                            e.preventDefault();
                        }
                    };
                    el.addEventListener("keypress", this.inputHandler);
                },
                unbind: (el) => {
                    el.removeEventListener("keypress", this.inputHandler);
                },
                inputHandler: null
            }
        },
        created() {
            this.selectedValue = this.value;
            this.$emit('update', this.name, this.selectedValue, this.enabled);
        },
        methods: {
            enterEditingMode() {
                this.editing = true;
                this.$emit('update', this.name, this.selectedValue, true);
                this.$nextTick(() => {
                    this.$el.getElementsByTagName('input')[0].focus();
                });
            },
            exitEditingMode() {
                this.editing = false;
            },
        },
    }
</script>