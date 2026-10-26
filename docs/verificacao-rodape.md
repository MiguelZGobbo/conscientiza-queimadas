# Rodapé da Home — decisões e verificação

## Feedback em nova aba — 26/10/2026

A pedido do usuário, o Feedback das seis páginas passou a abrir em nova aba com `target="_blank"` e `rel="noopener noreferrer"`. A descrição acessível agora informa “Formulário externo no Google Forms. Abre em nova aba.”. CSS, scripts e demais destinos foram preservados, e os seis rodapés continuam idênticos.

Os 94 testes selecionados de rodapé, Fontes, revisão de Dados e Hero passaram, incluindo abertura em nova aba por teclado com e sem JavaScript, permanência da página original, ausência de `window.opener` e a matriz responsiva com texto ampliado. A comparação visual foi conferida em 390, 768 e 1440 px. Este ajuste acrescenta 60 bytes ao HTML: o orçamento do rodapé passa a 7.180 bytes, preservando a margem anterior para o total de 7.167 bytes. Os resultados completos abaixo registram a etapa anterior.

## Integração de Feedback — 26/10/2026

O item “Feedback” agora aponta diretamente para `https://forms.gle/wLPDbMi2CeicbYYH9`, em uma nova aba, nos seis rodapés: Início, Queimadas, Dados, Prevenção, Sobre o projeto e Fontes e créditos. O texto “Formulário externo no Google Forms. Abre em nova aba.” substitui o aviso de indisponibilidade e descreve o link por `aria-describedby="feedback-description"`. Não há página intermediária, formulário incorporado ou dependência de JavaScript.

O HTML dos rodapés continua idêntico. CSS, breakpoints, tipografia, cores, foco, hover e espaçamentos foram preservados; o novo link herda a área clicável mínima de 44 × 44 px. A altura cresce naturalmente com o conteúdo. Sobre o projeto, Fontes e créditos e Voltar ao topo mantêm seus destinos. Esta integração substitui os estados históricos de indisponibilidade de Feedback descritos abaixo.

Antes da alteração, os 60 testes selecionados de rodapé, Sobre, Fontes e revisão de Dados passaram. As verificações de Feedback cobrem os seis documentos, URL exata, nome e descrição acessíveis, teclado e navegação em nova aba com e sem JavaScript; o destino externo é interceptado nos testes, sem acessar ou enviar respostas ao formulário. A matriz responsiva verifica 320, 390, 599, 600, 768, 1024, 1199, 1200, 1440 e 1920 px com texto a 100% e 200%. A comparação visual antes/depois em 390, 768 e 1440 px mostrou apenas as diferenças esperadas do link ativo, da descrição e do crescimento natural do rodapé.

Os 85 testes selecionados após a integração passaram. Na primeira execução completa, 250 testes passaram e o orçamento do rodapé falhou: os novos atributos e textos acrescentaram exatamente 120 bytes ao HTML, levando o conjunto HTML/CSS de 6.987 para 7.107 bytes. O limite passou de 7.000 para 7.120 bytes, preservando a margem anterior; os limites da imagem e dos demais recursos permaneceram iguais. O teste de desempenho isolado passou após esse ajuste. `npm run check` também passou, incluindo os 21 testes Python.

Na execução final, `npm test -- --reporter=line` passou com os 251 testes Chromium em 1,9 minuto. A revisão independente não encontrou problemas na integração nem no ajuste do orçamento. As alterações locais anteriores foram preservadas.

## Integração de Fontes e créditos — 26/10/2026

O item “Fontes e créditos” agora é um link relativo para `./fontes.html` nos seis rodapés, incluindo a nova página. Somente Feedback permanece indisponível. A navbar mantém seus quatro itens; estrutura, arte, contexto acadêmico e retorno ao topo local foram preservados. O HTML dos seis rodapés é idêntico. Esta integração substitui o estado anterior de indisponibilidade de Fontes descrito no histórico abaixo. Resultados e limites em [verificacao-fontes.md](./verificacao-fontes.md).

