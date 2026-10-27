# Rodapé fluido e desempenho móvel — 27/10/2026

## Objetivo e estado da execução

Correção local do rodapé e dos custos demonstrados de navegação do Conscientiza Queimadas. O proprietário esclareceu que o problema visual é a falta de escala automática do texto e do conteúdo do rodapé conforme a tela. Não se trata de uma solicitação para eliminar a paisagem ou substituir a composição visual.

A suíte completa passou com 299 testes de navegador, além de 21 testes Python e nove testes Node. A comparação controlada é registrada abaixo. Nenhuma publicação está autorizada nesta rodada.

## Diagnóstico demonstrado

- A revisão inicial foi `21c9448`, branch `main`, checkout limpo. Os seis documentos e os 21 recursos públicos conferidos eram idênticos aos arquivos locais de `dist/`; `_headers` não é um recurso público e a 404 foi verificada por seu comportamento HTTP.
- Em Sobre, a tipografia principal media 16 px em 390×844, 16,56 px em 1440×900 e 20 px em 1920×1080. O primeiro parágrafo do rodapé permanecia em 15 px nos três tamanhos. A escala principal depende de largura **e altura**, enquanto o rodapé usava majoritariamente tamanhos fixos em rem.
- Não foi reproduzido overflow horizontal na inspeção inicial de 320 a 1920 px. Isso não elimina o defeito de escala relatado.
- O host normaliza `/*.html` com HTTP 308. A sondagem de `/dados.html` observou um salto de 167–179 ms em três amostras limitadas; `/dados` não teve redirect. Esses números preliminares não substituem a coleta completa.
- A Home e Dados responderam com Brotli e `Cache-Control: public, max-age=0, must-revalidate`. A política não foi alterada em produção.
- O medidor anterior aceitava apenas loopback, desabilitava o cache e usava somente Chromium. Isso não validava cache aquecido, o host real ou WebKit.
- O probe de transição verificou o hit-test no centro do botão de menu. Durante o snapshot, `elementFromPoint` não alcançava o botão; após a transição, alcançava. No Chromium, início/ready/fim foram 20,2/37,1/215,1 ms; no WebKit, 45/47/243 ms. Ao cancelar a transição no probe, o botão ficava disponível imediatamente. JSON e traces estão na área local. Esse teste demonstra bloqueio temporário de interação, além do efeito visual de 180 ms.

## Alterações e limites

O CSS compartilhado passa a derivar a tipografia do rodapé de `clamp(1rem, min(1.15vw, 2.3svh), 1.25rem)`. A hierarquia relativa, a imagem, os links e o conteúdo acadêmico são preservados. Espaçamentos, marca e faixa ilustrada acompanham a escala; há proteção de áreas seguras. A imagem continua lazy, com dimensões e variantes existentes.

A faixa móvel varia de 128 a 180 px pela largura/altura da janela, sem crescer apenas porque o texto foi ampliado; o limite anterior de enquadramento e o `sizes` existente continuam suficientes. Quando falta largura relativa ao tamanho do texto, marca e nome passam para linhas distintas, evitando quebrar “Conscientiza” ou “Queimadas” no meio a 200%. A coluna de navegação reserva sua largura intrínseca no desktop. As consultas de container têm nomes distintos. O reflow da marca usa a largura efetiva da identidade, inclusive quando o rodapé entra em duas colunas, e a consulta das colunas usa o layout completo.

Os links internos usam `./` e as cinco rotas sem extensão; os destinos da 404 continuam absolutos. Os documentos `.html` não são removidos. O build resolve somente os aliases conhecidos, mantendo a lista explícita da distribuição e rejeitando recursos internos.

A dissolução entre documentos passa a exigir largura de pelo menos 960 px, hover e ponteiro fino, além da preferência por movimento. O desktop com mouse conserva os 180 ms; telas menores e dispositivos de toque navegam sem o snapshot que interceptava o menu. A mudança aplica-se aos sete documentos. Não há espera programada nova, overlay ou roteamento por JavaScript.

