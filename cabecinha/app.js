(function () {
"use strict";

/* ---------- storage ---------- */
const KEY = "cr_v1_";
const store = {
  get(k, d) { try { const v = localStorage.getItem(KEY + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch (e) {} }
};

/* ---------- helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const view = $("#view");
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pad = n => String(n).padStart(2, "0");
const dayKey = (d = new Date()) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const fmtTime = s => pad(Math.floor(s / 60)) + ":" + pad(Math.floor(s % 60));
const fmtDate = k => { const [y, m, d] = k.split("-"); return d + "/" + m; };
function toast(msg) { const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2500); }

function profile() { return store.get("profile", {}); }
function ageDays() {
  const p = profile(); if (!p.birth) return null;
  const b = new Date(p.birth + "T00:00:00"); return Math.max(0, Math.floor((Date.now() - b) / 864e5));
}
function ageLabel() {
  const d = ageDays(); if (d == null) return "";
  if (d < 30) return d + (d === 1 ? " dia" : " dias");
  const m = Math.floor(d / 30.44); return m + (m === 1 ? " mês" : " meses");
}
function tummyGoalMin() {
  const d = ageDays(); if (d == null) return 20;
  if (d < 30) return 10; if (d < 61) return 20; if (d < 91) return 30; return 45;
}
function babyName() { return profile().name || "seu bebê"; }

/* ---------- progress ---------- */
const doneSet = () => new Set(store.get("done", []));
function markDone(id) { const s = doneSet(); s.add(id); store.set("done", [...s]); }
function progressPct() { const s = doneSet(); return Math.round(window.MODULES.filter(m => s.has(m.id)).length / window.MODULES.length * 100); }

/* ---------- router ---------- */
let cleanup = null;
function route() {
  if (cleanup) { cleanup(); cleanup = null; }
  const h = location.hash.replace(/^#\/?/, "");
  const parts = h.split("/").filter(Boolean);
  const tab = parts[0] === "modulo" ? "metodo" : (parts[0] || "inicio");
  document.querySelectorAll(".tabs a").forEach(a => a.classList.toggle("on", a.dataset.tab === tab));
  $("#backBtn").hidden = parts.length < 2 && parts[0] !== "perfil";
  if (!profile().ok && parts[0] !== "perfil") return renderOnboarding();
  switch (parts[0]) {
    case undefined: renderHome(); break;
    case "metodo": renderMethod(); break;
    case "modulo": renderLesson(parts[1]); break;
    case "bonus": renderLesson("leite"); break;
    case "ferramentas":
      if (parts[1] === "tummy") renderTummy();
      else if (parts[1] === "rotina") renderRoutine();
      else if (parts[1] === "lado") renderSide();
      else if (parts[1] === "fotos") renderPhotos();
      else renderTools();
      break;
    case "perfil": renderOnboarding(true); break;
    default: renderHome();
  }
  window.scrollTo(0, 0); view.focus({ preventScroll: true });
}
$("#backBtn").addEventListener("click", () => { if (history.length > 1) history.back(); else location.hash = "#/"; });
window.addEventListener("hashchange", route);

/* ---------- onboarding ---------- */
function renderOnboarding(edit) {
  const p = profile();
  view.innerHTML = `
  <div class="card hero" style="grid-template-columns:1fr">
    <img src="assets/logo.jpg" alt="Logo" style="width:100%;height:auto;border-radius:14px;border:0;box-shadow:none">
  </div>
  <div class="card">
    <div class="kicker">${edit ? "Seus dados" : "Bem-vinda, mamãe 💗"}</div>
    <h1>${edit ? "Editar perfil" : "Vamos personalizar o seu Método"}</h1>
    <p class="small">Esses dados ficam só no seu celular e servem para ajustar as metas para a idade do bebê.</p>
    <form id="pf">
      <label class="f" for="nm">Nome do bebê</label>
      <input class="in" id="nm" maxlength="40" value="${esc(p.name || "")}" placeholder="Ex.: Noah">
      <label class="f" for="bd">Data de nascimento</label>
      <input class="in" id="bd" type="date" value="${esc(p.birth || "")}" max="${dayKey()}">
      <label class="f">Qual lado parece mais achatado?</label>
      <div class="seg" id="sd">
        ${[["esq", "Esquerdo"], ["dir", "Direito"], ["tras", "Atrás"]].map(([v, l]) => `<button type="button" data-v="${v}" class="${p.side === v ? "on" : ""}">${l}</button>`).join("")}
      </div>
      <p class="small">Não sabe? Pode deixar em branco e escolher depois.</p>
      <button class="btn block" style="margin-top:14px">${edit ? "Salvar" : "Começar o Método"}</button>
    </form>
  </div>`;
  let side = p.side || "";
  $("#sd").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    side = side === b.dataset.v ? "" : b.dataset.v;
    $("#sd").querySelectorAll("button").forEach(x => x.classList.toggle("on", x.dataset.v === side));
  });
  $("#pf").addEventListener("submit", e => {
    e.preventDefault();
    store.set("profile", { name: $("#nm").value.trim(), birth: $("#bd").value, side, ok: true });
    toast("Tudo pronto! 💗"); location.hash = "#/";
    if (!edit) route();
  });
}

/* ---------- home ---------- */
function renderHome() {
  const pct = progressPct();
  const s = doneSet();
  const next = window.MODULES.find(m => !s.has(m.id));
  const tt = tummyToday();
  const goal = tummyGoalMin() * 60;
  const chk = store.get("chk_" + dayKey(), {});
  const chkN = Object.values(chk).filter(Boolean).length;
  view.innerHTML = `
  <div class="card hero">
    <div>
      <div class="kicker">Método Cabecinha Redonda</div>
      <h1>Olá, mamãe 💗</h1>
      <p>${ageDays() != null ? esc(babyName()) + " tem <b>" + ageLabel() + "</b>. " : ""}Cada pequeno cuidado de hoje conta.</p>
    </div>
    <img src="assets/hero.jpg" alt="">
  </div>

  <div class="card">
    <strong style="color:var(--wine)">Seu progresso no Método</strong>
    <div class="progress"><i style="width:${pct}%"></i></div>
    <div class="small">${pct}% concluído</div>
    ${next ? `<a class="btn block" style="margin-top:12px" href="#/modulo/${next.id}">${pct ? "Continuar" : "Começar"}: Módulo ${next.num} →</a>`
           : `<p style="margin:.6em 0 0">🎉 Você concluiu todos os módulos! Continue com a rotina e as ferramentas.</p>`}
  </div>

  <h2>Hoje</h2>
  <div class="list">
    <a class="item" href="#/ferramentas/tummy"><div class="ic">⏱️</div><div class="tx"><strong>Tummy time</strong><span>${Math.floor(tt / 60)} de ${goal / 60} min da meta de hoje</span></div><div class="st">${tt >= goal ? "✓" : "›"}</div></a>
    <a class="item" href="#/ferramentas/rotina"><div class="ic">✅</div><div class="tx"><strong>Checklist do dia</strong><span>${chkN} de ${ROUTINE.length} cuidados feitos</span></div><div class="st">${chkN >= ROUTINE.length ? "✓" : "›"}</div></a>
    <a class="item" href="#/ferramentas/lado"><div class="ic">🛏️</div><div class="tx"><strong>Lado da vez</strong><span>${sideToday().end}</span></div><div class="st">›</div></a>
  </div>

  <h2>Seu presente</h2>
  <a class="item" href="#/bonus"><div class="ic" style="background:var(--gold-soft)">🎁</div><div class="tx"><strong>${window.BONUS.title}</strong><span>Bônus: sinais de fome e de bebê satisfeito</span></div><div class="st">›</div></a>

  <p class="foot">Conteúdo educativo. Não substitui a orientação do pediatra.<br><a href="#/perfil">Editar dados do bebê</a></p>`;
}

/* ---------- method ---------- */
function renderMethod() {
  const s = doneSet();
  view.innerHTML = `
  <div class="kicker">O Método</div>
  <h1>8 passos para a cabecinha redonda</h1>
  <div class="progress"><i style="width:${progressPct()}%"></i></div>
  <p class="small">${progressPct()}% concluído · leia na ordem, cada módulo leva poucos minutos</p>
  <div class="list" style="margin-top:12px">
    ${window.MODULES.map(m => `
      <a class="item ${s.has(m.id) ? "done" : ""}" href="#/modulo/${m.id}">
        <div class="ic">${m.emoji}</div>
        <div class="tx"><strong>${m.num}. ${esc(m.title)}</strong><span>${m.minutes} min · ${esc(m.subtitle)}</span></div>
        <div class="st">${s.has(m.id) ? "✓" : "›"}</div>
      </a>`).join("")}
    <a class="item" href="#/bonus"><div class="ic" style="background:var(--gold-soft)">🎁</div><div class="tx"><strong>Bônus: ${esc(window.BONUS.title)}</strong><span>${window.BONUS.minutes} min</span></div><div class="st">${s.has("leite") ? "✓" : "›"}</div></a>
  </div>`;
}

function renderLesson(id) {
  const mods = window.MODULES;
  const isBonus = id === "leite";
  const m = isBonus ? window.BONUS : mods.find(x => x.id === id);
  if (!m) { location.hash = "#/metodo"; return; }
  const i = mods.indexOf(m);
  const prev = i > 0 ? mods[i - 1] : null;
  const next = i >= 0 && i < mods.length - 1 ? mods[i + 1] : null;
  const done = doneSet().has(m.id);
  view.innerHTML = `
  <article class="lesson card">
    <div class="lesson-head">
      <span class="num">${isBonus ? "🎁 Bônus" : "Módulo " + m.num + " de " + mods.length}</span>
      <h1>${m.emoji} ${esc(m.title)}</h1>
      <p class="small">${esc(m.subtitle)} · ${m.minutes} min de leitura</p>
    </div>
    ${m.html}
    <button class="btn block ${done ? "alt" : ""}" id="doneBtn" style="margin-top:18px">${done ? "✓ Concluído" : "Marcar como concluído"}</button>
  </article>
  <div class="lesson-nav">
    ${prev ? `<a class="btn alt" href="#/modulo/${prev.id}">‹ Anterior</a>` : `<span></span>`}
    ${next ? `<a class="btn" href="#/modulo/${next.id}">Próximo ›</a>` : (isBonus ? `<a class="btn" href="#/metodo">Ver módulos</a>` : `<a class="btn gold" href="#/bonus">Abrir bônus 🎁</a>`)}
  </div>`;
  $("#doneBtn").addEventListener("click", () => {
    markDone(m.id);
    if (next) { toast("Módulo concluído! 💗"); location.hash = "#/modulo/" + next.id; }
    else { toast("Concluído! 🎉"); renderLesson(id); }
  });
}

/* ---------- tools ---------- */
function renderTools() {
  view.innerHTML = `
  <div class="kicker">Ferramentas</div>
  <h1>Seu kit do dia a dia</h1>
  <div class="list">
    <a class="item" href="#/ferramentas/tummy"><div class="ic">⏱️</div><div class="tx"><strong>Timer de Tummy Time</strong><span>Marque as sessões e acompanhe a meta da idade</span></div><div class="st">›</div></a>
    <a class="item" href="#/ferramentas/rotina"><div class="ic">✅</div><div class="tx"><strong>Checklist do dia</strong><span>A rotina do Método, item por item</span></div><div class="st">›</div></a>
    <a class="item" href="#/ferramentas/lado"><div class="ic">🛏️</div><div class="tx"><strong>Lado da vez</strong><span>Qual ponta do berço e para onde virar a cabeça hoje</span></div><div class="st">›</div></a>
    <a class="item" href="#/ferramentas/fotos"><div class="ic">📸</div><div class="tx"><strong>Diário da Cabecinha</strong><span>Fotos semanais para comparar a evolução</span></div><div class="st">›</div></a>
  </div>`;
}

/* tummy */
function tummyLog() { return store.get("tummy", {}); }
function tummyToday() { return (tummyLog()[dayKey()] || []).reduce((a, b) => a + b, 0); }
function addTummy(sec) {
  if (sec < 5) return;
  const l = tummyLog(); const k = dayKey(); (l[k] = l[k] || []).push(Math.round(sec));
  const keys = Object.keys(l).sort(); while (keys.length > 60) delete l[keys.shift()];
  store.set("tummy", l);
}
function renderTummy() {
  const goal = tummyGoalMin() * 60;
  const C = 2 * Math.PI * 96;
  view.innerHTML = `
  <div class="kicker">Ferramenta</div>
  <h1>⏱️ Timer de Tummy Time</h1>
  <p class="small">Meta para ${ageDays() != null ? esc(babyName()) + " (" + ageLabel() + ")" : "a idade do bebê"}: <b>${goal / 60} min por dia</b>, somando várias sessões curtas.${ageDays() == null ? ' <a href="#/perfil">Informe a data de nascimento</a> para ajustar.' : ""}</p>
  <div class="card timer">
    <div class="ring">
      <svg width="220" height="220" viewBox="0 0 220 220"><circle cx="110" cy="110" r="96" fill="none" stroke="#fbe3e6" stroke-width="16"/>
      <circle id="arc" cx="110" cy="110" r="96" fill="none" stroke="#7a1430" stroke-width="16" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg>
      <div class="val"><b id="clock">00:00</b><small>sessão atual</small></div>
    </div>
    <div class="row" style="justify-content:center">
      <button class="btn" id="go">▶ Iniciar</button>
      <button class="btn alt" id="stop" hidden>■ Salvar sessão</button>
    </div>
    <div class="stat-row">
      <div class="stat"><b id="today">0</b><span>min hoje</span></div>
      <div class="stat"><b id="left">${goal / 60}</b><span>min p/ meta</span></div>
      <div class="stat"><b id="sess">0</b><span>sessões hoje</span></div>
    </div>
  </div>
  <div class="card">
    <strong style="color:var(--wine)">Últimos 7 dias</strong>
    <div class="bars" id="bars"></div>
    <p class="small" style="margin-bottom:0">Verde = meta do dia batida.</p>
  </div>
  <div class="callout"><strong>Dica</strong><p>Chorou? Pare, acalme e tente de novo mais tarde. 30 segundos já contam! Veja os 7 jeitos sem choro no <a href="#/modulo/tummy">Módulo 3</a>.</p></div>`;

  let run = store.get("tummy_run", null); // {start, acc}
  const elapsed = () => run ? run.acc + (run.start ? (Date.now() - run.start) / 1000 : 0) : 0;
  function paint() {
    const e = elapsed(), tot = tummyToday() + e;
    $("#clock").textContent = fmtTime(e);
    $("#arc").setAttribute("stroke-dashoffset", C * (1 - Math.min(1, tot / goal)));
    $("#arc").setAttribute("stroke", tot >= goal ? "#2f8f5b" : "#7a1430");
    $("#today").textContent = Math.floor(tot / 60);
    $("#left").textContent = Math.max(0, Math.ceil((goal - tot) / 60));
    $("#sess").textContent = (tummyLog()[dayKey()] || []).length;
    $("#go").textContent = run && run.start ? "❚❚ Pausar" : (run ? "▶ Continuar" : "▶ Iniciar");
    $("#stop").hidden = !run;
  }
  function bars() {
    const l = tummyLog(); let h = "";
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); const k = dayKey(d);
      const v = (l[k] || []).reduce((a, b) => a + b, 0);
      h += `<div><i class="${v >= goal ? "met" : ""}" style="height:${Math.min(100, v / goal * 100)}%"></i><span>${i ? fmtDate(k) : "hoje"}</span></div>`;
    }
    $("#bars").innerHTML = h;
  }
  $("#go").addEventListener("click", () => {
    if (run && run.start) run = { start: 0, acc: elapsed() };
    else run = { start: Date.now(), acc: run ? run.acc : 0 };
    store.set("tummy_run", run); paint();
  });
  $("#stop").addEventListener("click", () => {
    const e = elapsed(); addTummy(e); run = null; store.set("tummy_run", null);
    toast(e >= 5 ? "Sessão de " + fmtTime(e) + " salva! 💪" : "Sessão muito curta"); paint(); bars();
    if (tummyToday() >= goal) toast("Meta do dia batida! 🎉");
  });
  paint(); bars();
  const iv = setInterval(paint, 500);
  cleanup = () => clearInterval(iv);
}

/* routine */
const ROUTINE = [
  ["acordar", "☀️ Tummy time ao acordar", "1 a 3 min depois da primeira troca"],
  ["mamada", "🍼 Alternei o braço/lado nas mamadas", "Mamadeira: troque o braço a cada mamada"],
  ["trocas", "🧷 Tummy time depois das trocas", "1 a 2 min, várias vezes ao dia"],
  ["chao", "🧸 Brincadeira no chão", "De bruços e de ladinho, brinquedo do lado menos usado"],
  ["colo", "🤱 Colo em pé ou sling", "Bebê conforto só no carro"],
  ["dormir", "🌙 Sono: ponta do dia + cabeça virada", "Sempre de costas, berço vazio"]
];
function renderRoutine() {
  const k = "chk_" + dayKey();
  const state = store.get(k, {});
  function streak() {
    let n = 0; const d = new Date();
    for (let i = 0; i < 60; i++) {
      const s = store.get("chk_" + dayKey(d), {});
      const c = Object.values(s).filter(Boolean).length;
      if (c >= 4) n++; else if (i > 0) break;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }
  function paint() {
    const c = Object.values(state).filter(Boolean).length;
    view.innerHTML = `
    <div class="kicker">Ferramenta</div>
    <h1>✅ Checklist do dia</h1>
    <div class="progress"><i style="width:${c / ROUTINE.length * 100}%"></i></div>
    <p class="small">${c} de ${ROUTINE.length} feitos hoje · 🔥 sequência: ${streak()} dia(s) com 4+ cuidados</p>
    <div class="list" style="margin-top:12px">
      ${ROUTINE.map(([id, t, s]) => `
        <label class="chk ${state[id] ? "on" : ""}"><input type="checkbox" data-id="${id}" ${state[id] ? "checked" : ""}>
        <div class="t"><strong>${t}</strong><span>${s}</span></div></label>`).join("")}
    </div>
    <p class="foot">O checklist zera sozinho todo dia.</p>`;
    view.querySelectorAll("input[type=checkbox]").forEach(cb => cb.addEventListener("change", () => {
      state[cb.dataset.id] = cb.checked; store.set(k, state);
      const n = Object.values(state).filter(Boolean).length;
      if (cb.checked && n === ROUTINE.length) toast("Dia completo! Você é incrível 💗");
      paint();
    }));
  }
  paint();
}

/* side */
function sideToday() {
  const n = Math.floor(new Date(dayKey() + "T12:00:00").getTime() / 864e5);
  const even = n % 2 === 0;
  const end = even ? "Cabeça na cabeceira do berço" : "Cabeça nos pés do berço";
  const side = profile().side;
  let head;
  if (side === "esq") head = "Vire a cabecinha para a DIREITA (deixa o lado esquerdo livre)";
  else if (side === "dir") head = "Vire a cabecinha para a ESQUERDA (deixa o lado direito livre)";
  else if (side === "tras") head = even ? "Hoje: cabecinha virada para a DIREITA" : "Hoje: cabecinha virada para a ESQUERDA";
  else head = "Vire a cabecinha para o lado mais arredondado";
  return { end, head, even };
}
function renderSide() {
  const t = sideToday();
  view.innerHTML = `
  <div class="kicker">Ferramenta</div>
  <h1>🛏️ Lado da vez</h1>
  <div class="card side-box">
    <div class="big">${t.even ? "⬆️" : "⬇️"}</div>
    <div class="kicker">Hoje, ${new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" })}</div>
    <h2>${t.end}</h2>
    <p>${t.head}</p>
  </div>
  <div class="card">
    <label class="f">Lado mais achatado</label>
    <div class="seg" id="sd">${[["esq", "Esquerdo"], ["dir", "Direito"], ["tras", "Atrás"]].map(([v, l]) => `<button type="button" data-v="${v}" class="${profile().side === v ? "on" : ""}">${l}</button>`).join("")}</div>
    <p class="small">A ponta do berço alterna sozinha todo dia. Ajuste o lado se mudar.</p>
  </div>
  <div class="callout red"><strong>Sempre</strong><p>Bebê de barriga para cima, berço vazio, sem travesseiros ou posicionadores. Se ele virar a cabeça durante o sono, tudo bem.</p></div>`;
  $("#sd").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    const p = profile(); p.side = p.side === b.dataset.v ? "" : b.dataset.v; store.set("profile", p); renderSide();
  });
}

