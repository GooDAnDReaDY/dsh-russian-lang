import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const clientPath = new URL('../lib/client.js', import.meta.url);
const pkgPath = new URL('../package.json', import.meta.url);
const buildPath = new URL('../build.py', import.meta.url);

const clientSrc = fs.readFileSync(clientPath, 'utf8');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const buildSrc = fs.readFileSync(buildPath, 'utf8');

test('Issue #335: client module does not declare or wait for settingsScope', () => {
  // Must not have settingsScope in inject
  assert.ok(!clientSrc.includes("'settingsScope'"), 'lib/client.js must not inject settingsScope');
  assert.ok(!buildSrc.includes("'settingsScope'"), 'build.py must not inject settingsScope');

  // Must match exactly the supported DSH 0.1.7-alpha.1 client services
  assert.match(clientSrc, /inject:\s*\[\s*'slots',\s*'locale',\s*'configForms'\s*\]/);
});

test('Issue #335: package.json dsh.client.inject matches client runtime inject services', () => {
  const pkgInject = pkg.dsh?.client?.inject || [];
  assert.ok(pkgInject.includes('@deepseek-ai/dsh-client-locale'), 'package.json must declare locale client package');
  assert.ok(pkgInject.includes('@deepseek-ai/dsh-client-ui-settings'), 'package.json must declare ui-settings client package');
  assert.ok(pkgInject.includes('@deepseek-ai/dsh-client-ui-slots'), 'package.json must declare ui-slots client package');

  // Verify 1:1 mapping between declared packages and runtime service injects
  // @deepseek-ai/dsh-client-locale -> locale
  // @deepseek-ai/dsh-client-ui-settings -> configForms
  // @deepseek-ai/dsh-client-ui-slots -> slots
  assert.equal(pkgInject.length, 3, 'package.json dsh.client.inject must declare exactly 3 client packages');
});

test('Issue #335: client fiber activates with configForms present', () => {
  let loadedModule = null;
  const mockWindow = {
    __ModuleLoader__: {
      load(def) {
        loadedModule = def;
      }
    }
  };

  const originalWindow = global.window;
  const originalDoc = global.document;
  try {
    global.window = mockWindow;
    global.document = {
      querySelector: () => null,
      getElementById: () => null,
      createElement: () => ({ style: {}, dataset: {}, setAttribute() {}, appendChild() {} }),
      head: { appendChild() {} },
      addEventListener() {},
      removeEventListener() {},
      body: null,
      documentElement: { getAttribute: () => 'ru-RU', lang: '' }
    };

    // Load bundle
    new Function('window', 'document', clientSrc)(global.window, global.document);

    assert.ok(loadedModule, 'Bundle should call window.__ModuleLoader__.load');
    assert.equal(typeof loadedModule.factory, 'function');

    const mod = loadedModule.factory((pkgName) => {
      if (pkgName === 'react') {
        return {
          useState: (init) => [typeof init === 'function' ? init() : init, () => {}],
          useEffect: () => {},
          useRef: () => ({ current: null }),
          useCallback: (fn) => fn,
          createElement: (type, props, ...children) => ({ type, props, children })
        };
      }
      return {};
    });

    assert.deepEqual(mod.inject, ['slots', 'locale', 'configForms']);

    // Test apply with DSH 0.1.7-alpha.1 mock context
    const registeredLocales = [];
    const registeredSlots = [];
    let configFormsQueried = false;

    const mockCtx = {
      locale: {
        register: (ns, loc, dict) => { registeredLocales.push({ ns, loc }); return () => {}; },
        getLocale: () => ({ active: 'ru', locales: [{ id: 'ru', label: 'Russian' }], revision: 1 }),
        translate: (ns, key) => key,
        lookup: () => undefined,
        subscribe: () => () => {},
        addLanguage: () => {},
        setLocale: () => {},
        host: { getSnapshot: () => ({ value: {} }), subscribe: () => () => {}, set: () => Promise.resolve(), unset: () => Promise.resolve() }
      },
      slots: {
        inject: (name, fn) => fn(),
        register: (entry) => { registeredSlots.push(entry.name); }
      },
      configForms: {
        get: (ns) => {
          if (ns === 'russian-lang') configFormsQueried = true;
          return {
            getSnapshot: () => ({ status: 'ready', value: { enabled: true, overrides: {}, typography: {} } }),
            subscribe: () => () => {},
            set: () => Promise.resolve(true)
          };
        }
      },
      effect: (cb) => cb(),
      emit: () => {}
    };

    mod.apply(mockCtx);

    assert.ok(configFormsQueried, 'apply() should query configForms for russian-lang preferences');
    assert.ok(registeredLocales.some(r => r.ns === 'common' && r.loc === 'ru'), 'common ru locale should be registered');
    assert.ok(registeredSlots.includes('plugins.item'), 'plugins.item slot should be registered');
  } finally {
    global.window = originalWindow;
    global.document = originalDoc;
  }
});

test('Issue #335: client fiber activates gracefully if configForms is absent/null', () => {
  let loadedModule = null;
  const mockWindow = {
    __ModuleLoader__: {
      load(def) { loadedModule = def; }
    }
  };

  const originalWindow = global.window;
  const originalDoc = global.document;
  try {
    global.window = mockWindow;
    global.document = {
      querySelector: () => null,
      getElementById: () => null,
      createElement: () => ({ style: {}, dataset: {}, setAttribute() {}, appendChild() {} }),
      head: { appendChild() {} },
      addEventListener() {},
      removeEventListener() {},
      body: null,
      documentElement: { getAttribute: () => 'ru-RU', lang: '' }
    };

    new Function('window', 'document', clientSrc)(global.window, global.document);
    const mod = loadedModule.factory(() => ({
      useState: (init) => [typeof init === 'function' ? init() : init, () => {}],
      useEffect: () => {},
      useRef: () => ({ current: null }),
      useCallback: (fn) => fn,
      createElement: (type, props, ...children) => ({ type, props, children })
    }));

    const registeredLocales = [];
    const mockCtx = {
      locale: {
        register: (ns, loc) => { registeredLocales.push({ ns, loc }); return () => {}; },
        getLocale: () => ({ active: 'ru', locales: [{ id: 'ru', label: 'Russian' }], revision: 1 }),
        translate: (ns, key) => key,
        lookup: () => undefined,
        subscribe: () => () => {},
        addLanguage: () => {},
        setLocale: () => {},
        host: { getSnapshot: () => ({ value: {} }), subscribe: () => () => {}, set: () => Promise.resolve(), unset: () => Promise.resolve() }
      },
      slots: {
        inject: (name, fn) => fn(),
        register: () => {}
      },
      // configForms is absent
      effect: (cb) => cb(),
      emit: () => {}
    };

    assert.doesNotThrow(() => {
      mod.apply(mockCtx);
    }, 'apply() must not crash even when configForms is completely absent');

    assert.ok(registeredLocales.length > 0, 'dictionaries should still register');
  } finally {
    global.window = originalWindow;
    global.document = originalDoc;
  }
});
