<template>
    <div v-if="canView()" class="opx-form-field"
         :class="{
            'opx-form-field__invalid': !isValid(),
            'opx-form-field__modified': isModified(),
            'opx-form-field__required': isRequired()
         }"
    >
        <div class="opx-form-field__value">
            <span class="opx-form-field-checkbox"
                  :class="{
                            'opx-form-field-checkbox__checked': valueModel,
                            'opx-form-field-checkbox__disabled': !canEdit(),
                            'opx-form-field-checkbox__invalid': !isValid(),
                            'opx-form-field-checkbox__modified': isModified(),
                            'opx-form-field-checkbox__required': isRequired()
                          }"
                  @click="valueModel = !valueModel"
            >
                <span class="opx-form-field-checkbox__check"></span>
                <span class="opx-form-field-checkbox__label">{{ getCaption() }}</span>
            </span>
            <span class="opx-form-field__caption-hint" v-if="hints">[{{ getName() }}]</span>
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
                    return (val === true) || (val === 'true') || (val === 1) || (val === '1');
                },
                set: function (value) {
                    if (this.canEdit()) {
                        this.setValue(Boolean(value));
                    }
                },
            },
        },
    }
</script>