<template>
    <div class="opx-form-field-image__image"
         @dragstart="dragstart"
         @dragenter="dragenter"
         @dragover="dragover"
         @drop="drop"
         @dragend="dragend"
    >
        <img class="opx-form-field-image__image-img"
             :src="!!image['file'] ? image['file'] : image['src']"
             :alt="image['alt']"
             draggable="false"
             v-if="!image['loading']"
        />
        <opx-loading v-if="image['loading']"></opx-loading>
        <div class="opx-form-field-image__image-edit" v-if="!image['loading']"></div>
        <div class="opx-form-field-image__image-view" v-if="!image['loading']" @click.stop="imageClick"></div>
        <div class="opx-form-field-image__image-remove" v-if="!image['loading'] && !image['uploading']"
             @click.stop="$emit('discard', id)"></div>
        <span class="opx-form-field-image__image-id">{{ id + 1 }}</span>
        <div class="opx-progress" v-show="image['uploading']">
            <div class="opx-progress__progress" :style="{width: image['progress'] + '%'}"></div>
        </div>
        <div class="opx-overlay" v-if="show">
            <div class="opx-overlay__container opx-overlay__container-full opx-overlay__container-black">
                <div class="opx-overlay__close" @click.stop="closePopup"></div>
                <div class="opx-form-field-image__image-preview">
                    <img :src="!!image['file'] ? image['file'] : image['src']"
                         class="opx-form-field-image__image-preview-img">
                </div>
            </div>
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

        data: () => ({
            show: false,
        }),

        methods: {
            imageClick() {
                this.show = true;
            },

            closePopup() {
                this.show = false;
            },
            dragstart(event) {
                this.$emit('ondragstart', event, this.id);
            },
            dragenter(event) {
                this.$emit('ondragenter', event, this.id);
            },
            dragover(event) {
                event.preventDefault();
                return false;
            },
            drop(event) {
                this.$emit('ondrop', event, this.id);
            },
            dragend(event) {
                this.$emit('ondragend', event, this.id);
            },
        }
    }
</script>