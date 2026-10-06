# Hero da Home

Escopo: somente navbar, ilustração decorativa, H1, descrição e CTA da solicitação de 06/10/2026. Nenhuma seção posterior ou página adicional.

O repositório iniciou vazio. HTML semântico, CSS mobile-first e JavaScript nativo evitam framework e dependências de produção. Marca: Conscientiza Queimadas, também usada no título da aba. Fontes do sistema. SVG autoral com formas abstratas de vegetação, terreno em camadas, galhos carbonizados e focos âmbar, sem identificação botânica.

Desktop: arte integrada a todo o fundo, conteúdo à esquerda com proteção escura. Mobile: cena própria na região inferior, preservando espaço para leitura. Altura mínima aproximada da viewport, crescimento natural e rolagem comum em telas baixas. Navbar no fluxo, sem elementos fixos encobrindo foco. Menu é disclosure com popover nativo, sem focus trap; o painel aberto se sobrepõe temporariamente ao Hero, Esc devolve foco ao botão, saída de foco e clique fora fecham. Não há deslocamento do conteúdo ao abrir o menu.

A abertura nativa funciona mesmo se JavaScript falhar ou estiver desativado; o estado expandido implícito é exposto pelo navegador na árvore acessível. Com JavaScript, o atributo `aria-expanded` e o rótulo abrir/fechar também são sincronizados. A implementação segue o [HTML Living Standard](https://html.spec.whatwg.org/multipage/popover.html). Em navegadores sem suporte à pseudo-classe nativa, CSS expõe os links no fluxo.

Animações CSS limitadas a transform/opacity de fumaça, chamas e três brasas, exclusivamente em desktop com ponteiro preciso, hover e movimento permitido. Touch, telas estreitas e reduced motion mantêm toda a paisagem estática e ocultam brasas. Destinos futuros são atributos href no HTML: links reais, nenhuma simulação de outras páginas; 404 esperado enquanto as páginas ainda não existirem.

## Atualização aprovada: marca, botão e fogo interativo

- Marca em uma linha nas larguras verificadas de 320 a 1920 px. Com texto ampliado, permite quebra natural para preservar legibilidade e evitar overflow.
- CTA sem seta, com tipografia de 1rem, peso 700, largura determinada pelo conteúdo, preenchimento âmbar e foco visível. H1, descrição e destino preservados.
- Duas formas originais de labareda, distribuídas em oito focos desktop e quatro mobile, com alturas variadas. Fumaça mais ampla e densa, mantendo a região textual escura. O enquadramento mobile recebe um desvanecimento superior para evitar uma borda abrupta da arte.
- Brilho radial discreto acompanha o cursor na área direita da arte. Apenas a chama próxima responde: inclinação limitada a 4°, crescimento vertical até 8% e aumento suave de opacidade. Fumaça desloca até 6 px na horizontal e 4 px na vertical, no espaço do SVG. Vegetação e câmera estáticas.
- Geometria medida na entrada e invalidada ao rolar/redimensionar; eventos agrupados por `requestAnimationFrame`, sem loop permanente. Transformações de interação ficam em grupos separados das animações CSS.
- Saída do mouse, perda de foco da janela, página oculta e mudanças de preferência removem o efeito. Nenhuma informação ou ação depende dele.

Os testes novos de título/interação foram executados e falharam antes da implementação, depois passaram. A revisão final e as screenshots detectaram o posicionamento incorreto do popover com `inset: 100%` na camada superior do navegador. Um teste de links dentro da viewport reproduziu a falha; a correção usa a altura reservada da navbar e limita o painel à altura disponível, com rolagem interna quando necessária. Suíte final: 18 testes aprovados; sintaxe validada. Nenhuma dependência ou seção nova.

## Implementação e verificação

- [x] Criar testes de comportamento, texto, foco, menu, breakpoints e reduced motion e observar falha antes da UI.
- [x] Implementar HTML, SVG e estilos com contraste conservador e controles de pelo menos 44 px.
- [x] Implementar somente o estado de menu; documentar destinos e autoria/licenças.
- [x] Rodar testes e checagem de sintaxe; inspecionar screenshots desktop/tablet/mobile/menu aberto.
- [x] Verificar 320 px, landscape baixo, zoom/texto ampliado, sem JavaScript, contraste, animações, recursos e layout shift.

Inventário de QA: marca/Home, skip link, botão abrir/fechar, quatro links do menu, CTA; menu fechado/aberto/Esc/Tab/clique fora/resize; sem JS; preferência de movimento; 320, 390, 768, 1024, 1440, 1920 e landscape 844×390. Evidência visual e medidas do DOM se complementam. Arte não deve cobrir leitura, cores do fogo devem ocupar apenas pequena parte da cena, vegetação permanece estática.

## Refinamento aprovado: CTA âmbar e fumaça híbrida

CTA com raio de 10 px, fonte fluida de 1,0625–1,125rem, peso 650, altura mínima de 58 px e espaçamento equilibrado. Texto, destino e paleta preservados, sem seta ou ícone. Foco segue com contorno claro e offset de 6 px; sombras discretas apenas reforçam a borda.

A fumaça desktop usa duas plumas em `src/smoke.svg`, com ruído fixo de duas oitavas, deformação, máscara de densidade e suavidade. O filtro ocupa somente a região das plumas, dentro de um SVG de 600×740 unidades. A textura é usada como `image` dentro da paisagem: o navegador pode reutilizar sua renderização durante os deslocamentos, evitando reaplicar um filtro inline a cada frame.

A tentativa inicial com filtro no grupo animado elevou o intervalo mediano de frames de 16,7 para 33,3 ms no ensaio local. A versão com SVG separado retornou a 16,7 ms, inclusive no ensaio com densidade de pixels 2×. Esta escolha mantém o filtro SVG solicitado e reduz seu custo durante a interação. Nenhuma imagem raster ou recurso externo foi incorporado.

O script solicita a textura apenas quando o mesmo media query das animações permite desktop/mouse/movimento. Só troca a fumaça simples após o evento `load`; em falha ou ausência de JavaScript, a versão inline permanece visível. Em touch, mobile ou reduced motion, o CSS mantém essa versão simples e estática. Os novos testes de troca e falha foram observados falhando antes da implementação; suíte final de 20 testes aprovada. O teste de mudança de preferência aguarda o evento assíncrono do media query para verificar a limpeza do estado.

## Ícone da aba e movimento contínuo

O favicon local reutiliza os traços autorais da marca, centralizados num quadrado verde escuro de 40 unidades. O traço de 2,2 unidades mantém leitura em 16 e 32 px. O HTML registra `src/favicon.svg`; nenhum recurso externo é incluído.

A fumaça texturizada tem duas camadas que compartilham `src/smoke.svg`, sem duplicar a transferência. Cada grupo sobe 80 unidades e cresce até 8%, em ciclos lineares de 18 e 22 segundos; o primeiro começa com fase de 9 segundos. A opacidade vai a zero em ambas as extremidades para ocultar o retorno à posição inicial. Uma animação independente na imagem ondula lateralmente com suavidade. Sua amplitude de 11,1 unidades, multiplicada pela expansão, permanece abaixo das 12 unidades previstas na composição. O grupo externo preserva a resposta curta ao mouse, sem movimentar vegetação ou câmera.

As duas imagens precisam emitir `load` antes da troca da versão simples. Filtro e textura permanecem estáticos; somente transformações e opacidade animam. Os mesmos media queries do script e do CSS restringem o efeito ao desktop com mouse e movimento permitido, incluindo mudanças de preferência durante a navegação.

A revisão identificou que a expansão ampliava também a ondulação. Um teste reproduziu o excesso antes da correção da amplitude. A suíte atual tem 21 testes, incluindo favicon, dois ciclos, subida, transparência no reinício e limite lateral.
