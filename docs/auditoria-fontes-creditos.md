# Fontes e créditos — auditoria e proposta para aprovação

Data: 26/10/2026. Inspeção do estado local iniciado no commit `1c79182`.

Este documento registra as etapas de inspeção, auditoria, verificação e proposta do handoff, inicialmente entregues sem alteração de código. Após a apresentação da proposta, o usuário solicitou colocar a página no atalho “Fontes e créditos” do rodapé. A implementação local adotou a proposta abaixo; resultados em `docs/verificacao-fontes.md`. As pendências de fontes e direitos permanecem registradas, sem anúncio de publicação externa.

Classificação usada: **A**, utilizada e confirmada; **B**, consultada, mas não utilizada no conteúdo final; **C**, duplicada a consolidar; **D**, verificação ou vínculo ainda pendente; **E**, recurso sem autorização comprovada. A mera presença no catálogo não comprova consulta individual, uso, licença ou autoria. Uma mesma referência pode ter origem e uso confirmados, mas continuar com uma condição específica pendente; essas dimensões são discriminadas nas tabelas.

## Estrutura atual e reaproveitamento

O projeto é um site estático de múltiplos documentos HTML, sem framework e sem dependências JavaScript de produção. `sobre.html` carrega `src/styles.css`, `src/paginas.css`, `src/queimadas.css` e `src/navigation.js`.

Sobre contém um `main#conteudo`, uma introdução com H1 e dois parágrafos e duas seções H2: Origem e trajetória e Responsável pelo projeto. O cabeçalho e o rodapé são repetidos nos cinco documentos, com a mesma estrutura; não existe um sistema de templates que deva ser substituído para esta tarefa.

Reutilização proposta:

- `.container.reading-column`: coluna central de até 68ch, acrescida das margens laterais.
- `.page-intro` e `.page-intro__text`: abertura compacta verde escura, título claro e texto secundário.
- `.reading-section`, `.reading-section__layout` e `.reading-section__body`: seções em fundo areia, texto verde escuro, divisórias discretas e espaçamentos fluidos.
- H2 e H3 existentes, listas semânticas e links descritivos para organizar referências. Sobre não utiliza cards; não há razão para introduzir uma grade de cards na nova página.
- Navbar, marca, menu popover nativo, atalho para conteúdo, foco visível, movimento reduzido e rodapé existentes.

Evidências: `sobre.html:11`, `sobre.html:46`, `sobre.html:57`, `sobre.html:68`, `sobre.html:81`; `src/queimadas.css:1`; `src/paginas.css:1`.

## Responsividade existente

O redimensionamento ocorre por CSS fluido e consultas de mídia, sem JavaScript que redimensione textos:

| Elemento | Regra existente |
| --- | --- |
| Margens laterais | `--page-gutter: clamp(20px, 5vw, 80px)` |
| Container geral | `width: min(100%, 1440px)` |
| Corpo das páginas de leitura | `clamp(1rem, min(1.15vw, 2.3svh), 1.25rem)` |
| Intervalo entre elementos | `clamp(1rem, min(2vw, 3svh), 2rem)` |
| Espaço vertical de seção | `clamp(2.5rem, min(6vw, 9svh), 5rem)` |
| H1 | `clamp(1.75rem, min(3vw, 6svh), 2.75rem)` |
| H2 | `clamp(1.75rem, min(3vw, 6svh), 3rem)` |
| Coluna de leitura | `min(100%, calc(68ch + var(--page-gutter) * 2))` |

As unidades `vw` e `svh` consideram largura e altura; os limites em `rem` acompanham a fonte raiz. A navbar torna-se horizontal a partir de 960px. O rodapé usa uma coluna em telas pequenas, duas a partir de 600px e uma composição com quatro grupos e arte ao fundo a partir de 1200px; uma container query de 64rem volta a duas colunas quando o espaço disponível exige. As regras especiais de janelas baixas do cabeçalho e da Home serão preservadas.

A futura classe de página deverá participar dos seletores compartilhados de leitura e foco, preservando valores e breakpoints. URLs não serão usadas como rótulos extensos; os itens também terão quebra de palavras e `min-width: 0` quando necessário. Nenhuma largura fixa ou altura fixa de conteúdo será introduzida.

Evidências: `src/styles.css:13`, `src/styles.css:31`, `src/styles.css:231`, `src/styles.css:255`, `src/styles.css:259`, `src/styles.css:268`, `src/styles.css:311`; `src/queimadas.css:3`; `src/paginas.css:15`; `src/navigation.js`.

