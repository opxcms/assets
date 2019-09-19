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
                <!-- current selected -->
                <div class="opx-form-field-select__value" @click="toggle">
                    <span v-html="getCurrentValueLabel()"></span>
                    <div class="opx-form-field-select__value-actions">
                        <opx-icon :icon="'arrow-bottom'" :class="{'expanded': dropped}"></opx-icon>
                        <span class="opx-form-field-select__value-clear" v-if="(value !== null)&&(value !== '')"
                              @click.stop="clear"></span>
                    </div>
                </div>
                <!-- end of current selected -->

                <div class="opx-form-field-select__list" v-if="dropped">
                    <opx-scroll-box :mode="'vertical'">
                        <!-- no parent item -->
                        <span class="opx-form-field-select__list-value"
                              :class="{'opx-form-field-select__list-value-active': getValue() === 0}"
                              v-if="!original['without_no_parent']"
                              @click="setNewValue(0)"
                        >{{ $trans('forms.no_parent') }}</span>
                        <!-- end of no parent item -->
                        <div class="opx-form-field-select__list-container">
                            <opx-form-field-nested-select-item
                                    v-for="item in getOptions().filter(itm => itm['parent_id'] === 0)"
                                    :key="item['id']"
                                    :item="item"
                                    :options="getOptions()"
                                    :selected_id="getValue()"
                                    :id="id"
                                    :level="0"
                                    :safe="!!original['safe_id']"
                                    :disabled="false"
                                    @selected="setNewValue"
                                    @update-height="reCalcHeight"
                            ></opx-form-field-nested-select-item>
                        </div>
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

            getCurrentValueLabel() {
                const value = this.getValue();

                if (value === null || value === '') {
                    return '';
                }

                if (String(value) === "0") {
                    return this.$trans('forms.no_parent');
                }

                const item = this.getOptions().filter(itm => String(itm['id']) === String(value))[0];

                if (!item) return '';

                return this.$trans(item['caption']) + '<span class="opx-form-field-select__value-id">[' + item['id'] + ']</span>';
            },

            setNewValue(value) {
                this.setValue(value);
                this.dropped = false;
            },

            toggle() {
                if (!this.canEdit()) return;

                this.dropped = !this.dropped;
                if (this.dropped) {
                    this.$nextTick(() => {
                        this.makeHeight();
                        const el = this.$el.querySelector('.opx-form-field-select__list');
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

            reCalcHeight() {
                this.$nextTick(() => {
                    this.makeHeight();
                });
            },

            makeHeight() {
                const el = this.$el.querySelector('.opx-form-field-select__list');
                el.style.height = 'auto';
                const height = el.clientHeight + 1;
                el.style.height = height + 'px';
            },
        }
    }
</script>