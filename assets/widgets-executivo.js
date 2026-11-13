/* =====================================================================
   Cockpit futuro: widgets da visão executiva (13/11/2026)
   - Situação da cidade: leitura única da operação (normal / atenção / crítico) + 5 indicadores.
   - Prioridades agora: lista curta que cruza alertas dos dispositivos, trânsito (Waze) e chuva.

   De onde vem cada número:
   - semáforos comunicando, alertas e cruzamentos fora do normal: LiveState (mesma fonte dos outros widgets);
   - lentidão, trânsito e chuva: dados ilustrativos de widgets-futuro.js / widget-lentidao.js.

   HIPÓTESE NÃO VALIDADA (vira pendência se isto virar história): os cortes de cada indicador
   (SIT_CORTES), a regra "a cidade vale o pior indicador" e os pesos da ordem de prioridade (PRI_PESOS).
   Nada disso foi definido pelo negócio; estão aqui só para a tela ter comportamento.
   Carregado depois de widget-lentidao.js e antes do app.js (usa funções do app.js só na hora de desenhar).
   ===================================================================== */

const SIT_ESTADOS = {
  ok: { rotulo: "Normal", titulo: "Operação normal" },
  atencao: { rotulo: "Atenção", titulo: "Operação em atenção" },
  critico: { rotulo: "Crítico", titulo: "Operação em estado crítico" },
};
const SIT_ORDEM = ["ok", "atencao", "critico"];

// Cortes ilustrativos. "atencao" e "critico" são o valor a partir do qual o indicador muda de estado.
const SIT_CORTES = {
  comunicando: { atencao: 97, critico: 93 }, // % de semáforos online (abaixo de)
  graves: { atencao: 1, critico: 3 }, // % dos semáforos com alerta Crítico ou Alto (a partir de)
  lentidao: { atencao: 10, critico: 30 }, // % acima da média de 90 dias (a partir de)
  foraDoNormal: { atencao: 1, critico: 10 }, // cruzamentos apagados ou em intermitente (a partir de)
  acidentes: { atencao: 3, critico: 6 }, // acidentes informados pelo Waze (a partir de)
  offlineOutros: { atencao: 10, critico: 30 }, // % dos dispositivos que não são semáforo sem comunicação (a partir de)
};
// como cada indicador é chamado no meio de uma frase
const SIT_NOMES = {
  comunicando: "semáforos online", graves: "alertas graves", foraDoNormal: "cruzamentos apagados ou piscando",
  lentidao: "lentidão", chuva: "chuva", acidentes: "acidentes", offlineOutros: "outros dispositivos offline",
};

const sitNum = (n, casas = 0) => n.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
const sitAcima = (v, c) => (v >= c.critico ? "critico" : v >= c.atencao ? "atencao" : "ok");
const sitAbaixo = (v, c) => (v < c.critico ? "critico" : v < c.atencao ? "atencao" : "ok");

// Ponto da tarde usado para a lentidão: o mesmo horário fixo dos outros dados ilustrativos (14h30).
const SIT_LENT_I = 1;

