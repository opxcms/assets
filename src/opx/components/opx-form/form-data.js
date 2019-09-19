import Vue from "vue";
import {parseRules, validate} from "../../validator/validator"
import {GetMessage} from "../../validator/messages";

const getMessage = GetMessage;

const formData = function (data) {

    this.sections = {};
    this.groups = {};
    this.fields = {};

    this.values = {};
    this.valid = {};
    this.validation_rules = {};
    this.validation_errors = {};

    /**
     * Get list of all sections.
     *
     * @returns {string[]}
     */
    this.getSections = () => {
        let sections = Object.keys(this.sections);
        let hasNS = Object.keys(this.fields).some(field => {
            return !this.fields[field]['section'] || this.fields[field]['section'] === '';
        });
        if (hasNS) sections.push(null);
        return sections;
    };

    /**
     * Get groups list for section
     *
     * @param section
     * @returns {Array}
     */
    this.getGroups = (section) => {
        let groups = [];
        Object.keys(this.fields).map(field => {
            let _section = !!this.fields[field]['section'] ? this.fields[field]['section'] : null;
            if (_section === section) {
                let _group = !!this.fields[field]['group'] ? this.fields[field]['group'] : null;
                if (groups.indexOf(_group) === -1) {
                    groups.push(_group);
                }
            }
        });
        return groups;
    };

    /**
     * Get fields list for section/group.
     *
     * @param section
     * @param group
     * @returns {Array}
     */
    this.getFields = (section, group) => {
        let fields = [];
        Object.keys(this.fields).map(field => {
            let _section = !!this.fields[field]['section'] ? this.fields[field]['section'] : null;
            let _group = !!this.fields[field]['group'] ? this.fields[field]['group'] : null;
            if (section === _section && group === _group) {
                fields.push(field);
            }
        });
        return fields;
    };

    /**
     * Get field component.
     *
     * @param field
     * @returns {VueConstructor}
     */
    this.getFieldComponent = (field) => {
        const type = !!this.fields[field]['type'] ? this.fields[field]['type'] : 'string';
        let component = Vue.component('opx-form-field-' + type);
        if (!component) {
            component = Vue.component('opx-form-field-string');
        }

        return component;
    };

    /**
     * Check if field is modified.
     *
     * @param field
     * @returns {boolean}
     */
    this.isFieldModified = (field) => {

        return (JSON.stringify(!!this.values[field] ? this.values[field] : []) !== JSON.stringify(!!this.fields[field]['value'] ? this.fields[field]['value'] : []));
    };

    /**
     * Set new value for field.
     *
     * @param name
     * @param value
     */
    this.set = (name, value) => {
        Vue.set(this.values, name, value);
        this.validateAll();
    };

    /**
     * Validate all fields.
     */
    this.validateAll = () => {
        Object.keys(this.values).map(key => {
            this.validate(key, this.values[key]);
        });
    };

    /**
     * Validate field.
     *
     * @param name
     * @param value
     * @returns {boolean}
     */
    this.validate = (name, value) => {
        if (Object.keys(this.validation_rules[name]).length === 0) {
            Vue.set(this.validation_errors, name, []);
            Vue.set(this.valid, name, true);
            // this.updateErrorsCount(field_name, initialValid, true);
            return true;
        }

        let failed = validate(name, value, this.validation_rules[name], this.values);

        if (failed.length === 0) {
            Vue.set(this.validation_errors, name, []);
            Vue.set(this.valid, name, true);
            // this.updateErrorsCount(field_name, initialValid, true);
            return true;
        }

        this.validation_errors[name] = [];
        failed.map((failed_rule) => {
            let names = {};
            Object.keys(this.fields).map(field => {
                names[field] = this.fields[field]['caption'];
            });
            this.validation_errors[name].push(getMessage(name, value, failed_rule, this.validation_rules[name], names, this.values));
        });

        this.valid[name] = false;

        return false;
    };

    /**
     * Check if form has errors.
     *
     * @returns {boolean}
     */
    this.hasErrors = () => {
        return Object.values(this.valid).some(val => !val);
    };

    /**
     * Check if section has errors.
     *
     * @param section
     * @returns {boolean}
     */
    this.sectionHasErrors = (section) => {
        return Object.keys(this.fields).some(field => {
            let _section = !!this.fields[field]['section'] ? this.fields[field]['section'] : null;
            if (section === _section) {
                return this.valid[field] === false;
            }
            return false;
        });
    };

    /**
     * Check if section has modified fields.
     *
     * @param section
     * @returns {boolean}
     */
    this.sectionHasModified = (section) => {
        return Object.keys(this.fields).some(field => {
            let _section = !!this.fields[field]['section'] ? this.fields[field]['section'] : null;
            if (section === _section) {
                return this.isFieldModified(field);
            }
            return false;
        });
    };

    /**
     * Reset values to initial.
     */
    this.reset = () => {
        let needsReload = false;

        Object.keys(this.fields).map(field => {

            if (this.isFieldModified(field)) {
                try {
                    const json = JSON.stringify(this.fields[field]['value']);
                    const parsed = JSON.parse(json);
                    this.set(field, parsed);
                    needsReload = needsReload || !!this.fields[field]['needs_reload'];
                } catch (e) {

                }
            }
        });

        return needsReload;
    };

    /**
     * Init links, schema, fields, validation
     */
    Object.keys(!!data['sections'] ? data['sections'] : []).map((key) => {
        this.sections[data['sections'][key]['name']] = data['sections'][key];
    });
    Object.keys(!!data['groups'] ? data['groups'] : []).map((key) => {
        this.groups[data['groups'][key]['name']] = data['groups'][key];
    });
    Object.keys(!!data['fields'] ? data['fields'] : []).map((key) => {
        this.fields[data['fields'][key]['name']] = data['fields'][key];
    });

    Object.keys(this.fields).map((field) => {
        this.validation_rules[field] = parseRules(this.fields[field]['validation']);
        this.validation_errors[field] = !!this.fields[field]['errors'] ? this.fields[field]['errors'] : [];
        this.valid[field] = !this.fields[field]['errors'];
        this.values[field] = JSON.parse(JSON.stringify(typeof this.fields[field]['value'] !== 'undefined' ? this.fields[field]['value'] : null));
    });

    Object.keys(this.fields).map((field) => {
        this.validate(field, this.values[field]);
    });

    return this;
};

export default formData;