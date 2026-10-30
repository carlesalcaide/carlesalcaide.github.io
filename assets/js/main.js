/* Carles Alcaide i Blaya | Lògica del web
   Les dades són a la carpeta data/. Per editar continguts, consulteu GUIA.md. */
(function () {
"use strict";

var DATA_FILES = {
  textos: "data/textos.json",
  publicacions: "data/publicacions.json",
  contribucions: "data/contribucions.json",
  novetats: "data/novetats.json",
  obres: "data/obres.json",
  arxiu: "data/arxiu.csv"
};
var ME = "Alcaide, C.";
var D = {};          // dades carregades
var ready = false;
var lang = "ca";
var current = null, played = false;
var workFilter = "all";
var arxSort = { key: "titol", dir: 1 };

/* ---------- Utilitats ---------- */
function $(s, r) { return (r || document).querySelector(s); }
function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c];
  });
}
function fill(str, vars) {
  return String(str).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; });
}
function t(key, vars) {
  var v = D.textos[lang][key];
  if (v === undefined || v === "") v = D.textos.ca[key];
  if (v === undefined) return key;
  return typeof v === "string" ? fill(v, vars) : v;
}
function plural(key, n, vars) {
  var pair = t(key);
  var v = Array.isArray(pair) ? pair[n === 1 ? 0 : 1] : pair;
  vars = vars || {}; vars.n = n;
  return fill(v, vars);
}
function loc(obj) {            // {ca:"…", en:"…"} → text en l'idioma actual
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj[lang] || obj.ca || "";
}
function locLang(obj) {        // idioma real del text que es mostra
  if (!obj || typeof obj === "string") return "ca";
  return obj[lang] ? lang : "ca";
}
function norm(s) {
  return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘`´]/g, "'").replace(/·/g, "").toLowerCase().trim();
}
function mailto(subject) { return "mailto:" + D.textos.config.correu + "?subject=" + encodeURIComponent(subject); }
function isUrl(s) { return typeof s === "string" && s.trim() !== ""; }
function href(s) { s = s.trim(); try { return encodeURI(decodeURI(s)); } catch (e) { return encodeURI(s); } }
var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

var AWARD_ICON = '<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="6" r="4.4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5.6 9.6 4.6 15 8 13.1 11.4 15l-1-5.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
var PLAY_ICON = '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.8v8.4L10 6z" fill="currentColor"/></svg>';

/* ---------- CSV (accepta ; , o tabulador, i camps entre cometes) ---------- */
function parseCSV(text) {
  text = text.replace(/^\uFEFF/, "");
  var first = text.split(/\r?\n/)[0] || "";
  var cands = [";", ",", "\t"];
  var d = cands.sort(function (a, b) { return first.split(b).length - first.split(a).length; })[0];
  var rows = [], row = [], f = "", q = false;
  for (var i = 0; i < text.length; i++) {
    var ch = text[i];
    if (q) {
      if (ch === "\"") { if (text[i + 1] === "\"") { f += "\""; i++; } else q = false; }
      else f += ch;
    } else if (ch === "\"") q = true;
    else if (ch === d) { row.push(f); f = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(f); rows.push(row); row = []; f = "";
    } else f += ch;
  }
  if (f !== "" || row.length) { row.push(f); rows.push(row); }
  rows = rows.filter(function (r) { return r.some(function (c) { return c.trim() !== ""; }); });
  if (!rows.length) return [];
  var head = rows.shift().map(function (h) { return norm(h).replace(/[^a-z]/g, ""); });
  return rows.map(function (r) {
    var o = {};
    head.forEach(function (h, k) { o[h] = (r[k] || "").trim(); });
    return {
      titol: o.titol || "",
      autor: o.autor || "",
      plantilla: o.plantilla || "",
      material: (o.material || "").split(/[,+]/).map(function (s) { return s.trim(); }).filter(Boolean),
      notes: o.notes || "",
      propia: /^(si|sí|x|yes|1|true)$/i.test(o.propia || "")
    };
  }).filter(function (a) { return a.titol; });
}

/* ---------- Render ---------- */
function renderNews() {
  var items = D.novetats.slice().sort(function (a, b) { return (b.any || 0) - (a.any || 0); });
  $("#news-list").innerHTML = items.map(function (n) {
    var sec = n.seccio === "musica" ? "musica" : "ciencia";
    var secName = sec === "ciencia" ? t("nav.sci") : t("nav.mus");
    return '<li data-sec="' + sec + '"><span class="yr">' + esc(n.any) + '</span><p class="txt">' + (n[lang] || n.ca || "") +
      '</p><a class="sec" href="#' + sec + '">' + esc(secName) + '</a></li>';
  }).join("");
  $(".news").hidden = items.length === 0;
}

function renderScience() {
  var img = $("#photo"); img.alt = t("sci.photoAlt");
  $("#bio").innerHTML = t("sci.bio").map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
  function dl(items) { return items.map(function (i) { return "<dt>" + esc(i[0]) + "</dt><dd>" + esc(i[1]) + "</dd>"; }).join(""); }
  $("#lines").innerHTML = dl(t("sci.lines"));
  $("#projects").innerHTML = dl(t("sci.proj"));

  var pubs = D.publicacions.slice().sort(function (a, b) { return (b.any || 0) - (a.any || 0); });
  $("#pubs-count").textContent = plural("pub.count", pubs.length);
  $("#pubs").innerHTML = pubs.map(function (p) {
    var authors = esc(p.autors).replace(esc(ME), "<strong>" + esc(ME) + "</strong>");
    var fig = isUrl(p.imatge) ? '<figure><img src="' + esc(href(p.imatge)) + '" alt="' + esc(t("pub.figAlt")) + '" loading="lazy" decoding="async"></figure>' : "";
    var link = p.doi ? "https://doi.org/" + p.doi : (p.url || "");
    return '<li class="pub"><span class="yr">' + esc(p.any) + '</span><div>' +
      '<h3 lang="en">' + esc(p.titol) + '</h3>' +
      '<p class="authors">' + authors + '</p>' +
      '<p class="src"><em>' + esc(p.revista) + '</em> ' + esc(p.referencia) + '</p>' +
      '<div class="row">' +
      (link ? '<a class="btn primary" href="' + esc(link) + '" target="_blank" rel="noopener">' + esc(t("pub.read")) + '</a>' : "") +
      (p.doi ? '<span class="doi">doi: ' + esc(p.doi) + '</span>' : "") +
      (p.primer_autor ? '<span class="flag">' + esc(t("pub.first")) + '</span>' : "") +
      '</div></div>' + fig + '</li>';
  }).join("");

  var contribs = D.contribucions.slice().sort(function (a, b) { return (b.any || 0) - (a.any || 0); });
  $("#contribs").innerHTML = contribs.map(function (c) {
    var type = D.textos[lang]["contrib." + c.tipus] || D.textos.ca["contrib." + c.tipus] || c.tipus || "";
    return '<li class="contrib"><span class="yr">' + esc(c.any) + '</span><div>' +
      '<p class="ev" lang="en">' + esc(c.esdeveniment) + '</p>' +
      (type ? '<p class="ty">' + esc(type) + '</p>' : "") +
      '<p class="ti" lang="en">' + esc(c.titol) + '</p>' +
      (isUrl(c.pdf) ? '<a class="btn" href="' + esc(href(c.pdf)) + '" target="_blank" rel="noopener">' + esc(t("contrib.pdf")) + '</a>' : "") +
      '</div></li>';
  }).join("");

  $("#path").innerHTML = t("path").map(function (p) {
    return '<li><span class="yr">' + esc(p[0]) + '</span><div><h3>' + esc(p[1]) + '</h3><p>' + esc(p[2]) + '</p></div></li>';
  }).join("");
}

var CATS = [
  { id: "all", test: function () { return true; } },
  { id: "sardanes", test: function (w) { return w.tipus === "sardana" || w.tipus === "obligada"; } },
  { id: "obligada", test: function (w) { return w.tipus === "obligada"; } },
  { id: "banda", test: function (w) { return w.tipus === "banda"; } },
  { id: "arranjament", test: function (w) { return w.tipus === "arranjament"; } },
  { id: "altres", test: function (w) { return ["sardana", "obligada", "banda", "arranjament"].indexOf(w.tipus) < 0; } }
];
function renderWorkFilters() {
  // Només es mostren els filtres que tenen obres
  var cats = CATS.filter(function (c) { return c.id === "all" || D.obres.some(c.test); });
  if (!cats.some(function (c) { return c.id === workFilter; })) workFilter = "all";
  $("#work-filters").innerHTML = cats.map(function (c) {
    return '<button type="button" class="chip" data-cat="' + c.id + '" aria-pressed="' + (c.id === workFilter) + '">' + esc(t("cat." + c.id)) + '</button>';
  }).join("");
}
function renderWorks() {
  var bio = t("mus.bio");
  var bioEl = $("#mus-bio"); bioEl.textContent = bio; bioEl.hidden = !bio;

  var test = CATS.filter(function (c) { return c.id === workFilter; })[0].test;
  var list = D.obres.filter(test);
  var years = [];
  list.forEach(function (w) { if (years.indexOf(w.any) < 0) years.push(w.any); });
  years.sort(function (a, b) { return b - a; });
  $("#works-status").textContent = plural("w.count", list.length);

  $("#works").innerHTML = years.map(function (y) {
    var items = list.filter(function (w) { return w.any === y; }).map(function (w) {
      var kindKey = "kind." + (["sardana", "obligada", "banda", "arranjament"].indexOf(w.tipus) >= 0 ? w.tipus : "altres");
      var kind = esc(w.tipus_text ? loc(w.tipus_text) : t(kindKey));
      if (w.solistes && loc(w.solistes)) kind += "<br><b>" + esc(loc(w.solistes)) + "</b>";
      var meta = [];
      if (w.original) meta.push(esc(t("w.original", { autor: w.original })));
      if (w.durada) meta.push(esc(t("w.duration", { durada: w.durada })));
      if (w.estrena && loc(w.estrena)) meta.push(esc(loc(w.estrena)));
      var ded = loc(w.dedicatoria);

      var actions = "";
      if (w.estat === "properament") actions = '<span class="soon">' + esc(t("w.soon")) + '</span>';
      else {
        if (isUrl(w.audio)) actions += '<a class="btn primary" href="' + esc(href(w.audio)) + '" target="_blank" rel="noopener">' + PLAY_ICON + esc(t("w.listen")) + '</a>';
        if (isUrl(w.partitura)) actions += '<a class="btn" href="' + esc(href(w.partitura)) + '" target="_blank" rel="noopener">' + esc(t("w.score")) + '</a>';
        if (isUrl(w.particelles)) actions += '<a class="btn" href="' + esc(href(w.particelles)) + '" target="_blank" rel="noopener">' + esc(t("w.parts")) + '</a>';
        if (!isUrl(w.partitura) && !isUrl(w.particelles)) actions += '<a class="btn" href="' + esc(mailto(t("w.subject", { titol: w.titol }))) + '">' + esc(t("w.ask")) + '</a>';
      }
      return '<article class="work"><div>' +
        '<h3 lang="ca">' + esc(w.titol) + '</h3>' +
        '<p class="kind">' + kind + '</p>' +
        meta.map(function (m) { return '<p class="meta-line">' + m + '</p>'; }).join("") +
        (ded ? '<p class="ded" lang="' + locLang(w.dedicatoria) + '">' + esc(ded) + '</p>' : "") +
        (w.premi && loc(w.premi) ? '<span class="award">' + AWARD_ICON + esc(loc(w.premi)) + '</span>' : "") +
        '</div><div class="actions">' + actions + '</div></article>';
    }).join("");
    return '<section class="ygroup" aria-label="' + esc(y) + '"><div class="ylabel">' + esc(y) + '</div><div>' + items + '</div></section>';
  }).join("");
}

function trPlant(p) { return (D.textos[lang].plantilles || {})[p] || p; }
function trMat(m) { return (D.textos[lang].materials || {})[m] || m; }
function renderArxSelects() {
  var plants = [], mats = [];
  D.arxiu.forEach(function (a) {
    if (a.plantilla && plants.indexOf(a.plantilla) < 0) plants.push(a.plantilla);
    a.material.forEach(function (m) { if (mats.indexOf(m) < 0) mats.push(m); });
  });
  plants.sort(function (a, b) { return a.localeCompare(b, "ca"); });
  var sp = $("#f-plant"), sm = $("#f-mat"), vp = sp.value, vm = sm.value;
  sp.innerHTML = '<option value="">' + esc(t("arx.anyP")) + '</option>' + plants.map(function (p) { return '<option value="' + esc(p) + '">' + esc(trPlant(p)) + '</option>'; }).join("");
  sm.innerHTML = '<option value="">' + esc(t("arx.anyM")) + '</option>' + mats.map(function (m) { return '<option value="' + esc(m) + '">' + esc(trMat(m)) + '</option>'; }).join("");
  sp.value = vp; sm.value = vm;
}
function sortKey(s) { return norm(s).replace(/^(la |el |les |els |l')/, ""); }
function renderArchive() {
  var q = norm($("#q").value), fp = $("#f-plant").value, fm = $("#f-mat").value;
  var rows = D.arxiu.filter(function (a) {
    if (fp && a.plantilla !== fp) return false;
    if (fm && a.material.indexOf(fm) < 0) return false;
    if (q && norm(a.titol + " " + a.autor).indexOf(q) < 0) return false;
    return true;
  });
  rows.sort(function (x, y) {
    var r = sortKey(x[arxSort.key]).localeCompare(sortKey(y[arxSort.key]), "ca");
    if (r === 0) r = sortKey(x.titol).localeCompare(sortKey(y.titol), "ca");
    return r * arxSort.dir;
  });
  $$("th[data-sort]").forEach(function (th) {
    th.setAttribute("aria-sort", th.getAttribute("data-sort") === arxSort.key ? (arxSort.dir > 0 ? "ascending" : "descending") : "none");
  });
  $("#arx-body").innerHTML = rows.map(function (a) {
    var mats = a.material.map(trMat).join(", ");
    var note = a.propia ? '<span class="own">' + esc(t("own")) + '</span>' : esc(a.notes);
    if (a.propia && a.notes) note += " " + esc(a.notes);
    return '<tr><td class="t" lang="ca">' + esc(a.titol) + '</td>' +
      '<td data-label="' + esc(t("arx.col.c")) + '">' + esc(a.autor) + '</td>' +
      '<td data-label="' + esc(t("arx.col.p")) + '">' + esc(trPlant(a.plantilla)) + '</td>' +
      '<td data-label="' + esc(t("arx.col.m")) + '">' + esc(mats) + '</td>' +
      '<td class="n" lang="ca"' + (note ? ' data-label="' + esc(t("arx.col.n")) + '"' : "") + '>' + note + '</td>' +
      '<td class="a"><a href="' + esc(mailto(t("arx.subject", { titol: a.titol }))) + '" aria-label="' + esc(t("arx.askAria", { titol: a.titol })) + '">' + esc(t("arx.ask")) + '</a></td></tr>';
  }).join("");
  var empty = $("#arx-empty");
  empty.hidden = rows.length > 0;
  empty.textContent = t("arx.empty");
  $("#arx-status").textContent = rows.length === D.arxiu.length
    ? plural("arx.count", rows.length)
    : t("arx.countFiltered", { n: rows.length, total: D.arxiu.length });
}

function renderContact() {
  var mail = D.textos.config.correu;
  var a = $("#mail"); a.href = "mailto:" + mail; a.textContent = mail;
  $("#elsewhere").innerHTML = (D.textos.config.xarxes || []).map(function (x) {
    return '<li><a href="' + esc(x.url) + '" target="_blank" rel="noopener">' + esc(x.nom) + '</a></li>';
  }).join("");
}

function applyLang() {
  document.documentElement.lang = lang;
  $$("[data-i18n]").forEach(function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
  $$("[data-i18n-aria]").forEach(function (el) { el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria"))); });
  $$("[data-i18n-ph]").forEach(function (el) { el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph"))); });
  $$(".lang button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang)); });
  renderNews(); renderScience(); renderWorkFilters(); renderWorks(); renderArxSelects(); renderArchive(); renderContact();
  setTitle(current);
}

/* ---------- Navegació ---------- */
var VIEWS = ["inici", "ciencia", "musica", "arxiu"];
function setTitle(v) {
  var name = "Carles Alcaide i Blaya";
  if (!D.textos) { document.title = name; return; }
  var map = { ciencia: t("nav.sci"), musica: t("nav.mus"), arxiu: t("door.arx.t") };
  document.title = map[v] ? (map[v] + " | " + name) : name;
}
function show(initial) {
  var v = location.hash.slice(1);
  if (VIEWS.indexOf(v) < 0) v = "inici";
  if (v === current) return;
  current = v;
  $$(".view").forEach(function (s) { s.hidden = s.getAttribute("data-view") !== v; });
  document.body.setAttribute("data-view", v);
  $$(".nav a[data-sec]").forEach(function (a) {
    if (a.getAttribute("data-sec") === v) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
  setTitle(v);
  if (v === "inici" && !played && !reduceMotion) {
    played = true;
    var sc = $("#score"); sc.classList.add("play");
    setTimeout(function () { sc.classList.remove("play"); }, 4200);
  }
  if (!initial) {
    window.scrollTo(0, 0);
    var h = $("#h-" + v); if (h) h.focus({ preventScroll: true });
  }
}
function fitScore() {
  var svg = $("#score svg");
  var narrow = window.matchMedia("(max-width: 640px)").matches;
  svg.setAttribute("viewBox", svg.getAttribute(narrow ? "data-narrow" : "data-wide"));
}

/* ---------- Esdeveniments ---------- */
function bindEvents() {
  window.addEventListener("hashchange", function () { show(false); });
  window.addEventListener("resize", fitScore);
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-lang]");
    if (b) {
      lang = b.getAttribute("data-lang");
      try { localStorage.setItem("ca-web-lang", lang); } catch (err) { /* sense emmagatzematge */ }
      if (ready) applyLang(); return;
    }
    var c = e.target.closest(".chip[data-cat]");
    if (c) {
      workFilter = c.getAttribute("data-cat"); renderWorkFilters(); renderWorks();
      var again = $('.chip[data-cat="' + workFilter + '"]'); if (again) again.focus();
      return;
    }
    var j = e.target.closest("[data-jump]");
    if (j) {
      var sec = document.getElementById(j.getAttribute("data-jump"));
      sec.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      var h2 = $("h2", sec); if (h2) h2.focus({ preventScroll: true });
      return;
    }
    if (e.target.closest("[data-contact]")) {
      $("#contacte").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      $("#h-contacte").focus({ preventScroll: true });
      return;
    }
    if (e.target.closest("[data-skip]")) { $("#h-" + current).focus(); return; }
    var s = e.target.closest("th[data-sort] button");
    if (s) {
      var key = s.parentNode.getAttribute("data-sort");
      if (arxSort.key === key) arxSort.dir *= -1; else { arxSort.key = key; arxSort.dir = 1; }
      renderArchive();
    }
  });
  function onFilter() { if (ready) renderArchive(); }
  $("#q").addEventListener("input", onFilter);
  $("#f-plant").addEventListener("change", onFilter);
  $("#f-mat").addEventListener("change", onFilter);
}

/* ---------- Càrrega de dades ---------- */
function load(name, path) {
  return fetch(path, { cache: "no-cache" }).then(function (r) {
    if (!r.ok) throw new Error("no s’ha trobat el fitxer (" + r.status + ")");
    return r.text();
  }).then(function (txt) {
    if (/\.csv$/.test(path)) return parseCSV(txt);
    try { return JSON.parse(txt); }
    catch (err) { throw new Error("error de format: " + err.message); }
  }).then(function (v) { D[name] = v; }, function (err) {
    err.file = path; throw err;
  });
}
function showError(err) {
  var box = document.createElement("div");
  box.className = "load-error";
  box.setAttribute("role", "alert");
  var local = location.protocol === "file:";
  box.innerHTML = "<p>" + (local
    ? "Aquest web s’ha d’obrir amb un servidor local per poder llegir les dades. Consulteu l’apartat «Veure el web al teu ordinador» de GUIA.md."
    : "No s’ha pogut carregar <code>" + esc(err.file || "") + "</code>: " + esc(err.message) + ". Reviseu el fitxer (vegeu GUIA.md).") + "</p>";
  document.querySelector("main").prepend(box);
}

function init() {
  try {
    var saved = localStorage.getItem("ca-web-lang");
    if (saved === "ca" || saved === "en") lang = saved;
    else if (!/^(ca|es)/i.test(navigator.language || "")) lang = "en";
  } catch (e) {
    if (!/^(ca|es)/i.test(navigator.language || "")) lang = "en";
  }
  fitScore();
  show(true);
  bindEvents();
  Promise.all(Object.keys(DATA_FILES).map(function (k) { return load(k, DATA_FILES[k]); }))
    .then(function () { ready = true; applyLang(); })
    .catch(function (err) { console.error(err); showError(err); });
}
init();
})();
