# Guia de publicação futura — Conscientiza Queimadas

> Atualização de 27/10/2026: a preparação local para Cloudflare Pages está descrita no [relatório desta fase](./relatorio-preparacao-cloudflare.md), na [política do repositório](./politica-repositorio.md) e no [checklist de ativação](./checklist-ativacao-cloudflare.md). Estes registros prevalecem para a candidata atual; as seções datadas de 26/10 abaixo preservam o histórico.
>
> Trabalhamos na `main`, sem branch auxiliar. A distribuição inclui `404.html` e `_headers`; Node está fixado em `.node-version`. A CSP foi validada em Report-Only e a candidata passou a enforcement; incorporação por iframe foi explicitamente recusada pelo responsável. HSTS próprio e cache adicional não foram configurados. O servidor comum apenas oferece aliases locais e 404, sem aplicar `_headers`; a fixture de testes usa o arquivo efetivamente distribuído. Confirmar todos os comportamentos no host após autorização.
>
> Não há canonical/OG com origem absoluta nem sitemap: dependem da URL real. Nenhuma conexão, commit, push ou publicação foi executada. Logs operacionais históricos continuam locais e ignorados; os resultados registrados nos relatórios foram preservados.

Preparação local em 26/10/2026. **Nenhum deploy, push, vínculo de conta, contratação ou escolha de hospedagem foi realizado.** Este guia descreve uma etapa futura, que depende da decisão do responsável.

**Atualização editorial posterior na mesma data:** os cinco itens do novo handoff foram tratados conforme [relatorio-revisao-editorial.md](./relatorio-revisao-editorial.md). O reuso dos agregados INPE com crédito foi documentado pelo PDA vigente e pelo decreto federal; não se atribuiu um identificador CC aos arquivos. Consulta nominal opcional (rascunho local preservado, fora do Git) preparada sem envio. Antes da publicação autorizada, revisar esses registros e executar as configurações e verificações de domínio/provedor deste guia.

## Candidata estática e execução local

O site continua sendo seis documentos HTML independentes. Não há bundler, backend, banco, instalação de dependências em produção ou chamada de API para consultar o mapa. Node e Python são ferramentas de desenvolvimento; o visitante recebe somente HTML, CSS, JavaScript e imagens locais.

```powershell
npm ci
npx playwright install chromium
npm run preparar:publicacao
npm run dev -- --root dist
```

Abrir `http://127.0.0.1:4173/`. Para conferir um site de projeto em subdiretório, encerrar o servidor anterior e executar:

```powershell
npm run dev -- --root dist --prefix /projeto/
```

Abrir `http://127.0.0.1:4173/projeto/`. O servidor se limita a `127.0.0.1`; ele não é servidor de produção. Seu `Cache-Control: no-store` torna as medições locais reproduzíveis e não representa o cache da futura hospedagem. `file://` não é o ambiente de validação: os módulos JavaScript e suas importações devem ser testados por HTTP.

`npm run preparar:publicacao` copia uma lista explícita para `dist/`, sem minificar nem transformar os recursos. O manifesto de tamanhos e SHA-256 fica em `.auditoria-local/manifesto-publicacao.json`, fora da distribuição. A rotina verifica dependências locais e rejeita links simbólicos. Ela não publica nem executa importadores ambientais.

**Publicar somente o conteúdo de `dist/`.** Nunca enviar a raiz inteira do checkout: ela inclui originais artísticos, documentação interna, ferramentas, testes e dependências. `.gitignore` evita versionar saídas, mas não substitui a seleção da pasta de publicação.

## Fluxo futuro a partir do GitHub

1. Revisar as decisões e condições documentadas no relatório editorial atualizado, incluindo atribuição ao INPE. Os cinco itens deste handoff foram tratados; o histórico da auditoria permanece preservado. Escolher o provedor em outra etapa.
2. Revisar o diff e executar os testes. Registrar uma revisão aprovada no GitHub somente quando houver autorização para commit/push e publicação.
3. Configurar o provedor para obter essa revisão e publicar **apenas `dist/`**. A preparação é `npm ci` seguido de `npm run preparar:publicacao`; não há compilação do site.
4. Se a origem escolhida só admitir raiz ou `/docs`, como a publicação direta por branch do GitHub Pages, não apontá-la para a raiz atual. Definir posteriormente um fluxo de artefato ou uma branch de distribuição. Nenhum workflow de deploy foi criado nesta entrega.
5. A cada atualização eventual, repetir preparação, validação e revisão antes da publicação. Evitar subir resultados locais de auditoria ou arquivos brutos dos importadores. Não reimportar dados ambientais apenas para publicar a edição atual.
6. Após um deploy autorizado, verificar o endereço público e guardar a revisão/artefato anterior para rollback pelo mecanismo do provedor.

