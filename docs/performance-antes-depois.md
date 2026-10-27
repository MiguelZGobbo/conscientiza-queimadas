# Desempenho antes/depois — 26/10/2026

**Versão medida:** preparação técnica anterior à revisão editorial de 26/10/2026. A revisão posterior alterou somente textos e vínculos em Queimadas/Fontes, somando 1.952 bytes ao HTML publicável. Os resultados de Lighthouse/DevTools abaixo permanecem históricos; não foram reatribuídos à candidata editorial nem repetidos nesta tarefa de conteúdo. Não houve mudança em CSS, JS, imagens, dados ou carregamento do rodapé. A validação atual está em [relatorio-revisao-editorial.md](./relatorio-revisao-editorial.md).

## Método e limites

Ensaio local HTTP em `http://127.0.0.1:4173/`, sem compressão, com `Cache-Control: no-store`. As versões antes/depois usam o mesmo processo servidor e os mesmos perfis; os bytes servidos correspondem à candidata estática validada separadamente em `/` e `/projeto/`. Não houve suíte de testes ou outro ensaio de navegador simultâneo às medições. A medição anterior começou antes da alteração das imagens. O ambiente não é um aparelho físico nem uma bancada com carga de sistema rigidamente controlada.

Playwright 1.63.0, Chromium headless 153.0.8010.12, Node 24.19.0. Foram 60 cargas DevTools por fase: seis páginas × dois perfis × cinco amostras, com contextos novos e cache desativado por CDP. Perfil móvel: 390×844 CSS px, DPR 1, toque, CPU 4×, latência 150 ms, download 200.000 B/s e upload 93.750 B/s. Desktop:1440×900, DPR 1, mouse, CPU 1×, sem limitação artificial de rede. Após networkidle e1,5 s, registrar abertura; depois selecionar Acre em Dados, alcançar o rodapé e aguardar sua imagem. O CLS usa a maior janela de sessão de deslocamentos sem entrada recente, não a simples soma de toda a visita.

Lighthouse 13.5.0 temporário, fora das dependências do projeto: três execuções por perfil em cada uma das quatro páginas principais,24 por fase. Presets originais, simulação Lantern: mobile 412×823,DPR 1,75, RTT 150 ms, throughput1.638,4 kbit/s e CPU 4×; desktop 1350×940,DPR 1, RTT 40 ms, throughput10.240 kbit/s e CPU 1×. Os parâmetros efetivos completos estão no JSON de evidências. O Chrome completo instalado falhou ao iniciar com `spawn UNKNOWN`; o Chromium headless usado pelo Playwright funcionou. Nenhum resultado foi atribuído à tentativa falha.

