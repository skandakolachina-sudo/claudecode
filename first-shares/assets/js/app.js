/* First Shares · menu, progress, section switching and startup */
(function(FS){
"use strict";

var $ = FS.$, $$ = FS.$$, el = FS.el, fmt = FS.fmt, usd = FS.usd, hashStr = FS.hashStr, seeded = FS.seeded, KEY = FS.KEY, state = FS.state, LESSONS = FS.LESSONS, PRACTICE = FS.PRACTICE, VIEWS = FS.VIEWS, viewLabel = FS.viewLabel;

/* ---------- ticker tape ---------- */
var TAPE = [
  '<span class="k">P/E</span> = PRICE ÷ EPS',
  '<span class="k">MKT CAP</span> = PRICE × SHARES',
  '<span class="k">72</span> ÷ RATE = YEARS TO DOUBLE',
  '<span class="k">YIELD</span> = DIVIDEND ÷ PRICE',
  '<span class="u">▲</span> BULL · RISING FOR MONTHS',
  '<span class="d">▼</span> CORRECTION · DOWN 10%',
  '<span class="d">▼</span> BEAR · DOWN 20%',
  '<span class="d">−50%</span> NEEDS <span class="u">+100%</span>',
  '<span class="k">ETF</span> · A BASKET IN ONE TICKER',
  '<span class="k">FEES</span> COMPOUND TOO',
  '<span class="k">T+1</span> SETTLEMENT',
  '<span class="k">TIME IN</span> &gt; TIMING'
];
var tapeHtml = TAPE.map(function(t){ return '<span class="tape-item">'+t+'</span>'; }).join("");
$("#tape").innerHTML = tapeHtml + tapeHtml;

/* ---------- lesson nav ---------- */
$$(".lesson-nav").forEach(function(box){
  var id = box.getAttribute("data-nav");
  var i = VIEWS.indexOf(id);
  var prev = VIEWS[i-1], next = VIEWS[i+1];
  var html = "";
  html += prev ? '<a class="btn" href="#'+prev+'">← '+viewLabel(prev)+'</a>' : '<span></span>';
  if(next) html += '<a class="btn" href="#'+next+'">'+viewLabel(next)+' →</a>';
  box.innerHTML = html;
});

/* ---------- rail + progress ---------- */
function railLink(item, num){
  var mark = num != null ? num : item.mark;
  return '<a href="#'+item.id+'" data-view="'+item.id+'"><span class="rn">'+mark+'</span><span class="long">'+item.title+'</span><span class="short">'+item.short+'</span><span class="rs" data-status="'+item.id+'"></span></a>';
}
$("#rail").innerHTML =
  '<div class="rail-group"><p class="rail-h">Foundations</p>' + LESSONS.slice(0, 9).map(function(l, i){ return railLink(l, i+1); }).join("") + '</div>' +
  '<div class="rail-group"><p class="rail-h">Going further</p>' + LESSONS.slice(9).map(function(l, i){ return railLink(l, i+10); }).join("") + '</div>' +
  '<div class="rail-group"><p class="rail-h">Practice</p>' + PRACTICE.map(function(p){ return railLink(p); }).join("") + '</div>';

var segs = $("#segs");
segs.innerHTML = LESSONS.map(function(l){ return '<span class="seg" title="Lesson '+l.id.slice(1)+'"></span>'; }).join("");

function refreshProgress(){
  var n = 0;
  LESSONS.forEach(function(l, i){
    var p = !!state.passed[l.id];
    if(p) n++;
    segs.children[i].classList.toggle("on", p);
    $('[data-status="'+l.id+'"]').textContent = p ? "✓" : "";
  });
  $('[data-status="exam"]').textContent = state.exam ? Math.round(state.exam.score / state.exam.total * 100) + "%" : "";
  $('[data-status="game"]').textContent = state.gameBest ? "✓" : "";
  $("#pc-n").textContent = n;
  var c = $("#continue");
  var nextL = LESSONS.filter(function(l){ return !state.passed[l.id]; })[0];
  if(n === 0){ c.textContent = "Start lesson 1 →"; c.href = "#m1"; }
  else if(nextL){ c.textContent = "Continue: Lesson " + nextL.id.slice(1) + " →"; c.href = "#" + nextL.id; }
  else if(!state.exam){ c.textContent = "All lessons passed. Take the final exam →"; c.href = "#exam"; }
  else { c.textContent = "Build your investing plan →"; c.href = "#plan"; }
}
refreshProgress();

/* ---------- routing ---------- */
var currentView = null;
function show(id, scroll){
  if(VIEWS.indexOf(id) < 0) id = "m1";
  $$(".view").forEach(function(s){ s.hidden = s.id !== id; });
  $$("#rail a").forEach(function(a){
    var on = a.getAttribute("data-view") === id;
    if(on) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current");
    if(on && window.matchMedia("(max-width:900px)").matches){
      var rail = $("#rail"); var left = a.offsetLeft - 16;
      if(rail.scrollTo) rail.scrollTo({left: left, behavior: "auto"}); else rail.scrollLeft = left;
    }
  });
  currentView = id;
  try { localStorage.setItem(KEY + ":view", id); } catch(e){}
  if(FS.redraw[id]) FS.redraw[id]();
  setTitle(id);
  if(scroll){ var s = document.getElementById(id); if(s) s.scrollIntoView({block:"start"}); }
}
window.addEventListener("hashchange", function(){ show(location.hash.slice(1), true); });
document.addEventListener("click", function(e){
  var a = e.target.closest && e.target.closest('a[href^="#"]');
  if(a && a.getAttribute("href") === location.hash){ e.preventDefault(); show(location.hash.slice(1), true); }
});

/* ---------- tab title ---------- */
function setTitle(id){
  var l = LESSONS.filter(function(x){ return x.id === id; })[0];
  var p = PRACTICE.filter(function(x){ return x.id === id; })[0];
  var name = l ? "Lesson " + id.slice(1) + ": " + l.title : p ? p.title : "";
  document.title = name ? name + " · First Shares" : "First Shares";
}

/* ---------- theme switch ---------- */
/* "Auto" follows the computer's light or dark setting. The choice is saved for next time. */
var THEME_KEY = KEY + ":theme";
function applyTheme(t){
  if(t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
  else document.documentElement.removeAttribute("data-theme");
  $$("#theme-tabs button").forEach(function(b){
    b.setAttribute("aria-pressed", b.getAttribute("data-theme-set") === (t || "system") ? "true" : "false");
  });
}
var savedTheme = null;
try { savedTheme = localStorage.getItem(THEME_KEY); } catch(e){}
applyTheme(savedTheme);
$$("#theme-tabs button").forEach(function(b){
  b.addEventListener("click", function(){
    var t = b.getAttribute("data-theme-set");
    try { if(t === "system") localStorage.removeItem(THEME_KEY); else localStorage.setItem(THEME_KEY, t); } catch(e){}
    applyTheme(t === "system" ? null : t);
  });
});

/* ---------- progress backup ---------- */
/* Progress lives in this browser's storage. Export saves it to a file; Import loads that file back. */
var bkStatus = $("#bk-status"), bkFile = $("#bk-file"), bkConfirm = $("#bk-confirm");
$("#bk-export").addEventListener("click", function(){
  var payload = {app:"first-shares", version:1, exported:new Date().toISOString(), progress:state};
  var blob = new Blob([JSON.stringify(payload, null, 2)], {type:"application/json"});
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "first-shares-progress-" + new Date().toISOString().slice(0, 10) + ".json";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function(){ URL.revokeObjectURL(a.href); }, 1000);
  bkStatus.textContent = "Your backup file is downloading. Keep it somewhere safe.";
});
$("#bk-import").addEventListener("click", function(){ bkFile.click(); });
bkFile.addEventListener("change", function(){
  var f = bkFile.files && bkFile.files[0];
  if(!f) return;
  var reader = new FileReader();
  reader.onload = function(){
    var data = null;
    try { data = JSON.parse(reader.result); } catch(e){}
    bkFile.value = "";
    if(!data || data.app !== "first-shares" || !data.progress || typeof data.progress !== "object"){
      bkStatus.textContent = "That file isn't a First Shares backup. Choose the .json file you exported.";
      return;
    }
    try { localStorage.setItem(KEY, JSON.stringify(data.progress)); }
    catch(e){ bkStatus.textContent = "This browser is blocking saved data, so the backup couldn't be loaded."; return; }
    bkStatus.textContent = "Backup loaded. Reloading the page…";
    setTimeout(function(){ location.reload(); }, 400);
  };
  reader.onerror = function(){ bkStatus.textContent = "That file couldn't be read. Try exporting it again."; };
  reader.readAsText(f);
});
$("#bk-reset").addEventListener("click", function(){ bkConfirm.hidden = false; $("#bk-reset-yes").focus(); });
$("#bk-reset-no").addEventListener("click", function(){ bkConfirm.hidden = true; $("#bk-reset").focus(); });
$("#bk-reset-yes").addEventListener("click", function(){
  try { localStorage.removeItem(KEY); localStorage.removeItem(KEY + ":view"); } catch(e){}
  location.replace(location.pathname + location.search);
});

/* ---------- redraw charts on resize ---------- */
var rT;
window.addEventListener("resize", function(){ clearTimeout(rT); rT = setTimeout(function(){ if(FS.redraw[currentView]) FS.redraw[currentView](); }, 120); });

/* ---------- first view ---------- */
var startView = location.hash.slice(1);
if(VIEWS.indexOf(startView) < 0){ try { startView = localStorage.getItem(KEY + ":view") || "m1"; } catch(e){ startView = "m1"; } }
show(startView, false);
if(location.hash){
  var jump = function(){ var t = document.getElementById(startView); if(t) t.scrollIntoView({block:"start"}); };
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(jump); else jump();
}

FS.refreshProgress = refreshProgress;
FS.show = show;

})(window.FS);
