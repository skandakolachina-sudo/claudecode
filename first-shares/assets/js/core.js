/* First Shares · core: saving, helpers, course structure */
window.FS = {};
(function(FS){
"use strict";

var KEY = "first-shares-v1";
function load(){ try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch(e){ return {}; } }
function save(){ try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e){} }
var state = load();
state.passed = state.passed || {};
state.best = state.best || {};

function $(s, r){ return (r||document).querySelector(s); }
function $$(s, r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); }
function el(tag, cls, html){ var e = document.createElement(tag); if(cls) e.className = cls; if(html != null) e.innerHTML = html; return e; }
function fmt(x, d){ return Number(x).toLocaleString("en-US", {minimumFractionDigits:d, maximumFractionDigits:d}); }
function usd(x, d){ d = d == null ? 0 : d; var s = fmt(Math.abs(x), d); return (x < 0 ? "−$" : "$") + s; }
function hashStr(s){ var h = 2166136261; for (var i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function seeded(seed){ return function(){ seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

var LESSONS = [
  {id:"m1", title:"What a stock actually is", short:"Stocks"},
  {id:"m2", title:"How the market moves", short:"Market"},
  {id:"m3", title:"Quotes, orders and math", short:"Orders"},
  {id:"m4", title:"Sizing up a company", short:"Companies"},
  {id:"m5", title:"Funds and ETFs", short:"Funds"},
  {id:"m6", title:"Risk and your brain", short:"Risk"},
  {id:"m7", title:"Compound growth", short:"Compounding"},
  {id:"m8", title:"Starting with limited money", short:"Start"},
  {id:"m9", title:"Traps and scams", short:"Traps"},
  {id:"m10", title:"Reading a price chart", short:"Charts"},
  {id:"m11", title:"The economy and stocks", short:"Economy"},
  {id:"m12", title:"Budgeting", short:"Budget"},
  {id:"m13", title:"Beyond stocks", short:"Beyond stocks"},
  {id:"m14", title:"Famous mistakes", short:"Mistakes"}
];
var PRACTICE = [
  {id:"game", title:"Ten-year test", short:"Game", mark:"▶"},
  {id:"gym", title:"Math gym", short:"Math gym", mark:"∑"},
  {id:"exam", title:"Final exam", short:"Exam", mark:"✎"},
  {id:"glossary", title:"Glossary", short:"Glossary", mark:"Az"},
  {id:"plan", title:"My investing plan", short:"My plan", mark:"→"}
];
var VIEWS = LESSONS.map(function(l){return l.id;}).concat(PRACTICE.map(function(p){return p.id;}));
function viewLabel(id){
  if(/^m\d+$/.test(id)) return "Lesson " + id.slice(1);
  var p = PRACTICE.filter(function(x){ return x.id === id; })[0];
  return p ? p.title : id;
}

var LETTERS = ["A","B","C","D"];
function num(id){ var v = parseFloat($(id).value); return isFinite(v) && v >= 0 ? v : 0; }

FS.KEY = KEY;
FS.state = state;
FS.save = save;
FS.$ = $;
FS.$$ = $$;
FS.el = el;
FS.fmt = fmt;
FS.usd = usd;
FS.hashStr = hashStr;
FS.seeded = seeded;
FS.LESSONS = LESSONS;
FS.PRACTICE = PRACTICE;
FS.VIEWS = VIEWS;
FS.viewLabel = viewLabel;
FS.LETTERS = LETTERS;
FS.num = num;
/* Each feature registers a function here to redraw itself when its section is shown. */
FS.redraw = {};

})(window.FS);
