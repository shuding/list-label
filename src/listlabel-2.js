/**
 * Created by shuding on 12/24/14.
 *
 * <ds303077135@gmail.com>
 * http://github.com/quietshu/list-label
 *
 * The MIT License
 */

;(function(window, undefined){
    var listlabel = function() {

        /**
         * The selector fn.
         * @param element [array of] DOM element or string
         */
        var selector = function (element, options) {

            if (isElement(element)) {
                return initListlabel(element, options);
            } else if (typeof element === "string") {
                var array = document.querySelectorAll(element);

                return selector(array, options);
            } else if (typeof element === "object" && (element instanceof Array || element instanceof NodeList)) {
                var retArray = [];

                // NodeList doesn't has method `forEach`
                for (var i = 0; i < element.length; ++i) {
                    retArray.push(selector(element[i], options));
                }

                return retArray;
            }

            throwError("ERROR: Type error.");

        };

        // Defaults
        selector.defaultLabelClass  = "ll-label";
        selector.defaultListHeight  = 300; // px

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

        /**
         * Test for touch devices.
         * @method isTouchDevice
         * @see http://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript
         */
        function isTouchDevice() {
            try {
                document.createEvent("TouchEvent");
                return true;
            } catch (e) {
                return false;
            }
        }

        function initListlabel(el, options) {
            if (!isElement(el)) {
                throwError("ERROR: Type error.");

                return undefined;
            }

            var element     = el,
                labels      = [],
                labelIndexs = [];

            var label = function (el, width) {
                var element      = el,
                    height       = 0,
                    offsetTop    = 0;

                // Reset styles
                element.style.width = width + "px";

                // The label closure
                var labelObject = {
                    text: function () {
                        return el.innerText;
                    },
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

                        return this;
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
                    labels.push(label(labelArray[i], element.clientWidth));
                }
            };

            // The listLabel object closure
            var listLabelObject = {
                refreshLabels: function() {
                    getLabels();

                    return this;
                },
                bindScroll: function() {
                    var refresh = function () {
                        var scrollTop;
                        if (arguments.length && typeof arguments[0] === "number")
                            scrollTop = arguments[0];
                        else
                            scrollTop = element.scrollTop;

                        for (var i = 0; i < labels.length; ++i) {
                            if (labels[i].top() <= scrollTop) {
                                if (i == labels.length || labels[i + 1].top() > scrollTop) {
                                    if (i < labels.length && labels[i].height() + scrollTop > labels[i + 1].top()) {
                                        labels[i].top(labels[i + 1].top() - labels[i].height());
                                    }
                                    else {
                                        labels[i].top(scrollTop);
                                    }
                                }
                            }
                            else {
                                labels[i].inherit();
                            }
                        }
                    };

                    element.onscroll = refresh;

                    return this;
                },
                showIndex: function () {
                    labelIndexs = [];
                    var indexContainer = document.createElement("UL");

                    for (var i = 0; i < labels.length; ++i) {
                        var indexElement = document.createElement("LI");
                        indexElement.innerText = labels[i].inherit().text();

                        // This is a trick for creating a closure
                        with (labels[i]) {
                            indexElement.onmousedown = indexElement.onmousemove = indexElement.ontouchstart = indexElement.ontouchmove = function () {
                                element.scrollTop = top();
                            };
                        }

                        labelIndexs.push(indexElement);
                        indexContainer.appendChild(indexElement);
                    }

                    // Index container styles
                    indexContainer.style.position   = "absolute";
                    indexContainer.style.top        = element.offsetTop + "px";
                    indexContainer.style.height     = element.offsetHeight - 20 + "px";
                    indexContainer.style.margin     = "5px";
                    indexContainer.style.padding    = "5px";
                    indexContainer.style.zIndex     = (+element.style.zIndex) ? (+element.style.zIndex + 1) : 1;
                    indexContainer.style.listStyle  = "none";
                    indexContainer.style.fontSize   = "12px";
                    indexContainer.style.lineHeight = (element.offsetHeight - 20) / (labelIndexs.length || 1) / 12 + "em";
                    indexContainer.style.overflow   = "hidden";

                    labelIndexs.forEach(function (indexElement) {
                        indexElement.style.height   = (element.offsetHeight - 20) / (labelIndexs.length || 1) / 12 + "em";
                    });

                    element.parentNode.insertBefore(indexContainer, element);

                    indexContainer.style.left       = element.offsetLeft + element.offsetWidth - indexContainer.clientWidth - 30 + "px";

                },
                init: function (options) {
                    // Container styles
                    element.style.position         = "relative";
                    element.style.height           = selector.defaultListHeight + "px";
                    element.style.overflowY        = "scroll";
                    element.style["-webkit-overflow-scrolling"] = "touch";

                    this.refreshLabels();

                    if (typeof options !== "undefined") {
                        if (typeof options.height === "number" && options.height >= 0) {
                            element.style.height = options.height + "px";
                        }

                        if (options.showIndex == true) {
                            this.showIndex();
                        }
                    }

                    // Get all labels and bind scroll event
                    return this.bindScroll();
                }
            };

            return listLabelObject.init(options);
        }

        return selector;
    };

    window.listlabel = listlabel();
})(window);
