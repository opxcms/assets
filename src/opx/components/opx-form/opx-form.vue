<template>
    <div class="opx-scroll-page">
        <!-- Header -->
        <div class="opx-scroll-page__header">
            <!-- Title -->
            <h1 class="opx-scroll-page__header-title">{{ $trans(caption) }}</h1>
            <!-- End of title -->

            <!-- Tabs -->
            <div class="opx-tabs">
                <div class="opx-tabs__tabs">
                    <!-- Section tab -->
                    <div class="opx-tabs__tabs-tab" v-for="(section, section_name) in dataset.sections"
                         :key="'tab_' + section_name"
                         :class="{ 'opx-tabs__tabs-tab-active': activeTab === section_name, 'opx-tabs__tabs-tab-modified': dataset.sectionHasModified(section_name) > 0, 'opx-tabs__tabs-tab-has-error' : dataset.sectionHasErrors(section_name) > 0}"
                         @click="activeTab = section_name">
                        <div class="opx-tabs__tabs-tab-title">
                            <span>{{ $trans(section['caption']) }}</span>
                        </div>
                    </div>
                    <!-- End of section tab -->
                </div>
            </div>
            <!-- End of tabs -->

        </div>
        <!-- End of header -->

        <div class="opx-scroll-page__body">
            <opx-scroll-box :containerClass="'opx-scroll-page__body-container'"
                            :scrollableClass="'opx-scroll-page__body-scroller'"
                            :mode="'both'">
                <div class="opx-form">
                    <div class="opx-tabs">
                        <div class="opx-tabs__panels">
                            <!-- Sections -->
                            <div class="opx-tabs__panels-panel" v-for="section in dataset.getSections()"
                                 :key="'panel_' + section"
                                 v-show="activeTab === section || section === null || !isMounted"
                                 :class="{
                                     'opx-tabs__panels-panel': section !== null,
                                     'opx-tabs__panels-static-panel': section === null,
                                     'opx-tabs__body_panel-active': activeTab === section
                                 }"
                            >
                                <!-- Groups -->
                                <div class="opx-form-group" v-for="group in dataset.getGroups(section)"
                                     :key="'group_' + group + '_of_' + section"
                                >
                                    <span class="opx-form-group__title" v-if="group !== null">{{ $trans(dataset.groups[group]['caption']) }}</span>
                                    <!-- Fields -->
                                    <component v-for="field in dataset.getFields(section, group)"
                                               :key="section + '/' + group + '/' + field"
                                               :id="id"
                                               :is="dataset.getFieldComponent(field)"
                                               :original="dataset.fields[field]"
                                               :value="dataset.values[field]"
                                               :valid="dataset.valid[field]"
                                               :modified="dataset.isFieldModified(field)"
                                               :errors="dataset.validation_errors[field]"
                                               :saveUrl="saveUrl"
                                               :globalLock="reloading"
                                               :hints="hints"
                                               @lock="updateLock"
                                               @update="dataset.set"
                                               @call-reload="reloadForm"
                                    ></component>
                                    <!-- End of fields -->
                                </div>
                                <!-- End of groups -->
                            </div>
                            <!-- End of sections -->
                        </div>
                    </div>
                </div>
            </opx-scroll-box>
        </div>
        <!-- Buttons -->
        <div class="opx-scroll-page__footer">
            <div class="opx-progress" v-show="uploading">
                <div class="opx-progress__progress" :style="{width: uploaded/total*100 + '%'}"></div>
            </div>
            <span class="button"
                  :class="{'error': dataset.hasErrors(), 'success': !dataset.hasErrors(), 'disabled': locks > 0}"
                  v-if="saveUrl !== null"
                  @click="save()"
            >{{ $trans('actions.save') }}</span>
            <span class="button" @click="close" :class="{'disabled': locks > 0}">{{ $trans('actions.close') }}</span>
            <span class="button info"
                  :class="{'disabled': locks > 0}"
                  @click="reset"
            >{{ $trans('actions.reset') }}</span>
        </div>
        <!-- End of buttons -->
    </div>
