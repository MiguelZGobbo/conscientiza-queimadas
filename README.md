# Conscientiza Queimadas

Site educativo desenvolvido progressivamente nas Atividades Extensionistas I, II e III do curso de Engenharia de Software da UNINTER. A III é a etapa atual de implementação, publicação, divulgação e avaliação. A Home contém a navbar, o Hero, a seção **Impactos das queimadas** e o rodapé institucional. A página **Queimadas** aprofunda conceitos, causas, propagação e consequências. A página **Dados** apresenta o território atingido pelo fogo em 1985–2025, o histórico de focos 2003–2025, o acompanhamento de 2026 e a consulta recente das 27 UFs. A página **Prevenção** orienta como evitar queimadas, agir com segurança diante de incêndios e reduzir a exposição à fumaça. **Sobre o projeto**, acessível pelo rodapé, apresenta a origem, a trajetória e o responsável pela iniciativa acadêmica e educativa, sem caráter oficial da UNINTER ou de órgãos ambientais.

## Revisão de repetições — 19/10/2026

A página Dados combina panorama histórico e consulta estadual recente. A abertura e os seis biomas mostram o território atingido ao menos uma vez em 1985–2025 (RAF2025, Coleção 5, Tabela 3). Os focos nacionais têm histórico anual de 2003–2025 e acompanhamento acumulado de jan–set/2026 frente à média dos mesmos meses históricos. Estados: área out/2025–set/2026 versus média dos anos civis 2019–2024, distribuição mensal recente dos focos e histórico anual 2003–2025. Cada gráfico tem uma única lista de resultados acessíveis; tabelas estaduais existem apenas sem JavaScript. Home e Queimadas permanecem preservadas nesta revisão. A seção Entenda os dados foi revisada em 20/10/2026 para explicar esses produtos, recortes, médias e limites em quatro respostas curtas, encerrando a pendência editorial anterior.

Dados não contém mais o expansível Fontes e créditos. Créditos curtos, links originais, adaptações e licenças aplicáveis continuam junto às visualizações. A página `fontes.html`, acessível pelo rodapé, reúne as referências auditadas e os créditos. Os inventários completos e as pendências permanecem em `docs/recursos-e-licencas.md`, `docs/fontes-inpe.md` e `docs/auditoria-fontes-creditos.md`.

## Apresentação dos gráficos

Os biomas e a comparação estadual de área usam barras horizontais com nomes e valores alinhados. A distribuição mensal usa colunas a partir de 48 rem disponíveis. Os históricos anuais e as curvas acumuladas usam linhas a partir de 48 rem quando há posições legíveis para todos os números; abaixo disso, ou quando a geometria não comporta os rótulos, barras horizontais preservam os mesmos resultados e valores visíveis. Os limites acompanham a ampliação do texto. As curvas são identificadas diretamente no final como “2026” e “Média histórica”, com cores e traçados distintos. Nesse comparativo, o eixo mostra somente os meses; a distribuição estadual mantém mês e ano porque cruza dois anos civis.

Os gráficos ocupam até 64 rem, enquanto os parágrafos mantêm a coluna de leitura. Eixos começam em zero, com limites inteiros arredondados e referências discretas. Nas barras horizontais, marcações intermediárias aparecem a partir de 56 rem disponíveis; abaixo disso, zero e limite permanecem, evitando colisões com texto ampliado. Os valores usam pt-BR e as unidades ficam nas legendas. Meses máximos (incluindo empates) e o período mais recente recebem os destaques previstos. O mapa continua limitado a 40 rem/65% da altura da janela.

`src/graficos.js` compartilha o cálculo da escala, posições e eixos entre a geração estática e a atualização estadual. As listas de rótulos e valores são a apresentação acessível; linha, pontos, barras e eixos são decorativos. Não há biblioteca gráfica ou dependência de produção nova.

Todos os valores permanecem visíveis. O posicionamento considera os segmentos reais das linhas, marcadores, textos e bordas, buscando opções acima/abaixo e pequenos ajustes laterais, sem afastar indefinidamente os números. Eixos, linhas e pontos usam a mesma área de traçado; foi corrigido o deslocamento vertical de 16 px do comparativo.

