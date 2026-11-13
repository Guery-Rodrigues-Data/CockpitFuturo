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
- Lentidão em card estreito: lista some (alternativa: ir para baixo do gráfico, como nas Câmeras).
- Se a configuração dos cards fizer falta, mostrar o botão só no hover.
- Atenção: a cópia usa o **mesmo Supabase** do original (cadastro de regiões no `?admin` afeta os dois).
