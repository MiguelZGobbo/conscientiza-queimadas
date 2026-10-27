# Preparação local para Cloudflare Pages

27/10/2026 — Conscientiza Queimadas / Atividade Extensionista III, UNINTER.

**Situação: pronta localmente para decisão de publicação**, com os itens dependentes de URL, host e autorização explicitados abaixo. A versão final foi reproduzida na cópia isolada: 265 Chromium, 21 Python e 5 Node aprovados; verificação de distribuição repetida no checkout real.

## Estado e autorização

Preparação local na `main`, com preservação do trabalho recebido. No início havia 18 arquivos rastreados modificados e fontes/documentos novos; o checkpoint desta fase registrou 161 arquivos de projeto, 17.457.065 bytes, com hashes e cópias. Esse número exclui dependências, Git e saídas ignoradas. Não restaurar o checkout a partir de HEAD: isso descartaria preparações anteriores.

Nenhum commit, push, deploy, preview remoto, conexão de contas, configuração remota, mudança de visibilidade ou DNS foi executado. Nenhuma branch ou worktree foi criada. O endereço público e a visibilidade do repositório continuam pendentes de decisão humana.

## Alterações desta fase

- Nova `404.html`, baseada no cabeçalho, estilos e rodapé existentes, com caminhos a partir da raiz para funcionar em URLs inexistentes profundas. Não muda a estrutura das seis páginas.
- Novo `_headers`, com CSP em enforcement após ensaio Report-Only, X-Frame-Options DENY, permissões de câmera/microfone/geolocalização desativadas, nosniff e política de referência. O responsável confirmou o bloqueio de iframe. Há uma regra `/*`, sem duplicação de nomes; os valores explícitos de nosniff/referência substituem os defaults, sujeitos à confirmação no host.
- `.node-version` fixa `24.19.0`, a versão usada localmente. O lockfile e `package.json` recebidos foram preservados.
- Build mantém lista explícita, manifesto e comandos; acrescenta apenas os dois arquivos públicos. Valida dependências, symlinks, arquivos e diretórios inesperados antes de escrever, conserva o diretório `dist/` e grava os bytes previamente verificados. Nenhuma remoção recursiva de `dist/`.
- Servidor local oferece aliases sem extensão para os documentos e corpo da 404 para erros, conservando status 404. Não serve `_headers` como ativo. Não imita os redirects, cache ou processamento de cabeçalhos do Cloudflare.
- Fixture de navegador lê o `_headers` efetivamente distribuído e aplica somente o subconjunto `/*` usado pelo projeto. Os ensaios de acessibilidade carregam sua ferramenta pela mesma origem, sem relaxar a CSP de produção.
- Novos testes Cloudflare, ampliação dos testes de distribuição e documentação seletiva. Ajustes nos quatro documentos que referenciavam a minuta INPE explicam sua disponibilidade local sem link quebrado.

CSS/JS do visitante, dados, geometrias, imagens, seis HTMLs originais, Forms, atribuições e dependências têm os mesmos bytes do checkpoint inicial desta fase. O detalhamento de arquivos alterados e novos está em `preservacao-final.json` na área local de evidências.

## Git e conteúdo interno

Foram acrescentadas três regras específicas: minuta INPE e logs das duas pastas históricas de evidências. São 15 arquivos recebidos, todos anteriormente não rastreados, preservados no disco e no checkpoint. **Nenhum arquivo desrastreado; nenhuma exclusão de fonte ou histórico.**

Mantidos: código/configuração, testes/fixtures, documentação técnica útil, auditorias ambientais, fontes/licenças, originais artísticos e evidências históricas selecionadas. A justificativa está na [política do repositório](./politica-repositorio.md). Logs e matriz detalhada permanecem locais.

A matriz `.auditoria-local/cloudflare-20261027/matriz-repositorio.csv` classifica individualmente arquivos de projeto e saídas locais; o inventário registra contagens e bytes por pasta. Regras verificadas por `git check-ignore -v`; nenhum arquivo rastreado coincide com regras de ignore. A área `.git` não foi copiada para o ambiente de reprodução.

Triagem heurística local: nenhum indício de chave privada, token conhecido ou credencial em URL no recorte examinado; 250 objetos textuais do histórico acessível examinados. Duas ocorrências de `/Home/End` são atalhos de teclado, não caminhos privados. Autoria acadêmica é pública intencional. Não houve auditoria remota, pentest ou garantia absoluta de ausência de segredos.

## Distribuição

**29 arquivos, 1.115.791 bytes.** Acréscimo de 6.720 bytes sobre os 27 arquivos recebidos: `404.html` com 6.295 bytes e `_headers` com 425 bytes. O manifesto com SHA-256 fica fora do pacote, em `.auditoria-local/manifesto-publicacao.json`, com cópia nas evidências desta fase.

O conjunto real foi comparado ao manifesto, aos hashes e aos bytes das fontes. Não há docs, logs, testes, dependências, originais artísticos, checkpoints ou dados ambientais brutos em `dist/`. O arquivo `.node-version` é configuração de build e também não vai ao visitante.

Não há `_redirects`, Functions, Workers, analytics, novo serviço, coletor CSP ou dependência de runtime. Sem HSTS próprio e sem cache `immutable` para nomes sem hash.

## Verificações