`src/graficos-interacao.js` melhora progressivamente as seis figuras. O hover sempre prevalece sobre a seleção fixada; ao sair dos dados, o destaque retorna ao resultado clicado, ou desaparece se não houver seleção. Clique em outro resultado substitui a seleção; novo clique no mesmo remove a fixação, mantendo o hover enquanto o cursor estiver sobre os dados. No toque, ativações sucessivas selecionam ou removem, sem depender de hover. Cada gráfico tem uma entrada de teclado: setas e Home/End percorrem, Enter/Espaço fixa ou remove, Escape limpa e Tab segue normalmente. O teclado controla o destaque até novo movimento do mouse. Movimentos do mouse não geram anúncios; os comandos de teclado têm um status identificado.

Nas linhas, uma guia vertical discreta associa ponto e eixo; nas duas curvas, os dois resultados do mês são destacados juntos. O resultado ativo usa categoria sublinhada e realce de 1 px no marcador, preservando a cor da série. Nos biomas e na comparação estadual de área, uma regra compartilhada elimina o sublinhado: somente a barra ativa recebe `brightness(.9)`, sem mudar dimensões. Não há caixas nos números ou contornos nas barras. A geometria reserva o espaço do realce, e os valores não mudam de posição ao interagir. Rótulos deslocados ativam seu próprio resultado; títulos, fontes, nomes das curvas e margens não selecionam categorias. Não há painel repetido, filtro, zoom nem série ocultável. Links das fontes mantêm seu comportamento normal. Alterações de UF ou formato limpam hover e seleção. Se a melhoria falhar, dados e consulta estadual continuam disponíveis.


## Executar

Com Node.js 24.19.0 (versão fixada em `.node-version`):

```sh
npm ci
npm run dev
```

Abrir http://127.0.0.1:4173 e usar a navbar para Queimadas, Dados e Prevenção, ou os atalhos **Sobre o projeto** e **Fontes e créditos** no rodapé para `/sobre` e `/fontes`. O servidor é local e destinado ao desenvolvimento. A interface é estática. Para preparar a hospedagem, executar `npm run preparar:publicacao` e usar exclusivamente `dist/`; não publicar a pasta `src/` inteira do checkout. As seis páginas mantêm caminhos relativos e testes em subdiretório. A nova 404 foi preparada para a raiz do Cloudflare Pages, inclusive em rotas inexistentes profundas. Não há biblioteca de runtime no visitante. Servir por HTTP(S) para carregar o módulo local de dados.

## Organização

