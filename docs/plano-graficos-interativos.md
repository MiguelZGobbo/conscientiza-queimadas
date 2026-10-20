# Gráficos interativos — plano aprovado em 19/10/2026

Preservar bases, períodos, formatos e todos os valores visíveis. Corrigir nomes e escala, aproximar rótulos sem colidir com linhas e acrescentar destaque por mouse, toque e teclado, sem painéis repetidos. Meses sem ano no acumulado comparativo; competências com ano na distribuição estadual que cruza 2025/2026. Curvas identificadas diretamente no final. Metodologia permanece fora desta etapa.

## Execução

- Estrutura e nomenclaturas: completas.
- Rótulos e geometria: completos.
- Interações progressivas: completas.
- Verificação e documentação: completas; 151 testes Playwright e 21 testes Python aprovados, gerador reproduzível e inspeção responsiva registrada.

## Decisões

- Reutilizar o checkout `feat/pagina-dados` e preservar alterações anteriores; nenhuma publicação ou commit.
- Uma entrada de teclado por figura; os itens continuam sendo uma única lista textual. Anúncios apenas para operação explícita pelo teclado, sem anunciar movimentos do mouse.
- Limitar a busca dos rótulos a posições próximas. Quando não houver solução legível, usar as barras horizontais existentes, sem esconder resultados.

- Rótulos também podem ficar abaixo dos pontos próximos de zero. Reservado espaço antes dos meses/anos para não cruzarem as categorias do eixo.
- A revisão independente reproduziu Enter capturado nos links das fontes. Corrigido limitando os atalhos ao foco na figura e respeitando modificadores; teste de navegação falhou antes e passou após a correção.
- Regiões de status de consulta estadual e exploração dos gráficos têm nomes distintos. O gráfico mantém sua lista semântica e uma única entrada de teclado; nenhuma cópia integral oculta dos resultados.
- Bases preservadas e gerador idempotente. Relatório final em `verificacao-dados.md`.
- Nomes finais coincidentes usam a apresentação em barras; contornos de interação não ampliam visualmente barras zeradas.

## Refinamento aprovado — destaques discretos

- Removidas caixas dos números e bordas externas das barras. Categoria sublinhada, marcador com um único realce de 1 px na cor da série e guia suave apenas em linhas; foco por teclado preservado.
- A busca geométrica reserva até 2 px adicionais por marcador. Hover e seleção não alteram posição, tamanho, peso ou cor dos resultados.
- A área de proximidade usa os dois eixos do traçado; rótulos deslocados têm prioridade sobre a faixa da categoria vizinha. Áreas vazias limpam o hover não fixado, e títulos, fontes e nomes das curvas não ativam resultados. Corrigida a camada que interceptava o nome final da curva.
- Os cinco cenários de regressão novos cobrem decoração discreta, áreas vazias, seleção fixada, cada valor visível e a matriz responsiva; relatório em `verificacao-dados.md`.
- Verificação concluída: 156 testes Playwright, `npm run check` com 21 testes Python, reprodução idêntica do gerador e capturas dos exemplos, celular, janela baixa e texto a 200%.

## Refinamento aprovado — hover prioritário

- O resultado exibido e a seleção persistente são independentes: hover prevalece, e sair dos dados restaura o item clicado. Clique substitui ou remove a seleção; remover com o mouse mantém o hover até o cursor sair. Toque não gera hover persistente.
- Setas/Home/End percorrem sem fixar automaticamente; Enter/Espaço confirma ou remove. O teclado controla o resultado até novo movimento do mouse; Escape limpa os dois estados. Resets de UF, geometria e formato preservados.
- Nos biomas, substituído o sublinhado por `brightness(.9)` somente na barra ativa, sem contornos ou alteração geométrica. Demais gráficos preservados.
- Três novas regressões verificam a prioridade nos seis gráficos, a aparência dos biomas e a alternância teclado/mouse. Os testes existentes agora cobrem toque e teclado nas seis figuras, hover após clique na matriz responsiva e limpeza de seleções persistentes ao trocar UF/formato.
- Uma quarta regressão cobre a colisão observada nas marcações da escala a 200%. Abaixo de 56 rem, as barras horizontais conservam zero e limite, sem marcações intermediárias; valores e geometrias preservados.
- Concluído: 160 testes Playwright, `npm run check` com 21 testes Python, axe, gerador idêntico e inspeção das capturas em desktop, celular e texto a 200%. Bases preservadas; relatório em `verificacao-dados.md`.
