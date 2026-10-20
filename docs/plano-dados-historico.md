# Revisão histórica da página Dados

Plano aprovado em 19/10/2026: abertura e biomas com território atingido ao menos uma vez em 1985–2025 (RAF, Tabela 3); focos anuais 2003–2025; acumulado nacional de jan–set/2026 comparado à média dos mesmos meses em 2003–2025. Estados: área out/2025–set/2026 versus média dos anos civis 2019–2024; focos mensais recentes e anuais 2003–2025. Históricos em linha quando houver largura e barras horizontais em telas pequenas. Textos finais e metodologia ficam para outra revisão.

## Execução

- Bases e cálculos: completos.
- Geração e atualização acessível: completas.
- Gráficos responsivos: completos.
- Verificação, reprodução e documentação: completas. 141 testes Playwright, 21 testes Python, axe, reprodução idêntica e cinco medições de laboratório registradas em `verificacao-dados.md`.

## Decisões

- Preservar o checkout `feat/pagina-dados` e as alterações existentes; sem commit ou publicação nesta etapa.
- A abertura usará o total da Tabela 3, coerente com seus seis biomas; documentar a diferença para a Tabela 2, sem corrigir a fonte.
- Não aplicar exigência de um período único aos diferentes indicadores. Cada bloco terá seus próprios metadados.

- Registros anuais antigos sem bioma/município são contabilizados se campos essenciais e UF forem válidos; ausências de contexto ficam na auditoria. Evita descartar detecções estaduais válidas por um atributo não usado.
- Revisão independente: referências de área e edição mensal INPE incompatíveis agora são rejeitadas, com testes de regressão. Validado também o período do histórico anual.
- Reprodução: três bases idênticas. O HTML foi conferido novamente após a mudança final do cabeçalho “Período” para “Ano” na alternativa anual; gerador idempotente.
