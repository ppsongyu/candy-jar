# 改完 css/ 或 js/ 里的文件后，推到 GitHub 之前跑一次：  python3 bump.py
# 它会按每个文件的内容重新算 index.html 里的 ?v=版本号，
# 这样手机就不会拿缓存的旧文件和新文件混着用。
# 顺便把设置「关于」里那行「更新于 …」改成现在的北京时间，打开一看就知道新版本到没到。
import hashlib, re, pathlib, datetime

root = pathlib.Path(__file__).parent
index = root / 'index.html'
html = index.read_text(encoding='utf-8')

def repl(m):
    path = m.group(2)
    data = (root / path).read_bytes()
    v = hashlib.md5(data).hexdigest()[:8]
    return f'{m.group(1)}./{path}?v={v}'

now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8)))
stamp = f'更新于 {now.year}年{now.month}月{now.day}日 {now:%H:%M}'
html = re.sub(r'(id="build-time">)[^<]*', lambda m: m.group(1) + stamp, html)

new = re.sub(r'((?:src|href)=")\./((?:css|js|data)/[\w.-]+)\?v=[\w]*', repl, html)
new_html = new
if new_html != index.read_text(encoding='utf-8'):
    index.write_text(new_html, encoding='utf-8')
    print('版本号已更新，' + stamp)
else:
    print('没有变化')
