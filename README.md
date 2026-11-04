# ARES

Interface de IA com identidade própria. Não tem cara de ChatGPT nem de Claude: fundo de galáxia, vidro, cortes angulares iguais aos da logo e efeitos em tudo.

## Rodar

```bash
cp .env.example .env      # coloque sua ANTHROPIC_API_KEY
npm install
npm start                 # http://localhost:3000
```

Sem a chave, a Ares abre em **modo demonstração**: a interface funciona inteira, mas a resposta é fixa e ensina a ligar o núcleo.

## Temas

Os três pontos no topo do menu trocam o tema (fica salvo no navegador):

| Ponto | Tema |
|---|---|
| ◐ | Preto e branco puro |
| ● ciano | Preto e branco com detalhes em ciano |
| ● vermelho | Preto e branco com detalhes em vermelho |

Fonte: **Chakra Petch** (sans-serif angular, combina com os chanfros da logo) e **JetBrains Mono** nos rótulos.

## Onde cada skill entrou

| Skill | Onde |
|---|---|
| glassy-sidebar | Menu lateral de vidro com pílula que desliza no hover, badge, cartão do usuário e botão que recolhe para só ícones |
| carrossel-vidro-cinema | **Arsenal**: carrossel 3D dos 6 modos (setas, swipe, roda do mouse), card que vira modal (FLIP) e a barra de player sobre o campo de mensagem, com equalizador que anima enquanto a Ares responde |
| efeitos-ui-animados | Galáxia com estrelas cadentes e repulsão do mouse, grade hexagonal que acende sob o cursor, aurora, texto brilhante, título revelado, split/blur text, desfoque gradual na conversa, botão magnético, tilt, contador e cursor próprio |
| ui-espacial-vidro | Painel tático à direita, que inclina com o mouse: relógio, dial **Fúria** (quanto a IA pensa: baixa → máxima), dial **Brilho** (intensidade do neon) e status do núcleo com tokens |
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

- Modelo padrão: `claude-opus-5-5` (troque com `ARES_MODEL` no `.env`).
- A chave fica só no servidor. As conversas ficam salvas no `localStorage` do navegador.
- Se o modelo recusar um pedido por segurança, a API tenta de novo sozinha com o modelo reserva recomendado (`fallbacks: "default"`).
