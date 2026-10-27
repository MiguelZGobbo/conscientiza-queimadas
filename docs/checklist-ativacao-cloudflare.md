# Ativação futura do Cloudflare Pages

Preparado em 27/10/2026. **Este roteiro não foi executado.** Conectar o repositório e concluir Save and Deploy já publica o site; preview remoto também pode ser acessível. Exigir autorização específica antes dessas ações.

## Decisões anteriores à conexão

- [ ] Miguel confirma a visibilidade atual/desejada do GitHub. Proposta inicial: privado. Não alterar um repositório público automaticamente.
- [ ] Escolher a origem HTTPS principal: subdomínio real `pages.dev` ou domínio próprio cuja propriedade esteja comprovada. Nenhum nome foi reservado ou comprado.
- [ ] Aprovar diff, revisão exata, commit/push, conexão da conta e publicação, com os respectivos alvos.
- [ ] Preservar artefato/revisão aprovados e definir quem pode operar e reverter a hospedagem.
- [ ] Definir acesso aos previews. `noindex` e `robots.txt` não restringem visitantes. Avaliar controle de acesso real antes de publicar conteúdo que deva ser privado.

## Parâmetros do dashboard

| Parâmetro | Valor preparado |
| --- | --- |
| Produto | Cloudflare Pages com integração GitHub, plano Free |
| Repositório | Repositório existente deste projeto; conceder acesso apenas ao necessário |
| Framework | None / sem framework |
| Diretório raiz | Raiz do repositório |
| Branch de produção | `main` |
| Comando de build | `npm run preparar:publicacao` |
| Diretório de saída | `dist` |
| Node | `24.19.0`, pelo arquivo `.node-version`; qualquer `NODE_VERSION` remoto deve coincidir |
| Instalação npm | Conferir detecção do lockfile e comando real nos logs do primeiro build; o `npm ci` local não comprova a instalação automática do host |
| Previews | Desativar builds de branches desnecessárias; decidir acesso e política de indexação antes da ativação |
| Runtime do visitante | Somente arquivos estáticos; sem Functions, Workers, backend ou analytics |

A integração Git dispara builds/deploys em atualizações conectadas. Como o trabalho acontece sempre na `main`, tratar cada push futuro como potencial publicação. A autorização desta fase não cobre nenhum push.

## URL e indexação — bloqueados pela escolha da origem

- [ ] Home canônica na raiz `/`; internas em `/queimadas`, `/dados`, `/prevencao`, `/sobre` e `/fontes`, acompanhando a normalização nativa do Pages.
- [ ] Depois da escolha, preparar canonical e `og:url` por documento, imagem OG existente com direitos confirmados e URL absoluta real e sitemap somente com as seis páginas canônicas. Excluir 404 e previews.
- [ ] Validar sitemap e metadados contra a origem escolhida, sem localhost, domínios fictícios ou datas inventadas. Avaliar `robots.txt` apenas se necessário.
- [ ] Preservar indexação da origem principal se ela for `pages.dev`. Se for domínio próprio, decidir redirecionamento do endereço secundário e conferir duplicação.
- [ ] Conferir `X-Robots-Tag: noindex` nos previews e eventual acesso restrito. Não aplicar `noindex` global ao site de produção.
- [ ] Search Console/Bing são etapas opcionais separadas, com autorização; não enviar sitemap nem registrar propriedades nesta fase.

## Aceite no host real

- [ ] Conferir build a partir da revisão aprovada, saída e hashes do manifesto; nenhum documento, teste, log, original artístico ou credencial no pacote.
- [ ] HTTPS, certificado, HTTP→HTTPS, ausência de conteúdo misto e domínio definitivo.
- [ ] Abrir as seis páginas, suas versões `.html`, URLs sem extensão e Home. Registrar status/cadeias reais; não presumir que os aliases locais reproduzem redirecionamentos do Pages.
- [ ] Pedir páginas inexistentes, caminhos profundos com acentos e recursos ausentes: HTTP 404 real, sem Home com 200. Conferir recursos e retorno à Home na 404; HEAD sem corpo.
- [ ] Verificar CSP, X-Frame-Options, Permissions-Policy, MIME, nosniff e política de referência em documentos e ativos; verificar também respostas de erro. `_headers` deve ser processado, sem download público como ativo.
- [ ] Testar incorporação bloqueada, menu móvel, navegação, âncoras, 27 UFs, gráficos, imagens e console. Usar DevTools e `curl.exe -I` com a origem real.
- [ ] Conferir ETag, revalidação, gzip/Brotli e atualização de CSS/JS sem hash. Manter cache padrão; não adicionar `immutable` longo.
- [ ] Repetir celular/desktop, 320 px, texto ampliado, teclado, sem JS e movimento reduzido. Conferir Forms somente como link, sem envio.
- [ ] Conferir canonical/OG/sitemap e previews após sua configuração. Registrar URL, revisão, data e operador.

HSTS próprio fica pendente de HTTPS/domínio validados; não habilitar `includeSubDomains` nem `preload` sem decisão específica. Cabeçalhos emitidos pelo Cloudflare, seus limites e prioridades exigem esta validação real.

## Rollback

Antes do primeiro deploy, guardar a revisão e a distribuição aprovadas. Em publicações seguintes, identificar o último deployment de produção validado e usar o rollback do Pages quando disponível, repetindo os checks críticos. Sem deployment anterior, não presumir um rollback: qualquer retirada/alteração remota exige autorização explícita. Não usar as ferramentas antigas de reversão local para desfazer indiscriminadamente a `main`.

Fontes oficiais consultadas em 27/10/2026: [integração Git](https://developers.cloudflare.com/pages/get-started/git-integration/), [rotas/404/cache](https://developers.cloudflare.com/pages/configuration/serving-pages/), [cabeçalhos](https://developers.cloudflare.com/pages/configuration/headers/), [runtime](https://developers.cloudflare.com/pages/configuration/build-image/), [limites Free](https://developers.cloudflare.com/pages/platform/limits/), [sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap). Reconferir documentação e limites no momento da ativação.
