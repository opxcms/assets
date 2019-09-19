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
            <opx-mask-input
                    class="opx-form-field-text"
                    :class="{
                        'opx-form-field-text__required': isRequired(),
                        'opx-form-field-text__modified': isModified(),
                        'opx-form-field-text__invalid': !isValid(),
                    }"
                    :required="isRequired()"
                    :disabled="!canEdit()"
                    :value="value"
                    :mask="getMask()"
                    :placeholderChar="'_'"
                    :type="getInputType()"
                    @inputted="setNewValue"
            ></opx-mask-input>
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
        methods:
            {
                getMask() {
                    return !!this.original['mask'] ? this.original['mask'] : null;
                },

                getInputType() {
                    return !!this.original['input-type'] ? this.original['input-type'] : 'text';
                },

                setNewValue(value) {
                    if(value !== this.value) {
                        this.setValue(value);
                    }
                },
            },
    }
</script>