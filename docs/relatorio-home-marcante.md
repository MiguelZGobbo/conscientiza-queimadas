# Home com uma abertura mais marcante

Data: 29/10/2026. Implementação local na `main`, sem commit, push ou deploy.

## Mensagem e composição

A abertura passou a enfatizar a permanência dos impactos, com a frase aprovada pelo responsável pelo projeto:

- **Título:** “O fogo passa. As marcas ficam.” A segunda frase inteira usa o dourado existente.
- **Subtítulo:** “Na natureza, na saúde e na vida das comunidades, os efeitos continuam depois das chamas.”
- **Chamada:** “Descubra os impactos das queimadas ↓”, mantendo o destino `#impactos`, a seta decorativa e a navegação nativa com foco na seção.

O título continua sendo um único `h1`, com quebras automáticas, sem `br` ou bloqueio de quebra de palavras/frases. A regra desktop passou de `clamp(3rem, min(5.7vw, 10svh), 5.5rem)` para `clamp(3rem, min(6.2vw, 10svh), 6rem)`. A raiz padrão de 16 px permite chegar a 96 px, preservando a adaptação por largura e altura e o crescimento com texto ampliado.

| Viewport | Título antes | Título depois |
| --- | ---: | ---: |
| 375 × 812 | 32 px | 32 px |
| 768 × 1024 | 64,51 px | 64,51 px |
| 1440 × 900 | 82,08 px | 89,28 px |
| 1920 × 1080 | 88 px | 96 px |
| 1920 × 500 | 40 px | 40 px |

A comparação com os snapshots desta etapa confirmou exatamente três substituições textuais em `index.html` e uma regra de tamanho de fonte em `src/styles.css`. A estrutura, a arte, as animações, a navbar, os impactos, o rodapé, as páginas internas, os scripts, os dados, as dependências, a descrição de SEO e a configuração de publicação permanecem preservados nesta atualização.

## Comparação visual

Os pares usam a mesma viewport, escala e enquadramento, com movimento reduzido para reproduzir a cena:

- [Desktop — 1440 × 900](evidencias-refinamento-adaptativo/home-marcante-desktop.png).
- [Celular — 375 × 812](evidencias-refinamento-adaptativo/home-marcante-mobile.png).
- [Janela baixa — 1920 × 500](evidencias-refinamento-adaptativo/home-marcante-janela-baixa.png).

Capturas completas, snapshots anteriores e resultados estão em `.auditoria-local/home-marcante/`. As alterações anteriores da coluna editorial de 80ch e do acabamento visual foram preservadas.

## Verificação

| Verificação | Resultado |
| --- | --- |
| Testes direcionados de Hero, arte, impactos e rodapé | 103 aprovados |
| `npm test` | 312 aprovados, incluindo Chromium e regressões móveis WebKit |
| `npm run check` | Sintaxe, 21 testes Python e 9 testes Node aprovados |
| `npm run test:publicacao` | 6 aprovados |
| Auditoria geométrica da Home | 27 cenários por fase, sem overflow horizontal, recorte visual ou elementos fora da viewport |
| Revisão independente | Nenhum apontamento no escopo aprovado |

Os dois testes de nova abertura/escala foram observados falhando antes da implementação. O teste novo verifica tamanhos em seis viewports e o redimensionamento sem recarregar. As expectativas do nome acessível da chamada foram atualizadas nos testes existentes de Home, impactos e rodapé, preservando as verificações de interação.

A auditoria usa 320×568, 375×812, 430×932, 768×1024, 1024×768, 1440×900, 1920×1080, 1920×500 e 844×390, com fonte normal, raiz a 200% e zoom CSS a 200%. A suíte também cobre contraste do texto sobre a arte renderizada, foco, teclado, chegada e foco da âncora, movimento reduzido, ausência/falha de JavaScript, animações e orçamento de recursos. Não houve verificação de zoom nativo, hardware físico ou leitores de tela reais nesta etapa.

## Carregamento da Home

Foram comparadas 20 visitas de referência com 20 visitas finais: perfis móvel 4G/CPU 4× e desktop, condições fria/aquecida e cinco amostras por combinação. A referência foi reutilizada da última versão validada em `.auditoria-local/coluna-ampla/performance-depois/medicoes.json`, filtrando somente a Home.

| FCP mediano, cache frio | Antes | Depois |
| --- | ---: | ---: |
| Móvel 4G / CPU 4× | 656 ms | 688 ms |
| Desktop | 72 ms | 72 ms |

A mediana móvel variou 32 ms, aproximadamente 4,9%; a desktop permaneceu igual. Não houve novas requisições, erros registrados ou overflow. O CLS mediano permaneceu zero e os recursos iniciais ficaram 35 bytes menores. São medições locais de laboratório, sem medição de retenção de visitantes ou INP de campo.

Foi usada uma cópia local do medidor existente, alterando apenas sua lista de páginas para a Home e preservando perfis, espera, limitação de rede/CPU e condições de cache. O script rastreado de medição não foi modificado. Não houve outros ensaios de navegador durante a medição. O servidor usa `Cache-Control: no-store`; a condição aquecida faz uma visita prévia, sem prometer cache HTTP efetivo.

Dados: `.auditoria-local/home-marcante/performance-depois/medicoes.json` e `comparacao-performance.json`.

## Arquivos desta etapa

- `index.html` e `src/styles.css`: textos do Hero e escala desktop.
- `tests/hero.spec.js`: nova abertura, destaque e escala; `tests/impacts.spec.js` e `tests/footer.spec.js`: novo nome da chamada.
- `README.md`, `docs/verificacao-hero.md` e `docs/verificacao-impactos.md`: documentação atualizada, com registros históricos preservados.
- Este relatório e três comparações visuais em `docs/evidencias-refinamento-adaptativo/`.
