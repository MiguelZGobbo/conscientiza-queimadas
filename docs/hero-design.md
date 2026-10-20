# Hero da Home

## Ajuste de tamanho das chamas — 20/10/2026

A pedido do usuário, as 19 instâncias de chama foram reduzidas aproximadamente 20% na largura e na altura, mantendo o centro horizontal e a base de cada uma. A maior altura nominal atual é de 246 unidades no desktop e 135 no mobile. Profundidade, demais elementos da cena e animações permanecem preservados.

## Frente de incêndio em quatro planos — 20/10/2026

Refinamento exclusivo da ilustração SVG do Início, conforme plano aprovado. A cena organiza mata distante de menor contraste, vegetação intermediária parcialmente encoberta pela fumaça, frente principal de incêndio e silhuetas próximas. Canopias, troncos carbonizados e galhos se sobrepõem ao fogo; a coluna de leitura mantém o gradiente original, ampliado somente em janelas baixas. Um sombreamento fixo no topo da arte protege o fundo da navbar mesmo quando o SVG é recortado verticalmente. O rodapé, a navbar, os textos, os impactos e as páginas internas foram preservados, com conferência por hash das áreas protegidas.

As três silhuetas existentes foram redesenhadas com pontas alongadas, bifurcações assimétricas, núcleos irregulares e bases alaranjadas. Os símbolos aceitam proporções diferentes em cada instância. Há três focos distantes e oito principais no desktop; duas chamas distantes e seis principais no mobile. A maior altura nominal passou de 184 para 308 unidades no desktop e de 99 para 169 no mobile. As bases variam em profundidade, em vez de formar uma fileira. Uma máscara SVG estática suaviza somente os últimos 5% da base, integrando-a ao terreno, sem filtro animado. Duas elipses de luz aquecem o chão e reflexos estreitos acompanham os troncos.

As chamas alternam ciclos de 2,3, 3,1 e 4,2 segundos, com alongamento até 12%, inclinação até 2 graus e estados iguais no retorno. A luz varia suavemente em 7,1 segundos; a fumaça conserva os ciclos de 18/22 segundos, agora com plumas em posições distintas. Seis brasas permanecem restritas ao desktop com mouse e movimento permitido. Somente transformações e opacidade animam; câmera e vegetação permanecem imóveis.

O script ativa a classe is-motion-ready somente após registrar a interação. Sem JavaScript ou com falha do script, nenhuma animação da cena é iniciada. Mobile, touch e movimento reduzido também permanecem estáticos; falha de smoke.svg conserva a fumaça inline. A reação ao cursor mantém os limites existentes e acompanha automaticamente as novas posições das chamas; sua opacidade-base foi alinhada ao novo valor de 0,92. Não há raster, dependências ou serviços externos novos. O orçamento original de código continua preservado.

## Registro anterior — retorno ao SVG com refinamento fiel — 20/10/2026

A pedido do usuário, a pintura foi retirada da página e a cena vetorial original recuperada seletivamente do Git, mantendo navbar, textos, links, impactos e transições aprovadas. Árvores, enquadramentos desktop/mobile e distribuição do fogo permanecem. Os dez WebPs da pintura foram removidos; os PNGs históricos continuam arquivados, sem referências de produção.

O refinamento acrescenta uma terceira silhueta assimétrica de chama, pequenas reflexões nos troncos e luz discreta no terreno. As chamas têm ritmos de 4,7, 5,4 e 6,3 segundos, com início/fim iguais; a iluminação varia suavemente em 7,1 segundos. A fumaça SVG mantém duas plumas com ciclos de 18/22 segundos e recebe deformação de 28 unidades e suavização de 2,6 para preservar mais estrutura. A textura é renderizada separadamente, sem filtros animados no documento principal.

Somente transformações e opacidade animam, em desktop com mouse e movimento permitido. O script de interação original foi restaurado integralmente. Celular, touch, movimento reduzido e ausência de JavaScript mantêm a paisagem completa estática. Falhas da textura preservam a fumaça inline. Definições SVG e grupos estáticos foram compactados, sem alteração geométrica, para respeitar o orçamento existente de código.

## Histórico — desenho vetorial original

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
