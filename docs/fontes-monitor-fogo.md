# Área queimada — Monitor do Fogo

Consulta em 19/10/2026. Esta é a fonte atual da consulta estadual de área queimada. O panorama nacional usa separadamente a Tabela 3 do RAF2025 (território atingido ao menos uma vez em 1985–2025). Os registros das versões anteriores permanecem no histórico do projeto.

## Referências, adaptação e licença

- MAPBIOMAS. **Monitor do Fogo**, Coleção 1. Mapeamento mensal de cicatrizes a partir de 2019, baseado em Sentinel-2. [Apresentação e acesso](https://brasil.mapbiomas.org/iniciativas-e-produtos/fogo/monitor-do-fogo/). Acesso em: 19 out. 2026.
- MAPBIOMAS. **Descrição do método — Monitor Fogo**, Coleção 1. [Documento oficial](https://brasil.mapbiomas.org/wp-content/uploads/sites/3/2026/08/Descricao-do-Metodo-Monitor-Fogo.pdf). Acesso em: 19 out. 2026.
- MAPBIOMAS. **Plataforma Monitor do Fogo — estatísticas oficiais**. [Documentação da API](https://plataforma.monitorfogo.mapbiomas.org/api/docs/). Acesso em: 19 out. 2026. Os endereços completos das 35 séries, consultas de disponibilidade, valores recebidos e hashes estão em `auditoria-area.json`.

O MapBiomas declara seus dados de uso público, aberto e gratuito mediante referência, sob [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.pt-br). A adaptação consiste em agregar as estatísticas mensais em intervalos de 12 meses e calcular a média dos anos civis completos de 2019–2024. Fonte, recorte, adaptação e licença são identificados junto aos gráficos. Referências completas ficam na documentação até existir a página institucional prevista no rodapé. As condições do INPE e os direitos da imagem do rodapé permanecem separados.

## Recortes e cálculo

O recorte estadual é **out/2025–set/2026**. A referência é a média dos seis totais de **janeiro a dezembro de 2019–2024**. Soma-se cada ano civil completo e divide-se a soma dos seis totais por seis. Todos os períodos têm 12 meses. O importador usa `Decimal`, sem arredondar parcelas ou médias; somente a apresentação é arredondada para hectares inteiros. A geometria, os anúncios e a alternativa sem JavaScript usam os mesmos agregados.

O acumulado segue as estatísticas mensais da fonte; uma área pode contribuir em mais de um mês. Portanto, não é a extensão única do território atingido pelo menos uma vez. O Monitor do Fogo e o produto anual do RAF têm métodos diferentes: cada bloco identifica seu produto e sua medida; valores dos dois produtos não são intercambiados nem usa os percentuais antigos de 2025 para descrever o novo acumulado.

## Valores estaduais conferidos

- Amazonas: acumulado recente **504.051,41 ha**; média anual de 2019–2024 **1.105.728,508333 ha**.
- Espírito Santo: acumulado recente **5.151,24 ha**; média anual de 2019–2024 **6.094,236667 ha**.

As seis parcelas anuais de cada UF estão em `auditoria-area.json`. Os agregados nacionais e por bioma do Monitor são mantidos para reconciliação da fonte, sem substituir o indicador histórico do RAF na abertura.

## Reconciliação e limites

- Foram recebidas 93 competências, de jan/2019 a set/2026, em cada uma das 35 séries: Brasil por biomas, Brasil por estados, seis biomas e 27 UFs. Anos e meses disponíveis foram conferidos nos endpoints oficiais antes da geração.
- Séries não admitem competências duplicadas, ausentes ou com valores nulos, negativos ou não finitos. As somas mensais foram reconciliadas com os totais anuais fornecidos pela mesma fonte. A edição permanece fixada em setembro/2026 mesmo se a fonte publicar meses posteriores.
- A fonte publica estatísticas com duas casas decimais. A tolerância de reconciliação anual é de **0,07 ha**, cobrindo o arredondamento de até 12 parcelas e do total. Nas somas mensais, os limites são **0,14 ha** para 27 UFs e **0,04 ha** para seis biomas. As maiores diferenças observadas foram **0,04 ha** e **0,02 ha**, respectivamente.
- Na auditoria do Monitor, são preservados os agrupamentos nacionais por biomas e por estados. A consulta de UFs usa o agrupamento **por estados**; o panorama nacional da interface usa o RAF, documentado separadamente. O total recente do Brasil por estados é **11.370.358,28 ha**: a diferença entre agrupamentos é **778,79 ha**. Ela já existe nas estatísticas oficiais; sua causa não foi confirmada. Não é tratada como simples arredondamento nem corrigida artificialmente. As diferenças mensais e os totais de cada agrupamento estão na auditoria.
- Os valores são estimativas mapeadas por satélite. Nuvens, resolução e classificação limitam a detecção. Os dados não medem quantidade de incêndios nem classificam, sozinhos, a gravidade dos danos.

## Reprodução

Python 3.10 ou superior, sem bibliotecas adicionais:

```powershell
python scripts/importar-area.py --cache-dir "$env:TEMP\conscientiza-monitor-20261019"
node scripts/gerar-paineis-focos.mjs
```

Para reproduzir a partir das respostas originais locais:

```powershell
python scripts/importar-area.py --input-dir "$env:TEMP\conscientiza-monitor-20261019"
node scripts/gerar-paineis-focos.mjs
```

O importador valida tudo antes de substituir `src/dados-base.js` e `docs/auditoria-area.json`. O gerador mantém os metadados de cada indicador independentes e atualiza a comparação estadual, fontes e tabelas alternativas. Abertura e biomas usam a Tabela 3 do RAF2025, com auditoria própria. A página publicada usa somente arquivos locais; não chama a API do MapBiomas durante a navegação.
