<template>
    <div class="opx-form-field-file__file"
         @dragstart="dragstart"
         @dragenter="dragenter"
         @dragover="dragover"
         @drop="drop"
         @dragend="dragend"
    >
        <a :href="getDownloadUrl()" class="opx-form-field-file__file-name">{{ file['name'] }}</a>

        <span class="opx-form-field-file__file-size">{{ getFileSize() }}</span>
        <div class="opx-form-field-file__file-download" v-if="!file['loading']"></div>
        <div class="opx-form-field-file__file-remove" v-if="!file['loading'] && !file['uploading']"
             @click.stop="$emit('discard', id)"></div>
        <div class="opx-progress" v-show="file['uploading']">
            <div class="opx-progress__progress" :style="{width: file['progress'] + '%'}"></div>
        </div>
    </div>
</template>

<script>

    import OpxFormAbstractField from "./opx-form-abstract-field";

    export default {
        mixins: [OpxFormAbstractField],

        props: {
            id: Number,
            file: Object,
        },

        methods: {
            getFileSize() {
                return !!this.file['size'] ? (Math.round(this.file['size'] / 1024 / 1024 * 100) / 100) + 'Mb' : null;
            },

            getDownloadUrl() {
                return this.file['src'] + '?name=' + this.file['name'];
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