var fioriLogin = {};

(function () {
    // IE8 support
    if (!String.prototype.trim) {
        String.prototype.trim = function () {
            return this.replace(/^\s+|\s+$/g, '');
        };
    }
    function testBase64Chars(s) {
        var re = /[^0-9A-Za-z+/]/g;
        return !re.test(s);
    }
    function encode_utf8(s) {
        return unescape(encodeURIComponent(s));
    }
    function decode_utf8(s) {
        return decodeURIComponent(escape(s));
    }
    fioriLogin.encodeHash = function (s) {
        var encoded;
        if (s) {
            encoded = btoa(encode_utf8(s));
            encoded = encoded.replace(/=/g, "");
        }
        else {
            encoded = "";
        }
        return encoded;
    };
    fioriLogin.decodeHash = function (s) {
        var hash = "";
        if (s && testBase64Chars(s)) {
            try {
                hash = decode_utf8(atob(s));
            }
            catch (error) {
            }
        }
        return hash;
    };
    // Lightweight URL parsing
    function URL(url.html) {
        this._parse(url);
    }
    URL.prototype._parse = function (url) {
        var parseRegExp = /([^?#]+)(\?[^#]*)?(#.*)?/;
        var matches = parseRegExp.exec(url);
        this.path = matches[1];
        this.hash = matches[3] || "";
        this.parameters = this._parseSearch(matches[2]);
    };
    URL.prototype._parseSearch = function (search) {
        var paramRegExp, matches, params;
        params = {};
        if (search) {
            paramRegExp = /[?&]([^&=]+)=?([^&]*)/g;
            matches = paramRegExp.exec(search);
            while (matches) {
                params[matches[1]] = matches[2];
                matches = paramRegExp.exec(search);
            }
        }
        return params;
    };
    URL.prototype.getParameter = function (name) {
        return decodeURIComponent(this.parameters[name]);
    };
    URL.prototype.removeParameter = function (name) {
        delete this.parameters[name];
    };
    URL.prototype.setParameter = function (name, value) {
        this.parameters[name] = encodeURIComponent(value);
    };
    Object.defineProperties(URL.prototype, {
        href: {
            get: function () {
                var href;
                href = this.path + this.search + this.hash;
                return href;
            }
        },
        search: {
            get: function () {
                var search, params, name, value;
                search = "";
                params = this.parameters;
                for (name in params) {
                    if (params.hasOwnProperty(name)) {
                        value = params[name];
                        if (search.length > 0) {
                            search += "&";
                        }
                        search += name;
                        if (value) {
                            search += "=";
                            search += value;
                        }
                    }
                }
                if (search.length > 0) {
                    search = "?" + search;
                }
                return search;
            }
        }
    });
    // Browser
    fioriLogin.isLegacyIE = function () {
        var ieRegExp, result, ieVersion, legacy = false;
        if (navigator.appName === "Microsoft Internet Explorer") {
            ieRegExp = /MSIE ([0-9]+[\.0-9]*)/;
            result = ieRegExp.exec(navigator.userAgent);
            if (result != null) {
                ieVersion = parseFloat(result[1]);
                legacy = (ieVersion < 10);
            }
        }
        return legacy;
    };
    fioriLogin.userAgentParser = {};
    fioriLogin.userAgentParser.webkit = function (ua) {
        var reWebkit, reChrome, reAndroid, reSafari, match, browser;
        reWebkit = /webkit[ \/]([\w.]+)/;
        match = reWebkit.exec(ua);
        if (match) {
            browser = {};
            browser.engine = {name: "webkit", version: match[1]};
            reChrome = /(chrome)\/(\d+\.\d+).\d+/;
            reAndroid = /(android) .+ version\/(\d+\.\d+)/;
            match = reChrome.exec(ua) || reAndroid.exec(ua);
            if (match) {
                browser.name = match[1];
                browser.version = match[2];
            }
            else {
                reSafari = /version\/(\d+\.\d+).*safari/;
                match = reSafari.exec(ua);
                if (match) {
                    browser.name = "safari";
                    browser.version = match[1];
                }
            }
        }
        return browser;
    };
    fioriLogin.userAgentParser.opera = function (ua) {
        var reOpera, match, browser;
        reOpera = /opera(?:.*version)?[ \/]([\w.]+)/;
        match = reOpera.exec(ua);
        if (match) {
            browser = {name: "opera", version: match[1]};
            browser.engine = {name: "opera", version: match[1]};
        }
        return browser;
    };
    fioriLogin.userAgentParser.firefox = function (ua) {
        var reFirefox, match, browser;
        reFirefox = /firefox\/([\w.]+)/;
        match = reFirefox.exec(ua);
        if (match) {
            browser = {name: "firefox", version: match[1]};
            browser.engine = {name: "firefox", version: match[1]};
        }
        return browser;
    };
    fioriLogin.userAgentParser.msie = function (ua) {
        var reTrident, reMSIE, msie, match, browser, msieFromTrident;
        reTrident = /trident\/([\w.]+);.*rv:([\w.]+)/;
        reMSIE = /msie ([\w.]+)/;
        msieFromTrident = {"4.0": "8.0", "5.0": "9.0", "6.0": "10.0"};
        match = reTrident.exec(ua);
        if (match) {
            browser = {name: "msie"};
            browser.engine = {name: "trident", version: match[1]};
            if (match[2]) {
                browser.version = match[2];
            }
            else {
                browser.version = msieFromTrident[match[2]];
                match = reMSIE.exec(ua);
                if (match) {
                    browser.compatibilityMode = match[1];
                }
            }
        }
        else {
            match = reMSIE.exec(ua);
            if (match) {
                browser = {name: "msie", version: match[1]};
                browser.engine = {name: "trident", version: "0"};
            }
        }
        return browser;
    };
    fioriLogin.getBrowser = function () {
        var ua, browser;
        ua = window.navigator.userAgent.toLowerCase();
        browser = fioriLogin.userAgentParser.webkit(ua) || fioriLogin.userAgentParser.opera(ua) || fioriLogin.userAgentParser.firefox(ua) || fioriLogin.userAgentParser.msie(ua);
        if (!browser) {
            browser = {name: "", version: "0"};
        }
        return browser;
    };

    // atob/btoa polyfill for IE 9
    if (!window.atob) {
        (function () {
            "use strict";
            var B, d, a, c, e;
            B = {};
            d = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%2b/index.html";
            (function () {
                var b, i, j;
                a = [];
                e = [];
                c = [];
                for (i = 0; i < 128; ++i) { a[i] = -1 }
                for (i = 0; i < 64; ++i) {
                    b = d.charCodeAt(i);
                    c[i] = d[i];
                    a[b] = i
                }
                for (i = 0; i < 64; ++i) { for (j = 0; j < 64; ++j) { e[(64 * i) + j] = d[i] + d[j] } }
            })();
            function f(s, i) { throw new Error("Invalid character '" + s[i] + "' at position " + i) }

            B.encode = function (s) {
                var b, l, t, i, g, h, j;
                if (!s) { return "" }
                b = "";
                l = s.length;
                t = l % 3;
                l -= t;
                for (i = 0; i < l; ++i) {
                    g = s.charCodeAt(i) << 4;
                    h = s.charCodeAt(++i);
                    g |= (h >>> 4);
                    h = (h & 15) << 8;
                    h |= s.charCodeAt(++i);
                    b += e[g] + e[h]
                }
                if (t) {
                    h = s.charCodeAt(i);
                    g = h >>> 2;
                    if (t === 1) {
                        h = (h & 3) << 4;
                        b += c[g] + c[h] + "=="
                    } else {
                        j = s.charCodeAt(++i);
                        h = ((h & 3) << 4) | (j >>> 4);
                        j = (j & 15) << 2;
                        b += c[g] + c[h] + c[j] + "="
                    }
                }
                return b
            };
            B.decode = function (s) {
                var b, l, t, i, g, h, j, k;
                if (!s) { return "" }
                b = "";
                l = s.length;
                t = (l & 3);
                if (t) {
                    if ((t === 1) || (b[l - 1] === "=")) { throw new Error("Invalid base64 input") }
                    l -= t
                } else {
                    if (s[l - 1] === "=") {
                        t = 3;
                        if (s[l - 2] === "=") { t = 2 }
                        l -= 4
                    }
                }
                for (i = 0; i < l; ++i) {
                    g = a[s.charCodeAt(i)];
                    if (g < 0) { f(s, i) }
                    h = a[s.charCodeAt(++i)];
                    if (h < 0) { f(s, i) }
                    j = a[s.charCodeAt(++i)];
                    if (j < 0) { f(s, i) }
                    k = a[s.charCodeAt(++i)];
                    if (k < 0) { f(s, i) }
                    g = (g << 2) | (h >>> 4);
                    h = ((h & 15) << 4) | (j >>> 2);
                    j = ((j & 3) << 6) | k;
                    b += String.fromCharCode(g, h, j)
                }
                if (t) {
                    g = a[s.charCodeAt(i)];
                    if (g < 0) { f(s, i) }
                    h = a[s.charCodeAt(++i)];
                    if (h < 0) { f(s, i) }
                    g = (g << 2) | (h >>> 4);
                    b += String.fromCharCode(g);
                    if (t === 3) {
                        j = a[s.charCodeAt(++i)];
                        if (j < 0) { f(s, i) }
                        h = ((h & 15) << 4) | (j >>> 2);
                        b += String.fromCharCode(h)
                    }
                }
                return b
            };
            window.atob = B.decode;
            window.btoa = B.encode;
        })();
    }

    // CSS 
    fioriLogin.addClass = function (className, element) {
        var startClassName = element.className;
        if (startClassName) {
            var regexp = new RegExp("\\b" + className + "\\b");
            if (!regexp.test(startClassName)) {
                element.className = startClassName + " " + className;
            }
        }
        else {
            element.className = className;
        }
    };
    fioriLogin.removeClass = function (className, element) {
        if (element.className) {
            var regexp = new RegExp("\\b" + className + "\\b");
            element.className = element.className.replace(regexp, "");
        }
    };
    // Language handling
    fioriLogin.lang = {};
    fioriLogin.lang.compare = function (lang1, lang2) {
        if (lang1.value < lang2.value) {
            return -1;
        } else if (lang1.value > lang2.value) {
            return 1;
        } else {
            return 0;
        }
    };
    fioriLogin.lang.createOption = function (lang) {
        var option = document.createElement("option");
        option.value = lang.value;
        if (lang.value) {
            option.text = lang.value + ' - ' + lang.label;
        }
        else {
            option.text = lang.label;
        }
        return option;
    };
    fioriLogin.lang.getAppLanguages = function () {
        var appLanguages;
        if (sraLogin.languages.application) {
            var langs = sraLogin.languages.application.split(",");
            var langCount = langs.length;
            for (var idx = 0; idx < langCount; ++idx) {
                if (!appLanguages) {
                    appLanguages = {};
                }
                var lang = langs[idx].trim();
                appLanguages[lang.toUpperCase()] = true;
            }
        }
        return appLanguages;
    };
    fioriLogin.lang.isAllowed = function (lang, appLanguages) {
        var allowed = true;
        if (appLanguages && lang && lang.length > 0) {
            allowed = appLanguages[lang];
        }
        return allowed;
    };
    fioriLogin.lang.getSelection = function () {
        var select, index, lang;
        lang = "";
        select = document.getElementById("LANGUAGE_SELECT");
        index = select.selectedIndex;
        if ((index >= 0) && (index < sraLogin.languages.available.length)) {
            lang = sraLogin.languages.available[index].value;
        }
        return lang;
    };
    fioriLogin.lang.initLangSelect = function () {
        var browser, languages = sraLogin.languages.available;
        var langCount = languages.length;
        if ((sraLogin.options.selectLanguage) && (langCount > 1)) {
            var appLanguages = fioriLogin.lang.getAppLanguages();
            sraLogin.languages.available = [];
            languages.sort(fioriLogin.lang.compare);
            fioriLogin.lang.selectControl = document.getElementById("LANGUAGE_SELECT");
            var langSelect = fioriLogin.lang.selectControl;
            browser = fioriLogin.getBrowser();
            if (browser.name === "firefox") {
                fioriLogin.addClass("sapUiMozSraSelect", langSelect);
                langSelect.style.marginTop = "10px";
                setTimeout(fioriLogin.lang.adjustMozSelect, 15);
                setInterval(fioriLogin.lang.adjustMozSelect, 100);
            }
            var selectedLang = 1;
            var langIndex = 0;
            for (var idx = 0; idx < langCount; ++idx) {
                if (fioriLogin.lang.isAllowed(languages[idx].value, appLanguages)) {
                    sraLogin.languages.available.push(languages[idx]);
                    var option = fioriLogin.lang.createOption(languages[idx]);
                    langSelect.add(option);
                    if (sraLogin.languages.lang === option.value) {
                        selectedLang = langIndex;
                    }
                    langIndex++;
                }
            }
            if (langIndex <= 1) {
                var englishLang = {value: "EN", label: "English"};
                sraLogin.languages.available.push(englishLang);
                var option = fioriLogin.lang.createOption(englishLang);
                langSelect.add(option);
            }
            langSelect.selectedIndex = selectedLang;
        }
    };
    fioriLogin.lang.adjustMozSelect = function () {
        var top, height, langSelect;
        langSelect = fioriLogin.lang.selectControl;
        height = langSelect.clientHeight;
        if (height && height != fioriLogin.lang.selectControlHeight) {
            fioriLogin.lang.selectControlHeight = height;
            top = Math.round((40 - height) / 2);
            langSelect.style.marginTop = "" + top + "px";
        }
    };
    fioriLogin.lang.setParam = function () {
        var selectParam = document.getElementById("LANGUAGE_PARAM_VALUE");
        if (selectParam) {
            selectParam.value = fioriLogin.lang.getSelection();
        }
    };
    // Error messages
    fioriLogin.error = {};
    fioriLogin.error.getMessage = function () {
        var errorLabel = document.getElementById("LOGIN_LBL_ERROR");
        if (fioriLogin.isLegacyIE()) {
            return errorLabel.innerText;
        }
        else {
            return errorLabel.textContent;
        }
    };
    fioriLogin.error.show = function (text) {
        var errorLabel = document.getElementById("LOGIN_LBL_ERROR");
        if (fioriLogin.isLegacyIE()) {
            errorLabel.innerText = text;
        }
        else {
            errorLabel.textContent = text;
        }
        var errorBlock = document.getElementById("LOGIN_ERROR_BLOCK");
        errorBlock.style.visibility = "visible";
    };
    fioriLogin.error.hide = function () {
        var errorLabel = document.getElementById("LOGIN_LBL_ERROR");
        if (fioriLogin.isLegacyIE()) {
            errorLabel.innerText = "";
        }
        else {
            errorLabel.textContent = "";
        }
        var errorBlock = document.getElementById("LOGIN_ERROR_BLOCK");
        errorBlock.style.visibility = "hidden";
    };
    // input
    fioriLogin.getInputValue = function (inputId) {
        var elt, val;
        elt = document.getElementById(inputId);
        if (elt) {
            val = elt.value;
        }
        return val;
    };
    fioriLogin.setInputFocus = function (inputId) {
        var input = document.getElementById(inputId);
        if (input) {
            input.focus();
        }
    };
    fioriLogin.validateInput = function (id, errorText, validRegexp) {
        var input = document.getElementById(id);
        var inputValid = false;
        if (validRegexp) {
            inputValid = validRegexp.test(input.value);
        }
        else {
            if (input.value) {
                inputValid = true;
            }
        }
        if (!inputValid) {
            fioriLogin.error.show(errorText);
            input.focus();
        }
        return inputValid;
    };
    fioriLogin.submitLogin = function (inputProcessing, formEvent, submitForm) {
        var userInput;
        if (sraLogin.options.selectLanguage) {
            fioriLogin.lang.setParam();
        }
        userInput = document.getElementById("USERNAME_FIELD-inner");
        if (userInput.value !== userInput.value.trim()) {
            userInput.value = userInput.value.trim();
        }
        if (fioriLogin.validateInput("USERNAME_FIELD-inner", sraLogin.texts.error_user_initial)
            && fioriLogin.validateInput("PASSWORD_FIELD-inner", sraLogin.texts.error_pwd_initial)
            && fioriLogin.validateInput("CLIENT_FIELD-inner", sraLogin.texts.error_client_initial, /\d{3}/)) {
            fioriLogin.error.hide();
            fioriLogin.addClass("sapUiSraAfterLogin", document.body);
            if (!fioriLogin.isLegacyIE()) {
                fioriLogin.addClass("sapUiSraShowLogonAnimation", document.body);
            }
            document.getElementsByName(inputProcessing)[0].value = formEvent;
            if (submitForm) {
                document.loginForm.submit();
            }
            return true;
        }
        else {
            return false;
        }
    };
    fioriLogin.getHiddenField = function (name) {
        var input, value;
        input = document.getElementsByName(name);
        if (input.length === 0) {
            value = "";
        }
        else {
            value = input[0].value;
        }
        return value;
    };
    fioriLogin.setHiddenField = function (name, value) {
        var form, input;
        input = document.getElementsByName(name);
        if (input.length === 0) {
            form = document.forms[0];
            if (form) {
                input = document.createElement("input");
                input.type = "hidden";
                input.name = name;
                input.value = value;
                form.appendChild(input);
            }
        }
        else {
            input[0].value = value;
        }
    };
    fioriLogin.deleteHiddenField = function (name) {
        var input;
        input = document.getElementsByName(name);
        if (input.length > 0) {
            input = input[0];
            input.parentNode.removeChild(input);
        }
    };
    fioriLogin.getHashValue = function () {
        var hash;
        hash = fioriLogin.getHiddenField("sap-hash");
        hash = fioriLogin.decodeHash(hash);
        return hash;
    };
    fioriLogin.setHashValue = function () {
        var form, url, hash = fioriLogin.encodeHash(window.location.hash);
        form = document.loginForm || document.changePWForm || document.forms[0];
        url = new URL(form.html);
        fioriLogin.setHiddenField("sap-hash", hash);
        if (hash) {
            fioriLogin.setHiddenField("__sap-sl__dummy", "1");
            url.setParameter('_sap-hash', hash);
            form.action = url.href;
        }
        else {
            fioriLogin.deleteHiddenField("__sap-sl__dummy");
            url.removeParameter('_sap-hash');
            form.action = url.href;
        }
    };
    fioriLogin.initHash = function () {
        var hash;
        window.onhashchange = fioriLogin.onHashChange;
        hash = fioriLogin.getHashValue();
        if (hash) {
            window.location.hash = hash;
        }
        fioriLogin.setHashValue();
    };
    fioriLogin.onHashChange = function () {
        var hash;
        fioriLogin.setHashValue();
    };
    fioriLogin.initLoginForm = function () {
        try {
            fioriLogin.lang.initLangSelect();
            fioriLogin.setInputFocus("USERNAME_FIELD-inner");
        }
        catch (error) {
            if (console) {
                console.error(error.message);
            }
        }
    };
    fioriLogin.onPasswordChange = function () {
        var newPassword = document.getElementById("NEW_PASSWORD_FIELD-inner").value;
        var confirmPasswordInput = document.getElementById("CONFIRM_PASSWORD_FIELD-inner");
        var confirmPasswordLabel = document.getElementById("CONFIRM_PASSWORD_LABEL");
        var confirmPassword = confirmPasswordInput.value;

        var passwordConfirmed = (newPassword === confirmPassword);
        if (passwordConfirmed) {
            fioriLogin.removeClass(sraLogin.styles.confirmPassword_error, confirmPasswordLabel);
            fioriLogin.removeClass(sraLogin.styles.confirmPassword_error, confirmPasswordInput);
        }
        else {
            fioriLogin.addClass(sraLogin.styles.confirmPassword_error, confirmPasswordLabel);
            fioriLogin.addClass(sraLogin.styles.confirmPassword_error, confirmPasswordInput);
        }
    };
    fioriLogin.validateNewPassword = function () {
        var newPassword = document.getElementById("NEW_PASSWORD_FIELD-inner").value;
        var confirmPassword = document.getElementById("CONFIRM_PASSWORD_FIELD-inner").value;
        var passwordValid = newPassword && (newPassword === confirmPassword);
        if (!passwordValid) {
            fioriLogin.error.show(sraLogin.texts.error_confirm_newpwd);
        }
        return passwordValid;
    };
    fioriLogin.submitChangePassword = function (inputProcessing, formEvent, submitForm) {
        if (formEvent === "onCancelPwd" || fioriLogin.validateInput("PASSWORD_FIELD-inner", sraLogin.texts.error_pwd_initial)) {
            fioriLogin.error.hide();
            document.getElementsByName(inputProcessing)[0].value = formEvent;
            var sap_pwd = document.getElementsByName("sap-password")[0];
            if (sap_pwd) sap_pwd.value = document.getElementsByName("sap-system-login-password")[0].value;
            fioriLogin.addClass("sapUiSraAfterLogin", document.body);
            if (!fioriLogin.isLegacyIE()) {
                fioriLogin.addClass("sapUiSraShowLogonAnimation", document.body);
            }
            if (submitForm) {
                document.changePWForm.submit();
            }
            return true;
        }
        else {
            return false;
        }
    };
    fioriLogin.initChangePasswordForm = function () {
        try {
            var newPasswordInput = document.getElementById("NEW_PASSWORD_FIELD-inner");
            var confirmPasswordInput = document.getElementById("CONFIRM_PASSWORD_FIELD-inner");
            if (newPasswordInput.addEventListener) {
                newPasswordInput.addEventListener('input', fioriLogin.onPasswordChange);
                confirmPasswordInput.addEventListener('input', fioriLogin.onPasswordChange);
            }
            fioriLogin.setInputFocus("PASSWORD_FIELD-inner");
        }
        catch (error) {
            if (console) {
                console.error(error.message);
            }
        }
    };
    fioriLogin.initChangePasswordEndForm = function () {
        try {
            fioriLogin.setInputFocus("LOGIN_CONFIRM_BLOCK");
        }
        catch (error) {
            if (console) {
                console.error(error.message);
            }
        }
    };
    fioriLogin.initChangePasswordCancelForm = function () {
        try {
            fioriLogin.setInputFocus("LOGIN_ERROR_BLOCK");
        }
        catch (error) {
            if (console) {
                console.error(error.message);
            }
        }
    };
    fioriLogin.initMessageForm = function () {
        try {
            fioriLogin.setInputFocus("LOGIN_ERROR_BLOCK");
        }
        catch (error) {
            if (console) {
                console.error(error.message);
            }
        }
    };
    fioriLogin.submitForm = function (event) {
        document.getElementsByName("sap-system-login-oninputprocessing")[0].value = event;
        var form = document.loginForm || document.changePWForm;
        form.submit();
        return true;
    };
    fioriLogin.msgSelfSubmit = function (submit, event, delay) {
        try {
            if (delay > 0) {
                window.setTimeout(function () {
                    submit.call(window, event);
                }, delay);
            }
        }
        catch (error) {
            if (console) {
                console.error(error.message);
            }
        }
    };
    fioriLogin.footerFix = function () {
        fioriLogin.addClass("sapUiSraFooterAbsolute", document.body);
    };
    fioriLogin.foterReset = function () {
        fioriLogin.removeClass("sapUiSraFooterAbsolute", document.body);
    };
    fioriLogin.monitorInputs = function () {
        var k, n, input;
        var inputs = document.getElementsByTagName("input");
        n = inputs.length;
        for (k = 0; k < n; ++k) {
            input = inputs[k];
            if (input.addEventListener) {
                input.addEventListener("focus", fioriLogin.footerFix);
                input.addEventListener("blur", fioriLogin.foterReset);
            }
        }
    };
    fioriLogin.main = function () {
        try {
            fioriLogin.initHash();
            fioriLogin.monitorInputs();
            switch (sraLogin.context) {
                case "login":
                    fioriLogin.initLoginForm();
                    break;
                case "changepwd":
                    fioriLogin.initChangePasswordForm();
                    break;
                case "changepwd_end":
                    fioriLogin.initChangePasswordEndForm();
                    break;
                case "changepwd_cancel":
                    fioriLogin.initChangePasswordCancelForm();
                    break;
                case "msg":
                    fioriLogin.initMessageForm();
                    break;
            }
        }
        catch (error) {
            if (console) {
                console.error(error.message);
            }
        }
    };
})();
if (document.readyState === "complete") {
    fioriLogin.main();
}
else {
    document.onreadystatechange = function () {
        if (document.readyState === "complete") {
            fioriLogin.main();
        }
    }
}