Não se misturam as métricas dos dois métodos. CDP registra bytes codificados incluindo overhead reportado pelo navegador; Resource Timing usa outra contabilização. Bytes em disco não são transferência. Não houve URL pública para PageSpeed Insights, CrUX ou INP de campo. Durações de eventos na seleção do Acre são apenas observações de laboratório. As referências LCP≤2,5 s, INP≤200 ms e CLS≤0,1 no percentil 75 requerem dados reais de visitas; estes ensaios não comprovam esse percentil ([Google](https://support.google.com/webmasters/answer/9205520)).

## DevTools — medianas e dispersão de LCP

| Perfil | Página | LCP antes ms [mín–máx] | LCP depois ms [mín–máx] | CLS máximo antes/depois |
| --- | --- | --- | --- | --- |
| mobile | index.html | 712,0 [712,0–732,0] | 684,0 [660,0–700,0] | 0 / 0 |
| mobile | queimadas.html | 748,0 [736,0–776,0] | 704,0 [692,0–720,0] | 0 / 0 |
| mobile | dados.html | 1004,0 [992,0–1076,0] | 1008,0 [1000,0–1024,0] | 0 / 0 |
| mobile | prevencao.html | 808,0 [768,0–832,0] | 720,0 [712,0–736,0] | 0 / 0 |
| mobile | sobre.html | 720,0 [708,0–732,0] | 628,0 [616,0–656,0] | 0 / 0 |
| mobile | fontes.html | 760,0 [744,0–784,0] | 688,0 [676,0–708,0] | 0 / 0 |
| desktop | index.html | 76,0 [76,0–76,0] | 80,0 [80,0–84,0] | 0 / 0 |
| desktop | queimadas.html | 56,0 [56,0–56,0] | 56,0 [56,0–60,0] | 0 / 0 |
| desktop | dados.html | 68,0 [68,0–72,0] | 68,0 [68,0–68,0] | 0 / 0 |
| desktop | prevencao.html | 56,0 [56,0–56,0] | 56,0 [56,0–60,0] | 0 / 0 |
| desktop | sobre.html | 40,0 [40,0–44,0] | 40,0 [40,0–44,0] | 0 / 0 |
| desktop | fontes.html | 56,0 [52,0–64,0] | 56,0 [56,0–56,0] | 0 / 0 |

## Lighthouse — medianas de três execuções

P/A/BP/SEO = desempenho/acessibilidade/boas práticas/SEO. Notas automatizadas não equivalem a certificação.

| Perfil | Página | P/A/BP/SEO antes → depois | LCP ms antes → depois | TBT ms antes → depois | CLS depois |
| --- | --- | --- | --- | --- | --- |
| mobile | index.html | 100/100/100/100 → 100/100/100/100 | 1125,2 → 1153,1 | 0 → 0 | 0 |
| mobile | queimadas.html | 100/100/100/100 → 100/100/100/100 | 1276,4 → 1200,4 | 0 → 0 | 0 |
| mobile | dados.html | 96/100/100/100 → 96/100/100/100 | 2325,9 → 2251,2 | 0 → 0 | 0 |
| mobile | prevencao.html | 100/100/100/100 → 100/100/100/100 | 1350,1 → 1351,0 | 0 → 0 | 0 |
| desktop | index.html | 100/100/100/100 → 100/100/100/100 | 281,2 → 295,4 | 0 → 0 | 0 |
| desktop | queimadas.html | 100/100/100/100 → 100/100/100/100 | 298,0 → 280,5 | 0 → 0 | 0 |
| desktop | dados.html | 100/100/100/100 → 100/100/100/100 | 542,3 → 523,3 | 0 → 0 | 0 |
| desktop | prevencao.html | 100/100/100/100 → 100/100/100/100 | 301,2 → 297,1 | 0 → 0 | 0 |

## Elemento LCP observado

| Perfil Lighthouse | Página | Seletor antes |
| --- | --- | --- |
| mobile | index.html | `main#conteudo > section.hero > div.hero__content > h1#hero-title` |
| mobile | queimadas.html | `section.reading-intro > div.container > div.page-intro__text > p` |
| mobile | dados.html | `section.data-intro > div.container > div.page-intro__text > p` |
| mobile | prevencao.html | `section.reading-intro > div.container > div.page-intro__text > p` |
| desktop | index.html | `g.smoke > g.smoke-layers > g.smoke-layer > image.smoke-texture` |
| desktop | queimadas.html | `section#conceitos > div.reading-section__layout > div.reading-section__body > p` |
| desktop | dados.html | `main#conteudo > section#panorama > div.container > p` |
| desktop | prevencao.html | `section.reading-intro > div.container > div.page-intro__text > p` |

Nas páginas secundárias, o observador DevTools registrou elemento `p` nos dois perfis; não registrou um seletor exclusivo na linha de base. As capturas iniciais identificam o contexto visível. Não se apresenta uma identificação mais precisa como se tivesse sido coletada.

## Decisão de otimização e comparação visual

A mudança substitui `fetchpriority="low"` por `loading="lazy"` somente nas seis imagens do rodapé. Dimensões, decodificação assíncrona e variantes permanecem. Nenhum CSS, JS, fonte de dados, SVG ou bitmap foi modificado. O HTML total diminuiu30 bytes; a distribuição continua com 27 arquivos. A imagem do Hero não recebeu lazy.

O benefício direto é retirar requisições/bytes do carregamento inicial quando o rodapé está distante. A heurística de distância do navegador pode antecipar imagens próximas; não se promete economia em todas as páginas/perfis. Após alcançar o rodapé, os bytes da imagem voltam a integrar o total. Não se confunde essa postergação com compressão ou redução do arquivo. As tabelas de rede estão no inventário.

As capturas antes/depois e os testes verificam abertura, menu, mapa, seleção, imagens após rolagem, estados responsivos e movimento reduzido. A duração de eventos de Acre e tarefas longas estão preservadas em `evidencias-pre-publicacao/medicoes-resumo.json`; não são INP. Não houve justificativa para retirar animações, minificar todo o site, trocar bibliotecas ou recompactar imagens para buscar nota perfeita.

## Interpretação dos resultados

A economia inicial móvel foi49.998 bytes por página neste ensaio, incluindo o efeito do documento5 bytes menor e a imagem de rodapé não requisitada. Em Dados,334.917→284.919 bytes representa redução de 14,9% na abertura. Ao alcançar o rodapé, a imagem permanece disponível; não se reduziu sua qualidade.

As medianas Lighthouse de Dados móvel foram2.325,9→2.251,2 ms, mantendo desempenho96. A Home móvel variou1.125,2→1.153,1 ms (+27,9 ms), e a desktop 281,2→295,4 ms (+14,2 ms), mantendo100. DevTools observou melhora móvel na Home e variações pequenas em outros casos, inclusive1.004→1.008 ms em Dados. Essas diferenças de tempo não comprovam causalidade e foram mantidas no relatório; não há justificativa para remover a economia de rede e a imagem intacta para perseguir diferenças pequenas de laboratório. Não houve regressão relevante de pontuação, CLS ou TBT. CLS e TBT Lighthouse foram zero nas amostras coletadas.

## Reproduzir e acessar evidências

```powershell
npm run dev
npm run medir:site -- --phase antes --output .auditoria-local/antes
# Medir a revisão posterior com o mesmo servidor/perfis:
npm run medir:site -- --phase depois --output .auditoria-local/depois
& ./docs/evidencias-pre-publicacao/medir-lighthouse.ps1 -Phase depois
```

A primeira medição deve ser feita sobre a revisão/checkpoint anterior; executar o comando hoje sobre a candidata não recria o estado antigo. O roteiro Lighthouse usa a instalação headless registrada neste ambiente; em outra máquina, adaptar somente CHROME_PATH e registrar a versão usada. Os resultados completos JSON/HTML ficam em `.auditoria-local/antes/lighthouse/` e `.auditoria-local/depois/lighthouse/`; as capturas ficam nas subpastas `capturas/`. Amostras, configurações e resultados selecionados persistem em `docs/evidencias-pre-publicacao/medicoes-resumo.json` e `lighthouse-resumo.json`. Variações entre amostras devem ser consideradas antes de atribuir diferenças pequenas à mudança.

## Datas das coletas (America/Sao_Paulo)

- antes: DevTools iniciado em 26/10/2026 20:08:24 -03:00; Lighthouse iniciado entre 26/10/2026 20:13:20 -03:00 e 26/10/2026 20:18:24 -03:00.
- depois: DevTools iniciado em 26/10/2026 20:38:21 -03:00; Lighthouse iniciado entre 26/10/2026 20:42:19 -03:00 e 26/10/2026 20:47:28 -03:00.
