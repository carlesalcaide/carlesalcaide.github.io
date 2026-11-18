// SardanaDelivery (web). Tota la lògica ve precalculada a dades.js (exporta_web.py).
"use strict";

const D = window.DADES;
const $ = (id) => document.getElementById(id);
const SARDANA = "Sardana", TIRADA = "Una tirada";
const PAGINES = ["Repartidor", "Normes", "Pràctica"];

const estat = {
  pagina: "Repartidor", abast: SARDANA, mida: String(D.midaPerDefecte), estil: D.estils[0],
  mode: D.modes[0], tipus: "Llargs", peu: D.peus[0], curts: 31, llargs: 85, n: 85,
  cmpTipus: "Llargs", cmpMoment: "1r peu",
};

// --- Preferències (només comoditat; si falla, no passa res) --------------------
const CLAU = "sardana-estat";
try { Object.assign(estat, JSON.parse(localStorage.getItem(CLAU) || "{}")); } catch (e) { /* res */ }
function desa() { try { localStorage.setItem(CLAU, JSON.stringify(estat)); } catch (e) { /* res */ } }

// --- Components ----------------------------------------------------------------
function segmentat(el, opcions, clau, onChange) {
  el.innerHTML = "";
  for (const op of opcions) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = op;
    b.className = estat[clau] === op ? "actiu" : "";
    b.onclick = () => { estat[clau] = op; desa(); onChange(); };
    el.appendChild(b);
  }
}

function camp(el, clau) {
  el.innerHTML = `<button type="button" aria-label="menys">−</button>
    <input id="${clau}" type="number" inputmode="numeric" min="0" value="${estat[clau]}">
    <button type="button" aria-label="més">+</button>`;
  const [menys, input, mes] = el.children;
  const posa = (v) => { estat[clau] = Math.max(0, v); input.value = estat[clau]; desa(); actualitza(); };
  menys.onclick = () => posa((parseInt(input.value) || 0) - 1);
  mes.onclick = () => posa((parseInt(input.value) || 0) + 1);
  input.oninput = () => { estat[clau] = parseInt(input.value) || 0; desa(); actualitza(); };
}

const classeTipus = (nom) => (nom.includes("urts") ? "curts" : "llargs");

// --- Repartidor --------------------------------------------------------------------
function resum() {
  if (estat.abast === SARDANA) return `${estat.mida} tirades · ${estat.estil} · ${estat.mode}`;
  return estat.tipus === "Llargs" ? `Una tirada · Llargs · ${estat.peu}` : "Una tirada · Curts";
}

function actualitza() {
  const sardana = estat.abast === SARDANA;
  segmentat($("abast"), [SARDANA, TIRADA], "abast", actualitza);
  segmentat($("mida"), D.mides.map(String), "mida", actualitza);
  segmentat($("estil"), D.estils, "estil", actualitza);
  segmentat($("mode"), D.modes, "mode", actualitza);
  segmentat($("tipus"), ["Curts", "Llargs"], "tipus", actualitza);
  segmentat($("peu"), D.peus, "peu", actualitza);
  $("in-sardana").hidden = $("op-sardana").hidden = $("res-sardana").hidden = !sardana;
  $("in-tirada").hidden = $("op-tirada").hidden = $("res-tirada").hidden = sardana;
  $("op-peu").hidden = estat.tipus !== "Llargs";
  $("resum").textContent = resum();

  if (sardana) {
    const files = $("files");
    files.innerHTML = "";
    const noms = D.noms[estat.mida];
    const ok = estat.curts >= D.minim && estat.llargs >= D.minim;
    const finals = ok ? D.sardana[[estat.estil, estat.mode, estat.mida, estat.curts % 4, estat.llargs % 8].join("|")] : null;
    noms.forEach((nom, i) => {
      const c = classeTipus(nom);
      files.insertAdjacentHTML("beforeend",
        `<span class="punt ${c}"></span><span class="nom">${nom}</span><span class="final ${c}">${finals ? finals[i] : "—"}</span>`);
    });
    if (!ok) files.insertAdjacentHTML("beforeend", `<span class="error nota">Mínim ${D.minim} compassos</span>`);
    if (estat.estil === "Garrotxí") files.insertAdjacentHTML("beforeend",
      `<span class="nom nota">Garrotxí: experimental, pendent de comprovar per un expert. Els curts es reparteixen com a l'empordanès.</span>`);
  } else {
    const ok = estat.n >= D.minim;
    $("una-etiqueta").textContent = `Final de la tirada de ${estat.tipus.toLowerCase()}`;
    const f = $("una-final");
    f.textContent = ok ? D.tirada[[estat.tipus, estat.peu, estat.n % 8].join("|")] : `Mínim ${D.minim} compassos`;
    f.className = "final " + (ok ? classeTipus(estat.tipus) : "error");
  }
}