A validação WebKit revelou um defeito adicional no toque dos gráficos: `pointerdown` informava `touch`, mas o `click` compatível seguinte informava `mouse`. O segundo toque removia a fixação interna, porém mantinha o destaque como se houvesse hover. O componente agora conserva o tipo do pointerdown para toques/caneta; o mouse continua com seu comportamento anterior. A regressão cobre seleção e remoção por toque nos seis gráficos, além das 27 UFs e comandos de teclado.

O teste de orçamento bruto do componente passou de 7.180 para 8.500 bytes para comportar escala, safe areas e reflow. O orçamento do restante da Home (40.000 bytes) e o limite da imagem (200.000 bytes) permanecem. O extrator do teste deixou de depender do texto do comentário que nomeava o rodapé. Não houve minificação geral nem dependência adicionada para satisfazer uma nota.

O servidor de desenvolvimento mantém `no-store` por padrão. Opções locais de ensaio permitem redirects canônicos, ETag/304 e Brotli de qualidade 4 para comparação controlada. Esse servidor não emula toda a plataforma Cloudflare nem reproduz DNS, TLS ou localização de edge. Não há nova configuração remota, regra de cache de produção ou dependência de runtime.

## Protocolo e evidências

Evidências desta rodada: `.auditoria-local/mobile-20261027/`. O snapshot `antes-dist/` foi preservado antes de editar os arquivos do visitante. Os diretórios históricos não foram apagados.

- Cinco amostras por cenário e perfil, seis páginas, abertura direta e percurso por links; cache HTTP frio em contexto novo e quente após visita de preparação. A preparação quente abre as URLs canônicas e aquece documentos/assets; não representa um estado em que todos os redirects antigos `.html` já estejam armazenados pelo navegador. O benefício desses redirects pode ser menor nesse estado específico.
- Perfis móveis 390×844, DPR 3 e toque: Chromium sem limitação; Chromium com CPU 4×, latência 150 ms, download 200.000 B/s e upload 93.750 B/s; WebKit sem limitação artificial. Desktop Chromium 1440×900, DPR 1.
- Node 24.19.0, Playwright 1.63.0, Chromium 153.0.8010.12 e WebKit 26.6 no Windows. Os perfis móveis representam geometria/toque; não são execução de Android/iOS nem comprovação em seus respectivos aparelhos. O user agent do ensaio local está no JSON.
- Contextos novos não garantem DNS/TLS, cache do SO ou edge frios. Os tempos indisponíveis ou reutilizados não são interpretados como custo físico zero.
- Medianas e mínimo–máximo são calculados separadamente por rota, perfil, cache e cenário. Não se misturam comparações públicas com antes/depois local.
- Abertura usa Resource Timing, Paint Timing e observadores suportados. Interatividade de navegação é um proxy: chegada do h1, término da transição ativa e dois frames. Não mede INP de campo.
- `medicoes.json` registra cabeçalhos, status, timings, respostas CDP quando disponíveis, erros, recursos, bytes e observadores suportados. Bytes em disco, Resource Timing e bytes codificados CDP têm contabilizações diferentes.
- O botão Acre é exercitado após a fotografia das métricas de abertura; a imagem do rodapé é conferida após rolagem. Isso distingue carga inicial e custo da visita completa.

O PageSpeed Insights público retornou HTTP 429. Essa resposta não contém auditoria Lighthouse utilizável nem dados de campo; não foi tratada como nota ou prova de ausência de CrUX.

A referência pública completou 520 visitas, sem erros de console/rede registrados. No perfil Android-4G direto, as respostas brutas observadas foram 200 no cache frio e 304 no aquecido. A Home teve LCP frio de 632 ms de mediana [620–3.376]; na amostra extrema, o DNS começou a 2.692,4 ms, durou 10,3 ms e a conexão terminou a 2.741,3 ms. A causa do intervalo anterior ao DNS não foi isolada; não é correto atribuir os 2,69 s à resolução DNS nem prometer eliminá-los com a mudança de links.

## Verificação e comparação

Valores em ms: **mediana [mínimo–máximo]**, cinco amostras em cada célula. As setas comparam antes → depois local. Navegação começa no evento click e termina após liberação da transição, h1 disponível e dois frames; não é INP. O percurso frio começa com contexto vazio, mas aquece recursos compartilhados ao avançar; não confundir com seis entradas diretas independentes.

