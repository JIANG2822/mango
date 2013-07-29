/*!
 * mango JavaScript Library v1.0
 * author: willian.xiaodong
 * Date: 2013-06-15
 * github: https://github.com/willian12345/mango
 */
;+function(window, undefined){
    'use strict';
    var Mango, mango, _mango = {},  guid=0, Events = {}, EventTrigger, TypeOF, _extend
    , domReady = false, domReadyCallbacks
    // check for HTML strings
    ,rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/
    // Match a standalone tag
    ,rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/
    ,rtagNameExpr = /^<(\w+)\s*\/?>$/
    ,rForUpperCase = /-(.)/g
    ,rUnit = /em|px|%/
    ;
    TypeOF = (function(){
        // create functions which is object's type check
        var typeObject = {};
        var o = ["Array", "Boolean", "Date", "Number", "Object", "RegExp", "String", 'Function'];
        for(var i = 0, c; c = o[i++];){
            typeObject['is'+c] = (function(type){
                return function(obj){
                    if(!obj) return false;
                    return Object.prototype.toString.call(obj) == "[object " + type + "]";
                }
            })(c);
        }
        return typeObject;
    })();
    // object extend function
    _extend = function() {
        // copy reference to target object
        var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options;

        // Handle a deep copy situation
        if ( typeof target === "boolean" ) {
            deep = target;
            target = arguments[1] || {};
            // skip the boolean and the target
            i = 2;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if ( typeof target !== "object" && !TypeOF.isFunction(target) )
            target = {};

        for ( ; i < length; i++ )
            // Only deal with non-null/undefined values
            if ( (options = arguments[ i ]) != null )
                // Extend the base object
                for ( var name in options ) {
                    var src = target[ name ], copy = options[ name ];

                    // Prevent never-ending loop
                    if ( target === copy )
                        continue;

                    // Recurse if we're merging object values
                    if ( deep && copy && typeof copy === "object" && !copy.nodeType )
                        target[ name ] = _extend( deep, 
                            // Never move original objects, clone them
                            src || ( copy.length != null ? [ ] : { } )
                        , copy );

                    // Don't bring in undefined values
                    else if ( copy !== undefined )
                        target[ name ] = copy;

                }

        // Return the modified object
        return target;
    }; 

    // main Function 
    Mango = function (selector, context, prevObject) {
        context = context || document;
        if(TypeOF.isString(context))
            context = document.querySelector(context);
        if(!selector) return null;
        if(selector instanceof Mango){// mango
            return selector;
        }else if(selector.nodeType || selector.document){// dom
            this[0] = selector;
            this.length = 1;
            this.context = selector;
        }else if(TypeOF.isString(selector)){// string
            this.length = 0;
            var _html = selector.match(rquickExpr);
            var _sHtml, _dom;
            if( _html ){// selector have to convert to html
                _sHtml = rtagNameExpr.exec(selector);
                if(_sHtml){
                    _dom = document.createElement(_sHtml[1]);
                    this[0] = _dom;
                    this.length = 1;
                }else{
                    _dom = document.createElement('div');
                    _dom.innerHTML = selector;
                    if(_dom.childElementCount === 1){
                        this[0] = _dom.childNodes[0];
                        this.length = 1; 
                    }else if(_dom.childElementCount > 1){
                        for(var i=0,j=_dom.childElementCount; i<j; i++){
                            this[this.length] = _dom.childNodes[i];
                            this.length++;
                        }
                    }
                    _dom = null;
                }
            } else {
                Mango.each(context.querySelectorAll(selector),function(ele, i){
                    this[this.length] = ele;
                    this.length++;
                }.bind(this));
            }
            this.context = context;
        }else if(TypeOF.isArray(selector)){//Array
            selector.forEach(function (v, i) {
                this[i] = v;
            }.bind(this));
            this.length = selector.length;
            this.context = context;
        }else if(TypeOF.isFunction(selector)){//function
            if(domReady){
                selector.call(document, this);
            }else{
                if(!domReadyCallbacks){
                    domReadyCallbacks = [];
                }
                domReadyCallbacks.push(selector);
            }
        }

        if(prevObject){
            this.prevObject = prevObject;
        }
        return this;
    };
    
    document.addEventListener('DOMContentLoaded', function () {
        domReady = true;
        var cb;
        if(domReadyCallbacks && domReadyCallbacks.length){
            while(cb = domReadyCallbacks.shift()){
                cb.call(document, mango);
            }
        }
    }, false);

    Mango.each = function (object, callback) {
        for(var i=0,j=object.length; i<j; i++){
            var result = callback.call(this, object[i], i);
            if(result === false){
                break;
            }
        }
    };
    Mango.prev = function (node) {
        return node.previousElementSibling;
    };
    Mango.next = function (node) {
        return node.nextElementSibling;
    };

    // main function for interface
    mango = (function(){
        return function (selector, context, _prevObject) {
            return new Mango(selector, context, _prevObject);
        }
    })();
    
    // merge into mango
    _extend(mango, TypeOF);
    mango.extend = _extend;
    
    Mango.prototype = {
        constructor: Mango
        ,find: function (query) {
            var self = this;
            var results = [];
            Mango.each(self, function (node) {
                if(node){
                    var r = node.querySelectorAll(query);
                    if(r){
                        Mango.each(r, function (node){
                            results.push(node);
                        });
                    }
                }
            });
            return mango(results, this, this);
        }
        // The splice which make mango to pretend to array object
        ,splice: Array.prototype.splice
        ,remove: function () {
            Mango.each(this, function (node) {
                node.parentNode.removeChild(node);
            });
            return this;
        }
        ,html: function (str) {
            var r;
            if(str){
                Mango.each(this, function (node) {
                    node.innerHTML = str;
                });
            }else{
                return this[0] && this[0].innerHTML;
            }
            return this;
        }
        ,text: function (str) {
            var r;
            if(str){
                Mango.each(this, function (node) {
                    node.innerText = str;
                });
            }else{
                return this[0] && this[0].innerText;
            }
            return this;
        }
        ,show: function () {
            Mango.each(this, function(node){
                var status = node._mangodisplaystatus;
                status = (status!==undefined) ? status : 'block';
                var d = node.style.display;
                if(d === 'none'){
                    node.style.display = status;
                }
            });
            return this;
        }
        ,hide: function () {
            Mango.each(this, function(node){
                var d = node.style.display;
                node._mangodisplaystatus = d;
                if(d !== 'none'){
                    node.style.display = 'none';
                }
            });
            return this;
        }
        ,siblings: function (filter) {///
            var results = [];
            Mango.each(this, function (node) {
                var parent = node.parentNode;
                var child = parent.childNodes;
                if(child.length){
                    for(var i=0,j=child.length; i<j; i++){
                        if(child[i] != node && child[i].nodeType === 1){
                            results.push(child[i])
                        }
                    }
                }
            });
            return mango(results);
        }
        ,add: function (selector, context) {
            var self = this;
            if(selector){
                mango(selector, context).each(function(){
                    var addNode = this;
                    var has = false;
                    self.each(function(){
                        if(addNode === this){
                            has = true;
                            return false
                        }
                    });
                    if(!has){
                        self[self.length] = addNode;
                        self.length++;
                    }
                });
            }
            return this;
        }
        ,addBack: function () {
            return this.prevObject && this.add(this.prevObject);
        }
        ,parents: function (selector) {
            var matched = [];
            this.each(function (node) {
                while(node = node.parentElement){
                    if(selector){
                        if(node.webkitMatchesSelector(selector))
                            matched.push(node);
                    }else{
                        matched.push(node);
                    }
                }
            });
            return mango(matched, this, this);
        }
        ,eq: function (i) {
            return mango(this[i], this, this);
        }
        ,get: function (i) {
            return this[i];
        }
        ,each: function (callback) {
            Mango.each(this, function (v, i) {
                return callback.call(v, v, i);
            });
            return this;
        }
        ,prop: function (name, value) {
            if(!this[0]){
                if(value === undefined){
                    return undefined;
                }
                return this;
            }
            if(TypeOF.isObject(name)){
                for(var v in name){
                    mango(this).prop(v, name[v]);
                }
                return this;
            }
            if(value !== undefined){
                Mango.each(this, function (node) {
                    node[name] = value;
                });
                return this;
            }else{
                return this[0][name];
            }
        }
        ,removeProp: function (propName) {
            return this.each(function(node){
                delete node[propName];
            });
        }
        ,attr: function (name, value) {
            if(!this[0]){
                if(value === undefined){
                    return undefined;
                }
                return this;
            }
            if(TypeOF.isObject(name)){
                for(var v in name){
                    mango(this).attr(v, name[v]);
                }
                return this;
            }
            if(value !== undefined){
                Mango.each(this, function (node) {
                    node.setAttribute(name, value+'')
                });
                return this;
            }else{
                return this[0].getAttribute(name);
            }
        }
        ,removeAttr: function (attrName) {
            if(attrName){
                Mango.each(this, function (node) {
                    node.removeAttribute(attrName);
                });
            }
            return this;
        }
        ,val: function (value) {
            if(!this[0]){
                if(value === undefined){
                    return undefined;
                }
                return this;
            }
            if(value !== undefined){
                Mango.each(this, function (node) {
                    node.value = value;
                });
                return this;
            }else{
                return this[0].value;
            }
        }
        ,data: function (name, value) {
            if(!this[0]){
                if(value === undefined){
                    return undefined;
                }
                return this;
            }
            if(TypeOF.isObject(name)){
                for(var v in name){
                    mango(this).data(v, name[v]);
                }
                return this;
            }
            if(value !== undefined){
                Mango.each(this, function (node) {
                    node.dataset[name] = value;
                });
                return this;
            }else{
                return this[0].dataset[name];
            }
        }
        ,parent: function () {
            var results = [];
            Mango.each(this, function (node) {
                var p = node.parentElement;
                if(p)
                    results.push(p);
            });
            return mango(results);
        }
        ,on: function (eventName, selector, cb) {
            var _cb = cb, eventDispacher;
            
            if(!eventName) return this;

            if(!_cb){
                _cb = selector;
                selector = null;
            }

            Mango.each(this, function (el) {
                // The private attribute '_mangodomid'
                // is make relationship between dom and Events object
                var _id = el._mangodomid;
                if(!_id){
                    _id = guid++;
                    el._mangodomid =  _id;
                    Events[_id] = {};
                }
                if(!Events[_id][eventName]){
                    Events[_id][eventName] = {
                        type: eventName
                        ,handles: []
                    };
                }

                window.Events = Events;///

                var handle = function (e) {
                    var arr, tagName, className, _el, _selector, currentTarget;
                    _el = e.srcElement;
                    // check event namespace
                    if(e._privateEvent && e._privateEvent != eventName){
                        return ;
                    }
                    
                    if(selector){
                        //!!(container.compareDocumentPosition(maybe) & 16)
                        if(_el.webkitMatchesSelector(selector)){ // check delegate element
                            _cb.call(_el, e);
                        }
                    }else{
                        _cb.call(el, e);
                    }
                }
                // Add eventListener without event namespace
                el.addEventListener(eventName.split('/')[0], handle, false);

                // push handle to Events for removeEventListener later
                Events[_id][eventName].handles.push(handle);
            });

            return this;
        }
        ,off: function (eventName) {
            if(!eventName) return this;
            Mango.each(this, function(el){
                var _id = el._mangodomid;
                if(_id){
                    Events[_id][eventName].handles.forEach(function(handle){
                        el.removeEventListener(eventName.split('/')[0], handle, false);
                    });
                    Events[_id][eventName].handles.length = 0;
                }
            });
        }
        ,hover: function (hoverIn, hoverOut) {
            if(TypeOF.isFunction(hoverIn)){
                Mango.each(this, function(el){
                    var $el = mango(el);
                    $el.on('mouseover', function(e){
                        // mouseEnter
                        if(el === e.srcElement && !el.contains(e.relatedTarget)){
                            hoverIn.call(el, e);
                        }
                    });
                    if(TypeOF.isFunction(hoverOut)){
                        $el.on('mouseout', function(e){
                            // mouseLeave
                            if(el === e.srcElement && !el.contains(e.relatedTarget)){
                                hoverOut.call(el, e);
                            }
                        });
                    }
                });
            }
            return this;
        }
        ,trigger: function (eventName) {
            var privateEvent = null, eventNamespace;
            if(!eventName) return this;

            eventNamespace = eventName.split('/');
            if(eventNamespace.length > 1){
                privateEvent = eventName;
            }
            Mango.each(this, function(el) {
                EventTrigger.trigger(el,eventNamespace[0], privateEvent);
            });
            return this;
        }
        ,one: function (eventName, delegate, cb) {
            if(!cb){
                cb = delegate;
                delegate = null;
            }
            this.each(function(node){
                var $node = mango(node);
                $node.on(eventName, delegate, function(e){
                    cb.call(this, e);
                    $node.off(eventName);
                });
            });
        }
        ,offset: function () {
            if(!this[0]){
                return {left:0, top:0};
            }
            return {left:this[0].offsetLeft, top:this[0].offsetTop};
        }
        ,css: function (p, v) {
            var s, i;
            if(!this[0]){
                if(v === undefined){
                    return undefined;
                }
                return this;
            }
            if(TypeOF.isObject(p)){
                for(var _v in p){
                    mango(this).css(_v, p[_v]);
                }
                return this;
            }
            if(v !== undefined){
                var strArr = [];
                // Uppercase the letter after the '-'
                p = p.replace(rForUpperCase, function($1,$2) {
                    return $2.toUpperCase(); 
                });
                // lowercase the first letter
                if(!rUnit.test(v)){
                    v += 'px';
                }
                Mango.each(this, function (node) {
                    node.style[p] = v;
                });
                return this;
            }else{
                s = window.getComputedStyle(this[0]);
                if(s){
                    return s[p];
                }
                return undefined;
                
            }
            return this;
        }
        ,is: function (p) {
            if(!p) return false;
            if(TypeOF.isString(p)){
                return this[0].webkitMatchesSelector(p);
            }else if(TypeOF.isObject(p) && p instanceof Mango){
                return this[0] === p[0];
            }else if(p.nodeType){
                return this[0] === p;
            }else if(TypeOF.isFunction(p)){
                return p.call(this[0]);
            }
            return false;
        }
    };

    // extend addClass,removeClass,toggleClass,hasClass
    +function(){
        var classList = {addClass: 'add', removeClass: 'remove', toggleClass: 'toggle', hasClass: 'contains'};
        for(var k in classList){
            +function(_k){
                Mango.prototype[_k] = function (className) {
                    Mango.each(this, function (node) {
                        node && node.classList[classList[_k]](className);
                    });
                    return this;
                }
            }(k);
        }
    }();
    // extend before,after
    ['before', 'after'].forEach(function(v){
        var add;
        if(v === 'before'){
            add = function (target, el, selector) {
                if(rquickExpr.test(selector)){// pure html string
                    target.insertAdjacentHTML('beforeBegin', selector);// call new api
                }else{
                    target.parentElement.insertBefore(el.cloneNode(true), target);    
                }
            }
        }else{
            add = function (target, el, selector) {
                if(rquickExpr.test(selector)){// pure html string
                    target.insertAdjacentHTML('afterEnd', selector);// call new api
                }else{
                    target.parentElement.insertBefore(el.cloneNode(true), target.nextElementSibling);
                }
            }
        }
        
        Mango.prototype[v] = function (selector) {
            var self = this, $selector = mango(selector);
            Mango.each(this, function(target){
                Mango.each($selector, function (el) {
                   add(target, el, selector);
                });
            });
            return this;
        }
    });
    // extend scrollLeft scrollTop
    ['scrollLeft', 'scrollTop'].forEach(function(v){
        Mango.prototype[v] = function (value) {
            if(TypeOF.isNumber(value)){
                this.each(function(node){
                    node[v] = value;
                });
            }
            return this[0][v];
        }
    });
    // extend append,prepend,appendTo, prependTo
    ['append','prepend'].forEach(function(v){
        var add;
        if(v === 'append'){
            add = function (parent, child, selector) {
                var c,remove;
                if(selector.length>1){
                    c = child.cloneNode(true);
                    remove = true;
                }else{
                    c = child;
                }
                parent.appendChild(c);
                if(remove){///
                    child.parentNode && child.parentNode.removeChild(child);
                }
            }
        } else {
            add = function (parent, child, selector) {
                var c,remove;
                if(selector.length>1){
                    c = child.cloneNode(true);
                    remove = true;
                }else{
                    c = child;
                }
                parent.insertBefore(c, parent.firstChild);
                if(remove){///
                    child.parentNode && child.parentNode.removeChild(child);
                }
            }
        }
        Mango.prototype[v + 'To'] = function (selector) {
            var self = this;
            Mango.each(mango(selector), function(target){
                Mango.each(self, function (el) {
                    add(target, el, selector);
                });
            });

            return this;
        }
        Mango.prototype[v] = function (child) {
            mango(child)[v + 'To'](this);
            return this;
        }
    });
    
    // extend next prev
    ['next','prev'].forEach(function(v){
        Mango.prototype[v] = function(selector){
            var results = [];
            this.each(function (node) {
                var _node = Mango[v](node);
                if(_node){
                    if(selector){
                        if(_node.webkitMatchesSelector(selector))
                            results.push(_node);
                    }else{
                        results.push(_node);
                    }
                }
            });
            return mango(results);
        }
        Mango.prototype[v + 'All'] = function (selector) {
            var results = [];
            this.each(function (node) {
                while(node = Mango[v](node)){
                    if(selector){
                        if(node.webkitMatchesSelector(selector))
                            results.push(node);
                    }else{
                        results.push(node);
                    }
                }
            });
            return mango(results);    
        }
    });
    // extend width,height,innerWidth, outerWidth, innerHeight, outerHeight
    ['Width', 'Height'].forEach(function(v) {
        var _v = v.toLowerCase();
        Mango.prototype[_v] = function (value) {
            var re;
            if(value===undefined){
                if(!this[0]) return undefined;
                re = window.getComputedStyle(this[0]);
                if(re){
                    return parseInt(re[_v]);
                }
                // return this[0]['client' + v];
            }else{
                if(typeof value === 'string'){
                    if(!rUnit.test(value)){
                        value += 'px';
                    }
                }
                this.each(function(el){
                    el.style[_v] = value;
                });
            }
            return this;
        }
        // include padding+border
        Mango.prototype['inner' + v] = function (value) {
            if(value === undefined){
                if(!this[0]) return undefined;
                return this[0]['offset' + v];
            }
            return this;
        }
        // include padding+border+margin
        Mango.prototype['outer' + v] = function (value) {
            var s, mtb, mlr;
            if(value===undefined){
                if(!this[0]) return undefined;
                s = window.getComputedStyle(this[0]);
                mtb = parseInt(s['margin-top']) + parseInt(s['margin-bottom']);
                mlr = parseInt(s['margin-left']) + parseInt(s['margin-right']);
                return this[0]['offset' + v] + ((v==='Width') ? mlr : mtb);
            }
            return this;
        }
    });    
    //Extend some events
    ['click','dblclick','focusout','mousedown','mousemove','mouseout','mouseover','mouseup', 'change',
     'select', 'focus', 'blur', 'scroll', 'resize','submit','keydown','keypress','keyup','error'].forEach(function(v){
        Mango.prototype[v] = function(cb) {
            this.each(function(node){
                !!cb ? mango(node).on(v,cb): mango(node).trigger();
            });
        }
    });
    // w3c original event model
    EventTrigger = {
        trigger: function (element, eventName, _privateEvent){
            var options = _extend(EventTrigger.defaultOptions, arguments[2] || {});
            var oEvent, eventType = null;
            var eventId;

            for (var name in EventTrigger.eventMatchers){
                if (EventTrigger.eventMatchers[name].test(eventName)) { eventType = name; break; }
            }

            if (!eventType){
                // custom event bubbling
                mango(element).parents().addBack().each(function(){
                    var _id = this['_mangodomid'];
                    if(_id){
                        Events[_id][eventName].handles.forEach(function(eventCb){
                            eventCb.call(this, {srcElement: element});
                        }.bind(this));
                    }
                });
                return ;
            }

            if (document.createEvent){
                oEvent = document.createEvent(eventType);
                oEvent._privateEvent = _privateEvent;
                if (eventType == 'HTMLEvents'){
                    oEvent.initEvent(eventName, options.bubbles, options.cancelable);
                }
                else
                {
                    oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
                    options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
                    options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
                }
                element.dispatchEvent(oEvent);
            }
            return element;
        }
        ,eventMatchers: {
            'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/
            ,'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
            ,'TouchEvents': /^(?:touch(?:start|end|move))$/
        }
        ,defaultOptions: {
            pointerX: 0,
            pointerY: 0,
            button: 0,
            ctrlKey: false,
            altKey: false,
            shiftKey: false,
            metaKey: false,
            bubbles: true,
            cancelable: true
        }
    };
    mango.param = function( a ) {
        var s = [ ];
        function add( key, value ){
            s[ s.length ] = encodeURIComponent(key) + '=' + encodeURIComponent(value);
        };
        // If an array was passed in, assume that it is an array
        // of form elements
        if ( mango.isArray(a))
            // Serialize the form elements
            Mango.each( a, function(){
                add( this.name, this.value );
            });

        // Otherwise, assume that it's an object of key/value pairs
        else
            // Serialize the key/values
            for ( var j in a )
                // If the value is an array then the key names need to be repeated
                if ( mango.isArray(a[j]) )
                    Mango.each( a[j], function(){
                        add( j, this );
                    });
                else
                    add( j, mango.isFunction(a[j]) ? a[j]() : a[j] );

        // Return the resulting serialization
        return s.join("&").replace(/%20/g, "+");
    };
    mango.ajax = function (opts) {
        var url = opts.url;
        var type = (opts.type || 'GET').toUpperCase();
        var sync = opts.sync || 'true';
        var data = opts.data;
        var sendData = null;
        var request = new XMLHttpRequest();
        var success = opts.success;

        request.onreadystatechange = function() {
            // Is send success or get the page success
            if (request.readyState==4 && request.status==200) {
                if(/json/g.test(request.getResponseHeader("Content-Type"))){//json
                    if(mango.isFunction(success)){
                        success(eval('('+request.responseText+')'));
                    }
                }else{//html,text
                    success(request.responseText);
                }
            } 
        }
        if(data !== undefined){
            if(type === 'GET'){
                url += '?' + $.param(data);
            }
        }
        request.open(type, url, sync);
        if(type === 'POST'){
            request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            sendData = $.param(data) || null;
        }
        request.send(sendData);
    };
    mango.getJSON = function (url, data, callback) {
        var head = document.getElementsByTagName("head")[0];
        var script = document.createElement("script");
        var uniqueName = 'jsonp' + Date.now() + Math.ceil(Math.random() * 10000);
        if(!callback){
            callback = data;
        }
        window[uniqueName] = callback;
        if(url){
            url = url.replace(/=\?/g, ('='+uniqueName));
        }
        if($.isObject(data)){
            url += '&';
            url += $.param(data);
        }
        script.src = url;
        script.async = true;
        // Handle Script loading
        script.onload = function(){
            head.removeChild( script );
        };

        head.appendChild(script);
    };
    // Assign mango to window
    window.mango = window.$ = mango;
    // Expose plugin interface
    window.mango.fn = Mango.prototype;
}(window);