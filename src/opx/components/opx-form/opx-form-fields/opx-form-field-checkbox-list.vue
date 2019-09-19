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
            <span class="opx-form-field-checkbox opx-form-field-checkbox__in-list" v-for="check in getOptions()"
                  :class="{
                            'opx-form-field-checkbox__checked': getCheckValue(check['id']),
                            'opx-form-field-checkbox__modified': isCheckModified(check['id']),
                            'opx-form-field-checkbox__disabled': isCheckDisabled(check['id'])
                          }"
                  @click="setCheckValue(check['id'])"
            >
                <span class="opx-form-field-checkbox__check"></span>
                <span class="opx-form-field-checkbox__label">{{ $trans(check['caption']) }}</span>
                <span class="opx-form-field__caption-hint" v-if="hints">[{{ check['id'] }}]</span>
            </span>
        </div>
        <div class="opx-form-field__errors" v-if="!isValid()">
            <span class="opx-form-field__errors-text" v-for="message in getErrors()">{{ message }}</span>
        </div>
    </div>
</template>

<script>

    import OpxFormAbstractField from "./opx-form-abstract-field";

    export default {
        mixins: [OpxFormAbstractField],

        methods: {
            getValue() {
                let value = !!this.value ? this.value : [];
                return Array.from(value);
            },

            getCheckValue(id) {
                const value = this.getValue();
                if (!!this.original['checked'] && this.original['checked'].indexOf(id) !== -1) {
                    return true;
                }
                return value.indexOf(id) !== -1;
            },

            setCheckValue(id) {
                if (this.isCheckDisabled(id)) return;

                let value = this.getValue();

                const ind = value.indexOf(id);
                if (ind === -1) {
                    value.push(id);
                } else {
                    value.splice(ind, 1);
                }
                this.setValue(value);
            },

            isCheckModified(id) {
                const current = this.getCheckValue(id);
                const original = !!this.original['value'] && this.original['value'].indexOf(id) !== -1;
                return current !== original;
            },

            isCheckDisabled(id) {
                return !!this.original['disabled'] && this.original['disabled'].indexOf(id) !== -1
            }
        }
    }
</script>