### Chromium móvel — 4G / CPU 4×

| Página | LCP direto frio | LCP direto quente | Clique → utilizável, percurso frio | Clique → utilizável, percurso quente |
| --- | --- | --- | --- | --- |
| Home | 600 [588–628] → 592 [592–612] | 408 [392–412] → 404 [384–412] | 796 [795–812] → 494 [478–496] | 811 [795–812] → 480 [478–495] |
| Queimadas | 648 [628–684] → 644 [636–648] | 428 [412–432] → 412 [400–420] | 928 [927–929] → 594 [577–610] | 827 [826–843] → 512 [492–528] |
| Dados | 732 [712–776] → 740 [736–744] | 452 [436–484] → 448 [432–464] | 1029 [1011–1045] → 794 [778–796] | 960 [944–962] → 745 [728–762] |
| Prevenção | 636 [632–696] → 648 [644–652] | 420 [416–436] → 412 [408–444] | 910 [894–911] → 561 [544–611] | 862 [860–886] → 511 [510–561] |
| Sobre | 564 [552–588] → 572 [564–576] | 404 [396–412] → 400 [392–404] | 812 [810–813] → 495 [495–496] | 811 [794–813] → 479 [478–496] |
| Fontes | 640 [632–656] → 648 [644–656] | 416 [412–432] → 420 [404–436] | 844 [828–846] → 530 [528–545] | 828 [814–842] → 512 [512–513] |

### Chromium móvel — sem limitação

| Página | LCP direto frio | LCP direto quente | Clique → utilizável, percurso frio | Clique → utilizável, percurso quente |
| --- | --- | --- | --- | --- |
| Home | 52 [52–60] → 52 [52–60] | 20 [20–28] → 20 [20–20] | 233 [231–233] → 49 [48–65] | 232 [231–250] → 49 [48–66] |
| Queimadas | 60 [56–60] → 60 [56–60] | 20 [20–24] → 20 [20–32] | 249 [248–249] → 66 [64–82] | 232 [231–233] → 64 [48–65] |
| Dados | 72 [68–100] → 72 [68–84] | 24 [24–28] → 28 [24–32] | 249 [248–250] → 98 [83–100] | 232 [232–233] → 65 [65–66] |
| Prevenção | 56 [56–60] → 56 [56–60] | 20 [20–24] → 24 [20–36] | 249 [248–249] → 66 [64–66] | 232 [232–250] → 65 [64–65] |
| Sobre | 44 [44–44] → 44 [40–44] | 16 [16–28] → 24 [16–24] | 249 [232–249] → 48 [48–49] | 233 [231–250] → 49 [48–50] |
| Fontes | 60 [56–60] → 56 [56–60] | 20 [20–24] → 20 [20–20] | 248 [231–249] → 66 [65–67] | 249 [231–250] → 66 [48–67] |

### WebKit móvel — sem limitação

| Página | LCP direto frio | LCP direto quente | Clique → utilizável, percurso frio | Clique → utilizável, percurso quente |
| --- | --- | --- | --- | --- |
| Home | 78 [71–83] → 71 [69–75] | 66 [59–69] → 69 [64–70] | 324 [319–336] → 88 [84–91] | 324 [319–345] → 89 [86–91] |
| Queimadas | 33 [32–37] → 33 [32–34] | 22 [21–28] → 23 [22–23] | 277 [261–325] → 70 [68–86] | 271 [258–292] → 65 [63–82] |
| Dados | 51 [42–51] → 49 [46–56] | 40 [32–41] → 40 [32–41] | 255 [254–274] → 139 [131–147] | 275 [269–288] → 109 [107–112] |
| Prevenção | 30 [29–31] → 31 [30–32] | 21 [20–22] → 21 [20–22] | 271 [270–282] → 85 [69–86] | 272 [267–287] → 72 [54–87] |
| Sobre | 22 [21–23] → 23 [22–24] | 14 [14–15] → 15 [14–15] | 269 [268–285] → 70 [69–71] | 255 [254–269] → 70 [54–86] |
| Fontes | 30 [29–31] → 30 [29–31] | 21 [19–21] → 21 [20–21] | 271 [253–271] → 70 [53–99] | 269 [256–269] → 70 [68–71] |

