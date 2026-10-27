# Fontes e condições de uso — focos do INPE

Consulta registrada em 19/10/2026 para a página Dados. A série incorporada é a contagem de focos do **Brasil pelo satélite de referência**, nos CSVs anuais de referência de 2003–2025 e nos CSVs mensais de janeiro a setembro/2026, filtrados por `satelite=AQUA_M-T`. O site publica somente totais agregados: totais anuais completos 2003–2025, distribuição estadual out/2025–set/2026 e acompanhamento nacional acumulado de 2026 frente à média histórica dos mesmos meses; os CSVs e ZIPs originais não são distribuídos pelo projeto.

## Fontes oficiais

- Arquivos anuais: [diretório oficial do satélite de referência](https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/anual/Brasil_sat_ref/) e arquivos [2021](https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/anual/Brasil_sat_ref/focos_br_ref_2021.zip), [2022](https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/anual/Brasil_sat_ref/focos_br_ref_2022.zip), [2023](https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/anual/Brasil_sat_ref/focos_br_ref_2023.zip), [2024](https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/anual/Brasil_sat_ref/focos_br_ref_2024.zip) e [2025](https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/anual/Brasil_sat_ref/focos_br_ref_2025.zip).
- A página [Dados Abertos do Programa Queimadas](https://terrabrasilis.dpi.inpe.br/queimadas/portal/pages/secao_downloads/dados-abertos/) identifica arquivos de focos em intervalos anuais e apresenta a opção “Satélite de referência”.
- A [FAQ do Programa Queimadas](https://data.inpe.br/queimadas/faq/) explica que os dados e produtos são divulgados sem custo (perguntas 3 e 5), define o satélite de referência e a finalidade de comparação temporal (pergunta 7), e determina que o material online citado seja referenciado conforme a ABNT NBR 6023 (pergunta 36).
- A página oficial do [INPE sobre dados abertos de monitoramento ambiental](https://www.gov.br/inpe/pt-br/acesso-a-informacao/dados-abertos/monitoramento-ambiental) lista o conjunto [Monitoramento de queimadas](https://dados.gov.br/dados/conjuntos-dados/monitoramento-de-queimadas). A listagem confirma a publicação no catálogo governamental; ela não informa, por si só, uma licença específica para os CSVs anuais.
- O [registro de metadados GeoNetwork do TerraBrasilis](https://terrabrasilis.dpi.inpe.br/geonetwork/srv/api/records/6422463f-3652-437f-bb33-2ac7bbc9bebe/formatters/xml) descreve os focos e seus atributos. O XML consultado não contém uma declaração explícita em `resourceConstraints` ou campo equivalente.

## Reutilização e licença

### Atualização documental — 26/10/2026

O [Plano de Dados Abertos do INPE 2025–2027](https://www.gov.br/inpe/pt-br/acesso-a-informacao/dados-abertos/repositorio-de-arquivos/pda_inpe_25_27_v3_defesoeleitoral2026.pdf), Anexo I, página numerada 29 (30ª página do PDF), identifica **Monitoramento de Queimadas** como **base aberta**, incluindo as coordenadas dos focos de fogo. O [Decreto nº 8.777/2016, com redação atualizada](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2016/decreto/d8777.htm), arts. 2º, III, 3º, IV, e 4º, documenta o regime de livre utilização e reuso dos dados abertos federais, com crédito à autoria ou fonte. O art. 4º, § 2º, ressalva condições de direitos de terceiros; não foi localizada condição conflitante para os focos aqui utilizados.

**Decisão desta revisão:** o uso e a transformação desses focos em agregações educativas, com crédito ao INPE e referência ABNT orientada pela FAQ, estão suficientemente documentados pelo PDA e pelo decreto. Não se atribui CC BY ou CC BY-SA aos arquivos; não foi localizado identificador nominal de licença por ZIP/CSV. A conclusão resulta da leitura conjunta dos documentos, não de resposta individual do INPE, da mera gratuidade ou do silêncio de um campo de metadados. Não abrange imagens, logomarcas ou todos os produtos do instituto.

A interface e os créditos mantêm produto, satélite, períodos, agregação própria e referência. A data de importação/consulta dos dados continua **19/10/2026**; **26/10/2026** é a data desta verificação das condições de uso, sem novo download das séries. Detalhes, limites e minuta opcional para confirmar um identificador nominal estão em [relatorio-revisao-editorial.md](./relatorio-revisao-editorial.md) e minuta-consulta-inpe.md (rascunho local preservado, fora do Git). Os parágrafos seguintes preservam a conclusão histórica de 19/10, agora complementada por esses documentos.

O INPE declara que os produtos são acessíveis gratuitamente e orienta citar e referenciar o material online segundo a ABNT NBR 6023. A FAQ fornece como exemplo a referência ao Banco de Dados de Queimadas e pede que a data de acesso seja atualizada.

Não foi localizada uma licença expressa aplicável aos ZIPs anuais do Programa Queimadas. Disponibilidade gratuita, catálogo de dados abertos e exigência de citação não identificam, sozinhos, uma licença de redistribuição. A [FAQ geral do TerraBrasilis](https://terrabrasilis.dpi.inpe.br/faq/) diz que os dados da plataforma podem ser usados livremente, respeitada a licença e com citação; a [página de citações e licença](https://terrabrasilis.dpi.inpe.br/citacoes-e-licenca-de-uso/) declara CC BY-SA 4.0 para o trabalho “Programa de monitoramento dos biomas brasileiros”. Essa declaração não foi estendida aqui ao produto anual do Programa Queimadas, pois as páginas consultadas não estabelecem que ela rege estes arquivos. Também não se aplica automaticamente a licença CC BY 4.0 registrada para os dados MapBiomas usados em outra parte da página.

Assim, o projeto mantém atribuição visível ao INPE e a referência abaixo, mas não declara que os dados de focos sejam CC BY, CC BY-SA ou cobertos por outra licença. Se uma licença explícita for necessária para uma redistribuição mais ampla, a documentação pública consultada não resolve essa questão.

## Referência e crédito

Crédito curto para a interface:

> Fonte: INPE — Programa Queimadas, focos do Brasil pelo satélite de referência AQUA_M-T, anos completos 2003–2025 e meses recentes até set/2026. Dados consultados em 19 out. 2026.

Referência em formato ABNT, seguindo o modelo recomendado pelo INPE:

> INSTITUTO NACIONAL DE PESQUISAS ESPACIAIS (INPE). Programa Queimadas: Banco de Dados de Queimadas — focos anuais do Brasil, satélite de referência, 2003–2025. Disponível em: <https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/anual/Brasil_sat_ref/>. Acesso em: 19 out. 2026.

> INSTITUTO NACIONAL DE PESQUISAS ESPACIAIS (INPE). Programa Queimadas: focos mensais do Brasil, janeiro–setembro de 2026. Disponível em: <https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/mensal/Brasil/>. Acesso em: 19 out. 2026. Agregação própria com filtro AQUA_M-T.

## Arquivos e verificações

Os tamanhos e hashes SHA-256 abaixo foram calculados sobre os ZIPs baixados do diretório oficial em 19/10/2026. Totais por ano e por UF estão em [`auditoria-focos.json`](./auditoria-focos.json); o importador verifica todos os anos e grava a saída em [`../src/focos-base.js`](../src/focos-base.js).

| Ano | Focos no Brasil | Tamanho do ZIP (bytes) | SHA-256 |
| --- | ---: | ---: | --- |
| 2021 | 184.081 | 7.623.094 | `9edeb229c078b98df37d17b460bed74a0d13bd0688a530386ca815ba2f8a68e6` |
| 2022 | 200.763 | 8.256.945 | `75538cbfb99bbbe543cb786d7b8f7650537a1333327f8bf17cda7178c01878ea` |
| 2023 | 189.901 | 7.458.410 | `4cc635d1adf1a7f59d18640ff13a8779cb3b0f2aecbc867dacc86959d892b880` |
| 2024 | 278.299 | 10.727.110 | `a2cec2f67483a4a95956a471d5cbdb7b3cbd93b21c9b87c845a649ef89abf4e1` |
| 2025 | 136.393 | 5.906.397 | `63b144c47279991dca0f2007e23e15b4a932355b6c93d033d81a245a8eab56ca` |

## Limitações de interpretação

Um foco é uma detecção de fogo ativo em um pixel do sensor; não corresponde necessariamente a uma queimada, incêndio ou área queimada. Um mesmo evento pode produzir vários focos, e condições de observação podem impedir detecções. O próprio INPE recomenda a série do satélite de referência para tendências espaciais e temporais e informa que ela representa apenas uma fração das ocorrências reais. Por isso, estes valores não devem ser somados ou comparados como se fossem hectares queimados da série MapBiomas.

## Reprodução

Com Python 3.10 ou superior, o comando abaixo baixa os 23 ZIPs e os nove CSVs mensais de 2026, valida e agrega os CSVs e recria os dois arquivos gerados. Os arquivos brutos permanecem em diretório temporário e não são adicionados ao repositório.

```powershell
python scripts/importar-focos.py
```

Também é possível usar uma pasta local com `focos_br_ref_2003.csv` até `focos_br_ref_2025.csv` e `focos_mensal_br_202601.csv` até `focos_mensal_br_202609.csv`:

```powershell
python scripts/importar-focos.py --input-dir caminho/para/csvs
```

No modo local, hashes de ZIP são registrados quando o arquivo original está na mesma pasta; se não estiver, a ausência é declarada. Os CSVs mensais têm seus próprios hashes registrados. Após a importação, executar `node scripts/gerar-paineis-focos.mjs` para atualizar os painéis HTML e tabelas alternativas. O JavaScript publicado é estático; a página não depende de rede para mostrar esses dados.

## Recortes atuais — histórico e acompanhamento de 2026

- Série de anos civis completos: **2003–2025**. 2003 é o primeiro ano civil completo após a adoção do AQUA_M-T em julho/2002. O ano parcial de 2026 não é incluído no histórico anual.
- Brasil: acumulados janeiro–mês em **2026 até setembro**, comparados à média aritmética dos acumulados dos mesmos meses de **2003–2025**, sempre com denominador 23. Médias não são arredondadas no cálculo; a interface usa uma casa decimal. Contagens observadas permanecem inteiras. Não se trata de previsão.
- UFs: **out/2025–set/2026** para a distribuição mensal; **2003–2025** para os totais anuais.

O repositório mensal inclui vários satélites: somente AQUA_M-T é agregado. São conferidos codificação (UTF-8/Latin-1), país, datas UTC, nome e código IBGE da UF. Duplicatas idênticas são contadas uma vez; conflitos interrompem a geração. Arquivos anuais devem ter detecções nacionais em todos os meses; arquivos mensais multissatélite devem abranger todos os dias. Zeros estaduais são contagens dentro de um arquivo validado, não substituições de arquivos ausentes.

Registros anuais antigos podem não informar município ou bioma. Esses campos não são usados na agregação Brasil/UF e sua ausência é auditada, preservando registros com país, UF, identificador, data e coordenadas válidos. `validationByYear` registra essas ausências, duplicatas e hashes dos CSVs; `monthlyByRegion` permite reproduzir todas as somas e médias. Os ZIPs de 2003–2020 também têm URLs, tamanhos e SHA-256 em `auditoria-focos.json`; a tabela acima conserva os controles independentes previamente verificados de 2021–2025.

### Limitações de cobertura

Os arquivos mensais de 2026 abrangem todos os dias considerando os vários satélites, porém não apresentam AQUA_M-T em **3 de maio, 10 e 22 de julho**. A causa não é estabelecida pelos arquivos. Não inferimos ausência de fogo nem estimamos valores para essas datas. O gráfico acumulado usa somente as detecções disponíveis e apresenta essa limitação junto dele.

### Valores de conferência

- Brasil, janeiro–setembro/2026: **70.350** detecções.
- Média histórica janeiro–setembro/2003–2025: **154.373,04347826086**, exibida como **154.373,0**.
- Brasil, junho/2026: **5.209**, conferido com [Infoqueima de junho/2026](https://www.gov.br/inpe/pt-br/assuntos/ultimas-noticias/boletim-infoqueima-apresenta-panorama-das-queimadas-e-do-risco-de-fogo-no-brasil-em-junho-de-2026/).
- Espírito Santo: **385** no ano civil de 2025; **472** nos 12 meses out/2025–set/2026. Esses números têm intervalos distintos.

Termos de reutilização e atribuição permanecem os descritos acima. A licença do MapBiomas não é atribuída aos dados INPE.
