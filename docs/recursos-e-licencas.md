# Recursos, autoria e licenças

Registro em 06/10/2026. A Home não carrega imagens, fontes, scripts, CSS ou bibliotecas de serviços externos.

| Recurso | Fonte / autoria | Licença / atribuição |
| --- | --- | --- |
| Paisagem SVG, árvores abstratas, vegetação, terreno, fogo e fumaça | Criados nesta implementação em `index.html`, diretamente no código do projeto | Sem recurso de terceiro incorporado. Não é necessária atribuição a terceiros. Este registro não define a licença geral do projeto. |
| Textura de fumaça: duas plumas e filtro SVG de ruído, deformação e suavidade | Criados diretamente em `src/smoke.svg`, com primitivas nativas do SVG, sem imagem de referência incorporada | Recurso local autoral, sem asset ou biblioteca de terceiro; nenhuma atribuição externa. |
| Marca vetorial e linhas do botão de menu | Desenhos originais em `index.html`; o rodapé reutiliza a mesma logo do cabeçalho | Sem recurso de terceiro incorporado; nenhuma atribuição externa. |
| Marcador de localização do rodapé | SVG autoral em `index.html`, desenhado diretamente com contorno e círculo | Sem recurso ou banco de ícones de terceiro; nenhuma atribuição externa. |
| Favicon SVG | Traços da marca autoral adaptados em `src/favicon.svg`, com fundo verde escuro, margens e espessura para tamanhos pequenos | Recurso local criado no projeto; nenhuma atribuição externa. A imagem enviada orienta a aparência, sem ser incorporada como asset. |
| Animações e interação decorativa | Keyframes originais em `src/styles.css` e JavaScript nativo em `src/hero-interaction.js` | Sem animação pronta ou biblioteca visual externa; nenhuma atribuição externa. |
| Tipografia | `system-ui, sans-serif`, fornecida pelo sistema do visitante | Nenhum arquivo de fonte é incluído, baixado ou redistribuído pelo projeto. Autoria/licença da fonte efetiva dependem do sistema do visitante; não há atribuição adicional no site. |
| `@playwright/test`, `playwright` e `playwright-core` 1.63.0 | Microsoft Corporation; pacotes npm oficiais; [repositório oficial](https://github.com/microsoft/playwright), [site oficial](https://playwright.dev/) | Apache-2.0, confirmada nos metadados e nos arquivos LICENSE dos pacotes instalados; [licença oficial](https://github.com/microsoft/playwright/blob/main/LICENSE). Uso apenas nos testes. Sem crédito visual obrigatório na Home; em redistribuição, preservar licença e avisos aplicáveis conforme a licença. |

Os binários de navegador instalados pelo Playwright ficam no ambiente de testes, fora do conteúdo publicado. Seus avisos e licenças próprios acompanham a instalação; não são assets da Home.

Não são utilizados vídeos, CDN, fontes web ou SVGs de bancos de ícones. Nenhum logotipo oficial da UNINTER é incorporado. As paisagens são representações artísticas de vegetação e não afirmam espécies ou um local documentado. O fundo raster do rodapé foi solicitado pelo usuário para substituir a ilustração vetorial anterior; sua origem e preparação estão registradas abaixo.

## Fundo raster do rodapé

Atualizado em 07/10/2026. A instrução do usuário foi utilizar o fundo do exemplo 3 que ele anexou. O ImageGen preparou uma versão limpa a partir dessa referência, removendo textos, folha, ícones e divisórias do mockup. O arquivo resultante foi codificado em WebP, sem alteração da composição, com a ferramenta Sharp disponível no ambiente do Codex; nenhuma dependência foi adicionada ao projeto. O PNG de edição permanece no diretório de imagens geradas do Codex. O arquivo publicado é local, tem 2172 × 724 px e 21.556 bytes.

| Recurso | Fonte | Autor/Órgão | Licença | Link | Forma de atribuição |
| --- | --- | --- | --- | --- | --- |
| Fundo de entardecer do rodapé, preparado a partir do exemplo 3 | Anexo do usuário `codex-clipboard-5969be05-e1e8-4827-b24a-009089c15854.png`; edição assistida pelo ImageGen | Autoria do anexo não informada; preparação para o projeto via ImageGen | Licença original do anexo não informada; utilização dessa referência solicitada explicitamente pelo usuário nesta conversa. Não é atribuída uma licença nova ao material de origem | [Arquivo usado no site](../src/footer-background.webp) | Registro da origem e da preparação neste documento; nenhum texto de atribuição obrigatório foi informado para o anexo |

## Referências editoriais — Impactos das queimadas

Consultadas em 06/10/2026. A redação da seção foi fornecida no briefing e preservada integralmente. Os materiais abaixo fundamentam as afirmações; não foram incorporados textos literais, imagens ou arquivos dessas fontes. As licenças indicadas pertencem aos materiais consultados e não definem a licença do texto próprio ou do projeto.

| Recurso | Fonte | Autor/Órgão | Licença | Link | Forma de atribuição |
| --- | --- | --- | --- | --- | --- |
| Efeitos da fumaça na saúde, grupos vulneráveis e efeitos além da área atingida | Queimadas — Saúde de A a Z | Ministério da Saúde | O rodapé da página informa CC BY-ND 3.0; apenas consulta factual, sem reprodução ou adaptação de seu texto | [Página oficial](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/q/queimadas) | Referência neste registro; redação própria do briefing na Home |
| Danos ao solo, à microfauna e às florestas | Incêndios florestais e a situação do Espírito Santo | Instituto de Defesa Agropecuária e Florestal do Espírito Santo — Idaf-ES | Não foi identificada licença explícita na página consultada; nenhum recurso reproduzido | [Página oficial](https://idaf.es.gov.br/incendios-florestais-e-a-situacao-do-espirito-santo) | Referência neste registro; redação própria do briefing na Home |
| Perdas em propriedades, lavouras, pastagens e infraestrutura; recuperação ambiental | Desastres em propriedades rurais: ações para prevenir, mitigar e responder às situações de risco, 2022, seção 2.3 | Adriano Gomes Pascoa; Ministério da Agricultura, Pecuária e Abastecimento — MAPA, atual Ministério da Agricultura e Pecuária | Expediente: direitos reservados, reprodução permitida com citação da fonte; apenas consulta factual nesta implementação | [Publicação oficial](https://repositorio-dspace.agricultura.gov.br/bitstream/1/394/1/Desastres_em_propriedades_ruraiscomISBN2.pdf) | Título, autoria, órgão e link neste registro; redação própria do briefing na Home |
| Recorte de terreno, composição editorial e divisórias | HTML/CSS do projeto; contorno original criado com polígono CSS | Implementação local | Sem recurso de terceiro incorporado; a licença geral do projeto não é definida por este registro | `index.html` e `src/styles.css` | Nenhuma atribuição externa necessária |