## Integração de Sobre — 26/10/2026

O atalho “Sobre o projeto” agora abre `./sobre.html` nas cinco páginas, sem entrar na navbar principal. Fontes e créditos e Feedback continuam como textos sem interação, com aviso específico de indisponibilidade. Conforme a confirmação do usuário, a atribuição acadêmica passou a mencionar as Atividades Extensionistas I, II e III do curso de Engenharia de Software da UNINTER. A estrutura, os recursos visuais e o CSS do rodapé foram preservados; sua altura continua acompanhando naturalmente o conteúdo. Os cinco documentos têm rodapés idênticos, com `#inicio` local em cada página. Essa integração substitui a situação de indisponibilidade de Sobre descrita no histórico abaixo. Verificações e limites atuais estão em [verificacao-sobre.md](./verificacao-sobre.md).

## Correção de nitidez e densidade — 20/10/2026

O diagnóstico confirmou que a máscara vertical anterior desvanecia também o primeiro plano. Além disso, o antigo banner de 2172 px incluía grande área verde sem detalhes e não fornecia densidade 2× em largura desktop. A comparação do PNG com o WebP mostrou efeito menor da compressão. A solução remove a máscara e concentra a imagem na paisagem, com preenchimento verde em CSS e escurecimento restrito à área dos textos e à faixa inferior do copyright.

O ImageGen refinou o recorte esquerdo do PNG aprovado, reconstruindo folhas, ramos e contornos em 2014 × 780 px nativos. O arquivo não é uma ampliação do anterior. O painel ocupa 50vw no desktop e até 960 px CSS em todas as larguras; nas telas estreitas, sizes considera também a largura necessária ao recorte de 180 px de altura. A revisão independente identificou ampliação em 1199 px/2×; o limite de 960 px e uma regressão específica corrigiram esse intervalo.

As quatro páginas usam os mesmos caminhos relativos e srcset/sizes. WebPs qualidade 94: 768 px/49.750 bytes; 960/73.096; 1440/145.428; 1920/218.998; 2014/234.972. Todas as variantes ficam abaixo de 450.000 bytes; o src de fallback em 1440 px também respeita o limite legado de 200.000 bytes. HTML/CSS do rodapé e código anterior continuam com limites separados de 7.000 e 40.000 bytes.

As capturas comparam 390, 768, 1440 e 1920 px em 1×/2×, esperando a decodificação da imagem. Testes medem a dimensão física do WebP escolhido contra a área realmente pintada, incluindo object-fit, além dos casos de 1199 px e das quatro páginas. A faixa inferior passou pelo teste de contraste real em nove larguras e texto 100%/200%, sem alterar o requisito AA.

Verificação final: **193 testes Playwright aprovados em 1,8 min**; `npm run check` aprovou sintaxe e **21 testes Python**; `git diff --check` sem erros. Conferência adicional com axe: nenhuma violação A/AA na Home em 390, 768, 1440 e 1920 px, nem em Queimadas a 1440 px. A suíte preserva navegação, histórico, publicação em subdiretório, alternativas sem JavaScript, touch, movimento reduzido, texto a 200%, telas baixas, contraste e axe. A revisão independente apontou o caso de densidade em 1199 px, corrigido e coberto por regressão. O HTML/CSS do rodapé ocupa 6.891 bytes, abaixo dos 7.000 permitidos; o código anterior ficou em 39.002 bytes, abaixo dos 40.000 permitidos.

## Registro anterior — 07/10/2026

Implementado e redesenhado em 07/10/2026 para encerrar a Home do Conscientiza Queimadas. A versão atual utiliza um fundo raster preparado a partir do exemplo 3 enviado pelo usuário e a logo original do site, substituindo a paisagem vetorial e a folha das versões anteriores. A marcação e os estilos do Hero e de Impactos foram preservados; nenhuma página ou dependência foi adicionada. O servidor local recebeu suporte à extensão WebP para servir a imagem.

