# Rodapé da Home — decisões e verificação

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
