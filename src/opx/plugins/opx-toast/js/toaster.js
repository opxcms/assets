import Toast from './toast';


/**
 * Toast
 * core instance of toast
 *
 * @param _options
 * @returns {ToastPlugin}
 * @constructor
 */
const ToastPlugin = function (_options) {

    this.options = _options;

    this.containerElement = null;

    this.getContainer = () => {
        if(this.containerElement !== null) {

            return this.containerElement;
        }

        let container = document.getElementById('opx-toast');
        if(container) {
            this.containerElement = container;

            return container
        }

        container = document.createElement('div');
        container.id = 'opx-toast';
        container.className = 'opx-toast';
        document.body.appendChild(container);
        this.containerElement = container;

        return container
    };

    this._show = (message, delay = null, type = null) => {
        const container = this.getContainer();
        new Toast({
            container: container,
            message: message,
            showTime: delay,
            className: type,
        });
    };

    this.show = (message, delay) => {
        this._show(message, delay)
    };
    this.success = (message, delay = null) => {
        this._show(message, delay, 'success')
    };
    this.info = (message, delay = null) => {
        this._show(message, delay, 'info')
    };
    this.error = (message, delay = null) => {
        this._show(message, delay, 'error')
    };

    return this;
};



export default ToastPlugin;