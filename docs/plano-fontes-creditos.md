# Fontes e créditos — plano de implementação

Data: 26/10/2026. Especificação: `docs/auditoria-fontes-creditos.md`.

Objetivo: disponibilizar a página auditada pelo item existente “Fontes e créditos” do rodapé, conforme solicitação do usuário após a apresentação da proposta.

Arquitetura: documento estático `fontes.html`, com cabeçalho/rodapé idênticos aos existentes, escala de leitura compartilhada e quatro seções após a introdução. Sem dependências ou JavaScript novos. Execução nesta sessão; sem commit, push ou publicação.

## Restrições e decisões

- Preservar a navbar Início | Queimadas | Dados | Prevenção.
- Usar somente referências vinculadas ao conteúdo atual; não incluir CBMSC como reconfirmado, candidatos não utilizados ou antigas tabelas estatísticas.
- Atribuir CC BY 4.0 apenas aos produtos confirmados; INPE com termos encontrados, sem licença presumida.
- Informar a preparação do rodapé com IA e a pendência de origem, sem declarar autorização comprovada.
- Não alterar os textos educativos existentes nem substituir recursos sem aprovação específica.
- Ruling: usar branch local de funcionalidade na mesma pasta — execução de produção por um único agente, com revisão somente leitura, preservando o relatório já elaborado; nenhuma necessidade de checkout paralelo.

## Verificação prioritária

- Rodapés de todas as páginas e caminho relativo em subdiretório devem abrir a página real.
- O link deve funcionar por teclado e sem JavaScript; topo deve permanecer local.
- Textos longos, links e fonte ampliada devem refluir sem overflow nos oito viewports existentes.
- Metodologias de área histórica, Monitor e focos devem permanecer distintas.
- Créditos devem distinguir recurso usado, ferramenta de desenvolvimento e pendência de direitos.

## Tarefas

- [x] 1. Escrever e executar testes de integração/fontes, observando falha pela ausência da página/link; adaptar expectativas antigas de indisponibilidade ao novo requisito.
- [x] 2. Criar `fontes.html`, integrar seis rodapés e servidor; reutilizar `src/queimadas.css` e `src/paginas.css`, com regras mínimas de links na página. Executar testes direcionados.
- [x] 3. Verificar suíte completa/checks, capturas mobile/desktop, fontes ampliadas e subdiretório; revisão independente somente leitura; atualizar README e documentação com resultados e limites reais.

Resultado: 226 testes Playwright e 21 testes Python passaram; revisão independente sem achados acionáveis. Evidências e limites em `docs/verificacao-fontes.md`.

Arquivos de produção: novo `fontes.html`; `index.html`, `queimadas.html`, `dados.html`, `prevencao.html`, `sobre.html` (somente rodapé); `scripts/dev-server.mjs`; `src/queimadas.css`; `src/paginas.css`.

Testes: novo `tests/fontes.spec.js`; expectativas em `tests/footer.spec.js`, `tests/sobre.spec.js`, `tests/dados-revisao.spec.js`. Documentação: README, verificação do rodapé, registro próprio e atualização do estado da auditoria.
