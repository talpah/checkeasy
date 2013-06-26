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
    function CheckEasy(element, actionList) {
        if (element == undefined || actionList == undefined) {
            throw new Error("CheckEasy: Invalid arguments.");
        }
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

    CheckEasy.prototype.init = function (element) {
        if (typeof element == 'string') {
            element.replace('#', '');
            element = $('#' + element);
        }
        this._tableHeader = element.children('thead');
        this._data = element.children('tbody').children('tr').get();
        this._dataLength = this._data.length;
        this._setupActions();
        this._zoomContainer.appendTo(this._zoomDimmer);
        this._zoomDimmer.appendTo(document.body);

    };

    CheckEasy.prototype.zoom = function () {
        this._zoomContainer.html("");
        var element = this.current();
        var zoomElement = $('<table />');
        this._tableHeader.clone().appendTo(zoomElement);
        element.clone().appendTo(zoomElement);
        zoomElement.appendTo(this._zoomContainer);
        element.addClass('zoomIndicator');
        this.enableDimmer();
    };

    CheckEasy.prototype.unzoom = function () {
        $('.zoomIndicator').removeClass('zoomIndicator');
        this._zoomContainer.html("");
        this.disableDimmer();
        this._cursor = 0;
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
            $('<dt>' + element.key + '</dt><dd>' + key + '</dd>').appendTo(actionLegend);

        });
        actionLegend.appendTo(this._zoomDimmer);
    };

    return CheckEasy;
})();