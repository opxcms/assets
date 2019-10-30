<script>
    import {DateTime} from 'luxon';

    export default {
        methods: {

            /**
             * @param date
             * @param useNowOnNull
             * @returns {DateTime|*}
             */
            parseDate(date, useNowOnNull = false) {

                if (date === null || date === '') {
                    return useNowOnNull ? DateTime.local() : null;
                }

                if (typeof date === 'object') {
                    return DateTime.fromSQL(date['date'], {zone: date['timezone']}).setZone().setLocale(window.navigator.language);
                }

                return DateTime.fromISO(date).setZone().setLocale(window.navigator.language);
            },

            /**
             * @param date DateTime
             * @returns string
             */
            formatDate(date) {
                return date.toFormat("yyyy-MM-dd'T'HH:mm:ssZZ");
            },

            /**
             * @param date DateTime
             * @returns string
             */
            formatTime(date) {
                return date.toFormat("HH:mm:ss");
            },
        }
    }
</script>