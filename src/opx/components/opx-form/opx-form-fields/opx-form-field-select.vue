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
            <span class="opx-form-field__caption-hint" v-if="hints">[{{ getName() }}]</span>
        </div>
        <div class="opx-form-field__value">
            <div class="opx-form-field-select"
                 :class="{
                    'opx-form-field-select__required': isRequired(),
                    'opx-form-field-select__modified': isModified(),
                    'opx-form-field-select__invalid': !isValid(),
                    'opx-form-field-select__expanded': dropped,
                 }"
                 @blur="blur" tabindex="0"
            >
                <div class="opx-form-field-select__value" @click="toggle">
                    <span class="opx-form-field-select__value-selected" v-html="getCurrentValueLabel()"></span>
                    <div class="opx-form-field-select__value-actions">
                        <opx-icon :icon="'arrow-bottom'" :class="{'expanded': dropped}"></opx-icon>
                        <span class="opx-form-field-select__value-clear" v-if="(value !== null)&&(value !== '')"
                              @click.stop="clear"></span>
                    </div>
                </div>
                <div class="opx-form-field-select__list" v-show="dropped">
                    <opx-scroll-box :mode="'vertical'">
                        <span class="opx-form-field-select__list-value" v-for="(label, key) in getOptions()"
                              :key="key"
                              :class="{'opx-form-field-select__list-value-active': isKeyCurrent(key)}"
                              @click="setNewValue(key)"
                              v-html="formatLabel(key)"
                        ></span>
                    </opx-scroll-box>
                </div>
            </div>
        </div>
        <div class="opx-form-field__errors" v-if="!isValid()">
            <span class="opx-form-field__errors-text" v-for="message in getErrors()">{{ message }}</span>
        </div>
        <span class="opx-form-field__info" v-if="getInfo()">{{ getInfo() }}</span>
    </div>
</template>

<script>

    import OpxFormAbstractField from "./opx-form-abstract-field";

    export default {
        mixins: [OpxFormAbstractField],

        data() {
            return {
                dropped: false,
            }
        },

        methods: {
            isKeyCurrent(key) {
                const options = this.getOptions();

                if (!options[key]) return false;

                let val = options[key];

                if (!!val['id']) val = val['id'];

                return String(val) === this.getValue();
            },

            getValue() {
                return String(this.value);
            },

            getCurrentValueLabel() {
                const value = this.getValue();

                let options = this.getOptions();
                let id;
                let caption;

                try {
                    options.some((option, key) => {
                        if (typeof option['id'] !== 'undefined' && String(option['id']) === value) {
                            caption = option['caption'];
                            id = option['id'];
                            return true;
                        }
                        return false;
                    });
                } catch (e) {
                    caption = options[value];
                }

                const description = !!id ? '<span class="opx-form-field-select__value-id">[' + id + ']</span>' : '';
                caption = !!caption ? this.$trans(caption) : '';

                return caption + description;
            },

            formatLabel(key) {
                if (key === null) {
                    return '';
                }

                let item = this.getOptions()[key];
                let description = '';


                if (typeof item['id'] !== 'undefined') {
                    description = '<span class="opx-form-field-select__value-id">[' + item['id'] + ']</span>';
                }
                if (typeof item['caption'] !== 'undefined') {
                    item = item['caption'];
                }

                return this.$trans(item) + description;
            },

            setNewValue(key) {
                const options = this.getOptions();

                let value;

                if (typeof options[key] === 'object') {
                    value = options[key]['id']
                } else {
                    value = key;
                }

                this.setValue(value);
                this.dropped = false;
            },

            toggle() {
                if (!this.canEdit()) return;

                this.dropped = !this.dropped;
                if (this.dropped) {
                    this.$nextTick(() => {
                        const el = this.$el.querySelector('.opx-form-field-select__list');
                        el.style.height = null;
                        const height = el.clientHeight + 1;
                        el.style.height = height + 'px';
                        el.parentElement.focus();
                    });
                }
            },

            blur() {
                this.dropped = false;
            },

            clear() {
                this.setValue(null);
            },
        }
    }
</script>