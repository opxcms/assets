<template>
    <div class="opx-form-field-image__image" @click="imageClick">
        <img class="opx-form-field-image__image-img"
             :src="!!image['file'] ? image['file'] : image['src']"
             :alt="image['alt']"
             v-if="!image['loading']"
        />
        <opx-loading v-if="image['loading']"></opx-loading>
        <div class="opx-form-field-image__image-edit" v-if="!image['loading']"></div>
        <div class="opx-form-field-image__image-remove" v-if="!image['loading'] && !image['uploading']"
             @click.stop="$emit('discard', id)"></div>
        <span class="opx-form-field-image__image-id">{{ id + 1 }}</span>
        <div class="opx-progress" v-show="image['uploading']">
            <div class="opx-progress__progress" :style="{width: image['progress'] + '%'}"></div>
        </div>
    </div>
</template>

<script>

    import OpxFormAbstractField from "./opx-form-abstract-field";

    export default {
        mixins: [OpxFormAbstractField],

        props: {
            id: Number,
            image: Object,
        },

        methods: {
            imageClick() {
                alert('image click');
            },
        }
    }
</script>