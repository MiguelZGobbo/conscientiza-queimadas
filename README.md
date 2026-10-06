# Conscientiza Queimadas

Site educativo da Atividade Extensionista III de Engenharia de Software da UNINTER. Esta entrega contém **exclusivamente o Hero da Home e a navbar**.

## Executar

Com Node.js 22 ou superior:

```sh
npm ci
npm run dev
```

Abrir http://127.0.0.1:4173. O servidor é local e destinado ao desenvolvimento. A interface é estática; para hospedagem, servir `index.html` e `src/`. Não é necessário build nem biblioteca em produção.

## Organização

- `index.html`: conteúdo semântico, links e ilustração SVG autoral. A marca Conscientiza Queimadas segue o nome do repositório.
- `src/styles.css`: tokens, layout mobile-first, navbar, enquadramentos da paisagem e animações acessíveis.
- `src/navigation.js`: sincronização acessível do menu nativo e gerenciamento de foco.
- `src/hero-interaction.js`: brilho decorativo, reação da chama próxima e deslocamento curto da fumaça com mouse no desktop.
- `src/smoke.svg`: duas plumas autorais com textura fixa de ruído, deformação e suavidade; carregadas somente no desktop com mouse e movimento permitido.
- `src/favicon.svg`: símbolo autoral da marca sobre fundo verde escuro, registrado como ícone da aba.
- `scripts/dev-server.mjs`: servidor local com módulos nativos do Node.
- `tests/hero.spec.js`: verificação funcional no Chromium.
- `docs/hero-design.md`: decisões e escopo.
- `docs/recursos-e-licencas.md`: autoria e registro de recursos.
- `docs/verificacao-hero.md`: verificações realizadas e limites.

## Destinos futuros

Os `href` do HTML são o ponto de configuração, funcionam sem JavaScript e são relativos ao diretório da Home:

| Elemento | Destino preparado |
| --- | --- |
| Marca / Início | `./` |
| CTA / Dados e impactos | `./dados-e-impactos` |
| Prevenção | `./prevencao` |
| Sobre | `./sobre` |

As três páginas futuras ainda não foram criadas. Seus links retornarão 404 no servidor local até que essas rotas sejam implementadas; ao mudar o destino de Dados e impactos, atualizar tanto o CTA quanto a navbar. Não há placeholders de páginas ou seções abaixo do Hero.

O menu usa `popover`/`popovertarget` nativos do HTML: abre pelo botão, fecha com Esc ou clique fora mesmo com JavaScript desativado ou com falha de carregamento. Em navegadores sem suporte a `:popover-open`, o CSS expõe os links no fluxo como alternativa. O script melhora os rótulos, sincroniza `aria-expanded` e fecha o painel ao sair com Tab. O painel aberto se sobrepõe temporariamente ao conteúdo; ao mover o foco para fora, ele fecha antes de encobrir o CTA focado.

A marca e o título da aba usam **Conscientiza Queimadas**. O CTA mantém seu destino e apresenta somente **Entenda os impactos**, sem seta, com cantos de 10 px e tipografia fluida de 17–18 px no tamanho padrão do navegador. A paisagem autoral tem labaredas de contornos variados e fumaça em camadas; somente no desktop com mouse e sem preferência de movimento reduzido há animações e resposta ao cursor. Ao sair da arte, rolar, redimensionar ou mudar a preferência, a interação é removida. Touch e telas estreitas exibem a cena estática. Não há dependências de produção nem recursos externos.

A fumaça usa um SVG local separado para que o navegador reutilize sua renderização durante o movimento. O filtro fica dentro desse arquivo e seus parâmetros permanecem fixos. A versão simples em SVG inline fica visível durante o carregamento, em caso de falha, sem JavaScript, em touch/mobile ou com movimento reduzido. A textura não é solicitada inicialmente nesses últimos três modos.

Duas camadas compartilham essa textura e sobem em ciclos de 18 e 22 segundos, com fases diferentes, ondulação lateral suave e expansão gradual. A transparência no início e no fim esconde o reinício. A resposta ao mouse fica no grupo externo, independente dos ciclos. Todas as animações continuam restritas a `transform` e `opacity`.

## Verificar

```sh
npx playwright install chromium
npm test
npm run check
```

O Playwright é dependência apenas de desenvolvimento. Os testes sobem o servidor automaticamente quando a porta está disponível. `npm run test:ui` abre a interface de testes.
