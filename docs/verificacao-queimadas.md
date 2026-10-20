# Página Queimadas — implementação e verificação

Data: 13/10/2026. Escopo: documento educativo separado e integração com a Home, conforme o handoff do usuário. Não foram criadas páginas Dados, Prevenção ou institucionais.

## Atualização de 19/10/2026 — repetições

A revisão autorizada pelo usuário removeu o parágrafo de recapitulação do exemplo da propagação, a conclusão que repetia a permanência dos impactos e as chamadas redundantes de prevenção. O encerramento mantém uma mensagem e o aviso de indisponibilidade. O exemplo, o triângulo, a navegação e o rodapé foram preservados. A referência editorial de teste foi ajustada para essa nova redação; o registro original abaixo descreve a entrega anterior. Ver resultados atuais em [verificacao-dados.md](./verificacao-dados.md).

## Arquivos e responsabilidades

| Arquivo | Alteração |
| --- | --- |
| `queimadas.html` | Introdução compacta com o título aprovado, sumário identificado, três seções completas, encerramento, diagrama autoral, navbar e rodapé existentes |
| `src/queimadas.css` | Composição editorial com os tokens do projeto, sem estilos globais novos para o conteúdo da Home |
| `index.html` | Navbar aprovada, integração com Queimadas e texto Voltar ao topo no rodapé |
| `src/styles.css` | Tratamento dos itens futuros da navbar, sem alterar o CSS do rodapé |
| `scripts/dev-server.mjs` | Libera o documento Queimadas no servidor local, mantendo a lista explícita de arquivos permitidos |
| `tests/queimadas.spec.js` e `tests/fixtures/queimadas-aprovado.md` | Fidelidade editorial e verificação funcional e visual |
| `tests/hero.spec.js` e `tests/footer.spec.js` | Expectativas ajustadas à navegação solicitada e ao novo nome do atalho do rodapé |
| `README.md` e `docs/recursos-e-licencas.md` | Organização, publicação, fontes, autoria e pendências |

## Apresentação e conteúdo

O título e todos os parágrafos, subtítulos, perguntas e itens de lista obrigatórios foram preservados. Apenas a apresentação contextual da introdução é nova, conforme permitido. Não há accordions, carrosséis, animações de revelação ou conteúdo educativo escondido.

A página usa a tipografia de sistema e as cores verde escuro, areia e terracota já presentes. A abertura escura mantém a identidade da Home; o fundo claro e a largura limitada a 68 caracteres aproximados favorecem a leitura longa. Na revisão visual aprovada em 13/10/2026, os títulos passaram a preceder os textos em todas as larguras, sem posição fixa lateral e sem numeração. Introdução, seções e encerramento compartilham a mesma coluna centralizada, com parágrafos alinhados à esquerda. As duas definições aparecem lado a lado somente quando cada coluna comporta pelo menos aproximadamente 28 caracteres; nos demais casos, ficam em sequência.

O acabamento aprovado substitui os links curtos em faixa por um sumário identificado visualmente como **Nesta página**, abaixo da introdução e na mesma coluna de leitura. A lista permanece vertical em todas as larguras e usa os três títulos completos das seções, com os mesmos destinos de âncora, links sublinhados, foco visível e altura mínima de 44 px. Não há divisória atravessando a página. O intervalo superior dos subtítulos internos corresponde a 60% do espaço das seções principais; as divisórias locais da comparação e das seções foram preservadas.

A introdução usa título fluido de 28–44 px (`clamp(1.75rem, min(3vw, 6svh), 2.75rem)`) com entrelinha 1,2, espaços verticais de 24–48 px e distância de 16–24 px até a descrição, nos valores padrão do navegador. O título não tem quebras obrigatórias nem limite de 24 caracteres, permitindo aproveitar a coluna e ocupar duas linhas nas viewports desktop verificadas. A descrição conserva a escala do corpo. Não há altura fixa; com texto ampliado, o bloco cresce naturalmente.

