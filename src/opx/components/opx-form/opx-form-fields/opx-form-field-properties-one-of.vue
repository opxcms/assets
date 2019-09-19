<template>
    <div class="opx-form-field-properties__entry" tabindex="0" @blur="blur">
        <div class="opx-form-field-properties__entry-value"
             :class="{'opx-form-field-properties__entry-value-modified': isModified()}"
             @click="toggle"
        ><span class="opx-form-field-properties__entry-value-text">{{ value }}</span></div>
        <div class="opx-form-field-properties__entry-actions">
            <div class="opx-form-field-properties__entry-dropdown" @click="toggle">
                <opx-icon :icon="'arrow-bottom'" :class="{'expanded': dropped}"></opx-icon>
            </div>
            <div class="opx-form-field-properties__entry-clear"
                 v-if="value !== null"
                 @click.stop="clear"
            ></div>
        </div>
        <div class="opx-form-field-properties__entry-list" v-show="dropped">
            <opx-scroll-box :mode="'vertical'">
                <span class="opx-form-field-properties__entry-list-value" v-for="(value, key) in getOptions()"
                      :key="key"
                      :class="{
                      'opx-form-field-properties__entry-list-value-selected': getValues().indexOf(value) !== -1,
                      'opx-form-field-properties__entry-list-value-modified': isValueModified(value),
                      }"
                      @click="setNewValue(value)"
                >{{ value }}</span>
            </opx-scroll-box>
        </div>
    </div>
</template>

<script>
    export default {
        name: "opx-form-field-properties-one-of",

        props: {
            original: {
                type: Object,
                default: () => {
                },
            },
            value: {
                type: String,
                default: '',
            },
            initial: {
                type: String,
                default: '',
            },
        },

        data() {
            return {
                dropped: false,
            }
        },

        computed: {
            id: function () {
                return this.original['id'];
            },
        },

        methods: {
            getOptions() {
                const values = !!this.original['values'] ? this.original['values'] : null;
                if (values === '' || values === null) {
                    return [];
                }

                return values.replace(/\s*,\s*/g, ',').split(',');
            },

            getValues() {
                return !!this.value ? this.value.replace(/\s*,\s*/g, ',').split(',') : [];
            },

            setNewValue(value) {
                this.$emit('changed', this.id, value);
                this.dropped = false;
            },

            clear() {
                this.$emit('changed', this.id, null);
            },

            isModified() {
                const value = this.initial;
                return value !== this.value;
            },

            isValueModified(value) {
                let original = !!this.initial ? this.initial : '';
                original = original.replace(/\s*,\s*/g, ',').split(',');
                const values = this.getValues();

                return original.indexOf(value) !== values.indexOf(value);
            },

            toggle() {
                this.dropped = !this.dropped;
                if (this.dropped) {
                    this.$nextTick(() => {
                        const el = this.$el.querySelector('.opx-form-field-properties__entry-list');
                        const height = el.clientHeight + 1;
                        el.style.height = height + 'px';
                        el.parentElement.focus();
                    });
                }
            },

            blur() {
                this.dropped = false;
            },
        },
    }
</script>