### Chromium desktop — sem limitação

| Página | LCP direto frio | LCP direto quente | Clique → utilizável, percurso frio | Clique → utilizável, percurso quente |
| --- | --- | --- | --- | --- |
| Home | 80 [80–84] → 84 [80–92] | 52 [44–84] → 60 [48–68] | 319 [318–367] → 294 [291–294] | 342 [331–355] → 303 [288–326] |
| Queimadas | 60 [60–64] → 60 [56–60] | 24 [20–24] → 24 [20–24] | 292 [289–302] → 295 [288–339] | 262 [260–286] → 265 [246–285] |
| Dados | 76 [72–76] → 72 [72–84] | 32 [32–40] → 40 [32–52] | 310 [303–339] → 267 [265–304] | 281 [276–334] → 268 [262–273] |
| Prevenção | 60 [60–60] → 60 [56–60] | 24 [24–24] → 24 [24–36] | 324 [316–355] → 314 [309–320] | 291 [289–292] → 281 [279–299] |
| Sobre | 48 [44–48] → 44 [44–48] | 20 [20–28] → 24 [20–24] | 269 [262–295] → 264 [247–286] | 267 [246–288] → 267 [230–273] |
| Fontes | 60 [60–68] → 56 [56–64] | 24 [20–24] → 24 [24–28] | 320 [280–328] → 312 [309–319] | 293 [272–318] → 253 [231–298] |

### Rede de abertura — Chromium 4G / CPU 4×

Bytes abaixo são codificados por CDP, incluindo a contabilização do protocolo; não são bytes em disco. Valores são medianas, frio/quente, antes → depois. A ficha completa de FCP, DNS, TLS, TTFB, cache, recursos e erros por amostra permanece nos JSON locais.

| Página | Requisições frio | Bytes frio | Requisições quente | Bytes quente | FCP frio (ms) | TTFB frio (ms) |
| --- | --- | --- | --- | --- | --- | --- |
| Home | 4 → 4 | 16612 → 16951 | 5 → 5 | 3472 → 3472 | 600 [588–628] → 592 [592–612] | 2 [2–6] → 2 [1–6] |
| Queimadas | 5 → 5 | 19171 → 19518 | 6 → 6 | 4159 → 4159 | 648 [628–684] → 644 [636–648] | 2 [2–2] → 2 [2–2] |
| Dados | 12 → 12 | 71872 → 72265 | 13 → 13 | 9066 → 9066 | 732 [712–776] → 740 [736–744] | 3 [3–5] → 3 [3–4] |
| Prevenção | 6 → 6 | 18672 → 19036 | 7 → 7 | 4853 → 4853 | 636 [632–696] → 648 [644–652] | 2 [2–2] → 2 [1–2] |
| Sobre | 5 → 5 | 13926 → 14267 | 6 → 6 | 4159 → 4159 | 564 [552–588] → 572 [564–576] | 1 [1–2] → 1 [1–1] |
| Fontes | 5 → 5 | 18100 → 18434 | 6 → 6 | 4159 → 4159 | 640 [632–656] → 648 [644–656] | 2 [1–2] → 2 [1–2] |

### Referência pública anterior — sem publicação da candidata

Cada linha mantém as mesmas cinco amostras; não é uma comparação pública antes/depois.

