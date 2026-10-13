# Conscientiza Queimadas

Site educativo da Atividade Extensionista III de Engenharia de Software da UNINTER. A Home contém a navbar, o Hero, a seção **Impactos das queimadas** e o rodapé institucional. A página **Queimadas** aprofunda conceitos, causas, propagação e consequências, com o conteúdo integral aprovado no handoff.

## Executar

Com Node.js 22 ou superior:

```sh
npm ci
npm run dev
```

Abrir http://127.0.0.1:4173 ou http://127.0.0.1:4173/queimadas.html. O servidor é local e destinado ao desenvolvimento. A interface é estática; para hospedagem, servir `index.html`, `queimadas.html` e `src/`. Os caminhos relativos permitem publicar em subdiretórios, inclusive no GitHub Pages. Não é necessário build nem biblioteca em produção.

## Organização

- `index.html`: conteúdo semântico, links e ilustração SVG autoral. A marca Conscientiza Queimadas segue o nome do repositório.
- `queimadas.html`: introdução compacta, conteúdo educativo aprovado em coluna centralizada, sumário Nesta página com títulos completos, diagrama SVG autoral e rodapé reutilizado. As fontes permanecem na documentação até a página institucional existir.
- `src/queimadas.css`: composição editorial da página educativa, com títulos acima dos textos e dimensionamento fluido conforme largura e altura da janela. Corpo entre 16 e 20 px, título inicial entre 28 e 44 px, rótulos transparentes no triângulo e intervalos internos compactos, usando os tokens compartilhados e sem alterar o Hero ou os impactos.
- `src/styles.css`: tokens, layout mobile-first, navbar, enquadramentos da paisagem e animações acessíveis.
- `src/navigation.js`: sincronização acessível do menu nativo e gerenciamento de foco.
- `src/hero-interaction.js`: brilho decorativo, reação da chama próxima e deslocamento curto da fumaça com mouse no desktop.
- `src/smoke.svg`: duas plumas autorais com textura fixa de ruído, deformação e suavidade; carregadas somente no desktop com mouse e movimento permitido.
- `src/favicon.svg`: símbolo autoral da marca sobre fundo verde escuro, registrado como ícone da aba.
- `src/footer-background.webp`: fundo do rodapé preparado a partir do exemplo 3 fornecido pelo usuário, sem textos, ícones ou marca do mockup; arquivo raster local otimizado.
- `scripts/dev-server.mjs`: servidor local com módulos nativos do Node.
- `tests/hero.spec.js`: verificação funcional no Chromium.
- `tests/impacts.spec.js`: semântica, layout responsivo, rolagem natural, texto ampliado, contraste e movimento reduzido da transição e dos impactos.
- `tests/footer.spec.js`: conteúdo e semântica do rodapé, layout responsivo, texto ampliado, contraste e navegação por teclado.
- `tests/queimadas.spec.js`: conteúdo integral, integração das páginas, igualdade dos rodapés, leitura responsiva, contraste, teclado, movimento reduzido e publicação em subdiretório.
- `tests/fixtures/queimadas-aprovado.md`: cópia independente do conteúdo obrigatório do handoff para verificar fidelidade e sequência.
- `docs/hero-design.md`: decisões e escopo.
- `docs/recursos-e-licencas.md`: autoria e registro de recursos.
- `docs/verificacao-hero.md`: verificações realizadas e limites.
- `docs/verificacao-impactos.md`: decisões e verificações da transição para os impactos.
- `docs/verificacao-rodape.md`: estrutura, integração futura e verificações do rodapé.
- `docs/verificacao-queimadas.md`: decisões, verificações, limitações e integrações futuras da página Queimadas.

## Destinos futuros

Os destinos publicados usam caminhos relativos ao diretório de cada documento e funcionam sem JavaScript:

| Elemento | Destino preparado |
| --- | --- |
| Marca na Home | `./` |
| Início na navbar das duas páginas / marca em Queimadas | `./index.html` |
| Queimadas na navbar das duas páginas | `./queimadas.html` |
| Voltar ao topo no rodapé das duas páginas | `#inicio` |

