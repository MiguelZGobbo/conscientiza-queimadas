# Fontes e créditos — implementação e verificação

Data: 26/10/2026. Branch local `codex/fontes-creditos`. Sem commit, push ou publicação externa.

**Atualização posterior:** a revisão editorial autorizada de 26/10/2026 complementou esta entrega em `main`. Fontes recebeu apoio oficial alternativo para os conceitos do fogo, vínculo ao Código Florestal, fundamento direto da ressalva do 199 e documentação do reuso dos agregados INPE pelo PDA vigente/decreto federal. Os registros de pendências abaixo são históricos; situação e novas verificações em [relatorio-revisao-editorial.md](./relatorio-revisao-editorial.md). A autoria visual já resolvida permanece intacta.

## Entrega

Após receber a auditoria e a proposta, o usuário solicitou colocar a página no item “Fontes e créditos” do rodapé. `fontes.html` implementa a proposta: introdução e quatro seções — conteúdos educativos e prevenção, dados e metodologia, recursos e créditos e referências técnicas. O link relativo `./fontes.html` funciona nos seis rodapés, incluindo o da própria página. O aviso restante é “Feedback ainda não disponível.” A navbar conserva Início, Queimadas, Dados e Prevenção. O retorno ao topo usa `#inicio` local e transfere foco ao cabeçalho.

O cabeçalho e o rodapé vêm da implementação de Sobre. A abertura, a coluna de 68ch, os H1/H2, as cores e os espaçamentos reutilizam `src/paginas.css` e `src/queimadas.css`; a nova classe participa dos mesmos seletores, sem alterar os valores das outras páginas. Duas regras específicas em `paginas.css` oferecem links sublinhados, quebra de palavras, alvos mínimos de 44px e hover. Não foram acrescentados scripts ou dependências. O servidor local autoriza o novo documento explicitamente.

As alterações de produção das cinco páginas existentes estão restritas aos dois ajustes de rodapé. A convenção original de fim de linha foi preservada. Os dados, as geometrias, os textos educativos e os recursos visuais existentes não foram modificados.

## Referências e pendências

A seleção segue `auditoria-fontes-creditos.md`, com instituição, documento, uso e link, consolidando referências repetidas. Foram excluídos candidatos sem uso comprovado, estatísticas antigas e o artigo do CBMSC sem reconferência atual. O MAPA publicado é o material de 2022 utilizado na Home.

Dados distingue RAF2025/Coleção 5/Tabela 3 (território atingido ao menos uma vez em 1985–2025), Monitor do Fogo/Coleção 1 (meses recentes e média de anos civis), INPE/AQUA_M-T (detecções) e malha IBGE 2025 processada. A licença CC BY 4.0 fica ligada aos produtos confirmados; não foi atribuída aos arquivos INPE. A página informa os termos localizados do INPE e a ausência de licença expressa identificada.

Continuam na auditoria as pendências de termos específicos INPE, fonte CBMSC, afirmação nacional de predominância humana, formulação sobre autorização para uso do fogo e disponibilidade municipal do 199. Os arquivos brutos originais da malha continuam ausentes da árvore atual. A integração da página não regulariza essas questões nem as apresenta como resolvidas.

## Ajuste do crédito das imagens — 26/10/2026

Miguel Zager Gobbo confirmou que todas as imagens fornecidas por ele foram criadas por ele com auxílio de IA. As pendências da referência do rodapé e da marca/favicon foram encerradas com base nessa declaração. O crédito público passou a ser “Imagens e ilustrações artísticas criadas para o projeto por Miguel Zager Gobbo.” O bloco separado da paisagem do rodapé e o aviso de autoria/autorização pendente foram removidos. A menção à ferramenta permanece apenas nos registros técnicos internos. Nenhuma licença pública nova foi atribuída, e as referências a dados e cartografia de terceiros foram preservadas. Ajuste realizado na `main`.

O teste editorial existente foi atualizado para exigir o crédito único e a ausência da menção à IA e do aviso anterior. Antes da alteração de produção, falhou pela ausência do crédito aprovado. Após o ajuste, `npm test -- tests/fontes.spec.js --reporter=line` passou nos **13 testes**, incluindo navegação, escala responsiva, texto ampliado e acessibilidade automatizada. A suíte completa e os importadores não foram repetidos nesta revisão de texto.

## Verificação executada

- Dois testes iniciais falharam pelas razões esperadas: `/fontes.html` retornava 404 e não existia link interativo no rodapé.
- `npm test -- tests/fontes.spec.js --reporter=line`: **13 passaram**.
- `npm test -- --reporter=line`: **226 passaram**, Chromium.
- `npm run check`: sintaxe JavaScript e **21 testes Python passaram**. As mensagens de fontes/arquivos incompletos pertencem aos cenários negativos dos importadores.
- Revisão independente somente leitura de diff, página e testes: sem achados acionáveis.

Uma primeira execução após a edição ainda usava um processo antigo do servidor, cuja lista de rotas não incluía Fontes. O processo foi identificado pelo PID, porta 4173 e comando `node scripts/dev-server.mjs`; após reinício com a lista atualizada, os testes passaram. Não houve modificação do comportamento para mascarar a falha.

Os testes cobrem os seis rodapés idênticos, navbar, destino real, subdiretório, retorno ao topo, teclado, foco visível, menu móvel sem JavaScript, ausência de URLs duplicadas/candidatas indevidas, recortes e condições de dados e regras de acessibilidade axe WCAG A/AA 2.0, 2.1 e 2.2. Verificam a igualdade da escala computada com Sobre nos oito tamanhos de janela existentes, com texto a 100% e 200%, links com pelo menos 44px e ausência de overflow ou cortes.

Capturas da abertura, dados e créditos foram inspecionadas em 320px e 1440px, incluindo dados com texto a 200%. A mesma janela foi redimensionada sem recarregar: em 1920×1080, H1 44px/corpo 20px; em 1280×500, H1 30px/corpo 16px; em 390×844, H1 28px/corpo 16px. Sem overflow horizontal. Capturas e medições ficam em `test-results/fontes-visual/`, ignorado pelo Git.

## Limites

Os links foram selecionados a partir da verificação da auditoria anterior desta sessão; os testes da página não acessam a rede para revalidar cada fonte. Não foram refeitas importações integrais de dados nem chamadas telefônicas. Fonte raiz a 200% e reflow são distintos do zoom nativo, que não foi verificado. Leitores de tela reais, dispositivos físicos, Firefox e Safari não foram testados. Os resultados automatizados e visuais não constituem certificação integral de acessibilidade. A página está disponível localmente; não houve publicação externa.
