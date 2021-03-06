import './polyfill'
import * as Util from './util.js'
import * as XHR from './xhr.js'
import * as XDR from './xdr.js'
import jsonp from './jsonp.js'
import iframeAgent from './iframe.js'

function rext(options) {
    var args = [].slice.call(arguments);

    if (options.promise !== false) {
        options.promise = rext.defaults.promise;
    }
    
    if (typeof options.dataType === 'string') {
        options.dataType = options.dataType.toLowerCase();
    }
    if (typeof options.responseType === 'string') {
        options.responseType = options.responseType.toLowerCase();
    }
    if (typeof options.method === 'string') {
        options.method = options.method.toLowerCase();
    }
    if (typeof options.type === 'string') {
        options.type = options.type.toLowerCase();
    }

    var isJsonp = !!options.jsonp || options.dataType === 'jsonp' || options.responseType === 'jsonp';
    if (isJsonp) {
        return jsonp.apply(null, args);
    }

    var isCrossDomain = Util.isCrossDomain(options.url);

    var isWithCredentials = !!options.withCredentials || (options.xhrFields && !!options.xhrFields.withCredentials);
    options.withCredentials = isWithCredentials;

    if (!options.type && typeof options.method === 'string') options.type = options.method;
    if (typeof options.type !== 'string') options.type = 'get';
    options.type = options.type.toLowerCase();
    var isntGet = options.type !== 'get';
    
    if (options.cache !== false) options.cache = true;
    if (!options.cache && !isntGet && Util.isObject(options.data)) {
        options.data._ = Util.gid();
    }

    if (!options.headers) options.headers = {};
    if (options.contentType) {
        if (!options.headers['Content-Type'])
            options.headers['Content-Type'] = options.contentType;
        else
            delete options.contentType;
    }
    if (!options.headers['Content-Type'])
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded';

    if (typeof options.responseType !== 'string') {
        if (typeof options.dataType === 'string' && /^(text|json|xml|html)$/i.test(options.dataType))
            options.responseType = options.dataType;
        else
            options.responseType = 'text';
    }

    if (options.complete) {
        options.always = options.complete;
        delete options.complete;
    }

    var forceIframe = !!options.agent;

    if (!isCrossDomain || (XHR.corsSupported && !forceIframe)) {
        return XHR.promiseSend.apply(null, args);

    /* If you want to disable XDomainRequest, comment the two lines below and build your version. */
    } else if (!forceIframe && XDR.supported && !isWithCredentials && !isntGet && !(/\/json/i.test(options.headers['Content-Type']))) {
        return XDR.promiseSend.apply(null, args);
    /* If you want to disable XDomainRequest, comment the two lines above and build your version. */

    } else {
        return iframeAgent.apply(null, args);
    }
}

rext.defaults = {};

import Prom from '@hengwu/promises-aplus'

window.rext_promises_aplus = Prom;
if (typeof Promise === 'undefined') {
    rext.defaults.promise = Prom;
} else {
    rext.defaults.promise = Promise;
}

export default rext