**Dados** e **Prevenção** ainda não foram criadas: a navbar preserva os itens como textos com “em breve” e `aria-disabled="true"`, sem destinos fictícios. Quando estiverem publicadas, substituir os textos por links relativos reais. O convite **Saiba como prevenir →** preserva a redação e aparece como texto destacado, sem moldura ou interação de botão, acompanhado de “Página Prevenção em desenvolvimento.” Sua integração segue pendente. Nenhuma página secundária foi criada. A síntese dos impactos continua na Home, e seu CTA permanece apontando para `#impactos`.

No rodapé de cada documento, **Voltar ao topo** aponta para seu próprio `#inicio`: volta suavemente ao cabeçalho e transfere o foco sem recarregar ou trocar de página. A âncora funciona sem JavaScript; com movimento reduzido, a chegada é instantânea. O cabeçalho recebe `tabindex="-1"` para acolher o foco sem uma parada adicional de Tab. **Sobre o projeto**, **Fontes e créditos** e **Feedback** permanecem textos sem interação, acompanhados de “Conteúdos ainda não disponíveis.” Integrar somente quando existir destino real publicado. Por decisão do usuário, as dez referências de Queimadas ficam somente em docs/recursos-e-licencas.md, até existir a página institucional Fontes e créditos. O HTML do rodapé é idêntico nas duas páginas e usa o mesmo CSS e a mesma imagem.

O rodapé fica fora do conteúdo principal e reutiliza os tokens escuros, a tipografia e o container da Home. Seus quatro grupos mantêm a ordem identidade, navegação, institucional e contexto acadêmico: uma coluna abaixo de 600 px, duas entre 600 e 1199 px e quatro a partir de 1200 px. No desktop, o fundo raster preparado a partir do exemplo 3 cobre o rodapé, com a paisagem de entardecer à esquerda e a área escura para os grupos à direita. Em telas menores, a paisagem aparece abaixo dos grupos e as divisórias verticais são removidas. A logo vetorial original do cabeçalho acompanha o nome em duas linhas, sem a folha criada na primeira versão. Logo e imagem de fundo são decorativas, sem identificar espécies ou um local documentado. O link Voltar ao topo é sublinhado, tem área mínima de 44 × 44 px e foco visível. O rodapé funciona sem JavaScript e cresce livremente com texto ampliado. A licença da referência original do fundo ainda precisa de comprovação, conforme `docs/recursos-e-licencas.md`.

A seção de impactos fica abaixo da primeira tela. O Hero oferece o link textual sublinhado **Ver impactos das queimadas ↓**, que aponta para `#impactos` e usa a navegação nativa de âncora: ao ativá-lo, o navegador desloca a página e foca a seção. A navegação por fragmento usa `scroll-behavior: smooth` quando não há preferência por movimento reduzido; com `prefers-reduced-motion: reduce`, a chegada é instantânea. Funciona sem JavaScript e mantém a rolagem manual do navegador. A duração e a curva da suavização são definidas pelo navegador. A seta é decorativa e estática; o link tem área de toque de pelo menos 44 px de altura, tipografia fluida de 16–18 px e foco visível. A seção usa `tabindex="-1"` para receber foco pela âncora sem acrescentar uma parada de Tab.

Ao rolar naturalmente, o recorte estático de terreno prolonga a cor do chão sobre o fundo areia: seu `clip-path` tem altura fluida entre 16 e 40 px, com 1 px adicional para evitar frestas. A seção usa texto verde escuro, numeração terracota e divisórias finas. Os três eixos ficam em uma coluna abaixo de 960 px e em três colunas a partir dessa largura. Sua altura mínima é `100svh`, com fallback em `100vh`, para permitir que o destino comece no topo sem manter parte do Hero visível. A altura cresce livremente conforme o conteúdo, a orientação, o tamanho da tela e a ampliação do texto, sem cards ou imagens.

A introdução e os três eixos de Impactos permanecem visíveis e estáticos, sem animação de revelação. A rolagem suave pelos atalhos do Hero e do rodapé continua nativa, funciona sem JavaScript e respeita a preferência por movimento reduzido.

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
