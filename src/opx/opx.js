/**
 * Vendors
 */
import Promise from "promise-polyfill";
window.Promise = Promise;

import ObjectAssign from "es6-object-assign";
ObjectAssign.polyfill();

import Vue from 'vue';
// import Vuex from 'vuex';
// import VueRouter from 'vue-router';
import Toast from './plugins/opx-toast/opx-toast';
import Translator from './plugins/opx-translator/opx-translator';

/**
 * Initial settings
 */
// Vue.use(Vuex);
// Vue.use(VueRouter);
Vue.use(Toast);
Vue.use(Translator);

/**
 * Components
 */
import OpxLoadingComponent from './components/opx-loading/opx-loading';
import OpxScrollBoxComponent from './components/opx-scroll/opx-scroll-box.vue';
import OpxIconComponent from './components/opx-icon/opx-icon.vue';
import OpxExternalIconComponent from './components/opx-external-icon/opx-external-icon';
import OpxNavigationMenuItemComponent from './components/opx-navigation/opx-navigation-menu-item.vue';
import OpxNavigationComponent from './components/opx-navigation/opx-navigation.vue';

import OpxListComponent from './components/opx-list/opx-list.vue';
import OpxSelectListComponent from './components/opx-list/opx-select-list';
import OpxListItemComponent from './components/opx-list/opx-list-item.vue';
import OpxListOrderComponent from './components/opx-list/opx-list-order.vue';
import OpxListFilterComponent from './components/opx-list/opx-list-filter.vue';
import OpxListFilterSwitch from './components/opx-list/opx-list-filter-switch.vue';
import OpxListFilterCheckbox from './components/opx-list/opx-list-filter-checkbox.vue';
import OpxListFilterNumber from './components/opx-list/opx-list-filter-number.vue';
import OpxListFilterDate from './components/opx-list/opx-list-filter-date.vue';
import OpxListSearchComponent from './components/opx-list/opx-list-search';
import OpxListQuickNavComponent from './components/opx-list/opx-list-quick-nav';
import OpxListQuickNavItemComponent from './components/opx-list/opx-list-quick-nav-item';

import OpxDateTimePicker from './components/opx-datetime-picker/opx-datetime-picker';

import OpxComponentLoader from './components/opx-component-loader/opx-component-loader.vue';
import OpxDesktopComponent from './components/opx-desktop/opx-desktop.vue';
import OpxUpdatesComponent from './components/opx-update/opx-update.vue';
import OpxFormComponent from './components/opx-form/opx-form.vue';
import OpxButton from './components/opx-button/opx-button.vue';
import OpxPagination from './components/opx-pagination/opx-pagination';

import OpxFormFieldStringComponent from './components/opx-form/opx-form-fields/opx-form-field-string';
import OpxFormFieldTextComponent from './components/opx-form/opx-form-fields/opx-form-field-text';
import OpxFormFieldHtmlComponent from './components/opx-form/opx-form-fields/opx-form-field-html';
import OpxFormFieldCheckboxComponent from './components/opx-form/opx-form-fields/opx-form-field-checkbox';
import OpxFormFieldCheckboxListComponent from './components/opx-form/opx-form-fields/opx-form-field-checkbox-list';
import OpxFormFieldCheckboxGroupedListComponent from './components/opx-form/opx-form-fields/opx-form-field-checkbox-grouped-list';
import OpxFormFieldDateTimeComponent from './components/opx-form/opx-form-fields/opx-form-field-datetime';
import OpxFormFieldTimeComponent from './components/opx-form/opx-form-fields/opx-form-field-time';
import OpxFormFieldSelectComponent from './components/opx-form/opx-form-fields/opx-form-field-select';
import OpxFormFieldNestedSelectComponent from './components/opx-form/opx-form-fields/opx-form-field-nested-select';
import OpxFormFieldNestedSelectItemComponent from './components/opx-form/opx-form-fields/opx-form-field-nested-select-item';
import OpxFormFieldImageComponent from './components/opx-form/opx-form-fields/opx-form-field-image';
import OpxFormFieldImageItemComponent from './components/opx-form/opx-form-fields/opx-form-field-image-item';
import OpxFormFieldPropertiesComponent from './components/opx-form/opx-form-fields/opx-form-field-properties';
import OpxFormFieldPropertiesSimpleComponent from './components/opx-form/opx-form-fields/opx-form-field-properties-simple';
import OpxFormFieldPropertiesOneOfComponent from './components/opx-form/opx-form-fields/opx-form-field-properties-one-of';
import OpxFormFieldPropertiesManyOfComponent from './components/opx-form/opx-form-fields/opx-form-field-properties-many-of';
import OpxFormFieldPropertiesDateTimeComponent from './components/opx-form/opx-form-fields/opx-form-field-properties-datetime';
import OpxFormFieldPropertiesTimeComponent from './components/opx-form/opx-form-fields/opx-form-field-properties-time';
import OpxFormFieldRelatedComponent from './components/opx-form/opx-form-fields/opx-form-field-related';
import OpxFormFieldRelatedNumberComponent from './components/opx-form/opx-form-fields/opx-form-field-related-number';
import OpxFormFieldRelatedDateComponent from './components/opx-form/opx-form-fields/opx-form-field-related-date';
import OpxMaskInputComponent from './components/opx-form/opx-form-fields/helpers/masked-input';
import OpxFormFieldMaskComponent from './components/opx-form/opx-form-fields/opx-form-field-mask';
import OpxFormFieldLinkComponent from './components/opx-form/opx-form-fields/opx-form-field-link';
import OpxFormFieldCommentsComponent from './components/opx-form/opx-form-fields/opx-form-field-comments';
import OpxFormFieldCommentsCommentComponent from './components/opx-form/opx-form-fields/opx-form-field-comments-comment';
import OpxFormFieldKeyValueComponent from './components/opx-form/opx-form-fields/opx-form-field-key-value';