function situacaoIndicadores() {
  const semaforos = LiveState.getEquipamentos().filter((e) => e.tipo === "semaforo");
  const total = semaforos.length || 1;
  const online = semaforos.filter((e) => e.online).length;
  const pctOnline = (online / total) * 100;

  const idsSemaforo = new Set(semaforos.map((e) => e.id));
  const alertas = LiveState.getAlertas();
  const graves = alertas.filter((a) => a.severidade === "Crítico" || a.severidade === "Alto");
  const semGraves = new Set(graves.filter((a) => idsSemaforo.has(a.equipamentoId)).map((a) => a.equipamentoId)).size;
  const criticos = alertas.filter((a) => a.severidade === "Crítico").length;

  const hoje = LENT_AREA.hoje[SIT_LENT_I], media = LENT_AREA.media[SIT_LENT_I];
  const pctLent = ((hoje - media) / media) * 100;

  const apagados = semaforos.filter((e) => LiveState.statusDoControlador(e.id) === "apagado").length;
  const intermitentes = semaforos.filter((e) => LiveState.statusDoControlador(e.id) === "intermitente").length;

  const tipoWaze = (id) => (WAZE_DEMO.tipos.find((t) => t.id === id) || { n: 0 }).n;
  const acidentes = tipoWaze("acidente");
  const outros = LiveState.getEquipamentos().filter((e) => e.tipo !== "semaforo");
  const outrosOff = outros.filter((e) => !e.online).length;
  const pctOutrosOff = outros.length ? (outrosOff / outros.length) * 100 : 0;

  const nivelChuva = { Normal: "ok", "Atenção": "atencao", Alerta: "critico" }[PLUVIO_DEMO.nivel] || "ok";

  return [
    {
      id: "comunicando", rotulo: "Semáforos online",
      valor: sitNum(pctOnline, 1), unidade: "%",
      pe: `${sitNum(online)} de ${sitNum(semaforos.length)} online`,
      medida: pctOnline, estado: sitAbaixo(pctOnline, SIT_CORTES.comunicando),
      motivo: semaforos.length - online === 1 ? "1 semáforo sem comunicação" : `${sitNum(semaforos.length - online)} semáforos sem comunicação`,
    },
    {
      id: "graves", rotulo: "Alertas críticos e altos",
      valor: sitNum(graves.length), unidade: "",
      pe: `${sitNum(criticos)} crítico${criticos === 1 ? "" : "s"} · ${sitNum(alertas.length)} alertas ativos`,
      medida: alertas.length ? (graves.length / alertas.length) * 100 : 0,
      estado: sitAcima((semGraves / total) * 100, SIT_CORTES.graves),
      motivo: graves.length === 1 ? "1 alerta crítico ou alto" : `${sitNum(graves.length)} alertas críticos ou altos`,
    },
    {
      id: "foraDoNormal", rotulo: "Apagados ou piscando",
      valor: sitNum(apagados + intermitentes), unidade: "",
      pe: `${sitNum(apagados)} apagado${apagados === 1 ? "" : "s"} · ${sitNum(intermitentes)} em intermitente`,
      medida: null, estado: sitAcima(apagados + intermitentes, SIT_CORTES.foraDoNormal),
      motivo: apagados + intermitentes === 1 ? "1 cruzamento apagado ou piscando" : `${sitNum(apagados + intermitentes)} cruzamentos apagados ou piscando`,
    },
    {
      id: "lentidao", rotulo: "Lentidão na área", ilustrativo: true,
      valor: sitNum(hoje, 1), unidade: "km",
      pe: `${pctLent >= 0 ? "+" : ""}${sitNum(pctLent)}% sobre a média de 90 dias`,
      medida: Math.min(100, (hoje / (media * 1.6)) * 100), marca: (1 / 1.6) * 100,
      estado: sitAcima(pctLent, SIT_CORTES.lentidao),
      motivo: `lentidão ${sitNum(pctLent)}% acima da média`,
    },
    {
      id: "chuva", rotulo: "Chuva em 24 h", ilustrativo: true,
      valor: sitNum(PLUVIO_DEMO.acumulado24h, 1), unidade: "mm",
      pe: `Nível ${PLUVIO_DEMO.nivel.toLowerCase()} · ${sitNum(PLUVIO_DEMO.intensidade, 1)} mm/h agora`,
      medida: null, estado: nivelChuva,
      motivo: `chuva em ${PLUVIO_DEMO.nivel.toLowerCase()}`,
    },
    {
      id: "acidentes", rotulo: "Acidentes no trânsito", ilustrativo: true,
      valor: sitNum(acidentes), unidade: "",
      pe: `${sitNum(tipoWaze("perigo"))} perigos · ${sitNum(tipoWaze("interdicao"))} interdições`,
      medida: null, estado: sitAcima(acidentes, SIT_CORTES.acidentes),
      motivo: acidentes === 1 ? "1 acidente informado pelo Waze" : `${sitNum(acidentes)} acidentes informados pelo Waze`,
    },
    {
      id: "offlineOutros", rotulo: "Outros dispositivos offline",
      valor: sitNum(outrosOff), unidade: "",
      pe: `de ${sitNum(outros.length)} câmeras, radares e outros`,
      medida: pctOutrosOff, estado: sitAcima(pctOutrosOff, SIT_CORTES.offlineOutros),
      motivo: outrosOff === 1 ? "1 dispositivo de outro tipo sem comunicação" : `${sitNum(outrosOff)} dispositivos de outros tipos sem comunicação`,
    },
  ];
}

