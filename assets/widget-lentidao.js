/* =====================================================================
   Widget Lentidão (frame "Widget · Lentidão", adaptação da referência Waze):
   extensão de lentidão (km) ao longo da tarde, Hoje x Média dos últimos 90 dias, para a área toda
   ou para uma via escolhida no próprio card. DADOS ILUSTRATIVOS: o histórico real exige guardar e
   agregar os dados da integração (nota do próprio frame).
   Carregado depois de widgets-futuro.js (usa WAZE_DEMO) e antes do app.js.
   ===================================================================== */
const LENT_HORAS = [14, 14.5, 15, 15.5, 16, 16.5, 17, 17.5, 18, 18.5, 19, 19.5, 20];
const LENT_AREA = {
  media: [9.5, 10.5, 11.5, 12.8, 14.5, 16.5, 19, 21, 22, 21, 18.5, 15.5, 13],
  hoje: [11, 12.5, 14, 15.5, 17.5, 20, 22.5, 24.5, 24.8, 23, 20.5, 17, 14],
};
const ICONE_ESTRADA = '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><path d="M5.6 2.25 2.25 15.75M12.4 2.25l3.35 13.5M9 3v2M9 8v2M9 13v2"/></svg>';

// Top 10: as 8 vias do Resumo do Waze + 2 ilustrativas para fechar dez.
// pico = km de lentidão no pior momento da tarde (ilustrativo, entre ~5 e ~20 km, pedido do Guery)
const LENT_PICO = {
  "Linha Verde": 20, "Av. República Argentina": 18, "Av. Comendador Franco": 15, "Av. Sete de Setembro": 13,
  "Av. Marechal Floriano": 11, "Av. Visconde de Guarapuava": 9.5, "Av. Iguaçu": 8, "Av. Silva Jardim": 6.5,
  "Av. Marechal Deodoro": 5.5, "Rua Desembargador Westphalen": 5,
};
const LENT_VIAS = [
  ...WAZE_DEMO.trechos.map((t) => ({ via: t.via, km: LENT_PICO[t.via] || 5, atraso: t.atraso })),
  { via: "Av. Comendador Franco", km: LENT_PICO["Av. Comendador Franco"], atraso: 3 },
  { via: "Av. Silva Jardim", km: LENT_PICO["Av. Silva Jardim"], atraso: 1 },
];
const LENT_GIRO_S = 8;
const lentUi = {}; // por card: { atual, prox }

// série ilustrativa de uma via: mesma forma da área, na escala da via e com uma variação fixa por nome
function lentidaoSerie(via) {
  if (!via) return LENT_AREA;
  const t = LENT_VIAS.find((x) => x.via === via);
  let seed = [...via].reduce((s, c) => (s * 31 + c.charCodeAt(0)) >>> 0, 7);
  const rnd = () => { seed = (seed * 1103515245 + 12345) >>> 0; return (seed % 1000) / 1000; };
  const escala = (t ? t.km : 5) / Math.max(...LENT_AREA.hoje); // o pico de hoje fica perto do km da via
  const ruido = LENT_HORAS.map(() => 0.9 + rnd() * 0.2);
  return {
    media: LENT_AREA.media.map((v, i) => +(v * escala * 0.92 * ruido[i]).toFixed(2)),
    hoje: LENT_AREA.hoje.map((v, i) => +(v * escala * (t && t.atraso >= 3 ? 1.08 : 1) * ruido[i]).toFixed(2)),
  };
}

const fmt1 = (n) => n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const fmtHora = (h) => `${Math.floor(h)}h${h % 1 ? "30" : ""}`;
function eixoMax(v) { // teto "redondo" do eixo Y, com 4 divisões
  const passo = [0.25, 0.5, 1, 2, 5, 7, 10, 15, 20].find((p) => p * 4 >= v) || Math.ceil(v / 4);
  return passo * 4;
}

// curva suave (Catmull-Rom) em coordenadas 0..100
function caminhoSuave(pts) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
  }
  return d;
}

// quantos pontos de "hoje" já aconteceram (dentro da janela 14h–20h); fora dela, a curva inteira
function lentidaoPontosHoje() {
  const agora = new Date();
  const h = agora.getHours() + agora.getMinutes() / 60;
  return h > LENT_HORAS[0] && h < LENT_HORAS[LENT_HORAS.length - 1] ? LENT_HORAS.filter((x) => x <= h).length : LENT_HORAS.length;
}

function lentidaoTop() {
  const n = lentidaoPontosHoje();
  return LENT_VIAS.map((v) => ({ ...v, serie: lentidaoSerie(v.via) }))
    .sort((a, b) => b.serie.hoje[n - 1] - a.serie.hoje[n - 1]);
}

