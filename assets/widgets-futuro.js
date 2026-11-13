/* =====================================================================
   Cockpit futuro: widgets de apresentação (frame do Figma "Mapa de dispositivos")
   - Estação Pluviométrica: leitura de uma estação (PLU-01, Centro)
   - Trânsito e ocorrências: resumo do Waze for Cities
   Tudo aqui é DADO ILUSTRATIVO, igual ao frame. Nada vem do Supabase nem do Waze.
   Carregado antes do app.js; o app.js chama pluviometroMarkup / wazeMarkup no renderWidgetBody.
   ===================================================================== */

const ICONS_FUTURO = {
  chuva: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 16a5 5 0 0 1-1-9.9A6 6 0 0 1 18 8a4 4 0 0 1-1 8H8Z"/><path d="M9 19v1M12 19v2M15 19v1"/></svg>',
  transito: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 17h14M6 17l1.5-5.5A2 2 0 0 1 9.4 10h5.2a2 2 0 0 1 1.9 1.5L18 17"/><circle cx="8" cy="17.5" r="1.5"/><circle cx="16" cy="17.5" r="1.5"/><path d="M12 3v3M5.5 5.5l1.8 1.8M18.5 5.5l-1.8 1.8"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  externo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/></svg>',
};

/* ---------- Estação Pluviométrica ---------- */

const PLUVIO_DEMO = {
  estacao: "Centro · PLU-01",
  online: true,
  nivel: "Atenção", // Normal | Atenção | Alerta
  acumulado24h: 32.8,
  ultimaHora: 4.2,
  intensidade: 3.6,
  porHora: [
    { h: "9h", mm: 1.2 }, { h: "10h", mm: 2.8 }, { h: "11h", mm: 5.6 },
    { h: "12h", mm: 3.4 }, { h: "13h", mm: 6.2 }, { h: "14h", mm: 4.2 },
  ],
  ultimaLeitura: "14:32",
};

const fmtMm = (n) => n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// Faixa de cor da barra (frame do Figma): hora atual mais escura; chuva forte (>= 5 mm) escura; o resto clara.
const pluvioFaixa = (mm, atual) => (atual ? "atual" : mm >= 5 ? "forte" : "fraca");

function pluviometroMarkup() {
  const d = PLUVIO_DEMO;
  const max = Math.max(...d.porHora.map((p) => p.mm));
  const barras = d.porHora.map((p, i) => `
        <div class="plv-barra" title="${p.h}: ${fmtMm(p.mm)} mm">
          <span class="plv-barra-valor">${fmtMm(p.mm)}</span>
          <span class="plv-barra-trilho"><i data-faixa="${pluvioFaixa(p.mm, i === d.porHora.length - 1)}" style="height:${Math.max(6, Math.round((p.mm / Math.max(8, max * 1.3)) * 100))}%"></i></span>
          <span class="plv-barra-hora">${p.h}</span>
        </div>`).join("");
  return `
    <div class="plv">
      <div class="plv-estacao">
        <b>${d.estacao}</b>
        <span class="plv-status ${d.online ? "is-online" : "is-offline"}"><i></i>${d.online ? "Online" : "Offline"}</span>
      </div>
      <div class="plv-nivel" data-nivel="${d.nivel}"><span>Nível de atenção</span><span>${d.nivel}</span></div>
      <div class="plv-leituras">
        <div>
          <span class="plv-rotulo">Precipitação em 24 h</span>
          <span class="plv-grande">${fmtMm(d.acumulado24h)}<small>mm</small></span>
        </div>
        <div>
          <span class="plv-rotulo">Última hora</span>
          <span class="plv-medio">${fmtMm(d.ultimaHora)} mm</span>
          <span class="plv-mini">Intensidade&nbsp; ${fmtMm(d.intensidade)} mm/h</span>
        </div>
      </div>
      <div class="plv-grafico">
        <div class="plv-grafico-head"><span>Precipitação por hora</span><em>Últimas 6 h · mm</em></div>
        <div class="plv-barras">${barras}</div>
      </div>
      <div class="plv-rodape"><span>Última leitura: ${d.ultimaLeitura}</span><span>Dados ilustrativos</span></div>
    </div>`;
}

/* ---------- Trânsito e ocorrências (resumo do Waze) ---------- */

