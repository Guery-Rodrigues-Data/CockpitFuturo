/* =====================================================================
   Cockpit — versões de entrega (recorte v1 / v2 / v3)
   Cada recurso do protótipo declara em qual versão ENTRA (`desde`). Versões são cumulativas:
   v2 = tudo da v1 + o que entra na v2; v3 = recorte da terceira entrega (hoje ainda igual à Geral);
   Geral = tudo o que o protótipo tem, para demonstrar e explorar (nada fica de fora).

   HIPÓTESE NÃO VALIDADA: a distribuição abaixo é um rascunho montado das notas do projeto
   (widget-mapa-v1: mapa único, sem configuração, "Requer atenção"; Programação Fase 1 = só leitura,
   comando/escrita depois). Quem define o recorte real é o Produto com o time — é só editar `RECURSOS`.

   Seletor na barra do Cockpit; também aceita ?versao=v1|v1.2|v2|v3|v3.2|v4|teste|geral. A v3.2 é a v3 + Notificações de operação (Fase 3.2); a v4 é a v3.2 + widget Resumo enxuto (Fase 4: modo e status dos controladores). A tela salva (layout) é separada por
   versão (v3 usa a chave original), para trocar de versão não apagar o layout de outra.
   ===================================================================== */
const Versoes = (function () {
  const CHAVE = "cockpitVersaoV3";
  // v1.3 = v1.2 + seção de comandos Plano e ciclo.
  const ROTULOS = { 1: "v1", 1.2: "v1.2", 1.3: "v1.3", 2: "v2", 3: "v3", 4: "v3.2", 5: "v4", 6: "teste", 7: "geral" };
  const NOME_OPCAO = { 1: "v1", 1.2: "v1.2", 1.3: "v1.3", 2: "v2", 3: "v3", 4: "v3.2", 5: "v4", 6: "Teste (câmeras)", 7: "Geral (tudo)" };
  const NIVEL_COMPLETO = 7;
  const nivelDoRotulo = (r) => Number(Object.keys(ROTULOS).find((n) => ROTULOS[n] === r)) || null;

  // id: { desde (nível), grupo, nome }. Ordem = ordem de exibição no painel "O que entra em cada versão".
  const RECURSOS = {
    "mapa": { desde: 1, grupo: "Mapa", nome: "Widget de Mapa (instância única, sem configuração)" },
    "mapa.posicao": { desde: 1, grupo: "Mapa", nome: "Todos os dispositivos plotados por lat/long, iguais e opacos, sem estado (pino neutro); hover da subárea mostra a quantidade de dispositivos" },
    "mapa.busca": { desde: 1, grupo: "Mapa", nome: "Busca por dispositivo, corredor ou subárea" },
    "mapa.legendas": { desde: 1, grupo: "Mapa", nome: "Botão de camadas do mapa (\"Filtros\" com Dispositivos, Subáreas e Corredores; v2 e v3 herdam da v1)" },
    "cockpit.multiplos": { desde: 1, grupo: "Cockpit", nome: "Painel modular (widgets movem e redimensionam) e vários cockpits por usuário (começa com um)" },
    "mapa.selecao": { desde: 1.2, grupo: "Painel do dispositivo", nome: "Clicar no pino seleciona o dispositivo e abre o painel lateral, com abas (qualquer tipo de dispositivo)" },
    "mapa.selecao-regiao": { desde: 3, grupo: "Painel do dispositivo", nome: "Clicar na subárea ou no corredor também abre o painel lateral" },
    "painel.geral": { desde: 1.2, grupo: "Painel do dispositivo", nome: "Aba Geral mínima: dados de cadastro (tipo, fabricante, modelo, subárea, corredor, coordenadas)" },
    "painel.geral-operacao": { desde: 3, grupo: "Painel do dispositivo", nome: "Aba Geral do controlador com Status operacional, Modo de operação e atalho do croqui" },
    "mapa.estado": { desde: 2, grupo: "Mapa", nome: "Estado no pino (offline / alerta ativo)" },
    "mapa.requer-atencao": { desde: 2, grupo: "Mapa", nome: "Mapa estático: mostra tudo, sem seletor de alertas; o estado só aparece ao clicar num grupo do widget Alertas (subáreas mudam de cor pelas falhas)" },
    "modo-controle": { desde: 3, grupo: "Mapa", nome: "Modo de controle do controlador (Centro / Local / Operador): bolinha azul no pino e filtro. Na v2 só se conhecem os alertas." },
    "painel.alertas": { desde: 3, grupo: "Painel do dispositivo", nome: "Aba Alertas" },
    "painel.plano": { desde: 3, grupo: "Painel do dispositivo", nome: "Aba Plano (só leitura: plano em curso e tabela horária)" },
    "widget.resumo": { desde: 5, grupo: "Widgets", nome: "Widget Resumo (Fase 4: contagem de controladores por modo de controle e status; clique recorta o mapa)" },
    "resumo.completo": { desde: 7, grupo: "Widgets", nome: "Resumo completo (protótipo): bloco Estado (Offline e Alarmes), Região com falha, ícone de olho e filtro por tipo de dispositivo" },
    "widget.alertas": { desde: 2, grupo: "Widgets", nome: "Widget Alertas" },
    "alertas.severidade": { desde: 3, grupo: "Widgets", nome: "Alertas: severidade (contagem por severidade, coluna e filtro). Fora da história da Fase 2 por decisão do Guery." },
    "alertas.agrupar-severidade": { desde: 3, grupo: "Widgets", nome: "Alertas: agrupar por severidade" },
    "widget.notificacoes": { desde: 3, grupo: "Widgets", nome: "Widget Notificações (Fase 3: feed do dia com alarme e offline)" },
    "notificacoes.operacao": { desde: 4, grupo: "Widgets", nome: "Notificações: operação (Fase 3.2: modo de controle, status, plano, ciclos e tabela) e filtro por tipo de evento" },
    "widget.cameras": { desde: 6, grupo: "Widgets", nome: "Widget Câmeras (TESTE: mosaico de fotos de exemplo que se atualizam de X em X segundos; clique abre a conexão, simulada)" },
    "widget.pluviometro": { desde: 7, grupo: "Widgets", nome: "Widget Estação Pluviométrica (futuro: dados ilustrativos)" },
    "widget.lentidao": { desde: 7, grupo: "Widgets", nome: "Widget Lentidão (hoje x média 90 dias; futuro: dados ilustrativos)" },
    "widget.waze": { desde: 7, grupo: "Widgets", nome: "Widget Resumo do Waze (futuro: dados ilustrativos)" },
    "widget.dispositivos": { desde: 3, grupo: "Widgets", nome: "Widget Dispositivos" },
    "widget.regioes": { desde: 3, grupo: "Widgets", nome: "Widget Subáreas e Corredores" },
    "filtro-geral": { desde: 3, grupo: "Cockpit", nome: "Filtro geral por tipo de equipamento" },
    "painel.comandos": { desde: 1.2, grupo: "Escrita no controlador", nome: "Aba Comandos: só existe para dispositivo integrado que tem comandos (hoje, controlador Dataprom); sem integração ou sem comandos, a aba não aparece" },
    "mapa.integracao": { desde: 1.2, grupo: "Painel do dispositivo", nome: "Pino com borda verde quando o dispositivo tem integração com o sistema; dispositivo só cadastrado tem ícone próprio do tipo, sem a borda verde" },
    "comandos.grade": { desde: 1.2, grupo: "Escrita no controlador", nome: "Aba Comandos em grade, como a tela de um celular: cada comando é um ícone com o nome embaixo" },
    "comandos.permissao": { desde: 1.2, grupo: "Escrita no controlador", nome: "Comando sem permissão de execução do grupo do usuário aparece desabilitado (no protótipo, simulado pelo seletor de perfil)" },
    "comandos.plano-ciclo": { desde: 1.3, grupo: "Escrita no controlador", nome: "Aba Comandos: seção Plano e ciclo com Alterar Ciclo, Alterar Plano e Modificar Ciclo (v1.3 = v1.2 + esta seção)" },
    "mapa.menu-contexto": { desde: 3, grupo: "Escrita no controlador", nome: "Menu do botão direito (modo, comando, tabela horária)" },
    "plano.ajuste": { desde: 3, grupo: "Escrita no controlador", nome: "Ajustar tempos (plano registrado)" },
  };

  // cockpit-futuro: só existe a versão Geral (as outras foram tiradas desta cópia em 12/11/2026)
  function lerVersao() {
    try { localStorage.setItem(CHAVE, String(NIVEL_COMPLETO)); } catch (e) { /* sem localStorage */ }
    return NIVEL_COMPLETO;
  }
  function lerVersaoAntigo() {
    const pedido = nivelDoRotulo(new URLSearchParams(location.search).get("versao"));
    if (pedido) {
      try { localStorage.setItem(CHAVE, String(pedido)); } catch (e) { /* sem localStorage: vale só nesta carga */ }
      return pedido;
    }
    try {
      const salvo = localStorage.getItem(CHAVE);
      if (salvo && ROTULOS[salvo]) return Number(salvo);
    } catch (e) { /* sem localStorage */ }
    return NIVEL_COMPLETO; // sem escolha: o protótipo completo, como era antes do seletor
  }

  // Simulação de permissão de execução de comando (a real vem do grupo do usuário, história da Permissão de Acesso).
  // Só serve para demonstrar comando habilitado x desabilitado; também aceita ?perfil=todos|consulta|nenhum.
  const PERFIS = { todos: "Todos os comandos", consulta: "Só consulta", nenhum: "Sem permissão de comando" };
  const CHAVE_PERFIL = "cockpitPerfilComandos";
  function lerPerfil() {
    const pedido = new URLSearchParams(location.search).get("perfil");
    if (PERFIS[pedido]) {
      try { localStorage.setItem(CHAVE_PERFIL, pedido); } catch (e) { /* vale só nesta carga */ }
      return pedido;
    }
    try {
      const salvo = localStorage.getItem(CHAVE_PERFIL);
      if (PERFIS[salvo]) return salvo;
    } catch (e) { /* sem localStorage */ }
    return "todos";
  }
  let perfil = lerPerfil();
  // `cmd.grupo === "executar"` = age sobre o controlador; o resto só consulta.
  const comandoPermitido = (cmd) => perfil === "todos" || (perfil === "consulta" && cmd.grupo !== "executar" && cmd.grupo !== "alterar");
  function trocarPerfil(p) {
    if (!PERFIS[p] || p === perfil) return;
    perfil = p;
    try { localStorage.setItem(CHAVE_PERFIL, p); } catch (e) { /* ver lerPerfil */ }
    document.dispatchEvent(new CustomEvent("perfil-comandos"));
  }

  const atual = lerVersao();
  document.documentElement.dataset.versao = atual;

  const tem = (id) => !RECURSOS[id] || RECURSOS[id].desde <= atual;
  const ehV12 = atual === 1.2 || atual === 1.3; // v1.3 herda da v1.2 o que o código testava como "é a v1.2"

  function trocar(n) {
    if (!ROTULOS[n] || n === atual) return;
    try { localStorage.setItem(CHAVE, String(n)); } catch (e) { /* ver lerVersao */ }
    const url = new URL(location.href);
    url.searchParams.set("versao", ROTULOS[n]); // garante mesmo sem localStorage
    location.href = url.toString();
  }

  // Layout salvo por versão; v3 e Geral usam a chave original (o que já estava salvo antes do seletor).
  const chaveLayout = (base) => (atual >= 3 ? base : `${base}-v${ROTULOS[atual]}`);

  function resumoPainel() {
    const grupos = [];
    Object.entries(RECURSOS).forEach(([id, r]) => {
      const alvo = grupos.find((g) => g.nome === r.grupo) || (grupos.push({ nome: r.grupo, itens: [] }), grupos[grupos.length - 1]);
      alvo.itens.push({ ...r, id });
    });
    return `
      <div class="versao-pop-titulo">O que entra em cada versão</div>
      <p class="versao-pop-aviso">Rascunho — hipótese não validada com o time. Versões são cumulativas.</p>
      ${grupos.map((g) => `
        <div class="versao-pop-grupo">${g.nome}</div>
        ${g.itens.map((i) => `<div class="versao-pop-item${i.desde <= atual ? "" : " is-fora"}"><span class="versao-pop-tag" data-v="${i.desde}">${ROTULOS[i.desde]}</span>${i.nome}</div>`).join("")}`).join("")}`;
  }

  // O seletor mora na barra do modo admin (admin.js chama isto com o dock); fora do admin a versão só muda por ?versao=.
  function montarSeletor(alvo, depoisDe) {
    if (!alvo) return;
    const wrap = document.createElement("div");
    wrap.className = "versao-wrap";
    wrap.innerHTML = `
      <select class="versao-select" hidden aria-label="Versão do Cockpit" title="Versão do Cockpit">
        ${Object.entries(ROTULOS).sort((a, b) => a[0] - b[0]).map(([n, r]) => `<option value="${n}"${Number(n) === atual ? " selected" : ""}>${NOME_OPCAO[n] || r}</option>`).join("")}
      </select>
      <button type="button" class="versao-info" hidden data-versao-info title="O que entra em cada versão" aria-label="O que entra em cada versão">i</button>
      ${tem("comandos.permissao") ? `<select class="versao-select" data-perfil aria-label="Perfil de permissão (simulado)" title="Perfil de permissão de comandos (simulado)">
        ${Object.entries(PERFIS).map(([id, rotulo]) => `<option value="${id}"${id === perfil ? " selected" : ""}>${rotulo}</option>`).join("")}
      </select>` : ""}
      <div class="versao-pop" id="versaoPop">${resumoPainel()}</div>`;
    alvo.insertBefore(wrap, depoisDe ? depoisDe.nextSibling : alvo.firstChild);
    wrap.querySelector(".versao-select:not([data-perfil])").addEventListener("change", (e) => trocar(Number(e.target.value)));
    wrap.querySelector("[data-perfil]")?.addEventListener("change", (e) => trocarPerfil(e.target.value));
    wrap.addEventListener("click", (e) => {
      if (e.target.closest("[data-versao-info]")) wrap.querySelector("#versaoPop").classList.toggle("is-open");
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".versao-wrap")) wrap.querySelector("#versaoPop").classList.remove("is-open");
    });
  }

  // Esconde na barra o que a versão não tem (biblioteca de widgets e filtro geral).
  function aplicarNaPagina() {
    document.querySelectorAll('[data-action="add-widget"]').forEach((b) => {
      if (!tem("widget." + b.dataset.type) && b.dataset.type !== "mapa") b.hidden = true;
    });
    if (!tem("filtro-geral")) {
      const f = document.querySelector(".filtro-geral-wrap");
      if (f) f.hidden = true;
    }
    // sem nada na barra de ferramentas (só havia o Filtros geral, da v3), a faixa some e a tela ganha o espaço
    document.body.classList.add("sem-toolbar"); // o Filtros mora no topo, ao lado do seletor de cockpit; a linha de ferramentas não existe mais
  }

  document.addEventListener("DOMContentLoaded", () => {
    aplicarNaPagina();
    if (!tem("resumo.completo")) { // v4: o botão da biblioteca já fala do Resumo de Controladores
      const t = document.getElementById("libTituloResumo");
      const d = document.getElementById("libDescResumo");
      if (t) t.textContent = "Resumo de Controladores";
      if (d) d.textContent = "Quantos controladores estão em cada modo de controle e status.";
    }
  });

  return { atual, ehV12, tem, chaveLayout, trocar, montarSeletor, comandoPermitido, RECURSOS };
})();
