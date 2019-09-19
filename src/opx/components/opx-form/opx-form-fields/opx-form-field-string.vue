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
            <span class="opx-form-field__counter" v-if="is_countable()"
                  :class="{'opx-form-field__counter-invalid': is_counter_valid()}">{{ value_count() }}</span>
        </div>
        <div class="opx-form-field__value">
            <input type="text" class="opx-form-field-text"
                   :class="{
                    'opx-form-field-text__required': isRequired(),
                    'opx-form-field-text__modified': isModified(),
                    'opx-form-field-text__invalid': !isValid(),
                }"
                   v-model="valueModel"
                   :required="isRequired()"
                   :disabled="!canEdit()"
            />
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

        computed: {
            valueModel: {
                get: function () {
                    const val = this.getValue();
                    return String(val === null ? '' : val);
                },
                set: function (value) {
                    this.setValue(String(value));
                },
            },
        },

        methods: {
            get_value_count() {
                return !!this.getValue() ? this.getValue().length : 0;
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
            }

        }
    }
</script>