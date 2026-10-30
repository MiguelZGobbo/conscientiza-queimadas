# Home editorial — prévia B implementada

Data: 29/10/2026. Trabalho local na `main`, sem commit, push ou deploy.

## Composição e fonte

A Home reproduz a prévia B escolhida: “O fogo passa.” menor na fonte do sistema; “As marcas ficam.” em Fraunces 600 dourada, começando abaixo. Continua existindo um único `h1`, com quebras naturais e possibilidade de crescimento. O complemento aprovado ganhou conteúdo, largura e presença; a chamada e seu destino `#impactos` foram preservados.

> As queimadas podem destruir habitats, comprometer a qualidade do ar e afetar a saúde e a vida das comunidades. Explore os impactos que vão além das chamas e entenda a importância de prevenir.

| Viewport | Primeira frase | Fraunces | Complemento |
| --- | ---: | ---: | ---: |
| 375 × 812 | 24 px | 44 px | 16 px |
| 1440 × 900 | 43,2 px | 86,4 px | 20 px |
| 1920 × 1080 | 48 px | 88 px | 20 px |
| 1920 × 500 | 25 px | 55 px | 16 px |

Todas as escalas combinam largura/altura e limites em `rem`. As regras tipográficas anteriores conflitantes foram consolidadas. Reservas de espaço da paisagem, margens específicas de janelas baixas, arte, animações, navbar, impactos e rodapé permanecem preservados. Quando o texto maior exige, o Hero cresce além da primeira tela, sem reduzir arbitrariamente a fonte ou esconder conteúdo.

A fonte local é Fraunces, instância CDN v38, peso 600, tamanho óptico 144, subconjunto latino WOFF2 de **17.172 bytes**. O arquivo tem a mesma medida de texto da fonte da prévia aprovada. Usa preload exclusivo da Home, `font-display: optional` e fallback Georgia; nenhuma fonte é solicitada ao Google durante a visita. O teste com fonte atrasada confirmou composição estável após exibir o fallback.

Fonte, licença integral e hashes estão registrados em [recursos-e-licencas.md](recursos-e-licencas.md). Os créditos públicos de Fontes foram atualizados. A lista explícita de publicação passou de 29 para 31 arquivos, acrescentando somente WOFF2 e licença. O servidor local entrega `font/woff2` sem charset e a licença como texto UTF-8; não recomprime WOFF2. A CSP não foi modificada.

## Evidências visuais

- [Resultado final — desktop](evidencias-refinamento-adaptativo/home-editorial-final.png).
- [Antes/depois — desktop 1440 × 900](evidencias-refinamento-adaptativo/home-editorial-desktop.png).
- [Antes/depois — celular 375 × 812](evidencias-refinamento-adaptativo/home-editorial-mobile.png).
- [Antes/depois — janela baixa 1920 × 500](evidencias-refinamento-adaptativo/home-editorial-janela-baixa.png).

Capturas completas, snapshots anteriores, diagnóstico e medições ficam em `.auditoria-local/home-editorial/`. As alterações anteriores da coluna de leitura de 80ch e do acabamento visual foram preservadas.

## Verificação

| Verificação | Resultado |
| --- | --- |
| Testes direcionados finais de Hero/arte/fonte | 43 aprovados |
| `npm test` | 317 aprovados, incluindo Chromium e regressões móveis WebKit |
| `npm run check` | Sintaxe, 21 testes Python e 9 testes Node aprovados |
| `npm run test:publicacao` | 6 aprovados |
| Auditoria da Home | 27 cenários por fase, sem overflow horizontal, recorte visual ou elementos fora da viewport |
| Revisão independente | Sem defeitos de produção; ajuste menor na cobertura de contraste corrigido e confirmado |

