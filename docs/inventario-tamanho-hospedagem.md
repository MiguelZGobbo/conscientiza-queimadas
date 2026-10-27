# Inventário de tamanho, recursos e hospedagem

Data: 26/10/2026. Este documento apoia uma decisão posterior; **não escolhe provedor**. Atualizações previstas: eventuais. Não há previsão informada de visitantes; cenários de consumo não devem ser confundidos com tráfego observado.

**Atualização editorial posterior, 26/10/2026:** ficha, categorias e maiores arquivos abaixo correspondem à candidata regenerada após a revisão editorial: +1.952 bytes de HTML em Queimadas/Fontes. As fotografias do checkout e medições de rede mais adiante preservam a coleta técnica anterior; não são medições novas da revisão de conteúdo. Manifesto atual: `evidencias-revisao-editorial/manifesto-publicacao.json`. Decisões de fontes/direitos em [relatorio-revisao-editorial.md](./relatorio-revisao-editorial.md).

## Ficha objetiva

| Item | Valor |
| --- | --- |
| Conteúdo publicável | 27 arquivos / 1.109.071 bytes / 1,058 MiB |
| Diretório | dist/; cópia controlada, sem transformação |
| Arquitetura | 6 HTML independentes; 5 CSS; 9 JS; 2 SVG; 5 WebP |
| Runtime | Sem backend, banco, build, API remota, CDN ou fontes web |
| Mapa | SVG inline; 27 UFs; agregados em módulos JS locais |
| Terceiros | Links de referência e Forms externo, sem embed |
| Atualizações | Eventuais; sem importação automática ao visitar/publicar |
| Maior arquivo publicável | src/footer-background.webp / 234.972 bytes |
| Domínio/provedor | Não definidos; nenhum deploy realizado |

## Bytes em disco por categoria

| Extensão | Arquivos | Bytes |
| --- | --- | --- |
| .css | 5 | 48.861 |
| .html | 6 | 274.836 |
| .js | 9 | 61.069 |
| .svg | 2 | 2.061 |
| .webp | 5 | 722.244 |

## Dez maiores arquivos publicáveis

| Arquivo | Bytes |
| --- | --- |
| src/footer-background.webp | 234.972 |
| src/footer-background-1920.webp | 218.998 |
| dados.html | 183.735 |
| src/footer-background-1440.webp | 145.428 |
| src/footer-background-960.webp | 73.096 |
| src/footer-background-768.webp | 49.750 |
| queimadas.html | 22.658 |
| index.html | 22.179 |
| src/dados.css | 20.635 |
| fontes.html | 20.181 |

Os seis PNGs originais em `src/artwork/originais/` somam10.958.793 bytes e não são carregados pelo visitante. Permanecem preservados no repositório. Documentos, scripts, testes, originais, dependências, histórico e resultados de auditoria não pertencem ao pacote estático. O manifesto técnico anterior está em `evidencias-pre-publicacao/manifesto-publicacao.json`; o atual, em `evidencias-revisao-editorial/manifesto-publicacao.json`.

## Checkout versus publicação

O levantamento inicial mediu8.321 arquivos/227.495.897 bytes no checkout: `.git`14.284.448B, `node_modules`178.093.837B, `test-results`21.500.916B e demais arquivos13.616.696B. A candidata inicial era27 arquivos/1.107.149B. Essas são fotografias datadas, não tamanho de transferência.

A atualização do snapshot final fica em `evidencias-pre-publicacao/inventario-checkout.json` e na seção abaixo. Saídas locais crescem com ensaios/capturas; não influenciam o tamanho publicado. A contagem de arquivos versionados usa `git ls-files` no índice atual, sem adicionar esta entrega ao Git.

Snapshot: `2026-10-26T20:51:56.020720-03:00`. Total observado: **8.601 arquivos / 318.739.118 bytes**. Índice Git: 94 arquivos, 13.518.678 bytes nos arquivos de trabalho correspondentes; arquivos novos ainda não adicionados ao índice são contados no checkout.

| Grupo | Arquivos | Bytes |
| --- | --- | --- |
| projeto-sem-saidas | 148 | 16.882.007 |
| .auditoria-local | 205 | 88.592.031 |
| .git | 204 | 14.284.572 |
| dist | 27 | 1.107.119 |
| node_modules | 7920 | 178.093.837 |
| test-results | 97 | 19.779.552 |

O grupo `projeto-sem-saidas` exclui as pastas grandes de saída explicitadas na tabela; ainda inclui eventuais caches Python e arquivos novos da entrega. O snapshot é uma medição naquele instante, anterior às últimas notas de documentação. O tamanho publicável é o valor exato do manifesto e independe desses artefatos.


## Rede medida — cache frio

Cinco amostras por página/perfil, DPR 1, mesmo servidor local sem compressão. Valores abaixo são medianas CDP da abertura; o total após rolar inclui a chegada ao rodapé e, em Dados, a seleção do Acre. Cabeçalhos e contabilização CDP diferem de Resource Timing. Favicon e escolhas de srcset dependem do navegador/perfil; os números representam os recursos efetivamente requisitados no ensaio headless, não uma quota garantida para todo visitante.

