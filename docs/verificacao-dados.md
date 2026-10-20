# Página Dados — implementação e verificação

Data: 19/10/2026. Referência editorial: handoff “Implementação da página Dados” fornecido pelo usuário e plano aprovado nesta conversa. Implementação em `feat/pagina-dados`, sem publicação externa.

## Revisão atual — textos finais e contornos uniformes — 20/10/2026

Trabalho realizado na `main`, conforme o plano aprovado. Encerrada a pendência editorial da seção **Entenda os dados**: quatro perguntas, respostas de dois parágrafos curtos e uma nota sobre a edição estática. São 319 palavras incluindo títulos e nota. O texto distingue território atingido uma vez em 1985–2025 de soma mensal estadual em out/2025–set/2026, contagem de detecções de quantidade de incêndios, média de área dos anos civis 2019–2024 de média dos acumulados mensais nos 23 anos de 2003–2025. Mantida a definição de hectare; retirados os cinco períodos outubro–setembro e a média antiga. As lacunas de detecção são referidas sem repetir as datas já apresentadas junto ao gráfico. Nenhum total dos gráficos foi repetido.

### Fontes e contornos

- A revisão editorial usa os mesmos indicadores e bases, conferidos com a [Tabela 3 do RAF2025](https://raf.ia.mapbiomas.org/raf2025/publication-web-resources/html/publication-20.html), o [Monitor do Fogo](https://brasil.mapbiomas.org/iniciativas-e-produtos/fogo/monitor-do-fogo/) e a [FAQ do INPE](https://data.inpe.br/queimadas/faq/). Sem atualização dos dados, novos períodos ou novas interpretações causais.
- A borda irregular era causada pela ordem de pintura do SVG: estados posteriores recobriam parte do traço selecionado nas divisas. Duas camadas decorativas no fim do mapa reutilizam somente o `d` do território: seleção contínua de **2 px** e foco tracejado de **4 px**, ambas sem preenchimento, com `non-scaling-stroke` e sem receber eventos. Não há nova geometria, nome acessível ou opção interativa.
- Seleção, troca e limpeza atualizam o contorno selecionado; entrada e saída do foco atualizam o tracejado. O contorno de foco só aparece quando o território tem `:focus-visible`, inclusive ao alternar mouse e teclado. Os 27 caminhos originais permanecem na ordem alfabética, sem mover nós no DOM.
- Um teste detectou uma parada extra de Tab no SVG após adicionar os eventos de foco. O contêiner agora tem `tabindex="-1"` e `focusable="false"`; as 27 UFs conservam suas entradas, e as camadas decorativas ficam fora da árvore acessível. O gerador do mapa mantém essa estrutura.

### Verificação e reprodução

- Os cinco testes novos falharam antes da implementação, por textos antigos e ausência das camadas. Após a correção, passaram conteúdo, limites de dois parágrafos, sincronização dos contornos nas 27 UFs, seleção e foco independentes, Tab/Enter/Espaço, dimensões e alternativa sem JavaScript. A expectativa antiga que exigia a metodologia obsoleta foi substituída pela referência civil correta.
- Reprodução usando `BR_UF_2025.shp` original já disponível localmente: mapa e painéis produziram o mesmo HTML, preservando a metodologia. SHA-256 do HTML: **aa17dbd1650bbb90bc01d9c76caba5cfe8a36b26c826fd0c4ed2a335bfd4b132**. SHA-256 das 27 geometrias: **cd601d31626eb6c6bbc9807e46964aa935692f375289cbf0a606d8a8ff18caca**, igual à referência anterior. As três bases não foram alteradas.
- Capturas em `%TEMP%/contorno-final-*.png` e `%TEMP%/metodologia-final-*.png`: Mato Grosso, Distrito Federal, Espírito Santo e Acre; seleção de MT simultânea ao foco de AC; metodologia em 390 e 1440 px e texto a 200%. A matriz automatizada inclui 320, 390, 768, 960, 1440 e 1920 px, janela de 420 px de altura e texto ampliado.
- **`npm test -- --reporter=dot`: 165 testes aprovados em 1,4 min**, incluindo axe, cliques nas 27 geometrias, seleção sincronizada, teclado/toque, matriz responsiva, dados indisponíveis, zeros, alternativa sem JavaScript e igualdade dos rodapés. **`npm run check` aprovado**, incluindo os **21 testes Python**; os erros impressos nos cenários de importação inválida são esperados e verificados. A primeira suíte encontrou somente a expectativa editorial antiga; após atualizá-la, a suíte completa passou. Conferência de espaços com `git diff --check` considerando CRLF como fim de linha: sem erros.

Mapa, seletor, gráficos, períodos, rodapé, Home e Queimadas mantêm seus dados e comportamento, com exceção da correção dos contornos descrita. Não houve teste com leitor de tela real ou aparelho físico; não se declara conformidade integral. A autorização da imagem do rodapé e as demais condições de uso continuam pendentes conforme os registros. Nenhuma publicação do site nesta revisão. Commit e push foram autorizados posteriormente pelo usuário para a `main`, com mensagem em inglês.

## Conferência para commit e push

- Suíte completa reexecutada após a correção da comparação estadual: **160 testes Playwright aprovados em 1,5 min**. `npm run check` aprovado, incluindo **21 testes Python**. Foram preservadas as mensagens esperadas dos cenários de importação inválida.
- Preparação do commit removeu espaços em linhas vazias do HTML e de um teste, além da linha vazia excedente no final da base de área. Importador e gerador preservam essa formatação; valores e conteúdo não foram alterados. Sintaxe do gerador novamente conferida e duas execuções produziram o mesmo HTML.
- SHA-256 após a limpeza de formatação: `dados.html` **b716dfab9699cba7ae1ef88632ff689a624accb7ee8251779e0283f3c7116b9f**; `src/dados-base.js` **6b3b87173d6ec866971f460d0877b26bc7d72dfc124bf8e105abe58a4a09a1e1**. Os hashes anteriores abaixo identificam as entregas antes dessa limpeza. As outras duas bases não mudaram.
- Conferência do conteúdo preparado no índice com `git diff --cached --check`, aceitando CRLF como fim de linha no Windows (`core.whitespace=blank-at-eol,blank-at-eof,space-before-tab,cr-at-eol`): sem erros após a limpeza.



## Revisão anterior — hover prioritário e destaque dos biomas

**Correção complementar — comparação estadual de área:** o realce dos biomas agora é compartilhado com a comparação estadual: sem sublinhado nas categorias e `brightness(.9)` apenas na barra ativa. A omissão foi reproduzida pelo teste ampliado antes da correção. Os **19 testes de interação passaram**, mais **uma verificação axe A/AA**, após a alteração de duas regras CSS. O teste percorre todas as barras dos dois gráficos em 1440 px, 390 px e texto a 200%, preservando cor-base, largura e altura. Captura de Mato Grosso inspecionada em `%TEMP%/comparacao-estadual-destaque-MT.png`. O registro da suíte completa abaixo refere-se à revisão imediatamente anterior; não foi repetida para esta correção localizada. Dados, geometria e comportamento de hover não mudaram.

Implementação do plano aprovado: passar o mouse sobre um resultado sempre atualiza o destaque, mesmo após um clique. Ao entrar em títulos, créditos, nomes das curvas, margens ou sair da figura, volta o resultado clicado; sem seleção fixada, o destaque desaparece. Clicar em outro resultado substitui a seleção. Novo clique no mesmo remove a fixação, mas mantém o hover enquanto o cursor estiver nos dados. Toque seleciona ou remove sem hover persistente.

Nos biomas, removido o sublinhado das categorias: somente a barra ativa recebe `brightness(.9)`, escurecimento de 10% sem alterar cor-base, largura ou espessura. Os outros gráficos mantêm sua aparência. Valores, períodos, dados, mapa, seletor, rodapé, Home e Queimadas preservados.

### Operação e regressões

- Navegação por teclado tem prioridade até novo movimento do mouse. Setas/Home/End percorrem sem fixação automática; Enter/Espaço fixa ou remove e Escape limpa os estados. O mouse não gera anúncios. As instruções acessíveis foram atualizadas para explicar a seleção e a exploração temporária.
- Os três novos testes falharam antes da correção: hover bloqueado pelo clique, barra sem realce e alternância teclado/mouse incorreta. A sequência clicar A, explorar B e C, sair e retornar a A foi exercitada nas seis figuras, incluindo substituição, remoção, clique externo e destaque conjunto das duas curvas.
- Testes de teclado e toque simulado agora percorrem as seis figuras. A matriz responsiva também verifica hover após clique e restauração da seleção em 320, 390, 768, 960, 1440 e 1920 px, janela baixa e texto a 200%. Reset de UF, largura do contêiner e viewport verifica seleções persistentes, além de destaques temporários. Mantidos os cenários de rótulos deslocados, zeros, dados indisponíveis e alternativa sem JavaScript.
- A inspeção a 200% encontrou colisão entre duas marcações da escala horizontal. Um quarto teste novo reproduziu o problema antes da correção. As marcações intermediárias agora aparecem a partir de 56 rem; abaixo disso, zero e limite preservam a escala e a proporção. Não foram alterados valores, barras ou formatos. **19 testes de interação passaram** após esse ajuste.
- Capturas em 1440×900 demonstram Cerrado fixado, Amazônia sob hover e retorno ao Cerrado ao sair. Também inspecionadas as apresentações em 390×844 e com texto a 200%; arquivos em `%TEMP%/hover-prioritario-biomas-*.png`.
- **`npm test -- --reporter=dot`: 160 testes aprovados em 1,4 min**, incluindo axe, as 27 UFs, zeros, dados indisponíveis, navegação, alternativa sem JavaScript e preservação dos componentes compartilhados. **`npm run check` aprovado**, incluindo 21 testes Python; as mensagens dos cenários de importação inválida são esperadas e verificadas. `git diff --check` sem erros.
- As três bases mantiveram os hashes registrados nas revisões abaixo. Reprodução do gerador sem diferenças em `dados.html`: SHA-256 **974c7b0771faf8cd502923cac49f6c3c6cccbdfca76196cd4364a33651e74efc**. Nenhuma reimportação necessária para esta revisão de interação.

Nenhuma dependência, consulta externa, API pública ou recurso visual foi adicionado. A revisão ampla da metodologia e a autorização da imagem do rodapé continuam pendentes das etapas previstas; nenhuma publicação. Leitor de tela real e aparelhos físicos não foram testados nesta revisão.

## Revisão anterior — destaques discretos e hover sem sobreposições

Refinamento do plano aprovado, preservando todos os dados, períodos, nomenclaturas e formatos. Removidas as caixas dos números e os contornos externos das barras. O resultado ativo mantém a categoria sublinhada e, nas linhas, um único realce de 1 px na cor do marcador. A guia é uma linha fina com opacidade de 35%, somente nos gráficos de linhas, atrás dos valores. O foco visível na figura continua disponível por teclado.

### Correções e evidências

- O posicionamento reserva até 2 px extras ao redor dos marcadores para considerar o realce. Não se recalculam posições, fontes ou dimensões ao passar o mouse ou fixar o resultado.
- A seleção por proximidade verifica os limites horizontal e vertical do traçado. Números, pontos, barras e categorias ativam seu próprio item, inclusive com rótulo deslocado lateralmente. Títulos, créditos, nomes das curvas e margens não ativam categorias. Áreas vazias limpam o hover não fixado; clique/toque e teclado preservam a seleção fixada até nova ativação, Escape ou os resets existentes.
- Um teste reproduziu a área invisível da última categoria interceptando o nome final da curva. Corrigida a ordem das camadas para o nome permanecer legível e não ser confundido com um alvo do gráfico. Guia e SVG decorativo não recebem eventos do ponteiro.
- Os novos testes falharam antes da implementação por caixas nos números e hover retido no título. Após a correção, **15 testes de interação passaram**, incluindo os cinco cenários novos: quatro exemplos enviados, geometria/cores/tipografia estáveis, áreas vazias, rótulo deslocado, seleção fixada, cada número visível e matriz responsiva.
- Capturas dos quatro exemplos a **1440×900** inspecionadas: Minas Gerais mensal e anual, setembro nas duas curvas e Cerrado. Arquivos em `%TEMP%/hover-discreto-*-1440.png`. O teste responsivo verifica hover sem deslocamento em **320, 390, 768, 960, 1440 e 1920 px**, janela **1280×420**, e texto a **200%** em 390 e 1440 px. Linhas, colunas e barras são exercitadas, sem overflow horizontal observado.
- Capturas complementares inspecionadas em **390×844**, **1280×420** e **1440×900 com texto a 200%**, incluindo a adaptação para barras. Arquivos em `%TEMP%/hover-discreto-*.png`.
- **`npm test -- --reporter=dot`: 156 testes aprovados em 1,2 min**, incluindo axe, navegação, 27 UFs, dados ausentes, zeros, empates, sem JavaScript e preservação dos componentes compartilhados. **`npm run check` aprovado**, incluindo os 21 testes Python; erros impressos nos três cenários de importação inválida são esperados e verificados. `git diff --check` sem erros.
- Gerador executado novamente, com `dados.html` idêntico antes e depois: SHA-256 **974c7b0771faf8cd502923cac49f6c3c6cccbdfca76196cd4364a33651e74efc**.

As três bases preservaram os SHA-256 registrados abaixo. Não houve alteração de fonte, licença ou dependência. Mapa, seletor, rodapé, Home e Queimadas ficaram preservados. A metodologia ampla e os direitos da imagem do rodapé continuam pendentes das etapas já previstas; não houve publicação. Testes de teclado e toque simulado não substituem validação com leitor de tela real ou aparelho físico.

## Revisão anterior — gráficos interativos e leitura dos resultados

Plano aprovado: `plano-graficos-interativos.md`, em 19/10/2026. Dados e períodos foram preservados. A revisão anterior abaixo continua sendo a referência para os cálculos dos indicadores. Home, Queimadas, mapa, seletor e rodapé não foram alterados nesta etapa.

### Estrutura, geometria e interação

- O acumulado comparativo usa **Jan a Set** no eixo comum. A série observada se chama **2026**; **Média histórica** compara os acumulados dos mesmos meses de **2003 a 2025**, com explicação única e identificação direta no final das curvas. A distribuição estadual mantém mês e ano, pois atravessa 2025 e 2026. Históricos anuais têm títulos curtos e período na descrição.
- Corrigido o deslocamento de **16 px** da escala vertical no acumulado. Eixos, segmentos, marcadores e guia agora usam a mesma área de traçado. Os testes conferem os retângulos dos eixos, as coordenadas SVG transformadas e os centros dos pontos, incluindo o zero.
- Rótulos testam posições próximas acima e abaixo dos pontos, com pequenos ajustes laterais e afastamento inicial de 8 px. A busca considera segmentos, marcadores, outros números, categorias, nomes das curvas e limites da figura. Um pequeno fundo da cor da página protege a leitura. Todos os valores continuam visíveis, sem redução da fonte. Quando não há solução segura, inclusive para nomes finais coincidentes, a mesma lista usa barras horizontais. Barras zeradas não ganham contorno que simule valor positivo.
- Mouse destaca categoria, marca e valor; clique ou toque fixa e uma nova ativação limpa. Nas duas curvas, o mês destaca os dois resultados juntos. A guia vertical acompanha a posição real dos pontos. Não foram criados painéis repetidos, filtros, zoom ou controles para ocultar séries.
- Cada figura tem uma entrada de teclado: setas, Home/End, Enter/Espaço e Escape; Tab segue normalmente. Links das fontes mantêm sua operação por Enter. As regiões de status de consulta estadual e exploração têm nomes distintos; movimentos do mouse não geram anúncios contínuos. Troca de UF, mudança do formato e redimensionamento limpam o destaque anterior.
- A melhoria é um módulo nativo independente. Sua falha preserva dados e seleção estadual; sem JavaScript, permanecem os gráficos nacionais estáticos e as alternativas estaduais existentes. Uma única lista semântica de resultados por figura, sem cópias ocultas dos números ou tabelas na interface principal.

### Verificação

- **`npm test -- --reporter=dot`: 151 testes aprovados em 1,2 min**, incluindo axe, árvore acessível, seis biomas, 27 UFs, 23 anos, nove acumulados, 12 competências estaduais, reconciliação com as bases, teclado, mouse, toque, alternância rápida, dados indisponíveis, zeros, empates, pontos coincidentes e ausência do módulo de interação. Os dez testes novos cobrem também colisões com segmentos, proximidade dos rótulos, meses, nomes finais, links, guia e correspondência geométrica.
- **`npm run check`: aprovado**, com sintaxe JavaScript e **21 testes Python**. Os erros impressos pelos cenários de importação inválida são esperados e têm seus retornos verificados. `git diff --check` sem erros.
- Gerador reproduziu `dados.html` sem diferenças: SHA-256 **974c7b0771faf8cd502923cac49f6c3c6cccbdfca76196cd4364a33651e74efc**. As três bases mantiveram os hashes registrados na revisão anterior; nenhum dado foi reimportado ou alterado para esta revisão visual.
- Inspeção de capturas nacionais e estaduais a **390, 960 e 1440 px**. Matriz automatizada de **320, 390, 768, 960, 1440 e 1920 px**, janelas baixas e texto a **200%**, incluindo os limites responsivos: sem overflow horizontal observado. No desktop as linhas permanecem; quando o espaço não comporta os rótulos, barras preservam todos os resultados. Capturas finais em `%TEMP%/interativos-final-*.png`.
- Revisão independente somente leitura conferiu **27 UFs em 1024, 1440 e 1920 px**, totalizando 81 históricos sem sobreposição de rótulos. Encontrou captura indevida de Enter nos links das fontes; o problema foi reproduzido, corrigido e coberto por teste que falhou antes e passou depois.

### Desempenho desta revisão

Medição após encerrar a suíte, sem testes ou importações concorrentes: **cinco amostras**, Chromium **153.0.8010.12**, viewport **390×844**, CPU **4×**, latência **150 ms**, download **200.000 B/s**, upload **93.750 B/s**, cache desabilitado, localhost HTTP sem compressão. LCP mediano **992 ms**, CLS **0** nas cinco amostras e transferência **299.513 bytes** por amostra. Maior duração de evento registrada **96 ms**, sem interpretar esse valor como INP de campo. Relatório bruto: `test-results/desempenho-dados.json`. Não se declaram metas de Core Web Vitals com essa medição local.

### Limites preservados

Não foi realizado teste com leitor de tela real ou aparelho físico; os testes de toque são simulados. Axe e inspeção da árvore acessível não demonstram conformidade integral WCAG. A revisão ampla da metodologia permanece para a etapa posterior solicitada. A autorização da imagem do rodapé continua pendente; nenhuma publicação foi realizada.

## Revisão anterior — panorama histórico e consulta estadual recente

Plano aprovado: `plano-dados-historico.md`, em 19/10/2026. Esta seção substitui os recortes descritos nas revisões anteriores abaixo. Home, Queimadas, geometria do mapa, seletor e rodapé não foram alterados nesta etapa.

### Indicadores e fontes

- Abertura e biomas: **território atingido ao menos uma vez em 1985–2025**, RAF2025, Coleção 5, Tabela 3. Total **208.441.608 ha**, igual à soma das seis barras, na ordem preservada. Não é soma anual ou mensal. A diferença de **4.673 ha** para a Tabela 2 é documentada, sem corrigir a publicação. `auditoria-area-historica.json` contém HTML original, URL, hash, valores e interpretação da medida.
- Focos anuais: **23 anos civis completos, 2003–2025**, no Brasil e nas 27 UFs. Importados dos ZIPs oficiais de referência; o AQUA_M-T permite usar anos completos desde 2003. Mantidos os controles independentes de 2021–2025. Datas, campos essenciais, coordenadas, nomes de UFs, duplicatas e cobertura mensal nacional são validados. Nenhuma duplicata anual foi encontrada. Dois registros (2004 e 2007) não informam bioma; foram preservados porque têm UF válida e não se usa bioma nesse agregado. A ausência está auditada.
- Acompanhamento nacional de 2026: **nove acumulados de janeiro até setembro**, cada um comparado à média aritmética dos acumulados dos mesmos meses nos 23 anos de 2003–2025. Setembro: **70.350** observados / média **154.373,04347826086**, exibida como **154.373,0**. Sem previsão e sem incluir 2026 na série de anos completos. Cada mês reúne seus dois valores em um único item semântico. Os arquivos de 2026 não contêm AQUA_M-T em 03/05, 10/07 e 22/07; não há estimativa para essas lacunas.
- Área estadual: **out/2025–set/2026** versus média dos totais de **janeiro a dezembro de 2019–2024**, ambos do Monitor do Fogo. As seis parcelas são calculadas com `Decimal`; arredondamento somente na exibição. Espírito Santo: **5.151,24 ha / 6.094,236666… ha**; Amazonas: **504.051,41 ha / 1.105.728,508333… ha**.
- Focos estaduais: distribuição dos **12 meses out/2025–set/2026**, preservando máximos empatados, e histórico anual 2003–2025. No Espírito Santo, o acumulado recente é 472; o ano civil de 2025 tem 385. Intervalos identificados explicitamente.

### Apresentação e acessibilidade

Históricos anuais usam linha em áreas com ao menos 48 rem e barras horizontais abaixo disso. Os rótulos são reposicionados conforme suas dimensões reais, inclusive após mudar a UF ou ampliar o texto. A linha possui margem final para que o último valor permaneça dentro da figura. O acompanhamento acumulado usa duas linhas na mesma escala, com legenda, cores e traçados diferentes; na leitura estreita, cada mês mantém as duas barras e valores na mesma lista. Não há tabelas, abas de tabela ou cópias ocultas de resultados com JavaScript ativo.

Foram inspecionadas capturas dos gráficos a 390, 960 e 1440 px. A matriz automatizada cobre 320, 390, 768, 960, 1440 e 1920 px, orientação horizontal e janelas de 420 px de altura, com texto a 100% e 200%. As verificações incluem limites das figuras, ausência de sobreposição dos valores, título desobstruído, largura da página, teclado, toque, foco, seleção das 27 UFs, alternância rápida, estados sem dados, zeros, empates, árvore acessível, axe e alternativa sem JavaScript. Sem JavaScript, históricos nacionais são barras estáticas e as consultas estaduais têm tabelas textuais.

A revisão independente identificou dois contratos de período insuficientes. Foram corrigidos e cobertos por regressões: referências de área diferentes de 2019–2024 e meses INPE de outra edição agora ficam indisponíveis, em vez de receber legendas incorretas. O gerador também rejeita metadados incompatíveis de panorama, área estadual e acumulados nacionais.

### Reprodução e resultado dos testes

A reprodução das três bases a partir dos originais locais preservou seus SHA-256. A nova execução do gerador preservou integralmente `dados.html` após a atualização final dos cabeçalhos das tabelas alternativas. Dados preparados uma vez, sem consultas de rede na navegação.

- `src/dados-base.js`: `569559854330034f9813207aabd5a36f7e95909782b4a39cbecb6fcefdcd0d49`.
- `src/area-historica.js`: `fb7a2e9b84719de39f50836a163231c8aa63f3abb8509241f5d9297e36ce69d3`.
- `src/focos-base.js`: `134ee4e4774a339b78cd6bf4e7c9e98bc4a3a9984f0cbe9820e99b4f255d0d00`.
- `dados.html`: `d5cf3ea3a0bdfecf5e7e05c4f0a440ca5501025ee4b067e9f09f9dce3071d91a`.

- `npm test -- --reporter=dot`: **141 testes passaram**, incluindo axe, árvore acessível, matriz de larguras e limites responsivos, 27 UFs, teclado/toque, sem JavaScript, metadados incompatíveis e preservação dos rodapés.
- `npm run check`: sintaxe JavaScript aprovada e **21 testes Python passaram**. Os erros impressos por três testes de importação inválida são falhas esperadas desses cenários, com retorno validado pelo teste.
- `git diff --check`: sem erros.

Medição de laboratório após encerrar a suíte e as importações, sem executar essas cargas em paralelo: **5 amostras**, Chromium **153.0.8010.12**, viewport **390×844**, CPU **4×**, latência **150 ms**, download **200.000 B/s**, upload **93.750 B/s**, cache desabilitado, servidor localhost HTTP sem compressão. LCP mediano **884 ms**, CLS mediano **0**, transferência mediana **287692 bytes**; maior duração de evento registrada **80 ms**, que não é INP de campo. Relatório bruto em `test-results/desempenho-dados.json`. Não são declaradas metas de Core Web Vitals ou conformidade integral.

### Limites e próxima etapa editorial

Conforme instrução expressa do usuário, **metodologia e textos explicativos após os gráficos permanecem para outra etapa de planejamento**. A metodologia ainda contém descrições do recorte anterior; esta entrega não declara coerência editorial integral desses textos. Os créditos e textos diretamente ligados aos dados foram atualizados. Uso real de leitor de tela e validação em aparelhos físicos permanecem pendentes; axe e árvore acessível não equivalem a conformidade integral WCAG. A autorização da imagem original do rodapé continua pendente. Nenhuma publicação realizada.

## Revisão anterior — um único recorte recente para área, biomas e focos

Implementação do plano aprovado em 19/10/2026. **Out/2025–set/2026** é o recorte principal de toda a página. A comparação de área usa a média dos seis períodos anteriores de outubro a setembro, **out/2019–set/2025**, do mesmo Monitor do Fogo. Os registros das revisões anteriores abaixo preservam a evolução do projeto; seus produtos e recortes foram substituídos na interface quando indicado aqui.

### Dados e conteúdo

- `scripts/importar-area.py` prepara os agregados do Monitor, substituindo o antigo importador de médias do RAF. Consulta 37 respostas oficiais: disponibilidade e **35 séries com 93 competências** — Brasil por biomas, Brasil por estados, seis biomas e 27 UFs. Copias originais ficaram em diretório temporário; URLs, hashes, valores recebidos, acumulados e médias estão em `auditoria-area.json`.
- Período recente: **11.371.137,07 ha** no Brasil, agrupamento por biomas. Média dos seis anteriores: **18.015.390,258333… ha**; diferença **36,9% abaixo**. Cerrado **54,6%**, Amazônia **37,4%**, conjunto **91,9%**, calculado antes do arredondamento individual. Estes números aparecem nas interpretações do recorte correspondente.
- As duas barras estaduais mostram o acumulado recente e a média dos seis anteriores. Amazonas: **504.051,41 ha / 1.055.644,088333… ha**; Espírito Santo: **5.151,24 ha / 5.708,948333… ha**. Cálculos com `Decimal` no importador, arredondamento só na apresentação. Geometria usa valores não arredondados.
- Foram retirados do HTML o RAF2025, a média 1985–2025 e suas interpretações de 2025. O panorama abre com área nos últimos 12 meses; os biomas apresentam o mesmo acumulado recente. Introdução, instrução, legendas, anúncios e tabelas sem JavaScript correspondem ao mesmo recorte. A metodologia explica a soma mensal, a recorrência de áreas em meses diferentes e a referência dos seis períodos, sem confundir o acumulado com território único atingido.
- A edição mantém o período principal fixado mesmo que a fonte publique meses novos. Séries ausentes ou inválidas interrompem a geração sem substituir os arquivos existentes; zero válido permanece zero. No navegador, uma base de área com período incompatível é tratada como indisponível e não bloqueia os focos.
- Os totais nacionais por biomas e por estados diferem na própria fonte em **778,79 ha** no recorte recente. As somas territoriais são reconciliadas dentro de cada agrupamento; a diferença entre agrupamentos é preservada e documentada, sem atribuir causa não confirmada. Tolerâncias de arredondamento e valores mensais estão em `fontes-monitor-fogo.md` e na auditoria.

### Verificação

- Testes do novo panorama e do importador falharam antes da implementação. Após a migração, **`npm test -- --reporter=dot`: 135 testes aprovados em 1,1 min**. Inclui 27 UFs, valores e proporções, recortes, média dos seis períodos, biomas, seleção e alternância, teclado/toque, séries zeradas, dados ausentes, anúncios, funcionamento sem JavaScript, axe, navegação/subdiretório e igualdade de mapa/rodapés.
- **`npm run check` aprovado, incluindo 16 testes Python**. Novos casos verificam média sem arredondamento intermediário, competência ausente/duplicada, valor nulo/negativo, totais anuais incompatíveis, zero disponível, publicação posterior mantendo o recorte fixo e preservação da base existente diante de falha de download ou de conteúdo. `git diff --check` passou.
- Reprodução com respostas locais: importador e gerador mantiveram os arquivos testados idênticos. SHA-256 da base: **7360ee3b6e3722c0fef1fb5bb6c92d4e25f86eac37d8ee338adad219b41aa4f1**; HTML: **055330da828c910f57666e8b2330c00805e1080cc1455083bf9699aa35b0d637**.
- Inspeção visual de texto, biomas e comparação estadual em **320×568, 390×844, 768×1024, 960×720, 1440×900, 1920×1080, 1280×420 e 390×844 a 200%**. Testes de layout também exercitaram as oito janelas com texto a 100% e 200%. Sem overflow horizontal geral, corte para caber na altura ou sobreposição dos valores observados. Capturas em `test-results/unificado-*.png`.
- Revisão independente somente leitura: conferiu os hashes e conteúdos das 37 respostas originais, as 35 séries, os sete acumulados e a média dos seis anteriores, os agrupamentos, os rótulos, o fallback e os limites metodológicos. Não encontrou problema importante reproduzível. Não refez downloads nem substitui teste assistivo real.

### Desempenho, limites e preservação

Cinco amostras no Chromium **153.0.8010.12**, viewport 390×844, cache desabilitado, CPU 4×, latência 150 ms, download 200.000 B/s, upload 93.750 B/s, localhost HTTP sem compressão. LCP mediano **852 ms**, CLS **0** nas cinco amostras, **231.485 bytes** por amostra; maior duração de evento registrada **80 ms**, sem interpretar como INP de campo. Arquivo bruto em `test-results/desempenho-dados.json`.

A página continua estática, sem nova dependência e sem requisições ao MapBiomas durante a navegação. Mapa, seletor, focos, identidade visual e rodapé preservados; Home e Queimadas não foram alteradas nesta etapa. Não houve teste com leitor de tela real ou aparelho físico e não se declara conformidade integral. A autorização de uso da imagem do rodapé continua pendente. Nenhuma publicação realizada.

## Histórico das revisões anteriores desta página

## Revisão atual — períodos recentes, créditos e seletor

Implementação do plano aprovado em 19/10/2026. Sem publicação, novas dependências ou alterações nesta etapa em Home, Queimadas, geometria do mapa ou rodapé.

### Resultado e decisões

- Biomas: média dos 41 valores anuais da Tabela 4 do RAF2025, Coleção 5, com auditoria completa em `auditoria-biomas.json`. Médias visíveis em ha/ano: Cerrado **9.590.672**, Amazônia **7.156.800**, Caatinga **479.852**, Mata Atlântica **325.020**, Pantanal **842.679**, Pampa **16.832**. Geometria calculada com as médias sem arredondamento intermediário; ordem das seis barras preservada.
- Focos: 12 competências **out/2025–set/2026** e cinco períodos outubro–setembro. Totais nacionais: **189.027**, **167.942**, **288.225**, **143.839**, **130.998**. Último período do ES: **472**. Importador reproduz os agregados dos arquivos anuais de referência e dos nove arquivos mensais de 2026, filtrados por AQUA_M-T. Nenhuma duplicata encontrada; idênticas são contadas uma vez e conflitos são rejeitados.
- Decisão de cobertura: os arquivos multissatélite têm registros em todos os dias, mas não há AQUA_M-T em **03/05, 10/07 e 22/07/2026**. Exigir uma detecção de referência por dia confundiria presença de registros com completude do arquivo. O importador exige cobertura diária do arquivo e ao menos algum registro de referência no mês, registra as lacunas e não estima detecções. A causa das lacunas não foi confirmada; os totais representam detecções disponíveis. A limitação consta da metodologia e de `fontes-inpe.md`.
- Decisão de leitura: os rótulos dos intervalos completos exigem mais espaço que os antigos anos isolados. A linha usa **24 rem** disponíveis, em vez de 21 rem, com início e fim em duas linhas e fonte mínima de 13 px no tamanho padrão; abaixo desse limite, a mesma lista vira barras horizontais. Colunas mensais continuam a partir de 48 rem. Valores e rótulos foram conferidos nos dois lados dos limites.
- Combobox/listbox personalizado: 27 UFs, cores distintas do fundo, altura `min(20rem, 50svh, espaço disponível)`, opções de ao menos 44 px e foco 2 px/2 px. Confirmação por Enter/Espaço ou clique/toque; Escape, Tab e clique externo cancelam a navegação sem alterar a seleção. Letras repetidas percorrem os nomes correspondentes. Mapa e campo usam a mesma atualização. O campo reserva a altura do texto inicial para evitar deslocamento em celulares. Falha no módulo da melhoria preserva o select nativo.
- Créditos do IBGE e MapBiomas alinhados à mesma coluna de até 64 rem. Mapa continua centralizado e proporcional por largura e altura.

### Evidências de verificação

- Antes da implementação, os três testes novos de período, combobox e alinhamento falharam; os três testes iniciais da importação mensal também falharam por funções ausentes. Passaram após a implementação. A comparação de posição do mapa detectou uma redução de 28 px no campo ao selecionar em 320 px, corrigida com reserva de altura.
- **`npm test -- --reporter=dot`: 130 testes aprovados em 1,0 min.** Inclui 27 UFs por mapa e seletor, teclado e toque real simulado, mudanças rápidas, tabelas somente sem JavaScript, empates, zeros, fontes ausentes, completude dos períodos, cálculos, navegação/subdiretório e igualdade dos rodapés. As 27 opções do combobox foram confirmadas por teclado sem transferir foco ou deslocar a página.
- **`npm run check`: aprovado**, incluindo sintaxe dos módulos novos e **10 testes Python**. Casos adicionais cobrem filtro por satélite, Latin-1, duplicatas e conflitos, arquivos/datas ausentes, cobertura, soma dos intervalos e preservação dos arquivos publicados quando a importação falha. `git diff --check` sem erros.
- Gerador executado duas vezes com o mesmo HTML: SHA-256 **f665cc9b64fe236d6117f90e2c0cb15ec1dc5a5131360bc546959a6508b05389**. O importador foi reexecutado com os arquivos oficiais locais, preservando os valores auditados. A auditoria contém URLs, hashes e contagens; dados brutos ficaram fora do repositório.
- Axe A/AA sem violações nos cenários testados, incluindo a lista aberta. Árvore de acessibilidade conferida: combobox nomeado, valor confirmado exposto, opções com estado de seleção, gráfico com rótulo e valor no mesmo item. Sem cópias ocultas ou tabelas na interface principal.
- Inspeção de capturas: 320×568, 390×844, 768×1024, 960×720, 1440×900, 1920×1080, 1280×420 e 390×844 a 200%. Testes de layout cobrem as oito janelas também a 200%. Sem overflow horizontal geral; início/fim, valores e eixos não se sobrepõem nos limites 383/384 e 767/768 px. Capturas em `test-results/recentes-*.png`.
- Revisão independente somente leitura não encontrou problemas importantes. Conferiu as somas das 27 UFs, médias dos 41 anos, nove competências de 2026 contra a auditoria, valor na árvore de acessibilidade e lista em janela de celular. Não refez os downloads nem substitui teste assistivo real.

### Desempenho e limites

Cinco amostras no Chromium **153.0.8010.12**, viewport 390×844, cache desabilitado, CPU 4× mais lenta, latência 150 ms, download 200.000 B/s e upload 93.750 B/s, localhost HTTP sem compressão. Script `scripts/medir-dados.mjs`, Node 24.19.0, Windows. LCP mediano **848 ms**, CLS **0** nas cinco amostras e **225.983 bytes** transferidos por amostra. Maior duração de evento registrada: **64 ms**; isso não é INP de campo. Arquivo bruto em `test-results/desempenho-dados.json`.

Não foi realizada operação manual com leitor de tela real nem em dispositivo físico. A inspeção da árvore de acessibilidade e os testes automatizados não equivalem a essa validação. Não se declara conformidade integral WCAG ou metas de Core Web Vitals. A comprovação dos direitos da imagem original do rodapé continua pendente. Nenhuma publicação foi realizada.

## Histórico das revisões anteriores

Os registros abaixo descrevem etapas anteriores; seus recortes, valores e limites responsivos foram substituídos pela revisão atual quando indicado acima.

## Revisão atual: formatos e hierarquia dos gráficos

O usuário aprovou variar os formatos e escolheu linha com pontos para a evolução anual. Permanecem os dados de 2025, os períodos históricos, a coluna de leitura, o mapa, o sumário, os créditos e o rodapé; Home e Queimadas não foram alteradas.

- Gráficos centralizados com até 64 rem, independentes da largura dos parágrafos. Biomas e área estadual têm rótulo, barra e valor alinhados em três colunas quando há espaço; em telas estreitas, o rótulo/valor precede a barra.
- Meses em 12 colunas a partir de 48 rem disponíveis, com valores acima e indicação textual dos meses máximos, incluindo empates. Evolução anual com cinco pontos conectados por segmentos retos a partir de 21 rem disponíveis, com destaque de 2025. Abaixo dos limites, a mesma lista fornece barras horizontais, sem cópias, tabelas ou controles adicionais. Container queries em rem respeitam a ampliação do texto.
- Todas as escalas começam em zero, com limites inteiros arredondados. Não há comprimento mínimo artificial para valores pequenos. Unidades nas legendas e números em pt-BR diretamente nos resultados; a região de status continua anunciando valores com suas unidades completas.
- `src/graficos.js` fornece a escala, referências e posições normalizadas da linha para a geração e atualização. Os valores nacionais são gerados estaticamente; ao selecionar uma UF, valores, limites, eixos, pontos e meses máximos são recalculados. A base de dados não foi alterada. Sem biblioteca gráfica ou dependência nova.
- As figuras mantêm suas listas semânticas com rótulo e valor; eixos, barras, linha e pontos são decorativos. A alternativa sem JavaScript conserva os gráficos nacionais e as tabelas estaduais.

O teste do novo formato foi executado antes da implementação e falhou porque a linha anual não existia. Depois da implementação, detectou um excesso de largura no último rótulo dos eixos com texto a 200%; a caixa de posicionamento foi corrigida. A inspeção visual inicial identificou quebra dos anos no celular, corrigida mantendo cada ano em uma linha. Os primeiros 42 testes específicos de Dados passaram antes da suíte completa.

### Verificação final da revisão visual

- `npm test -- --reporter=dot`: **123 testes aprovados em 54,7 s**. Inclui axe nos cenários avaliados, semântica, valores das 27 UFs, teclado/toque, mudanças rápidas, empates, séries zeradas, ausência de dados, navegação em subdiretório, funcionamento sem JavaScript e preservação de mapa/rodapés.
- Quatro verificações novas cobrem escalas e posições, adaptação de formatos, ausência de sobreposição nos limites de 767/768 px e 335/336 px, e atualização dos cinco pontos estaduais. Rótulos anuais ficam em uma linha. Exemplos independentes: limite mensal nacional de 30.000, limite anual nacional de 300.000; Espírito Santo usa 100 focos na escala mensal e 800 na anual.
- Proporções atualizadas nos testes para considerar o limite arredondado do eixo. Valores pequenos não recebem largura mínima artificial. Os números visíveis não repetem unidades já fornecidas pela legenda; o anúncio acessível mantém as unidades completas. O conteúdo e as bases numéricas foram preservados.
- Inspeção visual de capturas nacionais em 320×568, 390×844, 768×1024, 960×720, 1440×900, 1920×1080, 1280×420 e 390×844 com texto a 200%, com capturas adicionais de biomas, área estadual e focos selecionados em celular/desktop. Sem overflow horizontal geral nos cenários avaliados. Arquivos locais em test-results/dados-visual-*.png.
- Gerador reexecutado depois da suíte: SHA-256 do documento idêntico antes/depois, mantendo o HTML testado. `npm run check`, incluindo o novo módulo de geometria, e `git diff --check` passaram.

Não houve teste com leitor de tela real nem validação em aparelhos físicos nesta revisão. As limitações e pendências de uso das fontes e da imagem do rodapé permanecem registradas no final deste relatório. Nenhuma publicação foi realizada.

## Revisão anterior: uma única apresentação por gráfico

Em 19/10/2026, o usuário decidiu manter 2025 como referência anual completa e remover as cinco consultas expansíveis em tabela. O panorama e a consulta selecionada não possuem mais tabelas, resumos expansíveis ou controles de alternância com JavaScript ativo. Nenhum dado de 2026 foi incorporado.

Todos os gráficos, inclusive a comparação estadual de área, são figuras identificadas por suas legendas, contendo listas de resultados. Cada item mantém o rótulo e o valor visível em texto; as barras permanecem decorativas (`aria-hidden`). As listas usam elementos `ul`/`li`, com `role="list"` explícito para preservar sua semântica mesmo sem marcadores visuais. Não há cópias ocultas para leitores de tela. Permanecem os meses máximos, empates, o tratamento de séries zeradas, as unidades e a seleção sincronizada.

O gerador produz somente listas nos gráficos. Sua função de tabela foi restrita à alternativa estadual sem JavaScript e deixou de emitir atributos de atualização dinâmica. O estilo exclusivo das tabelas dentro dos gráficos foi removido; os estilos de tabela e expansíveis necessários ao `noscript` continuam. Os gráficos nacionais são estáticos e acessíveis também sem JavaScript; nesse modo as tabelas estaduais permanecem disponíveis, incluindo os meses de 2025 e os totais anuais de 2021–2025.

O teste de regressão foi executado antes da alteração e falhou ao encontrar os 15 elementos que formavam as cinco consultas (tabela, details e summary). Após a mudança, passou verificando a ausência desses elementos, os nomes acessíveis das figuras, a quantidade de itens e os rótulos/valores na árvore de acessibilidade do Chromium. Os testes existentes foram atualizados para verificar a apresentação principal, mantendo a conferência independente dos valores e da consulta sem JavaScript.

Home, Queimadas, bases de dados, mapa e rodapé não foram alterados nesta etapa. Não foram criadas páginas, dependências ou interfaces externas. Os resultados atuais de verificação estão registrados a seguir; as demais seções descrevem entregas anteriores.

### Verificação final da apresentação única

- `npm test -- --reporter=dot`: **119 testes aprovados em 55,9 s** na rodada final. A suíte inclui axe nos estados avaliados, teclado, toque, 27 UFs, alternância rápida, ausência de fontes, empates, séries zeradas, layout responsivo e preservação dos rodapés/mapa.
- Regressão específica: com JavaScript ativo, nenhum `table`, `details` ou `summary` no conteúdo principal, antes e depois da seleção; seis figuras com nomes acessíveis e listas com 6, 2, 12, 5, 12 e 5 resultados. A árvore acessível mantém rótulo e valor no mesmo item; a lista anual de Espírito Santo contém 549, 474, 543, 662 e 385 focos, nessa ordem. As barras não são anunciadas como conteúdo adicional.
- Sem JavaScript: os gráficos nacionais continuam como listas; as tabelas estaduais mantêm as 27 UFs. A consulta expandida de Espírito Santo conserva os 12 meses e cinco anos, incluindo agosto com 94 focos e total de 2025 com 385 focos. Não há tabelas expansíveis no panorama nacional.
- O gerador foi reexecutado após os testes: SHA-256 do HTML idêntico antes/depois, sem recriação das opções removidas. `npm run check` e `git diff --check` sem erros.
- Inspeção visual final de capturas em 1440×900, 390×844, janela baixa de 1280×420 e 320×568 com texto a 200%; dados legíveis, sem controles de tabela e sem overflow horizontal geral. Capturas em test-results/graficos-unicos-*.png. A suíte também verifica 320, 390, 768, 960, 1440 e 1920 px a 100% e 200%.
- Na primeira rodada, 118 testes passaram e um teste antigo de navegação em subdiretório falhou com `Fetch response has been disposed` durante seu encerramento. A falha não se reproduziu em três execuções isoladas, e a rodada completa seguinte passou. Nenhum código de Home, Queimadas ou desse teste foi alterado nesta revisão.

A inspeção da árvore de acessibilidade não substitui audição em leitor de tela real. Permanecem as limitações e pendências documentadas no fim do relatório; nenhuma publicação foi realizada.

## Revisão anterior: remoção de repetições nas três páginas

Em 19/10/2026, o usuário autorizou condensar textos e visualizações, substituindo a preservação literal dos parágrafos dos handoffs. As referências editoriais de Dados e Queimadas foram atualizadas de forma explícita; os testes continuam verificando os fatos, valores e a sequência revisada.

- **Dados:** removidos os indicadores grandes de área e os painéis de total/pico de focos. Área de 2025 e média histórica aparecem somente na comparação em barras; o total de focos de 2025 está na barra correspondente do gráfico anual. Os meses máximos recebem a indicação textual “maior contagem” nas próprias barras, incluindo todos os empates. Séries válidas zeradas não recebem marcadores de pico. A indicação é recalculada a cada seleção, sem manter marcas do estado anterior. As tabelas equivalentes permanecem recolhidas; a alternativa sem JavaScript mantém os dados das 27 UFs.
- **Textos de Dados:** retirados valores absolutos aproximados já disponíveis nos gráficos dos biomas, mantidos percentuais e interpretação. A instrução do seletor foi unificada, e explicações completas de limitações e interpretação foram concentradas nas quatro perguntas metodológicas. Créditos curtos continuam junto às visualizações; o expansível Fontes e créditos foi removido. Referências completas estão em recursos-e-licencas.md e fontes-inpe.md, reservadas para a futura página institucional. Nenhuma página ou link fictício foi criado.
- **Home:** removido o parágrafo introdutório dos impactos, preservando o título, os três eixos e a cena do Hero.
- **Queimadas:** removidas a recapitulação do exemplo da propagação, a conclusão repetida sobre impactos após as chamas e as chamadas redundantes para prevenção. O encerramento agora tem uma mensagem e o aviso da página em desenvolvimento. O exemplo prático e o triângulo do fogo foram preservados.
- **Layout:** retirados estilos sem uso dos componentes removidos e ajustados os intervalos entre nome do estado, comparação, crédito e gráfico mensal. Geometrias, bases de dados e rodapés foram preservados. Sem novas dependências ou publicação.

A verificação do bloco duplicado foi adicionada antes da mudança: falhou ao encontrar os três painéis anteriores e passou após sua remoção. A primeira suíte completa teve 117 testes aprovados e uma expectativa antiga para a chamada retirada de Prevenção; essa expectativa foi atualizada para a mensagem única prevista no plano. Os resultados finais estão registrados abaixo.

### Resultado final desta revisão

- `npm test -- --reporter=dot`: **118 testes aprovados em 54,8 s**. Inclui conteúdo revisado, 27 UFs, teclado/mouse/toque, alternância, ausência de fontes, empates, séries zeradas, tabelas sem JavaScript, fontes compactas, igualdade dos rodapés, navegação em subdiretório e auditoria axe A/AA nos estados avaliados.
- `python -m unittest discover -s tests -p 'test_importar_focos.py' -q`: **5 testes aprovados**; `npm run check` e `git diff --check` sem erros.
- Gerador dos painéis reexecutado: SHA-256 de dados.html idêntico antes/depois, mantendo o HTML efetivamente testado.
- Testes de layout cobrem 320, 390, 768, 960, 1440 e 1920 px, orientação horizontal e janelas baixas, incluindo texto a 200%. Inspeção visual final das três páginas em 1440×900, 390×844, 1280×420 e 320×568 com texto a 200%, além dos gráficos mensal/anual selecionados no celular. Sem overflow horizontal geral nos cenários testados. As capturas locais ficam em test-results/repeticoes-*.png.
- Desempenho de laboratório em 19/10/2026 às 19:04 UTC: Chromium 153.0.8010.12, viewport 390×844 com toque, CPU 4×, latência 150 ms, download 1,6 Mbit/s e upload 0,75 Mbit/s, sem cache, localhost HTTP sem compressão. Cinco LCPs: **828, 788, 788, 796 e 776 ms**, mediana **788 ms**. CLS inicial **0** nas cinco amostras; maior evento de seleção em cada amostra: **72, 56, 64, 56 e 64 ms**, sem equivalência a INP de campo. Transferência **214.275 bytes** em cada amostra. Todas retornaram 81.366 ha para Acre. Dados brutos em test-results/desempenho-dados.json. Medição executada após a suíte, sem concorrência com os testes.

As limitações sobre leitores de tela reais, aparelhos físicos, métricas de campo e direitos de uso continuam válidas, conforme a seção final deste relatório. Nenhuma publicação foi realizada.

## Revisão anterior: mapa, sumário e novos indicadores

Após a primeira entrega, o usuário aprovou a revisão visual e a ampliação dos dados para Brasil e estados. As quatro seções e a identidade existentes foram preservadas; o sumário “Nesta página” passou a reutilizar os mesmos estilos de Queimadas, compartilhados em `src/styles.css`.

O mapa, seletor e resultados ficam centralizados na mesma coluna editorial. O SVG mantém a proporção do viewBox, com largura `min(100%, 40rem, calc(65svh * 800 / 810))` e altura automática; o limite vertical reduz também sua largura em janelas baixas. A geometria das 27 UFs foi preservada byte a byte, verificada por SHA-256 dos pares UF/path (`cd601d31626eb6c6bbc9807e46964aa935692f375289cbf0a606d8a8ff18caca`). O mapa precede os resultados em todas as larguras, mantendo sua posição no documento após a seleção e dispensando a correção de rolagem necessária na primeira versão.

O retângulo visto pelo usuário era o `outline: auto` do navegador em um path focado por mouse, que não ativava `:focus-visible`. O outline é desativado apenas nos paths do mapa. Teclado mantém contorno geométrico contrastante, tracejado e de 4 px com `vector-effect: non-scaling-stroke`. A seleção permanece terracota mesmo sob hover. Os demais controles conservam o foco retangular normal, inclusive o seletor e o sumário.

**Novos indicadores:** total de focos em 2025, mês ou meses com maior contagem, distribuição mensal de 2025 e evolução anual de 2021–2025. Cada consulta mantém separados os hectares do MapBiomas e o número de detecções do INPE. A média de áreas de 1985–2025 não é aplicada à série de focos. Um empate mensal mostra todos os meses correspondentes; uma série válida sem detecções não inventa um mês de pico. Dados ausentes ou incompletos de uma fonte ocultam somente seus indicadores; não eliminam os resultados válidos da outra fonte.

**Fontes na interface:** informações essenciais permanecem junto aos gráficos; referências e condições completas ficam no expansível “Fontes e créditos”. O rodapé foi preservado integralmente e não foi criada página institucional. O texto que dizia que não eram apresentadas contagens de focos foi atualizado com autorização da revisão; os demais parágrafos aprovados e todos os valores de área foram mantidos.

**Consolidação INPE:** `scripts/importar-focos.py` baixa ou lê os cinco arquivos completos, rejeita campos ausentes, datas fora do ano, país/UF desconhecidos e IDs repetidos, confere os totais e só então escreve `src/focos-base.js` e `docs/auditoria-focos.json`. Fonte: satélite de referência; não há soma de todos os satélites. `scripts/gerar-paineis-focos.mjs` gera os painéis e tabelas a partir dessa base; o navegador atualiza tanto valores visíveis quanto tabelas equivalentes ao selecionar uma UF. Sem JavaScript, há tabelas nacionais e estaduais, inclusive os 12 meses de 2025 e cinco totais anuais por estado. Nenhuma nova biblioteca de produção foi adicionada.

| Referência independente conferida | Focos detectados |
| --- | ---: |
| Brasil 2021 | 184.081 |
| Brasil 2022 | 200.763 |
| Brasil 2023 | 189.901 |
| Brasil 2024 | 278.299 |
| Brasil 2025 | 136.393 |
| Espírito Santo 2025 | 385 |
| Brasil, outubro de 2025 | 28.678 |

Os cinco testes do importador passaram. Os 31 testes da página (23 existentes e oito novos) passaram antes da execução da suíte completa. A revisão ampliou a verificação para a proporção e centralização do mapa, foco sem caixa nas 27 UFs, sobreposição entre hover e foco, sumário, novos gráficos, nomes e valores, empates, dados incompletos e alternativas sem JavaScript. A suíte completa passou inicialmente com 112 testes em 54,9 segundos. A revisão independente identificou depois uma falha adicional de carregamento: uma fonte de dados que retornasse HTTP 404 ou lançasse erro durante avaliação impedia a inicialização de ambas. Os módulos de dados agora são importados em paralelo com tratamento separado de falha. Quatro testes reproduziram o problema antes da correção e passaram depois, mantendo os controles e os resultados da fonte disponível. A suíte completa foi executada novamente após essa alteração; o resultado final é registrado abaixo.

**Termos do INPE:** acesso livre e gratuito e referência conforme ABNT são explícitos na FAQ, mas não foi encontrada uma licença expressa aplicável aos ZIPs anuais. A CC BY-SA genérica do trabalho “Programa de monitoramento dos biomas brasileiros” não foi estendida ao Programa Queimadas; a CC BY 4.0 do MapBiomas também não foi aplicada ao INPE. Essa confirmação permanece pendente para publicação, junto dos direitos da referência do fundo do rodapé. Ver [fontes-inpe.md](./fontes-inpe.md) e [auditoria-focos.json](./auditoria-focos.json).

### Resultado final da revisão

- `npm test -- --reporter=dot`: **116 testes passaram em 55,5 segundos**.
- `python -m unittest discover -s tests -p "test_importar_focos.py" -v`: **cinco testes passaram**.
- `npm run check`: passou, incluindo os módulos novos e o gerador dos painéis; a importação dos módulos Python foi verificada pelos testes.
- `git diff --check`: sem erros de whitespace.
- Regenerar os painéis com `node scripts/gerar-paineis-focos.mjs` preservou o SHA-256 do HTML testado.
- axe passou nos estados avaliados em desktop e celular; capturas e árvore de acessibilidade confirmaram a nova ordem, o foco geométrico, unidades e nomes dos territórios nos títulos dos gráficos/tabelas.

### Desempenho após a revisão

Nova medição às 15h32 de 19/10/2026 (America/Sao_Paulo), depois da suíte final, Chromium 153.0.8010.12. Foram mantidas as condições do script: cinco contextos móveis novos de 390×844 CSS px, CPU 4×, latência de 150 ms, download 1,6 Mbit/s, upload 0,75 Mbit/s, cache desativado e servidor local HTTP sem compressão. Nenhuma suíte rodava em paralelo.

| Amostra | LCP observado | CLS inicial | Maior duração de evento na seleção de Acre |
| --- | ---: | ---: | ---: |
| 1 | 828 ms | 0 | 80 ms |
| 2 | 784 ms | 0 | 80 ms |
| 3 | 816 ms | 0 | 80 ms |
| 4 | 816 ms | 0 | 80 ms |
| 5 | 808 ms | 0 | 80 ms |

LCP mediano: **816 ms**; transferência observada: **219.442 bytes** por carregamento, incluindo documento, recursos e overhead reportado. O documento inclui as tabelas alternativas estáticas para consulta sem JavaScript; não há downloads dos arquivos brutos INPE durante a visita. Cada interação terminou com o indicador correto de 81.366 ha para Acre e executou a atualização dos novos gráficos de focos.

O CLS corresponde ao carregamento inicial. Event Timing mede uma interação de laboratório e não comprova INP de campo, percentis de visitas reais ou desempenho em aparelhos físicos. O JSON bruto é salvo em `test-results/desempenho-dados.json`; as medições anteriores permanecem abaixo apenas como registro histórico.

## Arquivos e apresentação

| Arquivos | Responsabilidade |
| --- | --- |
| `dados.html` | Quatro seções na ordem aprovada, textos revisados, seis biomas em lista, SVG das 27 UFs, gráficos de área/focos com listas semânticas, metodologia, créditos curtos e tabelas estaduais sem JavaScript |
| `src/dados.css` | Identidade verde/areia/terracota e escala fluida por largura **e altura**, com limites relativos para texto ampliado |
| `src/dados-base.js` | Valores estaduais locais e metadados de fonte, coleção, ano, período histórico, unidade, licença e data da conferência |
| `src/dados.js` | Uma rotina de seleção para mapa e lista, comparação com mesma escala, gráficos de focos, tratamento de ausência e anúncio acessível |
| `scripts/gerar-mapa.mjs` | Conversão reproduzível da malha oficial para SVG inline |
| `scripts/medir-dados.mjs` | Medição de laboratório de carregamento, estabilidade e eventos de uma interação real por toque |
| `tests/dados.spec.js`, `tests/fixtures/dados-aprovado.json` | Verificação editorial, numérica, funcional, visual, responsiva e acessível |
| `index.html`, `queimadas.html` | Somente ativação do link relativo Dados na navbar |
| `scripts/dev-server.mjs`, `package.json`, lockfile | Liberação de `dados.html`, checagem dos scripts e ferramentas exclusivamente de desenvolvimento |
| `tests/hero.spec.js`, `tests/queimadas.spec.js`, `README.md`, `docs/recursos-e-licencas.md` | Expectativa de navegação atualizada, instruções de uso, procedência e licenças |

Abertura escura compacta; textos sobre fundo areia em coluna de aproximadamente 68 caracteres; gráficos sem cartões, sombras ou animações decorativas. Os seis biomas seguem a ordem fornecida no handoff, sem ranking estadual. Valores completos permanecem visíveis sem hover. O eixo dos biomas vai de zero a 8.709.873 ha; as duas barras estaduais usam zero e o maior dos dois valores consultados. Não há comprimento mínimo artificial para barras pequenas.

O corpo segue `clamp(1rem, min(1.15vw, 2.3svh), 1.25rem)`, como Queimadas; títulos e intervalos também consideram largura/altura. Não há altura fixa ou ocultação de conteúdo para caber na janela. A consulta usa uma coluna em todas as larguras: seletor, mapa, comparação de áreas com seus valores, crédito curto e gráficos de focos. As explicações completas ficam na metodologia.

O rodapé foi copiado integralmente, incluindo imagem, marca, textos e links. O CSS e o script de navegação compartilhados não foram alterados. `#inicio` pertence ao cabeçalho do documento atual, com foco e rolagem nativos. Prevenção e destinos institucionais inexistentes continuam sem links fictícios. Não há backend, APIs ou biblioteca de produção nova.

## Auditoria científica

Conferência direta das páginas oficiais em 19/10/2026: os nomes e os pares de números das 27 UFs foram extraídos e comparados programaticamente com a Tabela 15; os seis valores de biomas foram comparados com a Tabela 5. Os dados publicados coincidem com o handoff: **54 valores estaduais e seis valores por bioma**.

| Informação | Fonte conferida |
| --- | --- |
| Total nacional de 12.703.585 ha, redução de 58% ante 2024, 31% abaixo da média de aproximadamente 18,4 milhões | [Resumo do RAF2025, página 6](https://raf.ia.mapbiomas.org/raf2025/publication-web-resources/html/publication-5.html) e [Tabela 5, página 26](https://raf.ia.mapbiomas.org/raf2025/publication-web-resources/html/publication-25.html) |
| Aproximadamente 208,4 milhões de hectares atingidos pelo menos uma vez, 1985–2025 | [Resultados acumulados, página 18](https://raf.ia.mapbiomas.org/raf2025/publication-web-resources/html/publication-17.html) |
| Cerrado 8.709.873; Amazônia 3.141.528; Caatinga 504.754; Mata Atlântica 216.863; Pantanal 121.177; Pampa 9.977 ha | [Tabela 5](https://raf.ia.mapbiomas.org/raf2025/publication-web-resources/html/publication-25.html) |
| 27 áreas de 2025 e 27 médias anuais de 1985–2025 | [Tabela 15, página 60](https://raf.ia.mapbiomas.org/raf2025/publication-web-resources/html/publication-59.html) e [continuação, página 61](https://raf.ia.mapbiomas.org/raf2025/publication-web-resources/html/publication-60.html) |

Identificação: **RAF 2025: Relatório Anual do Fogo no Brasil — Coleção 5 de mapas de áreas queimadas do MapBiomas Fogo (1985 a 2025). São Paulo: MapBiomas, 2026.** [DOI 10.58053/MapBiomas/4HQABO](https://doi.org/10.58053/MapBiomas/4HQABO).

Divergências mantidas e documentadas, sem correções arbitrárias:

- Tabela 15: Ceará tem 79.452 ha em 2025 e média de 51.713 ha, mas percentual impresso de +13%, incompatível com o par absoluto. Nenhum percentual de variação estadual é apresentado pela aplicação.
- A soma das linhas estaduais é 12.704.080 ha, 495 ha acima do total nacional publicado.
- A soma das linhas dos biomas é 12.704.172 ha, 587 ha acima do total nacional publicado.
- Não foi presumida causa, tolerância ou correção para essas diferenças. O total nacional continua sendo **12.703.585 ha**, e cada linha preserva seu valor publicado.

Ausência, `null`, número não finito ou negativo não são convertidos em zero; ocultam indicadores e barras e apresentam a mensagem aprovada. Zero real permanece válido. Os números são formatados por `Intl.NumberFormat('pt-BR')`. Não há recalculação de áreas pela geometria. Os novos dados do INPE são contagens distintas, sem conversão para hectares.

A página do produto anual atualmente contém downloads e documentação da Coleção 5.1. Ela é apenas referência metodológica nesta versão: os números publicados em Dados vêm exclusivamente das tabelas da Coleção 5 do RAF2025.

## Procedência e processamento do mapa

- Entrada: [BR_UF_2025.zip, IBGE](https://geoftp.ibge.gov.br/organizacao_do_territorio/malhas_territoriais/malhas_municipais/municipio_2025/Brasil/BR_UF_2025.zip), 14.814.182 bytes, baixado em 19/10/2026.
- SHA-256 do ZIP: `cdbbf05f79153802cbfa74d0c29814cd76a9c0b925aea910c9f04dffc28e6167`.
- Atributos originais `SIGLA_UF` e `NM_UF`; 27 registros e 27 siglas distintas. Não foram removidas UFs ou geometrias insulares.
- Projeção Albers equivalente, elipsoide GRS80: `+proj=aea +lat_1=-5 +lat_2=-32 +lat_0=-15 +lon_0=-54 +ellps=GRS80`.
- Mapshaper 0.7.90: topologia compartilhada, simplificação ponderada com intervalo de 4.000 metros e `keep-shapes`. Exportação intermediária em coordenadas planas com precisão de um metro, depois ajuste uniforme ao viewBox e arredondamento a uma casa decimal em unidades SVG. O GeoJSON intermediário não é publicado nem apresentado como longitude/latitude RFC 7946.
- SVG produzido com 27 paths e 51.812 bytes antes de sua inclusão no HTML. A ferramenta e a base bruta não são carregadas pelo visitante.

Para reproduzir, extrair o ZIP oficial com seus arquivos auxiliares juntos e executar:

```sh
npm ci
node scripts/gerar-mapa.mjs caminho/BR_UF_2025.shp
```

A [nota metodológica da edição 2025](https://biblioteca.ibge.gov.br/visualizacao/livros/liv102268.pdf), página impressa 9 (11ª do PDF), autoriza distribuição, adaptação e uso comercial com créditos sob licença compatível com CC BY 4.0. Também exige informar generalizações que alterem características da malha. Fonte, edição, link, licença e aviso de simplificação/reprojeção estão na legenda. As limitações descritas nas páginas anteriores foram consideradas: o mapa serve para consultar estatísticas e não para demarcação jurídica, definição de linha de costa ou cálculo de área ambiental.

## Registro da verificação inicial (antes da revisão)

Baseline anterior às alterações: **81 testes passaram**. A página inexistente foi primeiro verificada com teste que falhou por resposta HTTP 404. Os testes novos exercitam:

- Textos integrais em sequência, quatro seções, quatro perguntas metodológicas e igualdade do HTML dos rodapés.
- Seis valores dos biomas, proporções das barras e tabela equivalente.
- Todas as 27 UFs pela lista e pelo teclado; clique real em um ponto interno de cada uma das 27 geometrias; alternância rápida, limpeza de seleção, nomes e valores corretos.
- Caso de valor ausente após seleção válida, sem dados anteriores visíveis ou substituição por zero.
- Lista alfabética em pt-BR, estado inicial neutro, nomes acessíveis, `aria-pressed` e região `status` polite/atômica.
- Toque em viewport móvel e seletor com alvo de pelo menos 44 px; navegação por Tab, Enter, Espaço, Escape e foco preservado.
- Viewports 320×568, 390×844, 768×1024, 960×720, 1440×900, 1920×1080, 844×390 e 1280×420, com fonte raiz a 100% e 200%, sem overflow geral. A largura de 320 CSS px verifica reflow equivalente a 400% de zoom em uma janela de 1280 px; não é uma alegação de teste de zoom nativo do navegador.
- Crescimento/redução por altura da janela, preservando corpo mínimo de 16 px no tamanho padrão.
- Conteúdo estadual integral em tabela com JavaScript desativado a 320 px.
- Integração das três páginas, links e arquivos locais HTTP 200, subdiretório `/projeto/`, menu e Voltar ao topo com retorno de foco ao cabeçalho.
- Preferência de movimento reduzido, ausência de animações do conteúdo e rolagem instantânea nesse modo.
- axe-core 4.14.0, regras `wcag2a`, `wcag2aa`, `wcag21aa` e `wcag22aa`, em desktop sem seleção, ES e CE, e consulta móvel selecionada.

Uma revisão independente somente leitura encontrou que a primeira seleção pelo teclado empurrava o território focado para fora da viewport no celular. O problema foi reproduzido por três testes que falharam em 320×568, 390×844 e 844×390. A correção mantém o mesmo elemento focado e rola apenas o necessário para sua visibilidade, sem animação. Os três testes e o teste de clique nas 27 UFs passaram após a correção.

Contrastes calculados para as cores sólidas do conteúdo: texto principal/areia 12,39:1; texto secundário/areia 5,26:1; terracota/areia 5,70:1; limites dos estados/preenchimento neutro 4,24:1; texto claro/fundo escuro 15,68:1 e texto secundário/fundo escuro 10,46:1. O rodapé preserva a verificação de contraste da suíte existente sobre sua imagem de fundo.

Na revisão anterior, a inspeção da árvore de acessibilidade confirmou nomes completos, combobox com 27 opções mais a instrução, indicadores como termos/definições (esses blocos foram retirados na revisão atual), os 27 botões do SVG e estado pressionado apenas no território selecionado. Revisão visual por capturas conferiu abertura, gráfico e mapa em desktop e celular; a ordem de leitura e os valores visíveis foram preservados.

Resultado final: **104 testes passaram em 53,3 segundos**, incluindo os 81 existentes e 23 novos. `npm run check` passou para todos os scripts da aplicação e de desenvolvimento; `git diff --check` não encontrou erros de whitespace. As expectativas de Tab no teste antigo do menu foram atualizadas para considerar o novo link Dados. Não foi necessário alterar o comportamento do menu.

A regeneração cartográfica foi executada novamente com o pacote original, produzindo o mesmo SHA-256 de `dados.html`; o resultado é idêntico ao documento testado.

## Desempenho inicial de laboratório (antes da revisão)

Executado em 19/10/2026, às 14h59 (America/Sao_Paulo), depois da suíte, com `node scripts/medir-dados.mjs`. Chromium 153.0.8010.12, viewport 390×844 CSS px, emulação móvel com toque, CPU desacelerada 4×, latência de 150 ms, download de 1,6 Mbit/s, upload de 0,75 Mbit/s, cache desativado em cada contexto e servidor HTTP local sem compressão. Não havia execução simultânea da suíte durante a medição.

| Amostra | LCP observado | CLS inicial | Maior duração de evento observada na seleção de Acre |
| --- | ---: | ---: | ---: |
| 1 | 808 ms | 0 | 56 ms |
| 2 | 760 ms | 0 | 56 ms |
| 3 | 772 ms | 0 | 56 ms |
| 4 | 772 ms | 0 | 56 ms |
| 5 | 744 ms | 0 | 56 ms |

LCP mediano: **772 ms**. Transferência observada, incluindo documento, recursos e overhead reportado pelo navegador: **133.034 bytes** por carregamento. Cada seleção terminou com o indicador correto de **81.366 ha** para Acre. O relatório bruto fica em `test-results/desempenho-dados.json`, que é artefato local ignorado pelo Git e pode ser refeito com o script.

O CLS foi registrado no carregamento inicial, antes da consulta. As durações vieram de Event Timing, com limiar de 16 ms, após uma interação real por toque; a maior duração desse ensaio **não é uma medição de INP de campo**. Os resultados são favoráveis neste cenário de laboratório, mas não demonstram o percentil 75 de visitantes, comportamento em aparelhos físicos ou Core Web Vitals da hospedagem.

## Limitações e pendências

- **Termos de reutilização do INPE:** acesso e citação documentados, mas a licença expressa dos ZIPs anuais ainda precisa ser esclarecida antes de declarar a revisão pronta para publicação.
- **Direitos do fundo do rodapé:** licença da referência original ainda não comprovada. O usuário confirmou não saber sua autorização e pediu preservar o rodapé. Essa pendência impede declarar a página pronta para publicação.
- Não foi realizada audição dos anúncios em NVDA, JAWS, VoiceOver ou TalkBack. A região de anúncio e os nomes/estados foram verificados no DOM e na árvore de acessibilidade do Chromium; isso não substitui teste com leitor de tela real.
- Testes automatizados e inspeção visual no Chromium não comprovam conformidade integral à WCAG 2.2 AA. Não foram feitas sessões em aparelhos físicos nem uma matriz completa de navegadores/tecnologias assistivas.
- Medições locais de laboratório não equivalem ao percentil 75 de visitas reais nem confirmam Core Web Vitals do site hospedado. Nenhuma publicação ou coleta de dados de visitantes foi realizada.
