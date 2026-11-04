// Gera dist/index.html: a Ares inteira em um arquivo só (abre direto no navegador, em modo demonstração).
import fs from 'node:fs';
const r = f => fs.readFileSync(new URL('../public/' + f, import.meta.url), 'utf8');
const uri = 'data:image/svg+xml,' + encodeURIComponent(r('assets/ares-logo.svg'));
let html = r('index.html')
  .replace('<link rel="stylesheet" href="css/ares.css">', () => `<style>\n${r('css/ares.css').replaceAll('url(../assets/ares-logo.svg)', `url("${uri}")`)}\n</style>`)
  .replace('href="assets/ares-logo.svg"', () => `href="${uri}"`);
for (const f of ['logo-path', 'fx', 'app']) html = html.replace(`<script src="js/${f}.js"></script>`, () => `<script>\n${r(`js/${f}.js`)}\n</script>`);
if (/src="js\/|css\/ares\.css/.test(html)) throw new Error('algum arquivo não foi embutido');
fs.mkdirSync(new URL('../dist/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL('../dist/index.html', import.meta.url), html);
console.log('dist/index.html gerado (' + Math.round(html.length / 1024) + ' KB)');