// --- Normes ------------------------------------------------------------------------------
function normes() {
  const el = $("normes");
  for (const linia of D.normes.split("\n")) {
    const s = linia.trim();
    if (!s) continue;
    const cap = s === s.toUpperCase() && /^[A-ZÀ-Ú]/.test(s);
    const e = document.createElement(cap ? "h2" : "p");
    e.textContent = s;
    el.appendChild(e);
  }
}

// --- Pràctica ------------------------------------------------------------------------------
let ex = null, respost = false, encerts = 0, fets = 0;

function nouExercici() {
  ex = D.exercicis[Math.floor(Math.random() * D.exercicis.length)];
  respost = false;
  $("ex-pregunta").textContent = ex.pregunta;
  $("ex-explicacio").textContent = "";
  const ops = $("ex-opcions");
  ops.innerHTML = "";
  for (const op of [...ex.opcions].sort(() => Math.random() - 0.5)) {
    const b = document.createElement("button");
    b.className = "opcio";
    b.textContent = op;
    b.onclick = () => respon(op);
    ops.appendChild(b);
  }
  punts();
}

function respon(op) {
  if (respost) return;
  respost = true;
  fets++;
  if (op === ex.correcta) encerts++;
  for (const b of $("ex-opcions").children) {
    if (b.textContent === ex.correcta) b.classList.add("ok");
    else if (b.textContent === op) b.classList.add("ko");
  }
  $("ex-explicacio").textContent = (op === ex.correcta ? "Correcte! " : "No ben bé. ") + ex.explicacio;
  punts();
}

function punts() { $("ex-punts").textContent = `Encerts: ${encerts} de ${fets}`; }

// "M'he descomptat?": mateixa regla que comprova_numero() de repartiment.py
function momentDe(tipus, n) { const c = D.cicle[tipus]; return c[n % c.length]; }

function comprova() {
  segmentat($("cmp-tipus"), ["Curts", "Llargs"], "cmpTipus", () => {
    estat.cmpMoment = D.moments[estat.cmpTipus][0]; comprova();
  });
  if (!D.moments[estat.cmpTipus].includes(estat.cmpMoment)) estat.cmpMoment = D.moments[estat.cmpTipus][0];
  segmentat($("cmp-moment"), D.moments[estat.cmpTipus], "cmpMoment", comprova);
  const n = parseInt($("cmp-n").value) || 0, m = estat.cmpMoment, res = $("cmp-res");
  if (n <= 0) { res.textContent = "Escriu el número que comptes."; res.className = "explicacio"; return; }
  const toca = momentDe(estat.cmpTipus, n);
  if (toca === m) {
    res.textContent = `Encaixa: el ${n} és un ${m.toLowerCase()}.`;
    res.className = "explicacio ok-text";
    return;
  }
  let candidats = [];
  for (let d = 1; d < 4 && !candidats.length; d++) {
    candidats = [n - d, n + d].filter((c) => c > 0 && momentDe(estat.cmpTipus, c) === m);
  }
  res.textContent = `No encaixa: el ${n} hauria de ser un ${toca.toLowerCase()}. ` +
    `Segurament vas pel ${candidats.join(" o pel ")}. Pregunta-ho als companys per confirmar-ho.`;
  res.className = "explicacio ko-text";
}

// --- Pàgines ---------------------------------------------------------------------------------
function pagina() {
  segmentat($("pagines"), PAGINES, "pagina", pagina);
  for (const p of PAGINES) $("p-" + p).hidden = estat.pagina !== p;
}

// --- Inici ---------------------------------------------------------------------------------------
camp(document.querySelector('[data-camp="curts"]'), "curts");
camp(document.querySelector('[data-camp="llargs"]'), "llargs");
camp(document.querySelector('[data-camp="n"]'), "n");
$("ex-seguent").onclick = nouExercici;
$("cmp-n").oninput = comprova;
normes();
pagina();
actualitza();
nouExercici();
comprova();

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js").catch(() => { /* sense mode fora de línia */ });
}