function lentidaoMarkup(inst) {
  const top = lentidaoTop();
  const ui = lentUi[inst.id] || (lentUi[inst.id] = { atual: 0, prox: Date.now() + LENT_GIRO_S * 1000 });
  ui.atual = ((ui.atual % top.length) + top.length) % top.length;
  const via = top[ui.atual].via;
  const serie = top[ui.atual].serie;
  const nHoje = lentidaoPontosHoje();
  const max = eixoMax(Math.max(...serie.media, ...serie.hoje));
  const x = (i) => (i / (LENT_HORAS.length - 1)) * 100;
  const y = (v) => 100 - (v / max) * 100;
  const pHoje = serie.hoje.slice(0, nHoje).map((v, i) => [x(i), y(v)]);
  const pMedia = serie.media.map((v, i) => [x(i), y(v)]);
  const area = (pts) => `${caminhoSuave(pts)} L${pts[pts.length - 1][0]},100 L${pts[0][0]},100 Z`;
  const ult = pHoje[pHoje.length - 1];
  const dia = new Date().toLocaleDateString("pt-BR", { weekday: "long" });
  const diaFmt = dia.charAt(0).toUpperCase() + dia.slice(1);
  const hojeAgora = serie.hoje[nHoje - 1], mediaAgora = serie.media[nHoje - 1];
  const dif = hojeAgora - mediaAgora;
  const sinal = dif > 0.05 ? "acima" : dif < -0.05 ? "abaixo" : "igual";
  return `
    <div class="lt${lentidaoComLista(inst) ? "" : " sem-lista"}" data-id="${inst.id}" data-via="${via}">
      ${lentidaoComLista(inst) ? lentidaoListaMarkup(inst, top, ui.atual, nHoje) : ""}
      <div class="lt-principal">
      <div class="lt-topo">
        <span class="lt-rank">#${ui.atual + 1}</span>
        <b class="lt-nome-via" title="${via}">${via}</b>
        <span class="lt-setas">
          <button type="button" data-fut="lent-ant" data-id="${inst.id}" aria-label="Via anterior">‹</button>
          <button type="button" data-fut="lent-prox" data-id="${inst.id}" aria-label="Próxima via">›</button>
        </span>
        <span class="lt-chip">${diaFmt}</span>
      </div>
      <div class="lt-pontos" title="Top ${top.length} vias com mais lentidão agora; gira a cada ${LENT_GIRO_S} s">
        <span>Top ${top.length} com mais lentidão</span>
        ${top.map((t, i) => `<button type="button" class="${i === ui.atual ? "is-atual" : ""}" data-fut="lent-ir" data-id="${inst.id}" data-i="${i}" title="#${i + 1} ${t.via}" aria-label="${t.via}"></button>`).join("")}
      </div>
      <div class="lt-resumo">
        <div><span class="lt-rot">Agora</span><b>${fmt1(hojeAgora)} km</b></div>
        <div class="lt-dif" data-sinal="${sinal}">${sinal === "acima" ? "▲" : sinal === "abaixo" ? "▼" : "="} ${fmt1(Math.abs(dif))} km ${sinal === "igual" ? "igual à" : sinal === "acima" ? "acima da" : "abaixo da"} média deste horário</div>
      </div>
      <div class="lt-legenda"><span class="lt-chip" data-serie="hoje">Hoje</span><span class="lt-chip" data-serie="media">Média · últimos 90 dias</span></div>
      <div class="lt-grafico">
        <div class="lt-eixo-y">${[4, 3, 2, 1, 0].map((k) => `<span style="top:${100 - k * 25}%">${(+((max * k) / 4).toFixed(2)).toLocaleString("pt-BR")} km</span>`).join("")}</div>
        <div class="lt-plot">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            ${[0, 25, 50, 75, 100].map((g) => `<line x1="0" x2="100" y1="${g}" y2="${g}" class="lt-grade"/>`).join("")}
            <path d="${area(pMedia)}" class="lt-area-media"/>
            <path d="${caminhoSuave(pMedia)}" class="lt-linha-media"/>
            <path d="${area(pHoje)}" class="lt-area-hoje"/>
            <path d="${caminhoSuave(pHoje)}" class="lt-linha-hoje"/>
          </svg>
          ${nHoje < LENT_HORAS.length ? `<span class="lt-agora-linha" style="left:${ult[0]}%"></span><span class="lt-agora" style="left:${ult[0]}%;top:${ult[1]}%"></span>` : ""}
          <span class="lt-cursor" hidden></span>
          <div class="lt-dica" hidden></div>
        </div>
        <div class="lt-eixo-x">${[14, 15, 16, 17, 18, 19, 20].map((h) => `<span style="left:${x(LENT_HORAS.indexOf(h))}%">${h}h</span>`).join("")}</div>
      </div>
      <div class="lt-nota">Extensão de lentidão (km) · Histórico ilustrativo</div>
      </div>
    </div>`;
}

// Interruptor "Lista" do cabeçalho do card: ligado = lista do top 10 + gráfico; desligado = só o gráfico.
// Fica salvo na instância (config.lista); card salvo antes de o interruptor existir vale ligado.
const lentidaoComLista = (inst) => inst.config.lista !== false;
function lentidaoSwitchMarkup(inst) {
  return `<button type="button" class="lt-switch" data-fut="lent-lista" data-id="${inst.id}" role="switch" aria-checked="${lentidaoComLista(inst)}" title="Mostrar ou esconder a lista das vias">
      <span class="lt-switch-trilho"><i></i></span>Lista
    </button>`;
}

