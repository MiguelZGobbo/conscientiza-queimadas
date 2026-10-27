# Artes do rodapé — 20/10/2026

## Autoria confirmada — 26/10/2026

Miguel Zager Gobbo confirmou que as imagens e referências fornecidas para o projeto foram criadas por ele com auxílio de IA. A confirmação encerra a pendência anterior de origem e autorização da referência do rodapé. O crédito público identifica Miguel Zager Gobbo; este arquivo preserva o histórico técnico da preparação e geração, sem estabelecer uma licença pública para as imagens.

## Arquivo em uso e preparação

O PNG `originais/rodape-painel.png` tem **2014 × 780 px nativos**. Foi produzido pela ferramenta integrada ImageGen, sem CLI/API, a partir do recorte x=0, y=0, largura=1086, altura=420 do PNG `originais/rodape.png` aprovado anteriormente. A geração reconstrói detalhes das árvores e montanhas na área ilustrada; não é uma ampliação de arquivo nem uma alegação de 4K. O resultado foi inspecionado antes da integração.

Identificação da geração: `exec-78cc5925-6f54-485a-8980-4e68a25836b0.png`, preservada também no diretório de imagens geradas do Codex. O original anterior `rodape.png` (2172 × 724) permanece para comparação.

Exportação com Sharp disponível no ambiente, sem dependência nova no projeto: `resize({ width, withoutEnlargement: true }).webp({ quality: 94, effort: 6 })`. Não foram aplicados blur, sharpening ou aumento de resolução na exportação.

| Largura | Arquivo em src/ | Bytes |
| --- | --- | ---: |
| 768 | footer-background-768.webp | 49.750 |
| 960 | footer-background-960.webp | 73.096 |
| 1440 | footer-background-1440.webp | 145.428 |
| 1920 | footer-background-1920.webp | 218.998 |
| 2014 | footer-background.webp | 234.972 |

O painel ocupa até 960 px CSS, com 50vw no desktop e largura da faixa nas telas menores. O `sizes` acompanha essas medidas e usa mínimo de 465 px para o recorte de 180 px de altura, garantindo resolução também com object-fit: cover. O restante do rodapé é verde em CSS. Nenhuma máscara vertical suaviza o primeiro plano; gradientes protegem o texto, o copyright e a junção da borda da imagem com o fundo. Todas as variantes ficam abaixo do orçamento aprovado de 450.000 bytes. O src de fallback de 1440 px continua abaixo dos 200.000 bytes legados.

## Prompt final usado no ImageGen

```text
Edit target: attached approved sunset footer landscape crop. Produce a very high definition faithful refinement of EXACTLY THIS CROP and layout. Wide panorama aspect ratio 2.586:1, preferably 2304x896 or the largest native panorama resolution available. This image will be displayed at only 960 CSS pixels wide on a 2x screen. Reconstruct fine sharply resolved foreground foliage, individual leaf clusters, slender branches and pine silhouettes, with clean naturally irregular contours; increase actual native detail rather than blur or mere enlargement. Keep the sun at x26% y43%, identical size and warm orange brightness, same mountain contours and relative positions, same tall tree at far left and pines along bottom. Preserve the soft aerial perspective only in distant mountain valleys, with crisp foreground. Keep restrained painterly natural illustration style, forest green #0b1812 and amber gold. Preserve dark right edge tapering into UNIFORM forest green #0b1812 at the final 15% of the image for seamless CSS background; dark upper right too. Do not add text, borders, logos, new objects, fire, people, oversharpen halos, photography look, or change composition. The image is ONLY the illustrated LEFT PANEL, NOT a full-width banner: do not add extra blank space to the right. Full-bleed frame matching input.
```

A dimensão solicitada era uma preferência; a dimensão efetivamente entregue e usada é 2014 × 780. Não foi feita ampliação para simular o tamanho solicitado.

## Arquivo histórico do Hero descartado

Os PNGs abaixo foram produzidos anteriormente com ImageGen e preservados para futuras consultas. A pintura foi rejeitada pelo usuário: o site voltou à paisagem SVG original refinada e não carrega estes arquivos. Os dez WebPs de produção da pintura foram removidos.

| Original em originais/ | Dimensões | Conteúdo arquivado |
| --- | --- | --- |
| ambiente.png | 1586 × 992 | Ambiente pintado |
| chamas.png | 1536 × 1024, RGBA | Três grupos de chamas |
| fumaca.png | 1024 × 1536, RGBA | Pluma pintada |
| composicao.png | 1586 × 992 | Composição estática completa |

O Hero atual usa formas inline em `index.html` e a textura vetorial `src/smoke.svg`, sem imagens raster. As condições de origem e uso dos recursos continuam registradas em `docs/recursos-e-licencas.md`.
