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

                <!-- groups -->
                <div class="opx-form-field-properties__group" v-for="(group, groupKey) in optionsGroups" :key="groupKey">
                    <span class="opx-form-field-properties__group-caption" v-if="!!group">{{ group }}</span>
                    <!-- properties -->
                    <div class="opx-form-field-properties__property" v-for="(property, key) in getOptions(group)"
                         :key="key"
                         :class="{'opx-form-field-properties__property-required': propertyRequired(property['id'])}"
                    >
                        <span class="opx-form-field-properties__property-caption" v-html="propertyCaption(property['id'])"></span>
                        <div class="opx-form-field-properties__property-value">
                            <!-- Value selector here -->
                            <component :is="getPropertyType(property['id'])"
                                       :original="property"
                                       :value="getPropertyValue(property['id'])"
                                       :initial="getPropertyInitial(property['id'])"
                                       @changed="setNewValue"
                            ></component>
                        </div>
                    </div>
                    <!-- end of properties -->
                </div>
                <!-- end of groups -->

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
            },

            optionsGroups: function () {
                let options = (this.original['options']) ? this.original['options'] : {};
                let groups = [];
                options.map(option => {
                    let optionGroup = !!option['group'] ? option['group'] : null;
                    if (groups.indexOf(optionGroup) === -1) {
                        groups.push(optionGroup);
                    }
                });

                return groups;
            },

        },

        methods: {
            getValue() {
                return Array.from(!!this.value ? this.value : []);
            },


            getOptions(group = null) {
                let options = (!!this.original['options']) ? this.original['options'] : {};

                options = options.filter(option => {
                    return (!!option['group'] && (option['group'] === group)) || (group === null && !option['group']);
                });

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

            getOption(id) {
                let options = (!!this.original['options']) ? this.original['options'] : {};
                options = options.filter(option => option['id'] === id);
                options = options.length > 0 ? options[0] : null;
                return !!options ? options : null;
            },

            propertyRequired(id) {
                const option = this.getOption(id);

                return !!option && !!option['required'];
            },

            propertyCaption(id) {
                const option = this.getOption(id);
                let caption = this.$trans(option['name']);
                if (option['units']) caption += ', ' + option['units'];
                if (option['alias']) caption += '<span class="opx-form-field-properties__property-caption-hint">[' + option['alias'] + ']</span>';

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

            getPropertyType(id) {
                const option = this.getOption(id);
                const name = 'opx-form-field-properties-' + (!!option['type'] ? option['type'] : 'simple');
                const component = Vue.component(name);

                return !!component ? component : Vue.component('opx-form-field-properties-simple');
            },

            getPropertyValue(id) {
                const values = this.getValue();
                const option = this.getOption(id);

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

            getPropertyInitial(id) {
                const values = !!this.original['value'] ? this.original['value'] : [];
                const option = this.getOption(id);
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