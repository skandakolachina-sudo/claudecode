/* First Shares · lesson tools */
(function(FS){
"use strict";

var $ = FS.$, $$ = FS.$$, el = FS.el, fmt = FS.fmt, usd = FS.usd, hashStr = FS.hashStr, seeded = FS.seeded, state = FS.state, save = FS.save, num = FS.num, GLOSSARY = FS.GLOSSARY, project = FS.project, short$ = FS.short$, lineChart = FS.lineChart;

/* ---------- glossary and key terms ---------- */

$$(".keyterms").forEach(function(box){
  var n = +box.getAttribute("data-lesson");
  var items = GLOSSARY.filter(function(g){ return g[2] === n; });
  box.innerHTML = '<h3>Key terms</h3><dl class="kt">' + items.map(function(g){
    return '<div><dt>'+g[0]+'</dt><dd>'+g[1]+'</dd></div>';
  }).join("") + '</dl>';
});

function renderGlossary(q){
  q = (q||"").trim().toLowerCase();
  var items = GLOSSARY.filter(function(g){ return !q || g[0].toLowerCase().indexOf(q) > -1 || g[1].toLowerCase().indexOf(q) > -1; })
    .sort(function(a,b){ return a[0].localeCompare(b[0], "en", {numeric:true}); });
  var box = $("#gloss-list");
  if(!items.length){ box.innerHTML = '<p class="g-empty">No terms match "'+q.replace(/[<>&]/g,"")+'". Try a shorter word.</p>'; return; }
  var groups = {};
  items.forEach(function(g){ var c = g[0][0].toUpperCase(); if(!/[A-Z]/.test(c)) c = "#"; (groups[c] = groups[c] || []).push(g); });
  box.innerHTML = Object.keys(groups).sort(function(a,b){ return a === "#" ? -1 : b === "#" ? 1 : a.localeCompare(b); }).map(function(k){
    return '<p class="g-letter">'+k+'</p><dl class="g-list">' + groups[k].map(function(g){
      return '<div class="g-item"><dt>'+g[0]+'</dt><dd>'+g[1]+' <a href="#m'+g[2]+'">Lesson '+g[2]+'</a></dd></div>';
    }).join("") + '</dl>';
  }).join("");
}
$("#g-count").textContent = "Reference · " + GLOSSARY.length + " terms";
renderGlossary("");
$("#gloss-q").addEventListener("input", function(e){ renderGlossary(e.target.value); });

/* ---------- lesson 3: quote board ---------- */
var QUOTE = {
  price: "<b>Last price, $48.20.</b> The price of the most recent trade. During market hours, it can change every second.",
  prev: "<b>Previous close, $47.34.</b> Where the stock ended the last trading day. Today's change is measured from here: 48.20 − 47.34 = +$0.86, and 0.86 ÷ 47.34 = +1.82%.",
  open: "<b>Open, $47.50.</b> The first trade today. It can differ from the previous close when news comes out overnight.",
  day: "<b>Day range.</b> The lowest and highest prices so far today.",
  wk: "<b>52-week range.</b> The lowest and highest prices over the past year. At $48.20, TRLH is about 9% below its one-year high of $52.75.",
  vol: "<b>Volume, 3.2 million.</b> Shares traded today. It's above the 2.7 million average, which often means news or extra interest.",
  avg: "<b>Average volume.</b> A typical day's trading. High-volume stocks usually have tight spreads, so they're cheaper to trade.",
  cap: "<b>Market cap, $6.1 billion.</b> Share price × shares outstanding: about 126 million shares × $48.20. That makes TRLH a mid-cap company.",
  pe: "<b>P/E, 21.4.</b> Price ÷ earnings per share: $48.20 ÷ $2.25 ≈ 21.4. Investors pay about $21 for each $1 of yearly profit. TTM means trailing twelve months.",
  eps: "<b>EPS, $2.25.</b> Earnings per share over the last twelve months: the company's profit divided by its shares.",
  yld: "<b>Dividend yield, 1.66%.</b> TRLH pays $0.80 a share each year. $0.80 ÷ $48.20 ≈ 1.66%, so owning $1,000 of it would pay about $16.60 a year."
};
$$("#quote .qf").forEach(function(b){
  b.addEventListener("click", function(){
    $$("#quote .qf").forEach(function(x){ x.classList.toggle("on", x === b); });
    $("#quote-explain").innerHTML = QUOTE[b.getAttribute("data-f")];
  });
});

/* ---------- lesson 7: growth calculator ---------- */
var calcData = [];
function drawCalc(){
  var start = num("#c-start"), monthly = num("#c-monthly"), years = +$("#c-years").value, rate = +$("#c-rate").value;
  $("#c-years-v").textContent = years;
  $("#c-rate-v").textContent = rate + "%";
  calcData = project(start, monthly, years, rate);
  var last = calcData[calcData.length - 1];
  $("#c-final").textContent = usd(last.v);
  $("#c-in").textContent = usd(last.p);
  $("#c-growth").textContent = usd(last.v - last.p);
  var share = last.v > 0 ? Math.round((last.v - last.p) / last.v * 100) : 0;
  $("#c-sum").textContent = "After " + years + " year" + (years === 1 ? "" : "s") + ", " + share + "% of the balance is growth you never had to put in yourself.";
  drawCalcChart();
  var rows = calcData.filter(function(d){ return d.y % 5 === 0 || d.y === years; });
  $("#c-table").innerHTML = '<thead><tr><th>Year</th><th class="r">You put in</th><th class="r">Account value</th><th class="r">Growth</th></tr></thead><tbody>' +
    rows.map(function(d){ return '<tr><td>'+d.y+'</td><td class="r">'+usd(d.p)+'</td><td class="r">'+usd(d.v)+'</td><td class="r">'+usd(d.v - d.p)+'</td></tr>'; }).join("") + '</tbody>';
}

["#c-start","#c-monthly","#c-years","#c-rate"].forEach(function(s){ $(s).addEventListener("input", drawCalc); });

function drawCalcChart(){
  var years = calcData.length - 1;
  lineChart({svg:$("#c-chart"), box:$("#c-chart-box"), tip:$("#c-tip"), n:calcData.length, from0:true, endLabels:true,
    series:[
      {name:"Value", c:1, area:true, values:calcData.map(function(d){ return d.v; })},
      {name:"Put in", c:2, area:true, values:calcData.map(function(d){ return d.p; })}
    ],
    fmtAxis:function(v){ return short$(v); }, fmtEnd:short$, fmtTip:function(v){ return usd(v); },
    xLabel:function(i, narrow){
      var step = years <= 10 ? 1 : years <= 20 ? 5 : 10;
      if(narrow && years > 10) step = years <= 30 ? 10 : 20;
      return i % step === 0 ? (i === 0 ? "Now" : "Yr " + i) : null;
    },
    tipTitle:function(i){ return i === 0 ? "Now" : "Year " + i; },
    tipExtra:function(i){ var d = calcData[i]; return '<div><span>Growth</span><strong>'+usd(d.v - d.p)+'</strong></div>'; }
  });
}

/* ---------- lesson 10: practice price chart ---------- */
function gauss(rand){ var u = 1 - rand(), v = rand(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
var PX = (function(){
  var rand = seeded(512), days = 1260, lp = 0, c = [];
  for (var i = 0; i < days; i++){
    var mu = 0.0007;
    if(i > 330 && i < 420) mu = -0.0045;
    if(i >= 420 && i < 520) mu = 0.0022;
    lp += mu + 0.016 * gauss(rand); c.push(lp);
  }
  var k = Math.log(63.40) - c[days - 1];
  c = c.map(function(v){ return Math.exp(v + k); });
  var prev = c[days - 2], end = c[days - 1], n = 79, walk = [0], intra = [];
  for (var j = 1; j < n; j++) walk.push(walk[j - 1] + gauss(rand) * 0.0016);
  for (var q = 0; q < n; q++){ var t = q / (n - 1); intra.push(prev * Math.exp(t * Math.log(end / prev) + walk[q] - t * walk[n - 1])); }
  return {c:c, intra:intra};
})();
function movingAvg(arr, n){ var out = [], s = 0; for (var i = 0; i < arr.length; i++){ s += arr[i]; if(i >= n) s -= arr[i - n]; out.push(i >= n - 1 ? s / n : null); } return out; }
var PX_MA50 = movingAvg(PX.c, 50), PX_MA200 = movingAvg(PX.c, 200);
var pxTf = "1Y";
function agoLabel(k){
  if(k === 0) return "Today";
  if(k < 5) return k + (k === 1 ? " day ago" : " days ago");
  if(k < 42) return Math.round(k / 5) + " weeks ago";
  if(k < 252) return Math.round(k / 21) + " months ago";
  return (k / 252).toFixed(1).replace(/\.0$/, "") + " years ago";
}
function maxDrop(a){ var pk = a[0], m = 0; a.forEach(function(v){ if(v > pk) pk = v; if(v / pk - 1 < m) m = v / pk - 1; }); return m; }
var PX_NOTES = {
  "1D":"<b>One day.</b> Lots of zigzags from ordinary buying and selling. It says almost nothing about the business.",
  "1M":"<b>One month.</b> Still mostly noise, although news like an earnings report can show up as a sudden jump.",
  "1Y":"<b>One year.</b> A trend starts to show. Turn on the moving average to smooth out the zigzags.",
  "5Y":"<b>Five years.</b> The long-term trend is clear, and so is the big drop along the way. Could you have held on through it?"
};
function drawPx(){
  var c = PX.c, N = c.length, vals, ma = null, maName = "", n, base, xLabel, tipTitle;
  var maOn = $("#px-ma").checked && pxTf !== "1D";
  if(pxTf === "1D"){
    vals = PX.intra; n = vals.length; base = c[N - 2];
    var ticks = {0:"9:30", 18:"11:00", 36:"12:30", 54:"2:00", 72:"3:30"};
    xLabel = function(i){ return ticks[i] != null ? ticks[i] : null; };
    tipTitle = function(i){ var mins = 570 + 5 * i, h = Math.floor(mins / 60), mm = mins % 60; return (h > 12 ? h - 12 : h) + ":" + (mm < 10 ? "0" : "") + mm + (h >= 12 ? " p.m." : " a.m."); };
  } else {
    var span = pxTf === "1M" ? 21 : pxTf === "1Y" ? 252 : N, stepD = pxTf === "5Y" ? 5 : 1;
    var idx = [];
    for (var i = N - span; i < N; i += stepD) idx.push(i);
    if(idx[idx.length - 1] !== N - 1) idx.push(N - 1);
    vals = idx.map(function(i){ return c[i]; });
    var src = pxTf === "5Y" ? PX_MA200 : PX_MA50;
    maName = pxTf === "5Y" ? "200-day average" : "50-day average";
    if(maOn) ma = idx.map(function(i){ return src[i]; });
    n = vals.length; base = c[Math.max(0, N - span - 1)];
    if(pxTf === "5Y") base = c[0];
    var lab = pxTf === "1M" ? {0:"4 wk ago", 5:"3 wk", 10:"2 wk", 15:"1 wk"} : null;
    xLabel = function(i, narrow){
      var ago = N - 1 - idx[i];
      if(i === n - 1) return "Today";
      if(lab) return lab[i] != null && !(narrow && (i === 5 || i === 15)) ? lab[i] : null;
      if(pxTf === "1Y"){ var mo = {252:"1 yr ago", 189:"9 mo", 126:"6 mo", 63:"3 mo"}; if(i === 0) return "1 yr ago"; return !narrow && mo[ago] ? mo[ago] : (narrow && ago === 126 ? "6 mo" : null); }
      if(i === 0) return "5 yr ago";
      var b = Math.floor((N - 1 - idx[i - 1]) / 252);
      return b !== Math.floor(ago / 252) && b >= 1 && b <= 4 && (!narrow || b % 2 === 0) ? b + " yr" : null;
    };
    tipTitle = function(i){ return agoLabel(N - 1 - idx[i]); };
  }
  $("#px-ma").disabled = pxTf === "1D";
  $("#px-ma-label").textContent = pxTf === "1D" ? "Moving average (not for 1D)" : "Show " + maName;
  var series = [{name:"Price", c:1, values:vals}];
  if(ma) series.push({name: maName.charAt(0).toUpperCase() + maName.slice(1), c:2, values:ma});
  $("#px-legend").innerHTML = '<span><i style="background:var(--series-1)"></i>Price</span>' + (ma ? '<span><i style="background:var(--series-2)"></i>' + series[1].name + '</span>' : "");
  lineChart({svg:$("#px-svg"), box:$("#px-box"), tip:$("#px-tip"), n:n, from0:false, series:series,
    fmtAxis:function(v, step){ return "$" + fmt(v, step < 1 ? (step < 0.1 ? 2 : 1) : 0); },
    fmtTip:function(v){ return "$" + fmt(v, 2); }, xLabel:xLabel, tipTitle:tipTitle});
  var chg = (vals[n - 1] / base - 1) * 100, dd = maxDrop(vals) * 100;
  var chgEl = $("#px-chg");
  chgEl.className = "px-chg num " + (chg >= 0 ? "up" : "down");
  chgEl.textContent = (chg >= 0 ? "▲ +" : "▼ −") + fmt(Math.abs(chg), 2) + "% · " + pxTf;
  $("#px-note").innerHTML = PX_NOTES[pxTf] + ' Change over this period: <b class="' + (chg >= 0 ? "up" : "down") + '">' + (chg >= 0 ? "+" : "−") + fmt(Math.abs(chg), 1) + '%</b>. Biggest drop from a high: <b class="down">−' + fmt(Math.abs(dd), 1) + '%</b>.';
}
$$("#px .tabs button").forEach(function(b){
  b.addEventListener("click", function(){
    pxTf = b.getAttribute("data-tf");
    $$("#px .tabs button").forEach(function(x){ x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    drawPx();
  });
});
$("#px-ma").addEventListener("change", drawPx);

(function(){
  var d = [99.0, 99.2, 99.1, 99.4, 99.3, 99.6, 99.5, 99.8, 99.9, 100.0];
  function mini(title, lo, hi, ticks, cap){
    var W = 280, H = 150, m = {l:46, r:10, t:10, b:12}, iw = W - m.l - m.r, ih = H - m.t - m.b;
    function x(i){ return m.l + i / (d.length - 1) * iw; }
    function y(v){ return m.t + ih - (v - lo) / (hi - lo) * ih; }
    var s = '<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+title+'"><g class="grid">';
    ticks.forEach(function(t){ s += '<line x1="'+m.l+'" x2="'+(W - m.r)+'" y1="'+y(t).toFixed(1)+'" y2="'+y(t).toFixed(1)+'"/>'; });
    s += '</g><g class="axis">';
    ticks.forEach(function(t){ s += '<text x="'+(m.l - 6)+'" y="'+(y(t) + 4).toFixed(1)+'" text-anchor="end">$'+(t % 1 ? t.toFixed(1) : t)+'</text>'; });
    s += '</g><path class="l1" d="'+d.map(function(v, i){ return (i ? "L" : "M") + x(i).toFixed(1) + "," + y(v).toFixed(1); }).join("")+'"/></svg>';
    return '<figure class="mini">' + s + '<figcaption><strong>' + title + '.</strong> ' + cap + '</figcaption></figure>';
  }
  $("#axis-demo").innerHTML =
    mini("Axis from $98.90 to $100.10", 98.9, 100.1, [99, 99.5, 100], "Looks like a rocket.") +
    mini("Axis from $0", 0, 120, [0, 40, 80, 120], "The same move: about 1%.");
})();

/* ---------- lesson 11: headlines ---------- */
var HEADLINES = [
  ["Stocks slide as Fed signals more rate hikes", "The Fed hinted it will raise interest rates again.", "Higher rates make borrowing pricier and make savings and bonds more attractive, so investors paid less for stocks."],
  ["Markets rally after inflation cools more than expected", "Prices rose more slowly than forecasters predicted.", "Cooler inflation makes rate cuts more likely, and investors like cheaper borrowing."],
  ["Strong jobs report sends stocks lower", "Companies hired many more people than expected.", "A hot job market can push inflation up and keep the Fed from cutting rates. Good news for workers, bad news for rate hopes."],
  ["Retailer's shares jump despite falling sales", "Sales dropped, but by less than analysts expected, or the company raised its forecast.", "Prices move on results compared with expectations, not on whether the news sounds good."],
  ["Treasury yields climb to multi-year high", "Interest rates on US government bonds rose to their highest level in years.", "Safe bonds now pay more, which competes with stocks for investors' money."],
  ["Recession fears hit airline and hotel stocks; utilities hold up", "Investors worry the economy is slowing.", "Cyclical companies tied to travel and spending fell. Defensive companies selling necessities held steady."]
];
$("#heads").innerHTML = HEADLINES.map(function(h, i){
  return '<div class="head"><p class="head-h">' + h[0] + '</p><button type="button" class="btn head-btn" aria-expanded="false" aria-controls="head-a' + i + '">Translate</button>' +
    '<div class="head-a" id="head-a' + i + '" hidden><p><span>What it means</span>' + h[1] + '</p><p><span>Why stocks moved</span>' + h[2] + '</p></div></div>';
}).join("");
$$("#heads .head-btn").forEach(function(b){
  b.addEventListener("click", function(){
    var a = document.getElementById(b.getAttribute("aria-controls")), open = a.hidden;
    a.hidden = !open; b.setAttribute("aria-expanded", open ? "true" : "false"); b.textContent = open ? "Hide" : "Translate";
  });
});

/* ---------- lesson 12: budget builder ---------- */
var BUDGET = [
  {label:"Needs", c:1, items:[["b-phone","Phone bill",25],["b-ride","Gas or bus fare",40]]},
  {label:"Wants", c:2, items:[["b-food","Food and snacks out",80],["b-clothes","Clothes",40],["b-subs","Games and subscriptions",25],["b-fun","Fun with friends",60]]},
  {label:"Save and invest", c:3, items:[["b-emerg","Emergency fund",50],["b-goal","Saving for a goal",30],["b-invest","Investing",40]]},
  {label:"Give", c:4, items:[["b-give","Giving and gifts",10]]}
];
var bSaved = state.budget || {};
function bVal(id, d){ return bSaved[id] != null ? bSaved[id] : d; }
$("#budget").innerHTML =
  '<div class="b-top">' +
    '<div class="field"><label for="b-income">Monthly income after taxes</label><div class="money"><input type="number" id="b-income" min="0" step="10" value="' + bVal("b-income", 400) + '"></div></div>' +
    '<div class="field"><label for="b-age">Your age</label><input type="number" id="b-age" min="10" max="25" value="' + bVal("b-age", 16) + '"></div>' +
  '</div><div class="b-groups">' +
  BUDGET.map(function(g, gi){
    return '<div class="b-group"><p class="b-gh"><span class="swatch sw' + g.c + '"></span>' + g.label + '<span class="b-gt num" id="b-gt' + gi + '"></span></p>' +
      g.items.map(function(it){ return '<div class="b-row"><label for="' + it[0] + '">' + it[1] + '</label><div class="money"><input type="number" id="' + it[0] + '" min="0" step="5" value="' + bVal(it[0], it[2]) + '"></div></div>'; }).join("") + '</div>';
  }).join("") +
  '</div><div class="b-bar" id="b-bar" role="img" aria-label="Where the money goes"></div><div class="b-legend" id="b-legend"></div>' +
  '<div class="calc-out">' +
    '<div class="stat"><div class="sl">Left to assign</div><div class="sv num" id="b-left">$0</div></div>' +
    '<div class="stat"><div class="sl">Saving and investing rate</div><div class="sv num" id="b-rate">0%</div></div>' +
    '<div class="stat"><div class="sl">Your investing by 65, at 7%</div><div class="sv num" id="b-proj">$0</div></div>' +
  '</div><p class="calc-sum" id="b-msg"></p>';
function budgetVal(id){ var v = parseFloat($("#" + id).value); return isFinite(v) && v > 0 ? v : 0; }
function renderBudget(){
  var income = budgetVal("b-income"), age = Math.round(budgetVal("b-age")) || 16;
  var totals = BUDGET.map(function(g){ return g.items.reduce(function(s, it){ return s + budgetVal(it[0]); }, 0); });
  var spent = totals.reduce(function(a, b){ return a + b; }, 0), left = income - spent, scale = Math.max(income, spent) || 1;
  totals.forEach(function(t, gi){ $("#b-gt" + gi).textContent = usd(t); });
  $("#b-bar").innerHTML = totals.map(function(t, gi){ return t > 0 ? '<span class="b-seg s' + BUDGET[gi].c + '" style="width:' + (t / scale * 100).toFixed(2) + '%" title="' + BUDGET[gi].label + ': ' + usd(t) + '"></span>' : ""; }).join("") +
    (left > 0 ? '<span class="b-seg free" style="width:' + (left / scale * 100).toFixed(2) + '%" title="Unassigned: ' + usd(left) + '"></span>' : "");
  $("#b-legend").innerHTML = BUDGET.map(function(g, gi){ return '<span><i class="swatch sw' + g.c + '"></i>' + g.label + ' <b>' + usd(totals[gi]) + '</b> ' + (income ? Math.round(totals[gi] / income * 100) + "%" : "") + '</span>'; }).join("") +
    (left > 0 ? '<span><i class="swatch sw-free"></i>Unassigned <b>' + usd(left) + '</b></span>' : "");
  var leftEl = $("#b-left");
  leftEl.textContent = usd(left);
  leftEl.className = "sv num" + (left < 0 ? " down" : "");
  $("#b-rate").textContent = income ? Math.round(totals[2] / income * 100) + "%" : "0%";
  var inv = budgetVal("b-invest"), yrs = Math.max(1, 65 - age), pr = project(0, inv, yrs, 7);
  $("#b-proj").textContent = usd(pr[pr.length - 1].v);
  $("#b-msg").textContent = left < 0 ? "You've planned " + usd(-left) + " more than you take home. Trim a want or two until this reaches $0."
    : left > 0 ? "You have " + usd(left) + " without a job yet. Give it one: savings and investing are good homes for it."
    : "Every dollar has a job. That's called a zero-based budget. The investing line alone, kept up from age " + age + " to 65, could grow to the amount shown above.";
  var s = {"b-income":$("#b-income").value, "b-age":$("#b-age").value};
  BUDGET.forEach(function(g){ g.items.forEach(function(it){ s[it[0]] = $("#" + it[0]).value; }); });
  state.budget = s; save();
}
$("#budget").addEventListener("input", renderBudget);
renderBudget();

/* ---------- lesson 13: allocation explorer ---------- */
var ALLOC = [[100, 10, -43], [80, 9.5, -35], [60, 9, -27], [40, 8, -18], [20, 6.5, -10], [0, 5, -13]];
var allocSel = 2;
function renderAlloc(){
  var rows = ALLOC.map(function(a, i){
    return '<tr class="' + (i === allocSel ? "on" : "") + '"><td><button type="button" class="mixbtn" data-i="' + i + '" aria-pressed="' + (i === allocSel) + '">' + a[0] + '% stocks / ' + (100 - a[0]) + '% bonds</button></td>' +
      '<td><div class="ib"><i class="pos" style="width:' + (a[1] / 45 * 100).toFixed(1) + 'px"></i><span>about ' + a[1] + '%</span></div></td>' +
      '<td><div class="ib"><i class="neg" style="width:' + (-a[2] / 45 * 100).toFixed(1) + 'px"></i><span>about −' + (-a[2]) + '%</span></div></td></tr>';
  }).join("");
  var a = ALLOC[allocSel], low = 10000 * (1 + a[2] / 100), grown = 10000 * Math.pow(1 + a[1] / 100, 40);
  $("#alloc").innerHTML = '<div class="tbl-wrap"><table class="alloc-t"><thead><tr><th>Mix</th><th>Average yearly return</th><th>Worst single year</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
    '<div class="alloc-say" aria-live="polite">With <strong>' + a[0] + '% stocks and ' + (100 - a[0]) + '% bonds</strong>, $10,000 would have fallen to about <strong class="down">' + usd(Math.round(low / 100) * 100) + '</strong> in its worst year. At its average return, $10,000 would grow to about <strong class="up">' + usd(Math.round(grown / 1000) * 1000) + '</strong> over 40 years.</div>' +
    '<p class="hint">Approximate figures for US stocks and bonds from 1926 to 2023, based on Vanguard\'s published portfolio history and rounded. Past results don\'t predict future ones.</p>';
  $$("#alloc .mixbtn").forEach(function(b){ b.addEventListener("click", function(){ allocSel = +b.getAttribute("data-i"); renderAlloc(); var nb = $('#alloc .mixbtn[data-i="' + allocSel + '"]'); if(nb) nb.focus(); }); });
}
renderAlloc();

FS.redraw.m7 = drawCalc;
FS.redraw.m10 = drawPx;

})(window.FS);