## Integração pelo rodapé: diferença em relação ao handoff

O texto “Fontes e créditos” já existe, mas **não é um link**: é um `<li>` sem interação e acompanhado de aviso de indisponibilidade. Não foi encontrada rota correspondente. O servidor local autoriza apenas Início, Queimadas, Dados, Prevenção e Sobre.

Proposta: criar `fontes.html`, ativar `./fontes.html` nos cinco rodapés existentes e no novo, autorizar esse documento em `scripts/dev-server.mjs` e restringir o aviso de indisponibilidade a Feedback. Preservar a navbar com seus quatro itens e o retorno local `#inicio`, com o cabeçalho focável da própria página. Manter links relativos para implantação em subdiretório.

Evidências: `index.html:166`, `queimadas.html:230`, `dados.html:1382`, `prevencao.html:217`, `sobre.html:104`, `scripts/dev-server.mjs:13`.

## Referências técnicas: seleção e limites

O registro `docs/recursos-e-licencas.md:165` documenta consulta a cinco referências: WCAG 2.2 em português, WAI, artigo de leitura online da Nielsen Norman Group, GOV.UK Design System e web.dev. Há evidência correspondente de aplicação de semântica, foco, reflow, redução de movimento e verificação automatizada no código e nos testes. Não há incorporação de componentes ou código desses portais.

Links reabertos nesta auditoria:

- [WCAG 2.2 em português](https://www.w3.org/Translations/WCAG22-pt-BR/) e [original W3C](https://www.w3.org/TR/WCAG22/): diretrizes de acessibilidade; uma entrada pode reunir os dois idiomas.
- [WAI](https://www.w3.org/WAI/): portal de orientações; pode ser agrupado com W3C/WCAG.
- [How People Read Online: New and Old Findings](https://www.nngroup.com/articles/how-people-read-online/), Kate Moran, 5 de abril de 2020: leitura e escaneabilidade.
- [GOV.UK Design System](https://design-system.service.gov.uk/): referência de interface, sem afirmar adoção de seu frontend.
- [web.dev](https://web.dev/): referência de desenvolvimento; [Web Vitals](https://web.dev/articles/vitals?hl=pt-br) pode explicar as medições registradas, mas não comprova atingimento de metas em visitas reais.

Classificação: A para as referências documentadas e relacionadas ao trabalho; C para versões/portais agrupados. Os demais links técnicos do catálogo não devem ser acrescentados automaticamente: não há rastreabilidade individual suficiente para afirmar que cada artigo, técnica ou componente foi efetivamente usado. Permanecem D quanto ao uso específico, ou B quando apenas consulta estiver documentada. DEFRA e W3C Design System Settings não têm uso identificado na implementação inspecionada. A Lei nº 9.610/1998 pertence à verificação de direitos, não é uma fonte educativa sobre queimadas nem uma licença dos recursos do site.

Não declarar certificação, conformidade integral WCAG 2.2 AA, homologação institucional ou metas de Core Web Vitals a partir da consulta a referências e da automação local.

## Verificação desta inspeção

Executado: `npm test -- tests/sobre.spec.js --reporter=line`. Resultado: **16 testes passaram**, Chromium, 26/10/2026. Foram exercitados oito tamanhos de janela, texto a 100% e 200%, escala compartilhada, integração dos cinco rodapés, subdiretório, teclado, menu móvel, foco, navegação sem JavaScript, movimento reduzido e regras automatizadas do axe. Capturas atuais de 320px e 1440px foram inspecionadas visualmente.

Essa evidência descreve a página Sobre existente; ainda não existe uma página Fontes para validar. Fonte raiz a 200% e reflow não substituem zoom nativo. Leitores de tela reais, dispositivos físicos, Firefox e Safari não foram verificados nesta inspeção. A suíte completa não foi repetida, pois não houve mudança de produto.

## Dados, metodologia e cartografia efetivamente utilizados

O catálogo do handoff não corresponde integralmente à versão atual. A seleção deve partir das bases carregadas e dos créditos junto às visualizações.

| Fonte utilizada | Informação publicada e transformação | Rastreabilidade e condições |
| --- | --- | --- |
| MapBiomas Fogo, RAF2025, Coleção 5, Tabela 3 | Panorama nacional e seis biomas: território atingido ao menos uma vez em 1985–2025; 208.441.608 ha. Não é a soma anual das áreas, que poderia contar recorrências. | `src/area-historica.js:1`, `docs/auditoria-area-historica.json`, `dados.html:85`. [Tabela 3 oficial](https://raf.ia.mapbiomas.org/raf2025/publication-web-resources/html/publication-20.html). |
| MapBiomas Monitor do Fogo, Coleção 1 | Área das 27 UFs: soma dos meses out/2025–set/2026, comparada à média dos anos civis 2019–2024. São períodos de composição diferente, explicitados no site; não atribuir essa comparação ao RAF/Tabela 15. | `src/dados-base.js:1`, `docs/fontes-monitor-fogo.md:7`, `docs/auditoria-area.json`. [Produto e método](https://brasil.mapbiomas.org/iniciativas-e-produtos/fogo/monitor-do-fogo/), [documentação da API de estatísticas](https://plataforma.monitorfogo.mapbiomas.org/api/docs/). |
| INPE, Programa Queimadas, AQUA_M-T | Focos de fogo ativo: histórico 2003–2025, acumulados jan–set/2026 e distribuição estadual out/2025–set/2026. Agregações locais dos arquivos anuais e mensais oficiais, filtradas pelo satélite de referência. Não são hectares nem número de incêndios individuais. | `src/focos-base.js:1`, `docs/fontes-inpe.md:3`, `docs/auditoria-focos.json`. [Arquivos oficiais](https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/), [FAQ metodológica](https://terrabrasilis.dpi.inpe.br/queimadas/portal/pages/secao_informacoes/faq/). |
| IBGE, Malha Municipal Digital 2025, BR_UF_2025.zip | Limites estaduais reprojetados, simplificados e convertidos para SVG pelo gerador local; mapa e contorno decorativo da abertura de Dados. Nenhuma estatística de área foi calculada a partir desse SVG. | `scripts/gerar-mapa.mjs:6`, `dados.html:265`, `docs/recursos-e-licencas.md:18`. [Diretório oficial do arquivo](https://geoftp.ibge.gov.br/organizacao_do_territorio/malhas_territoriais/malhas_municipais/municipio_2025/Brasil/), [informações técnicas e legais 2025](https://biblioteca.ibge.gov.br/visualizacao/livros/liv102268.pdf). |

MapBiomas: uso aberto, gratuito e com citação, com atribuição CC BY 4.0 confirmada no portal oficial. O crédito deve nomear o produto, a coleção e o período realmente utilizados, oferecer o link à fonte e à [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.pt-br) e indicar a agregação/adaptação. Não atribuir a licença MapBiomas aos dados do INPE.

IBGE: a página impressa 9 das informações técnicas e legais 2025 confirma condições compatíveis com CC BY 4.0 para a malha e os derivados, com atribuição e declaração do processamento que alterou as características originais. O PDF oficial retornou 403 no navegador de pesquisa, mas foi obtido e teve o texto extraído em memória pela auditoria com Python; a licença foi reconfirmada nessa fonte primária. O shapefile original não está na árvore atual: há documentação da origem e do procedimento, mas não foi possível conferir novamente os bytes/hashes do arquivo de entrada efetivamente usado.

INPE: a FAQ confirma acesso livre e gratuito e determina citação conforme ABNT. Não foi localizada licença expressa específica para os ZIPs/CSVs incorporados. Registrar esses termos como tais e manter a definição da licença/reutilização como pendência; não presumir proibição nem uma Creative Commons não comprovada. `docs/fontes-inpe.md` já conserva a referência e os limites.

### Divergências investigadas e referências históricas

- **Ceará/Tabela 15 do RAF2025:** a tabela informa média de 51.713 ha, 79.452 ha em 2025 e variação de +13%; os dois valores de área implicam aproximadamente +53,6%. A contradição existe no relatório, mas essa tabela não alimenta mais o site atual. Classificação B para uso histórico, sem republicação automática e sem trocar silenciosamente os dados atuais.
- **RAF2025, Tabelas 2 e 3:** o total da Tabela 3 supera o da Tabela 2 em 4.673 ha. O site adota exclusivamente a Tabela 3; seus seis biomas somam exatamente 208.441.608 ha. Conservar a fonte específica e a ressalva documental, sem misturar os totais. Evidência: `docs/auditoria-area-historica.json:25`.
- **Monitor do Fogo:** a auditoria documenta diferença de 778,79 ha entre agrupamentos oficiais por UF e por bioma no recorte recente. A causa não foi confirmada. Os estados usam o agrupamento por UF; o gráfico publicado de biomas usa o RAF/Tabela 3, não os biomas do Monitor. Evidência: `docs/fontes-monitor-fogo.md:28`.
- Tabelas 4/5/15, médias antigas de `docs/auditoria-biomas.json` e portais genéricos de downloads/relatórios não devem substituir os produtos efetivamente utilizados. As referências históricas podem permanecer na documentação interna. URLs duplicadas do INPE devem convergir para a FAQ e os arquivos usados, sem entradas repetidas.

Não foram refeitos downloads e importações integrais de todos os dados brutos nesta etapa. A conferência combinou as bases incorporadas, seus metadados, registros de auditoria, scripts de transformação e fontes oficiais. A página futura deverá preservar os créditos próximos às visualizações, além da referência completa na página institucional.

## Inventário de recursos e créditos

| Recurso | Fonte e autor/órgão comprovável | Licença/estado | Link ou evidência | Forma de crédito proposta |
| --- | --- | --- | --- | --- |
| Hero, paisagem, fogo e fumaça | Código SVG local; documentação descreve criação no projeto, sem autoria individual comprovada | Sem material externo identificado; licença pública geral não definida | `index.html:54`, `src/smoke.svg:1`, `docs/recursos-e-licencas.md:31` | “Ilustrações vetoriais e interação desenvolvidas para o projeto”; não inventar autor ou licença. |
| Marca e favicon | SVG inline e adaptação local da marca | Documentados como desenhos do projeto; há referência visual enviada sem procedência identificada | `index.html:21`, `src/favicon.svg:1`, `docs/recursos-e-licencas.md:33` | Identificar como recursos desenvolvidos no projeto; confirmar a natureza da referência antes de afirmar independência integral de terceiros. |
| Menu, marcador e ilustrações de Queimadas/Prevenção | SVGs inline locais, sem pacote de ícones | Nenhuma obrigação externa identificada; sem licença geral presumida | `index.html:27`, `index.html:176`, `queimadas.html:53`, `prevencao.html:59` | Crédito coletivo de desenvolvimento, se útil; não atribuir a Font Awesome, Lucide ou outro banco não utilizado. |
| Fundo do rodapé: cinco WebPs responsivos | Painel produzido com ImageGen; exportação com Sharp; deriva de anexo/mockup do usuário | E: autorização da referência original não comprovada | `src/artwork/README.md:5`, `docs/recursos-e-licencas.md:58`, `src/artwork/originais/rodape-painel.png` | Identificar produção assistida por ImageGen e as adaptações, após resolver os direitos da referência. Crédito não substitui autorização. |
| Dados e mapa | MapBiomas, INPE e IBGE | Condições distintas, detalhadas na seção anterior | Bases, fontes e scripts citados acima | Instituição, produto, edição/período, fonte, licença comprovada e alterações. |
| Gráficos e interação | HTML/CSS/SVG/JavaScript do projeto | Nenhuma biblioteca gráfica de produção | `src/graficos.js`, `src/graficos-interacao.js`, `src/dados.js` | Desenvolvimento do projeto; não creditar biblioteca não utilizada. |
| Tipografia | Fonte de interface do sistema do visitante | Nenhum arquivo de fonte redistribuído ou serviço de fontes incorporado | `src/styles.css:15`; [definição W3C de famílias genéricas](https://www.w3.org/TR/css-fonts-4/#generic-font-families) | Não há família comercial/webfont específica a creditar. |
| UNINTER | Menção textual ao contexto acadêmico | Nenhum logo oficial incorporado nem endosso institucional demonstrado | `sobre.html:72`, `index.html:174` | Preservar a identificação acadêmica e a ressalva de não oficialidade; não inventar crédito de logotipo. |

Os PNGs de Hero rejeitados e arquivados em `src/artwork/originais/` não são carregados pela versão atual. Não devem receber entradas públicas como recursos utilizados. A documentação da geração e os originais podem continuar no histórico interno. As imagens atuais não são fotografias documentais de Itaguaçu ou de espécies vegetais específicas.

### Ferramentas de desenvolvimento e licenças confirmadas

As dependências diretas são apenas de desenvolvimento. Metadados do lockfile e arquivos LICENSE instalados foram conferidos:

| Pacote | Versão | Licença | Utilização e fonte oficial |
| --- | --- | --- | --- |
| @playwright/test, playwright e playwright-core | 1.63.0 | Apache-2.0 | Testes/medições; Microsoft. [Licença](https://github.com/microsoft/playwright/blob/main/LICENSE). |
| axe-core | 4.14.0 | MPL-2.0 | Verificações de acessibilidade nos testes; Deque Systems e colaboradores. [Licença](https://github.com/dequelabs/axe-core/blob/develop/LICENSE). |
| mapshaper | 0.7.90 | MPL-2.0 | Geração local do mapa; Matthew Bloch e colaboradores. [Licença](https://github.com/mbloch/mapshaper/blob/master/LICENSE). |

Esses pacotes não são servidos ao visitante. Não foi identificada obrigação de crédito visual no site por esse uso; conservar licenças e avisos aplicáveis em eventual redistribuição dos próprios pacotes. Sharp foi uma ferramenta do ambiente para exportação, não uma dependência do site. Não há CDN, fontes web, vídeos, fotografias remotas ou banco de ícones incorporados nas páginas auditadas.

## Conteúdos educativos: fonte, conteúdo e situação

As fontes institucionais foram utilizadas para verificação factual dos textos fornecidos ou desenvolvidos para o projeto. Isso não as torna autoras da redação publicada. Os registros internos não demonstram cópia de textos, fotos ou gráficos desses portais. Referenciar fatos por link não equivale a declarar uma licença para reproduzir os materiais das instituições.

| Fonte/documento | Conteúdo efetivamente sustentado | Onde e classificação |
| --- | --- | --- |
| [Ministério da Saúde — Queimadas, Saúde de A a Z](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/q/queimadas) | Efeitos da fumaça, grupos vulneráveis e proteção da saúde: ambiente protegido, hidratação, esforço externo, máscaras e atenção a sintomas | Home, `index.html:125`; Prevenção, `prevencao.html:158`. A. A URL adicional terminada em `/queimadas/queimadas` é C, sem entrada separada. |
| [Ministério da Saúde — impactos dos incêndios e exposição à fumaça, julho/2026](https://www.gov.br/saude/pt-br/assuntos/noticias-ms/2026/julho/ministerio-da-saude-monitora-impactos-dos-incendios-florestais-na-saude-e-orienta-populacao-sobre-exposicao-a-fumaca) | MP2,5, penetração respiratória e efeitos respiratórios/cardiovasculares | Queimadas, `queimadas.html:177`; também registrado para Prevenção. A/C, uma referência reunindo os usos. |
| [Idaf-ES — incêndios florestais e situação do Espírito Santo](https://idaf.es.gov.br/incendios-florestais-e-a-situacao-do-espirito-santo) | Danos ao solo, microfauna e florestas; contexto estadual de prevenção e uso do fogo | Home e Prevenção. A/C. Vínculo registrado em `docs/recursos-e-licencas.md:64` e `:153`. |
| [MAPA — Desastres em propriedades rurais: ações para prevenir, mitigar e responder às situações de risco, 2022](https://repositorio-dspace.agricultura.gov.br/bitstream/1/394/1/Desastres_em_propriedades_ruraiscomISBN2.pdf) | Perdas em propriedades, lavouras, pastagens e infraestrutura, seção 2.3 | Home; fonte efetivamente registrada em `docs/recursos-e-licencas.md:72`. A. O PDF oficial foi reaberto: expediente confirma Adriano Gomes Pascoa, primeira edição de 2022 e permissão de reprodução mediante citação da fonte; não é uma licença Creative Commons. A implementação usa consulta factual, sem incorporar os materiais do livro. |
| [Ibama — perguntas frequentes sobre incêndios florestais](https://www.gov.br/ibama/pt-br/acesso-a-informacao/perguntas-frequentes/incendios-florestais) | Definições, queima controlada, incêndios, riscos, ecossistemas e ignições naturais | Queimadas, `queimadas.html:82`, `docs/recursos-e-licencas.md:96`. A. |
| [Ibama — Sobre o Manejo Integrado do Fogo](https://www.gov.br/ibama/pt-br/assuntos/fiscalizacao-e-protecao-ambiental/manejo-integrado-do-fogo/sobre-o-manejo-integrado-do-fogo) | MIF e conhecimentos científicos e tradicionais | Queimadas, `queimadas.html:92`. A. |
| [Ibama — uso do fogo/queima controlada](https://www.gov.br/ibama/pt-br/assuntos/fiscalizacao-e-protecao-ambiental/manejo-integrado-do-fogo/uso-do-fogo-queima-controlada) | Planejamento e condições do uso do fogo; orientação preventiva sem reproduzir instruções operacionais | Prevenção, fonte registrada em `docs/recursos-e-licencas.md:150`. A, com limites legais expostos abaixo. |
| [Ibama — prevenção a incêndios](https://www.gov.br/ibama/pt-br/hotsites/amazoniasemincendios/prevencao-a-incendios) | Prevenção em propriedades, alternativas ao fogo e áreas roçadas | Prevenção, `prevencao.html:89`. A. |
| [Ibama — orientações](https://www.gov.br/ibama/pt-br/hotsites/amazoniasemincendios/orientacoes) | Afastar-se, chamar Bombeiros e não enfrentar incêndio sem capacitação/equipamento | Prevenção, `prevencao.html:117`. A. |
| [Ibama — mudanças climáticas](https://www.gov.br/ibama/pt-br/assuntos/fiscalizacao-e-protecao-ambiental/manejo-integrado-do-fogo/mudancas-climaticas) | CO₂, gases de efeito estufa e relações entre fogo e clima | Queimadas, `queimadas.html:183`. A. |
| [MJSP — Força Nacional orienta sobre prevenção na estiagem](https://www.gov.br/mj/pt-br/assuntos/noticias/forca-nacional-orienta-populacao-sobre-prevencao-de-incendios-florestais-na-estiagem) | Ignições humanas, vegetação seca, vento, estiagem, cigarros, balões e lixo | Queimadas, `queimadas.html:101`; Prevenção, `prevencao.html:89`. A/C. Usar o destino atual verificado, sem repetir o caminho legado `/noticias-1/`. Não atribuir a essa notícia uma proporção nacional de ocorrências que ela não demonstra. |
| [SAAE Mariana — consequências que continuam](https://saaemariana.mg.gov.br/queimadas-as-consequencias-que-continuam/) | Consequências pós-queimada para solo, sedimentos e água | Queimadas, `queimadas.html:172`. A. |
| [Codevasf — controle de processos erosivos](https://www.gov.br/codevasf/pt-br/assuntos/revitalizacao-de-bacias-hidrograficas/recuperacao-hidroambiental/controle-de-processos-erosivos) | Erosão e assoreamento como conceitos e consequências para os recursos hídricos | Queimadas, `queimadas.html:172`. A para esses conceitos. A relação causal específica com queimadas é apoiada pelo SAAE; não atribuí-la isoladamente à Codevasf. |
| [Lei nº 14.944/2024 — Planalto](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/lei/l14944.htm) | Política Nacional de Manejo Integrado do Fogo e contexto de usos previstos | Queimadas e Prevenção. A/C quanto à referência; D quanto à precisão de uma frase ampla sobre autorização, descrita abaixo. |
| [CBMSC — atuação em incêndios florestais](https://cbm.sc.gov.br/index.php/blog-de-noticias/conheca-um-pouco-mais-sobre-a-atuacao-do-cbmsc-em-incendios-florestais) | Registro anterior vincula a triângulo do fogo, meteorologia, vegetação e relevo | Queimadas, `docs/recursos-e-licencas.md:101`. D para verificação atual: o destino exibe manutenção, embora haja registro de consulta anterior. Não publicar como fonte atualmente reconferida. |

A FAQ do INPE está registrada entre as referências de Queimadas, mas seu papel inequívoco na página Dados é metodológico e já está identificado acima. Não repetir sua entrada nem atribuir a ela automaticamente afirmações educativas sem vínculo preciso.

### Contatos, segurança e contexto do Espírito Santo

- **193:** confirmado pelo próprio [Corpo de Bombeiros do ES](https://cb.es.gov.br/telefones-uteis). A [Anatel](https://www.gov.br/anatel/pt-br/regulado/numeracao/codigos-nacionais/servicos-de-utilidade-publica-e-de-emergencia) identifica os códigos 193/Bombeiros e 199/Defesa Civil. Essas são fontes de confirmação atual para os contatos publicados em `prevencao.html:133`.
- **199:** a existência do código nacional não comprova atendimento em todo município. Há uso no ES, mas o [diretório estadual de defesas civis municipais](https://defesacivil.es.gov.br/regionais-e-municipais-de-defesa-civil) informa outro contato para Itaguaçu: (27) 3191-1022, ramal 3125. A ressalva atual de dependência da estrutura local em `prevencao.html:138` deve permanecer. Não apresentar 199 como linha municipal de Itaguaçu confirmada.
- **Ibama:** [Fale com o Ibama](https://www.gov.br/ibama/pt-br/canais_atendimento/fale-conosco) e [denúncias ambientais](https://www.gov.br/ibama/pt-br/assuntos/fiscalizacao-e-protecao-ambiental/fiscalizacao-ambiental/denuncias) confirmam 0800 061 8080 e atendimento telefônico de segunda a sexta, das 7h às 19h. Manifestações online são encaminhadas ao [Fala.BR](https://falabr.cgu.gov.br/). A separação entre denúncia e emergência publicada em `prevencao.html:141` é adequada; Fala.BR não é serviço de combate a incêndio.
- A página da Defesa Civil de Mato Grosso do Sul foi uma referência anterior para os números. Classificação B para a futura seleção pública: não é evidência local adequada para ES e não deve ser mantida como se o fosse. CBMES, Anatel e CEPDEC-ES são verificações adicionais desta auditoria, não fontes usadas na redação original.

### Candidatas excluídas e agrupamento

O manual MAPA do catálogo, `handle/1/6130`, é de 2026 e é distinto da publicação de 2022 efetivamente registrada para a Home. Não substituir um pelo outro; classificação B para o manual conferido nesta auditoria e não usado no conteúdo final. Não foi identificada utilização final das páginas candidatas do ICMBio sobre regeneração nem do MMA sobre conservação. Não publicar essas referências como utilizadas nem inferir que foram consultadas individualmente apenas por estarem no catálogo. Classificação D quanto ao vínculo não demonstrado; permanecem fora da seleção pública.

Consolidar em uma entrada cada documento compartilhado entre páginas — especialmente saúde, Idaf, Lei 14.944, MJSP e Ibama — indicando seus assuntos e páginas relacionados. URLs alternativas, páginas genéricas de acesso e a mesma FAQ em diferentes caminhos não constituem referências independentes.

## Pendências separadas

| Pendência | Situação e consequência | Encaminhamento antes de declarar publicação regularizada |
| --- | --- | --- |
| Direitos da referência original do rodapé | E: autorização não comprovada; a edição e geração com IA estão documentadas, mas a referência deriva de anexo sem autoria/licença identificada | Comprovar autoria/permissão aplicável ou aprovar substituição por arte de procedência verificável. Preservar o rodapé atual nesta etapa de inspeção. |
| Referência visual da marca/favicon | D: há registro de imagem orientadora sem origem identificada; não foi encontrada marca externa incorporada | Confirmar se era inspiração genérica, arte do próprio projeto ou recurso de terceiro antes de afirmar origem totalmente independente. Não há conclusão de infração nesta auditoria. |
| Termos específicos dos arquivos INPE | D: acesso gratuito e citação ABNT confirmados; licença expressa de redistribuição não localizada | Identificar termos específicos aplicáveis ou obter esclarecimento institucional; manter a referência e não atribuir licença de outro produto. |
| Artigo CBMSC indisponível para reconferência | D: página em manutenção; histórico de consulta não equivale a acesso atual ao conteúdo | Recuperar o documento oficial ou verificar substituição oficial correspondente antes de tratá-lo como reconfirmado. |
| Afirmação de maioria de ocorrências de origem humana | D: `queimadas.html:136` usa formulação nacional ampla; a notícia MJSP confirma muitos incêndios de origem humana na estiagem, sem comprovar a mesma generalização nacional | Precisar fonte, período e indicador ou aprovar uma redação compatível com a evidência. Não corrigir o texto de outra página silenciosamente. |
| Ressalva jurídica sobre autorização | D: frase em `queimadas.html:85` é ampla; a Lei 14.944 prevê hipóteses e exceções, inclusive arts. 33 e 39. Já registrada em `docs/verificacao-queimadas.md:88` | Revisar a formulação com base na norma antes de declarar cobertura legal irrestrita da frase. |
| Atendimento 199 em Itaguaçu | D para disponibilidade municipal específica; o site já mantém ressalva local | Preservar a ressalva e não alegar confirmação local. Um contato municipal específico exige revisão editorial separada. |
| Arquivo original da malha | Origem IBGE e licença confirmadas; falta o shapefile original na árvore atual para nova reprodução independente | Recuperar/arquivar o original e registrar hash quando for refeita a geração. Isso é lacuna de reprodutibilidade, não ausência de licença comprovada. |
| Divergências em dados de origem | Tabelas 2/3 e agrupamentos Monitor documentados; Ceará não participa da base atual | Manter o produto e a agregação adotados claramente identificados; não combinar totais incompatíveis nem publicar a tabela antiga como fonte dos estados. |

O expediente e a autoria do material MAPA foram reconfirmados no PDF oficial. Não é necessário reproduzir permissões de todo portal para citar fatos por link. A existência de uma referência sobre direitos autorais no catálogo não comprova autorização de nenhum recurso concreto.

## Proposta de organização da página

A abordagem recomendada é uma página editorial estática, com a coluna de leitura e as seções de Sobre. Uma grade de cards multiplicaria contornos e espaços com muitos links; filtros e accordions esconderiam referências sem resolver uma necessidade identificada. Uma tabela extensa com seis colunas seria inadequada no celular. O inventário completo de licença e rastreabilidade fica neste documento; a página apresenta as informações pertinentes em blocos curtos.

Organização proposta:

1. **Introdução — Fontes e créditos:** um H1 e um parágrafo sobre a origem das informações, sem alegar endosso das instituições.
2. **Conteúdos educativos e prevenção:** referências agrupadas por finalidade — conceitos e impactos; prevenção, saúde e atendimento. Cada documento aparece uma vez, com instituição, título, link descritivo e uma frase sobre os conteúdos que fundamenta. Fontes comuns à Home, Queimadas e Prevenção são consolidadas.
3. **Dados e metodologia:** quatro entradas principais — RAF2025/Tabela 3, Monitor do Fogo, INPE e IBGE. Informar produto, coleção/período, unidade, adaptação e licença ou condições comprovadas. Distinguir hectares, recorrência e detecções; manter os créditos curtos já existentes junto às visualizações.
4. **Recursos e créditos:** desenhos e código desenvolvidos no projeto; procedência assistida por IA do rodapé somente com situação de direitos corretamente resolvida; base cartográfica creditada na seção anterior, sem duplicação. Não listar PNGs rejeitados nem apresentar ferramentas de testes como bibliotecas carregadas no site.
5. **Referências técnicas:** bloco compacto com W3C/WCAG/WAI agrupados, leitura online, GOV.UK e web.dev, descritos como orientações de desenvolvimento consultadas. Sem selo de certificação, números de desempenho de laboratório como promessa ou atribuição científica a essas referências.

O visual seguirá exatamente o contraste abertura verde escura/conteúdo areia, a tipografia do sistema, a coluna de 68ch, o alinhamento de títulos e textos e as divisórias de Sobre. Não há proposta de nova ilustração, animação, biblioteca ou controle interativo. Os campos de cada referência serão expressos em texto e listas semânticas, com H2/H3 em ordem, foco visível e links que funcionam sem JavaScript. Os destinos externos poderão abrir na própria aba, sem impor novas janelas.

### Escopo futuro de implementação e validação

Após aprovação: criar `fontes.html`, integrar o item nos rodapés, estender os seletores compartilhados à classe da página e autorizar a rota no servidor local. Ajustar o aviso de Feedback e as expectativas dos testes que atualmente exigem Fontes indisponível. Não alterar os textos educativos para resolver pendências editoriais sem registrar essa ampliação de escopo.

A validação da nova página deverá cobrir fidelidade ao inventário aprovado, links, ausência de duplicações, navegação por todos os rodapés, subdiretório, retorno ao topo local, menu, foco, teclado, funcionamento sem JavaScript, movimento reduzido e acessibilidade automatizada. Repetir os oito viewports existentes, texto ampliado e redimensionamento da mesma janela; conferir URLs longas, ausência de overflow/colisões e comparar a escala computada com Sobre. Incluir zoom nativo como verificação distinta, sem declarar que a fonte raiz ampliada o substitui. Fazer inspeção visual em celular/desktop e executar os checks e regressões pertinentes ao diff real.

O pedido de aprovação decorreu das etapas 4 e 14 do handoff. A solicitação posterior do usuário para integrar a página ao item do rodapé autorizou a implementação local desta proposta. Não houve publicação externa e as pendências acima não foram consideradas resolvidas pela integração.