Vue.component('opx-loading', OpxLoadingComponent);
Vue.component('opx-scroll-box', OpxScrollBoxComponent);
Vue.component('opx-icon', OpxIconComponent);
Vue.component('opx-icon-external', OpxExternalIconComponent);
Vue.component('opx-navigation-menu-item', OpxNavigationMenuItemComponent);
Vue.component('opx-navigation', OpxNavigationComponent);

Vue.component('opx-list', OpxListComponent);
Vue.component('opx-select-list', OpxSelectListComponent);
Vue.component('opx-list-item', OpxListItemComponent);
Vue.component('opx-list-order', OpxListOrderComponent);
Vue.component('opx-list-filter', OpxListFilterComponent);
Vue.component('opx-list-filter-switch', OpxListFilterSwitch);
Vue.component('opx-list-filter-checkbox', OpxListFilterCheckbox);
Vue.component('opx-list-filter-number', OpxListFilterNumber);
Vue.component('opx-list-filter-date', OpxListFilterDate);
Vue.component('opx-list-search', OpxListSearchComponent);
Vue.component('opx-list-quick-nav', OpxListQuickNavComponent);
Vue.component('opx-list-quick-nav-item', OpxListQuickNavItemComponent);

Vue.component('opx-datetime-picker', OpxDateTimePicker);

Vue.component('opx-component-loader', OpxComponentLoader);
Vue.component('opx-desktop', OpxDesktopComponent);
Vue.component('opx-updates', OpxUpdatesComponent);
Vue.component('opx-form', OpxFormComponent);
Vue.component('opx-button', OpxButton);
Vue.component('opx-pagination', OpxPagination);

Vue.component('opx-form-field-string', OpxFormFieldStringComponent);
Vue.component('opx-form-field-text', OpxFormFieldTextComponent);
Vue.component('opx-form-field-html', OpxFormFieldHtmlComponent);
Vue.component('opx-form-field-checkbox', OpxFormFieldCheckboxComponent);
Vue.component('opx-form-field-checkbox-list', OpxFormFieldCheckboxListComponent);
Vue.component('opx-form-field-checkbox-grouped-list', OpxFormFieldCheckboxGroupedListComponent);
Vue.component('opx-form-field-datetime', OpxFormFieldDateTimeComponent);
Vue.component('opx-form-field-time', OpxFormFieldTimeComponent);
Vue.component('opx-form-field-select', OpxFormFieldSelectComponent);
Vue.component('opx-form-field-nested-select', OpxFormFieldNestedSelectComponent);
Vue.component('opx-form-field-nested-select-item', OpxFormFieldNestedSelectItemComponent);
Vue.component('opx-form-field-image', OpxFormFieldImageComponent);
Vue.component('opx-form-field-image-item', OpxFormFieldImageItemComponent);
Vue.component('opx-form-field-properties', OpxFormFieldPropertiesComponent);
Vue.component('opx-form-field-properties-simple', OpxFormFieldPropertiesSimpleComponent);
Vue.component('opx-form-field-properties-one-of', OpxFormFieldPropertiesOneOfComponent);
Vue.component('opx-form-field-properties-many-of', OpxFormFieldPropertiesManyOfComponent);
Vue.component('opx-form-field-properties-datetime', OpxFormFieldPropertiesDateTimeComponent);
Vue.component('opx-form-field-properties-time', OpxFormFieldPropertiesTimeComponent);
Vue.component('opx-form-field-related', OpxFormFieldRelatedComponent);
Vue.component('opx-form-field-related-number', OpxFormFieldRelatedNumberComponent);
Vue.component('opx-form-field-related-date', OpxFormFieldRelatedDateComponent);
Vue.component('opx-mask-input', OpxMaskInputComponent);
Vue.component('opx-form-field-mask', OpxFormFieldMaskComponent);
Vue.component('opx-form-field-link', OpxFormFieldLinkComponent);
Vue.component('opx-form-field-comments', OpxFormFieldCommentsComponent);
Vue.component('opx-form-field-comments-comment', OpxFormFieldCommentsCommentComponent);
Vue.component('opx-form-field-key-value', OpxFormFieldKeyValueComponent);

/**
 * Make app
 */
import OpxApp from './opx-app';

const Opx = new Vue(OpxApp());