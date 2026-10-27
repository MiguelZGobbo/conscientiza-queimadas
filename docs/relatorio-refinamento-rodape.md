# Refinamento visual do rodapé — 27/10/2026

## Objetivo e linha de base

O proprietário confirmou que a revisão publicada anterior abre e navega de forma praticamente instantânea em iOS e Android reais. Essa aprovação foi preservada como referência; esta rodada não reabre otimização geral de desempenho. A candidata atual foi validada por automação, sem novo teste físico nesta bancada.

Base `99a75da`, branch `main`, checkout inicialmente limpo. As duas imagens citadas no handoff não acompanharam o anexo (somente o texto); foram produzidas capturas próprias em viewports CSS 1366×768 e 1920×1080, zoom 100%, DPR 1, nos motores Chromium e WebKit. O CSS publicado correspondia exatamente ao local no início da inspeção.

## Causa e solução

Os maiores fatores da altura eram: padding superior de 64 px; gaps/copyright que somavam mais espaço vertical; e a reserva de 20% da coluna para arte, reduzindo a largura útil dos grupos e levando o aviso do Forms a três linhas. As divisórias estendidas pela altura do grupo mais alto também reforçavam a aparência de painel grande.

A mudança mantém os tamanhos de texto. O topo passa a aproximadamente 31–32 px, os gaps a 15–20 px nas referências e o copyright usa padding menor. A área de texto fica mais larga: a reserva lateral cai para 11,25%, a coluna institucional ganha espaço e seu aviso pode usar até 32ch de largura. Os grupos alinham pelo topo, com divisórias limitadas ao próprio conteúdo.

A mesma pintura permanece à esquerda, enquadrada em 32vw (limites de 320–640 px) e com a dissolução escura concluída antes da leitura. Ela não determina a altura do conteúdo. No móvel, a faixa decorativa passa de 128–180 para 88–120 px, com recorte vertical centralizado para preservar a região entre sol, montanhas e mata também no tablet; conteúdo e áreas de toque permanecem inteiros. As combinações de uma/duas/quatro colunas, o reflow por largura da identidade e o fallback com texto 200% foram preservados.

Não foram usados escala global, zoom do componente, altura fixa para texto, recorte de texto, nova imagem, fonte externa ou biblioteca. Foi descartado reduzir letras ou remover a arte. Também foi descartada uma nova faixa ilustrada independente no desktop: conservar o posicionamento lateral existente oferece continuidade de identidade com menos mudança.

## Alturas medidas

As alturas são `getBoundingClientRect().height`, não estimativas por screenshot. Os sete documentos têm o mesmo componente e a mesma altura em cada referência. Os testes de proporção e de enquadramento do miolo da pintura no tablet falharam antes da correção nos dois motores; o teste de redução mínima de 20% só se aplica ao texto em 100%. Texto ampliado mantém altura natural, sem limite máximo.

| Motor | Viewport CSS | Antes (px) | Depois (px) | Redução | Parágrafos |
| --- | --- | --- | --- | --- | --- |
| chromium | 1366×768 | 399.47 | 304.70 | 23.7% | 15px (mantido) |
| chromium | 1920×1080 | 463.00 | 344.12 | 25.7% | 18.75px (mantido) |
| webkit | 1366×768 | 399.47 | 304.70 | 23.7% | 15px (mantido) |
| webkit | 1920×1080 | 463.00 | 344.12 | 25.7% | 18.75px (mantido) |

Links mantêm pelo menos 44 px de altura. Corpo: 15 px em 1366×768 e 18,75 px em 1920×1080; hierarquia, cores e tipografia anteriores preservadas. A imagem continua WebP/lazy com as variantes existentes e a seleção conservadora de resolução já validada.

## Espaço bege e conteúdo anterior

A seção anterior foi medida separadamente. Nas páginas de leitura, o intervalo final corresponde ao padding editorial: cerca de 69–80 px nas referências, com pequenas diferenças por margem/conteúdo. Na Home, o excedente decorre do mínimo de `100svh` de Impactos, uma decisão intencional registrada em `docs/verificacao-impactos.md` para manter a seção como destino de rolagem. Não foi demonstrado padding acidental do rodapé nessa área.

Nenhuma regra acima do footer foi alterada. Largura/altura do `main` e da última seção, e o intervalo entre o último conteúdo e o footer, permaneceram iguais nas 28 comparações (sete documentos × duas viewports × dois motores). A posição do conteúdo na screenshot muda porque o documento termina mais cedo e a captura usa o fim da página como âncora.

## Verificações e limites

