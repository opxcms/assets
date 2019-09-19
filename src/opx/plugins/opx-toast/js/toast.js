import Velocity from 'velocity-animate';


/**
 * Toast
 * core instance of toast
 *
 * @param options
 * @returns {Toast}
 * @constructor
 */
const Toast = function (options) {

    this.options = {
        container: null,
        message: null,
        showTime: 0,
        className: null,
        inDuration: 300,
        outDuration: 375,
    };

    this.element = null;
    this.remains = 0;

    this.prepareOptions = (options) => {
        if(options.container) {
            this.options.container = options.container;
        }
        if(options.message) {
            this.options.message = options.message;
        }
        if(options.showTime !== null) {
            this.options.showTime = options.showTime;
        }
        if(options.className) {
            this.options.className = options.className;
        }
        if(options.inDuration !== 'undefined') {
            this.options.inDuration = options.inDuration;
        }
        if(options.outDuration !== 'undefined') {
            this.options.outDuration = options.outDuration;
        }
    };



    this.createToast = () => {
        const close = document.createElement("div");
        close.className = "opx-toast__item-close";
        close.addEventListener('click', this.remove);

        this.element = document.createElement("div");
        this.element.className = "opx-toast__item";
        if(this.options.className) {
            this.element.classList.add(this.options.className)
        }
        this.element.innerHTML = this.options.message;
        this.element.appendChild(close);

        this.options.container.appendChild(this.element);

        this.startTimer();

        this.show();

        return this;
    };

    this.show = function () {
        Velocity(this.element, {top: 0,  opacity: 1 }, {
            duration: this.options.inDuration,
            easing: 'easeOutCubic',
            queue: false
        });
    };


    this.startTimer = () => {
        if (this.options.showTime !== 0)  {
            this.remains = this.options.showTime;
            this.interval = setInterval(() => {
                this.remains -= 20;
                if(this.remains<=0) {
                    this.remove();
                }
             }, 20);
        }
    };


    this.remove = () => {
        window.clearInterval(this.interval);
        Velocity(this.element, {left: 100,  opacity: 0 }, {
            duration: this.options.outDuration,
            easing: 'easeOutExpo',
            queue: false,
            complete: () => {
                this.unset();
            }
        });
    };

    this.unset = () => {
        this.element.remove();
    };

    this.prepareOptions(options);
    this.createToast();

    return this;
};



export default Toast;