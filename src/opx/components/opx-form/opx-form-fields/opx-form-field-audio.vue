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
            <div class="opx-form-field-audio"
                 :class="{
                    'opx-form-field-audio__invalid': !isValid(),
                    'opx-form-field-audio__modified': isModified(),
                    'opx-form-field-audio__required': isRequired()
                 }"
            >
                <!-- list of audios -->
                <opx-form-field-audio-item v-for="(audio, key) in getValue()"
                                           :key="key"
                                           :id="key"
                                           :audio="audio"
                                           :nowPlaying="nowPlaying"
                                           @play="play"
                                           draggable="true"
                                           @ondragstart="dragstart"
                                           @discard="removeValue"
                                           @ondragenter="dragenter"
                                           @ondrop="drop"
                                           @ondragend="dragend"
                ></opx-form-field-audio-item>
                <!-- end of list of audios -->

                <!-- actions -->
                <div class="opx-form-field__add" v-if="canEdit()"
                     :class="{'opx-form-field__add-dropping': externalDropping}"
                     @dragenter.stop.prevent="externalDragenter"
                     @dragover.stop.prevent="() => {return false;}"
                     @dragleave.stop.prevent="externalDragleave"
                     @drop.stop.prevent="externalDrop"
                >
                    <label class="opx-form-field__add-button" v-if="!externalDropping"
                           :class="{'opx-form-field__add-button-disabled': !canAddFile()}">
                        <opx-icon :icon="'folder-open'"></opx-icon>
                        <input class="opx-form-field__add-button-upload" type="file" accept="audio/*" multiple
                               :disabled="!canAddFile()" @change="inputChanged">
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
    import upload from "../../../api-client/upload";

    import Vue from "vue";

    export default {
        mixins: [OpxFormAbstractField],

        data: () => ({
            maxFiles: 0,
            currentDragging: null,
            externalDropping: false,
            nowPlaying: null,
        }),

        created() {
            this.maxFiles = this.calcMaxFiles();

            if (!this.value) this.setValue([]);
        },

        methods: {
            play(id) {
                this.nowPlaying = id;
            },

            getValue() {
                return !!this.value ? this.value : [];
            },

            maxFilesCount() {
                return this.maxFiles;
            },

            filesCount() {
                return this.getValue().length;
            },

            canAddFile() {
                return this.maxFiles === 0 || this.filesCount() < this.maxFiles;
            },

            calcMaxFiles() {
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

                    if (!file.type.startsWith('audio/')) {
                        continue
                    }

                    const reader = new FileReader();
                    let val = this.makeValue(file.name, file.name, '', false, file.size);
                    this.pushValue(val);

                    reader.onload = (newVal => {
                        return event => {
                            if (!newVal) return;

                            newVal['file'] = event.target.result;
                            Vue.set(newVal, 'uploading', true);
                            Vue.set(newVal, 'loading', false);

                            this.lock();

                            upload('manage/assets/temp', file.name, event.target.result, {
                                progress: process => {
                                    Vue.set(newVal, 'progress', process);
                                },
                            })
                                .then(result => {
                                    Vue.set(newVal, 'src', result.src);
                                    Vue.set(newVal, 'external', true);
                                    Vue.delete(newVal, 'file');
                                    Vue.delete(newVal, 'loading');
                                    Vue.delete(newVal, 'uploading');
                                    Vue.delete(newVal, 'progress');
                                    this.unlock();
                                })
                                .catch(error => {
                                    Vue.delete(newVal, 'loading');
                                    Vue.delete(newVal, 'uploading');
                                    Vue.delete(newVal, 'progress');
                                    this.$toast.error(this.$trans(error));
                                    this.unlock();
                                });
                        }
                    })(val);

                    reader.readAsBinaryString(file);
                }
            },

            makeValue(src = '', name = '', file = '', external = false, size = null) {
                return {
                    src: src,
                    name: name,
                    size: size,
                    file: file,
                    loading: true,
                    external: external,
                }
            },

            pushValue(value) {
                if (!this.canAddFile()) return;

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

                // let uri = event.dataTransfer.getData('text/uri-list');

                // if (uri !== '') {
                //     this.pushValue({
                //         src: uri,
                //         name: uri,
                //         external: true,
                //     });
                // } else {
                this.uploadFiles(event.dataTransfer.files);
                // }

                return false;
            },
        }
    }
</script>