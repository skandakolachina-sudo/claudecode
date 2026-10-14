/* First Shares · my investing plan */
(function(FS){
"use strict";

var $ = FS.$, $$ = FS.$$, el = FS.el, fmt = FS.fmt, usd = FS.usd, hashStr = FS.hashStr, seeded = FS.seeded, state = FS.state, save = FS.save, num = FS.num, project = FS.project;

var PLAN_FIELDS = ["p-age","p-goal","p-start","p-monthly","p-account","p-core","p-slice","p-check"];
var RULES = ["r1","r2","r3","r4","r5","r6"];
if(state.plan){
  PLAN_FIELDS.forEach(function(f){ if(state.plan[f] != null) $("#" + f).value = state.plan[f]; });
  RULES.forEach(function(r){ if(state.plan[r] != null) $("#" + r).checked = !!state.plan[r]; });
}
function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function planText(){
  var age = Math.round(num("#p-age")) || 16, start = num("#p-start"), monthly = num("#p-monthly");
  var slice = +$("#p-slice").value;
  var years = Math.max(1, 65 - age);
  var pr = project(start, monthly, years, 7), last = pr[pr.length - 1];
  var rules = RULES.filter(function(r){ return $("#" + r).checked; }).map(function(r){ return $("#" + r).parentNode.textContent.trim(); });
  return {age:age, start:start, monthly:monthly, slice:slice, years:years, last:last, rules:rules,
    goal: $("#p-goal").value.trim() || "Build long-term wealth",
    account: $("#p-account").value, core: $("#p-core").value.trim() || "A broad, low-fee index fund", check: $("#p-check").value};
}
function renderPlan(){
  var p = planText();
  $("#p-slice-v").textContent = p.slice + "%";
  var hint = "";
  if(p.account.indexOf("Roth") > -1) hint = "Needs earned income. You can contribute up to what you earned this year, up to the IRS limit.";
  else if(p.account.indexOf("Custodial brokerage") > -1) hint = "A parent or guardian opens and manages it. The money becomes fully yours at 18 or 21.";
  else if(p.account.indexOf("Youth") > -1) hint = "Usually for ages 13 to 17, with a parent or guardian overseeing the account.";
  else hint = "Lesson 8 compares the options.";
  $("#p-account-hint").textContent = hint;
  $("#plan-out").innerHTML =
    '<div class="po-row"><span>Goal</span><span>'+esc(p.goal)+'</span></div>' +
    '<div class="po-row"><span>Account</span><span>'+esc(p.account)+'</span></div>' +
    '<div class="po-row"><span>Money</span><span class="num">'+usd(p.start)+' to start, then '+usd(p.monthly)+' every month, automatically</span></div>' +
    '<div class="po-row"><span>Core '+(100 - p.slice)+'%</span><span>'+esc(p.core)+'</span></div>' +
    '<div class="po-row"><span>Learning '+p.slice+'%</span><span>'+(p.slice ? "Individual companies I've researched with the checklist" : "None for now. All in the core.")+'</span></div>' +
    '<div class="po-row"><span>Check-ins</span><span>I\'ll look at my account '+esc(p.check)+'.</span></div>' +
    (p.rules.length ? '<div class="po-row"><span>My rules</span><ul>'+p.rules.map(function(r){ return '<li>'+esc(r)+'</li>'; }).join("")+'</ul></div>' : "");
  $("#plan-proj").innerHTML = '<div class="big num">'+usd(p.last.v)+'</div><p>What this plan could grow to by age 65 ('+p.years+' years) at 7% average yearly growth. You\'d put in '+usd(p.last.p)+'. Not a promise: real returns vary from year to year.</p>';
  var saved = {};
  PLAN_FIELDS.forEach(function(f){ saved[f] = $("#" + f).value; });
  RULES.forEach(function(r){ saved[r] = $("#" + r).checked; });
  state.plan = saved; save();
}
$("#plan-form").addEventListener("input", renderPlan);
$("#plan-form").addEventListener("change", renderPlan);
$("#plan-form").addEventListener("submit", function(e){ e.preventDefault(); });
$("#p-print").addEventListener("click", function(){ window.print(); });
$("#p-copy").addEventListener("click", function(){
  var p = planText();
  var txt = "MY INVESTING PLAN\n" +
    "Goal: " + p.goal + "\n" +
    "Account: " + p.account + "\n" +
    "Money: " + usd(p.start) + " to start, then " + usd(p.monthly) + " every month, automatically\n" +
    "Core (" + (100 - p.slice) + "%): " + p.core + "\n" +
    "Learning slice (" + p.slice + "%): " + (p.slice ? "Individual companies I've researched with the checklist" : "None for now") + "\n" +
    "Check-ins: " + p.check + "\n" +
    (p.rules.length ? "My rules:\n" + p.rules.map(function(r){ return "- " + r; }).join("\n") + "\n" : "") +
    "Projection: about " + usd(p.last.v) + " by age 65 at 7% average yearly growth (" + usd(p.last.p) + " put in). Not guaranteed.";
  var status = $("#p-copy-status");
  function fallback(){
    var ta = document.createElement("textarea"); ta.value = txt; ta.setAttribute("readonly",""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    var ok = false; try { ok = document.execCommand("copy"); } catch(e){}
    document.body.removeChild(ta);
    status.textContent = ok ? "Copied. Paste it into a note or message." : "Copy isn't available here. Select the summary above and copy it by hand.";
  }
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(txt).then(function(){ status.textContent = "Copied. Paste it into a note or message."; }, fallback);
  } else { fallback(); }
});
renderPlan();

FS.redraw.plan = renderPlan;

})(window.FS);
