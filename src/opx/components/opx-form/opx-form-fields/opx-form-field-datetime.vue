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
        <div class="opx-form-field__value">
            <div class="opx-form-field-datetime"
                 :class="{
                    'opx-form-field-datetime__required': isRequired(),
                    'opx-form-field-datetime__modified': isModified(),
                    'opx-form-field-datetime__invalid': !isValid(),
                    'opx-form-field-datetime__disabled': !canEdit(),
                 }"
                 @click="showPicker"
            >
                <div class="opx-form-field-datetime__value">
                    <span class="opx-form-field-datetime__value-date">{{ getFormattedValue() }}</span>
                    <div class="opx-form-field-datetime__value-actions">
                        <opx-icon :icon="'calendar'" v-if="canEdit()"></opx-icon>
                        <span class="opx-form-field-datetime__value-clear" v-if="value !== null && canEdit()"
                              @click.stop="clear"></span>
                    </div>
                </div>
            </div>
            <div class="opx-overlay" v-if="show">
                <div class="opx-overlay__container">
                    <opx-datetime-picker
                            :date="date"
                            :pickDate="true"
                            :pickTime="true"
                            :pickSeconds="false"
                            :minutesStep="minutesStep"
                            @done="dateSelected"
                            @close="show = false"
                    ></opx-datetime-picker>
                </div>
            </div>
        </div>
        <div class="opx-form-field__errors" v-if="!isValid()">
            <span class="opx-form-field__errors-text" v-for="message in getErrors()">{{ message }}</span>
        </div>
        <span class="opx-form-field__info" v-if="getInfo()">{{ getInfo() }}</span>
    </div>
</template>

<script>

    import OpxFormAbstractField from "./opx-form-abstract-field";
    import ParseDates from "../../_mixins/parse-dates";

    import {DateTime} from 'luxon';

    export default {
        mixins: [OpxFormAbstractField, ParseDates],

        data() {
            return {
                format: 'dd MMMM yyyy, HH:mm:ss (ZZZZZ)',
                show: false,
                date: null,
                minutesStep: 5,
            }
        },

        methods: {
            /**
             * @returns {null|DateTime}
             */
            getValue() {
                return this.parseDate(this.value);
            },

            getFormattedValue() {
                const value = this.getValue();

                return value === null ? '' : value.toFormat(this.format);
            },

            showPicker() {
                if (!this.canEdit()) return;

                if (!!this.original['minute_step']) {
                    this.minutesStep = this.original['minute_step'];
                }

                const date = this.getValue();

                if (date !== null) {
                    this.date = {
                        year: date.year,
                        month: date.month,
                        day: date.day,
                        hour: date.hour,
                        minute: date.minute,
                        second: date.second,
                    };
                } else {
                    this.date = null;
                }

                this.show = true;
            },

            dateSelected(date) {
                this.show = false;

                let newDate = DateTime.fromObject(date);

                this.setValue(this.formatDate(newDate));
            },

            clear() {
                this.setValue(null);
            }
        }
    }
</script>