/* globals jQuery, Class, $, document, window, localStorage */

'use strict';

describe('cms.base.js', function () {
    fixture.setBase('cms/tests/frontend/unit/fixtures');

    it('creates CMS namespace', function () {
        expect(CMS).toBeDefined();
        expect(CMS).toEqual(jasmine.any(Object));
        expect(CMS.API).toEqual(jasmine.any(Object));
        expect(CMS.KEYS).toEqual(jasmine.any(Object));
        expect(CMS.BREAKPOINTS).toEqual(jasmine.any(Object));
        expect(CMS.$).toEqual(jQuery);
        expect(CMS.Class).toEqual(Class);
    });

    describe('CMS.API', function () {
        it('exists', function () {
            expect(CMS.API.Helpers).toEqual(jasmine.any(Object));
            // this expectation is here so no one ever forgets to add a test
            expect(Object.keys(CMS.API.Helpers).length).toEqual(16);
        });

        describe('.reloadBrowser()', function () {
            beforeEach(function () {
                window._originalParent = window.parent;
                window.parent = {
                    location: {
                        href: '',
                        reload: jasmine.createSpy()
                    },
                    CMS: {
                        config: {
                            request: {
                                model: 'model',
                                pk: 'pk'
                            }
                        },
                        API: {}
                    },
                    setTimeout: jasmine.createSpy().and.callFake(function (cb, timeout) {
                        expect(timeout).toEqual(0);
                        cb();
                    })
                };
            });

            afterEach(function () {
                window.parent = window;
            });

            it('reloads the browser if no `ajax` and `url` was passed', function () {
                CMS.API.Helpers.reloadBrowser(false, false, false);

                expect(window.parent.location.reload).toHaveBeenCalled();
            });

            it('redirects the browser to an url if no `ajax`, but `url` was passed', function () {
                CMS.API.Helpers.reloadBrowser('/url', false, false);

                expect(window.parent.location.href).toEqual('/url');
                expect(window.parent.location.reload).not.toHaveBeenCalled();
            });

            it('makes a request when `ajax` and `url` is passed', function () {
                window.parent.CMS.config.request.url = '/my-url';
                // for some reason jasmine.Ajax.install() didn't work here
                // presumably because of window.parent shenanigans.
                spyOn($, 'ajax').and.callFake(function (opts) {
                    opts.success('');
                });

                expect(CMS.API.Helpers.reloadBrowser('/url', false, true)).toEqual(false);
                expect($.ajax).toHaveBeenCalledWith(jasmine.objectContaining({
                    type: 'GET',
                    async: false,
                    url: '/my-url',
                    data: {
                        model: 'model',
                        pk: 'pk'
                    }
                }));

                expect(window.parent.CMS.API.locked).toEqual(false);
                expect(window.parent.location.reload).not.toHaveBeenCalled();
            });

            it('calls itself with the url if `ajax` and `url` is passed', function () {
                window.parent.CMS.config.request.url = '/my-url';
                spyOn(CMS.API.Helpers, 'reloadBrowser').and.callThrough();
                // for some reason jasmine.Ajax.install() didn't work here
                // presumably because of window.parent shenanigans.
                spyOn($, 'ajax').and.callFake(function (opts) {
                    opts.success('');
                });

                expect(CMS.API.Helpers.reloadBrowser('/url', false, true)).toEqual(false);
                expect($.ajax).toHaveBeenCalledWith(jasmine.objectContaining({
                    type: 'GET',
                    async: false,
                    url: '/my-url',
                    data: {
                        model: 'model',
                        pk: 'pk'
                    }
                }));

                expect(CMS.API.Helpers.reloadBrowser.calls.count()).toEqual(2);
                expect(CMS.API.Helpers.reloadBrowser.calls.mostRecent().args).toEqual(['/url']);
                expect(window.parent.CMS.API.locked).toEqual(false);
                expect(window.parent.location.reload).not.toHaveBeenCalled();
            });

            it('does nothing if `ajax` is passed but `url` is not and response from server is empty', function () {
                window.parent.CMS.config.request.url = '/my-url';
                spyOn(CMS.API.Helpers, 'reloadBrowser').and.callThrough();
                // for some reason jasmine.Ajax.install() didn't work here
                // presumably because of window.parent shenanigans.
                spyOn($, 'ajax').and.callFake(function (opts) {
                    opts.success('');
                });

                expect(CMS.API.Helpers.reloadBrowser(false, false, true)).toEqual(false);
                expect($.ajax).toHaveBeenCalledWith(jasmine.objectContaining({
                    type: 'GET',
                    async: false,
                    url: '/my-url',
                    data: {
                        model: 'model',
                        pk: 'pk'
                    }
                }));

                expect(CMS.API.Helpers.reloadBrowser.calls.count()).toEqual(1);
                expect(window.parent.CMS.API.locked).toEqual(false);
                expect(window.parent.location.reload).not.toHaveBeenCalled();
            });

            it('calls itself with the url that comes from server if `ajax` and `url` is passed', function () {
                window.parent.CMS.config.request.url = '/my-url';
                spyOn(CMS.API.Helpers, 'reloadBrowser').and.callThrough();
                // for some reason jasmine.Ajax.install() didn't work here
                // presumably because of window.parent shenanigans.
                spyOn($, 'ajax').and.callFake(function (opts) {
                    opts.success('/url-from-server');
                });

                expect(CMS.API.Helpers.reloadBrowser('/url', false, true)).toEqual(false);
                expect($.ajax).toHaveBeenCalledWith(jasmine.objectContaining({
                    type: 'GET',
                    async: false,
                    url: '/my-url',
                    data: {
                        model: 'model',
                        pk: 'pk'
                    }
                }));

                expect(CMS.API.Helpers.reloadBrowser.calls.count()).toEqual(2);
                expect(CMS.API.Helpers.reloadBrowser.calls.mostRecent().args).toEqual(['/url-from-server']);
                expect(window.parent.CMS.API.locked).toEqual(false);
                expect(window.parent.location.reload).not.toHaveBeenCalled();
            });

            it('calls itself with the url that comes from server if `ajax` is passed and `url` is not', function () {
                window.parent.CMS.config.request.url = '/my-url';
                spyOn(CMS.API.Helpers, 'reloadBrowser').and.callThrough();
                // for some reason jasmine.Ajax.install() didn't work here
                // presumably because of window.parent shenanigans.
                spyOn($, 'ajax').and.callFake(function (opts) {
                    opts.success('/url-from-server');
                });

                expect(CMS.API.Helpers.reloadBrowser(false, false, true)).toEqual(false);
                expect($.ajax).toHaveBeenCalledWith(jasmine.objectContaining({
                    type: 'GET',
                    async: false,
                    url: '/my-url',
                    data: {
                        model: 'model',
                        pk: 'pk'
                    }
                }));

                expect(CMS.API.Helpers.reloadBrowser.calls.count()).toEqual(2);
                expect(CMS.API.Helpers.reloadBrowser.calls.mostRecent().args).toEqual(['/url-from-server']);
                expect(window.parent.CMS.API.locked).toEqual(false);
                expect(window.parent.location.reload).not.toHaveBeenCalled();
            });

            it('calls itself if url is REFRESH_PAGE and there is no response from server', function () {
                window.parent.CMS.config.request.url = '/my-url';
                spyOn(CMS.API.Helpers, 'reloadBrowser').and.callThrough();
                // for some reason jasmine.Ajax.install() didn't work here
                // presumably because of window.parent shenanigans.
                spyOn($, 'ajax').and.callFake(function (opts) {
                    opts.success('');
                });

                expect(CMS.API.Helpers.reloadBrowser('REFRESH_PAGE', false, true)).toEqual(false);
                expect($.ajax).toHaveBeenCalledWith(jasmine.objectContaining({
                    type: 'GET',
                    async: false,
                    url: '/my-url',
                    data: {
                        model: 'model',
                        pk: 'pk'
                    }
                }));

                expect(CMS.API.Helpers.reloadBrowser.calls.count()).toEqual(2);
                expect(CMS.API.Helpers.reloadBrowser.calls.mostRecent().args).toEqual([]);
                expect(window.parent.CMS.API.locked).toEqual(false);
                expect(window.parent.location.reload).toHaveBeenCalled();
            });

            it('uses correct timeout', function () {
                window.parent.CMS.config.request.url = '/my-url';
                spyOn(CMS.API.Helpers, 'reloadBrowser').and.callThrough();
                window.parent.setTimeout = jasmine.createSpy().and.callFake(function (cb, timeout) {
                    expect(timeout).toEqual(50);
                    cb();
                });
                // for some reason jasmine.Ajax.install() didn't work here
                // presumably because of window.parent shenanigans.
                spyOn($, 'ajax').and.callFake(function (opts) {
                    opts.success('');
                });

                expect(CMS.API.Helpers.reloadBrowser('/new-url', 50, false)).toEqual(undefined);
                expect($.ajax).not.toHaveBeenCalled();
                expect(window.parent.location.href).toEqual('/new-url');
            });
        });

        describe('.preventSubmit()', function () {
            var markup;
            beforeEach(function () {
                markup = fixture.load('toolbar_form.html');
            });

            afterEach(function () {
                fixture.cleanup();
            });

            it('should prevent forms from being submitted when one form is submitted', function (done) {
                CMS.API.Toolbar = CMS.API.Toolbar || { showLoader: jasmine.createSpy('spy') };
                var submitCallback = jasmine.createSpy().and.returnValue(false);

                $(function () {
                    CMS.API.Helpers.preventSubmit();
                    var form = $('.cms-toolbar #form1');
                    var input1 = $('input[type=submit]').eq(0);
                    var input2 = $('input[type=submit]').eq(1);
                    form.submit(submitCallback);
                    form.find('input').trigger('click');

                    expect(input1).toHaveCss({ opacity: '0.5' });
                    expect(input2).toHaveCss({ opacity: '0.5' });

                    spyOnEvent(input1, 'click');
                    spyOnEvent(input2, 'click');

                    input1.trigger('click');
                    input2.trigger('click');

                    expect('click').toHaveBeenPreventedOn(input1);
                    expect('click').toHaveBeenPreventedOn(input2);
                    expect(CMS.API.Toolbar.showLoader).toHaveBeenCalled();
                    expect(submitCallback).toHaveBeenCalled();
                    done();
                });
            });
        });

        describe('.csrf()', function () {
            it('should set csrf token on ajax requests', function () {
                var token = 'csrf';
                var request;

                jasmine.Ajax.install();
                $.ajax('/test');
                request = jasmine.Ajax.requests.mostRecent();
                expect(request.requestHeaders['X-CSRFToken']).toEqual(undefined);

                spyOn($, 'ajaxSetup').and.callThrough();
                CMS.API.Helpers.csrf(token);
                expect($.ajaxSetup).toHaveBeenCalled();
                expect($.ajaxSetup.calls.count()).toEqual(1);

                $.ajax('/test');
                request = jasmine.Ajax.requests.mostRecent();
                expect(request.requestHeaders['X-CSRFToken']).toEqual(token);
                jasmine.Ajax.uninstall();
            });
        });

        describe('.setSettings()', function () {
            beforeEach(function () {
                CMS.API.Helpers._isStorageSupported = true;
                localStorage.clear();
                jasmine.Ajax.install();

                jasmine.Ajax.stubRequest('/my-settings-url').andReturn({
                    status: 200,
                    contentType: 'text/plain',
                    responseText: "{\"serverSetting\":true}"
                });

                jasmine.Ajax.stubRequest('/my-settings-url-with-empty-response').andReturn({
                    status: 200,
                    contentType: 'text/plain',
                    responseText: ''
                });

                jasmine.Ajax.stubRequest('/my-settings-url').andReturn({
                    status: 200,
                    contentType: 'text/plain',
                    responseText: "{\"serverSetting\":true}"
                });

                jasmine.Ajax.stubRequest('/my-broken-settings-url').andReturn({
                    status: 500,
                    responseText: 'Fail'
                });
            });

            afterEach(function () {
                jasmine.Ajax.uninstall();
            });

            it('should put settings in localStorage if it is available', function () {
                CMS.config = {
                    settings: {}
                };
                CMS.API.Toolbar = {
                    showLoader: jasmine.createSpy(),
                    hideLoader: jasmine.createSpy()
                };

                expect(CMS.API.Helpers.setSettings({ mySetting: true })).toEqual({ mySetting: true });
                expect(localStorage.getItem('cms_cookie')).toEqual('{"mySetting":true}');
                expect(CMS.API.Toolbar.showLoader.calls.count()).toEqual(1);
                expect(CMS.API.Toolbar.hideLoader.calls.count()).toEqual(1);

                CMS.config.settings = { mySetting: false };
                expect(CMS.API.Helpers.setSettings({ anotherSetting: true })).toEqual({
                    mySetting: false,
                    anotherSetting: true
                });
                expect(localStorage.getItem('cms_cookie')).toEqual('{"mySetting":false,"anotherSetting":true}');
                expect(CMS.API.Toolbar.showLoader.calls.count()).toEqual(2);
                expect(CMS.API.Toolbar.hideLoader.calls.count()).toEqual(2);

                expect(CMS.API.Helpers.setSettings({ mySetting: true })).toEqual({
                    mySetting: true
                });
                expect(localStorage.getItem('cms_cookie')).toEqual('{"mySetting":true}');
                expect(CMS.API.Toolbar.showLoader.calls.count()).toEqual(3);
                expect(CMS.API.Toolbar.hideLoader.calls.count()).toEqual(3);
            });

            it('makes a synchronous request to the session url if localStorage is not available', function () {
                CMS.API.Helpers._isStorageSupported = false;
                CMS.config = {
                    urls: {
                        settings: '/my-settings-url'
                    }
                };
                CMS.API.Toolbar = {
                    showLoader: jasmine.createSpy(),
                    hideLoader: jasmine.createSpy()
                };

                expect(CMS.API.Helpers.setSettings({ mySetting: true })).toEqual({ serverSetting: true });

                expect(CMS.API.Toolbar.showLoader.calls.count()).toEqual(1);
                expect(CMS.API.Toolbar.hideLoader.calls.count()).toEqual(1);
            });

            it('uses default settings if response is empty', function () {
                CMS.API.Helpers._isStorageSupported = false;
                CMS.config = {
                    settings: {
                        defaultSetting: true
                    },
                    urls: {
                        settings: '/my-settings-url-with-empty-response'
                    }
                };
                CMS.API.Toolbar = {
                    showLoader: jasmine.createSpy(),
                    hideLoader: jasmine.createSpy()
                };

                expect(CMS.API.Helpers.setSettings({ mySetting: true })).toEqual({ defaultSetting: true });

                expect(CMS.API.Toolbar.showLoader.calls.count()).toEqual(1);
                expect(CMS.API.Toolbar.hideLoader.calls.count()).toEqual(1);
            });

            it('makes a synchronous request which can fail', function () {
                CMS.API.Helpers._isStorageSupported = false;
                CMS.config = {
                    urls: {
                        settings: '/my-broken-settings-url'
                    }
                };
                CMS.API.Messages = {
                    open: jasmine.createSpy()
                };
                CMS.API.Toolbar = {
                    showLoader: jasmine.createSpy(),
                    hideLoader: jasmine.createSpy()
                };

                expect(CMS.API.Helpers.setSettings({ mySetting: true })).toEqual({ mySetting: true });

                expect(CMS.API.Toolbar.showLoader).toHaveBeenCalled();
                expect(CMS.API.Toolbar.hideLoader).not.toHaveBeenCalled();
                expect(CMS.API.Messages.open).toHaveBeenCalledWith({
                    message: 'Fail | 500 error',
                    error: true
                });
            });
        });

        describe('.getSettings()', function () {
            beforeEach(function () {
                CMS.API.Helpers._isStorageSupported = true;
                localStorage.clear();
                jasmine.Ajax.install();

                jasmine.Ajax.stubRequest('/my-settings-url').andReturn({
                    status: 200,
                    contentType: 'text/plain',
                    responseText: "{\"serverSetting\":true}"
                });

                jasmine.Ajax.stubRequest('/my-settings-url-with-empty-response').andReturn({
                    status: 200,
                    contentType: 'text/plain',
                    responseText: ''
                });

                jasmine.Ajax.stubRequest('/my-settings-url').andReturn({
                    status: 200,
                    contentType: 'text/plain',
                    responseText: "{\"serverSetting\":true}"
                });

                jasmine.Ajax.stubRequest('/my-broken-settings-url').andReturn({
                    status: 500,
                    responseText: 'Fail'
                });
            });

            afterEach(function () {
                jasmine.Ajax.uninstall();
            });

            it('should get settings from localStorage', function () {
                localStorage.setItem('cms_cookie', JSON.stringify({ presetSetting: true }));
                CMS.settings = {};
                CMS.config = {
                    settings: {}
                };
                CMS.API.Toolbar = {
                    showLoader: jasmine.createSpy(),
                    hideLoader: jasmine.createSpy()
                };

                expect(CMS.API.Helpers.getSettings()).toEqual({ presetSetting: true });

                expect(CMS.API.Toolbar.showLoader.calls.count()).toEqual(1);
                expect(CMS.API.Toolbar.hideLoader.calls.count()).toEqual(1);
            });

            it('should first set settings from CMS.config is there are no settings in localstorage', function () {
                CMS.settings = {};
                CMS.config = {
                    settings: {
                        configSetting: true
                    }
                };
                CMS.API.Toolbar = {
                    showLoader: jasmine.createSpy(),
                    hideLoader: jasmine.createSpy()
                };
                spyOn(CMS.API.Helpers, 'setSettings').and.callThrough();

                expect(CMS.API.Helpers.getSettings()).toEqual({ configSetting: true });

                expect(CMS.API.Toolbar.showLoader.calls.count()).toEqual(2);
                expect(CMS.API.Toolbar.hideLoader.calls.count()).toEqual(2);
                expect(CMS.API.Helpers.setSettings).toHaveBeenCalled();
            });

            it('makes a synchronous request to the session url if localStorage is not available', function () {
                CMS.API.Helpers._isStorageSupported = false;
                CMS.config = {
                    urls: {
                        settings: '/my-settings-url'
                    }
                };
                CMS.API.Toolbar = {
                    showLoader: jasmine.createSpy(),
                    hideLoader: jasmine.createSpy()
                };

                expect(CMS.API.Helpers.getSettings()).toEqual({ serverSetting: true });

                expect(CMS.API.Toolbar.showLoader.calls.count()).toEqual(1);
                expect(CMS.API.Toolbar.hideLoader.calls.count()).toEqual(1);
            });

            it('uses default settings if response is empty', function () {
                CMS.API.Helpers._isStorageSupported = false;
                CMS.config = {
                    settings: {
                        defaultSetting: true
                    },
                    urls: {
                        settings: '/my-settings-url-with-empty-response'
                    }
                };
                CMS.API.Toolbar = {
                    showLoader: jasmine.createSpy(),
                    hideLoader: jasmine.createSpy()
                };

                expect(CMS.API.Helpers.getSettings()).toEqual({ defaultSetting: true });

                expect(CMS.API.Toolbar.showLoader.calls.count()).toEqual(1);
                expect(CMS.API.Toolbar.hideLoader.calls.count()).toEqual(1);
            });

            it('makes a synchronous request which can fail', function () {
                CMS.API.Helpers._isStorageSupported = false;
                CMS.config = {
                    settings: { test: false },
                    urls: {
                        settings: '/my-broken-settings-url'
                    }
                };
                CMS.API.Messages = {
                    open: jasmine.createSpy()
                };
                CMS.API.Toolbar = {
                    showLoader: jasmine.createSpy(),
                    hideLoader: jasmine.createSpy()
                };

                expect(CMS.API.Helpers.getSettings()).toEqual({ test: false });

                expect(CMS.API.Toolbar.showLoader).toHaveBeenCalled();
                expect(CMS.API.Toolbar.hideLoader).not.toHaveBeenCalled();
                expect(CMS.API.Messages.open).toHaveBeenCalledWith({
                    message: 'Fail | 500 error',
                    error: true
                });
            });
        });

        describe('.makeURL()', function () {
            it('outputs the same url when no additional params passed', function () {
                var url = CMS.API.Helpers.makeURL('test');
                expect(url).toEqual('test');
            });

            it('outputs new url when additional params passed', function () {
                var url;

                url = CMS.API.Helpers.makeURL('test', ['param=1']);
                expect(url).toEqual('test?param=1');
            });

            it('outputs new url when there are multiple additional params', function () {
                var url;

                url = CMS.API.Helpers.makeURL('test', ['param=1', 'another=2']);
                expect(url).toEqual('test?param=1&amp;another=2');

                url = CMS.API.Helpers.makeURL('test?param=1', ['another=2']);
                expect(url).toEqual('test?param=1&amp;another=2');

                url = CMS.API.Helpers.makeURL('test?param=1&another=2', ['different=3']);
                expect(url).toEqual('test?param=1&amp;another=2&amp;different=3');

                url = CMS.API.Helpers.makeURL('test?param=1&amp;another=2', ['different=3']);
                expect(url).toEqual('test?param=1&amp;another=2&amp;different=3');

                url = CMS.API.Helpers.makeURL('test?param=1&another=2&amp;again=3', ['different=3']);
                expect(url).toEqual('test?param=1&amp;another=2&amp;again=3&amp;different=3');
            });

            it('replaces param values with new ones if they match', function () {
                var url;

                url = CMS.API.Helpers.makeURL('test?param=1&amp;another=2', ['another=3']);
                expect(url).toEqual('test?param=1&amp;another=3');

                url = CMS.API.Helpers.makeURL('test?param=1&amp;another=2', ['another=3', 'param=4']);
                expect(url).toEqual('test?param=4&amp;another=3');
            });
        });

        describe('.debounce()', function () {
            it('debounces the function', function (done) {
                var count = 0;
                var fn = function () {
                    count++;
                };

                var debounced = CMS.API.Helpers.debounce(fn, 10);

                debounced();
                debounced();
                debounced();

                setTimeout(function () {
                    expect(count).toEqual(1);
                    done();
                }, 20);
            });

            it('should support `immediate` option', function (done) {
                var withImmediateCount = 0;
                var withoutImmediateCount = 0;
                var withImmediate = CMS.API.Helpers.debounce(function () {
                    withImmediateCount++;
                }, 10, { immediate: true });
                var withoutImmediate = CMS.API.Helpers.debounce(function () {
                    withoutImmediateCount++;
                }, 10, { immediate: false });

                withImmediate();
                withImmediate();
                expect(withImmediateCount).toEqual(1);

                withoutImmediate();
                withoutImmediate();

                setTimeout(function () {
                    expect(withImmediateCount).toEqual(1);
                    expect(withoutImmediateCount).toEqual(1);
                    withImmediate();
                    expect(withImmediateCount).toEqual(2);

                    done();
                }, 20);
            });

            it('should use correct `this` value', function (done) {
                var actual = [];
                var object = {
                    method: CMS.API.Helpers.debounce(function () {
                        actual.push(this);
                    }, 10)
                };

                object.method();
                object.method();

                setTimeout(function () {
                    expect([object]).toEqual(actual);
                    done();
                }, 20);
            });
        });

        describe('.throttle()', function () {
            it('should throttle a function', function (done) {
                var count = 0;
                var fn = function () {
                    count++;
                };

                var throttled = CMS.API.Helpers.throttle(fn, 10);

                throttled();
                throttled();
                throttled();

                expect(count).toEqual(1);
                setTimeout(function () {
                    expect(count).toEqual(2);
                    done();
                }, 35);
            });

            it('subsequent calls should return the result of the first call', function () {
                var fn = function (param) {
                    return param;
                };

                var throttled = CMS.API.Helpers.throttle(fn, 10);
                var result = [throttled('a'), throttled('b')];

                expect(result).toEqual(['a', 'a']);
            });

            it('should not trigger a trailing call when invoked once', function (done) {
                var count = 0;
                var fn = function () {
                    count++;
                };

                var throttled = CMS.API.Helpers.throttle(fn, 10);

                throttled();

                expect(count).toEqual(1);
                setTimeout(function () {
                    expect(count).toEqual(1);
                    done();
                }, 35);
            });

            it('should support a leading option', function () {
                var fn = function (param) {
                    return param;
                };
                var withLeading = CMS.API.Helpers.throttle(fn, 10, { leading: true });
                var withoutLeading = CMS.API.Helpers.throttle(fn, 10, { leading: false });
                expect(withLeading('a')).toEqual('a');
                expect(withoutLeading('a')).toEqual(undefined);
            });

            it('should support a trailing option', function (done) {
                var withCount = 0;
                var withoutCount = 0;
                var withTrailing = CMS.API.Helpers.throttle(function (param) {
                    withCount++;
                    return param;
                }, 10, { trailing: true });
                var withoutTrailing = CMS.API.Helpers.throttle(function (param) {
                    withoutCount++;
                    return param;
                }, 10, { trailing: false });

                expect(withTrailing('a')).toEqual('a');
                expect(withTrailing('b')).toEqual('a');

                expect(withoutTrailing('a')).toEqual('a');
                expect(withoutTrailing('b')).toEqual('a');

                setTimeout(function () {
                    expect(withCount).toEqual(2);
                    expect(withoutCount).toEqual(1);
                    done();
                }, 20);
            });

            it('should use correct `this` value', function () {
                var actual = [];
                var object = {
                    method: CMS.API.Helpers.throttle(function () {
                        actual.push(this);
                    }, 10)
                };

                object.method();
                object.method();

                expect([object]).toEqual(actual);
            });
        });

        describe('.secureConfirm()', function () {
            it('returns true if confirm is prevented', function () {
                spyOn(window, 'confirm').and.callFake(function (message) {
                    expect(message).toEqual('message');
                    return false;
                });
                expect(CMS.API.Helpers.secureConfirm('message')).toEqual(true);
            });

            it('returns actual value if confirm is not prevented', function () {
                jasmine.clock().install();
                jasmine.clock().mockDate();
                spyOn(window, 'confirm').and.callFake(function () {
                    jasmine.clock().tick(15);
                    return false;
                });

                expect(CMS.API.Helpers.secureConfirm('cms')).toEqual(false);

                window.confirm.and.callFake(function () {
                    jasmine.clock().tick(15);
                    return true;
                });

                expect(CMS.API.Helpers.secureConfirm('cms')).toEqual(true);

                jasmine.clock().uninstall();
            });
        });

        describe('.addEventListener()', function () {
            beforeEach(function () {
                fixture.load('cms_root.html');
            });

            afterEach(function () {
                fixture.cleanup();
            });

            it('adds an event', function (done) {
                $(function () {
                    CMS._eventRoot = $('#cms-top');
                    CMS.API.Helpers.addEventListener('my-event', $.noop);

                    expect($('#cms-top')).toHandle('cms-my-event');

                    done();
                });
            });
            it('adds multiple events', function (done) {
                $(function () {
                    CMS._eventRoot = $('#cms-top');
                    CMS.API.Helpers.addEventListener('my-event my-other-event', $.noop);

                    expect($('#cms-top')).toHandle('cms-my-event');
                    expect($('#cms-top')).toHandle('cms-my-other-event');

                    done();
                });
            });
        });

        describe('.removeEventListener()', function () {
            beforeEach(function () {
                fixture.load('cms_root.html');
            });

            afterEach(function () {
                fixture.cleanup();
            });
            it('removes an event', function (done) {
                $(function () {
                    CMS._eventRoot = $('#cms-top');

                    CMS.API.Helpers.addEventListener('my-event', $.noop);
                    CMS.API.Helpers.removeEventListener('my-event');

                    expect($('#cms-top')).not.toHandle('cms-my-event');

                    done();
                });
            });

            it('removes an event with correct handler', function (done) {
                $(function () {
                    CMS._eventRoot = $('#cms-top');
                    var fn = function () {
                        expect(true).toEqual(true);
                    };

                    CMS.API.Helpers.addEventListener('my-event', $.noop);
                    CMS.API.Helpers.addEventListener('my-event', fn);
                    CMS.API.Helpers.removeEventListener('my-event', $.noop);

                    expect($('#cms-top')).toHandleWith('cms-my-event', fn);
                    expect($('#cms-top')).not.toHandleWith('cms-my-event', $.noop);

                    done();
                });
            });

            it('removes multiple events', function (done) {
                $(function () {
                    CMS._eventRoot = $('#cms-top');

                    CMS.API.Helpers.addEventListener('my-event my-other-event', $.noop);
                    CMS.API.Helpers.removeEventListener('my-event my-other-event');

                    expect($('#cms-top')).not.toHandle('cms-my-event');
                    expect($('#cms-top')).not.toHandle('cms-my-other-event');

                    done();
                });
            });
        });

        describe('.dispatchEvent()', function () {
            beforeEach(function () {
                fixture.load('cms_root.html');
            });

            afterEach(function () {
                fixture.cleanup();
            });
            it('dispatches an event', function (done) {
                $(function () {
                    CMS._eventRoot = $('#cms-top');
                    var fn = jasmine.createSpy();
                    CMS.API.Helpers.addEventListener('my-event', fn);
                    CMS.API.Helpers.dispatchEvent('my-event');
                    expect(fn).toHaveBeenCalled();
                    done();
                });
            });

            it('does not dispatch multiple events', function (done) {
                $(function () {
                    CMS._eventRoot = $('#cms-top');
                    var fn1 = jasmine.createSpy();
                    var fn2 = jasmine.createSpy();

                    CMS.API.Helpers.addEventListener('my-event', fn1);
                    CMS.API.Helpers.addEventListener('my-another-event', fn2);
                    CMS.API.Helpers.dispatchEvent('my-event my-another-event');
                    expect(fn1).not.toHaveBeenCalled();
                    expect(fn2).not.toHaveBeenCalled();
                    done();
                });
            });

            it('can attach payload to event', function (done) {
                $(function () {
                    CMS._eventRoot = $('#cms-top');
                    var fn = jasmine.createSpy();

                    CMS.API.Helpers.addEventListener('my-event', fn);
                    CMS.API.Helpers.dispatchEvent('my-event', {
                        payload: 'djangoCMS'
                    });
                    expect(fn).toHaveBeenCalledWith(jasmine.any(Object), {
                        payload: 'djangoCMS'
                    });
                    done();
                });
            });
        });

        describe('.once()', function () {
            it('executes given function only once', function () {
                var count = 0;
                var fn = function () {
                    count++;
                };
                var onced = CMS.API.Helpers.once(fn);

                onced();
                onced();
                onced();
                onced();

                expect(count).toEqual(1);
            });

            it('should use correct `this` value', function () {
                var actual = [];
                var object = {
                    method: CMS.API.Helpers.once(function () {
                        actual.push(this);
                    })
                };

                object.method();
                object.method();
                object.method();

                expect([object]).toEqual(actual);
            });
        });

        describe('.preventTouchScrolling()', function () {
            it('prevents touch move on an element', function () {
                CMS.API.Helpers.preventTouchScrolling($(document), 'tests');
                expect($(document)).toHandle('touchmove');
                expect($(document)).toHandle('touchmove.cms.preventscroll.tests');
                var event = spyOnEvent(document, 'touchmove');
                $(document).trigger('touchmove');
                expect(event).toHaveBeenPrevented();
            });
        });

        // depends on the previous one
        describe('.allowTouchScrolling()', function () {
            it('allows touch move on an element', function () {
                expect($(document)).toHandle('touchmove');
                expect($(document)).toHandle('touchmove.cms.preventscroll.tests');
                CMS.API.Helpers.allowTouchScrolling($(document), 'tests');
                var event = spyOnEvent(document, 'touchmove');
                $(document).trigger('touchmove');
                expect(event).not.toHaveBeenPrevented();
            });
        });
    });
});
