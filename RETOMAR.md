# Cockpit futuro: retomar (parado em 13/11/2026)

Cópia do `cockpit-prototipo` (branch `produto/cockpit-v1-2-comandos-icones` + alterações não commitadas de 11/11) para a
apresentação do futuro do Cockpit. Só a versão **Geral** existe aqui (seletor de versões desligado em `versoes.js`).
Servidor: `powershell -ExecutionPolicy Bypass -File .\_serve.ps1` → http://localhost:8757/
GitHub (conta Data, SSH): `git@github-pessoal:Guery-Rodrigues-Data/CockpitFuturo.git`, branch `main`.

## O que foi feito

- **Cabeçalho do Figma em todos os widgets** (pontinhos, título Roboto 14, X). Botão de configuração removido de todos
  (`config: false` em `widgetMarkup`, app.js): a configuração dos cards ficou inacessível.
- **Família visual** (Roboto, cinzas do Figma, listas com divisória, pé fixo): `assets/widgets-futuro.css`.
- **Estação Pluviométrica**: valores exatos do Figma (nó 38:2400).
- **Resumo do Waze** (antes "Trânsito e ocorrências"): frame 38:2585; pé fixo; lista de trechos cresce com a altura do card.
- **Alertas** (Totais): número sobre o branco, barra empilhada de severidade, lista "mais graves" com faixa lateral.
- **Resumo, Dispositivos, Subáreas e Corredores, Notificações**: mesma família (barras empilhadas, legendas).
- **Câmeras**: carrossel 3D (coverflow) do top 10 por ocupação, ranking à esquerda, ocupação com barra grossa.
- **Lentidão** (novo, `assets/widget-lentidao.js/.css`): Hoje x Média 90 dias (km), top 10 vias girando a cada 8 s,
  lista à esquerda em card largo.

## 13/11/2026

- Repositório publicado no GitHub (link acima). `Dados/` fica fora pelo `.gitignore` (capturas reais do legado).
- **Tela inicial nova** (preset `inicial` em `assets/app.js`, capturada com `cockpitDump()`): esquerda Notificações,
  Estação Pluviométrica e Waze; centro Mapa com Lentidão (Av. Sete de Setembro) embaixo; direita Câmeras, totais de
  Dispositivos, totais de Alertas e lista de Alertas. Só aparece no primeiro acesso do navegador; quem já tem layout
  salvo carrega pelo menu de telas de exemplo ("Tela inicial") ou abre em aba anônima.
- **Vercel**: site fechado por Basic Auth (`middleware.js`). Variáveis em Settings > Environment Variables:
  `SITE_USUARIO` (login) e `SITE_SENHA` (senha), nos três ambientes. Cadastradas depois do deploy: precisa Redeploy.
  Sem as duas, o site responde "Acesso restrito." para todo mundo.

### Visão executiva e Painel TV (branch `telas-executiva-tv`, ainda não está no `main`)

Análise pensando no diretor de operações: o Cockpit respondia "o que está quebrado", mas não dava uma leitura única
da cidade nem cruzava as fontes. Entraram dois widgets e duas telas prontas.

- **Situação da cidade** (`assets/widgets-executivo.js/.css`): estado geral (normal / atenção / crítico) + 5
  indicadores. Semáforos comunicando, alertas críticos e altos e cruzamentos apagados ou piscando vêm do LiveState;
  lentidão e chuva são ilustrativos. O cabeçalho do card só aparece ao passar o mouse.
- **Prioridades agora**: lista única que cruza alertas dos dispositivos, trânsito (Waze) e chuva, em ordem de
  gravidade; dispositivo em via com lentidão sobe na lista. Clique leva ao mapa.
- **Telas prontas** em `cockpits.js`: "Visão executiva" (id `exec`, monitor, 10 linhas) e "Painel TV" (id `tv`,
  12 linhas, relógio na barra). As duas ocupam a altura toda da janela, sem rolagem (`ajustarAlturaDaTela`
  em app.js). Abrem pelo seletor de cockpits ou direto por `?tela=exec` / `?tela=tv`. TV 4K: usar o zoom do navegador.
- **Tema escuro é opcional** (pedido do Guery): botão sol/lua na barra de cima, em qualquer tela; o padrão é claro
  e a escolha fica guardada por tela no navegador. `?tema=escuro` no endereço também liga (ex.: `?tela=tv&tema=escuro`).
- No tema escuro, os widgets novos usam tokens; os que vieram do Figma são invertidos por filtro CSS (atalho de
  protótipo, comentado no fim de `widgets-executivo.css`).
- Conferido por captura de tela (Chrome headless) em 1920x1080 e 1366x768; a tela "Meu cockpit" não mudou.

- **Lentidão: interruptor "Lista"** no cabeçalho do card (13/11): ligado mostra a lista do top 10 e o gráfico,
  desligado só o gráfico. Fica salvo por card (`config.lista`). Em card estreito a lista vai para baixo do gráfico
  (antes sumia). Na Visão executiva o card nasce com a lista desligada.
- **Câmeras: mesmo interruptor "Lista"** (13/11): ligado mostra o carrossel e o ranking de ocupação, desligado só o
  carrossel. Também salvo por card (`config.lista`).

Pendências se virar história (nada disso foi definido pelo negócio, está marcado HIPÓTESE NÃO VALIDADA no código):
cortes de cada indicador (`SIT_CORTES`), regra "a cidade vale o pior indicador", pesos da ordem de prioridade
(`PRI_PESOS`), e o que seria "disponibilidade". Ficou de fora o tempo de resposta (abertos x resolvidos, idade do
alerta): a simulação não guarda quando um alerta fecha.

Os ícones e medidas do Figma foram lidos pelo navegador logado (API `figma` da página), sem gastar crédito do MCP.

## Dados ilustrativos (pendências se virar história)

- Ocupação das câmeras: não existe medição; % e cortes de cor (alta ≥ 85, média ≥ 70) inventados. Falta definir o que é
  "ocupação" e de onde vem.
- Lentidão: métrica do frame é extensão (km); Guery falou em "tempo médio" (pode ser atraso/tempo de travessia).
  Picos por via inventados (5 a 20 km); Av. Comendador Franco e Av. Silva Jardim não vêm do Waze.
- Waze: números do Figma (12, 8, 3, 7, 2); 6 trechos e coordenadas inventados.
- Offline sem severidade no Alertas: vai para o fim da lista (ordem a confirmar).

## Para amanhã

- Terminar o que faltar da apresentação (Guery decide por onde seguir).
- Se a configuração dos cards fizer falta, mostrar o botão só no hover.
- Atenção: a cópia usa o **mesmo Supabase** do original (cadastro de regiões no `?admin` afeta os dois).
