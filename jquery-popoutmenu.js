/**
 * @license GNU General Public License v2 http://www.gnu.org/licenses/gpl-2.0
 * @author BlueMöhre <bluemoehre@gmx.de>
 * @copyright 2013 BlueMöhre
 * @link http://www.github.com/bluemoehre
 */
(function ($, win, doc) {

    'use strict';

    /**
     * Plugin name and data-attr name (change for solving conflicts)
     * @type {string}
     */
    var PLUGIN_NAME = 'popoutmenu';

    /**
     * Default options for this plugin
     * - structure: the placeholders which will be used to create the list
     * - htmlContainer: HTML holding the container for the lists
     * - htmlGroup: wrapper HTML for a group
     * - tplItem: HTML for one list item containing the placeholders
     * - addContainerClass: additional classes for the htmlContainer
     * - animSpeed: how fast transitions are (ms)
     * @type {{structure: Array, htmlContainer: string, htmlGroup: string, tplItem: string, addContainerClass: string, animSpeed: number}}
     */
    var defOpts = {
        structure: [
            /*
            [
                { href: '/sample1', text: 'Sample 1' },
                { href: '/sample2', text: 'Sample 2', class: 'highlight' },
                { href: '/sample3', text: 'Sample 3' },
                { href: '/sample4', text: 'Sample 4' }
            ],
            [
                { href: '/sample5', text: 'Sample 5' },
                { href: '/sample6', text: 'Sample 6' }
            ]
            */
        ],
        htmlContainer: '<div class="popoutmenu"></div>',
        htmlGroup: '<ul></ul>',
        tplItem: '<li class="__class__"><a href="__href__">__text__</a></li>',
        addContainerClass: '', // additional classes which will be added to the htmlContainer
        animSpeed: 100
    };

    /**
     * All instances
     * @type {Array}
     */
    var instances = [];


    /**
     * Plugin constructor
     * @param {HTMLElement} el
     * @param {Array} args
     * @constructor
     */
    function Plugin(el, args) {

        /**
         * The element which was passed to the plugin
         * @type {jQuery}
         */
        var $el = $(el);

        /**
         * The plugin settings for this instance
         * @type {Object}
         */
        var opts = {};

        /**
         * Self-reference
         * @type {Plugin}
         */
        var self = this;

        /**
         * @type {?jQuery}
         */
        var $flyout = null;

        /**
         * @type {jQuery}
         */
        var $doc = $(doc);

        /**
         * Returns a HTML escaped string
         * @param {string} text
         * @returns {string}
         */
        function htmlEncode(text) {
            return document.createElement('div').appendChild(document.createTextNode(text)).parentNode.innerHTML;
        }

        /**
         * Returns the given string where all placeholders have been replaced with the given data
         * @param {string} html
         * @param {Object} data
         * @param {Boolean} [escape=true]
         * @returns {string}
         */
        function replacePlaceholders(html, data, escape) {
            var placeholder;
            var replacement;
            escape = escape !== false;
            for (placeholder in data) {
                if (data.hasOwnProperty(placeholder)) {
                    placeholder = placeholder.replace(/([.*+?\^=!:${}()|\[\]\/\\])/g, "\\$1"); // escape regex special characters
                    replacement = escape ? htmlEncode(data[placeholder]) : data[placeholder];
                    html = html.replace(new RegExp('__' + placeholder + '__', 'g'), replacement);
                }
            }
            return html;
        }

        /**
         * Returns a template's HTML as string.
         * Templates can be specified by jQuery-Selector or HTML-String.
         * HTML-Strings will passed through, script templates will be unwrapped, normal elements will be converted to string.
         * @param {string} tpl
         * @returns {string}
         */
        function getTemplate(tpl) {
            var $tpl = $(tpl);
            return $tpl[0][$tpl.is('script[type="text/template"]') ? 'innerHTML' : 'outerHTML'];
        }

        /**
         * Init function for setting up this instance
         * The settings are cascaded in the following order:
         *  - the plugin defaults
         *  - the given options via jQuery-call
         *  - the element options via attribute
         *  (latest takes precedence)
         *
         * @param {Object} initOpts
         */
        function init(initOpts) {
            var attrOptStr = $el.attr('data-' + PLUGIN_NAME);
            var attrOpts = attrOptStr ? $.parseJSON(attrOptStr) : {};
            opts = $.extend(opts, defOpts, initOpts, attrOpts);

            if ($.inArray(self, instances) < 0) {
                instances.push(self);
            }

            // add event handlers
            $el.on('click.' + PLUGIN_NAME, function (evt) {
                evt.preventDefault();
                if ($flyout && $flyout.parent().length) {
                    self.hide();
                } else {
                    self.show();
                }
            });
        }

        /**
         * Build the flyout based upon the given structure and templates
         * @return {jQuery}
         */
        function build() {
            var $flyout = $(opts.htmlContainer).addClass(opts.addContainerClass);
            var group = null;

            for (var i = 0; i < opts.structure.length; i++) {
                // if is array with content
                if (typeof opts.structure[i] !== 'string' && opts.structure[i].length){
                    group = $(opts.htmlGroup).appendTo($flyout);
                    for (var ii = 0; ii < opts.structure[i].length; ii++){
                        group.append(replacePlaceholders(getTemplate(opts.tplItem), opts.structure[i][ii]));
                    }
                    group = null;
                } else if (typeof opts.structure[i] === 'object'){
                    if (!group) group = $(opts.htmlGroup).appendTo($flyout);
                    group.append(replacePlaceholders(getTemplate(opts.tplItem), opts.structure[i]));
                }
            }

            return $flyout;
        }

        /**
         * Shows the flyout if available not already added to the DOM
         */
        this.show = function () {

            // build the flyout when not already done
            if (!$flyout && opts.structure.length) {
                $flyout = build()
                    .on('click.' + PLUGIN_NAME, function (evt) {
                        evt.stopPropagation();
                    });
            }

            // hide other instances
            $.each(instances, function (idx, instance) {
                instance === self || instance.hide();
            });

            // if flyout is available and is not attached to the dom
            if ($flyout) {
                $flyout.stop(true);
                if (!$flyout.parent().length) {
                    $flyout
                        .css({
                            opacity: 0,
                            position: 'absolute',
                            left: $el.position().left + $el.outerWidth() / 2 + 'px',
                            top: $el.position().top + $el.outerHeight() + parseInt($el.css('margin-top')) + 'px'
                        })
                        .insertAfter($el)
                        .css('margin-left', $flyout.outerWidth() / 2 * -1 + 'px');
                }
                $flyout.fadeTo(opts.animSpeed, 1);

                // delay event binding, so the click event for showing does not trigger close immediately
                setTimeout(function () {
                    $doc.one('click.' + PLUGIN_NAME, self.hide);
                }, 0);
            }
        };

        /**
         * Hides the flyout
         */
        this.hide = function () {
            $flyout.stop(true).fadeTo(opts.animSpeed, 0, function () {
                $flyout.detach();
            });
        };

        /**
         * Remove this plugin off the element
         * This function should revert all changes which have been made by this plugin
         */
        this.destroy = function () {
            $doc.off('.' + PLUGIN_NAME);
            $el.find('*').addBack().off('.' + PLUGIN_NAME);
            $el.removeData(PLUGIN_NAME);
            $el = null;
        };


        init(args);
    }


    // Register plugin on jQuery
    $.fn[PLUGIN_NAME] = function () {
        var args = arguments || [];
        var val;

        this.each(function () {

            // Prevent multiple instances for same element
            var instance = $.data(this, PLUGIN_NAME);
            if (!instance) {
                instance = new Plugin(this, typeof args[0] === 'object' ? args[0] : {});
                $.data(this, PLUGIN_NAME, instance);
            }

            // Call public function
            // If it returns something, break the loop and return the value
            if (typeof args[0] === 'string') {
                if (typeof instance[args[0]] === 'function') {
                    val = instance[args[0]](args[1]);
                } else {
                    $.error('Method "' + args[0] + '" does not exist for ' + PLUGIN_NAME + ' plugin');
                }
            }

            return val === undefined;
        });

        return val === undefined ? this : val;
    };


    // Auto pilot
    $(doc).on('ready ajaxStop DOMContentLoaded', function (evt, nodes) {
        $(nodes || document).find('[data-' + PLUGIN_NAME + ']').addBack('[data-' + PLUGIN_NAME + ']')[PLUGIN_NAME]();
    });


})(jQuery, window, document);