O triângulo do fogo é uma composição vetorial original, estática, com conexões suavemente curvas e símbolos próprios de chama, vegetação e ar. Não há painel retangular escuro. Os símbolos usam formas preenchidas, traços com extremidades arredondadas e as cores existentes. Os SVGs são decorativos para tecnologias assistivas, porque a explicação completa já está no texto e os rótulos HTML Calor, Combustível e Oxigênio continuam acessíveis. Os três rótulos têm fundo transparente. Calor fica acima da chama e as conexões unem os centros dos símbolos; sua altura depende do tamanho dos símbolos e do intervalo entre as linhas, sem ser esticada pela quebra dos rótulos inferiores. Dessa forma, o traçado não atravessa as letras mesmo com texto ampliado. Os símbolos e suas bases circulares foram preservados; a legenda também. O lembrete sobre calor, seca e ignição mantém seu destaque simples de borda e a redação original.

O convite **Saiba como prevenir →** permanece como texto destacado, sem moldura, padding de botão ou interação, junto de **Página Prevenção em desenvolvimento.** A frase aprovada e a intenção de integração futura foram preservadas.

O corpo usa uma unidade fluida compartilhada: `clamp(1rem, min(1.15vw, 2.3svh), 1.25rem)`, correspondente a 16–20 px no tamanho padrão do navegador. Títulos, subtítulos, espaçamentos e diagrama também respondem ao espaço disponível; as medidas relativas mantêm a ampliação de texto. Janelas baixas diminuem principalmente os intervalos e a ilustração, sem reduzir o corpo abaixo de 16 px nem impor altura fixa ao conteúdo. O CSS específico não altera a escala ou o layout da Home.

## Navegação e rodapé

A navbar segue **Início | Queimadas | Dados | Prevenção** nos dois documentos. Início aponta para `./index.html` e Queimadas para `./queimadas.html`; `aria-current="page"` identifica apenas o documento atual. A marca também retorna à Home. O CTA da Home mantém sua finalidade original: `#impactos`.

O menu mobile reutiliza o mesmo botão, popover nativo e `src/navigation.js`, incluindo Tab, Escape, clique fora, retorno de foco e alternativa sem JavaScript. Não foi criada uma segunda implementação do menu.

O rodapé foi copiado integralmente da Home e continua usando `src/styles.css` e `src/footer-background.webp`. Não há novo carregador ou sistema de templates: os dois HTMLs são estáticos e funcionam sem JavaScript. Um teste compara o conteúdo completo dos rodapés, incluindo atributos, para detectar divergência futura. A única alteração obrigatória é substituir Início por **Voltar ao topo**, sem `aria-current` no atalho.

Nas duas páginas, `href="#inicio"` aponta para o cabeçalho do próprio documento. O destino possui `tabindex="-1"`; a navegação nativa permite teclado e transfere o foco sem recarregar. A suavização é CSS nativo e se torna instantânea com `prefers-reduced-motion: reduce`.

## Verificações

- O teste editorial usa uma cópia independente do conteúdo do handoff e compara todos os blocos com o texto renderizado, em ordem.
- Integração Home → Queimadas → Home e indicação da página atual.
- Igualdade integral do HTML dos rodapés e resposta dos destinos internos publicados.
- Publicação em `/projeto/` simulada por interceptação de rede, preservando resolução relativa de documentos e estilos.
- Viewports 320 × 568, 390 × 844, 768 × 1024, 1440 × 900, 844 × 390 e 1280 × 500, com fonte raiz a 100% e 200%: sem rolagem horizontal ou texto cortado.
- Títulos acima dos primeiros parágrafos, coluna centralizada e alinhamento comum entre introdução, seções, atalhos e encerramento, inclusive em 1920 × 1080.
- Comparação de medidas em 1280 × 500, 1440 × 900, 1920 × 1080 e 1920 × 420: corpo entre 16 e 20 px; subtítulos, intervalos e diagrama respondem ao espaço disponível.
- Menu e atalhos por teclado, foco visível e navegação nativa sem JavaScript.
- Sumário identificado e vertical, com ativação por Enter dos três destinos sem JavaScript e com movimento reduzido.
- Introdução entre 28 e 44 px, entrelinha 1,2, espaços e distância da descrição dentro dos limites aprovados; duas linhas e menos de 350 px de altura em 1440 × 900 e 1920 × 1080.
- Rótulos do triângulo transparentes e sem recorte: amostragem de 301 pontos ao longo do caminho SVG, comparados aos retângulos das letras, sem cruzamento nas viewports mobile, tablet, desktop e horizontal, a 100% e 200%.
- Convite à prevenção sem borda, padding ou interação de botão, acompanhado do aviso de disponibilidade.
- Atalhos e Voltar ao topo com movimento reduzido.
- Contraste de todos os textos e links do conteúdo educativo acima de 4,5:1, medido sobre os fundos efetivos.
- Ausência de mensagens de erro de console e exceções nas viewports verificadas.
- Capturas da introdução, seções e encerramento em mobile, tablet e desktop; inspeção visual de amostras.
- Suíte existente da Home, impactos e rodapé, incluindo contraste do rodapé sobre a imagem, movimento e interações do Hero.

