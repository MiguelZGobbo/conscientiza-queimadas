# Checklist de validação — 26/10/2026

Os estados abaixo correspondem a execuções locais. Não se extrapolam para uma URL pública, dispositivo físico ou certificação. Evidências selecionadas ficam em `docs/evidencias-pre-publicacao/`; os arquivos completos locais, em `.auditoria-local/`.

**Revisão editorial posterior, 26/10/2026:** a nova validação e o encerramento das cinco pendências estão em [relatorio-revisao-editorial.md](./relatorio-revisao-editorial.md), com evidências próprias em `evidencias-revisao-editorial/`. Os resultados abaixo preservam o ensaio técnico anterior. Nesta revisão, `check` passou com 21 testes Python e 4 Node; a suíte completa teve 256 aprovados, seguida de 34 aprovados após a última edição de Fontes, sem falhas. O comando independente de distribuição também teve 4 aprovados. Capturas específicas em 390/1440 px verificaram os novos trechos; dados e recursos foram comparados ao checkpoint.

| Verificação | Estado | Método e evidência |
| --- | --- | --- |
| Checkpoint do trabalho anterior | Aprovado | Sete arquivos modificados preservados externamente; checkpoint completado para94 arquivos versionados iniciais. Estado/hashes em `.auditoria-local/estado-inicial.json`. |
| Sintaxe JavaScript | Aprovado | `npm run check`; módulos originais e novos comandos; `check-definitivo.log`. |
| Importadores/cálculos Python | Aprovado |21 testes; cenários negativos emitem mensagens de erro intencionais e o resultado final é OK. Nenhum reprocessamento factual ou download dos arquivos brutos foi feito. |
| Empacotamento e proteções | Aprovado |4 testes Node: cópia byte a byte/manifesto externo, dependência não listada rejeitada preservando dist anterior, symlink de destino rejeitado e HTTP/MIME/404 em raiz/subdiretório. |
| Suíte completa Chromium | Aprovado |256 testes,2,1min, dois workers; `test-suite-definitiva.log`. Inclui251existentes e5novos. |
| Artefato HTTP em / e /projeto/ | Aprovado |Servidor real da pasta dist, portas locais isoladas, sem interceptação de prefixo nos novos testes; seis páginas, estilos, módulos, imports, imagens e links internos. |
| Rotas, MIME e 404 local | Aprovado |HTML/CSS/JS/SVG/WebP disponíveis; GET/HEAD; POST e arquivos fora da distribuição respondem404. Não é validação do404do host futuro. |
| Navegação, navbar, rodapé e âncoras | Aprovado |Links nativos, fragmentos existentes, menu móvel, Esc, foco e Voltar ao topo; ensaios originais e testes reais da candidata. |
| Mapa e dados | Aprovado |27 UFs por geometrias e teclado; seletor e toque; indicadores e gráficos; ausência/incompatibilidade/falha de módulos preservam alternativas. Testes usam referências independentes existentes. |
| Feedback | Aprovado com limite |Destino e descrição acessível, nova aba sem opener, JS ligado/desligado nos testes. O destino de envio é simulado nos testes de abertura; a página pública do Forms foi lida separadamente, sem envio. |
| Links HTTPS externos | Aprovado parcialmente |32de33URLs de referências/canais responderam2xxdireto ou após redirect; Planalto inconclusivo por reset de conexão. Ver `fontes-externas.md`; não marcar a URL inconclusiva como aprovada. |
| Tel e envio do Forms | Não executado |Não foram feitas ligações ou submissões. Isso evita criar registros/dados externos. |
| Responsividade/reflow | Aprovado nos cenários |320,390,768,1024,1440,1920 px e limites adicionais existentes, retrato/paisagem/janelas baixas; ausência de overflow nos cenários exercitados. |
| Texto ampliado200% | Aprovado |Alteração da fonte raiz e reflow; componentes e gráficos permanecem legíveis nas matrizes existentes. |
| Zoom nativo200% | Não executado |Ambiente principal é Chromium headless; Chrome completo instalado falhou com spawn UNKNOWN. A tentativa adicional via interface Windows foi interrompida pelo controle por não conseguir confirmar a URL com segurança. Ampliação de fonte não é apresentada como zoom nativo. Reproduzir futuramente no navegador com interface e zoom200%. |
| Teclado/foco/alvos/contraste | Aprovado nos cenários |Testes do menu, conteúdo, rodapé, gráficos e27 UFs; contraste por cores/pixels e tamanhos de alvos existentes. Não substitui estudo com usuários ou leitor de tela. |
| Axe WCAG2.2A/AA | Aprovado nos estados |Seis páginas da candidata em 390e1440 px, além dos estados inicial/selecionado e componentes nos testes existentes; sem violações detectadas nesses ensaios. |
| Sem JavaScript/módulos indisponíveis | Aprovado |Navegação, menu nativo, conteúdo e alternativas de dados; falhas parciais cobertas na suíte existente. |
| Movimento reduzido/animações | Aprovado |Hero, fumaça, transição de páginas e rolagem; testes existentes verificam touch, mouse e prefers-reduced-motion. Nenhuma animação foi removida. |
| Carregamento tardio do rodapé | Aprovado |Teste falhou antes porque Dados baixava a imagem inicialmente; passou depois sem requisição inicial, com decode válido ao rolar e sem overflow. |
| HTML recomendado | Falhou, classificado |15 ocorrências:6 doctype-style,6 no-redundant-role,1 empty-heading em região hidden dinâmica,2 tel-non-breaking. Mantidas no JSON bruto e explicadas na auditoria. |
| HTML dirigido | Aprovado com exceções |html-validate11.17.0, quatro regras acima desativadas explicitamente; configuração e JSON persistidos. Não é aprovação irrestrita do perfil recomendado. |
| CSS | Aprovado no carregamento/parsing |Folhas carregadas e CSSOM não vazio no Chromium; layout/estados testados. Validação normativa completa de CSS não executada. |
| Console/Network nos ensaios | Ver resumo de medições |Erros por amostra são preservados em `medicoes-resumo.json`; usar as contagens da seção de resultados abaixo. Não generalizar a ausência de erros para todos os navegadores. |
| Lighthouse antes/depois | Aprovado como coleta |24 auditorias por fase; quatro páginas × dois presets × três amostras; versão13.5.0 e configurações efetivas registradas. Resultados reais no relatório de desempenho. |
| DevTools antes/depois | Aprovado como coleta |60 cargas por fase; seis páginas × dois perfis × cinco amostras; rede inicial e chegada ao rodapé separadas. |
| CSP Report-Only local | Aprovado no ensaio |Candidata aplicada somente no servidor do teste; Home→Dados, seleção de Acre e rodapé, sem violações registradas. Não houve enforcement, endpoint de coleta ou instalação no host. |
| Cookies/storage/terceiros | Aprovado como inspeção |Buscar APIs e observar cargas locais; sem gravações do próprio site observadas. Não audita cookies/conta do Google ou logs do futuro provedor. |
| Segredos/exposição | Aprovado com limite |86 arquivos de texto/212 blobs, zero achados pelas heurísticas; origem/artes/documentos/ferramentas fora de dist. Não é pentest ou garantia absoluta. |
| Comparação visual | Ver seção abaixo |Capturas antes/depois, inspeção e invariantes de bytes; não alterar o design por diferença de fase das animações. |
| Diff e preservação | Aprovado na entrega |`git diff --check`; dados/CSS/JS/imagens inalterados; mudanças anteriores distinguíveis pelo checkpoint. |
| Reversão seletiva | Aprovado no modo check |Hash de cada arquivo conferido antes de oferecer restauração. O apply no checkout real não foi executado. |
| Aparelhos físicos/Firefox/Safari/leitores reais | Não executado |Matriz adicional fora do ambiente executado; não declarar conformidade integral. |
| HTTPS/cabeçalhos/cache/redirects do provedor | Não executado — depende do host |Somente HTTP local e matriz recomendada. Conferir após publicação autorizada. |
| Canônicas/sitemap/Search Console/Bing | Pendente de URL |Guia descreve finalização e verificação, sem domínio fictício ou promessa de indexação. |
| Deploy/contas/serviços externos | Não executado por escopo |Nenhum push, upload, integração, compra ou publicação. |

