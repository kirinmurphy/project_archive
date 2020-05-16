/**!
 * project-site: http://plugins.jquery.com/project/AjaxManager
 * repository: http://github.com/aFarkas/Ajaxmanager
 * @author Alexander Farkas
 * @version 3.10
 * Copyright 2010, Alexander Farkas
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

(function($){
	"use strict";
	var managed = {},
		cache   = {}
	;
	$.manageAjax = (function(){
		function create(name, opts){
			managed[name] = new $.manageAjax._manager(name, opts);
			return managed[name];
		}
		
		function destroy(name){
			if(managed[name]){
				managed[name].clear(true);
				delete managed[name];
			}
		}

		
		var publicFns = {
			create: create,
			destroy: destroy
		};
		
		return publicFns;
	})();
	
	$.manageAjax._manager = function(name, opts){
		this.requests = {};
		this.inProgress = 0;
		this.name = name;
		this.qName = name;
		
		this.opts = $.extend({}, $.ajaxSettings, $.manageAjax.defaults, opts);
		if(opts && opts.queue && opts.queue !== true && typeof opts.queue === 'string' && opts.queue !== 'clear'){
			this.qName = opts.queue;
		}
	};
	
	$.manageAjax._manager.prototype = {
		add: function(o){
			o = $.extend({}, this.opts, o);
			
			var origCom		= o.complete || $.noop,
				origSuc		= o.success || $.noop,
				beforeSend	= o.beforeSend || $.noop,
				origError 	= o.error || $.noop,
				strData 	= (typeof o.data == 'string') ? o.data : $.param(o.data || {}),
				xhrID 		= o.type + o.url + strData,
				that 		= this,
				ajaxFn 		= this._createAjax(xhrID, o, origSuc, origCom)
			;
			if(o.preventDoubbleRequests && o.queueDuplicateRequests){
				if(o.preventDoubbleRequests){
					o.queueDuplicateRequests = false;
				}
				setTimeout(function(){
					throw("preventDoubbleRequests and queueDuplicateRequests can't be both true");
				}, 0);
			}
			if(this.requests[xhrID] && o.preventDoubbleRequests){
				return;
			}
			ajaxFn.xhrID = xhrID;
			o.xhrID = xhrID;
			
			o.beforeSend = function(xhr, opts){
				var ret = beforeSend.call(this, xhr, opts);
				if(ret === false){
					that._removeXHR(xhrID);
				}
				xhr = null;
				return ret;
			};
			o.complete = function(xhr, status){
				that._complete.call(that, this, origCom, xhr, status, xhrID, o);
				xhr = null;
			};
			
			o.success = function(data, status, xhr){
				that._success.call(that, this, origSuc, data, status, xhr, o);
				xhr = null;
			};
						
			//always add some error callback
			o.error =  function(ahr, status, errorStr){
				var httpStatus 	= '',
					content 	= ''
				;
				if(status !== 'timeout' && ahr){
					httpStatus = ahr.status;
					content = ahr.responseXML || ahr.responseText;
				}
				if(origError) {
					origError.call(this, ahr, status, errorStr, o);
				} else {
					setTimeout(function(){
						throw status + '| status: ' + httpStatus + ' | URL: ' + o.url + ' | data: '+ strData + ' | thrown: '+ errorStr + ' | response: '+ content;
					}, 0);
				}
				ahr = null;
			};
			
			if(o.queue === 'clear'){
				$(document).clearQueue(this.qName);
			}
			
			if(o.queue || (o.queueDuplicateRequests && this.requests[xhrID])){
				$.queue(document, this.qName, ajaxFn);
				if(this.inProgress < o.maxRequests && (!this.requests[xhrID] || !o.queueDuplicateRequests)){
					$.dequeue(document, this.qName);
				}
				return xhrID;
			}
			return ajaxFn();
		},
		_createAjax: function(id, o, origSuc, origCom){
			var that = this;
			return function(){
				if(o.beforeCreate.call(o.context || that, id, o) === false){return;}
				that.inProgress++;
				if(that.inProgress === 1){
					$.event.trigger(that.name +'AjaxStart');
				}
				if(o.cacheResponse && cache[id]){
					if(!cache[id].cacheTTL || cache[id].cacheTTL < 0 || ((new Date().getTime() - cache[id].timestamp) < cache[id].cacheTTL)){
                        that.requests[id] = {};
                        setTimeout(function(){
							that._success.call(that, o.context || o, origSuc, cache[id]._successData, 'success', cache[id], o);
                        	that._complete.call(that, o.context || o, origCom, cache[id], 'success', id, o);
                        }, 0);
                    } else {
						 delete cache[id];
					}
				} 
				if(!o.cacheResponse || !cache[id]) {
					if (o.async) {
						that.requests[id] = $.ajax(o);
					} else {
						$.ajax(o);
					}
				}
				return id;
			};
		},
		_removeXHR: function(xhrID){
			if(this.opts.queue || this.opts.queueDuplicateRequests){
				$.dequeue(document, this.qName);
			}
			this.inProgress--;
			this.requests[xhrID] = null;
			delete this.requests[xhrID];
		},
		clearCache: function () {
            cache = {};
        },
		_isAbort: function(xhr, status, o){
			if(!o.abortIsNoSuccess || (!xhr && !status)){
				return false;
			}
			var ret = !!(  ( !xhr || xhr.readyState === 0 || this.lastAbort === o.xhrID ) );
			xhr = null;
			return ret;
		},
		_complete: function(context, origFn, xhr, status, xhrID, o){
			if(this._isAbort(xhr, status, o)){
				status = 'abort';
				o.abort.call(context, xhr, status, o);
			}
			origFn.call(context, xhr, status, o);
			
			$.event.trigger(this.name +'AjaxComplete', [xhr, status, o]);
			
			if(o.domCompleteTrigger){
				$(o.domCompleteTrigger)
					.trigger(this.name +'DOMComplete', [xhr, status, o])
					.trigger('DOMComplete', [xhr, status, o])
				;
			}
			
			this._removeXHR(xhrID);
			if(!this.inProgress){
				$.event.trigger(this.name +'AjaxStop');
			}
			xhr = null;
		},
		_success: function(context, origFn, data, status, xhr, o){
			var that = this;
			if(this._isAbort(xhr, status, o)){
				xhr = null;
				return;
			}
			if(o.abortOld){
				$.each(this.requests, function(name){
					if(name === o.xhrID){
						return false;
					}
					that.abort(name);
				});
			}
			if(o.cacheResponse && !cache[o.xhrID]){
				if(!xhr){
					xhr = {};
				}
				cache[o.xhrID] = {
					status: xhr.status,
					statusText: xhr.statusText,
					responseText: xhr.responseText,
					responseXML: xhr.responseXML,
					_successData: data,
					cacheTTL: o.cacheTTL, 
					timestamp: new Date().getTime()
				};
				if('getAllResponseHeaders' in xhr){
					var responseHeaders = xhr.getAllResponseHeaders();
					var parsedHeaders;
					var parseHeaders = function(){
						if(parsedHeaders){return;}
						parsedHeaders = {};
						$.each(responseHeaders.split("\n"), function(i, headerLine){
							var delimiter = headerLine.indexOf(":");
		                    parsedHeaders[headerLine.substr(0, delimiter)] = headerLine.substr(delimiter + 2);
						});
					};
					$.extend(cache[o.xhrID], {
						getAllResponseHeaders: function() {return responseHeaders;},
						getResponseHeader: function(name) {
							parseHeaders();
							return (name in parsedHeaders) ? parsedHeaders[name] : null;
						}
					});
				}
			}
			origFn.call(context, data, status, xhr, o);
			$.event.trigger(this.name +'AjaxSuccess', [xhr, o, data]);
			if(o.domSuccessTrigger){
				$(o.domSuccessTrigger)
					.trigger(this.name +'DOMSuccess', [data, o])
					.trigger('DOMSuccess', [data, o])
				;
			}
			xhr = null;
		},
		getData: function(id){
			if( id ){
				var ret = this.requests[id];
				if(!ret && this.opts.queue) {
					ret = $.grep($(document).queue(this.qName), function(fn, i){
						return (fn.xhrID === id);
					})[0];
				}
				return ret;
			}
			return {
				requests: this.requests,
				queue: (this.opts.queue) ? $(document).queue(this.qName) : [],
				inProgress: this.inProgress
			};
		},
		abort: function(id){
			var xhr;
			if(id){
				xhr = this.getData(id);
				
				if(xhr && xhr.abort){
					this.lastAbort = id;
					xhr.abort();
					this.lastAbort = false;
				} else {
					$(document).queue(
						this.qName, $.grep($(document).queue(this.qName), function(fn, i){
							return (fn !== xhr);
						})
					);
				}
				xhr = null;
				return;
			}
			
			var that 	= this,
				ids 	= []
			;
			$.each(this.requests, function(id){
				ids.push(id);
			});
			$.each(ids, function(i, id){
				that.abort(id);
			});
		},
		clear: function(shouldAbort){
			$(document).clearQueue(this.qName); 
			if(shouldAbort){
				this.abort();
			}
		}
	};
	$.manageAjax._manager.prototype.getXHR = $.manageAjax._manager.prototype.getData;
	$.manageAjax.defaults = {
		beforeCreate: $.noop,
		abort: $.noop,
		abortIsNoSuccess: true,
		maxRequests: 1,
		cacheResponse: false,
		domCompleteTrigger: false,
		domSuccessTrigger: false,
		preventDoubbleRequests: true,
		queueDuplicateRequests: false,
		cacheTTL: -1,
		queue: false // true, false, clear
	};
	
	$.each($.manageAjax._manager.prototype, function(n, fn){
		if(n.indexOf('_') === 0 || !$.isFunction(fn)){return;}
		$.manageAjax[n] =  function(name, o){
			if(!managed[name]){
				if(n === 'add'){
					$.manageAjax.create(name, o);
				} else {
					return;
				}
			}
			var args = Array.prototype.slice.call(arguments, 1);
			managed[name][n].apply(managed[name], args);
		};
	});
	
})(jQuery);


// jquery Wrapper for ajaxmanager plugin

(function($) {

    var initializedManagers = [];

    function extendedAjax(opts) {
        var managerSettings = {
            queue: true,
            abortOld: true,
            maxRequests: 1,
            preventDoubbleRequests: true
        }

        var rand = Math.floor(Math.random() * 10001);

        var settings = {
            queueName: 'queue-' + rand,
            disableElements: [],
            animateElements: [],
            disableAndAnimateElements: [],
            animationClass: 'pending',
            disabledClass: 'disabled',
            manager: managerSettings
        };

        $.extend(settings, opts);
        $.extend(managerSettings, opts.manager); // allows separate overriding of individual manager settings
        settings.manager = managerSettings;

        if (settings.disableAndAnimateElements.length > 0) {
            settings.disableElements.push(settings.disableAndAnimateElements);
            settings.animateElements.push(settings.disableAndAnimateElements);
        }

        var manager = null;
        if (settings.queueName in initializedManagers) {
            manager = initializedManagers[settings.queueName];
        } else {
            manager = $.manageAjax.create(settings.queueName, settings.manager);
            initializedManagers[settings.queueName] = manager;
        }

        $.each(settings.disableElements, function(idx, val) {
            $(val).addClass(settings.disabledClass)
                .attr('disabled', 'disabled');
        });

        $.each(settings.animateElements, function(idx, val) {
            $(val).addClass(settings.animationClass);
        });

        if (settings.complete != undefined)
            settings.origComplete = settings.complete;

        settings.complete = function(xhr, status) {
            if (settings.origComplete != undefined)
                settings.origComplete.apply(this, [xhr, status]);

            $.each(settings.disableElements, function(idx, val) {
                $(val).removeClass(settings.disabledClass)
                    .removeAttr('disabled');
            })
            $.each(settings.animateElements, function(idx, val) {
                $(val).removeClass(settings.animationClass);
            })
        };

        if (settings.manager.abortOld)
            manager.abort();

        manager.add(settings);

        return this;
    }

    $.extendedajax = function(opts) {
        return new extendedAjax(opts);
    }

    $.extendedget = function(url, data, callback, type, opts) {
        // shift arguments if data argument was omited
        if (jQuery.isFunction(data)) {
            opts = opts || type;
            type = (type instanceof Array ? callback : undefined);
            callback = data;
            data = null;
        }

        return jQuery.extendedajax($.extend({
            type: "GET",
            url: url,
            data: data,
            success: callback,
            dataType: type
        }, opts));
    }

    $.extendedpost = function(url, data, callback, type, opts) {
        // shift arguments if data argument was omited
        if (jQuery.isFunction(data)) {
            opts = opts || type;
            type = (type instanceof Array ? callback : undefined);
            callback = data;
            data = {};
        }

        return jQuery.extendedajax($.extend({
            type: "POST",
            url: url,
            data: data,
            success: callback,
            dataType: type
        }, opts));
    }

    $.extendedgetScript = function(url, callback, opts) {
        return jQuery.extendedget(url, null, callback, "script", opts);
    }

    $.extendedgetJSON = function(url, data, callback, opts) {
        return jQuery.extendedget(url, data, callback, "json", opts);
    }

    $.abortQueue = function(queueName) {
        var manager = null;
        if (queueName in initializedManagers) {
            manager = initializedManagers[queueName];
            manager.abort();
        }
    }

    // new load function to utilize this new extended ajax function
    // this is a straight up copy of the original jQuery function, with some tweaks to allow the new options
    jQuery.fn.extend({
        extendedload: function(url, params, callback, opts) {
            if (typeof url !== "string") {
                return this._load(url);

                // Don't do a request if no elements are being requested
            } else if (!this.length) {
                return this;
            }

            var off = url.indexOf(" ");
            if (off >= 0) {
                var selector = url.slice(off, url.length);
                url = url.slice(0, off);
            }

            // Default to a GET request
            var type = "GET";

            // If the second parameter was provided
            if (params) {
                // If it's a function
                if (jQuery.isFunction(params)) {
                    // We assume that it's the callback
                    opts = callback;
                    callback = params;
                    params = null;

                    // Otherwise, build a param string
                } else if (typeof params === "object") {
                    params = jQuery.param(params, jQuery.ajaxSettings.traditional);
                    type = "POST";
                }
            }
            // If the third parameter was provided
            if (callback) {
                // If it's not a function
                if (!jQuery.isFunction(callback)) {
                    // We assume it's the additional options
                    opts = callback;
                    callback = null;
                }
            }

            var self = this;

            // Request the remote document
            jQuery.extendedajax($.extend({
                url: url,
                type: type,
                dataType: "html",
                data: params,
                complete: function(res, status) {
                    // If successful, inject the HTML into all the matched elements
                    if (status === "success" || status === "notmodified") {
                        // See if a selector was specified
                        self.html(selector ?
                        // Create a dummy div to hold the results
						jQuery("<div />")
                        // inject the contents of the document in, removing the scripts
                        // to avoid any 'Permission Denied' errors in IE
							.append(res.responseText.replace(rscript, ""))

                        // Locate the specified elements
							.find(selector) :

                        // If not, just inject the full result
						res.responseText);
                    }

                    if (callback) {
                        self.each(callback, [res.responseText, status, res]);
                    }
                }
            }, opts));

            return this;
        }
    });
})(jQuery);