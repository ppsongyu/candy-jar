# 加了新糖、新便签或新零食以后跑一次：  python3 sync_connector.py
# 它会把 data/ 里的糖、便签、零食清单同步进连接器（supabase/functions/candy-jar/index.ts），
# 然后照 CODEMAP.md 里写的步骤把连接器重新部署一次，克劳德就能用上新东西了。
import json, pathlib, re, subprocess

root = pathlib.Path(__file__).parent
ts = root / 'supabase/functions/candy-jar/index.ts'

def read_data(*names):
    code = ';'.join((root / 'data' / f).read_text(encoding='utf-8') for f in ('candy-pics.js', 'snacks.js'))
    js = code.replace('\nconst ', '\nvar ') + ';process.stdout.write(JSON.stringify({' + ','.join(f'{n}:{n}' for n in names) + '}))'
    js = re.sub(r'^const ', 'var ', js)
    return json.loads(subprocess.run(['node'], input=js, capture_output=True, text=True, check=True).stdout)

d = read_data('candyFiles', 'noteFiles', 'snackShop')
s = ts.read_text(encoding='utf-8')
n = len(d['candyFiles'])
candies = 'const CANDIES = ' + json.dumps(d['candyFiles'], ensure_ascii=False) + ';'
notes = 'const NOTES = ' + json.dumps([[x['src'][2:-4], x['name']] for x in d['noteFiles']], ensure_ascii=False) + ';'
shop = "const SHOP = '" + ';'.join(f"{x['id']}|{x['name']}|{x['price']}" for x in d['snackShop']) + "'"
s = re.sub(r"const CANDIES = \[.*?\];", lambda m: candies, s, count=1, flags=re.S)
s = re.sub(r"const NOTES = \[.*?\];", lambda m: notes, s, count=1, flags=re.S)
s = re.sub(r"const SHOP = '[^']*'", lambda m: shop, s, count=1)
s = re.sub(r"maximum: \d+, description: '糖的样式 1-\d+，不填随机'", f"maximum: {n}, description: '糖的样式 1-{n}，不填随机'", s)
s = re.sub(r"a\.candy >= 1 && a\.candy <= \d+", f"a.candy >= 1 && a.candy <= {n}", s)
ts.write_text(s, encoding='utf-8')
print(f'连接器已同步：{n} 颗糖、{len(d["noteFiles"])} 张便签、{len(d["snackShop"])} 样零食')