/* ---------- Análise automática: o card inteiro conta a história do momento ----------
   Em vez de cinco números fixos, o card escolhe os indicadores que mais importam agora (os fora do normal primeiro)
   e conta o que está acontecendo em capítulos curtos: panorama, o mais urgente, trânsito, chuva, equipamentos.
   Cada capítulo fica alguns segundos na tela e acende os indicadores de que está falando; os outros recuam.
   Clicar num traço do progresso ou num indicador pula para o capítulo dele; o mouse em cima pausa.

   SIMULAÇÃO: o texto é montado por regras a partir dos mesmos números dos indicadores e da lista de Prioridades.
   Não há modelo de IA por trás. HIPÓTESE NÃO VALIDADA: se o produto teria uma análise assim, quem a escreve
   (regras ou IA), quais indicadores entram no conjunto e como se decide o que "importa agora". */
// Ícone pequeno de cada indicador (ao lado do rótulo) e de cada capítulo (ao lado do nome dele no texto).
const sitSvg = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const SIT_ICONES = {
  comunicando: sitSvg('<rect x="8" y="2" width="8" height="20" rx="3"/><circle cx="12" cy="7" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="12" cy="17" r="1.3"/>'),
  graves: sitSvg('<path d="M12 3 22 20H2L12 3Z"/><path d="M12 10v4.5M12 17.4h.01"/>'),
  foraDoNormal: sitSvg('<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>'),
  lentidao: sitSvg('<path d="M3 17h18M5 17l1.6-5.6A2 2 0 0 1 8.5 10h7a2 2 0 0 1 1.9 1.4L19 17"/><circle cx="7.5" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/>'),
  chuva: sitSvg('<path d="M8 15a5 5 0 0 1-1-9.9A6 6 0 0 1 18 7a4 4 0 0 1-1 8H8Z"/><path d="M9 18.5v1.5M12 18.5V22M15 18.5v1.5"/>'),
  acidentes: sitSvg('<path d="M9.5 3h5L19 18H5L9.5 3Z"/><path d="M3 21h18M7.4 11h9.2"/>'),
  offlineOutros: sitSvg('<path d="M2 2l20 20M8.5 16.5a5 5 0 0 1 7 0M5 12.9a10 10 0 0 1 4.3-2.4M19 12.9a10 10 0 0 0-3.2-2M12 20h.01"/>'),
  panorama: sitSvg('<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>'),
  normal: sitSvg('<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16 9.5"/>'),
};

const SIT_VISIVEIS = 5; // quantos indicadores cabem na faixa
const SIT_CAPITULO_S = 8; // tempo de cada capítulo na tela
const SIT_ICONE_ANALISE = '<span class="sit-ia-icone" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';
const sitUi = { cap: 0, prox: 0, virou: true };

// os que importam agora: fora do normal primeiro (crítico antes de atenção); no empate vale a ordem do conjunto
function situacaoVisiveis(todos) {
  return todos.map((x, i) => ({ x, i }))
    .sort((a, b) => SIT_ORDEM.indexOf(b.x.estado) - SIT_ORDEM.indexOf(a.x.estado) || a.i - b.i)
    .slice(0, SIT_VISIVEIS).map((o) => o.x);
}