Resultado do acabamento: `npm test -- --reporter=line` terminou com **81 testes aprovados**, zero falhas, em 46,2 s no Chromium; são 16 testes específicos da página e 65 da Home, Hero, impactos e rodapé. `npm run check` terminou com código 0 e `git diff --check` sem problemas de whitespace. As capturas da introdução, sumário, triângulo e encerramento foram inspecionadas, incluindo o diagrama com texto a 200%. A revisão independente não apontou achados materiais. Os avisos de `NO_COLOR`/`FORCE_COLOR` são do ambiente de execução; não são erros de console do site.

Limites: automação em Chromium; não foi realizada auditoria formal WCAG, sessão com leitor de tela, teste em aparelho físico ou verificação específica em Firefox/Safari. Texto a 200% foi simulado pela fonte raiz; o reflow de viewport de 320 px foi verificado. A simulação de subdiretório não substitui uma publicação real no GitHub Pages. As capturas ficam em `test-results/`, ignorado pelo Git.

## Fontes, autoria e revisão editorial

As dez URLs fornecidas no handoff foram abertas e retornaram conteúdo durante a consulta de 13/10/2026. Por decisão explícita do usuário na revisão visual, o bloco **Fontes consultadas** foi retirado da interface. Títulos, links, atribuições e ressalvas permanecem registrados em `docs/recursos-e-licencas.md` para a futura página institucional Fontes e créditos. O item do rodapé permanece como aprovado, sem interação ou destino fictício. Nenhum texto, imagem ou gráfico das publicações foi incorporado; o conteúdo obrigatório foi fornecido pelo usuário.

Não foram identificadas imprecisões científicas materiais. Há uma ressalva jurídica para revisão: a frase sobre autorização para queima planejada é ampla; a Lei 14.944/2024 prevê exceções delimitadas, como determinadas queimas para capacitação e treinamento (art. 39) e uso tradicional e adaptativo (art. 33). A redação aprovada foi preservada. A FAQ do INPE é legada e contém discussão histórica de tendências; nenhum número ou tendência antiga foi acrescentado ao site.

Não há recurso externo novo em produção, fonte web, biblioteca de ícones, fotografia ou dependência de runtime. O registro de recursos distingue textos fornecidos, introdução original, diagrama autoral e componentes reutilizados.

**Pendência de direitos autorais preexistente:** o fundo do rodapé foi preparado anteriormente a partir de uma referência enviada pelo usuário. O registro existente não comprova autoria/licença dessa referência. A imagem foi preservada porque o handoff exige exatamente o rodapé aprovado; não foi atribuída uma licença inventada. É necessário comprovar os direitos antes de considerar o inventário inteiro regularizado.

## Integrações futuras

- Dados e Prevenção: substituir os textos “em breve” da navbar por links relativos quando os documentos reais estiverem publicados.
- CTA final: substituir o elemento não interativo por link real à página Prevenção, mantendo a redação.
- Fontes e créditos: integrar o conteúdo institucional futuro quando existir; as dez referências de Queimadas permanecem somente na documentação, conforme decisão do usuário.
- Sobre o projeto e Feedback: preservados como no rodapé existente, sem destinos fictícios.
