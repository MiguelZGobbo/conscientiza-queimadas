# Auditoria pré-publicação — Conscientiza Queimadas

Data: 26/10/2026, America/Sao_Paulo. Handoff lido integralmente. Escopo: preparação técnica local, sem publicação, escolha de provedor, push, serviços novos ou alterações factuais dos conteúdos.

**Atualização posterior, ainda em 26/10/2026:** as pendências editoriais e a documentação do reuso dos agregados INPE foram tratadas em tarefa separada autorizada. A situação vigente está em [relatorio-revisao-editorial.md](./relatorio-revisao-editorial.md). O corpo abaixo preserva os achados e o escopo da preparação técnica original.

## Estado inicial e preservação

Revisão inicial: `19604be1cb2d6ca5595974373a05eec08a6b4696`, branch `main`. Havia alterações em sete arquivos: README, três documentos de fontes/licenças, `fontes.html`, README das artes e teste de Fontes. O checkpoint externo contém os bytes desses arquivos e o patch inicial; foi completado com os demais arquivos versionados de HEAD. Caminho e hashes estão em `.auditoria-local/estado-inicial.json`. Nenhum commit foi criado, nenhum reset foi executado e nenhum histórico foi reescrito.

As quatro documentações de autoria/fontes e o teste de Fontes preexistentes não foram reescritos. O README recebeu uma seção adicional e a única alteração desta preparação em Fontes foi o atributo da imagem do rodapé, como nas outras cinco páginas. O checkpoint permite distinguir essas alterações do trabalho anterior.

## Arquitetura e recursos reais

- Seis documentos independentes: Início, Queimadas, Dados, Prevenção, Sobre e Fontes. Navegação nativa por links relativos, inclusive entre páginas e âncoras locais.
- CSS compartilhado com consultas por largura/altura, medidas fluidas e limites em `rem`; sem mecanismo de responsividade substituído.
- Hero com desenho SVG inline, animações CSS e resposta ao mouse. A textura local de fumaça é carregada em desktop com mouse e movimento permitido; alternativas estáticas existentes permanecem intactas.
- Mapa inline com 27 UFs, derivado da malha IBGE. Consulta, gráficos e agregados ambientais usam módulos locais. Não há chamada ao INPE, IBGE ou MapBiomas durante a consulta do visitante.
- Cinco variantes WebP do rodapé, dois SVGs externos locais e tipografia do sistema. Sem vídeo, fontes web, CDN, biblioteca gráfica ou dependência de produção.
- Playwright 1.63.0, axe-core 4.14.0 e Mapshaper 0.7.90 são ferramentas de desenvolvimento. Python é usado nos importadores/testes, não no site servido. `src/area-historica.js` permanece no repositório, mas não é uma dependência alcançada pelo runtime desta edição e não entra na candidata.

Os relatórios de tamanho e desempenho separam o que está no checkout do que é servido. O site não precisa de build: o novo comando faz cópia controlada dos arquivos necessários para `dist/`, sem transformação.

## Achados, prioridades e decisões

