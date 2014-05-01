/**
 * @license GNU General Public License v2 http://www.gnu.org/licenses/gpl-2.0
 * @author BlueMöhre <bluemoehre@gmx.de>
 * @copyright 2013 BlueMöhre
 * @link http://www.github.com/bluemoehre
 */

// use window and document as local variables due to performance improvement
(function($, win, doc) {

    'use strict';

    /**
     * Plugin name and data-attr name (change for solving conflicts)
     * @type {string}
     */
    var PLUGIN_NAME = 'popoutmenu';

    /**
     * Default options for this plugin
     * - structure: the placeholders which will be used to create the list
     * - tplContainer: HTML holding the container for the lists
     * - tplGroup: wrapper HTML for a group
     * - tplItem: HTML for one list item containing the placeholders
     * - addContainerClass: additional classes for the tplContainer
     * - animSpeed: how fast transitions are (ms)
     * @type {{structure: Array, tplContainer: string, tplGroup: string, tplItem: string, addContainerClass: string, animSpeed: number}}
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
        tplContainer: '<div class="popoutmenu"></div>',
        tplGroup: '<ul></ul>',
        tplItem: '<li class="__class__"><a href="__href__">__text__</a></li>',
        addContainerClass: '', // additional classes which will be added to the tplContainer
        animSpeed: 100
    };


    /**
     * Plugin constructor
     * @param {HTMLElement} el
     * @constructor
     */
    function Plugin(el)
    {
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
         * @type {?jQuery}
         */
        var $flyout = null;

        var $doc = $(doc);

        /**
         * Returns an escaped string
         * Fastest version!
         * @see http://jsperf.com/htmlencoderegex/25
         * @param {string} text
         * @returns {string}
         */
        var htmlEncode = function(text){
            return document.createElement('div').appendChild(document.createTextNode(text)).parentNode.innerHTML;
        };

        /**
         * Returns the current tplItem with all placeholders replaced with the given data
         * @param {object} data
         * @returns {jQuery}
         */
        var getTplItemFilled = function(data){
            var tplItem = opts.tplItem;
            $.each(data, function(placeholder, value){
                tplItem = tplItem.replace('__'+ placeholder +'__', htmlEncode(value || ''));
            });
            return $(tplItem);
        };

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
        this.init = function(initOpts){

            var attrOptStr = $el.attr('data-'+ PLUGIN_NAME);
            var attrOpts = attrOptStr ? $.parseJSON(attrOptStr) : {};
            opts = $.extend(opts, defOpts, initOpts, attrOpts);

            // add event handlers
            $el.on('click.'+ PLUGIN_NAME, function(evt){
                evt.preventDefault();

                // build the list when not already done
                if (opts.structure.length && !$flyout){
                    $flyout = $(opts.tplContainer).addClass(opts.addContainerClass);
                    var group = null;
                    for (var i = 0; i < opts.structure.length; i++){
                        // if is array with content
                        if (typeof opts.structure[i] !== 'string' && opts.structure[i].length){
                            group = $(opts.tplGroup).appendTo($flyout);
                            for (var ii = 0; ii < opts.structure[i].length; ii++){
                                group.append(getTplItemFilled(opts.structure[i][ii]));
                            }
                            group = null;
                        } else if (typeof opts.structure[i] === 'object'){
                            if (!group) group = $(opts.tplGroup).appendTo($flyout);
                            group.append(getTplItemFilled(opts.structure[i]));
                        } else {
                        }
                    }
                    $flyout.on('click.'+ PLUGIN_NAME, function(evt){
                        evt.stopPropagation();
                    });
                }

                // if flyout is available and is not attached to the dom
                if ($flyout && !$flyout.parent().length){
                    $flyout.css({
                        opacity: 0,
                        position: 'absolute',
                        left: $el.position().left + $el.outerWidth()/2 +'px',
                        top: $el.position().top + $el.outerHeight() + parseInt($el.css('margin-top')) +'px'
                        })
                        .insertAfter($el)
                        .css('margin-left', $flyout.outerWidth()/2*-1 +'px')
                        .fadeTo(opts.animSpeed, 1, function(){
                        $doc.one('click.'+ PLUGIN_NAME, function(){
                            $flyout.fadeTo(opts.animSpeed, 0, function(){
                                $flyout.detach();
                            })
                        });
                    });
                }
            });
        };

        // destroy function to remove this plugin off the element
        this.destroy = function(){
            $doc.off('.' + PLUGIN_NAME);
            $el.find('*').addBack().off('.' + PLUGIN_NAME);
            $el.removeData(PLUGIN_NAME);
            $el = null;
        };

        this.getOpts = function(args){
            opts = $.extend(opts, args);
        };

    }


    // Register plugin on jQuery
    $.fn[PLUGIN_NAME] = function(){
        var args = arguments;

        return this.each(function(){

            // Prevent multiple instances for same element
            var instance = $.data(this, PLUGIN_NAME);
            if (!instance){
                instance = new Plugin(this);
                $.data(this, PLUGIN_NAME, instance);
                instance.init(typeof args[0] == 'object' ? args[0] : {});
            }
            // Call public function
            if (instance[args[0]]){
                instance[args[0]](typeof args[1] == 'object' ? args[1] : {});
            }
            else if (args[0]) {
                $.error("Method '" + args[0] + "' doesn't exist for " + PLUGIN_NAME + " plugin");
            }

        });

    };


    // Auto pilot
    $(doc).on('ajaxStop DOMContentLoaded DOMContentAdded', function(evt, nodes){
        $(nodes || document).find('[data-' + PLUGIN_NAME + ']').addBack('[data-' + PLUGIN_NAME + ']')[PLUGIN_NAME]();
    });


})(jQuery, window, document);