const WAZE_DEMO = {
  area: "Curitiba · Área monitorada",
  // números do frame "Widget · Waze · V2 visual" (nó 38:2585)
  alertas: 12,
  lentidao: 8,
  tipos: [
    { id: "acidente", label: "Acidentes", n: 3, icone: "car" },
    { id: "perigo", label: "Perigos", n: 7, icone: "alert" },
    { id: "interdicao", label: "Interdições", n: 2, icone: "barrier" },
  ],
  // os 2 primeiros são do Figma; os outros e todas as coordenadas são ilustrativos (só para o "Ver no mapa")
  trechos: [
    { via: "Av. República Argentina", atraso: 4, kmh: 18, km: 1.4, trecho: [[-25.4588, -49.2895], [-25.4700, -49.2950]] },
    { via: "Av. Marechal Floriano", atraso: 2, kmh: 24, km: 0.8, trecho: [[-25.4420, -49.2700], [-25.4500, -49.2680]] },
    { via: "Av. Sete de Setembro", atraso: 2, kmh: 21, km: 0.9, trecho: [[-25.4418, -49.2790], [-25.4460, -49.2650]] },
    { via: "Av. Visconde de Guarapuava", atraso: 2, kmh: 22, km: 0.7, trecho: [[-25.4400, -49.2830], [-25.4440, -49.2700]] },
    { via: "Linha Verde", atraso: 1, kmh: 32, km: 1.1, trecho: [[-25.4600, -49.2500], [-25.4400, -49.2420]] },
    { via: "Av. Iguaçu", atraso: 1, kmh: 26, km: 0.6, trecho: [[-25.4470, -49.2850], [-25.4500, -49.2700]] },
    { via: "Av. Marechal Deodoro", atraso: 1, kmh: 27, km: 0.5, trecho: [[-25.4300, -49.2720], [-25.4335, -49.2640]] },
    { via: "Rua Desembargador Westphalen", atraso: 1, kmh: 28, km: 0.4, trecho: [[-25.4360, -49.2700], [-25.4440, -49.2690]] },
  ],
  sincronizacao: "14:32",
};

// ícones exportados do Figma (traço em currentColor; a cor vem do bloco)
const WAZE_ICONES = {
  pin: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.05" stroke-linecap="round" stroke-linejoin="round"><path d="M11.08 5.83C11.08 8.75 7.00 12.25 7.00 12.25C7.00 12.25 2.91 8.75 2.91 5.83C2.91 5.29 3.02 4.76 3.22 4.27C3.43 3.77 3.73 3.32 4.11 2.94C4.49 2.56 4.94 2.26 5.43 2.06C5.930 1.85 6.46 1.75 7.00 1.75C7.53 1.75 8.06 1.85 8.56 2.06C9.05 2.26 9.50 2.56 9.88 2.94C10.26 3.32 10.56 3.77 10.77 4.27C10.97 4.76 11.08 5.29 11.08 5.83Z"/><path d="M8.45 5.83C8.45 6.63 7.80 7.29 7.00 7.29C6.19 7.29 5.54 6.63 5.54 5.83C5.54 5.02 6.19 4.37 7.00 4.37C7.80 4.37 8.45 5.02 8.45 5.83Z"/></svg>',
  alert: '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="M10.99 2.75L20.16 19.25H1.83L10.99 2.75Z"/><path d="M11 8.25V12.83M11 15.58H11.00"/></svg>',
  car: '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="M4.58 9.16L6.41 4.58H15.58L17.41 9.16M4.58 9.16H17.41M4.58 9.16V16.50H6.41M4.58 9.16H2.75M17.41 9.16V16.50H15.58M17.41 9.16H19.25M15.58 16.50H6.41M15.58 16.50V18.33M6.41 16.50V18.33M7.33 12.83H7.34M14.66 12.83H14.67"/></svg>',
  barrier: '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="M3.66 6.41H2.75V13.75H5.5M3.66 6.41H9.16M3.66 6.41L10.08 13.75M9.16 6.41H14.66M9.16 6.41L15.58 13.75M14.66 6.41H19.25V11.91M14.66 6.41L19.25 11.91M19.25 11.91V13.75H16.5M16.5 13.75H15.58M16.5 13.75V19.25M15.58 13.75H10.08M10.08 13.75H5.5M5.5 13.75V19.25"/></svg>',
  clock: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 6C10.5 8.48 8.48 10.5 6 10.5C3.51 10.5 1.5 8.48 1.5 6C1.5 3.51 3.51 1.5 6 1.5C8.48 1.5 10.5 3.51 10.5 6Z"/><path d="M6 3.5V6L7.5 7"/></svg>',
};

// ícones oficiais do Waze (arquivos em assets/waze/, exportados do Figma/Waze): pinos com sombra, cor da marca
const WAZE_IMG = {
  acidente: "assets/waze/acidentes.svg",
  perigo: "assets/waze/perigos.svg",
  interdicao: "assets/waze/interdicoes.svg",
  alertas: "assets/waze/alertas.svg",
  lentidao: "assets/waze/lentidao.svg",
};
const wazeImg = (id) => `<img class="wz-ico" src="${WAZE_IMG[id]}" alt="" draggable="false">`;

