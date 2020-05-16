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