| Perfil | Página | Requisições antes → depois | Bytes iniciais antes → depois | Bytes depois, até rodapé |
| --- | --- | --- | --- | --- |
| mobile | index.html | 5 → 4 | 97.927 → 47.929 | 97.922 |
| mobile | queimadas.html | 6 → 5 | 100.442 → 50.444 | 100.437 |
| mobile | dados.html | 13 → 12 | 334.917 → 284.919 | 334.912 |
| mobile | prevencao.html | 7 → 6 | 99.021 → 49.023 | 99.016 |
| mobile | sobre.html | 6 → 5 | 86.174 → 36.176 | 86.169 |
| mobile | fontes.html | 6 → 5 | 96.687 → 46.689 | 96.682 |
| desktop | index.html | 6 → 6 | 99.827 → 99.822 | 99.822 |
| desktop | queimadas.html | 6 → 5 | 100.442 → 50.444 | 100.437 |
| desktop | dados.html | 13 → 12 | 334.917 → 284.919 | 334.912 |
| desktop | prevencao.html | 7 → 6 | 99.021 → 49.023 | 99.016 |
| desktop | sobre.html | 6 → 6 | 86.174 → 86.169 | 86.169 |
| desktop | fontes.html | 6 → 5 | 96.687 → 46.689 | 96.682 |

Não há vídeo, arquivo de fonte ou JSON/CSV de runtime a baixar. As bases ambientais são JS locais; arquivos brutos INPE/IBGE/MapBiomas são usados somente para reproduzir dados no desenvolvimento e não entram na distribuição. O mapa não exige cota de API, chave ou serviço geográfico externo. Os cinco WebPs cobrem DPR/tamanhos distintos; não se somam todos como se fossem baixados em cada visita.

## Compatibilidade com planos gratuitos — sem vencedor

Documentação oficial consultada em 26/10/2026. Limites podem mudar; conferir novamente ao escolher conta/provedor.

| Provedor | Limites e custo de uso relevantes | Compatibilidade e pendências |
| --- | --- | --- |
| Cloudflare Pages Free | 20.000 arquivos;25 MiB/arquivo; 500 builds/mês,1 simultâneo; pedidos estáticos gratuitos/ilimitados segundo a documentação | Pacote abaixo dos limites. Pode configurar pasta de saída, headers e redirects. Sem 404.html pode aplicar fallback de SPA: resolver antes do deploy. Não precisa de Functions. |
| GitHub Pages |Site até 1 GB;100 GB/mês e10 builds/h como limites soft; build/deploy até 10min; possibilidade de 429 | Links relativos compatíveis com /repositório/. Free depende de repositório público; publicação direta por branch aceita raiz ou /docs, não selecionar a raiz atual. Para dist, definir fluxo de artefato posteriormente. Não há headers HTTP customizados documentados por projeto no GitHub.com. |
| Netlify Free atual | 300 créditos/mês compartilhados;15/deploy de produção;20/GB;2/10.000 pedidos; projetos pausam quando esgotam os créditos | Pacote estático compatível, pasta de publicação e headers configuráveis. Atualizações eventuais consomem menos deploys que atualizações frequentes, mas tráfego compete pelos mesmos créditos. Confirmar se a conta usa créditos atuais ou plano legado. |
| Vercel Hobby |100 GB de transferência e1 milhão de pedidos CDN/ciclo;6.000 minutos de build/mês;100 deploys/dia; CLI até 100 MB/15.000 arquivos-fonte | Pacote abaixo dos limites indicados. HTML estático sem compilação; pasta de saída, redirects e headers configuráveis. Hobby é para uso pessoal/não comercial; confirmar enquadramento e propriedade da conta/repositório. |

Fontes: [Cloudflare limites](https://developers.cloudflare.com/pages/platform/limits/), [pedidos estáticos](https://developers.cloudflare.com/pages/functions/routing/), [Cloudflare404](https://developers.cloudflare.com/pages/configuration/serving-pages/); [GitHub limites](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits), [origem de publicação](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site); [Netlify créditos](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/), [planos](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/); [Vercel limites](https://vercel.com/docs/limits), [CDN](https://vercel.com/docs/manage-cdn-usage), [Hobby](https://vercel.com/docs/plans/hobby).

O GitHub Pages proíbe hospedagem direcionada principalmente a transações comerciais/e-commerce/SaaS comercial; o projeto é descrito como educativo. Esses limites de uso não equivalem a aprovação individual da conta. Em todos os provedores, HTTPS, cache, compressão, redirecionamentos,404real, cabeçalhos e URL definitiva ainda precisam de validação pública. Não foi criada configuração específica de nenhum deles.

## Dados necessários para a decisão posterior

Combinar esta ficha com previsão de visitas, número de páginas por visita, proporção celular/desktop/DPR e atualizações. A transferência local não comprimida é evidência do perfil de recursos; não é uma medição da CDN futura nem uma estimativa automática de cobrança. Considerar também a necessidade de cabeçalhos customizados, visibilidade do repositório, termos da conta e simplicidade de manutenção. Antes de divulgar, resolver as pendências INPE/editoriais e conferir com o responsável a manutenção das declarações do Forms apontadas na auditoria/guia.

## Maiores originais internos excluídos da publicação

| Arquivo | Bytes |
| --- | --- |
| src/artwork/originais/chamas.png | 1.963.967 |
| src/artwork/originais/fumaca.png | 1.931.052 |
| src/artwork/originais/rodape-painel.png | 1.922.338 |
| src/artwork/originais/ambiente.png | 1.860.949 |
| src/artwork/originais/composicao.png | 1.723.741 |
| src/artwork/originais/rodape.png | 1.556.746 |