| Perfil | Página | LCP direto frio (ms) | Clique → utilizável, percurso frio (ms) |
| --- | --- | --- | --- |
| android-4g | Home | 632 [620–3376] | 811 [795–812] |
| android-4g | Queimadas | 668 [644–676] | 929 [894–1362] |
| android-4g | Dados | 760 [748–768] | 1028 [960–1045] |
| android-4g | Prevenção | 668 [644–680] | 911 [879–928] |
| android-4g | Sobre | 592 [584–604] | 812 [796–813] |
| android-4g | Fontes | 672 [648–680] | 830 [828–846] |
| android | Home | 164 [156–200] | 299 [299–432] |
| android | Queimadas | 188 [156–284] | 349 [331–382] |
| android | Dados | 180 [164–412] | 366 [332–483] |
| android | Prevenção | 180 [172–224] | 332 [315–531] |
| android | Sobre | 152 [148–428] | 316 [299–382] |
| android | Fontes | 184 [168–216] | 348 [316–783] |
| ios-webkit | Home | 183 [173–207] | 421 [365–805] |
| ios-webkit | Queimadas | 103 [91–108] | 378 [356–430] |
| ios-webkit | Dados | 135 [103–250] | 380 [361–517] |
| ios-webkit | Prevenção | 90 [87–99] | 365 [347–458] |
| ios-webkit | Sobre | 80 [78–95] | 350 [347–734] |
| ios-webkit | Fontes | 93 [81–357] | 349 [347–378] |
| desktop | Home | 192 [168–212] | 410 [377–434] |
| desktop | Queimadas | 168 [160–188] | 418 [392–454] |
| desktop | Dados | 192 [188–252] | 440 [384–497] |
| desktop | Prevenção | 172 [156–224] | 393 [362–449] |
| desktop | Sobre | 152 [144–380] | 380 [346–416] |
| desktop | Fontes | 176 [172–256] | 376 [331–394] |

## Revisão independente e integridade dos resultados

A revisão final somente leitura identificou dois pontos, ambos corrigidos em uma passagem e cobertos por testes que falharam antes de passar: contagem de redirects no WebKit e fragmentação da marca em duas colunas com texto 200%. A segunda condição foi tratada como requisito de reflow, ampliando a regressão para **Conscientiza e Queimadas** em dez larguras, incluindo 600 e 640 px. A suíte completa voltou a passar em 299/299; o check passou com 21 Python e nove Node.

O contador sem CDP passou a observar os eventos reais de request. As contagens históricas foram reconciliadas com Resource Timing e o número de redirects do documento; o total da visita foi conferido contra todas as respostas HTTP preservadas. Não houve redirects de assets nos registros. Também foi corrigida a omissão dos redirects na instrumentação inicial da referência pública Chromium. Os arquivos `medicoes-originais.json` guardam os valores anteriores, e `reconciliacao-contagens.json` registra a intervenção. **Nenhum tempo de abertura, pintura ou navegação foi alterado nessa reconciliação.**

A coleta pública inicial não preservara os bytes dos redirects no total CDP das navegações. Esses totais foram marcados indisponíveis, mantendo Resource Timing e os registros HTTP, sem inventar overhead. Os bytes das entradas diretas públicas e da comparação local permanecem disponíveis. Os zeros CDP do WebKit foram normalizados para indisponível.

Após o ajuste visual, a candidata final foi novamente medida pelo protocolo completo, em `depois-final/`; a rodada intermediária de 520 visitas permanece em `depois/`. As tabelas comparam público/antes/candidata final, 1.560 visitas comparáveis. Os traces e a medição isolada do menu, feitos antes desse último ajuste da identidade, continuam válidos para a transição e o cabeçalho, que não foram modificados nessa passagem. O parecer e as decisões sobre suas limitações estão em `revisao-final.md` na área local.

## Interpretação e responsividade

O percurso frio melhorou em todas as seis páginas móveis: **22,8–39,0% no Chromium 4G/CPU 4×**, **60,5–80,5% no Chromium móvel sem limitação** e **45,5–74,7% no WebKit sem limitação**. Por exemplo, Dados passou de 1.028,7 para 793,7 ms no primeiro perfil e de 255 para 139 ms no WebKit. São ganhos locais, sem publicação, não previsões universais para aparelhos reais.

A abertura direta não apresentou melhora consistente além da variação observada: Home 600→592 ms e Dados 732→740 ms de LCP frio no perfil limitado. Não se atribui ganho de primeira visita à remoção de redirects que não ocorrem nessa entrada direta. As faixas se sobrepõem nesses exemplos; não há justificativa para remover arte, mapa ou dados para perseguir diferenças pequenas. A amostra pública extrema e a bancada física pendente continuam limitações relevantes.

A dissolução original sobrepunha parte de sua duração à rede e à execução do novo documento. Portanto, não se somam seus 180 ms nominais ao tempo de redirect para prever o ganho. A medição do percurso completo é a comparação válida. No desktop o efeito foi mantido; Queimadas, por exemplo, variou de 292,4 para 295,2 ms no percurso frio, com faixas sobrepostas, sem sinal de atraso material introduzido.

