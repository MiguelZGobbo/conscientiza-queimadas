# Transição do Hero para os impactos

Atualizada em 06/10/2026 após o ajuste de proporções dos impactos em janelas desktop baixas. Verificações no Chromium do Playwright 1.63.0 em Windows local. Os registros anteriores do Hero em outros documentos descrevem entregas históricas.

## Implementação atual

- Removidos o CTA “Entenda os impactos”, seu comentário e estilos, além de “Continue ↓” e seus estilos. Headline, subtítulo, paleta, desenhos SVG, animações e interação da cena foram preservados.
- A primeira tela contém o Hero completo. A seção de impactos começa após ele, sem rótulo ou título aparecendo parcialmente na abertura.
- O marcador foi removido por completo, incluindo elemento HTML, estilos, animação e reservas exclusivas de espaço. O Hero não tem indicador adicional de rolagem.
- A altura mínima do Hero usa `svh` e fallback `vh`, descontando apenas o cabeçalho. Não tem altura fixa: cresce quando leitura ou zoom exigem. Em orientação horizontal com tela baixa, cabeçalho, tipografia, espaço de cena e respiro se ajustam juntos.
- No mobile, uma medida compartilhada `clamp(12rem, min(90vw, 32svh), 24rem)` dimensiona a cena e seu espaço reservado. O padding inclui 70% dessa altura e um respiro; os 30% superiores correspondem à faixa difusa já existente na cena. Tipografia e espaços também consideram a altura e a largura da viewport, com limites legíveis em `rem`.
- Em telas horizontais, a reserva da paisagem continua válida e permite crescimento do Hero quando o texto é ampliado.
- O recorte permanece um pseudo-elemento CSS estático, vazio, de polígono original e cor do chão `#0B1210`. Fica dentro da seção clara, tem altura fluida de 16 a 40 px mais 1 px de sobreposição para evitar frestas e não recebe eventos. A rolagem continua natural, sem scroll automático, novo gradiente, asset ou dependência.
- Impactos permanece uma região nomeada com `section`, um `h2` e três `h3`. Textos e cores do briefing são mantidos. A numeração é decorativa, com `aria-hidden`; os títulos identificam os três eixos.
- Tipografia de sistema, gutters e breakpoint de 960 px reutilizados. Uma coluna abaixo desse limite; três a partir dele. Seção com altura natural e largura de leitura controlada, sem cards, CTA ou camadas de navegação.
- Títulos, textos e espaços dos impactos usam `clamp()` com largura e altura da viewport. A introdução permanece abaixo do título. A medida tipográfica compartilhada `--impacts-type-unit` cresce e diminui conforme o espaço disponível, entre 14 e 22 px no desktop. Ela controla o corpo e as proporções da introdução, números e títulos dos eixos. O título principal varia entre 28 e 72 px; os títulos dos eixos têm limites de 18 e 28 px. No mobile, o corpo mantém 16 px. Os limites em `rem` preservam ampliação e altura natural.
- Links e comportamento da navbar não foram alterados. As páginas futuras ainda retornam 404 no servidor local; a síntese dos impactos está na própria Home.

## Evidência de verificação

- `npm test`: **39 testes aprovados**, incluindo 25 do Hero/navegação e 14 da seção/transição. Os testes exigem redução em janela baixa e crescimento em monitor grande, além de manter a introdução abaixo do título. O teste novo de monitor grande falhou antes da correção por causa dos limites tipográficos anteriores.
- `npm run check` e `git diff --check`: aprovados.
- Layout automatizado entre 320 e 1920 px, incluindo 320×568, 390×844, 768×1024, 960×768, 1024×768, 1280×500, 1440×900, 1920×1080, 844×390 e 1920×420. Sem overflow horizontal. O conteúdo dos impactos fica abaixo da primeira tela.
- Redimensionamento sem recarregar a página em 1280×500, 1280×600, 1350×626, 1440×720 e 1440×900: a seção inteira cabe na altura disponível, do eyebrow ao fim dos três textos. A viewport de 1350×626 aproxima a área de conteúdo da captura do usuário.
- Redimensionamento contínuo de 1350×626 para 1440×900, 1920×1080 e 2560×1440, seguido de retorno a 1350×626: título, corpo e espaçamentos aumentam; ao retornar, as medidas voltam exatamente aos valores iniciais. Sem recarregar, scroll horizontal ou mudança da introdução para a lateral.
- Teste de redimensionamento mobile em 390 px de largura e alturas 568, 844 e 1024 px: a paisagem cresce conforme a altura disponível e mantém espaço livre para a descrição.
- Medições e screenshots: o Hero termina exatamente no fim da viewport em 320×568, 390×844, 768×1024, 844×390, 1440×900 e 1920×420. O recorte e os textos dos impactos ficam disponíveis pela rolagem normal.
- Texto a 200% em 320×568, 844×390, 1024×500 e 1440×900: sem overflow horizontal. A cena mobile conserva sua reserva abaixo do texto. Quando necessário, o Hero cresce além da viewport. O teste usa ampliação do tamanho da fonte; não foi um ensaio manual de zoom no navegador.
- Impactos com texto a 200% em 320×900, 1350×626 e 1440×900: sem recorte ou overflow horizontal, mantendo a introdução abaixo do título. A ampliação tem prioridade sobre caber em uma única tela.
- Teclado: skip link, foco visível na marca e navegação, menu com Enter/Esc, ordem de Tab e fechamento ao sair do cabeçalho. A consulta do teste ao link final usa seu seletor DOM, pois após fechar o menu o link deixa a árvore acessível.
- Sem JavaScript: conteúdo e recorte disponíveis. Com movimento reduzido, há zero animações ativas. Mudança de preferência durante a navegação permanece coberta pelos testes do Hero.
- Scroll: o deslocamento da seção corresponde à distância rolada pela página, sem elementos fixos ou controle de scroll.
- Screenshots atuais inspecionadas dos impactos em 1280×500, 1350×626, 1440×900, 1920×1080, 2560×1440, mobile 390×844 e texto a 200% em 1350×626. Título, introdução e três eixos permanecem legíveis, sem sobreposição. Em 1350×626, o título mede 30,6 px e o corpo 15,024 px; em 1440×900, 58 px e 17,28 px; em 1920×1080, 72 px e 22 px. A cena e os textos do Hero foram preservados. Nenhuma fotografia ou fonte externa foi adicionada.
- A correção anterior da reserva da paisagem em orientação horizontal com texto ampliado foi mantida e permanece coberta por testes.

Contraste pela luminância relativa sRGB nas cores renderizadas:

| Texto / fundo areia | Razão |
| --- | --- |
| Verde escuro `#1F2B24` / `#F2EBDD` | 12,39:1 |
| Secundário `#5D625B` / `#F2EBDD` | 5,26:1 |
| Terracota `#9B3E24` / `#F2EBDD` | 5,70:1 |

Todos os pares superam 4,5:1. A cor não é o único meio de identificação dos eixos. O recorte não contém informação textual nem exige compreensão visual para acessar o conteúdo.

As verificações se limitam ao Chromium automatizado e à inspeção visual local; não substituem testes com leitores de tela ou dispositivos físicos. Referências editoriais e condições dos materiais consultados: `docs/recursos-e-licencas.md`.