- `index.html`: conteúdo semântico, links e ilustração SVG autoral. A marca Conscientiza Queimadas segue o nome do repositório.
- `queimadas.html`: introdução compacta, conteúdo educativo aprovado em coluna centralizada, sumário Nesta página com títulos completos, diagrama SVG autoral e rodapé reutilizado. As referências confirmadas estão reunidas em `fontes.html`.
- `src/queimadas.css`: composição editorial da página educativa, com títulos acima dos textos e dimensionamento fluido conforme largura e altura da janela. Corpo entre 16 e 20 px, título inicial entre 28 e 44 px, rótulos transparentes no triângulo e intervalos internos compactos, usando os tokens compartilhados e sem alterar o Hero ou os impactos.
- `dados.html`: quatro seções editoriais, sumário como Queimadas, biomas, mapa SVG centralizado e consulta estadual com área e focos apresentados diretamente nos gráficos, sem indicadores duplicados; gráficos com listas de resultados acessíveis e tabelas estaduais exclusivamente sem JavaScript; rodapé existente.
- `src/dados.css`: escala fluida por largura e altura, mapa proporcional limitado a 40 rem e 65% da altura da janela e resultados abaixo dele em todas as larguras. Duas camadas decorativas acima dos territórios mantêm seleção contínua de 2 px e foco tracejado de 4 px, sem interceptar eventos ou alterar a ordem de Tab das 27 UFs.
- `prevencao.html` e `src/prevencao.css`: orientações fornecidas no handoff, sequência de segurança e canais oficiais; referências auditadas em `fontes.html`; escala e coluna reutilizadas de `src/queimadas.css`, sem JavaScript próprio.
- `sobre.html`: três blocos institucionais com texto aprovado, navbar existente e acesso pelo rodapé. Reutiliza a abertura compacta de `src/paginas.css`, a coluna e a escala fluida de `src/queimadas.css`, sem ilustração, stylesheet ou script próprios.
- `fontes.html`: referências educativas, dados e metodologia, recursos e créditos e referências técnicas. Acesso pelo rodapé das seis páginas, com o padrão visual e a escala de Sobre. Sem JavaScript ou dependências novos; imagens creditadas a Miguel Zager Gobbo, conforme confirmação de autoria, e termos específicos INPE explicitamente registrados. Ver `docs/verificacao-fontes.md`.
- `tests/sobre.spec.js` e `tests/fixtures/sobre-aprovado.json`: fidelidade editorial, acesso pelo rodapé das quatro páginas principais, subdiretório, teclado, acessibilidade, reflow, texto ampliado e comparação da escala com Queimadas e Prevenção. Resultados e limites em `docs/verificacao-sobre.md`.
- `src/dados-base.js`: 27 UFs e metadados do Monitor do Fogo; acumulado recente e média dos anos civis 2019–2024. `src/area-historica.js` contém os seis biomas e o total nacional da Tabela 3 do RAF2025. `scripts/importar-area.py` reproduz a base e `docs/auditoria-area.json` registra os valores originais e cálculos.
- `src/dados.js`: seleção sincronizada entre mapa e lista, barras e anúncio acessível; sem requisições externas.
- `src/focos-base.js` e `src/focos.js`: contagens locais do INPE, validação de completude, apresentação dos meses com maior contagem (incluindo empates) e atualização das listas, colunas e linhas dos períodos recentes.
- `scripts/importar-focos.py`: importador Python 3.10+ dos 23 arquivos anuais oficiais do satélite de referência; valida dados e grava contagens e auditoria com hashes, sem publicar os arquivos brutos.
- `scripts/gerar-paineis-focos.mjs`: gera os gráficos nacionais e modelos estaduais com geometria compartilhada e listas, além das tabelas estaduais exclusivas da alternativa sem JavaScript a partir dos dados locais, preservando mapa e textos.
- `scripts/gerar-mapa.mjs`: conversão reproduzível da malha original `BR_UF_2025.shp` para o SVG inline da página; Mapshaper somente no desenvolvimento.
- `scripts/medir-dados.mjs`: cinco amostras de desempenho de laboratório no Chromium, com rede/CPU limitadas, sem alegar métricas de campo.
- `tests/dados-graficos.spec.js`: escalas arredondadas, geometria da linha, mudanças de formato e sobreposição de valores nos limites responsivos.
- `tests/dados.spec.js` e `tests/fixtures/dados-aprovado.json`: conteúdo e valores independentes do código de produção, consulta estadual, mapa, acessibilidade, responsividade e integração.
- `tests/dados-finalizacao.spec.js`: quatro respostas da metodologia, camadas de contorno sobre os vizinhos, preservação das geometrias e da ordem de Tab das 27 UFs, espessura em diferentes janelas e alternativa sem JavaScript.
- `docs/verificacao-dados.md`: conferência das fontes, decisões, testes e limitações da página Dados.
- `docs/fontes-inpe.md` e `docs/auditoria-focos.json`: fontes e condições de uso específicas do INPE, contagens e hashes dos 23 arquivos anuais e nove mensais; licença de reutilização expressa dos ZIPs ainda não identificada.
- `src/styles.css`: tokens, layout mobile-first, navbar, enquadramentos da paisagem e animações acessíveis.
- `src/navigation.js`: sincronização acessível do menu nativo e gerenciamento de foco.
- `src/hero-interaction.js`: brilho decorativo, reação da chama próxima e deslocamento curto da fumaça no SVG original. A textura local é solicitada somente em desktop com mouse e movimento permitido; falha ou ausência de JavaScript preserva a fumaça inline.
- `src/smoke.svg`: textura vetorial de fumaça, compartilhada por duas plumas. O Hero usa SVG inline nítido em qualquer densidade, com três silhuetas de chama e ritmos independentes. Mobile, touch, movimento reduzido e ausência de JavaScript mantêm a cena estática completa.
- `src/artwork/originais/`: originais do rodapé e arquivo histórico da pintura do Hero descartada, sem carregamento pelo site. Origem, prompt e exportações em `src/artwork/README.md`.
- `src/favicon.svg`: símbolo autoral da marca sobre fundo verde escuro, registrado como ícone da aba.
- `src/footer-background.webp` e variantes de 768, 960, 1440 e 1920 px: painel ilustrado do rodapé, reconstruído em 2014 × 780 px nativos. A paisagem ocupa até 960 px CSS e recebe resolução suficiente em 2×; o restante do fundo usa CSS. Seleção por `srcset`/`sizes`, sem ampliação artificial.
- `scripts/dev-server.mjs`: servidor local com módulos nativos do Node.
- `tests/hero.spec.js`: verificação funcional no Chromium.
- `tests/impacts.spec.js`: semântica, layout responsivo, rolagem natural, texto ampliado, contraste e movimento reduzido da transição e dos impactos.
- `tests/footer.spec.js`: conteúdo e semântica do rodapé, layout responsivo, texto ampliado, contraste e navegação por teclado.
- `tests/queimadas.spec.js`: conteúdo editorial revisado, integração das páginas, igualdade dos rodapés, leitura responsiva, contraste, teclado, movimento reduzido e publicação em subdiretório.
- `tests/prevencao.spec.js`, `tests/prevencao-acessibilidade.spec.js` e `tests/fixtures/prevencao-aprovado.json`: fidelidade editorial, contatos, integração das quatro páginas, rodapés idênticos, subdiretório, acessibilidade e responsividade.
- `tests/fixtures/queimadas-aprovado.md`: referência editorial independente, com as remoções de repetições autorizadas pelo usuário, para verificar fidelidade e sequência.
- `docs/hero-design.md`: decisões e escopo.
- `docs/recursos-e-licencas.md`: autoria e registro de recursos.
- `docs/verificacao-hero.md`: verificações realizadas e limites.
- `docs/verificacao-impactos.md`: decisões e verificações da transição para os impactos.
- `docs/verificacao-rodape.md`: estrutura, integração futura e verificações do rodapé.
- `docs/verificacao-queimadas.md`: decisões, verificações, limitações e integrações futuras da página Queimadas.

