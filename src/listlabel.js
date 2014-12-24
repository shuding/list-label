/**
 * Created by shuding on 12/24/14.
 *
 * <ds303077135@gmail.com>
 * http://github.com/quietshu/listlabel
 *
 * The MIT License
 */

;(function(window, undefined){
    var listlabel = function() {

        /**
         * The selector fn.
         * @param element [array of] DOM element or string
         */
        var selector = function (element) {

            if (isElement(element)) {
                return initListlabel(element);
            } else if (typeof element === "string") {
                var array = document.querySelectorAll(element);

                return selector(array);
            } else if (typeof element === "object" && (element instanceof Array || element instanceof NodeList)) {
                var retArray = [];

                // NodeList doesn't has method `forEach`
                for (var i = 0; i < element.length; ++i) {
                    retArray.push(selector(element[i]));
                }

                return retArray;
            }

            throwError("ERROR: Type error.");

        };

        // Defaults
        selector.defaultListHeight = 300; // px
        selector.defaultLabelClass = "ll-label";

        /**
         * Throw an error.
         * @method throwError
         * @param errStr string
         */
        function throwError (errStr) {
            console.error(errStr);
        }

        /**
         * Test for a DOM elemnt.
         * @method isElement
         * @param o
         * @see http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
         */
        function isElement (o) {

            return (
                typeof HTMLElement === "object" ?
                    o instanceof HTMLElement : //DOM2
                    o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
            );

        }

        function initListlabel(el) {
            if (!isElement(el)) {
                throwError("ERROR: Type error.");

                return undefined;
            }

            var element = el,
                labels  = [];

            var label = function (el) {
                var element   = el,
                    height    = 0,
                    offsetTop = 0;

                // The label closure
                var labelObject = {
                    top: function () {
                        if (arguments.length && typeof arguments[0] === "number")
                            element.style.top = Math.floor(arguments[0]) + "px";
                        
                        return offsetTop;
                    },
                    height: function () {
                        return height;
                    },
                    inherit: function () {
                        element.style.top = "inherit";
                    },
                    init: function () {
                        element.style.position = "absolute";

                        offsetTop = element.offsetTop;
                        height = (element.getBoundingClientRect && element.getBoundingClientRect().height) || element.offsetHeight;

                        var nextSibling = element.nextElementSibling || element.nextSibling;

                        if (nextSibling && isElement(nextSibling))
                            nextSibling.style.marginTop = height + "px";

                        return this;
                    }
                };

                return labelObject.init();
            };

            var getLabels = function() {
                var labelArray = element.querySelectorAll("." + selector.defaultLabelClass);
                labels = [];

                for (var i = 0; i < labelArray.length; ++i) {
                    labels.push(label(labelArray[i]));
                }
            };

            // The listLabel object closure
            var listLabelObject = {
                refreshLabels: function() {
                    getLabels();

                    return this;
                },
                bindScroll: function() {
                    element.onscroll = function () {
                        var scrollTop = element.scrollTop;

                        for (var i = 0; i < labels.length; ++i) {
                            if (labels[i].top() <= scrollTop) {
                                if (i == labels.length || labels[i + 1].top() > scrollTop) {
                                    if (i < labels.length && labels[i].height() + scrollTop > labels[i + 1].top()) {
                                        labels[i].top(labels[i + 1].top() - labels[i].height());
                                    }
                                    else
                                        labels[i].top(scrollTop);
                                }
                            }
                            else {
                                labels[i].inherit();
                            }
                        }
                    };

                    return this;
                },
                init: function () {
                    // Container styles
                    element.style.height    = selector.defaultListHeight + "px";
                    element.style.position  = "relative";
                    element.style.overflowY = "scroll";

                    // Get all labels and bind scroll event
                    return this.refreshLabels().bindScroll();
                }
            };

            return listLabelObject.init();
        }

        return selector;
    };

    window.listlabel = listlabel();
})(window);