O CLS observado no Chromium foi zero antes/depois, inclusive após alcançar o rodapé. O WebKit não ofereceu esse observador; consta como indisponível. A maior duração registrada por Event Timing na seleção de Acre foi 112 ms antes e 104 ms depois. A coleta omite eventos abaixo do limiar de 16 ms e não constitui INP nem percentil 75 de usuários.

Um ensaio separado isolou a resposta do menu na Home, com cinco amostras por motor/fase. No Chromium 4G/CPU 4×, pointerdown→callback de abertura foi 40,4 [14,7–42,1] ms antes e 40,7 [15,7–41,9] ms depois; até dois frames após abertura, 64,0 [45,9–64,3] e 63,7 [46,9–65,4] ms. No WebKit, o callback teve mediana de 3 ms nas duas fases. O menu já respondia rapidamente; o problema demonstrado era o snapshot que interceptava controles durante a troca de documentos. Esses tempos são proxies instrumentados, não latência física até os pixels da tela.

Ambiente: Windows x64 10.0.26300, AMD Ryzen 7 5700, 16 CPUs lógicas e 32 GiB de RAM. A máquina não foi uma bancada de carga rigidamente controlada. Não houve outra suíte ou ensaio de navegador concorrente às comparações; scripts leves de documentação/consulta de resultados ocorreram durante a coleta.

## Verificações executadas

- `npm run check`: sintaxe, 21 testes Python e nove testes Node aprovados. As mensagens de erro emitidas por fixtures Python negativas são esperadas; a suíte terminou em OK.
- `npm test -- --reporter=line`: **299/299 aprovados**, incluindo a suíte Chromium existente e 17 regressões móveis em WebKit. A primeira rodada havia registrado 294/297; suas três falhas e as correções estão preservadas nos logs, sem omissão.
- Regressões: sete rodapés, 16 geometrias de viewport por documento/motor, texto 100/200%, conteúdo longo, zoom CSS, ausência de JavaScript, movimento reduzido, foco/Enter, histórico, menu, 27 UFs e seis gráficos por toque/teclado. Os testes existentes conferem contraste, axe, referências, Forms, CSP, bloqueio de iframe e 404.
- As regressões de escala, rotas, aliases do build, transição, marca e toque dos gráficos foram observadas falhando antes da correção. O ajuste das consultas nomeadas também foi validado contra a falha das divisórias em 1440 px.
- Capturas antes/depois foram inspecionadas, incluindo 320 px com texto 200%, móvel 390 px e desktop 1920 px. Os asserts geométricos complementam a inspeção; não substituem o aceite físico de zoom nativo, orientação e áreas seguras.

## Lighthouse público complementar

A API do PageSpeed retornou 429, mas a CLI Lighthouse 13.5.0 conseguiu auditar as seis URLs públicas. Foi **uma execução por página**, diagnóstico complementar sem mediana nem comparação com a candidata local. Preset móvel, simulação Lantern, 412×823, DPR 1,75, RTT 150 ms, throughput 1.638,4 kbit/s e CPU 4×; configurações efetivas completas nos JSON.

| Página | Desempenho / Acessibilidade / Boas práticas / SEO | LCP (ms) | TBT (ms) | CLS |
| --- | --- | --- | --- | --- |
| index | 97/100/100/100 | 954 | 0 | 0 |
| queimadas | 100/100/100/100 | 935 | 0 | 0 |
| dados | 100/100/100/100 | 1097 | 0 | 0 |
| prevencao | 100/100/100/100 | 943 | 0 | 0 |
| sobre | 100/100/100/100 | 830 | 0 | 0 |
| fontes | 100/100/100/100 | 928 | 0 | 0 |

Essas notas pertencem ao site publicado anterior, não à candidata. Lighthouse mede abertura direta; não reproduz o percurso por links com os snapshots que interceptavam controles. Notas boas não invalidam a queixa de navegação. Não foram obtidos dados CrUX nesta execução; a cobertura de campo não foi confirmada e nenhum INP/p75 foi inventado.

## Reprodução local