Novas verificações comprovam o uso real da Fraunces no Chromium, carregamento somente na Home, separação das frases, dimensões sem recarregar, fonte lenta/bloqueada, ausência de saltos de composição e manutenção da chamada por teclado. A fonte e a licença foram exercitadas na distribuição real em `/` e `/projeto/`, com MIME, bytes, CSP e ausência de solicitações externas conferidos. Os testes de nova hierarquia e fonte real falharam antes da implementação; o manifesto também falhou enquanto ainda continha somente os 29 arquivos anteriores.

A auditoria usa 320×568, 375×812, 430×932, 768×1024, 1024×768, 1440×900, 1920×1080, 1920×500 e 844×390, com fonte normal, raiz a 200% e zoom CSS a 200%. A suíte cobre ainda contraste, teclado, foco, âncora, movimento reduzido, ausência/falha de JavaScript, animações, mapa e gráficos. Não houve ensaio em hardware físico, leitor de tela real ou zoom nativo nesta etapa.

O teste de contraste passou a medir as linhas efetivas de cada nó de texto, usando sua própria cor, sem amostrar a região vazia de um elemento em bloco sobre a ilustração. Elementos sem retângulos de texto visíveis são excluídos e cada resultado precisa ser finito. O destaque dourado e múltiplos textos precisam ter amostras; o mínimo de **4,5:1** foi mantido. A correção final dessa cobertura teve seu próprio teste falhando antes do ajuste e passando depois, após a suíte completa.

O orçamento anterior de 40.000 bytes para o restante da Home foi preservado. A nova entrega tipográfica possui limite separado de 18.000 bytes: WOFF2, declaração `@font-face` e preload somam 17.457 bytes. Declarações redundantes foram removidas e a fonte do destaque consolidada em shorthand, sem mudar a composição aprovada. Orçamentos próprios do rodapé e de sua imagem permanecem inalterados.

## Carregamento antes/depois

Comparação de 20 visitas de referência com 20 finais: Home, móvel 4G/CPU 4× e desktop, condições fria/aquecida e cinco amostras por combinação. A referência foi reutilizada da última abertura validada em `.auditoria-local/home-marcante/performance-depois/medicoes.json`. Foi mantido o mesmo medidor, em cópia local restrita à Home; não houve outros ensaios de navegador simultâneos.

| Mediana em cache frio | Antes | Depois |
| --- | ---: | ---: |
| FCP/LCP móvel 4G / CPU 4× | 688 ms | 804 ms |
| FCP/LCP desktop | 72 ms | 100 ms |

O recurso tipográfico acrescentou uma requisição e 17.780 bytes aos recursos iniciais medidos, incluindo alterações de HTML/CSS. Não houve erros registrados ou overflow; o CLS mediano permaneceu zero. A primeira exibição móvel aumentou 116 ms e a desktop, 28 ms. Esses são resultados locais de laboratório, sem avaliação de retenção de visitantes ou INP de campo. O servidor usa `Cache-Control: no-store`; a condição aquecida visita previamente a página, sem prometer cache HTTP efetivo.

Dados em `.auditoria-local/home-editorial/performance-depois/medicoes.json` e `comparacao-performance.json`.

## Arquivos desta etapa

- `index.html` e `src/styles.css`: preload, complemento e hierarquia editorial.
- `src/fonts/fraunces-v38-latin-600.woff2` e `src/fonts/OFL-Fraunces.txt`: fonte e licença.
- `scripts/preparar-publicacao.mjs` e `scripts/dev-server.mjs`: lista explícita e entrega dos recursos.
- `fontes.html` e `docs/recursos-e-licencas.md`: créditos e procedência.
- `tests/home-editorial.spec.js`, `tests/hero.spec.js`, `tests/hero-arte.spec.js` e `tests/publicacao.node.mjs`: verificação de fonte, tipografia, contraste, orçamento e distribuição.
- `README.md`, `docs/verificacao-hero.md`, este relatório e quatro novas imagens comparativas/finais.

Scripts de interação, dados oficiais, desenhos, configuração de segurança e layout das páginas internas não foram modificados nesta etapa.
