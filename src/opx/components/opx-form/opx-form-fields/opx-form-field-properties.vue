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
        <span class="opx-form-field__info" v-if="getInfo()">{{ getInfo() }}</span>
        <div class="opx-form-field__value">
            <!-- options -->
            <div class="opx-form-field-properties">
                <!-- show all -->
                <div class="opx-form-field-properties__show-all" v-if="!isAllRequired" @click="showAll = !showAll">
                    <span class="opx-form-field-properties__show-all-check"
                          :class="{'opx-form-field-properties__show-all-check-checked': showAll}"
                    ></span>
                    <span class="opx-form-field-properties__show-all-caption">{{ $trans('forms.show_all') }}</span>
                </div>
                <!-- end of show all -->
                <div class="opx-form-field-properties__property" v-for="(property, key) in getOptions()"
                     :key="key"
                     :class="{'opx-form-field-properties__property-required': propertyRequired(key)}"
                >
                    <span class="opx-form-field-properties__property-caption" v-html="propertyCaption(key)"></span>
                    <div class="opx-form-field-properties__property-value">
                        <!-- Value selector here -->
                        <component :is="getPropertyType(key)"
                                   :original="property"
                                   :value="getPropertyValue(key)"
                                   :initial="getPropertyInitial(key)"
                                   @changed="setNewValue"
                        ></component>
                    </div>
                </div>
            </div>
            <!-- end of options -->
        </div>
        <div class="opx-form-field__errors" v-if="!isValid()">
            <span class="opx-form-field__errors-text" v-for="message in getErrors()">{{ message }}</span>
        </div>
    </div>
</template>

<script>

    import OpxFormAbstractField from "./opx-form-abstract-field";
    import Vue from "vue";

    export default {
        mixins: [OpxFormAbstractField],

        data() {
            return {
                showAll: false,
            }
        },

        computed: {
            isAllRequired: function () {
                let options = (this.original['options']) ? this.original['options'] : null;
                if (options === null) return true;

                return !options.some(option => !option['required']);
            }
        },

        methods: {
            getValue() {
                return Array.from(!!this.value ? this.value : []);
            },

            getOptions() {
                let options = (this.original['options']) ? this.original['options'] : {};

                if (!this.showAll) {
                    options = options.filter(option => {
                        if (!!option['required']) {
                            return true;
                        }
                        return this.getValue().some(value => {
                            return (value['id'] === option['id']) && (value['value'] !== null)
                        });
                    });
                }

                return options;
            },

            getOption(key) {
                const options = this.getOptions();
                return !!options[key] ? options[key] : null;
            },

            propertyRequired(key) {
                const option = this.getOption(key);

                return !!option && !!option['required'];
            },

            propertyCaption(key) {
                const options = this.getOptions();
                let caption = options[key]['name'];
                if (options[key]['units']) caption += ', ' + options[key]['units'];
                if (options[key]['alias']) caption += '<span class="opx-form-field-properties__property-caption-hint">[' + options[key]['alias'] + ']</span>';

                return caption;
            },

            removeValue(id) {
                let values = this.getValue();

                let removed = values.some((item, key) => {
                    if (!!item['id'] && (item['id'] === id)) {
                        values.splice(key, 1);
                        return true;
                    }
                    return false;
                });

                if (removed) {
                    this.setValue(values);
                }
            },

            setNewValue(id, value) {
                if (value === null) {
                    this.removeValue(id);
                    return;
                }

                let values = this.getValue();

                let added = values.some((item, key) => {
                    if (!!item['id'] && (item['id'] === id)) {
                        values[key]['value'] = value;
                        return true;
                    }
                    return false;
                });

                if (!added) {
                    values.push({id: id, value: value});
                }

                this.setValue(values);
            },

            getPropertyType(key) {
                const option = this.getOption(key);
                const name = 'opx-form-field-properties-' + (!!option['type'] ? option['type'] : 'simple');
                const component = Vue.component(name);

                return !!component ? component : Vue.component('opx-form-field-properties-simple');
            },

            getPropertyValue(key) {
                const values = this.getValue();
                const option = this.getOption(key);

                let value = null;

                values.some(item => {
                    if (!!item['id'] && (item['id'] === option['id'])) {
                        value = item['value'];
                        return true;
                    }
                    return false;
                });

                return value !== null ? String(value) : null;
            },

            getPropertyInitial(key) {
                const values = !!this.original['value'] ? this.original['value'] : [];
                const option = this.getOption(key);
                let value = null;

                values.some(item => {
                    if (!!item['id'] && (item['id'] === option['id'])) {
                        value = item['value'];
                        return true;
                    }
                    return false;
                });

                return value !== null ? String(value) : null;
            },
        }
    }
</script>