- `docs/verificacao-prevencao.md`: decisões, fontes conferidas, verificações e limites da página Prevenção.

## Navegação e destinos institucionais

Os destinos publicados usam caminhos relativos ao diretório de cada documento e funcionam sem JavaScript:

| Elemento | Destino preparado |
| --- | --- |
| Marca na Home | `./` |
| Início na navbar das seis páginas / marcas nas páginas secundárias | `./` |
| Queimadas na navbar das seis páginas | `./queimadas` |
| Dados na navbar das seis páginas | `./dados` |
| Prevenção na navbar das seis páginas | `./prevencao` |
| Sobre o projeto, somente no rodapé das seis páginas | `./sobre` |
| Fontes e créditos, somente no rodapé das seis páginas | `./fontes` |
| Voltar ao topo no rodapé das seis páginas | `#inicio` |

**Prevenção** está integrada às quatro páginas por links relativos, com `aria-current="page"` somente no documento atual. Os encerramentos seguem o percurso Queimadas → Dados → Prevenção, com “Explorar os dados das queimadas” e “Conhecer as orientações de prevenção”. A síntese dos impactos continua na Home, e seu CTA permanece apontando para `#impactos`. Os telefones e links oficiais estão diretamente no HTML de Prevenção e podem ser revisados sem alterar scripts.

As cinco páginas internas compartilham a abertura `.page-intro` de `src/paginas.css`. Queimadas, Dados e Prevenção também usam os encerramentos desse arquivo e ilustrações SVG decorativas, com texto antes da imagem em telas pequenas e duas colunas a partir de 960 px. Sobre e Fontes mantêm uma única coluna sem ilustração. Os estilos globais oferecem hover dourado na navbar e dissolução nativa de 180 ms entre documentos, somente a partir de 960 px com mouse, movimento permitido e suporte do navegador. Em Sobre e Fontes, a dissolução também exige scripts disponíveis, evitando o bloqueio da interação observado no Chromium sem JavaScript. A navegação permanece nativa e funciona sem JavaScript.