O runner local de ensaio foi preservado junto às evidências. Ele usa `createStaticServer` com `cache: revalidate`, `canonicalRedirects: true`, `compress: true` e os cabeçalhos do `_headers` do artefato servido. Executar cada comando isoladamente, sem outra suíte ou medição de navegador simultânea:

```powershell
node .auditoria-local/mobile-20261027/medir-local.mjs antes .auditoria-local/mobile-20261027/antes-dist --runs 5 --output .auditoria-local/mobile-20261027/repro-antes
npm run preparar:publicacao
node .auditoria-local/mobile-20261027/medir-local.mjs depois dist --runs 5 --output .auditoria-local/mobile-20261027/repro-depois
npm run medir:site -- --base-url https://conscientiza-queimadas.pages.dev/ --phase antes --output .auditoria-local/mobile-20261027/publico-repeticao --runs 5
```

As saídas `repro-*` devem ser pastas novas; escolher outro nome se já existirem. O snapshot antigo é necessário: executar a fase antes sobre o código atual não recria a linha de base. O servidor `npm run dev` com `no-store` serve para desenvolvimento, não para comprovar o cenário aquecido deste relatório.

## Aceite manual em hardware físico

O proprietário escolheu executar este complemento. WebKit no Windows não equivale a Safari em iPhone. Rede/CPU limitadas por CDP pertencem somente ao ensaio Chromium; falta validar essas condições no iOS físico.

Neste perfil do WebKit, Tab e Alt+Tab não percorreram os links do rodapé. A automação verifica foco e ativação por Enter, enquanto a sequência por Tab é verificada no Chromium. A preferência nativa de navegação por teclado no Safari/iOS permanece parte do aceite físico; o HTML não foi alterado para forçar a configuração do navegador.

1. Abrir a candidata local por um servidor acessível ao celular, usando o mesmo `dist/` validado. Na raiz do projeto, executar `node --input-type=module -e "import {createStaticServer} from './scripts/dev-server.mjs'; createStaticServer({root:'dist'}).listen(4173,'0.0.0.0')"` e acessar `http://IP-LOCAL-DO-PC:4173/` no celular. O servidor padrão escuta somente loopback: esse compartilhamento em LAN deve ser temporário, restrito à rede de confiança e encerrado com Ctrl+C. É um ensaio HTTP de interface; os testes automatizados separados conferem os cabeçalhos de produção. Não publicar uma prévia remota nesta tarefa.
2. Registrar modelo, versão de iOS/Android e navegador, rede e horário. No Safari, usar aba privada ou limpar os dados deste site; no Chrome, usar contexto limpo. Registrar também se DNS/conexão foram reutilizados quando houver inspector.
3. Na primeira visita, abrir a Home e tocar no menu. Percorrer Queimadas → Dados → Prevenção → Sobre → Fontes → Home. Observar resposta imediata, ausência de branco/overlay e tempo de chegada do conteúdo; repetir voltar/avançar.
4. Repetir o percurso na mesma sessão aquecida, em Wi-Fi e rede móvel. Gravar a tela com marcação dos toques, anotando qualquer espera e a rota correspondente.
5. Em Dados, selecionar UFs pelo mapa e pela lista, conferir a atualização dos gráficos e alternar a seleção. Em cada página, alcançar o rodapé, girar o aparelho e aumentar texto/zoom até 200%.
6. Conferir arte, legibilidade, grupos e links do rodapé, inclusive junto à área segura. Testar movimento reduzido e teclado externo/tecnologia assistiva quando disponíveis. Conferir Forms em nova aba.
7. Para investigação avançada, usar Safari Web Inspector com Mac e iPhone, ou Chrome remoto com Android. Anexar os resultados ao aceite antes de autorizar publicação.

## Estado da entrega local antes da autorização de commit/push

Registro histórico do encerramento da implementação local, anterior à autorização posterior para commits e push. As medições abaixo não são reatribuídas a um deploy futuro.

