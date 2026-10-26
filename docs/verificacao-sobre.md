# Sobre o projeto — implementação e verificação

Implementação de 26/10/2026 conforme o handoff e o plano aprovados, na branch local `codex/sobre-projeto`. Sem commit, push ou publicação.

## Conteúdo e integração

`sobre.html` contém somente os três blocos aprovados: um H1, dois H2 e sete parágrafos, com Miguel Zager Gobbo, Itaguaçu como foco inicial e alcance pela internet. O texto apresenta a trajetória nas Atividades Extensionistas I, II e III, identifica a III como etapa atual e esclarece o caráter acadêmico e educativo, sem oficialidade institucional. A fixture editorial foi registrada antes da implementação.

Sobre é aberta pelo atalho já existente no rodapé das quatro páginas principais. A navbar preserva Início, Queimadas, Dados e Prevenção; em Sobre, nenhum desses itens é identificado como página atual. O destino relativo `./sobre.html` funciona em subdiretórios. O servidor local autoriza a nova página explicitamente, preservando a restrição aos demais arquivos permitidos.

Os cinco rodapés preservam HTML idêntico, exceto pela integração comum aplicada a todos: link de Sobre, aviso restrito a Fontes e créditos e Feedback e atribuição acadêmica às atividades I, II e III, conforme confirmação expressa do usuário. Os dois conteúdos futuros permanecem sem interação e sem destinos fictícios. `#inicio` continua levando ao cabeçalho da própria página e recebendo foco. Nenhum conteúdo principal das quatro páginas existentes foi alterado.

## Estilos reutilizados

Navbar, menu nativo, foco, atalho para conteúdo, rodapé e imagens existentes usam `src/styles.css` e `src/navigation.js`. A abertura compacta usa `.page-intro` de `src/paginas.css`, com `.container.reading-column`, sem a grade ilustrada. As duas seções reutilizam `.reading-section`, `.reading-section__layout` e `.reading-section__body`.

Os seletores de `src/queimadas.css` passam a incluir `.sobre-page`, sem modificar valores existentes: `--reading-type-unit: clamp(1rem, min(1.15vw, 2.3svh), 1.25rem)`, `--reading-gap` e `--reading-space`, coluna de 68ch e margens `--page-gutter`. H1 e H2 preservam as fórmulas compartilhadas. Não há CSS de página, breakpoints, imagens, fontes, dependências ou JavaScript de produção novos.

Medições em fonte normal demonstram a adaptação por largura e altura:

| Janela | H1 | Corpo | Espaçamento vertical de seção |
| --- | --- | --- | --- |
| 1280×500 | 30 px | 16 px | 45 px |
| 1351×622 | 37,32 px | 16 px | 55,98 px |
| 1920×1080 | 44 px | 20 px | 80 px |

Uma condição local de melhoria progressiva permite a transição nativa entre documentos em Sobre somente com movimento permitido e scripts disponíveis. O teste sem JavaScript revelou bloqueio do menu pela camada de transição no Chromium; o mesmo comportamento foi reproduzido entre Início e Prevenção, antes de qualquer alteração nessas aberturas. Sobre exige `(scripting: enabled)` para aderir à transição, permitindo entrada e saída sem o bloqueio, sem modificar as quatro páginas existentes. A rolagem suave por âncora continua seguindo a preferência de movimento, inclusive sem scripts.

## Verificação

Antes das alterações de produção, os 197 testes Playwright existentes passaram. Os dois primeiros testes novos falharam pelos motivos esperados: resposta 404 para Sobre e atribuição acadêmica antiga no rodapé.

Os testes da nova página cobrem texto integral e ordem, semântica, metadados, integração pelo rodapé, igualdade dos cinco rodapés, subdiretório e recursos locais, teclado, menu mobile, foco visível, alvos de 44 px, âncoras, ausência de JavaScript e movimento reduzido. A comparação de estilos computados verifica igualdade de fontes, espaçamentos e coluna com Queimadas e Prevenção, incluindo variação efetiva da escala entre janelas.

As dimensões verificadas são 320×568, 390×844, 768×1024, 1024×768, 1440×900, 1920×1080, 844×390 e 1280×500, com fonte raiz a 100% e 200%. A detecção considera overflow horizontal, blocos fora da janela, sobreposição e cortes reais; a pequena extensão vertical dos glifos além da caixa de linha, com `overflow: visible`, não representa corte. O axe executa regras WCAG A/AA 2.0, 2.1 e 2.2 no celular e desktop, incluindo estados normal, hover e foco do link de Sobre. O teste existente do rodapé também mede contraste sobre seu fundo efetivamente renderizado.

Resultado final: `npm test -- --reporter=line` passou nos 213 testes Chromium, incluindo os 16 novos testes de Sobre. `npm run check` passou nas checagens de sintaxe e nos 21 testes Python; as mensagens de arquivos ausentes e fontes incompletas pertencem aos cenários negativos esperados. `git diff --check` passou.

Capturas completas em 320 e 1440 px, com texto a 100% e 200%, foram inspecionadas visualmente. Capturas de viewport em 320 px com fonte ampliada complementaram a leitura das imagens longas. Não foram observados cortes, sobreposições ou rolagem horizontal. As imagens de verificação ficam em `test-results/sobre-visual/`, ignoradas pelo Git. A revisão independente de conteúdo, código e cobertura não encontrou achados acionáveis; confirmou rodapés idênticos, alterações das quatro páginas restritas aos rodapés e fixture correspondente ao handoff. Não há informação ou integração desta página aguardando confirmação do usuário.

## Arquivos criados ou modificados

- Criados: `sobre.html`, `tests/sobre.spec.js`, `tests/fixtures/sobre-aprovado.json` e este registro.
- Integração dos rodapés: `index.html`, `queimadas.html`, `dados.html` e `prevencao.html`.
- Reutilização e rota: `src/queimadas.css`, `src/paginas.css` e `scripts/dev-server.mjs`.
- Expectativas de integração atualizadas: `tests/footer.spec.js` e `tests/dados-revisao.spec.js`.
- Documentação atualizada: `README.md` e `docs/verificacao-rodape.md`.

## Limites

A ampliação da fonte raiz e o reflow em 320 pixels CSS são verificações distintas do zoom nativo do navegador. Zoom nativo, leitores de tela, Firefox, Safari e dispositivos físicos não foram verificados nesta tarefa. Automação e revisão visual não certificam conformidade integral com WCAG. A pendência anterior de licença da referência original do fundo do rodapé permanece registrada em `docs/recursos-e-licencas.md`; nenhum recurso externo foi acrescentado.
