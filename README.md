# Go-Arena

Go Arena é um projeto conceitual de produto digital para o jogo de Go: uma landing page
que apresenta a proposta e, a partir do MVP 1, uma primeira versão jogável do jogo em si.

## Estado atual

- **Landing page** (`index.html`): estática, apresenta a ideia do produto e os pilares
  arquiteturais (AWS Well-Architected) que vão guiar a evolução do projeto.
- **MVP 1** (`play.html`): uma partida de Go 9×9 **local**, no navegador, para dois
  jogadores revezando no mesmo dispositivo. Sem contas, sem backend, sem banco de dados,
  sem multiplayer em rede — só o jogo, jogável do início ao fim.

## O que o MVP 1 implementa

- Tabuleiro 9×9 interativo (81 interseções), com pedras pretas e brancas alternando por
  jogador.
- Captura de pedras e grupos sem liberdades.
- Regra de suicídio (com exceção para jogadas que capturam e abrem liberdade).
- Regra do Ko simples (não recria a posição imediatamente anterior; superko não é
  implementado).
- Passar a vez, desistir e reiniciar a partida.
- Fim de partida por dois passes consecutivos ou por desistência.
- Pontuação por área (pedras + território) com komi de 6,5 para o Branco.

## Estrutura do projeto

```
Go-Arena/
├── index.html          # Landing page
├── play.html            # Página do jogo (MVP 1)
├── styles.css            # Estilos de todo o site (landing + jogo)
├── js/
│   ├── board.js          # Representação do tabuleiro e utilidades básicas
│   ├── rules.js           # Grupos, liberdades, captura, suicídio e pontuação
│   ├── game.js             # Estado da partida (jogar, passar, desistir, reiniciar, Ko)
│   └── ui.js                # Renderização do tabuleiro e ligação com o DOM
├── tests/
│   └── game.test.js          # Testes do motor de regras
└── package.json
```

A separação é intencional: `board.js` e `rules.js` não sabem que existe uma tela — são
funções puras que recebem uma matriz e devolvem um resultado. `game.js` guarda o estado da
partida e usa as regras para validar cada ação. `ui.js` é a única parte que toca o DOM.

## Regras já suportadas

| Regra | Onde |
|---|---|
| Posição ocupada / fora do tabuleiro | `rules.js` → `applyMove` |
| Grupos conectados ortogonalmente | `rules.js` → `getGroup` |
| Liberdades de um grupo | `rules.js` → `getGroup` |
| Captura de grupos sem liberdades | `rules.js` → `applyMove` |
| Suicídio (proibido, exceto com captura) | `rules.js` → `applyMove` |
| Ko simples | `game.js` → `playMove` (compara com o tabuleiro de duas jogadas atrás) |
| Passar / dois passes encerram a partida | `game.js` → `passTurn` |
| Desistência | `game.js` → `resign` |
| Pontuação por área + komi 6,5 | `rules.js` → `calculateScore` |

## Limitações conhecidas

- **Sem remoção de pedras mortas.** A pontuação por área conta todo território vazio
  cercado por uma única cor, mas não tenta identificar grupos "mortos" deixados no
  tabuleiro (isso exigiria um algoritmo de análise de vida/morte, fora do escopo do MVP 1).
  Para um resultado correto, os jogadores devem capturar grupos claramente mortos antes de
  encerrar a partida com dois passes.
- **Ko simples, não superko.** Apenas a posição imediatamente anterior é verificada;
  repetições cíclicas mais longas não são bloqueadas.
- Sem contas, ranking, matchmaking, chat ou relógio — fora do escopo deste MVP.

## Como rodar localmente

Não há build nem dependências. Basta servir os arquivos estaticamente, por exemplo:

```bash
npx serve .
# ou
python3 -m http.server 8000
```

Depois acesse `index.html` (landing page) ou `play.html` (jogo) no navegador.

## Como rodar os testes

Os testes usam o test runner nativo do Node (`node:test`), sem dependências externas:

```bash
npm test
```

## Próximos passos

Conforme o roadmap da landing page: contas e histórico de partidas, depois multiplayer em
tempo real, e por fim matchmaking, rating e recursos de comunidade.
