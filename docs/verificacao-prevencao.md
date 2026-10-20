# Página Prevenção — decisões e verificação

Implementação de 20/10/2026, diretamente na `main`, conforme o plano aprovado. Sem commit, push ou publicação.

## Conteúdo e apresentação

O conteúdo foi fornecido pelo usuário e preservado na introdução, nas três seções e no encerramento. A fixture editorial foi extraída do handoff antes da implementação; exclui rótulos de instrução ao implementador e mantém 77 blocos de conteúdo na ordem de leitura. Não há estatísticas novas, instruções de combate, construção de aceiros ou realização de queimas. As regras regionais não são apresentadas como nacionais.

A introdução escura é compacta e contém o 193 e um atalho direto à emergência. O sumário reutiliza os estilos compartilhados. O conteúdo permanece em coluna editorial de até 68ch, com listas para prevenção, quatro passos ordenados diante do fogo e um bloco de canais oficiais. O 193 recebe destaque de tamanho e cor; os avisos têm texto explícito, sem depender da cor e sem anunciar uma emergência ativa. A ressalva de evacuação permanece visível na seção sobre fumaça.

`src/queimadas.css` atende às duas páginas por ampliação dos seletores do corpo de leitura. A escala original usa `clamp()`, largura, altura útil e limites em `rem`: corpo de 16–20 px, H1 de 28–44 px e espaçamentos fluidos. `src/prevencao.css` contém somente a composição específica. Não há sistema responsivo alternativo, dependência nova, imagem nova ou JavaScript de produção adicional.

Os cabeçalhos e o menu nativo existente foram reutilizados. Somente o item Prevenção foi habilitado nas outras páginas; em Queimadas, o aviso de desenvolvimento foi substituído pelo link aprovado. O rodapé foi copiado integralmente, com o destino local `#inicio`. Os quatro HTMLs preservam rodapés idênticos.

## Fontes e direitos

As onze referências oficiais fornecidas abriram na conferência de 20/10/2026, algumas com redirecionamento. Ibama confirma 0800 061 8080, de segunda a sexta, 7h–19h, e o Fala.BR. Os contatos 193 e 199 foram confirmados por órgãos públicos. O Ministério da Saúde respalda a redução de exposição, hidratação, grupos vulneráveis e proteção contra partículas. O texto conserva a ressalva de que permanecer em ambiente fechado só se aplica enquanto o local estiver seguro.

A Lei nº 14.944/2024 é a referência jurídica principal. A página de prevenção do Ibama é anterior à lei; a página de queima controlada contém instruções operacionais que não foram reproduzidas. Nenhum desses conteúdos foi usado para acrescentar regras nacionais ou tutoriais.

Por decisão posterior do usuário, o bloco “Fontes oficiais” foi removido do encerramento, junto aos seus estilos exclusivos. As referências ficam preservadas para a futura página dedicada às fontes; essa nova página não faz parte desta alteração. Os telefones e o link do Fala.BR permanecem como orientações práticas. Fontes, autoria e condições de uso estão registradas em [recursos-e-licencas.md](./recursos-e-licencas.md). Não foram incorporados materiais externos novos. A licença da referência original do fundo do rodapé continua pendente, conforme o registro anterior; sua reutilização não resolve essa pendência.

## Verificações

Antes da implementação, o novo teste editorial e o teste semântico falharam com o 404 esperado. Após a implementação inicial, os quatro testes de conteúdo/integração e os sete testes de acessibilidade passaram. Na revisão posterior, as expectativas de bibliografia visível foram substituídas por um teste de ausência do bloco e preservação do Fala.BR; ele falhou antes da remoção, encontrando o título “Fontes oficiais”, como esperado. Os 41 testes de Home e Queimadas também passaram após atualizar apenas as expectativas de Prevenção indisponível.

Foram cobertos: conteúdo em sequência, 193 na abertura, três protocolos `tel:`, Fala.BR e ausência de bibliografia no conteúdo, caminhos relativos, publicação em subdiretório, página atual, igualdade dos rodapés, teclado, foco, âncoras e topo sem JavaScript, movimento reduzido e alvos principais de 44 px. Os testes conferem os destinos telefônicos sem efetuar chamadas reais.

O teste responsivo verifica 320×568, 390×844, 768×1024, 1024×768, 1440×900, 1920×1080, 844×390 e 1280×500, com fonte raiz normal e a 200%. Capturas de página e seções em 320 e 1440 px foram inspecionadas visualmente, incluindo o encerramento após a remoção das fontes, sem cortes ou espaços residuais do bloco removido. O axe-core não detectou violações nas regras WCAG A/AA 2.0, 2.1 e 2.2 executadas.

Resultado final após a remoção das fontes visíveis: os 12 testes de Prevenção passaram e `npm test` passou nos 177 testes Chromium; `npm run check` passou nas checagens de sintaxe e nos 21 testes Python. As mensagens de erro de entrada exibidas pelos testes Python fazem parte dos cenários negativos esperados. `git diff --check` passou. A revisão independente do conteúdo, código e testes não encontrou problemas acionáveis.

## Revisão da introdução e do conteúdo

A medição comparativa confirmou a mesma escala tipográfica de Queimadas e Dados. Em 1351×622, próximo à área útil da captura enviada, o H1 mede 37,32 px e o corpo 16 px. Em 1280×500, o H1 diminui para 30 px e o corpo permanece no mínimo de 16 px; em 1920×1080, são 44 px e 20 px. A maior altura da introdução decorre dos dois parágrafos e do bloco de emergência. Conforme a escolha expressa do usuário, fontes, entrelinha e espaçamentos foram mantidos integralmente. A introdução e o rodapé foram comparados antes e depois da remoção e permaneceram idênticos.

A revisão do conteúdo efetivamente publicado contra o handoff e as fontes já verificadas não encontrou inconsistências materiais. Foram preservadas as ressalvas de variação regional, distinção entre emergência e denúncia e segurança/evacuação diante das chamas. Não houve nova recomendação ou alteração dos contatos.

## Limites

Ampliar a fonte raiz não é zoom real do navegador. Uma tentativa separada de verificar o zoom nativo a 200%/400%, pela API de abas em contexto temporário, não conseguiu iniciar o Chromium completo: `browserType.launchPersistentContext: spawn UNKNOWN`. A reprodução mínima sem extensão também falhou com `browserType.launch: spawn UNKNOWN`. O impedimento ocorre antes de abrir a página. A suíte normal usa o Chromium headless shell disponível e não sofre essa falha; o experimento temporário não foi incorporado à suíte. Referências do método: [Chrome Tabs — setZoom](https://developer.chrome.com/docs/extensions/reference/api/tabs#method-setZoom) e [Playwright — extensões](https://playwright.dev/docs/chrome-extensions).

O zoom nativo a 200%/400%, chamadas telefônicas reais, leitores de tela e testes físicos em dispositivos continuam sem verificação concluída. O reflow em 320 px e a ampliação de texto foram verificados separadamente. A automação e a inspeção visual não constituem certificação integral de conformidade WCAG. A suíte disponível usa Chromium; Firefox e Safari não foram testados.
