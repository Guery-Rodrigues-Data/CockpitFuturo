/* ==========================================================================
   Cockpit — cena de demonstração da v1.2 (só quando ?versao=v1.2)
   Na v1.2 o painel lateral abre para qualquer dispositivo, mas só controlador tem dado real; os outros tipos de
   verdade não estão cadastrados. Para dar o que clicar, esta cena:
   1. escolhe a subárea cadastrada com mais controladores;
   2. deixa só um controlador dela e cria um nobreak (SIMULADO, origem "sim", some ao recarregar) ao lado;
   3. abre o mapa centrado nos dois, no zoom 17.
   Nada disso existe nas outras versões.
   ========================================================================== */
const DemoV12 = (function () {
  if (typeof Versoes === "undefined" || !Versoes.ehV12) return { semear() {}, zoom() {} };

  // Dois tipos de dispositivo na cena: o controlador (com conexão: abas Geral e Comandos) e o nobreak (sem conexão: só Geral).
  const ZOOM_PADRAO = 17; // nível de zoom em que a v1.2 abre, centrado na subárea escolhida
  let alvo = null; // subárea escolhida
  let foco = null; // ponto entre os dois dispositivos, onde o mapa centraliza

  function subareaComMaisControladores() {
    const contagem = new Map();
    LiveState.getEquipamentos().forEach((e) => {
      if (e.tipo === "semaforo" && e.subareaId) contagem.set(e.subareaId, (contagem.get(e.subareaId) || 0) + 1);
    });
    const [id] = [...contagem.entries()].sort((a, b) => b[1] - a[1])[0] || [];
    return SUBAREAS.find((s) => s.id === id) || null;
  }

  // Roda depois de carregar controladores e regiões e antes de montar a tela. Deixa só DOIS dispositivos no mapa:
  // um controlador (com conexão: Geral e Comandos) e um nobreak ao lado (sem conexão: só Geral).
  function semear() {
    alvo = subareaComMaisControladores();
    if (!alvo) return;
    const controlador = LiveState.getEquipamentos().find((e) => e.tipo === "semaforo" && e.subareaId === alvo.id);
    if (!controlador) return;
    const lat = controlador.lat + 0.0005; // ~55 m ao norte e ~70 m a leste: perto o bastante para caber juntos no zoom 17
    const lng = controlador.lng + 0.0007;
    const nobreak = {
      id: "DEMO-NOB-01",
      tipo: "nobreak",
      nome: "Nobreak 1",
      lat,
      lng,
      ...regiaoDoPonto(lat, lng),
      online: true,
      origem: "sim", // é o que faz o mapa mostrar o dispositivo que não é controlador
    };
    LiveState.substituirEquipamentosDoTipo("semaforo", [controlador]);
    LiveState.substituirEquipamentosDoTipo("nobreak", [nobreak]);
    foco = L.latLng((controlador.lat + lat) / 2, (controlador.lng + lng) / 2);
  }

  // Zoom na subárea assim que o mapa existir. A espera curta deixa o enquadramento inicial do próprio mapa acontecer antes.
  function zoom() {
    if (!alvo) return;
    let tentativas = 0;
    const espera = setInterval(() => {
      const mapa = CockpitMap.getMap();
      if (!mapa && ++tentativas < 50) return;
      clearInterval(espera);
      if (!mapa) return;
      setTimeout(() => {
        mapa.invalidateSize();
        mapa.setView(foco || L.polygon(alvo.poligono).getBounds().getCenter(), ZOOM_PADRAO, { animate: true });
      }, 700);
    }, 200);
  }

  return { semear, zoom };
})();