## Configurações que dependem do endereço e do provedor

| Item | Ação futura |
| --- | --- |
| URL definitiva | Definir HTTPS, domínio/subdomínio e eventual subcaminho; conferir os caminhos relativos existentes. |
| URLs equivalentes | Escolher a URL principal da Home (`/` ou `index.html`) e comportamento de `.html`, capitalização e barra final. Configurar redirecionamentos coerentes sem renomear rotas por conveniência. |
| 404 | Confirmar resposta HTTP 404 real para páginas inexistentes. Não ativar fallback de SPA. No Cloudflare Pages, a ausência de `404.html` pode acionar esse fallback; resolver isso antes de publicar nessa plataforma. |
| Cache | HTML e arquivos sem hash devem permitir atualização/revalidação. Não aplicar `immutable` por um ano aos nomes atuais sem uma estratégia de versionamento. Conferir compressão Brotli/gzip e MIME. |
| SEO | Definir canônicas, sitemap com URLs absolutas e Open Graph com URL/imagem pública existente e representativa. Não publicar placeholders. |
| Robots | Verificar ausência de bloqueio acidental a páginas, CSS e JS. `robots.txt` permissivo e `index,follow` repetido não são requisitos para este site. Não usar robots/noindex para proteger conteúdo confidencial. |
| IA | Regras sobre pesquisa, solicitações de usuários e treinamento são decisões distintas. Não criar bloqueios ou `llms.txt` por padrão; o Google não exige arquivos especiais para seus recursos de IA. |
| Terceiros | Preservar o destino do Forms e os créditos. Reavaliar privacidade antes de introduzir embeds, analytics ou outras coletas. |