function situacaoCapitulos(inds, pior) {
  const ind = (id) => inds.find((x) => x.id === id);
  const fora = inds.filter((x) => x.estado !== "ok");
  const foraDe = (ids) => ids.map(ind).filter((x) => x && x.estado !== "ok");
  const maiuscula = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  const caps = [];

  caps.push({
    rotulo: "Panorama", icone: "panorama",
    texto: fora.length
      ? `<b>${fora.length} de ${inds.length}</b> indicadores em destaque estão fora do normal: ${fora.map((x) => SIT_NOMES[x.id]).join(", ").replace(/, ([^,]*)$/, " e $1")}.`
      : "Todos os indicadores em destaque estão dentro do esperado.",
    foco: (fora.length ? fora : inds).map((x) => x.id),
  });

  const topo = prioridadesLista().find((p) => p.tipo === "equipamento");
  if (topo) caps.push({
    rotulo: "Mais urgente", icone: "graves",
    texto: `<b>${topo.titulo}</b>: ${topo.motivo.split(" · ")[0].toLowerCase()}${topo.tags.some((t) => t.t === "via") ? ", numa via que já está lenta" : ""}. É o primeiro da lista de prioridades.`,
    foco: [topo.tom === "offline" ? (topo.fonte === "Controladores" ? "comunicando" : "offlineOutros") : "graves"].filter(ind),
    acao: topo,
  });

  const transito = foraDe(["lentidao", "acidentes"]);
  if (transito.length) {
    const via = [...WAZE_DEMO.trechos].sort((a, b) => b.atraso - a.atraso)[0];
    const partes = [];
    if (transito.some((x) => x.id === "lentidao")) partes.push(`o trânsito está <b>${ind("lentidao").pe.replace("+", "").replace(" sobre a média de 90 dias", "")} acima da média</b>, puxado pela ${via.via} (+${via.atraso} min)`);
    if (transito.some((x) => x.id === "acidentes")) partes.push(`o Waze informa <b>${ind("acidentes").valor} acidentes</b> na área`);
    caps.push({ rotulo: "Trânsito", icone: "lentidao", texto: maiuscula(partes.join(" e ")) + ".", foco: transito.map((x) => x.id) });
  }

  if (foraDe(["chuva"]).length) caps.push({
    rotulo: "Chuva", icone: "chuva",
    texto: `Chove em <b>nível de ${PLUVIO_DEMO.nivel.toLowerCase()}</b> na estação ${PLUVIO_DEMO.estacao}: ${sitNum(PLUVIO_DEMO.acumulado24h, 1)} mm em 24 h e ${sitNum(PLUVIO_DEMO.intensidade, 1)} mm/h agora.`,
    foco: ["chuva"],
  });

  const equip = foraDe(["comunicando", "foraDoNormal", "offlineOutros"]);
  if (equip.length) caps.push({
    rotulo: "Equipamentos", icone: "comunicando",
    texto: `${maiuscula(equip.map((x) => `<b>${x.motivo}</b>`).join(" e "))}${ind("comunicando") && ind("comunicando").estado === "ok" ? `. A rede semafórica segue estável, com ${ind("comunicando").valor}% online` : ""}.`,
    foco: equip.map((x) => x.id),
  });
  else if (ind("comunicando")) caps.push({
    rotulo: "O que segue normal", icone: "normal",
    texto: `A rede semafórica segue estável: <b>${ind("comunicando").valor}%</b> dos semáforos online.`,
    foco: ["comunicando"],
  });

  return caps;
}

// Texto novo entra palavra por palavra (cada palavra é um <span> com atraso crescente). As tags <b> são preservadas.
function sitPalavras(html) {
  let n = 0;
  return html.split(/(<\/?b>)/).map((parte) => (parte === "<b>" || parte === "</b>" ? parte
    : parte.split(/(\s+)/).map((w) => (w.trim() ? `<span style="animation-delay:${(n++ * 22)}ms">${w}</span>` : w)).join(""))).join("");
}