</template>

<script>
    import Vue from "vue";
    import OpxLoadableComponent from "../opx-component-loader/opx-loadable-component";

    import client from "../../api-client/api-client";
    import FormData from "./form-data";

    export default {
        name: 'opx-form',
        mixins: [OpxLoadableComponent],

        data: () => {
            return {
                isMounted: false,
                id: 0,
                activeTab: '',
                dataset: null,
                caption: '',
                saveUrl: '',
                uploading: false,
                uploaded: 0,
                total: 0,
                locks: 0,
                reloading: false,
                hints: true,
            }
        },

        created() {
            this.id = String(this.original['id']);
            this.caption = this.original['caption'];
            this.saveUrl = this.original['save'];
            this.hints = !!this.original['hints'];

            Vue.set(this, 'dataset', new FormData(this.original['form']));

            let sections = Object.keys(this.dataset.sections);
            this.activeTab = sections.length > 0 ? sections[0] : null;
        },

        mounted() {
            this.isMounted = true;
        },

        methods: {
            save(reload = false, initiatedBy = null) {
                if (!reload && (this.dataset.hasErrors() || !this.saveUrl || this.locks > 0)) {
                    return;
                }

                let data = {
                    id: this.id,
                };

                let oldValues = null;

                Object.keys(this.dataset.fields).map(field => {
                    if (this.dataset.fields[field]['can_edit'] === true) {
                        data[field] = this.dataset.values[field];
                    }
                });

                if (reload) {
                    data['__reload'] = true;
                    data['__initiator'] = initiatedBy;
                    this.reloading = true;
                    oldValues = data;
                }

                this.locks += 1;

                client.post(this.saveUrl, data, {
                    timeout: 0,
                    onUploadProgress: e => {
                        this.progress(e)
                    }
                })
                    .then(response => {
                        this.uploading = false;
                        this.saved(response, reload, oldValues);
                    })
                    .catch(error => {
                        this.uploading = false;
                        this.saveFailed(error);
                    });
            },

            progress(e) {
                this.uploading = true;
                if (e.lengthComputable) {
                    this.uploaded = e.loaded;
                    this.total = e.total;
                } else {
                    this.uploaded = e.loaded % 1000000;
                    this.total = 1000000;
                }
            },

            saved(response, reload, oldValues = null) {
                this.locks -= 1;
                Vue.set(this, 'dataset', new FormData(response.data['data']['form']));

                if (oldValues !== null) {
                    Object.keys(this.dataset.values).map(key => {
                        if (typeof oldValues[key] !== 'undefined') {
                            this.dataset.set(key, oldValues[key]);
                        }
                    });
                }

                if (!reload) {
                    this.id = String(response.data['data']['id']);
                    this.caption = response.data['data']['caption'];
                    this.saveUrl = response.data['data']['save'];
                    const redirect = !!response.data['redirect'] ? response.data['redirect'] : null;
                    if (redirect) {
                        this.$router.replace({path: redirect});
                    }
                    this.$toast.success(this.$trans('messages.save_success'), 5000);
                }
                this.reloading = false;
            },

            saveFailed(error) {
                this.locks -= 1;
                const errors = !!error.response.data['errors'] ? error.response.data['errors'] : null;
                if (errors) {
                    Object.keys(errors).map(field => {
                        this.dataset.valid[field] = false;
                        this.dataset.validation_errors[field] = errors[field];
                    });
                }

                const message = !!error.response.data['message'] ? error.response.data['message'] : null;

                if (message) {
                    this.$toast.error(this.$trans(message));
                }
                this.reloading = false;
            },

            reset() {
                if (this.locks === 0) {
                    const needsReload = this.dataset.reset();
                    if (needsReload) {
                        this.reloadForm();
                    }
                }
            },

            close() {
                if (this.locks === 0) {
                    this.$router.back();
                }
            },

            updateLock(state) {
                this.locks = this.locks + (state ? 1 : -1);
            },

            reloadForm(initiatedBy = null) {
                this.save(true, initiatedBy);
            }
        },
    }
</script>