## Estrutura e integração

O `<footer>` é filho direto de `<body>`, depois de `.home-opening` e fora de `<main>`, formando o landmark de informações da página. O nome do projeto usa `h2`; Navegação, Institucional e Atividade acadêmica usam `h3`. A navegação recebe seu nome acessível pelo heading.

São apresentados a identidade e a frase de apoio aprovadas, o acesso Início (`#inicio`), os três conteúdos institucionais, a Atividade Extensionista III da UNINTER, Itaguaçu — Espírito Santo e © 2026 Conscientiza Queimadas. Não foram acrescentadas informações de contato, redes sociais ou páginas legais.

Sobre o projeto, Fontes e créditos e Feedback permanecem como itens de texto comum, com a indicação compartilhada “Conteúdos ainda não disponíveis.” Essa adaptação foi escolhida pelo usuário porque as páginas ainda não existem. Os itens não têm aparência de link, `href`, `role` interativo ou `tabindex`. Na integração futura, converter cada item em link somente quando houver destino real; Sobre o projeto deve aproveitar a página Sobre quando implementada. Os outros dois destinos serão definidos na etapa correspondente, sem rotas fictícias agora.

## Composição e responsividade

Fundo, textos e destaque reutilizam `--background`, `--foreground`, `--muted` e `--accent`, com a fonte do sistema e o container existentes. O nome fica em duas linhas e é acompanhado da mesma logo vetorial do cabeçalho, com os mesmos contornos e proporções. Os títulos dos grupos usam off-white e caixa alta discreta; os detalhes quentes se concentram na logo e na paisagem. Todos os textos ficam alinhados à esquerda, com mais largura para a identidade e o contexto acadêmico no desktop.

| Largura | Composição |
| --- | --- |
| Abaixo de 600 px | Uma coluna, na ordem identidade → navegação → institucional → atividade acadêmica |
| 600–1199 px | Duas colunas, mantendo a ordem de leitura por linha |
| A partir de 1200 px | Imagem de fundo cobrindo o rodapé, com paisagem à esquerda; quatro grupos à direita e divisórias verticais discretas |

A altura acompanha o conteúdo, sem recortes ou altura fixa nos blocos textuais. A paisagem de entardecer ocupa o fundo completo no desktop e mantém uma região escura para leitura. Abaixo de 1200 px, aparece numa faixa de 180 px depois dos grupos e antes do copyright, preservando o fundo sólido sob os textos. As divisórias verticais ficam restritas ao desktop. A imagem é decorativa, não representa espécies ou uma paisagem local documentada e não contém textos ou ícones do mockup.

No desktop, a imagem conserva sua proporção original e se dissolve no fundo escuro na borda inferior. Assim, aumentar a altura do rodapé não amplia o sol sobre o texto. Quando o texto é ampliado a 200%, os grupos passam a duas colunas, sem divisórias verticais, para manter palavras e títulos legíveis; essa adaptação responde à largura do container em unidades de texto.

## Acessibilidade e validação