- `npm run check`: 21 testes Python e nove Node aprovados.
- `npm test -- --reporter=line`: **303/303 aprovados**, incluindo os dois motores, contraste nas referências e navegação touch entre as seis páginas.
- `npm run preparar:publicacao`: **29 arquivos, 1.117.149 bytes**; 34 bytes a mais que a distribuição inicial desta rodada.
- `npm run test:publicacao`: **6/6 aprovados**, com CSP, 404 e bloqueio de iframe preservados pela suíte.

Guarda limitada de carregamento: HTTP local sem compressão e `no-store`, 390×844, DPR 3, três contextos novos por página/fase/motor; Chromium com CPU 4×, latência 150 ms, download 200.000 B/s e upload 93.750 B/s; WebKit sem limitação artificial. Node 24.19.0, Playwright 1.63.0, Chromium 153.0.8010.12 e WebKit 26.6. Sem outra suíte/ensaio de navegador concorrente. Não é nova auditoria geral nem medição de campo.

| Motor / perfil | Página | LCP antes: mediana [mín–máx] ms | LCP depois: mediana [mín–máx] ms |
| --- | --- | --- | --- |
| chromium | index | 688 [672–696] | 684 [676–708] |
| chromium | dados | 1032 [1016–1036] | 1028 [1016–1032] |
| webkit | index | 63 [62–68] | 62 [61–66] |
| webkit | dados | 52 [49–52] | 41 [40–51] |

São 24 cargas sem falhas. Os conjuntos de recursos concluídos observados nas três amostras de cada fase são iguais. Resource Timing foi fotografado após load + 300 ms e não é usado aqui como contador exaustivo de requests pendentes. As diferenças pequenas de LCP têm faixas sobrepostas e não demonstram regressão perceptível. Nenhum JavaScript, imagem ou recurso de rede foi alterado; o custo bruto adicional é de 34 bytes de CSS.

A matriz cobre 320, 360, 375, 390, 414, 599, 600, 768, 1024, 1199, 1200, 1280, 1366, 1440 e 1920 px, além de landscape e janela baixa, com texto 100/200%, conteúdo longo e zoom CSS. Os testes conferem cortes, overflow, grupos/links, foco, contraste, movimento reduzido e ausência de JavaScript. A comparação desktop inclui Home, Queimadas, Dados, Prevenção, Sobre, Fontes e 404.

A aprovação física anterior de rapidez veio do proprietário. Esta rodada usa Chromium/WebKit simulados e deixa o aceite físico do novo enquadramento para o proprietário: verificar rodapé, orientação, texto/zoom 200%, foco e áreas seguras em iPhone/Safari e Android/Chrome. Não se apresenta emulação como teste físico.

## Evidências e estado

Área local ignorada: `.auditoria-local/footer-compact-20261027/`, sem apagar evidências anteriores. `antes/` e `depois/` contêm capturas do fim da página e detalhes do footer dos sete documentos, além de `layout.json` com grupos, arte, links, copyright e box model. Os registros de testes e da guarda de carregamento ficam na mesma área.

Capturas representativas:

- 1366 px: [antes](../.auditoria-local/footer-compact-20261027/antes/chromium-sobre-1366-fim.png) · [depois](../.auditoria-local/footer-compact-20261027/depois/chromium-sobre-1366-fim.png).
- 1920 px: [antes](../.auditoria-local/footer-compact-20261027/antes/chromium-sobre-1920-footer.png) · [depois](../.auditoria-local/footer-compact-20261027/depois/chromium-sobre-1920-footer.png).
- Tablet/WebKit 768 px: [enquadramento final](../.auditoria-local/footer-compact-20261027/testes-finais/mobile-regressoes-rodap%C3%A9-f-02d95-rienta%C3%A7%C3%B5es-e-texto-ampliado-webkit-mobile/footer-768-100%25.png).

Arquivos alterados: `src/styles.css`, `tests/footer.spec.js`, `tests/mobile-regressoes.spec.js` e este relatório. Sem alteração de rotas, transições touch, toque dos gráficos, mapa, conteúdo científico, imagens, build, cache ou CSP.

Registro histórico da entrega local, anterior à autorização posterior de commits e push:

Branch `main`, HEAD `99a75da`. **Sem commit, push ou deploy nesta rodada.** A candidata é local e revisável.

A revisão independente somente leitura não apontou findings nas amostras examinadas. A inspeção adicional do tablet levou ao ajuste vertical da faixa, coberto pela regressão de enquadramento e pela repetição integral da suíte. `git diff --check` limpo; manifesto e fontes de `dist/` conferidos. Dos 29 arquivos publicáveis, 28 são idênticos à base; somente `src/styles.css` mudou.