| Verificação | Resultado observado |
| --- | --- |
| Linha de base `npm run check` | 21 Python e 4 Node aprovados antes das alterações. |
| TDD da distribuição/rotas | Falhas reproduzidas para ausência dos novos arquivos, recriação de `dist`, aliases e diretório inesperado; correções verificadas. |
| CSP Report-Only e regressões direcionadas | 14 testes aprovados após corrigir o `srcset` da nova 404 para caminhos de raiz. |
| CSP em enforcement | 14 testes direcionados aprovados; cabeçalhos vindos do pacote, menu, navegação, 27 UFs e seis gráficos, sem violações legítimas observadas. |
| `npm ci` isolado | 226 pacotes instalados; npm informou zero vulnerabilidades conhecidas no audit dessa execução. |
| `npm run check` isolado | Sintaxe, 21 Python e 5 Node aprovados. |
| `npm test -- --reporter=dot` isolado | 265 testes Chromium aprovados, incluindo os 9 novos cenários Cloudflare. |
| `npm run preparar:publicacao` e `npm run test:publicacao` | Build aprovado e 5 testes Node aprovados. |
| Preservação/manifesto/ignore | Hashes e bytes conferidos; arquivos recebidos preservados; nenhum rastreado ignorado. |
| `git diff --check` | Aprovado no checkout real. |

O primeiro ensaio de navegador detectou duas falhas: o `srcset` relativo da nova 404 quebrava em caminhos profundos, e a inserção de estilo pelo harness travava no contexto com JS desativado. Foram corrigidos, respectivamente, os caminhos da 404 e o ensaio de texto ampliado, que agora entrega o CSS por HTTP. Nenhuma asserção foi removida; as execuções seguintes passaram.

Os testes cobrem 404 profunda, recursos ausentes, acentos, URL malformada, HEAD, aliases, fragmentos, navegação em raiz/subdiretório onde suportada, iframe bloqueado e ausência de arquivos internos. A 404 usa caminhos de raiz e é destinada à publicação na raiz do Pages; não se promete sua portabilidade para `/projeto/`.

Uma revisão independente, somente leitura e com comparação ao checkpoint desta fase, não encontrou pendência material nos cinco riscos prioritários: vazamento em `dist/`, exclusão indevida de Git/arquivos, fallback 200 para rota inexistente, regressão por CSP e origem fictícia em metadados. O revisor também conferiu índice, hashes e respostas locais de erro. As validações reais do host e decisões remotas abaixo permaneceram fora desse julgamento.

Capturas das sete páginas em 390×844 e 1440×900 foram inspecionadas por amostras de abertura, meio e rodapé; sem regressões visuais observadas. Também houve ensaios automatizados em 320 px, texto a 200%, teclado, sem JavaScript e movimento reduzido, além de axe na nova 404. Não é certificação integral de acessibilidade.

A reprodução usa cópia temporária das fontes candidatas, incluindo arquivos novos, sem `.git`, `node_modules`, `dist` ou checkpoints anteriores. Node 24.19.0, npm 11.17.0 e Python 3.14.7 observados. Os avisos npm sobre scripts de instalação de dependências opcionais não aprovados foram preservados; nenhuma aprovação automática foi adicionada. Houve também avisos de ambiente NO_COLOR/FORCE_COLOR, sem falha de teste. As 15 observações HTML históricas não foram reavaliadas por um novo validador nesta fase.

## Evidências e ativação pendente

Evidências locais em `.auditoria-local/cloudflare-20261027/`: checkpoint/estado inicial, matriz, inventário por pasta, preservação final, manifestos, logs de instalação/check/suítes, triagens e capturas. Essa área é ignorada e não pertence ao Git nem ao host. Checkpoints e ferramentas de reversão anteriores foram preservados e não executados.

Usar o [checklist de ativação](./checklist-ativacao-cloudflare.md): Pages, None, raiz, `main`, build `npm run preparar:publicacao`, saída `dist`, Node fixado. Confirmar instalação real das dependências nos logs do host, sem presumir equivalência com `npm ci` local.

**Bloqueados pela escolha da URL:** canonical, `og:url`, `og:image` absoluto e sitemap. Nenhum placeholder foi publicado. Futuros caminhos canônicos: `/` e cinco páginas internas sem `.html`. Previews exigem decisão de acesso e conferência de noindex sem bloquear a origem principal.

**Pendentes do host/autorização:** visibilidade do GitHub, origem/domínio, revisão e autorização de commit/push/conexão/deploy; HTTPS, HTTP 404 real, normalização de rotas, cabeçalhos, cache/compressão e SEO no endereço real. Os testes locais não comprovam a infraestrutura Cloudflare. Search Console e envio do Forms não foram executados.

Fontes oficiais consultadas em 27/10/2026: [Cloudflare — Git](https://developers.cloudflare.com/pages/get-started/git-integration/), [rotas e 404](https://developers.cloudflare.com/pages/configuration/serving-pages/), [headers](https://developers.cloudflare.com/pages/configuration/headers/), [runtime](https://developers.cloudflare.com/pages/configuration/build-image/), [limites](https://developers.cloudflare.com/pages/platform/limits/), [GitHub — ignore](https://docs.github.com/en/get-started/git-basics/ignoring-files), [histórico sensível](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository), [Google — sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
