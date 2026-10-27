# 改完 css/ 或 js/ 里的文件后，推到 GitHub 之前跑一次：  python3 bump.py
# 它会按每个文件的内容重新算 index.html 里的 ?v=版本号，
# 这样手机就不会拿缓存的旧文件和新文件混着用。
import hashlib, re, pathlib

root = pathlib.Path(__file__).parent
index = root / 'index.html'
html = index.read_text(encoding='utf-8')

def repl(m):
    path = m.group(2)
    data = (root / path).read_bytes()
    v = hashlib.md5(data).hexdigest()[:8]
    return f'{m.group(1)}./{path}?v={v}'

new = re.sub(r'((?:src|href)=")\./((?:css|js|data)/[\w.-]+)\?v=[\w]*', repl, html)
if new != html:
    index.write_text(new, encoding='utf-8')
    print('版本号已更新')
else:
    print('没有变化')
