
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /*
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     */

    const isUndefined = value => typeof value === "undefined";

    const isFunction = value => typeof value === "function";

    const isNumber = value => typeof value === "number";

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
    	return (
    		!event.defaultPrevented &&
    		event.button === 0 &&
    		!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
    	);
    }

    function createCounter() {
    	let i = 0;
    	/**
    	 * Returns an id and increments the internal state
    	 * @returns {number}
    	 */
    	return () => i++;
    }

    /**
     * Create a globally unique id
     *
     * @returns {string} An id
     */
    function createGlobalId() {
    	return Math.random().toString(36).substring(2);
    }

    const isSSR = typeof window === "undefined";

    function addListener(target, type, handler) {
    	target.addEventListener(type, handler);
    	return () => target.removeEventListener(type, handler);
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    /*
     * Adapted from https://github.com/EmilTholin/svelte-routing
     *
     * https://github.com/EmilTholin/svelte-routing/blob/master/LICENSE
     */

    const createKey = ctxName => `@@svnav-ctx__${ctxName}`;

    // Use strings instead of objects, so different versions of
    // svelte-navigator can potentially still work together
    const LOCATION = createKey("LOCATION");
    const ROUTER = createKey("ROUTER");
    const ROUTE = createKey("ROUTE");
    const ROUTE_PARAMS = createKey("ROUTE_PARAMS");
    const FOCUS_ELEM = createKey("FOCUS_ELEM");

    const paramRegex = /^:(.+)/;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    const startsWith = (string, search) =>
    	string.substr(0, search.length) === search;

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    const isRootSegment = segment => segment === "";

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    const isDynamic = segment => paramRegex.test(segment);

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    const isSplat = segment => segment[0] === "*";

    /**
     * Strip potention splat and splatname of the end of a path
     * @param {string} str
     * @return {string}
     */
    const stripSplat = str => str.replace(/\*.*$/, "");

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    const stripSlashes = str => str.replace(/(^\/+|\/+$)/g, "");

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri, filterFalsy = false) {
    	const segments = stripSlashes(uri).split("/");
    	return filterFalsy ? segments.filter(Boolean) : segments;
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    const addQuery = (pathname, query) =>
    	pathname + (query ? `?${query}` : "");

    /**
     * Normalizes a basepath
     *
     * @param {string} path
     * @returns {string}
     *
     * @example
     * normalizePath("base/path/") // -> "/base/path"
     */
    const normalizePath = path => `/${stripSlashes(path)}`;

    /**
     * Joins and normalizes multiple path fragments
     *
     * @param {...string} pathFragments
     * @returns {string}
     */
    function join(...pathFragments) {
    	const joinFragment = fragment => segmentize(fragment, true).join("/");
    	const joinedSegments = pathFragments.map(joinFragment).join("/");
    	return normalizePath(joinedSegments);
    }

    // We start from 1 here, so we can check if an origin id has been passed
    // by using `originId || <fallback>`
    const LINK_ID = 1;
    const ROUTE_ID = 2;
    const ROUTER_ID = 3;
    const USE_FOCUS_ID = 4;
    const USE_LOCATION_ID = 5;
    const USE_MATCH_ID = 6;
    const USE_NAVIGATE_ID = 7;
    const USE_PARAMS_ID = 8;
    const USE_RESOLVABLE_ID = 9;
    const USE_RESOLVE_ID = 10;
    const NAVIGATE_ID = 11;

    const labels = {
    	[LINK_ID]: "Link",
    	[ROUTE_ID]: "Route",
    	[ROUTER_ID]: "Router",
    	[USE_FOCUS_ID]: "useFocus",
    	[USE_LOCATION_ID]: "useLocation",
    	[USE_MATCH_ID]: "useMatch",
    	[USE_NAVIGATE_ID]: "useNavigate",
    	[USE_PARAMS_ID]: "useParams",
    	[USE_RESOLVABLE_ID]: "useResolvable",
    	[USE_RESOLVE_ID]: "useResolve",
    	[NAVIGATE_ID]: "navigate",
    };

    const createLabel = labelId => labels[labelId];

    function createIdentifier(labelId, props) {
    	let attr;
    	if (labelId === ROUTE_ID) {
    		attr = props.path ? `path="${props.path}"` : "default";
    	} else if (labelId === LINK_ID) {
    		attr = `to="${props.to}"`;
    	} else if (labelId === ROUTER_ID) {
    		attr = `basepath="${props.basepath || ""}"`;
    	}
    	return `<${createLabel(labelId)} ${attr || ""} />`;
    }

    function createMessage(labelId, message, props, originId) {
    	const origin = props && createIdentifier(originId || labelId, props);
    	const originMsg = origin ? `\n\nOccurred in: ${origin}` : "";
    	const label = createLabel(labelId);
    	const msg = isFunction(message) ? message(label) : message;
    	return `<${label}> ${msg}${originMsg}`;
    }

    const createMessageHandler = handler => (...args) =>
    	handler(createMessage(...args));

    const fail = createMessageHandler(message => {
    	throw new Error(message);
    });

    // eslint-disable-next-line no-console
    const warn = createMessageHandler(console.warn);

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
    	const score = route.default
    		? 0
    		: segmentize(route.fullPath).reduce((acc, segment) => {
    				let nextScore = acc;
    				nextScore += SEGMENT_POINTS;

    				if (isRootSegment(segment)) {
    					nextScore += ROOT_POINTS;
    				} else if (isDynamic(segment)) {
    					nextScore += DYNAMIC_POINTS;
    				} else if (isSplat(segment)) {
    					nextScore -= SEGMENT_POINTS + SPLAT_PENALTY;
    				} else {
    					nextScore += STATIC_POINTS;
    				}

    				return nextScore;
    		  }, 0);

    	return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
    	return (
    		routes
    			.map(rankRoute)
    			// If two routes have the exact same score, we go by index instead
    			.sort((a, b) => {
    				if (a.score < b.score) {
    					return 1;
    				}
    				if (a.score > b.score) {
    					return -1;
    				}
    				return a.index - b.index;
    			})
    	);
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { fullPath, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
    	let bestMatch;
    	let defaultMatch;

    	const [uriPathname] = uri.split("?");
    	const uriSegments = segmentize(uriPathname);
    	const isRootUri = uriSegments[0] === "";
    	const ranked = rankRoutes(routes);

    	for (let i = 0, l = ranked.length; i < l; i++) {
    		const { route } = ranked[i];
    		let missed = false;
    		const params = {};

    		// eslint-disable-next-line no-shadow
    		const createMatch = uri => ({ ...route, params, uri });

    		if (route.default) {
    			defaultMatch = createMatch(uri);
    			continue;
    		}

    		const routeSegments = segmentize(route.fullPath);
    		const max = Math.max(uriSegments.length, routeSegments.length);
    		let index = 0;

    		for (; index < max; index++) {
    			const routeSegment = routeSegments[index];
    			const uriSegment = uriSegments[index];

    			if (!isUndefined(routeSegment) && isSplat(routeSegment)) {
    				// Hit a splat, just grab the rest, and return a match
    				// uri:   /files/documents/work
    				// route: /files/* or /files/*splatname
    				const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

    				params[splatName] = uriSegments
    					.slice(index)
    					.map(decodeURIComponent)
    					.join("/");
    				break;
    			}

    			if (isUndefined(uriSegment)) {
    				// URI is shorter than the route, no match
    				// uri:   /users
    				// route: /users/:userId
    				missed = true;
    				break;
    			}

    			const dynamicMatch = paramRegex.exec(routeSegment);

    			if (dynamicMatch && !isRootUri) {
    				const value = decodeURIComponent(uriSegment);
    				params[dynamicMatch[1]] = value;
    			} else if (routeSegment !== uriSegment) {
    				// Current segments don't match, not dynamic, not splat, so no match
    				// uri:   /users/123/settings
    				// route: /users/:id/profile
    				missed = true;
    				break;
    			}
    		}

    		if (!missed) {
    			bestMatch = createMatch(join(...uriSegments.slice(0, index)));
    			break;
    		}
    	}

    	return bestMatch || defaultMatch || null;
    }

    /**
     * Check if the `route.fullPath` matches the `uri`.
     * @param {Object} route
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
    	return pick([route], uri);
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
    	// /foo/bar, /baz/qux => /foo/bar
    	if (startsWith(to, "/")) {
    		return to;
    	}

    	const [toPathname, toQuery] = to.split("?");
    	const [basePathname] = base.split("?");
    	const toSegments = segmentize(toPathname);
    	const baseSegments = segmentize(basePathname);

    	// ?a=b, /users?b=c => /users?a=b
    	if (toSegments[0] === "") {
    		return addQuery(basePathname, toQuery);
    	}

    	// profile, /users/789 => /users/789/profile
    	if (!startsWith(toSegments[0], ".")) {
    		const pathname = baseSegments.concat(toSegments).join("/");
    		return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
    	}

    	// ./       , /users/123 => /users/123
    	// ../      , /users/123 => /users
    	// ../..    , /users/123 => /
    	// ../../one, /a/b/c/d   => /a/b/one
    	// .././one , /a/b/c/d   => /a/b/c/one
    	const allSegments = baseSegments.concat(toSegments);
    	const segments = [];

    	allSegments.forEach(segment => {
    		if (segment === "..") {
    			segments.pop();
    		} else if (segment !== ".") {
    			segments.push(segment);
    		}
    	});

    	return addQuery(`/${segments.join("/")}`, toQuery);
    }

    /**
     * Normalizes a location for consumption by `Route` children and the `Router`.
     * It removes the apps basepath from the pathname
     * and sets default values for `search` and `hash` properties.
     *
     * @param {Object} location The current global location supplied by the history component
     * @param {string} basepath The applications basepath (i.e. when serving from a subdirectory)
     *
     * @returns The normalized location
     */
    function normalizeLocation(location, basepath) {
    	const { pathname, hash = "", search = "", state } = location;
    	const baseSegments = segmentize(basepath, true);
    	const pathSegments = segmentize(pathname, true);
    	while (baseSegments.length) {
    		if (baseSegments[0] !== pathSegments[0]) {
    			fail(
    				ROUTER_ID,
    				`Invalid state: All locations must begin with the basepath "${basepath}", found "${pathname}"`,
    			);
    		}
    		baseSegments.shift();
    		pathSegments.shift();
    	}
    	return {
    		pathname: join(...pathSegments),
    		hash,
    		search,
    		state,
    	};
    }

    const normalizeUrlFragment = frag => (frag.length === 1 ? "" : frag);

    /**
     * Creates a location object from an url.
     * It is used to create a location from the url prop used in SSR
     *
     * @param {string} url The url string (e.g. "/path/to/somewhere")
     *
     * @returns {{ pathname: string; search: string; hash: string }} The location
     */
    function createLocation(url) {
    	const searchIndex = url.indexOf("?");
    	const hashIndex = url.indexOf("#");
    	const hasSearchIndex = searchIndex !== -1;
    	const hasHashIndex = hashIndex !== -1;
    	const hash = hasHashIndex ? normalizeUrlFragment(url.substr(hashIndex)) : "";
    	const pathnameAndSearch = hasHashIndex ? url.substr(0, hashIndex) : url;
    	const search = hasSearchIndex
    		? normalizeUrlFragment(pathnameAndSearch.substr(searchIndex))
    		: "";
    	const pathname = hasSearchIndex
    		? pathnameAndSearch.substr(0, searchIndex)
    		: pathnameAndSearch;
    	return { pathname, search, hash };
    }

    /**
     * Resolves a link relative to the parent Route and the Routers basepath.
     *
     * @param {string} path The given path, that will be resolved
     * @param {string} routeBase The current Routes base path
     * @param {string} appBase The basepath of the app. Used, when serving from a subdirectory
     * @returns {string} The resolved path
     *
     * @example
     * resolveLink("relative", "/routeBase", "/") // -> "/routeBase/relative"
     * resolveLink("/absolute", "/routeBase", "/") // -> "/absolute"
     * resolveLink("relative", "/routeBase", "/base") // -> "/base/routeBase/relative"
     * resolveLink("/absolute", "/routeBase", "/base") // -> "/base/absolute"
     */
    function resolveLink(path, routeBase, appBase) {
    	return join(appBase, resolve(path, routeBase));
    }

    /**
     * Get the uri for a Route, by matching it against the current location.
     *
     * @param {string} routePath The Routes resolved path
     * @param {string} pathname The current locations pathname
     */
    function extractBaseUri(routePath, pathname) {
    	const fullPath = normalizePath(stripSplat(routePath));
    	const baseSegments = segmentize(fullPath, true);
    	const pathSegments = segmentize(pathname, true).slice(0, baseSegments.length);
    	const routeMatch = match({ fullPath }, join(...pathSegments));
    	return routeMatch && routeMatch.uri;
    }

    /*
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     */

    const POP = "POP";
    const PUSH = "PUSH";
    const REPLACE = "REPLACE";

    function getLocation(source) {
    	return {
    		...source.location,
    		pathname: encodeURI(decodeURI(source.location.pathname)),
    		state: source.history.state,
    		_key: (source.history.state && source.history.state._key) || "initial",
    	};
    }

    function createHistory(source) {
    	let listeners = [];
    	let location = getLocation(source);
    	let action = POP;

    	const notifyListeners = (listenerFns = listeners) =>
    		listenerFns.forEach(listener => listener({ location, action }));

    	return {
    		get location() {
    			return location;
    		},
    		listen(listener) {
    			listeners.push(listener);

    			const popstateListener = () => {
    				location = getLocation(source);
    				action = POP;
    				notifyListeners([listener]);
    			};

    			// Call listener when it is registered
    			notifyListeners([listener]);

    			const unlisten = addListener(source, "popstate", popstateListener);
    			return () => {
    				unlisten();
    				listeners = listeners.filter(fn => fn !== listener);
    			};
    		},
    		/**
    		 * Navigate to a new absolute route.
    		 *
    		 * @param {string|number} to The path to navigate to.
    		 *
    		 * If `to` is a number we will navigate to the stack entry index + `to`
    		 * (-> `navigate(-1)`, is equivalent to hitting the back button of the browser)
    		 * @param {Object} options
    		 * @param {*} [options.state] The state will be accessible through `location.state`
    		 * @param {boolean} [options.replace=false] Replace the current entry in the history
    		 * stack, instead of pushing on a new one
    		 */
    		navigate(to, options) {
    			const { state = {}, replace = false } = options || {};
    			action = replace ? REPLACE : PUSH;
    			if (isNumber(to)) {
    				if (options) {
    					warn(
    						NAVIGATE_ID,
    						"Navigation options (state or replace) are not supported, " +
    							"when passing a number as the first argument to navigate. " +
    							"They are ignored.",
    					);
    				}
    				action = POP;
    				source.history.go(to);
    			} else {
    				const keyedState = { ...state, _key: createGlobalId() };
    				// try...catch iOS Safari limits to 100 pushState calls
    				try {
    					source.history[replace ? "replaceState" : "pushState"](
    						keyedState,
    						"",
    						to,
    					);
    				} catch (e) {
    					source.location[replace ? "replace" : "assign"](to);
    				}
    			}

    			location = getLocation(source);
    			notifyListeners();
    		},
    	};
    }

    function createStackFrame(state, uri) {
    	return { ...createLocation(uri), state };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
    	let index = 0;
    	let stack = [createStackFrame(null, initialPathname)];

    	return {
    		// This is just for testing...
    		get entries() {
    			return stack;
    		},
    		get location() {
    			return stack[index];
    		},
    		addEventListener() {},
    		removeEventListener() {},
    		history: {
    			get state() {
    				return stack[index].state;
    			},
    			pushState(state, title, uri) {
    				index++;
    				// Throw away anything in the stack with an index greater than the current index.
    				// This happens, when we go back using `go(-n)`. The index is now less than `stack.length`.
    				// If we call `go(+n)` the stack entries with an index greater than the current index can
    				// be reused.
    				// However, if we navigate to a path, instead of a number, we want to create a new branch
    				// of navigation.
    				stack = stack.slice(0, index);
    				stack.push(createStackFrame(state, uri));
    			},
    			replaceState(state, title, uri) {
    				stack[index] = createStackFrame(state, uri);
    			},
    			go(to) {
    				const newIndex = index + to;
    				if (newIndex < 0 || newIndex > stack.length - 1) {
    					return;
    				}
    				index = newIndex;
    			},
    		},
    	};
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = !!(
    	!isSSR &&
    	window.document &&
    	window.document.createElement
    );
    // Use memory history in iframes (for example in Svelte REPL)
    const isEmbeddedPage = !isSSR && window.location.origin === "null";
    const globalHistory = createHistory(
    	canUseDOM && !isEmbeddedPage ? window : createMemorySource(),
    );

    // We need to keep the focus candidate in a separate file, so svelte does
    // not update, when we mutate it.
    // Also, we need a single global reference, because taking focus needs to
    // work globally, even if we have multiple top level routers
    // eslint-disable-next-line import/no-mutable-exports
    let focusCandidate = null;

    // eslint-disable-next-line import/no-mutable-exports
    let initialNavigation = true;

    /**
     * Check if RouterA is above RouterB in the document
     * @param {number} routerIdA The first Routers id
     * @param {number} routerIdB The second Routers id
     */
    function isAbove(routerIdA, routerIdB) {
    	const routerMarkers = document.querySelectorAll("[data-svnav-router]");
    	for (let i = 0; i < routerMarkers.length; i++) {
    		const node = routerMarkers[i];
    		const currentId = Number(node.dataset.svnavRouter);
    		if (currentId === routerIdA) return true;
    		if (currentId === routerIdB) return false;
    	}
    	return false;
    }

    /**
     * Check if a Route candidate is the best choice to move focus to,
     * and store the best match.
     * @param {{
         level: number;
         routerId: number;
         route: {
           id: number;
           focusElement: import("svelte/store").Readable<Promise<Element>|null>;
         }
       }} item A Route candidate, that updated and is visible after a navigation
     */
    function pushFocusCandidate(item) {
    	if (
    		// Best candidate if it's the only candidate...
    		!focusCandidate ||
    		// Route is nested deeper, than previous candidate
    		// -> Route change was triggered in the deepest affected
    		// Route, so that's were focus should move to
    		item.level > focusCandidate.level ||
    		// If the level is identical, we want to focus the first Route in the document,
    		// so we pick the first Router lookin from page top to page bottom.
    		(item.level === focusCandidate.level &&
    			isAbove(item.routerId, focusCandidate.routerId))
    	) {
    		focusCandidate = item;
    	}
    }

    /**
     * Reset the focus candidate.
     */
    function clearFocusCandidate() {
    	focusCandidate = null;
    }

    function initialNavigationOccurred() {
    	initialNavigation = false;
    }

    /*
     * `focus` Adapted from https://github.com/oaf-project/oaf-side-effects/blob/master/src/index.ts
     *
     * https://github.com/oaf-project/oaf-side-effects/blob/master/LICENSE
     */
    function focus(elem) {
    	if (!elem) return false;
    	const TABINDEX = "tabindex";
    	try {
    		if (!elem.hasAttribute(TABINDEX)) {
    			elem.setAttribute(TABINDEX, "-1");
    			let unlisten;
    			// We remove tabindex after blur to avoid weird browser behavior
    			// where a mouse click can activate elements with tabindex="-1".
    			const blurListener = () => {
    				elem.removeAttribute(TABINDEX);
    				unlisten();
    			};
    			unlisten = addListener(elem, "blur", blurListener);
    		}
    		elem.focus();
    		return document.activeElement === elem;
    	} catch (e) {
    		// Apparently trying to focus a disabled element in IE can throw.
    		// See https://stackoverflow.com/a/1600194/2476884
    		return false;
    	}
    }

    function isEndMarker(elem, id) {
    	return Number(elem.dataset.svnavRouteEnd) === id;
    }

    function isHeading(elem) {
    	return /^H[1-6]$/i.test(elem.tagName);
    }

    function query(selector, parent = document) {
    	return parent.querySelector(selector);
    }

    function queryHeading(id) {
    	const marker = query(`[data-svnav-route-start="${id}"]`);
    	let current = marker.nextElementSibling;
    	while (!isEndMarker(current, id)) {
    		if (isHeading(current)) {
    			return current;
    		}
    		const heading = query("h1,h2,h3,h4,h5,h6", current);
    		if (heading) {
    			return heading;
    		}
    		current = current.nextElementSibling;
    	}
    	return null;
    }

    function handleFocus(route) {
    	Promise.resolve(get_store_value(route.focusElement)).then(elem => {
    		const focusElement = elem || queryHeading(route.id);
    		if (!focusElement) {
    			warn(
    				ROUTER_ID,
    				"Could not find an element to focus. " +
    					"You should always render a header for accessibility reasons, " +
    					'or set a custom focus element via the "useFocus" hook. ' +
    					"If you don't want this Route or Router to manage focus, " +
    					'pass "primary={false}" to it.',
    				route,
    				ROUTE_ID,
    			);
    		}
    		const headingFocused = focus(focusElement);
    		if (headingFocused) return;
    		focus(document.documentElement);
    	});
    }

    const createTriggerFocus = (a11yConfig, announcementText, location) => (
    	manageFocus,
    	announceNavigation,
    ) =>
    	// Wait until the dom is updated, so we can look for headings
    	tick().then(() => {
    		if (!focusCandidate || initialNavigation) {
    			initialNavigationOccurred();
    			return;
    		}
    		if (manageFocus) {
    			handleFocus(focusCandidate.route);
    		}
    		if (a11yConfig.announcements && announceNavigation) {
    			const { path, fullPath, meta, params, uri } = focusCandidate.route;
    			const announcementMessage = a11yConfig.createAnnouncement(
    				{ path, fullPath, meta, params, uri },
    				get_store_value(location),
    			);
    			Promise.resolve(announcementMessage).then(message => {
    				announcementText.set(message);
    			});
    		}
    		clearFocusCandidate();
    	});

    const visuallyHiddenStyle =
    	"position:fixed;" +
    	"top:-1px;" +
    	"left:0;" +
    	"width:1px;" +
    	"height:1px;" +
    	"padding:0;" +
    	"overflow:hidden;" +
    	"clip:rect(0,0,0,0);" +
    	"white-space:nowrap;" +
    	"border:0;";

    /* node_modules/svelte-navigator/src/Router.svelte generated by Svelte v3.46.4 */

    const file$8 = "node_modules/svelte-navigator/src/Router.svelte";

    // (195:0) {#if isTopLevelRouter && manageFocus && a11yConfig.announcements}
    function create_if_block$2(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*$announcementText*/ ctx[0]);
    			attr_dev(div, "role", "status");
    			attr_dev(div, "aria-atomic", "true");
    			attr_dev(div, "aria-live", "polite");
    			attr_dev(div, "style", visuallyHiddenStyle);
    			add_location(div, file$8, 195, 1, 5906);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$announcementText*/ 1) set_data_dev(t, /*$announcementText*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(195:0) {#if isTopLevelRouter && manageFocus && a11yConfig.announcements}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let if_block_anchor;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[20].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], null);
    	let if_block = /*isTopLevelRouter*/ ctx[2] && /*manageFocus*/ ctx[4] && /*a11yConfig*/ ctx[1].announcements && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = space();
    			if (default_slot) default_slot.c();
    			t1 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			set_style(div, "display", "none");
    			attr_dev(div, "aria-hidden", "true");
    			attr_dev(div, "data-svnav-router", /*routerId*/ ctx[3]);
    			add_location(div, file$8, 190, 0, 5750);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t0, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			insert_dev(target, t1, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope*/ 524288)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[19],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[19])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[19], dirty, null),
    						null
    					);
    				}
    			}

    			if (/*isTopLevelRouter*/ ctx[2] && /*manageFocus*/ ctx[4] && /*a11yConfig*/ ctx[1].announcements) if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t0);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const createId$1 = createCounter();
    const defaultBasepath = "/";

    function instance$8($$self, $$props, $$invalidate) {
    	let $location;
    	let $activeRoute;
    	let $prevLocation;
    	let $routes;
    	let $announcementText;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, ['default']);
    	let { basepath = defaultBasepath } = $$props;
    	let { url = null } = $$props;
    	let { history = globalHistory } = $$props;
    	let { primary = true } = $$props;
    	let { a11y = {} } = $$props;

    	const a11yConfig = {
    		createAnnouncement: route => `Navigated to ${route.uri}`,
    		announcements: true,
    		...a11y
    	};

    	// Remember the initial `basepath`, so we can fire a warning
    	// when the user changes it later
    	const initialBasepath = basepath;

    	const normalizedBasepath = normalizePath(basepath);
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const isTopLevelRouter = !locationContext;
    	const routerId = createId$1();
    	const manageFocus = primary && !(routerContext && !routerContext.manageFocus);
    	const announcementText = writable("");
    	validate_store(announcementText, 'announcementText');
    	component_subscribe($$self, announcementText, value => $$invalidate(0, $announcementText = value));
    	const routes = writable([]);
    	validate_store(routes, 'routes');
    	component_subscribe($$self, routes, value => $$invalidate(18, $routes = value));
    	const activeRoute = writable(null);
    	validate_store(activeRoute, 'activeRoute');
    	component_subscribe($$self, activeRoute, value => $$invalidate(16, $activeRoute = value));

    	// Used in SSR to synchronously set that a Route is active.
    	let hasActiveRoute = false;

    	// Nesting level of router.
    	// We will need this to identify sibling routers, when moving
    	// focus on navigation, so we can focus the first possible router
    	const level = isTopLevelRouter ? 0 : routerContext.level + 1;

    	// If we're running an SSR we force the location to the `url` prop
    	const getInitialLocation = () => normalizeLocation(isSSR ? createLocation(url) : history.location, normalizedBasepath);

    	const location = isTopLevelRouter
    	? writable(getInitialLocation())
    	: locationContext;

    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(15, $location = value));
    	const prevLocation = writable($location);
    	validate_store(prevLocation, 'prevLocation');
    	component_subscribe($$self, prevLocation, value => $$invalidate(17, $prevLocation = value));
    	const triggerFocus = createTriggerFocus(a11yConfig, announcementText, location);
    	const createRouteFilter = routeId => routeList => routeList.filter(routeItem => routeItem.id !== routeId);

    	function registerRoute(route) {
    		if (isSSR) {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				hasActiveRoute = true;

    				// Return the match in SSR mode, so the matched Route can use it immediatly.
    				// Waiting for activeRoute to update does not work, because it updates
    				// after the Route is initialized
    				return matchingRoute; // eslint-disable-line consistent-return
    			}
    		} else {
    			routes.update(prevRoutes => {
    				// Remove an old version of the updated route,
    				// before pushing the new version
    				const nextRoutes = createRouteFilter(route.id)(prevRoutes);

    				nextRoutes.push(route);
    				return nextRoutes;
    			});
    		}
    	}

    	function unregisterRoute(routeId) {
    		routes.update(createRouteFilter(routeId));
    	}

    	if (!isTopLevelRouter && basepath !== defaultBasepath) {
    		warn(ROUTER_ID, 'Only top-level Routers can have a "basepath" prop. It is ignored.', { basepath });
    	}

    	if (isTopLevelRouter) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = history.listen(changedHistory => {
    				const normalizedLocation = normalizeLocation(changedHistory.location, normalizedBasepath);
    				prevLocation.set($location);
    				location.set(normalizedLocation);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		registerRoute,
    		unregisterRoute,
    		manageFocus,
    		level,
    		id: routerId,
    		history: isTopLevelRouter ? history : routerContext.history,
    		basepath: isTopLevelRouter
    		? normalizedBasepath
    		: routerContext.basepath
    	});

    	const writable_props = ['basepath', 'url', 'history', 'primary', 'a11y'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('basepath' in $$props) $$invalidate(10, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(11, url = $$props.url);
    		if ('history' in $$props) $$invalidate(12, history = $$props.history);
    		if ('primary' in $$props) $$invalidate(13, primary = $$props.primary);
    		if ('a11y' in $$props) $$invalidate(14, a11y = $$props.a11y);
    		if ('$$scope' in $$props) $$invalidate(19, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createCounter,
    		createId: createId$1,
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		normalizePath,
    		pick,
    		match,
    		normalizeLocation,
    		createLocation,
    		isSSR,
    		warn,
    		ROUTER_ID,
    		pushFocusCandidate,
    		visuallyHiddenStyle,
    		createTriggerFocus,
    		defaultBasepath,
    		basepath,
    		url,
    		history,
    		primary,
    		a11y,
    		a11yConfig,
    		initialBasepath,
    		normalizedBasepath,
    		locationContext,
    		routerContext,
    		isTopLevelRouter,
    		routerId,
    		manageFocus,
    		announcementText,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		level,
    		getInitialLocation,
    		location,
    		prevLocation,
    		triggerFocus,
    		createRouteFilter,
    		registerRoute,
    		unregisterRoute,
    		$location,
    		$activeRoute,
    		$prevLocation,
    		$routes,
    		$announcementText
    	});

    	$$self.$inject_state = $$props => {
    		if ('basepath' in $$props) $$invalidate(10, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(11, url = $$props.url);
    		if ('history' in $$props) $$invalidate(12, history = $$props.history);
    		if ('primary' in $$props) $$invalidate(13, primary = $$props.primary);
    		if ('a11y' in $$props) $$invalidate(14, a11y = $$props.a11y);
    		if ('hasActiveRoute' in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*basepath*/ 1024) {
    			if (basepath !== initialBasepath) {
    				warn(ROUTER_ID, 'You cannot change the "basepath" prop. It is ignored.');
    			}
    		}

    		if ($$self.$$.dirty[0] & /*$routes, $location*/ 294912) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			{
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*$location, $prevLocation*/ 163840) {
    			// Manage focus and announce navigation to screen reader users
    			{
    				if (isTopLevelRouter) {
    					const hasHash = !!$location.hash;

    					// When a hash is present in the url, we skip focus management, because
    					// focusing a different element will prevent in-page jumps (See #3)
    					const shouldManageFocus = !hasHash && manageFocus;

    					// We don't want to make an announcement, when the hash changes,
    					// but the active route stays the same
    					const announceNavigation = !hasHash || $location.pathname !== $prevLocation.pathname;

    					triggerFocus(shouldManageFocus, announceNavigation);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*$activeRoute*/ 65536) {
    			// Queue matched Route, so top level Router can decide which Route to focus.
    			// Non primary Routers should just be ignored
    			if (manageFocus && $activeRoute && $activeRoute.primary) {
    				pushFocusCandidate({ level, routerId, route: $activeRoute });
    			}
    		}
    	};

    	return [
    		$announcementText,
    		a11yConfig,
    		isTopLevelRouter,
    		routerId,
    		manageFocus,
    		announcementText,
    		routes,
    		activeRoute,
    		location,
    		prevLocation,
    		basepath,
    		url,
    		history,
    		primary,
    		a11y,
    		$location,
    		$activeRoute,
    		$prevLocation,
    		$routes,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$8,
    			create_fragment$8,
    			safe_not_equal,
    			{
    				basepath: 10,
    				url: 11,
    				history: 12,
    				primary: 13,
    				a11y: 14
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get history() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set history(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get primary() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primary(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get a11y() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set a11y(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Router$1 = Router;

    /**
     * Check if a component or hook have been created outside of a
     * context providing component
     * @param {number} componentId
     * @param {*} props
     * @param {string?} ctxKey
     * @param {number?} ctxProviderId
     */
    function usePreflightCheck(
    	componentId,
    	props,
    	ctxKey = ROUTER,
    	ctxProviderId = ROUTER_ID,
    ) {
    	const ctx = getContext(ctxKey);
    	if (!ctx) {
    		fail(
    			componentId,
    			label =>
    				`You cannot use ${label} outside of a ${createLabel(ctxProviderId)}.`,
    			props,
    		);
    	}
    }

    const toReadonly = ctx => {
    	const { subscribe } = getContext(ctx);
    	return { subscribe };
    };

    /**
     * Access the current location via a readable store.
     * @returns {import("svelte/store").Readable<{
        pathname: string;
        search: string;
        hash: string;
        state: {};
      }>}
     *
     * @example
      ```html
      <script>
        import { useLocation } from "svelte-navigator";

        const location = useLocation();

        $: console.log($location);
        // {
        //   pathname: "/blog",
        //   search: "?id=123",
        //   hash: "#comments",
        //   state: {}
        // }
      </script>
      ```
     */
    function useLocation() {
    	usePreflightCheck(USE_LOCATION_ID);
    	return toReadonly(LOCATION);
    }

    /**
     * @typedef {{
        path: string;
        fullPath: string;
        uri: string;
        params: {};
      }} RouteMatch
     */

    /**
     * @typedef {import("svelte/store").Readable<RouteMatch|null>} RouteMatchStore
     */

    /**
     * Access the history of top level Router.
     */
    function useHistory() {
    	const { history } = getContext(ROUTER);
    	return history;
    }

    /**
     * Access the base of the parent Route.
     */
    function useRouteBase() {
    	const route = getContext(ROUTE);
    	return route ? derived(route, _route => _route.base) : writable("/");
    }

    /**
     * Resolve a given link relative to the current `Route` and the `Router`s `basepath`.
     * It is used under the hood in `Link` and `useNavigate`.
     * You can use it to manually resolve links, when using the `link` or `links` actions.
     *
     * @returns {(path: string) => string}
     *
     * @example
      ```html
      <script>
        import { link, useResolve } from "svelte-navigator";

        const resolve = useResolve();
        // `resolvedLink` will be resolved relative to its parent Route
        // and the Routers `basepath`
        const resolvedLink = resolve("relativePath");
      </script>

      <a href={resolvedLink} use:link>Relative link</a>
      ```
     */
    function useResolve() {
    	usePreflightCheck(USE_RESOLVE_ID);
    	const routeBase = useRouteBase();
    	const { basepath: appBase } = getContext(ROUTER);
    	/**
    	 * Resolves the path relative to the current route and basepath.
    	 *
    	 * @param {string} path The path to resolve
    	 * @returns {string} The resolved path
    	 */
    	const resolve = path => resolveLink(path, get_store_value(routeBase), appBase);
    	return resolve;
    }

    /**
     * A hook, that returns a context-aware version of `navigate`.
     * It will automatically resolve the given link relative to the current Route.
     * It will also resolve a link against the `basepath` of the Router.
     *
     * @example
      ```html
      <!-- App.svelte -->
      <script>
        import { link, Route } from "svelte-navigator";
        import RouteComponent from "./RouteComponent.svelte";
      </script>

      <Router>
        <Route path="route1">
          <RouteComponent />
        </Route>
        <!-- ... -->
      </Router>

      <!-- RouteComponent.svelte -->
      <script>
        import { useNavigate } from "svelte-navigator";

        const navigate = useNavigate();
      </script>

      <button on:click="{() => navigate('relativePath')}">
        go to /route1/relativePath
      </button>
      <button on:click="{() => navigate('/absolutePath')}">
        go to /absolutePath
      </button>
      ```
      *
      * @example
      ```html
      <!-- App.svelte -->
      <script>
        import { link, Route } from "svelte-navigator";
        import RouteComponent from "./RouteComponent.svelte";
      </script>

      <Router basepath="/base">
        <Route path="route1">
          <RouteComponent />
        </Route>
        <!-- ... -->
      </Router>

      <!-- RouteComponent.svelte -->
      <script>
        import { useNavigate } from "svelte-navigator";

        const navigate = useNavigate();
      </script>

      <button on:click="{() => navigate('relativePath')}">
        go to /base/route1/relativePath
      </button>
      <button on:click="{() => navigate('/absolutePath')}">
        go to /base/absolutePath
      </button>
      ```
     */
    function useNavigate() {
    	usePreflightCheck(USE_NAVIGATE_ID);
    	const resolve = useResolve();
    	const { navigate } = useHistory();
    	/**
    	 * Navigate to a new route.
    	 * Resolves the link relative to the current route and basepath.
    	 *
    	 * @param {string|number} to The path to navigate to.
    	 *
    	 * If `to` is a number we will navigate to the stack entry index + `to`
    	 * (-> `navigate(-1)`, is equivalent to hitting the back button of the browser)
    	 * @param {Object} options
    	 * @param {*} [options.state]
    	 * @param {boolean} [options.replace=false]
    	 */
    	const navigateRelative = (to, options) => {
    		// If to is a number, we navigate to the target stack entry via `history.go`.
    		// Otherwise resolve the link
    		const target = isNumber(to) ? to : resolve(to);
    		return navigate(target, options);
    	};
    	return navigateRelative;
    }

    /* node_modules/svelte-navigator/src/Route.svelte generated by Svelte v3.46.4 */
    const file$7 = "node_modules/svelte-navigator/src/Route.svelte";

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*$params*/ 16,
    	location: dirty & /*$location*/ 8
    });

    const get_default_slot_context = ctx => ({
    	params: isSSR ? get_store_value(/*params*/ ctx[9]) : /*$params*/ ctx[4],
    	location: /*$location*/ ctx[3],
    	navigate: /*navigate*/ ctx[10]
    });

    // (97:0) {#if isActive}
    function create_if_block$1(ctx) {
    	let router;
    	let current;

    	router = new Router$1({
    			props: {
    				primary: /*primary*/ ctx[1],
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const router_changes = {};
    			if (dirty & /*primary*/ 2) router_changes.primary = /*primary*/ ctx[1];

    			if (dirty & /*$$scope, component, $location, $params, $$restProps*/ 264217) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(97:0) {#if isActive}",
    		ctx
    	});

    	return block;
    }

    // (113:2) {:else}
    function create_else_block$1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, $params, $location*/ 262168)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[18],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[18])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(113:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (105:2) {#if component !== null}
    function create_if_block_1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[3] },
    		{ navigate: /*navigate*/ ctx[10] },
    		isSSR ? get_store_value(/*params*/ ctx[9]) : /*$params*/ ctx[4],
    		/*$$restProps*/ ctx[11]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, navigate, isSSR, get, params, $params, $$restProps*/ 3608)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 8 && { location: /*$location*/ ctx[3] },
    					dirty & /*navigate*/ 1024 && { navigate: /*navigate*/ ctx[10] },
    					dirty & /*isSSR, get, params, $params*/ 528 && get_spread_object(isSSR ? get_store_value(/*params*/ ctx[9]) : /*$params*/ ctx[4]),
    					dirty & /*$$restProps*/ 2048 && get_spread_object(/*$$restProps*/ ctx[11])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(105:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    // (98:1) <Router {primary}>
    function create_default_slot$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(98:1) <Router {primary}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let current;
    	let if_block = /*isActive*/ ctx[2] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			div1 = element("div");
    			set_style(div0, "display", "none");
    			attr_dev(div0, "aria-hidden", "true");
    			attr_dev(div0, "data-svnav-route-start", /*id*/ ctx[5]);
    			add_location(div0, file$7, 95, 0, 2622);
    			set_style(div1, "display", "none");
    			attr_dev(div1, "aria-hidden", "true");
    			attr_dev(div1, "data-svnav-route-end", /*id*/ ctx[5]);
    			add_location(div1, file$7, 121, 0, 3295);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*isActive*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isActive*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t1.parentNode, t1);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const createId = createCounter();

    function instance$7($$self, $$props, $$invalidate) {
    	let isActive;
    	const omit_props_names = ["path","component","meta","primary"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $activeRoute;
    	let $location;
    	let $parentBase;
    	let $params;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Route', slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	let { meta = {} } = $$props;
    	let { primary = true } = $$props;
    	usePreflightCheck(ROUTE_ID, $$props);
    	const id = createId();
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, 'activeRoute');
    	component_subscribe($$self, activeRoute, value => $$invalidate(15, $activeRoute = value));
    	const parentBase = useRouteBase();
    	validate_store(parentBase, 'parentBase');
    	component_subscribe($$self, parentBase, value => $$invalidate(16, $parentBase = value));
    	const location = useLocation();
    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(3, $location = value));
    	const focusElement = writable(null);

    	// In SSR we cannot wait for $activeRoute to update,
    	// so we use the match returned from `registerRoute` instead
    	let ssrMatch;

    	const route = writable();
    	const params = writable({});
    	validate_store(params, 'params');
    	component_subscribe($$self, params, value => $$invalidate(4, $params = value));
    	setContext(ROUTE, route);
    	setContext(ROUTE_PARAMS, params);
    	setContext(FOCUS_ELEM, focusElement);

    	// We need to call useNavigate after the route is set,
    	// so we can use the routes path for link resolution
    	const navigate = useNavigate();

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway
    	if (!isSSR) {
    		onDestroy(() => unregisterRoute(id));
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(23, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(11, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('path' in $$new_props) $$invalidate(12, path = $$new_props.path);
    		if ('component' in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ('meta' in $$new_props) $$invalidate(13, meta = $$new_props.meta);
    		if ('primary' in $$new_props) $$invalidate(1, primary = $$new_props.primary);
    		if ('$$scope' in $$new_props) $$invalidate(18, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createCounter,
    		createId,
    		getContext,
    		onDestroy,
    		setContext,
    		writable,
    		get: get_store_value,
    		Router: Router$1,
    		ROUTER,
    		ROUTE,
    		ROUTE_PARAMS,
    		FOCUS_ELEM,
    		useLocation,
    		useNavigate,
    		useRouteBase,
    		usePreflightCheck,
    		isSSR,
    		extractBaseUri,
    		join,
    		ROUTE_ID,
    		path,
    		component,
    		meta,
    		primary,
    		id,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		parentBase,
    		location,
    		focusElement,
    		ssrMatch,
    		route,
    		params,
    		navigate,
    		isActive,
    		$activeRoute,
    		$location,
    		$parentBase,
    		$params
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(23, $$props = assign(assign({}, $$props), $$new_props));
    		if ('path' in $$props) $$invalidate(12, path = $$new_props.path);
    		if ('component' in $$props) $$invalidate(0, component = $$new_props.component);
    		if ('meta' in $$props) $$invalidate(13, meta = $$new_props.meta);
    		if ('primary' in $$props) $$invalidate(1, primary = $$new_props.primary);
    		if ('ssrMatch' in $$props) $$invalidate(14, ssrMatch = $$new_props.ssrMatch);
    		if ('isActive' in $$props) $$invalidate(2, isActive = $$new_props.isActive);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*path, $parentBase, meta, $location, primary*/ 77834) {
    			{
    				// The route store will be re-computed whenever props, location or parentBase change
    				const isDefault = path === "";

    				const rawBase = join($parentBase, path);

    				const updatedRoute = {
    					id,
    					path,
    					meta,
    					// If no path prop is given, this Route will act as the default Route
    					// that is rendered if no other Route in the Router is a match
    					default: isDefault,
    					fullPath: isDefault ? "" : rawBase,
    					base: isDefault
    					? $parentBase
    					: extractBaseUri(rawBase, $location.pathname),
    					primary,
    					focusElement
    				};

    				route.set(updatedRoute);

    				// If we're in SSR mode and the Route matches,
    				// `registerRoute` will return the match
    				$$invalidate(14, ssrMatch = registerRoute(updatedRoute));
    			}
    		}

    		if ($$self.$$.dirty & /*ssrMatch, $activeRoute*/ 49152) {
    			$$invalidate(2, isActive = !!(ssrMatch || $activeRoute && $activeRoute.id === id));
    		}

    		if ($$self.$$.dirty & /*isActive, ssrMatch, $activeRoute*/ 49156) {
    			if (isActive) {
    				const { params: activeParams } = ssrMatch || $activeRoute;
    				params.set(activeParams);
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		primary,
    		isActive,
    		$location,
    		$params,
    		id,
    		activeRoute,
    		parentBase,
    		location,
    		params,
    		navigate,
    		$$restProps,
    		path,
    		meta,
    		ssrMatch,
    		$activeRoute,
    		$parentBase,
    		slots,
    		$$scope
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			path: 12,
    			component: 0,
    			meta: 13,
    			primary: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get meta() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set meta(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get primary() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primary(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Route$1 = Route;

    /* node_modules/svelte-navigator/src/Link.svelte generated by Svelte v3.46.4 */
    const file$6 = "node_modules/svelte-navigator/src/Link.svelte";

    function create_fragment$6(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);
    	let a_levels = [{ href: /*href*/ ctx[0] }, /*ariaCurrent*/ ctx[2], /*props*/ ctx[1]];
    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			add_location(a, file$6, 63, 0, 1735);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*onClick*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4096)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[12],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[12])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[12], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
    				dirty & /*ariaCurrent*/ 4 && /*ariaCurrent*/ ctx[2],
    				dirty & /*props*/ 2 && /*props*/ ctx[1]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let href;
    	let isPartiallyCurrent;
    	let isCurrent;
    	let ariaCurrent;
    	let props;
    	const omit_props_names = ["to","replace","state","getProps"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Link', slots, ['default']);
    	let { to } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = null } = $$props;
    	usePreflightCheck(LINK_ID, $$props);
    	const location = useLocation();
    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(11, $location = value));
    	const dispatch = createEventDispatcher();
    	const resolve = useResolve();
    	const { navigate } = useHistory();

    	function onClick(event) {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = isCurrent || replace;

    			navigate(href, { state, replace: shouldReplace });
    		}
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(17, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('to' in $$new_props) $$invalidate(5, to = $$new_props.to);
    		if ('replace' in $$new_props) $$invalidate(6, replace = $$new_props.replace);
    		if ('state' in $$new_props) $$invalidate(7, state = $$new_props.state);
    		if ('getProps' in $$new_props) $$invalidate(8, getProps = $$new_props.getProps);
    		if ('$$scope' in $$new_props) $$invalidate(12, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		useLocation,
    		useResolve,
    		useHistory,
    		usePreflightCheck,
    		shouldNavigate,
    		isFunction,
    		startsWith,
    		LINK_ID,
    		to,
    		replace,
    		state,
    		getProps,
    		location,
    		dispatch,
    		resolve,
    		navigate,
    		onClick,
    		href,
    		isCurrent,
    		isPartiallyCurrent,
    		props,
    		ariaCurrent,
    		$location
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), $$new_props));
    		if ('to' in $$props) $$invalidate(5, to = $$new_props.to);
    		if ('replace' in $$props) $$invalidate(6, replace = $$new_props.replace);
    		if ('state' in $$props) $$invalidate(7, state = $$new_props.state);
    		if ('getProps' in $$props) $$invalidate(8, getProps = $$new_props.getProps);
    		if ('href' in $$props) $$invalidate(0, href = $$new_props.href);
    		if ('isCurrent' in $$props) $$invalidate(9, isCurrent = $$new_props.isCurrent);
    		if ('isPartiallyCurrent' in $$props) $$invalidate(10, isPartiallyCurrent = $$new_props.isPartiallyCurrent);
    		if ('props' in $$props) $$invalidate(1, props = $$new_props.props);
    		if ('ariaCurrent' in $$props) $$invalidate(2, ariaCurrent = $$new_props.ariaCurrent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $location*/ 2080) {
    			// We need to pass location here to force re-resolution of the link,
    			// when the pathname changes. Otherwise we could end up with stale path params,
    			// when for example an :id changes in the parent Routes path
    			$$invalidate(0, href = resolve(to, $location));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 2049) {
    			$$invalidate(10, isPartiallyCurrent = startsWith($location.pathname, href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 2049) {
    			$$invalidate(9, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 512) {
    			$$invalidate(2, ariaCurrent = isCurrent ? { "aria-current": "page" } : {});
    		}

    		$$invalidate(1, props = (() => {
    			if (isFunction(getProps)) {
    				const dynamicProps = getProps({
    					location: $location,
    					href,
    					isPartiallyCurrent,
    					isCurrent
    				});

    				return { ...$$restProps, ...dynamicProps };
    			}

    			return $$restProps;
    		})());
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		href,
    		props,
    		ariaCurrent,
    		location,
    		onClick,
    		to,
    		replace,
    		state,
    		getProps,
    		isCurrent,
    		isPartiallyCurrent,
    		$location,
    		$$scope,
    		slots
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { to: 5, replace: 6, state: 7, getProps: 8 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*to*/ ctx[5] === undefined && !('to' in props)) {
    			console.warn("<Link> was created without expected prop 'to'");
    		}
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Link$1 = Link;

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const stringToByteArray$1 = function (str) {
        // TODO(user): Use native implementations if/when available
        const out = [];
        let p = 0;
        for (let i = 0; i < str.length; i++) {
            let c = str.charCodeAt(i);
            if (c < 128) {
                out[p++] = c;
            }
            else if (c < 2048) {
                out[p++] = (c >> 6) | 192;
                out[p++] = (c & 63) | 128;
            }
            else if ((c & 0xfc00) === 0xd800 &&
                i + 1 < str.length &&
                (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
                // Surrogate Pair
                c = 0x10000 + ((c & 0x03ff) << 10) + (str.charCodeAt(++i) & 0x03ff);
                out[p++] = (c >> 18) | 240;
                out[p++] = ((c >> 12) & 63) | 128;
                out[p++] = ((c >> 6) & 63) | 128;
                out[p++] = (c & 63) | 128;
            }
            else {
                out[p++] = (c >> 12) | 224;
                out[p++] = ((c >> 6) & 63) | 128;
                out[p++] = (c & 63) | 128;
            }
        }
        return out;
    };
    /**
     * Turns an array of numbers into the string given by the concatenation of the
     * characters to which the numbers correspond.
     * @param bytes Array of numbers representing characters.
     * @return Stringification of the array.
     */
    const byteArrayToString = function (bytes) {
        // TODO(user): Use native implementations if/when available
        const out = [];
        let pos = 0, c = 0;
        while (pos < bytes.length) {
            const c1 = bytes[pos++];
            if (c1 < 128) {
                out[c++] = String.fromCharCode(c1);
            }
            else if (c1 > 191 && c1 < 224) {
                const c2 = bytes[pos++];
                out[c++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
            }
            else if (c1 > 239 && c1 < 365) {
                // Surrogate Pair
                const c2 = bytes[pos++];
                const c3 = bytes[pos++];
                const c4 = bytes[pos++];
                const u = (((c1 & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63)) -
                    0x10000;
                out[c++] = String.fromCharCode(0xd800 + (u >> 10));
                out[c++] = String.fromCharCode(0xdc00 + (u & 1023));
            }
            else {
                const c2 = bytes[pos++];
                const c3 = bytes[pos++];
                out[c++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            }
        }
        return out.join('');
    };
    // We define it as an object literal instead of a class because a class compiled down to es5 can't
    // be treeshaked. https://github.com/rollup/rollup/issues/1691
    // Static lookup maps, lazily populated by init_()
    const base64 = {
        /**
         * Maps bytes to characters.
         */
        byteToCharMap_: null,
        /**
         * Maps characters to bytes.
         */
        charToByteMap_: null,
        /**
         * Maps bytes to websafe characters.
         * @private
         */
        byteToCharMapWebSafe_: null,
        /**
         * Maps websafe characters to bytes.
         * @private
         */
        charToByteMapWebSafe_: null,
        /**
         * Our default alphabet, shared between
         * ENCODED_VALS and ENCODED_VALS_WEBSAFE
         */
        ENCODED_VALS_BASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvwxyz' + '0123456789',
        /**
         * Our default alphabet. Value 64 (=) is special; it means "nothing."
         */
        get ENCODED_VALS() {
            return this.ENCODED_VALS_BASE + '+/=';
        },
        /**
         * Our websafe alphabet.
         */
        get ENCODED_VALS_WEBSAFE() {
            return this.ENCODED_VALS_BASE + '-_.';
        },
        /**
         * Whether this browser supports the atob and btoa functions. This extension
         * started at Mozilla but is now implemented by many browsers. We use the
         * ASSUME_* variables to avoid pulling in the full useragent detection library
         * but still allowing the standard per-browser compilations.
         *
         */
        HAS_NATIVE_SUPPORT: typeof atob === 'function',
        /**
         * Base64-encode an array of bytes.
         *
         * @param input An array of bytes (numbers with
         *     value in [0, 255]) to encode.
         * @param webSafe Boolean indicating we should use the
         *     alternative alphabet.
         * @return The base64 encoded string.
         */
        encodeByteArray(input, webSafe) {
            if (!Array.isArray(input)) {
                throw Error('encodeByteArray takes an array as a parameter');
            }
            this.init_();
            const byteToCharMap = webSafe
                ? this.byteToCharMapWebSafe_
                : this.byteToCharMap_;
            const output = [];
            for (let i = 0; i < input.length; i += 3) {
                const byte1 = input[i];
                const haveByte2 = i + 1 < input.length;
                const byte2 = haveByte2 ? input[i + 1] : 0;
                const haveByte3 = i + 2 < input.length;
                const byte3 = haveByte3 ? input[i + 2] : 0;
                const outByte1 = byte1 >> 2;
                const outByte2 = ((byte1 & 0x03) << 4) | (byte2 >> 4);
                let outByte3 = ((byte2 & 0x0f) << 2) | (byte3 >> 6);
                let outByte4 = byte3 & 0x3f;
                if (!haveByte3) {
                    outByte4 = 64;
                    if (!haveByte2) {
                        outByte3 = 64;
                    }
                }
                output.push(byteToCharMap[outByte1], byteToCharMap[outByte2], byteToCharMap[outByte3], byteToCharMap[outByte4]);
            }
            return output.join('');
        },
        /**
         * Base64-encode a string.
         *
         * @param input A string to encode.
         * @param webSafe If true, we should use the
         *     alternative alphabet.
         * @return The base64 encoded string.
         */
        encodeString(input, webSafe) {
            // Shortcut for Mozilla browsers that implement
            // a native base64 encoder in the form of "btoa/atob"
            if (this.HAS_NATIVE_SUPPORT && !webSafe) {
                return btoa(input);
            }
            return this.encodeByteArray(stringToByteArray$1(input), webSafe);
        },
        /**
         * Base64-decode a string.
         *
         * @param input to decode.
         * @param webSafe True if we should use the
         *     alternative alphabet.
         * @return string representing the decoded value.
         */
        decodeString(input, webSafe) {
            // Shortcut for Mozilla browsers that implement
            // a native base64 encoder in the form of "btoa/atob"
            if (this.HAS_NATIVE_SUPPORT && !webSafe) {
                return atob(input);
            }
            return byteArrayToString(this.decodeStringToByteArray(input, webSafe));
        },
        /**
         * Base64-decode a string.
         *
         * In base-64 decoding, groups of four characters are converted into three
         * bytes.  If the encoder did not apply padding, the input length may not
         * be a multiple of 4.
         *
         * In this case, the last group will have fewer than 4 characters, and
         * padding will be inferred.  If the group has one or two characters, it decodes
         * to one byte.  If the group has three characters, it decodes to two bytes.
         *
         * @param input Input to decode.
         * @param webSafe True if we should use the web-safe alphabet.
         * @return bytes representing the decoded value.
         */
        decodeStringToByteArray(input, webSafe) {
            this.init_();
            const charToByteMap = webSafe
                ? this.charToByteMapWebSafe_
                : this.charToByteMap_;
            const output = [];
            for (let i = 0; i < input.length;) {
                const byte1 = charToByteMap[input.charAt(i++)];
                const haveByte2 = i < input.length;
                const byte2 = haveByte2 ? charToByteMap[input.charAt(i)] : 0;
                ++i;
                const haveByte3 = i < input.length;
                const byte3 = haveByte3 ? charToByteMap[input.charAt(i)] : 64;
                ++i;
                const haveByte4 = i < input.length;
                const byte4 = haveByte4 ? charToByteMap[input.charAt(i)] : 64;
                ++i;
                if (byte1 == null || byte2 == null || byte3 == null || byte4 == null) {
                    throw Error();
                }
                const outByte1 = (byte1 << 2) | (byte2 >> 4);
                output.push(outByte1);
                if (byte3 !== 64) {
                    const outByte2 = ((byte2 << 4) & 0xf0) | (byte3 >> 2);
                    output.push(outByte2);
                    if (byte4 !== 64) {
                        const outByte3 = ((byte3 << 6) & 0xc0) | byte4;
                        output.push(outByte3);
                    }
                }
            }
            return output;
        },
        /**
         * Lazy static initialization function. Called before
         * accessing any of the static map variables.
         * @private
         */
        init_() {
            if (!this.byteToCharMap_) {
                this.byteToCharMap_ = {};
                this.charToByteMap_ = {};
                this.byteToCharMapWebSafe_ = {};
                this.charToByteMapWebSafe_ = {};
                // We want quick mappings back and forth, so we precompute two maps.
                for (let i = 0; i < this.ENCODED_VALS.length; i++) {
                    this.byteToCharMap_[i] = this.ENCODED_VALS.charAt(i);
                    this.charToByteMap_[this.byteToCharMap_[i]] = i;
                    this.byteToCharMapWebSafe_[i] = this.ENCODED_VALS_WEBSAFE.charAt(i);
                    this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[i]] = i;
                    // Be forgiving when decoding and correctly decode both encodings.
                    if (i >= this.ENCODED_VALS_BASE.length) {
                        this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(i)] = i;
                        this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(i)] = i;
                    }
                }
            }
        }
    };
    /**
     * URL-safe base64 encoding
     */
    const base64Encode = function (str) {
        const utf8Bytes = stringToByteArray$1(str);
        return base64.encodeByteArray(utf8Bytes, true);
    };

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class Deferred {
        constructor() {
            this.reject = () => { };
            this.resolve = () => { };
            this.promise = new Promise((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;
            });
        }
        /**
         * Our API internals are not promiseified and cannot because our callback APIs have subtle expectations around
         * invoking promises inline, which Promises are forbidden to do. This method accepts an optional node-style callback
         * and returns a node-style callback which will resolve or reject the Deferred's promise.
         */
        wrapCallback(callback) {
            return (error, value) => {
                if (error) {
                    this.reject(error);
                }
                else {
                    this.resolve(value);
                }
                if (typeof callback === 'function') {
                    // Attaching noop handler just in case developer wasn't expecting
                    // promises
                    this.promise.catch(() => { });
                    // Some of our callbacks don't expect a value and our own tests
                    // assert that the parameter length is 1
                    if (callback.length === 1) {
                        callback(error);
                    }
                    else {
                        callback(error, value);
                    }
                }
            };
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Returns navigator.userAgent string or '' if it's not defined.
     * @return user agent string
     */
    function getUA() {
        if (typeof navigator !== 'undefined' &&
            typeof navigator['userAgent'] === 'string') {
            return navigator['userAgent'];
        }
        else {
            return '';
        }
    }
    /**
     * Detect Cordova / PhoneGap / Ionic frameworks on a mobile device.
     *
     * Deliberately does not rely on checking `file://` URLs (as this fails PhoneGap
     * in the Ripple emulator) nor Cordova `onDeviceReady`, which would normally
     * wait for a callback.
     */
    function isMobileCordova() {
        return (typeof window !== 'undefined' &&
            // @ts-ignore Setting up an broadly applicable index signature for Window
            // just to deal with this case would probably be a bad idea.
            !!(window['cordova'] || window['phonegap'] || window['PhoneGap']) &&
            /ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(getUA()));
    }
    function isBrowserExtension() {
        const runtime = typeof chrome === 'object'
            ? chrome.runtime
            : typeof browser === 'object'
                ? browser.runtime
                : undefined;
        return typeof runtime === 'object' && runtime.id !== undefined;
    }
    /**
     * Detect React Native.
     *
     * @return true if ReactNative environment is detected.
     */
    function isReactNative() {
        return (typeof navigator === 'object' && navigator['product'] === 'ReactNative');
    }
    /** Detects Electron apps. */
    function isElectron() {
        return getUA().indexOf('Electron/') >= 0;
    }
    /** Detects Internet Explorer. */
    function isIE() {
        const ua = getUA();
        return ua.indexOf('MSIE ') >= 0 || ua.indexOf('Trident/') >= 0;
    }
    /** Detects Universal Windows Platform apps. */
    function isUWP() {
        return getUA().indexOf('MSAppHost/') >= 0;
    }
    /**
     * This method checks if indexedDB is supported by current browser/service worker context
     * @return true if indexedDB is supported by current browser/service worker context
     */
    function isIndexedDBAvailable() {
        return typeof indexedDB === 'object';
    }
    /**
     * This method validates browser/sw context for indexedDB by opening a dummy indexedDB database and reject
     * if errors occur during the database open operation.
     *
     * @throws exception if current browser/sw context can't run idb.open (ex: Safari iframe, Firefox
     * private browsing)
     */
    function validateIndexedDBOpenable() {
        return new Promise((resolve, reject) => {
            try {
                let preExist = true;
                const DB_CHECK_NAME = 'validate-browser-context-for-indexeddb-analytics-module';
                const request = self.indexedDB.open(DB_CHECK_NAME);
                request.onsuccess = () => {
                    request.result.close();
                    // delete database only when it doesn't pre-exist
                    if (!preExist) {
                        self.indexedDB.deleteDatabase(DB_CHECK_NAME);
                    }
                    resolve(true);
                };
                request.onupgradeneeded = () => {
                    preExist = false;
                };
                request.onerror = () => {
                    var _a;
                    reject(((_a = request.error) === null || _a === void 0 ? void 0 : _a.message) || '');
                };
            }
            catch (error) {
                reject(error);
            }
        });
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * @fileoverview Standardized Firebase Error.
     *
     * Usage:
     *
     *   // Typescript string literals for type-safe codes
     *   type Err =
     *     'unknown' |
     *     'object-not-found'
     *     ;
     *
     *   // Closure enum for type-safe error codes
     *   // at-enum {string}
     *   var Err = {
     *     UNKNOWN: 'unknown',
     *     OBJECT_NOT_FOUND: 'object-not-found',
     *   }
     *
     *   let errors: Map<Err, string> = {
     *     'generic-error': "Unknown error",
     *     'file-not-found': "Could not find file: {$file}",
     *   };
     *
     *   // Type-safe function - must pass a valid error code as param.
     *   let error = new ErrorFactory<Err>('service', 'Service', errors);
     *
     *   ...
     *   throw error.create(Err.GENERIC);
     *   ...
     *   throw error.create(Err.FILE_NOT_FOUND, {'file': fileName});
     *   ...
     *   // Service: Could not file file: foo.txt (service/file-not-found).
     *
     *   catch (e) {
     *     assert(e.message === "Could not find file: foo.txt.");
     *     if (e.code === 'service/file-not-found') {
     *       console.log("Could not read file: " + e['file']);
     *     }
     *   }
     */
    const ERROR_NAME = 'FirebaseError';
    // Based on code from:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Custom_Error_Types
    class FirebaseError extends Error {
        constructor(
        /** The error code for this error. */
        code, message, 
        /** Custom data for this error. */
        customData) {
            super(message);
            this.code = code;
            this.customData = customData;
            /** The custom name for all FirebaseErrors. */
            this.name = ERROR_NAME;
            // Fix For ES5
            // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
            Object.setPrototypeOf(this, FirebaseError.prototype);
            // Maintains proper stack trace for where our error was thrown.
            // Only available on V8.
            if (Error.captureStackTrace) {
                Error.captureStackTrace(this, ErrorFactory.prototype.create);
            }
        }
    }
    class ErrorFactory {
        constructor(service, serviceName, errors) {
            this.service = service;
            this.serviceName = serviceName;
            this.errors = errors;
        }
        create(code, ...data) {
            const customData = data[0] || {};
            const fullCode = `${this.service}/${code}`;
            const template = this.errors[code];
            const message = template ? replaceTemplate(template, customData) : 'Error';
            // Service Name: Error message (service/code).
            const fullMessage = `${this.serviceName}: ${message} (${fullCode}).`;
            const error = new FirebaseError(fullCode, fullMessage, customData);
            return error;
        }
    }
    function replaceTemplate(template, data) {
        return template.replace(PATTERN, (_, key) => {
            const value = data[key];
            return value != null ? String(value) : `<${key}?>`;
        });
    }
    const PATTERN = /\{\$([^}]+)}/g;
    /**
     * Deep equal two objects. Support Arrays and Objects.
     */
    function deepEqual(a, b) {
        if (a === b) {
            return true;
        }
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        for (const k of aKeys) {
            if (!bKeys.includes(k)) {
                return false;
            }
            const aProp = a[k];
            const bProp = b[k];
            if (isObject(aProp) && isObject(bProp)) {
                if (!deepEqual(aProp, bProp)) {
                    return false;
                }
            }
            else if (aProp !== bProp) {
                return false;
            }
        }
        for (const k of bKeys) {
            if (!aKeys.includes(k)) {
                return false;
            }
        }
        return true;
    }
    function isObject(thing) {
        return thing !== null && typeof thing === 'object';
    }

    /**
     * @license
     * Copyright 2021 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    function getModularInstance(service) {
        if (service && service._delegate) {
            return service._delegate;
        }
        else {
            return service;
        }
    }

    /**
     * Component for service name T, e.g. `auth`, `auth-internal`
     */
    class Component {
        /**
         *
         * @param name The public service name, e.g. app, auth, firestore, database
         * @param instanceFactory Service factory responsible for creating the public interface
         * @param type whether the service provided by the component is public or private
         */
        constructor(name, instanceFactory, type) {
            this.name = name;
            this.instanceFactory = instanceFactory;
            this.type = type;
            this.multipleInstances = false;
            /**
             * Properties to be added to the service namespace
             */
            this.serviceProps = {};
            this.instantiationMode = "LAZY" /* LAZY */;
            this.onInstanceCreated = null;
        }
        setInstantiationMode(mode) {
            this.instantiationMode = mode;
            return this;
        }
        setMultipleInstances(multipleInstances) {
            this.multipleInstances = multipleInstances;
            return this;
        }
        setServiceProps(props) {
            this.serviceProps = props;
            return this;
        }
        setInstanceCreatedCallback(callback) {
            this.onInstanceCreated = callback;
            return this;
        }
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const DEFAULT_ENTRY_NAME$1 = '[DEFAULT]';

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Provider for instance for service name T, e.g. 'auth', 'auth-internal'
     * NameServiceMapping[T] is an alias for the type of the instance
     */
    class Provider {
        constructor(name, container) {
            this.name = name;
            this.container = container;
            this.component = null;
            this.instances = new Map();
            this.instancesDeferred = new Map();
            this.instancesOptions = new Map();
            this.onInitCallbacks = new Map();
        }
        /**
         * @param identifier A provider can provide mulitple instances of a service
         * if this.component.multipleInstances is true.
         */
        get(identifier) {
            // if multipleInstances is not supported, use the default name
            const normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
            if (!this.instancesDeferred.has(normalizedIdentifier)) {
                const deferred = new Deferred();
                this.instancesDeferred.set(normalizedIdentifier, deferred);
                if (this.isInitialized(normalizedIdentifier) ||
                    this.shouldAutoInitialize()) {
                    // initialize the service if it can be auto-initialized
                    try {
                        const instance = this.getOrInitializeService({
                            instanceIdentifier: normalizedIdentifier
                        });
                        if (instance) {
                            deferred.resolve(instance);
                        }
                    }
                    catch (e) {
                        // when the instance factory throws an exception during get(), it should not cause
                        // a fatal error. We just return the unresolved promise in this case.
                    }
                }
            }
            return this.instancesDeferred.get(normalizedIdentifier).promise;
        }
        getImmediate(options) {
            var _a;
            // if multipleInstances is not supported, use the default name
            const normalizedIdentifier = this.normalizeInstanceIdentifier(options === null || options === void 0 ? void 0 : options.identifier);
            const optional = (_a = options === null || options === void 0 ? void 0 : options.optional) !== null && _a !== void 0 ? _a : false;
            if (this.isInitialized(normalizedIdentifier) ||
                this.shouldAutoInitialize()) {
                try {
                    return this.getOrInitializeService({
                        instanceIdentifier: normalizedIdentifier
                    });
                }
                catch (e) {
                    if (optional) {
                        return null;
                    }
                    else {
                        throw e;
                    }
                }
            }
            else {
                // In case a component is not initialized and should/can not be auto-initialized at the moment, return null if the optional flag is set, or throw
                if (optional) {
                    return null;
                }
                else {
                    throw Error(`Service ${this.name} is not available`);
                }
            }
        }
        getComponent() {
            return this.component;
        }
        setComponent(component) {
            if (component.name !== this.name) {
                throw Error(`Mismatching Component ${component.name} for Provider ${this.name}.`);
            }
            if (this.component) {
                throw Error(`Component for ${this.name} has already been provided`);
            }
            this.component = component;
            // return early without attempting to initialize the component if the component requires explicit initialization (calling `Provider.initialize()`)
            if (!this.shouldAutoInitialize()) {
                return;
            }
            // if the service is eager, initialize the default instance
            if (isComponentEager(component)) {
                try {
                    this.getOrInitializeService({ instanceIdentifier: DEFAULT_ENTRY_NAME$1 });
                }
                catch (e) {
                    // when the instance factory for an eager Component throws an exception during the eager
                    // initialization, it should not cause a fatal error.
                    // TODO: Investigate if we need to make it configurable, because some component may want to cause
                    // a fatal error in this case?
                }
            }
            // Create service instances for the pending promises and resolve them
            // NOTE: if this.multipleInstances is false, only the default instance will be created
            // and all promises with resolve with it regardless of the identifier.
            for (const [instanceIdentifier, instanceDeferred] of this.instancesDeferred.entries()) {
                const normalizedIdentifier = this.normalizeInstanceIdentifier(instanceIdentifier);
                try {
                    // `getOrInitializeService()` should always return a valid instance since a component is guaranteed. use ! to make typescript happy.
                    const instance = this.getOrInitializeService({
                        instanceIdentifier: normalizedIdentifier
                    });
                    instanceDeferred.resolve(instance);
                }
                catch (e) {
                    // when the instance factory throws an exception, it should not cause
                    // a fatal error. We just leave the promise unresolved.
                }
            }
        }
        clearInstance(identifier = DEFAULT_ENTRY_NAME$1) {
            this.instancesDeferred.delete(identifier);
            this.instancesOptions.delete(identifier);
            this.instances.delete(identifier);
        }
        // app.delete() will call this method on every provider to delete the services
        // TODO: should we mark the provider as deleted?
        async delete() {
            const services = Array.from(this.instances.values());
            await Promise.all([
                ...services
                    .filter(service => 'INTERNAL' in service) // legacy services
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .map(service => service.INTERNAL.delete()),
                ...services
                    .filter(service => '_delete' in service) // modularized services
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .map(service => service._delete())
            ]);
        }
        isComponentSet() {
            return this.component != null;
        }
        isInitialized(identifier = DEFAULT_ENTRY_NAME$1) {
            return this.instances.has(identifier);
        }
        getOptions(identifier = DEFAULT_ENTRY_NAME$1) {
            return this.instancesOptions.get(identifier) || {};
        }
        initialize(opts = {}) {
            const { options = {} } = opts;
            const normalizedIdentifier = this.normalizeInstanceIdentifier(opts.instanceIdentifier);
            if (this.isInitialized(normalizedIdentifier)) {
                throw Error(`${this.name}(${normalizedIdentifier}) has already been initialized`);
            }
            if (!this.isComponentSet()) {
                throw Error(`Component ${this.name} has not been registered yet`);
            }
            const instance = this.getOrInitializeService({
                instanceIdentifier: normalizedIdentifier,
                options
            });
            // resolve any pending promise waiting for the service instance
            for (const [instanceIdentifier, instanceDeferred] of this.instancesDeferred.entries()) {
                const normalizedDeferredIdentifier = this.normalizeInstanceIdentifier(instanceIdentifier);
                if (normalizedIdentifier === normalizedDeferredIdentifier) {
                    instanceDeferred.resolve(instance);
                }
            }
            return instance;
        }
        /**
         *
         * @param callback - a function that will be invoked  after the provider has been initialized by calling provider.initialize().
         * The function is invoked SYNCHRONOUSLY, so it should not execute any longrunning tasks in order to not block the program.
         *
         * @param identifier An optional instance identifier
         * @returns a function to unregister the callback
         */
        onInit(callback, identifier) {
            var _a;
            const normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
            const existingCallbacks = (_a = this.onInitCallbacks.get(normalizedIdentifier)) !== null && _a !== void 0 ? _a : new Set();
            existingCallbacks.add(callback);
            this.onInitCallbacks.set(normalizedIdentifier, existingCallbacks);
            const existingInstance = this.instances.get(normalizedIdentifier);
            if (existingInstance) {
                callback(existingInstance, normalizedIdentifier);
            }
            return () => {
                existingCallbacks.delete(callback);
            };
        }
        /**
         * Invoke onInit callbacks synchronously
         * @param instance the service instance`
         */
        invokeOnInitCallbacks(instance, identifier) {
            const callbacks = this.onInitCallbacks.get(identifier);
            if (!callbacks) {
                return;
            }
            for (const callback of callbacks) {
                try {
                    callback(instance, identifier);
                }
                catch (_a) {
                    // ignore errors in the onInit callback
                }
            }
        }
        getOrInitializeService({ instanceIdentifier, options = {} }) {
            let instance = this.instances.get(instanceIdentifier);
            if (!instance && this.component) {
                instance = this.component.instanceFactory(this.container, {
                    instanceIdentifier: normalizeIdentifierForFactory(instanceIdentifier),
                    options
                });
                this.instances.set(instanceIdentifier, instance);
                this.instancesOptions.set(instanceIdentifier, options);
                /**
                 * Invoke onInit listeners.
                 * Note this.component.onInstanceCreated is different, which is used by the component creator,
                 * while onInit listeners are registered by consumers of the provider.
                 */
                this.invokeOnInitCallbacks(instance, instanceIdentifier);
                /**
                 * Order is important
                 * onInstanceCreated() should be called after this.instances.set(instanceIdentifier, instance); which
                 * makes `isInitialized()` return true.
                 */
                if (this.component.onInstanceCreated) {
                    try {
                        this.component.onInstanceCreated(this.container, instanceIdentifier, instance);
                    }
                    catch (_a) {
                        // ignore errors in the onInstanceCreatedCallback
                    }
                }
            }
            return instance || null;
        }
        normalizeInstanceIdentifier(identifier = DEFAULT_ENTRY_NAME$1) {
            if (this.component) {
                return this.component.multipleInstances ? identifier : DEFAULT_ENTRY_NAME$1;
            }
            else {
                return identifier; // assume multiple instances are supported before the component is provided.
            }
        }
        shouldAutoInitialize() {
            return (!!this.component &&
                this.component.instantiationMode !== "EXPLICIT" /* EXPLICIT */);
        }
    }
    // undefined should be passed to the service factory for the default instance
    function normalizeIdentifierForFactory(identifier) {
        return identifier === DEFAULT_ENTRY_NAME$1 ? undefined : identifier;
    }
    function isComponentEager(component) {
        return component.instantiationMode === "EAGER" /* EAGER */;
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * ComponentContainer that provides Providers for service name T, e.g. `auth`, `auth-internal`
     */
    class ComponentContainer {
        constructor(name) {
            this.name = name;
            this.providers = new Map();
        }
        /**
         *
         * @param component Component being added
         * @param overwrite When a component with the same name has already been registered,
         * if overwrite is true: overwrite the existing component with the new component and create a new
         * provider with the new component. It can be useful in tests where you want to use different mocks
         * for different tests.
         * if overwrite is false: throw an exception
         */
        addComponent(component) {
            const provider = this.getProvider(component.name);
            if (provider.isComponentSet()) {
                throw new Error(`Component ${component.name} has already been registered with ${this.name}`);
            }
            provider.setComponent(component);
        }
        addOrOverwriteComponent(component) {
            const provider = this.getProvider(component.name);
            if (provider.isComponentSet()) {
                // delete the existing provider from the container, so we can register the new component
                this.providers.delete(component.name);
            }
            this.addComponent(component);
        }
        /**
         * getProvider provides a type safe interface where it can only be called with a field name
         * present in NameServiceMapping interface.
         *
         * Firebase SDKs providing services should extend NameServiceMapping interface to register
         * themselves.
         */
        getProvider(name) {
            if (this.providers.has(name)) {
                return this.providers.get(name);
            }
            // create a Provider for a service that hasn't registered with Firebase
            const provider = new Provider(name, this);
            this.providers.set(name, provider);
            return provider;
        }
        getProviders() {
            return Array.from(this.providers.values());
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * The JS SDK supports 5 log levels and also allows a user the ability to
     * silence the logs altogether.
     *
     * The order is a follows:
     * DEBUG < VERBOSE < INFO < WARN < ERROR
     *
     * All of the log types above the current log level will be captured (i.e. if
     * you set the log level to `INFO`, errors will still be logged, but `DEBUG` and
     * `VERBOSE` logs will not)
     */
    var LogLevel;
    (function (LogLevel) {
        LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
        LogLevel[LogLevel["VERBOSE"] = 1] = "VERBOSE";
        LogLevel[LogLevel["INFO"] = 2] = "INFO";
        LogLevel[LogLevel["WARN"] = 3] = "WARN";
        LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
        LogLevel[LogLevel["SILENT"] = 5] = "SILENT";
    })(LogLevel || (LogLevel = {}));
    const levelStringToEnum = {
        'debug': LogLevel.DEBUG,
        'verbose': LogLevel.VERBOSE,
        'info': LogLevel.INFO,
        'warn': LogLevel.WARN,
        'error': LogLevel.ERROR,
        'silent': LogLevel.SILENT
    };
    /**
     * The default log level
     */
    const defaultLogLevel = LogLevel.INFO;
    /**
     * By default, `console.debug` is not displayed in the developer console (in
     * chrome). To avoid forcing users to have to opt-in to these logs twice
     * (i.e. once for firebase, and once in the console), we are sending `DEBUG`
     * logs to the `console.log` function.
     */
    const ConsoleMethod = {
        [LogLevel.DEBUG]: 'log',
        [LogLevel.VERBOSE]: 'log',
        [LogLevel.INFO]: 'info',
        [LogLevel.WARN]: 'warn',
        [LogLevel.ERROR]: 'error'
    };
    /**
     * The default log handler will forward DEBUG, VERBOSE, INFO, WARN, and ERROR
     * messages on to their corresponding console counterparts (if the log method
     * is supported by the current log level)
     */
    const defaultLogHandler = (instance, logType, ...args) => {
        if (logType < instance.logLevel) {
            return;
        }
        const now = new Date().toISOString();
        const method = ConsoleMethod[logType];
        if (method) {
            console[method](`[${now}]  ${instance.name}:`, ...args);
        }
        else {
            throw new Error(`Attempted to log a message with an invalid logType (value: ${logType})`);
        }
    };
    class Logger {
        /**
         * Gives you an instance of a Logger to capture messages according to
         * Firebase's logging scheme.
         *
         * @param name The name that the logs will be associated with
         */
        constructor(name) {
            this.name = name;
            /**
             * The log level of the given Logger instance.
             */
            this._logLevel = defaultLogLevel;
            /**
             * The main (internal) log handler for the Logger instance.
             * Can be set to a new function in internal package code but not by user.
             */
            this._logHandler = defaultLogHandler;
            /**
             * The optional, additional, user-defined log handler for the Logger instance.
             */
            this._userLogHandler = null;
        }
        get logLevel() {
            return this._logLevel;
        }
        set logLevel(val) {
            if (!(val in LogLevel)) {
                throw new TypeError(`Invalid value "${val}" assigned to \`logLevel\``);
            }
            this._logLevel = val;
        }
        // Workaround for setter/getter having to be the same type.
        setLogLevel(val) {
            this._logLevel = typeof val === 'string' ? levelStringToEnum[val] : val;
        }
        get logHandler() {
            return this._logHandler;
        }
        set logHandler(val) {
            if (typeof val !== 'function') {
                throw new TypeError('Value assigned to `logHandler` must be a function');
            }
            this._logHandler = val;
        }
        get userLogHandler() {
            return this._userLogHandler;
        }
        set userLogHandler(val) {
            this._userLogHandler = val;
        }
        /**
         * The functions below are all based on the `console` interface
         */
        debug(...args) {
            this._userLogHandler && this._userLogHandler(this, LogLevel.DEBUG, ...args);
            this._logHandler(this, LogLevel.DEBUG, ...args);
        }
        log(...args) {
            this._userLogHandler &&
                this._userLogHandler(this, LogLevel.VERBOSE, ...args);
            this._logHandler(this, LogLevel.VERBOSE, ...args);
        }
        info(...args) {
            this._userLogHandler && this._userLogHandler(this, LogLevel.INFO, ...args);
            this._logHandler(this, LogLevel.INFO, ...args);
        }
        warn(...args) {
            this._userLogHandler && this._userLogHandler(this, LogLevel.WARN, ...args);
            this._logHandler(this, LogLevel.WARN, ...args);
        }
        error(...args) {
            this._userLogHandler && this._userLogHandler(this, LogLevel.ERROR, ...args);
            this._logHandler(this, LogLevel.ERROR, ...args);
        }
    }

    var commonjsGlobal$1 = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var idb = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
      factory(exports) ;
    }(commonjsGlobal$1, function (exports) {
      function toArray(arr) {
        return Array.prototype.slice.call(arr);
      }

      function promisifyRequest(request) {
        return new Promise(function(resolve, reject) {
          request.onsuccess = function() {
            resolve(request.result);
          };

          request.onerror = function() {
            reject(request.error);
          };
        });
      }

      function promisifyRequestCall(obj, method, args) {
        var request;
        var p = new Promise(function(resolve, reject) {
          request = obj[method].apply(obj, args);
          promisifyRequest(request).then(resolve, reject);
        });

        p.request = request;
        return p;
      }

      function promisifyCursorRequestCall(obj, method, args) {
        var p = promisifyRequestCall(obj, method, args);
        return p.then(function(value) {
          if (!value) return;
          return new Cursor(value, p.request);
        });
      }

      function proxyProperties(ProxyClass, targetProp, properties) {
        properties.forEach(function(prop) {
          Object.defineProperty(ProxyClass.prototype, prop, {
            get: function() {
              return this[targetProp][prop];
            },
            set: function(val) {
              this[targetProp][prop] = val;
            }
          });
        });
      }

      function proxyRequestMethods(ProxyClass, targetProp, Constructor, properties) {
        properties.forEach(function(prop) {
          if (!(prop in Constructor.prototype)) return;
          ProxyClass.prototype[prop] = function() {
            return promisifyRequestCall(this[targetProp], prop, arguments);
          };
        });
      }

      function proxyMethods(ProxyClass, targetProp, Constructor, properties) {
        properties.forEach(function(prop) {
          if (!(prop in Constructor.prototype)) return;
          ProxyClass.prototype[prop] = function() {
            return this[targetProp][prop].apply(this[targetProp], arguments);
          };
        });
      }

      function proxyCursorRequestMethods(ProxyClass, targetProp, Constructor, properties) {
        properties.forEach(function(prop) {
          if (!(prop in Constructor.prototype)) return;
          ProxyClass.prototype[prop] = function() {
            return promisifyCursorRequestCall(this[targetProp], prop, arguments);
          };
        });
      }

      function Index(index) {
        this._index = index;
      }

      proxyProperties(Index, '_index', [
        'name',
        'keyPath',
        'multiEntry',
        'unique'
      ]);

      proxyRequestMethods(Index, '_index', IDBIndex, [
        'get',
        'getKey',
        'getAll',
        'getAllKeys',
        'count'
      ]);

      proxyCursorRequestMethods(Index, '_index', IDBIndex, [
        'openCursor',
        'openKeyCursor'
      ]);

      function Cursor(cursor, request) {
        this._cursor = cursor;
        this._request = request;
      }

      proxyProperties(Cursor, '_cursor', [
        'direction',
        'key',
        'primaryKey',
        'value'
      ]);

      proxyRequestMethods(Cursor, '_cursor', IDBCursor, [
        'update',
        'delete'
      ]);

      // proxy 'next' methods
      ['advance', 'continue', 'continuePrimaryKey'].forEach(function(methodName) {
        if (!(methodName in IDBCursor.prototype)) return;
        Cursor.prototype[methodName] = function() {
          var cursor = this;
          var args = arguments;
          return Promise.resolve().then(function() {
            cursor._cursor[methodName].apply(cursor._cursor, args);
            return promisifyRequest(cursor._request).then(function(value) {
              if (!value) return;
              return new Cursor(value, cursor._request);
            });
          });
        };
      });

      function ObjectStore(store) {
        this._store = store;
      }

      ObjectStore.prototype.createIndex = function() {
        return new Index(this._store.createIndex.apply(this._store, arguments));
      };

      ObjectStore.prototype.index = function() {
        return new Index(this._store.index.apply(this._store, arguments));
      };

      proxyProperties(ObjectStore, '_store', [
        'name',
        'keyPath',
        'indexNames',
        'autoIncrement'
      ]);

      proxyRequestMethods(ObjectStore, '_store', IDBObjectStore, [
        'put',
        'add',
        'delete',
        'clear',
        'get',
        'getAll',
        'getKey',
        'getAllKeys',
        'count'
      ]);

      proxyCursorRequestMethods(ObjectStore, '_store', IDBObjectStore, [
        'openCursor',
        'openKeyCursor'
      ]);

      proxyMethods(ObjectStore, '_store', IDBObjectStore, [
        'deleteIndex'
      ]);

      function Transaction(idbTransaction) {
        this._tx = idbTransaction;
        this.complete = new Promise(function(resolve, reject) {
          idbTransaction.oncomplete = function() {
            resolve();
          };
          idbTransaction.onerror = function() {
            reject(idbTransaction.error);
          };
          idbTransaction.onabort = function() {
            reject(idbTransaction.error);
          };
        });
      }

      Transaction.prototype.objectStore = function() {
        return new ObjectStore(this._tx.objectStore.apply(this._tx, arguments));
      };

      proxyProperties(Transaction, '_tx', [
        'objectStoreNames',
        'mode'
      ]);

      proxyMethods(Transaction, '_tx', IDBTransaction, [
        'abort'
      ]);

      function UpgradeDB(db, oldVersion, transaction) {
        this._db = db;
        this.oldVersion = oldVersion;
        this.transaction = new Transaction(transaction);
      }

      UpgradeDB.prototype.createObjectStore = function() {
        return new ObjectStore(this._db.createObjectStore.apply(this._db, arguments));
      };

      proxyProperties(UpgradeDB, '_db', [
        'name',
        'version',
        'objectStoreNames'
      ]);

      proxyMethods(UpgradeDB, '_db', IDBDatabase, [
        'deleteObjectStore',
        'close'
      ]);

      function DB(db) {
        this._db = db;
      }

      DB.prototype.transaction = function() {
        return new Transaction(this._db.transaction.apply(this._db, arguments));
      };

      proxyProperties(DB, '_db', [
        'name',
        'version',
        'objectStoreNames'
      ]);

      proxyMethods(DB, '_db', IDBDatabase, [
        'close'
      ]);

      // Add cursor iterators
      // TODO: remove this once browsers do the right thing with promises
      ['openCursor', 'openKeyCursor'].forEach(function(funcName) {
        [ObjectStore, Index].forEach(function(Constructor) {
          // Don't create iterateKeyCursor if openKeyCursor doesn't exist.
          if (!(funcName in Constructor.prototype)) return;

          Constructor.prototype[funcName.replace('open', 'iterate')] = function() {
            var args = toArray(arguments);
            var callback = args[args.length - 1];
            var nativeObject = this._store || this._index;
            var request = nativeObject[funcName].apply(nativeObject, args.slice(0, -1));
            request.onsuccess = function() {
              callback(request.result);
            };
          };
        });
      });

      // polyfill getAll
      [Index, ObjectStore].forEach(function(Constructor) {
        if (Constructor.prototype.getAll) return;
        Constructor.prototype.getAll = function(query, count) {
          var instance = this;
          var items = [];

          return new Promise(function(resolve) {
            instance.iterateCursor(query, function(cursor) {
              if (!cursor) {
                resolve(items);
                return;
              }
              items.push(cursor.value);

              if (count !== undefined && items.length == count) {
                resolve(items);
                return;
              }
              cursor.continue();
            });
          });
        };
      });

      function openDb(name, version, upgradeCallback) {
        var p = promisifyRequestCall(indexedDB, 'open', [name, version]);
        var request = p.request;

        if (request) {
          request.onupgradeneeded = function(event) {
            if (upgradeCallback) {
              upgradeCallback(new UpgradeDB(request.result, event.oldVersion, request.transaction));
            }
          };
        }

        return p.then(function(db) {
          return new DB(db);
        });
      }

      function deleteDb(name) {
        return promisifyRequestCall(indexedDB, 'deleteDatabase', [name]);
      }

      exports.openDb = openDb;
      exports.deleteDb = deleteDb;

      Object.defineProperty(exports, '__esModule', { value: true });

    }));
    });

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class PlatformLoggerServiceImpl {
        constructor(container) {
            this.container = container;
        }
        // In initial implementation, this will be called by installations on
        // auth token refresh, and installations will send this string.
        getPlatformInfoString() {
            const providers = this.container.getProviders();
            // Loop through providers and get library/version pairs from any that are
            // version components.
            return providers
                .map(provider => {
                if (isVersionServiceProvider(provider)) {
                    const service = provider.getImmediate();
                    return `${service.library}/${service.version}`;
                }
                else {
                    return null;
                }
            })
                .filter(logString => logString)
                .join(' ');
        }
    }
    /**
     *
     * @param provider check if this provider provides a VersionService
     *
     * NOTE: Using Provider<'app-version'> is a hack to indicate that the provider
     * provides VersionService. The provider is not necessarily a 'app-version'
     * provider.
     */
    function isVersionServiceProvider(provider) {
        const component = provider.getComponent();
        return (component === null || component === void 0 ? void 0 : component.type) === "VERSION" /* VERSION */;
    }

    const name$o = "@firebase/app";
    const version$1 = "0.7.18";

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const logger = new Logger('@firebase/app');

    const name$n = "@firebase/app-compat";

    const name$m = "@firebase/analytics-compat";

    const name$l = "@firebase/analytics";

    const name$k = "@firebase/app-check-compat";

    const name$j = "@firebase/app-check";

    const name$i = "@firebase/auth";

    const name$h = "@firebase/auth-compat";

    const name$g = "@firebase/database";

    const name$f = "@firebase/database-compat";

    const name$e = "@firebase/functions";

    const name$d = "@firebase/functions-compat";

    const name$c = "@firebase/installations";

    const name$b = "@firebase/installations-compat";

    const name$a = "@firebase/messaging";

    const name$9 = "@firebase/messaging-compat";

    const name$8 = "@firebase/performance";

    const name$7 = "@firebase/performance-compat";

    const name$6 = "@firebase/remote-config";

    const name$5 = "@firebase/remote-config-compat";

    const name$4 = "@firebase/storage";

    const name$3 = "@firebase/storage-compat";

    const name$2 = "@firebase/firestore";

    const name$1 = "@firebase/firestore-compat";

    const name$p = "firebase";
    const version$2 = "9.6.8";

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * The default app name
     *
     * @internal
     */
    const DEFAULT_ENTRY_NAME = '[DEFAULT]';
    const PLATFORM_LOG_STRING = {
        [name$o]: 'fire-core',
        [name$n]: 'fire-core-compat',
        [name$l]: 'fire-analytics',
        [name$m]: 'fire-analytics-compat',
        [name$j]: 'fire-app-check',
        [name$k]: 'fire-app-check-compat',
        [name$i]: 'fire-auth',
        [name$h]: 'fire-auth-compat',
        [name$g]: 'fire-rtdb',
        [name$f]: 'fire-rtdb-compat',
        [name$e]: 'fire-fn',
        [name$d]: 'fire-fn-compat',
        [name$c]: 'fire-iid',
        [name$b]: 'fire-iid-compat',
        [name$a]: 'fire-fcm',
        [name$9]: 'fire-fcm-compat',
        [name$8]: 'fire-perf',
        [name$7]: 'fire-perf-compat',
        [name$6]: 'fire-rc',
        [name$5]: 'fire-rc-compat',
        [name$4]: 'fire-gcs',
        [name$3]: 'fire-gcs-compat',
        [name$2]: 'fire-fst',
        [name$1]: 'fire-fst-compat',
        'fire-js': 'fire-js',
        [name$p]: 'fire-js-all'
    };

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * @internal
     */
    const _apps = new Map();
    /**
     * Registered components.
     *
     * @internal
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _components = new Map();
    /**
     * @param component - the component being added to this app's container
     *
     * @internal
     */
    function _addComponent(app, component) {
        try {
            app.container.addComponent(component);
        }
        catch (e) {
            logger.debug(`Component ${component.name} failed to register with FirebaseApp ${app.name}`, e);
        }
    }
    /**
     *
     * @param component - the component to register
     * @returns whether or not the component is registered successfully
     *
     * @internal
     */
    function _registerComponent(component) {
        const componentName = component.name;
        if (_components.has(componentName)) {
            logger.debug(`There were multiple attempts to register component ${componentName}.`);
            return false;
        }
        _components.set(componentName, component);
        // add the component to existing app instances
        for (const app of _apps.values()) {
            _addComponent(app, component);
        }
        return true;
    }
    /**
     *
     * @param app - FirebaseApp instance
     * @param name - service name
     *
     * @returns the provider for the service with the matching name
     *
     * @internal
     */
    function _getProvider(app, name) {
        const heartbeatController = app.container
            .getProvider('heartbeat')
            .getImmediate({ optional: true });
        if (heartbeatController) {
            void heartbeatController.triggerHeartbeat();
        }
        return app.container.getProvider(name);
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const ERRORS = {
        ["no-app" /* NO_APP */]: "No Firebase App '{$appName}' has been created - " +
            'call Firebase App.initializeApp()',
        ["bad-app-name" /* BAD_APP_NAME */]: "Illegal App name: '{$appName}",
        ["duplicate-app" /* DUPLICATE_APP */]: "Firebase App named '{$appName}' already exists with different options or config",
        ["app-deleted" /* APP_DELETED */]: "Firebase App named '{$appName}' already deleted",
        ["invalid-app-argument" /* INVALID_APP_ARGUMENT */]: 'firebase.{$appName}() takes either no argument or a ' +
            'Firebase App instance.',
        ["invalid-log-argument" /* INVALID_LOG_ARGUMENT */]: 'First argument to `onLog` must be null or a function.',
        ["storage-open" /* STORAGE_OPEN */]: 'Error thrown when opening storage. Original error: {$originalErrorMessage}.',
        ["storage-get" /* STORAGE_GET */]: 'Error thrown when reading from storage. Original error: {$originalErrorMessage}.',
        ["storage-set" /* STORAGE_WRITE */]: 'Error thrown when writing to storage. Original error: {$originalErrorMessage}.',
        ["storage-delete" /* STORAGE_DELETE */]: 'Error thrown when deleting from storage. Original error: {$originalErrorMessage}.'
    };
    const ERROR_FACTORY = new ErrorFactory('app', 'Firebase', ERRORS);

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class FirebaseAppImpl {
        constructor(options, config, container) {
            this._isDeleted = false;
            this._options = Object.assign({}, options);
            this._config = Object.assign({}, config);
            this._name = config.name;
            this._automaticDataCollectionEnabled =
                config.automaticDataCollectionEnabled;
            this._container = container;
            this.container.addComponent(new Component('app', () => this, "PUBLIC" /* PUBLIC */));
        }
        get automaticDataCollectionEnabled() {
            this.checkDestroyed();
            return this._automaticDataCollectionEnabled;
        }
        set automaticDataCollectionEnabled(val) {
            this.checkDestroyed();
            this._automaticDataCollectionEnabled = val;
        }
        get name() {
            this.checkDestroyed();
            return this._name;
        }
        get options() {
            this.checkDestroyed();
            return this._options;
        }
        get config() {
            this.checkDestroyed();
            return this._config;
        }
        get container() {
            return this._container;
        }
        get isDeleted() {
            return this._isDeleted;
        }
        set isDeleted(val) {
            this._isDeleted = val;
        }
        /**
         * This function will throw an Error if the App has already been deleted -
         * use before performing API actions on the App.
         */
        checkDestroyed() {
            if (this.isDeleted) {
                throw ERROR_FACTORY.create("app-deleted" /* APP_DELETED */, { appName: this._name });
            }
        }
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * The current SDK version.
     *
     * @public
     */
    const SDK_VERSION = version$2;
    function initializeApp(options, rawConfig = {}) {
        if (typeof rawConfig !== 'object') {
            const name = rawConfig;
            rawConfig = { name };
        }
        const config = Object.assign({ name: DEFAULT_ENTRY_NAME, automaticDataCollectionEnabled: false }, rawConfig);
        const name = config.name;
        if (typeof name !== 'string' || !name) {
            throw ERROR_FACTORY.create("bad-app-name" /* BAD_APP_NAME */, {
                appName: String(name)
            });
        }
        const existingApp = _apps.get(name);
        if (existingApp) {
            // return the existing app if options and config deep equal the ones in the existing app.
            if (deepEqual(options, existingApp.options) &&
                deepEqual(config, existingApp.config)) {
                return existingApp;
            }
            else {
                throw ERROR_FACTORY.create("duplicate-app" /* DUPLICATE_APP */, { appName: name });
            }
        }
        const container = new ComponentContainer(name);
        for (const component of _components.values()) {
            container.addComponent(component);
        }
        const newApp = new FirebaseAppImpl(options, config, container);
        _apps.set(name, newApp);
        return newApp;
    }
    /**
     * Retrieves a {@link @firebase/app#FirebaseApp} instance.
     *
     * When called with no arguments, the default app is returned. When an app name
     * is provided, the app corresponding to that name is returned.
     *
     * An exception is thrown if the app being retrieved has not yet been
     * initialized.
     *
     * @example
     * ```javascript
     * // Return the default app
     * const app = getApp();
     * ```
     *
     * @example
     * ```javascript
     * // Return a named app
     * const otherApp = getApp("otherApp");
     * ```
     *
     * @param name - Optional name of the app to return. If no name is
     *   provided, the default is `"[DEFAULT]"`.
     *
     * @returns The app corresponding to the provided app name.
     *   If no app name is provided, the default app is returned.
     *
     * @public
     */
    function getApp(name = DEFAULT_ENTRY_NAME) {
        const app = _apps.get(name);
        if (!app) {
            throw ERROR_FACTORY.create("no-app" /* NO_APP */, { appName: name });
        }
        return app;
    }
    /**
     * Registers a library's name and version for platform logging purposes.
     * @param library - Name of 1p or 3p library (e.g. firestore, angularfire)
     * @param version - Current version of that library.
     * @param variant - Bundle variant, e.g., node, rn, etc.
     *
     * @public
     */
    function registerVersion(libraryKeyOrName, version, variant) {
        var _a;
        // TODO: We can use this check to whitelist strings when/if we set up
        // a good whitelist system.
        let library = (_a = PLATFORM_LOG_STRING[libraryKeyOrName]) !== null && _a !== void 0 ? _a : libraryKeyOrName;
        if (variant) {
            library += `-${variant}`;
        }
        const libraryMismatch = library.match(/\s|\//);
        const versionMismatch = version.match(/\s|\//);
        if (libraryMismatch || versionMismatch) {
            const warning = [
                `Unable to register library "${library}" with version "${version}":`
            ];
            if (libraryMismatch) {
                warning.push(`library name "${library}" contains illegal characters (whitespace or "/")`);
            }
            if (libraryMismatch && versionMismatch) {
                warning.push('and');
            }
            if (versionMismatch) {
                warning.push(`version name "${version}" contains illegal characters (whitespace or "/")`);
            }
            logger.warn(warning.join(' '));
            return;
        }
        _registerComponent(new Component(`${library}-version`, () => ({ library, version }), "VERSION" /* VERSION */));
    }

    /**
     * @license
     * Copyright 2021 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const DB_NAME = 'firebase-heartbeat-database';
    const DB_VERSION = 1;
    const STORE_NAME = 'firebase-heartbeat-store';
    let dbPromise = null;
    function getDbPromise() {
        if (!dbPromise) {
            dbPromise = idb.openDb(DB_NAME, DB_VERSION, upgradeDB => {
                // We don't use 'break' in this switch statement, the fall-through
                // behavior is what we want, because if there are multiple versions between
                // the old version and the current version, we want ALL the migrations
                // that correspond to those versions to run, not only the last one.
                // eslint-disable-next-line default-case
                switch (upgradeDB.oldVersion) {
                    case 0:
                        upgradeDB.createObjectStore(STORE_NAME);
                }
            }).catch(e => {
                throw ERROR_FACTORY.create("storage-open" /* STORAGE_OPEN */, {
                    originalErrorMessage: e.message
                });
            });
        }
        return dbPromise;
    }
    async function readHeartbeatsFromIndexedDB(app) {
        try {
            const db = await getDbPromise();
            return db
                .transaction(STORE_NAME)
                .objectStore(STORE_NAME)
                .get(computeKey(app));
        }
        catch (e) {
            throw ERROR_FACTORY.create("storage-get" /* STORAGE_GET */, {
                originalErrorMessage: e.message
            });
        }
    }
    async function writeHeartbeatsToIndexedDB(app, heartbeatObject) {
        try {
            const db = await getDbPromise();
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const objectStore = tx.objectStore(STORE_NAME);
            await objectStore.put(heartbeatObject, computeKey(app));
            return tx.complete;
        }
        catch (e) {
            throw ERROR_FACTORY.create("storage-set" /* STORAGE_WRITE */, {
                originalErrorMessage: e.message
            });
        }
    }
    async function deleteHeartbeatsFromIndexedDB(app) {
        try {
            const db = await getDbPromise();
            const tx = db.transaction(STORE_NAME, 'readwrite');
            await tx.objectStore(STORE_NAME).delete(computeKey(app));
            return tx.complete;
        }
        catch (e) {
            throw ERROR_FACTORY.create("storage-delete" /* STORAGE_DELETE */, {
                originalErrorMessage: e.message
            });
        }
    }
    function computeKey(app) {
        return `${app.name}!${app.options.appId}`;
    }

    /**
     * @license
     * Copyright 2021 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const MAX_HEADER_BYTES = 1024;
    // 30 days
    const STORED_HEARTBEAT_RETENTION_MAX_MILLIS = 30 * 24 * 60 * 60 * 1000;
    class HeartbeatServiceImpl {
        constructor(container) {
            this.container = container;
            /**
             * In-memory cache for heartbeats, used by getHeartbeatsHeader() to generate
             * the header string.
             * Stores one record per date. This will be consolidated into the standard
             * format of one record per user agent string before being sent as a header.
             * Populated from indexedDB when the controller is instantiated and should
             * be kept in sync with indexedDB.
             * Leave public for easier testing.
             */
            this._heartbeatsCache = null;
            const app = this.container.getProvider('app').getImmediate();
            this._storage = new HeartbeatStorageImpl(app);
            this._heartbeatsCachePromise = this._storage.read().then(result => {
                this._heartbeatsCache = result;
                return result;
            });
        }
        /**
         * Called to report a heartbeat. The function will generate
         * a HeartbeatsByUserAgent object, update heartbeatsCache, and persist it
         * to IndexedDB.
         * Note that we only store one heartbeat per day. So if a heartbeat for today is
         * already logged, subsequent calls to this function in the same day will be ignored.
         */
        async triggerHeartbeat() {
            const platformLogger = this.container
                .getProvider('platform-logger')
                .getImmediate();
            // This is the "Firebase user agent" string from the platform logger
            // service, not the browser user agent.
            const userAgent = platformLogger.getPlatformInfoString();
            const date = getUTCDateString();
            if (this._heartbeatsCache === null) {
                this._heartbeatsCache = await this._heartbeatsCachePromise;
            }
            if (this._heartbeatsCache.some(singleDateHeartbeat => singleDateHeartbeat.date === date)) {
                // Do not store a heartbeat if one is already stored for this day.
                return;
            }
            else {
                // There is no entry for this date. Create one.
                this._heartbeatsCache.push({ date, userAgent });
            }
            // Remove entries older than 30 days.
            this._heartbeatsCache = this._heartbeatsCache.filter(singleDateHeartbeat => {
                const hbTimestamp = new Date(singleDateHeartbeat.date).valueOf();
                const now = Date.now();
                return now - hbTimestamp <= STORED_HEARTBEAT_RETENTION_MAX_MILLIS;
            });
            return this._storage.overwrite(this._heartbeatsCache);
        }
        /**
         * Returns a base64 encoded string which can be attached to the heartbeat-specific header directly.
         * It also clears all heartbeats from memory as well as in IndexedDB.
         *
         * NOTE: It will read heartbeats from the heartbeatsCache, instead of from indexedDB to reduce latency
         */
        async getHeartbeatsHeader() {
            if (this._heartbeatsCache === null) {
                await this._heartbeatsCachePromise;
            }
            // If it's still null, it's been cleared and has not been repopulated.
            if (this._heartbeatsCache === null) {
                return '';
            }
            // Extract as many heartbeats from the cache as will fit under the size limit.
            const { heartbeatsToSend, unsentEntries } = extractHeartbeatsForHeader(this._heartbeatsCache);
            const headerString = base64Encode(JSON.stringify({ version: 2, heartbeats: heartbeatsToSend }));
            if (unsentEntries.length > 0) {
                // Store any unsent entries if they exist.
                this._heartbeatsCache = unsentEntries;
                // This seems more likely than deleteAll (below) to lead to some odd state
                // since the cache isn't empty and this will be called again on the next request,
                // and is probably safest if we await it.
                await this._storage.overwrite(this._heartbeatsCache);
            }
            else {
                this._heartbeatsCache = null;
                // Do not wait for this, to reduce latency.
                void this._storage.deleteAll();
            }
            return headerString;
        }
    }
    function getUTCDateString() {
        const today = new Date();
        // Returns date format 'YYYY-MM-DD'
        return today.toISOString().substring(0, 10);
    }
    function extractHeartbeatsForHeader(heartbeatsCache, maxSize = MAX_HEADER_BYTES) {
        // Heartbeats grouped by user agent in the standard format to be sent in
        // the header.
        const heartbeatsToSend = [];
        // Single date format heartbeats that are not sent.
        let unsentEntries = heartbeatsCache.slice();
        for (const singleDateHeartbeat of heartbeatsCache) {
            // Look for an existing entry with the same user agent.
            const heartbeatEntry = heartbeatsToSend.find(hb => hb.userAgent === singleDateHeartbeat.userAgent);
            if (!heartbeatEntry) {
                // If no entry for this user agent exists, create one.
                heartbeatsToSend.push({
                    userAgent: singleDateHeartbeat.userAgent,
                    dates: [singleDateHeartbeat.date]
                });
                if (countBytes(heartbeatsToSend) > maxSize) {
                    // If the header would exceed max size, remove the added heartbeat
                    // entry and stop adding to the header.
                    heartbeatsToSend.pop();
                    break;
                }
            }
            else {
                heartbeatEntry.dates.push(singleDateHeartbeat.date);
                // If the header would exceed max size, remove the added date
                // and stop adding to the header.
                if (countBytes(heartbeatsToSend) > maxSize) {
                    heartbeatEntry.dates.pop();
                    break;
                }
            }
            // Pop unsent entry from queue. (Skipped if adding the entry exceeded
            // quota and the loop breaks early.)
            unsentEntries = unsentEntries.slice(1);
        }
        return {
            heartbeatsToSend,
            unsentEntries
        };
    }
    class HeartbeatStorageImpl {
        constructor(app) {
            this.app = app;
            this._canUseIndexedDBPromise = this.runIndexedDBEnvironmentCheck();
        }
        async runIndexedDBEnvironmentCheck() {
            if (!isIndexedDBAvailable()) {
                return false;
            }
            else {
                return validateIndexedDBOpenable()
                    .then(() => true)
                    .catch(() => false);
            }
        }
        /**
         * Read all heartbeats.
         */
        async read() {
            const canUseIndexedDB = await this._canUseIndexedDBPromise;
            if (!canUseIndexedDB) {
                return [];
            }
            else {
                const idbHeartbeatObject = await readHeartbeatsFromIndexedDB(this.app);
                return (idbHeartbeatObject === null || idbHeartbeatObject === void 0 ? void 0 : idbHeartbeatObject.heartbeats) || [];
            }
        }
        // overwrite the storage with the provided heartbeats
        async overwrite(heartbeats) {
            const canUseIndexedDB = await this._canUseIndexedDBPromise;
            if (!canUseIndexedDB) {
                return;
            }
            else {
                return writeHeartbeatsToIndexedDB(this.app, { heartbeats });
            }
        }
        // add heartbeats
        async add(heartbeats) {
            const canUseIndexedDB = await this._canUseIndexedDBPromise;
            if (!canUseIndexedDB) {
                return;
            }
            else {
                const existingHeartbeats = await this.read();
                return writeHeartbeatsToIndexedDB(this.app, {
                    heartbeats: [...existingHeartbeats, ...heartbeats]
                });
            }
        }
        // delete heartbeats
        async delete(heartbeats) {
            const canUseIndexedDB = await this._canUseIndexedDBPromise;
            if (!canUseIndexedDB) {
                return;
            }
            else {
                const existingHeartbeats = await this.read();
                return writeHeartbeatsToIndexedDB(this.app, {
                    heartbeats: existingHeartbeats.filter(existingHeartbeat => !heartbeats.includes(existingHeartbeat))
                });
            }
        }
        // delete all heartbeats
        async deleteAll() {
            const canUseIndexedDB = await this._canUseIndexedDBPromise;
            if (!canUseIndexedDB) {
                return;
            }
            else {
                return deleteHeartbeatsFromIndexedDB(this.app);
            }
        }
    }
    /**
     * Calculate bytes of a HeartbeatsByUserAgent array after being wrapped
     * in a platform logging header JSON object, stringified, and converted
     * to base 64.
     */
    function countBytes(heartbeatsCache) {
        // base64 has a restricted set of characters, all of which should be 1 byte.
        return base64Encode(
        // heartbeatsCache wrapper properties
        JSON.stringify({ version: 2, heartbeats: heartbeatsCache })).length;
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    function registerCoreComponents(variant) {
        _registerComponent(new Component('platform-logger', container => new PlatformLoggerServiceImpl(container), "PRIVATE" /* PRIVATE */));
        _registerComponent(new Component('heartbeat', container => new HeartbeatServiceImpl(container), "PRIVATE" /* PRIVATE */));
        // Register `app` package.
        registerVersion(name$o, version$1, variant);
        // BUILD_TARGET will be replaced by values like esm5, esm2017, cjs5, etc during the compilation
        registerVersion(name$o, version$1, 'esm2017');
        // Register platform SDK identifier (no version).
        registerVersion('fire-js', '');
    }

    /**
     * Firebase App
     *
     * @remarks This package coordinates the communication between the different Firebase components
     * @packageDocumentation
     */
    registerCoreComponents('');

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    /*

     Copyright The Closure Library Authors.
     SPDX-License-Identifier: Apache-2.0
    */
    var k$1,goog=goog||{},l=commonjsGlobal||self;function aa(){}function ba(a){var b=typeof a;b="object"!=b?b:a?Array.isArray(a)?"array":b:"null";return "array"==b||"object"==b&&"number"==typeof a.length}function p(a){var b=typeof a;return "object"==b&&null!=a||"function"==b}function da$1(a){return Object.prototype.hasOwnProperty.call(a,ea$1)&&a[ea$1]||(a[ea$1]=++fa)}var ea$1="closure_uid_"+(1E9*Math.random()>>>0),fa=0;function ha(a,b,c){return a.call.apply(a.bind,arguments)}
    function ia$1(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var e=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(e,d);return a.apply(b,e)}}return function(){return a.apply(b,arguments)}}function q(a,b,c){Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?q=ha:q=ia$1;return q.apply(null,arguments)}
    function ja(a,b){var c=Array.prototype.slice.call(arguments,1);return function(){var d=c.slice();d.push.apply(d,arguments);return a.apply(this,d)}}function t(a,b){function c(){}c.prototype=b.prototype;a.Z=b.prototype;a.prototype=new c;a.prototype.constructor=a;a.Vb=function(d,e,f){for(var h=Array(arguments.length-2),n=2;n<arguments.length;n++)h[n-2]=arguments[n];return b.prototype[e].apply(d,h)};}function v(){this.s=this.s;this.o=this.o;}var ka=0,la$1={};v.prototype.s=!1;v.prototype.na=function(){if(!this.s&&(this.s=!0,this.M(),0!=ka)){var a=da$1(this);delete la$1[a];}};v.prototype.M=function(){if(this.o)for(;this.o.length;)this.o.shift()();};const ma=Array.prototype.indexOf?function(a,b){return Array.prototype.indexOf.call(a,b,void 0)}:function(a,b){if("string"===typeof a)return "string"!==typeof b||1!=b.length?-1:a.indexOf(b,0);for(let c=0;c<a.length;c++)if(c in a&&a[c]===b)return c;return -1},na$1=Array.prototype.forEach?function(a,b,c){Array.prototype.forEach.call(a,b,c);}:function(a,b,c){const d=a.length,e="string"===typeof a?a.split(""):a;for(let f=0;f<d;f++)f in e&&b.call(c,e[f],f,a);};
    function oa(a){a:{var b=pa;const c=a.length,d="string"===typeof a?a.split(""):a;for(let e=0;e<c;e++)if(e in d&&b.call(void 0,d[e],e,a)){b=e;break a}b=-1;}return 0>b?null:"string"===typeof a?a.charAt(b):a[b]}function qa(a){return Array.prototype.concat.apply([],arguments)}function ra(a){const b=a.length;if(0<b){const c=Array(b);for(let d=0;d<b;d++)c[d]=a[d];return c}return []}function sa(a){return /^[\s\xa0]*$/.test(a)}var ta$1=String.prototype.trim?function(a){return a.trim()}:function(a){return /^[\s\xa0]*([\s\S]*?)[\s\xa0]*$/.exec(a)[1]};function w(a,b){return -1!=a.indexOf(b)}function ua(a,b){return a<b?-1:a>b?1:0}var x$1;a:{var va$1=l.navigator;if(va$1){var wa$1=va$1.userAgent;if(wa$1){x$1=wa$1;break a}}x$1="";}function xa$1(a,b,c){for(const d in a)b.call(c,a[d],d,a);}function ya(a){const b={};for(const c in a)b[c]=a[c];return b}var za$1="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function Aa(a,b){let c,d;for(let e=1;e<arguments.length;e++){d=arguments[e];for(c in d)a[c]=d[c];for(let f=0;f<za$1.length;f++)c=za$1[f],Object.prototype.hasOwnProperty.call(d,c)&&(a[c]=d[c]);}}function Ca$1(a){Ca$1[" "](a);return a}Ca$1[" "]=aa;function Fa$1(a){var b=Ga;return Object.prototype.hasOwnProperty.call(b,9)?b[9]:b[9]=a(9)}var Ha$1=w(x$1,"Opera"),y=w(x$1,"Trident")||w(x$1,"MSIE"),Ia=w(x$1,"Edge"),Ja$1=Ia||y,Ka=w(x$1,"Gecko")&&!(w(x$1.toLowerCase(),"webkit")&&!w(x$1,"Edge"))&&!(w(x$1,"Trident")||w(x$1,"MSIE"))&&!w(x$1,"Edge"),La=w(x$1.toLowerCase(),"webkit")&&!w(x$1,"Edge");function Ma$1(){var a=l.document;return a?a.documentMode:void 0}var Na$1;
    a:{var Oa$1="",Pa=function(){var a=x$1;if(Ka)return /rv:([^\);]+)(\)|;)/.exec(a);if(Ia)return /Edge\/([\d\.]+)/.exec(a);if(y)return /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);if(La)return /WebKit\/(\S+)/.exec(a);if(Ha$1)return /(?:Version)[ \/]?(\S+)/.exec(a)}();Pa&&(Oa$1=Pa?Pa[1]:"");if(y){var Qa=Ma$1();if(null!=Qa&&Qa>parseFloat(Oa$1)){Na$1=String(Qa);break a}}Na$1=Oa$1;}var Ga={};
    function Ra(){return Fa$1(function(){let a=0;const b=ta$1(String(Na$1)).split("."),c=ta$1("9").split("."),d=Math.max(b.length,c.length);for(let h=0;0==a&&h<d;h++){var e=b[h]||"",f=c[h]||"";do{e=/(\d*)(\D*)(.*)/.exec(e)||["","","",""];f=/(\d*)(\D*)(.*)/.exec(f)||["","","",""];if(0==e[0].length&&0==f[0].length)break;a=ua(0==e[1].length?0:parseInt(e[1],10),0==f[1].length?0:parseInt(f[1],10))||ua(0==e[2].length,0==f[2].length)||ua(e[2],f[2]);e=e[3];f=f[3];}while(0==a)}return 0<=a})}var Sa$1;
    if(l.document&&y){var Ta=Ma$1();Sa$1=Ta?Ta:parseInt(Na$1,10)||void 0;}else Sa$1=void 0;var Ua=Sa$1;var Va=function(){if(!l.addEventListener||!Object.defineProperty)return !1;var a=!1,b=Object.defineProperty({},"passive",{get:function(){a=!0;}});try{l.addEventListener("test",aa,b),l.removeEventListener("test",aa,b);}catch(c){}return a}();function z$1(a,b){this.type=a;this.g=this.target=b;this.defaultPrevented=!1;}z$1.prototype.h=function(){this.defaultPrevented=!0;};function A(a,b){z$1.call(this,a?a.type:"");this.relatedTarget=this.g=this.target=null;this.button=this.screenY=this.screenX=this.clientY=this.clientX=0;this.key="";this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1;this.state=null;this.pointerId=0;this.pointerType="";this.i=null;if(a){var c=this.type=a.type,d=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;this.target=a.target||a.srcElement;this.g=b;if(b=a.relatedTarget){if(Ka){a:{try{Ca$1(b.nodeName);var e=!0;break a}catch(f){}e=
    !1;}e||(b=null);}}else "mouseover"==c?b=a.fromElement:"mouseout"==c&&(b=a.toElement);this.relatedTarget=b;d?(this.clientX=void 0!==d.clientX?d.clientX:d.pageX,this.clientY=void 0!==d.clientY?d.clientY:d.pageY,this.screenX=d.screenX||0,this.screenY=d.screenY||0):(this.clientX=void 0!==a.clientX?a.clientX:a.pageX,this.clientY=void 0!==a.clientY?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0);this.button=a.button;this.key=a.key||"";this.ctrlKey=a.ctrlKey;this.altKey=a.altKey;this.shiftKey=
    a.shiftKey;this.metaKey=a.metaKey;this.pointerId=a.pointerId||0;this.pointerType="string"===typeof a.pointerType?a.pointerType:Wa[a.pointerType]||"";this.state=a.state;this.i=a;a.defaultPrevented&&A.Z.h.call(this);}}t(A,z$1);var Wa={2:"touch",3:"pen",4:"mouse"};A.prototype.h=function(){A.Z.h.call(this);var a=this.i;a.preventDefault?a.preventDefault():a.returnValue=!1;};var B$1="closure_listenable_"+(1E6*Math.random()|0);var Xa$1=0;function Ya$1(a,b,c,d,e){this.listener=a;this.proxy=null;this.src=b;this.type=c;this.capture=!!d;this.ia=e;this.key=++Xa$1;this.ca=this.fa=!1;}function Za$1(a){a.ca=!0;a.listener=null;a.proxy=null;a.src=null;a.ia=null;}function $a$1(a){this.src=a;this.g={};this.h=0;}$a$1.prototype.add=function(a,b,c,d,e){var f=a.toString();a=this.g[f];a||(a=this.g[f]=[],this.h++);var h=ab(a,b,d,e);-1<h?(b=a[h],c||(b.fa=!1)):(b=new Ya$1(b,this.src,f,!!d,e),b.fa=c,a.push(b));return b};function bb(a,b){var c=b.type;if(c in a.g){var d=a.g[c],e=ma(d,b),f;(f=0<=e)&&Array.prototype.splice.call(d,e,1);f&&(Za$1(b),0==a.g[c].length&&(delete a.g[c],a.h--));}}
    function ab(a,b,c,d){for(var e=0;e<a.length;++e){var f=a[e];if(!f.ca&&f.listener==b&&f.capture==!!c&&f.ia==d)return e}return -1}var cb="closure_lm_"+(1E6*Math.random()|0),db$1={};function fb(a,b,c,d,e){if(d&&d.once)return gb(a,b,c,d,e);if(Array.isArray(b)){for(var f=0;f<b.length;f++)fb(a,b[f],c,d,e);return null}c=hb(c);return a&&a[B$1]?a.N(b,c,p(d)?!!d.capture:!!d,e):ib(a,b,c,!1,d,e)}
    function ib(a,b,c,d,e,f){if(!b)throw Error("Invalid event type");var h=p(e)?!!e.capture:!!e,n=jb(a);n||(a[cb]=n=new $a$1(a));c=n.add(b,c,d,h,f);if(c.proxy)return c;d=kb();c.proxy=d;d.src=a;d.listener=c;if(a.addEventListener)Va||(e=h),void 0===e&&(e=!1),a.addEventListener(b.toString(),d,e);else if(a.attachEvent)a.attachEvent(lb(b.toString()),d);else if(a.addListener&&a.removeListener)a.addListener(d);else throw Error("addEventListener and attachEvent are unavailable.");return c}
    function kb(){function a(c){return b.call(a.src,a.listener,c)}var b=mb;return a}function gb(a,b,c,d,e){if(Array.isArray(b)){for(var f=0;f<b.length;f++)gb(a,b[f],c,d,e);return null}c=hb(c);return a&&a[B$1]?a.O(b,c,p(d)?!!d.capture:!!d,e):ib(a,b,c,!0,d,e)}
    function nb(a,b,c,d,e){if(Array.isArray(b))for(var f=0;f<b.length;f++)nb(a,b[f],c,d,e);else (d=p(d)?!!d.capture:!!d,c=hb(c),a&&a[B$1])?(a=a.i,b=String(b).toString(),b in a.g&&(f=a.g[b],c=ab(f,c,d,e),-1<c&&(Za$1(f[c]),Array.prototype.splice.call(f,c,1),0==f.length&&(delete a.g[b],a.h--)))):a&&(a=jb(a))&&(b=a.g[b.toString()],a=-1,b&&(a=ab(b,c,d,e)),(c=-1<a?b[a]:null)&&ob(c));}
    function ob(a){if("number"!==typeof a&&a&&!a.ca){var b=a.src;if(b&&b[B$1])bb(b.i,a);else {var c=a.type,d=a.proxy;b.removeEventListener?b.removeEventListener(c,d,a.capture):b.detachEvent?b.detachEvent(lb(c),d):b.addListener&&b.removeListener&&b.removeListener(d);(c=jb(b))?(bb(c,a),0==c.h&&(c.src=null,b[cb]=null)):Za$1(a);}}}function lb(a){return a in db$1?db$1[a]:db$1[a]="on"+a}function mb(a,b){if(a.ca)a=!0;else {b=new A(b,this);var c=a.listener,d=a.ia||a.src;a.fa&&ob(a);a=c.call(d,b);}return a}
    function jb(a){a=a[cb];return a instanceof $a$1?a:null}var pb="__closure_events_fn_"+(1E9*Math.random()>>>0);function hb(a){if("function"===typeof a)return a;a[pb]||(a[pb]=function(b){return a.handleEvent(b)});return a[pb]}function C$1(){v.call(this);this.i=new $a$1(this);this.P=this;this.I=null;}t(C$1,v);C$1.prototype[B$1]=!0;C$1.prototype.removeEventListener=function(a,b,c,d){nb(this,a,b,c,d);};
    function D$1(a,b){var c,d=a.I;if(d)for(c=[];d;d=d.I)c.push(d);a=a.P;d=b.type||b;if("string"===typeof b)b=new z$1(b,a);else if(b instanceof z$1)b.target=b.target||a;else {var e=b;b=new z$1(d,a);Aa(b,e);}e=!0;if(c)for(var f=c.length-1;0<=f;f--){var h=b.g=c[f];e=qb(h,d,!0,b)&&e;}h=b.g=a;e=qb(h,d,!0,b)&&e;e=qb(h,d,!1,b)&&e;if(c)for(f=0;f<c.length;f++)h=b.g=c[f],e=qb(h,d,!1,b)&&e;}
    C$1.prototype.M=function(){C$1.Z.M.call(this);if(this.i){var a=this.i,c;for(c in a.g){for(var d=a.g[c],e=0;e<d.length;e++)Za$1(d[e]);delete a.g[c];a.h--;}}this.I=null;};C$1.prototype.N=function(a,b,c,d){return this.i.add(String(a),b,!1,c,d)};C$1.prototype.O=function(a,b,c,d){return this.i.add(String(a),b,!0,c,d)};
    function qb(a,b,c,d){b=a.i.g[String(b)];if(!b)return !0;b=b.concat();for(var e=!0,f=0;f<b.length;++f){var h=b[f];if(h&&!h.ca&&h.capture==c){var n=h.listener,u=h.ia||h.src;h.fa&&bb(a.i,h);e=!1!==n.call(u,d)&&e;}}return e&&!d.defaultPrevented}var rb=l.JSON.stringify;function sb(){var a=tb;let b=null;a.g&&(b=a.g,a.g=a.g.next,a.g||(a.h=null),b.next=null);return b}class ub{constructor(){this.h=this.g=null;}add(a,b){const c=vb.get();c.set(a,b);this.h?this.h.next=c:this.g=c;this.h=c;}}var vb=new class{constructor(a,b){this.i=a;this.j=b;this.h=0;this.g=null;}get(){let a;0<this.h?(this.h--,a=this.g,this.g=a.next,a.next=null):a=this.i();return a}}(()=>new wb,a=>a.reset());
    class wb{constructor(){this.next=this.g=this.h=null;}set(a,b){this.h=a;this.g=b;this.next=null;}reset(){this.next=this.g=this.h=null;}}function yb(a){l.setTimeout(()=>{throw a;},0);}function zb(a,b){Ab||Bb();Cb||(Ab(),Cb=!0);tb.add(a,b);}var Ab;function Bb(){var a=l.Promise.resolve(void 0);Ab=function(){a.then(Db);};}var Cb=!1,tb=new ub;function Db(){for(var a;a=sb();){try{a.h.call(a.g);}catch(c){yb(c);}var b=vb;b.j(a);100>b.h&&(b.h++,a.next=b.g,b.g=a);}Cb=!1;}function Eb(a,b){C$1.call(this);this.h=a||1;this.g=b||l;this.j=q(this.kb,this);this.l=Date.now();}t(Eb,C$1);k$1=Eb.prototype;k$1.da=!1;k$1.S=null;k$1.kb=function(){if(this.da){var a=Date.now()-this.l;0<a&&a<.8*this.h?this.S=this.g.setTimeout(this.j,this.h-a):(this.S&&(this.g.clearTimeout(this.S),this.S=null),D$1(this,"tick"),this.da&&(Fb(this),this.start()));}};k$1.start=function(){this.da=!0;this.S||(this.S=this.g.setTimeout(this.j,this.h),this.l=Date.now());};
    function Fb(a){a.da=!1;a.S&&(a.g.clearTimeout(a.S),a.S=null);}k$1.M=function(){Eb.Z.M.call(this);Fb(this);delete this.g;};function Gb(a,b,c){if("function"===typeof a)c&&(a=q(a,c));else if(a&&"function"==typeof a.handleEvent)a=q(a.handleEvent,a);else throw Error("Invalid listener argument");return 2147483647<Number(b)?-1:l.setTimeout(a,b||0)}function Hb(a){a.g=Gb(()=>{a.g=null;a.i&&(a.i=!1,Hb(a));},a.j);const b=a.h;a.h=null;a.m.apply(null,b);}class Ib extends v{constructor(a,b){super();this.m=a;this.j=b;this.h=null;this.i=!1;this.g=null;}l(a){this.h=arguments;this.g?this.i=!0:Hb(this);}M(){super.M();this.g&&(l.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null);}}function E(a){v.call(this);this.h=a;this.g={};}t(E,v);var Jb=[];function Kb(a,b,c,d){Array.isArray(c)||(c&&(Jb[0]=c.toString()),c=Jb);for(var e=0;e<c.length;e++){var f=fb(b,c[e],d||a.handleEvent,!1,a.h||a);if(!f)break;a.g[f.key]=f;}}function Lb(a){xa$1(a.g,function(b,c){this.g.hasOwnProperty(c)&&ob(b);},a);a.g={};}E.prototype.M=function(){E.Z.M.call(this);Lb(this);};E.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented");};function Mb(){this.g=!0;}Mb.prototype.Aa=function(){this.g=!1;};function Nb(a,b,c,d,e,f){a.info(function(){if(a.g)if(f){var h="";for(var n=f.split("&"),u=0;u<n.length;u++){var m=n[u].split("=");if(1<m.length){var r=m[0];m=m[1];var G=r.split("_");h=2<=G.length&&"type"==G[1]?h+(r+"="+m+"&"):h+(r+"=redacted&");}}}else h=null;else h=f;return "XMLHTTP REQ ("+d+") [attempt "+e+"]: "+b+"\n"+c+"\n"+h});}
    function Ob(a,b,c,d,e,f,h){a.info(function(){return "XMLHTTP RESP ("+d+") [ attempt "+e+"]: "+b+"\n"+c+"\n"+f+" "+h});}function F$1(a,b,c,d){a.info(function(){return "XMLHTTP TEXT ("+b+"): "+Pb(a,c)+(d?" "+d:"")});}function Qb(a,b){a.info(function(){return "TIMEOUT: "+b});}Mb.prototype.info=function(){};
    function Pb(a,b){if(!a.g)return b;if(!b)return null;try{var c=JSON.parse(b);if(c)for(a=0;a<c.length;a++)if(Array.isArray(c[a])){var d=c[a];if(!(2>d.length)){var e=d[1];if(Array.isArray(e)&&!(1>e.length)){var f=e[0];if("noop"!=f&&"stop"!=f&&"close"!=f)for(var h=1;h<e.length;h++)e[h]="";}}}return rb(c)}catch(n){return b}}var H={},Rb=null;function Sb(){return Rb=Rb||new C$1}H.Ma="serverreachability";function Tb(a){z$1.call(this,H.Ma,a);}t(Tb,z$1);function I(a){const b=Sb();D$1(b,new Tb(b,a));}H.STAT_EVENT="statevent";function Ub(a,b){z$1.call(this,H.STAT_EVENT,a);this.stat=b;}t(Ub,z$1);function J$1(a){const b=Sb();D$1(b,new Ub(b,a));}H.Na="timingevent";function Vb(a,b){z$1.call(this,H.Na,a);this.size=b;}t(Vb,z$1);
    function K$1(a,b){if("function"!==typeof a)throw Error("Fn must not be null and must be a function");return l.setTimeout(function(){a();},b)}var Wb={NO_ERROR:0,lb:1,yb:2,xb:3,sb:4,wb:5,zb:6,Ja:7,TIMEOUT:8,Cb:9};var Xb={qb:"complete",Mb:"success",Ka:"error",Ja:"abort",Eb:"ready",Fb:"readystatechange",TIMEOUT:"timeout",Ab:"incrementaldata",Db:"progress",tb:"downloadprogress",Ub:"uploadprogress"};function Yb(){}Yb.prototype.h=null;function Zb(a){return a.h||(a.h=a.i())}function $b(){}var L$1={OPEN:"a",pb:"b",Ka:"c",Bb:"d"};function ac$1(){z$1.call(this,"d");}t(ac$1,z$1);function bc(){z$1.call(this,"c");}t(bc,z$1);var cc$1;function dc$1(){}t(dc$1,Yb);dc$1.prototype.g=function(){return new XMLHttpRequest};dc$1.prototype.i=function(){return {}};cc$1=new dc$1;function M$1(a,b,c,d){this.l=a;this.j=b;this.m=c;this.X=d||1;this.V=new E(this);this.P=ec$1;a=Ja$1?125:void 0;this.W=new Eb(a);this.H=null;this.i=!1;this.s=this.A=this.v=this.K=this.F=this.Y=this.B=null;this.D=[];this.g=null;this.C=0;this.o=this.u=null;this.N=-1;this.I=!1;this.O=0;this.L=null;this.aa=this.J=this.$=this.U=!1;this.h=new fc$1;}function fc$1(){this.i=null;this.g="";this.h=!1;}var ec$1=45E3,gc$1={},hc$1={};k$1=M$1.prototype;k$1.setTimeout=function(a){this.P=a;};
    function ic$1(a,b,c){a.K=1;a.v=jc$1(N$1(b));a.s=c;a.U=!0;kc$1(a,null);}function kc$1(a,b){a.F=Date.now();lc$1(a);a.A=N$1(a.v);var c=a.A,d=a.X;Array.isArray(d)||(d=[String(d)]);mc$1(c.h,"t",d);a.C=0;c=a.l.H;a.h=new fc$1;a.g=nc$1(a.l,c?b:null,!a.s);0<a.O&&(a.L=new Ib(q(a.Ia,a,a.g),a.O));Kb(a.V,a.g,"readystatechange",a.gb);b=a.H?ya(a.H):{};a.s?(a.u||(a.u="POST"),b["Content-Type"]="application/x-www-form-urlencoded",a.g.ea(a.A,a.u,a.s,b)):(a.u="GET",a.g.ea(a.A,a.u,null,b));I(1);Nb(a.j,a.u,a.A,a.m,a.X,a.s);}
    k$1.gb=function(a){a=a.target;const b=this.L;b&&3==O(a)?b.l():this.Ia(a);};
    k$1.Ia=function(a){try{if(a==this.g)a:{const r=O(this.g);var b=this.g.Da();const G=this.g.ba();if(!(3>r)&&(3!=r||Ja$1||this.g&&(this.h.h||this.g.ga()||oc$1(this.g)))){this.I||4!=r||7==b||(8==b||0>=G?I(3):I(2));pc$1(this);var c=this.g.ba();this.N=c;b:if(qc$1(this)){var d=oc$1(this.g);a="";var e=d.length,f=4==O(this.g);if(!this.h.i){if("undefined"===typeof TextDecoder){P(this);rc$1(this);var h="";break b}this.h.i=new l.TextDecoder;}for(b=0;b<e;b++)this.h.h=!0,a+=this.h.i.decode(d[b],{stream:f&&b==e-1});d.splice(0,
    e);this.h.g+=a;this.C=0;h=this.h.g;}else h=this.g.ga();this.i=200==c;Ob(this.j,this.u,this.A,this.m,this.X,r,c);if(this.i){if(this.$&&!this.J){b:{if(this.g){var n,u=this.g;if((n=u.g?u.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!sa(n)){var m=n;break b}}m=null;}if(c=m)F$1(this.j,this.m,c,"Initial handshake response via X-HTTP-Initial-Response"),this.J=!0,sc$1(this,c);else {this.i=!1;this.o=3;J$1(12);P(this);rc$1(this);break a}}this.U?(tc$1(this,r,h),Ja$1&&this.i&&3==r&&(Kb(this.V,this.W,"tick",this.fb),
    this.W.start())):(F$1(this.j,this.m,h,null),sc$1(this,h));4==r&&P(this);this.i&&!this.I&&(4==r?uc$1(this.l,this):(this.i=!1,lc$1(this)));}else 400==c&&0<h.indexOf("Unknown SID")?(this.o=3,J$1(12)):(this.o=0,J$1(13)),P(this),rc$1(this);}}}catch(r){}finally{}};function qc$1(a){return a.g?"GET"==a.u&&2!=a.K&&a.l.Ba:!1}
    function tc$1(a,b,c){let d=!0,e;for(;!a.I&&a.C<c.length;)if(e=vc(a,c),e==hc$1){4==b&&(a.o=4,J$1(14),d=!1);F$1(a.j,a.m,null,"[Incomplete Response]");break}else if(e==gc$1){a.o=4;J$1(15);F$1(a.j,a.m,c,"[Invalid Chunk]");d=!1;break}else F$1(a.j,a.m,e,null),sc$1(a,e);qc$1(a)&&e!=hc$1&&e!=gc$1&&(a.h.g="",a.C=0);4!=b||0!=c.length||a.h.h||(a.o=1,J$1(16),d=!1);a.i=a.i&&d;d?0<c.length&&!a.aa&&(a.aa=!0,b=a.l,b.g==a&&b.$&&!b.L&&(b.h.info("Great, no buffering proxy detected. Bytes received: "+c.length),wc$1(b),b.L=!0,J$1(11))):(F$1(a.j,a.m,
    c,"[Invalid Chunked Response]"),P(a),rc$1(a));}k$1.fb=function(){if(this.g){var a=O(this.g),b=this.g.ga();this.C<b.length&&(pc$1(this),tc$1(this,a,b),this.i&&4!=a&&lc$1(this));}};function vc(a,b){var c=a.C,d=b.indexOf("\n",c);if(-1==d)return hc$1;c=Number(b.substring(c,d));if(isNaN(c))return gc$1;d+=1;if(d+c>b.length)return hc$1;b=b.substr(d,c);a.C=d+c;return b}k$1.cancel=function(){this.I=!0;P(this);};function lc$1(a){a.Y=Date.now()+a.P;xc$1(a,a.P);}
    function xc$1(a,b){if(null!=a.B)throw Error("WatchDog timer not null");a.B=K$1(q(a.eb,a),b);}function pc$1(a){a.B&&(l.clearTimeout(a.B),a.B=null);}k$1.eb=function(){this.B=null;const a=Date.now();0<=a-this.Y?(Qb(this.j,this.A),2!=this.K&&(I(3),J$1(17)),P(this),this.o=2,rc$1(this)):xc$1(this,this.Y-a);};function rc$1(a){0==a.l.G||a.I||uc$1(a.l,a);}function P(a){pc$1(a);var b=a.L;b&&"function"==typeof b.na&&b.na();a.L=null;Fb(a.W);Lb(a.V);a.g&&(b=a.g,a.g=null,b.abort(),b.na());}
    function sc$1(a,b){try{var c=a.l;if(0!=c.G&&(c.g==a||yc$1(c.i,a)))if(c.I=a.N,!a.J&&yc$1(c.i,a)&&3==c.G){try{var d=c.Ca.g.parse(b);}catch(m){d=null;}if(Array.isArray(d)&&3==d.length){var e=d;if(0==e[0])a:{if(!c.u){if(c.g)if(c.g.F+3E3<a.F)zc$1(c),Ac$1(c);else break a;Bc$1(c);J$1(18);}}else c.ta=e[1],0<c.ta-c.U&&37500>e[2]&&c.N&&0==c.A&&!c.v&&(c.v=K$1(q(c.ab,c),6E3));if(1>=Cc$1(c.i)&&c.ka){try{c.ka();}catch(m){}c.ka=void 0;}}else Q$1(c,11);}else if((a.J||c.g==a)&&zc$1(c),!sa(b))for(e=c.Ca.g.parse(b),b=0;b<e.length;b++){let m=e[b];
    c.U=m[0];m=m[1];if(2==c.G)if("c"==m[0]){c.J=m[1];c.la=m[2];const r=m[3];null!=r&&(c.ma=r,c.h.info("VER="+c.ma));const G=m[4];null!=G&&(c.za=G,c.h.info("SVER="+c.za));const Da=m[5];null!=Da&&"number"===typeof Da&&0<Da&&(d=1.5*Da,c.K=d,c.h.info("backChannelRequestTimeoutMs_="+d));d=c;const ca=a.g;if(ca){const Ea=ca.g?ca.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Ea){var f=d.i;!f.g&&(w(Ea,"spdy")||w(Ea,"quic")||w(Ea,"h2"))&&(f.j=f.l,f.g=new Set,f.h&&(Dc$1(f,f.h),f.h=null));}if(d.D){const xb=
    ca.g?ca.g.getResponseHeader("X-HTTP-Session-Id"):null;xb&&(d.sa=xb,R(d.F,d.D,xb));}}c.G=3;c.j&&c.j.xa();c.$&&(c.O=Date.now()-a.F,c.h.info("Handshake RTT: "+c.O+"ms"));d=c;var h=a;d.oa=Ec$1(d,d.H?d.la:null,d.W);if(h.J){Fc$1(d.i,h);var n=h,u=d.K;u&&n.setTimeout(u);n.B&&(pc$1(n),lc$1(n));d.g=h;}else Gc(d);0<c.l.length&&Hc$1(c);}else "stop"!=m[0]&&"close"!=m[0]||Q$1(c,7);else 3==c.G&&("stop"==m[0]||"close"==m[0]?"stop"==m[0]?Q$1(c,7):Ic$1(c):"noop"!=m[0]&&c.j&&c.j.wa(m),c.A=0);}I(4);}catch(m){}}function Jc$1(a){if(a.R&&"function"==typeof a.R)return a.R();if("string"===typeof a)return a.split("");if(ba(a)){for(var b=[],c=a.length,d=0;d<c;d++)b.push(a[d]);return b}b=[];c=0;for(d in a)b[c++]=a[d];return b}
    function Kc$1(a,b){if(a.forEach&&"function"==typeof a.forEach)a.forEach(b,void 0);else if(ba(a)||"string"===typeof a)na$1(a,b,void 0);else {if(a.T&&"function"==typeof a.T)var c=a.T();else if(a.R&&"function"==typeof a.R)c=void 0;else if(ba(a)||"string"===typeof a){c=[];for(var d=a.length,e=0;e<d;e++)c.push(e);}else for(e in c=[],d=0,a)c[d++]=e;d=Jc$1(a);e=d.length;for(var f=0;f<e;f++)b.call(void 0,d[f],c&&c[f],a);}}function S(a,b){this.h={};this.g=[];this.i=0;var c=arguments.length;if(1<c){if(c%2)throw Error("Uneven number of arguments");for(var d=0;d<c;d+=2)this.set(arguments[d],arguments[d+1]);}else if(a)if(a instanceof S)for(c=a.T(),d=0;d<c.length;d++)this.set(c[d],a.get(c[d]));else for(d in a)this.set(d,a[d]);}k$1=S.prototype;k$1.R=function(){Lc$1(this);for(var a=[],b=0;b<this.g.length;b++)a.push(this.h[this.g[b]]);return a};k$1.T=function(){Lc$1(this);return this.g.concat()};
    function Lc$1(a){if(a.i!=a.g.length){for(var b=0,c=0;b<a.g.length;){var d=a.g[b];T(a.h,d)&&(a.g[c++]=d);b++;}a.g.length=c;}if(a.i!=a.g.length){var e={};for(c=b=0;b<a.g.length;)d=a.g[b],T(e,d)||(a.g[c++]=d,e[d]=1),b++;a.g.length=c;}}k$1.get=function(a,b){return T(this.h,a)?this.h[a]:b};k$1.set=function(a,b){T(this.h,a)||(this.i++,this.g.push(a));this.h[a]=b;};k$1.forEach=function(a,b){for(var c=this.T(),d=0;d<c.length;d++){var e=c[d],f=this.get(e);a.call(b,f,e,this);}};
    function T(a,b){return Object.prototype.hasOwnProperty.call(a,b)}var Mc$1=/^(?:([^:/?#.]+):)?(?:\/\/(?:([^\\/?#]*)@)?([^\\/?#]*?)(?::([0-9]+))?(?=[\\/?#]|$))?([^?#]+)?(?:\?([^#]*))?(?:#([\s\S]*))?$/;function Nc$1(a,b){if(a){a=a.split("&");for(var c=0;c<a.length;c++){var d=a[c].indexOf("="),e=null;if(0<=d){var f=a[c].substring(0,d);e=a[c].substring(d+1);}else f=a[c];b(f,e?decodeURIComponent(e.replace(/\+/g," ")):"");}}}function U$1(a,b){this.i=this.s=this.j="";this.m=null;this.o=this.l="";this.g=!1;if(a instanceof U$1){this.g=void 0!==b?b:a.g;Oc$1(this,a.j);this.s=a.s;Pc(this,a.i);Qc$1(this,a.m);this.l=a.l;b=a.h;var c=new Rc$1;c.i=b.i;b.g&&(c.g=new S(b.g),c.h=b.h);Sc$1(this,c);this.o=a.o;}else a&&(c=String(a).match(Mc$1))?(this.g=!!b,Oc$1(this,c[1]||"",!0),this.s=Tc$1(c[2]||""),Pc(this,c[3]||"",!0),Qc$1(this,c[4]),this.l=Tc$1(c[5]||"",!0),Sc$1(this,c[6]||"",!0),this.o=Tc$1(c[7]||"")):(this.g=!!b,this.h=new Rc$1(null,this.g));}
    U$1.prototype.toString=function(){var a=[],b=this.j;b&&a.push(Uc$1(b,Vc,!0),":");var c=this.i;if(c||"file"==b)a.push("//"),(b=this.s)&&a.push(Uc$1(b,Vc,!0),"@"),a.push(encodeURIComponent(String(c)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),c=this.m,null!=c&&a.push(":",String(c));if(c=this.l)this.i&&"/"!=c.charAt(0)&&a.push("/"),a.push(Uc$1(c,"/"==c.charAt(0)?Wc$1:Xc$1,!0));(c=this.h.toString())&&a.push("?",c);(c=this.o)&&a.push("#",Uc$1(c,Yc$1));return a.join("")};function N$1(a){return new U$1(a)}
    function Oc$1(a,b,c){a.j=c?Tc$1(b,!0):b;a.j&&(a.j=a.j.replace(/:$/,""));}function Pc(a,b,c){a.i=c?Tc$1(b,!0):b;}function Qc$1(a,b){if(b){b=Number(b);if(isNaN(b)||0>b)throw Error("Bad port number "+b);a.m=b;}else a.m=null;}function Sc$1(a,b,c){b instanceof Rc$1?(a.h=b,Zc$1(a.h,a.g)):(c||(b=Uc$1(b,$c$1)),a.h=new Rc$1(b,a.g));}function R(a,b,c){a.h.set(b,c);}function jc$1(a){R(a,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36));return a}
    function ad(a){return a instanceof U$1?N$1(a):new U$1(a,void 0)}function bd(a,b,c,d){var e=new U$1(null,void 0);a&&Oc$1(e,a);b&&Pc(e,b);c&&Qc$1(e,c);d&&(e.l=d);return e}function Tc$1(a,b){return a?b?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function Uc$1(a,b,c){return "string"===typeof a?(a=encodeURI(a).replace(b,cd),c&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function cd(a){a=a.charCodeAt(0);return "%"+(a>>4&15).toString(16)+(a&15).toString(16)}
    var Vc=/[#\/\?@]/g,Xc$1=/[#\?:]/g,Wc$1=/[#\?]/g,$c$1=/[#\?@]/g,Yc$1=/#/g;function Rc$1(a,b){this.h=this.g=null;this.i=a||null;this.j=!!b;}function V(a){a.g||(a.g=new S,a.h=0,a.i&&Nc$1(a.i,function(b,c){a.add(decodeURIComponent(b.replace(/\+/g," ")),c);}));}k$1=Rc$1.prototype;k$1.add=function(a,b){V(this);this.i=null;a=W$1(this,a);var c=this.g.get(a);c||this.g.set(a,c=[]);c.push(b);this.h+=1;return this};
    function dd(a,b){V(a);b=W$1(a,b);T(a.g.h,b)&&(a.i=null,a.h-=a.g.get(b).length,a=a.g,T(a.h,b)&&(delete a.h[b],a.i--,a.g.length>2*a.i&&Lc$1(a)));}function ed(a,b){V(a);b=W$1(a,b);return T(a.g.h,b)}k$1.forEach=function(a,b){V(this);this.g.forEach(function(c,d){na$1(c,function(e){a.call(b,e,d,this);},this);},this);};k$1.T=function(){V(this);for(var a=this.g.R(),b=this.g.T(),c=[],d=0;d<b.length;d++)for(var e=a[d],f=0;f<e.length;f++)c.push(b[d]);return c};
    k$1.R=function(a){V(this);var b=[];if("string"===typeof a)ed(this,a)&&(b=qa(b,this.g.get(W$1(this,a))));else {a=this.g.R();for(var c=0;c<a.length;c++)b=qa(b,a[c]);}return b};k$1.set=function(a,b){V(this);this.i=null;a=W$1(this,a);ed(this,a)&&(this.h-=this.g.get(a).length);this.g.set(a,[b]);this.h+=1;return this};k$1.get=function(a,b){if(!a)return b;a=this.R(a);return 0<a.length?String(a[0]):b};function mc$1(a,b,c){dd(a,b);0<c.length&&(a.i=null,a.g.set(W$1(a,b),ra(c)),a.h+=c.length);}
    k$1.toString=function(){if(this.i)return this.i;if(!this.g)return "";for(var a=[],b=this.g.T(),c=0;c<b.length;c++){var d=b[c],e=encodeURIComponent(String(d));d=this.R(d);for(var f=0;f<d.length;f++){var h=e;""!==d[f]&&(h+="="+encodeURIComponent(String(d[f])));a.push(h);}}return this.i=a.join("&")};function W$1(a,b){b=String(b);a.j&&(b=b.toLowerCase());return b}function Zc$1(a,b){b&&!a.j&&(V(a),a.i=null,a.g.forEach(function(c,d){var e=d.toLowerCase();d!=e&&(dd(this,d),mc$1(this,e,c));},a));a.j=b;}var fd=class{constructor(a,b){this.h=a;this.g=b;}};function gd(a){this.l=a||hd;l.PerformanceNavigationTiming?(a=l.performance.getEntriesByType("navigation"),a=0<a.length&&("hq"==a[0].nextHopProtocol||"h2"==a[0].nextHopProtocol)):a=!!(l.g&&l.g.Ea&&l.g.Ea()&&l.g.Ea().Zb);this.j=a?this.l:1;this.g=null;1<this.j&&(this.g=new Set);this.h=null;this.i=[];}var hd=10;function id(a){return a.h?!0:a.g?a.g.size>=a.j:!1}function Cc$1(a){return a.h?1:a.g?a.g.size:0}function yc$1(a,b){return a.h?a.h==b:a.g?a.g.has(b):!1}function Dc$1(a,b){a.g?a.g.add(b):a.h=b;}
    function Fc$1(a,b){a.h&&a.h==b?a.h=null:a.g&&a.g.has(b)&&a.g.delete(b);}gd.prototype.cancel=function(){this.i=jd(this);if(this.h)this.h.cancel(),this.h=null;else if(this.g&&0!==this.g.size){for(const a of this.g.values())a.cancel();this.g.clear();}};function jd(a){if(null!=a.h)return a.i.concat(a.h.D);if(null!=a.g&&0!==a.g.size){let b=a.i;for(const c of a.g.values())b=b.concat(c.D);return b}return ra(a.i)}function kd(){}kd.prototype.stringify=function(a){return l.JSON.stringify(a,void 0)};kd.prototype.parse=function(a){return l.JSON.parse(a,void 0)};function ld(){this.g=new kd;}function md(a,b,c){const d=c||"";try{Kc$1(a,function(e,f){let h=e;p(e)&&(h=rb(e));b.push(d+f+"="+encodeURIComponent(h));});}catch(e){throw b.push(d+"type="+encodeURIComponent("_badmap")),e;}}function nd(a,b){const c=new Mb;if(l.Image){const d=new Image;d.onload=ja(od,c,d,"TestLoadImage: loaded",!0,b);d.onerror=ja(od,c,d,"TestLoadImage: error",!1,b);d.onabort=ja(od,c,d,"TestLoadImage: abort",!1,b);d.ontimeout=ja(od,c,d,"TestLoadImage: timeout",!1,b);l.setTimeout(function(){if(d.ontimeout)d.ontimeout();},1E4);d.src=a;}else b(!1);}function od(a,b,c,d,e){try{b.onload=null,b.onerror=null,b.onabort=null,b.ontimeout=null,e(d);}catch(f){}}function pd(a){this.l=a.$b||null;this.j=a.ib||!1;}t(pd,Yb);pd.prototype.g=function(){return new qd(this.l,this.j)};pd.prototype.i=function(a){return function(){return a}}({});function qd(a,b){C$1.call(this);this.D=a;this.u=b;this.m=void 0;this.readyState=rd;this.status=0;this.responseType=this.responseText=this.response=this.statusText="";this.onreadystatechange=null;this.v=new Headers;this.h=null;this.C="GET";this.B="";this.g=!1;this.A=this.j=this.l=null;}t(qd,C$1);var rd=0;k$1=qd.prototype;
    k$1.open=function(a,b){if(this.readyState!=rd)throw this.abort(),Error("Error reopening a connection");this.C=a;this.B=b;this.readyState=1;sd(this);};k$1.send=function(a){if(1!=this.readyState)throw this.abort(),Error("need to call open() first. ");this.g=!0;const b={headers:this.v,method:this.C,credentials:this.m,cache:void 0};a&&(b.body=a);(this.D||l).fetch(new Request(this.B,b)).then(this.Va.bind(this),this.ha.bind(this));};
    k$1.abort=function(){this.response=this.responseText="";this.v=new Headers;this.status=0;this.j&&this.j.cancel("Request was aborted.");1<=this.readyState&&this.g&&4!=this.readyState&&(this.g=!1,td(this));this.readyState=rd;};
    k$1.Va=function(a){if(this.g&&(this.l=a,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=a.headers,this.readyState=2,sd(this)),this.g&&(this.readyState=3,sd(this),this.g)))if("arraybuffer"===this.responseType)a.arrayBuffer().then(this.Ta.bind(this),this.ha.bind(this));else if("undefined"!==typeof l.ReadableStream&&"body"in a){this.j=a.body.getReader();if(this.u){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=
    [];}else this.response=this.responseText="",this.A=new TextDecoder;ud(this);}else a.text().then(this.Ua.bind(this),this.ha.bind(this));};function ud(a){a.j.read().then(a.Sa.bind(a)).catch(a.ha.bind(a));}k$1.Sa=function(a){if(this.g){if(this.u&&a.value)this.response.push(a.value);else if(!this.u){var b=a.value?a.value:new Uint8Array(0);if(b=this.A.decode(b,{stream:!a.done}))this.response=this.responseText+=b;}a.done?td(this):sd(this);3==this.readyState&&ud(this);}};
    k$1.Ua=function(a){this.g&&(this.response=this.responseText=a,td(this));};k$1.Ta=function(a){this.g&&(this.response=a,td(this));};k$1.ha=function(){this.g&&td(this);};function td(a){a.readyState=4;a.l=null;a.j=null;a.A=null;sd(a);}k$1.setRequestHeader=function(a,b){this.v.append(a,b);};k$1.getResponseHeader=function(a){return this.h?this.h.get(a.toLowerCase())||"":""};
    k$1.getAllResponseHeaders=function(){if(!this.h)return "";const a=[],b=this.h.entries();for(var c=b.next();!c.done;)c=c.value,a.push(c[0]+": "+c[1]),c=b.next();return a.join("\r\n")};function sd(a){a.onreadystatechange&&a.onreadystatechange.call(a);}Object.defineProperty(qd.prototype,"withCredentials",{get:function(){return "include"===this.m},set:function(a){this.m=a?"include":"same-origin";}});var vd=l.JSON.parse;function X$1(a){C$1.call(this);this.headers=new S;this.u=a||null;this.h=!1;this.C=this.g=null;this.H="";this.m=0;this.j="";this.l=this.F=this.v=this.D=!1;this.B=0;this.A=null;this.J=wd;this.K=this.L=!1;}t(X$1,C$1);var wd="",xd=/^https?$/i,yd=["POST","PUT"];k$1=X$1.prototype;
    k$1.ea=function(a,b,c,d){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.H+"; newUri="+a);b=b?b.toUpperCase():"GET";this.H=a;this.j="";this.m=0;this.D=!1;this.h=!0;this.g=this.u?this.u.g():cc$1.g();this.C=this.u?Zb(this.u):Zb(cc$1);this.g.onreadystatechange=q(this.Fa,this);try{this.F=!0,this.g.open(b,String(a),!0),this.F=!1;}catch(f){zd(this,f);return}a=c||"";const e=new S(this.headers);d&&Kc$1(d,function(f,h){e.set(h,f);});d=oa(e.T());c=l.FormData&&a instanceof l.FormData;
    !(0<=ma(yd,b))||d||c||e.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");e.forEach(function(f,h){this.g.setRequestHeader(h,f);},this);this.J&&(this.g.responseType=this.J);"withCredentials"in this.g&&this.g.withCredentials!==this.L&&(this.g.withCredentials=this.L);try{Ad(this),0<this.B&&((this.K=Bd(this.g))?(this.g.timeout=this.B,this.g.ontimeout=q(this.pa,this)):this.A=Gb(this.pa,this.B,this)),this.v=!0,this.g.send(a),this.v=!1;}catch(f){zd(this,f);}};
    function Bd(a){return y&&Ra()&&"number"===typeof a.timeout&&void 0!==a.ontimeout}function pa(a){return "content-type"==a.toLowerCase()}k$1.pa=function(){"undefined"!=typeof goog&&this.g&&(this.j="Timed out after "+this.B+"ms, aborting",this.m=8,D$1(this,"timeout"),this.abort(8));};function zd(a,b){a.h=!1;a.g&&(a.l=!0,a.g.abort(),a.l=!1);a.j=b;a.m=5;Cd(a);Dd(a);}function Cd(a){a.D||(a.D=!0,D$1(a,"complete"),D$1(a,"error"));}
    k$1.abort=function(a){this.g&&this.h&&(this.h=!1,this.l=!0,this.g.abort(),this.l=!1,this.m=a||7,D$1(this,"complete"),D$1(this,"abort"),Dd(this));};k$1.M=function(){this.g&&(this.h&&(this.h=!1,this.l=!0,this.g.abort(),this.l=!1),Dd(this,!0));X$1.Z.M.call(this);};k$1.Fa=function(){this.s||(this.F||this.v||this.l?Ed(this):this.cb());};k$1.cb=function(){Ed(this);};
    function Ed(a){if(a.h&&"undefined"!=typeof goog&&(!a.C[1]||4!=O(a)||2!=a.ba()))if(a.v&&4==O(a))Gb(a.Fa,0,a);else if(D$1(a,"readystatechange"),4==O(a)){a.h=!1;try{const n=a.ba();a:switch(n){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var b=!0;break a;default:b=!1;}var c;if(!(c=b)){var d;if(d=0===n){var e=String(a.H).match(Mc$1)[1]||null;if(!e&&l.self&&l.self.location){var f=l.self.location.protocol;e=f.substr(0,f.length-1);}d=!xd.test(e?e.toLowerCase():"");}c=d;}if(c)D$1(a,"complete"),D$1(a,
    "success");else {a.m=6;try{var h=2<O(a)?a.g.statusText:"";}catch(u){h="";}a.j=h+" ["+a.ba()+"]";Cd(a);}}finally{Dd(a);}}}function Dd(a,b){if(a.g){Ad(a);const c=a.g,d=a.C[0]?aa:null;a.g=null;a.C=null;b||D$1(a,"ready");try{c.onreadystatechange=d;}catch(e){}}}function Ad(a){a.g&&a.K&&(a.g.ontimeout=null);a.A&&(l.clearTimeout(a.A),a.A=null);}function O(a){return a.g?a.g.readyState:0}k$1.ba=function(){try{return 2<O(this)?this.g.status:-1}catch(a){return -1}};
    k$1.ga=function(){try{return this.g?this.g.responseText:""}catch(a){return ""}};k$1.Qa=function(a){if(this.g){var b=this.g.responseText;a&&0==b.indexOf(a)&&(b=b.substring(a.length));return vd(b)}};function oc$1(a){try{if(!a.g)return null;if("response"in a.g)return a.g.response;switch(a.J){case wd:case "text":return a.g.responseText;case "arraybuffer":if("mozResponseArrayBuffer"in a.g)return a.g.mozResponseArrayBuffer}return null}catch(b){return null}}k$1.Da=function(){return this.m};
    k$1.La=function(){return "string"===typeof this.j?this.j:String(this.j)};function Fd(a){let b="";xa$1(a,function(c,d){b+=d;b+=":";b+=c;b+="\r\n";});return b}function Gd(a,b,c){a:{for(d in c){var d=!1;break a}d=!0;}d||(c=Fd(c),"string"===typeof a?(null!=c&&encodeURIComponent(String(c))):R(a,b,c));}function Hd(a,b,c){return c&&c.internalChannelParams?c.internalChannelParams[a]||b:b}
    function Id(a){this.za=0;this.l=[];this.h=new Mb;this.la=this.oa=this.F=this.W=this.g=this.sa=this.D=this.aa=this.o=this.P=this.s=null;this.Za=this.V=0;this.Xa=Hd("failFast",!1,a);this.N=this.v=this.u=this.m=this.j=null;this.X=!0;this.I=this.ta=this.U=-1;this.Y=this.A=this.C=0;this.Pa=Hd("baseRetryDelayMs",5E3,a);this.$a=Hd("retryDelaySeedMs",1E4,a);this.Ya=Hd("forwardChannelMaxRetries",2,a);this.ra=Hd("forwardChannelRequestTimeoutMs",2E4,a);this.qa=a&&a.xmlHttpFactory||void 0;this.Ba=a&&a.Yb||!1;
    this.K=void 0;this.H=a&&a.supportsCrossDomainXhr||!1;this.J="";this.i=new gd(a&&a.concurrentRequestLimit);this.Ca=new ld;this.ja=a&&a.fastHandshake||!1;this.Ra=a&&a.Wb||!1;a&&a.Aa&&this.h.Aa();a&&a.forceLongPolling&&(this.X=!1);this.$=!this.ja&&this.X&&a&&a.detectBufferingProxy||!1;this.ka=void 0;this.O=0;this.L=!1;this.B=null;this.Wa=!a||!1!==a.Xb;}k$1=Id.prototype;k$1.ma=8;k$1.G=1;
    function Ic$1(a){Jd(a);if(3==a.G){var b=a.V++,c=N$1(a.F);R(c,"SID",a.J);R(c,"RID",b);R(c,"TYPE","terminate");Kd(a,c);b=new M$1(a,a.h,b,void 0);b.K=2;b.v=jc$1(N$1(c));c=!1;l.navigator&&l.navigator.sendBeacon&&(c=l.navigator.sendBeacon(b.v.toString(),""));!c&&l.Image&&((new Image).src=b.v,c=!0);c||(b.g=nc$1(b.l,null),b.g.ea(b.v));b.F=Date.now();lc$1(b);}Ld(a);}k$1.hb=function(a){try{this.h.info("Origin Trials invoked: "+a);}catch(b){}};function Ac$1(a){a.g&&(wc$1(a),a.g.cancel(),a.g=null);}
    function Jd(a){Ac$1(a);a.u&&(l.clearTimeout(a.u),a.u=null);zc$1(a);a.i.cancel();a.m&&("number"===typeof a.m&&l.clearTimeout(a.m),a.m=null);}function Md(a,b){a.l.push(new fd(a.Za++,b));3==a.G&&Hc$1(a);}function Hc$1(a){id(a.i)||a.m||(a.m=!0,zb(a.Ha,a),a.C=0);}function Nd(a,b){if(Cc$1(a.i)>=a.i.j-(a.m?1:0))return !1;if(a.m)return a.l=b.D.concat(a.l),!0;if(1==a.G||2==a.G||a.C>=(a.Xa?0:a.Ya))return !1;a.m=K$1(q(a.Ha,a,b),Od(a,a.C));a.C++;return !0}
    k$1.Ha=function(a){if(this.m)if(this.m=null,1==this.G){if(!a){this.V=Math.floor(1E5*Math.random());a=this.V++;const e=new M$1(this,this.h,a,void 0);let f=this.s;this.P&&(f?(f=ya(f),Aa(f,this.P)):f=this.P);null===this.o&&(e.H=f);if(this.ja)a:{var b=0;for(var c=0;c<this.l.length;c++){b:{var d=this.l[c];if("__data__"in d.g&&(d=d.g.__data__,"string"===typeof d)){d=d.length;break b}d=void 0;}if(void 0===d)break;b+=d;if(4096<b){b=c;break a}if(4096===b||c===this.l.length-1){b=c+1;break a}}b=1E3;}else b=1E3;b=
    Pd(this,e,b);c=N$1(this.F);R(c,"RID",a);R(c,"CVER",22);this.D&&R(c,"X-HTTP-Session-Id",this.D);Kd(this,c);this.o&&f&&Gd(c,this.o,f);Dc$1(this.i,e);this.Ra&&R(c,"TYPE","init");this.ja?(R(c,"$req",b),R(c,"SID","null"),e.$=!0,ic$1(e,c,null)):ic$1(e,c,b);this.G=2;}}else 3==this.G&&(a?Qd(this,a):0==this.l.length||id(this.i)||Qd(this));};
    function Qd(a,b){var c;b?c=b.m:c=a.V++;const d=N$1(a.F);R(d,"SID",a.J);R(d,"RID",c);R(d,"AID",a.U);Kd(a,d);a.o&&a.s&&Gd(d,a.o,a.s);c=new M$1(a,a.h,c,a.C+1);null===a.o&&(c.H=a.s);b&&(a.l=b.D.concat(a.l));b=Pd(a,c,1E3);c.setTimeout(Math.round(.5*a.ra)+Math.round(.5*a.ra*Math.random()));Dc$1(a.i,c);ic$1(c,d,b);}function Kd(a,b){a.j&&Kc$1({},function(c,d){R(b,d,c);});}
    function Pd(a,b,c){c=Math.min(a.l.length,c);var d=a.j?q(a.j.Oa,a.j,a):null;a:{var e=a.l;let f=-1;for(;;){const h=["count="+c];-1==f?0<c?(f=e[0].h,h.push("ofs="+f)):f=0:h.push("ofs="+f);let n=!0;for(let u=0;u<c;u++){let m=e[u].h;const r=e[u].g;m-=f;if(0>m)f=Math.max(0,e[u].h-100),n=!1;else try{md(r,h,"req"+m+"_");}catch(G){d&&d(r);}}if(n){d=h.join("&");break a}}}a=a.l.splice(0,c);b.D=a;return d}function Gc(a){a.g||a.u||(a.Y=1,zb(a.Ga,a),a.A=0);}
    function Bc$1(a){if(a.g||a.u||3<=a.A)return !1;a.Y++;a.u=K$1(q(a.Ga,a),Od(a,a.A));a.A++;return !0}k$1.Ga=function(){this.u=null;Rd(this);if(this.$&&!(this.L||null==this.g||0>=this.O)){var a=2*this.O;this.h.info("BP detection timer enabled: "+a);this.B=K$1(q(this.bb,this),a);}};k$1.bb=function(){this.B&&(this.B=null,this.h.info("BP detection timeout reached."),this.h.info("Buffering proxy detected and switch to long-polling!"),this.N=!1,this.L=!0,J$1(10),Ac$1(this),Rd(this));};
    function wc$1(a){null!=a.B&&(l.clearTimeout(a.B),a.B=null);}function Rd(a){a.g=new M$1(a,a.h,"rpc",a.Y);null===a.o&&(a.g.H=a.s);a.g.O=0;var b=N$1(a.oa);R(b,"RID","rpc");R(b,"SID",a.J);R(b,"CI",a.N?"0":"1");R(b,"AID",a.U);Kd(a,b);R(b,"TYPE","xmlhttp");a.o&&a.s&&Gd(b,a.o,a.s);a.K&&a.g.setTimeout(a.K);var c=a.g;a=a.la;c.K=1;c.v=jc$1(N$1(b));c.s=null;c.U=!0;kc$1(c,a);}k$1.ab=function(){null!=this.v&&(this.v=null,Ac$1(this),Bc$1(this),J$1(19));};function zc$1(a){null!=a.v&&(l.clearTimeout(a.v),a.v=null);}
    function uc$1(a,b){var c=null;if(a.g==b){zc$1(a);wc$1(a);a.g=null;var d=2;}else if(yc$1(a.i,b))c=b.D,Fc$1(a.i,b),d=1;else return;a.I=b.N;if(0!=a.G)if(b.i)if(1==d){c=b.s?b.s.length:0;b=Date.now()-b.F;var e=a.C;d=Sb();D$1(d,new Vb(d,c,b,e));Hc$1(a);}else Gc(a);else if(e=b.o,3==e||0==e&&0<a.I||!(1==d&&Nd(a,b)||2==d&&Bc$1(a)))switch(c&&0<c.length&&(b=a.i,b.i=b.i.concat(c)),e){case 1:Q$1(a,5);break;case 4:Q$1(a,10);break;case 3:Q$1(a,6);break;default:Q$1(a,2);}}
    function Od(a,b){let c=a.Pa+Math.floor(Math.random()*a.$a);a.j||(c*=2);return c*b}function Q$1(a,b){a.h.info("Error code "+b);if(2==b){var c=null;a.j&&(c=null);var d=q(a.jb,a);c||(c=new U$1("//www.google.com/images/cleardot.gif"),l.location&&"http"==l.location.protocol||Oc$1(c,"https"),jc$1(c));nd(c.toString(),d);}else J$1(2);a.G=0;a.j&&a.j.va(b);Ld(a);Jd(a);}k$1.jb=function(a){a?(this.h.info("Successfully pinged google.com"),J$1(2)):(this.h.info("Failed to ping google.com"),J$1(1));};
    function Ld(a){a.G=0;a.I=-1;if(a.j){if(0!=jd(a.i).length||0!=a.l.length)a.i.i.length=0,ra(a.l),a.l.length=0;a.j.ua();}}function Ec$1(a,b,c){let d=ad(c);if(""!=d.i)b&&Pc(d,b+"."+d.i),Qc$1(d,d.m);else {const e=l.location;d=bd(e.protocol,b?b+"."+e.hostname:e.hostname,+e.port,c);}a.aa&&xa$1(a.aa,function(e,f){R(d,f,e);});b=a.D;c=a.sa;b&&c&&R(d,b,c);R(d,"VER",a.ma);Kd(a,d);return d}
    function nc$1(a,b,c){if(b&&!a.H)throw Error("Can't create secondary domain capable XhrIo object.");b=c&&a.Ba&&!a.qa?new X$1(new pd({ib:!0})):new X$1(a.qa);b.L=a.H;return b}function Sd(){}k$1=Sd.prototype;k$1.xa=function(){};k$1.wa=function(){};k$1.va=function(){};k$1.ua=function(){};k$1.Oa=function(){};function Td(){if(y&&!(10<=Number(Ua)))throw Error("Environmental error: no available transport.");}Td.prototype.g=function(a,b){return new Y$1(a,b)};
    function Y$1(a,b){C$1.call(this);this.g=new Id(b);this.l=a;this.h=b&&b.messageUrlParams||null;a=b&&b.messageHeaders||null;b&&b.clientProtocolHeaderRequired&&(a?a["X-Client-Protocol"]="webchannel":a={"X-Client-Protocol":"webchannel"});this.g.s=a;a=b&&b.initMessageHeaders||null;b&&b.messageContentType&&(a?a["X-WebChannel-Content-Type"]=b.messageContentType:a={"X-WebChannel-Content-Type":b.messageContentType});b&&b.ya&&(a?a["X-WebChannel-Client-Profile"]=b.ya:a={"X-WebChannel-Client-Profile":b.ya});this.g.P=
    a;(a=b&&b.httpHeadersOverwriteParam)&&!sa(a)&&(this.g.o=a);this.A=b&&b.supportsCrossDomainXhr||!1;this.v=b&&b.sendRawJson||!1;(b=b&&b.httpSessionIdParam)&&!sa(b)&&(this.g.D=b,a=this.h,null!==a&&b in a&&(a=this.h,b in a&&delete a[b]));this.j=new Z$1(this);}t(Y$1,C$1);Y$1.prototype.m=function(){this.g.j=this.j;this.A&&(this.g.H=!0);var a=this.g,b=this.l,c=this.h||void 0;a.Wa&&(a.h.info("Origin Trials enabled."),zb(q(a.hb,a,b)));J$1(0);a.W=b;a.aa=c||{};a.N=a.X;a.F=Ec$1(a,null,a.W);Hc$1(a);};Y$1.prototype.close=function(){Ic$1(this.g);};
    Y$1.prototype.u=function(a){if("string"===typeof a){var b={};b.__data__=a;Md(this.g,b);}else this.v?(b={},b.__data__=rb(a),Md(this.g,b)):Md(this.g,a);};Y$1.prototype.M=function(){this.g.j=null;delete this.j;Ic$1(this.g);delete this.g;Y$1.Z.M.call(this);};function Ud(a){ac$1.call(this);var b=a.__sm__;if(b){a:{for(const c in b){a=c;break a}a=void 0;}if(this.i=a)a=this.i,b=null!==b&&a in b?b[a]:void 0;this.data=b;}else this.data=a;}t(Ud,ac$1);function Vd(){bc.call(this);this.status=1;}t(Vd,bc);function Z$1(a){this.g=a;}
    t(Z$1,Sd);Z$1.prototype.xa=function(){D$1(this.g,"a");};Z$1.prototype.wa=function(a){D$1(this.g,new Ud(a));};Z$1.prototype.va=function(a){D$1(this.g,new Vd(a));};Z$1.prototype.ua=function(){D$1(this.g,"b");};/*

     Copyright 2017 Google LLC

     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
    */
    Td.prototype.createWebChannel=Td.prototype.g;Y$1.prototype.send=Y$1.prototype.u;Y$1.prototype.open=Y$1.prototype.m;Y$1.prototype.close=Y$1.prototype.close;Wb.NO_ERROR=0;Wb.TIMEOUT=8;Wb.HTTP_ERROR=6;Xb.COMPLETE="complete";$b.EventType=L$1;L$1.OPEN="a";L$1.CLOSE="b";L$1.ERROR="c";L$1.MESSAGE="d";C$1.prototype.listen=C$1.prototype.N;X$1.prototype.listenOnce=X$1.prototype.O;X$1.prototype.getLastError=X$1.prototype.La;X$1.prototype.getLastErrorCode=X$1.prototype.Da;X$1.prototype.getStatus=X$1.prototype.ba;X$1.prototype.getResponseJson=X$1.prototype.Qa;
    X$1.prototype.getResponseText=X$1.prototype.ga;X$1.prototype.send=X$1.prototype.ea;var createWebChannelTransport = function(){return new Td};var getStatEventTarget = function(){return Sb()};var ErrorCode = Wb;var EventType = Xb;var Event = H;var Stat = {rb:0,ub:1,vb:2,Ob:3,Tb:4,Qb:5,Rb:6,Pb:7,Nb:8,Sb:9,PROXY:10,NOPROXY:11,Lb:12,Hb:13,Ib:14,Gb:15,Jb:16,Kb:17,nb:18,mb:19,ob:20};var FetchXmlHttpFactory = pd;var WebChannel = $b;
    var XhrIo = X$1;

    const D = "@firebase/firestore";

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Simple wrapper around a nullable UID. Mostly exists to make code more
     * readable.
     */
    class C {
        constructor(t) {
            this.uid = t;
        }
        isAuthenticated() {
            return null != this.uid;
        }
        /**
         * Returns a key representing this user, suitable for inclusion in a
         * dictionary.
         */    toKey() {
            return this.isAuthenticated() ? "uid:" + this.uid : "anonymous-user";
        }
        isEqual(t) {
            return t.uid === this.uid;
        }
    }

    /** A user with a null UID. */ C.UNAUTHENTICATED = new C(null), 
    // TODO(mikelehen): Look into getting a proper uid-equivalent for
    // non-FirebaseAuth providers.
    C.GOOGLE_CREDENTIALS = new C("google-credentials-uid"), C.FIRST_PARTY = new C("first-party-uid"), 
    C.MOCK_USER = new C("mock-user");

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    let N = "9.6.7";

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const x = new Logger("@firebase/firestore");

    // Helper methods are needed because variables can't be exported as read/write
    function k() {
        return x.logLevel;
    }

    function M(t, ...e) {
        if (x.logLevel <= LogLevel.DEBUG) {
            const n = e.map(B);
            x.debug(`Firestore (${N}): ${t}`, ...n);
        }
    }

    function $(t, ...e) {
        if (x.logLevel <= LogLevel.ERROR) {
            const n = e.map(B);
            x.error(`Firestore (${N}): ${t}`, ...n);
        }
    }

    /**
     * @internal
     */ function F(t, ...e) {
        if (x.logLevel <= LogLevel.WARN) {
            const n = e.map(B);
            x.warn(`Firestore (${N}): ${t}`, ...n);
        }
    }

    /**
     * Converts an additional log parameter to a string representation.
     */ function B(t) {
        if ("string" == typeof t) return t;
        try {
            return e = t, JSON.stringify(e);
        } catch (e) {
            // Converting to JSON failed, just log the object directly
            return t;
        }
        /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
        /** Formats an object as a JSON string, suitable for logging. */
        var e;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Unconditionally fails, throwing an Error with the given message.
     * Messages are stripped in production builds.
     *
     * Returns `never` and can be used in expressions:
     * @example
     * let futureVar = fail('not implemented yet');
     */ function L(t = "Unexpected state") {
        // Log the failure in addition to throw an exception, just in case the
        // exception is swallowed.
        const e = `FIRESTORE (${N}) INTERNAL ASSERTION FAILED: ` + t;
        // NOTE: We don't use FirestoreError here because these are internal failures
        // that cannot be handled by the user. (Also it would create a circular
        // dependency between the error and assert modules which doesn't work.)
        throw $(e), new Error(e);
    }

    /**
     * Fails if the given assertion condition is false, throwing an Error with the
     * given message if it did.
     *
     * Messages are stripped in production builds.
     */ function U(t, e) {
        t || L();
    }

    /**
     * Casts `obj` to `T`. In non-production builds, verifies that `obj` is an
     * instance of `T` before casting.
     */ function K(t, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    e) {
        return t;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ const G = {
        // Causes are copied from:
        // https://github.com/grpc/grpc/blob/bceec94ea4fc5f0085d81235d8e1c06798dc341a/include/grpc%2B%2B/impl/codegen/status_code_enum.h
        /** Not an error; returned on success. */
        OK: "ok",
        /** The operation was cancelled (typically by the caller). */
        CANCELLED: "cancelled",
        /** Unknown error or an error from a different error domain. */
        UNKNOWN: "unknown",
        /**
         * Client specified an invalid argument. Note that this differs from
         * FAILED_PRECONDITION. INVALID_ARGUMENT indicates arguments that are
         * problematic regardless of the state of the system (e.g., a malformed file
         * name).
         */
        INVALID_ARGUMENT: "invalid-argument",
        /**
         * Deadline expired before operation could complete. For operations that
         * change the state of the system, this error may be returned even if the
         * operation has completed successfully. For example, a successful response
         * from a server could have been delayed long enough for the deadline to
         * expire.
         */
        DEADLINE_EXCEEDED: "deadline-exceeded",
        /** Some requested entity (e.g., file or directory) was not found. */
        NOT_FOUND: "not-found",
        /**
         * Some entity that we attempted to create (e.g., file or directory) already
         * exists.
         */
        ALREADY_EXISTS: "already-exists",
        /**
         * The caller does not have permission to execute the specified operation.
         * PERMISSION_DENIED must not be used for rejections caused by exhausting
         * some resource (use RESOURCE_EXHAUSTED instead for those errors).
         * PERMISSION_DENIED must not be used if the caller can not be identified
         * (use UNAUTHENTICATED instead for those errors).
         */
        PERMISSION_DENIED: "permission-denied",
        /**
         * The request does not have valid authentication credentials for the
         * operation.
         */
        UNAUTHENTICATED: "unauthenticated",
        /**
         * Some resource has been exhausted, perhaps a per-user quota, or perhaps the
         * entire file system is out of space.
         */
        RESOURCE_EXHAUSTED: "resource-exhausted",
        /**
         * Operation was rejected because the system is not in a state required for
         * the operation's execution. For example, directory to be deleted may be
         * non-empty, an rmdir operation is applied to a non-directory, etc.
         *
         * A litmus test that may help a service implementor in deciding
         * between FAILED_PRECONDITION, ABORTED, and UNAVAILABLE:
         *  (a) Use UNAVAILABLE if the client can retry just the failing call.
         *  (b) Use ABORTED if the client should retry at a higher-level
         *      (e.g., restarting a read-modify-write sequence).
         *  (c) Use FAILED_PRECONDITION if the client should not retry until
         *      the system state has been explicitly fixed. E.g., if an "rmdir"
         *      fails because the directory is non-empty, FAILED_PRECONDITION
         *      should be returned since the client should not retry unless
         *      they have first fixed up the directory by deleting files from it.
         *  (d) Use FAILED_PRECONDITION if the client performs conditional
         *      REST Get/Update/Delete on a resource and the resource on the
         *      server does not match the condition. E.g., conflicting
         *      read-modify-write on the same resource.
         */
        FAILED_PRECONDITION: "failed-precondition",
        /**
         * The operation was aborted, typically due to a concurrency issue like
         * sequencer check failures, transaction aborts, etc.
         *
         * See litmus test above for deciding between FAILED_PRECONDITION, ABORTED,
         * and UNAVAILABLE.
         */
        ABORTED: "aborted",
        /**
         * Operation was attempted past the valid range. E.g., seeking or reading
         * past end of file.
         *
         * Unlike INVALID_ARGUMENT, this error indicates a problem that may be fixed
         * if the system state changes. For example, a 32-bit file system will
         * generate INVALID_ARGUMENT if asked to read at an offset that is not in the
         * range [0,2^32-1], but it will generate OUT_OF_RANGE if asked to read from
         * an offset past the current file size.
         *
         * There is a fair bit of overlap between FAILED_PRECONDITION and
         * OUT_OF_RANGE. We recommend using OUT_OF_RANGE (the more specific error)
         * when it applies so that callers who are iterating through a space can
         * easily look for an OUT_OF_RANGE error to detect when they are done.
         */
        OUT_OF_RANGE: "out-of-range",
        /** Operation is not implemented or not supported/enabled in this service. */
        UNIMPLEMENTED: "unimplemented",
        /**
         * Internal errors. Means some invariants expected by underlying System has
         * been broken. If you see one of these errors, Something is very broken.
         */
        INTERNAL: "internal",
        /**
         * The service is currently unavailable. This is a most likely a transient
         * condition and may be corrected by retrying with a backoff.
         *
         * See litmus test above for deciding between FAILED_PRECONDITION, ABORTED,
         * and UNAVAILABLE.
         */
        UNAVAILABLE: "unavailable",
        /** Unrecoverable data loss or corruption. */
        DATA_LOSS: "data-loss"
    };

    /** An error returned by a Firestore operation. */ class j extends FirebaseError {
        /** @hideconstructor */
        constructor(
        /**
         * The backend error code associated with this error.
         */
        t, 
        /**
         * A custom error description.
         */
        e) {
            super(t, e), this.code = t, this.message = e, 
            // HACK: We write a toString property directly because Error is not a real
            // class and so inheritance does not work correctly. We could alternatively
            // do the same "back-door inheritance" trick that FirebaseError does.
            this.toString = () => `${this.name}: [code=${this.code}]: ${this.message}`;
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class Q {
        constructor() {
            this.promise = new Promise(((t, e) => {
                this.resolve = t, this.reject = e;
            }));
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class W {
        constructor(t, e) {
            this.user = e, this.type = "OAuth", this.headers = new Map, this.headers.set("Authorization", `Bearer ${t}`);
        }
    }

    /**
     * A CredentialsProvider that always yields an empty token.
     * @internal
     */ class z {
        getToken() {
            return Promise.resolve(null);
        }
        invalidateToken() {}
        start(t, e) {
            // Fire with initial user.
            t.enqueueRetryable((() => e(C.UNAUTHENTICATED)));
        }
        shutdown() {}
    }

    class J {
        constructor(t) {
            this.t = t, 
            /** Tracks the current User. */
            this.currentUser = C.UNAUTHENTICATED, 
            /**
             * Counter used to detect if the token changed while a getToken request was
             * outstanding.
             */
            this.i = 0, this.forceRefresh = !1, this.auth = null;
        }
        start(t, e) {
            let n = this.i;
            // A change listener that prevents double-firing for the same token change.
                    const s = t => this.i !== n ? (n = this.i, e(t)) : Promise.resolve();
            // A promise that can be waited on to block on the next token change.
            // This promise is re-created after each change.
                    let i = new Q;
            this.o = () => {
                this.i++, this.currentUser = this.u(), i.resolve(), i = new Q, t.enqueueRetryable((() => s(this.currentUser)));
            };
            const r = () => {
                const e = i;
                t.enqueueRetryable((async () => {
                    await e.promise, await s(this.currentUser);
                }));
            }, o = t => {
                M("FirebaseAuthCredentialsProvider", "Auth detected"), this.auth = t, this.auth.addAuthTokenListener(this.o), 
                r();
            };
            this.t.onInit((t => o(t))), 
            // Our users can initialize Auth right after Firestore, so we give it
            // a chance to register itself with the component framework before we
            // determine whether to start up in unauthenticated mode.
            setTimeout((() => {
                if (!this.auth) {
                    const t = this.t.getImmediate({
                        optional: !0
                    });
                    t ? o(t) : (
                    // If auth is still not available, proceed with `null` user
                    M("FirebaseAuthCredentialsProvider", "Auth not yet detected"), i.resolve(), i = new Q);
                }
            }), 0), r();
        }
        getToken() {
            // Take note of the current value of the tokenCounter so that this method
            // can fail (with an ABORTED error) if there is a token change while the
            // request is outstanding.
            const t = this.i, e = this.forceRefresh;
            return this.forceRefresh = !1, this.auth ? this.auth.getToken(e).then((e => 
            // Cancel the request since the token changed while the request was
            // outstanding so the response is potentially for a previous user (which
            // user, we can't be sure).
            this.i !== t ? (M("FirebaseAuthCredentialsProvider", "getToken aborted due to token change."), 
            this.getToken()) : e ? (U("string" == typeof e.accessToken), new W(e.accessToken, this.currentUser)) : null)) : Promise.resolve(null);
        }
        invalidateToken() {
            this.forceRefresh = !0;
        }
        shutdown() {
            this.auth && this.auth.removeAuthTokenListener(this.o);
        }
        // Auth.getUid() can return null even with a user logged in. It is because
        // getUid() is synchronous, but the auth code populating Uid is asynchronous.
        // This method should only be called in the AuthTokenListener callback
        // to guarantee to get the actual user.
        u() {
            const t = this.auth && this.auth.getUid();
            return U(null === t || "string" == typeof t), new C(t);
        }
    }

    /*
     * FirstPartyToken provides a fresh token each time its value
     * is requested, because if the token is too old, requests will be rejected.
     * Technically this may no longer be necessary since the SDK should gracefully
     * recover from unauthenticated errors (see b/33147818 for context), but it's
     * safer to keep the implementation as-is.
     */ class Y {
        constructor(t, e, n) {
            this.type = "FirstParty", this.user = C.FIRST_PARTY, this.headers = new Map, this.headers.set("X-Goog-AuthUser", e);
            const s = t.auth.getAuthHeaderValueForFirstParty([]);
            s && this.headers.set("Authorization", s), n && this.headers.set("X-Goog-Iam-Authorization-Token", n);
        }
    }

    /*
     * Provides user credentials required for the Firestore JavaScript SDK
     * to authenticate the user, using technique that is only available
     * to applications hosted by Google.
     */ class X {
        constructor(t, e, n) {
            this.h = t, this.l = e, this.m = n;
        }
        getToken() {
            return Promise.resolve(new Y(this.h, this.l, this.m));
        }
        start(t, e) {
            // Fire with initial uid.
            t.enqueueRetryable((() => e(C.FIRST_PARTY)));
        }
        shutdown() {}
        invalidateToken() {}
    }

    class Z {
        constructor(t) {
            this.value = t, this.type = "AppCheck", this.headers = new Map, t && t.length > 0 && this.headers.set("x-firebase-appcheck", this.value);
        }
    }

    class tt {
        constructor(t) {
            this.g = t, this.forceRefresh = !1, this.appCheck = null, this.p = null;
        }
        start(t, e) {
            const n = t => {
                null != t.error && M("FirebaseAppCheckTokenProvider", `Error getting App Check token; using placeholder token instead. Error: ${t.error.message}`);
                const n = t.token !== this.p;
                return this.p = t.token, M("FirebaseAppCheckTokenProvider", `Received ${n ? "new" : "existing"} token.`), 
                n ? e(t.token) : Promise.resolve();
            };
            this.o = e => {
                t.enqueueRetryable((() => n(e)));
            };
            const s = t => {
                M("FirebaseAppCheckTokenProvider", "AppCheck detected"), this.appCheck = t, this.appCheck.addTokenListener(this.o);
            };
            this.g.onInit((t => s(t))), 
            // Our users can initialize AppCheck after Firestore, so we give it
            // a chance to register itself with the component framework.
            setTimeout((() => {
                if (!this.appCheck) {
                    const t = this.g.getImmediate({
                        optional: !0
                    });
                    t ? s(t) : 
                    // If AppCheck is still not available, proceed without it.
                    M("FirebaseAppCheckTokenProvider", "AppCheck not yet detected");
                }
            }), 0);
        }
        getToken() {
            const t = this.forceRefresh;
            return this.forceRefresh = !1, this.appCheck ? this.appCheck.getToken(t).then((t => t ? (U("string" == typeof t.token), 
            this.p = t.token, new Z(t.token)) : null)) : Promise.resolve(null);
        }
        invalidateToken() {
            this.forceRefresh = !0;
        }
        shutdown() {
            this.appCheck && this.appCheck.removeTokenListener(this.o);
        }
    }

    /**
     * Builds a CredentialsProvider depending on the type of
     * the credentials passed in.
     */
    /**
     * @license
     * Copyright 2018 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * `ListenSequence` is a monotonic sequence. It is initialized with a minimum value to
     * exceed. All subsequent calls to next will return increasing values. If provided with a
     * `SequenceNumberSyncer`, it will additionally bump its next value when told of a new value, as
     * well as write out sequence numbers that it produces via `next()`.
     */
    class nt {
        constructor(t, e) {
            this.previousValue = t, e && (e.sequenceNumberHandler = t => this.I(t), this.T = t => e.writeSequenceNumber(t));
        }
        I(t) {
            return this.previousValue = Math.max(t, this.previousValue), this.previousValue;
        }
        next() {
            const t = ++this.previousValue;
            return this.T && this.T(t), t;
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Generates `nBytes` of random bytes.
     *
     * If `nBytes < 0` , an error will be thrown.
     */
    function st(t) {
        // Polyfills for IE and WebWorker by using `self` and `msCrypto` when `crypto` is not available.
        const e = 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "undefined" != typeof self && (self.crypto || self.msCrypto), n = new Uint8Array(t);
        if (e && "function" == typeof e.getRandomValues) e.getRandomValues(n); else 
        // Falls back to Math.random
        for (let e = 0; e < t; e++) n[e] = Math.floor(256 * Math.random());
        return n;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ nt.A = -1;

    class it {
        static R() {
            // Alphanumeric characters
            const t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", e = Math.floor(256 / t.length) * t.length;
            // The largest byte value that is a multiple of `char.length`.
                    let n = "";
            for (;n.length < 20; ) {
                const s = st(40);
                for (let i = 0; i < s.length; ++i) 
                // Only accept values that are [0, maxMultiple), this ensures they can
                // be evenly mapped to indices of `chars` via a modulo operation.
                n.length < 20 && s[i] < e && (n += t.charAt(s[i] % t.length));
            }
            return n;
        }
    }

    function rt(t, e) {
        return t < e ? -1 : t > e ? 1 : 0;
    }

    /** Helper to compare arrays using isEqual(). */ function ot(t, e, n) {
        return t.length === e.length && t.every(((t, s) => n(t, e[s])));
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // The earliest date supported by Firestore timestamps (0001-01-01T00:00:00Z).
    /**
     * A `Timestamp` represents a point in time independent of any time zone or
     * calendar, represented as seconds and fractions of seconds at nanosecond
     * resolution in UTC Epoch time.
     *
     * It is encoded using the Proleptic Gregorian Calendar which extends the
     * Gregorian calendar backwards to year one. It is encoded assuming all minutes
     * are 60 seconds long, i.e. leap seconds are "smeared" so that no leap second
     * table is needed for interpretation. Range is from 0001-01-01T00:00:00Z to
     * 9999-12-31T23:59:59.999999999Z.
     *
     * For examples and further specifications, refer to the
     * {@link https://github.com/google/protobuf/blob/master/src/google/protobuf/timestamp.proto | Timestamp definition}.
     */
    class ut {
        /**
         * Creates a new timestamp.
         *
         * @param seconds - The number of seconds of UTC time since Unix epoch
         *     1970-01-01T00:00:00Z. Must be from 0001-01-01T00:00:00Z to
         *     9999-12-31T23:59:59Z inclusive.
         * @param nanoseconds - The non-negative fractions of a second at nanosecond
         *     resolution. Negative second values with fractions must still have
         *     non-negative nanoseconds values that count forward in time. Must be
         *     from 0 to 999,999,999 inclusive.
         */
        constructor(
        /**
         * The number of seconds of UTC time since Unix epoch 1970-01-01T00:00:00Z.
         */
        t, 
        /**
         * The fractions of a second at nanosecond resolution.*
         */
        e) {
            if (this.seconds = t, this.nanoseconds = e, e < 0) throw new j(G.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + e);
            if (e >= 1e9) throw new j(G.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + e);
            if (t < -62135596800) throw new j(G.INVALID_ARGUMENT, "Timestamp seconds out of range: " + t);
            // This will break in the year 10,000.
                    if (t >= 253402300800) throw new j(G.INVALID_ARGUMENT, "Timestamp seconds out of range: " + t);
        }
        /**
         * Creates a new timestamp with the current date, with millisecond precision.
         *
         * @returns a new timestamp representing the current date.
         */    static now() {
            return ut.fromMillis(Date.now());
        }
        /**
         * Creates a new timestamp from the given date.
         *
         * @param date - The date to initialize the `Timestamp` from.
         * @returns A new `Timestamp` representing the same point in time as the given
         *     date.
         */    static fromDate(t) {
            return ut.fromMillis(t.getTime());
        }
        /**
         * Creates a new timestamp from the given number of milliseconds.
         *
         * @param milliseconds - Number of milliseconds since Unix epoch
         *     1970-01-01T00:00:00Z.
         * @returns A new `Timestamp` representing the same point in time as the given
         *     number of milliseconds.
         */    static fromMillis(t) {
            const e = Math.floor(t / 1e3), n = Math.floor(1e6 * (t - 1e3 * e));
            return new ut(e, n);
        }
        /**
         * Converts a `Timestamp` to a JavaScript `Date` object. This conversion
         * causes a loss of precision since `Date` objects only support millisecond
         * precision.
         *
         * @returns JavaScript `Date` object representing the same point in time as
         *     this `Timestamp`, with millisecond precision.
         */    toDate() {
            return new Date(this.toMillis());
        }
        /**
         * Converts a `Timestamp` to a numeric timestamp (in milliseconds since
         * epoch). This operation causes a loss of precision.
         *
         * @returns The point in time corresponding to this timestamp, represented as
         *     the number of milliseconds since Unix epoch 1970-01-01T00:00:00Z.
         */    toMillis() {
            return 1e3 * this.seconds + this.nanoseconds / 1e6;
        }
        _compareTo(t) {
            return this.seconds === t.seconds ? rt(this.nanoseconds, t.nanoseconds) : rt(this.seconds, t.seconds);
        }
        /**
         * Returns true if this `Timestamp` is equal to the provided one.
         *
         * @param other - The `Timestamp` to compare against.
         * @returns true if this `Timestamp` is equal to the provided one.
         */    isEqual(t) {
            return t.seconds === this.seconds && t.nanoseconds === this.nanoseconds;
        }
        /** Returns a textual representation of this `Timestamp`. */    toString() {
            return "Timestamp(seconds=" + this.seconds + ", nanoseconds=" + this.nanoseconds + ")";
        }
        /** Returns a JSON-serializable representation of this `Timestamp`. */    toJSON() {
            return {
                seconds: this.seconds,
                nanoseconds: this.nanoseconds
            };
        }
        /**
         * Converts this object to a primitive string, which allows `Timestamp` objects
         * to be compared using the `>`, `<=`, `>=` and `>` operators.
         */    valueOf() {
            // This method returns a string of the form <seconds>.<nanoseconds> where
            // <seconds> is translated to have a non-negative value and both <seconds>
            // and <nanoseconds> are left-padded with zeroes to be a consistent length.
            // Strings with this format then have a lexiographical ordering that matches
            // the expected ordering. The <seconds> translation is done to avoid having
            // a leading negative sign (i.e. a leading '-' character) in its string
            // representation, which would affect its lexiographical ordering.
            const t = this.seconds - -62135596800;
            // Note: Up to 12 decimal digits are required to represent all valid
            // 'seconds' values.
                    return String(t).padStart(12, "0") + "." + String(this.nanoseconds).padStart(9, "0");
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A version of a document in Firestore. This corresponds to the version
     * timestamp, such as update_time or read_time.
     */ class at {
        constructor(t) {
            this.timestamp = t;
        }
        static fromTimestamp(t) {
            return new at(t);
        }
        static min() {
            return new at(new ut(0, 0));
        }
        compareTo(t) {
            return this.timestamp._compareTo(t.timestamp);
        }
        isEqual(t) {
            return this.timestamp.isEqual(t.timestamp);
        }
        /** Returns a number representation of the version for use in spec tests. */    toMicroseconds() {
            // Convert to microseconds.
            return 1e6 * this.timestamp.seconds + this.timestamp.nanoseconds / 1e3;
        }
        toString() {
            return "SnapshotVersion(" + this.timestamp.toString() + ")";
        }
        toTimestamp() {
            return this.timestamp;
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ function ht(t) {
        let e = 0;
        for (const n in t) Object.prototype.hasOwnProperty.call(t, n) && e++;
        return e;
    }

    function lt(t, e) {
        for (const n in t) Object.prototype.hasOwnProperty.call(t, n) && e(n, t[n]);
    }

    function ft(t) {
        for (const e in t) if (Object.prototype.hasOwnProperty.call(t, e)) return !1;
        return !0;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Path represents an ordered sequence of string segments.
     */
    class dt {
        constructor(t, e, n) {
            void 0 === e ? e = 0 : e > t.length && L(), void 0 === n ? n = t.length - e : n > t.length - e && L(), 
            this.segments = t, this.offset = e, this.len = n;
        }
        get length() {
            return this.len;
        }
        isEqual(t) {
            return 0 === dt.comparator(this, t);
        }
        child(t) {
            const e = this.segments.slice(this.offset, this.limit());
            return t instanceof dt ? t.forEach((t => {
                e.push(t);
            })) : e.push(t), this.construct(e);
        }
        /** The index of one past the last segment of the path. */    limit() {
            return this.offset + this.length;
        }
        popFirst(t) {
            return t = void 0 === t ? 1 : t, this.construct(this.segments, this.offset + t, this.length - t);
        }
        popLast() {
            return this.construct(this.segments, this.offset, this.length - 1);
        }
        firstSegment() {
            return this.segments[this.offset];
        }
        lastSegment() {
            return this.get(this.length - 1);
        }
        get(t) {
            return this.segments[this.offset + t];
        }
        isEmpty() {
            return 0 === this.length;
        }
        isPrefixOf(t) {
            if (t.length < this.length) return !1;
            for (let e = 0; e < this.length; e++) if (this.get(e) !== t.get(e)) return !1;
            return !0;
        }
        isImmediateParentOf(t) {
            if (this.length + 1 !== t.length) return !1;
            for (let e = 0; e < this.length; e++) if (this.get(e) !== t.get(e)) return !1;
            return !0;
        }
        forEach(t) {
            for (let e = this.offset, n = this.limit(); e < n; e++) t(this.segments[e]);
        }
        toArray() {
            return this.segments.slice(this.offset, this.limit());
        }
        static comparator(t, e) {
            const n = Math.min(t.length, e.length);
            for (let s = 0; s < n; s++) {
                const n = t.get(s), i = e.get(s);
                if (n < i) return -1;
                if (n > i) return 1;
            }
            return t.length < e.length ? -1 : t.length > e.length ? 1 : 0;
        }
    }

    /**
     * A slash-separated path for navigating resources (documents and collections)
     * within Firestore.
     *
     * @internal
     */ class _t extends dt {
        construct(t, e, n) {
            return new _t(t, e, n);
        }
        canonicalString() {
            // NOTE: The client is ignorant of any path segments containing escape
            // sequences (e.g. __id123__) and just passes them through raw (they exist
            // for legacy reasons and should not be used frequently).
            return this.toArray().join("/");
        }
        toString() {
            return this.canonicalString();
        }
        /**
         * Creates a resource path from the given slash-delimited string. If multiple
         * arguments are provided, all components are combined. Leading and trailing
         * slashes from all components are ignored.
         */    static fromString(...t) {
            // NOTE: The client is ignorant of any path segments containing escape
            // sequences (e.g. __id123__) and just passes them through raw (they exist
            // for legacy reasons and should not be used frequently).
            const e = [];
            for (const n of t) {
                if (n.indexOf("//") >= 0) throw new j(G.INVALID_ARGUMENT, `Invalid segment (${n}). Paths must not contain // in them.`);
                // Strip leading and traling slashed.
                            e.push(...n.split("/").filter((t => t.length > 0)));
            }
            return new _t(e);
        }
        static emptyPath() {
            return new _t([]);
        }
    }

    const wt = /^[_a-zA-Z][_a-zA-Z0-9]*$/;

    /**
     * A dot-separated path for navigating sub-objects within a document.
     * @internal
     */ class mt extends dt {
        construct(t, e, n) {
            return new mt(t, e, n);
        }
        /**
         * Returns true if the string could be used as a segment in a field path
         * without escaping.
         */    static isValidIdentifier(t) {
            return wt.test(t);
        }
        canonicalString() {
            return this.toArray().map((t => (t = t.replace(/\\/g, "\\\\").replace(/`/g, "\\`"), 
            mt.isValidIdentifier(t) || (t = "`" + t + "`"), t))).join(".");
        }
        toString() {
            return this.canonicalString();
        }
        /**
         * Returns true if this field references the key of a document.
         */    isKeyField() {
            return 1 === this.length && "__name__" === this.get(0);
        }
        /**
         * The field designating the key of a document.
         */    static keyField() {
            return new mt([ "__name__" ]);
        }
        /**
         * Parses a field string from the given server-formatted string.
         *
         * - Splitting the empty string is not allowed (for now at least).
         * - Empty segments within the string (e.g. if there are two consecutive
         *   separators) are not allowed.
         *
         * TODO(b/37244157): we should make this more strict. Right now, it allows
         * non-identifier path components, even if they aren't escaped.
         */    static fromServerFormat(t) {
            const e = [];
            let n = "", s = 0;
            const i = () => {
                if (0 === n.length) throw new j(G.INVALID_ARGUMENT, `Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);
                e.push(n), n = "";
            };
            let r = !1;
            for (;s < t.length; ) {
                const e = t[s];
                if ("\\" === e) {
                    if (s + 1 === t.length) throw new j(G.INVALID_ARGUMENT, "Path has trailing escape character: " + t);
                    const e = t[s + 1];
                    if ("\\" !== e && "." !== e && "`" !== e) throw new j(G.INVALID_ARGUMENT, "Path has invalid escape sequence: " + t);
                    n += e, s += 2;
                } else "`" === e ? (r = !r, s++) : "." !== e || r ? (n += e, s++) : (i(), s++);
            }
            if (i(), r) throw new j(G.INVALID_ARGUMENT, "Unterminated ` in path: " + t);
            return new mt(e);
        }
        static emptyPath() {
            return new mt([]);
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Provides a set of fields that can be used to partially patch a document.
     * FieldMask is used in conjunction with ObjectValue.
     * Examples:
     *   foo - Overwrites foo entirely with the provided value. If foo is not
     *         present in the companion ObjectValue, the field is deleted.
     *   foo.bar - Overwrites only the field bar of the object foo.
     *             If foo is not an object, foo is replaced with an object
     *             containing foo
     */ class gt {
        constructor(t) {
            this.fields = t, 
            // TODO(dimond): validation of FieldMask
            // Sort the field mask to support `FieldMask.isEqual()` and assert below.
            t.sort(mt.comparator);
        }
        /**
         * Verifies that `fieldPath` is included by at least one field in this field
         * mask.
         *
         * This is an O(n) operation, where `n` is the size of the field mask.
         */    covers(t) {
            for (const e of this.fields) if (e.isPrefixOf(t)) return !0;
            return !1;
        }
        isEqual(t) {
            return ot(this.fields, t.fields, ((t, e) => t.isEqual(e)));
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Immutable class that represents a "proto" byte string.
     *
     * Proto byte strings can either be Base64-encoded strings or Uint8Arrays when
     * sent on the wire. This class abstracts away this differentiation by holding
     * the proto byte string in a common class that must be converted into a string
     * before being sent as a proto.
     * @internal
     */ class pt {
        constructor(t) {
            this.binaryString = t;
        }
        static fromBase64String(t) {
            const e = atob(t);
            return new pt(e);
        }
        static fromUint8Array(t) {
            const e = 
            /**
     * Helper function to convert an Uint8array to a binary string.
     */
            function(t) {
                let e = "";
                for (let n = 0; n < t.length; ++n) e += String.fromCharCode(t[n]);
                return e;
            }
            /**
     * Helper function to convert a binary string to an Uint8Array.
     */ (t);
            return new pt(e);
        }
        [Symbol.iterator]() {
            let t = 0;
            return {
                next: () => t < this.binaryString.length ? {
                    value: this.binaryString.charCodeAt(t++),
                    done: !1
                } : {
                    value: void 0,
                    done: !0
                }
            };
        }
        toBase64() {
            return t = this.binaryString, btoa(t);
            /** Converts a binary string to a Base64 encoded string. */
            var t;
        }
        toUint8Array() {
            return function(t) {
                const e = new Uint8Array(t.length);
                for (let n = 0; n < t.length; n++) e[n] = t.charCodeAt(n);
                return e;
            }
            /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
            // A RegExp matching ISO 8601 UTC timestamps with optional fraction.
            (this.binaryString);
        }
        approximateByteSize() {
            return 2 * this.binaryString.length;
        }
        compareTo(t) {
            return rt(this.binaryString, t.binaryString);
        }
        isEqual(t) {
            return this.binaryString === t.binaryString;
        }
    }

    pt.EMPTY_BYTE_STRING = new pt("");

    const It = new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);

    /**
     * Converts the possible Proto values for a timestamp value into a "seconds and
     * nanos" representation.
     */ function Et(t) {
        // The json interface (for the browser) will return an iso timestamp string,
        // while the proto js library (for node) will return a
        // google.protobuf.Timestamp instance.
        if (U(!!t), "string" == typeof t) {
            // The date string can have higher precision (nanos) than the Date class
            // (millis), so we do some custom parsing here.
            // Parse the nanos right out of the string.
            let e = 0;
            const n = It.exec(t);
            if (U(!!n), n[1]) {
                // Pad the fraction out to 9 digits (nanos).
                let t = n[1];
                t = (t + "000000000").substr(0, 9), e = Number(t);
            }
            // Parse the date to get the seconds.
                    const s = new Date(t);
            return {
                seconds: Math.floor(s.getTime() / 1e3),
                nanos: e
            };
        }
        return {
            seconds: Tt(t.seconds),
            nanos: Tt(t.nanos)
        };
    }

    /**
     * Converts the possible Proto types for numbers into a JavaScript number.
     * Returns 0 if the value is not numeric.
     */ function Tt(t) {
        // TODO(bjornick): Handle int64 greater than 53 bits.
        return "number" == typeof t ? t : "string" == typeof t ? Number(t) : 0;
    }

    /** Converts the possible Proto types for Blobs into a ByteString. */ function At(t) {
        return "string" == typeof t ? pt.fromBase64String(t) : pt.fromUint8Array(t);
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Represents a locally-applied ServerTimestamp.
     *
     * Server Timestamps are backed by MapValues that contain an internal field
     * `__type__` with a value of `server_timestamp`. The previous value and local
     * write time are stored in its `__previous_value__` and `__local_write_time__`
     * fields respectively.
     *
     * Notes:
     * - ServerTimestampValue instances are created as the result of applying a
     *   transform. They can only exist in the local view of a document. Therefore
     *   they do not need to be parsed or serialized.
     * - When evaluated locally (e.g. for snapshot.data()), they by default
     *   evaluate to `null`. This behavior can be configured by passing custom
     *   FieldValueOptions to value().
     * - With respect to other ServerTimestampValues, they sort by their
     *   localWriteTime.
     */ function Rt(t) {
        var e, n;
        return "server_timestamp" === (null === (n = ((null === (e = null == t ? void 0 : t.mapValue) || void 0 === e ? void 0 : e.fields) || {}).__type__) || void 0 === n ? void 0 : n.stringValue);
    }

    /**
     * Creates a new ServerTimestamp proto value (using the internal format).
     */
    /**
     * Returns the value of the field before this ServerTimestamp was set.
     *
     * Preserving the previous values allows the user to display the last resoled
     * value until the backend responds with the timestamp.
     */
    function Pt(t) {
        const e = t.mapValue.fields.__previous_value__;
        return Rt(e) ? Pt(e) : e;
    }

    /**
     * Returns the local time at which this timestamp was first set.
     */ function bt(t) {
        const e = Et(t.mapValue.fields.__local_write_time__.timestampValue);
        return new ut(e.seconds, e.nanos);
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class vt {
        /**
         * Constructs a DatabaseInfo using the provided host, databaseId and
         * persistenceKey.
         *
         * @param databaseId - The database to use.
         * @param appId - The Firebase App Id.
         * @param persistenceKey - A unique identifier for this Firestore's local
         * storage (used in conjunction with the databaseId).
         * @param host - The Firestore backend host to connect to.
         * @param ssl - Whether to use SSL when connecting.
         * @param forceLongPolling - Whether to use the forceLongPolling option
         * when using WebChannel as the network transport.
         * @param autoDetectLongPolling - Whether to use the detectBufferingProxy
         * option when using WebChannel as the network transport.
         * @param useFetchStreams Whether to use the Fetch API instead of
         * XMLHTTPRequest
         */
        constructor(t, e, n, s, i, r, o, c) {
            this.databaseId = t, this.appId = e, this.persistenceKey = n, this.host = s, this.ssl = i, 
            this.forceLongPolling = r, this.autoDetectLongPolling = o, this.useFetchStreams = c;
        }
    }

    /** The default database name for a project. */
    /**
     * Represents the database ID a Firestore client is associated with.
     * @internal
     */
    class Vt {
        constructor(t, e) {
            this.projectId = t, this.database = e || "(default)";
        }
        static empty() {
            return new Vt("", "");
        }
        get isDefaultDatabase() {
            return "(default)" === this.database;
        }
        isEqual(t) {
            return t instanceof Vt && t.projectId === this.projectId && t.database === this.database;
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /** Sentinel value that sorts before any Mutation Batch ID. */
    /**
     * Returns whether a variable is either undefined or null.
     */
    function St(t) {
        return null == t;
    }

    /** Returns whether the value represents -0. */ function Dt(t) {
        // Detect if the value is -0.0. Based on polyfill from
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
        return 0 === t && 1 / t == -1 / 0;
    }

    /**
     * Returns whether a value is an integer and in the safe integer range
     * @param value - The value to test for being an integer and in the safe range
     */ function Ct(t) {
        return "number" == typeof t && Number.isInteger(t) && !Dt(t) && t <= Number.MAX_SAFE_INTEGER && t >= Number.MIN_SAFE_INTEGER;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * @internal
     */ class Nt {
        constructor(t) {
            this.path = t;
        }
        static fromPath(t) {
            return new Nt(_t.fromString(t));
        }
        static fromName(t) {
            return new Nt(_t.fromString(t).popFirst(5));
        }
        static empty() {
            return new Nt(_t.emptyPath());
        }
        get collectionGroup() {
            return this.path.popLast().lastSegment();
        }
        /** Returns true if the document is in the specified collectionId. */    hasCollectionId(t) {
            return this.path.length >= 2 && this.path.get(this.path.length - 2) === t;
        }
        /** Returns the collection group (i.e. the name of the parent collection) for this key. */    getCollectionGroup() {
            return this.path.get(this.path.length - 2);
        }
        /** Returns the fully qualified path to the parent collection. */    getCollectionPath() {
            return this.path.popLast();
        }
        isEqual(t) {
            return null !== t && 0 === _t.comparator(this.path, t.path);
        }
        toString() {
            return this.path.toString();
        }
        static comparator(t, e) {
            return _t.comparator(t.path, e.path);
        }
        static isDocumentKey(t) {
            return t.length % 2 == 0;
        }
        /**
         * Creates and returns a new document key with the given segments.
         *
         * @param segments - The segments of the path to the document
         * @returns A new instance of DocumentKey
         */    static fromSegments(t) {
            return new Nt(new _t(t.slice()));
        }
    }

    /** Extracts the backend's type order for the provided value. */ function kt(t) {
        return "nullValue" in t ? 0 /* NullValue */ : "booleanValue" in t ? 1 /* BooleanValue */ : "integerValue" in t || "doubleValue" in t ? 2 /* NumberValue */ : "timestampValue" in t ? 3 /* TimestampValue */ : "stringValue" in t ? 5 /* StringValue */ : "bytesValue" in t ? 6 /* BlobValue */ : "referenceValue" in t ? 7 /* RefValue */ : "geoPointValue" in t ? 8 /* GeoPointValue */ : "arrayValue" in t ? 9 /* ArrayValue */ : "mapValue" in t ? Rt(t) ? 4 /* ServerTimestampValue */ : 10 /* ObjectValue */ : L();
    }

    /** Tests `left` and `right` for equality based on the backend semantics. */ function Ot(t, e) {
        if (t === e) return !0;
        const n = kt(t);
        if (n !== kt(e)) return !1;
        switch (n) {
          case 0 /* NullValue */ :
            return !0;

          case 1 /* BooleanValue */ :
            return t.booleanValue === e.booleanValue;

          case 4 /* ServerTimestampValue */ :
            return bt(t).isEqual(bt(e));

          case 3 /* TimestampValue */ :
            return function(t, e) {
                if ("string" == typeof t.timestampValue && "string" == typeof e.timestampValue && t.timestampValue.length === e.timestampValue.length) 
                // Use string equality for ISO 8601 timestamps
                return t.timestampValue === e.timestampValue;
                const n = Et(t.timestampValue), s = Et(e.timestampValue);
                return n.seconds === s.seconds && n.nanos === s.nanos;
            }(t, e);

          case 5 /* StringValue */ :
            return t.stringValue === e.stringValue;

          case 6 /* BlobValue */ :
            return function(t, e) {
                return At(t.bytesValue).isEqual(At(e.bytesValue));
            }(t, e);

          case 7 /* RefValue */ :
            return t.referenceValue === e.referenceValue;

          case 8 /* GeoPointValue */ :
            return function(t, e) {
                return Tt(t.geoPointValue.latitude) === Tt(e.geoPointValue.latitude) && Tt(t.geoPointValue.longitude) === Tt(e.geoPointValue.longitude);
            }(t, e);

          case 2 /* NumberValue */ :
            return function(t, e) {
                if ("integerValue" in t && "integerValue" in e) return Tt(t.integerValue) === Tt(e.integerValue);
                if ("doubleValue" in t && "doubleValue" in e) {
                    const n = Tt(t.doubleValue), s = Tt(e.doubleValue);
                    return n === s ? Dt(n) === Dt(s) : isNaN(n) && isNaN(s);
                }
                return !1;
            }(t, e);

          case 9 /* ArrayValue */ :
            return ot(t.arrayValue.values || [], e.arrayValue.values || [], Ot);

          case 10 /* ObjectValue */ :
            return function(t, e) {
                const n = t.mapValue.fields || {}, s = e.mapValue.fields || {};
                if (ht(n) !== ht(s)) return !1;
                for (const t in n) if (n.hasOwnProperty(t) && (void 0 === s[t] || !Ot(n[t], s[t]))) return !1;
                return !0;
            }
            /** Returns true if the ArrayValue contains the specified element. */ (t, e);

          default:
            return L();
        }
    }

    function Mt(t, e) {
        return void 0 !== (t.values || []).find((t => Ot(t, e)));
    }

    function $t(t, e) {
        if (t === e) return 0;
        const n = kt(t), s = kt(e);
        if (n !== s) return rt(n, s);
        switch (n) {
          case 0 /* NullValue */ :
            return 0;

          case 1 /* BooleanValue */ :
            return rt(t.booleanValue, e.booleanValue);

          case 2 /* NumberValue */ :
            return function(t, e) {
                const n = Tt(t.integerValue || t.doubleValue), s = Tt(e.integerValue || e.doubleValue);
                return n < s ? -1 : n > s ? 1 : n === s ? 0 : 
                // one or both are NaN.
                isNaN(n) ? isNaN(s) ? 0 : -1 : 1;
            }(t, e);

          case 3 /* TimestampValue */ :
            return Ft(t.timestampValue, e.timestampValue);

          case 4 /* ServerTimestampValue */ :
            return Ft(bt(t), bt(e));

          case 5 /* StringValue */ :
            return rt(t.stringValue, e.stringValue);

          case 6 /* BlobValue */ :
            return function(t, e) {
                const n = At(t), s = At(e);
                return n.compareTo(s);
            }(t.bytesValue, e.bytesValue);

          case 7 /* RefValue */ :
            return function(t, e) {
                const n = t.split("/"), s = e.split("/");
                for (let t = 0; t < n.length && t < s.length; t++) {
                    const e = rt(n[t], s[t]);
                    if (0 !== e) return e;
                }
                return rt(n.length, s.length);
            }(t.referenceValue, e.referenceValue);

          case 8 /* GeoPointValue */ :
            return function(t, e) {
                const n = rt(Tt(t.latitude), Tt(e.latitude));
                if (0 !== n) return n;
                return rt(Tt(t.longitude), Tt(e.longitude));
            }(t.geoPointValue, e.geoPointValue);

          case 9 /* ArrayValue */ :
            return function(t, e) {
                const n = t.values || [], s = e.values || [];
                for (let t = 0; t < n.length && t < s.length; ++t) {
                    const e = $t(n[t], s[t]);
                    if (e) return e;
                }
                return rt(n.length, s.length);
            }(t.arrayValue, e.arrayValue);

          case 10 /* ObjectValue */ :
            return function(t, e) {
                const n = t.fields || {}, s = Object.keys(n), i = e.fields || {}, r = Object.keys(i);
                // Even though MapValues are likely sorted correctly based on their insertion
                // order (e.g. when received from the backend), local modifications can bring
                // elements out of order. We need to re-sort the elements to ensure that
                // canonical IDs are independent of insertion order.
                s.sort(), r.sort();
                for (let t = 0; t < s.length && t < r.length; ++t) {
                    const e = rt(s[t], r[t]);
                    if (0 !== e) return e;
                    const o = $t(n[s[t]], i[r[t]]);
                    if (0 !== o) return o;
                }
                return rt(s.length, r.length);
            }
            /**
     * Generates the canonical ID for the provided field value (as used in Target
     * serialization).
     */ (t.mapValue, e.mapValue);

          default:
            throw L();
        }
    }

    function Ft(t, e) {
        if ("string" == typeof t && "string" == typeof e && t.length === e.length) return rt(t, e);
        const n = Et(t), s = Et(e), i = rt(n.seconds, s.seconds);
        return 0 !== i ? i : rt(n.nanos, s.nanos);
    }

    function Bt(t) {
        return Lt(t);
    }

    function Lt(t) {
        return "nullValue" in t ? "null" : "booleanValue" in t ? "" + t.booleanValue : "integerValue" in t ? "" + t.integerValue : "doubleValue" in t ? "" + t.doubleValue : "timestampValue" in t ? function(t) {
            const e = Et(t);
            return `time(${e.seconds},${e.nanos})`;
        }(t.timestampValue) : "stringValue" in t ? t.stringValue : "bytesValue" in t ? At(t.bytesValue).toBase64() : "referenceValue" in t ? (n = t.referenceValue, 
        Nt.fromName(n).toString()) : "geoPointValue" in t ? `geo(${(e = t.geoPointValue).latitude},${e.longitude})` : "arrayValue" in t ? function(t) {
            let e = "[", n = !0;
            for (const s of t.values || []) n ? n = !1 : e += ",", e += Lt(s);
            return e + "]";
        }
        /** Returns a reference value for the provided database and key. */ (t.arrayValue) : "mapValue" in t ? function(t) {
            // Iteration order in JavaScript is not guaranteed. To ensure that we generate
            // matching canonical IDs for identical maps, we need to sort the keys.
            const e = Object.keys(t.fields || {}).sort();
            let n = "{", s = !0;
            for (const i of e) s ? s = !1 : n += ",", n += `${i}:${Lt(t.fields[i])}`;
            return n + "}";
        }(t.mapValue) : L();
        var e, n;
    }

    function Ut(t, e) {
        return {
            referenceValue: `projects/${t.projectId}/databases/${t.database}/documents/${e.path.canonicalString()}`
        };
    }

    /** Returns true if `value` is an IntegerValue . */ function qt(t) {
        return !!t && "integerValue" in t;
    }

    /** Returns true if `value` is a DoubleValue. */
    /** Returns true if `value` is an ArrayValue. */
    function Kt(t) {
        return !!t && "arrayValue" in t;
    }

    /** Returns true if `value` is a NullValue. */ function Gt(t) {
        return !!t && "nullValue" in t;
    }

    /** Returns true if `value` is NaN. */ function jt(t) {
        return !!t && "doubleValue" in t && isNaN(Number(t.doubleValue));
    }

    /** Returns true if `value` is a MapValue. */ function Qt(t) {
        return !!t && "mapValue" in t;
    }

    /** Creates a deep copy of `source`. */ function Wt(t) {
        if (t.geoPointValue) return {
            geoPointValue: Object.assign({}, t.geoPointValue)
        };
        if (t.timestampValue && "object" == typeof t.timestampValue) return {
            timestampValue: Object.assign({}, t.timestampValue)
        };
        if (t.mapValue) {
            const e = {
                mapValue: {
                    fields: {}
                }
            };
            return lt(t.mapValue.fields, ((t, n) => e.mapValue.fields[t] = Wt(n))), e;
        }
        if (t.arrayValue) {
            const e = {
                arrayValue: {
                    values: []
                }
            };
            for (let n = 0; n < (t.arrayValue.values || []).length; ++n) e.arrayValue.values[n] = Wt(t.arrayValue.values[n]);
            return e;
        }
        return Object.assign({}, t);
    }

    /** Returns true if the Value represents the canonical {@link #MAX_VALUE} . */
    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * An ObjectValue represents a MapValue in the Firestore Proto and offers the
     * ability to add and remove fields (via the ObjectValueBuilder).
     */
    class zt {
        constructor(t) {
            this.value = t;
        }
        static empty() {
            return new zt({
                mapValue: {}
            });
        }
        /**
         * Returns the value at the given path or null.
         *
         * @param path - the path to search
         * @returns The value at the path or null if the path is not set.
         */    field(t) {
            if (t.isEmpty()) return this.value;
            {
                let e = this.value;
                for (let n = 0; n < t.length - 1; ++n) if (e = (e.mapValue.fields || {})[t.get(n)], 
                !Qt(e)) return null;
                return e = (e.mapValue.fields || {})[t.lastSegment()], e || null;
            }
        }
        /**
         * Sets the field to the provided value.
         *
         * @param path - The field path to set.
         * @param value - The value to set.
         */    set(t, e) {
            this.getFieldsMap(t.popLast())[t.lastSegment()] = Wt(e);
        }
        /**
         * Sets the provided fields to the provided values.
         *
         * @param data - A map of fields to values (or null for deletes).
         */    setAll(t) {
            let e = mt.emptyPath(), n = {}, s = [];
            t.forEach(((t, i) => {
                if (!e.isImmediateParentOf(i)) {
                    // Insert the accumulated changes at this parent location
                    const t = this.getFieldsMap(e);
                    this.applyChanges(t, n, s), n = {}, s = [], e = i.popLast();
                }
                t ? n[i.lastSegment()] = Wt(t) : s.push(i.lastSegment());
            }));
            const i = this.getFieldsMap(e);
            this.applyChanges(i, n, s);
        }
        /**
         * Removes the field at the specified path. If there is no field at the
         * specified path, nothing is changed.
         *
         * @param path - The field path to remove.
         */    delete(t) {
            const e = this.field(t.popLast());
            Qt(e) && e.mapValue.fields && delete e.mapValue.fields[t.lastSegment()];
        }
        isEqual(t) {
            return Ot(this.value, t.value);
        }
        /**
         * Returns the map that contains the leaf element of `path`. If the parent
         * entry does not yet exist, or if it is not a map, a new map will be created.
         */    getFieldsMap(t) {
            let e = this.value;
            e.mapValue.fields || (e.mapValue = {
                fields: {}
            });
            for (let n = 0; n < t.length; ++n) {
                let s = e.mapValue.fields[t.get(n)];
                Qt(s) && s.mapValue.fields || (s = {
                    mapValue: {
                        fields: {}
                    }
                }, e.mapValue.fields[t.get(n)] = s), e = s;
            }
            return e.mapValue.fields;
        }
        /**
         * Modifies `fieldsMap` by adding, replacing or deleting the specified
         * entries.
         */    applyChanges(t, e, n) {
            lt(e, ((e, n) => t[e] = n));
            for (const e of n) delete t[e];
        }
        clone() {
            return new zt(Wt(this.value));
        }
    }

    /**
     * Returns a FieldMask built from all fields in a MapValue.
     */ function Ht(t) {
        const e = [];
        return lt(t.fields, ((t, n) => {
            const s = new mt([ t ]);
            if (Qt(n)) {
                const t = Ht(n.mapValue).fields;
                if (0 === t.length) 
                // Preserve the empty map by adding it to the FieldMask.
                e.push(s); else 
                // For nested and non-empty ObjectValues, add the FieldPath of the
                // leaf nodes.
                for (const n of t) e.push(s.child(n));
            } else 
            // For nested and non-empty ObjectValues, add the FieldPath of the leaf
            // nodes.
            e.push(s);
        })), new gt(e);
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Represents a document in Firestore with a key, version, data and whether it
     * has local mutations applied to it.
     *
     * Documents can transition between states via `convertToFoundDocument()`,
     * `convertToNoDocument()` and `convertToUnknownDocument()`. If a document does
     * not transition to one of these states even after all mutations have been
     * applied, `isValidDocument()` returns false and the document should be removed
     * from all views.
     */ class Jt {
        constructor(t, e, n, s, i, r) {
            this.key = t, this.documentType = e, this.version = n, this.readTime = s, this.data = i, 
            this.documentState = r;
        }
        /**
         * Creates a document with no known version or data, but which can serve as
         * base document for mutations.
         */    static newInvalidDocument(t) {
            return new Jt(t, 0 /* INVALID */ , at.min(), at.min(), zt.empty(), 0 /* SYNCED */);
        }
        /**
         * Creates a new document that is known to exist with the given data at the
         * given version.
         */    static newFoundDocument(t, e, n) {
            return new Jt(t, 1 /* FOUND_DOCUMENT */ , e, at.min(), n, 0 /* SYNCED */);
        }
        /** Creates a new document that is known to not exist at the given version. */    static newNoDocument(t, e) {
            return new Jt(t, 2 /* NO_DOCUMENT */ , e, at.min(), zt.empty(), 0 /* SYNCED */);
        }
        /**
         * Creates a new document that is known to exist at the given version but
         * whose data is not known (e.g. a document that was updated without a known
         * base document).
         */    static newUnknownDocument(t, e) {
            return new Jt(t, 3 /* UNKNOWN_DOCUMENT */ , e, at.min(), zt.empty(), 2 /* HAS_COMMITTED_MUTATIONS */);
        }
        /**
         * Changes the document type to indicate that it exists and that its version
         * and data are known.
         */    convertToFoundDocument(t, e) {
            return this.version = t, this.documentType = 1 /* FOUND_DOCUMENT */ , this.data = e, 
            this.documentState = 0 /* SYNCED */ , this;
        }
        /**
         * Changes the document type to indicate that it doesn't exist at the given
         * version.
         */    convertToNoDocument(t) {
            return this.version = t, this.documentType = 2 /* NO_DOCUMENT */ , this.data = zt.empty(), 
            this.documentState = 0 /* SYNCED */ , this;
        }
        /**
         * Changes the document type to indicate that it exists at a given version but
         * that its data is not known (e.g. a document that was updated without a known
         * base document).
         */    convertToUnknownDocument(t) {
            return this.version = t, this.documentType = 3 /* UNKNOWN_DOCUMENT */ , this.data = zt.empty(), 
            this.documentState = 2 /* HAS_COMMITTED_MUTATIONS */ , this;
        }
        setHasCommittedMutations() {
            return this.documentState = 2 /* HAS_COMMITTED_MUTATIONS */ , this;
        }
        setHasLocalMutations() {
            return this.documentState = 1 /* HAS_LOCAL_MUTATIONS */ , this;
        }
        setReadTime(t) {
            return this.readTime = t, this;
        }
        get hasLocalMutations() {
            return 1 /* HAS_LOCAL_MUTATIONS */ === this.documentState;
        }
        get hasCommittedMutations() {
            return 2 /* HAS_COMMITTED_MUTATIONS */ === this.documentState;
        }
        get hasPendingWrites() {
            return this.hasLocalMutations || this.hasCommittedMutations;
        }
        isValidDocument() {
            return 0 /* INVALID */ !== this.documentType;
        }
        isFoundDocument() {
            return 1 /* FOUND_DOCUMENT */ === this.documentType;
        }
        isNoDocument() {
            return 2 /* NO_DOCUMENT */ === this.documentType;
        }
        isUnknownDocument() {
            return 3 /* UNKNOWN_DOCUMENT */ === this.documentType;
        }
        isEqual(t) {
            return t instanceof Jt && this.key.isEqual(t.key) && this.version.isEqual(t.version) && this.documentType === t.documentType && this.documentState === t.documentState && this.data.isEqual(t.data);
        }
        mutableCopy() {
            return new Jt(this.key, this.documentType, this.version, this.readTime, this.data.clone(), this.documentState);
        }
        toString() {
            return `Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`;
        }
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // Visible for testing
    class ee {
        constructor(t, e = null, n = [], s = [], i = null, r = null, o = null) {
            this.path = t, this.collectionGroup = e, this.orderBy = n, this.filters = s, this.limit = i, 
            this.startAt = r, this.endAt = o, this.P = null;
        }
    }

    /**
     * Initializes a Target with a path and optional additional query constraints.
     * Path must currently be empty if this is a collection group query.
     *
     * NOTE: you should always construct `Target` from `Query.toTarget` instead of
     * using this factory method, because `Query` provides an implicit `orderBy`
     * property.
     */ function ne(t, e = null, n = [], s = [], i = null, r = null, o = null) {
        return new ee(t, e, n, s, i, r, o);
    }

    function se(t) {
        const e = K(t);
        if (null === e.P) {
            let t = e.path.canonicalString();
            null !== e.collectionGroup && (t += "|cg:" + e.collectionGroup), t += "|f:", t += e.filters.map((t => {
                return (e = t).field.canonicalString() + e.op.toString() + Bt(e.value);
                var e;
            })).join(","), t += "|ob:", t += e.orderBy.map((t => function(t) {
                // TODO(b/29183165): Make this collision robust.
                return t.field.canonicalString() + t.dir;
            }(t))).join(","), St(e.limit) || (t += "|l:", t += e.limit), e.startAt && (t += "|lb:", 
            t += e.startAt.inclusive ? "b:" : "a:", t += e.startAt.position.map((t => Bt(t))).join(",")), 
            e.endAt && (t += "|ub:", t += e.endAt.inclusive ? "a:" : "b:", t += e.endAt.position.map((t => Bt(t))).join(",")), 
            e.P = t;
        }
        return e.P;
    }

    function ie(t) {
        let e = t.path.canonicalString();
        return null !== t.collectionGroup && (e += " collectionGroup=" + t.collectionGroup), 
        t.filters.length > 0 && (e += `, filters: [${t.filters.map((t => {
        return `${(e = t).field.canonicalString()} ${e.op} ${Bt(e.value)}`;
        /** Returns a debug description for `filter`. */
        var e;
        /** Filter that matches on key fields (i.e. '__name__'). */    })).join(", ")}]`), 
        St(t.limit) || (e += ", limit: " + t.limit), t.orderBy.length > 0 && (e += `, orderBy: [${t.orderBy.map((t => function(t) {
        return `${t.field.canonicalString()} (${t.dir})`;
    }(t))).join(", ")}]`), t.startAt && (e += ", startAt: ", e += t.startAt.inclusive ? "b:" : "a:", 
        e += t.startAt.position.map((t => Bt(t))).join(",")), t.endAt && (e += ", endAt: ", 
        e += t.endAt.inclusive ? "a:" : "b:", e += t.endAt.position.map((t => Bt(t))).join(",")), 
        `Target(${e})`;
    }

    function re(t, e) {
        if (t.limit !== e.limit) return !1;
        if (t.orderBy.length !== e.orderBy.length) return !1;
        for (let n = 0; n < t.orderBy.length; n++) if (!ye(t.orderBy[n], e.orderBy[n])) return !1;
        if (t.filters.length !== e.filters.length) return !1;
        for (let i = 0; i < t.filters.length; i++) if (n = t.filters[i], s = e.filters[i], 
        n.op !== s.op || !n.field.isEqual(s.field) || !Ot(n.value, s.value)) return !1;
        var n, s;
        return t.collectionGroup === e.collectionGroup && (!!t.path.isEqual(e.path) && (!!Ie(t.startAt, e.startAt) && Ie(t.endAt, e.endAt)));
    }

    function oe(t) {
        return Nt.isDocumentKey(t.path) && null === t.collectionGroup && 0 === t.filters.length;
    }

    class ce extends class {} {
        constructor(t, e, n) {
            super(), this.field = t, this.op = e, this.value = n;
        }
        /**
         * Creates a filter based on the provided arguments.
         */    static create(t, e, n) {
            return t.isKeyField() ? "in" /* IN */ === e || "not-in" /* NOT_IN */ === e ? this.v(t, e, n) : new ue(t, e, n) : "array-contains" /* ARRAY_CONTAINS */ === e ? new fe(t, n) : "in" /* IN */ === e ? new de(t, n) : "not-in" /* NOT_IN */ === e ? new _e(t, n) : "array-contains-any" /* ARRAY_CONTAINS_ANY */ === e ? new we(t, n) : new ce(t, e, n);
        }
        static v(t, e, n) {
            return "in" /* IN */ === e ? new ae(t, n) : new he(t, n);
        }
        matches(t) {
            const e = t.data.field(this.field);
            // Types do not have to match in NOT_EQUAL filters.
                    return "!=" /* NOT_EQUAL */ === this.op ? null !== e && this.V($t(e, this.value)) : null !== e && kt(this.value) === kt(e) && this.V($t(e, this.value));
            // Only compare types with matching backend order (such as double and int).
            }
        V(t) {
            switch (this.op) {
              case "<" /* LESS_THAN */ :
                return t < 0;

              case "<=" /* LESS_THAN_OR_EQUAL */ :
                return t <= 0;

              case "==" /* EQUAL */ :
                return 0 === t;

              case "!=" /* NOT_EQUAL */ :
                return 0 !== t;

              case ">" /* GREATER_THAN */ :
                return t > 0;

              case ">=" /* GREATER_THAN_OR_EQUAL */ :
                return t >= 0;

              default:
                return L();
            }
        }
        S() {
            return [ "<" /* LESS_THAN */ , "<=" /* LESS_THAN_OR_EQUAL */ , ">" /* GREATER_THAN */ , ">=" /* GREATER_THAN_OR_EQUAL */ , "!=" /* NOT_EQUAL */ , "not-in" /* NOT_IN */ ].indexOf(this.op) >= 0;
        }
    }

    class ue extends ce {
        constructor(t, e, n) {
            super(t, e, n), this.key = Nt.fromName(n.referenceValue);
        }
        matches(t) {
            const e = Nt.comparator(t.key, this.key);
            return this.V(e);
        }
    }

    /** Filter that matches on key fields within an array. */ class ae extends ce {
        constructor(t, e) {
            super(t, "in" /* IN */ , e), this.keys = le("in" /* IN */ , e);
        }
        matches(t) {
            return this.keys.some((e => e.isEqual(t.key)));
        }
    }

    /** Filter that matches on key fields not present within an array. */ class he extends ce {
        constructor(t, e) {
            super(t, "not-in" /* NOT_IN */ , e), this.keys = le("not-in" /* NOT_IN */ , e);
        }
        matches(t) {
            return !this.keys.some((e => e.isEqual(t.key)));
        }
    }

    function le(t, e) {
        var n;
        return ((null === (n = e.arrayValue) || void 0 === n ? void 0 : n.values) || []).map((t => Nt.fromName(t.referenceValue)));
    }

    /** A Filter that implements the array-contains operator. */ class fe extends ce {
        constructor(t, e) {
            super(t, "array-contains" /* ARRAY_CONTAINS */ , e);
        }
        matches(t) {
            const e = t.data.field(this.field);
            return Kt(e) && Mt(e.arrayValue, this.value);
        }
    }

    /** A Filter that implements the IN operator. */ class de extends ce {
        constructor(t, e) {
            super(t, "in" /* IN */ , e);
        }
        matches(t) {
            const e = t.data.field(this.field);
            return null !== e && Mt(this.value.arrayValue, e);
        }
    }

    /** A Filter that implements the not-in operator. */ class _e extends ce {
        constructor(t, e) {
            super(t, "not-in" /* NOT_IN */ , e);
        }
        matches(t) {
            if (Mt(this.value.arrayValue, {
                nullValue: "NULL_VALUE"
            })) return !1;
            const e = t.data.field(this.field);
            return null !== e && !Mt(this.value.arrayValue, e);
        }
    }

    /** A Filter that implements the array-contains-any operator. */ class we extends ce {
        constructor(t, e) {
            super(t, "array-contains-any" /* ARRAY_CONTAINS_ANY */ , e);
        }
        matches(t) {
            const e = t.data.field(this.field);
            return !(!Kt(e) || !e.arrayValue.values) && e.arrayValue.values.some((t => Mt(this.value.arrayValue, t)));
        }
    }

    /**
     * Represents a bound of a query.
     *
     * The bound is specified with the given components representing a position and
     * whether it's just before or just after the position (relative to whatever the
     * query order is).
     *
     * The position represents a logical index position for a query. It's a prefix
     * of values for the (potentially implicit) order by clauses of a query.
     *
     * Bound provides a function to determine whether a document comes before or
     * after a bound. This is influenced by whether the position is just before or
     * just after the provided values.
     */ class me {
        constructor(t, e) {
            this.position = t, this.inclusive = e;
        }
    }

    /**
     * An ordering on a field, in some Direction. Direction defaults to ASCENDING.
     */ class ge {
        constructor(t, e = "asc" /* ASCENDING */) {
            this.field = t, this.dir = e;
        }
    }

    function ye(t, e) {
        return t.dir === e.dir && t.field.isEqual(e.field);
    }

    function pe(t, e, n) {
        let s = 0;
        for (let i = 0; i < t.position.length; i++) {
            const r = e[i], o = t.position[i];
            if (r.field.isKeyField()) s = Nt.comparator(Nt.fromName(o.referenceValue), n.key); else {
                s = $t(o, n.data.field(r.field));
            }
            if ("desc" /* DESCENDING */ === r.dir && (s *= -1), 0 !== s) break;
        }
        return s;
    }

    /**
     * Returns true if a document sorts after a bound using the provided sort
     * order.
     */ function Ie(t, e) {
        if (null === t) return null === e;
        if (null === e) return !1;
        if (t.inclusive !== e.inclusive || t.position.length !== e.position.length) return !1;
        for (let n = 0; n < t.position.length; n++) {
            if (!Ot(t.position[n], e.position[n])) return !1;
        }
        return !0;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Query encapsulates all the query attributes we support in the SDK. It can
     * be run against the LocalStore, as well as be converted to a `Target` to
     * query the RemoteStore results.
     *
     * Visible for testing.
     */ class Ee {
        /**
         * Initializes a Query with a path and optional additional query constraints.
         * Path must currently be empty if this is a collection group query.
         */
        constructor(t, e = null, n = [], s = [], i = null, r = "F" /* First */ , o = null, c = null) {
            this.path = t, this.collectionGroup = e, this.explicitOrderBy = n, this.filters = s, 
            this.limit = i, this.limitType = r, this.startAt = o, this.endAt = c, this.D = null, 
            // The corresponding `Target` of this `Query` instance.
            this.C = null, this.startAt, this.endAt;
        }
    }

    /** Creates a new Query instance with the options provided. */ function Te(t, e, n, s, i, r, o, c) {
        return new Ee(t, e, n, s, i, r, o, c);
    }

    /** Creates a new Query for a query that matches all documents at `path` */ function Ae(t) {
        return new Ee(t);
    }

    /**
     * Helper to convert a collection group query into a collection query at a
     * specific path. This is used when executing collection group queries, since
     * we have to split the query into a set of collection queries at multiple
     * paths.
     */ function Re(t) {
        return !St(t.limit) && "F" /* First */ === t.limitType;
    }

    function Pe(t) {
        return !St(t.limit) && "L" /* Last */ === t.limitType;
    }

    function be(t) {
        return t.explicitOrderBy.length > 0 ? t.explicitOrderBy[0].field : null;
    }

    function ve(t) {
        for (const e of t.filters) if (e.S()) return e.field;
        return null;
    }

    /**
     * Checks if any of the provided Operators are included in the query and
     * returns the first one that is, or null if none are.
     */
    /**
     * Returns whether the query matches a collection group rather than a specific
     * collection.
     */
    function Ve(t) {
        return null !== t.collectionGroup;
    }

    /**
     * Returns the implicit order by constraint that is used to execute the Query,
     * which can be different from the order by constraints the user provided (e.g.
     * the SDK and backend always orders by `__name__`).
     */ function Se(t) {
        const e = K(t);
        if (null === e.D) {
            e.D = [];
            const t = ve(e), n = be(e);
            if (null !== t && null === n) 
            // In order to implicitly add key ordering, we must also add the
            // inequality filter field for it to be a valid query.
            // Note that the default inequality field and key ordering is ascending.
            t.isKeyField() || e.D.push(new ge(t)), e.D.push(new ge(mt.keyField(), "asc" /* ASCENDING */)); else {
                let t = !1;
                for (const n of e.explicitOrderBy) e.D.push(n), n.field.isKeyField() && (t = !0);
                if (!t) {
                    // The order of the implicit key ordering always matches the last
                    // explicit order by
                    const t = e.explicitOrderBy.length > 0 ? e.explicitOrderBy[e.explicitOrderBy.length - 1].dir : "asc" /* ASCENDING */;
                    e.D.push(new ge(mt.keyField(), t));
                }
            }
        }
        return e.D;
    }

    /**
     * Converts this `Query` instance to it's corresponding `Target` representation.
     */ function De(t) {
        const e = K(t);
        if (!e.C) if ("F" /* First */ === e.limitType) e.C = ne(e.path, e.collectionGroup, Se(e), e.filters, e.limit, e.startAt, e.endAt); else {
            // Flip the orderBy directions since we want the last results
            const t = [];
            for (const n of Se(e)) {
                const e = "desc" /* DESCENDING */ === n.dir ? "asc" /* ASCENDING */ : "desc" /* DESCENDING */;
                t.push(new ge(n.field, e));
            }
            // We need to swap the cursors to match the now-flipped query ordering.
                    const n = e.endAt ? new me(e.endAt.position, !e.endAt.inclusive) : null, s = e.startAt ? new me(e.startAt.position, !e.startAt.inclusive) : null;
            // Now return as a LimitType.First query.
            e.C = ne(e.path, e.collectionGroup, t, e.filters, e.limit, n, s);
        }
        return e.C;
    }

    function Ce(t, e, n) {
        return new Ee(t.path, t.collectionGroup, t.explicitOrderBy.slice(), t.filters.slice(), e, n, t.startAt, t.endAt);
    }

    function Ne(t, e) {
        return re(De(t), De(e)) && t.limitType === e.limitType;
    }

    // TODO(b/29183165): This is used to get a unique string from a query to, for
    // example, use as a dictionary key, but the implementation is subject to
    // collisions. Make it collision-free.
    function xe(t) {
        return `${se(De(t))}|lt:${t.limitType}`;
    }

    function ke(t) {
        return `Query(target=${ie(De(t))}; limitType=${t.limitType})`;
    }

    /** Returns whether `doc` matches the constraints of `query`. */ function Oe(t, e) {
        return e.isFoundDocument() && function(t, e) {
            const n = e.key.path;
            return null !== t.collectionGroup ? e.key.hasCollectionId(t.collectionGroup) && t.path.isPrefixOf(n) : Nt.isDocumentKey(t.path) ? t.path.isEqual(n) : t.path.isImmediateParentOf(n);
        }
        /**
     * A document must have a value for every ordering clause in order to show up
     * in the results.
     */ (t, e) && function(t, e) {
            for (const n of t.explicitOrderBy) 
            // order by key always matches
            if (!n.field.isKeyField() && null === e.data.field(n.field)) return !1;
            return !0;
        }(t, e) && function(t, e) {
            for (const n of t.filters) if (!n.matches(e)) return !1;
            return !0;
        }
        /** Makes sure a document is within the bounds, if provided. */ (t, e) && function(t, e) {
            if (t.startAt && !
            /**
     * Returns true if a document sorts before a bound using the provided sort
     * order.
     */
            function(t, e, n) {
                const s = pe(t, e, n);
                return t.inclusive ? s <= 0 : s < 0;
            }(t.startAt, Se(t), e)) return !1;
            if (t.endAt && !function(t, e, n) {
                const s = pe(t, e, n);
                return t.inclusive ? s >= 0 : s > 0;
            }(t.endAt, Se(t), e)) return !1;
            return !0;
        }
        /**
     * Returns a new comparator function that can be used to compare two documents
     * based on the Query's ordering constraint.
     */ (t, e);
    }

    function Me(t) {
        return (e, n) => {
            let s = !1;
            for (const i of Se(t)) {
                const t = $e(i, e, n);
                if (0 !== t) return t;
                s = s || i.field.isKeyField();
            }
            return 0;
        };
    }

    function $e(t, e, n) {
        const s = t.field.isKeyField() ? Nt.comparator(e.key, n.key) : function(t, e, n) {
            const s = e.data.field(t), i = n.data.field(t);
            return null !== s && null !== i ? $t(s, i) : L();
        }
        /**
     * @license
     * Copyright 2021 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
        /**
     * The initial mutation batch id for each index. Gets updated during index
     * backfill.
     */ (t.field, e, n);
        switch (t.dir) {
          case "asc" /* ASCENDING */ :
            return s;

          case "desc" /* DESCENDING */ :
            return -1 * s;

          default:
            return L();
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Returns an DoubleValue for `value` that is encoded based the serializer's
     * `useProto3Json` setting.
     */ function Fe(t, e) {
        if (t.N) {
            if (isNaN(e)) return {
                doubleValue: "NaN"
            };
            if (e === 1 / 0) return {
                doubleValue: "Infinity"
            };
            if (e === -1 / 0) return {
                doubleValue: "-Infinity"
            };
        }
        return {
            doubleValue: Dt(e) ? "-0" : e
        };
    }

    /**
     * Returns an IntegerValue for `value`.
     */ function Be(t) {
        return {
            integerValue: "" + t
        };
    }

    /**
     * Returns a value for a number that's appropriate to put into a proto.
     * The return value is an IntegerValue if it can safely represent the value,
     * otherwise a DoubleValue is returned.
     */ function Le(t, e) {
        return Ct(e) ? Be(e) : Fe(t, e);
    }

    /**
     * @license
     * Copyright 2018 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /** Used to represent a field transform on a mutation. */ class Ue {
        constructor() {
            // Make sure that the structural type of `TransformOperation` is unique.
            // See https://github.com/microsoft/TypeScript/issues/5451
            this._ = void 0;
        }
    }

    /**
     * Computes the local transform result against the provided `previousValue`,
     * optionally using the provided localWriteTime.
     */ function qe(t, e, n) {
        return t instanceof je ? function(t, e) {
            const n = {
                fields: {
                    __type__: {
                        stringValue: "server_timestamp"
                    },
                    __local_write_time__: {
                        timestampValue: {
                            seconds: t.seconds,
                            nanos: t.nanoseconds
                        }
                    }
                }
            };
            return e && (n.fields.__previous_value__ = e), {
                mapValue: n
            };
        }(n, e) : t instanceof Qe ? We(t, e) : t instanceof ze ? He(t, e) : function(t, e) {
            // PORTING NOTE: Since JavaScript's integer arithmetic is limited to 53 bit
            // precision and resolves overflows by reducing precision, we do not
            // manually cap overflows at 2^63.
            const n = Ge(t, e), s = Ye(n) + Ye(t.k);
            return qt(n) && qt(t.k) ? Be(s) : Fe(t.O, s);
        }(t, e);
    }

    /**
     * Computes a final transform result after the transform has been acknowledged
     * by the server, potentially using the server-provided transformResult.
     */ function Ke(t, e, n) {
        // The server just sends null as the transform result for array operations,
        // so we have to calculate a result the same as we do for local
        // applications.
        return t instanceof Qe ? We(t, e) : t instanceof ze ? He(t, e) : n;
    }

    /**
     * If this transform operation is not idempotent, returns the base value to
     * persist for this transform. If a base value is returned, the transform
     * operation is always applied to this base value, even if document has
     * already been updated.
     *
     * Base values provide consistent behavior for non-idempotent transforms and
     * allow us to return the same latency-compensated value even if the backend
     * has already applied the transform operation. The base value is null for
     * idempotent transforms, as they can be re-played even if the backend has
     * already applied them.
     *
     * @returns a base value to store along with the mutation, or null for
     * idempotent transforms.
     */ function Ge(t, e) {
        return t instanceof Je ? qt(n = e) || function(t) {
            return !!t && "doubleValue" in t;
        }
        /** Returns true if `value` is either an IntegerValue or a DoubleValue. */ (n) ? e : {
            integerValue: 0
        } : null;
        var n;
    }

    /** Transforms a value into a server-generated timestamp. */
    class je extends Ue {}

    /** Transforms an array value via a union operation. */ class Qe extends Ue {
        constructor(t) {
            super(), this.elements = t;
        }
    }

    function We(t, e) {
        const n = Xe(e);
        for (const e of t.elements) n.some((t => Ot(t, e))) || n.push(e);
        return {
            arrayValue: {
                values: n
            }
        };
    }

    /** Transforms an array value via a remove operation. */ class ze extends Ue {
        constructor(t) {
            super(), this.elements = t;
        }
    }

    function He(t, e) {
        let n = Xe(e);
        for (const e of t.elements) n = n.filter((t => !Ot(t, e)));
        return {
            arrayValue: {
                values: n
            }
        };
    }

    /**
     * Implements the backend semantics for locally computed NUMERIC_ADD (increment)
     * transforms. Converts all field values to integers or doubles, but unlike the
     * backend does not cap integer values at 2^63. Instead, JavaScript number
     * arithmetic is used and precision loss can occur for values greater than 2^53.
     */ class Je extends Ue {
        constructor(t, e) {
            super(), this.O = t, this.k = e;
        }
    }

    function Ye(t) {
        return Tt(t.integerValue || t.doubleValue);
    }

    function Xe(t) {
        return Kt(t) && t.arrayValue.values ? t.arrayValue.values.slice() : [];
    }

    function tn(t, e) {
        return t.field.isEqual(e.field) && function(t, e) {
            return t instanceof Qe && e instanceof Qe || t instanceof ze && e instanceof ze ? ot(t.elements, e.elements, Ot) : t instanceof Je && e instanceof Je ? Ot(t.k, e.k) : t instanceof je && e instanceof je;
        }(t.transform, e.transform);
    }

    /** The result of successfully applying a mutation to the backend. */
    class en {
        constructor(
        /**
         * The version at which the mutation was committed:
         *
         * - For most operations, this is the updateTime in the WriteResult.
         * - For deletes, the commitTime of the WriteResponse (because deletes are
         *   not stored and have no updateTime).
         *
         * Note that these versions can be different: No-op writes will not change
         * the updateTime even though the commitTime advances.
         */
        t, 
        /**
         * The resulting fields returned from the backend after a mutation
         * containing field transforms has been committed. Contains one FieldValue
         * for each FieldTransform that was in the mutation.
         *
         * Will be empty if the mutation did not contain any field transforms.
         */
        e) {
            this.version = t, this.transformResults = e;
        }
    }

    /**
     * Encodes a precondition for a mutation. This follows the model that the
     * backend accepts with the special case of an explicit "empty" precondition
     * (meaning no precondition).
     */ class nn {
        constructor(t, e) {
            this.updateTime = t, this.exists = e;
        }
        /** Creates a new empty Precondition. */    static none() {
            return new nn;
        }
        /** Creates a new Precondition with an exists flag. */    static exists(t) {
            return new nn(void 0, t);
        }
        /** Creates a new Precondition based on a version a document exists at. */    static updateTime(t) {
            return new nn(t);
        }
        /** Returns whether this Precondition is empty. */    get isNone() {
            return void 0 === this.updateTime && void 0 === this.exists;
        }
        isEqual(t) {
            return this.exists === t.exists && (this.updateTime ? !!t.updateTime && this.updateTime.isEqual(t.updateTime) : !t.updateTime);
        }
    }

    /** Returns true if the preconditions is valid for the given document. */ function sn(t, e) {
        return void 0 !== t.updateTime ? e.isFoundDocument() && e.version.isEqual(t.updateTime) : void 0 === t.exists || t.exists === e.isFoundDocument();
    }

    /**
     * A mutation describes a self-contained change to a document. Mutations can
     * create, replace, delete, and update subsets of documents.
     *
     * Mutations not only act on the value of the document but also its version.
     *
     * For local mutations (mutations that haven't been committed yet), we preserve
     * the existing version for Set and Patch mutations. For Delete mutations, we
     * reset the version to 0.
     *
     * Here's the expected transition table.
     *
     * MUTATION           APPLIED TO            RESULTS IN
     *
     * SetMutation        Document(v3)          Document(v3)
     * SetMutation        NoDocument(v3)        Document(v0)
     * SetMutation        InvalidDocument(v0)   Document(v0)
     * PatchMutation      Document(v3)          Document(v3)
     * PatchMutation      NoDocument(v3)        NoDocument(v3)
     * PatchMutation      InvalidDocument(v0)   UnknownDocument(v3)
     * DeleteMutation     Document(v3)          NoDocument(v0)
     * DeleteMutation     NoDocument(v3)        NoDocument(v0)
     * DeleteMutation     InvalidDocument(v0)   NoDocument(v0)
     *
     * For acknowledged mutations, we use the updateTime of the WriteResponse as
     * the resulting version for Set and Patch mutations. As deletes have no
     * explicit update time, we use the commitTime of the WriteResponse for
     * Delete mutations.
     *
     * If a mutation is acknowledged by the backend but fails the precondition check
     * locally, we transition to an `UnknownDocument` and rely on Watch to send us
     * the updated version.
     *
     * Field transforms are used only with Patch and Set Mutations. We use the
     * `updateTransforms` message to store transforms, rather than the `transforms`s
     * messages.
     *
     * ## Subclassing Notes
     *
     * Every type of mutation needs to implement its own applyToRemoteDocument() and
     * applyToLocalView() to implement the actual behavior of applying the mutation
     * to some source document (see `setMutationApplyToRemoteDocument()` for an
     * example).
     */ class rn {}

    /**
     * Applies this mutation to the given document for the purposes of computing a
     * new remote document. If the input document doesn't match the expected state
     * (e.g. it is invalid or outdated), the document type may transition to
     * unknown.
     *
     * @param mutation - The mutation to apply.
     * @param document - The document to mutate. The input document can be an
     *     invalid document if the client has no knowledge of the pre-mutation state
     *     of the document.
     * @param mutationResult - The result of applying the mutation from the backend.
     */ function on(t, e, n) {
        t instanceof ln ? function(t, e, n) {
            // Unlike setMutationApplyToLocalView, if we're applying a mutation to a
            // remote document the server has accepted the mutation so the precondition
            // must have held.
            const s = t.value.clone(), i = _n(t.fieldTransforms, e, n.transformResults);
            s.setAll(i), e.convertToFoundDocument(n.version, s).setHasCommittedMutations();
        }(t, e, n) : t instanceof fn ? function(t, e, n) {
            if (!sn(t.precondition, e)) 
            // Since the mutation was not rejected, we know that the precondition
            // matched on the backend. We therefore must not have the expected version
            // of the document in our cache and convert to an UnknownDocument with a
            // known updateTime.
            return void e.convertToUnknownDocument(n.version);
            const s = _n(t.fieldTransforms, e, n.transformResults), i = e.data;
            i.setAll(dn(t)), i.setAll(s), e.convertToFoundDocument(n.version, i).setHasCommittedMutations();
        }(t, e, n) : function(t, e, n) {
            // Unlike applyToLocalView, if we're applying a mutation to a remote
            // document the server has accepted the mutation so the precondition must
            // have held.
            e.convertToNoDocument(n.version).setHasCommittedMutations();
        }(0, e, n);
    }

    /**
     * Applies this mutation to the given document for the purposes of computing
     * the new local view of a document. If the input document doesn't match the
     * expected state, the document is not modified.
     *
     * @param mutation - The mutation to apply.
     * @param document - The document to mutate. The input document can be an
     *     invalid document if the client has no knowledge of the pre-mutation state
     *     of the document.
     * @param localWriteTime - A timestamp indicating the local write time of the
     *     batch this mutation is a part of.
     */ function cn(t, e, n) {
        t instanceof ln ? function(t, e, n) {
            if (!sn(t.precondition, e)) 
            // The mutation failed to apply (e.g. a document ID created with add()
            // caused a name collision).
            return;
            const s = t.value.clone(), i = wn(t.fieldTransforms, n, e);
            s.setAll(i), e.convertToFoundDocument(hn(e), s).setHasLocalMutations();
        }
        /**
     * A mutation that modifies fields of the document at the given key with the
     * given values. The values are applied through a field mask:
     *
     *  * When a field is in both the mask and the values, the corresponding field
     *    is updated.
     *  * When a field is in neither the mask nor the values, the corresponding
     *    field is unmodified.
     *  * When a field is in the mask but not in the values, the corresponding field
     *    is deleted.
     *  * When a field is not in the mask but is in the values, the values map is
     *    ignored.
     */ (t, e, n) : t instanceof fn ? function(t, e, n) {
            if (!sn(t.precondition, e)) return;
            const s = wn(t.fieldTransforms, n, e), i = e.data;
            i.setAll(dn(t)), i.setAll(s), e.convertToFoundDocument(hn(e), i).setHasLocalMutations();
        }
        /**
     * Returns a FieldPath/Value map with the content of the PatchMutation.
     */ (t, e, n) : function(t, e) {
            sn(t.precondition, e) && 
            // We don't call `setHasLocalMutations()` since we want to be backwards
            // compatible with the existing SDK behavior.
            e.convertToNoDocument(at.min());
        }
        /**
     * A mutation that verifies the existence of the document at the given key with
     * the provided precondition.
     *
     * The `verify` operation is only used in Transactions, and this class serves
     * primarily to facilitate serialization into protos.
     */ (t, e);
    }

    /**
     * If this mutation is not idempotent, returns the base value to persist with
     * this mutation. If a base value is returned, the mutation is always applied
     * to this base value, even if document has already been updated.
     *
     * The base value is a sparse object that consists of only the document
     * fields for which this mutation contains a non-idempotent transformation
     * (e.g. a numeric increment). The provided value guarantees consistent
     * behavior for non-idempotent transforms and allow us to return the same
     * latency-compensated value even if the backend has already applied the
     * mutation. The base value is null for idempotent mutations, as they can be
     * re-played even if the backend has already applied them.
     *
     * @returns a base value to store along with the mutation, or null for
     * idempotent mutations.
     */ function un(t, e) {
        let n = null;
        for (const s of t.fieldTransforms) {
            const t = e.data.field(s.field), i = Ge(s.transform, t || null);
            null != i && (null == n && (n = zt.empty()), n.set(s.field, i));
        }
        return n || null;
    }

    function an(t, e) {
        return t.type === e.type && (!!t.key.isEqual(e.key) && (!!t.precondition.isEqual(e.precondition) && (!!function(t, e) {
            return void 0 === t && void 0 === e || !(!t || !e) && ot(t, e, ((t, e) => tn(t, e)));
        }(t.fieldTransforms, e.fieldTransforms) && (0 /* Set */ === t.type ? t.value.isEqual(e.value) : 1 /* Patch */ !== t.type || t.data.isEqual(e.data) && t.fieldMask.isEqual(e.fieldMask)))));
    }

    /**
     * Returns the version from the given document for use as the result of a
     * mutation. Mutations are defined to return the version of the base document
     * only if it is an existing document. Deleted and unknown documents have a
     * post-mutation version of SnapshotVersion.min().
     */ function hn(t) {
        return t.isFoundDocument() ? t.version : at.min();
    }

    /**
     * A mutation that creates or replaces the document at the given key with the
     * object value contents.
     */ class ln extends rn {
        constructor(t, e, n, s = []) {
            super(), this.key = t, this.value = e, this.precondition = n, this.fieldTransforms = s, 
            this.type = 0 /* Set */;
        }
    }

    class fn extends rn {
        constructor(t, e, n, s, i = []) {
            super(), this.key = t, this.data = e, this.fieldMask = n, this.precondition = s, 
            this.fieldTransforms = i, this.type = 1 /* Patch */;
        }
    }

    function dn(t) {
        const e = new Map;
        return t.fieldMask.fields.forEach((n => {
            if (!n.isEmpty()) {
                const s = t.data.field(n);
                e.set(n, s);
            }
        })), e;
    }

    /**
     * Creates a list of "transform results" (a transform result is a field value
     * representing the result of applying a transform) for use after a mutation
     * containing transforms has been acknowledged by the server.
     *
     * @param fieldTransforms - The field transforms to apply the result to.
     * @param mutableDocument - The current state of the document after applying all
     * previous mutations.
     * @param serverTransformResults - The transform results received by the server.
     * @returns The transform results list.
     */ function _n(t, e, n) {
        const s = new Map;
        U(t.length === n.length);
        for (let i = 0; i < n.length; i++) {
            const r = t[i], o = r.transform, c = e.data.field(r.field);
            s.set(r.field, Ke(o, c, n[i]));
        }
        return s;
    }

    /**
     * Creates a list of "transform results" (a transform result is a field value
     * representing the result of applying a transform) for use when applying a
     * transform locally.
     *
     * @param fieldTransforms - The field transforms to apply the result to.
     * @param localWriteTime - The local time of the mutation (used to
     *     generate ServerTimestampValues).
     * @param mutableDocument - The current state of the document after applying all
     *     previous mutations.
     * @returns The transform results list.
     */ function wn(t, e, n) {
        const s = new Map;
        for (const i of t) {
            const t = i.transform, r = n.data.field(i.field);
            s.set(i.field, qe(t, r, e));
        }
        return s;
    }

    /** A mutation that deletes the document at the given key. */ class mn extends rn {
        constructor(t, e) {
            super(), this.key = t, this.precondition = e, this.type = 2 /* Delete */ , this.fieldTransforms = [];
        }
    }

    class gn extends rn {
        constructor(t, e) {
            super(), this.key = t, this.precondition = e, this.type = 3 /* Verify */ , this.fieldTransforms = [];
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class yn {
        // TODO(b/33078163): just use simplest form of existence filter for now
        constructor(t) {
            this.count = t;
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Error Codes describing the different ways GRPC can fail. These are copied
     * directly from GRPC's sources here:
     *
     * https://github.com/grpc/grpc/blob/bceec94ea4fc5f0085d81235d8e1c06798dc341a/include/grpc%2B%2B/impl/codegen/status_code_enum.h
     *
     * Important! The names of these identifiers matter because the string forms
     * are used for reverse lookups from the webchannel stream. Do NOT change the
     * names of these identifiers or change this into a const enum.
     */ var pn, In;

    /**
     * Determines whether an error code represents a permanent error when received
     * in response to a non-write operation.
     *
     * See isPermanentWriteError for classifying write errors.
     */
    function En(t) {
        switch (t) {
          default:
            return L();

          case G.CANCELLED:
          case G.UNKNOWN:
          case G.DEADLINE_EXCEEDED:
          case G.RESOURCE_EXHAUSTED:
          case G.INTERNAL:
          case G.UNAVAILABLE:
     // Unauthenticated means something went wrong with our token and we need
            // to retry with new credentials which will happen automatically.
                  case G.UNAUTHENTICATED:
            return !1;

          case G.INVALID_ARGUMENT:
          case G.NOT_FOUND:
          case G.ALREADY_EXISTS:
          case G.PERMISSION_DENIED:
          case G.FAILED_PRECONDITION:
     // Aborted might be retried in some scenarios, but that is dependant on
            // the context and should handled individually by the calling code.
            // See https://cloud.google.com/apis/design/errors.
                  case G.ABORTED:
          case G.OUT_OF_RANGE:
          case G.UNIMPLEMENTED:
          case G.DATA_LOSS:
            return !0;
        }
    }

    /**
     * Determines whether an error code represents a permanent error when received
     * in response to a write operation.
     *
     * Write operations must be handled specially because as of b/119437764, ABORTED
     * errors on the write stream should be retried too (even though ABORTED errors
     * are not generally retryable).
     *
     * Note that during the initial handshake on the write stream an ABORTED error
     * signals that we should discard our stream token (i.e. it is permanent). This
     * means a handshake error should be classified with isPermanentError, above.
     */
    /**
     * Maps an error Code from GRPC status code number, like 0, 1, or 14. These
     * are not the same as HTTP status codes.
     *
     * @returns The Code equivalent to the given GRPC status code. Fails if there
     *     is no match.
     */
    function Tn(t) {
        if (void 0 === t) 
        // This shouldn't normally happen, but in certain error cases (like trying
        // to send invalid proto messages) we may get an error with no GRPC code.
        return $("GRPC error has no .code"), G.UNKNOWN;
        switch (t) {
          case pn.OK:
            return G.OK;

          case pn.CANCELLED:
            return G.CANCELLED;

          case pn.UNKNOWN:
            return G.UNKNOWN;

          case pn.DEADLINE_EXCEEDED:
            return G.DEADLINE_EXCEEDED;

          case pn.RESOURCE_EXHAUSTED:
            return G.RESOURCE_EXHAUSTED;

          case pn.INTERNAL:
            return G.INTERNAL;

          case pn.UNAVAILABLE:
            return G.UNAVAILABLE;

          case pn.UNAUTHENTICATED:
            return G.UNAUTHENTICATED;

          case pn.INVALID_ARGUMENT:
            return G.INVALID_ARGUMENT;

          case pn.NOT_FOUND:
            return G.NOT_FOUND;

          case pn.ALREADY_EXISTS:
            return G.ALREADY_EXISTS;

          case pn.PERMISSION_DENIED:
            return G.PERMISSION_DENIED;

          case pn.FAILED_PRECONDITION:
            return G.FAILED_PRECONDITION;

          case pn.ABORTED:
            return G.ABORTED;

          case pn.OUT_OF_RANGE:
            return G.OUT_OF_RANGE;

          case pn.UNIMPLEMENTED:
            return G.UNIMPLEMENTED;

          case pn.DATA_LOSS:
            return G.DATA_LOSS;

          default:
            return L();
        }
    }

    /**
     * Converts an HTTP response's error status to the equivalent error code.
     *
     * @param status - An HTTP error response status ("FAILED_PRECONDITION",
     * "UNKNOWN", etc.)
     * @returns The equivalent Code. Non-matching responses are mapped to
     *     Code.UNKNOWN.
     */ (In = pn || (pn = {}))[In.OK = 0] = "OK", In[In.CANCELLED = 1] = "CANCELLED", 
    In[In.UNKNOWN = 2] = "UNKNOWN", In[In.INVALID_ARGUMENT = 3] = "INVALID_ARGUMENT", 
    In[In.DEADLINE_EXCEEDED = 4] = "DEADLINE_EXCEEDED", In[In.NOT_FOUND = 5] = "NOT_FOUND", 
    In[In.ALREADY_EXISTS = 6] = "ALREADY_EXISTS", In[In.PERMISSION_DENIED = 7] = "PERMISSION_DENIED", 
    In[In.UNAUTHENTICATED = 16] = "UNAUTHENTICATED", In[In.RESOURCE_EXHAUSTED = 8] = "RESOURCE_EXHAUSTED", 
    In[In.FAILED_PRECONDITION = 9] = "FAILED_PRECONDITION", In[In.ABORTED = 10] = "ABORTED", 
    In[In.OUT_OF_RANGE = 11] = "OUT_OF_RANGE", In[In.UNIMPLEMENTED = 12] = "UNIMPLEMENTED", 
    In[In.INTERNAL = 13] = "INTERNAL", In[In.UNAVAILABLE = 14] = "UNAVAILABLE", In[In.DATA_LOSS = 15] = "DATA_LOSS";

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // An immutable sorted map implementation, based on a Left-leaning Red-Black
    // tree.
    class An {
        constructor(t, e) {
            this.comparator = t, this.root = e || Pn.EMPTY;
        }
        // Returns a copy of the map, with the specified key/value added or replaced.
        insert(t, e) {
            return new An(this.comparator, this.root.insert(t, e, this.comparator).copy(null, null, Pn.BLACK, null, null));
        }
        // Returns a copy of the map, with the specified key removed.
        remove(t) {
            return new An(this.comparator, this.root.remove(t, this.comparator).copy(null, null, Pn.BLACK, null, null));
        }
        // Returns the value of the node with the given key, or null.
        get(t) {
            let e = this.root;
            for (;!e.isEmpty(); ) {
                const n = this.comparator(t, e.key);
                if (0 === n) return e.value;
                n < 0 ? e = e.left : n > 0 && (e = e.right);
            }
            return null;
        }
        // Returns the index of the element in this sorted map, or -1 if it doesn't
        // exist.
        indexOf(t) {
            // Number of nodes that were pruned when descending right
            let e = 0, n = this.root;
            for (;!n.isEmpty(); ) {
                const s = this.comparator(t, n.key);
                if (0 === s) return e + n.left.size;
                s < 0 ? n = n.left : (
                // Count all nodes left of the node plus the node itself
                e += n.left.size + 1, n = n.right);
            }
            // Node not found
                    return -1;
        }
        isEmpty() {
            return this.root.isEmpty();
        }
        // Returns the total number of nodes in the map.
        get size() {
            return this.root.size;
        }
        // Returns the minimum key in the map.
        minKey() {
            return this.root.minKey();
        }
        // Returns the maximum key in the map.
        maxKey() {
            return this.root.maxKey();
        }
        // Traverses the map in key order and calls the specified action function
        // for each key/value pair. If action returns true, traversal is aborted.
        // Returns the first truthy value returned by action, or the last falsey
        // value returned by action.
        inorderTraversal(t) {
            return this.root.inorderTraversal(t);
        }
        forEach(t) {
            this.inorderTraversal(((e, n) => (t(e, n), !1)));
        }
        toString() {
            const t = [];
            return this.inorderTraversal(((e, n) => (t.push(`${e}:${n}`), !1))), `{${t.join(", ")}}`;
        }
        // Traverses the map in reverse key order and calls the specified action
        // function for each key/value pair. If action returns true, traversal is
        // aborted.
        // Returns the first truthy value returned by action, or the last falsey
        // value returned by action.
        reverseTraversal(t) {
            return this.root.reverseTraversal(t);
        }
        // Returns an iterator over the SortedMap.
        getIterator() {
            return new Rn(this.root, null, this.comparator, !1);
        }
        getIteratorFrom(t) {
            return new Rn(this.root, t, this.comparator, !1);
        }
        getReverseIterator() {
            return new Rn(this.root, null, this.comparator, !0);
        }
        getReverseIteratorFrom(t) {
            return new Rn(this.root, t, this.comparator, !0);
        }
    }

     // end SortedMap
    // An iterator over an LLRBNode.
    class Rn {
        constructor(t, e, n, s) {
            this.isReverse = s, this.nodeStack = [];
            let i = 1;
            for (;!t.isEmpty(); ) if (i = e ? n(t.key, e) : 1, 
            // flip the comparison if we're going in reverse
            s && (i *= -1), i < 0) 
            // This node is less than our start key. ignore it
            t = this.isReverse ? t.left : t.right; else {
                if (0 === i) {
                    // This node is exactly equal to our start key. Push it on the stack,
                    // but stop iterating;
                    this.nodeStack.push(t);
                    break;
                }
                // This node is greater than our start key, add it to the stack and move
                // to the next one
                this.nodeStack.push(t), t = this.isReverse ? t.right : t.left;
            }
        }
        getNext() {
            let t = this.nodeStack.pop();
            const e = {
                key: t.key,
                value: t.value
            };
            if (this.isReverse) for (t = t.left; !t.isEmpty(); ) this.nodeStack.push(t), t = t.right; else for (t = t.right; !t.isEmpty(); ) this.nodeStack.push(t), 
            t = t.left;
            return e;
        }
        hasNext() {
            return this.nodeStack.length > 0;
        }
        peek() {
            if (0 === this.nodeStack.length) return null;
            const t = this.nodeStack[this.nodeStack.length - 1];
            return {
                key: t.key,
                value: t.value
            };
        }
    }

     // end SortedMapIterator
    // Represents a node in a Left-leaning Red-Black tree.
    class Pn {
        constructor(t, e, n, s, i) {
            this.key = t, this.value = e, this.color = null != n ? n : Pn.RED, this.left = null != s ? s : Pn.EMPTY, 
            this.right = null != i ? i : Pn.EMPTY, this.size = this.left.size + 1 + this.right.size;
        }
        // Returns a copy of the current node, optionally replacing pieces of it.
        copy(t, e, n, s, i) {
            return new Pn(null != t ? t : this.key, null != e ? e : this.value, null != n ? n : this.color, null != s ? s : this.left, null != i ? i : this.right);
        }
        isEmpty() {
            return !1;
        }
        // Traverses the tree in key order and calls the specified action function
        // for each node. If action returns true, traversal is aborted.
        // Returns the first truthy value returned by action, or the last falsey
        // value returned by action.
        inorderTraversal(t) {
            return this.left.inorderTraversal(t) || t(this.key, this.value) || this.right.inorderTraversal(t);
        }
        // Traverses the tree in reverse key order and calls the specified action
        // function for each node. If action returns true, traversal is aborted.
        // Returns the first truthy value returned by action, or the last falsey
        // value returned by action.
        reverseTraversal(t) {
            return this.right.reverseTraversal(t) || t(this.key, this.value) || this.left.reverseTraversal(t);
        }
        // Returns the minimum node in the tree.
        min() {
            return this.left.isEmpty() ? this : this.left.min();
        }
        // Returns the maximum key in the tree.
        minKey() {
            return this.min().key;
        }
        // Returns the maximum key in the tree.
        maxKey() {
            return this.right.isEmpty() ? this.key : this.right.maxKey();
        }
        // Returns new tree, with the key/value added.
        insert(t, e, n) {
            let s = this;
            const i = n(t, s.key);
            return s = i < 0 ? s.copy(null, null, null, s.left.insert(t, e, n), null) : 0 === i ? s.copy(null, e, null, null, null) : s.copy(null, null, null, null, s.right.insert(t, e, n)), 
            s.fixUp();
        }
        removeMin() {
            if (this.left.isEmpty()) return Pn.EMPTY;
            let t = this;
            return t.left.isRed() || t.left.left.isRed() || (t = t.moveRedLeft()), t = t.copy(null, null, null, t.left.removeMin(), null), 
            t.fixUp();
        }
        // Returns new tree, with the specified item removed.
        remove(t, e) {
            let n, s = this;
            if (e(t, s.key) < 0) s.left.isEmpty() || s.left.isRed() || s.left.left.isRed() || (s = s.moveRedLeft()), 
            s = s.copy(null, null, null, s.left.remove(t, e), null); else {
                if (s.left.isRed() && (s = s.rotateRight()), s.right.isEmpty() || s.right.isRed() || s.right.left.isRed() || (s = s.moveRedRight()), 
                0 === e(t, s.key)) {
                    if (s.right.isEmpty()) return Pn.EMPTY;
                    n = s.right.min(), s = s.copy(n.key, n.value, null, null, s.right.removeMin());
                }
                s = s.copy(null, null, null, null, s.right.remove(t, e));
            }
            return s.fixUp();
        }
        isRed() {
            return this.color;
        }
        // Returns new tree after performing any needed rotations.
        fixUp() {
            let t = this;
            return t.right.isRed() && !t.left.isRed() && (t = t.rotateLeft()), t.left.isRed() && t.left.left.isRed() && (t = t.rotateRight()), 
            t.left.isRed() && t.right.isRed() && (t = t.colorFlip()), t;
        }
        moveRedLeft() {
            let t = this.colorFlip();
            return t.right.left.isRed() && (t = t.copy(null, null, null, null, t.right.rotateRight()), 
            t = t.rotateLeft(), t = t.colorFlip()), t;
        }
        moveRedRight() {
            let t = this.colorFlip();
            return t.left.left.isRed() && (t = t.rotateRight(), t = t.colorFlip()), t;
        }
        rotateLeft() {
            const t = this.copy(null, null, Pn.RED, null, this.right.left);
            return this.right.copy(null, null, this.color, t, null);
        }
        rotateRight() {
            const t = this.copy(null, null, Pn.RED, this.left.right, null);
            return this.left.copy(null, null, this.color, null, t);
        }
        colorFlip() {
            const t = this.left.copy(null, null, !this.left.color, null, null), e = this.right.copy(null, null, !this.right.color, null, null);
            return this.copy(null, null, !this.color, t, e);
        }
        // For testing.
        checkMaxDepth() {
            const t = this.check();
            return Math.pow(2, t) <= this.size + 1;
        }
        // In a balanced RB tree, the black-depth (number of black nodes) from root to
        // leaves is equal on both sides.  This function verifies that or asserts.
        check() {
            if (this.isRed() && this.left.isRed()) throw L();
            if (this.right.isRed()) throw L();
            const t = this.left.check();
            if (t !== this.right.check()) throw L();
            return t + (this.isRed() ? 0 : 1);
        }
    }

     // end LLRBNode
    // Empty node is shared between all LLRB trees.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Pn.EMPTY = null, Pn.RED = !0, Pn.BLACK = !1;

    // end LLRBEmptyNode
    Pn.EMPTY = new 
    // Represents an empty node (a leaf node in the Red-Black Tree).
    class {
        constructor() {
            this.size = 0;
        }
        get key() {
            throw L();
        }
        get value() {
            throw L();
        }
        get color() {
            throw L();
        }
        get left() {
            throw L();
        }
        get right() {
            throw L();
        }
        // Returns a copy of the current node.
        copy(t, e, n, s, i) {
            return this;
        }
        // Returns a copy of the tree, with the specified key/value added.
        insert(t, e, n) {
            return new Pn(t, e);
        }
        // Returns a copy of the tree, with the specified key removed.
        remove(t, e) {
            return this;
        }
        isEmpty() {
            return !0;
        }
        inorderTraversal(t) {
            return !1;
        }
        reverseTraversal(t) {
            return !1;
        }
        minKey() {
            return null;
        }
        maxKey() {
            return null;
        }
        isRed() {
            return !1;
        }
        // For testing.
        checkMaxDepth() {
            return !0;
        }
        check() {
            return 0;
        }
    };

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * SortedSet is an immutable (copy-on-write) collection that holds elements
     * in order specified by the provided comparator.
     *
     * NOTE: if provided comparator returns 0 for two elements, we consider them to
     * be equal!
     */
    class bn {
        constructor(t) {
            this.comparator = t, this.data = new An(this.comparator);
        }
        has(t) {
            return null !== this.data.get(t);
        }
        first() {
            return this.data.minKey();
        }
        last() {
            return this.data.maxKey();
        }
        get size() {
            return this.data.size;
        }
        indexOf(t) {
            return this.data.indexOf(t);
        }
        /** Iterates elements in order defined by "comparator" */    forEach(t) {
            this.data.inorderTraversal(((e, n) => (t(e), !1)));
        }
        /** Iterates over `elem`s such that: range[0] &lt;= elem &lt; range[1]. */    forEachInRange(t, e) {
            const n = this.data.getIteratorFrom(t[0]);
            for (;n.hasNext(); ) {
                const s = n.getNext();
                if (this.comparator(s.key, t[1]) >= 0) return;
                e(s.key);
            }
        }
        /**
         * Iterates over `elem`s such that: start &lt;= elem until false is returned.
         */    forEachWhile(t, e) {
            let n;
            for (n = void 0 !== e ? this.data.getIteratorFrom(e) : this.data.getIterator(); n.hasNext(); ) {
                if (!t(n.getNext().key)) return;
            }
        }
        /** Finds the least element greater than or equal to `elem`. */    firstAfterOrEqual(t) {
            const e = this.data.getIteratorFrom(t);
            return e.hasNext() ? e.getNext().key : null;
        }
        getIterator() {
            return new vn(this.data.getIterator());
        }
        getIteratorFrom(t) {
            return new vn(this.data.getIteratorFrom(t));
        }
        /** Inserts or updates an element */    add(t) {
            return this.copy(this.data.remove(t).insert(t, !0));
        }
        /** Deletes an element */    delete(t) {
            return this.has(t) ? this.copy(this.data.remove(t)) : this;
        }
        isEmpty() {
            return this.data.isEmpty();
        }
        unionWith(t) {
            let e = this;
            // Make sure `result` always refers to the larger one of the two sets.
                    return e.size < t.size && (e = t, t = this), t.forEach((t => {
                e = e.add(t);
            })), e;
        }
        isEqual(t) {
            if (!(t instanceof bn)) return !1;
            if (this.size !== t.size) return !1;
            const e = this.data.getIterator(), n = t.data.getIterator();
            for (;e.hasNext(); ) {
                const t = e.getNext().key, s = n.getNext().key;
                if (0 !== this.comparator(t, s)) return !1;
            }
            return !0;
        }
        toArray() {
            const t = [];
            return this.forEach((e => {
                t.push(e);
            })), t;
        }
        toString() {
            const t = [];
            return this.forEach((e => t.push(e))), "SortedSet(" + t.toString() + ")";
        }
        copy(t) {
            const e = new bn(this.comparator);
            return e.data = t, e;
        }
    }

    class vn {
        constructor(t) {
            this.iter = t;
        }
        getNext() {
            return this.iter.getNext().key;
        }
        hasNext() {
            return this.iter.hasNext();
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ const Sn = new An(Nt.comparator);

    function Dn() {
        return Sn;
    }

    const Cn = new An(Nt.comparator);

    function Nn() {
        return Cn;
    }

    const xn = new An(Nt.comparator);

    const kn = new bn(Nt.comparator);

    function On(...t) {
        let e = kn;
        for (const n of t) e = e.add(n);
        return e;
    }

    const Mn = new bn(rt);

    function $n() {
        return Mn;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * An event from the RemoteStore. It is split into targetChanges (changes to the
     * state or the set of documents in our watched targets) and documentUpdates
     * (changes to the actual documents).
     */ class Fn {
        constructor(
        /**
         * The snapshot version this event brings us up to, or MIN if not set.
         */
        t, 
        /**
         * A map from target to changes to the target. See TargetChange.
         */
        e, 
        /**
         * A set of targets that is known to be inconsistent. Listens for these
         * targets should be re-established without resume tokens.
         */
        n, 
        /**
         * A set of which documents have changed or been deleted, along with the
         * doc's new values (if not deleted).
         */
        s, 
        /**
         * A set of which document updates are due only to limbo resolution targets.
         */
        i) {
            this.snapshotVersion = t, this.targetChanges = e, this.targetMismatches = n, this.documentUpdates = s, 
            this.resolvedLimboDocuments = i;
        }
        /**
         * HACK: Views require RemoteEvents in order to determine whether the view is
         * CURRENT, but secondary tabs don't receive remote events. So this method is
         * used to create a synthesized RemoteEvent that can be used to apply a
         * CURRENT status change to a View, for queries executed in a different tab.
         */
        // PORTING NOTE: Multi-tab only
        static createSynthesizedRemoteEventForCurrentChange(t, e) {
            const n = new Map;
            return n.set(t, Bn.createSynthesizedTargetChangeForCurrentChange(t, e)), new Fn(at.min(), n, $n(), Dn(), On());
        }
    }

    /**
     * A TargetChange specifies the set of changes for a specific target as part of
     * a RemoteEvent. These changes track which documents are added, modified or
     * removed, as well as the target's resume token and whether the target is
     * marked CURRENT.
     * The actual changes *to* documents are not part of the TargetChange since
     * documents may be part of multiple targets.
     */ class Bn {
        constructor(
        /**
         * An opaque, server-assigned token that allows watching a query to be resumed
         * after disconnecting without retransmitting all the data that matches the
         * query. The resume token essentially identifies a point in time from which
         * the server should resume sending results.
         */
        t, 
        /**
         * The "current" (synced) status of this target. Note that "current"
         * has special meaning in the RPC protocol that implies that a target is
         * both up-to-date and consistent with the rest of the watch stream.
         */
        e, 
        /**
         * The set of documents that were newly assigned to this target as part of
         * this remote event.
         */
        n, 
        /**
         * The set of documents that were already assigned to this target but received
         * an update during this remote event.
         */
        s, 
        /**
         * The set of documents that were removed from this target as part of this
         * remote event.
         */
        i) {
            this.resumeToken = t, this.current = e, this.addedDocuments = n, this.modifiedDocuments = s, 
            this.removedDocuments = i;
        }
        /**
         * This method is used to create a synthesized TargetChanges that can be used to
         * apply a CURRENT status change to a View (for queries executed in a different
         * tab) or for new queries (to raise snapshots with correct CURRENT status).
         */    static createSynthesizedTargetChangeForCurrentChange(t, e) {
            return new Bn(pt.EMPTY_BYTE_STRING, e, On(), On(), On());
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Represents a changed document and a list of target ids to which this change
     * applies.
     *
     * If document has been deleted NoDocument will be provided.
     */ class Ln {
        constructor(
        /** The new document applies to all of these targets. */
        t, 
        /** The new document is removed from all of these targets. */
        e, 
        /** The key of the document for this change. */
        n, 
        /**
         * The new document or NoDocument if it was deleted. Is null if the
         * document went out of view without the server sending a new document.
         */
        s) {
            this.M = t, this.removedTargetIds = e, this.key = n, this.$ = s;
        }
    }

    class Un {
        constructor(t, e) {
            this.targetId = t, this.F = e;
        }
    }

    class qn {
        constructor(
        /** What kind of change occurred to the watch target. */
        t, 
        /** The target IDs that were added/removed/set. */
        e, 
        /**
         * An opaque, server-assigned token that allows watching a target to be
         * resumed after disconnecting without retransmitting all the data that
         * matches the target. The resume token essentially identifies a point in
         * time from which the server should resume sending results.
         */
        n = pt.EMPTY_BYTE_STRING
        /** An RPC error indicating why the watch failed. */ , s = null) {
            this.state = t, this.targetIds = e, this.resumeToken = n, this.cause = s;
        }
    }

    /** Tracks the internal state of a Watch target. */ class Kn {
        constructor() {
            /**
             * The number of pending responses (adds or removes) that we are waiting on.
             * We only consider targets active that have no pending responses.
             */
            this.B = 0, 
            /**
             * Keeps track of the document changes since the last raised snapshot.
             *
             * These changes are continuously updated as we receive document updates and
             * always reflect the current set of changes against the last issued snapshot.
             */
            this.L = Qn(), 
            /** See public getters for explanations of these fields. */
            this.U = pt.EMPTY_BYTE_STRING, this.q = !1, 
            /**
             * Whether this target state should be included in the next snapshot. We
             * initialize to true so that newly-added targets are included in the next
             * RemoteEvent.
             */
            this.K = !0;
        }
        /**
         * Whether this target has been marked 'current'.
         *
         * 'Current' has special meaning in the RPC protocol: It implies that the
         * Watch backend has sent us all changes up to the point at which the target
         * was added and that the target is consistent with the rest of the watch
         * stream.
         */    get current() {
            return this.q;
        }
        /** The last resume token sent to us for this target. */    get resumeToken() {
            return this.U;
        }
        /** Whether this target has pending target adds or target removes. */    get G() {
            return 0 !== this.B;
        }
        /** Whether we have modified any state that should trigger a snapshot. */    get j() {
            return this.K;
        }
        /**
         * Applies the resume token to the TargetChange, but only when it has a new
         * value. Empty resumeTokens are discarded.
         */    W(t) {
            t.approximateByteSize() > 0 && (this.K = !0, this.U = t);
        }
        /**
         * Creates a target change from the current set of changes.
         *
         * To reset the document changes after raising this snapshot, call
         * `clearPendingChanges()`.
         */    H() {
            let t = On(), e = On(), n = On();
            return this.L.forEach(((s, i) => {
                switch (i) {
                  case 0 /* Added */ :
                    t = t.add(s);
                    break;

                  case 2 /* Modified */ :
                    e = e.add(s);
                    break;

                  case 1 /* Removed */ :
                    n = n.add(s);
                    break;

                  default:
                    L();
                }
            })), new Bn(this.U, this.q, t, e, n);
        }
        /**
         * Resets the document changes and sets `hasPendingChanges` to false.
         */    J() {
            this.K = !1, this.L = Qn();
        }
        Y(t, e) {
            this.K = !0, this.L = this.L.insert(t, e);
        }
        X(t) {
            this.K = !0, this.L = this.L.remove(t);
        }
        Z() {
            this.B += 1;
        }
        tt() {
            this.B -= 1;
        }
        et() {
            this.K = !0, this.q = !0;
        }
    }

    /**
     * A helper class to accumulate watch changes into a RemoteEvent.
     */
    class Gn {
        constructor(t) {
            this.nt = t, 
            /** The internal state of all tracked targets. */
            this.st = new Map, 
            /** Keeps track of the documents to update since the last raised snapshot. */
            this.it = Dn(), 
            /** A mapping of document keys to their set of target IDs. */
            this.rt = jn(), 
            /**
             * A list of targets with existence filter mismatches. These targets are
             * known to be inconsistent and their listens needs to be re-established by
             * RemoteStore.
             */
            this.ot = new bn(rt);
        }
        /**
         * Processes and adds the DocumentWatchChange to the current set of changes.
         */    ct(t) {
            for (const e of t.M) t.$ && t.$.isFoundDocument() ? this.ut(e, t.$) : this.at(e, t.key, t.$);
            for (const e of t.removedTargetIds) this.at(e, t.key, t.$);
        }
        /** Processes and adds the WatchTargetChange to the current set of changes. */    ht(t) {
            this.forEachTarget(t, (e => {
                const n = this.lt(e);
                switch (t.state) {
                  case 0 /* NoChange */ :
                    this.ft(e) && n.W(t.resumeToken);
                    break;

                  case 1 /* Added */ :
                    // We need to decrement the number of pending acks needed from watch
                    // for this targetId.
                    n.tt(), n.G || 
                    // We have a freshly added target, so we need to reset any state
                    // that we had previously. This can happen e.g. when remove and add
                    // back a target for existence filter mismatches.
                    n.J(), n.W(t.resumeToken);
                    break;

                  case 2 /* Removed */ :
                    // We need to keep track of removed targets to we can post-filter and
                    // remove any target changes.
                    // We need to decrement the number of pending acks needed from watch
                    // for this targetId.
                    n.tt(), n.G || this.removeTarget(e);
                    break;

                  case 3 /* Current */ :
                    this.ft(e) && (n.et(), n.W(t.resumeToken));
                    break;

                  case 4 /* Reset */ :
                    this.ft(e) && (
                    // Reset the target and synthesizes removes for all existing
                    // documents. The backend will re-add any documents that still
                    // match the target before it sends the next global snapshot.
                    this.dt(e), n.W(t.resumeToken));
                    break;

                  default:
                    L();
                }
            }));
        }
        /**
         * Iterates over all targetIds that the watch change applies to: either the
         * targetIds explicitly listed in the change or the targetIds of all currently
         * active targets.
         */    forEachTarget(t, e) {
            t.targetIds.length > 0 ? t.targetIds.forEach(e) : this.st.forEach(((t, n) => {
                this.ft(n) && e(n);
            }));
        }
        /**
         * Handles existence filters and synthesizes deletes for filter mismatches.
         * Targets that are invalidated by filter mismatches are added to
         * `pendingTargetResets`.
         */    _t(t) {
            const e = t.targetId, n = t.F.count, s = this.wt(e);
            if (s) {
                const t = s.target;
                if (oe(t)) if (0 === n) {
                    // The existence filter told us the document does not exist. We deduce
                    // that this document does not exist and apply a deleted document to
                    // our updates. Without applying this deleted document there might be
                    // another query that will raise this document as part of a snapshot
                    // until it is resolved, essentially exposing inconsistency between
                    // queries.
                    const n = new Nt(t.path);
                    this.at(e, n, Jt.newNoDocument(n, at.min()));
                } else U(1 === n); else {
                    this.gt(e) !== n && (
                    // Existence filter mismatch: We reset the mapping and raise a new
                    // snapshot with `isFromCache:true`.
                    this.dt(e), this.ot = this.ot.add(e));
                }
            }
        }
        /**
         * Converts the currently accumulated state into a remote event at the
         * provided snapshot version. Resets the accumulated changes before returning.
         */    yt(t) {
            const e = new Map;
            this.st.forEach(((n, s) => {
                const i = this.wt(s);
                if (i) {
                    if (n.current && oe(i.target)) {
                        // Document queries for document that don't exist can produce an empty
                        // result set. To update our local cache, we synthesize a document
                        // delete if we have not previously received the document. This
                        // resolves the limbo state of the document, removing it from
                        // limboDocumentRefs.
                        // TODO(dimond): Ideally we would have an explicit lookup target
                        // instead resulting in an explicit delete message and we could
                        // remove this special logic.
                        const e = new Nt(i.target.path);
                        null !== this.it.get(e) || this.It(s, e) || this.at(s, e, Jt.newNoDocument(e, t));
                    }
                    n.j && (e.set(s, n.H()), n.J());
                }
            }));
            let n = On();
            // We extract the set of limbo-only document updates as the GC logic
            // special-cases documents that do not appear in the target cache.
            
            // TODO(gsoltis): Expand on this comment once GC is available in the JS
            // client.
                    this.rt.forEach(((t, e) => {
                let s = !0;
                e.forEachWhile((t => {
                    const e = this.wt(t);
                    return !e || 2 /* LimboResolution */ === e.purpose || (s = !1, !1);
                })), s && (n = n.add(t));
            })), this.it.forEach(((e, n) => n.setReadTime(t)));
            const s = new Fn(t, e, this.ot, this.it, n);
            return this.it = Dn(), this.rt = jn(), this.ot = new bn(rt), s;
        }
        /**
         * Adds the provided document to the internal list of document updates and
         * its document key to the given target's mapping.
         */
        // Visible for testing.
        ut(t, e) {
            if (!this.ft(t)) return;
            const n = this.It(t, e.key) ? 2 /* Modified */ : 0 /* Added */;
            this.lt(t).Y(e.key, n), this.it = this.it.insert(e.key, e), this.rt = this.rt.insert(e.key, this.Et(e.key).add(t));
        }
        /**
         * Removes the provided document from the target mapping. If the
         * document no longer matches the target, but the document's state is still
         * known (e.g. we know that the document was deleted or we received the change
         * that caused the filter mismatch), the new document can be provided
         * to update the remote document cache.
         */
        // Visible for testing.
        at(t, e, n) {
            if (!this.ft(t)) return;
            const s = this.lt(t);
            this.It(t, e) ? s.Y(e, 1 /* Removed */) : 
            // The document may have entered and left the target before we raised a
            // snapshot, so we can just ignore the change.
            s.X(e), this.rt = this.rt.insert(e, this.Et(e).delete(t)), n && (this.it = this.it.insert(e, n));
        }
        removeTarget(t) {
            this.st.delete(t);
        }
        /**
         * Returns the current count of documents in the target. This includes both
         * the number of documents that the LocalStore considers to be part of the
         * target as well as any accumulated changes.
         */    gt(t) {
            const e = this.lt(t).H();
            return this.nt.getRemoteKeysForTarget(t).size + e.addedDocuments.size - e.removedDocuments.size;
        }
        /**
         * Increment the number of acks needed from watch before we can consider the
         * server to be 'in-sync' with the client's active targets.
         */    Z(t) {
            this.lt(t).Z();
        }
        lt(t) {
            let e = this.st.get(t);
            return e || (e = new Kn, this.st.set(t, e)), e;
        }
        Et(t) {
            let e = this.rt.get(t);
            return e || (e = new bn(rt), this.rt = this.rt.insert(t, e)), e;
        }
        /**
         * Verifies that the user is still interested in this target (by calling
         * `getTargetDataForTarget()`) and that we are not waiting for pending ADDs
         * from watch.
         */    ft(t) {
            const e = null !== this.wt(t);
            return e || M("WatchChangeAggregator", "Detected inactive target", t), e;
        }
        /**
         * Returns the TargetData for an active target (i.e. a target that the user
         * is still interested in that has no outstanding target change requests).
         */    wt(t) {
            const e = this.st.get(t);
            return e && e.G ? null : this.nt.Tt(t);
        }
        /**
         * Resets the state of a Watch target to its initial state (e.g. sets
         * 'current' to false, clears the resume token and removes its target mapping
         * from all documents).
         */    dt(t) {
            this.st.set(t, new Kn);
            this.nt.getRemoteKeysForTarget(t).forEach((e => {
                this.at(t, e, /*updatedDocument=*/ null);
            }));
        }
        /**
         * Returns whether the LocalStore considers the document to be part of the
         * specified target.
         */    It(t, e) {
            return this.nt.getRemoteKeysForTarget(t).has(e);
        }
    }

    function jn() {
        return new An(Nt.comparator);
    }

    function Qn() {
        return new An(Nt.comparator);
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ const Wn = (() => {
        const t = {
            asc: "ASCENDING",
            desc: "DESCENDING"
        };
        return t;
    })(), zn = (() => {
        const t = {
            "<": "LESS_THAN",
            "<=": "LESS_THAN_OR_EQUAL",
            ">": "GREATER_THAN",
            ">=": "GREATER_THAN_OR_EQUAL",
            "==": "EQUAL",
            "!=": "NOT_EQUAL",
            "array-contains": "ARRAY_CONTAINS",
            in: "IN",
            "not-in": "NOT_IN",
            "array-contains-any": "ARRAY_CONTAINS_ANY"
        };
        return t;
    })();

    /**
     * This class generates JsonObject values for the Datastore API suitable for
     * sending to either GRPC stub methods or via the JSON/HTTP REST API.
     *
     * The serializer supports both Protobuf.js and Proto3 JSON formats. By
     * setting `useProto3Json` to true, the serializer will use the Proto3 JSON
     * format.
     *
     * For a description of the Proto3 JSON format check
     * https://developers.google.com/protocol-buffers/docs/proto3#json
     *
     * TODO(klimt): We can remove the databaseId argument if we keep the full
     * resource name in documents.
     */
    class Hn {
        constructor(t, e) {
            this.databaseId = t, this.N = e;
        }
    }

    /**
     * Returns a value for a Date that's appropriate to put into a proto.
     */
    function Jn(t, e) {
        if (t.N) {
            return `${new Date(1e3 * e.seconds).toISOString().replace(/\.\d*/, "").replace("Z", "")}.${("000000000" + e.nanoseconds).slice(-9)}Z`;
        }
        return {
            seconds: "" + e.seconds,
            nanos: e.nanoseconds
        };
    }

    /**
     * Returns a value for bytes that's appropriate to put in a proto.
     *
     * Visible for testing.
     */
    function Yn(t, e) {
        return t.N ? e.toBase64() : e.toUint8Array();
    }

    /**
     * Returns a ByteString based on the proto string value.
     */ function Xn(t, e) {
        return Jn(t, e.toTimestamp());
    }

    function Zn(t) {
        return U(!!t), at.fromTimestamp(function(t) {
            const e = Et(t);
            return new ut(e.seconds, e.nanos);
        }(t));
    }

    function ts(t, e) {
        return function(t) {
            return new _t([ "projects", t.projectId, "databases", t.database ]);
        }(t).child("documents").child(e).canonicalString();
    }

    function es(t) {
        const e = _t.fromString(t);
        return U(vs(e)), e;
    }

    function ns(t, e) {
        return ts(t.databaseId, e.path);
    }

    function ss(t, e) {
        const n = es(e);
        if (n.get(1) !== t.databaseId.projectId) throw new j(G.INVALID_ARGUMENT, "Tried to deserialize key from different project: " + n.get(1) + " vs " + t.databaseId.projectId);
        if (n.get(3) !== t.databaseId.database) throw new j(G.INVALID_ARGUMENT, "Tried to deserialize key from different database: " + n.get(3) + " vs " + t.databaseId.database);
        return new Nt(cs(n));
    }

    function is(t, e) {
        return ts(t.databaseId, e);
    }

    function rs(t) {
        const e = es(t);
        // In v1beta1 queries for collections at the root did not have a trailing
        // "/documents". In v1 all resource paths contain "/documents". Preserve the
        // ability to read the v1beta1 form for compatibility with queries persisted
        // in the local target cache.
            return 4 === e.length ? _t.emptyPath() : cs(e);
    }

    function os(t) {
        return new _t([ "projects", t.databaseId.projectId, "databases", t.databaseId.database ]).canonicalString();
    }

    function cs(t) {
        return U(t.length > 4 && "documents" === t.get(4)), t.popFirst(5);
    }

    /** Creates a Document proto from key and fields (but no create/update time) */ function us(t, e, n) {
        return {
            name: ns(t, e),
            fields: n.value.mapValue.fields
        };
    }

    function ls(t, e) {
        let n;
        if ("targetChange" in e) {
            e.targetChange;
            // proto3 default value is unset in JSON (undefined), so use 'NO_CHANGE'
            // if unset
            const s = function(t) {
                return "NO_CHANGE" === t ? 0 /* NoChange */ : "ADD" === t ? 1 /* Added */ : "REMOVE" === t ? 2 /* Removed */ : "CURRENT" === t ? 3 /* Current */ : "RESET" === t ? 4 /* Reset */ : L();
            }(e.targetChange.targetChangeType || "NO_CHANGE"), i = e.targetChange.targetIds || [], r = function(t, e) {
                return t.N ? (U(void 0 === e || "string" == typeof e), pt.fromBase64String(e || "")) : (U(void 0 === e || e instanceof Uint8Array), 
                pt.fromUint8Array(e || new Uint8Array));
            }(t, e.targetChange.resumeToken), o = e.targetChange.cause, c = o && function(t) {
                const e = void 0 === t.code ? G.UNKNOWN : Tn(t.code);
                return new j(e, t.message || "");
            }
            /**
     * Returns a value for a number (or null) that's appropriate to put into
     * a google.protobuf.Int32Value proto.
     * DO NOT USE THIS FOR ANYTHING ELSE.
     * This method cheats. It's typed as returning "number" because that's what
     * our generated proto interfaces say Int32Value must be. But GRPC actually
     * expects a { value: <number> } struct.
     */ (o);
            n = new qn(s, i, r, c || null);
        } else if ("documentChange" in e) {
            e.documentChange;
            const s = e.documentChange;
            s.document, s.document.name, s.document.updateTime;
            const i = ss(t, s.document.name), r = Zn(s.document.updateTime), o = new zt({
                mapValue: {
                    fields: s.document.fields
                }
            }), c = Jt.newFoundDocument(i, r, o), u = s.targetIds || [], a = s.removedTargetIds || [];
            n = new Ln(u, a, c.key, c);
        } else if ("documentDelete" in e) {
            e.documentDelete;
            const s = e.documentDelete;
            s.document;
            const i = ss(t, s.document), r = s.readTime ? Zn(s.readTime) : at.min(), o = Jt.newNoDocument(i, r), c = s.removedTargetIds || [];
            n = new Ln([], c, o.key, o);
        } else if ("documentRemove" in e) {
            e.documentRemove;
            const s = e.documentRemove;
            s.document;
            const i = ss(t, s.document), r = s.removedTargetIds || [];
            n = new Ln([], r, i, null);
        } else {
            if (!("filter" in e)) return L();
            {
                e.filter;
                const t = e.filter;
                t.targetId;
                const s = t.count || 0, i = new yn(s), r = t.targetId;
                n = new Un(r, i);
            }
        }
        return n;
    }

    function fs(t, e) {
        let n;
        if (e instanceof ln) n = {
            update: us(t, e.key, e.value)
        }; else if (e instanceof mn) n = {
            delete: ns(t, e.key)
        }; else if (e instanceof fn) n = {
            update: us(t, e.key, e.data),
            updateMask: bs(e.fieldMask)
        }; else {
            if (!(e instanceof gn)) return L();
            n = {
                verify: ns(t, e.key)
            };
        }
        return e.fieldTransforms.length > 0 && (n.updateTransforms = e.fieldTransforms.map((t => function(t, e) {
            const n = e.transform;
            if (n instanceof je) return {
                fieldPath: e.field.canonicalString(),
                setToServerValue: "REQUEST_TIME"
            };
            if (n instanceof Qe) return {
                fieldPath: e.field.canonicalString(),
                appendMissingElements: {
                    values: n.elements
                }
            };
            if (n instanceof ze) return {
                fieldPath: e.field.canonicalString(),
                removeAllFromArray: {
                    values: n.elements
                }
            };
            if (n instanceof Je) return {
                fieldPath: e.field.canonicalString(),
                increment: n.k
            };
            throw L();
        }(0, t)))), e.precondition.isNone || (n.currentDocument = function(t, e) {
            return void 0 !== e.updateTime ? {
                updateTime: Xn(t, e.updateTime)
            } : void 0 !== e.exists ? {
                exists: e.exists
            } : L();
        }(t, e.precondition)), n;
    }

    function _s(t, e) {
        return t && t.length > 0 ? (U(void 0 !== e), t.map((t => function(t, e) {
            // NOTE: Deletes don't have an updateTime.
            let n = t.updateTime ? Zn(t.updateTime) : Zn(e);
            return n.isEqual(at.min()) && (
            // The Firestore Emulator currently returns an update time of 0 for
            // deletes of non-existing documents (rather than null). This breaks the
            // test "get deleted doc while offline with source=cache" as NoDocuments
            // with version 0 are filtered by IndexedDb's RemoteDocumentCache.
            // TODO(#2149): Remove this when Emulator is fixed
            n = Zn(e)), new en(n, t.transformResults || []);
        }(t, e)))) : [];
    }

    function ws(t, e) {
        return {
            documents: [ is(t, e.path) ]
        };
    }

    function ms(t, e) {
        // Dissect the path into parent, collectionId, and optional key filter.
        const n = {
            structuredQuery: {}
        }, s = e.path;
        null !== e.collectionGroup ? (n.parent = is(t, s), n.structuredQuery.from = [ {
            collectionId: e.collectionGroup,
            allDescendants: !0
        } ]) : (n.parent = is(t, s.popLast()), n.structuredQuery.from = [ {
            collectionId: s.lastSegment()
        } ]);
        const i = function(t) {
            if (0 === t.length) return;
            const e = t.map((t => 
            // visible for testing
            function(t) {
                if ("==" /* EQUAL */ === t.op) {
                    if (jt(t.value)) return {
                        unaryFilter: {
                            field: Ts(t.field),
                            op: "IS_NAN"
                        }
                    };
                    if (Gt(t.value)) return {
                        unaryFilter: {
                            field: Ts(t.field),
                            op: "IS_NULL"
                        }
                    };
                } else if ("!=" /* NOT_EQUAL */ === t.op) {
                    if (jt(t.value)) return {
                        unaryFilter: {
                            field: Ts(t.field),
                            op: "IS_NOT_NAN"
                        }
                    };
                    if (Gt(t.value)) return {
                        unaryFilter: {
                            field: Ts(t.field),
                            op: "IS_NOT_NULL"
                        }
                    };
                }
                return {
                    fieldFilter: {
                        field: Ts(t.field),
                        op: Es(t.op),
                        value: t.value
                    }
                };
            }(t)));
            if (1 === e.length) return e[0];
            return {
                compositeFilter: {
                    op: "AND",
                    filters: e
                }
            };
        }(e.filters);
        i && (n.structuredQuery.where = i);
        const r = function(t) {
            if (0 === t.length) return;
            return t.map((t => 
            // visible for testing
            function(t) {
                return {
                    field: Ts(t.field),
                    direction: Is(t.dir)
                };
            }(t)));
        }(e.orderBy);
        r && (n.structuredQuery.orderBy = r);
        const o = function(t, e) {
            return t.N || St(e) ? e : {
                value: e
            };
        }
        /**
     * Returns a number (or null) from a google.protobuf.Int32Value proto.
     */ (t, e.limit);
        var c;
        return null !== o && (n.structuredQuery.limit = o), e.startAt && (n.structuredQuery.startAt = {
            before: (c = e.startAt).inclusive,
            values: c.position
        }), e.endAt && (n.structuredQuery.endAt = function(t) {
            return {
                before: !t.inclusive,
                values: t.position
            };
        }(e.endAt)), n;
    }

    function gs(t) {
        let e = rs(t.parent);
        const n = t.structuredQuery, s = n.from ? n.from.length : 0;
        let i = null;
        if (s > 0) {
            U(1 === s);
            const t = n.from[0];
            t.allDescendants ? i = t.collectionId : e = e.child(t.collectionId);
        }
        let r = [];
        n.where && (r = ps(n.where));
        let o = [];
        n.orderBy && (o = n.orderBy.map((t => function(t) {
            return new ge(As(t.field), 
            // visible for testing
            function(t) {
                switch (t) {
                  case "ASCENDING":
                    return "asc" /* ASCENDING */;

                  case "DESCENDING":
                    return "desc" /* DESCENDING */;

                  default:
                    return;
                }
            }
            // visible for testing
            (t.direction));
        }(t))));
        let c = null;
        n.limit && (c = function(t) {
            let e;
            return e = "object" == typeof t ? t.value : t, St(e) ? null : e;
        }(n.limit));
        let u = null;
        n.startAt && (u = function(t) {
            const e = !!t.before, n = t.values || [];
            return new me(n, e);
        }(n.startAt));
        let a = null;
        return n.endAt && (a = function(t) {
            const e = !t.before, n = t.values || [];
            return new me(n, e);
        }
        // visible for testing
        (n.endAt)), Te(e, i, o, r, c, "F" /* First */ , u, a);
    }

    function ys(t, e) {
        const n = function(t, e) {
            switch (e) {
              case 0 /* Listen */ :
                return null;

              case 1 /* ExistenceFilterMismatch */ :
                return "existence-filter-mismatch";

              case 2 /* LimboResolution */ :
                return "limbo-document";

              default:
                return L();
            }
        }(0, e.purpose);
        return null == n ? null : {
            "goog-listen-tags": n
        };
    }

    function ps(t) {
        return t ? void 0 !== t.unaryFilter ? [ Ps(t) ] : void 0 !== t.fieldFilter ? [ Rs(t) ] : void 0 !== t.compositeFilter ? t.compositeFilter.filters.map((t => ps(t))).reduce(((t, e) => t.concat(e))) : L() : [];
    }

    function Is(t) {
        return Wn[t];
    }

    function Es(t) {
        return zn[t];
    }

    function Ts(t) {
        return {
            fieldPath: t.canonicalString()
        };
    }

    function As(t) {
        return mt.fromServerFormat(t.fieldPath);
    }

    function Rs(t) {
        return ce.create(As(t.fieldFilter.field), function(t) {
            switch (t) {
              case "EQUAL":
                return "==" /* EQUAL */;

              case "NOT_EQUAL":
                return "!=" /* NOT_EQUAL */;

              case "GREATER_THAN":
                return ">" /* GREATER_THAN */;

              case "GREATER_THAN_OR_EQUAL":
                return ">=" /* GREATER_THAN_OR_EQUAL */;

              case "LESS_THAN":
                return "<" /* LESS_THAN */;

              case "LESS_THAN_OR_EQUAL":
                return "<=" /* LESS_THAN_OR_EQUAL */;

              case "ARRAY_CONTAINS":
                return "array-contains" /* ARRAY_CONTAINS */;

              case "IN":
                return "in" /* IN */;

              case "NOT_IN":
                return "not-in" /* NOT_IN */;

              case "ARRAY_CONTAINS_ANY":
                return "array-contains-any" /* ARRAY_CONTAINS_ANY */;

              default:
                return L();
            }
        }(t.fieldFilter.op), t.fieldFilter.value);
    }

    function Ps(t) {
        switch (t.unaryFilter.op) {
          case "IS_NAN":
            const e = As(t.unaryFilter.field);
            return ce.create(e, "==" /* EQUAL */ , {
                doubleValue: NaN
            });

          case "IS_NULL":
            const n = As(t.unaryFilter.field);
            return ce.create(n, "==" /* EQUAL */ , {
                nullValue: "NULL_VALUE"
            });

          case "IS_NOT_NAN":
            const s = As(t.unaryFilter.field);
            return ce.create(s, "!=" /* NOT_EQUAL */ , {
                doubleValue: NaN
            });

          case "IS_NOT_NULL":
            const i = As(t.unaryFilter.field);
            return ce.create(i, "!=" /* NOT_EQUAL */ , {
                nullValue: "NULL_VALUE"
            });

          default:
            return L();
        }
    }

    function bs(t) {
        const e = [];
        return t.fields.forEach((t => e.push(t.canonicalString()))), {
            fieldPaths: e
        };
    }

    function vs(t) {
        // Resource names have at least 4 components (project ID, database ID)
        return t.length >= 4 && "projects" === t.get(0) && "databases" === t.get(2);
    }

    // V2 is no longer usable (see comment at top of file)
    // Visible for testing
    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const ei = "The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";

    /**
     * A base class representing a persistence transaction, encapsulating both the
     * transaction's sequence numbers as well as a list of onCommitted listeners.
     *
     * When you call Persistence.runTransaction(), it will create a transaction and
     * pass it to your callback. You then pass it to any method that operates
     * on persistence.
     */ class ni {
        constructor() {
            this.onCommittedListeners = [];
        }
        addOnCommittedListener(t) {
            this.onCommittedListeners.push(t);
        }
        raiseOnCommittedEvent() {
            this.onCommittedListeners.forEach((t => t()));
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * PersistencePromise is essentially a re-implementation of Promise except
     * it has a .next() method instead of .then() and .next() and .catch() callbacks
     * are executed synchronously when a PersistencePromise resolves rather than
     * asynchronously (Promise implementations use setImmediate() or similar).
     *
     * This is necessary to interoperate with IndexedDB which will automatically
     * commit transactions if control is returned to the event loop without
     * synchronously initiating another operation on the transaction.
     *
     * NOTE: .then() and .catch() only allow a single consumer, unlike normal
     * Promises.
     */ class si {
        constructor(t) {
            // NOTE: next/catchCallback will always point to our own wrapper functions,
            // not the user's raw next() or catch() callbacks.
            this.nextCallback = null, this.catchCallback = null, 
            // When the operation resolves, we'll set result or error and mark isDone.
            this.result = void 0, this.error = void 0, this.isDone = !1, 
            // Set to true when .then() or .catch() are called and prevents additional
            // chaining.
            this.callbackAttached = !1, t((t => {
                this.isDone = !0, this.result = t, this.nextCallback && 
                // value should be defined unless T is Void, but we can't express
                // that in the type system.
                this.nextCallback(t);
            }), (t => {
                this.isDone = !0, this.error = t, this.catchCallback && this.catchCallback(t);
            }));
        }
        catch(t) {
            return this.next(void 0, t);
        }
        next(t, e) {
            return this.callbackAttached && L(), this.callbackAttached = !0, this.isDone ? this.error ? this.wrapFailure(e, this.error) : this.wrapSuccess(t, this.result) : new si(((n, s) => {
                this.nextCallback = e => {
                    this.wrapSuccess(t, e).next(n, s);
                }, this.catchCallback = t => {
                    this.wrapFailure(e, t).next(n, s);
                };
            }));
        }
        toPromise() {
            return new Promise(((t, e) => {
                this.next(t, e);
            }));
        }
        wrapUserFunction(t) {
            try {
                const e = t();
                return e instanceof si ? e : si.resolve(e);
            } catch (t) {
                return si.reject(t);
            }
        }
        wrapSuccess(t, e) {
            return t ? this.wrapUserFunction((() => t(e))) : si.resolve(e);
        }
        wrapFailure(t, e) {
            return t ? this.wrapUserFunction((() => t(e))) : si.reject(e);
        }
        static resolve(t) {
            return new si(((e, n) => {
                e(t);
            }));
        }
        static reject(t) {
            return new si(((e, n) => {
                n(t);
            }));
        }
        static waitFor(
        // Accept all Promise types in waitFor().
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        t) {
            return new si(((e, n) => {
                let s = 0, i = 0, r = !1;
                t.forEach((t => {
                    ++s, t.next((() => {
                        ++i, r && i === s && e();
                    }), (t => n(t)));
                })), r = !0, i === s && e();
            }));
        }
        /**
         * Given an array of predicate functions that asynchronously evaluate to a
         * boolean, implements a short-circuiting `or` between the results. Predicates
         * will be evaluated until one of them returns `true`, then stop. The final
         * result will be whether any of them returned `true`.
         */    static or(t) {
            let e = si.resolve(!1);
            for (const n of t) e = e.next((t => t ? si.resolve(t) : n()));
            return e;
        }
        static forEach(t, e) {
            const n = [];
            return t.forEach(((t, s) => {
                n.push(e.call(this, t, s));
            })), this.waitFor(n);
        }
    }

    /** Verifies whether `e` is an IndexedDbTransactionError. */ function ui(t) {
        // Use name equality, as instanceof checks on errors don't work with errors
        // that wrap other errors.
        return "IndexedDbTransactionError" === t.name;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A batch of mutations that will be sent as one unit to the backend.
     */ class wi {
        /**
         * @param batchId - The unique ID of this mutation batch.
         * @param localWriteTime - The original write time of this mutation.
         * @param baseMutations - Mutations that are used to populate the base
         * values when this mutation is applied locally. This can be used to locally
         * overwrite values that are persisted in the remote document cache. Base
         * mutations are never sent to the backend.
         * @param mutations - The user-provided mutations in this mutation batch.
         * User-provided mutations are applied both locally and remotely on the
         * backend.
         */
        constructor(t, e, n, s) {
            this.batchId = t, this.localWriteTime = e, this.baseMutations = n, this.mutations = s;
        }
        /**
         * Applies all the mutations in this MutationBatch to the specified document
         * to compute the state of the remote document
         *
         * @param document - The document to apply mutations to.
         * @param batchResult - The result of applying the MutationBatch to the
         * backend.
         */    applyToRemoteDocument(t, e) {
            const n = e.mutationResults;
            for (let e = 0; e < this.mutations.length; e++) {
                const s = this.mutations[e];
                if (s.key.isEqual(t.key)) {
                    on(s, t, n[e]);
                }
            }
        }
        /**
         * Computes the local view of a document given all the mutations in this
         * batch.
         *
         * @param document - The document to apply mutations to.
         */    applyToLocalView(t) {
            // First, apply the base state. This allows us to apply non-idempotent
            // transform against a consistent set of values.
            for (const e of this.baseMutations) e.key.isEqual(t.key) && cn(e, t, this.localWriteTime);
            // Second, apply all user-provided mutations.
                    for (const e of this.mutations) e.key.isEqual(t.key) && cn(e, t, this.localWriteTime);
        }
        /**
         * Computes the local view for all provided documents given the mutations in
         * this batch.
         */    applyToLocalDocumentSet(t) {
            // TODO(mrschmidt): This implementation is O(n^2). If we apply the mutations
            // directly (as done in `applyToLocalView()`), we can reduce the complexity
            // to O(n).
            this.mutations.forEach((e => {
                const n = t.get(e.key), s = n;
                // TODO(mutabledocuments): This method should take a MutableDocumentMap
                // and we should remove this cast.
                            this.applyToLocalView(s), n.isValidDocument() || s.convertToNoDocument(at.min());
            }));
        }
        keys() {
            return this.mutations.reduce(((t, e) => t.add(e.key)), On());
        }
        isEqual(t) {
            return this.batchId === t.batchId && ot(this.mutations, t.mutations, ((t, e) => an(t, e))) && ot(this.baseMutations, t.baseMutations, ((t, e) => an(t, e)));
        }
    }

    /** The result of applying a mutation batch to the backend. */ class mi {
        constructor(t, e, n, 
        /**
         * A pre-computed mapping from each mutated document to the resulting
         * version.
         */
        s) {
            this.batch = t, this.commitVersion = e, this.mutationResults = n, this.docVersions = s;
        }
        /**
         * Creates a new MutationBatchResult for the given batch and results. There
         * must be one result for each mutation in the batch. This static factory
         * caches a document=&gt;version mapping (docVersions).
         */    static from(t, e, n) {
            U(t.mutations.length === n.length);
            let s = xn;
            const i = t.mutations;
            for (let t = 0; t < i.length; t++) s = s.insert(i[t].key, n[t].version);
            return new mi(t, e, n, s);
        }
    }

    /**
     * @license
     * Copyright 2022 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Representation of an overlay computed by Firestore.
     *
     * Holds information about a mutation and the largest batch id in Firestore when
     * the mutation was created.
     */ class gi {
        constructor(t, e) {
            this.largestBatchId = t, this.mutation = e;
        }
        getKey() {
            return this.mutation.key;
        }
        isEqual(t) {
            return null !== t && this.mutation === t.mutation;
        }
        toString() {
            return `Overlay{\n      largestBatchId: ${this.largestBatchId},\n      mutation: ${this.mutation.toString()}\n    }`;
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * An immutable set of metadata that the local store tracks for each target.
     */ class yi {
        constructor(
        /** The target being listened to. */
        t, 
        /**
         * The target ID to which the target corresponds; Assigned by the
         * LocalStore for user listens and by the SyncEngine for limbo watches.
         */
        e, 
        /** The purpose of the target. */
        n, 
        /**
         * The sequence number of the last transaction during which this target data
         * was modified.
         */
        s, 
        /** The latest snapshot version seen for this target. */
        i = at.min()
        /**
         * The maximum snapshot version at which the associated view
         * contained no limbo documents.
         */ , r = at.min()
        /**
         * An opaque, server-assigned token that allows watching a target to be
         * resumed after disconnecting without retransmitting all the data that
         * matches the target. The resume token essentially identifies a point in
         * time from which the server should resume sending results.
         */ , o = pt.EMPTY_BYTE_STRING) {
            this.target = t, this.targetId = e, this.purpose = n, this.sequenceNumber = s, this.snapshotVersion = i, 
            this.lastLimboFreeSnapshotVersion = r, this.resumeToken = o;
        }
        /** Creates a new target data instance with an updated sequence number. */    withSequenceNumber(t) {
            return new yi(this.target, this.targetId, this.purpose, t, this.snapshotVersion, this.lastLimboFreeSnapshotVersion, this.resumeToken);
        }
        /**
         * Creates a new target data instance with an updated resume token and
         * snapshot version.
         */    withResumeToken(t, e) {
            return new yi(this.target, this.targetId, this.purpose, this.sequenceNumber, e, this.lastLimboFreeSnapshotVersion, t);
        }
        /**
         * Creates a new target data instance with an updated last limbo free
         * snapshot version number.
         */    withLastLimboFreeSnapshotVersion(t) {
            return new yi(this.target, this.targetId, this.purpose, this.sequenceNumber, this.snapshotVersion, t, this.resumeToken);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /** Serializer for values stored in the LocalStore. */ class pi {
        constructor(t) {
            this.Ht = t;
        }
    }

    /**
     * A helper function for figuring out what kind of query has been stored.
     */
    /**
     * Encodes a `BundledQuery` from bundle proto to a Query object.
     *
     * This reconstructs the original query used to build the bundle being loaded,
     * including features exists only in SDKs (for example: limit-to-last).
     */
    function Si(t) {
        const e = gs({
            parent: t.parent,
            structuredQuery: t.structuredQuery
        });
        return "LAST" === t.limitType ? Ce(e, e.limit, "L" /* Last */) : e;
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * An in-memory implementation of IndexManager.
     */ class Wi {
        constructor() {
            this.xe = new zi;
        }
        addToCollectionParentIndex(t, e) {
            return this.xe.add(e), si.resolve();
        }
        getCollectionParents(t, e) {
            return si.resolve(this.xe.getEntries(e));
        }
        addFieldIndex(t, e) {
            // Field indices are not supported with memory persistence.
            return si.resolve();
        }
        deleteFieldIndex(t, e) {
            // Field indices are not supported with memory persistence.
            return si.resolve();
        }
        getDocumentsMatchingTarget(t, e, n) {
            // Field indices are not supported with memory persistence.
            return si.resolve(On());
        }
        getFieldIndex(t, e) {
            // Field indices are not supported with memory persistence.
            return si.resolve(null);
        }
        getFieldIndexes(t, e) {
            // Field indices are not supported with memory persistence.
            return si.resolve([]);
        }
        getNextCollectionGroupToUpdate(t) {
            // Field indices are not supported with memory persistence.
            return si.resolve(null);
        }
        updateCollectionGroup(t, e, n) {
            // Field indices are not supported with memory persistence.
            return si.resolve();
        }
        updateIndexEntries(t, e) {
            // Field indices are not supported with memory persistence.
            return si.resolve();
        }
    }

    /**
     * Internal implementation of the collection-parent index exposed by MemoryIndexManager.
     * Also used for in-memory caching by IndexedDbIndexManager and initial index population
     * in indexeddb_schema.ts
     */ class zi {
        constructor() {
            this.index = {};
        }
        // Returns false if the entry already existed.
        add(t) {
            const e = t.lastSegment(), n = t.popLast(), s = this.index[e] || new bn(_t.comparator), i = !s.has(n);
            return this.index[e] = s.add(n), i;
        }
        has(t) {
            const e = t.lastSegment(), n = t.popLast(), s = this.index[e];
            return s && s.has(n);
        }
        getEntries(t) {
            return (this.index[t] || new bn(_t.comparator)).toArray();
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /** Offset to ensure non-overlapping target ids. */
    /**
     * Generates monotonically increasing target IDs for sending targets to the
     * watch stream.
     *
     * The client constructs two generators, one for the target cache, and one for
     * for the sync engine (to generate limbo documents targets). These
     * generators produce non-overlapping IDs (by using even and odd IDs
     * respectively).
     *
     * By separating the target ID space, the query cache can generate target IDs
     * that persist across client restarts, while sync engine can independently
     * generate in-memory target IDs that are transient and can be reused after a
     * restart.
     */
    class ar {
        constructor(t) {
            this.ze = t;
        }
        next() {
            return this.ze += 2, this.ze;
        }
        static He() {
            // The target cache generator must return '2' in its first call to `next()`
            // as there is no differentiation in the protocol layer between an unset
            // number and the number '0'. If we were to sent a target with target ID
            // '0', the backend would consider it unset and replace it with its own ID.
            return new ar(0);
        }
        static Je() {
            // Sync engine assigns target IDs for limbo document detection.
            return new ar(-1);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Verifies the error thrown by a LocalStore operation. If a LocalStore
     * operation fails because the primary lease has been taken by another client,
     * we ignore the error (the persistence layer will immediately call
     * `applyPrimaryLease` to propagate the primary state change). All other errors
     * are re-thrown.
     *
     * @param err - An error returned by a LocalStore operation.
     * @returns A Promise that resolves after we recovered, or the original error.
     */ async function _r(t) {
        if (t.code !== G.FAILED_PRECONDITION || t.message !== ei) throw t;
        M("LocalStore", "Unexpectedly lost primary lease");
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A map implementation that uses objects as keys. Objects must have an
     * associated equals function and must be immutable. Entries in the map are
     * stored together with the key being produced from the mapKeyFn. This map
     * automatically handles collisions of keys.
     */ class Er {
        constructor(t, e) {
            this.mapKeyFn = t, this.equalsFn = e, 
            /**
             * The inner map for a key/value pair. Due to the possibility of collisions we
             * keep a list of entries that we do a linear search through to find an actual
             * match. Note that collisions should be rare, so we still expect near
             * constant time lookups in practice.
             */
            this.inner = {};
        }
        /** Get a value for this key, or undefined if it does not exist. */    get(t) {
            const e = this.mapKeyFn(t), n = this.inner[e];
            if (void 0 !== n) for (const [e, s] of n) if (this.equalsFn(e, t)) return s;
        }
        has(t) {
            return void 0 !== this.get(t);
        }
        /** Put this key and value in the map. */    set(t, e) {
            const n = this.mapKeyFn(t), s = this.inner[n];
            if (void 0 !== s) {
                for (let n = 0; n < s.length; n++) if (this.equalsFn(s[n][0], t)) return void (s[n] = [ t, e ]);
                s.push([ t, e ]);
            } else this.inner[n] = [ [ t, e ] ];
        }
        /**
         * Remove this key from the map. Returns a boolean if anything was deleted.
         */    delete(t) {
            const e = this.mapKeyFn(t), n = this.inner[e];
            if (void 0 === n) return !1;
            for (let s = 0; s < n.length; s++) if (this.equalsFn(n[s][0], t)) return 1 === n.length ? delete this.inner[e] : n.splice(s, 1), 
            !0;
            return !1;
        }
        forEach(t) {
            lt(this.inner, ((e, n) => {
                for (const [e, s] of n) t(e, s);
            }));
        }
        isEmpty() {
            return ft(this.inner);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * An in-memory buffer of entries to be written to a RemoteDocumentCache.
     * It can be used to batch up a set of changes to be written to the cache, but
     * additionally supports reading entries back with the `getEntry()` method,
     * falling back to the underlying RemoteDocumentCache if no entry is
     * buffered.
     *
     * Entries added to the cache *must* be read first. This is to facilitate
     * calculating the size delta of the pending changes.
     *
     * PORTING NOTE: This class was implemented then removed from other platforms.
     * If byte-counting ends up being needed on the other platforms, consider
     * porting this class as part of that implementation work.
     */ class Tr {
        constructor() {
            // A mapping of document key to the new cache entry that should be written.
            this.changes = new Er((t => t.toString()), ((t, e) => t.isEqual(e))), this.changesApplied = !1;
        }
        /**
         * Buffers a `RemoteDocumentCache.addEntry()` call.
         *
         * You can only modify documents that have already been retrieved via
         * `getEntry()/getEntries()` (enforced via IndexedDbs `apply()`).
         */    addEntry(t) {
            this.assertNotApplied(), this.changes.set(t.key, t);
        }
        /**
         * Buffers a `RemoteDocumentCache.removeEntry()` call.
         *
         * You can only remove documents that have already been retrieved via
         * `getEntry()/getEntries()` (enforced via IndexedDbs `apply()`).
         */    removeEntry(t, e) {
            this.assertNotApplied(), this.changes.set(t, Jt.newInvalidDocument(t).setReadTime(e));
        }
        /**
         * Looks up an entry in the cache. The buffered changes will first be checked,
         * and if no buffered change applies, this will forward to
         * `RemoteDocumentCache.getEntry()`.
         *
         * @param transaction - The transaction in which to perform any persistence
         *     operations.
         * @param documentKey - The key of the entry to look up.
         * @returns The cached document or an invalid document if we have nothing
         * cached.
         */    getEntry(t, e) {
            this.assertNotApplied();
            const n = this.changes.get(e);
            return void 0 !== n ? si.resolve(n) : this.getFromCache(t, e);
        }
        /**
         * Looks up several entries in the cache, forwarding to
         * `RemoteDocumentCache.getEntry()`.
         *
         * @param transaction - The transaction in which to perform any persistence
         *     operations.
         * @param documentKeys - The keys of the entries to look up.
         * @returns A map of cached documents, indexed by key. If an entry cannot be
         *     found, the corresponding key will be mapped to an invalid document.
         */    getEntries(t, e) {
            return this.getAllFromCache(t, e);
        }
        /**
         * Applies buffered changes to the underlying RemoteDocumentCache, using
         * the provided transaction.
         */    apply(t) {
            return this.assertNotApplied(), this.changesApplied = !0, this.applyChanges(t);
        }
        /** Helper to assert this.changes is not null  */    assertNotApplied() {}
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A readonly view of the local state of all documents we're tracking (i.e. we
     * have a cached version in remoteDocumentCache or local mutations for the
     * document). The view is computed by applying the mutations in the
     * MutationQueue to the RemoteDocumentCache.
     */ class Mr {
        constructor(t, e, n) {
            this.qn = t, this.gs = e, this.indexManager = n;
        }
        /**
         * Get the local view of the document identified by `key`.
         *
         * @returns Local view of the document or null if we don't have any cached
         * state for it.
         */    ys(t, e) {
            return this.gs.getAllMutationBatchesAffectingDocumentKey(t, e).next((n => this.ps(t, e, n)));
        }
        /** Internal version of `getDocument` that allows reusing batches. */    ps(t, e, n) {
            return this.qn.getEntry(t, e).next((t => {
                for (const e of n) e.applyToLocalView(t);
                return t;
            }));
        }
        // Returns the view of the given `docs` as they would appear after applying
        // all mutations in the given `batches`.
        Is(t, e) {
            t.forEach(((t, n) => {
                for (const t of e) t.applyToLocalView(n);
            }));
        }
        /**
         * Gets the local view of the documents identified by `keys`.
         *
         * If we don't have cached state for a document in `keys`, a NoDocument will
         * be stored for that key in the resulting set.
         */    Es(t, e) {
            return this.qn.getEntries(t, e).next((e => this.Ts(t, e).next((() => e))));
        }
        /**
         * Applies the local view the given `baseDocs` without retrieving documents
         * from the local store.
         */    Ts(t, e) {
            return this.gs.getAllMutationBatchesAffectingDocumentKeys(t, e).next((t => this.Is(e, t)));
        }
        /**
         * Performs a query against the local view of all documents.
         *
         * @param transaction - The persistence transaction.
         * @param query - The query to match documents against.
         * @param sinceReadTime - If not set to SnapshotVersion.min(), return only
         *     documents that have been read since this snapshot version (exclusive).
         */    As(t, e, n) {
            /**
     * Returns whether the query matches a single document by path (rather than a
     * collection).
     */
            return function(t) {
                return Nt.isDocumentKey(t.path) && null === t.collectionGroup && 0 === t.filters.length;
            }(e) ? this.Rs(t, e.path) : Ve(e) ? this.Ps(t, e, n) : this.bs(t, e, n);
        }
        Rs(t, e) {
            // Just do a simple document lookup.
            return this.ys(t, new Nt(e)).next((t => {
                let e = Nn();
                return t.isFoundDocument() && (e = e.insert(t.key, t)), e;
            }));
        }
        Ps(t, e, n) {
            const s = e.collectionGroup;
            let i = Nn();
            return this.indexManager.getCollectionParents(t, s).next((r => si.forEach(r, (r => {
                const o = function(t, e) {
                    return new Ee(e, 
                    /*collectionGroup=*/ null, t.explicitOrderBy.slice(), t.filters.slice(), t.limit, t.limitType, t.startAt, t.endAt);
                }
                /**
     * Returns true if this query does not specify any query constraints that
     * could remove results.
     */ (e, r.child(s));
                return this.bs(t, o, n).next((t => {
                    t.forEach(((t, e) => {
                        i = i.insert(t, e);
                    }));
                }));
            })).next((() => i))));
        }
        bs(t, e, n) {
            // Query the remote documents and overlay mutations.
            let s;
            return this.qn.getAll(t, e.path, n).next((n => (s = n, this.gs.getAllMutationBatchesAffectingQuery(t, e)))).next((t => {
                for (const e of t) for (const t of e.mutations) {
                    const n = t.key;
                    let i = s.get(n);
                    null == i && (
                    // Create invalid document to apply mutations on top of
                    i = Jt.newInvalidDocument(n), s = s.insert(n, i)), cn(t, i, e.localWriteTime), i.isFoundDocument() || (s = s.remove(n));
                }
            })).next((() => (
            // Finally, filter out any documents that don't actually match
            // the query.
            s.forEach(((t, n) => {
                Oe(e, n) || (s = s.remove(t));
            })), s)));
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A set of changes to what documents are currently in view and out of view for
     * a given query. These changes are sent to the LocalStore by the View (via
     * the SyncEngine) and are used to pin / unpin documents as appropriate.
     */ class $r {
        constructor(t, e, n, s) {
            this.targetId = t, this.fromCache = e, this.vs = n, this.Vs = s;
        }
        static Ss(t, e) {
            let n = On(), s = On();
            for (const t of e.docChanges) switch (t.type) {
              case 0 /* Added */ :
                n = n.add(t.doc.key);
                break;

              case 1 /* Removed */ :
                s = s.add(t.doc.key);
     // do nothing
                    }
            return new $r(t, e.fromCache, n, s);
        }
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A query engine that takes advantage of the target document mapping in the
     * QueryCache. Query execution is optimized by only reading the documents that
     * previously matched a query plus any documents that were edited after the
     * query was last listened to.
     *
     * There are some cases when this optimization is not guaranteed to produce
     * the same results as full collection scans. In these cases, query
     * processing falls back to full scans. These cases are:
     *
     * - Limit queries where a document that matched the query previously no longer
     *   matches the query.
     *
     * - Limit queries where a document edit may cause the document to sort below
     *   another document that is in the local cache.
     *
     * - Queries that have never been CURRENT or free of limbo documents.
     */ class Fr {
        /** Sets the document view to query against. */
        Ds(t) {
            this.Cs = t;
        }
        /** Returns all local documents matching the specified query. */    As(t, e, n, s) {
            // Queries that match all documents don't benefit from using
            // key-based lookups. It is more efficient to scan all documents in a
            // collection, rather than to perform individual lookups.
            return function(t) {
                return 0 === t.filters.length && null === t.limit && null == t.startAt && null == t.endAt && (0 === t.explicitOrderBy.length || 1 === t.explicitOrderBy.length && t.explicitOrderBy[0].field.isKeyField());
            }(e) || n.isEqual(at.min()) ? this.Ns(t, e) : this.Cs.Es(t, s).next((i => {
                const r = this.xs(e, i);
                return (Re(e) || Pe(e)) && this.ks(e.limitType, r, s, n) ? this.Ns(t, e) : (k() <= LogLevel.DEBUG && M("QueryEngine", "Re-using previous result from %s to execute query: %s", n.toString(), ke(e)), 
                this.Cs.As(t, e, n).next((t => (
                // We merge `previousResults` into `updateResults`, since
                // `updateResults` is already a DocumentMap. If a document is
                // contained in both lists, then its contents are the same.
                r.forEach((e => {
                    t = t.insert(e.key, e);
                })), t))));
            }));
            // Queries that have never seen a snapshot without limbo free documents
            // should also be run as a full collection scan.
            }
        /** Applies the query filter and sorting to the provided documents.  */    xs(t, e) {
            // Sort the documents and re-apply the query filter since previously
            // matching documents do not necessarily still match the query.
            let n = new bn(Me(t));
            return e.forEach(((e, s) => {
                Oe(t, s) && (n = n.add(s));
            })), n;
        }
        /**
         * Determines if a limit query needs to be refilled from cache, making it
         * ineligible for index-free execution.
         *
         * @param sortedPreviousResults - The documents that matched the query when it
         * was last synchronized, sorted by the query's comparator.
         * @param remoteKeys - The document keys that matched the query at the last
         * snapshot.
         * @param limboFreeSnapshotVersion - The version of the snapshot when the
         * query was last synchronized.
         */    ks(t, e, n, s) {
            // The query needs to be refilled if a previously matching document no
            // longer matches.
            if (n.size !== e.size) return !0;
            // Limit queries are not eligible for index-free query execution if there is
            // a potential that an older document from cache now sorts before a document
            // that was previously part of the limit. This, however, can only happen if
            // the document at the edge of the limit goes out of limit.
            // If a document that is not the limit boundary sorts differently,
            // the boundary of the limit itself did not change and documents from cache
            // will continue to be "rejected" by this boundary. Therefore, we can ignore
            // any modifications that don't affect the last document.
                    const i = "F" /* First */ === t ? e.last() : e.first();
            return !!i && (i.hasPendingWrites || i.version.compareTo(s) > 0);
        }
        Ns(t, e) {
            return k() <= LogLevel.DEBUG && M("QueryEngine", "Using full collection scan to execute query:", ke(e)), 
            this.Cs.As(t, e, at.min());
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Implements `LocalStore` interface.
     *
     * Note: some field defined in this class might have public access level, but
     * the class is not exported so they are only accessible from this module.
     * This is useful to implement optional features (like bundles) in free
     * functions, such that they are tree-shakeable.
     */
    class Br {
        constructor(
        /** Manages our in-memory or durable persistence. */
        t, e, n, s) {
            this.persistence = t, this.Os = e, this.O = s, 
            /**
             * Maps a targetID to data about its target.
             *
             * PORTING NOTE: We are using an immutable data structure on Web to make re-runs
             * of `applyRemoteEvent()` idempotent.
             */
            this.Ms = new An(rt), 
            /** Maps a target to its targetID. */
            // TODO(wuandy): Evaluate if TargetId can be part of Target.
            this.$s = new Er((t => se(t)), re), 
            /**
             * The read time of the last entry processed by `getNewDocumentChanges()`.
             *
             * PORTING NOTE: This is only used for multi-tab synchronization.
             */
            this.Fs = at.min(), this.Bs = t.getRemoteDocumentCache(), this.Un = t.getTargetCache(), 
            this.Kn = t.getBundleCache(), this.Ls(n);
        }
        Ls(t) {
            // TODO(indexing): Add spec tests that test these components change after a
            // user change
            this.indexManager = this.persistence.getIndexManager(t), this.gs = this.persistence.getMutationQueue(t, this.indexManager), 
            this.Us = new Mr(this.Bs, this.gs, this.indexManager), this.Bs.setIndexManager(this.indexManager), 
            this.Os.Ds(this.Us);
        }
        collectGarbage(t) {
            return this.persistence.runTransaction("Collect garbage", "readwrite-primary", (e => t.collect(e, this.Ms)));
        }
    }

    function Lr(
    /** Manages our in-memory or durable persistence. */
    t, e, n, s) {
        return new Br(t, e, n, s);
    }

    /**
     * Tells the LocalStore that the currently authenticated user has changed.
     *
     * In response the local store switches the mutation queue to the new user and
     * returns any resulting document changes.
     */
    // PORTING NOTE: Android and iOS only return the documents affected by the
    // change.
    async function Ur(t, e) {
        const n = K(t);
        return await n.persistence.runTransaction("Handle user change", "readonly", (t => {
            // Swap out the mutation queue, grabbing the pending mutation batches
            // before and after.
            let s;
            return n.gs.getAllMutationBatches(t).next((i => (s = i, n.Ls(e), n.gs.getAllMutationBatches(t)))).next((e => {
                const i = [], r = [];
                // Union the old/new changed keys.
                let o = On();
                for (const t of s) {
                    i.push(t.batchId);
                    for (const e of t.mutations) o = o.add(e.key);
                }
                for (const t of e) {
                    r.push(t.batchId);
                    for (const e of t.mutations) o = o.add(e.key);
                }
                // Return the set of all (potentially) changed documents and the list
                // of mutation batch IDs that were affected by change.
                            return n.Us.Es(t, o).next((t => ({
                    qs: t,
                    removedBatchIds: i,
                    addedBatchIds: r
                })));
            }));
        }));
    }

    /* Accepts locally generated Mutations and commit them to storage. */
    /**
     * Acknowledges the given batch.
     *
     * On the happy path when a batch is acknowledged, the local store will
     *
     *  + remove the batch from the mutation queue;
     *  + apply the changes to the remote document cache;
     *  + recalculate the latency compensated view implied by those changes (there
     *    may be mutations in the queue that affect the documents but haven't been
     *    acknowledged yet); and
     *  + give the changed documents back the sync engine
     *
     * @returns The resulting (modified) documents.
     */
    function qr(t, e) {
        const n = K(t);
        return n.persistence.runTransaction("Acknowledge batch", "readwrite-primary", (t => {
            const s = e.batch.keys(), i = n.Bs.newChangeBuffer({
                trackRemovals: !0
            });
            return function(t, e, n, s) {
                const i = n.batch, r = i.keys();
                let o = si.resolve();
                return r.forEach((t => {
                    o = o.next((() => s.getEntry(e, t))).next((e => {
                        const r = n.docVersions.get(t);
                        U(null !== r), e.version.compareTo(r) < 0 && (i.applyToRemoteDocument(e, n), e.isValidDocument() && (
                        // We use the commitVersion as the readTime rather than the
                        // document's updateTime since the updateTime is not advanced
                        // for updates that do not modify the underlying document.
                        e.setReadTime(n.commitVersion), s.addEntry(e)));
                    }));
                })), o.next((() => t.gs.removeMutationBatch(e, i)));
            }
            /** Returns the local view of the documents affected by a mutation batch. */
            // PORTING NOTE: Multi-Tab only.
            (n, t, e, i).next((() => i.apply(t))).next((() => n.gs.performConsistencyCheck(t))).next((() => n.Us.Es(t, s)));
        }));
    }

    /**
     * Removes mutations from the MutationQueue for the specified batch;
     * LocalDocuments will be recalculated.
     *
     * @returns The resulting modified documents.
     */
    /**
     * Returns the last consistent snapshot processed (used by the RemoteStore to
     * determine whether to buffer incoming snapshots from the backend).
     */
    function Kr(t) {
        const e = K(t);
        return e.persistence.runTransaction("Get last remote snapshot version", "readonly", (t => e.Un.getLastRemoteSnapshotVersion(t)));
    }

    /**
     * Updates the "ground-state" (remote) documents. We assume that the remote
     * event reflects any write batches that have been acknowledged or rejected
     * (i.e. we do not re-apply local mutations to updates from this event).
     *
     * LocalDocuments are re-calculated if there are remaining mutations in the
     * queue.
     */ function Gr(t, e) {
        const n = K(t), s = e.snapshotVersion;
        let i = n.Ms;
        return n.persistence.runTransaction("Apply remote event", "readwrite-primary", (t => {
            const r = n.Bs.newChangeBuffer({
                trackRemovals: !0
            });
            // Reset newTargetDataByTargetMap in case this transaction gets re-run.
                    i = n.Ms;
            const o = [];
            e.targetChanges.forEach(((r, c) => {
                const u = i.get(c);
                if (!u) return;
                // Only update the remote keys if the target is still active. This
                // ensures that we can persist the updated target data along with
                // the updated assignment.
                            o.push(n.Un.removeMatchingKeys(t, r.removedDocuments, c).next((() => n.Un.addMatchingKeys(t, r.addedDocuments, c))));
                let a = u.withSequenceNumber(t.currentSequenceNumber);
                e.targetMismatches.has(c) ? a = a.withResumeToken(pt.EMPTY_BYTE_STRING, at.min()).withLastLimboFreeSnapshotVersion(at.min()) : r.resumeToken.approximateByteSize() > 0 && (a = a.withResumeToken(r.resumeToken, s)), 
                i = i.insert(c, a), 
                // Update the target data if there are target changes (or if
                // sufficient time has passed since the last update).
                /**
     * Returns true if the newTargetData should be persisted during an update of
     * an active target. TargetData should always be persisted when a target is
     * being released and should not call this function.
     *
     * While the target is active, TargetData updates can be omitted when nothing
     * about the target has changed except metadata like the resume token or
     * snapshot version. Occasionally it's worth the extra write to prevent these
     * values from getting too stale after a crash, but this doesn't have to be
     * too frequent.
     */
                function(t, e, n) {
                    // Always persist target data if we don't already have a resume token.
                    if (0 === t.resumeToken.approximateByteSize()) return !0;
                    // Don't allow resume token changes to be buffered indefinitely. This
                    // allows us to be reasonably up-to-date after a crash and avoids needing
                    // to loop over all active queries on shutdown. Especially in the browser
                    // we may not get time to do anything interesting while the current tab is
                    // closing.
                                    if (e.snapshotVersion.toMicroseconds() - t.snapshotVersion.toMicroseconds() >= 3e8) return !0;
                    // Otherwise if the only thing that has changed about a target is its resume
                    // token it's not worth persisting. Note that the RemoteStore keeps an
                    // in-memory view of the currently active targets which includes the current
                    // resume token, so stream failure or user changes will still use an
                    // up-to-date resume token regardless of what we do here.
                                    return n.addedDocuments.size + n.modifiedDocuments.size + n.removedDocuments.size > 0;
                }
                /**
     * Notifies local store of the changed views to locally pin documents.
     */ (u, a, r) && o.push(n.Un.updateTargetData(t, a));
            }));
            let c = Dn();
            // HACK: The only reason we allow a null snapshot version is so that we
            // can synthesize remote events when we get permission denied errors while
            // trying to resolve the state of a locally cached document that is in
            // limbo.
            if (e.documentUpdates.forEach((s => {
                e.resolvedLimboDocuments.has(s) && o.push(n.persistence.referenceDelegate.updateLimboDocument(t, s));
            })), 
            // Each loop iteration only affects its "own" doc, so it's safe to get all the remote
            // documents in advance in a single call.
            o.push(jr(t, r, e.documentUpdates).next((t => {
                c = t;
            }))), !s.isEqual(at.min())) {
                const e = n.Un.getLastRemoteSnapshotVersion(t).next((e => n.Un.setTargetsMetadata(t, t.currentSequenceNumber, s)));
                o.push(e);
            }
            return si.waitFor(o).next((() => r.apply(t))).next((() => n.Us.Ts(t, c))).next((() => c));
        })).then((t => (n.Ms = i, t)));
    }

    /**
     * Populates document change buffer with documents from backend or a bundle.
     * Returns the document changes resulting from applying those documents.
     *
     * @param txn - Transaction to use to read existing documents from storage.
     * @param documentBuffer - Document buffer to collect the resulted changes to be
     *        applied to storage.
     * @param documents - Documents to be applied.
     * @param globalVersion - A `SnapshotVersion` representing the read time if all
     *        documents have the same read time.
     * @param documentVersions - A DocumentKey-to-SnapshotVersion map if documents
     *        have their own read time.
     *
     * Note: this function will use `documentVersions` if it is defined;
     * when it is not defined, resorts to `globalVersion`.
     */ function jr(t, e, n) {
        let s = On();
        return n.forEach((t => s = s.add(t))), e.getEntries(t, s).next((t => {
            let s = Dn();
            return n.forEach(((n, i) => {
                const r = t.get(n);
                // Note: The order of the steps below is important, since we want
                // to ensure that rejected limbo resolutions (which fabricate
                // NoDocuments with SnapshotVersion.min()) never add documents to
                // cache.
                            i.isNoDocument() && i.version.isEqual(at.min()) ? (
                // NoDocuments with SnapshotVersion.min() are used in manufactured
                // events. We remove these documents from cache since we lost
                // access.
                e.removeEntry(n, i.readTime), s = s.insert(n, i)) : !r.isValidDocument() || i.version.compareTo(r.version) > 0 || 0 === i.version.compareTo(r.version) && r.hasPendingWrites ? (e.addEntry(i), 
                s = s.insert(n, i)) : M("LocalStore", "Ignoring outdated watch update for ", n, ". Current version:", r.version, " Watch version:", i.version);
            })), s;
        }));
    }

    /**
     * Gets the mutation batch after the passed in batchId in the mutation queue
     * or null if empty.
     * @param afterBatchId - If provided, the batch to search after.
     * @returns The next mutation or null if there wasn't one.
     */
    function Qr(t, e) {
        const n = K(t);
        return n.persistence.runTransaction("Get next mutation batch", "readonly", (t => (void 0 === e && (e = -1), 
        n.gs.getNextMutationBatchAfterBatchId(t, e))));
    }

    /**
     * Reads the current value of a Document with a given key or null if not
     * found - used for testing.
     */
    /**
     * Assigns the given target an internal ID so that its results can be pinned so
     * they don't get GC'd. A target must be allocated in the local store before
     * the store can be used to manage its view.
     *
     * Allocating an already allocated `Target` will return the existing `TargetData`
     * for that `Target`.
     */
    function Wr(t, e) {
        const n = K(t);
        return n.persistence.runTransaction("Allocate target", "readwrite", (t => {
            let s;
            return n.Un.getTargetData(t, e).next((i => i ? (
            // This target has been listened to previously, so reuse the
            // previous targetID.
            // TODO(mcg): freshen last accessed date?
            s = i, si.resolve(s)) : n.Un.allocateTargetId(t).next((i => (s = new yi(e, i, 0 /* Listen */ , t.currentSequenceNumber), 
            n.Un.addTargetData(t, s).next((() => s)))))));
        })).then((t => {
            // If Multi-Tab is enabled, the existing target data may be newer than
            // the in-memory data
            const s = n.Ms.get(t.targetId);
            return (null === s || t.snapshotVersion.compareTo(s.snapshotVersion) > 0) && (n.Ms = n.Ms.insert(t.targetId, t), 
            n.$s.set(e, t.targetId)), t;
        }));
    }

    /**
     * Returns the TargetData as seen by the LocalStore, including updates that may
     * have not yet been persisted to the TargetCache.
     */
    // Visible for testing.
    /**
     * Unpins all the documents associated with the given target. If
     * `keepPersistedTargetData` is set to false and Eager GC enabled, the method
     * directly removes the associated target data from the target cache.
     *
     * Releasing a non-existing `Target` is a no-op.
     */
    // PORTING NOTE: `keepPersistedTargetData` is multi-tab only.
    async function zr(t, e, n) {
        const s = K(t), i = s.Ms.get(e), r = n ? "readwrite" : "readwrite-primary";
        try {
            n || await s.persistence.runTransaction("Release target", r, (t => s.persistence.referenceDelegate.removeTarget(t, i)));
        } catch (t) {
            if (!ui(t)) throw t;
            // All `releaseTarget` does is record the final metadata state for the
            // target, but we've been recording this periodically during target
            // activity. If we lose this write this could cause a very slight
            // difference in the order of target deletion during GC, but we
            // don't define exact LRU semantics so this is acceptable.
            M("LocalStore", `Failed to update sequence numbers for target ${e}: ${t}`);
        }
        s.Ms = s.Ms.remove(e), s.$s.delete(i.target);
    }

    /**
     * Runs the specified query against the local store and returns the results,
     * potentially taking advantage of query data from previous executions (such
     * as the set of remote keys).
     *
     * @param usePreviousResults - Whether results from previous executions can
     * be used to optimize this query execution.
     */ function Hr(t, e, n) {
        const s = K(t);
        let i = at.min(), r = On();
        return s.persistence.runTransaction("Execute query", "readonly", (t => function(t, e, n) {
            const s = K(t), i = s.$s.get(n);
            return void 0 !== i ? si.resolve(s.Ms.get(i)) : s.Un.getTargetData(e, n);
        }(s, t, De(e)).next((e => {
            if (e) return i = e.lastLimboFreeSnapshotVersion, s.Un.getMatchingKeysForTargetId(t, e.targetId).next((t => {
                r = t;
            }));
        })).next((() => s.Os.As(t, e, n ? i : at.min(), n ? r : On()))).next((t => ({
            documents: t,
            Ks: r
        })))));
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class eo {
        constructor(t) {
            this.O = t, this.Ws = new Map, this.zs = new Map;
        }
        getBundleMetadata(t, e) {
            return si.resolve(this.Ws.get(e));
        }
        saveBundleMetadata(t, e) {
            /** Decodes a BundleMetadata proto into a BundleMetadata object. */
            var n;
            return this.Ws.set(e.id, {
                id: (n = e).id,
                version: n.version,
                createTime: Zn(n.createTime)
            }), si.resolve();
        }
        getNamedQuery(t, e) {
            return si.resolve(this.zs.get(e));
        }
        saveNamedQuery(t, e) {
            return this.zs.set(e.name, function(t) {
                return {
                    name: t.name,
                    query: Si(t.bundledQuery),
                    readTime: Zn(t.readTime)
                };
            }(e)), si.resolve();
        }
    }

    /**
     * @license
     * Copyright 2022 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * An in-memory implementation of DocumentOverlayCache.
     */ class no {
        constructor() {
            // A map sorted by DocumentKey, whose value is a pair of the largest batch id
            // for the overlay and the overlay itself.
            this.overlays = new An(Nt.comparator), this.Hs = new Map;
        }
        getOverlay(t, e) {
            return si.resolve(this.overlays.get(e));
        }
        saveOverlays(t, e, n) {
            return n.forEach((n => {
                this.Yt(t, e, n);
            })), si.resolve();
        }
        removeOverlaysForBatchId(t, e, n) {
            const s = this.Hs.get(n);
            return void 0 !== s && (s.forEach((t => this.overlays = this.overlays.remove(t))), 
            this.Hs.delete(n)), si.resolve();
        }
        getOverlaysForCollection(t, e, n) {
            const s = new Map, i = e.length + 1, r = new Nt(e.child("")), o = this.overlays.getIteratorFrom(r);
            for (;o.hasNext(); ) {
                const t = o.getNext().value, r = t.getKey();
                if (!e.isPrefixOf(r.path)) break;
                // Documents from sub-collections
                            r.path.length === i && (t.largestBatchId > n && s.set(t.getKey(), t));
            }
            return si.resolve(s);
        }
        getOverlaysForCollectionGroup(t, e, n, s) {
            let i = new An(((t, e) => t - e));
            const r = this.overlays.getIterator();
            for (;r.hasNext(); ) {
                const t = r.getNext().value;
                if (t.getKey().getCollectionGroup() === e && t.largestBatchId > n) {
                    let e = i.get(t.largestBatchId);
                    null === e && (e = new Map, i = i.insert(t.largestBatchId, e)), e.set(t.getKey(), t);
                }
            }
            const o = new Map, c = i.getIterator();
            for (;c.hasNext(); ) {
                if (c.getNext().value.forEach(((t, e) => o.set(e, t))), o.size >= s) break;
            }
            return si.resolve(o);
        }
        Yt(t, e, n) {
            if (null === n) return;
            // Remove the association of the overlay to its batch id.
                    const s = this.overlays.get(n.key);
            null !== s && this.Hs.get(s.largestBatchId).delete(n.key), this.overlays = this.overlays.insert(n.key, new gi(e, n));
            // Create the association of this overlay to the given largestBatchId.
            let i = this.Hs.get(e);
            void 0 === i && (i = new Set, this.Hs.set(e, i)), i.add(n.key);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A collection of references to a document from some kind of numbered entity
     * (either a target ID or batch ID). As references are added to or removed from
     * the set corresponding events are emitted to a registered garbage collector.
     *
     * Each reference is represented by a DocumentReference object. Each of them
     * contains enough information to uniquely identify the reference. They are all
     * stored primarily in a set sorted by key. A document is considered garbage if
     * there's no references in that set (this can be efficiently checked thanks to
     * sorting by key).
     *
     * ReferenceSet also keeps a secondary set that contains references sorted by
     * IDs. This one is used to efficiently implement removal of all references by
     * some target ID.
     */ class so {
        constructor() {
            // A set of outstanding references to a document sorted by key.
            this.Js = new bn(io.Ys), 
            // A set of outstanding references to a document sorted by target id.
            this.Xs = new bn(io.Zs);
        }
        /** Returns true if the reference set contains no references. */    isEmpty() {
            return this.Js.isEmpty();
        }
        /** Adds a reference to the given document key for the given ID. */    addReference(t, e) {
            const n = new io(t, e);
            this.Js = this.Js.add(n), this.Xs = this.Xs.add(n);
        }
        /** Add references to the given document keys for the given ID. */    ti(t, e) {
            t.forEach((t => this.addReference(t, e)));
        }
        /**
         * Removes a reference to the given document key for the given
         * ID.
         */    removeReference(t, e) {
            this.ei(new io(t, e));
        }
        ni(t, e) {
            t.forEach((t => this.removeReference(t, e)));
        }
        /**
         * Clears all references with a given ID. Calls removeRef() for each key
         * removed.
         */    si(t) {
            const e = new Nt(new _t([])), n = new io(e, t), s = new io(e, t + 1), i = [];
            return this.Xs.forEachInRange([ n, s ], (t => {
                this.ei(t), i.push(t.key);
            })), i;
        }
        ii() {
            this.Js.forEach((t => this.ei(t)));
        }
        ei(t) {
            this.Js = this.Js.delete(t), this.Xs = this.Xs.delete(t);
        }
        ri(t) {
            const e = new Nt(new _t([])), n = new io(e, t), s = new io(e, t + 1);
            let i = On();
            return this.Xs.forEachInRange([ n, s ], (t => {
                i = i.add(t.key);
            })), i;
        }
        containsKey(t) {
            const e = new io(t, 0), n = this.Js.firstAfterOrEqual(e);
            return null !== n && t.isEqual(n.key);
        }
    }

    class io {
        constructor(t, e) {
            this.key = t, this.oi = e;
        }
        /** Compare by key then by ID */    static Ys(t, e) {
            return Nt.comparator(t.key, e.key) || rt(t.oi, e.oi);
        }
        /** Compare by ID then by key */    static Zs(t, e) {
            return rt(t.oi, e.oi) || Nt.comparator(t.key, e.key);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class ro {
        constructor(t, e) {
            this.indexManager = t, this.referenceDelegate = e, 
            /**
             * The set of all mutations that have been sent but not yet been applied to
             * the backend.
             */
            this.gs = [], 
            /** Next value to use when assigning sequential IDs to each mutation batch. */
            this.ci = 1, 
            /** An ordered mapping between documents and the mutations batch IDs. */
            this.ui = new bn(io.Ys);
        }
        checkEmpty(t) {
            return si.resolve(0 === this.gs.length);
        }
        addMutationBatch(t, e, n, s) {
            const i = this.ci;
            this.ci++, this.gs.length > 0 && this.gs[this.gs.length - 1];
            const r = new wi(i, e, n, s);
            this.gs.push(r);
            // Track references by document key and index collection parents.
            for (const e of s) this.ui = this.ui.add(new io(e.key, i)), this.indexManager.addToCollectionParentIndex(t, e.key.path.popLast());
            return si.resolve(r);
        }
        lookupMutationBatch(t, e) {
            return si.resolve(this.ai(e));
        }
        getNextMutationBatchAfterBatchId(t, e) {
            const n = e + 1, s = this.hi(n), i = s < 0 ? 0 : s;
            // The requested batchId may still be out of range so normalize it to the
            // start of the queue.
                    return si.resolve(this.gs.length > i ? this.gs[i] : null);
        }
        getHighestUnacknowledgedBatchId() {
            return si.resolve(0 === this.gs.length ? -1 : this.ci - 1);
        }
        getAllMutationBatches(t) {
            return si.resolve(this.gs.slice());
        }
        getAllMutationBatchesAffectingDocumentKey(t, e) {
            const n = new io(e, 0), s = new io(e, Number.POSITIVE_INFINITY), i = [];
            return this.ui.forEachInRange([ n, s ], (t => {
                const e = this.ai(t.oi);
                i.push(e);
            })), si.resolve(i);
        }
        getAllMutationBatchesAffectingDocumentKeys(t, e) {
            let n = new bn(rt);
            return e.forEach((t => {
                const e = new io(t, 0), s = new io(t, Number.POSITIVE_INFINITY);
                this.ui.forEachInRange([ e, s ], (t => {
                    n = n.add(t.oi);
                }));
            })), si.resolve(this.li(n));
        }
        getAllMutationBatchesAffectingQuery(t, e) {
            // Use the query path as a prefix for testing if a document matches the
            // query.
            const n = e.path, s = n.length + 1;
            // Construct a document reference for actually scanning the index. Unlike
            // the prefix the document key in this reference must have an even number of
            // segments. The empty segment can be used a suffix of the query path
            // because it precedes all other segments in an ordered traversal.
            let i = n;
            Nt.isDocumentKey(i) || (i = i.child(""));
            const r = new io(new Nt(i), 0);
            // Find unique batchIDs referenced by all documents potentially matching the
            // query.
                    let o = new bn(rt);
            return this.ui.forEachWhile((t => {
                const e = t.key.path;
                return !!n.isPrefixOf(e) && (
                // Rows with document keys more than one segment longer than the query
                // path can't be matches. For example, a query on 'rooms' can't match
                // the document /rooms/abc/messages/xyx.
                // TODO(mcg): we'll need a different scanner when we implement
                // ancestor queries.
                e.length === s && (o = o.add(t.oi)), !0);
            }), r), si.resolve(this.li(o));
        }
        li(t) {
            // Construct an array of matching batches, sorted by batchID to ensure that
            // multiple mutations affecting the same document key are applied in order.
            const e = [];
            return t.forEach((t => {
                const n = this.ai(t);
                null !== n && e.push(n);
            })), e;
        }
        removeMutationBatch(t, e) {
            U(0 === this.fi(e.batchId, "removed")), this.gs.shift();
            let n = this.ui;
            return si.forEach(e.mutations, (s => {
                const i = new io(s.key, e.batchId);
                return n = n.delete(i), this.referenceDelegate.markPotentiallyOrphaned(t, s.key);
            })).next((() => {
                this.ui = n;
            }));
        }
        Qe(t) {
            // No-op since the memory mutation queue does not maintain a separate cache.
        }
        containsKey(t, e) {
            const n = new io(e, 0), s = this.ui.firstAfterOrEqual(n);
            return si.resolve(e.isEqual(s && s.key));
        }
        performConsistencyCheck(t) {
            return this.gs.length, si.resolve();
        }
        /**
         * Finds the index of the given batchId in the mutation queue and asserts that
         * the resulting index is within the bounds of the queue.
         *
         * @param batchId - The batchId to search for
         * @param action - A description of what the caller is doing, phrased in passive
         * form (e.g. "acknowledged" in a routine that acknowledges batches).
         */    fi(t, e) {
            return this.hi(t);
        }
        /**
         * Finds the index of the given batchId in the mutation queue. This operation
         * is O(1).
         *
         * @returns The computed index of the batch with the given batchId, based on
         * the state of the queue. Note this index can be negative if the requested
         * batchId has already been remvoed from the queue or past the end of the
         * queue if the batchId is larger than the last added batch.
         */    hi(t) {
            if (0 === this.gs.length) 
            // As an index this is past the end of the queue
            return 0;
            // Examine the front of the queue to figure out the difference between the
            // batchId and indexes in the array. Note that since the queue is ordered
            // by batchId, if the first batch has a larger batchId then the requested
            // batchId doesn't exist in the queue.
                    return t - this.gs[0].batchId;
        }
        /**
         * A version of lookupMutationBatch that doesn't return a promise, this makes
         * other functions that uses this code easier to read and more efficent.
         */    ai(t) {
            const e = this.hi(t);
            if (e < 0 || e >= this.gs.length) return null;
            return this.gs[e];
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * The memory-only RemoteDocumentCache for IndexedDb. To construct, invoke
     * `newMemoryRemoteDocumentCache()`.
     */
    class oo {
        /**
         * @param sizer - Used to assess the size of a document. For eager GC, this is
         * expected to just return 0 to avoid unnecessarily doing the work of
         * calculating the size.
         */
        constructor(t) {
            this.di = t, 
            /** Underlying cache of documents and their read times. */
            this.docs = new An(Nt.comparator), 
            /** Size of all cached documents. */
            this.size = 0;
        }
        setIndexManager(t) {
            this.indexManager = t;
        }
        /**
         * Adds the supplied entry to the cache and updates the cache size as appropriate.
         *
         * All calls of `addEntry`  are required to go through the RemoteDocumentChangeBuffer
         * returned by `newChangeBuffer()`.
         */    addEntry(t, e) {
            const n = e.key, s = this.docs.get(n), i = s ? s.size : 0, r = this.di(e);
            return this.docs = this.docs.insert(n, {
                document: e.mutableCopy(),
                size: r
            }), this.size += r - i, this.indexManager.addToCollectionParentIndex(t, n.path.popLast());
        }
        /**
         * Removes the specified entry from the cache and updates the cache size as appropriate.
         *
         * All calls of `removeEntry` are required to go through the RemoteDocumentChangeBuffer
         * returned by `newChangeBuffer()`.
         */    removeEntry(t) {
            const e = this.docs.get(t);
            e && (this.docs = this.docs.remove(t), this.size -= e.size);
        }
        getEntry(t, e) {
            const n = this.docs.get(e);
            return si.resolve(n ? n.document.mutableCopy() : Jt.newInvalidDocument(e));
        }
        getEntries(t, e) {
            let n = Dn();
            return e.forEach((t => {
                const e = this.docs.get(t);
                n = n.insert(t, e ? e.document.mutableCopy() : Jt.newInvalidDocument(t));
            })), si.resolve(n);
        }
        getAll(t, e, n) {
            let s = Dn();
            // Documents are ordered by key, so we can use a prefix scan to narrow down
            // the documents we need to match the query against.
                    const i = new Nt(e.child("")), r = this.docs.getIteratorFrom(i);
            for (;r.hasNext(); ) {
                const {key: t, value: {document: i}} = r.getNext();
                if (!e.isPrefixOf(t.path)) break;
                t.path.length > e.length + 1 || (i.readTime.compareTo(n) <= 0 || (s = s.insert(i.key, i.mutableCopy())));
            }
            return si.resolve(s);
        }
        _i(t, e) {
            return si.forEach(this.docs, (t => e(t)));
        }
        newChangeBuffer(t) {
            // `trackRemovals` is ignores since the MemoryRemoteDocumentCache keeps
            // a separate changelog and does not need special handling for removals.
            return new co(this);
        }
        getSize(t) {
            return si.resolve(this.size);
        }
    }

    /**
     * Creates a new memory-only RemoteDocumentCache.
     *
     * @param sizer - Used to assess the size of a document. For eager GC, this is
     * expected to just return 0 to avoid unnecessarily doing the work of
     * calculating the size.
     */
    /**
     * Handles the details of adding and updating documents in the MemoryRemoteDocumentCache.
     */
    class co extends Tr {
        constructor(t) {
            super(), this.Tn = t;
        }
        applyChanges(t) {
            const e = [];
            return this.changes.forEach(((n, s) => {
                s.isValidDocument() ? e.push(this.Tn.addEntry(t, s)) : this.Tn.removeEntry(n);
            })), si.waitFor(e);
        }
        getFromCache(t, e) {
            return this.Tn.getEntry(t, e);
        }
        getAllFromCache(t, e) {
            return this.Tn.getEntries(t, e);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class uo {
        constructor(t) {
            this.persistence = t, 
            /**
             * Maps a target to the data about that target
             */
            this.wi = new Er((t => se(t)), re), 
            /** The last received snapshot version. */
            this.lastRemoteSnapshotVersion = at.min(), 
            /** The highest numbered target ID encountered. */
            this.highestTargetId = 0, 
            /** The highest sequence number encountered. */
            this.mi = 0, 
            /**
             * A ordered bidirectional mapping between documents and the remote target
             * IDs.
             */
            this.gi = new so, this.targetCount = 0, this.yi = ar.He();
        }
        forEachTarget(t, e) {
            return this.wi.forEach(((t, n) => e(n))), si.resolve();
        }
        getLastRemoteSnapshotVersion(t) {
            return si.resolve(this.lastRemoteSnapshotVersion);
        }
        getHighestSequenceNumber(t) {
            return si.resolve(this.mi);
        }
        allocateTargetId(t) {
            return this.highestTargetId = this.yi.next(), si.resolve(this.highestTargetId);
        }
        setTargetsMetadata(t, e, n) {
            return n && (this.lastRemoteSnapshotVersion = n), e > this.mi && (this.mi = e), 
            si.resolve();
        }
        Ze(t) {
            this.wi.set(t.target, t);
            const e = t.targetId;
            e > this.highestTargetId && (this.yi = new ar(e), this.highestTargetId = e), t.sequenceNumber > this.mi && (this.mi = t.sequenceNumber);
        }
        addTargetData(t, e) {
            return this.Ze(e), this.targetCount += 1, si.resolve();
        }
        updateTargetData(t, e) {
            return this.Ze(e), si.resolve();
        }
        removeTargetData(t, e) {
            return this.wi.delete(e.target), this.gi.si(e.targetId), this.targetCount -= 1, 
            si.resolve();
        }
        removeTargets(t, e, n) {
            let s = 0;
            const i = [];
            return this.wi.forEach(((r, o) => {
                o.sequenceNumber <= e && null === n.get(o.targetId) && (this.wi.delete(r), i.push(this.removeMatchingKeysForTargetId(t, o.targetId)), 
                s++);
            })), si.waitFor(i).next((() => s));
        }
        getTargetCount(t) {
            return si.resolve(this.targetCount);
        }
        getTargetData(t, e) {
            const n = this.wi.get(e) || null;
            return si.resolve(n);
        }
        addMatchingKeys(t, e, n) {
            return this.gi.ti(e, n), si.resolve();
        }
        removeMatchingKeys(t, e, n) {
            this.gi.ni(e, n);
            const s = this.persistence.referenceDelegate, i = [];
            return s && e.forEach((e => {
                i.push(s.markPotentiallyOrphaned(t, e));
            })), si.waitFor(i);
        }
        removeMatchingKeysForTargetId(t, e) {
            return this.gi.si(e), si.resolve();
        }
        getMatchingKeysForTargetId(t, e) {
            const n = this.gi.ri(e);
            return si.resolve(n);
        }
        containsKey(t, e) {
            return si.resolve(this.gi.containsKey(e));
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A memory-backed instance of Persistence. Data is stored only in RAM and
     * not persisted across sessions.
     */
    class ao {
        /**
         * The constructor accepts a factory for creating a reference delegate. This
         * allows both the delegate and this instance to have strong references to
         * each other without having nullable fields that would then need to be
         * checked or asserted on every access.
         */
        constructor(t, e) {
            this.pi = {}, this.overlays = {}, this.Nn = new nt(0), this.xn = !1, this.xn = !0, 
            this.referenceDelegate = t(this), this.Un = new uo(this);
            this.indexManager = new Wi, this.qn = function(t) {
                return new oo(t);
            }((t => this.referenceDelegate.Ii(t))), this.O = new pi(e), this.Kn = new eo(this.O);
        }
        start() {
            return Promise.resolve();
        }
        shutdown() {
            // No durable state to ensure is closed on shutdown.
            return this.xn = !1, Promise.resolve();
        }
        get started() {
            return this.xn;
        }
        setDatabaseDeletedListener() {
            // No op.
        }
        setNetworkEnabled() {
            // No op.
        }
        getIndexManager(t) {
            // We do not currently support indices for memory persistence, so we can
            // return the same shared instance of the memory index manager.
            return this.indexManager;
        }
        getDocumentOverlayCache(t) {
            let e = this.overlays[t.toKey()];
            return e || (e = new no, this.overlays[t.toKey()] = e), e;
        }
        getMutationQueue(t, e) {
            let n = this.pi[t.toKey()];
            return n || (n = new ro(e, this.referenceDelegate), this.pi[t.toKey()] = n), n;
        }
        getTargetCache() {
            return this.Un;
        }
        getRemoteDocumentCache() {
            return this.qn;
        }
        getBundleCache() {
            return this.Kn;
        }
        runTransaction(t, e, n) {
            M("MemoryPersistence", "Starting transaction:", t);
            const s = new ho(this.Nn.next());
            return this.referenceDelegate.Ei(), n(s).next((t => this.referenceDelegate.Ti(s).next((() => t)))).toPromise().then((t => (s.raiseOnCommittedEvent(), 
            t)));
        }
        Ai(t, e) {
            return si.or(Object.values(this.pi).map((n => () => n.containsKey(t, e))));
        }
    }

    /**
     * Memory persistence is not actually transactional, but future implementations
     * may have transaction-scoped state.
     */ class ho extends ni {
        constructor(t) {
            super(), this.currentSequenceNumber = t;
        }
    }

    class lo {
        constructor(t) {
            this.persistence = t, 
            /** Tracks all documents that are active in Query views. */
            this.Ri = new so, 
            /** The list of documents that are potentially GCed after each transaction. */
            this.Pi = null;
        }
        static bi(t) {
            return new lo(t);
        }
        get vi() {
            if (this.Pi) return this.Pi;
            throw L();
        }
        addReference(t, e, n) {
            return this.Ri.addReference(n, e), this.vi.delete(n.toString()), si.resolve();
        }
        removeReference(t, e, n) {
            return this.Ri.removeReference(n, e), this.vi.add(n.toString()), si.resolve();
        }
        markPotentiallyOrphaned(t, e) {
            return this.vi.add(e.toString()), si.resolve();
        }
        removeTarget(t, e) {
            this.Ri.si(e.targetId).forEach((t => this.vi.add(t.toString())));
            const n = this.persistence.getTargetCache();
            return n.getMatchingKeysForTargetId(t, e.targetId).next((t => {
                t.forEach((t => this.vi.add(t.toString())));
            })).next((() => n.removeTargetData(t, e)));
        }
        Ei() {
            this.Pi = new Set;
        }
        Ti(t) {
            // Remove newly orphaned documents.
            const e = this.persistence.getRemoteDocumentCache().newChangeBuffer();
            return si.forEach(this.vi, (n => {
                const s = Nt.fromPath(n);
                return this.Vi(t, s).next((t => {
                    t || e.removeEntry(s, at.min());
                }));
            })).next((() => (this.Pi = null, e.apply(t))));
        }
        updateLimboDocument(t, e) {
            return this.Vi(t, e).next((t => {
                t ? this.vi.delete(e.toString()) : this.vi.add(e.toString());
            }));
        }
        Ii(t) {
            // For eager GC, we don't care about the document size, there are no size thresholds.
            return 0;
        }
        Vi(t, e) {
            return si.or([ () => si.resolve(this.Ri.containsKey(e)), () => this.persistence.getTargetCache().containsKey(t, e), () => this.persistence.Ai(t, e) ]);
        }
    }

    /**
     * Metadata state of the local client. Unlike `RemoteClientState`, this class is
     * mutable and keeps track of all pending mutations, which allows us to
     * update the range of pending mutation batch IDs as new mutations are added or
     * removed.
     *
     * The data in `LocalClientState` is not read from WebStorage and instead
     * updated via its instance methods. The updated state can be serialized via
     * `toWebStorageJSON()`.
     */
    // Visible for testing.
    class Io {
        constructor() {
            this.activeTargetIds = $n();
        }
        Ci(t) {
            this.activeTargetIds = this.activeTargetIds.add(t);
        }
        Ni(t) {
            this.activeTargetIds = this.activeTargetIds.delete(t);
        }
        /**
         * Converts this entry into a JSON-encoded format we can use for WebStorage.
         * Does not encode `clientId` as it is part of the key in WebStorage.
         */    Di() {
            const t = {
                activeTargetIds: this.activeTargetIds.toArray(),
                updateTimeMs: Date.now()
            };
            return JSON.stringify(t);
        }
    }

    class To {
        constructor() {
            this._r = new Io, this.wr = {}, this.onlineStateHandler = null, this.sequenceNumberHandler = null;
        }
        addPendingMutation(t) {
            // No op.
        }
        updateMutationState(t, e, n) {
            // No op.
        }
        addLocalQueryTarget(t) {
            return this._r.Ci(t), this.wr[t] || "not-current";
        }
        updateQueryState(t, e, n) {
            this.wr[t] = e;
        }
        removeLocalQueryTarget(t) {
            this._r.Ni(t);
        }
        isLocalQueryTarget(t) {
            return this._r.activeTargetIds.has(t);
        }
        clearQueryState(t) {
            delete this.wr[t];
        }
        getAllActiveQueryTargets() {
            return this._r.activeTargetIds;
        }
        isActiveQueryTarget(t) {
            return this._r.activeTargetIds.has(t);
        }
        start() {
            return this._r = new Io, Promise.resolve();
        }
        handleUserChange(t, e, n) {
            // No op.
        }
        setOnlineState(t) {
            // No op.
        }
        shutdown() {}
        writeSequenceNumber(t) {}
        notifyBundleLoaded() {
            // No op.
        }
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class Ao {
        mr(t) {
            // No-op.
        }
        shutdown() {
            // No-op.
        }
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // References to `window` are guarded by BrowserConnectivityMonitor.isAvailable()
    /* eslint-disable no-restricted-globals */
    /**
     * Browser implementation of ConnectivityMonitor.
     */
    class Ro {
        constructor() {
            this.gr = () => this.yr(), this.pr = () => this.Ir(), this.Er = [], this.Tr();
        }
        mr(t) {
            this.Er.push(t);
        }
        shutdown() {
            window.removeEventListener("online", this.gr), window.removeEventListener("offline", this.pr);
        }
        Tr() {
            window.addEventListener("online", this.gr), window.addEventListener("offline", this.pr);
        }
        yr() {
            M("ConnectivityMonitor", "Network connectivity changed: AVAILABLE");
            for (const t of this.Er) t(0 /* AVAILABLE */);
        }
        Ir() {
            M("ConnectivityMonitor", "Network connectivity changed: UNAVAILABLE");
            for (const t of this.Er) t(1 /* UNAVAILABLE */);
        }
        // TODO(chenbrian): Consider passing in window either into this component or
        // here for testing via FakeWindow.
        /** Checks that all used attributes of window are available. */
        static Vt() {
            return "undefined" != typeof window && void 0 !== window.addEventListener && void 0 !== window.removeEventListener;
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ const Po = {
        BatchGetDocuments: "batchGet",
        Commit: "commit",
        RunQuery: "runQuery"
    };

    /**
     * Maps RPC names to the corresponding REST endpoint name.
     *
     * We use array notation to avoid mangling.
     */
    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Provides a simple helper class that implements the Stream interface to
     * bridge to other implementations that are streams but do not implement the
     * interface. The stream callbacks are invoked with the callOn... methods.
     */
    class bo {
        constructor(t) {
            this.Ar = t.Ar, this.Rr = t.Rr;
        }
        Pr(t) {
            this.br = t;
        }
        vr(t) {
            this.Vr = t;
        }
        onMessage(t) {
            this.Sr = t;
        }
        close() {
            this.Rr();
        }
        send(t) {
            this.Ar(t);
        }
        Dr() {
            this.br();
        }
        Cr(t) {
            this.Vr(t);
        }
        Nr(t) {
            this.Sr(t);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class vo extends 
    /**
     * Base class for all Rest-based connections to the backend (WebChannel and
     * HTTP).
     */
    class {
        constructor(t) {
            this.databaseInfo = t, this.databaseId = t.databaseId;
            const e = t.ssl ? "https" : "http";
            this.kr = e + "://" + t.host, this.Or = "projects/" + this.databaseId.projectId + "/databases/" + this.databaseId.database + "/documents";
        }
        Mr(t, e, n, s, i) {
            const r = this.$r(t, e);
            M("RestConnection", "Sending: ", r, n);
            const o = {};
            return this.Fr(o, s, i), this.Br(t, r, o, n).then((t => (M("RestConnection", "Received: ", t), 
            t)), (e => {
                throw F("RestConnection", `${t} failed with error: `, e, "url: ", r, "request:", n), 
                e;
            }));
        }
        Lr(t, e, n, s, i) {
            // The REST API automatically aggregates all of the streamed results, so we
            // can just use the normal invoke() method.
            return this.Mr(t, e, n, s, i);
        }
        /**
         * Modifies the headers for a request, adding any authorization token if
         * present and any additional headers for the request.
         */    Fr(t, e, n) {
            t["X-Goog-Api-Client"] = "gl-js/ fire/" + N, 
            // Content-Type: text/plain will avoid preflight requests which might
            // mess with CORS and redirects by proxies. If we add custom headers
            // we will need to change this code to potentially use the $httpOverwrite
            // parameter supported by ESF to avoid triggering preflight requests.
            t["Content-Type"] = "text/plain", this.databaseInfo.appId && (t["X-Firebase-GMPID"] = this.databaseInfo.appId), 
            e && e.headers.forEach(((e, n) => t[n] = e)), n && n.headers.forEach(((e, n) => t[n] = e));
        }
        $r(t, e) {
            const n = Po[t];
            return `${this.kr}/v1/${e}:${n}`;
        }
    } {
        constructor(t) {
            super(t), this.forceLongPolling = t.forceLongPolling, this.autoDetectLongPolling = t.autoDetectLongPolling, 
            this.useFetchStreams = t.useFetchStreams;
        }
        Br(t, e, n, s) {
            return new Promise(((i, r) => {
                const o = new XhrIo;
                o.listenOnce(EventType.COMPLETE, (() => {
                    try {
                        switch (o.getLastErrorCode()) {
                          case ErrorCode.NO_ERROR:
                            const e = o.getResponseJson();
                            M("Connection", "XHR received:", JSON.stringify(e)), i(e);
                            break;

                          case ErrorCode.TIMEOUT:
                            M("Connection", 'RPC "' + t + '" timed out'), r(new j(G.DEADLINE_EXCEEDED, "Request time out"));
                            break;

                          case ErrorCode.HTTP_ERROR:
                            const n = o.getStatus();
                            if (M("Connection", 'RPC "' + t + '" failed with status:', n, "response text:", o.getResponseText()), 
                            n > 0) {
                                const t = o.getResponseJson().error;
                                if (t && t.status && t.message) {
                                    const e = function(t) {
                                        const e = t.toLowerCase().replace(/_/g, "-");
                                        return Object.values(G).indexOf(e) >= 0 ? e : G.UNKNOWN;
                                    }(t.status);
                                    r(new j(e, t.message));
                                } else r(new j(G.UNKNOWN, "Server responded with status " + o.getStatus()));
                            } else 
                            // If we received an HTTP_ERROR but there's no status code,
                            // it's most probably a connection issue
                            r(new j(G.UNAVAILABLE, "Connection failed."));
                            break;

                          default:
                            L();
                        }
                    } finally {
                        M("Connection", 'RPC "' + t + '" completed.');
                    }
                }));
                const c = JSON.stringify(s);
                o.send(e, "POST", c, n, 15);
            }));
        }
        Ur(t, e, n) {
            const s = [ this.kr, "/", "google.firestore.v1.Firestore", "/", t, "/channel" ], i = createWebChannelTransport(), r = getStatEventTarget(), o = {
                // Required for backend stickiness, routing behavior is based on this
                // parameter.
                httpSessionIdParam: "gsessionid",
                initMessageHeaders: {},
                messageUrlParams: {
                    // This param is used to improve routing and project isolation by the
                    // backend and must be included in every request.
                    database: `projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`
                },
                sendRawJson: !0,
                supportsCrossDomainXhr: !0,
                internalChannelParams: {
                    // Override the default timeout (randomized between 10-20 seconds) since
                    // a large write batch on a slow internet connection may take a long
                    // time to send to the backend. Rather than have WebChannel impose a
                    // tight timeout which could lead to infinite timeouts and retries, we
                    // set it very large (5-10 minutes) and rely on the browser's builtin
                    // timeouts to kick in if the request isn't working.
                    forwardChannelRequestTimeoutMs: 6e5
                },
                forceLongPolling: this.forceLongPolling,
                detectBufferingProxy: this.autoDetectLongPolling
            };
            this.useFetchStreams && (o.xmlHttpFactory = new FetchXmlHttpFactory({})), this.Fr(o.initMessageHeaders, e, n), 
            // Sending the custom headers we just added to request.initMessageHeaders
            // (Authorization, etc.) will trigger the browser to make a CORS preflight
            // request because the XHR will no longer meet the criteria for a "simple"
            // CORS request:
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#Simple_requests
            // Therefore to avoid the CORS preflight request (an extra network
            // roundtrip), we use the httpHeadersOverwriteParam option to specify that
            // the headers should instead be encoded into a special "$httpHeaders" query
            // parameter, which is recognized by the webchannel backend. This is
            // formally defined here:
            // https://github.com/google/closure-library/blob/b0e1815b13fb92a46d7c9b3c30de5d6a396a3245/closure/goog/net/rpc/httpcors.js#L32
            // TODO(b/145624756): There is a backend bug where $httpHeaders isn't respected if the request
            // doesn't have an Origin header. So we have to exclude a few browser environments that are
            // known to (sometimes) not include an Origin. See
            // https://github.com/firebase/firebase-js-sdk/issues/1491.
            isMobileCordova() || isReactNative() || isElectron() || isIE() || isUWP() || isBrowserExtension() || (o.httpHeadersOverwriteParam = "$httpHeaders");
            const c = s.join("");
            M("Connection", "Creating WebChannel: " + c, o);
            const u = i.createWebChannel(c, o);
            // WebChannel supports sending the first message with the handshake - saving
            // a network round trip. However, it will have to call send in the same
            // JS event loop as open. In order to enforce this, we delay actually
            // opening the WebChannel until send is called. Whether we have called
            // open is tracked with this variable.
                    let a = !1, h = !1;
            // A flag to determine whether the stream was closed (by us or through an
            // error/close event) to avoid delivering multiple close events or sending
            // on a closed stream
                    const l = new bo({
                Ar: t => {
                    h ? M("Connection", "Not sending because WebChannel is closed:", t) : (a || (M("Connection", "Opening WebChannel transport."), 
                    u.open(), a = !0), M("Connection", "WebChannel sending:", t), u.send(t));
                },
                Rr: () => u.close()
            }), y = (t, e, n) => {
                // TODO(dimond): closure typing seems broken because WebChannel does
                // not implement goog.events.Listenable
                t.listen(e, (t => {
                    try {
                        n(t);
                    } catch (t) {
                        setTimeout((() => {
                            throw t;
                        }), 0);
                    }
                }));
            };
            // Closure events are guarded and exceptions are swallowed, so catch any
            // exception and rethrow using a setTimeout so they become visible again.
            // Note that eventually this function could go away if we are confident
            // enough the code is exception free.
                    return y(u, WebChannel.EventType.OPEN, (() => {
                h || M("Connection", "WebChannel transport opened.");
            })), y(u, WebChannel.EventType.CLOSE, (() => {
                h || (h = !0, M("Connection", "WebChannel transport closed"), l.Cr());
            })), y(u, WebChannel.EventType.ERROR, (t => {
                h || (h = !0, F("Connection", "WebChannel transport errored:", t), l.Cr(new j(G.UNAVAILABLE, "The operation could not be completed")));
            })), y(u, WebChannel.EventType.MESSAGE, (t => {
                var e;
                if (!h) {
                    const n = t.data[0];
                    U(!!n);
                    // TODO(b/35143891): There is a bug in One Platform that caused errors
                    // (and only errors) to be wrapped in an extra array. To be forward
                    // compatible with the bug we need to check either condition. The latter
                    // can be removed once the fix has been rolled out.
                    // Use any because msgData.error is not typed.
                    const s = n, i = s.error || (null === (e = s[0]) || void 0 === e ? void 0 : e.error);
                    if (i) {
                        M("Connection", "WebChannel received error:", i);
                        // error.status will be a string like 'OK' or 'NOT_FOUND'.
                        const t = i.status;
                        let e = 
                        /**
     * Maps an error Code from a GRPC status identifier like 'NOT_FOUND'.
     *
     * @returns The Code equivalent to the given status string or undefined if
     *     there is no match.
     */
                        function(t) {
                            // lookup by string
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const e = pn[t];
                            if (void 0 !== e) return Tn(e);
                        }(t), n = i.message;
                        void 0 === e && (e = G.INTERNAL, n = "Unknown error status: " + t + " with message " + i.message), 
                        // Mark closed so no further events are propagated
                        h = !0, l.Cr(new j(e, n)), u.close();
                    } else M("Connection", "WebChannel received:", n), l.Nr(n);
                }
            })), y(r, Event.STAT_EVENT, (t => {
                t.stat === Stat.PROXY ? M("Connection", "Detected buffering proxy") : t.stat === Stat.NOPROXY && M("Connection", "Detected no buffering proxy");
            })), setTimeout((() => {
                // Technically we could/should wait for the WebChannel opened event,
                // but because we want to send the first message with the WebChannel
                // handshake we pretend the channel opened here (asynchronously), and
                // then delay the actual open until the first message is sent.
                l.Dr();
            }), 0), l;
        }
    }

    /** The Platform's 'document' implementation or null if not available. */ function So() {
        // `document` is not always available, e.g. in ReactNative and WebWorkers.
        // eslint-disable-next-line no-restricted-globals
        return "undefined" != typeof document ? document : null;
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ function Do(t) {
        return new Hn(t, /* useProto3Json= */ !0);
    }

    /**
     * An instance of the Platform's 'TextEncoder' implementation.
     */
    /**
     * A helper for running delayed tasks following an exponential backoff curve
     * between attempts.
     *
     * Each delay is made up of a "base" delay which follows the exponential
     * backoff curve, and a +/- 50% "jitter" that is calculated and added to the
     * base delay. This prevents clients from accidentally synchronizing their
     * delays causing spikes of load to the backend.
     */
    class Co {
        constructor(
        /**
         * The AsyncQueue to run backoff operations on.
         */
        t, 
        /**
         * The ID to use when scheduling backoff operations on the AsyncQueue.
         */
        e, 
        /**
         * The initial delay (used as the base delay on the first retry attempt).
         * Note that jitter will still be applied, so the actual delay could be as
         * little as 0.5*initialDelayMs.
         */
        n = 1e3
        /**
         * The multiplier to use to determine the extended base delay after each
         * attempt.
         */ , s = 1.5
        /**
         * The maximum base delay after which no further backoff is performed.
         * Note that jitter will still be applied, so the actual delay could be as
         * much as 1.5*maxDelayMs.
         */ , i = 6e4) {
            this.Sn = t, this.timerId = e, this.qr = n, this.Kr = s, this.Gr = i, this.jr = 0, 
            this.Qr = null, 
            /** The last backoff attempt, as epoch milliseconds. */
            this.Wr = Date.now(), this.reset();
        }
        /**
         * Resets the backoff delay.
         *
         * The very next backoffAndWait() will have no delay. If it is called again
         * (i.e. due to an error), initialDelayMs (plus jitter) will be used, and
         * subsequent ones will increase according to the backoffFactor.
         */    reset() {
            this.jr = 0;
        }
        /**
         * Resets the backoff delay to the maximum delay (e.g. for use after a
         * RESOURCE_EXHAUSTED error).
         */    zr() {
            this.jr = this.Gr;
        }
        /**
         * Returns a promise that resolves after currentDelayMs, and increases the
         * delay for any subsequent attempts. If there was a pending backoff operation
         * already, it will be canceled.
         */    Hr(t) {
            // Cancel any pending backoff operation.
            this.cancel();
            // First schedule using the current base (which may be 0 and should be
            // honored as such).
            const e = Math.floor(this.jr + this.Jr()), n = Math.max(0, Date.now() - this.Wr), s = Math.max(0, e - n);
            // Guard against lastAttemptTime being in the future due to a clock change.
                    s > 0 && M("ExponentialBackoff", `Backing off for ${s} ms (base delay: ${this.jr} ms, delay with jitter: ${e} ms, last attempt: ${n} ms ago)`), 
            this.Qr = this.Sn.enqueueAfterDelay(this.timerId, s, (() => (this.Wr = Date.now(), 
            t()))), 
            // Apply backoff factor to determine next delay and ensure it is within
            // bounds.
            this.jr *= this.Kr, this.jr < this.qr && (this.jr = this.qr), this.jr > this.Gr && (this.jr = this.Gr);
        }
        Yr() {
            null !== this.Qr && (this.Qr.skipDelay(), this.Qr = null);
        }
        cancel() {
            null !== this.Qr && (this.Qr.cancel(), this.Qr = null);
        }
        /** Returns a random value in the range [-currentBaseMs/2, currentBaseMs/2] */    Jr() {
            return (Math.random() - .5) * this.jr;
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A PersistentStream is an abstract base class that represents a streaming RPC
     * to the Firestore backend. It's built on top of the connections own support
     * for streaming RPCs, and adds several critical features for our clients:
     *
     *   - Exponential backoff on failure
     *   - Authentication via CredentialsProvider
     *   - Dispatching all callbacks into the shared worker queue
     *   - Closing idle streams after 60 seconds of inactivity
     *
     * Subclasses of PersistentStream implement serialization of models to and
     * from the JSON representation of the protocol buffers for a specific
     * streaming RPC.
     *
     * ## Starting and Stopping
     *
     * Streaming RPCs are stateful and need to be start()ed before messages can
     * be sent and received. The PersistentStream will call the onOpen() function
     * of the listener once the stream is ready to accept requests.
     *
     * Should a start() fail, PersistentStream will call the registered onClose()
     * listener with a FirestoreError indicating what went wrong.
     *
     * A PersistentStream can be started and stopped repeatedly.
     *
     * Generic types:
     *  SendType: The type of the outgoing message of the underlying
     *    connection stream
     *  ReceiveType: The type of the incoming message of the underlying
     *    connection stream
     *  ListenerType: The type of the listener that will be used for callbacks
     */
    class No {
        constructor(t, e, n, s, i, r, o, c) {
            this.Sn = t, this.Xr = n, this.Zr = s, this.eo = i, this.authCredentialsProvider = r, 
            this.appCheckCredentialsProvider = o, this.listener = c, this.state = 0 /* Initial */ , 
            /**
             * A close count that's incremented every time the stream is closed; used by
             * getCloseGuardedDispatcher() to invalidate callbacks that happen after
             * close.
             */
            this.no = 0, this.so = null, this.io = null, this.stream = null, this.ro = new Co(t, e);
        }
        /**
         * Returns true if start() has been called and no error has occurred. True
         * indicates the stream is open or in the process of opening (which
         * encompasses respecting backoff, getting auth tokens, and starting the
         * actual RPC). Use isOpen() to determine if the stream is open and ready for
         * outbound requests.
         */    oo() {
            return 1 /* Starting */ === this.state || 5 /* Backoff */ === this.state || this.co();
        }
        /**
         * Returns true if the underlying RPC is open (the onOpen() listener has been
         * called) and the stream is ready for outbound requests.
         */    co() {
            return 2 /* Open */ === this.state || 3 /* Healthy */ === this.state;
        }
        /**
         * Starts the RPC. Only allowed if isStarted() returns false. The stream is
         * not immediately ready for use: onOpen() will be invoked when the RPC is
         * ready for outbound requests, at which point isOpen() will return true.
         *
         * When start returns, isStarted() will return true.
         */    start() {
            4 /* Error */ !== this.state ? this.auth() : this.uo();
        }
        /**
         * Stops the RPC. This call is idempotent and allowed regardless of the
         * current isStarted() state.
         *
         * When stop returns, isStarted() and isOpen() will both return false.
         */    async stop() {
            this.oo() && await this.close(0 /* Initial */);
        }
        /**
         * After an error the stream will usually back off on the next attempt to
         * start it. If the error warrants an immediate restart of the stream, the
         * sender can use this to indicate that the receiver should not back off.
         *
         * Each error will call the onClose() listener. That function can decide to
         * inhibit backoff if required.
         */    ao() {
            this.state = 0 /* Initial */ , this.ro.reset();
        }
        /**
         * Marks this stream as idle. If no further actions are performed on the
         * stream for one minute, the stream will automatically close itself and
         * notify the stream's onClose() handler with Status.OK. The stream will then
         * be in a !isStarted() state, requiring the caller to start the stream again
         * before further use.
         *
         * Only streams that are in state 'Open' can be marked idle, as all other
         * states imply pending network operations.
         */    ho() {
            // Starts the idle time if we are in state 'Open' and are not yet already
            // running a timer (in which case the previous idle timeout still applies).
            this.co() && null === this.so && (this.so = this.Sn.enqueueAfterDelay(this.Xr, 6e4, (() => this.lo())));
        }
        /** Sends a message to the underlying stream. */    fo(t) {
            this._o(), this.stream.send(t);
        }
        /** Called by the idle timer when the stream should close due to inactivity. */    async lo() {
            if (this.co()) 
            // When timing out an idle stream there's no reason to force the stream into backoff when
            // it restarts so set the stream state to Initial instead of Error.
            return this.close(0 /* Initial */);
        }
        /** Marks the stream as active again. */    _o() {
            this.so && (this.so.cancel(), this.so = null);
        }
        /** Cancels the health check delayed operation. */    wo() {
            this.io && (this.io.cancel(), this.io = null);
        }
        /**
         * Closes the stream and cleans up as necessary:
         *
         * * closes the underlying GRPC stream;
         * * calls the onClose handler with the given 'error';
         * * sets internal stream state to 'finalState';
         * * adjusts the backoff timer based on the error
         *
         * A new stream can be opened by calling start().
         *
         * @param finalState - the intended state of the stream after closing.
         * @param error - the error the connection was closed with.
         */    async close(t, e) {
            // Cancel any outstanding timers (they're guaranteed not to execute).
            this._o(), this.wo(), this.ro.cancel(), 
            // Invalidates any stream-related callbacks (e.g. from auth or the
            // underlying stream), guaranteeing they won't execute.
            this.no++, 4 /* Error */ !== t ? 
            // If this is an intentional close ensure we don't delay our next connection attempt.
            this.ro.reset() : e && e.code === G.RESOURCE_EXHAUSTED ? (
            // Log the error. (Probably either 'quota exceeded' or 'max queue length reached'.)
            $(e.toString()), $("Using maximum backoff delay to prevent overloading the backend."), 
            this.ro.zr()) : e && e.code === G.UNAUTHENTICATED && 3 /* Healthy */ !== this.state && (
            // "unauthenticated" error means the token was rejected. This should rarely
            // happen since both Auth and AppCheck ensure a sufficient TTL when we
            // request a token. If a user manually resets their system clock this can
            // fail, however. In this case, we should get a Code.UNAUTHENTICATED error
            // before we received the first message and we need to invalidate the token
            // to ensure that we fetch a new token.
            this.authCredentialsProvider.invalidateToken(), this.appCheckCredentialsProvider.invalidateToken()), 
            // Clean up the underlying stream because we are no longer interested in events.
            null !== this.stream && (this.mo(), this.stream.close(), this.stream = null), 
            // This state must be assigned before calling onClose() to allow the callback to
            // inhibit backoff or otherwise manipulate the state in its non-started state.
            this.state = t, 
            // Notify the listener that the stream closed.
            await this.listener.vr(e);
        }
        /**
         * Can be overridden to perform additional cleanup before the stream is closed.
         * Calling super.tearDown() is not required.
         */    mo() {}
        auth() {
            this.state = 1 /* Starting */;
            const t = this.yo(this.no), e = this.no;
            // TODO(mikelehen): Just use dispatchIfNotClosed, but see TODO below.
                    Promise.all([ this.authCredentialsProvider.getToken(), this.appCheckCredentialsProvider.getToken() ]).then((([t, n]) => {
                // Stream can be stopped while waiting for authentication.
                // TODO(mikelehen): We really should just use dispatchIfNotClosed
                // and let this dispatch onto the queue, but that opened a spec test can
                // of worms that I don't want to deal with in this PR.
                this.no === e && 
                // Normally we'd have to schedule the callback on the AsyncQueue.
                // However, the following calls are safe to be called outside the
                // AsyncQueue since they don't chain asynchronous calls
                this.po(t, n);
            }), (e => {
                t((() => {
                    const t = new j(G.UNKNOWN, "Fetching auth token failed: " + e.message);
                    return this.Io(t);
                }));
            }));
        }
        po(t, e) {
            const n = this.yo(this.no);
            this.stream = this.Eo(t, e), this.stream.Pr((() => {
                n((() => (this.state = 2 /* Open */ , this.io = this.Sn.enqueueAfterDelay(this.Zr, 1e4, (() => (this.co() && (this.state = 3 /* Healthy */), 
                Promise.resolve()))), this.listener.Pr())));
            })), this.stream.vr((t => {
                n((() => this.Io(t)));
            })), this.stream.onMessage((t => {
                n((() => this.onMessage(t)));
            }));
        }
        uo() {
            this.state = 5 /* Backoff */ , this.ro.Hr((async () => {
                this.state = 0 /* Initial */ , this.start();
            }));
        }
        // Visible for tests
        Io(t) {
            // In theory the stream could close cleanly, however, in our current model
            // we never expect this to happen because if we stop a stream ourselves,
            // this callback will never be called. To prevent cases where we retry
            // without a backoff accidentally, we set the stream to error in all cases.
            return M("PersistentStream", `close with error: ${t}`), this.stream = null, this.close(4 /* Error */ , t);
        }
        /**
         * Returns a "dispatcher" function that dispatches operations onto the
         * AsyncQueue but only runs them if closeCount remains unchanged. This allows
         * us to turn auth / stream callbacks into no-ops if the stream is closed /
         * re-opened, etc.
         */    yo(t) {
            return e => {
                this.Sn.enqueueAndForget((() => this.no === t ? e() : (M("PersistentStream", "stream callback skipped by getCloseGuardedDispatcher."), 
                Promise.resolve())));
            };
        }
    }

    /**
     * A PersistentStream that implements the Listen RPC.
     *
     * Once the Listen stream has called the onOpen() listener, any number of
     * listen() and unlisten() calls can be made to control what changes will be
     * sent from the server for ListenResponses.
     */ class xo extends No {
        constructor(t, e, n, s, i, r) {
            super(t, "listen_stream_connection_backoff" /* ListenStreamConnectionBackoff */ , "listen_stream_idle" /* ListenStreamIdle */ , "health_check_timeout" /* HealthCheckTimeout */ , e, n, s, r), 
            this.O = i;
        }
        Eo(t, e) {
            return this.eo.Ur("Listen", t, e);
        }
        onMessage(t) {
            // A successful response means the stream is healthy
            this.ro.reset();
            const e = ls(this.O, t), n = function(t) {
                // We have only reached a consistent snapshot for the entire stream if there
                // is a read_time set and it applies to all targets (i.e. the list of
                // targets is empty). The backend is guaranteed to send such responses.
                if (!("targetChange" in t)) return at.min();
                const e = t.targetChange;
                return e.targetIds && e.targetIds.length ? at.min() : e.readTime ? Zn(e.readTime) : at.min();
            }(t);
            return this.listener.To(e, n);
        }
        /**
         * Registers interest in the results of the given target. If the target
         * includes a resumeToken it will be included in the request. Results that
         * affect the target will be streamed back as WatchChange messages that
         * reference the targetId.
         */    Ao(t) {
            const e = {};
            e.database = os(this.O), e.addTarget = function(t, e) {
                let n;
                const s = e.target;
                return n = oe(s) ? {
                    documents: ws(t, s)
                } : {
                    query: ms(t, s)
                }, n.targetId = e.targetId, e.resumeToken.approximateByteSize() > 0 ? n.resumeToken = Yn(t, e.resumeToken) : e.snapshotVersion.compareTo(at.min()) > 0 && (
                // TODO(wuandy): Consider removing above check because it is most likely true.
                // Right now, many tests depend on this behaviour though (leaving min() out
                // of serialization).
                n.readTime = Jn(t, e.snapshotVersion.toTimestamp())), n;
            }(this.O, t);
            const n = ys(this.O, t);
            n && (e.labels = n), this.fo(e);
        }
        /**
         * Unregisters interest in the results of the target associated with the
         * given targetId.
         */    Ro(t) {
            const e = {};
            e.database = os(this.O), e.removeTarget = t, this.fo(e);
        }
    }

    /**
     * A Stream that implements the Write RPC.
     *
     * The Write RPC requires the caller to maintain special streamToken
     * state in between calls, to help the server understand which responses the
     * client has processed by the time the next request is made. Every response
     * will contain a streamToken; this value must be passed to the next
     * request.
     *
     * After calling start() on this stream, the next request must be a handshake,
     * containing whatever streamToken is on hand. Once a response to this
     * request is received, all pending mutations may be submitted. When
     * submitting multiple batches of mutations at the same time, it's
     * okay to use the same streamToken for the calls to writeMutations.
     *
     * TODO(b/33271235): Use proto types
     */ class ko extends No {
        constructor(t, e, n, s, i, r) {
            super(t, "write_stream_connection_backoff" /* WriteStreamConnectionBackoff */ , "write_stream_idle" /* WriteStreamIdle */ , "health_check_timeout" /* HealthCheckTimeout */ , e, n, s, r), 
            this.O = i, this.Po = !1;
        }
        /**
         * Tracks whether or not a handshake has been successfully exchanged and
         * the stream is ready to accept mutations.
         */    get bo() {
            return this.Po;
        }
        // Override of PersistentStream.start
        start() {
            this.Po = !1, this.lastStreamToken = void 0, super.start();
        }
        mo() {
            this.Po && this.vo([]);
        }
        Eo(t, e) {
            return this.eo.Ur("Write", t, e);
        }
        onMessage(t) {
            if (
            // Always capture the last stream token.
            U(!!t.streamToken), this.lastStreamToken = t.streamToken, this.Po) {
                // A successful first write response means the stream is healthy,
                // Note, that we could consider a successful handshake healthy, however,
                // the write itself might be causing an error we want to back off from.
                this.ro.reset();
                const e = _s(t.writeResults, t.commitTime), n = Zn(t.commitTime);
                return this.listener.Vo(n, e);
            }
            // The first response is always the handshake response
            return U(!t.writeResults || 0 === t.writeResults.length), this.Po = !0, this.listener.So();
        }
        /**
         * Sends an initial streamToken to the server, performing the handshake
         * required to make the StreamingWrite RPC work. Subsequent
         * calls should wait until onHandshakeComplete was called.
         */    Do() {
            // TODO(dimond): Support stream resumption. We intentionally do not set the
            // stream token on the handshake, ignoring any stream token we might have.
            const t = {};
            t.database = os(this.O), this.fo(t);
        }
        /** Sends a group of mutations to the Firestore backend to apply. */    vo(t) {
            const e = {
                streamToken: this.lastStreamToken,
                writes: t.map((t => fs(this.O, t)))
            };
            this.fo(e);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Datastore and its related methods are a wrapper around the external Google
     * Cloud Datastore grpc API, which provides an interface that is more convenient
     * for the rest of the client SDK architecture to consume.
     */
    /**
     * An implementation of Datastore that exposes additional state for internal
     * consumption.
     */
    class Oo extends class {} {
        constructor(t, e, n, s) {
            super(), this.authCredentials = t, this.appCheckCredentials = e, this.eo = n, this.O = s, 
            this.Co = !1;
        }
        No() {
            if (this.Co) throw new j(G.FAILED_PRECONDITION, "The client has already been terminated.");
        }
        /** Invokes the provided RPC with auth and AppCheck tokens. */    Mr(t, e, n) {
            return this.No(), Promise.all([ this.authCredentials.getToken(), this.appCheckCredentials.getToken() ]).then((([s, i]) => this.eo.Mr(t, e, n, s, i))).catch((t => {
                throw "FirebaseError" === t.name ? (t.code === G.UNAUTHENTICATED && (this.authCredentials.invalidateToken(), 
                this.appCheckCredentials.invalidateToken()), t) : new j(G.UNKNOWN, t.toString());
            }));
        }
        /** Invokes the provided RPC with streamed results with auth and AppCheck tokens. */    Lr(t, e, n) {
            return this.No(), Promise.all([ this.authCredentials.getToken(), this.appCheckCredentials.getToken() ]).then((([s, i]) => this.eo.Lr(t, e, n, s, i))).catch((t => {
                throw "FirebaseError" === t.name ? (t.code === G.UNAUTHENTICATED && (this.authCredentials.invalidateToken(), 
                this.appCheckCredentials.invalidateToken()), t) : new j(G.UNKNOWN, t.toString());
            }));
        }
        terminate() {
            this.Co = !0;
        }
    }

    // TODO(firestorexp): Make sure there is only one Datastore instance per
    // firestore-exp client.
    /**
     * A component used by the RemoteStore to track the OnlineState (that is,
     * whether or not the client as a whole should be considered to be online or
     * offline), implementing the appropriate heuristics.
     *
     * In particular, when the client is trying to connect to the backend, we
     * allow up to MAX_WATCH_STREAM_FAILURES within ONLINE_STATE_TIMEOUT_MS for
     * a connection to succeed. If we have too many failures or the timeout elapses,
     * then we set the OnlineState to Offline, and the client will behave as if
     * it is offline (get()s will return cached data, etc.).
     */
    class Mo {
        constructor(t, e) {
            this.asyncQueue = t, this.onlineStateHandler = e, 
            /** The current OnlineState. */
            this.state = "Unknown" /* Unknown */ , 
            /**
             * A count of consecutive failures to open the stream. If it reaches the
             * maximum defined by MAX_WATCH_STREAM_FAILURES, we'll set the OnlineState to
             * Offline.
             */
            this.xo = 0, 
            /**
             * A timer that elapses after ONLINE_STATE_TIMEOUT_MS, at which point we
             * transition from OnlineState.Unknown to OnlineState.Offline without waiting
             * for the stream to actually fail (MAX_WATCH_STREAM_FAILURES times).
             */
            this.ko = null, 
            /**
             * Whether the client should log a warning message if it fails to connect to
             * the backend (initially true, cleared after a successful stream, or if we've
             * logged the message already).
             */
            this.Oo = !0;
        }
        /**
         * Called by RemoteStore when a watch stream is started (including on each
         * backoff attempt).
         *
         * If this is the first attempt, it sets the OnlineState to Unknown and starts
         * the onlineStateTimer.
         */    Mo() {
            0 === this.xo && (this.$o("Unknown" /* Unknown */), this.ko = this.asyncQueue.enqueueAfterDelay("online_state_timeout" /* OnlineStateTimeout */ , 1e4, (() => (this.ko = null, 
            this.Fo("Backend didn't respond within 10 seconds."), this.$o("Offline" /* Offline */), 
            Promise.resolve()))));
        }
        /**
         * Updates our OnlineState as appropriate after the watch stream reports a
         * failure. The first failure moves us to the 'Unknown' state. We then may
         * allow multiple failures (based on MAX_WATCH_STREAM_FAILURES) before we
         * actually transition to the 'Offline' state.
         */    Bo(t) {
            "Online" /* Online */ === this.state ? this.$o("Unknown" /* Unknown */) : (this.xo++, 
            this.xo >= 1 && (this.Lo(), this.Fo(`Connection failed 1 times. Most recent error: ${t.toString()}`), 
            this.$o("Offline" /* Offline */)));
        }
        /**
         * Explicitly sets the OnlineState to the specified state.
         *
         * Note that this resets our timers / failure counters, etc. used by our
         * Offline heuristics, so must not be used in place of
         * handleWatchStreamStart() and handleWatchStreamFailure().
         */    set(t) {
            this.Lo(), this.xo = 0, "Online" /* Online */ === t && (
            // We've connected to watch at least once. Don't warn the developer
            // about being offline going forward.
            this.Oo = !1), this.$o(t);
        }
        $o(t) {
            t !== this.state && (this.state = t, this.onlineStateHandler(t));
        }
        Fo(t) {
            const e = `Could not reach Cloud Firestore backend. ${t}\nThis typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;
            this.Oo ? ($(e), this.Oo = !1) : M("OnlineStateTracker", e);
        }
        Lo() {
            null !== this.ko && (this.ko.cancel(), this.ko = null);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class $o {
        constructor(
        /**
         * The local store, used to fill the write pipeline with outbound mutations.
         */
        t, 
        /** The client-side proxy for interacting with the backend. */
        e, n, s, i) {
            this.localStore = t, this.datastore = e, this.asyncQueue = n, this.remoteSyncer = {}, 
            /**
             * A list of up to MAX_PENDING_WRITES writes that we have fetched from the
             * LocalStore via fillWritePipeline() and have or will send to the write
             * stream.
             *
             * Whenever writePipeline.length > 0 the RemoteStore will attempt to start or
             * restart the write stream. When the stream is established the writes in the
             * pipeline will be sent in order.
             *
             * Writes remain in writePipeline until they are acknowledged by the backend
             * and thus will automatically be re-sent if the stream is interrupted /
             * restarted before they're acknowledged.
             *
             * Write responses from the backend are linked to their originating request
             * purely based on order, and so we can just shift() writes from the front of
             * the writePipeline as we receive responses.
             */
            this.Uo = [], 
            /**
             * A mapping of watched targets that the client cares about tracking and the
             * user has explicitly called a 'listen' for this target.
             *
             * These targets may or may not have been sent to or acknowledged by the
             * server. On re-establishing the listen stream, these targets should be sent
             * to the server. The targets removed with unlistens are removed eagerly
             * without waiting for confirmation from the listen stream.
             */
            this.qo = new Map, 
            /**
             * A set of reasons for why the RemoteStore may be offline. If empty, the
             * RemoteStore may start its network connections.
             */
            this.Ko = new Set, 
            /**
             * Event handlers that get called when the network is disabled or enabled.
             *
             * PORTING NOTE: These functions are used on the Web client to create the
             * underlying streams (to support tree-shakeable streams). On Android and iOS,
             * the streams are created during construction of RemoteStore.
             */
            this.Go = [], this.jo = i, this.jo.mr((t => {
                n.enqueueAndForget((async () => {
                    // Porting Note: Unlike iOS, `restartNetwork()` is called even when the
                    // network becomes unreachable as we don't have any other way to tear
                    // down our streams.
                    Qo(this) && (M("RemoteStore", "Restarting streams for network reachability change."), 
                    await async function(t) {
                        const e = K(t);
                        e.Ko.add(4 /* ConnectivityChange */), await Bo(e), e.Qo.set("Unknown" /* Unknown */), 
                        e.Ko.delete(4 /* ConnectivityChange */), await Fo(e);
                    }(this));
                }));
            })), this.Qo = new Mo(n, s);
        }
    }

    async function Fo(t) {
        if (Qo(t)) for (const e of t.Go) await e(/* enabled= */ !0);
    }

    /**
     * Temporarily disables the network. The network can be re-enabled using
     * enableNetwork().
     */ async function Bo(t) {
        for (const e of t.Go) await e(/* enabled= */ !1);
    }

    /**
     * Starts new listen for the given target. Uses resume token if provided. It
     * is a no-op if the target of given `TargetData` is already being listened to.
     */
    function Lo(t, e) {
        const n = K(t);
        n.qo.has(e.targetId) || (
        // Mark this as something the client is currently listening for.
        n.qo.set(e.targetId, e), jo(n) ? 
        // The listen will be sent in onWatchStreamOpen
        Go(n) : hc(n).co() && qo(n, e));
    }

    /**
     * Removes the listen from server. It is a no-op if the given target id is
     * not being listened to.
     */ function Uo(t, e) {
        const n = K(t), s = hc(n);
        n.qo.delete(e), s.co() && Ko(n, e), 0 === n.qo.size && (s.co() ? s.ho() : Qo(n) && 
        // Revert to OnlineState.Unknown if the watch stream is not open and we
        // have no listeners, since without any listens to send we cannot
        // confirm if the stream is healthy and upgrade to OnlineState.Online.
        n.Qo.set("Unknown" /* Unknown */));
    }

    /**
     * We need to increment the the expected number of pending responses we're due
     * from watch so we wait for the ack to process any messages from this target.
     */ function qo(t, e) {
        t.Wo.Z(e.targetId), hc(t).Ao(e);
    }

    /**
     * We need to increment the expected number of pending responses we're due
     * from watch so we wait for the removal on the server before we process any
     * messages from this target.
     */ function Ko(t, e) {
        t.Wo.Z(e), hc(t).Ro(e);
    }

    function Go(t) {
        t.Wo = new Gn({
            getRemoteKeysForTarget: e => t.remoteSyncer.getRemoteKeysForTarget(e),
            Tt: e => t.qo.get(e) || null
        }), hc(t).start(), t.Qo.Mo();
    }

    /**
     * Returns whether the watch stream should be started because it's necessary
     * and has not yet been started.
     */ function jo(t) {
        return Qo(t) && !hc(t).oo() && t.qo.size > 0;
    }

    function Qo(t) {
        return 0 === K(t).Ko.size;
    }

    function Wo(t) {
        t.Wo = void 0;
    }

    async function zo(t) {
        t.qo.forEach(((e, n) => {
            qo(t, e);
        }));
    }

    async function Ho(t, e) {
        Wo(t), 
        // If we still need the watch stream, retry the connection.
        jo(t) ? (t.Qo.Bo(e), Go(t)) : 
        // No need to restart watch stream because there are no active targets.
        // The online state is set to unknown because there is no active attempt
        // at establishing a connection
        t.Qo.set("Unknown" /* Unknown */);
    }

    async function Jo(t, e, n) {
        if (
        // Mark the client as online since we got a message from the server
        t.Qo.set("Online" /* Online */), e instanceof qn && 2 /* Removed */ === e.state && e.cause) 
        // There was an error on a target, don't wait for a consistent snapshot
        // to raise events
        try {
            await 
            /** Handles an error on a target */
            async function(t, e) {
                const n = e.cause;
                for (const s of e.targetIds) 
                // A watched target might have been removed already.
                t.qo.has(s) && (await t.remoteSyncer.rejectListen(s, n), t.qo.delete(s), t.Wo.removeTarget(s));
            }
            /**
     * Attempts to fill our write pipeline with writes from the LocalStore.
     *
     * Called internally to bootstrap or refill the write pipeline and by
     * SyncEngine whenever there are new mutations to process.
     *
     * Starts the write stream if necessary.
     */ (t, e);
        } catch (n) {
            M("RemoteStore", "Failed to remove targets %s: %s ", e.targetIds.join(","), n), 
            await Yo(t, n);
        } else if (e instanceof Ln ? t.Wo.ct(e) : e instanceof Un ? t.Wo._t(e) : t.Wo.ht(e), 
        !n.isEqual(at.min())) try {
            const e = await Kr(t.localStore);
            n.compareTo(e) >= 0 && 
            // We have received a target change with a global snapshot if the snapshot
            // version is not equal to SnapshotVersion.min().
            await 
            /**
     * Takes a batch of changes from the Datastore, repackages them as a
     * RemoteEvent, and passes that on to the listener, which is typically the
     * SyncEngine.
     */
            function(t, e) {
                const n = t.Wo.yt(e);
                // Update in-memory resume tokens. LocalStore will update the
                // persistent view of these when applying the completed RemoteEvent.
                            return n.targetChanges.forEach(((n, s) => {
                    if (n.resumeToken.approximateByteSize() > 0) {
                        const i = t.qo.get(s);
                        // A watched target might have been removed already.
                                            i && t.qo.set(s, i.withResumeToken(n.resumeToken, e));
                    }
                })), 
                // Re-establish listens for the targets that have been invalidated by
                // existence filter mismatches.
                n.targetMismatches.forEach((e => {
                    const n = t.qo.get(e);
                    if (!n) 
                    // A watched target might have been removed already.
                    return;
                    // Clear the resume token for the target, since we're in a known mismatch
                    // state.
                                    t.qo.set(e, n.withResumeToken(pt.EMPTY_BYTE_STRING, n.snapshotVersion)), 
                    // Cause a hard reset by unwatching and rewatching immediately, but
                    // deliberately don't send a resume token so that we get a full update.
                    Ko(t, e);
                    // Mark the target we send as being on behalf of an existence filter
                    // mismatch, but don't actually retain that in listenTargets. This ensures
                    // that we flag the first re-listen this way without impacting future
                    // listens of this target (that might happen e.g. on reconnect).
                    const s = new yi(n.target, e, 1 /* ExistenceFilterMismatch */ , n.sequenceNumber);
                    qo(t, s);
                })), t.remoteSyncer.applyRemoteEvent(n);
            }(t, n);
        } catch (e) {
            M("RemoteStore", "Failed to raise snapshot:", e), await Yo(t, e);
        }
    }

    /**
     * Recovery logic for IndexedDB errors that takes the network offline until
     * `op` succeeds. Retries are scheduled with backoff using
     * `enqueueRetryable()`. If `op()` is not provided, IndexedDB access is
     * validated via a generic operation.
     *
     * The returned Promise is resolved once the network is disabled and before
     * any retry attempt.
     */ async function Yo(t, e, n) {
        if (!ui(e)) throw e;
        t.Ko.add(1 /* IndexedDbFailed */), 
        // Disable network and raise offline snapshots
        await Bo(t), t.Qo.set("Offline" /* Offline */), n || (
        // Use a simple read operation to determine if IndexedDB recovered.
        // Ideally, we would expose a health check directly on SimpleDb, but
        // RemoteStore only has access to persistence through LocalStore.
        n = () => Kr(t.localStore)), 
        // Probe IndexedDB periodically and re-enable network
        t.asyncQueue.enqueueRetryable((async () => {
            M("RemoteStore", "Retrying IndexedDB access"), await n(), t.Ko.delete(1 /* IndexedDbFailed */), 
            await Fo(t);
        }));
    }

    /**
     * Executes `op`. If `op` fails, takes the network offline until `op`
     * succeeds. Returns after the first attempt.
     */ function Xo(t, e) {
        return e().catch((n => Yo(t, n, e)));
    }

    async function Zo(t) {
        const e = K(t), n = lc(e);
        let s = e.Uo.length > 0 ? e.Uo[e.Uo.length - 1].batchId : -1;
        for (;tc(e); ) try {
            const t = await Qr(e.localStore, s);
            if (null === t) {
                0 === e.Uo.length && n.ho();
                break;
            }
            s = t.batchId, ec(e, t);
        } catch (t) {
            await Yo(e, t);
        }
        nc(e) && sc(e);
    }

    /**
     * Returns true if we can add to the write pipeline (i.e. the network is
     * enabled and the write pipeline is not full).
     */ function tc(t) {
        return Qo(t) && t.Uo.length < 10;
    }

    /**
     * Queues additional writes to be sent to the write stream, sending them
     * immediately if the write stream is established.
     */ function ec(t, e) {
        t.Uo.push(e);
        const n = lc(t);
        n.co() && n.bo && n.vo(e.mutations);
    }

    function nc(t) {
        return Qo(t) && !lc(t).oo() && t.Uo.length > 0;
    }

    function sc(t) {
        lc(t).start();
    }

    async function ic(t) {
        lc(t).Do();
    }

    async function rc(t) {
        const e = lc(t);
        // Send the write pipeline now that the stream is established.
            for (const n of t.Uo) e.vo(n.mutations);
    }

    async function oc(t, e, n) {
        const s = t.Uo.shift(), i = mi.from(s, e, n);
        await Xo(t, (() => t.remoteSyncer.applySuccessfulWrite(i))), 
        // It's possible that with the completion of this mutation another
        // slot has freed up.
        await Zo(t);
    }

    async function cc(t, e) {
        // If the write stream closed after the write handshake completes, a write
        // operation failed and we fail the pending operation.
        e && lc(t).bo && 
        // This error affects the actual write.
        await async function(t, e) {
            // Only handle permanent errors here. If it's transient, just let the retry
            // logic kick in.
            if (n = e.code, En(n) && n !== G.ABORTED) {
                // This was a permanent error, the request itself was the problem
                // so it's not going to succeed if we resend it.
                const n = t.Uo.shift();
                // In this case it's also unlikely that the server itself is melting
                // down -- this was just a bad request so inhibit backoff on the next
                // restart.
                            lc(t).ao(), await Xo(t, (() => t.remoteSyncer.rejectFailedWrite(n.batchId, e))), 
                // It's possible that with the completion of this mutation
                // another slot has freed up.
                await Zo(t);
            }
            var n;
        }(t, e), 
        // The write stream might have been started by refilling the write
        // pipeline for failed writes
        nc(t) && sc(t);
    }

    async function uc(t, e) {
        const n = K(t);
        n.asyncQueue.verifyOperationInProgress(), M("RemoteStore", "RemoteStore received new credentials");
        const s = Qo(n);
        // Tear down and re-create our network streams. This will ensure we get a
        // fresh auth token for the new user and re-fill the write pipeline with
        // new mutations from the LocalStore (since mutations are per-user).
            n.Ko.add(3 /* CredentialChange */), await Bo(n), s && 
        // Don't set the network status to Unknown if we are offline.
        n.Qo.set("Unknown" /* Unknown */), await n.remoteSyncer.handleCredentialChange(e), 
        n.Ko.delete(3 /* CredentialChange */), await Fo(n);
    }

    /**
     * Toggles the network state when the client gains or loses its primary lease.
     */ async function ac(t, e) {
        const n = K(t);
        e ? (n.Ko.delete(2 /* IsSecondary */), await Fo(n)) : e || (n.Ko.add(2 /* IsSecondary */), 
        await Bo(n), n.Qo.set("Unknown" /* Unknown */));
    }

    /**
     * If not yet initialized, registers the WatchStream and its network state
     * callback with `remoteStoreImpl`. Returns the existing stream if one is
     * already available.
     *
     * PORTING NOTE: On iOS and Android, the WatchStream gets registered on startup.
     * This is not done on Web to allow it to be tree-shaken.
     */ function hc(t) {
        return t.zo || (
        // Create stream (but note that it is not started yet).
        t.zo = function(t, e, n) {
            const s = K(t);
            return s.No(), new xo(e, s.eo, s.authCredentials, s.appCheckCredentials, s.O, n);
        }
        /**
     * @license
     * Copyright 2018 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ (t.datastore, t.asyncQueue, {
            Pr: zo.bind(null, t),
            vr: Ho.bind(null, t),
            To: Jo.bind(null, t)
        }), t.Go.push((async e => {
            e ? (t.zo.ao(), jo(t) ? Go(t) : t.Qo.set("Unknown" /* Unknown */)) : (await t.zo.stop(), 
            Wo(t));
        }))), t.zo;
    }

    /**
     * If not yet initialized, registers the WriteStream and its network state
     * callback with `remoteStoreImpl`. Returns the existing stream if one is
     * already available.
     *
     * PORTING NOTE: On iOS and Android, the WriteStream gets registered on startup.
     * This is not done on Web to allow it to be tree-shaken.
     */ function lc(t) {
        return t.Ho || (
        // Create stream (but note that it is not started yet).
        t.Ho = function(t, e, n) {
            const s = K(t);
            return s.No(), new ko(e, s.eo, s.authCredentials, s.appCheckCredentials, s.O, n);
        }(t.datastore, t.asyncQueue, {
            Pr: ic.bind(null, t),
            vr: cc.bind(null, t),
            So: rc.bind(null, t),
            Vo: oc.bind(null, t)
        }), t.Go.push((async e => {
            e ? (t.Ho.ao(), 
            // This will start the write stream if necessary.
            await Zo(t)) : (await t.Ho.stop(), t.Uo.length > 0 && (M("RemoteStore", `Stopping write stream with ${t.Uo.length} pending writes`), 
            t.Uo = []));
        }))), t.Ho;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Represents an operation scheduled to be run in the future on an AsyncQueue.
     *
     * It is created via DelayedOperation.createAndSchedule().
     *
     * Supports cancellation (via cancel()) and early execution (via skipDelay()).
     *
     * Note: We implement `PromiseLike` instead of `Promise`, as the `Promise` type
     * in newer versions of TypeScript defines `finally`, which is not available in
     * IE.
     */
    class fc {
        constructor(t, e, n, s, i) {
            this.asyncQueue = t, this.timerId = e, this.targetTimeMs = n, this.op = s, this.removalCallback = i, 
            this.deferred = new Q, this.then = this.deferred.promise.then.bind(this.deferred.promise), 
            // It's normal for the deferred promise to be canceled (due to cancellation)
            // and so we attach a dummy catch callback to avoid
            // 'UnhandledPromiseRejectionWarning' log spam.
            this.deferred.promise.catch((t => {}));
        }
        /**
         * Creates and returns a DelayedOperation that has been scheduled to be
         * executed on the provided asyncQueue after the provided delayMs.
         *
         * @param asyncQueue - The queue to schedule the operation on.
         * @param id - A Timer ID identifying the type of operation this is.
         * @param delayMs - The delay (ms) before the operation should be scheduled.
         * @param op - The operation to run.
         * @param removalCallback - A callback to be called synchronously once the
         *   operation is executed or canceled, notifying the AsyncQueue to remove it
         *   from its delayedOperations list.
         *   PORTING NOTE: This exists to prevent making removeDelayedOperation() and
         *   the DelayedOperation class public.
         */    static createAndSchedule(t, e, n, s, i) {
            const r = Date.now() + n, o = new fc(t, e, r, s, i);
            return o.start(n), o;
        }
        /**
         * Starts the timer. This is called immediately after construction by
         * createAndSchedule().
         */    start(t) {
            this.timerHandle = setTimeout((() => this.handleDelayElapsed()), t);
        }
        /**
         * Queues the operation to run immediately (if it hasn't already been run or
         * canceled).
         */    skipDelay() {
            return this.handleDelayElapsed();
        }
        /**
         * Cancels the operation if it hasn't already been executed or canceled. The
         * promise will be rejected.
         *
         * As long as the operation has not yet been run, calling cancel() provides a
         * guarantee that the operation will not be run.
         */    cancel(t) {
            null !== this.timerHandle && (this.clearTimeout(), this.deferred.reject(new j(G.CANCELLED, "Operation cancelled" + (t ? ": " + t : ""))));
        }
        handleDelayElapsed() {
            this.asyncQueue.enqueueAndForget((() => null !== this.timerHandle ? (this.clearTimeout(), 
            this.op().then((t => this.deferred.resolve(t)))) : Promise.resolve()));
        }
        clearTimeout() {
            null !== this.timerHandle && (this.removalCallback(this), clearTimeout(this.timerHandle), 
            this.timerHandle = null);
        }
    }

    /**
     * Returns a FirestoreError that can be surfaced to the user if the provided
     * error is an IndexedDbTransactionError. Re-throws the error otherwise.
     */ function dc(t, e) {
        if ($("AsyncQueue", `${e}: ${t}`), ui(t)) return new j(G.UNAVAILABLE, `${e}: ${t}`);
        throw t;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * DocumentSet is an immutable (copy-on-write) collection that holds documents
     * in order specified by the provided comparator. We always add a document key
     * comparator on top of what is provided to guarantee document equality based on
     * the key.
     */ class _c {
        /** The default ordering is by key if the comparator is omitted */
        constructor(t) {
            // We are adding document key comparator to the end as it's the only
            // guaranteed unique property of a document.
            this.comparator = t ? (e, n) => t(e, n) || Nt.comparator(e.key, n.key) : (t, e) => Nt.comparator(t.key, e.key), 
            this.keyedMap = Nn(), this.sortedSet = new An(this.comparator);
        }
        /**
         * Returns an empty copy of the existing DocumentSet, using the same
         * comparator.
         */    static emptySet(t) {
            return new _c(t.comparator);
        }
        has(t) {
            return null != this.keyedMap.get(t);
        }
        get(t) {
            return this.keyedMap.get(t);
        }
        first() {
            return this.sortedSet.minKey();
        }
        last() {
            return this.sortedSet.maxKey();
        }
        isEmpty() {
            return this.sortedSet.isEmpty();
        }
        /**
         * Returns the index of the provided key in the document set, or -1 if the
         * document key is not present in the set;
         */    indexOf(t) {
            const e = this.keyedMap.get(t);
            return e ? this.sortedSet.indexOf(e) : -1;
        }
        get size() {
            return this.sortedSet.size;
        }
        /** Iterates documents in order defined by "comparator" */    forEach(t) {
            this.sortedSet.inorderTraversal(((e, n) => (t(e), !1)));
        }
        /** Inserts or updates a document with the same key */    add(t) {
            // First remove the element if we have it.
            const e = this.delete(t.key);
            return e.copy(e.keyedMap.insert(t.key, t), e.sortedSet.insert(t, null));
        }
        /** Deletes a document with a given key */    delete(t) {
            const e = this.get(t);
            return e ? this.copy(this.keyedMap.remove(t), this.sortedSet.remove(e)) : this;
        }
        isEqual(t) {
            if (!(t instanceof _c)) return !1;
            if (this.size !== t.size) return !1;
            const e = this.sortedSet.getIterator(), n = t.sortedSet.getIterator();
            for (;e.hasNext(); ) {
                const t = e.getNext().key, s = n.getNext().key;
                if (!t.isEqual(s)) return !1;
            }
            return !0;
        }
        toString() {
            const t = [];
            return this.forEach((e => {
                t.push(e.toString());
            })), 0 === t.length ? "DocumentSet ()" : "DocumentSet (\n  " + t.join("  \n") + "\n)";
        }
        copy(t, e) {
            const n = new _c;
            return n.comparator = this.comparator, n.keyedMap = t, n.sortedSet = e, n;
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * DocumentChangeSet keeps track of a set of changes to docs in a query, merging
     * duplicate events for the same doc.
     */ class wc {
        constructor() {
            this.Jo = new An(Nt.comparator);
        }
        track(t) {
            const e = t.doc.key, n = this.Jo.get(e);
            n ? 
            // Merge the new change with the existing change.
            0 /* Added */ !== t.type && 3 /* Metadata */ === n.type ? this.Jo = this.Jo.insert(e, t) : 3 /* Metadata */ === t.type && 1 /* Removed */ !== n.type ? this.Jo = this.Jo.insert(e, {
                type: n.type,
                doc: t.doc
            }) : 2 /* Modified */ === t.type && 2 /* Modified */ === n.type ? this.Jo = this.Jo.insert(e, {
                type: 2 /* Modified */ ,
                doc: t.doc
            }) : 2 /* Modified */ === t.type && 0 /* Added */ === n.type ? this.Jo = this.Jo.insert(e, {
                type: 0 /* Added */ ,
                doc: t.doc
            }) : 1 /* Removed */ === t.type && 0 /* Added */ === n.type ? this.Jo = this.Jo.remove(e) : 1 /* Removed */ === t.type && 2 /* Modified */ === n.type ? this.Jo = this.Jo.insert(e, {
                type: 1 /* Removed */ ,
                doc: n.doc
            }) : 0 /* Added */ === t.type && 1 /* Removed */ === n.type ? this.Jo = this.Jo.insert(e, {
                type: 2 /* Modified */ ,
                doc: t.doc
            }) : 
            // This includes these cases, which don't make sense:
            // Added->Added
            // Removed->Removed
            // Modified->Added
            // Removed->Modified
            // Metadata->Added
            // Removed->Metadata
            L() : this.Jo = this.Jo.insert(e, t);
        }
        Yo() {
            const t = [];
            return this.Jo.inorderTraversal(((e, n) => {
                t.push(n);
            })), t;
        }
    }

    class mc {
        constructor(t, e, n, s, i, r, o, c) {
            this.query = t, this.docs = e, this.oldDocs = n, this.docChanges = s, this.mutatedKeys = i, 
            this.fromCache = r, this.syncStateChanged = o, this.excludesMetadataChanges = c;
        }
        /** Returns a view snapshot as if all documents in the snapshot were added. */    static fromInitialDocuments(t, e, n, s) {
            const i = [];
            return e.forEach((t => {
                i.push({
                    type: 0 /* Added */ ,
                    doc: t
                });
            })), new mc(t, e, _c.emptySet(e), i, n, s, 
            /* syncStateChanged= */ !0, 
            /* excludesMetadataChanges= */ !1);
        }
        get hasPendingWrites() {
            return !this.mutatedKeys.isEmpty();
        }
        isEqual(t) {
            if (!(this.fromCache === t.fromCache && this.syncStateChanged === t.syncStateChanged && this.mutatedKeys.isEqual(t.mutatedKeys) && Ne(this.query, t.query) && this.docs.isEqual(t.docs) && this.oldDocs.isEqual(t.oldDocs))) return !1;
            const e = this.docChanges, n = t.docChanges;
            if (e.length !== n.length) return !1;
            for (let t = 0; t < e.length; t++) if (e[t].type !== n[t].type || !e[t].doc.isEqual(n[t].doc)) return !1;
            return !0;
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Holds the listeners and the last received ViewSnapshot for a query being
     * tracked by EventManager.
     */ class gc {
        constructor() {
            this.Xo = void 0, this.listeners = [];
        }
    }

    class yc {
        constructor() {
            this.queries = new Er((t => xe(t)), Ne), this.onlineState = "Unknown" /* Unknown */ , 
            this.Zo = new Set;
        }
    }

    async function pc(t, e) {
        const n = K(t), s = e.query;
        let i = !1, r = n.queries.get(s);
        if (r || (i = !0, r = new gc), i) try {
            r.Xo = await n.onListen(s);
        } catch (t) {
            const n = dc(t, `Initialization of query '${ke(e.query)}' failed`);
            return void e.onError(n);
        }
        if (n.queries.set(s, r), r.listeners.push(e), 
        // Run global snapshot listeners if a consistent snapshot has been emitted.
        e.tc(n.onlineState), r.Xo) {
            e.ec(r.Xo) && Ac(n);
        }
    }

    async function Ic(t, e) {
        const n = K(t), s = e.query;
        let i = !1;
        const r = n.queries.get(s);
        if (r) {
            const t = r.listeners.indexOf(e);
            t >= 0 && (r.listeners.splice(t, 1), i = 0 === r.listeners.length);
        }
        if (i) return n.queries.delete(s), n.onUnlisten(s);
    }

    function Ec(t, e) {
        const n = K(t);
        let s = !1;
        for (const t of e) {
            const e = t.query, i = n.queries.get(e);
            if (i) {
                for (const e of i.listeners) e.ec(t) && (s = !0);
                i.Xo = t;
            }
        }
        s && Ac(n);
    }

    function Tc(t, e, n) {
        const s = K(t), i = s.queries.get(e);
        if (i) for (const t of i.listeners) t.onError(n);
        // Remove all listeners. NOTE: We don't need to call syncEngine.unlisten()
        // after an error.
            s.queries.delete(e);
    }

    // Call all global snapshot listeners that have been set.
    function Ac(t) {
        t.Zo.forEach((t => {
            t.next();
        }));
    }

    /**
     * QueryListener takes a series of internal view snapshots and determines
     * when to raise the event.
     *
     * It uses an Observer to dispatch events.
     */ class Rc {
        constructor(t, e, n) {
            this.query = t, this.nc = e, 
            /**
             * Initial snapshots (e.g. from cache) may not be propagated to the wrapped
             * observer. This flag is set to true once we've actually raised an event.
             */
            this.sc = !1, this.ic = null, this.onlineState = "Unknown" /* Unknown */ , this.options = n || {};
        }
        /**
         * Applies the new ViewSnapshot to this listener, raising a user-facing event
         * if applicable (depending on what changed, whether the user has opted into
         * metadata-only changes, etc.). Returns true if a user-facing event was
         * indeed raised.
         */    ec(t) {
            if (!this.options.includeMetadataChanges) {
                // Remove the metadata only changes.
                const e = [];
                for (const n of t.docChanges) 3 /* Metadata */ !== n.type && e.push(n);
                t = new mc(t.query, t.docs, t.oldDocs, e, t.mutatedKeys, t.fromCache, t.syncStateChanged, 
                /* excludesMetadataChanges= */ !0);
            }
            let e = !1;
            return this.sc ? this.rc(t) && (this.nc.next(t), e = !0) : this.oc(t, this.onlineState) && (this.cc(t), 
            e = !0), this.ic = t, e;
        }
        onError(t) {
            this.nc.error(t);
        }
        /** Returns whether a snapshot was raised. */    tc(t) {
            this.onlineState = t;
            let e = !1;
            return this.ic && !this.sc && this.oc(this.ic, t) && (this.cc(this.ic), e = !0), 
            e;
        }
        oc(t, e) {
            // Always raise the first event when we're synced
            if (!t.fromCache) return !0;
            // NOTE: We consider OnlineState.Unknown as online (it should become Offline
            // or Online if we wait long enough).
                    const n = "Offline" /* Offline */ !== e;
            // Don't raise the event if we're online, aren't synced yet (checked
            // above) and are waiting for a sync.
                    return (!this.options.uc || !n) && (!t.docs.isEmpty() || "Offline" /* Offline */ === e);
            // Raise data from cache if we have any documents or we are offline
            }
        rc(t) {
            // We don't need to handle includeDocumentMetadataChanges here because
            // the Metadata only changes have already been stripped out if needed.
            // At this point the only changes we will see are the ones we should
            // propagate.
            if (t.docChanges.length > 0) return !0;
            const e = this.ic && this.ic.hasPendingWrites !== t.hasPendingWrites;
            return !(!t.syncStateChanged && !e) && !0 === this.options.includeMetadataChanges;
            // Generally we should have hit one of the cases above, but it's possible
            // to get here if there were only metadata docChanges and they got
            // stripped out.
            }
        cc(t) {
            t = mc.fromInitialDocuments(t.query, t.docs, t.mutatedKeys, t.fromCache), this.sc = !0, 
            this.nc.next(t);
        }
    }

    /**
     * Returns a `LoadBundleTaskProgress` representing the progress that the loading
     * has succeeded.
     */
    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class Sc {
        constructor(t) {
            this.key = t;
        }
    }

    class Dc {
        constructor(t) {
            this.key = t;
        }
    }

    /**
     * View is responsible for computing the final merged truth of what docs are in
     * a query. It gets notified of local and remote changes to docs, and applies
     * the query filters and limits to determine the most correct possible results.
     */ class Cc {
        constructor(t, 
        /** Documents included in the remote target */
        e) {
            this.query = t, this.dc = e, this._c = null, 
            /**
             * A flag whether the view is current with the backend. A view is considered
             * current after it has seen the current flag from the backend and did not
             * lose consistency within the watch stream (e.g. because of an existence
             * filter mismatch).
             */
            this.current = !1, 
            /** Documents in the view but not in the remote target */
            this.wc = On(), 
            /** Document Keys that have local changes */
            this.mutatedKeys = On(), this.mc = Me(t), this.gc = new _c(this.mc);
        }
        /**
         * The set of remote documents that the server has told us belongs to the target associated with
         * this view.
         */    get yc() {
            return this.dc;
        }
        /**
         * Iterates over a set of doc changes, applies the query limit, and computes
         * what the new results should be, what the changes were, and whether we may
         * need to go back to the local cache for more results. Does not make any
         * changes to the view.
         * @param docChanges - The doc changes to apply to this view.
         * @param previousChanges - If this is being called with a refill, then start
         *        with this set of docs and changes instead of the current view.
         * @returns a new set of docs, changes, and refill flag.
         */    Ic(t, e) {
            const n = e ? e.Ec : new wc, s = e ? e.gc : this.gc;
            let i = e ? e.mutatedKeys : this.mutatedKeys, r = s, o = !1;
            // Track the last doc in a (full) limit. This is necessary, because some
            // update (a delete, or an update moving a doc past the old limit) might
            // mean there is some other document in the local cache that either should
            // come (1) between the old last limit doc and the new last document, in the
            // case of updates, or (2) after the new last document, in the case of
            // deletes. So we keep this doc at the old limit to compare the updates to.
            // Note that this should never get used in a refill (when previousChanges is
            // set), because there will only be adds -- no deletes or updates.
            const c = Re(this.query) && s.size === this.query.limit ? s.last() : null, u = Pe(this.query) && s.size === this.query.limit ? s.first() : null;
            // Drop documents out to meet limit/limitToLast requirement.
            if (t.inorderTraversal(((t, e) => {
                const a = s.get(t), h = Oe(this.query, e) ? e : null, l = !!a && this.mutatedKeys.has(a.key), f = !!h && (h.hasLocalMutations || 
                // We only consider committed mutations for documents that were
                // mutated during the lifetime of the view.
                this.mutatedKeys.has(h.key) && h.hasCommittedMutations);
                let d = !1;
                // Calculate change
                            if (a && h) {
                    a.data.isEqual(h.data) ? l !== f && (n.track({
                        type: 3 /* Metadata */ ,
                        doc: h
                    }), d = !0) : this.Tc(a, h) || (n.track({
                        type: 2 /* Modified */ ,
                        doc: h
                    }), d = !0, (c && this.mc(h, c) > 0 || u && this.mc(h, u) < 0) && (
                    // This doc moved from inside the limit to outside the limit.
                    // That means there may be some other doc in the local cache
                    // that should be included instead.
                    o = !0));
                } else !a && h ? (n.track({
                    type: 0 /* Added */ ,
                    doc: h
                }), d = !0) : a && !h && (n.track({
                    type: 1 /* Removed */ ,
                    doc: a
                }), d = !0, (c || u) && (
                // A doc was removed from a full limit query. We'll need to
                // requery from the local cache to see if we know about some other
                // doc that should be in the results.
                o = !0));
                d && (h ? (r = r.add(h), i = f ? i.add(t) : i.delete(t)) : (r = r.delete(t), i = i.delete(t)));
            })), Re(this.query) || Pe(this.query)) for (;r.size > this.query.limit; ) {
                const t = Re(this.query) ? r.last() : r.first();
                r = r.delete(t.key), i = i.delete(t.key), n.track({
                    type: 1 /* Removed */ ,
                    doc: t
                });
            }
            return {
                gc: r,
                Ec: n,
                ks: o,
                mutatedKeys: i
            };
        }
        Tc(t, e) {
            // We suppress the initial change event for documents that were modified as
            // part of a write acknowledgment (e.g. when the value of a server transform
            // is applied) as Watch will send us the same document again.
            // By suppressing the event, we only raise two user visible events (one with
            // `hasPendingWrites` and the final state of the document) instead of three
            // (one with `hasPendingWrites`, the modified document with
            // `hasPendingWrites` and the final state of the document).
            return t.hasLocalMutations && e.hasCommittedMutations && !e.hasLocalMutations;
        }
        /**
         * Updates the view with the given ViewDocumentChanges and optionally updates
         * limbo docs and sync state from the provided target change.
         * @param docChanges - The set of changes to make to the view's docs.
         * @param updateLimboDocuments - Whether to update limbo documents based on
         *        this change.
         * @param targetChange - A target change to apply for computing limbo docs and
         *        sync state.
         * @returns A new ViewChange with the given docs, changes, and sync state.
         */
        // PORTING NOTE: The iOS/Android clients always compute limbo document changes.
        applyChanges(t, e, n) {
            const s = this.gc;
            this.gc = t.gc, this.mutatedKeys = t.mutatedKeys;
            // Sort changes based on type and query comparator
            const i = t.Ec.Yo();
            i.sort(((t, e) => function(t, e) {
                const n = t => {
                    switch (t) {
                      case 0 /* Added */ :
                        return 1;

                      case 2 /* Modified */ :
                      case 3 /* Metadata */ :
                        // A metadata change is converted to a modified change at the public
                        // api layer.  Since we sort by document key and then change type,
                        // metadata and modified changes must be sorted equivalently.
                        return 2;

                      case 1 /* Removed */ :
                        return 0;

                      default:
                        return L();
                    }
                };
                return n(t) - n(e);
            }
            /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ (t.type, e.type) || this.mc(t.doc, e.doc))), this.Ac(n);
            const r = e ? this.Rc() : [], o = 0 === this.wc.size && this.current ? 1 /* Synced */ : 0 /* Local */ , c = o !== this._c;
            if (this._c = o, 0 !== i.length || c) {
                return {
                    snapshot: new mc(this.query, t.gc, s, i, t.mutatedKeys, 0 /* Local */ === o, c, 
                    /* excludesMetadataChanges= */ !1),
                    Pc: r
                };
            }
            // no changes
            return {
                Pc: r
            };
        }
        /**
         * Applies an OnlineState change to the view, potentially generating a
         * ViewChange if the view's syncState changes as a result.
         */    tc(t) {
            return this.current && "Offline" /* Offline */ === t ? (
            // If we're offline, set `current` to false and then call applyChanges()
            // to refresh our syncState and generate a ViewChange as appropriate. We
            // are guaranteed to get a new TargetChange that sets `current` back to
            // true once the client is back online.
            this.current = !1, this.applyChanges({
                gc: this.gc,
                Ec: new wc,
                mutatedKeys: this.mutatedKeys,
                ks: !1
            }, 
            /* updateLimboDocuments= */ !1)) : {
                Pc: []
            };
        }
        /**
         * Returns whether the doc for the given key should be in limbo.
         */    bc(t) {
            // If the remote end says it's part of this query, it's not in limbo.
            return !this.dc.has(t) && (
            // The local store doesn't think it's a result, so it shouldn't be in limbo.
            !!this.gc.has(t) && !this.gc.get(t).hasLocalMutations);
        }
        /**
         * Updates syncedDocuments, current, and limbo docs based on the given change.
         * Returns the list of changes to which docs are in limbo.
         */    Ac(t) {
            t && (t.addedDocuments.forEach((t => this.dc = this.dc.add(t))), t.modifiedDocuments.forEach((t => {})), 
            t.removedDocuments.forEach((t => this.dc = this.dc.delete(t))), this.current = t.current);
        }
        Rc() {
            // We can only determine limbo documents when we're in-sync with the server.
            if (!this.current) return [];
            // TODO(klimt): Do this incrementally so that it's not quadratic when
            // updating many documents.
                    const t = this.wc;
            this.wc = On(), this.gc.forEach((t => {
                this.bc(t.key) && (this.wc = this.wc.add(t.key));
            }));
            // Diff the new limbo docs with the old limbo docs.
            const e = [];
            return t.forEach((t => {
                this.wc.has(t) || e.push(new Dc(t));
            })), this.wc.forEach((n => {
                t.has(n) || e.push(new Sc(n));
            })), e;
        }
        /**
         * Update the in-memory state of the current view with the state read from
         * persistence.
         *
         * We update the query view whenever a client's primary status changes:
         * - When a client transitions from primary to secondary, it can miss
         *   LocalStorage updates and its query views may temporarily not be
         *   synchronized with the state on disk.
         * - For secondary to primary transitions, the client needs to update the list
         *   of `syncedDocuments` since secondary clients update their query views
         *   based purely on synthesized RemoteEvents.
         *
         * @param queryResult.documents - The documents that match the query according
         * to the LocalStore.
         * @param queryResult.remoteKeys - The keys of the documents that match the
         * query according to the backend.
         *
         * @returns The ViewChange that resulted from this synchronization.
         */
        // PORTING NOTE: Multi-tab only.
        vc(t) {
            this.dc = t.Ks, this.wc = On();
            const e = this.Ic(t.documents);
            return this.applyChanges(e, /*updateLimboDocuments=*/ !0);
        }
        /**
         * Returns a view snapshot as if this query was just listened to. Contains
         * a document add for every existing document and the `fromCache` and
         * `hasPendingWrites` status of the already established view.
         */
        // PORTING NOTE: Multi-tab only.
        Vc() {
            return mc.fromInitialDocuments(this.query, this.gc, this.mutatedKeys, 0 /* Local */ === this._c);
        }
    }

    /**
     * QueryView contains all of the data that SyncEngine needs to keep track of for
     * a particular query.
     */
    class Nc {
        constructor(
        /**
         * The query itself.
         */
        t, 
        /**
         * The target number created by the client that is used in the watch
         * stream to identify this query.
         */
        e, 
        /**
         * The view is responsible for computing the final merged truth of what
         * docs are in the query. It gets notified of local and remote changes,
         * and applies the query filters and limits to determine the most correct
         * possible results.
         */
        n) {
            this.query = t, this.targetId = e, this.view = n;
        }
    }

    /** Tracks a limbo resolution. */ class xc {
        constructor(t) {
            this.key = t, 
            /**
             * Set to true once we've received a document. This is used in
             * getRemoteKeysForTarget() and ultimately used by WatchChangeAggregator to
             * decide whether it needs to manufacture a delete event for the target once
             * the target is CURRENT.
             */
            this.Sc = !1;
        }
    }

    /**
     * An implementation of `SyncEngine` coordinating with other parts of SDK.
     *
     * The parts of SyncEngine that act as a callback to RemoteStore need to be
     * registered individually. This is done in `syncEngineWrite()` and
     * `syncEngineListen()` (as well as `applyPrimaryState()`) as these methods
     * serve as entry points to RemoteStore's functionality.
     *
     * Note: some field defined in this class might have public access level, but
     * the class is not exported so they are only accessible from this module.
     * This is useful to implement optional features (like bundles) in free
     * functions, such that they are tree-shakeable.
     */ class kc {
        constructor(t, e, n, 
        // PORTING NOTE: Manages state synchronization in multi-tab environments.
        s, i, r) {
            this.localStore = t, this.remoteStore = e, this.eventManager = n, this.sharedClientState = s, 
            this.currentUser = i, this.maxConcurrentLimboResolutions = r, this.Dc = {}, this.Cc = new Er((t => xe(t)), Ne), 
            this.Nc = new Map, 
            /**
             * The keys of documents that are in limbo for which we haven't yet started a
             * limbo resolution query. The strings in this set are the result of calling
             * `key.path.canonicalString()` where `key` is a `DocumentKey` object.
             *
             * The `Set` type was chosen because it provides efficient lookup and removal
             * of arbitrary elements and it also maintains insertion order, providing the
             * desired queue-like FIFO semantics.
             */
            this.xc = new Set, 
            /**
             * Keeps track of the target ID for each document that is in limbo with an
             * active target.
             */
            this.kc = new An(Nt.comparator), 
            /**
             * Keeps track of the information about an active limbo resolution for each
             * active target ID that was started for the purpose of limbo resolution.
             */
            this.Oc = new Map, this.Mc = new so, 
            /** Stores user completion handlers, indexed by User and BatchId. */
            this.$c = {}, 
            /** Stores user callbacks waiting for all pending writes to be acknowledged. */
            this.Fc = new Map, this.Bc = ar.Je(), this.onlineState = "Unknown" /* Unknown */ , 
            // The primary state is set to `true` or `false` immediately after Firestore
            // startup. In the interim, a client should only be considered primary if
            // `isPrimary` is true.
            this.Lc = void 0;
        }
        get isPrimaryClient() {
            return !0 === this.Lc;
        }
    }

    /**
     * Initiates the new listen, resolves promise when listen enqueued to the
     * server. All the subsequent view snapshots or errors are sent to the
     * subscribed handlers. Returns the initial snapshot.
     */
    async function Oc(t, e) {
        const n = hu(t);
        let s, i;
        const r = n.Cc.get(e);
        if (r) 
        // PORTING NOTE: With Multi-Tab Web, it is possible that a query view
        // already exists when EventManager calls us for the first time. This
        // happens when the primary tab is already listening to this query on
        // behalf of another tab and the user of the primary also starts listening
        // to the query. EventManager will not have an assigned target ID in this
        // case and calls `listen` to obtain this ID.
        s = r.targetId, n.sharedClientState.addLocalQueryTarget(s), i = r.view.Vc(); else {
            const t = await Wr(n.localStore, De(e));
            n.isPrimaryClient && Lo(n.remoteStore, t);
            const r = n.sharedClientState.addLocalQueryTarget(t.targetId);
            s = t.targetId, i = await Mc(n, e, s, "current" === r);
        }
        return i;
    }

    /**
     * Registers a view for a previously unknown query and computes its initial
     * snapshot.
     */ async function Mc(t, e, n, s) {
        // PORTING NOTE: On Web only, we inject the code that registers new Limbo
        // targets based on view changes. This allows us to only depend on Limbo
        // changes when user code includes queries.
        t.Uc = (e, n, s) => async function(t, e, n, s) {
            let i = e.view.Ic(n);
            i.ks && (
            // The query has a limit and some docs were removed, so we need
            // to re-run the query against the local store to make sure we
            // didn't lose any good docs that had been past the limit.
            i = await Hr(t.localStore, e.query, 
            /* usePreviousResults= */ !1).then((({documents: t}) => e.view.Ic(t, i))));
            const r = s && s.targetChanges.get(e.targetId), o = e.view.applyChanges(i, 
            /* updateLimboDocuments= */ t.isPrimaryClient, r);
            return Hc(t, e.targetId, o.Pc), o.snapshot;
        }(t, e, n, s);
        const i = await Hr(t.localStore, e, 
        /* usePreviousResults= */ !0), r = new Cc(e, i.Ks), o = r.Ic(i.documents), c = Bn.createSynthesizedTargetChangeForCurrentChange(n, s && "Offline" /* Offline */ !== t.onlineState), u = r.applyChanges(o, 
        /* updateLimboDocuments= */ t.isPrimaryClient, c);
        Hc(t, n, u.Pc);
        const a = new Nc(e, n, r);
        return t.Cc.set(e, a), t.Nc.has(n) ? t.Nc.get(n).push(e) : t.Nc.set(n, [ e ]), u.snapshot;
    }

    /** Stops listening to the query. */ async function $c(t, e) {
        const n = K(t), s = n.Cc.get(e), i = n.Nc.get(s.targetId);
        if (i.length > 1) return n.Nc.set(s.targetId, i.filter((t => !Ne(t, e)))), void n.Cc.delete(e);
        // No other queries are mapped to the target, clean up the query and the target.
            if (n.isPrimaryClient) {
            // We need to remove the local query target first to allow us to verify
            // whether any other client is still interested in this target.
            n.sharedClientState.removeLocalQueryTarget(s.targetId);
            n.sharedClientState.isActiveQueryTarget(s.targetId) || await zr(n.localStore, s.targetId, 
            /*keepPersistedTargetData=*/ !1).then((() => {
                n.sharedClientState.clearQueryState(s.targetId), Uo(n.remoteStore, s.targetId), 
                Wc(n, s.targetId);
            })).catch(_r);
        } else Wc(n, s.targetId), await zr(n.localStore, s.targetId, 
        /*keepPersistedTargetData=*/ !0);
    }

    /**
     * Initiates the write of local mutation batch which involves adding the
     * writes to the mutation queue, notifying the remote store about new
     * mutations and raising events for any changes this write caused.
     *
     * The promise returned by this call is resolved when the above steps
     * have completed, *not* when the write was acked by the backend. The
     * userCallback is resolved once the write was acked/rejected by the
     * backend (or failed locally for any other reason).
     */ async function Fc(t, e, n) {
        const s = lu(t);
        try {
            const t = await function(t, e) {
                const n = K(t), s = ut.now(), i = e.reduce(((t, e) => t.add(e.key)), On());
                let r;
                return n.persistence.runTransaction("Locally write mutations", "readwrite", (t => n.Us.Es(t, i).next((i => {
                    r = i;
                    // For non-idempotent mutations (such as `FieldValue.increment()`),
                    // we record the base state in a separate patch mutation. This is
                    // later used to guarantee consistent values and prevents flicker
                    // even if the backend sends us an update that already includes our
                    // transform.
                    const o = [];
                    for (const t of e) {
                        const e = un(t, r.get(t.key));
                        null != e && 
                        // NOTE: The base state should only be applied if there's some
                        // existing document to override, so use a Precondition of
                        // exists=true
                        o.push(new fn(t.key, e, Ht(e.value.mapValue), nn.exists(!0)));
                    }
                    return n.gs.addMutationBatch(t, s, o, e);
                })))).then((t => (t.applyToLocalDocumentSet(r), {
                    batchId: t.batchId,
                    changes: r
                })));
            }(s.localStore, e);
            s.sharedClientState.addPendingMutation(t.batchId), function(t, e, n) {
                let s = t.$c[t.currentUser.toKey()];
                s || (s = new An(rt));
                s = s.insert(e, n), t.$c[t.currentUser.toKey()] = s;
            }
            /**
     * Resolves or rejects the user callback for the given batch and then discards
     * it.
     */ (s, t.batchId, n), await Xc(s, t.changes), await Zo(s.remoteStore);
        } catch (t) {
            // If we can't persist the mutation, we reject the user callback and
            // don't send the mutation. The user can then retry the write.
            const e = dc(t, "Failed to persist write");
            n.reject(e);
        }
    }

    /**
     * Applies one remote event to the sync engine, notifying any views of the
     * changes, and releasing any pending mutation batches that would become
     * visible because of the snapshot version the remote event contains.
     */ async function Bc(t, e) {
        const n = K(t);
        try {
            const t = await Gr(n.localStore, e);
            // Update `receivedDocument` as appropriate for any limbo targets.
                    e.targetChanges.forEach(((t, e) => {
                const s = n.Oc.get(e);
                s && (
                // Since this is a limbo resolution lookup, it's for a single document
                // and it could be added, modified, or removed, but not a combination.
                U(t.addedDocuments.size + t.modifiedDocuments.size + t.removedDocuments.size <= 1), 
                t.addedDocuments.size > 0 ? s.Sc = !0 : t.modifiedDocuments.size > 0 ? U(s.Sc) : t.removedDocuments.size > 0 && (U(s.Sc), 
                s.Sc = !1));
            })), await Xc(n, t, e);
        } catch (t) {
            await _r(t);
        }
    }

    /**
     * Applies an OnlineState change to the sync engine and notifies any views of
     * the change.
     */ function Lc(t, e, n) {
        const s = K(t);
        // If we are the secondary client, we explicitly ignore the remote store's
        // online state (the local client may go offline, even though the primary
        // tab remains online) and only apply the primary tab's online state from
        // SharedClientState.
            if (s.isPrimaryClient && 0 /* RemoteStore */ === n || !s.isPrimaryClient && 1 /* SharedClientState */ === n) {
            const t = [];
            s.Cc.forEach(((n, s) => {
                const i = s.view.tc(e);
                i.snapshot && t.push(i.snapshot);
            })), function(t, e) {
                const n = K(t);
                n.onlineState = e;
                let s = !1;
                n.queries.forEach(((t, n) => {
                    for (const t of n.listeners) 
                    // Run global snapshot listeners if a consistent snapshot has been emitted.
                    t.tc(e) && (s = !0);
                })), s && Ac(n);
            }(s.eventManager, e), t.length && s.Dc.To(t), s.onlineState = e, s.isPrimaryClient && s.sharedClientState.setOnlineState(e);
        }
    }

    /**
     * Rejects the listen for the given targetID. This can be triggered by the
     * backend for any active target.
     *
     * @param syncEngine - The sync engine implementation.
     * @param targetId - The targetID corresponds to one previously initiated by the
     * user as part of TargetData passed to listen() on RemoteStore.
     * @param err - A description of the condition that has forced the rejection.
     * Nearly always this will be an indication that the user is no longer
     * authorized to see the data matching the target.
     */ async function Uc(t, e, n) {
        const s = K(t);
        // PORTING NOTE: Multi-tab only.
            s.sharedClientState.updateQueryState(e, "rejected", n);
        const i = s.Oc.get(e), r = i && i.key;
        if (r) {
            // TODO(klimt): We really only should do the following on permission
            // denied errors, but we don't have the cause code here.
            // It's a limbo doc. Create a synthetic event saying it was deleted.
            // This is kind of a hack. Ideally, we would have a method in the local
            // store to purge a document. However, it would be tricky to keep all of
            // the local store's invariants with another method.
            let t = new An(Nt.comparator);
            // TODO(b/217189216): This limbo document should ideally have a read time,
            // so that it is picked up by any read-time based scans. The backend,
            // however, does not send a read time for target removals.
                    t = t.insert(r, Jt.newNoDocument(r, at.min()));
            const n = On().add(r), i = new Fn(at.min(), 
            /* targetChanges= */ new Map, 
            /* targetMismatches= */ new bn(rt), t, n);
            await Bc(s, i), 
            // Since this query failed, we won't want to manually unlisten to it.
            // We only remove it from bookkeeping after we successfully applied the
            // RemoteEvent. If `applyRemoteEvent()` throws, we want to re-listen to
            // this query when the RemoteStore restarts the Watch stream, which should
            // re-trigger the target failure.
            s.kc = s.kc.remove(r), s.Oc.delete(e), Yc(s);
        } else await zr(s.localStore, e, 
        /* keepPersistedTargetData */ !1).then((() => Wc(s, e, n))).catch(_r);
    }

    async function qc(t, e) {
        const n = K(t), s = e.batch.batchId;
        try {
            const t = await qr(n.localStore, e);
            // The local store may or may not be able to apply the write result and
            // raise events immediately (depending on whether the watcher is caught
            // up), so we raise user callbacks first so that they consistently happen
            // before listen events.
                    Qc(n, s, /*error=*/ null), jc(n, s), n.sharedClientState.updateMutationState(s, "acknowledged"), 
            await Xc(n, t);
        } catch (t) {
            await _r(t);
        }
    }

    async function Kc(t, e, n) {
        const s = K(t);
        try {
            const t = await function(t, e) {
                const n = K(t);
                return n.persistence.runTransaction("Reject batch", "readwrite-primary", (t => {
                    let s;
                    return n.gs.lookupMutationBatch(t, e).next((e => (U(null !== e), s = e.keys(), n.gs.removeMutationBatch(t, e)))).next((() => n.gs.performConsistencyCheck(t))).next((() => n.Us.Es(t, s)));
                }));
            }
            /**
     * Returns the largest (latest) batch id in mutation queue that is pending
     * server response.
     *
     * Returns `BATCHID_UNKNOWN` if the queue is empty.
     */ (s.localStore, e);
            // The local store may or may not be able to apply the write result and
            // raise events immediately (depending on whether the watcher is caught up),
            // so we raise user callbacks first so that they consistently happen before
            // listen events.
                    Qc(s, e, n), jc(s, e), s.sharedClientState.updateMutationState(e, "rejected", n), 
            await Xc(s, t);
        } catch (n) {
            await _r(n);
        }
    }

    /**
     * Triggers the callbacks that are waiting for this batch id to get acknowledged by server,
     * if there are any.
     */ function jc(t, e) {
        (t.Fc.get(e) || []).forEach((t => {
            t.resolve();
        })), t.Fc.delete(e);
    }

    /** Reject all outstanding callbacks waiting for pending writes to complete. */ function Qc(t, e, n) {
        const s = K(t);
        let i = s.$c[s.currentUser.toKey()];
        // NOTE: Mutations restored from persistence won't have callbacks, so it's
        // okay for there to be no callback for this ID.
            if (i) {
            const t = i.get(e);
            t && (n ? t.reject(n) : t.resolve(), i = i.remove(e)), s.$c[s.currentUser.toKey()] = i;
        }
    }

    function Wc(t, e, n = null) {
        t.sharedClientState.removeLocalQueryTarget(e);
        for (const s of t.Nc.get(e)) t.Cc.delete(s), n && t.Dc.qc(s, n);
        if (t.Nc.delete(e), t.isPrimaryClient) {
            t.Mc.si(e).forEach((e => {
                t.Mc.containsKey(e) || 
                // We removed the last reference for this key
                zc(t, e);
            }));
        }
    }

    function zc(t, e) {
        t.xc.delete(e.path.canonicalString());
        // It's possible that the target already got removed because the query failed. In that case,
        // the key won't exist in `limboTargetsByKey`. Only do the cleanup if we still have the target.
        const n = t.kc.get(e);
        null !== n && (Uo(t.remoteStore, n), t.kc = t.kc.remove(e), t.Oc.delete(n), Yc(t));
    }

    function Hc(t, e, n) {
        for (const s of n) if (s instanceof Sc) t.Mc.addReference(s.key, e), Jc(t, s); else if (s instanceof Dc) {
            M("SyncEngine", "Document no longer in limbo: " + s.key), t.Mc.removeReference(s.key, e);
            t.Mc.containsKey(s.key) || 
            // We removed the last reference for this key
            zc(t, s.key);
        } else L();
    }

    function Jc(t, e) {
        const n = e.key, s = n.path.canonicalString();
        t.kc.get(n) || t.xc.has(s) || (M("SyncEngine", "New document in limbo: " + n), t.xc.add(s), 
        Yc(t));
    }

    /**
     * Starts listens for documents in limbo that are enqueued for resolution,
     * subject to a maximum number of concurrent resolutions.
     *
     * Without bounding the number of concurrent resolutions, the server can fail
     * with "resource exhausted" errors which can lead to pathological client
     * behavior as seen in https://github.com/firebase/firebase-js-sdk/issues/2683.
     */ function Yc(t) {
        for (;t.xc.size > 0 && t.kc.size < t.maxConcurrentLimboResolutions; ) {
            const e = t.xc.values().next().value;
            t.xc.delete(e);
            const n = new Nt(_t.fromString(e)), s = t.Bc.next();
            t.Oc.set(s, new xc(n)), t.kc = t.kc.insert(n, s), Lo(t.remoteStore, new yi(De(Ae(n.path)), s, 2 /* LimboResolution */ , nt.A));
        }
    }

    async function Xc(t, e, n) {
        const s = K(t), i = [], r = [], o = [];
        s.Cc.isEmpty() || (s.Cc.forEach(((t, c) => {
            o.push(s.Uc(c, e, n).then((t => {
                if (t) {
                    s.isPrimaryClient && s.sharedClientState.updateQueryState(c.targetId, t.fromCache ? "not-current" : "current"), 
                    i.push(t);
                    const e = $r.Ss(c.targetId, t);
                    r.push(e);
                }
            })));
        })), await Promise.all(o), s.Dc.To(i), await async function(t, e) {
            const n = K(t);
            try {
                await n.persistence.runTransaction("notifyLocalViewChanges", "readwrite", (t => si.forEach(e, (e => si.forEach(e.vs, (s => n.persistence.referenceDelegate.addReference(t, e.targetId, s))).next((() => si.forEach(e.Vs, (s => n.persistence.referenceDelegate.removeReference(t, e.targetId, s)))))))));
            } catch (t) {
                if (!ui(t)) throw t;
                // If `notifyLocalViewChanges` fails, we did not advance the sequence
                // number for the documents that were included in this transaction.
                // This might trigger them to be deleted earlier than they otherwise
                // would have, but it should not invalidate the integrity of the data.
                M("LocalStore", "Failed to update sequence numbers: " + t);
            }
            for (const t of e) {
                const e = t.targetId;
                if (!t.fromCache) {
                    const t = n.Ms.get(e), s = t.snapshotVersion, i = t.withLastLimboFreeSnapshotVersion(s);
                    // Advance the last limbo free snapshot version
                                    n.Ms = n.Ms.insert(e, i);
                }
            }
        }(s.localStore, r));
    }

    async function Zc(t, e) {
        const n = K(t);
        if (!n.currentUser.isEqual(e)) {
            M("SyncEngine", "User change. New user:", e.toKey());
            const t = await Ur(n.localStore, e);
            n.currentUser = e, 
            // Fails tasks waiting for pending writes requested by previous user.
            function(t, e) {
                t.Fc.forEach((t => {
                    t.forEach((t => {
                        t.reject(new j(G.CANCELLED, e));
                    }));
                })), t.Fc.clear();
            }(n, "'waitForPendingWrites' promise is rejected due to a user change."), 
            // TODO(b/114226417): Consider calling this only in the primary tab.
            n.sharedClientState.handleUserChange(e, t.removedBatchIds, t.addedBatchIds), await Xc(n, t.qs);
        }
    }

    function tu(t, e) {
        const n = K(t), s = n.Oc.get(e);
        if (s && s.Sc) return On().add(s.key);
        {
            let t = On();
            const s = n.Nc.get(e);
            if (!s) return t;
            for (const e of s) {
                const s = n.Cc.get(e);
                t = t.unionWith(s.view.yc);
            }
            return t;
        }
    }

    function hu(t) {
        const e = K(t);
        return e.remoteStore.remoteSyncer.applyRemoteEvent = Bc.bind(null, e), e.remoteStore.remoteSyncer.getRemoteKeysForTarget = tu.bind(null, e), 
        e.remoteStore.remoteSyncer.rejectListen = Uc.bind(null, e), e.Dc.To = Ec.bind(null, e.eventManager), 
        e.Dc.qc = Tc.bind(null, e.eventManager), e;
    }

    function lu(t) {
        const e = K(t);
        return e.remoteStore.remoteSyncer.applySuccessfulWrite = qc.bind(null, e), e.remoteStore.remoteSyncer.rejectFailedWrite = Kc.bind(null, e), 
        e;
    }

    class du {
        constructor() {
            this.synchronizeTabs = !1;
        }
        async initialize(t) {
            this.O = Do(t.databaseInfo.databaseId), this.sharedClientState = this.Gc(t), this.persistence = this.jc(t), 
            await this.persistence.start(), this.gcScheduler = this.Qc(t), this.localStore = this.Wc(t);
        }
        Qc(t) {
            return null;
        }
        Wc(t) {
            return Lr(this.persistence, new Fr, t.initialUser, this.O);
        }
        jc(t) {
            return new ao(lo.bi, this.O);
        }
        Gc(t) {
            return new To;
        }
        async terminate() {
            this.gcScheduler && this.gcScheduler.stop(), await this.sharedClientState.shutdown(), 
            await this.persistence.shutdown();
        }
    }

    /**
     * Initializes and wires the components that are needed to interface with the
     * network.
     */ class mu {
        async initialize(t, e) {
            this.localStore || (this.localStore = t.localStore, this.sharedClientState = t.sharedClientState, 
            this.datastore = this.createDatastore(e), this.remoteStore = this.createRemoteStore(e), 
            this.eventManager = this.createEventManager(e), this.syncEngine = this.createSyncEngine(e, 
            /* startAsPrimary=*/ !t.synchronizeTabs), this.sharedClientState.onlineStateHandler = t => Lc(this.syncEngine, t, 1 /* SharedClientState */), 
            this.remoteStore.remoteSyncer.handleCredentialChange = Zc.bind(null, this.syncEngine), 
            await ac(this.remoteStore, this.syncEngine.isPrimaryClient));
        }
        createEventManager(t) {
            return new yc;
        }
        createDatastore(t) {
            const e = Do(t.databaseInfo.databaseId), n = (s = t.databaseInfo, new vo(s));
            var s;
            /** Return the Platform-specific connectivity monitor. */        return function(t, e, n, s) {
                return new Oo(t, e, n, s);
            }(t.authCredentials, t.appCheckCredentials, n, e);
        }
        createRemoteStore(t) {
            return e = this.localStore, n = this.datastore, s = t.asyncQueue, i = t => Lc(this.syncEngine, t, 0 /* RemoteStore */), 
            r = Ro.Vt() ? new Ro : new Ao, new $o(e, n, s, i, r);
            var e, n, s, i, r;
            /** Re-enables the network. Idempotent. */    }
        createSyncEngine(t, e) {
            return function(t, e, n, 
            // PORTING NOTE: Manages state synchronization in multi-tab environments.
            s, i, r, o) {
                const c = new kc(t, e, n, s, i, r);
                return o && (c.Lc = !0), c;
            }(this.localStore, this.remoteStore, this.eventManager, this.sharedClientState, t.initialUser, t.maxConcurrentLimboResolutions, e);
        }
        terminate() {
            return async function(t) {
                const e = K(t);
                M("RemoteStore", "RemoteStore shutting down."), e.Ko.add(5 /* Shutdown */), await Bo(e), 
                e.jo.shutdown(), 
                // Set the OnlineState to Unknown (rather than Offline) to avoid potentially
                // triggering spurious listener events with cached data, etc.
                e.Qo.set("Unknown" /* Unknown */);
            }(this.remoteStore);
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * On web, a `ReadableStream` is wrapped around by a `ByteStreamReader`.
     */
    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /*
     * A wrapper implementation of Observer<T> that will dispatch events
     * asynchronously. To allow immediate silencing, a mute call is added which
     * causes events scheduled to no longer be raised.
     */
    class yu {
        constructor(t) {
            this.observer = t, 
            /**
             * When set to true, will not raise future events. Necessary to deal with
             * async detachment of listener.
             */
            this.muted = !1;
        }
        next(t) {
            this.observer.next && this.Hc(this.observer.next, t);
        }
        error(t) {
            this.observer.error ? this.Hc(this.observer.error, t) : console.error("Uncaught Error in snapshot listener:", t);
        }
        Jc() {
            this.muted = !0;
        }
        Hc(t, e) {
            this.muted || setTimeout((() => {
                this.muted || t(e);
            }), 0);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * FirestoreClient is a top-level class that constructs and owns all of the
     * pieces of the client SDK architecture. It is responsible for creating the
     * async queue that is shared by all of the other components in the system.
     */
    class Tu {
        constructor(t, e, 
        /**
         * Asynchronous queue responsible for all of our internal processing. When
         * we get incoming work from the user (via public API) or the network
         * (incoming GRPC messages), we should always schedule onto this queue.
         * This ensures all of our work is properly serialized (e.g. we don't
         * start processing a new operation while the previous one is waiting for
         * an async I/O to complete).
         */
        n, s) {
            this.authCredentials = t, this.appCheckCredentials = e, this.asyncQueue = n, this.databaseInfo = s, 
            this.user = C.UNAUTHENTICATED, this.clientId = it.R(), this.authCredentialListener = () => Promise.resolve(), 
            this.appCheckCredentialListener = () => Promise.resolve(), this.authCredentials.start(n, (async t => {
                M("FirestoreClient", "Received user=", t.uid), await this.authCredentialListener(t), 
                this.user = t;
            })), this.appCheckCredentials.start(n, (t => (M("FirestoreClient", "Received new app check token=", t), 
            this.appCheckCredentialListener(t, this.user))));
        }
        async getConfiguration() {
            return {
                asyncQueue: this.asyncQueue,
                databaseInfo: this.databaseInfo,
                clientId: this.clientId,
                authCredentials: this.authCredentials,
                appCheckCredentials: this.appCheckCredentials,
                initialUser: this.user,
                maxConcurrentLimboResolutions: 100
            };
        }
        setCredentialChangeListener(t) {
            this.authCredentialListener = t;
        }
        setAppCheckTokenChangeListener(t) {
            this.appCheckCredentialListener = t;
        }
        /**
         * Checks that the client has not been terminated. Ensures that other methods on
         * this class cannot be called after the client is terminated.
         */    verifyNotTerminated() {
            if (this.asyncQueue.isShuttingDown) throw new j(G.FAILED_PRECONDITION, "The client has already been terminated.");
        }
        terminate() {
            this.asyncQueue.enterRestrictedMode();
            const t = new Q;
            return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((async () => {
                try {
                    this.onlineComponents && await this.onlineComponents.terminate(), this.offlineComponents && await this.offlineComponents.terminate(), 
                    // The credentials provider must be terminated after shutting down the
                    // RemoteStore as it will prevent the RemoteStore from retrieving auth
                    // tokens.
                    this.authCredentials.shutdown(), this.appCheckCredentials.shutdown(), t.resolve();
                } catch (e) {
                    const n = dc(e, "Failed to shutdown persistence");
                    t.reject(n);
                }
            })), t.promise;
        }
    }

    async function Au(t, e) {
        t.asyncQueue.verifyOperationInProgress(), M("FirestoreClient", "Initializing OfflineComponentProvider");
        const n = await t.getConfiguration();
        await e.initialize(n);
        let s = n.initialUser;
        t.setCredentialChangeListener((async t => {
            s.isEqual(t) || (await Ur(e.localStore, t), s = t);
        })), 
        // When a user calls clearPersistence() in one client, all other clients
        // need to be terminated to allow the delete to succeed.
        e.persistence.setDatabaseDeletedListener((() => t.terminate())), t.offlineComponents = e;
    }

    async function Ru(t, e) {
        t.asyncQueue.verifyOperationInProgress();
        const n = await Pu(t);
        M("FirestoreClient", "Initializing OnlineComponentProvider");
        const s = await t.getConfiguration();
        await e.initialize(n, s), 
        // The CredentialChangeListener of the online component provider takes
        // precedence over the offline component provider.
        t.setCredentialChangeListener((t => uc(e.remoteStore, t))), t.setAppCheckTokenChangeListener(((t, n) => uc(e.remoteStore, n))), 
        t.onlineComponents = e;
    }

    async function Pu(t) {
        return t.offlineComponents || (M("FirestoreClient", "Using default OfflineComponentProvider"), 
        await Au(t, new du)), t.offlineComponents;
    }

    async function bu(t) {
        return t.onlineComponents || (M("FirestoreClient", "Using default OnlineComponentProvider"), 
        await Ru(t, new mu)), t.onlineComponents;
    }

    function Du(t) {
        return bu(t).then((t => t.syncEngine));
    }

    async function Cu(t) {
        const e = await bu(t), n = e.eventManager;
        return n.onListen = Oc.bind(null, e.syncEngine), n.onUnlisten = $c.bind(null, e.syncEngine), 
        n;
    }

    function $u(t, e, n = {}) {
        const s = new Q;
        return t.asyncQueue.enqueueAndForget((async () => function(t, e, n, s, i) {
            const r = new yu({
                next: n => {
                    // Remove query first before passing event to user to avoid
                    // user actions affecting the now stale query.
                    e.enqueueAndForget((() => Ic(t, o))), n.fromCache && "server" === s.source ? i.reject(new j(G.UNAVAILABLE, 'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')) : i.resolve(n);
                },
                error: t => i.reject(t)
            }), o = new Rc(n, r, {
                includeMetadataChanges: !0,
                uc: !0
            });
            return pc(t, o);
        }(await Cu(t), t.asyncQueue, e, n, s))), s.promise;
    }

    const qu = new Map;

    /**
     * An instance map that ensures only one Datastore exists per Firestore
     * instance.
     */
    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    function Ku(t, e, n) {
        if (!n) throw new j(G.INVALID_ARGUMENT, `Function ${t}() cannot be called with an empty ${e}.`);
    }

    /**
     * Validates that two boolean options are not set at the same time.
     * @internal
     */ function Gu(t, e, n, s) {
        if (!0 === e && !0 === s) throw new j(G.INVALID_ARGUMENT, `${t} and ${n} cannot be used together.`);
    }

    /**
     * Validates that `path` refers to a document (indicated by the fact it contains
     * an even numbers of segments).
     */ function ju(t) {
        if (!Nt.isDocumentKey(t)) throw new j(G.INVALID_ARGUMENT, `Invalid document reference. Document references must have an even number of segments, but ${t} has ${t.length}.`);
    }

    /**
     * Validates that `path` refers to a collection (indicated by the fact it
     * contains an odd numbers of segments).
     */ function Qu(t) {
        if (Nt.isDocumentKey(t)) throw new j(G.INVALID_ARGUMENT, `Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`);
    }

    /**
     * Returns true if it's a non-null object without a custom prototype
     * (i.e. excludes Array, Date, etc.).
     */
    /** Returns a string describing the type / value of the provided input. */
    function Wu(t) {
        if (void 0 === t) return "undefined";
        if (null === t) return "null";
        if ("string" == typeof t) return t.length > 20 && (t = `${t.substring(0, 20)}...`), 
        JSON.stringify(t);
        if ("number" == typeof t || "boolean" == typeof t) return "" + t;
        if ("object" == typeof t) {
            if (t instanceof Array) return "an array";
            {
                const e = 
                /** try to get the constructor name for an object. */
                function(t) {
                    if (t.constructor) return t.constructor.name;
                    return null;
                }
                /**
     * Casts `obj` to `T`, optionally unwrapping Compat types to expose the
     * underlying instance. Throws if  `obj` is not an instance of `T`.
     *
     * This cast is used in the Lite and Full SDK to verify instance types for
     * arguments passed to the public API.
     * @internal
     */ (t);
                return e ? `a custom ${e} object` : "an object";
            }
        }
        return "function" == typeof t ? "a function" : L();
    }

    function zu(t, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    e) {
        if ("_delegate" in t && (
        // Unwrap Compat types
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        t = t._delegate), !(t instanceof e)) {
            if (e.name === t.constructor.name) throw new j(G.INVALID_ARGUMENT, "Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");
            {
                const n = Wu(t);
                throw new j(G.INVALID_ARGUMENT, `Expected type '${e.name}', but it was: ${n}`);
            }
        }
        return t;
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // settings() defaults:
    /**
     * A concrete type describing all the values that can be applied via a
     * user-supplied `FirestoreSettings` object. This is a separate type so that
     * defaults can be supplied and the value can be checked for equality.
     */
    class Ju {
        constructor(t) {
            var e;
            if (void 0 === t.host) {
                if (void 0 !== t.ssl) throw new j(G.INVALID_ARGUMENT, "Can't provide ssl option if host option is not set");
                this.host = "firestore.googleapis.com", this.ssl = true;
            } else this.host = t.host, this.ssl = null === (e = t.ssl) || void 0 === e || e;
            if (this.credentials = t.credentials, this.ignoreUndefinedProperties = !!t.ignoreUndefinedProperties, 
            void 0 === t.cacheSizeBytes) this.cacheSizeBytes = 41943040; else {
                if (-1 !== t.cacheSizeBytes && t.cacheSizeBytes < 1048576) throw new j(G.INVALID_ARGUMENT, "cacheSizeBytes must be at least 1048576");
                this.cacheSizeBytes = t.cacheSizeBytes;
            }
            this.experimentalForceLongPolling = !!t.experimentalForceLongPolling, this.experimentalAutoDetectLongPolling = !!t.experimentalAutoDetectLongPolling, 
            this.useFetchStreams = !!t.useFetchStreams, Gu("experimentalForceLongPolling", t.experimentalForceLongPolling, "experimentalAutoDetectLongPolling", t.experimentalAutoDetectLongPolling);
        }
        isEqual(t) {
            return this.host === t.host && this.ssl === t.ssl && this.credentials === t.credentials && this.cacheSizeBytes === t.cacheSizeBytes && this.experimentalForceLongPolling === t.experimentalForceLongPolling && this.experimentalAutoDetectLongPolling === t.experimentalAutoDetectLongPolling && this.ignoreUndefinedProperties === t.ignoreUndefinedProperties && this.useFetchStreams === t.useFetchStreams;
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * The Cloud Firestore service interface.
     *
     * Do not call this constructor directly. Instead, use {@link getFirestore}.
     */ class Yu {
        /** @hideconstructor */
        constructor(t, e, n) {
            this._authCredentials = e, this._appCheckCredentials = n, 
            /**
             * Whether it's a Firestore or Firestore Lite instance.
             */
            this.type = "firestore-lite", this._persistenceKey = "(lite)", this._settings = new Ju({}), 
            this._settingsFrozen = !1, t instanceof Vt ? this._databaseId = t : (this._app = t, 
            this._databaseId = function(t) {
                if (!Object.prototype.hasOwnProperty.apply(t.options, [ "projectId" ])) throw new j(G.INVALID_ARGUMENT, '"projectId" not provided in firebase.initializeApp.');
                return new Vt(t.options.projectId);
            }
            /**
     * Modify this instance to communicate with the Cloud Firestore emulator.
     *
     * Note: This must be called before this instance has been used to do any
     * operations.
     *
     * @param firestore - The `Firestore` instance to configure to connect to the
     * emulator.
     * @param host - the emulator host (ex: localhost).
     * @param port - the emulator port (ex: 9000).
     * @param options.mockUserToken - the mock auth token to use for unit testing
     * Security Rules.
     */ (t));
        }
        /**
         * The {@link @firebase/app#FirebaseApp} associated with this `Firestore` service
         * instance.
         */    get app() {
            if (!this._app) throw new j(G.FAILED_PRECONDITION, "Firestore was not initialized using the Firebase SDK. 'app' is not available");
            return this._app;
        }
        get _initialized() {
            return this._settingsFrozen;
        }
        get _terminated() {
            return void 0 !== this._terminateTask;
        }
        _setSettings(t) {
            if (this._settingsFrozen) throw new j(G.FAILED_PRECONDITION, "Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");
            this._settings = new Ju(t), void 0 !== t.credentials && (this._authCredentials = function(t) {
                if (!t) return new z;
                switch (t.type) {
                  case "gapi":
                    const e = t.client;
                    // Make sure this really is a Gapi client.
                                    return U(!("object" != typeof e || null === e || !e.auth || !e.auth.getAuthHeaderValueForFirstParty)), 
                    new X(e, t.sessionIndex || "0", t.iamToken || null);

                  case "provider":
                    return t.client;

                  default:
                    throw new j(G.INVALID_ARGUMENT, "makeAuthCredentialsProvider failed due to invalid credential type");
                }
            }(t.credentials));
        }
        _getSettings() {
            return this._settings;
        }
        _freezeSettings() {
            return this._settingsFrozen = !0, this._settings;
        }
        _delete() {
            return this._terminateTask || (this._terminateTask = this._terminate()), this._terminateTask;
        }
        /** Returns a JSON-serializable representation of this `Firestore` instance. */    toJSON() {
            return {
                app: this._app,
                databaseId: this._databaseId,
                settings: this._settings
            };
        }
        /**
         * Terminates all components used by this client. Subclasses can override
         * this method to clean up their own dependencies, but must also call this
         * method.
         *
         * Only ever called once.
         */    _terminate() {
            /**
     * Removes all components associated with the provided instance. Must be called
     * when the `Firestore` instance is terminated.
     */
            return function(t) {
                const e = qu.get(t);
                e && (M("ComponentProvider", "Removing Datastore"), qu.delete(t), e.terminate());
            }(this), Promise.resolve();
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A `DocumentReference` refers to a document location in a Firestore database
     * and can be used to write, read, or listen to the location. The document at
     * the referenced location may or may not exist.
     */ class Zu {
        /** @hideconstructor */
        constructor(t, 
        /**
         * If provided, the `FirestoreDataConverter` associated with this instance.
         */
        e, n) {
            this.converter = e, this._key = n, 
            /** The type of this Firestore reference. */
            this.type = "document", this.firestore = t;
        }
        get _path() {
            return this._key.path;
        }
        /**
         * The document's identifier within its collection.
         */    get id() {
            return this._key.path.lastSegment();
        }
        /**
         * A string representing the path of the referenced document (relative
         * to the root of the database).
         */    get path() {
            return this._key.path.canonicalString();
        }
        /**
         * The collection this `DocumentReference` belongs to.
         */    get parent() {
            return new ea(this.firestore, this.converter, this._key.path.popLast());
        }
        withConverter(t) {
            return new Zu(this.firestore, t, this._key);
        }
    }

    /**
     * A `Query` refers to a query which you can read or listen to. You can also
     * construct refined `Query` objects by adding filters and ordering.
     */ class ta {
        // This is the lite version of the Query class in the main SDK.
        /** @hideconstructor protected */
        constructor(t, 
        /**
         * If provided, the `FirestoreDataConverter` associated with this instance.
         */
        e, n) {
            this.converter = e, this._query = n, 
            /** The type of this Firestore reference. */
            this.type = "query", this.firestore = t;
        }
        withConverter(t) {
            return new ta(this.firestore, t, this._query);
        }
    }

    /**
     * A `CollectionReference` object can be used for adding documents, getting
     * document references, and querying for documents (using {@link query}).
     */ class ea extends ta {
        /** @hideconstructor */
        constructor(t, e, n) {
            super(t, e, Ae(n)), this._path = n, 
            /** The type of this Firestore reference. */
            this.type = "collection";
        }
        /** The collection's identifier. */    get id() {
            return this._query.path.lastSegment();
        }
        /**
         * A string representing the path of the referenced collection (relative
         * to the root of the database).
         */    get path() {
            return this._query.path.canonicalString();
        }
        /**
         * A reference to the containing `DocumentReference` if this is a
         * subcollection. If this isn't a subcollection, the reference is null.
         */    get parent() {
            const t = this._path.popLast();
            return t.isEmpty() ? null : new Zu(this.firestore, 
            /* converter= */ null, new Nt(t));
        }
        withConverter(t) {
            return new ea(this.firestore, t, this._path);
        }
    }

    function na(t, e, ...n) {
        if (t = getModularInstance(t), Ku("collection", "path", e), t instanceof Yu) {
            const s = _t.fromString(e, ...n);
            return Qu(s), new ea(t, /* converter= */ null, s);
        }
        {
            if (!(t instanceof Zu || t instanceof ea)) throw new j(G.INVALID_ARGUMENT, "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
            const s = t._path.child(_t.fromString(e, ...n));
            return Qu(s), new ea(t.firestore, 
            /* converter= */ null, s);
        }
    }

    function ia(t, e, ...n) {
        if (t = getModularInstance(t), 
        // We allow omission of 'pathString' but explicitly prohibit passing in both
        // 'undefined' and 'null'.
        1 === arguments.length && (e = it.R()), Ku("doc", "path", e), t instanceof Yu) {
            const s = _t.fromString(e, ...n);
            return ju(s), new Zu(t, 
            /* converter= */ null, new Nt(s));
        }
        {
            if (!(t instanceof Zu || t instanceof ea)) throw new j(G.INVALID_ARGUMENT, "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
            const s = t._path.child(_t.fromString(e, ...n));
            return ju(s), new Zu(t.firestore, t instanceof ea ? t.converter : null, new Nt(s));
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class ca {
        constructor() {
            // The last promise in the queue.
            this.hu = Promise.resolve(), 
            // A list of retryable operations. Retryable operations are run in order and
            // retried with backoff.
            this.lu = [], 
            // Is this AsyncQueue being shut down? Once it is set to true, it will not
            // be changed again.
            this.fu = !1, 
            // Operations scheduled to be queued in the future. Operations are
            // automatically removed after they are run or canceled.
            this.du = [], 
            // visible for testing
            this._u = null, 
            // Flag set while there's an outstanding AsyncQueue operation, used for
            // assertion sanity-checks.
            this.wu = !1, 
            // Enabled during shutdown on Safari to prevent future access to IndexedDB.
            this.mu = !1, 
            // List of TimerIds to fast-forward delays for.
            this.gu = [], 
            // Backoff timer used to schedule retries for retryable operations
            this.ro = new Co(this, "async_queue_retry" /* AsyncQueueRetry */), 
            // Visibility handler that triggers an immediate retry of all retryable
            // operations. Meant to speed up recovery when we regain file system access
            // after page comes into foreground.
            this.yu = () => {
                const t = So();
                t && M("AsyncQueue", "Visibility state changed to " + t.visibilityState), this.ro.Yr();
            };
            const t = So();
            t && "function" == typeof t.addEventListener && t.addEventListener("visibilitychange", this.yu);
        }
        get isShuttingDown() {
            return this.fu;
        }
        /**
         * Adds a new operation to the queue without waiting for it to complete (i.e.
         * we ignore the Promise result).
         */    enqueueAndForget(t) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.enqueue(t);
        }
        enqueueAndForgetEvenWhileRestricted(t) {
            this.pu(), 
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.Iu(t);
        }
        enterRestrictedMode(t) {
            if (!this.fu) {
                this.fu = !0, this.mu = t || !1;
                const e = So();
                e && "function" == typeof e.removeEventListener && e.removeEventListener("visibilitychange", this.yu);
            }
        }
        enqueue(t) {
            if (this.pu(), this.fu) 
            // Return a Promise which never resolves.
            return new Promise((() => {}));
            // Create a deferred Promise that we can return to the callee. This
            // allows us to return a "hanging Promise" only to the callee and still
            // advance the queue even when the operation is not run.
                    const e = new Q;
            return this.Iu((() => this.fu && this.mu ? Promise.resolve() : (t().then(e.resolve, e.reject), 
            e.promise))).then((() => e.promise));
        }
        enqueueRetryable(t) {
            this.enqueueAndForget((() => (this.lu.push(t), this.Eu())));
        }
        /**
         * Runs the next operation from the retryable queue. If the operation fails,
         * reschedules with backoff.
         */    async Eu() {
            if (0 !== this.lu.length) {
                try {
                    await this.lu[0](), this.lu.shift(), this.ro.reset();
                } catch (t) {
                    if (!ui(t)) throw t;
     // Failure will be handled by AsyncQueue
                                    M("AsyncQueue", "Operation failed with retryable error: " + t);
                }
                this.lu.length > 0 && 
                // If there are additional operations, we re-schedule `retryNextOp()`.
                // This is necessary to run retryable operations that failed during
                // their initial attempt since we don't know whether they are already
                // enqueued. If, for example, `op1`, `op2`, `op3` are enqueued and `op1`
                // needs to  be re-run, we will run `op1`, `op1`, `op2` using the
                // already enqueued calls to `retryNextOp()`. `op3()` will then run in the
                // call scheduled here.
                // Since `backoffAndRun()` cancels an existing backoff and schedules a
                // new backoff on every call, there is only ever a single additional
                // operation in the queue.
                this.ro.Hr((() => this.Eu()));
            }
        }
        Iu(t) {
            const e = this.hu.then((() => (this.wu = !0, t().catch((t => {
                this._u = t, this.wu = !1;
                const e = 
                /**
     * Chrome includes Error.message in Error.stack. Other browsers do not.
     * This returns expected output of message + stack when available.
     * @param error - Error or FirestoreError
     */
                function(t) {
                    let e = t.message || "";
                    t.stack && (e = t.stack.includes(t.message) ? t.stack : t.message + "\n" + t.stack);
                    return e;
                }
                /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ (t);
                // Re-throw the error so that this.tail becomes a rejected Promise and
                // all further attempts to chain (via .then) will just short-circuit
                // and return the rejected Promise.
                throw $("INTERNAL UNHANDLED ERROR: ", e), t;
            })).then((t => (this.wu = !1, t))))));
            return this.hu = e, e;
        }
        enqueueAfterDelay(t, e, n) {
            this.pu(), 
            // Fast-forward delays for timerIds that have been overriden.
            this.gu.indexOf(t) > -1 && (e = 0);
            const s = fc.createAndSchedule(this, t, e, n, (t => this.Tu(t)));
            return this.du.push(s), s;
        }
        pu() {
            this._u && L();
        }
        verifyOperationInProgress() {}
        /**
         * Waits until all currently queued tasks are finished executing. Delayed
         * operations are not run.
         */    async Au() {
            // Operations in the queue prior to draining may have enqueued additional
            // operations. Keep draining the queue until the tail is no longer advanced,
            // which indicates that no more new operations were enqueued and that all
            // operations were executed.
            let t;
            do {
                t = this.hu, await t;
            } while (t !== this.hu);
        }
        /**
         * For Tests: Determine if a delayed operation with a particular TimerId
         * exists.
         */    Ru(t) {
            for (const e of this.du) if (e.timerId === t) return !0;
            return !1;
        }
        /**
         * For Tests: Runs some or all delayed operations early.
         *
         * @param lastTimerId - Delayed operations up to and including this TimerId
         * will be drained. Pass TimerId.All to run all delayed operations.
         * @returns a Promise that resolves once all operations have been run.
         */    Pu(t) {
            // Note that draining may generate more delayed ops, so we do that first.
            return this.Au().then((() => {
                // Run ops in the same order they'd run if they ran naturally.
                this.du.sort(((t, e) => t.targetTimeMs - e.targetTimeMs));
                for (const e of this.du) if (e.skipDelay(), "all" /* All */ !== t && e.timerId === t) break;
                return this.Au();
            }));
        }
        /**
         * For Tests: Skip all subsequent delays for a timer id.
         */    bu(t) {
            this.gu.push(t);
        }
        /** Called once a DelayedOperation is run or canceled. */    Tu(t) {
            // NOTE: indexOf / slice are O(n), but delayedOperations is expected to be small.
            const e = this.du.indexOf(t);
            this.du.splice(e, 1);
        }
    }

    /**
     * The Cloud Firestore service interface.
     *
     * Do not call this constructor directly. Instead, use {@link getFirestore}.
     */
    class la extends Yu {
        /** @hideconstructor */
        constructor(t, e, n) {
            super(t, e, n), 
            /**
             * Whether it's a {@link Firestore} or Firestore Lite instance.
             */
            this.type = "firestore", this._queue = new ca, this._persistenceKey = "name" in t ? t.name : "[DEFAULT]";
        }
        _terminate() {
            return this._firestoreClient || 
            // The client must be initialized to ensure that all subsequent API
            // usage throws an exception.
            wa(this), this._firestoreClient.terminate();
        }
    }

    /**
     * Returns the existing {@link Firestore} instance that is associated with the
     * provided {@link @firebase/app#FirebaseApp}. If no instance exists, initializes a new
     * instance with default settings.
     *
     * @param app - The {@link @firebase/app#FirebaseApp} instance that the returned {@link Firestore}
     * instance is associated with.
     * @returns The {@link Firestore} instance of the provided app.
     */ function da(e = getApp()) {
        return _getProvider(e, "firestore").getImmediate();
    }

    /**
     * @internal
     */ function _a(t) {
        return t._firestoreClient || wa(t), t._firestoreClient.verifyNotTerminated(), t._firestoreClient;
    }

    function wa(t) {
        var e;
        const n = t._freezeSettings(), s = function(t, e, n, s) {
            return new vt(t, e, n, s.host, s.ssl, s.experimentalForceLongPolling, s.experimentalAutoDetectLongPolling, s.useFetchStreams);
        }(t._databaseId, (null === (e = t._app) || void 0 === e ? void 0 : e.options.appId) || "", t._persistenceKey, n);
        t._firestoreClient = new Tu(t._authCredentials, t._appCheckCredentials, t._queue, s);
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A `FieldPath` refers to a field in a document. The path may consist of a
     * single field name (referring to a top-level field in the document), or a
     * list of field names (referring to a nested field in the document).
     *
     * Create a `FieldPath` by providing field names. If more than one field
     * name is provided, the path will point to a nested field in a document.
     */
    class va {
        /**
         * Creates a `FieldPath` from the provided field names. If more than one field
         * name is provided, the path will point to a nested field in a document.
         *
         * @param fieldNames - A list of field names.
         */
        constructor(...t) {
            for (let e = 0; e < t.length; ++e) if (0 === t[e].length) throw new j(G.INVALID_ARGUMENT, "Invalid field name at argument $(i + 1). Field names must not be empty.");
            this._internalPath = new mt(t);
        }
        /**
         * Returns true if this `FieldPath` is equal to the provided one.
         *
         * @param other - The `FieldPath` to compare against.
         * @returns true if this `FieldPath` is equal to the provided one.
         */    isEqual(t) {
            return this._internalPath.isEqual(t._internalPath);
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * An immutable object representing an array of bytes.
     */ class Sa {
        /** @hideconstructor */
        constructor(t) {
            this._byteString = t;
        }
        /**
         * Creates a new `Bytes` object from the given Base64 string, converting it to
         * bytes.
         *
         * @param base64 - The Base64 string used to create the `Bytes` object.
         */    static fromBase64String(t) {
            try {
                return new Sa(pt.fromBase64String(t));
            } catch (t) {
                throw new j(G.INVALID_ARGUMENT, "Failed to construct data from Base64 string: " + t);
            }
        }
        /**
         * Creates a new `Bytes` object from the given Uint8Array.
         *
         * @param array - The Uint8Array used to create the `Bytes` object.
         */    static fromUint8Array(t) {
            return new Sa(pt.fromUint8Array(t));
        }
        /**
         * Returns the underlying bytes as a Base64-encoded string.
         *
         * @returns The Base64-encoded string created from the `Bytes` object.
         */    toBase64() {
            return this._byteString.toBase64();
        }
        /**
         * Returns the underlying bytes in a new `Uint8Array`.
         *
         * @returns The Uint8Array created from the `Bytes` object.
         */    toUint8Array() {
            return this._byteString.toUint8Array();
        }
        /**
         * Returns a string representation of the `Bytes` object.
         *
         * @returns A string representation of the `Bytes` object.
         */    toString() {
            return "Bytes(base64: " + this.toBase64() + ")";
        }
        /**
         * Returns true if this `Bytes` object is equal to the provided one.
         *
         * @param other - The `Bytes` object to compare against.
         * @returns true if this `Bytes` object is equal to the provided one.
         */    isEqual(t) {
            return this._byteString.isEqual(t._byteString);
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Sentinel values that can be used when writing document fields with `set()`
     * or `update()`.
     */ class Da {
        /**
         * @param _methodName - The public API endpoint that returns this class.
         * @hideconstructor
         */
        constructor(t) {
            this._methodName = t;
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * An immutable object representing a geographic location in Firestore. The
     * location is represented as latitude/longitude pair.
     *
     * Latitude values are in the range of [-90, 90].
     * Longitude values are in the range of [-180, 180].
     */ class Ca {
        /**
         * Creates a new immutable `GeoPoint` object with the provided latitude and
         * longitude values.
         * @param latitude - The latitude as number between -90 and 90.
         * @param longitude - The longitude as number between -180 and 180.
         */
        constructor(t, e) {
            if (!isFinite(t) || t < -90 || t > 90) throw new j(G.INVALID_ARGUMENT, "Latitude must be a number between -90 and 90, but was: " + t);
            if (!isFinite(e) || e < -180 || e > 180) throw new j(G.INVALID_ARGUMENT, "Longitude must be a number between -180 and 180, but was: " + e);
            this._lat = t, this._long = e;
        }
        /**
         * The latitude of this `GeoPoint` instance.
         */    get latitude() {
            return this._lat;
        }
        /**
         * The longitude of this `GeoPoint` instance.
         */    get longitude() {
            return this._long;
        }
        /**
         * Returns true if this `GeoPoint` is equal to the provided one.
         *
         * @param other - The `GeoPoint` to compare against.
         * @returns true if this `GeoPoint` is equal to the provided one.
         */    isEqual(t) {
            return this._lat === t._lat && this._long === t._long;
        }
        /** Returns a JSON-serializable representation of this GeoPoint. */    toJSON() {
            return {
                latitude: this._lat,
                longitude: this._long
            };
        }
        /**
         * Actually private to JS consumers of our API, so this function is prefixed
         * with an underscore.
         */    _compareTo(t) {
            return rt(this._lat, t._lat) || rt(this._long, t._long);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ const Na = /^__.*__$/;

    /** The result of parsing document data (e.g. for a setData call). */ class xa {
        constructor(t, e, n) {
            this.data = t, this.fieldMask = e, this.fieldTransforms = n;
        }
        toMutation(t, e) {
            return null !== this.fieldMask ? new fn(t, this.data, this.fieldMask, e, this.fieldTransforms) : new ln(t, this.data, e, this.fieldTransforms);
        }
    }

    function Oa(t) {
        switch (t) {
          case 0 /* Set */ :
     // fall through
                  case 2 /* MergeSet */ :
     // fall through
                  case 1 /* Update */ :
            return !0;

          case 3 /* Argument */ :
          case 4 /* ArrayArgument */ :
            return !1;

          default:
            throw L();
        }
    }

    /** A "context" object passed around while parsing user data. */ class Ma {
        /**
         * Initializes a ParseContext with the given source and path.
         *
         * @param settings - The settings for the parser.
         * @param databaseId - The database ID of the Firestore instance.
         * @param serializer - The serializer to use to generate the Value proto.
         * @param ignoreUndefinedProperties - Whether to ignore undefined properties
         * rather than throw.
         * @param fieldTransforms - A mutable list of field transforms encountered
         * while parsing the data.
         * @param fieldMask - A mutable list of field paths encountered while parsing
         * the data.
         *
         * TODO(b/34871131): We don't support array paths right now, so path can be
         * null to indicate the context represents any location within an array (in
         * which case certain features will not work and errors will be somewhat
         * compromised).
         */
        constructor(t, e, n, s, i, r) {
            this.settings = t, this.databaseId = e, this.O = n, this.ignoreUndefinedProperties = s, 
            // Minor hack: If fieldTransforms is undefined, we assume this is an
            // external call and we need to validate the entire path.
            void 0 === i && this.vu(), this.fieldTransforms = i || [], this.fieldMask = r || [];
        }
        get path() {
            return this.settings.path;
        }
        get Vu() {
            return this.settings.Vu;
        }
        /** Returns a new context with the specified settings overwritten. */    Su(t) {
            return new Ma(Object.assign(Object.assign({}, this.settings), t), this.databaseId, this.O, this.ignoreUndefinedProperties, this.fieldTransforms, this.fieldMask);
        }
        Du(t) {
            var e;
            const n = null === (e = this.path) || void 0 === e ? void 0 : e.child(t), s = this.Su({
                path: n,
                Cu: !1
            });
            return s.Nu(t), s;
        }
        xu(t) {
            var e;
            const n = null === (e = this.path) || void 0 === e ? void 0 : e.child(t), s = this.Su({
                path: n,
                Cu: !1
            });
            return s.vu(), s;
        }
        ku(t) {
            // TODO(b/34871131): We don't support array paths right now; so make path
            // undefined.
            return this.Su({
                path: void 0,
                Cu: !0
            });
        }
        Ou(t) {
            return nh(t, this.settings.methodName, this.settings.Mu || !1, this.path, this.settings.$u);
        }
        /** Returns 'true' if 'fieldPath' was traversed when creating this context. */    contains(t) {
            return void 0 !== this.fieldMask.find((e => t.isPrefixOf(e))) || void 0 !== this.fieldTransforms.find((e => t.isPrefixOf(e.field)));
        }
        vu() {
            // TODO(b/34871131): Remove null check once we have proper paths for fields
            // within arrays.
            if (this.path) for (let t = 0; t < this.path.length; t++) this.Nu(this.path.get(t));
        }
        Nu(t) {
            if (0 === t.length) throw this.Ou("Document fields must not be empty");
            if (Oa(this.Vu) && Na.test(t)) throw this.Ou('Document fields cannot begin and end with "__"');
        }
    }

    /**
     * Helper for parsing raw user input (provided via the API) into internal model
     * classes.
     */ class $a {
        constructor(t, e, n) {
            this.databaseId = t, this.ignoreUndefinedProperties = e, this.O = n || Do(t);
        }
        /** Creates a new top-level parse context. */    Fu(t, e, n, s = !1) {
            return new Ma({
                Vu: t,
                methodName: e,
                $u: n,
                path: mt.emptyPath(),
                Cu: !1,
                Mu: s
            }, this.databaseId, this.O, this.ignoreUndefinedProperties);
        }
    }

    function Fa(t) {
        const e = t._freezeSettings(), n = Do(t._databaseId);
        return new $a(t._databaseId, !!e.ignoreUndefinedProperties, n);
    }

    /** Parse document data from a set() call. */ function Ba(t, e, n, s, i, r = {}) {
        const o = t.Fu(r.merge || r.mergeFields ? 2 /* MergeSet */ : 0 /* Set */ , e, n, i);
        Xa("Data must be an object, but it was:", o, s);
        const c = Ja(s, o);
        let u, a;
        if (r.merge) u = new gt(o.fieldMask), a = o.fieldTransforms; else if (r.mergeFields) {
            const t = [];
            for (const s of r.mergeFields) {
                const i = Za(e, s, n);
                if (!o.contains(i)) throw new j(G.INVALID_ARGUMENT, `Field '${i}' is specified in your field mask but missing from your input data.`);
                sh(t, i) || t.push(i);
            }
            u = new gt(t), a = o.fieldTransforms.filter((t => u.covers(t.field)));
        } else u = null, a = o.fieldTransforms;
        return new xa(new zt(c), u, a);
    }

    /**
     * Parse a "query value" (e.g. value in a where filter or a value in a cursor
     * bound).
     *
     * @param allowArrays - Whether the query value is an array that may directly
     * contain additional arrays (e.g. the operand of an `in` query).
     */ function za(t, e, n, s = !1) {
        return Ha(n, t.Fu(s ? 4 /* ArrayArgument */ : 3 /* Argument */ , e));
    }

    /**
     * Parses user data to Protobuf Values.
     *
     * @param input - Data to be parsed.
     * @param context - A context object representing the current path being parsed,
     * the source of the data being parsed, etc.
     * @returns The parsed value, or null if the value was a FieldValue sentinel
     * that should not be included in the resulting parsed data.
     */ function Ha(t, e) {
        if (Ya(
        // Unwrap the API type from the Compat SDK. This will return the API type
        // from firestore-exp.
        t = getModularInstance(t))) return Xa("Unsupported field value:", e, t), Ja(t, e);
        if (t instanceof Da) 
        // FieldValues usually parse into transforms (except deleteField())
        // in which case we do not want to include this field in our parsed data
        // (as doing so will overwrite the field directly prior to the transform
        // trying to transform it). So we don't add this location to
        // context.fieldMask and we return null as our parsing result.
        /**
     * "Parses" the provided FieldValueImpl, adding any necessary transforms to
     * context.fieldTransforms.
     */
        return function(t, e) {
            // Sentinels are only supported with writes, and not within arrays.
            if (!Oa(e.Vu)) throw e.Ou(`${t._methodName}() can only be used with update() and set()`);
            if (!e.path) throw e.Ou(`${t._methodName}() is not currently supported inside arrays`);
            const n = t._toFieldTransform(e);
            n && e.fieldTransforms.push(n);
        }
        /**
     * Helper to parse a scalar value (i.e. not an Object, Array, or FieldValue)
     *
     * @returns The parsed value
     */ (t, e), null;
        if (void 0 === t && e.ignoreUndefinedProperties) 
        // If the input is undefined it can never participate in the fieldMask, so
        // don't handle this below. If `ignoreUndefinedProperties` is false,
        // `parseScalarValue` will reject an undefined value.
        return null;
        if (
        // If context.path is null we are inside an array and we don't support
        // field mask paths more granular than the top-level array.
        e.path && e.fieldMask.push(e.path), t instanceof Array) {
            // TODO(b/34871131): Include the path containing the array in the error
            // message.
            // In the case of IN queries, the parsed data is an array (representing
            // the set of values to be included for the IN query) that may directly
            // contain additional arrays (each representing an individual field
            // value), so we disable this validation.
            if (e.settings.Cu && 4 /* ArrayArgument */ !== e.Vu) throw e.Ou("Nested arrays are not supported");
            return function(t, e) {
                const n = [];
                let s = 0;
                for (const i of t) {
                    let t = Ha(i, e.ku(s));
                    null == t && (
                    // Just include nulls in the array for fields being replaced with a
                    // sentinel.
                    t = {
                        nullValue: "NULL_VALUE"
                    }), n.push(t), s++;
                }
                return {
                    arrayValue: {
                        values: n
                    }
                };
            }(t, e);
        }
        return function(t, e) {
            if (null === (t = getModularInstance(t))) return {
                nullValue: "NULL_VALUE"
            };
            if ("number" == typeof t) return Le(e.O, t);
            if ("boolean" == typeof t) return {
                booleanValue: t
            };
            if ("string" == typeof t) return {
                stringValue: t
            };
            if (t instanceof Date) {
                const n = ut.fromDate(t);
                return {
                    timestampValue: Jn(e.O, n)
                };
            }
            if (t instanceof ut) {
                // Firestore backend truncates precision down to microseconds. To ensure
                // offline mode works the same with regards to truncation, perform the
                // truncation immediately without waiting for the backend to do that.
                const n = new ut(t.seconds, 1e3 * Math.floor(t.nanoseconds / 1e3));
                return {
                    timestampValue: Jn(e.O, n)
                };
            }
            if (t instanceof Ca) return {
                geoPointValue: {
                    latitude: t.latitude,
                    longitude: t.longitude
                }
            };
            if (t instanceof Sa) return {
                bytesValue: Yn(e.O, t._byteString)
            };
            if (t instanceof Zu) {
                const n = e.databaseId, s = t.firestore._databaseId;
                if (!s.isEqual(n)) throw e.Ou(`Document reference is for database ${s.projectId}/${s.database} but should be for database ${n.projectId}/${n.database}`);
                return {
                    referenceValue: ts(t.firestore._databaseId || e.databaseId, t._key.path)
                };
            }
            throw e.Ou(`Unsupported field value: ${Wu(t)}`);
        }
        /**
     * Checks whether an object looks like a JSON object that should be converted
     * into a struct. Normal class/prototype instances are considered to look like
     * JSON objects since they should be converted to a struct value. Arrays, Dates,
     * GeoPoints, etc. are not considered to look like JSON objects since they map
     * to specific FieldValue types other than ObjectValue.
     */ (t, e);
    }

    function Ja(t, e) {
        const n = {};
        return ft(t) ? 
        // If we encounter an empty object, we explicitly add it to the update
        // mask to ensure that the server creates a map entry.
        e.path && e.path.length > 0 && e.fieldMask.push(e.path) : lt(t, ((t, s) => {
            const i = Ha(s, e.Du(t));
            null != i && (n[t] = i);
        })), {
            mapValue: {
                fields: n
            }
        };
    }

    function Ya(t) {
        return !("object" != typeof t || null === t || t instanceof Array || t instanceof Date || t instanceof ut || t instanceof Ca || t instanceof Sa || t instanceof Zu || t instanceof Da);
    }

    function Xa(t, e, n) {
        if (!Ya(n) || !function(t) {
            return "object" == typeof t && null !== t && (Object.getPrototypeOf(t) === Object.prototype || null === Object.getPrototypeOf(t));
        }(n)) {
            const s = Wu(n);
            throw "an object" === s ? e.Ou(t + " a custom object") : e.Ou(t + " " + s);
        }
    }

    /**
     * Helper that calls fromDotSeparatedString() but wraps any error thrown.
     */ function Za(t, e, n) {
        if ((
        // If required, replace the FieldPath Compat class with with the firestore-exp
        // FieldPath.
        e = getModularInstance(e)) instanceof va) return e._internalPath;
        if ("string" == typeof e) return eh(t, e);
        throw nh("Field path arguments must be of type string or ", t, 
        /* hasConverter= */ !1, 
        /* path= */ void 0, n);
    }

    /**
     * Matches any characters in a field path string that are reserved.
     */ const th = new RegExp("[~\\*/\\[\\]]");

    /**
     * Wraps fromDotSeparatedString with an error message about the method that
     * was thrown.
     * @param methodName - The publicly visible method name
     * @param path - The dot-separated string form of a field path which will be
     * split on dots.
     * @param targetDoc - The document against which the field path will be
     * evaluated.
     */ function eh(t, e, n) {
        if (e.search(th) >= 0) throw nh(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`, t, 
        /* hasConverter= */ !1, 
        /* path= */ void 0, n);
        try {
            return new va(...e.split("."))._internalPath;
        } catch (s) {
            throw nh(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`, t, 
            /* hasConverter= */ !1, 
            /* path= */ void 0, n);
        }
    }

    function nh(t, e, n, s, i) {
        const r = s && !s.isEmpty(), o = void 0 !== i;
        let c = `Function ${e}() called with invalid data`;
        n && (c += " (via `toFirestore()`)"), c += ". ";
        let u = "";
        return (r || o) && (u += " (found", r && (u += ` in field ${s}`), o && (u += ` in document ${i}`), 
        u += ")"), new j(G.INVALID_ARGUMENT, c + t + u);
    }

    /** Checks `haystack` if FieldPath `needle` is present. Runs in O(n). */ function sh(t, e) {
        return t.some((t => t.isEqual(e)));
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A `DocumentSnapshot` contains data read from a document in your Firestore
     * database. The data can be extracted with `.data()` or `.get(<field>)` to
     * get a specific field.
     *
     * For a `DocumentSnapshot` that points to a non-existing document, any data
     * access will return 'undefined'. You can use the `exists()` method to
     * explicitly verify a document's existence.
     */ class ih {
        // Note: This class is stripped down version of the DocumentSnapshot in
        // the legacy SDK. The changes are:
        // - No support for SnapshotMetadata.
        // - No support for SnapshotOptions.
        /** @hideconstructor protected */
        constructor(t, e, n, s, i) {
            this._firestore = t, this._userDataWriter = e, this._key = n, this._document = s, 
            this._converter = i;
        }
        /** Property of the `DocumentSnapshot` that provides the document's ID. */    get id() {
            return this._key.path.lastSegment();
        }
        /**
         * The `DocumentReference` for the document included in the `DocumentSnapshot`.
         */    get ref() {
            return new Zu(this._firestore, this._converter, this._key);
        }
        /**
         * Signals whether or not the document at the snapshot's location exists.
         *
         * @returns true if the document exists.
         */    exists() {
            return null !== this._document;
        }
        /**
         * Retrieves all fields in the document as an `Object`. Returns `undefined` if
         * the document doesn't exist.
         *
         * @returns An `Object` containing all fields in the document or `undefined`
         * if the document doesn't exist.
         */    data() {
            if (this._document) {
                if (this._converter) {
                    // We only want to use the converter and create a new DocumentSnapshot
                    // if a converter has been provided.
                    const t = new rh(this._firestore, this._userDataWriter, this._key, this._document, 
                    /* converter= */ null);
                    return this._converter.fromFirestore(t);
                }
                return this._userDataWriter.convertValue(this._document.data.value);
            }
        }
        /**
         * Retrieves the field specified by `fieldPath`. Returns `undefined` if the
         * document or field doesn't exist.
         *
         * @param fieldPath - The path (for example 'foo' or 'foo.bar') to a specific
         * field.
         * @returns The data at the specified field location or undefined if no such
         * field exists in the document.
         */
        // We are using `any` here to avoid an explicit cast by our users.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        get(t) {
            if (this._document) {
                const e = this._document.data.field(oh("DocumentSnapshot.get", t));
                if (null !== e) return this._userDataWriter.convertValue(e);
            }
        }
    }

    /**
     * A `QueryDocumentSnapshot` contains data read from a document in your
     * Firestore database as part of a query. The document is guaranteed to exist
     * and its data can be extracted with `.data()` or `.get(<field>)` to get a
     * specific field.
     *
     * A `QueryDocumentSnapshot` offers the same API surface as a
     * `DocumentSnapshot`. Since query results contain only existing documents, the
     * `exists` property will always be true and `data()` will never return
     * 'undefined'.
     */ class rh extends ih {
        /**
         * Retrieves all fields in the document as an `Object`.
         *
         * @override
         * @returns An `Object` containing all fields in the document.
         */
        data() {
            return super.data();
        }
    }

    /**
     * Helper that calls `fromDotSeparatedString()` but wraps any error thrown.
     */ function oh(t, e) {
        return "string" == typeof e ? eh(t, e) : e instanceof va ? e._internalPath : e._delegate._internalPath;
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Metadata about a snapshot, describing the state of the snapshot.
     */ class ch {
        /** @hideconstructor */
        constructor(t, e) {
            this.hasPendingWrites = t, this.fromCache = e;
        }
        /**
         * Returns true if this `SnapshotMetadata` is equal to the provided one.
         *
         * @param other - The `SnapshotMetadata` to compare against.
         * @returns true if this `SnapshotMetadata` is equal to the provided one.
         */    isEqual(t) {
            return this.hasPendingWrites === t.hasPendingWrites && this.fromCache === t.fromCache;
        }
    }

    /**
     * A `DocumentSnapshot` contains data read from a document in your Firestore
     * database. The data can be extracted with `.data()` or `.get(<field>)` to
     * get a specific field.
     *
     * For a `DocumentSnapshot` that points to a non-existing document, any data
     * access will return 'undefined'. You can use the `exists()` method to
     * explicitly verify a document's existence.
     */ class uh extends ih {
        /** @hideconstructor protected */
        constructor(t, e, n, s, i, r) {
            super(t, e, n, s, r), this._firestore = t, this._firestoreImpl = t, this.metadata = i;
        }
        /**
         * Returns whether or not the data exists. True if the document exists.
         */    exists() {
            return super.exists();
        }
        /**
         * Retrieves all fields in the document as an `Object`. Returns `undefined` if
         * the document doesn't exist.
         *
         * By default, `serverTimestamp()` values that have not yet been
         * set to their final value will be returned as `null`. You can override
         * this by passing an options object.
         *
         * @param options - An options object to configure how data is retrieved from
         * the snapshot (for example the desired behavior for server timestamps that
         * have not yet been set to their final value).
         * @returns An `Object` containing all fields in the document or `undefined` if
         * the document doesn't exist.
         */    data(t = {}) {
            if (this._document) {
                if (this._converter) {
                    // We only want to use the converter and create a new DocumentSnapshot
                    // if a converter has been provided.
                    const e = new ah(this._firestore, this._userDataWriter, this._key, this._document, this.metadata, 
                    /* converter= */ null);
                    return this._converter.fromFirestore(e, t);
                }
                return this._userDataWriter.convertValue(this._document.data.value, t.serverTimestamps);
            }
        }
        /**
         * Retrieves the field specified by `fieldPath`. Returns `undefined` if the
         * document or field doesn't exist.
         *
         * By default, a `serverTimestamp()` that has not yet been set to
         * its final value will be returned as `null`. You can override this by
         * passing an options object.
         *
         * @param fieldPath - The path (for example 'foo' or 'foo.bar') to a specific
         * field.
         * @param options - An options object to configure how the field is retrieved
         * from the snapshot (for example the desired behavior for server timestamps
         * that have not yet been set to their final value).
         * @returns The data at the specified field location or undefined if no such
         * field exists in the document.
         */
        // We are using `any` here to avoid an explicit cast by our users.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        get(t, e = {}) {
            if (this._document) {
                const n = this._document.data.field(oh("DocumentSnapshot.get", t));
                if (null !== n) return this._userDataWriter.convertValue(n, e.serverTimestamps);
            }
        }
    }

    /**
     * A `QueryDocumentSnapshot` contains data read from a document in your
     * Firestore database as part of a query. The document is guaranteed to exist
     * and its data can be extracted with `.data()` or `.get(<field>)` to get a
     * specific field.
     *
     * A `QueryDocumentSnapshot` offers the same API surface as a
     * `DocumentSnapshot`. Since query results contain only existing documents, the
     * `exists` property will always be true and `data()` will never return
     * 'undefined'.
     */ class ah extends uh {
        /**
         * Retrieves all fields in the document as an `Object`.
         *
         * By default, `serverTimestamp()` values that have not yet been
         * set to their final value will be returned as `null`. You can override
         * this by passing an options object.
         *
         * @override
         * @param options - An options object to configure how data is retrieved from
         * the snapshot (for example the desired behavior for server timestamps that
         * have not yet been set to their final value).
         * @returns An `Object` containing all fields in the document.
         */
        data(t = {}) {
            return super.data(t);
        }
    }

    /**
     * A `QuerySnapshot` contains zero or more `DocumentSnapshot` objects
     * representing the results of a query. The documents can be accessed as an
     * array via the `docs` property or enumerated using the `forEach` method. The
     * number of documents can be determined via the `empty` and `size`
     * properties.
     */ class hh {
        /** @hideconstructor */
        constructor(t, e, n, s) {
            this._firestore = t, this._userDataWriter = e, this._snapshot = s, this.metadata = new ch(s.hasPendingWrites, s.fromCache), 
            this.query = n;
        }
        /** An array of all the documents in the `QuerySnapshot`. */    get docs() {
            const t = [];
            return this.forEach((e => t.push(e))), t;
        }
        /** The number of documents in the `QuerySnapshot`. */    get size() {
            return this._snapshot.docs.size;
        }
        /** True if there are no documents in the `QuerySnapshot`. */    get empty() {
            return 0 === this.size;
        }
        /**
         * Enumerates all of the documents in the `QuerySnapshot`.
         *
         * @param callback - A callback to be called with a `QueryDocumentSnapshot` for
         * each document in the snapshot.
         * @param thisArg - The `this` binding for the callback.
         */    forEach(t, e) {
            this._snapshot.docs.forEach((n => {
                t.call(e, new ah(this._firestore, this._userDataWriter, n.key, n, new ch(this._snapshot.mutatedKeys.has(n.key), this._snapshot.fromCache), this.query.converter));
            }));
        }
        /**
         * Returns an array of the documents changes since the last snapshot. If this
         * is the first snapshot, all documents will be in the list as 'added'
         * changes.
         *
         * @param options - `SnapshotListenOptions` that control whether metadata-only
         * changes (i.e. only `DocumentSnapshot.metadata` changed) should trigger
         * snapshot events.
         */    docChanges(t = {}) {
            const e = !!t.includeMetadataChanges;
            if (e && this._snapshot.excludesMetadataChanges) throw new j(G.INVALID_ARGUMENT, "To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");
            return this._cachedChanges && this._cachedChangesIncludeMetadataChanges === e || (this._cachedChanges = 
            /** Calculates the array of `DocumentChange`s for a given `ViewSnapshot`. */
            function(t, e) {
                if (t._snapshot.oldDocs.isEmpty()) {
                    let e = 0;
                    return t._snapshot.docChanges.map((n => ({
                        type: "added",
                        doc: new ah(t._firestore, t._userDataWriter, n.doc.key, n.doc, new ch(t._snapshot.mutatedKeys.has(n.doc.key), t._snapshot.fromCache), t.query.converter),
                        oldIndex: -1,
                        newIndex: e++
                    })));
                }
                {
                    // A `DocumentSet` that is updated incrementally as changes are applied to use
                    // to lookup the index of a document.
                    let n = t._snapshot.oldDocs;
                    return t._snapshot.docChanges.filter((t => e || 3 /* Metadata */ !== t.type)).map((e => {
                        const s = new ah(t._firestore, t._userDataWriter, e.doc.key, e.doc, new ch(t._snapshot.mutatedKeys.has(e.doc.key), t._snapshot.fromCache), t.query.converter);
                        let i = -1, r = -1;
                        return 0 /* Added */ !== e.type && (i = n.indexOf(e.doc.key), n = n.delete(e.doc.key)), 
                        1 /* Removed */ !== e.type && (n = n.add(e.doc), r = n.indexOf(e.doc.key)), {
                            type: lh(e.type),
                            doc: s,
                            oldIndex: i,
                            newIndex: r
                        };
                    }));
                }
            }(this, e), this._cachedChangesIncludeMetadataChanges = e), this._cachedChanges;
        }
    }

    function lh(t) {
        switch (t) {
          case 0 /* Added */ :
            return "added";

          case 2 /* Modified */ :
          case 3 /* Metadata */ :
            return "modified";

          case 1 /* Removed */ :
            return "removed";

          default:
            return L();
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ function dh(t) {
        if (Pe(t) && 0 === t.explicitOrderBy.length) throw new j(G.UNIMPLEMENTED, "limitToLast() queries require specifying at least one orderBy() clause");
    }

    /**
     * A `QueryConstraint` is used to narrow the set of documents returned by a
     * Firestore query. `QueryConstraint`s are created by invoking {@link where},
     * {@link orderBy}, {@link (startAt:1)}, {@link (startAfter:1)}, {@link
     * endBefore:1}, {@link (endAt:1)}, {@link limit} or {@link limitToLast} and
     * can then be passed to {@link query} to create a new query instance that
     * also contains this `QueryConstraint`.
     */ class _h {}

    /**
     * Creates a new immutable instance of {@link Query} that is extended to also include
     * additional query constraints.
     *
     * @param query - The {@link Query} instance to use as a base for the new constraints.
     * @param queryConstraints - The list of {@link QueryConstraint}s to apply.
     * @throws if any of the provided query constraints cannot be combined with the
     * existing or new constraints.
     */ function wh(t, ...e) {
        for (const n of e) t = n._apply(t);
        return t;
    }

    class mh extends _h {
        constructor(t, e, n) {
            super(), this.Uu = t, this.qu = e, this.Ku = n, this.type = "where";
        }
        _apply(t) {
            const e = Fa(t.firestore), n = function(t, e, n, s, i, r, o) {
                let c;
                if (i.isKeyField()) {
                    if ("array-contains" /* ARRAY_CONTAINS */ === r || "array-contains-any" /* ARRAY_CONTAINS_ANY */ === r) throw new j(G.INVALID_ARGUMENT, `Invalid Query. You can't perform '${r}' queries on documentId().`);
                    if ("in" /* IN */ === r || "not-in" /* NOT_IN */ === r) {
                        Ch(o, r);
                        const e = [];
                        for (const n of o) e.push(Dh(s, t, n));
                        c = {
                            arrayValue: {
                                values: e
                            }
                        };
                    } else c = Dh(s, t, o);
                } else "in" /* IN */ !== r && "not-in" /* NOT_IN */ !== r && "array-contains-any" /* ARRAY_CONTAINS_ANY */ !== r || Ch(o, r), 
                c = za(n, e, o, 
                /* allowArrays= */ "in" /* IN */ === r || "not-in" /* NOT_IN */ === r);
                const u = ce.create(i, r, c);
                return function(t, e) {
                    if (e.S()) {
                        const n = ve(t);
                        if (null !== n && !n.isEqual(e.field)) throw new j(G.INVALID_ARGUMENT, `Invalid query. All where filters with an inequality (<, <=, !=, not-in, >, or >=) must be on the same field. But you have inequality filters on '${n.toString()}' and '${e.field.toString()}'`);
                        const s = be(t);
                        null !== s && Nh(t, e.field, s);
                    }
                    const n = function(t, e) {
                        for (const n of t.filters) if (e.indexOf(n.op) >= 0) return n.op;
                        return null;
                    }(t, 
                    /**
     * Given an operator, returns the set of operators that cannot be used with it.
     *
     * Operators in a query must adhere to the following set of rules:
     * 1. Only one array operator is allowed.
     * 2. Only one disjunctive operator is allowed.
     * 3. `NOT_EQUAL` cannot be used with another `NOT_EQUAL` operator.
     * 4. `NOT_IN` cannot be used with array, disjunctive, or `NOT_EQUAL` operators.
     *
     * Array operators: `ARRAY_CONTAINS`, `ARRAY_CONTAINS_ANY`
     * Disjunctive operators: `IN`, `ARRAY_CONTAINS_ANY`, `NOT_IN`
     */
                    function(t) {
                        switch (t) {
                          case "!=" /* NOT_EQUAL */ :
                            return [ "!=" /* NOT_EQUAL */ , "not-in" /* NOT_IN */ ];

                          case "array-contains" /* ARRAY_CONTAINS */ :
                            return [ "array-contains" /* ARRAY_CONTAINS */ , "array-contains-any" /* ARRAY_CONTAINS_ANY */ , "not-in" /* NOT_IN */ ];

                          case "in" /* IN */ :
                            return [ "array-contains-any" /* ARRAY_CONTAINS_ANY */ , "in" /* IN */ , "not-in" /* NOT_IN */ ];

                          case "array-contains-any" /* ARRAY_CONTAINS_ANY */ :
                            return [ "array-contains" /* ARRAY_CONTAINS */ , "array-contains-any" /* ARRAY_CONTAINS_ANY */ , "in" /* IN */ , "not-in" /* NOT_IN */ ];

                          case "not-in" /* NOT_IN */ :
                            return [ "array-contains" /* ARRAY_CONTAINS */ , "array-contains-any" /* ARRAY_CONTAINS_ANY */ , "in" /* IN */ , "not-in" /* NOT_IN */ , "!=" /* NOT_EQUAL */ ];

                          default:
                            return [];
                        }
                    }(e.op));
                    if (null !== n) 
                    // Special case when it's a duplicate op to give a slightly clearer error message.
                    throw n === e.op ? new j(G.INVALID_ARGUMENT, `Invalid query. You cannot use more than one '${e.op.toString()}' filter.`) : new j(G.INVALID_ARGUMENT, `Invalid query. You cannot use '${e.op.toString()}' filters with '${n.toString()}' filters.`);
                }(t, u), u;
            }(t._query, "where", e, t.firestore._databaseId, this.Uu, this.qu, this.Ku);
            return new ta(t.firestore, t.converter, function(t, e) {
                const n = t.filters.concat([ e ]);
                return new Ee(t.path, t.collectionGroup, t.explicitOrderBy.slice(), n, t.limit, t.limitType, t.startAt, t.endAt);
            }(t._query, n));
        }
    }

    /**
     * Creates a {@link QueryConstraint} that enforces that documents must contain the
     * specified field and that the value should satisfy the relation constraint
     * provided.
     *
     * @param fieldPath - The path to compare
     * @param opStr - The operation string (e.g "&lt;", "&lt;=", "==", "&lt;",
     *   "&lt;=", "!=").
     * @param value - The value for comparison
     * @returns The created {@link Query}.
     */ function gh(t, e, n) {
        const s = e, i = oh("where", t);
        return new mh(i, s, n);
    }

    class yh extends _h {
        constructor(t, e) {
            super(), this.Uu = t, this.Gu = e, this.type = "orderBy";
        }
        _apply(t) {
            const e = function(t, e, n) {
                if (null !== t.startAt) throw new j(G.INVALID_ARGUMENT, "Invalid query. You must not call startAt() or startAfter() before calling orderBy().");
                if (null !== t.endAt) throw new j(G.INVALID_ARGUMENT, "Invalid query. You must not call endAt() or endBefore() before calling orderBy().");
                const s = new ge(e, n);
                return function(t, e) {
                    if (null === be(t)) {
                        // This is the first order by. It must match any inequality.
                        const n = ve(t);
                        null !== n && Nh(t, n, e.field);
                    }
                }(t, s), s;
            }
            /**
     * Create a `Bound` from a query and a document.
     *
     * Note that the `Bound` will always include the key of the document
     * and so only the provided document will compare equal to the returned
     * position.
     *
     * Will throw if the document does not contain all fields of the order by
     * of the query or if any of the fields in the order by are an uncommitted
     * server timestamp.
     */ (t._query, this.Uu, this.Gu);
            return new ta(t.firestore, t.converter, function(t, e) {
                // TODO(dimond): validate that orderBy does not list the same key twice.
                const n = t.explicitOrderBy.concat([ e ]);
                return new Ee(t.path, t.collectionGroup, n, t.filters.slice(), t.limit, t.limitType, t.startAt, t.endAt);
            }(t._query, e));
        }
    }

    /**
     * Creates a {@link QueryConstraint} that sorts the query result by the
     * specified field, optionally in descending order instead of ascending.
     *
     * @param fieldPath - The field to sort by.
     * @param directionStr - Optional direction to sort by ('asc' or 'desc'). If
     * not specified, order will be ascending.
     * @returns The created {@link Query}.
     */ function ph(t, e = "asc") {
        const n = e, s = oh("orderBy", t);
        return new yh(s, n);
    }

    function Dh(t, e, n) {
        if ("string" == typeof (n = getModularInstance(n))) {
            if ("" === n) throw new j(G.INVALID_ARGUMENT, "Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");
            if (!Ve(e) && -1 !== n.indexOf("/")) throw new j(G.INVALID_ARGUMENT, `Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);
            const s = e.path.child(_t.fromString(n));
            if (!Nt.isDocumentKey(s)) throw new j(G.INVALID_ARGUMENT, `Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${s}' is not because it has an odd number of segments (${s.length}).`);
            return Ut(t, new Nt(s));
        }
        if (n instanceof Zu) return Ut(t, n._key);
        throw new j(G.INVALID_ARGUMENT, `Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Wu(n)}.`);
    }

    /**
     * Validates that the value passed into a disjunctive filter satisfies all
     * array requirements.
     */ function Ch(t, e) {
        if (!Array.isArray(t) || 0 === t.length) throw new j(G.INVALID_ARGUMENT, `Invalid Query. A non-empty array is required for '${e.toString()}' filters.`);
        if (t.length > 10) throw new j(G.INVALID_ARGUMENT, `Invalid Query. '${e.toString()}' filters support a maximum of 10 elements in the value array.`);
    }

    function Nh(t, e, n) {
        if (!n.isEqual(e)) throw new j(G.INVALID_ARGUMENT, `Invalid query. You have a where filter with an inequality (<, <=, !=, not-in, >, or >=) on field '${e.toString()}' and so you must also use '${e.toString()}' as your first argument to orderBy(), but your first orderBy() is on field '${n.toString()}' instead.`);
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Converts Firestore's internal types to the JavaScript types that we expose
     * to the user.
     *
     * @internal
     */ class xh {
        convertValue(t, e = "none") {
            switch (kt(t)) {
              case 0 /* NullValue */ :
                return null;

              case 1 /* BooleanValue */ :
                return t.booleanValue;

              case 2 /* NumberValue */ :
                return Tt(t.integerValue || t.doubleValue);

              case 3 /* TimestampValue */ :
                return this.convertTimestamp(t.timestampValue);

              case 4 /* ServerTimestampValue */ :
                return this.convertServerTimestamp(t, e);

              case 5 /* StringValue */ :
                return t.stringValue;

              case 6 /* BlobValue */ :
                return this.convertBytes(At(t.bytesValue));

              case 7 /* RefValue */ :
                return this.convertReference(t.referenceValue);

              case 8 /* GeoPointValue */ :
                return this.convertGeoPoint(t.geoPointValue);

              case 9 /* ArrayValue */ :
                return this.convertArray(t.arrayValue, e);

              case 10 /* ObjectValue */ :
                return this.convertObject(t.mapValue, e);

              default:
                throw L();
            }
        }
        convertObject(t, e) {
            const n = {};
            return lt(t.fields, ((t, s) => {
                n[t] = this.convertValue(s, e);
            })), n;
        }
        convertGeoPoint(t) {
            return new Ca(Tt(t.latitude), Tt(t.longitude));
        }
        convertArray(t, e) {
            return (t.values || []).map((t => this.convertValue(t, e)));
        }
        convertServerTimestamp(t, e) {
            switch (e) {
              case "previous":
                const n = Pt(t);
                return null == n ? null : this.convertValue(n, e);

              case "estimate":
                return this.convertTimestamp(bt(t));

              default:
                return null;
            }
        }
        convertTimestamp(t) {
            const e = Et(t);
            return new ut(e.seconds, e.nanos);
        }
        convertDocumentKey(t, e) {
            const n = _t.fromString(t);
            U(vs(n));
            const s = new Vt(n.get(1), n.get(3)), i = new Nt(n.popFirst(5));
            return s.isEqual(e) || 
            // TODO(b/64130202): Somehow support foreign references.
            $(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${e.projectId}/${e.database}) instead.`), 
            i;
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Converts custom model object of type T into `DocumentData` by applying the
     * converter if it exists.
     *
     * This function is used when converting user objects to `DocumentData`
     * because we want to provide the user with a more specific error message if
     * their `set()` or fails due to invalid data originating from a `toFirestore()`
     * call.
     */ function kh(t, e, n) {
        let s;
        // Cast to `any` in order to satisfy the union type constraint on
        // toFirestore().
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return s = t ? n && (n.merge || n.mergeFields) ? t.toFirestore(e, n) : t.toFirestore(e) : e, 
        s;
    }

    class Bh extends xh {
        constructor(t) {
            super(), this.firestore = t;
        }
        convertBytes(t) {
            return new Sa(t);
        }
        convertReference(t) {
            const e = this.convertDocumentKey(t, this.firestore._databaseId);
            return new Zu(this.firestore, /* converter= */ null, e);
        }
    }

    /**
     * Executes the query and returns the results as a `QuerySnapshot`.
     *
     * Note: `getDocs()` attempts to provide up-to-date data when possible by
     * waiting for data from the server, but it may return cached data or fail if
     * you are offline and the server cannot be reached. To specify this behavior,
     * invoke {@link getDocsFromCache} or {@link getDocsFromServer}.
     *
     * @returns A `Promise` that will be resolved with the results of the query.
     */ function qh(t) {
        t = zu(t, ta);
        const e = zu(t.firestore, la), n = _a(e), s = new Bh(e);
        return dh(t._query), $u(n, t._query).then((n => new hh(e, s, t, n)));
    }

    /**
     * Add a new document to specified `CollectionReference` with the given data,
     * assigning it a document ID automatically.
     *
     * @param reference - A reference to the collection to add this document to.
     * @param data - An Object containing the data for the new document.
     * @returns A `Promise` resolved with a `DocumentReference` pointing to the
     * newly created document after it has been written to the backend (Note that it
     * won't resolve while you're offline).
     */ function zh(t, e) {
        const n = zu(t.firestore, la), s = ia(t), i = kh(t.converter, e);
        return Yh(n, [ Ba(Fa(t.firestore), "addDoc", s._key, i, null !== t.converter, {}).toMutation(s._key, nn.exists(!1)) ]).then((() => s));
    }

    /**
     * Locally writes `mutations` on the async queue.
     * @internal
     */ function Yh(t, e) {
        return function(t, e) {
            const n = new Q;
            return t.asyncQueue.enqueueAndForget((async () => Fc(await Du(t), e, n))), n.promise;
        }(_a(t), e);
    }

    /**
     * Cloud Firestore
     *
     * @packageDocumentation
     */ !function(t, e = !0) {
        !function(t) {
            N = t;
        }(SDK_VERSION), _registerComponent(new Component("firestore", ((t, {options: n}) => {
            const s = t.getProvider("app").getImmediate(), i = new la(s, new J(t.getProvider("auth-internal")), new tt(t.getProvider("app-check-internal")));
            return n = Object.assign({
                useFetchStreams: e
            }, n), i._setSettings(n), i;
        }), "PUBLIC")), registerVersion(D, "3.4.5", t), 
        // BUILD_TARGET will be replaced by values like esm5, esm2017, cjs5, etc during the compilation
        registerVersion(D, "3.4.5", "esm2017");
    }();

    var name = "firebase";
    var version = "9.6.8";

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    registerVersion(name, version, 'app');

    const firebaseConfig = {
      apiKey: "AIzaSyAW_dQEsnt0R3OSfzTKDGnjtEMWrvQmy6k",
      authDomain: "mac-comparison.firebaseapp.com",
      projectId: "mac-comparison",
      storageBucket: "mac-comparison.appspot.com",
      messagingSenderId: "123745312698",
      appId: "1:123745312698:web:db27575c2ac1d407a78783",
    };

    const app$1 = initializeApp(firebaseConfig);
    const db = da(app$1);

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    /* src/pages/Home.svelte generated by Svelte v3.46.4 */
    const file$5 = "src/pages/Home.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (67:4) {:catch error}
    function create_catch_block(ctx) {
    	let p;
    	let t_value = /*error*/ ctx[13].message + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			set_style(p, "color", "red");
    			attr_dev(p, "class", "svelte-1srjub6");
    			add_location(p, file$5, 67, 6, 1327);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*promise*/ 1 && t_value !== (t_value = /*error*/ ctx[13].message + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(67:4) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (59:4) {:then res}
    function create_then_block(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*res*/ ctx[9].docs.length != 0) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: function intro(local) {
    			transition_in(if_block);
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(59:4) {:then res}",
    		ctx
    	});

    	return block;
    }

    // (64:6) {:else}
    function create_else_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "No Content Here yet!";
    			attr_dev(p, "class", "svelte-1srjub6");
    			add_location(p, file$5, 64, 8, 1262);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(64:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (60:6) {#if res.docs.length != 0}
    function create_if_block(ctx) {
    	let each_1_anchor;
    	let each_value = /*res*/ ctx[9].docs;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*promise*/ 1) {
    				each_value = /*res*/ ctx[9].docs;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(60:6) {#if res.docs.length != 0}",
    		ctx
    	});

    	return block;
    }

    // (61:8) {#each res.docs as doc}
    function create_each_block(ctx) {
    	let p;
    	let t_value = /*doc*/ ctx[10].data().name + ": " + /*doc*/ ctx[10].data().age + "";
    	let t;
    	let p_intro;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "svelte-1srjub6");
    			add_location(p, file$5, 61, 10, 1166);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*promise*/ 1 && t_value !== (t_value = /*doc*/ ctx[10].data().name + ": " + /*doc*/ ctx[10].data().age + "")) set_data_dev(t, t_value);
    		},
    		i: function intro(local) {
    			if (!p_intro) {
    				add_render_callback(() => {
    					p_intro = create_in_transition(p, slide, {});
    					p_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(61:8) {#each res.docs as doc}",
    		ctx
    	});

    	return block;
    }

    // (57:20)        <p>...waiting</p>     {:then res}
    function create_pending_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "...waiting";
    			attr_dev(p, "class", "svelte-1srjub6");
    			add_location(p, file$5, 57, 6, 1057);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(57:20)        <p>...waiting</p>     {:then res}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let article;
    	let h1;
    	let t1;
    	let form;
    	let input0;
    	let t2;
    	let input1;
    	let t3;
    	let button;
    	let t5;
    	let div;
    	let promise_1;
    	let mounted;
    	let dispose;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 9,
    		error: 13
    	};

    	handle_promise(promise_1 = /*promise*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			article = element("article");
    			h1 = element("h1");
    			h1.textContent = "Users";
    			t1 = space();
    			form = element("form");
    			input0 = element("input");
    			t2 = space();
    			input1 = element("input");
    			t3 = space();
    			button = element("button");
    			button.textContent = "Add User";
    			t5 = space();
    			div = element("div");
    			info.block.c();
    			add_location(h1, file$5, 33, 2, 595);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "title", "Name");
    			attr_dev(input0, "placeholder", "Name");
    			input0.required = true;
    			add_location(input0, file$5, 35, 4, 672);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "title", "Age");
    			attr_dev(input1, "id", "");
    			attr_dev(input1, "min", 0);
    			attr_dev(input1, "max", 100);
    			input1.required = true;
    			add_location(input1, file$5, 43, 4, 819);
    			attr_dev(button, "type", "submit");
    			add_location(button, file$5, 52, 4, 955);
    			attr_dev(form, "action", "javascript:void(0);");
    			add_location(form, file$5, 34, 2, 612);
    			attr_dev(div, "class", "results svelte-1srjub6");
    			add_location(div, file$5, 55, 2, 1008);
    			add_location(article, file$5, 32, 0, 583);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, h1);
    			append_dev(article, t1);
    			append_dev(article, form);
    			append_dev(form, input0);
    			set_input_value(input0, /*name*/ ctx[1]);
    			/*input0_binding*/ ctx[6](input0);
    			append_dev(form, t2);
    			append_dev(form, input1);
    			set_input_value(input1, /*age*/ ctx[2]);
    			append_dev(form, t3);
    			append_dev(form, button);
    			append_dev(article, t5);
    			append_dev(article, div);
    			info.block.m(div, info.anchor = null);
    			info.mount = () => div;
    			info.anchor = null;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[5]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[7]),
    					listen_dev(form, "submit", /*addUser*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*name*/ 2 && input0.value !== /*name*/ ctx[1]) {
    				set_input_value(input0, /*name*/ ctx[1]);
    			}

    			if (dirty & /*age*/ 4 && to_number(input1.value) !== /*age*/ ctx[2]) {
    				set_input_value(input1, /*age*/ ctx[2]);
    			}

    			info.ctx = ctx;

    			if (dirty & /*promise*/ 1 && promise_1 !== (promise_1 = /*promise*/ ctx[0]) && handle_promise(promise_1, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			transition_in(info.block);
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			/*input0_binding*/ ctx[6](null);
    			info.block.d();
    			info.token = null;
    			info = null;
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	const q = wh(na(db, "users"), ph("age"));
    	let promise = qh(q);
    	let name = "";
    	let age = 20;
    	let nameInput;

    	async function addUser() {
    		await zh(na(db, "users"), { name, age });
    		$$invalidate(1, name = "");
    		$$invalidate(2, age = 20);
    		nameInput.focus();
    		$$invalidate(0, promise = qh(q));
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		name = this.value;
    		$$invalidate(1, name);
    	}

    	function input0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			nameInput = $$value;
    			$$invalidate(3, nameInput);
    		});
    	}

    	function input1_input_handler() {
    		age = to_number(this.value);
    		$$invalidate(2, age);
    	}

    	$$self.$capture_state = () => ({
    		collection: na,
    		addDoc: zh,
    		getDocs: qh,
    		query: wh,
    		where: gh,
    		orderBy: ph,
    		db,
    		slide,
    		q,
    		promise,
    		name,
    		age,
    		nameInput,
    		addUser
    	});

    	$$self.$inject_state = $$props => {
    		if ('promise' in $$props) $$invalidate(0, promise = $$props.promise);
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('age' in $$props) $$invalidate(2, age = $$props.age);
    		if ('nameInput' in $$props) $$invalidate(3, nameInput = $$props.nameInput);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		promise,
    		name,
    		age,
    		nameInput,
    		addUser,
    		input0_input_handler,
    		input0_binding,
    		input1_input_handler
    	];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/pages/About.svelte generated by Svelte v3.46.4 */

    const file$4 = "src/pages/About.svelte";

    function create_fragment$4(ctx) {
    	let article;
    	let h2;
    	let t1;
    	let p0;
    	let t3;
    	let p1;
    	let t4;
    	let abbr;
    	let t6;
    	let t7;
    	let blockquote;
    	let t9;
    	let p2;
    	let t11;
    	let dl;
    	let dt0;
    	let dd0;
    	let dt1;
    	let dd1;
    	let dt2;
    	let dd2;
    	let t18;
    	let hr;
    	let t19;
    	let menu;
    	let li0;
    	let t21;
    	let li1;
    	let t23;
    	let li2;
    	let t25;
    	let li3;
    	let t27;
    	let pre;
    	let t29;
    	let p3;
    	let t31;
    	let p4;
    	let small;
    	let t33;
    	let p5;
    	let t34;
    	let samp;
    	let t36;
    	let t37;
    	let p6;
    	let s;
    	let t39;
    	let p7;
    	let t40;
    	let sup;
    	let t42;
    	let p8;
    	let t43;
    	let var_1;
    	let t45;

    	const block = {
    		c: function create() {
    			article = element("article");
    			h2 = element("h2");
    			h2.textContent = "A new Beginning";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas sint velit\n    doloribus fugiat. Amet aut necessitatibus praesentium dolor eos minus?";
    			t3 = space();
    			p1 = element("p");
    			t4 = text("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga, labore\n    voluptatem! Distinctio unde deleniti explicabo nostrum temporibus laudantium\n    rem beatae ");
    			abbr = element("abbr");
    			abbr.textContent = "CSS";
    			t6 = text(", voluptates\n    accusamus et, dolorem ratione quia autem recusandae est. Id perferendis\n    accusantium et, molestiae incidunt ut eveniet dolor aperiam perspiciatis\n    velit praesentium unde possimus atque est harum quibusdam eius.");
    			t7 = space();
    			blockquote = element("blockquote");
    			blockquote.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat ratione\n    provident facere dolores facilis suscipit velit fugit harum ullam quae.";
    			t9 = space();
    			p2 = element("p");
    			p2.textContent = "Cryptids of Cornwall:";
    			t11 = space();
    			dl = element("dl");
    			dt0 = element("dt");
    			dt0.textContent = "Beast of Bodmin";
    			dd0 = element("dd");
    			dd0.textContent = "A large feline inhabiting Bodmin Moor.";
    			dt1 = element("dt");
    			dt1.textContent = "Morgawr";
    			dd1 = element("dd");
    			dd1.textContent = "A sea serpent.";
    			dt2 = element("dt");
    			dt2.textContent = "Owlman";
    			dd2 = element("dd");
    			dd2.textContent = "A giant owl-like creature.";
    			t18 = space();
    			hr = element("hr");
    			t19 = space();
    			menu = element("menu");
    			li0 = element("li");
    			li0.textContent = "Lorem.";
    			t21 = space();
    			li1 = element("li");
    			li1.textContent = "Incidunt!";
    			t23 = space();
    			li2 = element("li");
    			li2.textContent = "Voluptatem?";
    			t25 = space();
    			li3 = element("li");
    			li3.textContent = "Repellendus!";
    			t27 = space();
    			pre = element("pre");
    			pre.textContent = "\n    L          TE\n      A       A\n        C    V\n         R A\n         DOU\n         LOU\n        REUSE\n        QUE TU\n        PORTES\n      ET QUI T'\n      ORNE O CI\n       VILISÉ\n      OTE-  TU VEUX\n       LA    BIEN\n      SI      RESPI\n              RER       - Apollinaire\n  ";
    			t29 = space();
    			p3 = element("p");
    			p3.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Illo sequi\n    perspiciatis architecto id maxime soluta? Repudiandae eum iusto ea expedita.";
    			t31 = space();
    			p4 = element("p");
    			small = element("small");
    			small.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed impedit\n      commodi ex omnis ipsum ipsam veritatis facere perferendis asperiores\n      perspiciatis quod, voluptatum tempore odit voluptate consequatur aliquam\n      at accusantium quisquam.";
    			t33 = space();
    			p5 = element("p");
    			t34 = text("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Praesentium fugit\n    cum omnis ex consectetur ");
    			samp = element("samp");
    			samp.textContent = "laudantium eligendi corporis minima suscipit.";
    			t36 = text("\n    Dolores?");
    			t37 = space();
    			p6 = element("p");
    			s = element("s");
    			s.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae,\n      ducimus.3333333";
    			t39 = space();
    			p7 = element("p");
    			t40 = text("333");
    			sup = element("sup");
    			sup.textContent = "33333";
    			t42 = space();
    			p8 = element("p");
    			t43 = text("Lorem ");
    			var_1 = element("var");
    			var_1.textContent = "ipsum dolor sit amet consectetur";
    			t45 = text(" adipisicing elit. Vel aliquid\n    tempora illum, saepe quaerat cupiditate. Soluta recusandae quos alias consequatur\n    illo aliquam sunt suscipit sint veniam ab eligendi, hic aut! Cumque dignissimos\n    ea perspiciatis quae! Harum minima dolorem hic exercitationem!");
    			add_location(h2, file$4, 4, 2, 32);
    			add_location(p0, file$4, 5, 2, 59);
    			attr_dev(abbr, "title", "Cascading Style Sheets");
    			add_location(abbr, file$4, 12, 15, 403);
    			add_location(p1, file$4, 9, 2, 228);
    			add_location(blockquote, file$4, 17, 2, 693);
    			add_location(p2, file$4, 21, 2, 877);
    			add_location(dt0, file$4, 24, 4, 918);
    			add_location(dd0, file$4, 25, 4, 947);
    			add_location(dt1, file$4, 27, 4, 1000);
    			add_location(dd1, file$4, 28, 4, 1021);
    			add_location(dt2, file$4, 30, 4, 1050);
    			add_location(dd2, file$4, 31, 4, 1070);
    			add_location(dl, file$4, 23, 2, 909);
    			add_location(hr, file$4, 34, 2, 1117);
    			add_location(li0, file$4, 37, 4, 1138);
    			add_location(li1, file$4, 38, 4, 1158);
    			add_location(li2, file$4, 39, 4, 1181);
    			add_location(li3, file$4, 40, 4, 1206);
    			add_location(menu, file$4, 36, 2, 1127);
    			attr_dev(pre, "class", "svelte-1o8swan");
    			add_location(pre, file$4, 43, 2, 1241);
    			add_location(p3, file$4, 61, 2, 1532);
    			add_location(small, file$4, 66, 4, 1706);
    			add_location(p4, file$4, 65, 2, 1698);
    			add_location(samp, file$4, 75, 29, 2109);
    			add_location(p5, file$4, 73, 2, 1996);
    			add_location(s, file$4, 81, 4, 2210);
    			add_location(p6, file$4, 80, 2, 2202);
    			add_location(sup, file$4, 86, 8, 2329);
    			add_location(p7, file$4, 86, 2, 2323);
    			add_location(var_1, file$4, 88, 10, 2366);
    			add_location(p8, file$4, 87, 2, 2352);
    			attr_dev(article, "class", "svelte-1o8swan");
    			add_location(article, file$4, 3, 0, 20);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, h2);
    			append_dev(article, t1);
    			append_dev(article, p0);
    			append_dev(article, t3);
    			append_dev(article, p1);
    			append_dev(p1, t4);
    			append_dev(p1, abbr);
    			append_dev(p1, t6);
    			append_dev(article, t7);
    			append_dev(article, blockquote);
    			append_dev(article, t9);
    			append_dev(article, p2);
    			append_dev(article, t11);
    			append_dev(article, dl);
    			append_dev(dl, dt0);
    			append_dev(dl, dd0);
    			append_dev(dl, dt1);
    			append_dev(dl, dd1);
    			append_dev(dl, dt2);
    			append_dev(dl, dd2);
    			append_dev(article, t18);
    			append_dev(article, hr);
    			append_dev(article, t19);
    			append_dev(article, menu);
    			append_dev(menu, li0);
    			append_dev(menu, t21);
    			append_dev(menu, li1);
    			append_dev(menu, t23);
    			append_dev(menu, li2);
    			append_dev(menu, t25);
    			append_dev(menu, li3);
    			append_dev(article, t27);
    			append_dev(article, pre);
    			append_dev(article, t29);
    			append_dev(article, p3);
    			append_dev(article, t31);
    			append_dev(article, p4);
    			append_dev(p4, small);
    			append_dev(article, t33);
    			append_dev(article, p5);
    			append_dev(p5, t34);
    			append_dev(p5, samp);
    			append_dev(p5, t36);
    			append_dev(article, t37);
    			append_dev(article, p6);
    			append_dev(p6, s);
    			append_dev(article, t39);
    			append_dev(article, p7);
    			append_dev(p7, t40);
    			append_dev(p7, sup);
    			append_dev(article, t42);
    			append_dev(article, p8);
    			append_dev(p8, t43);
    			append_dev(p8, var_1);
    			append_dev(p8, t45);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('About', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/pages/Blog.svelte generated by Svelte v3.46.4 */
    const file$3 = "src/pages/Blog.svelte";

    // (24:2) <Link to="/blog/blog-post">
    function create_default_slot$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Blog");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(24:2) <Link to=\\\"/blog/blog-post\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let article;
    	let h2;
    	let t3;
    	let p0;
    	let t5;
    	let section;
    	let p1;
    	let t7;
    	let link;
    	let current;

    	link = new Link$1({
    			props: {
    				to: "/blog/blog-post",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Blog";
    			t1 = space();
    			article = element("article");
    			h2 = element("h2");
    			h2.textContent = "Lorem ipsum dolor sit.";
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. In eveniet\n      quisquam vero id laborum eos accusamus, qui unde a exercitationem!";
    			t5 = space();
    			section = element("section");
    			p1 = element("p");
    			p1.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eum eveniet\n        voluptatem libero aspernatur deserunt exercitationem ullam deleniti\n        minima recusandae qui nihil unde veritatis quo ipsam, repellat sed\n        nostrum neque optio molestias ducimus nemo maiores voluptates nulla.\n        Velit, architecto quas tempore cum omnis quibusdam obcaecati nihil quod\n        nostrum vitae voluptatibus! Consequatur.";
    			t7 = space();
    			create_component(link.$$.fragment);
    			add_location(h1, file$3, 5, 2, 72);
    			add_location(h2, file$3, 7, 4, 102);
    			add_location(p0, file$3, 8, 4, 138);
    			add_location(p1, file$3, 13, 6, 318);
    			add_location(section, file$3, 12, 4, 302);
    			add_location(article, file$3, 6, 2, 88);
    			add_location(main, file$3, 4, 0, 63);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, article);
    			append_dev(article, h2);
    			append_dev(article, t3);
    			append_dev(article, p0);
    			append_dev(article, t5);
    			append_dev(article, section);
    			append_dev(section, p1);
    			append_dev(main, t7);
    			mount_component(link, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const link_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Blog', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Blog> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Link: Link$1 });
    	return [];
    }

    class Blog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Blog",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/pages/blog/BlogPost.svelte generated by Svelte v3.46.4 */

    const file$2 = "src/pages/blog/BlogPost.svelte";

    function create_fragment$2(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Blog Post";
    			add_location(h1, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('BlogPost', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<BlogPost> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class BlogPost extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BlogPost",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/NavBar.svelte generated by Svelte v3.46.4 */

    const file$1 = "src/components/NavBar.svelte";

    function create_fragment$1(ctx) {
    	let nav;
    	let div;
    	let t0;
    	let button;
    	let nav_resize_listener;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div = element("div");
    			if (default_slot) default_slot.c();
    			t0 = space();
    			button = element("button");
    			button.textContent = "Love";
    			attr_dev(button, "class", "svelte-q5ekm3");
    			add_location(button, file$1, 7, 4, 111);
    			attr_dev(div, "class", "links container svelte-q5ekm3");
    			add_location(div, file$1, 5, 2, 64);
    			attr_dev(nav, "class", "svelte-q5ekm3");
    			add_render_callback(() => /*nav_elementresize_handler*/ ctx[3].call(nav));
    			add_location(nav, file$1, 4, 0, 39);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			append_dev(div, t0);
    			append_dev(div, button);
    			nav_resize_listener = add_resize_listener(nav, /*nav_elementresize_handler*/ ctx[3].bind(nav));
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (default_slot) default_slot.d(detaching);
    			nav_resize_listener();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NavBar', slots, ['default']);
    	let clientWidth;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NavBar> was created with unknown prop '${key}'`);
    	});

    	function nav_elementresize_handler() {
    		clientWidth = this.clientWidth;
    		$$invalidate(0, clientWidth);
    	}

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ clientWidth });

    	$$self.$inject_state = $$props => {
    		if ('clientWidth' in $$props) $$invalidate(0, clientWidth = $$props.clientWidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [clientWidth, $$scope, slots, nav_elementresize_handler];
    }

    class NavBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavBar",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.46.4 */
    const file = "src/App.svelte";

    // (13:4) <Link to="/">
    function create_default_slot_8(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Home");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(13:4) <Link to=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (14:4) <Link to="/about">
    function create_default_slot_7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("About");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(14:4) <Link to=\\\"/about\\\">",
    		ctx
    	});

    	return block;
    }

    // (15:4) <Link to="/blog">
    function create_default_slot_6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Blog");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(15:4) <Link to=\\\"/blog\\\">",
    		ctx
    	});

    	return block;
    }

    // (12:2) <NavBar>
    function create_default_slot_5(ctx) {
    	let link0;
    	let t0;
    	let link1;
    	let t1;
    	let link2;
    	let current;

    	link0 = new Link$1({
    			props: {
    				to: "/",
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link1 = new Link$1({
    			props: {
    				to: "/about",
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link2 = new Link$1({
    			props: {
    				to: "/blog",
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(link0.$$.fragment);
    			t0 = space();
    			create_component(link1.$$.fragment);
    			t1 = space();
    			create_component(link2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(link0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(link1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(link2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const link0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link0_changes.$$scope = { dirty, ctx };
    			}

    			link0.$set(link0_changes);
    			const link1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link1_changes.$$scope = { dirty, ctx };
    			}

    			link1.$set(link1_changes);
    			const link2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link2_changes.$$scope = { dirty, ctx };
    			}

    			link2.$set(link2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);
    			transition_in(link1.$$.fragment, local);
    			transition_in(link2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			transition_out(link2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(link0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(link1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(link2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(12:2) <NavBar>",
    		ctx
    	});

    	return block;
    }

    // (18:4) <Route path="/">
    function create_default_slot_4(ctx) {
    	let home;
    	let current;
    	home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(home.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(18:4) <Route path=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (19:4) <Route path="/about">
    function create_default_slot_3(ctx) {
    	let about;
    	let current;
    	about = new About({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(about.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(about, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(about.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(about.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(about, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(19:4) <Route path=\\\"/about\\\">",
    		ctx
    	});

    	return block;
    }

    // (20:4) <Route path="/blog">
    function create_default_slot_2(ctx) {
    	let blog;
    	let current;
    	blog = new Blog({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(blog.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(blog, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(blog.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(blog.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(blog, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(20:4) <Route path=\\\"/blog\\\">",
    		ctx
    	});

    	return block;
    }

    // (21:4) <Route path="/blog/blog-post">
    function create_default_slot_1(ctx) {
    	let blogpost;
    	let current;
    	blogpost = new BlogPost({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(blogpost.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(blogpost, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(blogpost.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(blogpost.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(blogpost, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(21:4) <Route path=\\\"/blog/blog-post\\\">",
    		ctx
    	});

    	return block;
    }

    // (11:0) <Router>
    function create_default_slot(ctx) {
    	let navbar;
    	let t0;
    	let main;
    	let route0;
    	let t1;
    	let route1;
    	let t2;
    	let route2;
    	let t3;
    	let route3;
    	let current;

    	navbar = new NavBar({
    			props: {
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route0 = new Route$1({
    			props: {
    				path: "/",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route1 = new Route$1({
    			props: {
    				path: "/about",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route2 = new Route$1({
    			props: {
    				path: "/blog",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route3 = new Route$1({
    			props: {
    				path: "/blog/blog-post",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			main = element("main");
    			create_component(route0.$$.fragment);
    			t1 = space();
    			create_component(route1.$$.fragment);
    			t2 = space();
    			create_component(route2.$$.fragment);
    			t3 = space();
    			create_component(route3.$$.fragment);
    			attr_dev(main, "class", "container");
    			add_location(main, file, 16, 2, 444);
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(route0, main, null);
    			append_dev(main, t1);
    			mount_component(route1, main, null);
    			append_dev(main, t2);
    			mount_component(route2, main, null);
    			append_dev(main, t3);
    			mount_component(route3, main, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const navbar_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				navbar_changes.$$scope = { dirty, ctx };
    			}

    			navbar.$set(navbar_changes);
    			const route0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				route0_changes.$$scope = { dirty, ctx };
    			}

    			route0.$set(route0_changes);
    			const route1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				route1_changes.$$scope = { dirty, ctx };
    			}

    			route1.$set(route1_changes);
    			const route2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				route2_changes.$$scope = { dirty, ctx };
    			}

    			route2.$set(route2_changes);
    			const route3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				route3_changes.$$scope = { dirty, ctx };
    			}

    			route3.$set(route3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(route0);
    			destroy_component(route1);
    			destroy_component(route2);
    			destroy_component(route3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(11:0) <Router>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let router;
    	let t0;
    	let footer;
    	let div;
    	let a0;
    	let t2;
    	let a1;
    	let t4;
    	let a2;
    	let t6;
    	let a3;
    	let t8;
    	let address;
    	let current;

    	router = new Router$1({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    			t0 = space();
    			footer = element("footer");
    			div = element("div");
    			a0 = element("a");
    			a0.textContent = "Lorem, ipsum.";
    			t2 = space();
    			a1 = element("a");
    			a1.textContent = "Mollitia, sunt?";
    			t4 = space();
    			a2 = element("a");
    			a2.textContent = "At, tempore.";
    			t6 = space();
    			a3 = element("a");
    			a3.textContent = "Ullam, eaque.";
    			t8 = space();
    			address = element("address");
    			address.textContent = "4 Pearce Court, Circular Raod East, Colchester, CO2 7GA";
    			attr_dev(a0, "href", "#");
    			add_location(a0, file, 25, 4, 719);
    			attr_dev(a1, "href", "#");
    			add_location(a1, file, 26, 4, 753);
    			attr_dev(a2, "href", "#");
    			add_location(a2, file, 27, 4, 789);
    			attr_dev(a3, "href", "#");
    			add_location(a3, file, 28, 4, 822);
    			add_location(address, file, 29, 4, 856);
    			attr_dev(div, "class", "container footer-content svelte-wf4joh");
    			add_location(div, file, 24, 2, 676);
    			attr_dev(footer, "class", "svelte-wf4joh");
    			add_location(footer, file, 23, 0, 665);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div);
    			append_dev(div, a0);
    			append_dev(div, t2);
    			append_dev(div, a1);
    			append_dev(div, t4);
    			append_dev(div, a2);
    			append_dev(div, t6);
    			append_dev(div, a3);
    			append_dev(div, t8);
    			append_dev(div, address);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Router: Router$1,
    		Link: Link$1,
    		Route: Route$1,
    		Home,
    		About,
    		Blog,
    		BlogPost,
    		NavBar
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
      props: {},
    });

    // git subtree push --prefix public/ origin gh-pages

    return app;

})();
//# sourceMappingURL=bundle.js.map
