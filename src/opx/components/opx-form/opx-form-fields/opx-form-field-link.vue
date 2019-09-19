<template>
    <div v-if="canView()" class="opx-form-field">
        <div class="opx-form-field__caption">
            <span>{{ getCaption() }}</span>
            <span class="opx-form-field__caption-hint" v-if="hints">[{{ getName() }}]</span>
        </div>
        <div class="opx-form-field__value">
            <a class="opx-form-field-text" :href="getValue()" :target="!!getOptions()['target'] ? getOptions()['target'] : null">{{ getValue() }}</a>
        </div>
        <span class="opx-form-field__info" v-if="getInfo()">{{ getInfo() }}</span>
    </div>
</template>

<script>

    import OpxFormAbstractField from "./opx-form-abstract-field";

    export default {
        mixins: [OpxFormAbstractField],

    }
</script>