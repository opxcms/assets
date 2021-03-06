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
            <div class="opx-form-field-image"
                 :class="{
                    'opx-form-field-image__invalid': !isValid(),
                    'opx-form-field-image__modified': isModified(),
                    'opx-form-field-image__required': isRequired()
                 }"
            >
                <!-- list of images -->
                <opx-form-field-image-item v-for="(image, key) in getValue()"
                                           :key="key"
                                           :id="key"
                                           :image="image"
                                           draggable="true"
                                           @ondragstart="dragstart"
                                           @discard="removeValue"
                                           @ondragenter="dragenter"
                                           @ondrop="drop"
                                           @ondragend="dragend"
                ></opx-form-field-image-item>
                <!-- end of list of images -->

                <!-- actions -->
                <div class="opx-form-field__add" v-if="canEdit()"
                     :class="{'opx-form-field__add-dropping': externalDropping}"
                     @dragenter.stop.prevent="externalDragenter"
                     @dragover.stop.prevent="() => {return false;}"
                     @dragleave.stop.prevent="externalDragleave"
                     @drop.stop.prevent="externalDrop"
                >
                    <label class="opx-form-field__add-button" v-if="!externalDropping"
                           :class="{'opx-form-field__add-button-disabled': !canAddImage()}">
                        <opx-icon :icon="'folder-open'"></opx-icon>
                        <input class="opx-form-field__add-button-upload" type="file" accept="image/*" multiple
                               :disabled="!canAddImage()" @change="inputChanged">
                    </label>
                </div>
                <!-- end of actions -->
            </div>
        </div>
        <div class="opx-form-field__errors" v-if="!isValid()">
            <span class="opx-form-field__errors-text" v-for="message in getErrors()">{{ message }}</span>
        </div>
    </div>
</template>

<script>

    import OpxFormAbstractField from "./opx-form-abstract-field";
    import client from "../../../api-client/api-client";
    import Vue from "vue";

    export default {
        mixins: [OpxFormAbstractField],

        data: () => ({
            maxImages: 0,
            currentDragging: null,
            externalDropping: false,
        }),

        created() {
            this.maxImages = this.calcMaxImages();

            if (!this.value) this.setValue([]);
        },

        methods: {
            getValue() {
                return !!this.value ? this.value : [];
            },

            maxImageCount() {
                return this.maxImages;
            },

            imagesCount() {
                return this.getValue().length;
            },

            canAddImage() {
                return this.maxImages === 0 || this.imagesCount() < this.maxImages;
            },

            calcMaxImages() {
                let max = 0;

                if (!this.original['validation']) return max;

                const set = this.original['validation'].split('|');

                if (set.length === 0) return max;

                set.some((rule) => {
                    let attributes = rule.split(':');
                    if (attributes[0] === 'max') {
                        max = !!attributes[1] ? attributes[1] : 0;
                        return true;
                    }
                    return false;
                });

                return Number(max);
            },

            inputChanged(e) {
                this.uploadFiles(e.target.files);

                e.target.value = '';
            },

            uploadFiles(files) {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];

                    if (!file.type.startsWith('image/')) {
                        continue
                    }

                    const reader = new FileReader();
                    let val = this.makeValue(file.name, file.name, '', '');
                    this.pushValue(val);

                    reader.onload = (newVal => {
                        return e => {
                            if (!newVal) return;

                            newVal['file'] = e.target.result;
                            Vue.set(newVal, 'loading', false);
                            Vue.set(newVal, 'uploading', true);
                            this.lock();
                            // do upload here
                            const url = !!this.controllerBase ? this.controllerBase + 'image_upload' : this.saveUrl + '_image';
                            client.post(url, {name: this.getName(), data: newVal}, {
                                onUploadProgress: e => {
                                    if (e.lengthComputable) {
                                        Vue.set(newVal, 'progress', Math.floor(e.loaded / e.total * 100));
                                    } else {
                                        Vue.set(newVal, 'progress', Math.floor((e.loaded % 1000000) / 10000));
                                    }
                                }
                            })
                                .then(response => {
                                    const res = response.data;
                                    Vue.set(newVal, 'src', res.src);
                                    Vue.set(newVal, 'alt', res.alt);
                                    Vue.set(newVal, 'description', res.description);
                                    Vue.delete(newVal, 'file');
                                    Vue.delete(newVal, 'loading');
                                    Vue.delete(newVal, 'uploading');
                                    Vue.delete(newVal, 'progress');
                                    this.unlock();
                                })
                                .catch(error => {
                                    const message = !!error.response.data['message'] ? error.response.data['message'] : null;
                                    Vue.delete(newVal, 'loading');
                                    Vue.delete(newVal, 'uploading');
                                    Vue.delete(newVal, 'progress');

                                    if (message) {
                                        this.$toast.error(this.$trans(message));
                                    }
                                    this.unlock();
                                });
                        }
                    })(val);

                    reader.readAsDataURL(file);
                }
            },

            makeValue(src = '', alt = '', description = '', file = '') {
                return {
                    src: src,
                    alt: alt,
                    description: description,
                    file: file,
                    loading: true,
                }
            },

            pushValue(value) {
                if (!this.canAddImage()) return;

                const val = this.getValue();

                val.push(value);

                this.setValue(val);
            },

            removeValue(key) {
                const val = this.getValue();

                val.splice(key, 1);

                this.setValue(val);
            },
            dragstart(event, key) {
                Vue.set(this, 'currentDragging', key);
                event.dataTransfer.effectAllowed = "move";
            },
            dragenter(event, key) {
                if (this.currentDragging === null) {
                    return true;
                }
                if (key !== this.currentDragging) {
                    this.value.splice(key, 0, this.value.splice(this.currentDragging, 1)[0]);
                    Vue.set(this, 'currentDragging', key);
                }
                event.preventDefault();
            },
            drop(event, key) {
                return true;
            },
            dragend(event, key) {
                Vue.set(this, 'currentDragging', null);
                return true;
            },

            externalDragenter(event) {
                event.preventDefault();
                event.stopPropagation();
                this.externalDropping = true;
                return false;
            },

            externalDragleave(event) {
                event.preventDefault();
                event.stopPropagation();
                this.externalDropping = false;
                return false;
            },

            externalDrop(event) {
                event.preventDefault();
                event.stopPropagation();
                this.externalDropping = false;

                let uri = event.dataTransfer.getData('text/uri-list');

                if (uri !== '') {
                    this.pushValue({
                        src: uri,
                        alt: '',
                        description: '',
                        external: true,
                    });
                } else {
                    this.uploadFiles(event.dataTransfer.files);
                }

                return false;
            },
        }
    }
</script>