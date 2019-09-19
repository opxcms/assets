<template>
    <div v-if="canView()" class="opx-form-field" :class="componentClass">
        <div class="opx-form-field__caption">
            <span>{{ getCaption() }}</span>
            <span class="opx-form-field__caption-hint" v-if="hints">[{{ getName() }}]</span>
        </div>
        <span class="opx-form-field__info" v-if="getInfo()">{{ getInfo() }}</span>
        <div class="opx-form-field__value">

            <div class="opx-form-field-related">
                <!-- List of related with properties -->
                <div class="opx-form-field-related__item" v-for="(item, key) in getValue()"
                     :key="key"
                >
                <span class="opx-form-field-related__item-remove" v-if="!!original['can_remove_related']"
                      @click="removeItem(item['id'])"></span>
                    <span class="opx-form-field-related__item-caption" v-html="itemCaption(item['id'])"></span>
                    <div class="opx-form-field-related__item-value">
                        <!-- Value selector -->
                        <component v-if="!!componentType" :is="componentType"
                                   :id="item['id']"
                                   :value="!!item['value'] ? String(item['value']) : null"
                                   :initial="getItemInitialValue(item['id'])"
                                   @changed="setItemValue"
                        ></component>
                        <!-- End of value selector -->
                    </div>
                </div>
                <!-- End of list of related with properties -->

                <!-- Add button -->
                <div class="opx-form-field-related__actions" v-if="canAddRelated">
                    <opx-button :class="'success'" :caption="$trans('actions.add')" @click="showList"></opx-button>
                    <!-- List overlay -->
                    <div class="opx-overlay" v-if="isListShown">
                        <div class="opx-overlay__container opx-overlay__container-full">
                            <opx-select-list
                                    :loaderUrl="loaderUrl"
                                    :selected="getSelectedIds()"
                                    :disabled="getDisablesIds()"
                                    :current="currentId"
                                    @selected="itemsSelected"
                            >
                                <opx-button :class="'success'" :caption="$trans('actions.add')"
                                            @click="addItems"></opx-button>
                                <opx-button :caption="$trans('actions.close')" @click="closeList"></opx-button>
                            </opx-select-list>
                        </div>
                    </div>
                    <!-- End of list overlay -->
                </div>
                <!-- End of add button -->
            </div>
        </div>
        <div class="opx-form-field__errors" v-if="!isValid()">
            <span class="opx-form-field__errors-text" v-for="message in getErrors()">{{ message }}</span>
        </div>
    </div>
</template>

<script>
    import client from "../../../api-client/api-client";
    import Vue from "vue";
    import OpxFormAbstractField from "./opx-form-abstract-field";

    export default {
        mixins: [OpxFormAbstractField],

        data() {
            return {
                isListShown: false,
                selectedTemp: [],
                captions: {},
            }
        },

        computed: {
            componentClass: function () {
                return {
                    'opx-form-field__invalid': !this.isValid(),
                    'opx-form-field__modified': this.isModified(),
                    'opx-form-field__required': this.isRequired()
                }
            },

            canAddRelated: function () {
                return !!this.original['can_add_related'];
            },

            loaderUrl: function () {
                return !!this.original['list_loader_url'] ? this.original['list_loader_url'] : null;
            },

            componentType: function () {
                if (!!this.original['value_type'] && this.original['value_type'] !== 'none') {
                    return 'opx-form-field-related-' + this.original['value_type'];
                }
                return null;
            },

            currentId: function () {
                return !!this.original['safe_id'] ? this.id : null;
            }
        },

        created() {
            const values = this.getValue();

            if (!values) return;

            let ids = [];

            values.map(item => {
                ids.push(item['id']);
            });

            this.loadCaptions(ids);
        },

        methods: {
            getValue() {
                if (!this.value) {
                    return [];
                }
                return Array.from(this.value);
            },

            itemCaption(id) {
                if (!!this.captions[id]) {
                    let caption = this.captions[id]['caption'];
                    if (!!this.captions[id]['description']) {
                        caption += '<span class="opx-form-field-related__item-caption-hint">[' + this.captions[id]['description'] + ']</span>'
                    }
                    return caption;
                } else {
                    return id + ' [loading...]';
                }
            },

            showList() {
                this.selectedTemp = [];
                this.isListShown = true;
            },

            closeList() {
                this.selectedTemp = [];
                this.isListShown = false;
            },

            itemsSelected(ids, add) {
                ids.map(id => {
                    const ind = this.selectedTemp.indexOf(id);

                    if (add && ind === -1) {
                        this.selectedTemp.push(id);
                    } else if (!add && ind !== -1) {
                        this.selectedTemp.splice(ind, 1);
                    }
                });
            },

            addItems() {
                const ids = this.selectedTemp;
                this.isListShown = false;
                if (!ids) return;

                this.loadCaptions(ids);

                let value = this.getValue();

                ids.map(id => {
                    if (!value.some(item => item['id'] === id)) {
                        value.push({'id': id});
                    }
                });

                this.setValue(value);
            },

            loadCaptions(ids) {
                const fetchUrl = !!this.original['fetch_details_url'] ? this.original['fetch_details_url'] : null;
                if (!fetchUrl) return;

                client.post(fetchUrl, ids)
                    .then(response => {
                        const data = response.data;
                        if (!!data) {
                            data.map(item => {
                                let content = {
                                    'caption': item['caption'],
                                    'description': !!item['description'] ? item['description'] : null,
                                };
                                Vue.set(this.captions, String(item['id']), content);
                            });
                        }
                    })
                    .catch(error => {
                        const message = error.message + ':<br>' + error.response.data.message;
                        this.$toast.error(message, 0);
                    });
            },

            removeItem(id) {
                let value = this.getValue();

                this.setValue(value.filter(item => item['id'] !== id));
            },

            getItemInitialValue(id) {
                const original = !!this.original['value'] ? this.original['value'] : null;

                if (original === null) return null;

                let value = null;

                original.some(item => {
                    if (item['id'] === id) {
                        value = !!item['value'] ? item['value'] : null;
                        return true;
                    }
                    return false;
                });

                return !!value ? String(value) : null;
            },

            setItemValue(id, value) {
                let current = this.getValue();

                current.some((item, key) => {
                    if (item['id'] === id) {
                        current[key]['value'] = value;
                        return true;
                    }
                    return false;
                });

                this.setValue(current);
            },

            getDisablesIds() {
                let selected = [];
                const value = this.getValue();

                if (!value) return null;

                value.map(item => {
                    selected.push(item['id'])
                });

                return selected;
            },

            getSelectedIds() {
                return this.selectedTemp.concat(this.getDisablesIds());
            }
        },
    }
</script>