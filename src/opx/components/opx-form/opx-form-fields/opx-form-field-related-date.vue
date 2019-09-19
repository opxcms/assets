<template>
    <div class="opx-form-field-related__entry">
        <div class="opx-form-field-datetime"
             :class="{
                    'opx-form-field-datetime__modified': isModified(),
                 }"
             @click="showPicker"
        >
            <span class="opx-form-field-datetime__value">{{ getFormattedValue() }}</span>
            <opx-icon :icon="'calendar'"></opx-icon>
            <span class="opx-form-field-datetime__clear" v-if="value !== null" @click.stop="clear"></span>
        </div>
        <div class="opx-overlay" v-if="show">
            <div class="opx-overlay__container">
                <opx-datetime-picker
                        :date="date"
                        :pickDate="true"
                        :pickTime="true"
                        :pickSeconds="false"
                        @done="dateSelected"
                        @close="show = false"
                ></opx-datetime-picker>
            </div>
        </div>
    </div>
</template>

<script>
    import ParseDates from "../../_mixins/parse-dates";

    import {DateTime} from 'luxon';

    export default {
        name: "opx-form-field-related-date",

        mixins: [ParseDates],

        props: {
            id: [String, Number],
            value: {
                type: String,
                default: '',
            },
            initial: {
                type: String,
                default: '',
            },
        },

        data() {
            return {
                format: 'dd MMMM yyyy, HH:mm:ss (ZZZZZ)',
                show: false,
                date: null,
            }
        },

        methods: {
            clear() {
                this.$emit('changed', this.id, null);
            },

            isModified() {
                return this.initial !== this.value;
            },

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

                this.$emit('changed', this.id, this.formatDate(newDate));
            },
        },
    }
</script>