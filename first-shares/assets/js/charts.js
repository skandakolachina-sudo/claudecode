/* First Shares · charts and growth math */
(function(FS){
"use strict";

function project(start, monthly, years, rate){
  var r = rate / 100 / 12, v = start, put = start, out = [{y:0, v:v, p:put}];
  for (var y = 1; y <= years; y++){
    for (var m = 0; m < 12; m++){ v = v * (1 + r) + monthly; put += monthly; }
    out.push({y:y, v:v, p:put});
  }
  return out;
}
function short$(x){
  if(x >= 1e6) return "$" + (x/1e6).toFixed(x >= 1e7 ? 0 : 1).replace(/\.0$/,"") + "M";
  if(x >= 1e3) return "$" + (x/1e3).toFixed(x >= 1e4 ? 0 : 1).replace(/\.0$/,"") + "k";
  return "$" + Math.round(x);
}
function niceTicks(lo, hi, count){
  if(!(hi > lo)) hi = lo + 1;
  var raw = (hi - lo) / count, p = Math.pow(10, Math.floor(Math.log10(raw))), e = raw / p;
  var step = (e >= 7.5 ? 10 : e >= 3.5 ? 5 : e >= 1.5 ? 2 : 1) * p;
  var a = Math.floor(lo / step) * step, b = Math.ceil(hi / step) * step, t = [];
  for (var v = a; v <= b + step / 2; v += step) t.push(+v.toFixed(10));
  return {lo:a, hi:b, step:step, ticks:t};
}
function lineChart(o){
  var svg = o.svg, box = o.box, tip = o.tip;
  var W = Math.max(280, Math.round(box.clientWidth || 600)), narrow = W < 480;
  var H = narrow ? (o.hN || 230) : (o.h || 280);
  var m = {l: 52, r: o.endLabels ? (narrow ? 64 : 84) : 14, t: 14, b: 28};
  var iw = W - m.l - m.r, ih = H - m.t - m.b, last = o.n - 1;
  var vals = [];
  o.series.forEach(function(s){ s.values.forEach(function(v){ if(v != null && isFinite(v)) vals.push(v); }); });
  var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
  if(o.from0){ lo = 0; } else { var pad = (hi - lo) * 0.08 || Math.abs(hi) * 0.01 || 1; lo -= pad; hi += pad; }
  var nt = niceTicks(lo, hi, 4); lo = nt.lo; hi = nt.hi;
  function x(i){ return m.l + (last ? i / last * iw : 0); }
  function y(v){ return m.t + ih - (v - lo) / (hi - lo) * ih; }
  var g = '<g class="grid">';
  nt.ticks.forEach(function(v){ if(v > lo) g += '<line x1="'+m.l+'" x2="'+(W - m.r)+'" y1="'+y(v).toFixed(1)+'" y2="'+y(v).toFixed(1)+'"/>'; });
  g += '</g><g class="axis">';
  nt.ticks.forEach(function(v){ g += '<text x="'+(m.l - 8)+'" y="'+(y(v) + 4).toFixed(1)+'" text-anchor="end">'+o.fmtAxis(v, nt.step)+'</text>'; });
  for (var i = 0; i <= last; i++){
    var lab = o.xLabel(i, narrow);
    if(lab != null) g += '<text x="'+x(i).toFixed(1)+'" y="'+(H - 8)+'" text-anchor="'+(i === 0 ? "start" : i === last ? "end" : "middle")+'">'+lab+'</text>';
  }
  g += '</g><line class="base" x1="'+m.l+'" x2="'+(W - m.r)+'" y1="'+(m.t + ih)+'" y2="'+(m.t + ih)+'"/>';
  function path(vs){ var d = "", on = false; vs.forEach(function(v, k){ if(v == null){ on = false; return; } d += (on ? "L" : "M") + x(k).toFixed(1) + "," + y(v).toFixed(1); on = true; }); return d; }
  var base = (m.t + ih).toFixed(1);
  o.series.forEach(function(s){ if(s.area) g += '<path class="a'+s.c+'" d="'+path(s.values)+'L'+x(last).toFixed(1)+','+base+'L'+x(0).toFixed(1)+','+base+'Z"/>'; });
  for (var si = o.series.length - 1; si >= 0; si--) g += '<path class="l'+o.series[si].c+'" d="'+path(o.series[si].values)+'"/>';
  if(o.endLabels){
    var ends = o.series.map(function(s){ var v = s.values[last]; return {c:s.c, v:v, y:y(v)}; });
    if(ends.length === 2 && Math.abs(ends[0].y - ends[1].y) < 18){
      var top = ends[0].y <= ends[1].y ? 0 : 1, mid = (ends[0].y + ends[1].y) / 2;
      ends[top].ly = mid - 9; ends[1 - top].ly = mid + 9;
    }
    ends.forEach(function(e){
      var ly = Math.max(m.t + 6, Math.min(m.t + ih, e.ly != null ? e.ly : e.y));
      g += '<circle class="d'+e.c+'" cx="'+x(last).toFixed(1)+'" cy="'+e.y.toFixed(1)+'" r="4"/><text class="end-lbl" x="'+(x(last) + 8).toFixed(1)+'" y="'+(ly + 4).toFixed(1)+'">'+o.fmtEnd(e.v)+'</text>';
    });
  }
  g += '<g class="hov" style="display:none"><line class="xh" y1="'+m.t+'" y2="'+(m.t + ih)+'"/>' + o.series.map(function(s){ return '<circle class="d'+s.c+'" r="4.5"/>'; }).join("") + '</g>';
  g += '<rect class="hit" x="'+m.l+'" y="0" width="'+iw+'" height="'+H+'" fill="transparent"/>';
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  svg.setAttribute("width", W); svg.setAttribute("height", H);
  svg.innerHTML = g;
  tip.hidden = true;
  var hov = svg.querySelector(".hov"), hit = svg.querySelector(".hit");
  function move(e){
    var rect = svg.getBoundingClientRect(), sc = rect.width / W;
    var i = Math.round(((e.clientX - rect.left) / sc - m.l) / iw * last);
    i = Math.max(0, Math.min(last, i));
    var hx = x(i), topY = Infinity;
    hov.style.display = "";
    var ln = hov.querySelector("line"); ln.setAttribute("x1", hx); ln.setAttribute("x2", hx);
    var cs = hov.querySelectorAll("circle");
    o.series.forEach(function(s, k){
      var v = s.values[i];
      if(v == null){ cs[k].style.display = "none"; return; }
      cs[k].style.display = ""; cs[k].setAttribute("cx", hx); cs[k].setAttribute("cy", y(v)); topY = Math.min(topY, y(v));
    });
    tip.innerHTML = '<b>'+o.tipTitle(i)+'</b>' + o.series.map(function(s){
      var v = s.values[i];
      return v == null ? "" : '<div><span><i class="swatch sw'+s.c+'"></i>'+s.name+'</span><strong>'+o.fmtTip(v)+'</strong></div>';
    }).join("") + (o.tipExtra ? o.tipExtra(i) : "");
    tip.hidden = false;
    var bw = box.clientWidth, tx = hx * sc + 14;
    if(tx + tip.offsetWidth > bw) tx = hx * sc - tip.offsetWidth - 14;
    tip.style.left = Math.max(0, tx) + "px";
    tip.style.top = Math.max(0, Math.min(topY * sc - 20, H * sc - tip.offsetHeight)) + "px";
  }
  hit.addEventListener("pointermove", move);
  hit.addEventListener("pointerdown", move);
  hit.addEventListener("pointerleave", function(){ hov.style.display = "none"; tip.hidden = true; });
}

FS.project = project;
FS.short$ = short$;
FS.niceTicks = niceTicks;
FS.lineChart = lineChart;

})(window.FS);
