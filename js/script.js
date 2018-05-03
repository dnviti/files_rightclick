var RightClick = RightClick || {};

(function(window, $, exports, undefined) {
    'use strict';

    // Object where all options are listed for one (sub)menu
    exports.Options = function (options) {
        this.options = [];

        this.getIndexFromOptionName = function (name) {
            return this.getNbrOfOptions(); // TODO
        }

        // Add one or more options
        this.add = function (options, index) {
            if (!(typeof index === 'number'))
                index = this.getIndexFromOptionName(index);

            if (index === undefined)
                index = this.getNbrOfOptions();

            if (typeof options === 'string' || typeof options === 'number')
                options = new exports.Option(options);

            if (options instanceof exports.Option)
                this.options.splice(index, 0, options);
            else if (options !== undefined && Array.isArray(options)) {
                for (var name in options) {
                    var option = options[name];

                    if (typeof option !== 'function') {
                        if (typeof option === 'string' || typeof option === 'number')
                            option = new exports.Option(option);
                    }

                    if (option instanceof exports.Option)
                        this.options.splice(index, 0, option);
                }
            }

            return this;
        };

        this.prepend = function (options) {
            return this.add(options, 0);
        }

        this.append = function (options) {
            return this.add(options, this.getNbrOfOptions());
        }

        // Generate all options html
        this.generate = function () {
            var ul = $('<ul>');

            for (var name in this.options) {
                var li = this.options[name].generate();

                li.addClass('action-' + name);
                ul.append(li);
            }

            return ul;
        }

        this.getNbrOfOptions = function () {
            return this.options.length;
        }

        this.isDisabled = function () {
            for (var name in this.options) {
                if (!this.options[name].isDisabled())
                    return false;
            }

            return true;
        }

        this.isFirstDisabled = function () {
            if (this.getNbrOfOptions() === 0)
                return true;
            else
                return this.options[Object.keys(this.options)[0]].isDisabled();
        }

        this.add(options);
    }

    exports.Option = function (name, text, icon, onClick, subOptions) {
        this.namee = name;
        this.text = text;
        this.icon = icon;
        this.onClick = onClick;
        this.subOptions = subOptions;

        this.generate = function () {
            var a = $('<a>');
            var iconSpan = $('<span>', {
                'class': this.icon
            });
            var textSpan = $('<span>', {
                'text': this.text
            });

            if (this.onClick === undefined) {
                a.attr('disabled', true).css({
                    'cursor': 'default',
                    'background-color': '#AAA'
                });

                iconSpan.css('cursor', 'default');
                textSpan.css('cursor', 'default');
            }

            return $('<li>', {
                'class': 'action action-' + name
            }).on('click', onClick).append(a.append(iconSpan).append(textSpan));
        };

        this.isDisabled = function () {
            return this.onClick === undefined;
        }
    }

    exports.menus = [];
    exports.Menu = function (context, options, zIndex, onClose) {
        this.context = $(context);
        this.options = options || new exports.Options();
        this.params = {
            'z-index': zIndex || 100
        };
        this.onClose = onClose;
        this.isOpened = false;
        var menu = this;

        if (context === undefined)
            return undefined;

        var onClick = function (event) {
            event.stopPropagation();
            event.preventDefault();

            var $this = $(this);
            var options = menu.options;
            var params = menu.params;

            if (exports.closeAllMenus() === false)
                return false;

            menu.attachedEvent = event;
            menu.isOpened = true;

            if (typeof options === "function")
                options = options(event);

            if (options.getNbrOfOptions() === 0)
                return;

            var div = $('<div>', {
                'id': 'rightClickMenu',
                'class': 'bubble open'
            }).append(options.generate());

            div.appendTo($this);

            var top = event.pageY + $this.position().top - $this.offset().top + 15;
            var left = event.pageX + $this.position().left - $this.offset().left - (div.width() / 2) - 5;

            div.css({
                'top': top,
                'left': left,
                'right': 'auto',
                'z-index': params['z-index']
            });

            var optionsDisabled = options.isDisabled();

            if (optionsDisabled)
                div.css('background-color', '#AAA');

            $('style.rightClickStyle').text('#rightClickMenu:after{transform:translateX(-50%);left:' + (div.width() / 2) + 'px;' + (optionsDisabled || options.isFirstDisabled() ? 'border-bottom-color:#AAA;' : '') + '}');

            return false;
        }

        this.close = function () {
            var opened = this.context.find('#rightClickMenu');

            if (opened.length > 0) {
                if (this.onClose) {
                    if (this.onClose(this.attachedEvent, this.context) === false)
                        return false;
                }

                opened.remove();
            }

            return true;
        }

        this.context.contextmenu(onClick);
        exports.menus.push(this);
    };

    exports.closeAllMenus = function () {
        for (var i in exports.menus) {
            if (exports.menus.hasOwnProperty(i)) {
                if (exports.menus[i].close() === false)
                    return false;
            }
        }

        return true;
    }

    $('<style class="rightClickStyle"></style>').appendTo('head');
    $('body').on('click', exports.closeAllMenus).contextmenu(exports.closeAllMenus);
})(window, jQuery, RightClick);