| Prioridade | Situação original | Ação desta preparação | Resultado/decisão |
| --- | --- | --- | --- |
| P0 | Nenhuma falha local bloqueante confirmada na exploração inicial | Verificar recursos, distribuição, caminhos e exposição de arquivos | Nenhum segredo identificado pelas heurísticas utilizadas; ver limites abaixo. Não é garantia de segurança absoluta. |
| P1 | Publicar a raiz incluiria originais e arquivos de desenvolvimento desnecessários | Lista explícita, cópia para `dist/`, manifesto externo, validação de referências e proteção contra symlinks | Candidata local isolada e revisável; ferramentas e originais preservados fora da entrega estática. |
| P1 | Rodapé distante era requisitado já na abertura | Substituir a indicação de prioridade baixa por `loading="lazy"` nas seis imagens | Download adiado quando a heurística do navegador considera a imagem distante; dimensões, srcset e aparência preservados. Resultados medidos no relatório de desempenho. |
| P1 | Servidor de desenvolvimento não aceitava selecionar artefato nem prefixo real | Acrescentar `--root` e `--prefix`, mantendo loopback e lista de arquivos | Testes HTTP e navegador servem a candidata em `/` e `/projeto/`, sem simulação do prefixo. |
| P1 — pendente externo | Licença expressa de reutilização dos arquivos INPE não localizada | Preservar créditos, agregação local e ressalva existente | A preparação técnica não regulariza direitos; decisão/esclarecimento do responsável continua necessário antes de afirmar publicação regularizada. |
| P1 — pendente editorial | Fonte CBMSC não reconfirmada, generalização nacional sobre origem humana, formulação legal sobre uso do fogo e disponibilidade municipal do 199 | Consolidar pendências já documentadas, sem modificar textos ou números | Exigem fonte adequada e/ou decisão editorial. Não substituir fontes, afirmar disponibilidade local ou reformular conteúdo legal silenciosamente. |
| P2 | Documentos históricos ainda citam pendência de autoria do rodapé | Identificar atualização de 26/10 como registro vigente | Autoria/uso das imagens no projeto confirmados; avisos históricos não são pendências atuais. Nenhuma licença pública geral nova foi presumida. |
| P2 — depende de URL | Canônicas, sitemap e Open Graph ausentes | Manter títulos/descrições/idioma/favicon já adequados e listar finalização no guia | Não inserir domínio fictício, imagem absoluta inválida ou placeholders em produção. |
| P2 — não necessário | Minificação, troca de arquitetura, novas bibliotecas e refação de imagens | Confrontar com medições e testes existentes | Sem necessidade demonstrada; identidade, animações, mapa e código de produção mantidos. |

### Mudanças concretas

Foram adicionados o empacotamento, a medição multipágina e testes de distribuição; o servidor local passou a aceitar raiz/prefixo; os comandos npm e a documentação foram atualizados. As seis imagens do rodapé mantêm `decoding="async"`, dimensões e variantes, e passam a usar carregamento tardio. O Hero não recebeu `loading="lazy"`. Nenhum CSS, módulo de dados, geometria, texto educativo ou recurso visual foi alterado.

O primeiro ensaio adicionou lazy mantendo `fetchpriority="low"`; isso ultrapassou em dois bytes o orçamento estrito existente do rodapé. A candidata final substitui esse hint pelo carregamento tardio, reduzindo cinco bytes por página em relação ao estado inicial, sem aumentar o orçamento do teste. A lista continua com 27 arquivos.

## Semântica, SEO e validação

As seis páginas já possuíam `lang="pt-BR"`, títulos e descrições exclusivos, viewport, favicon, um H1 e conteúdo textual disponível no HTML. Scripts clássicos já usavam `defer` e os módulos já tinham execução própria de módulos. Esses itens foram preservados.

A validação HTML 11.17.0 com o perfil recomendado produziu 15 ocorrências, mantidas no registro bruto: seis `doctype-style` (capitalização, sem invalidar o doctype HTML), seis `no-redundant-role` (listas de gráficos com papel explícito), uma `empty-heading` (título da UF dentro de região inicialmente `hidden`, preenchido antes da exibição) e duas `tel-non-breaking` (sugestão tipográfica nos telefones). Não se trocou HTML válido por razões cosméticas nem se removeu a semântica explícita das listas. Um perfil dirigido, com essas quatro regras desativadas e exceções documentadas, foi executado separadamente. Isso não equivale a aprovação irrestrita pelo perfil recomendado nem validação completa de CSS.

Os testes verificam recursos CSS carregados e folhas analisáveis no Chromium; JS passa pelas checagens de sintaxe e testes do projeto. Axe e testes manuais/funcionais não constituem certificação WCAG. Zoom nativo e tecnologias assistivas têm limites explícitos no checklist.

