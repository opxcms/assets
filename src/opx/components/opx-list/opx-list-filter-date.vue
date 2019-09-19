<template>
    <div>
        <span class="value" :class="{'disabled': !enabled}" v-on:click="openDatePicker">{{ currentValue }}</span>

        <div class="opx-overlay" v-if="show">
            <div class="opx-overlay__container">
                <opx-datetime-picker
                        :date="date"
                        :pickTime="false"
                        @close="show = false"
                        @done="dateSelected"
                ></opx-datetime-picker>
            </div>
        </div>

    </div>
</template>

<script>
    import OpxListFilterAbstract from "./opx-list-filter-abstract";
    import ParseDate from "../_mixins/parse-dates";
    import {DateTime} from 'luxon';

    export default {
        name: "opx-list-filter-date",
        mixins: [OpxListFilterAbstract, ParseDate],
        data() {
            return {
                show: false,
                date: null,
            }
        },
        computed: {
            currentValue() {
                return !!this.date ? this.date.day + '.' + this.date.month + '.' + this.date.year : '';
            }
        },
        created() {
            const date = this.parseDate(this.value, true);

            this.date = {
                year: date.year,
                month: date.toFormat('MM'),
                day: date.toFormat('dd'),
            };

            this.$emit('update', this.name, this.formatDate(date), this.enabled);
        },
        methods: {
            openDatePicker() {
                this.show = true;
            },

            dateSelected(date) {
                this.show = false;

                const newDate = DateTime.fromObject(date);

                this.date = {
                    year: newDate.year,
                    month: newDate.toFormat('MM'),
                    day: newDate.toFormat('dd'),
                };

                this.$emit('update', this.name, this.formatDate(newDate));
            }
        },
    }
</script>