No rodapé de cada documento, **Voltar ao topo** aponta para seu próprio `#inicio`: volta suavemente ao cabeçalho e transfere o foco sem recarregar ou trocar de página. A âncora funciona sem JavaScript; com movimento reduzido, a chegada é instantânea. O cabeçalho recebe `tabindex="-1"` para acolher o foco sem uma parada adicional de Tab. **Sobre o projeto** e **Fontes e créditos** abrem `./sobre` e `./fontes`, sem aparecer na navbar; nessas páginas, nenhum dos quatro itens principais recebe `aria-current="page"`. **Feedback** abre diretamente `https://forms.gle/wLPDbMi2CeicbYYH9` em uma nova aba, com a descrição acessível “Formulário externo no Google Forms. Abre em nova aba.” associada por `aria-describedby`. As referências de Queimadas foram selecionadas pela auditoria para a página Fontes, com as pendências mantidas na documentação. O HTML do rodapé é idêntico nas seis páginas e usa o mesmo CSS e a mesma imagem. A atribuição acadêmica menciona as Atividades Extensionistas I, II e III.

O rodapé fica fora do conteúdo principal e reutiliza os tokens escuros, a tipografia e o container da Home. Seus quatro grupos mantêm a ordem identidade, navegação, institucional e contexto acadêmico: uma coluna abaixo de 600 px, duas entre 600 e 1199 px e quatro a partir de 1200 px. No desktop, o fundo raster preparado a partir do exemplo 3 cobre o rodapé, com a paisagem de entardecer à esquerda e a área escura para os grupos à direita. Em telas menores, a paisagem aparece abaixo dos grupos e as divisórias verticais são removidas. A logo vetorial original do cabeçalho acompanha o nome em duas linhas, sem a folha criada na primeira versão. Logo e imagem de fundo são decorativas, sem identificar espécies ou um local documentado. O link Voltar ao topo é sublinhado, tem área mínima de 44 × 44 px e foco visível. O rodapé funciona sem JavaScript e cresce livremente com texto ampliado. A autoria das imagens, incluindo a referência do fundo, foi confirmada por Miguel Zager Gobbo; o registro está em `docs/recursos-e-licencas.md`.

A seção de impactos fica abaixo da primeira tela. O Hero oferece o link textual sublinhado **Ver impactos das queimadas ↓**, que aponta para `#impactos` e usa a navegação nativa de âncora: ao ativá-lo, o navegador desloca a página e foca a seção. A navegação por fragmento usa `scroll-behavior: smooth` quando não há preferência por movimento reduzido; com `prefers-reduced-motion: reduce`, a chegada é instantânea. Funciona sem JavaScript e mantém a rolagem manual do navegador. A duração e a curva da suavização são definidas pelo navegador. A seta é decorativa e estática; o link tem área de toque de pelo menos 44 px de altura, tipografia fluida de 16–18 px e foco visível. A seção usa `tabindex="-1"` para receber foco pela âncora sem acrescentar uma parada de Tab.

Ao rolar naturalmente, o recorte estático de terreno prolonga a cor do chão sobre o fundo areia: seu `clip-path` tem altura fluida entre 16 e 40 px, com 1 px adicional para evitar frestas. A seção usa texto verde escuro, numeração terracota e divisórias finas. Os três eixos ficam em uma coluna abaixo de 960 px e em três colunas a partir dessa largura. Sua altura mínima é `100svh`, com fallback em `100vh`, para permitir que o destino comece no topo sem manter parte do Hero visível. A altura cresce livremente conforme o conteúdo, a orientação, o tamanho da tela e a ampliação do texto, sem cards ou imagens.

O título e os três eixos de Impactos permanecem visíveis e estáticos, sem animação de revelação. A rolagem suave pelos atalhos do Hero e do rodapé continua nativa, funciona sem JavaScript e respeita a preferência por movimento reduzido.

