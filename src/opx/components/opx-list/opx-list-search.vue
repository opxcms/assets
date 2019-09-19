<template>
    <div class="opx-toolbar__item">
        <div class="opx-toolbar__item-button" v-on:click="showPopup">
            <opx-icon :icon="'search'"></opx-icon>
        </div>
        <div class="opx-overlay" v-if="show">
            <div class="opx-overlay__container">
                <div class="opx-overlay__close" @click="closePopup"></div>
                <!-- subject -->
                <label>{{ $trans('actions.search') }}:<input class="opx-toolbar__item-popup-input"
                                                             v-model="subject"></label>
                <!-- End of subject -->

                <!-- search fields -->
                <div class="opx-toolbar__item-popup-line" v-for="(field, name) in original" :key="name">
                <span class="opx-toolbar__item-popup-line-button"
                      @click="toggle(name)"
                      :class="{'active': fields.indexOf(name) !== -1}"
                >
                    <opx-icon :icon="fields.indexOf(name) !== -1 ? 'switch-on' : 'switch-off'"></opx-icon>
                </span>
                    <span class="opx-toolbar__item-popup-line-text">{{ $trans(field['caption']) }}</span>
                </div>
                <!-- End of search fields -->

                <!-- buttons -->
                <div>
                    <span class="button success" @click="apply">{{ $trans('actions.search') }}</span>
                    <span class="button" @click="reset">{{ $trans('actions.reset') }}</span>
                </div>
                <!-- End of buttons -->
            </div>
        </div>


    </div>
</template>

<script>
    import Vue from "vue";

    export default {
        name: "opx-list-search",
        props: {
            original: Object,
            values: {
                type: Object,
                default: () => {
                    return {}
                },
            },
        },
        data() {
            return {
                show: false,
                subject: '',
                fields: [],
            }
        },
        methods: {
            showPopup() {
                this.subject = !!this.values.subject ? this.values.subject : '';

                if (!!this.values.fields) {
                    this.fields = this.values.fields.split(',');
                } else {
                    Object.keys(this.original).map(field => {
                        if (this.original[field].default === true) {
                            this.fields.push(field);
                        }
                    });
                }

                this.show = true;
            },

            closePopup() {
                this.show = false;
            },

            apply() {
                this.show = false;

                let search = {};

                if (this.subject !== '' || this.fields.length > 0) {
                    search['subject'] = this.subject;
                    search['fields'] = this.fields.join();
                }

                this.$emit('update', 'search', search);
            },

            reset() {
                this.subject = '';

                this.apply();
            },

            toggle(name) {
                let ind = this.fields.indexOf(name);
                if (ind === -1) {
                    this.fields.push(name);
                } else {
                    this.fields.splice(ind, 1);
                }
            },
        }
    }
</script>