/* photos (IndexedDB) */
function db() {
  return new Promise((res, rej) => {
    if (!window.indexedDB) return rej(new Error("sem IndexedDB"));
    const r = indexedDB.open("cabecinha", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("photos", { keyPath: "id" });
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
}
async function photoOp(mode, fn) {
  const d = await db();
  return new Promise((res, rej) => {
    const tx = d.transaction("photos", mode); const st = tx.objectStore("photos");
    const out = fn(st); tx.oncomplete = () => res(out && out.result); tx.onerror = () => rej(tx.error);
  });
}
function compress(file) {
  return new Promise((res, rej) => {
    const img = new Image(); const url = URL.createObjectURL(file);
    img.onload = () => {
      const max = 900, s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas"); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      res(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = rej; img.src = url;
  });
}
async function renderPhotos() {
  view.innerHTML = `
  <div class="kicker">Ferramenta</div>
  <h1>📸 Diário da Cabecinha</h1>
  <p class="small">Uma foto por semana, sempre de cima, no mesmo ângulo. As fotos ficam só no seu celular. <a href="#/modulo/acompanhar">Como tirar a foto certa</a></p>
  <div class="card">
    <label class="f" for="nt">Observação (opcional)</label>
    <input class="in" id="nt" maxlength="80" placeholder="Ex.: semana 3, mais arredondada atrás">
    <label class="btn block" style="margin-top:12px">📷 Adicionar foto<input id="file" type="file" accept="image/*" capture="environment" hidden></label>
  </div>
  <div id="cmp"></div>
  <div id="gal" class="gallery"></div>`;
  $("#file").addEventListener("change", async e => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    try {
      const data = await compress(f);
      await photoOp("readwrite", st => st.put({ id: Date.now(), date: dayKey(), note: $("#nt").value.trim(), data }));
      toast("Foto salva! 📸"); renderPhotos();
    } catch (err) { toast("Não consegui salvar a foto"); }
  });
  let list = [];
  try { list = (await photoOp("readonly", st => st.getAll())) || []; } catch (e) { $("#gal").outerHTML = '<p class="empty">Seu navegador não permite salvar fotos aqui.</p>'; return; }
  list.sort((a, b) => a.id - b.id);
  if (!list.length) { $("#gal").outerHTML = '<p class="empty">Nenhuma foto ainda.<br>Tire a primeira hoje: ela vai ser o seu "antes" 💗</p>'; return; }
  if (list.length > 1) {
    const a = list[0], b = list[list.length - 1];
    $("#cmp").innerHTML = `<div class="card"><strong style="color:var(--wine)">Antes × agora</strong>
      <div class="compare" style="margin-top:8px"><figure><img src="${a.data}" alt="Primeira foto"><figcaption>${fmtDate(a.date)}</figcaption></figure>
      <figure><img src="${b.data}" alt="Foto mais recente"><figcaption>${fmtDate(b.date)}</figcaption></figure></div></div>`;
  }
  $("#gal").innerHTML = list.slice().reverse().map(p => `
    <div class="ph"><img src="${p.data}" alt="Foto de ${fmtDate(p.date)}"><button data-del="${p.id}" aria-label="Apagar">🗑️</button>
    <div><b>${fmtDate(p.date)}</b>${p.note ? " · " + esc(p.note) : ""}</div></div>`).join("");
  $("#gal").addEventListener("click", async e => {
    const b = e.target.closest("[data-del]"); if (!b) return;
    if (!confirm("Apagar esta foto?")) return;
    await photoOp("readwrite", st => st.delete(Number(b.dataset.del))); renderPhotos();
  });
}

/* ---------- boot ---------- */
if ("serviceWorker" in navigator && location.protocol === "https:") {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
route();
})();
