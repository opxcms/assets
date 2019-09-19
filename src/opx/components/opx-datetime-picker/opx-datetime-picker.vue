<template>
    <div class="opx-dt-picker">
        <div class="opx-dt-picker__header">
            <span class="opx-dt-picker__header-current" @click="updateSelected(current)">{{ headerCurrent }}</span>
            <div class="opx-dt-picker__header-select">
                <span v-if="pickDate">
                    <span class="opx-dt-picker__select"
                          :class="{'opx-dt-picker__select-active': mode==='date'}"
                          @click="mode = 'date'"
                    >{{ selected.date }}</span>
                    <span class="opx-dt-picker__select-spacer"> </span>
                    <span class="opx-dt-picker__select"
                          :class="{'opx-dt-picker__select-active': mode==='month'}"
                          @click="mode = 'month'"
                    >{{ monthToLocale2(selected.month) }}</span>
                    <span class="opx-dt-picker__select-spacer"> </span>
                    <span class="opx-dt-picker__select"
                          :class="{'opx-dt-picker__select-active': mode==='year'}"
                          @click="mode = 'year'"
                    >{{ selected.year }}</span>
                </span>
                <span v-if="pickDate && pickTime" class="opx-dt-picker__select-spacer">, </span>
                <span v-if="pickTime">
                    <span class="opx-dt-picker__select"
                          :class="{'opx-dt-picker__select-active': mode==='hour'}"
                          @click="mode = 'hour'"
                    >{{ String(selected.hour).padStart(2, '0') }}</span>
                    <span class="opx-dt-picker__select-spacer">:</span>
                    <span class="opx-dt-picker__select"
                          :class="{'opx-dt-picker__select-active': mode==='minute'}"
                          @click="mode = 'minute'"
                    >{{ String(selected.minute).padStart(2, '0') }}</span>
                    <span class="opx-dt-picker__select-spacer" v-if="pickSeconds">:</span>
                    <span class="opx-dt-picker__select"
                          v-if="pickSeconds"
                          :class="{'opx-dt-picker__select-active': mode==='second'}"
                          @click="mode = 'second'"
                    >{{ String(selected.second).padStart(2, '0') }}</span>
                </span>
            </div>
        </div>
        <div class="opx-dt-picker__controls">
            <span class="opx-dt-picker__controls-display" v-show="mode !== 'done'">{{ currentDisplay() }}</span>
            <span class="opx-dt-picker__controls-next"
                  :class="{'opx-dt-picker__controls-next-disabled': mode === 'hour' && pickDate === false || mode === 'done'}"
                  v-on:click="clickNavigation(1)"></span>
            <span class="opx-dt-picker__controls-previous"
                  :class="{'opx-dt-picker__controls-previous-disabled': mode === 'hour' && pickDate === false || mode === 'done'}"
                  v-on:click="clickNavigation(-1)"></span>
        </div>
        <div class="opx-dt-picker__calendar" :class="['opx-dt-picker__calendar-'+mode]" v-show="mode !== 'done'">
            <span v-for="(item, key) in getCalendar()"
                  class="opx-dt-picker__calendar-item"
                  :key="key"
                  :class="[{
                      'opx-dt-picker__calendar-item-disabled': !item['enabled'],
                      'opx-dt-picker__calendar-item-current': !!item['current'],
                      'opx-dt-picker__calendar-item-selected': !!item['selected'],
                      'opx-dt-picker__calendar-item-preselected': !!item['preselected'],
                  }, item['class']]"
                  @click="calendarSelect(item['value'], item['enabled'])"
                  v-html="item['caption']"></span>
        </div>
        <div class="opx-dt-picker__calendar-done" v-show="mode === 'done'" @click="done"></div>
        <div class="opx-dt-picker__actions">
            <div class="opx-dt-picker__actions-reset" @click="reset"></div>
            <div class="opx-dt-picker__actions-close" @click="close"></div>
            <div class="opx-dt-picker__actions-done" v-show="mode !== 'done'" @click="done"></div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "opx-datetime-picker",

        props: {
            date: {
                type: [String, Object],
                default: null
            },
            pickDate: {
                type: Boolean,
                default: true
            },
            pickTime: {
                type: Boolean,
                default: true
            },
            pickSeconds: {
                type: Boolean,
                default: false
            },
            minutesStep: {
                type: Number,
                default: 5
            }
        },

        data() {
            return {
                current: {
                    year: null,
                    month: null,
                    date: null,
                    hour: null,
                    minute: null,
                    second: null,
                },
                preSelected: {
                    year: null,
                    month: null,
                    date: null,
                    hour: null,
                    minute: null,
                    second: null,
                },
                selected: {
                    years: null,
                    year: null,
                    month: null,
                    date: null,
                    hour: null,
                    minute: null,
                    second: null,
                },
                mode: 'year',
            }
        },

        created() {
            this.refreshCurrent();
            this.interval = setInterval(this.refreshCurrent, 1000);

            if (this.pickDate) {
                this.mode = 'date';
            } else {
                this.mode = 'hour';
            }

            if (window.navigator.languages) {
                this.locale = window.navigator.languages[0];
            } else {
                this.locale = window.navigator.language;
            }

            if (this.date === null) {
                // set current
                let date = new Date();
                this.updateSelected({
                    years: null,
                    year: date.getFullYear(),
                    month: date.getMonth(),
                    date: date.getDate(),
                    hour: date.getHours(),
                    minute: date.getMinutes(),
                    second: date.getSeconds(),
                });
            } else if (typeof this.date === 'string') {
                // parse from string
                let date = Date.parse(this.date);
                if (isNaN(date)) date = new Date();
                this.updateSelected({
                    years: null,
                    year: date.getFullYear(),
                    month: date.getMonth(),
                    date: date.getDate(),
                    hour: date.getHours(),
                    minute: date.getMinutes(),
                    second: date.getSeconds(),
                });
            } else {
                // get from object
                this.updateSelected({
                    years: null,
                    year: typeof this.date['year'] !== 'undefined' ? this.date['year'] : null,
                    month: typeof this.date['month'] !== 'undefined' ? this.date['month'] - 1 : null,
                    date: typeof this.date['day'] !== 'undefined' ? this.date['day'] : null,
                    hour: typeof this.date['hour'] !== 'undefined' ? this.date['hour'] : null,
                    minute: typeof this.date['minute'] !== 'undefined' ? this.date['minute'] : null,
                    second: typeof this.date['second'] !== 'undefined' ? this.date['second'] : null,
                });
            }

            this.selected.years = Math.floor(this.selected.year / 20) * 20;

            this.preSelected.year = this.selected.year;
            this.preSelected.month = this.selected.month;
            this.preSelected.date = this.selected.date;
            this.preSelected.hour = this.selected.hour;
            this.preSelected.minute = this.selected.minute;
            this.preSelected.second = this.selected.second;
        },

        destroyed() {
            clearInterval(this.refreshCurrent);
        },

        computed: {
            headerCurrent: function () {
                let out = '';
                if (this.pickDate) out += this.current.date + ' ' + this.monthToLocale2(this.current.month) + ' ' + this.current.year;
                if (this.pickDate && this.pickTime) out += ', ';
                if (this.pickTime) out += String(this.current.hour).padStart(2, '0') + ':' + String(this.current.minute).padStart(2, '0');
                if (this.pickTime && this.pickSeconds) out += ':' + String(this.current.second).padStart(2, '0');

                return out;
            },
        },

        methods: {
            refreshCurrent() {
                const current = new Date();
                this.current.year = current.getFullYear();
                this.current.month = current.getMonth();
                this.current.date = current.getDate();
                this.current.hour = current.getHours();
                this.current.minute = current.getMinutes();
                this.current.second = current.getSeconds();
            },

            monthToLocale(month) {
                const date = new Date();
                date.setMonth(month);

                return date.toLocaleString(this.locale, {month: 'long'});
            },

            monthToLocale2(month) {
                const date = new Date();
                date.setMonth(month);

                return String(date.toLocaleString(this.locale, {day: '2-digit', month: 'long'})).substr(3);
            },

            updateSelected(key, value = null) {
                if (value === null) {
                    Object.keys(key).map(item => {
                        this.selected[item] = key[item]
                    });
                    this.selected.years = Math.floor(this.selected.year / 20) * 20;
                    return;
                }

                let dateObj = Object.assign({}, this.selected);
                dateObj[key] = value;

                const date = new Date(dateObj.year, dateObj.month, dateObj.date, dateObj.hour, dateObj.minute, dateObj.second);

                this.selected.year = date.getFullYear();
                this.selected.month = date.getMonth();
                this.selected.date = date.getDate();
                this.selected.hour = date.getHours();
                this.selected.minute = date.getMinutes();
                this.selected.second = date.getSeconds();
                this.selected.years = Math.floor(this.selected.year / 20) * 20;
            },

            currentDisplay() {
                let out = '';
                switch (this.mode) {
                    case 'year':
                        out = this.selected.years + '-' + (this.selected.years + 19);
                        break;
                    case 'month':
                        out = this.selected.year;
                        break;
                    case 'date':
                        out = this.monthToLocale(this.selected.month) + ' ' + this.selected.year;
                        break;
                    case 'hour':
                        if (this.pickDate) {
                            out = this.selected.date + ' ' + this.monthToLocale2(this.selected.month) + ' ' + this.selected.year;
                        }
                        break;
                    case 'minute':
                        if (this.pickDate) {
                            out = this.selected.date + ' ' + this.monthToLocale2(this.selected.month) + ' ' + this.selected.year + ', ';
                        }
                        out += String(this.selected.hour).padStart(2, '0') + ':00';
                        break;
                    case 'second':
                        if (this.pickDate) {
                            out = this.selected.date + ' ' + this.monthToLocale2(this.selected.month) + ' ' + this.selected.year + ', ';
                        }
                        out += String(this.selected.hour).padStart(2, '0') + ':' + String(this.selected.minute).padStart(2, '0');
                        break;
                    default:
                        out = '';
                }
                return out;
            },

            clickNavigation(direction) {
                if (this.mode === 'hour' && this.pickDate === false) return;

                switch (this.mode) {
                    case 'year':
                        this.selected.years = this.selected.years + direction * 20;
                        break;
                    case 'month':
                        this.updateSelected('year', this.selected.year + direction);
                        break;
                    case 'date':
                        this.updateSelected('month', this.selected.month + direction);
                        break;
                    case 'hour':
                        this.updateSelected('date', this.selected.date + direction);
                        break;
                    case 'minute':
                        this.updateSelected('hour', this.selected.hour + direction);
                        break;
                    case 'second':
                        this.updateSelected('minute', this.selected.minute + direction);
                        break;
                    default:
                }
                this.$forceUpdate();
            },

            getMonthParams(year, month) {
                let date = new Date(year, month);
                let firstDayOfWeek = date.getDay();

                if (firstDayOfWeek === 0) firstDayOfWeek = 7;

                date.setMonth(date.getMonth() + 1);
                date.setDate(0);
                const lastInMonth = date.getDate();

                date.setDate(0);
                const lastInPreviousMonth = date.getDate();

                return {firstDayOfWeek, lastInMonth, lastInPreviousMonth};
            },

            getCalendar() {
                let list = {};
                switch (this.mode) {
                    case 'year':
                        for (let i = this.selected.years; i < this.selected.years + 20; i++) {
                            list[i] = {
                                value: i,
                                caption: i,
                                enabled: true,
                                current: i === this.current.year,
                                preselected: i === this.preSelected.year,
                                selected: i === this.selected.year,
                                class: null,
                            };
                        }
                        break;
                    case 'month':
                        for (let i = 0; i < 12; i++) {
                            list[i] = {
                                value: i,
                                caption: this.monthToLocale(i),
                                enabled: true,
                                current: (i === this.current.month && this.selected.year === this.current.year),
                                preselected: (i === this.preSelected.month && this.selected.year === this.preSelected.year),
                                selected: (i === this.selected.month),
                                class: null,
                            };
                        }
                        break;
                    case 'date':
                        let {firstDayOfWeek, lastInMonth, lastInPreviousMonth} = this.getMonthParams(this.selected.year, this.selected.month);
                        let day = firstDayOfWeek === 1 ? 1 : lastInPreviousMonth - (firstDayOfWeek - 1) + 1;
                        let month = firstDayOfWeek === 1 ? 0 : -1;

                        for (let i = 0; i < 42; i++) {
                            list[i] = {
                                value: day,
                                caption: day,
                                enabled: month === 0,
                                current: (month === 0 && day === this.current.date && this.selected.month === this.current.month && this.selected.year === this.current.year),
                                preselected: (month === 0 && day === this.preSelected.date && this.selected.month === this.preSelected.month && this.selected.year === this.preSelected.year),
                                selected: (month === 0 && day === this.selected.date),
                                class: null,
                            };

                            day++;

                            if ((day > lastInPreviousMonth) && (month === -1)) {
                                day = 1;
                                month++
                            }
                            if (day > lastInMonth && month === 0) {
                                day = 1;
                                month++;
                            }
                        }
                        break;
                    case 'hour':
                        for (let i = 0; i < 24; i++) {
                            list[i] = {
                                value: i,
                                caption: String(i).padStart(2, '0') + '<span>:00</span>',
                                enabled: true,
                                current: (i === this.current.hour && (this.pickDate === false || this.selected.date === this.current.date && this.selected.month === this.current.month && this.selected.year === this.current.year)),
                                preselected: (i === this.preSelected.hour && (this.pickDate === false || this.selected.date === this.preSelected.date && this.selected.month === this.preSelected.month && this.selected.year === this.preSelected.year)),
                                selected: (i === this.selected.hour),
                                class: null,
                            };
                        }
                        break;
                    case 'minute':
                        const hour = String(this.selected.hour).padStart(2, '0');
                        for (let i = 0; i < 60; i = i + this.minutesStep) {
                            list[i] = {
                                value: i,
                                caption: '<span>' + hour + ':</span>' + String(i).padStart(2, '0'),
                                enabled: true,
                                current: (i === this.current.minute && this.selected.hour === this.current.hour && (this.pickDate === false || this.selected.date === this.current.date && this.selected.month === this.current.month && this.selected.year === this.current.year)),
                                preselected: (i === this.preSelected.minute && this.selected.hour === this.preSelected.hour && (this.pickDate === false || this.selected.date === this.preSelected.date && this.selected.month === this.preSelected.month && this.selected.year === this.preSelected.year)),
                                selected: (i === this.selected.minute),
                                class: 'n-' + String(this.minutesStep),
                            };
                        }
                        break;
                    case 'second':
                        for (let i = 0; i < 60; i++) {
                            list[i] = {
                                value: i,
                                caption: String(i).padStart(2, '0'),
                                enabled: true,
                                current: (i === this.current.second && this.selected.minute === this.current.minute && this.selected.hour === this.current.hour && (this.pickDate === false || this.selected.date === this.current.date && this.selected.month === this.current.month && this.selected.year === this.current.year)),
                                preselected: (i === this.preSelected.second && this.selected.minute === this.preSelected.minute && this.selected.hour === this.preSelected.hour && (this.pickDate === false || this.selected.date === this.preSelected.date && this.selected.month === this.preSelected.month && this.selected.year === this.preSelected.year)),
                                selected: (i === this.selected.second),
                                class: null,
                            };
                        }
                        break;
                    default:
                }
                return list;
            },

            calendarSelect(value, enabled) {
                if (!enabled) return;
                switch (this.mode) {
                    case 'year':
                        this.selected.year = value;
                        this.mode = 'month';
                        break;
                    case 'month':
                        this.selected.month = value;
                        this.mode = 'date';
                        break;
                    case 'date':
                        this.selected.date = value;
                        if (this.pickTime) {
                            this.mode = 'hour';
                        } else {
                            this.mode = 'done';
                        }
                        break;
                    case 'hour':
                        this.selected.hour = value;
                        this.mode = 'minute';
                        break;
                    case 'minute':
                        this.selected.minute = value;
                        if (this.pickSeconds) {
                            this.mode = 'second';
                        } else {
                            this.mode = 'done';
                        }
                        break;
                    case 'second':
                        this.selected.second = value;
                        this.mode = 'done';
                        break;
                    default:
                }
            },

            done() {
                let result = {};

                // SOME FIXES FOR LUXON !!!
                if (this.pickDate) {
                    result['year'] = this.selected.year;
                    result['month'] = this.selected.month + 1;
                    result['day'] = this.selected.date;
                }
                if (this.pickTime) {
                    result['hour'] = this.selected.hour;
                    result['minute'] = this.selected.minute;
                    if (this.pickSeconds) {
                        result['second'] = this.selected.second;
                    }
                }
                this.$emit('done', result);
            },

            close() {
                this.$emit('close');
            },

            reset() {
                this.updateSelected(this.preSelected);
            }
        }
    }
</script>