- Texto normal e ampliado a 200% verificados em 320 × 568, 390 × 844, 600 × 900, 768 × 1024, 1024 × 768, 1199 × 900, 1200 × 900, 1440 × 900 e 1920 × 1080: ordem preservada, sem recorte ou rolagem horizontal. Os limites de 600 e 1200 px também foram verificados.
- Todos os textos, inclusive avisos e copyright, e os estados normal, hover e foco de Início atingem contraste mínimo de 4,5:1 nas nove larguras previstas, com texto a 100% e 200%. O teste captura o fundo realmente renderizado com os textos temporariamente invisíveis, preservando a geometria, e mede os pixels sob cada caixa de texto; considera a imagem, além da cor CSS. O contorno de foco também supera 3:1.
- Início é sublinhado, tem alvo mínimo de 44 × 44 px e usa o contorno visível existente. Tab a partir do atalho do Hero chega ao link do rodapé; Shift+Tab retorna e Enter volta suavemente ao topo sem recarregar. O cabeçalho recebe foco nativo com contorno para dentro; o próximo Tab chega à marca. Verificado em 390 e 1440 px, inclusive sem JavaScript. Com movimento reduzido, o retorno é instantâneo.
- A localização é acompanhada de um marcador SVG autoral, decorativo e sem interação. A logo SVG é decorativa, com `aria-hidden="true"` e `focusable="false"`. O contêiner da imagem também é decorativo, com `aria-hidden="true"`; a imagem tem `alt=""`. Nenhum desses elementos recebe interação ou animação. Um teste compara os contornos e o `viewBox` da logo com os do cabeçalho.
- O rodapé funciona sem JavaScript. Com movimento reduzido, a transição de cor é removida; a paisagem permanece estática.
- Capturas completas da Home e detalhes do rodapé em 390, 768, 1200 e 1440 px foram inspecionados visualmente. São gerados nos diretórios de saída do Playwright, em `test-results/`, ignorados pelo Git.

Os 16 testes específicos desta revisão estão em `tests/footer.spec.js`. Eles incluem a posição do fundo no desktop e mobile, as divisórias, os limites dos layouts, carregamento da imagem com MIME correto, identidade da logo e as verificações de acessibilidade. O retorno ao topo é amostrado em 390 e 1440 px, nas combinações com/sem JavaScript e com/sem movimento reduzido, distinguindo rolagem suave de chegada instantânea.

A versão inicial com imagem raster aprovou 63 testes. Na verificação anterior, após a correção do retorno suave e da revelação de Impactos, `npm test` aprovou os 77 testes da suíte completa em 46,0 s, incluindo os 16 testes do rodapé. `npm run check` e `git diff --check` também passaram. O ajuste do retorno acrescentou somente a âncora e o foco no cabeçalho; a navegação da navbar, o conteúdo e o visual do Hero permanecem preservados. A revisão independente não encontrou problema concreto de integração ou semântica; sua observação anterior sobre contraste com texto ampliado foi medida, corrigida e incorporada à cobertura.

A cobertura de navegador é Chromium; não foi realizada auditoria manual com leitor de tela nem execução em Firefox ou WebKit.

A revelação de Impactos foi posteriormente removida a pedido do usuário. O retorno suave por Início permanece; os 12 testes exclusivos da revelação também foram retirados.

Após essa remoção, os 65 testes restantes passaram em 41,7 s, incluindo os 16 do rodapé; `npm run check` e `git diff --check` também passaram.

## Arquivos alterados

- `index.html`: rodapé semântico, conteúdo aprovado, logo original e imagem decorativa.
- `src/styles.css`: composição, responsividade, estados de link e enquadramento da paisagem.
- `src/footer-background.webp`: fundo preparado a partir da opção 3.
- `scripts/dev-server.mjs`: suporte a arquivos WebP.
- `tests/footer.spec.js`: conteúdo, layout, contraste, teclado e ausência de JavaScript.
- `tests/hero.spec.js`: integração do rodapé e orçamento separado para seus recursos.
- `README.md`: documentação da Home.
- `docs/recursos-e-licencas.md`: origem, preparação e atribuição dos recursos.
- `docs/verificacao-rodape.md`: decisões, adaptações e evidências desta entrega.

## Adaptação do teste anterior de peso

A verificação de peso da Home antes do rodapé limitava o HTML/CSS/scripts a 40.000 bytes no mobile. O HTML/CSS atual do rodapé ocupa 5.879 bytes e é medido separadamente, com limite de 7.000 bytes. A imagem local WebP ocupa 21.556 bytes e tem um limite próprio de 200.000 bytes. O limite anterior de 40.000 bytes para os recursos existentes é preservado, descontando somente os recursos novos do rodapé. Os delimitadores do bloco de CSS permitem medir seus bytes reais. O teste também confirma o carregamento e o tipo `image/webp`. Não houve inclusão de biblioteca em produção ou solicitação a serviço externo pelo site.
