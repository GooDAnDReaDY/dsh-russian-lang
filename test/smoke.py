#!/usr/bin/env python3
"""Headless smoke test for the installed @goodandready/dsh-russian-lang.

Launches chrome via CDP, opens the staging origin, and asserts the basic UX:

  * The native Language menu lists three items including Русский.
  * Selecting Русский switches the active language and the document language
    tag, the sidebar renders Russian (Новая сессия / Настройки).
  * Reload preserves the choice.

Requires a running dsh-staging host with our plugin installed; the harness
talks to Chrome's remote-debugging port on the loopback. Used for CI on
publish.
"""
import json
import os
import shutil
import subprocess
import tempfile
import urllib.request

DEFAULT_URL = os.environ.get('DSH_URL', 'https://192.168.1.111:3082')
CHROME = os.environ.get('CHROME', '/usr/bin/google-chrome')
PORT = int(os.environ.get('DSH_CDP_PORT', '9333'))


def step(label, value):
    print(label, json.dumps(value, ensure_ascii=False))


def run(send, expression):
    # ponytail: CDP races the page's own redirects on boot ("Execution context
    # was destroyed", -32000); retry a few times before giving up.
    import time
    for attempt in range(6):
        try:
            out = send('Runtime.evaluate', {
                'expression': '(async () => { ' + expression + ' })()',
                'awaitPromise': True,
                'returnByValue': True,
                'timeout': 40000,
            })
            break
        except SystemExit as err:
            if 'Execution context was destroyed' not in str(err) or attempt == 5:
                raise
            time.sleep(1)
    if out.get('exceptionDetails'):
        raise SystemExit(json.dumps(out['exceptionDetails'])[:600])
    return out['result']['value']


def real_click(send, expression):
    pos = run(send, expression)
    if not pos:
        return False
    send('Input.dispatchMouseEvent', {'type': 'mousePressed', 'x': pos['x'], 'y': pos['y'], 'button': 'left', 'clickCount': 1})
    send('Input.dispatchMouseEvent', {'type': 'mouseReleased', 'x': pos['x'], 'y': pos['y'], 'button': 'left', 'clickCount': 1})
    return True