Referências: [Google — sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [Google — recursos de IA](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [Cloudflare — páginas e 404](https://developers.cloudflare.com/pages/configuration/serving-pages/), [GitHub — origem de publicação](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site). Consultadas em 26/10/2026.

## Matriz de cabeçalhos para o host

Recomendações para validar no provedor escolhido; não foram instaladas como regras de produção. GitHub Pages em GitHub.com não oferece configuração documentada por projeto equivalente a `_headers`/`vercel.json`; uma meta CSP não substitui todos os cabeçalhos nem permite Report-Only ou `frame-ancestors`.

| Cabeçalho | Candidata e condição |
| --- | --- |
| `X-Content-Type-Options` | `nosniff`; conferir MIME de HTML, CSS, módulos JS, SVG e WebP. Já usado pelo servidor local. |
| `Referrer-Policy` | `strict-origin-when-cross-origin`; verificar se atende à política escolhida pelo responsável. O Forms já usa `noreferrer`. |
| Proteção contra iframe | `Content-Security-Policy: frame-ancestors 'none'`, com `X-Frame-Options: DENY` como alternativa compatível; confirmar se há intenção futura de incorporar o site. |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()`; o mapa atual não usa localização do visitante. |
| `Strict-Transport-Security` | Considerar `max-age=31536000` somente após HTTPS definitivo funcionar. Não adicionar `includeSubDomains` ou `preload` sem avaliar todos os subdomínios e autorizar o compromisso. |
| CSP | Iniciar por `Content-Security-Policy-Report-Only`, observar e só depois decidir enforcement. Não contratar um serviço de relatórios automaticamente. |

Candidata de CSP a testar nos estados de navegação, animação e seleção do mapa:

```text
default-src 'self'; base-uri 'none'; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; connect-src 'self'; frame-src 'none'; frame-ancestors 'none'; form-action 'none'
```

O site carrega scripts, módulos, SVG e imagens da própria origem. As fontes tipográficas são do sistema. Os blocos `<style>`, atributos `style` e alterações de estilo feitas pelos gráficos justificam `'unsafe-inline'` em `style-src` nesta candidata; removê-lo cegamente quebraria a apresentação. Não há JavaScript inline ou necessidade demonstrada de `unsafe-eval`. Os links de referência e o link para o Forms são navegação externa, não recursos incorporados; não exigem liberar todas essas origens em `script-src`, `connect-src` ou `frame-src`.

Sem endpoint de relatórios, o diagnóstico Report-Only pode ser observado no console do navegador; nenhum coletor externo foi configurado. Referência: [MDN — CSP Report-Only](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy-Report-Only).

## Privacidade e feedback

O próprio site não incorpora o formulário, não usa analytics e não foi observado gravando cookies, localStorage ou sessionStorage. O visitante abre um link externo com `noopener noreferrer` e descrição acessível.

A visualização pública do Forms, consultada em 26/10/2026 sem enviar respostas, informa participação voluntária, finalidade de avaliar e melhorar o site, responsável Miguel Zager Gobbo, contato de privacidade, acesso restrito, ausência de divulgação individual e retenção de até seis meses. Mostra seis perguntas obrigatórias sobre a experiência e um campo opcional de sugestões, solicita não inserir dados sensíveis e declara não pedir nome/e-mail. A abertura não apresentou barreira de login. O comportamento no envio, as configurações internas da conta e cookies do Google não foram auditados.

Essas são declarações observadas no formulário, não uma política nova criada para o responsável nem certificação LGPD. Manter as informações atualizadas e revisar mudanças de coleta com o responsável. Não há evidência que justifique introduzir banner de cookies apenas nesta preparação. Referência: [ANPD — guia de cookies](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_cookies_e_protecao_de_dados_pessoais).

## Verificação após uma publicação autorizada

- Conferir HTTPS real, certificado, redirecionamento HTTP→HTTPS e ausência de conteúdo misto.
- Conferir status/MIME/cache/cabeçalhos por DevTools e `curl.exe -I`, usando a URL real escolhida.
- Abrir as seis páginas, mapa, menu e Forms; conferir 404 real, URL principal e recursos em subdiretório, quando aplicável.
- Gerar e validar sitemap/canônicas usando o endereço definitivo; não adicionar datas de atualização inventadas.
- Verificar a propriedade no Google Search Console pelo método disponível, inspecionar URLs e enviar sitemap. Repetir o cadastro/verificação no Bing Webmaster Tools.
- Repetir medições na URL pública. Dados de campo de Core Web Vitals dependem de visitas reais suficientes; Lighthouse local não demonstra percentil 75 de usuários.

Não há promessa de indexação, classificação em busca, segurança absoluta ou conformidade integral de acessibilidade/privacidade.

## Reverter somente esta preparação

O checkpoint externo e `.auditoria-local/reversao.json` distinguem esta entrega das sete alterações que já existiam. A ferramenta local confere os hashes finais antes de restaurar qualquer arquivo; se houver edição posterior, interrompe e solicita revisão manual. Ela restaura os bytes iniciais dos arquivos modificados e remove somente os arquivos novos registrados; não apaga pastas recursivamente, não altera Git e mantém os artefatos locais.

```powershell
python .auditoria-local/restaurar-estado-inicial.py --check
# Somente se a intenção for desfazer esta entrega:
python .auditoria-local/restaurar-estado-inicial.py --apply
```

O modo `--check` foi executado na entrega. A restauração do checkout real não foi executada, pois desfaria o trabalho solicitado. Não usar `git reset --hard`, `git clean` ou restauração indiscriminada da raiz: isso perderia o trabalho que já estava em andamento. Após uma reversão, a pasta ignorada `dist/` deve ser regenerada antes de reutilização.

A ferramenta e o checkpoint são locais deste checkout, não acompanham um clone novo. Preservar a pasta externa indicada em `.auditoria-local/estado-inicial.json` antes de limpar arquivos temporários. O fluxo de check/apply e a proteção contra edição posterior também foram verificados em uma fixture descartável, sem reverter o projeto real.

**Cuidado após a revisão editorial:** o manifesto de reversão acima registra a entrega técnica anterior. Como houve edições autorizadas posteriores, sua proteção por hash deve recusar a restauração desses arquivos; isso é esperado. Não atualizar os hashes para contornar a proteção. O estado anterior à revisão editorial está em `.auditoria-local/revisao-editorial/checkpoint/`, com hashes em `estado-inicial.json`. Qualquer reversão futura deve distinguir as duas entregas e preservar alterações posteriores. Nenhuma reversão foi aplicada nesta revisão.
