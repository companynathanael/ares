# ARES

Interface de IA com identidade própria. Não tem cara de ChatGPT nem de Claude: fundo de galáxia, vidro, cortes angulares iguais aos da logo e efeitos em tudo.

## Rodar

```bash
cp .env.example .env      # coloque sua ANTHROPIC_API_KEY
npm install
npm start                 # http://localhost:3000
```

Para gerar a versão em arquivo único (`dist/index.html`, abre direto no navegador):

```bash
npm run build
```

Sem a chave, a Ares abre em **modo demonstração**: a interface funciona inteira, mas a resposta é fixa e ensina a ligar o núcleo.

## Login

A Ares abre numa tela de login. Sem senha configurada, ela pede só o **codinome** (fica salvo no navegador).
Com `ARES_SENHA=...` no `.env`, a tela pede também a senha e o servidor só responde a quem entrou
(sessão em cookie HttpOnly de 7 dias e no máximo 5 tentativas por minuto). O botão de sair fica no rodapé do menu.

## Animação de entrada

Ao abrir, a Ares liga como um sistema (cerca de 4,5 s): linha de energia, milhares de partículas que montam a logo em espiral
(amostradas do próprio desenho da logo), anéis HUD, log de inicialização com progresso, logo com falha digital,
nome decodificado e uma onda de choque que revela a tela. Usa a cor do tema.

- Pula com clique, `Esc`, `Enter` ou espaço.
- Toca a cada vez que a página abre (inclusive no F5 e antes do login); desliga ou revê em **Comando → Aparência → Animação de entrada**.

## Comando (engrenagem)

- **Relatório:** números e gráficos das suas conversas.
- **Aparência:** tema, brilho, tamanho do texto e liga/desliga de cada efeito (estrelas, grade hexagonal, aurora, cursor, animações).
- **Perfil:** foto, codinome, título, como a Ares deve te chamar e um "sobre você" que a Ares usa como contexto nas respostas. Clicar no seu nome no rodapé do menu também abre o perfil.

## Forma

Tudo segue um único padrão: retângulos de cantos arredondados (tokens `--r-xs` a `--r-xl` em `ares.css`), botões em pílula e cursor em anel.

## Atalhos

`1` Arena · `2` Arsenal · `3` Comando · `4` Histórico · `N` nova batalha · `P` painel tático · `Esc` fecha

## Temas

O tema se troca em **Comando → Aparência** ou nos pontos da tela de login (fica salvo no navegador):

| Ponto | Tema |
|---|---|
| ◐ | Preto e branco puro |
| ● ciano | Preto e branco com detalhes em ciano |
| ● vermelho | Preto e branco com detalhes em vermelho |
| ● rosa | Preto e branco com detalhes em rosa |
| ● verde | Preto e branco com detalhes em verde |

Fonte: **Chakra Petch** (sans-serif angular, combina com os chanfros da logo) e **JetBrains Mono** nos rótulos.

## Onde cada skill entrou

| Skill | Onde |
|---|---|
| glassy-sidebar | Menu lateral de vidro com pílula que desliza no hover, badges, atalhos, conversas recentes, status do núcleo com botão de sair e botão que recolhe para só ícones (com dicas ao passar o mouse) |
| carrossel-vidro-cinema | **Arsenal**: carrossel 3D dos 6 modos (setas, swipe, roda do mouse), card que vira modal (FLIP) e a barra de player sobre o campo de mensagem, com equalizador que anima enquanto a Ares responde |
| efeitos-ui-animados | Galáxia com estrelas cadentes e repulsão do mouse, grade hexagonal que acende sob o cursor, aurora, texto brilhante, título revelado, split/blur text, desfoque gradual na conversa, botão magnético, tilt, contador e cursor próprio |
| ui-espacial-vidro | Painel tático em gaveta (botão **Painel** ou tecla `P`), que inclina com o mouse: relógio, dial **Fúria** (quanto a IA pensa: baixa → máxima), dial **Brilho** (intensidade do neon) e status do núcleo com tokens |
| dashboard-saas-premium | **Comando**: números reais das suas conversas, gráfico de ordens por dia, modos mais usados e batalhas recentes |

## Modos (Arsenal)

Estrategista · Forja (código) · Oráculo (explicações) · Escriba (textos) · Sentinela (revisão crítica) · Arauto (marketing).
Cada modo tem um prompt de sistema próprio em `server.js`.

## Estrutura

```
server.js            servidor Node + ponte com a API do Claude (streaming)
public/index.html    estrutura
public/css/ares.css  visual e temas
public/js/fx.js      efeitos
public/js/app.js     menu, carrossel, conversa, painel, relatório, histórico
public/assets/ares-logo.svg   logo vetorizada
```

- Login: `ARES_SENHA` no `.env` (opcional).
- Modelo padrão: `claude-opus-5-5` (troque com `ARES_MODEL` no `.env`).
- A chave fica só no servidor. As conversas ficam salvas no `localStorage` do navegador.
- Se o modelo recusar um pedido por segurança, a API tenta de novo sozinha com o modelo reserva recomendado (`fallbacks: "default"`).