## Execuções intermediárias e correções

A primeira suíte ampliada terminou com 252 aprovados e4 falhas: orçamento do rodapé excedido em 2 bytes e três timeouts dos novos testes. O orçamento foi preservado substituindo o hint de prioridade por lazy. Diagnósticos mostraram verificações concluídas antes de o encerramento de servidor aguardar conexões ainda mantidas pelo navegador; a fixture passou a encerrar as conexões que ela mesma criou. As asserções não foram removidas nem receberam retries.

Uma execução seguinte teve255 aprovados e timeout de encerramento da CSP. Depois da correção,30 testes direcionados passaram. Outra execução ampla teve255 aprovados e uma falha no mock antigo de subdiretório de Queimadas: `route.fulfill: Fetch response has been disposed`, quando uma resposta interceptada ainda estava em trânsito ao terminar o teste. Esse caso migrou para o servidor real da candidata, mantendo navegação, URLs e verificação visual. Os21 testes direcionados então passaram. A execução definitiva teve256 aprovados; os logs intermediários foram mantidos para não ocultar falhas.

O Lighthouse inicialmente não iniciou o Chrome completo (`spawn UNKNOWN`); a coleta válida usa o mesmo Chromium headless153dos testes e registra essa escolha. Avisos NO_COLOR/FORCE_COLOR e mensagens negativas dos importadores são distinguíveis de falhas da aplicação.

