/**
* json2tsd.ts
* Created by xperiments on 19/04/14.
*/
var json;
(function (json) {
    var is;
    (function (is) {
        // Local references to global functions (better minification)
        var ObjProto = Object.prototype;
        var ArrayProto = Array.prototype;
        var toString = ObjProto.toString;
        var hasOwn = ObjProto.hasOwnProperty;

        // in case the browser doesn't have it
        var index_of = (ArrayProto.indexOf ? function (arr, val) {
            return arr.indexOf(val);
        } : function (arr, val) {
            for (var i = 0, l = arr.length; i < l; i++) {
                if (arr[i] === val) {
                    return i;
                }
            }
            return -1;
        });

        // Primitives - test for type exactness
        // typeof is faster; see http://jsperf.com/underscore-js-istype-alternatives/7
        // typeof does not catch values made with a constructor, but is still faster than to String
        //   see : http://jsperf.com/is-js
        function string(s) {
            return (typeof s === 'string') || s instanceof String;
        }
        is.string = string;
        function number(n) {
            return (typeof n === 'number') || n instanceof Number;
        }
        is.number = number;
        function boolean(b) {
            return b === !!b || b instanceof Boolean;
        }
        is.boolean = boolean;

        // non-primitive builtin types
        function fn(f) {
            return (typeof f === 'function');
        }
        is.fn = fn;
        ;

        // array - delegates to builtin if available
        is.array = Array.isArray || function (a) {
            return toString.call(a) === '[object Array]';
        };

        // basically all Javascript types are objects
        function object(o) {
            return o === Object(o);
        }
        is.object = object;
        ;

        // duck typing, because there isn't really a good way to do this
        function regex(r) {
            return !!(r && r.test && r.exec && (r.ignoreCase || r.ignoreCase === false));
        }
        is.regex = regex;
        ;

        // HTML elements
        is.element = (typeof HTMLElement !== 'undefined' ? function (e) {
            return (e instanceof HTMLElement);
        } : function (e) {
            return !!(e && e.nodeType === 1);
        });

        // non-strict type checking
        // http://dl.dropbox.com/u/35146/js/tests/isNumber.html
        function numeric(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }
        is.numeric = numeric;
        ;

        // plain objects - not a specific type, just an object with key/value pairs
        // https://github.com/jquery/jquery/blob/c14a6b385fa419ce67f115e853fb4a89d8bd8fad/src/core.js#L425-452
        function hash(o) {
            // fail fast for falsy/non-object/HTMLElement/window objects
            // also check constructor properties - objects don't have their own constructor,
            // and their constructor does not have its own `isPrototypeOf` function
            if (!o || typeof o !== 'object' || is.element(o) || (typeof window !== 'undefined' && o === window) || (o.constructor && !hasOwn.call(o, 'constructor') && !hasOwn.call(o.constructor.prototype, 'isPrototypeOf'))) {
                return false;
            }

            for (var key in o) {
            }
            return (key === undefined || hasOwn.call(o, key));
        }
        is.hash = hash;
        ;

        // test for containment, in both arrays and objects
        function inside(container, val) {
            if (is.array(container)) {
                return index_of(container, val) > -1;
            } else if (is.object(container)) {
                for (var prop in container) {
                    if (hasOwn.call(container, prop) && container[prop] === val) {
                        return true;
                    }
                }
                return false;
            } else {
                return false;
            }
        }
        is.inside = inside;
        ;

        // test for variable being undefined or null
        function set(v) {
            return v !== null && v !== (void 0);
        }
        is.set = set;
        ;

        // test for having any elements (if an array), any properties (if an object), or falsy-ness
        function empty(container) {
            if (is.array(container)) {
                return container.length === 0;
            } else if (is.object(container)) {
                // when an object has a valueOf function that doesn't return an object,
                // object is empty if value is empty
                if (is.fn(container.valueOf) && !is.object(container.valueOf())) {
                    return is.empty(container.valueOf());
                }
                for (var x in container) {
                    if (hasOwn.call(container, x)) {
                        return false;
                    }
                }
                return true;
            } else {
                return !container;
            }
        }
        is.empty = empty;
    })(is || (is = {}));

    /**
    *
    *  Secure Hash Algorithm (SHA1)
    *  http://www.webtoolkit.info/
    *
    **/
    function SHA1(msg) {
        function rotate_left(n, s) {
            var t4 = (n << s) | (n >>> (32 - s));
            return t4;
        }
        ;

        function lsb_hex(val) {
            var str = "";
            var i;
            var vh;
            var vl;

            for (i = 0; i <= 6; i += 2) {
                vh = (val >>> (i * 4 + 4)) & 0x0f;
                vl = (val >>> (i * 4)) & 0x0f;
                str += vh.toString(16) + vl.toString(16);
            }
            return str;
        }
        ;

        function cvt_hex(val) {
            var str = "";
            var i;
            var v;

            for (i = 7; i >= 0; i--) {
                v = (val >>> (i * 4)) & 0x0f;
                str += v.toString(16);
            }
            return str;
        }
        ;

        function Utf8Encode(string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "";

            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);

                if (c < 128) {
                    utftext += String.fromCharCode(c);
                } else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
            }

            return utftext;
        }
        ;

        var blockstart;
        var i, j;
        var W = new Array(80);
        var H0 = 0x67452301;
        var H1 = 0xEFCDAB89;
        var H2 = 0x98BADCFE;
        var H3 = 0x10325476;
        var H4 = 0xC3D2E1F0;
        var A, B, C, D, E;
        var temp;

        msg = Utf8Encode(msg);

        var msg_len = msg.length;

        var word_array = new Array();
        for (i = 0; i < msg_len - 3; i += 4) {
            j = msg.charCodeAt(i) << 24 | msg.charCodeAt(i + 1) << 16 | msg.charCodeAt(i + 2) << 8 | msg.charCodeAt(i + 3);
            word_array.push(j);
        }

        switch (msg_len % 4) {
            case 0:
                i = 0x080000000;
                break;
            case 1:
                i = msg.charCodeAt(msg_len - 1) << 24 | 0x0800000;
                break;

            case 2:
                i = msg.charCodeAt(msg_len - 2) << 24 | msg.charCodeAt(msg_len - 1) << 16 | 0x08000;
                break;

            case 3:
                i = msg.charCodeAt(msg_len - 3) << 24 | msg.charCodeAt(msg_len - 2) << 16 | msg.charCodeAt(msg_len - 1) << 8 | 0x80;
                break;
        }

        word_array.push(i);

        while ((word_array.length % 16) != 14)
            word_array.push(0);

        word_array.push(msg_len >>> 29);
        word_array.push((msg_len << 3) & 0x0ffffffff);

        for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
            for (i = 0; i < 16; i++)
                W[i] = word_array[blockstart + i];
            for (i = 16; i <= 79; i++)
                W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);

            A = H0;
            B = H1;
            C = H2;
            D = H3;
            E = H4;

            for (i = 0; i <= 19; i++) {
                temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
                E = D;
                D = C;
                C = rotate_left(B, 30);
                B = A;
                A = temp;
            }

            for (i = 20; i <= 39; i++) {
                temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
                E = D;
                D = C;
                C = rotate_left(B, 30);
                B = A;
                A = temp;
            }

            for (i = 40; i <= 59; i++) {
                temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
                E = D;
                D = C;
                C = rotate_left(B, 30);
                B = A;
                A = temp;
            }

            for (i = 60; i <= 79; i++) {
                temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
                E = D;
                D = C;
                C = rotate_left(B, 30);
                B = A;
                A = temp;
            }

            H0 = (H0 + A) & 0x0ffffffff;
            H1 = (H1 + B) & 0x0ffffffff;
            H2 = (H2 + C) & 0x0ffffffff;
            H3 = (H3 + D) & 0x0ffffffff;
            H4 = (H4 + E) & 0x0ffffffff;
        }

        var temp2 = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);

        return temp2.toLowerCase();
    }

    var Types = (function () {
        function Types() {
        }
        Types.STRING = 'string';
        Types.NUMBER = 'number';
        Types.BOOLEAN = 'boolean';
        Types.ARRAY = '[]';
        return Types;
    })();
    json.Types = Types;

    /*!
    * micromustache.js - A stripped down version of the {{mustache}} template engine with JavaScript
    * @license Creative Commons V3
    */
    var MicroMustache;
    (function (MicroMustache) {
        /**
        * Replaces every {{variable}} inside the template with values provided by view
        * @param template {string} the template containing one or more {{key}}
        * @param view {object} an object containing string (or number) values for every key that is used in the template
        * @return {string} template with its valid variable names replaced with corresponding values
        */
        function render(template, view) {
            //don't touch the template if it is not a string
            if (typeof template !== 'string') {
                return template;
            }

            //if view is not a valid object, assume it is an empty object which effectively removes all variable assignments
            if (typeof view !== 'object' || view === null) {
                view = {};
            }
            return template.replace(/\{?\{\{\s*(.*?)\s*\}\}\}?/g, function (match, varName) {
                var value = view[varName];
                switch (typeof value) {
                    case 'string':
                    case 'number':
                    case 'boolean':
                        return value;
                    case 'function':
                        //if the value is a function, call it passing the variable name
                        return value(varName);
                    default:
                        //anything else will be replaced with an empty string. This includes object, array and null.
                        return '';
                }
            });
        }
        MicroMustache.render = render;

        /**
        * This function really doesn't make things particularly faster.
        * However it makes the repeated calls shorter!
        * @param template {string} the template containing one or more {{key}}
        * @return {function} a function that calls render(template, view) under the hood
        */
        function compile(template) {
            //create and return a function that will always apply this template under the hood
            return function (view) {
                return render(template, view);
            };
        }
        MicroMustache.compile = compile;
    })(MicroMustache || (MicroMustache = {}));

    var Json2dts = (function () {
        function Json2dts() {
            this.is_value_consistent = function (o) {
                var _this = this;
                if (this.size(o) == 0) {
                    return true;
                } else {
                    if (!is.array(o)) {
                        o = this.values(o);
                    }
                    var n = o[0];
                    var nn = (is.object(n) ? this.generate_signature(n) : typeof n);
                    return Object.keys(o).every(function (key) {
                        return (is.object(o[key]) ? _this.generate_signature(o[key]) : typeof o[key]) == nn;
                    });
                }
            };
        }
        Json2dts.prototype.parse = function (obj, objectName, moduleName) {
            if (typeof objectName === "undefined") { objectName = "_RootInterface"; }
            if (typeof moduleName === "undefined") { moduleName = ""; }
            this.moduleName = moduleName;
            this.classes = {};
            this.classesCache = {};
            this.classesInUse = {};
            this.analyse_object(obj, objectName);
            return this.classes;
        };
        Json2dts.prototype.getCode = function () {
            var _this = this;
            var output;
            var classes = {};
            var outputModule = this.moduleName == "" ? false : true;
            var interfaceTab = outputModule ? "\t" : "";
            var propertyTab = interfaceTab + "\t";

            Object.keys(this.classes).map(function (clsName) {
                output = interfaceTab + "interface " + clsName + '\n' + interfaceTab + '{\n';
                Object.keys(_this.classes[clsName]).map(function (key) {
                    output += propertyTab + key + ':' + _this.classes[clsName][key] + ';\n';
                });
                output += interfaceTab + '}\n\n';
                classes[clsName] = output;
            });
            output = outputModule ? "module " + this.moduleName + "\n{\n" : "";
            Object.keys(classes).sort().forEach(function (key) {
                output += classes[key];
            });
            return output + (outputModule ? "\n}" : "");
        };
        Json2dts.prototype.analyse_object = function (obj, objectName) {
            var _this = this;
            if (typeof objectName === "undefined") { objectName = "json"; }
            // determine object name
            objectName = this.getInterfaceType(objectName, obj);

            // initialize named class object
            this.classes[objectName] = this.classes[objectName] || {};

            // loops over all object properties and
            // determines each property type
            Object.keys(obj).map(function (key) {
                var type = "string";
                var sha = "";
                var value = obj[key];

                switch (true) {
                    case is.string(value):
                        type = Types.STRING;
                        break;
                    case is.number(value):
                        type = Types.NUMBER;
                        break;
                    case is.boolean(value):
                        type = Types.BOOLEAN;
                        break;
                    case is.array(value):
                        // default typed array
                        type = "any[]";

                        // if value is consisten over
                        // all items of the array
                        if (_this.is_value_consistent(value)) {
                            // is an empty array
                            if (_this.size(value) == 0) {
                                type = "any[]"; // EMPTY ARRAY
                            } else {
                                // consistent value is an object?
                                if (is.object(value[0])) {
                                    type = _this.getInterfaceType(key, value[0]) + '[]';
                                    _this.analyse_object(value[0], key);
                                } else {
                                    type = _this.getBasicType(value[0]) + '[]';
                                }
                            }
                        }
                        break;
                    case is.object(value) && !is.array(value):
                        // default object type
                        type = "any";

                        // if object is not empty
                        // set as current type and process it
                        if (!is.empty(value)) {
                            type = _this.getInterfaceType(key, value);
                            _this.analyse_object(value, key);
                        }
                        break;
                }

                // if key has any special char, quote it.
                if (_this.hasSpecialChars((key))) {
                    key = '\"' + key + '\"';
                }
                _this.classes[objectName][key] = type;
            });
        };
        Json2dts.prototype.getBasicType = function (value) {
            var type = Types.STRING;
            switch (true) {
                case is.string(value):
                    type = Types.STRING;
                    break;
                case is.number(value):
                    type = Types.NUMBER;
                    break;
                case is.boolean(value):
                    type = Types.BOOLEAN;
                    break;
            }
            return type;
        };

        Json2dts.prototype.getInterfaceType = function (key, value) {
            // get a valid className
            key = key.replace(/_/gi, ' ').replace(/-/gi, ' ').replace(/\w\S*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }).replace(/ /gi, '');

            // check if a definition exist for the current Interface signature
            var currentObjectSignature = this.generate_signature(value);
            var isKnownClass = Object.keys(this.classesCache).indexOf(currentObjectSignature) != -1;

            // its a know type, return it
            if (isKnownClass)
                return this.classesCache[currentObjectSignature];

            // current type name is already used by other Interface
            if (this.classesInUse[key] != undefined) {
                // update key count
                this.classesInUse[key]++;

                // initialize Interface Name Object
                this.classesCache[currentObjectSignature] = key + this.classesInUse[key];
                return this.classesCache[currentObjectSignature];
            }

            // current Interface Name was never used
            this.classesCache[currentObjectSignature] = key;
            this.classesInUse[key] = 0;
            return key;
        };
        Json2dts.prototype.size = function (obj) {
            if (obj == null)
                return 0;
            return (obj.length === +obj.length) ? obj.length : Object.keys(obj).length;
        };
        Json2dts.prototype.values = function (obj) {
            return Object.keys(obj).map(function (key) {
                return obj[key];
            });
        };
        Json2dts.prototype.generate_signature = function (o) {
            if (is.object(o)) {
                return SHA1(Object.keys(o).map(function (n) {
                    return n.toLowerCase();
                }).sort().join('|'));
            } else {
                return SHA1(Object.keys(o).map(function (n) {
                    return typeof n;
                }).sort().join('|'));
            }
        };
        Json2dts.prototype.hasSpecialChars = function (str) {
            return /[ ~`!#$%\^&*+=\-\[\]\\';,\/{}|\\":<>\?]/g.test(str);
        };
        Json2dts.prototype.keysrt = function (key, desc) {
            if (typeof desc === "undefined") { desc = false; }
            return function (a, b) {
                return desc ? ~~(a[key] < b[key]) : ~~(a[key] > b[key]);
            };
        };
        return Json2dts;
    })();
    json.Json2dts = Json2dts;
})(json || (json = {}));