function situacaoMarkup(inst) {
  const inds = situacaoVisiveis(situacaoIndicadores());
  const pior = inds.reduce((p, i) => (SIT_ORDEM.indexOf(i.estado) > SIT_ORDEM.indexOf(p) ? i.estado : p), "ok");
  const caps = situacaoCapitulos(inds, pior);
  const agora = Date.now();
  if (!sitUi.prox) sitUi.prox = agora + SIT_CAPITULO_S * 1000;
  sitUi.cap = ((sitUi.cap % caps.length) + caps.length) % caps.length;
  const cap = caps[sitUi.cap];
  const virou = sitUi.virou;
  sitUi.virou = false;
  // o progresso continua de onde estava quando o card é redesenhado pelo tick do LiveState
  const decorrido = Math.min(SIT_CAPITULO_S, Math.max(0, SIT_CAPITULO_S - (sitUi.prox - agora) / 1000));
  const acao = cap.acao && inst
    ? `<button type="button" class="sit-acao" data-action="lista-row" data-id="${inst.id}" data-tipo="equipamento" data-alvo="${cap.acao.alvo}" title="Ver no mapa"><span>Ver no mapa</span><i aria-hidden="true">→</i></button>`
    : "";
  return `
    <div class="sit${virou ? " is-virou" : ""}" data-estado="${pior}">
      <div class="sit-geral">
        <div class="sit-ia" title="Resumo montado automaticamente a partir dos indicadores e das prioridades desta tela (simulação)">
          ${SIT_ICONE_ANALISE}<span>Análise automática</span>
          <span class="sit-caps">${caps.map((c, i) => `<button type="button" class="sit-cap${i < sitUi.cap ? " is-feito" : i === sitUi.cap ? " is-atual" : ""}" data-fut="sit-ir" data-i="${i}" title="${c.rotulo}" aria-label="${c.rotulo}"><i${i === sitUi.cap ? ` style="animation-duration:${SIT_CAPITULO_S}s;animation-delay:-${decorrido.toFixed(2)}s"` : ""}></i></button>`).join("")}</span>
          ${acao}
        </div>
        <div class="sit-titulo-linha"><b class="sit-titulo">${SIT_ESTADOS[pior].titulo}</b><span class="sit-selo"><i></i>${SIT_ESTADOS[pior].rotulo}</span></div>
        <p class="sit-frase"><em>${SIT_ICONES[cap.icone] || ""}${cap.rotulo}</em>${virou ? sitPalavras(cap.texto) : cap.texto}</p>
      </div>
      <div class="sit-kpis">
        ${inds.map((i) => `
        <div class="sit-kpi ${cap.foco.includes(i.id) ? "is-foco" : "is-fundo"}" data-estado="${i.estado}" data-fut="sit-kpi" data-ind="${i.id}" title="${SIT_ESTADOS[i.estado].rotulo}${i.ilustrativo ? " · dado ilustrativo" : ""}">
          <span class="sit-kpi-rotulo">${SIT_ICONES[i.id] || "<i></i>"}${i.rotulo}</span>
          <strong>${i.valor}${i.unidade ? `<small>${i.unidade}</small>` : ""}</strong>
          ${i.medida === null ? `<span class="sit-kpi-barra is-vazia"></span>` : `<span class="sit-kpi-barra"><i style="width:${i.medida.toFixed(1)}%"></i>${i.marca ? `<b style="left:${i.marca.toFixed(1)}%" title="Média de 90 dias"></b>` : ""}</span>`}
          <span class="sit-kpi-pe">${i.pe}</span>
        </div>`).join("")}
      </div>
    </div>`;
}

function situacaoIr(cap) {
  sitUi.cap = cap;
  sitUi.prox = Date.now() + SIT_CAPITULO_S * 1000;
  sitUi.virou = true;
  instances.filter((i) => i.type === "situacao").forEach((i) => renderWidgetBody(i.id));
}
// passa de capítulo sozinho; com o mouse em cima do card, espera
setInterval(() => {
  const el = document.querySelector(".sit");
  if (!el || !sitUi.prox) return;
  if (el.matches(":hover")) { sitUi.prox += 500; return; }
  if (Date.now() >= sitUi.prox) situacaoIr(sitUi.cap + 1);
}, 500);
document.addEventListener("click", (ev) => {
  const el = ev.target.closest('[data-fut^="sit-"]');
  if (!el) return;
  if (el.dataset.fut === "sit-ir") return situacaoIr(Number(el.dataset.i));
  // clique num indicador: vai para o capítulo que fala dele (o panorama só se nenhum outro falar)
  const inds = situacaoVisiveis(situacaoIndicadores());
  const pior = inds.reduce((p, i) => (SIT_ORDEM.indexOf(i.estado) > SIT_ORDEM.indexOf(p) ? i.estado : p), "ok");
  const caps = situacaoCapitulos(inds, pior);
  const alvo = caps.findIndex((c, i) => i > 0 && c.foco.includes(el.dataset.ind));
  situacaoIr(alvo > 0 ? alvo : 0);
});

