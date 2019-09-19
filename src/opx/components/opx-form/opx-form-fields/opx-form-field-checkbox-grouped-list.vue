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
            <!-- groups -->
            <div v-for="(group, key) in getOptions()" :key="key">
                <span class="opx-form-field-checkbox__group-title opx-form-field-checkbox"
                      :class="{'opx-form-field-checkbox__checked': isGroupChecked(key)}"
                      @click="checkGroup(key)"
                >
                    <span class="opx-form-field-checkbox__check"></span>
                    <span class="opx-form-field-checkbox__label">{{ $trans(group['caption']) }}</span>
                </span>
                <!-- container -->
                <div class="opx-form-field-checkbox__group-body">
                    <!-- checks -->
                    <span class="opx-form-field-checkbox opx-form-field-checkbox__in-list"
                          v-for="check in group['children']"
                          :key="check['id']"
                          :class="{'opx-form-field-checkbox__checked': getCheckValue(check['id']),
                                  'opx-form-field-checkbox__modified': isCheckModified(check['id'])
                                  }"
                          @click="setCheckValue(check['id'])"
                    >
                        <span class="opx-form-field-checkbox__check"></span>
                        <span class="opx-form-field-checkbox__label">{{ $trans(check['caption']) }}</span>
                        <span class="opx-form-field__caption-hint" v-if="hints">[{{ check['id'] }}]</span>
                    </span>
                    <!-- end of checks -->
                </div>
                <!-- end of container -->
            </div>
            <!-- end of groups -->
        </div>
        <div class="opx-form-field__errors" v-if="!isValid()">
            <span class="opx-form-field__errors-text" v-for="message in getErrors()">{{ message }}</span>
        </div>
    </div>
</template>

<script>

    import OpxFormAbstractField from "./opx-form-abstract-field";

    export default {
        mixins: [OpxFormAbstractField],

        methods: {
            getValue() {
                let value = !!this.value ? this.value : [];
                return Array.from(value);
            },

            getCheckValue(id) {
                const value = this.getValue();

                return value.indexOf(id) !== -1;
            },

            setCheckValue(id) {
                let value = this.getValue();

                const ind = value.indexOf(id);
                if (ind === -1) {
                    value.push(id);
                } else {
                    value.splice(ind, 1);
                }
                this.setValue(value);
            },

            isCheckModified(id) {
                const current = this.getCheckValue(id);
                const original = !!this.original['value'] && this.original['value'].indexOf(id) !== -1;
                return current !== original;
            },

            getIdsForGroup(key) {
                const checks = this.getOptions()[key];
                let ids = [];
                checks['children'].map(item => {
                    ids.push(item['id'])
                });

                return ids;
            },

            isGroupChecked(key) {
                const ids = this.getIdsForGroup(key);
                const value = this.getValue();
                return !ids.some(id => value.indexOf(id) === -1);
            },

            checkGroup(key) {
                const ids = this.getIdsForGroup(key);
                const value = this.getValue();
                const groupChecked = this.isGroupChecked(key);

                ids.map(id => {
                    let ind = value.indexOf(id);
                    if (!groupChecked && ind === -1) {
                        value.push(id);
                    } else if (groupChecked && ind !== -1) {
                        value.splice(ind, 1);
                    }
                });

                this.setValue(value);
            },
        }
    }
</script>