// quantas ruas cabem depende da altura do card (medida em wazeAjustar); começa em 2, como no Figma
const wazeUi = { inicio: 0, porPagina: 2 };
const fmtKm = (n) => n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function wazeMarkup() {
  const d = WAZE_DEMO;
  const total = d.trechos.length;
  const n = Math.min(wazeUi.porPagina, total);
  if (wazeUi.inicio >= total) wazeUi.inicio = 0;
  const ini = wazeUi.inicio;
  const visiveis = d.trechos.slice(ini, ini + n);
  const trechos = visiveis.map((t, i) => `
        <button type="button" class="wz-trecho" data-fut="waze-ver" data-i="${ini + i}" title="Ver este trecho no mapa">
          <span class="wz-trecho-topo"><b>${t.via}</b><em>+${t.atraso} min</em></span>
          <span class="wz-trecho-pe">${t.kmh} km/h&nbsp;&nbsp; · &nbsp;&nbsp;${fmtKm(t.km)} km de lentidão</span>
        </button>`).join("");
  return `
    <div class="wz">
      <div class="wz-area">${WAZE_ICONES.pin}<b>${d.area}</b></div>
      <div class="wz-resumo">
        <div class="wz-kpi" data-tom="alertas"><div class="wz-kpi-num">${wazeImg("alertas")}<strong>${d.alertas}</strong></div><span>Alertas recebidos</span></div>
        <div class="wz-kpi" data-tom="lentidao"><div class="wz-kpi-num">${wazeImg("lentidao")}<strong>${d.lentidao}</strong></div><span>Trechos com lentidão</span></div>
      </div>
      <div class="wz-tipos">
        ${d.tipos.map((t) => `<div class="wz-tipo" data-tipo="${t.id}"><div class="wz-tipo-qtd">${wazeImg(t.id)}<strong>${t.n}</strong></div><span>${t.label}</span></div>`).join("")}
      </div>
      <hr class="wz-linha">
      <div class="wz-trechos-head">
        <span>Trechos com maior atraso</span>
        <button type="button" class="wz-pagina" data-fut="waze-prox" title="Próximos trechos">${Math.min(ini + n, total)} de ${total}</button>
      </div>
      <div class="wz-trechos">${trechos}</div>
      <div class="wz-acoes">
        <span>Atraso em relação ao fluxo livre</span>
        <button type="button" class="wz-ver" data-fut="waze-ver-todos">Ver no mapa</button>
      </div>
      <div class="wz-fim">
        <hr class="wz-linha wz-linha-forte">
        <div class="wz-rodape">${WAZE_ICONES.clock}<span>Última sincronização</span><span class="wz-hora">${d.sincronizacao}</span></div>
      </div>
    </div>`;
}

let wazeDestaque = null;
function wazeDesenhar(lista) {
  const map = typeof CockpitMap !== "undefined" && CockpitMap.getMap && CockpitMap.getMap();
  if (!lista.length || !map) { if (typeof toast === "function") toast("Adicione o widget de Mapa para ver os trechos."); return; }
  if (wazeDestaque) map.removeLayer(wazeDestaque);
  wazeDestaque = L.featureGroup(lista.map((t) => L.polyline(t.trecho, { color: "#d93630", weight: 7, opacity: 0.85, lineCap: "round" }).bindTooltip(`${t.via} · +${t.atraso} min`))).addTo(map);
  map.fitBounds(wazeDestaque.getBounds(), { padding: [60, 60], maxZoom: 16, animate: true });
  const alvo = wazeDestaque;
  setTimeout(() => { if (wazeDestaque === alvo) { map.removeLayer(alvo); wazeDestaque = null; } }, 10000);
}

function wazeRedesenhar() {
  document.querySelectorAll('.widget-card[data-type="waze"] .widget-body').forEach((b) => { b.innerHTML = wazeMarkup(); });
}

// Quantas linhas de trecho cabem no espaço livre da lista (linha 58 px + 10 px entre elas, do Figma).
const WAZE_LINHA = 58, WAZE_GAP = 10;
function wazeAjustar() {
  const lista = document.querySelector('.widget-card[data-type="waze"] .wz-trechos');
  if (!lista) return;
  const cabem = Math.max(1, Math.floor((lista.clientHeight + WAZE_GAP) / (WAZE_LINHA + WAZE_GAP)));
  if (cabem !== wazeUi.porPagina) { wazeUi.porPagina = cabem; wazeRedesenhar(); }
}
// o card é criado e redimensionado pelo grid: observa o corpo do card do Waze sempre que ele aparece
const wazeObs = new ResizeObserver(() => wazeAjustar());
new MutationObserver(() => {
  const body = document.querySelector('.widget-card[data-type="waze"] .widget-body');
  if (body && !body.dataset.observado) { body.dataset.observado = "1"; wazeObs.observe(body); }
}).observe(document.documentElement, { childList: true, subtree: true });