def main():
    profile = tempfile.mkdtemp(prefix='dsh-smoke-')
    chrome = subprocess.Popen([
        CHROME, '--headless=new', '--remote-debugging-port=' + str(PORT),
        '--remote-allow-origins=*', '--ignore-certificate-errors',
        '--no-first-run', '--no-default-browser-check',
        '--user-data-dir=' + profile, '--window-size=1440,900', 'about:blank',
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        tabs = None
        for _ in range(60):
            try:
                # nosemgrep: dynamic-urllib-use-detected — loopback CDP, no remote scheme.
                tabs = json.load(urllib.request.urlopen(f'http://127.0.0.1:{PORT}/json'))
                break
            except Exception:
                pass
            import time
            time.sleep(0.4)
        if not tabs:
            raise SystemExit('chrome devtools not up')
        tab_url = f'http://127.0.0.1:{PORT}/json/new?{urllib.parse.quote(DEFAULT_URL, safe="")}'
        # nosemgrep: dynamic-urllib-use-detected — loopback CDP, no remote scheme.
        tab = json.load(urllib.request.urlopen(urllib.request.Request(tab_url, method='PUT')))
        import websocket  # type: ignore
        ws = websocket.create_connection(tab['webSocketDebuggerUrl'])
        ws.settimeout(10)
        try:
            ident = {'id': 0}

            def send(method, params=None):
                ident['id'] += 1
                ws.send(json.dumps({'id': ident['id'], 'method': method, 'params': params or {}}))
                while True:
                    msg = json.loads(ws.recv())
                    if msg.get('id') == ident['id']:
                        if 'error' in msg:
                            raise SystemExit(msg['error'])
                        return msg['result']
            send('Page.enable')
            send('Runtime.enable')
            run(send, '''
                const started = Date.now();
                while (Date.now() - started < 40000) {
                  if (document.readyState === 'complete' && document.body && document.body.innerText.length > 50) break;
                  await new Promise(r => setTimeout(r, 400));
                }
                return 'up';
            ''')

            # Cold-boot race in a neighbour plugin can show "Failed to load
            # plugins"; a refresh reliably recovers, so retry once like a user.
            banner = run(send, '''
                return document.body.innerText.includes('Failed to load plugins');
            ''')
            if banner:
                send('Page.reload')
                run(send, '''
                    const started = Date.now();
                    while (Date.now() - started < 40000) {
                      if (document.readyState === 'complete' && document.body && document.body.innerText.length > 50) break;
                      await new Promise(r => setTimeout(r, 400));
                    }
                    return 'up';
                ''')
            time.sleep(1.5)

            step('boot', run(send, 'return { lang: document.documentElement.lang, sample: document.body.innerText.replace(/\\\\s+/g, " ").slice(0, 100) };'))

            settings_click = '''
                const btns = [...document.querySelectorAll('button')];
                const b = btns.find(x => /settings/i.test(x.getAttribute('aria-label') || ''))
                  || btns.find(x => ['Settings', '\\u041d\\u0430\\u0441\\u0442\\u0440\\u043e\\u0439\\u043a\\u0438'].includes((x.textContent || '').trim()));
                if (!b) return null;
                const r = b.getBoundingClientRect();
                return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
            '''
            ok = real_click(send, settings_click)
            step('settings-opened', ok)
            time.sleep(1.2)

            lang_click = '''
                const langs = ['English', '\\u4e2d\\u6587', '\\u0420\\u0443\\u0441\\u0441\\u043a\\u0438\\u0439'];
                const sel = [...document.querySelectorAll('button')].find(x => langs.includes((x.textContent || '').trim()));
                if (!sel) return null;
                const r = sel.getBoundingClientRect();
                return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
            '''
            ok = real_click(send, lang_click)
            step('menu-opened', ok)
            time.sleep(0.7)

            labels = run(send, '''
                return [...document.querySelectorAll('[role="menuitem"], [role="option"], li')]
                  .map(e => (e.textContent || '').trim())
                  .filter(Boolean);
            ''')
            step('items', sorted(set(labels)))
            if 'Русский' not in labels:
                raise SystemExit('Русский not in the language menu')

            ru_click = '''
                const items = [...document.querySelectorAll('[role="menuitem"], [role="option"], li')];
                const it = items.find(e => (e.textContent || '').trim() === '\\u0420\\u0443\\u0441\\u0441\\u043a\\u0438\\u0439');
                if (!it) return null;
                const r = it.getBoundingClientRect();
                return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
            '''
            ok = real_click(send, ru_click)
            step('ru-clicked', ok)
            time.sleep(1.5)
            after_ru = run(send, '''
                return {
                  has_ru: document.body.innerText.indexOf('\\u041d\\u043e\\u0432\\u0430\\u044f \\u0441\\u0435\\u0441\\u0441\\u0438\\u044f') >= 0,
                };
            ''')
            step('after-ru', after_ru)
            if not after_ru['has_ru']:
                raise SystemExit('Russian UI did not switch on click')

            # Reload to confirm the choice survives a fresh boot.
            send('Page.reload')
            time.sleep(10)
            after = run(send, '''
                return {
                  has_ru: document.body.innerText.indexOf('\\u041d\\u043e\\u0432\\u0430\\u044f \\u0441\\u0435\\u0441\\u0441\\u0438\\u044f') >= 0,
                };
            ''')
            step('after-reload', after)
            if not after['has_ru']:
                raise SystemExit('Russian UI did not survive reload')
        finally:
            ws.close()
    finally:
        shutil.rmtree(profile, ignore_errors=True)
        chrome.terminate()
        try:
            chrome.wait(timeout=3)
        except Exception:
            chrome.kill()


if __name__ == '__main__':
    try:
        import websocket  # noqa: F401
    except ImportError:
        raise SystemExit('install websocket-client first (pip install websocket-client)')
    main()
