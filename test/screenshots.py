"""Capture two screenshots of the installed plugin for the catalog.

  docs/media/ui-russian.png       — sidebar in Russian (Настройки, Новая сессия)
  docs/media/language-selector.png — Settings > General with the language selector
                                      visible alongside other rows

The screenshots are taken against a live staging harness with the plugin
installed via npm. Run from the repo root: `python3 test/screenshots.py`.
"""
import base64
import json
import os
import subprocess
import tempfile
import time
import urllib.request

import websocket  # type: ignore

URL = os.environ.get('DSH_URL', 'https://192.168.1.111:3082')
CHROME = os.environ.get('CHROME', '/usr/bin/google-chrome')
PORT = int(os.environ.get('DSH_CDP_PORT', '9335'))
OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'docs', 'media')


def send(ws, ident, method, params=None):
    ident['id'] += 1
    ws.send(json.dumps({'id': ident['id'], 'method': method, 'params': params or {}}))
    while True:
        msg = json.loads(ws.recv())
        if msg.get('id') == ident['id']:
            if 'error' in msg:
                raise SystemExit(msg['error'])
            return msg['result']


def capture(ws, ident, path):
    res = send(ws, ident, 'Page.captureScreenshot', {'format': 'png'})
    with open(path, 'wb') as f:
        f.write(base64.b64decode(res['data']))
    print('wrote', path)


def run(ws, ident, expression):
    return send(ws, ident, 'Runtime.evaluate', {
        'expression': '(async () => { ' + expression + ' })()',
        'awaitPromise': True, 'returnByValue': True, 'timeout': 40000,
    })['result']['value']


def click(ws, ident, expression):
    pos = run(ws, ident, expression)
    if not pos:
        return False
    send(ws, ident, 'Input.dispatchMouseEvent', {'type': 'mousePressed', **pos, 'button': 'left', 'clickCount': 1})
    send(ws, ident, 'Input.dispatchMouseEvent', {'type': 'mouseReleased', **pos, 'button': 'left', 'clickCount': 1})
    return True


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    profile = tempfile.mkdtemp(prefix='dsh-shots-')
    chrome = subprocess.Popen([
        CHROME, '--headless=new', '--remote-debugging-port=' + str(PORT),
        '--remote-allow-origins=*', '--ignore-certificate-errors',
        '--no-first-run', '--no-default-browser-check',
        '--user-data-dir=' + profile, '--window-size=1440,900', 'about:blank',
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(60):
            try:
                json.load(urllib.request.urlopen(f'http://127.0.0.1:{PORT}/json'))
                break
            except Exception:
                time.sleep(0.4)
        url = URL + '?cb=' + str(int(time.time()))
        tab = json.load(urllib.request.urlopen(urllib.request.Request(
            f'http://127.0.0.1:{PORT}/json/new?{urllib.parse.quote(url, safe="")}',
            method='PUT')))
        ws = websocket.create_connection(tab['webSocketDebuggerUrl'])
        ws.settimeout(20)
        try:
            ident = {'id': 0}
            send(ws, ident, 'Page.enable')
            send(ws, ident, 'Runtime.enable')
            run(ws, ident, '''
                const started = Date.now();
                while (Date.now() - started < 40000) {
                  if (document.readyState === 'complete' && document.body && document.body.innerText.length > 50) break;
                  await new Promise(r => setTimeout(r, 400));
                }
                return 'up';
            ''')
            time.sleep(2)

            already_ru = run(ws, ident, '''
                return document.body.innerText.indexOf("\\u041d\\u043e\\u0432\\u0430\\u044f \\u0441\\u0435\\u0441\\u0441\\u0438\\u044f") >= 0;
            ''')
            if not already_ru:
                # Switch to Russian via the native menu.
                click(ws, ident, '''
                    const btns = [...document.querySelectorAll('button')];
                    const b = btns.find(x => /settings/i.test(x.getAttribute('aria-label') || ''))
                      || btns.find(x => ['Settings', '\\u041d\\u0430\\u0441\\u0442\\u0440\\u043e\\u0439\\u043a\\u0438'].includes((x.textContent || '').trim()));
                    if (!b) return null;
                    const r = b.getBoundingClientRect();
                    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
                ''')
                time.sleep(1.5)
                click(ws, ident, '''
                    const langs = ['English', '\\u4e2d\\u6587', '\\u0420\\u0443\\u0441\\u0441\\u043a\\u0438\\u0439'];
                    const sel = [...document.querySelectorAll('button')].find(x => langs.includes((x.textContent || '').trim()));
                    if (!sel) return null;
                    const r = sel.getBoundingClientRect();
                    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
                ''')
                time.sleep(0.7)
                click(ws, ident, '''
                    const items = [...document.querySelectorAll('[role="menuitem"], [role="option"], li')];
                    const it = items.find(e => (e.textContent || '').trim() === '\\u0420\\u0443\\u0441\\u0441\\u043a\\u0438\\u0439');
                    if (!it) return null;
                    const r = it.getBoundingClientRect();
                    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
                ''')
                time.sleep(2)

            # 1. UI in Russian: collapse settings dialog and grab the sidebar.
            send(ws, ident, 'Input.dispatchKeyEvent', {'type': 'keyDown', 'key': 'Escape', 'code': 'Escape', 'windowsVirtualKeyCode': 27})
            send(ws, ident, 'Input.dispatchKeyEvent', {'type': 'keyUp', 'key': 'Escape', 'code': 'Escape', 'windowsVirtualKeyCode': 27})
            time.sleep(0.5)
            capture(ws, ident, os.path.join(OUT_DIR, 'ui-russian.png'))

            # 2. Open settings so the language selector is visible alongside other rows.
            click(ws, ident, '''
                const btns = [...document.querySelectorAll('button')];
                const b = btns.find(x => /settings/i.test(x.getAttribute('aria-label') || ''))
                  || btns.find(x => ['Settings', '\\u041d\\u0430\\u0441\\u0442\\u0440\\u043e\\u0439\\u043a\\u0438'].includes((x.textContent || '').trim()));
                if (!b) return null;
                const r = b.getBoundingClientRect();
                return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
            ''')
            time.sleep(1.5)
            capture(ws, ident, os.path.join(OUT_DIR, 'language-selector.png'))
        finally:
            ws.close()
    finally:
        chrome.terminate()
        try:
            chrome.wait(timeout=3)
        except Exception:
            chrome.kill()
        import shutil
        shutil.rmtree(profile, ignore_errors=True)


if __name__ == '__main__':
    main()