document.addEventListener("click", (ev) => {
  const el = ev.target.closest("[data-fut]");
  if (!el) return;
  const acao = el.dataset.fut;
  if (acao === "waze-ver") wazeDesenhar([WAZE_DEMO.trechos[Number(el.dataset.i)]]);
  else if (acao === "waze-ver-todos") wazeDesenhar(WAZE_DEMO.trechos);
  else if (acao === "waze-prox") { // "2 de 8": cada clique mostra os próximos 2 e volta ao início no fim
    wazeUi.inicio += wazeUi.porPagina;
    if (wazeUi.inicio >= WAZE_DEMO.trechos.length) wazeUi.inicio = 0;
    wazeRedesenhar();
  }
});

/* ---------- cabeçalho no padrão do Figma (Head 38:2401): pontinhos de arrastar, título, Filtros e X sempre visíveis ----------
   Pontinhos: SVG exportado do Figma (14x17, traço #A3A3A3). Filtros e X: redesenhados a partir do print (o arquivo teve os
   ícones trocados depois), traço 1.5 #6E6E6E, 10 px dentro de botão 20x20. */
const FIGMA_HEAD = {
  grip: '<svg width="14" height="17" viewBox="0 0 14 17" fill="none" stroke="#A3A3A3" stroke-linecap="round" stroke-linejoin="round"><path d="M9.49 12.00C9.22 12.00 8.99 12.23 9.00 12.50C9.00 12.78 9.22 13.00 9.50 13.00C9.77 13.00 10.00 12.78 10.00 12.50C10.00 12.23 9.77 12.00 9.49 12.00ZM9.49 8.00C9.22 8.00 8.99 8.22 9.00 8.50C9.00 8.77 9.22 9.00 9.50 9.00C9.77 9.00 10.00 8.77 10.00 8.50C10.00 8.22 9.77 8.00 9.49 8.00ZM9.49 4C9.22 4 8.99 4.22 9.00 4.50C9.00 4.77 9.22 5.00 9.50 5.00C9.77 5.00 10.00 4.77 10.00 4.50C10.00 4.22 9.77 4 9.49 4Z"/><path d="M4.49 12.00C4.22 12.00 3.99 12.23 4.00 12.50C4.00 12.78 4.22 13.00 4.50 13.00C4.77 13.00 5.00 12.78 5.00 12.50C5.00 12.23 4.77 12.00 4.49 12.00ZM4.49 8.00C4.22 8.00 3.99 8.22 4.00 8.50C4.00 8.77 4.22 9.00 4.50 9.00C4.77 9.00 5.00 8.77 5.00 8.50C5.00 8.22 4.77 8.00 4.49 8.00ZM4.49 4C4.22 4 3.99 4.22 4.00 4.50C4.00 4.77 4.22 5.00 4.50 5.00C4.77 5.00 5.00 4.77 5.00 4.50C5.00 4.22 4.77 4 4.49 4Z"/></svg>',
  filtros: '<svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="#6E6E6E" stroke-width="1.5" stroke-linecap="round"><path d="M1 2.5h9M1 5.5h9M1 8.5h9"/><circle cx="3.5" cy="2.5" r="1.1" fill="#fff"/><circle cx="7.5" cy="5.5" r="1.1" fill="#fff"/><circle cx="4.5" cy="8.5" r="1.1" fill="#fff"/></svg>',
  excluir: '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#6E6E6E" stroke-width="1.5" stroke-linecap="round"><path d="M1 1l8 8M9 1L1 9"/></svg>',
};

function cabecalhoFigmaMarkup(inst, titulo, { config = false, extra = "" } = {}) {
  return `
      <div class="widget-header fig-head">
        <span class="widget-drag fig-grip" aria-hidden="true" title="Arraste para mover">${FIGMA_HEAD.grip}</span>
        <div class="widget-title">${titulo}</div>
        <div class="fig-menu">
          ${extra}
          ${config ? `<button type="button" class="fig-btn" data-action="widget-config-open" data-id="${inst.id}" title="Configurar card" aria-label="Configurar card">${FIGMA_HEAD.filtros}</button>` : ""}
          <button type="button" class="fig-btn" data-action="widget-remove" data-id="${inst.id}" title="Remover widget" aria-label="Remover widget">${FIGMA_HEAD.excluir}</button>
        </div>
      </div>`;
}


/* =====================================================================
   Widget de Alertas no padrão visual do Waze (mesmas cores, blocos e linhas cinza do frame 38:2585).
   Só troca a aparência do modo Totais: os cliques continuam usando as ações do app.js
   (totais-clicar recorta o mapa; lista-row abre o dispositivo; severidade recorta pelo grupo).
   ===================================================================== */
const ALERTA_SEV = {
  "Crítico": { tom: "critico", icone: "alert" },
  "Alto": { tom: "alto", icone: "alert" },
  "Médio": { tom: "medio", icone: "alert" },
  "Baixo": { tom: "baixo", icone: "alert" },
};
const ICONE_DISPOSITIVO = '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2.75" width="8" height="16.5" rx="2.5"/><circle cx="11" cy="7" r="1.4"/><circle cx="11" cy="11" r="1.4"/><circle cx="11" cy="15" r="1.4"/></svg>';

