/**
 * JavaScript Shortcuts Library (jQuery plugin) v0.7
 * http://www.stepanreznikov.com/js-shortcuts/
 * Copyright (c) 2010 Stepan Reznikov (stepan.reznikov@gmail.com)
 * Date: 2010-08-08
 */

/*global jQuery */

;
(function ($, window, document, undefined) {

    var Shortcuts = function () {

        /** Special keys */
        this._special = {
            'backspace': 8,
            'tab'      : 9,
            'enter'    : 13,
            'return'   : 13,
            'pause'    : 19,
            'capslock' : 20,
            'esc'      : 27,
            'space'    : 32,
            'pageup'   : 33,
            'pagedown' : 34,
            'end'      : 35,
            'home'     : 36,
            'left'     : 37,
            'up'       : 38,
            'right'    : 39,
            'down'     : 40,
            'insert'   : 45,
            'delete'   : [46, 110],
            'f1'       : 112,
            'f2'       : 113,
            'f3'       : 114,
            'f4'       : 115,
            'f5'       : 116,
            'f6'       : 117,
            'f7'       : 118,
            'f8'       : 119,
            'f9'       : 120,
            'f10'      : 121,
            'f11'      : 122,
            'f12'      : 123,
            '0'        : [96, 48],
            '1'        : [97, 49],
            '2'        : [98, 50],
            '3'        : [99, 51],
            '4'        : [100, 52],
            '5'        : [101, 53],
            '6'        : [102, 54],
            '7'        : [103, 55],
            '8'        : [104, 56],
            '9'        : [105, 57],
            '?'        : 191, // Question mark
            '.'        : 190,
            'dot'      : 190,
            'comma'    : 188,
            'minus'    : [173, 189, 109],
            'plus'     : [61, 187, 107]
        };

        /** Hash for shortcut lists */
        this._lists = {};

        /** Active shortcut list */
        this._active;

        /** Hash for storing which keys are pressed at the moment. Key - ASCII key code (e.which), value - true/false. */
        this._pressed = {};

        this._isStarted = false;
    }
    Shortcuts.prototype.__getKey = function (type, maskObj) {
        var key = type;

        if (maskObj.ctrl) {
            key += '_ctrl';
        }
        if (maskObj.alt) {
            key += '_alt';
        }
        if (maskObj.shift) {
            key += '_shift';
        }

        var keyMaker = function (objKey, which, mask) {
            if (which && which !== 16 && which !== 17 && which !== 18) {
                objKey += '_' + which;
            }
            if (objKey.indexOf('_') == -1) {
                if (mask == ',') {
                    objKey += '_comma';
                } else {
                    objKey += '_' + mask;
                }
            }
            return objKey;
        };

        if ($.isArray(maskObj.which)) {
            var keys = [];
            $.each(maskObj.which, function (i, which) {
                keys.push(keyMaker(key, which, maskObj.mask));
            });
            return keys;
        } else {
            return keyMaker(key, maskObj.which, maskObj.mask);
        }
    };

    Shortcuts.prototype.__getMaskObject = function (mask) {
        var obj = {};
        var items = mask.split('+');
        var $this = this;

        obj.mask = mask;

        $.each(items, function (i, item) {
            if (item === 'ctrl' || item === 'alt' || item === 'shift') {
                obj[item] = true;
            } else {
                obj.which = $this._special[item.toLowerCase()] || item.toUpperCase().charCodeAt();
            }
        });
        return obj;
    };

    Shortcuts.prototype.__checkIsInput = function (target) {
        var name = target.tagName.toLowerCase();
        var type = target.type;
        return (name === 'input' && $.inArray(type, ['text', 'password', 'file', 'search']) > -1) || name === 'textarea';
    };

    Shortcuts.prototype.__run = function (type, e) {
        if (!this._active) {
            return;
        }

        var maskObj = {
            ctrl : e.ctrlKey,
            alt  : e.altKey,
            shift: e.shiftKey,
            which: e.which
        };

        var key = this.__getKey(type, maskObj);
        var shortcuts = this._active[key]; // Get shortcuts from the active list.

        if (!shortcuts) {
            return;
        }

        var isInput = this.__checkIsInput(e.target);
        var isPrevented = false;
        var $this = this;
        $.each(shortcuts, function (i, shortcut) {
            // If not in input or this shortcut is enabled in inputs.
            if (!isInput || shortcut.enableInInput) {
                if (!isPrevented) {
                    e.preventDefault();
                    isPrevented = true;
                }
                if (shortcut.mask.length == 1) {
                    e.char = shortcut.mask;
                } else if (e.which == $this._special.space) {
                    e.char = ' ';
                } else if (e.which == $this._special.comma) {
                    e.char = ',';
                } else if (e.which == $this._special.dot) {
                    e.char = '.';
                } else if ($.inArray(e.which, $this._special.minus) > -1) {
                    e.char = '-';
                } else if ($.inArray(e.which, $this._special.plus) > -1) {
                    e.char = '+';
                }
                shortcut.handler.call(
                    $this,
                    e
                );
            }
        });
    };

    /**
     * Start reacting to shortcuts in the specified list.
     * @param {String} [list] List name
     */
    Shortcuts.prototype.start = function (list) {
        list = list || 'default';
        this._active = this._lists[list]; // Set the list as active.
        var $this = this;

        if (this._isStarted) {
            return this;
        } // We are going to attach event handlers only once, the first time this method is called.

        $(document).bind('keydown' + '.shortcuts', function (e) {
            // For a-z keydown and keyup the range is 65-90 and for keypress it's 97-122.
            if (e.type === 'keypress' && e.which >= 97 && e.which <= 122) {
                e.which = e.which - 32;
            }
            if (!$this._pressed[e.which]) {
                $this.__run('down', e);
            }
            $this._pressed[e.which] = true;
            $this.__run('hold', e);
        });

        $(document).bind('keyup.shortcuts', function (e) {
            $this._pressed[e.which] = false;
            $this.__run('up', e);
        });

        this._isStarted = true;

        return this;
    };

    /**
     * Stop reacting to shortcuts (unbind event handlers).
     */
    Shortcuts.prototype.stop = function () {
        $(document).unbind('keypress.shortcuts keydown.shortcuts keyup.shortcuts');
        this._isStarted = false;
        return this;
    };

    /**
     * Add a shortcut.
     * @param {Object}   params         Shortcut parameters.
     * @param {String}  [params.type]   The type of event to be used for running the shortcut's handler.
     *     Possible values:
     *     down – On key down (default value).
     *     up   – On key up.
     *     hold – On pressing and holding down the key. The handler will be called immediately
     *            after pressing the key and then repeatedly while the key is held down.
     *
     * @param {String}   params.mask    A string specifying the key combination.
     *     Consists of key names separated by a plus sign. Case insensitive.
     *     Examples: 'Down', 'Esc', 'Shift+Up', 'ctrl+a'.
     *
     * @param {Function} params.handler A function to be called when the key combination is pressed. The event object will be passed to it.
     * @param {String}  [params.list]   You can organize your shortcuts into lists and then switch between them.
     *     By default shortcuts are added to the 'default' list.
     * @param {Boolean} [params.enableInInput] Whether to enable execution of the shortcut in input fields and textareas. Disabled by default.
     */
    Shortcuts.prototype.add = function (params) {
        if (!params.mask) {
            throw new Error("$.this.add: required parameter 'params.mask' is undefined.");
        }
        if (!params.handler) {
            throw new Error("$.this.add: required parameter 'params.handler' is undefined.");
        }

        var type = params.type || 'down';
        var listNames = params.list ? params.list.replace(/\s+/g, '').split(',') : ['default'];
        var $this = this;

        $.each(listNames, function (i, name) {
            if (!$this._lists[name]) {
                $this._lists[name] = {};
            }
            var list = $this._lists[name];
            var masks = params.mask.toLowerCase().replace(/\s+/g, '').split(',');

            $.each(masks, function (i, mask) {
                var maskObj = $this.__getMaskObject(mask);
                var keys = $this.__getKey(type, maskObj);
                if (!$.isArray(keys)) {
                    keys = [keys];
                }
                $.each(keys, function (i, key) {
                    if (!list[key]) {
                        list[key] = [];
                    }
                    list[key].push(params);
                });
            });
        });

        if (!this._isStarted) {
            this.start();
        }

        return this;
    };

    /**
     * Remove a shortcut.
     * @param {Object}  params       Shortcut parameters.
     * @param {String} [params.type] Event type (down|up|hold). Default: 'down'.
     * @param {String}  params.mask  Key combination.
     * @param {String} [params.list] A list from which to remove the shortcut. Default: 'default'.
     */
    Shortcuts.prototype.remove = function (params) {
        if (!params.mask) {
            throw new Error("$.this.remove: required parameter 'params.mask' is undefined.");
        }

        var type = params.type || 'down';
        var listNames = params.list ? params.list.replace(/\s+/g, '').split(',') : ['default'];
        var $this = this;

        $.each(listNames, function (i, name) {
            if (!$this._lists[name]) {
                return this;
            } // continue
            var masks = params.mask.toLowerCase().replace(/\s+/g, '').split(',');

            $.each(masks, function (i, mask) {
                var maskObj = $this.__getMaskObject(mask);
                var keys = $this.__getKey(type, maskObj);
                if (!$.isArray(keys)) {
                    keys = [keys];
                }

                $.each(keys, function (i, key) {
                    delete $this._lists[name][key];
                });
            });
        });

        return this;
    };

    $.shortcuts = new Shortcuts;

})
    (jQuery, window, document);