O Hero ocupa no mínimo `100svh` menos a navbar, com fallback em `vh`, e cresce naturalmente quando conteúdo ou zoom exigem. Tipografia e espaçamento consideram largura e altura da viewport, com limites em `rem` para leitura. No mobile, uma medida compartilhada controla a paisagem e seu espaço reservado abaixo do texto. A reserva continua válida em orientação horizontal com texto ampliado. Nos impactos, títulos, textos e espaçamentos crescem e diminuem conforme a largura e a altura úteis da janela, por CSS, sem JavaScript ou recarregamento. No desktop, uma medida tipográfica compartilhada varia entre 14 e 22 px e mantém as proporções do corpo, títulos dos eixos e números; o título principal varia entre 28 e 72 px. No mobile, o corpo mantém 16 px. As medidas usam limites em `rem` para respeitar a ampliação do texto. A seção cresce naturalmente quando necessário, sem altura fixa ou conteúdo escondido.

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

Os testes do importador rodam separadamente com `python -m unittest discover -s tests -p "test_importar_focos.py" -v`. Para reproduzir a edição de focos encerrada em setembro/2026, executar `python scripts/importar-focos.py` e depois `node scripts/gerar-paineis-focos.mjs`. O importador baixa os 23 ZIPs de referência de 2003–2025 e os nove CSVs mensais de 2026, filtrados por AQUA_M-T, e rejeita totais ou formatos incompatíveis; uma nova edição exige revisar fontes e referências, não apenas trocar o ano. A página publicada usa somente os agregados locais.

Com `npm run dev` ativo, `node scripts/medir-dados.mjs` salva medições em `test-results/desempenho-dados.json`. A documentação de Dados registra os cenários, resultados e limites dos testes. A pendência de autoria e autorização da referência do rodapé foi encerrada após a confirmação de autoria de Miguel Zager Gobbo, registrada em `docs/recursos-e-licencas.md`.

### Reprodução dos dados e dos painéis

```powershell
python scripts/importar-area.py --cache-dir "$env:TEMP\conscientiza-monitor-20261019"
python scripts/importar-area-historica.py --cache "$env:TEMP\conscientiza-raf-tabela3.html"
python scripts/importar-focos.py
node scripts/gerar-paineis-focos.mjs
```

Para reprodução sem rede, os dois importadores de séries aceitam `--input-dir` e o importador do RAF aceita `--input`. O Monitor guarda 35 séries de 93 competências; o importador usa `Decimal` para somas e médias, com arredondamento somente na exibição. A referência estadual soma janeiro–dezembro de cada ano de 2019–2024 e divide os seis totais por seis. O acumulado recente pode contar uma área em meses diferentes.

O RAF usa outra medida: território atingido uma única vez em 1985–2025. O total da Tabela 3 é **208.441.608 ha**, soma dos seis biomas; diverge em **4.673 ha** da Tabela 2. Preservamos a Tabela 3 no panorama e registramos a divergência em `docs/auditoria-area-historica.json`, incluindo HTML original, URL e hash.

A série INPE registra anos civis completos, competências recentes e acumulados separados. Para cada mês de 2026, a referência é a média dos acumulados janeiro–mês nos 23 anos de 2003–2025. Não é previsão. As contagens observadas são inteiras; médias de focos usam uma casa decimal, sem arredondar o cálculo. `docs/auditoria-focos.json` registra arquivos, hashes, duplicatas, lacunas e cálculos. Os arquivos de 2026 não trazem AQUA_M-T em 03/05, 10/07 e 22/07; não estimamos detecções ausentes.

O seletor combobox/listbox mantém confirmação separada da navegação, sincroniza com o mapa e possui alternativa nativa. Os históricos anuais usam linha quando há largura e barras horizontais no celular, mantendo valores visíveis. As duas curvas acumuladas compartilham escala e se distinguem por legenda, cor e traçado. Sem JavaScript, gráficos nacionais e tabelas estaduais permanecem disponíveis.

A edição permanece fixada em setembro/2026. Cada indicador tem produto, unidade e período próprios; o gerador valida esses contratos separadamente. A página publicada usa somente arquivos locais. Documentação completa: `docs/fontes-monitor-fogo.md`, `docs/fontes-inpe.md` e `docs/verificacao-dados.md`. A metodologia distingue território atingido uma vez de soma mensal, detecções de incêndios e as duas médias utilizadas, sem tratar os 12 meses recentes como um recorte único de toda a página. As pendências de direitos de uso permanecem registradas.