// Modo Totais do card de Alertas, no padrão do Figma (13/11/2026): número grande à esquerda e, à direita, as
// severidades com barra e contagem. Sai a lista "Alertas mais graves" deste modo (continua no modo Lista).
const AL2_COR = { critico: "#E3323B", alto: "#ED9C08", medio: "#387BC4", baixo: "#9CA3AF", offline: "#434951" };
// Modo Totais do card de Alertas (Figma, 13/11/2026): número grande à esquerda e, à direita, os tipos de alarme
// mais frequentes (Lâmpada queimada, Comunicação...) com barra e contagem. Offline entra como "Sem comunicação".
// Sai a lista "Alertas mais graves" deste modo (continua no modo Lista).
const AL2_CORES = ["#E3323B", "#ED9C08", "#387BC4", "#9CA3AF", "#434951"];
const AL2_TIPOS_MAX = 5;
function alertaTipoRotulo(a) {
  if (a.offline) return "Sem comunicação";
  if (a.tipoAlarme && ALARMES_CATALOGO[a.tipoAlarme]) return ALARMES_CATALOGO[a.tipoAlarme].nome;
  return a.descricao;
}
function alertasTotaisFigma(inst) {
  const lista = alertasFiltrados(inst.config.filtros);
  const afetados = new Set(lista.map((a) => a.equipamentoId)).size;
  const sel = totaisSel(inst);
  const cont = new Map();
  lista.forEach((a) => { const k = alertaTipoRotulo(a); cont.set(k, (cont.get(k) || 0) + 1); });
  const tipos = [...cont.entries()].sort((x, y) => y[1] - x[1]).slice(0, AL2_TIPOS_MAX);
  const maior = Math.max(1, ...tipos.map((t) => t[1]));
  const linhas = tipos.map(([rotulo, n], i) => `
          <div class="al2-sev" style="--c:${AL2_CORES[i % AL2_CORES.length]}" title="${rotulo}: ${n}">
            <div class="al2-sev-topo"><span class="al2-sev-rot">${rotulo}</span><b>${n}</b></div>
            <span class="al2-sev-trilho"><i style="width:${((n / maior) * 100).toFixed(1)}%"></i></span>
          </div>`).join("");
  return `
    <div class="al2">
      <div class="al2-main">
        <div class="al2-resumo">
          <button type="button" class="al2-total${sel}" data-action="totais-clicar" data-id="${inst.id}" aria-pressed="${sel ? "true" : "false"}" title="Mostrar no mapa os dispositivos com alerta">
            <strong>${lista.length}</strong><span>Alertas ativos</span>
          </button>
          <em>${afetados} dispositivos afetados</em>
        </div>
        ${tipos.length ? `<span class="al2-sep" aria-hidden="true"></span><div class="al2-dist">${linhas}</div>` : ""}
      </div>
      <div class="al2-rodape">
        <span>Última leitura: ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
        <button type="button" class="al2-ver" data-action="totais-clicar" data-id="${inst.id}">Ver no mapa</button>
      </div>
    </div>`;
}

// Esconde as linhas que não cabem inteiras e atualiza o "N de T" (mesma ideia do Waze: card mais alto = mais linhas).
function ajustarListasAlertas() {
  document.querySelectorAll(".al-lista").forEach((box) => {
    const itens = [...box.querySelectorAll(".al-linha")];
    itens.forEach((el) => { el.hidden = false; });
    const card = box.closest(".al");
    // sem lista na tela, o título "Alertas mais graves" + linha (33 px) voltam junto com a 1ª linha: desconta antes para não piscar
    const limite = box.clientHeight - (card.classList.contains("sem-lista") ? 33 : 0);
    let visiveis = 0;
    itens.forEach((el) => {
      const cabe = el.offsetTop - box.offsetTop + el.offsetHeight <= limite + 0.5;
      el.hidden = !cabe;
      if (cabe) visiveis++;
    });
    card.classList.toggle("sem-lista", itens.length > 0 && visiveis === 0);
    const rot = box.parentElement.querySelector(".al-contagem");
    if (rot) rot.textContent = itens.length ? `${visiveis} de ${box.dataset.total}` : "";
  });
}
let alertasAjusteAgendado = false;
const agendarAjusteAlertas = () => {
  if (alertasAjusteAgendado) return;
  alertasAjusteAgendado = true;
  requestAnimationFrame(() => { alertasAjusteAgendado = false; ajustarListasAlertas(); });
};
const alertasObs = new ResizeObserver(agendarAjusteAlertas);
new MutationObserver(() => {
  document.querySelectorAll('.widget-card[data-type="alertas"] .widget-body').forEach((b) => {
    if (!b.dataset.observado) { b.dataset.observado = "1"; alertasObs.observe(b); }
  });
  if (document.querySelector(".al-lista")) agendarAjusteAlertas();
}).observe(document.documentElement, { childList: true, subtree: true });

