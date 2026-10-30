# Coluna editorial ampla com títulos acima do conteúdo

Data: 29/10/2026. Trabalho local na main, sem commit, push ou deploy.

## Correção de leitura e aproveitamento da largura

A disposição com títulos laterais foi rejeitada por interromper a leitura e deixar uma faixa vazia ao lado dos textos longos. Esta etapa substitui essa disposição por uma coluna única mais ampla, preservando o acabamento de espaçamento da etapa anterior.

- Títulos voltaram a ficar acima do corpo em Queimadas, Prevenção, Sobre e Fontes em todas as larguras. Foram removidos a consulta de 75 rem e o container usado exclusivamente por ela.
- Coluna editorial, corpo, sumários, aberturas textuais e encerramentos compartilham o limite de 80 ch, centralizado e limitado pela viewport com as margens responsivas existentes. As aberturas ilustradas conservam sua composição própria.
- Em 1440×900, o corpo passou de 607,0 para 714,1 px. Em 1920×1080, passou de 629,3 para 862,5 px. Tamanho da fonte, line-height e fórmulas por largura e altura foram preservados.
- Em Dados, somente a medida editorial foi ampliada. O mapa ganhou um limite próprio de 68 ch para reproduzir sua dimensão anterior: sem esse limite, em 768×1024 ele aumentaria de 586,52 para 640 px por acompanhar a coluna. Gráficos e seletor mantêm suas dimensões independentes.
- Hero, Impactos, navbar, rodapé, conteúdo, links, SVG, dados, JavaScript, dependências e configuração de publicação não foram alterados nesta correção. Permanecem os espaçamentos 20% menores e o agrupamento entre subtítulos e listas já aprovados.

## Comparações visuais

Antes representa a versão com títulos laterais; depois representa a coluna única de 80 ch. Cada par usa a mesma viewport, escala e coordenadas de recorte.

- [Prevenção —1920×1080](evidencias-refinamento-adaptativo/prevencao-coluna-ampla.png).
- [Queimadas —1440×900](evidencias-refinamento-adaptativo/queimadas-coluna-ampla.png).
- [Fontes —375×812](evidencias-refinamento-adaptativo/fontes-coluna-ampla-mobile.png).

As 108 capturas completas desta correção e os resultados ficam em .auditoria-local/coluna-ampla/antes/ e depois/. O relatório anterior foi preservado em .auditoria-local/coluna-ampla/relatorio-anterior.md; as evidências da primeira etapa permanecem disponíveis.

## Verificação final

| Verificação | Resultado |
| --- | --- |
| npm test | 311 testes aprovados; Chromium e regressões móveis WebKit |
| npm run check | Sintaxe,21 testes Python e 9 testes Node aprovados |
| npm run test:publicacao | 6 testes aprovados |
| Auditoria geométrica | 162 cenários por fase, sem rolagem horizontal, recorte visual ou elementos fora da viewport |
| Revisão independente | Nenhum apontamento na correção |

A matriz percorreu as seis páginas em 320×568,375×812,430×932,768×1024,1024×768,1440×900,1920×1080,1920×500 e 844×390, nos modos normal, fonte raiz 200% e zoom CSS 200%. Os testes verificam título acima do corpo, alinhamento, centralização, medida 80 ch, ampliação de texto e redimensionamento sem recarregar. A mudança de geometria foi testada primeiro contra a implementação anterior e falhou em cinco verificações; o teste de independência do mapa também falhou antes de sua correção.

A suíte existente passou com conteúdo aprovado, menu, foco, teclado, âncoras, histórico, movimento reduzido, ausência de JavaScript, contraste, axe, seleção das 27 UFs e gráficos. Não houve ensaio em hardware físico, leitor de tela real ou zoom nativo do navegador; a ampliação efetivamente verificada usa fonte raiz e zoom CSS, além do reflow 320 px. A tentativa de zoom nativo da etapa anterior não foi repetida, pois o executável completo do Chromium não havia iniciado nesse ambiente.

## Desempenho comparado

Foram comparadas 120 visitas de referência da versão anterior com 120 visitas finais: seis páginas, perfis móvel 4G/CPU 4× e desktop, condições fria/aquecida e cinco amostras por combinação. A referência foi reutilizada de `.auditoria-local/refinamento-visual/performance-depois/medicoes.json`; não foi necessário repetir a medição anterior.

| FCP — mediana das medianas das seis páginas, cache frio | Antes | Depois |
| --- | ---: | ---: |
| Móvel 4G / CPU 4× | 698 ms | 692 ms |
| Desktop | 56 ms | 56 ms |

Não houve novas requisições, erros registrados ou overflow nas visitas finais. O CLS mediano permaneceu zero. Os recursos iniciais medidos ficaram aproximadamente 0,33 kB menores nas quatro páginas editoriais, sem mudança na Home; Dados acrescentou 98 bytes de CSS para preservar a medida independente do mapa.

São medições locais, sem INP de campo ou hardware físico. O servidor usa `Cache-Control: no-store`: a condição aquecida executa uma visita prévia, sem prometer cache HTTP efetivo. Não se executaram outros ensaios de navegador simultaneamente à medição. Os dados e as 24 combinações comparadas ficam em `.auditoria-local/coluna-ampla/performance-depois/medicoes.json` e `comparacao-performance.json`.

Comando executado após a suíte completa:

```powershell
npm run medir:site -- --base-url http://127.0.0.1:4173/ --phase depois --output .auditoria-local/coluna-ampla/performance-depois --runs 5 --profiles android-4g,desktop --scenarios direct
```

## Arquivos desta correção

- src/queimadas.css: coluna/corpo 80 ch e retirada da disposição lateral.
- src/paginas.css: limite dos parágrafos de abertura 80 ch.
- src/dados.css: largura editorial 80 ch e limite independente do mapa.
- tests/layout-adaptativo.spec.js: coluna única, centralização, aberturas/sumário/encerramento e independência das visualizações.
- tests/queimadas.spec.js: título sempre acima do corpo e alinhamento da coluna.
- Este relatório e três novas comparações em docs/evidencias-refinamento-adaptativo/.

As alterações anteriores em src/styles.css e tests/sobre.spec.js permanecem no checkout, sem modificações adicionais nesta etapa.

## Fundamentação

Os limites de leitura e a adaptação respeitam os princípios de [tipografia responsiva do web.dev](https://web.dev/learn/design/typography) e [layout do GOV.UK Design System](https://design-system.service.gov.uk/styles/layout/), adotando 80 ch como limite aprovado pelo usuário; ch é uma medida tipográfica aproximada, não uma contagem literal de caracteres. Ampliação e reflow usam como referência os critérios [1.4.4](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) e [1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) da WCAG 2.2. As verificações automatizadas não constituem certificação integral de acessibilidade.
