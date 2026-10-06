# Verificação do Hero

Executada em 06/10/2026 no Chromium do Playwright 1.63.0, em ambiente local Windows. Não substitui avaliação com leitores de tela ou dispositivos físicos.

## Evidência funcional

- `npm test`: 21 testes aprovados, incluindo título da aba, favicon SVG local, marca em uma linha, texto exato, CTA sem seta com destino preservado, ausência de outras seções e rodapé, SVG decorativo sem texto, foco visível, menu aberto/fechado e ordem de Tab.
- Viewports: 320×568, 390×844, 768×1024, 1024×768, 1440×900, 1920×1080 e 844×390. Sem overflow horizontal; CTA acessível por foco e rolagem normal em telas baixas.
- Menu: botão real, `aria-expanded`, `aria-controls`, Enter, Esc com retorno de foco, saída com Tab, clique fora e mudanças entre mobile e desktop.
- Texto ampliado a 200% em 320 px: sem overflow horizontal, CTA e links alcançáveis. A página cresce naturalmente.
- JavaScript desabilitado ou requisição do script abortada: menu nativo operável, texto e links disponíveis; árvore acessível real do Chromium confirma o estado expandido implícito, e Esc restaura o foco ao botão.
- `prefers-reduced-motion: reduce`: zero animações ativas, brasas ocultas e menu funcional. Alteração da preferência em tempo de execução também verificada.
- Mouse: brilho acompanha a posição, chama próxima muda transform/opacidade, fumaça desloca pouco e saída restaura o estado. Vegetação permanece estática. Mudança para reduced motion limpa a interação e bloqueia novas respostas.
- Touch em 1440×900: zero animações ativas e nenhuma resposta ao mouse simulado. Mobile e tablet também usam a paisagem estática.
- Fumaça: textura local somente no desktop com mouse e movimento permitido; não é solicitada na carga inicial em touch, mobile ou reduced motion. Fumaça simples continua visível se a requisição de `smoke.svg` falhar. Alterações de preferência/largura trocam as versões corretamente.
- Ciclos de fumaça: duas camadas, durações de 18 e 22 segundos, subida de 80 unidades, expansão de até 8%, ondulação composta abaixo de 12 unidades e opacidade zero nas extremidades. Amostragem de dois ciclos por camada com a API de animações verifica subida contínua e reinício invisível.
- Observação natural por 45 segundos: dois reinícios registrados por camada, aos 9/27 e 22/44 segundos, com opacidade abaixo de 0,004 nos frames adjacentes ao reinício. Deslocamento lateral máximo medido: 11,988 unidades. Screenshots no início, aos 22 segundos e ao fim preservaram a leitura do Hero, sem retorno visível da fumaça para baixo.
- Regressão do menu: links Início/Sobre dentro da viewport ao abrir, além de visibilidade no DOM; painel pode rolar internamente em telas baixas ou com texto ampliado.
- `npm run check`: sintaxe de JavaScript válida.

## Evidência visual

Screenshots inspecionadas em desktop 1440×900, 1024×768, 1920×1080 e tela baixa 1280×500; tablet 768×1024; mobile 390×844 aberto/fechado, 320×568, landscape 844×390 com menu aberto e texto ampliado a 200%. H1 legível e com quebras naturais, arte protegida na região do texto, CTA com contraste forte. Enquadramento mobile distinto e fogo limitado à região inferior. Não há câmera, parallax, vegetação animada ou efeitos piscantes. Revisão independente do código confirmou os limites e resets da interação; a falha de posicionamento do menu encontrada na revisão foi reproduzida por teste e corrigida.

Contraste calculado pela luminância relativa sRGB nas cores base:

| Par | Razão |
| --- | --- |
| H1 / fundo escuro | 15,68:1 |
| Descrição / fundo escuro | 10,46:1 |
| Destaque âmbar / fundo escuro | 9,25:1 |
| Texto do CTA / preenchimento | 8,52:1 |
| Links do menu / fundo do menu | 9,88:1 |

A arte desktop tem proteção escura gradual na região textual; no mobile ocupa principalmente a região inferior. As razões da tabela são de pares de cores base, e a legibilidade sobre a composição foi inspecionada visualmente. No refinamento do CTA, o contraste das cores permaneceu igual; foram revalidados cantos suaves, tipografia maior, foco, quebra com texto a 200% e botão sem ícone. A fumaça desktop tem bordas difusas e densidade irregular; a versão reduzida continua simples e estática. Revisão independente do refinamento não encontrou problemas relevantes de código ou acessibilidade.

Nesta atualização, o favicon foi inspecionado em 16 e 32 px sobre superfícies claras e escuras. Novas screenshots de 320×568, 768×1024, 1024×768, 1280×500 e 1440×900 confirmaram os enquadramentos e a legibilidade; todas sem overflow horizontal. A alteração para reduced motion removeu todas as animações e exibiu a fumaça simples. A revisão independente identificou apenas a ampliação da ondulação pelo grupo ascendente; o teste reproduziu o excesso e passou após limitar a amplitude interna a 11,1 unidades.

## Desempenho e estabilidade

Tamanho dos arquivos sem compressão: HTML 17.792 bytes, CSS 8.583 bytes, navegação 1.316 bytes, interação 4.440 bytes e favicon 406 bytes; total 32.537 bytes em mobile/touch/reduced motion, incluindo o ícone solicitado pela interface do navegador. Desktop habilitado carrega adicionalmente `smoke.svg`, de 1.653 bytes, totalizando 34.190 bytes. As duas camadas usam a mesma URL; uma única requisição da textura foi observada. Nenhum recurso externo ou fonte baixada. A paisagem inline reutiliza formas por `symbol`/`use`; somente o SVG local de fumaça aplica ruído, deformação e blur, com parâmetros estáticos.

Comparação da atualização de fumaça em Chromium headless local, viewport 1440×900: 120 intervalos de `requestAnimationFrame` durante eventos de mouse simulados em cada versão e densidade. Antes: mediana 16,7 ms e p95 16,8 ms em 1× e 2×. Depois: mediana 16,7 ms em ambas, p95 16,7 ms em 1× e 16,8 ms em 2×. Nenhum intervalo acima de 25 ms nos quatro ensaios. A medição ocorreu antes do pequeno ajuste da amplitude lateral de 12 para 11,1 unidades, que preserva a estrutura das animações. No ensaio do refinamento anterior, o observador de performance registrou layout shift 0 e H1 como elemento de LCP. As medidas descrevem este ambiente; não garantem o mesmo tempo de frame em todos os dispositivos ou navegadores.

Teste com JavaScript de navegação atrasado em 350 ms: layout shift acumulado abaixo de 0,01. A navegação inicialmente recolhida já tem seu espaço vertical reservado pela navbar. Não há animação de entrada do texto, carregamento tardio da arte ou altura rígida para recortar conteúdo. As animações usam apenas `transform` e `opacity`. A interação não mantém loop de frames: agenda uma atualização por frame somente quando há novos eventos de mouse, sem medir layout a cada movimento.

As páginas Dados e impactos, Prevenção e Sobre continuam futuras. Seus destinos estão preparados no HTML, sem implementação adicional nesta tarefa.