document.addEventListener("click", (ev) => {
  const el = ev.target.closest('[data-fut="alertas-sev"]');
  if (!el) return;
  if (!CockpitBus.mapaAtivo()) { toast("Adicione um widget de Mapa nesta tela para filtrar o mapa."); return; }
  const chave = el.dataset.chave;
  aplicarRecorteAlertas(recorteAlertasAtivo(el.dataset.id, chave) ? null : { instId: el.dataset.id, chave, agrupar: "severidade" });
});

/* =====================================================================
   Resumo na mesma família visual do Alertas: Roboto, títulos sem caixa-alta, swatch quadrado,
   linhas com divisória e uma barra empilhada nas tabelas cujas linhas somam o total
   (Modo de controle e Status: cada controlador está em exatamente um). Só aparência:
   os cliques (filtro e olho) continuam no app.js.
   ===================================================================== */
const RESUMO_GRUPOS_COM_BARRA = ["modo", "status"];
function corDoSwatch(sw) {
  const cs = getComputedStyle(sw);
  const bg = cs.backgroundColor;
  return bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent" ? bg : cs.borderTopColor;
}
function barrasDoResumo() {
  document.querySelectorAll('.widget-card[data-type="resumo"] table.resumo-lista').forEach((tab) => {
    const linhas = [...tab.querySelectorAll("tbody tr[data-grupo]")];
    if (!linhas.length || !RESUMO_GRUPOS_COM_BARRA.includes(linhas[0].dataset.grupo)) return;
    const partes = linhas.map((tr) => ({
      n: Number(tr.querySelector(".reg-total b")?.textContent || 0),
      cor: tr.querySelector(".resumo-swatch") ? corDoSwatch(tr.querySelector(".resumo-swatch")) : "#a3a9b4",
      rotulo: tr.querySelector(".reg-texto")?.textContent || "",
    }));
    const total = partes.reduce((s, p) => s + p.n, 0);
    const html = total ? partes.filter((p) => p.n).map((p) => `<i style="flex-grow:${p.n / total};background:${p.cor}" title="${p.rotulo}: ${p.n}"></i>`).join("") : "";
    let tr = tab.querySelector("tr.rs-barra-tr");
    if (!tr) {
      tr = document.createElement("tr");
      tr.className = "rs-barra-tr";
      tr.innerHTML = '<td colspan="2"><div class="al-barra rs-barra"></div></td>';
      tab.tBodies[0].prepend(tr);
    }
    const barra = tr.querySelector(".rs-barra");
    if (barra.innerHTML !== html) barra.innerHTML = html;
  });
}
let resumoAgendado = false;
new MutationObserver(() => {
  if (resumoAgendado || !document.querySelector('.widget-card[data-type="resumo"] .resumo-lista')) return;
  resumoAgendado = true;
  requestAnimationFrame(() => { resumoAgendado = false; barrasDoResumo(); });
}).observe(document.documentElement, { childList: true, subtree: true });

/* =====================================================================
   Totais de Dispositivos e de Subáreas e Corredores na mesma família do Alertas:
   número sobre o branco (clique = recorte no mapa, ação totais-clicar do app.js),
   barra empilhada + legenda e pé fixo com o resumo do filtro.
   ===================================================================== */
const TONS_TIPO = ["#364458", "#5a6f8d", "#85a1c8", "#b4c3dc", "#8a93a0", "#cfd4db", "#5d6b7a", "#a3a9b4"];

function totaisFamiliaMarkup(inst, { numero, rotulo, lado = "", faixas, pe }) {
  const sel = totaisSel(inst);
  const total = faixas.reduce((t, f) => t + f.n, 0) || 1;
  return `
    <div class="wz al tf">
      <div class="al-topo">
        <button type="button" class="al-total${sel}" data-action="totais-clicar" data-id="${inst.id}" aria-pressed="${sel ? "true" : "false"}" title="Mostrar no mapa">
          <strong>${numero}</strong><span>${rotulo}</span>
        </button>
        ${lado}
      </div>
      ${faixas.length ? `<div class="al-barra">${faixas.filter((f) => f.n).map((f) => `<i style="flex-grow:${f.n / total};background:${f.cor}" title="${f.rotulo}: ${f.n}"></i>`).join("")}</div>
      <div class="al-legenda">${faixas.map((f) => `<span class="al-leg"><i style="background:${f.cor}"></i>${f.rotulo}<b>${f.n}</b></span>`).join("")}</div>` : ""}
      <div class="wz-fim">
        <hr class="wz-linha wz-linha-forte">
        <div class="wz-rodape al-rodape"><span title="${resumoFiltroTitle(inst)}">${resumoFiltroCard(inst)}</span>${pe || ""}</div>
      </div>
    </div>`;
}