## Reproduzir

```powershell
npm ci
npx playwright install chromium
npm run check
npm test
npm run test:publicacao
npm exec --yes --package=html-validate@11.17.0 -- html-validate --config docs/evidencias-pre-publicacao/htmlvalidate-dirigido.json index.html queimadas.html dados.html prevencao.html sobre.html fontes.html
git diff --check
```

`npm test` prepara dist automaticamente. Para conferir manualmente: `npm run dev -- --root dist --prefix /projeto/`. Nenhum desses comandos faz deploy. Não executar testes simultaneamente às medições; usar os comandos do relatório de desempenho para repeti-las.

## Resultados complementares da coleta

120 cargas: **0 registros de erro de página/console/requisição**; **0 cargas com cookies/storage do próprio site observados**. As amostras completas selecionadas identificam eventuais ocorrências individualmente.

## Comparação visual concluída

Oito pares de capturas foram **idênticos byte a byte**: abertura móvel, menu móvel, Impactos, mapa com Acre, rodapé móvel, abertura desktop, mapa desktop e rodapé desktop. A fase foi congelada por movimento reduzido para comparação; animações padrão foram testadas separadamente e as capturas originais das medições também foram inspecionadas.

O estado anterior destes oito pares foi reconstituído fielmente a partir do checkpoint externo original; as capturas foram realizadas após as mudanças, não são apresentadas como imagens capturadas no horário da linha de base. A candidata foi servida de dist. SHA-256, método e data estão em `evidencias-pre-publicacao/comparacao-visual.json`; os 16 PNGs acompanham o arquivo. As 21 dependências e a equivalência do HTML exceto pelo carregamento do rodapé estão em `invariantes.json`.

Aviso complementar: a suíte intermediária registrou três notificações de ResizeObserver em Dados sob redimensionamento/ampliação de texto. Elas permanecem no log e foram classificadas P2 na auditoria; não ocorreram nas 120 cargas medidas. Não se afirma ausência desse aviso em toda interação possível.
