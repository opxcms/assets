<template>
    <div v-if="canView()" class="opx-form-field"
         :class="{
            'opx-form-field__invalid': !isValid(),
            'opx-form-field__modified': isModified(),
            'opx-form-field__required': isRequired()
         }"
    >
        <div class="opx-form-field__caption">
            <span>{{ getCaption() }}</span>
            <opx-icon :icon="'arrow-right'" :class="{'expanded': expanded}" @click="toggle"></opx-icon>
            <span class="opx-form-field__caption-hint" v-if="hints">[{{ getName() }}]</span>
            <span class="opx-form-field__counter" v-if="is_countable()"
                  :class="{'opx-form-field__counter-invalid': is_counter_valid()}">({{ value_count() }})</span>
        </div>
        <div class="opx-form-field__value">
            <textarea type="text" class="opx-form-field-text"
                      :class="{
                            'opx-form-field-text__required': isRequired(),
                            'opx-form-field-text__modified': isModified(),
                            'opx-form-field-text__invalid': !isValid(),
                        }"
                      v-model="valueModel"
                      :required="isRequired()"
                      :disabled="!canEdit()"
                      @focus="expand()"
            ></textarea>
        </div>
        <div class="opx-form-field__errors" v-if="!isValid()">
            <span class="opx-form-field__errors-text" v-for="message in getErrors()">{{ message }}</span>
        </div>
        <span class="opx-form-field__info" v-if="getInfo()">{{ getInfo() }}</span>
        <div class="hidden-div"
             style="display: none; white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word; padding-top: 1.2rem; position: absolute; top: 0;"></div>
    </div>
</template>

<script>

    import OpxFormAbstractField from "./opx-form-abstract-field";

    export default {
        mixins: [OpxFormAbstractField],
        data() {
            return {
                height: null,
                expanded: false,
            }
        },
        computed: {
            valueModel: {
                get: function () {
                    const val = this.getValue();
                    return String(val === null ? '' : val);
                },
                set: function (value) {
                    this.setValue(String(value));
                    this.resize(value);
                },
            },
        },

        methods: {
            get_value_count() {
                const value = this.getValue();

                if (value === null) return 0;

                const text = this.getValue().replace(/\n/g, '');

                return text.length;
            },

            value_count() {
                let count = this.get_value_count();
                if (!!this.getOptions().counter.min && count < this.getOptions().counter.min) {
                    count = count + " < " + this.getOptions().counter.min;
                } else if (!!this.getOptions().counter.max && count > this.getOptions().counter.max) {
                    count = count + " > " + this.getOptions().counter.max;
                }

                return count;
            },

            is_countable() {
                return !!this.getOptions().counter;
            },

            is_counter_valid() {
                let count = this.get_value_count();
                return (count > this.getOptions().counter.max || count < this.getOptions().counter.min);
            },

            expand() {
                this.initResizer();
                this.resize(this.valueModel);
                this.expanded = true;
            },

            initResizer() {
                const textarea = this.$el.querySelector('textarea');
                const hidden = this.$el.querySelector('.hidden-div');

                // Set original-height, if none
                if (this.height === null) {
                    this.height = textarea.clientHeight;
                }

                // Set font properties of hiddenDiv
                const style = window.getComputedStyle(textarea);

                let fontFamily = style.fontFamily;
                let fontSize = style.fontSize;
                let fontWeight = style.fontWeight;
                let lineHeight = style.lineHeight;
                let letterSpacing = style.letterSpacing;
                let padding = style.padding;

                if (fontSize) {
                    hidden.style.fontSize = fontSize;
                }
                if (fontFamily) {
                    hidden.style.fontFamily = fontFamily;
                }
                if (fontWeight) {
                    hidden.style.fontWeight = fontWeight;
                }
                if (lineHeight) {
                    hidden.style.lineHeight = lineHeight;
                }
                if (letterSpacing) {
                    hidden.style.letterSpacing = letterSpacing;
                }
                if (padding) {
                    hidden.style.padding = padding;
                }

                hidden.style.width = textarea.clientWidth + 'px';
                hidden.innerHTML = this.valueModel + '\n\n';
            },

            resize(value) {
                const textarea = this.$el.querySelector('textarea');
                const hidden = this.$el.querySelector('.hidden-div');

                hidden.innerHTML = value + '\n\n';

                // Resize if the new height is greater than the original height of the textarea
                hidden.style.display = 'block';
                const height = hidden.clientHeight;
                hidden.style.display = 'none';
                if (this.height <= height) {
                    textarea.style.height = height + 'px';
                }
            },

            toggle() {
                if (this.expanded) {
                    this.expanded = false;
                    this.$el.querySelector('textarea').style.height = this.height + 'px';
                } else {
                    this.expand();
                }
            },
        }
    }
</script>