function dispositivosTotaisFigma(inst) {
  const lista = equipamentosFiltrados(inst.config.filtros);
  const offline = lista.filter((e) => !e.online).length;
  const faixas = CATEGORIAS_EQUIPAMENTO
    .map((c, i) => ({ rotulo: c.label, n: lista.filter((e) => e.tipo === c.id).length, cor: TONS_TIPO[i % TONS_TIPO.length] }))
    .filter((f) => f.n);
  return totaisFamiliaMarkup(inst, {
    numero: lista.length,
    rotulo: "Dispositivos",
    lado: `<div class="al-afetados"><strong>${offline}</strong><span>Sem<br>comunicação</span></div>`,
    faixas,
  });
}

function regioesTotaisFigma(inst) {
  const ids = inst.config.filtros.regioes;
  const nSub = SUBAREAS.filter((s) => ids.includes(s.id)).length;
  const nCor = CORREDORES.filter((c) => ids.includes(c.id)).length;
  return totaisFamiliaMarkup(inst, {
    numero: nSub + nCor,
    rotulo: "Regiões cadastradas",
    faixas: [{ rotulo: "Subáreas", n: nSub, cor: "#5a6f8d" }, { rotulo: "Corredores", n: nCor, cor: "#b4c3dc" }],
  });
}

/* =====================================================================
   Câmeras em carrossel (ideia do chefe do Guery, 12/11/2026): a câmera com maior ocupação na frente,
   as próximas do ranking girando atrás. Embaixo, os dados da câmera da frente.
   DADOS ILUSTRATIVOS: não existe medição de ocupação por câmera; os percentuais e o ranking são inventados
   para a apresentação. Nomes e imagens vêm do mock de câmeras que já existia (cameraDados no app.js).
   Clicar na câmera da frente abre a conexão (mesma janela do widget antigo: data-action="camera-abrir").
   ===================================================================== */
const CARROSSEL_CAMS = [12, 47, 3, 210, 88, 5, 130, 61, 9, 300]; // índices do mock de câmeras
const CARROSSEL_OCUPACAO = [92, 88, 85, 81, 77, 74, 70, 66, 63, 58]; // % ilustrativo, já em ordem
const CARROSSEL_GIRO_S = 7;
const carUi = { atual: 0, proxGiro: Date.now() + CARROSSEL_GIRO_S * 1000 };
// faixas de cor só para leitura rápida no protótipo (HIPÓTESE NÃO VALIDADA: não há limite definido)
const nivelOcupacao = (p) => (p >= 85 ? "alta" : p >= 70 ? "media" : "normal");

function carrosselItens() {
  return CARROSSEL_CAMS.map((c, i) => ({ ...cameraDados(c), ocupacao: CARROSSEL_OCUPACAO[i], pos: i + 1 }));
}
// posição relativa ao atual: 0 = frente, ±1 = vizinhas, ±2 = fundo, resto escondido
function carrosselPos(i, atual, n) {
  let d = (i - atual + n) % n;
  if (d > n / 2) d -= n;
  return Math.abs(d) <= 2 ? String(d) : "fora";
}

// Interruptor "Lista" do cabeçalho do card (mesmo do widget Lentidão): ligado = carrossel + ranking de ocupação;
// desligado = só o carrossel. Fica salvo na instância (config.lista); card salvo antes de o interruptor existir vale ligado.
const camerasComLista = (inst) => !!inst && inst.config.lista === true; // 13/11: padrão desligado, a câmera fica grande; quem quiser o ranking liga o interruptor
function camerasSwitchMarkup(inst) {
  return `<button type="button" class="lt-switch" data-fut="car-lista" data-id="${inst.id}" role="switch" aria-checked="${camerasComLista(inst)}" title="Mostrar ou esconder o ranking de ocupação">
      <span class="lt-switch-trilho"><i></i></span>Lista
    </button>`;
}

// Widget Câmeras no padrão do Figma (13/11/2026): identificação, situação, palco com as câmeras ao lado,
// três indicadores, controles de navegação e rodapé. Sem setas nem pontinhos em cima da imagem.
// Câmeras (13/11/2026, pedido do Guery): uma câmera grande, sem rodízio nem setas. A escolha é feita pelo ranking
// (quando o interruptor "Lista" está ligado). A câmera de maior ocupação é a que abre por padrão.
// interior da foto: imagem cheia, ranking no canto e identificação sobre a imagem (embaixo)
function camFotoInner(d) {
  return `<img src="${d.img}" alt="" draggable="false">
          <span class="car-rank">#${d.pos}</span>
          <div class="car-sobre"><b title="${d.nome}">${d.nome}</b><span>CAM ${String(d.n).padStart(4, "0")}</span></div>`;
}