- Branch `main`, HEAD `21c9448`, sem novos commits. A referência local `origin/main` permanece no mesmo commit; nenhuma operação de publicação foi executada.
- `npm run preparar:publicacao`: **29 arquivos, 1.117.115 bytes** em disco. Aumento bruto de 1.324 bytes sobre a distribuição inicial de 1.115.791 bytes. Isso não é transferência de rede; os valores codificados estão nas tabelas e nos JSON.
- `npm run test:publicacao`: **6/6 aprovados**. `git diff --check` sem erros. A lista explícita do build continua com 29 arquivos; não inclui relatório, testes, originais, logs ou auditorias.
- Segurança e conteúdo: `_headers` preservado, CSP em enforcement, X-Frame-Options DENY, 404 HTTP, dados científicos, referências, WebP, mapa e Forms conferidos pela suíte. Sem dependência de produção adicionada.
- Evidências completas preservadas em `.auditoria-local/mobile-20261027/`, incluindo `publico/`, `antes/`, `depois-final/` (candidata final), `depois/` (intermediária), `antes-matriz/`, `testes-pos-revisao/` (candidata final), `testes-finais/` (intermediária), traces, Lighthouse, diagnósticos e resumos. Nenhum diretório histórico foi apagado.
- **Sem commit, push, deploy, mudança de conta Cloudflare, DNS ou visibilidade do GitHub.** Aceite físico e eventual publicação dependem da revisão do proprietário.

Arquivos alterados e estado do checkout:

```text
## main...origin/main
 M 404.html
 M README.md
 M dados.html
 M fontes.html
 M index.html
 M package.json
 M playwright.config.js
 M prevencao.html
 M queimadas.html
 M scripts/dev-server.mjs
 M scripts/medir-site.mjs
 M scripts/preparar-publicacao.mjs
 M sobre.html
 M src/graficos-interacao.js
 M src/styles.css
 M tests/cloudflare.spec.js
 M tests/dados-revisao.spec.js
 M tests/dados.spec.js
 M tests/fontes.spec.js
 M tests/footer.spec.js
 M tests/hero.spec.js
 M tests/navegacao.spec.js
 M tests/pre-publicacao.spec.js
 M tests/prevencao.spec.js
 M tests/publicacao.node.mjs
 M tests/queimadas.spec.js
 M tests/sobre.spec.js
?? docs/relatorio-rodape-performance-mobile.md
?? tests/medicao.node.mjs
?? tests/mobile-regressoes.spec.js
```

Capturas locais representativas (arquivos ignorados, preservados para revisão):

- Antes, 1920 px: [rodapé](../.auditoria-local/mobile-20261027/antes-matriz/chromium/index.html-1920-100%25.png).
- Antes, 320 px/texto 200%: [rodapé](../.auditoria-local/mobile-20261027/antes-matriz/chromium/index.html-320-200%25.png).
- Depois, 1920 px: [rodapé](../.auditoria-local/mobile-20261027/testes-pos-revisao/mobile-regressoes-rodap%C3%A9-f-99911-rienta%C3%A7%C3%B5es-e-texto-ampliado-chromium/footer-1920-100%25.png).
- Depois, 320 px/texto 200%, WebKit: [rodapé](../.auditoria-local/mobile-20261027/testes-pos-revisao/mobile-regressoes-rodap%C3%A9-f-99911-rienta%C3%A7%C3%B5es-e-texto-ampliado-webkit-mobile/footer-320-200%25.png).

## Referências técnicas

Consultadas em 27/10/2026. São documentação de plataforma, não resultados medidos neste projeto.

- [Cloudflare Pages: rotas, 404 e cache](https://developers.cloudflare.com/pages/configuration/serving-pages/).
- [Cloudflare Pages: redirects](https://developers.cloudflare.com/pages/configuration/redirects/).
- [Transições nativas entre documentos](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document).
- [Chrome DevTools: inspeção de rede](https://developer.chrome.com/docs/devtools/network/).
- [Web Vitals e limiares](https://web.dev/articles/vitals): LCP ≤ 2,5 s, INP ≤ 200 ms e CLS ≤ 0,1 no percentil 75 de campo são objetivos de experiência, não garantias universais nem conclusões de laboratório.
- [Diagnóstico de LCP](https://web.dev/articles/optimize-lcp).
- [WebKit: habilitar Web Inspector](https://webkit.org/web-inspector/enabling-web-inspector/).