// lista do top 10 (card largo): posição, via, barrinha do km de agora e o km na cor de acima/abaixo da média
function lentidaoListaMarkup(inst, top, atual, n) {
  const maior = Math.max(...top.map((t) => t.serie.hoje[n - 1]));
  return `
      <div class="lt-lista">
        <div class="lt-lista-head"><span>Top ${top.length} com mais lentidão</span><span>agora</span></div>
        <ol>${top.map((t, i) => {
          const km = t.serie.hoje[n - 1], dif = km - t.serie.media[n - 1];
          return `<li><button type="button" class="lt-lv${i === atual ? " is-atual" : ""}" data-fut="lent-ir" data-id="${inst.id}" data-i="${i}" data-sinal="${dif > 0.05 ? "acima" : dif < -0.05 ? "abaixo" : "igual"}" title="${t.via}: ${fmt1(km)} km (${dif >= 0 ? "+" : "−"}${fmt1(Math.abs(dif))} km da média)">
            <span class="lt-lv-pos">${i + 1}</span>
            <span class="lt-lv-nome">${t.via}</span>
            <span class="lt-lv-barra"><i style="width:${(km / maior) * 100}%"></i></span>
            <b>${fmt1(km)} km</b>
          </button></li>`;
        }).join("")}</ol>
      </div>`;
}

// troca de via no próprio card (fica salva na instância)
document.addEventListener("change", (ev) => {
  const sel = ev.target.closest('[data-fut-input="lent-via"]');
  if (!sel) return;
  const inst = instances.find((i) => i.id === sel.dataset.id);
  if (!inst) return;
  inst.config.via = sel.value;
  saveLayout();
  renderWidgetBody(inst.id);
});

// dica ao passar o mouse: hora mais próxima com Hoje e Média
document.addEventListener("mousemove", (ev) => {
  const plot = ev.target.closest && ev.target.closest(".lt-plot");
  document.querySelectorAll(".lt-plot").forEach((p) => {
    if (p !== plot) { p.querySelector(".lt-cursor").hidden = true; p.querySelector(".lt-dica").hidden = true; }
  });
  if (!plot) return;
  const inst = instances.find((i) => i.id === plot.closest(".lt").dataset.id);
  if (!inst) return;
  const r = plot.getBoundingClientRect();
  const i = Math.round(((ev.clientX - r.left) / r.width) * (LENT_HORAS.length - 1));
  if (i < 0 || i >= LENT_HORAS.length) return;
  const serie = lentidaoSerie(plot.closest(".lt").dataset.via || "");
  const temHoje = i < lentidaoPontosHoje();
  const px = (i / (LENT_HORAS.length - 1)) * 100;
  const cur = plot.querySelector(".lt-cursor"), dica = plot.querySelector(".lt-dica");
  cur.hidden = false;
  cur.style.left = px + "%";
  dica.hidden = false;
  dica.style.left = px + "%";
  dica.classList.toggle("is-esq", px > 60);
  dica.innerHTML = `<b>${fmtHora(LENT_HORAS[i])}</b><span data-serie="hoje">Hoje ${temHoje ? fmt1(serie.hoje[i]) + " km" : "–"}</span><span data-serie="media">Média ${fmt1(serie.media[i])} km</span>`;
});

function lentidaoIr(id, i) {
  const ui = lentUi[id] || (lentUi[id] = { atual: 0 });
  ui.atual = i;
  ui.prox = Date.now() + LENT_GIRO_S * 1000;
  renderWidgetBody(id);
}
setInterval(() => {
  document.querySelectorAll(".lt").forEach((lt) => {
    const id = lt.dataset.id, ui = lentUi[id];
    if (!ui) return;
    if (lt.matches(":hover")) { ui.prox = Math.max(ui.prox, Date.now() + 1500); return; }
    if (Date.now() >= ui.prox) lentidaoIr(id, ui.atual + 1);
  });
}, 500);
document.addEventListener("click", (ev) => {
  const el = ev.target.closest('[data-fut^="lent-"]');
  if (!el) return;
  ev.stopPropagation();
  const id = el.dataset.id, ui = lentUi[id] || { atual: 0 };
  if (el.dataset.fut === "lent-ant") lentidaoIr(id, ui.atual - 1);
  else if (el.dataset.fut === "lent-prox") lentidaoIr(id, ui.atual + 1);
  else if (el.dataset.fut === "lent-ir") lentidaoIr(id, Number(el.dataset.i));
  else if (el.dataset.fut === "lent-lista") {
    const inst = instances.find((i) => i.id === id);
    if (!inst) return;
    inst.config.lista = !lentidaoComLista(inst);
    saveLayout();
    el.setAttribute("aria-checked", String(inst.config.lista));
    renderWidgetBody(id);
  }
}, true);
