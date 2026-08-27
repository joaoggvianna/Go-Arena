# Go Arena

Go Arena é um projeto de plataforma online para jogar, estudar e competir no jogo de Go. A proposta é começar por uma experiência simples e acessível e evoluir, por etapas, para multiplayer, matchmaking, ranking, histórico de partidas e recursos de estudo.

## Estado atual

A versão atual contém apenas a landing page estática do projeto. Ela apresenta a proposta do produto, o roadmap inicial e as diretrizes arquiteturais que devem orientar a evolução da aplicação.

## Objetivo do projeto

Construir uma plataforma de Go que seja fácil de entender para novos jogadores, mas que tenha espaço para recursos competitivos e sociais no futuro.

A evolução prevista inclui:

1. tabuleiro local 9×9;
2. regras essenciais do Go;
3. cadastro e autenticação de usuários;
4. partidas multiplayer em tempo real;
5. matchmaking, rating e rankings;
6. recursos de estudo, torneios, amigos e espectadores.

## Arquitetura

O desenvolvimento será incremental, evitando adicionar infraestrutura antes de ela ser necessária. A aplicação futura deverá separar claramente frontend, backend, persistência de dados e comunicação em tempo real.

A arquitetura será orientada pelos seis pilares do AWS Well-Architected Framework:

- Segurança
- Confiabilidade
- Excelência operacional
- Eficiência de desempenho
- Otimização de custos
- Sustentabilidade

## Segurança

O projeto pretende aplicar controles de identidade e acesso, princípio do menor privilégio, rastreabilidade por logs, proteção em múltiplas camadas e avaliação de riscos conforme novas funcionalidades forem adicionadas.

O backend deverá ser a fonte de verdade para o estado das partidas, validando jogadas, resultados e alterações de rating antes de persistir qualquer mudança.

## Tecnologias

### Versão atual

- HTML5
- CSS3
- Netlify

### Tecnologias previstas

A stack da aplicação ainda será definida conforme o MVP avançar. A prioridade será usar ferramentas que mantenham o projeto simples de desenvolver, testar, explicar e manter.

## Estrutura atual

```text
Go-Arena/
├── index.html
└── README.md
```

## Desenvolvimento

Para abrir a landing page localmente, basta clonar o repositório e abrir o arquivo `index.html` no navegador.

```bash
git clone https://github.com/joaoggvianna/Go-Arena.git
cd Go-Arena
```

## Status

Em desenvolvimento. A landing page representa a visão inicial do produto; as funcionalidades do jogo ainda serão implementadas de forma incremental.