// Câmeras (13/11/2026, pedido do Guery): uma câmera grande (cerca de 80% do card), sem rodízio nem setas.
// Identificação sobre a imagem; ocupação embaixo. A escolha é feita pelo ranking (interruptor "Lista").
function camerasCarrosselMarkup(inst) {
  const itens = carrosselItens();
  const n = itens.length;
  const d = itens[carUi.atual];
  return `
    <div class="car${camerasComLista(inst) ? "" : " sem-lista"}">
     <div class="car-corpo">
      <div class="car-principal">
        <div class="car-foto" data-action="camera-abrir" data-cam="${d.n}" data-nome="${d.nome}" data-img="${d.img}" role="button" tabindex="0" title="Abrir conexão com a câmera">${camFotoInner(d)}</div>
        <div class="car-dados">${carrosselDadosMarkup(d, n)}</div>
      </div>
      <div class="car-ranking">
        <div class="car-ranking-head"><span>Ranking de ocupação</span><span>%</span></div>
        <ol>${itens.map((x, i) => `
          <li><button type="button" class="car-rk${i === carUi.atual ? " is-atual" : ""}" data-fut="car-ir" data-i="${i}" data-nivel="${nivelOcupacao(x.ocupacao)}" title="Ver esta câmera">
            <span class="car-rk-pos">${x.pos}</span>
            <span class="car-rk-nome" title="${x.nome}">${x.nome}</span>
            <span class="car-rk-barra"><i style="width:${x.ocupacao}%"></i></span>
            <b>${x.ocupacao}</b>
          </button></li>`).join("")}
        </ol>
      </div>
     </div>
      <div class="wz-fim">
        <hr class="wz-linha wz-linha-forte">
        <div class="wz-rodape"><span>Leitura: ${camHora()}</span><span>Priorização automática · dados ilustrativos</span></div>
      </div>
    </div>`;
}

// bloco de baixo do card (Figma): identificação, situação, indicadores e controles de navegação
// bloco de baixo do card: identificação, situação e indicadores (sem controles de navegação)
// faixa de baixo: ocupação em destaque e, ao lado, posição no ranking, hora da última imagem e o link para ampliar
function carrosselDadosMarkup(d, n) {
  const niv = nivelOcupacao(d.ocupacao);
  const rotulo = { alta: "Ocupação crítica", media: "Ocupação alta", normal: "Ocupação normal" }[niv];
  return `
    <div class="car-base">
      <div class="car-pct" data-nivel="${niv}"><strong>${d.ocupacao}<small>%</small></strong><span>${rotulo}${d.pos === 1 ? " · câmera priorizada" : ""}</span></div>
      <div class="car-base-lado">
        <span>Última imagem ${camHora().slice(0, 8)}</span>
        <button type="button" class="car-ampliar" data-fut="car-ampliar">Ampliar câmera</button>
      </div>
    </div>`;
}

// gira trocando só o data-pos (a transição do CSS anima) e reescreve os dados de baixo
// troca a câmera em destaque (pelo ranking). Sem rodízio automático.
function carrosselIr(i) {
  const n = CARROSSEL_CAMS.length;
  carUi.atual = ((i % n) + n) % n;
  const itens = carrosselItens();
  const d = itens[carUi.atual];
  document.querySelectorAll(".car").forEach((car) => {
    const foto = car.querySelector(".car-foto");
    if (foto) {
      foto.dataset.cam = d.n;
      foto.dataset.nome = d.nome;
      foto.dataset.img = d.img;
      foto.innerHTML = camFotoInner(d);
    }
    car.querySelector(".car-dados").innerHTML = carrosselDadosMarkup(d, n);
    car.querySelectorAll(".car-rk").forEach((b, k) => b.classList.toggle("is-atual", k === carUi.atual));
  });
}


document.addEventListener("click", (ev) => {
  const el = ev.target.closest('[data-fut^="car-"]');
  if (!el) return;
  ev.stopPropagation();
  const acao = el.dataset.fut;
  if (acao === "car-ant") carrosselIr(carUi.atual - 1);
  else if (acao === "car-prox") carrosselIr(carUi.atual + 1);
  else if (acao === "car-ir") carrosselIr(Number(el.dataset.i));
  else if (acao === "car-ampliar") { // abre a mesma conexão que clicar na câmera da frente
    const frente = document.querySelector(".car-foto");
    if (frente) abrirCamera(frente);
  }
  else if (acao === "car-lista") {
    const inst = instances.find((i) => i.id === el.dataset.id);
    if (!inst) return;
    inst.config.lista = !camerasComLista(inst);
    saveLayout();
    el.setAttribute("aria-checked", String(inst.config.lista));
    renderWidgetBody(inst.id);
  }
}, true);