/* ---------- Prioridades agora ---------- */

// Pesos ilustrativos da ordem (ver aviso no topo do arquivo).
const PRI_PESOS = { "Crítico": 100, Alto: 70, offline: 60, "Médio": 40, Baixo: 10, viaLenta: 25, alertaExtra: 5 };
const PRI_TOM = { "Crítico": "critico", Alto: "alto", "Médio": "medio", Baixo: "baixo" };

const priNorm = (t) => String(t).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
// "Av. Sete de Setembro" -> "sete de setembro": o nome do cruzamento costuma trazer a via sem o prefixo
const priChaveVia = (via) => priNorm(via).replace(/^(av\.|avenida|rua|r\.)\s+/, "");
const PRI_VIAS = WAZE_DEMO.trechos.map((t, i) => ({ ...t, i, chave: priChaveVia(t.via) }));

function prioridadesLista() {
  const itens = [];
  const porDispositivo = new Map();
  alertasFiltrados(defaultConfig("alertas").filtros).forEach((a) => {
    if (!porDispositivo.has(a.equipamentoId)) porDispositivo.set(a.equipamentoId, []);
    porDispositivo.get(a.equipamentoId).push(a);
  });
  porDispositivo.forEach((lista, id) => {
    const eq = LiveState.equipamentoPorId(id);
    if (!eq) return;
    const peso = (a) => (a.offline ? PRI_PESOS.offline : PRI_PESOS[a.severidade] || 0);
    const ordenados = [...lista].sort((a, b) => peso(b) - peso(a));
    const pior = ordenados[0];
    const nome = priNorm(eq.nome);
    const via = PRI_VIAS.find((v) => v.atraso >= 2 && nome.includes(v.chave));
    const tags = [{ t: pior.offline ? "offline" : PRI_TOM[pior.severidade], rotulo: pior.offline ? "Offline" : pior.severidade }];
    if (via) tags.push({ t: "via", rotulo: `Via com lentidão +${via.atraso} min` });
    itens.push({
      tipo: "equipamento", alvo: id,
      tom: pior.offline ? "offline" : PRI_TOM[pior.severidade],
      titulo: eq.nome,
      motivo: `${pior.offline ? "Dispositivo sem comunicação" : pior.descricao}${lista.length > 1 ? ` · mais ${lista.length - 1} alerta${lista.length > 2 ? "s" : ""}` : ""}`,
      fonte: categoriaLabel(eq.tipo), tags,
      pontos: peso(pior) + (via ? PRI_PESOS.viaLenta : 0) + Math.min(3, lista.length - 1) * PRI_PESOS.alertaExtra,
    });
  });
  PRI_VIAS.filter((v) => v.atraso >= 3).forEach((v) => itens.push({
    tipo: "transito", alvo: v.i, tom: "alto",
    titulo: v.via,
    motivo: `${v.kmh} km/h · ${fmtKm(v.km)} km de lentidão`,
    fonte: "Trânsito", tags: [{ t: "via", rotulo: `+${v.atraso} min de atraso` }],
    pontos: 65 + v.atraso * 3,
  }));
  if (PLUVIO_DEMO.nivel !== "Normal") itens.push({
    tipo: "chuva", tom: PLUVIO_DEMO.nivel === "Alerta" ? "critico" : "medio",
    titulo: `Chuva em nível de ${PLUVIO_DEMO.nivel.toLowerCase()}`,
    motivo: `${PLUVIO_DEMO.estacao} · ${sitNum(PLUVIO_DEMO.acumulado24h, 1)} mm em 24 h`,
    fonte: "Chuva", tags: [{ t: "chuva", rotulo: `${sitNum(PLUVIO_DEMO.intensidade, 1)} mm/h` }],
    pontos: PLUVIO_DEMO.nivel === "Alerta" ? 95 : 55,
  });
  return itens.sort((a, b) => b.pontos - a.pontos);
}

