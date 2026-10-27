# Política seletiva do repositório

Preparação local de 27/10/2026. A branch de trabalho e futura produção é `main`. Não houve commit, push ou alteração remota. Visibilidade atual do GitHub não foi consultada nem alterada; repositório privado é a proposta inicial, sujeita à decisão do responsável.

## Git e distribuição são conjuntos diferentes

O Git conserva os arquivos necessários para desenvolver, reproduzir e auditar o projeto. O host deve receber somente `dist/`, gerada pela lista explícita de `npm run preparar:publicacao`. Ignorar um arquivo no Git não o torna seguro para publicar; excluí-lo da distribuição não o remove do histórico do Git.

| Categoria | Decisão | Justificativa |
| --- | --- | --- |
| Seis páginas, nova 404, CSS, JS e imagens usados pelo visitante | Manter no conjunto candidato ao Git | Fontes e ativos públicos do site. |
| `_headers`, `.node-version`, package/lock, scripts, testes e fixtures | Manter | Configuração e reprodução do build e das verificações. |
| Dados agregados, auditorias ambientais, fontes, licenças e créditos | Manter | Procedência e reprodutibilidade científica. Não reimportar dados para hospedar. |
| Originais artísticos e seu README | Manter | Evidência de autoria e reprodução das imagens; não entram em `dist/`. |
| Relatórios, decisões e planos técnicos históricos | Manter após triagem | Conhecimento do projeto; resultados datados não representam o host atual. |
| PNGs históricos selecionados, manifestos, resumos de desempenho e validação, configurações de ensaio | Manter como evidência histórica | Referenciados nos relatórios; não são a saída corrente do build. A classificação individual está na matriz local. |
| Logs das duas pastas de evidências históricas | Ignorar, preservando bytes | Saída operacional extensa; os relatórios mantêm resultados e limitações. |
| Minuta opcional da consulta INPE | Local, ignorada | Rascunho não enviado e sem dependência de build. Referências explicam sua disponibilidade local. |
| Dependências, distribuição, caches e resultados correntes | Ignorar | Regeneráveis; não são fontes nem evidência histórica selecionada. |
| Checkpoints e matrizes detalhadas | Local, ignorados | Podem conter caminhos do computador e detalhes internos. |

## Regras e ações exatas

Regras anteriores preservadas: `node_modules/`, `test-results/`, `playwright-report/`, `.DS_Store`, `__pycache__/`, `dist/`, `.auditoria-local/`.

Regras novas, limitadas aos materiais existentes:

```gitignore
/docs/minuta-consulta-inpe.md
/docs/evidencias-pre-publicacao/*.log
/docs/evidencias-revisao-editorial/*.log
```

Nenhum arquivo foi desrastreado. Os materiais novos ignorados já não estavam no índice. Nenhum byte ou histórico foi excluído. Os originais anteriores à preparação e seus hashes estão no checkpoint local desta fase; os arquivos ignorados permanecem em seus caminhos originais.

A matriz CSV em `.auditoria-local/cloudflare-20261027/matriz-repositorio.csv` relaciona os arquivos individualmente, com finalidade, estado no índice, triagem de sensibilidade, dependência, decisão, justificativa e ação. O inventário de tamanhos acompanha essa matriz. Não publicar essa área local como documentação do projeto.

## Sensibilidade e limites

Autoria e atribuição acadêmica são informações públicas intencionais, já presentes no site. A triagem de texto procura padrões de credenciais e dados operacionais, sem copiar valores encontrados. Ela não é uma certificação de ausência de segredos ou uma auditoria remota do GitHub. As ocorrências `/Home/End` nos documentos de teclado são falsos positivos de um padrão de caminho local.

Credenciais, respostas individuais, planilhas privadas e chaves não pertencem ao Git ou à distribuição. Uma ocorrência real no histórico exige decisão separada: ignorar ou desrastrear no presente não apaga versões antigas. Não reescrever histórico ou revogar credenciais automaticamente.

Antes de abrir o repositório ao público, revisar todo o histórico que será acessível e a visibilidade atual. A preparação local não autoriza essa mudança.

Referências: [GitHub — arquivos ignorados](https://docs.github.com/en/get-started/git-basics/ignoring-files) e [dados sensíveis no histórico](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository), consultadas em 27/10/2026.