## Preparação técnica local — 26/10/2026

A candidata estática é gerada sem bundler e sem transformar os recursos:

```powershell
npm run preparar:publicacao
npm run dev -- --root dist
# Para conferir subdiretório, encerrar o servidor anterior e executar:
npm run dev -- --root dist --prefix /projeto/
```

Publicar futuramente somente o conteúdo de `dist/`, nunca a raiz do checkout. O manifesto com tamanhos e SHA-256 fica em `.auditoria-local/manifesto-publicacao.json`; originais artísticos, documentos, testes e ferramentas não entram na distribuição. A geração local não faz upload nem deploy.

```powershell
npm run check
npm test
npm run test:publicacao
# Com o servidor local ativo; cinco amostras por página/perfil:
npm run medir:site -- --base-url http://127.0.0.1:4173/ --phase antes --output .auditoria-local/antes
npm run medir:site -- --base-url http://127.0.0.1:4173/ --phase depois --output .auditoria-local/depois
```

Não executar testes ou outros ensaios de navegador simultaneamente às medições. Os relatórios Lighthouse completos e demais artefatos locais ficam em `.auditoria-local/`, preservados entre execuções do Playwright. Evidências selecionadas acompanham os relatórios em `docs/evidencias-pre-publicacao/`.

Entrega: [auditoria](docs/auditoria-pre-publicacao.md), [desempenho](docs/performance-antes-depois.md), [checklist](docs/checklist-validacao.md), [guia de publicação futura](docs/guia-publicacao.md) e [inventário para decidir hospedagem](docs/inventario-tamanho-hospedagem.md). Nenhuma hospedagem foi escolhida e nenhuma publicação foi realizada. As pendências de domínio, provedor, direitos INPE e conteúdo factual continuam explícitas nesses documentos.


## Preparação Cloudflare Pages — 27/10/2026

Trabalho sempre na `main`. A candidata local acrescenta `404.html` e `_headers` à lista explícita, mantém o manifesto fora de `dist/` e fixa Node em `.node-version`. A atualização de `dist/` valida dependências e conteúdo existente antes de escrever os arquivos permitidos, sem apagar a pasta. Conteúdo inesperado exige revisão; não usar limpeza destrutiva.

A configuração futura é Pages / None / raiz do repositório / produção `main` / build `npm run preparar:publicacao` / saída `dist`. Nenhuma configuração remota, commit, push ou publicação foi realizada. A integração Git poderá publicar automaticamente após pushes futuros autorizados.

A CSP foi exercitada primeiro em Report-Only; a candidata usa enforcement e bloqueia iframe, conforme decisão do responsável. O servidor de desenvolvimento comum não aplica `_headers`: os testes de distribuição leem o arquivo publicado e aplicam seu subconjunto de regra `/*` numa fixture local. Aliases sem extensão locais não simulam os redirecionamentos do Pages.

Entregas: [relatório desta fase](docs/relatorio-preparacao-cloudflare.md), [política seletiva do Git](docs/politica-repositorio.md) e [checklist de ativação](docs/checklist-ativacao-cloudflare.md). Canonical, OG com URLs absolutas e sitemap aguardam a origem real. Visibilidade do GitHub e autorização de publicação permanecem decisões separadas.

## Rodapé e desempenho móvel — 27/10/2026

O rodapé compartilha a escala fluida por largura e altura das páginas. Os links internos usam URLs sem extensão para evitar a normalização 308 do Cloudflare; os arquivos `.html` e seus acessos antigos continuam disponíveis. O servidor local aceita os aliases também em `/projeto/`.

`npm test` inclui a suíte Chromium e as regressões móveis em WebKit. `npm run check` também executa um ensaio curto do medidor em WebKit para conferir a contagem de redirects. Instalar os motores com `npx playwright install chromium webkit` ao preparar outro ambiente. O medidor `npm run medir:site -- --base-url URL --phase antes --output PASTA --runs 5` aceita loopback e a origem pública deste projeto; produz dados locais, não publica conteúdo. Consulte `docs/relatorio-rodape-performance-mobile.md` para protocolo, comparação e aceite físico pendente.
