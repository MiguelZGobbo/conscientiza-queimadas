# Conscientiza Queimadas

Site educativo da Atividade Extensionista III de Engenharia de Software da UNINTER. A Home contém a navbar, o Hero e a seção **Impactos das queimadas**, disponível diretamente abaixo dele.

## Executar

Com Node.js 22 ou superior:

```sh
npm ci
npm run dev
```

Abrir http://127.0.0.1:4173. O servidor é local e destinado ao desenvolvimento. A interface é estática; para hospedagem, servir `index.html` e `src/`. Não é necessário build nem biblioteca em produção.

## Organização

- `index.html`: conteúdo semântico, links e ilustração SVG autoral. A marca Conscientiza Queimadas segue o nome do repositório.
- `src/styles.css`: tokens, layout mobile-first, navbar, enquadramentos da paisagem e animações acessíveis.
- `src/navigation.js`: sincronização acessível do menu nativo e gerenciamento de foco.
- `src/hero-interaction.js`: brilho decorativo, reação da chama próxima e deslocamento curto da fumaça com mouse no desktop.
- `src/smoke.svg`: duas plumas autorais com textura fixa de ruído, deformação e suavidade; carregadas somente no desktop com mouse e movimento permitido.
- `src/favicon.svg`: símbolo autoral da marca sobre fundo verde escuro, registrado como ícone da aba.
- `scripts/dev-server.mjs`: servidor local com módulos nativos do Node.
- `tests/hero.spec.js`: verificação funcional no Chromium.
- `tests/impacts.spec.js`: semântica, layout responsivo, rolagem natural, texto ampliado, contraste e movimento reduzido da transição e dos impactos.
- `docs/hero-design.md`: decisões e escopo.
- `docs/recursos-e-licencas.md`: autoria e registro de recursos.
- `docs/verificacao-hero.md`: verificações realizadas e limites.
- `docs/verificacao-impactos.md`: decisões e verificações da transição para os impactos.

## Destinos futuros

Os `href` do HTML são o ponto de configuração, funcionam sem JavaScript e são relativos ao diretório da Home:

| Elemento | Destino preparado |
| --- | --- |
| Marca / Início | `./` |
| Dados e impactos na navbar | `./dados-e-impactos` |
| Prevenção | `./prevencao` |
| Sobre | `./sobre` |

As três páginas futuras ainda não foram criadas. Seus links retornarão 404 no servidor local até que essas rotas sejam implementadas. A síntese dos impactos já está disponível na própria Home, sem interação adicional.

A seção de impactos fica abaixo da primeira tela. O Hero oferece o link textual sublinhado **Ver impactos das queimadas ↓**, que aponta para `#impactos` e usa a navegação nativa de âncora: ao ativá-lo, o navegador desloca a página e foca a seção. A navegação por fragmento usa `scroll-behavior: smooth` quando não há preferência por movimento reduzido; com `prefers-reduced-motion: reduce`, a chegada é instantânea. Funciona sem JavaScript e mantém a rolagem manual do navegador. A duração e a curva da suavização são definidas pelo navegador. A seta é decorativa e estática; o link tem área de toque de pelo menos 44 px de altura, tipografia fluida de 16–18 px e foco visível. A seção usa `tabindex="-1"` para receber foco pela âncora sem acrescentar uma parada de Tab.

Ao rolar naturalmente, o recorte estático de terreno prolonga a cor do chão sobre o fundo areia: seu `clip-path` tem altura fluida entre 16 e 40 px, com 1 px adicional para evitar frestas. A seção usa texto verde escuro, numeração terracota e divisórias finas. Os três eixos ficam em uma coluna abaixo de 960 px e em três colunas a partir dessa largura. Sua altura mínima é `100svh`, com fallback em `100vh`, para permitir que o destino comece no topo sem manter parte do Hero visível. A altura cresce livremente conforme o conteúdo, a orientação, o tamanho da tela e a ampliação do texto, sem cards, imagens ou animações nos elementos.

O Hero ocupa no mínimo `100svh` menos a navbar, com fallback em `vh`, e cresce naturalmente quando conteúdo ou zoom exigem. Tipografia e espaçamento consideram largura e altura da viewport, com limites em `rem` para leitura. No mobile, uma medida compartilhada controla a paisagem e seu espaço reservado abaixo do texto. A reserva continua válida em orientação horizontal com texto ampliado. Nos impactos, títulos, textos e espaçamentos crescem e diminuem conforme a largura e a altura úteis da janela, por CSS, sem JavaScript ou recarregamento. A introdução permanece abaixo do título em todos os tamanhos. No desktop, uma medida tipográfica compartilhada varia entre 14 e 22 px e mantém as proporções do corpo, títulos dos eixos, números e introdução; o título principal varia entre 28 e 72 px. No mobile, o corpo mantém 16 px. As medidas usam limites em `rem` para respeitar a ampliação do texto. A seção cresce naturalmente quando necessário, sem altura fixa ou conteúdo escondido.

O menu usa `popover`/`popovertarget` nativos do HTML: abre pelo botão, fecha com Esc ou clique fora mesmo com JavaScript desativado ou com falha de carregamento. Em navegadores sem suporte a `:popover-open`, o CSS expõe os links no fluxo como alternativa. O script melhora os rótulos, sincroniza `aria-expanded` e fecha o painel ao sair com Tab.

A marca e o título da aba usam **Conscientiza Queimadas**. O Hero mantém headline e subtítulo, com o atalho textual abaixo da descrição. A paisagem autoral tem labaredas de contornos variados e fumaça em camadas; somente no desktop com mouse e sem preferência de movimento reduzido há animações e resposta ao cursor. Ao sair da arte, rolar, redimensionar ou mudar a preferência, a interação é removida. Touch e telas estreitas exibem a cena estática. Não há dependências de produção nem recursos externos.

A fumaça usa um SVG local separado para que o navegador reutilize sua renderização durante o movimento. O filtro fica dentro desse arquivo e seus parâmetros permanecem fixos. A versão simples em SVG inline fica visível durante o carregamento, em caso de falha, sem JavaScript, em touch/mobile ou com movimento reduzido. A textura não é solicitada inicialmente nesses últimos três modos.

Duas camadas compartilham essa textura e sobem em ciclos de 18 e 22 segundos, com fases diferentes, ondulação lateral suave e expansão gradual. A transparência no início e no fim esconde o reinício. A resposta ao mouse fica no grupo externo, independente dos ciclos. Todas as animações continuam restritas a `transform` e `opacity`.

## Verificar

```sh
npx playwright install chromium
npm test
npm run check
```

O Playwright é dependência apenas de desenvolvimento. Os testes sobem o servidor automaticamente quando a porta está disponível. `npm run test:ui` abre a interface de testes.
