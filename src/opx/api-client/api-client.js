import axios from 'axios/index';

/**
 * Create a new Axios client instance
 * @see https://github.com/mzabriskie/axios#creating-an-instance
 */
const getClient = (baseUrl = null) => {

    const options = {
        baseURL: baseUrl
    };

    let token = document.head.querySelector('meta[name="csrf-token"]');

    if (token) {
        options.headers = {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': token.content
        };
    } else {
        console.error('CSRF token not set');
    }

    const client = axios.create(options);

    // Add a request interceptor
    client.interceptors.request.use(
        requestConfig => requestConfig,
        (requestError) => {
            // Add stuff if need
            return Promise.reject(requestError);
        },
    );

    // Add a response interceptor
    client.interceptors.response.use(
        response => response,
        (error) => {
            if (error.response.status === 401) {
                location.reload();
            }
            if (error.response.status >= 500) {
                console.log(error);
                if(error.response.data['message']) {
                    console.log(error.response.data['message']);
                }
                if(error.response.data['trace']) {
                    console.log(error.response.data['trace']);
                }
            }

            return Promise.reject(error);
        },
    );

    return client;
};

class ApiClient {
    constructor(baseUrl = null) {
        this.client = getClient(baseUrl);
    }

    get(url, conf = {}) {
        return this.client.get(url, conf)
            .then(response => Promise.resolve(response))
            .catch(error => Promise.reject(error));
    }

    delete(url, conf = {}) {
        return this.client.delete(url, conf)
            .then(response => Promise.resolve(response))
            .catch(error => Promise.reject(error));
    }

    head(url, conf = {}) {
        return this.client.head(url, conf)
            .then(response => Promise.resolve(response))
            .catch(error => Promise.reject(error));
    }

    options(url, conf = {}) {
        return this.client.options(url, conf)
            .then(response => Promise.resolve(response))
            .catch(error => Promise.reject(error));
    }

    post(url, data = {}, conf = {}) {
        return this.client.post(url, data, conf)
            .then(response => Promise.resolve(response))
            .catch(error => Promise.reject(error));
    }

    put(url, data = {}, conf = {}) {
        return this.client.put(url, data, conf)
            .then(response => Promise.resolve(response))
            .catch(error => Promise.reject(error));
    }

    patch(url, data = {}, conf = {}) {
        return this.client.patch(url, data, conf)
            .then(response => Promise.resolve(response))
            .catch(error => Promise.reject(error));
    }
}

export { ApiClient };

/**
 * Base HTTP Client
 */
export default {
    // Provide request methods with the default base_url
    get(url, conf = {}) {
        return getClient().get(url, conf)
            .then(response => Promise.resolve(response))
            .catch(error => Promise.reject(error));
    },

    delete(url, conf = {}) {
        return getClient().delete(url, conf)
            .then(response => Promise.resolve(response))
            .catch(error => Promise.reject(error));
    },

    head(url, conf = {}) {
        return getClient().head(url, conf)
            .then(response => Promise.resolve(response))
            .catch(error => Promise.reject(error));
    },

    options(url, conf = {}) {
        return getClient().options(url, conf)
            .then(response => Promise.resolve(response))
            .catch(error => Promise.reject(error));
    },

    post(url, data = {}, conf = {}) {
        return getClient().post(url, data, conf)
            .then(response => Promise.resolve(response))
            .catch(error => Promise.reject(error));
    },

    put(url, data = {}, conf = {}) {
        return getClient().put(url, data, conf)
            .then(response => Promise.resolve(response))
            .catch(error => Promise.reject(error));
    },

    patch(url, data = {}, conf = {}) {
        return getClient().patch(url, data, conf)
            .then(response => Promise.resolve(response))
            .catch(error => Promise.reject(error));
    },
};