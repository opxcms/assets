<template>
    <div class="opx-form-field-related__entry">
        <input class="opx-form-field-text"
               :class="{
                    'opx-form-field-text__modified': isModified(),
               }"
               v-model="model">
        <div class="opx-form-field-related__entry-actions">
            <span class="opx-form-field-related__entry-clear"
                  v-if="value !== null"
                  @click="clear"
            ></span>
        </div>
    </div>
</template>

<script>
    export default {
        name: "opx-form-field-related-number",

        props: {
            id: [String, Number],
            value: {
                type: String,
                default: '',
            },
            initial: {
                type: String,
                default: '',
            },
        },

        computed: {
            model: {
                get: function () {
                    return this.value !== null ? this.value : 0;
                },
                set: function (value) {
                    if (value === '') {
                        value = null;
                    }
                    this.$emit('changed', this.id, value);
                }
            },
        },

        methods: {
            clear() {
                this.$emit('changed', this.id, null);
            },

            isModified() {
                return this.initial !== this.value;
            }
        },
    }
</script>