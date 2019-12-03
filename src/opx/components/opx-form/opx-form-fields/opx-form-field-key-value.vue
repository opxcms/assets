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
            <!-- Elements here -->
            <div class="opx-form-field-key-value">
                <div class="opx-form-field-key-value__entry" v-if="!!getOptions()['key'] && !!getOptions()['value']">
                    <span class="opx-form-field-key-value__entry-key">{{ $trans(getOptions()['key']) }}</span>
                    <span class="opx-form-field-key-value__entry-value">{{ $trans(getOptions()['value']) }}</span>
                </div>
                <div class="opx-form-field-key-value__entry" v-for="(val, index) in this.getValue()"
                     :key="index"
                >
                    <input class="opx-form-field-key-value__entry-key" v-model="val.key">
                    <input class="opx-form-field-key-value__entry-value" v-model="val.value">
                    <span class="opx-form-field-key-value__entry-remove" @click="removeKey(index)"></span>
                </div>
                <div class="opx-form-field-key-value__actions">
                    <opx-button :class="'success'" :caption="'actions.add'" @click="addKey"></opx-button>
                </div>
            </div>
        </div>
        <div class="opx-form-field__errors" v-if="!isValid()">
            <span class="opx-form-field__errors-text" v-for="message in getErrors()">{{ message }}</span>
        </div>
    </div>
</template>

<script>
    import OpxFormAbstractField from "./opx-form-abstract-field";

    export default {
        name: "opx-form-field-key-value",

        mixins: [OpxFormAbstractField],

        methods: {
            addKey() {
                this.getValue().push({key: '', value: ''});
            },

            removeKey(key) {
                this.getValue().splice(key, 1);
            },
        },
    }
</script>