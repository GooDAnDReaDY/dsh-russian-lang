import json, sys, urllib.request

WORKDIR = '/mnt/external/Project/DEV'
GCREDS = WORKDIR + '/.gitea-agent-credentials.json'
BASE_URL = 'http://127.0.0.1:3005/api/v1/repos/goodandready/dsh-russian-lang'

def get_token():
    with open(GCREDS) as f:
        d = json.load(f)
    return d['agents']['antigravity']['token']

def api_call(path, method='GET', data=None):
    token = get_token()
    hdrs = {'Authorization': 'token ' + token, 'Content-Type': 'application/json'}
    url = BASE_URL + path
    body = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=body, headers=hdrs, method=method)
    with urllib.request.urlopen(req) as resp:
        if resp.status == 204:
            return {}
        ct = resp.headers.get('Content-Type', '')
        if 'application/json' in ct:
            return json.loads(resp.read().decode('utf-8'))
        return resp.read().decode('utf-8')

if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'list'
    if cmd == 'list':
        st = sys.argv[2] if len(sys.argv) > 2 else 'open'
        issues = api_call('/issues?state=' + st)
        for i in issues:
            if not i.get('pull_request'):
                print('#%s [%s]: %s' % (i['number'], i['state'], i['title']))
    elif cmd == 'view':
        num = sys.argv[2]
        issue = api_call('/issues/' + num)
        print('#%s [%s]: %s\n' % (issue['number'], issue['state'], issue['title']))
        print(issue.get('body', ''))
    elif cmd == 'close':
        num = sys.argv[2]
        res = api_call('/issues/' + num, method='PATCH', data={'state': 'closed'})
        print('Closed issue #' + num)
    elif cmd == 'create':
        title = sys.argv[2]
        body = sys.argv[3] if len(sys.argv) > 3 else ''
        res = api_call('/issues', method='POST', data={'title': title, 'body': body})
        print('Created issue #%s: %s' % (res['number'], res['title']))
    elif cmd == 'pr':
        head, base, title = sys.argv[2], sys.argv[3], sys.argv[4]
        body = sys.argv[5] if len(sys.argv) > 5 else ''
        res = api_call('/pulls', method='POST', data={'head': head, 'base': base, 'title': title, 'body': body})
        print('PR created: #%s' % res['number'])
    elif cmd == 'merge':
        num = sys.argv[2]
        mtitle = sys.argv[3] if len(sys.argv) > 3 else ''
        mmsg = sys.argv[4] if len(sys.argv) > 4 else ''
        data = {'Do': 'squash'}
        if mtitle: data['MergeTitleField'] = mtitle
        if mmsg: data['MergeMessageField'] = mmsg
        res = api_call('/pulls/' + num + '/merge', method='POST', data=data)
        print('Merged PR #' + num)
