/**
 * CheckEasy Table Zoomer (ish)
 *
 * @author Cosmin "talpah" Iancu - 2013
 * @license WTFPL - http://www.wtfpl.net/ - see copying.txt for full license
 * @
 */
var CheckEasy;
CheckEasy = (function () {
    /* Constructor */
    function CheckEasy(element, actionList, options) {
        if (element == undefined || actionList == undefined) {
            throw new Error("CheckEasy: Invalid arguments.");
        }

        this._defaultOptions = {
            zoomStyle           : 'single',
            zoomStyleClassPrefix: 'fade-',
            inlineSearch        : false,
            header              : null,
            onZoom              : null,
            onUnZoom            : null
        };
        this._options = this._defaultOptions;
        for (var option in options) {
            this._options[option] = options[option];
        }

        this._elements = null;
        this._tableHeader = null;
        this._data = [];
        this._dataLength = 0;
        this._cursor = 0;
        this._zoomDimmer = $('<div id="zoomDimmer" class="zoomDimmer" />');
        this._zoomContainer = $('<div id="zoomContainer" class="zoomContainer" />');
        this._actionLegend = $('<dl id="actionLegend" class="actionLegend"></dl>');
        this._actionList = actionList;
        this.init(element);
    }

    CheckEasy.prototype.init = function (elements) {
        if (typeof elements == 'string') {
            elements = $(elements);
        }
        if (elements.length == 0) {
            throw new Error('CheckEasy: Selector returned no elements.');
        }
        this._elements = elements;
        this._tableHeader = $(this._getOption('header'));
        this._data = elements.get();
        this._dataLength = this._data.length;
        this._setupActions();
        this._zoomContainer.appendTo(this._zoomDimmer);
        this._zoomDimmer.appendTo(document.body);

    };

    CheckEasy.prototype.zoom = function () {
        this._zoomContainer.html("");
        var zoomElement = $('<div />');
        if (this._getOption('header')) {
            this._tableHeader.clone().appendTo(zoomElement);
        }
        var zoomStyle = this._getOption('zoomStyle');
        if (zoomStyle == 'single') {
            var element = this.current();
            var currentElement = element.clone().appendTo(zoomElement);
            element.addClass('zoomIndicator');
        } else if (this.isNumber(zoomStyle)) {
            zoomStyle = parseInt(zoomStyle);
            var zoomStyleClassPrefix = this._getOption('zoomStyleClassPrefix');
            var currentIndex = 0;

            /* Previous <zoomStyle> elements */
            currentIndex = zoomStyle;
            for (var i = (this._cursor - zoomStyle); i < this._cursor; i++) {
                var element = this.getElementAt(i);
                element.clone().addClass(zoomStyleClassPrefix + 'prev-' + currentIndex).appendTo(zoomElement);
                currentIndex--;
            }
            /* Current element */
            var element = this.current();
            var currentElement = element.clone().addClass('zoomIndicator').appendTo(zoomElement);
            /* Next <zoomStyle> elements */
            currentIndex = 0;
            for (var i = (this._cursor + 1); i < (this._cursor + zoomStyle + 1); i++) {
                currentIndex++;
                var element = this.getElementAt(i);
                element.clone().addClass(zoomStyleClassPrefix + 'next-' + currentIndex).appendTo(zoomElement);
            }
        }
        zoomElement.appendTo(this._zoomContainer);

        this.enableDimmer();
        /* Callback */
        if (this._getOption('onZoom')) {
            this._getOption('onZoom').call(this, currentElement);
        }
    };

    CheckEasy.prototype.unzoom = function () {
        $('.zoomIndicator').removeClass('zoomIndicator');
        this._zoomContainer.html("");
        this.disableDimmer();
        this._cursor = 0;
        /* Callback */
        if (this._getOption('onUnZoom')) {
            this._getOption('onUnZoom').call(this);
        }
    };

    CheckEasy.prototype.enableDimmer = function () {
        this._zoomContainer.css({
            width : $(window).width(),
            height: $(window).height()
        });
        this._zoomDimmer.css({display: "table" });
    };

    CheckEasy.prototype.disableDimmer = function () {
        this._zoomDimmer.hide();
    };

    CheckEasy.prototype.current = function () {
        return $(this._data[this._cursor]);
    };

    CheckEasy.prototype.getElementAt = function (position) {
        var element = $(this._data[position]);
        if (element.length == 0) {
            element = $('<div class="zoom-empty-row">&nbsp;</div>');
        }
        return element;
    };

    CheckEasy.prototype.zoomHome = function () {
        this.current().removeClass('zoomIndicator');
        this._cursor = 0;
        this.zoom();
    };

    CheckEasy.prototype.zoomEnd = function () {
        this.current().removeClass('zoomIndicator');
        this._cursor = this._dataLength - 1;
        this.zoom();
    };

    CheckEasy.prototype.zoomNext = function () {
        this._next().zoom();
    };

    CheckEasy.prototype.zoomPrev = function () {
        this._prev().zoom();
    };

    CheckEasy.prototype._next = function () {
        this.current().removeClass('zoomIndicator');
        if (this._cursor == this._dataLength - 1) {
            this._cursor = 0;
        } else {
            this._cursor++;
        }
        return this;
    };

    CheckEasy.prototype._prev = function () {
        this.current().removeClass('zoomIndicator');
        if (this._cursor == 0) {
            this._cursor = this._dataLength - 1;
        } else {
            this._cursor--;
        }
        return this;
    };

    CheckEasy.prototype._setupActions = function () {
        var actionLegend = this._actionLegend;
        $.each(this._actionList, function (key, element) {
            if (!element.hasOwnProperty('key') || !element.hasOwnProperty('action') || !(typeof element.action == 'function')) {
                throw new Error('CheckEasy: Invalid actions provided.');
            }
            var shortcutValue;
            if (element.key.indexOf(',') > -1) {
                shortcutValue = element.key.split(',');
            } else {
                shortcutValue = [element.key];
            }
            $.each(shortcutValue, function (index, shortcutKey) {
                shortcut.add(shortcutKey.trim(), element.action, {
                    'type'     : 'keydown',
                    'propagate': false,
                    'target'   : document
                })
            });
            $('<dt id="action-legend-key-' + element.key + '">' + element.key + '</dt>').click(element.action).appendTo(actionLegend);
            $('<dd id="action-legend-label-' + element.key + '">' + key + '</dd>').click(element.action).appendTo(actionLegend);

        });
        actionLegend.appendTo(this._zoomDimmer);
    };

    CheckEasy.prototype._handleKeypress = function(event) {
        console.log(event);
    };

    CheckEasy.prototype._setupInlineSearch = function() {
        var keys = 'abcdefghijklmonpqrstuvwxyz1234567890.,'.split('');
        for (var key in keys) {
            shortcut.add(keys[key], this._handleKeypress, {
                'type'     : 'keydown',
                'propagate': false,
                'target'   : document
            });
        }
    };

    CheckEasy.prototype._getOption = function (option) {
        return this._options[option];
    };

    CheckEasy.prototype.isNumber = function (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    };

    return CheckEasy;
})();