SEO pendente de domínio: URL principal, canônicas, sitemap, URLs de compartilhamento e verificação em ferramentas de busca. Não foram criados robots permissivo redundante, JSON-LD sem necessidade, `llms.txt`, analytics, service worker ou banner de cookies.

## Segurança, terceiros e privacidade

O site não incorpora scripts externos, formulário, iframe ou fonte de CDN; SRI para scripts de CDN não se aplica ao runtime atual. Links de fontes são navegação externa. Feedback conserva `target="_blank"`, `noopener noreferrer` e descrição acessível. Não se encontrou recurso misto requisitado; os namespaces `http://www.w3.org/2000/svg` não são downloads HTTP.

A busca por padrões locais de chaves privadas, tokens GitHub/AWS/Google e atribuições suspeitas examinou 86 arquivos de texto do checkout e 212 blobs de texto do histórico acessível, sem ocorrências. Foram excluídos binários PNG/WebP e blobs acima de 3 MB. Heurísticas não detectam todo formato ou segredo possível; não houve pentest, verificação de credenciais em serviços, rotação nem publicação de valores sensíveis. O método e a contagem ficam em `evidencias-pre-publicacao/segredos.json`.

Nas cargas verificadas, o próprio site não gravou cookies, localStorage ou sessionStorage. O Forms é um link externo, não um embed. Sua página pública foi inspecionada sem envio; as declarações observadas de finalidade, responsável e retenção estão no guia. Isso não audita a conta Google, o tratamento pelo provedor futuro ou comprova LGPD.

Foram checadas 33 URLs HTTPS únicas de referências/canais: 19 retornaram 200 diretamente, 11 retornaram 206 no GET parcial e duas redirecionaram para 200. O Planalto encerrou a conexão nas tentativas HEAD/GET; verificação inconclusiva, não prova de link quebrado. O Forms foi inspecionado separadamente; nenhum formulário ou telefone foi acionado para envio/chamada.

A matriz de cabeçalhos e a CSP candidata em Report-Only estão no guia. Nenhuma regra de provedor foi aplicada, nenhum endpoint externo de relatórios foi criado e enforcement permanece uma etapa futura.

## Situação para encerramento

**Feito:** candidata estática local, medições/evidências, testes, distribuição por lista e relatórios. **Não necessário:** refazer design, trocar framework, minificar para obter nota perfeita ou criar serviços/coleta. **Pendente de hospedagem:** URL, HTTPS real, headers/cache/redirecionamentos/404 do provedor, sitemap/canônicas e ferramentas de busca. **Bloqueado por decisão/documentação externa:** regularização dos termos INPE e pendências editoriais acima. **Opcional:** compartilhamento social completo e ensaios com aparelhos/navegadores/leitores de tela adicionais.

A entrega é uma preparação técnica local com pendências explicitadas, não autorização para publicar nem declaração de regularização editorial, legal ou de acessibilidade. Consulte o checklist para resultados executados e limites, e o inventário para decidir posteriormente a hospedagem.

## Revisão independente e observação complementar

A revisão independente leu o handoff, o diff/checkpoint, os scripts, os testes e os cinco relatórios. Recalculou as tabelas e conferiu os arquivos brutos, o manifesto e os PNGs. Não encontrou achados Critical, Important ou Minor com impacto concreto que impeçam a entrega local. Não substitui verificação pública nem resolve as pendências externas acima.

Um log intermediário da suíte registra três mensagens `ResizeObserver loop completed with undelivered notifications` na página Dados durante a matriz de redimensionamentos/ampliação de texto. O observador existente de gráficos guarda a largura anterior e evita recalcular quando ela não muda; o aviso, isoladamente, não demonstra loop infinito. Os testes de geometria/interação passaram e as 120 cargas medidas não registraram erros. **Decisão P2:** preservar o código nesta preparação e registrar o aviso, sem suprimir erros globalmente. Se aparecer em uso real ou houver instabilidade visual, reproduzir o cenário e avaliar o agendamento das atualizações de layout. Não foi declarado que toda combinação de resize esteja livre desse aviso.