const PRI_MAX = 12; // o card mostra só as que cabem (prioridadesAjustar)

function prioridadesMarkup(inst) {
  const todos = prioridadesLista();
  if (!todos.length) return `<div class="pri"><p class="pri-vazio">Nada pede atenção agora.</p></div>`;
  const linhas = todos.slice(0, PRI_MAX).map((p, i) => {
    const alvo = p.tipo === "equipamento"
      ? `data-action="lista-row" data-id="${inst.id}" data-tipo="equipamento" data-alvo="${p.alvo}" title="Ver no mapa"`
      : p.tipo === "transito" ? `data-fut="waze-ver" data-i="${p.alvo}" title="Ver o trecho no mapa"` : "";
    return `
        <button type="button" class="pri-item" data-tom="${p.tom}" ${alvo}>
          <span class="pri-ordem">${i + 1}</span>
          <span class="pri-corpo">
            <span class="pri-topo"><b>${p.titulo}</b><em>${p.fonte}</em></span>
            <span class="pri-motivo">${p.motivo}</span>
            <span class="pri-tags">${p.tags.map((t) => `<i data-t="${t.t}">${t.rotulo}</i>`).join("")}</span>
          </span>
        </button>`;
  }).join("");
  return `
    <div class="pri">
      <div class="pri-head"><span>Ordenado por gravidade e impacto no trânsito</span><em>${todos.length} no total</em></div>
      <div class="pri-lista">${linhas}</div>
    </div>`;
}

// Esconde as linhas que não cabem inteiras no card (linha cortada ao meio parece defeito, ainda mais na TV).
function prioridadesAjustar(body) {
  const lista = body.querySelector(".pri-lista");
  if (!lista) return;
  const itens = [...lista.children];
  itens.forEach((el) => { el.hidden = false; });
  const limite = lista.clientHeight;
  itens.forEach((el) => { if (el.offsetTop + el.offsetHeight > limite + 1) el.hidden = true; });
}

/* ---------- relógio da barra de cima (só no Painel TV) ---------- */
document.addEventListener("DOMContentLoaded", () => {
  if (document.documentElement.dataset.tela !== "tv") return;
  const alvo = document.querySelector(".app-topbar-actions");
  if (!alvo) return;
  const el = document.createElement("div");
  el.className = "tv-relogio";
  alvo.insertBefore(el, alvo.firstChild);
  const pintar = () => {
    const d = new Date();
    const data = d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
    el.innerHTML = `<span class="tv-aovivo"><i></i>Ao vivo</span><span class="tv-data">${data}</span><b>${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</b>`;
  };
  pintar();
  setInterval(pintar, 15000);
});

/* ---------- botão de tema (claro / escuro) na barra de cima, em todas as telas ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const alvo = document.querySelector(".app-topbar-actions");
  if (!alvo) return;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "topbar-icon-btn tema-btn";
  btn.innerHTML = `<svg class="tema-sol" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.5 1.5M17.2 17.2l1.5 1.5M5.3 18.7l1.5-1.5M17.2 6.8l1.5-1.5"/></svg>
    <svg class="tema-lua" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/></svg>`;
  const rotular = () => {
    const escuro = document.documentElement.dataset.tema === "escuro";
    btn.title = escuro ? "Mudar para o tema claro" : "Mudar para o tema escuro";
    btn.setAttribute("aria-label", btn.title);
    btn.setAttribute("aria-pressed", String(escuro));
  };
  rotular();
  btn.addEventListener("click", () => { Cockpits.alternarTema(); rotular(); });
  // fica logo antes do sino
  alvo.insertBefore(btn, alvo.querySelector(".topbar-icon-btn"));
});
