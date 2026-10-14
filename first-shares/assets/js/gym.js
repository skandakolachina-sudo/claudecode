/* First Shares · math gym */
(function(FS){
"use strict";

var $ = FS.$, $$ = FS.$$, el = FS.el, fmt = FS.fmt, usd = FS.usd, hashStr = FS.hashStr, seeded = FS.seeded;

function rnd(a, b){ return Math.floor(Math.random() * (b - a + 1)) + a; }
function pick(a){ return a[rnd(0, a.length - 1)]; }
var GYM = [
  {key:"pct", label:"Percent change", lesson:3, gen:function(){
    var a = rnd(12, 180), b; do { b = Math.round(a * (1 + rnd(-55, 90) / 100)); } while(b === a || b <= 0);
    var ans = (b - a) / a * 100;
    return {q:"You bought a share at <strong>$"+a+"</strong>. It's now worth <strong>$"+b+"</strong>. What's the percent change?", round:"Round to 1 decimal place. Use a minus sign for a drop.", suf:"%", ans:ans, tol:0.11,
      sol:"("+b+" − "+a+") ÷ "+a+" × 100 = "+fmt(b-a,0)+" ÷ "+a+" × 100 = <strong>"+fmt(ans,1)+"%</strong>"};
  }},
  {key:"profit", label:"Profit or loss", lesson:3, gen:function(){
    var n = rnd(2, 40), a = rnd(8, 150), b; do { b = Math.round(a * (1 + rnd(-40, 60) / 100)); } while(b === a || b <= 0);
    var ans = (b - a) * n;
    return {q:"You bought <strong>"+n+" shares</strong> at <strong>$"+a+"</strong> and sold them at <strong>$"+b+"</strong>. What's your profit or loss?", round:"Whole dollars. Use a minus sign for a loss.", pre:"$", ans:ans, tol:0.5,
      sol:"($"+b+" − $"+a+") × "+n+" = "+usd(b-a)+" × "+n+" = <strong>"+usd(ans)+"</strong>"};
  }},
  {key:"frac", label:"Fractional shares", lesson:3, gen:function(){
    var d = pick([5,10,15,20,25,40,50,75,100]), p = rnd(30, 600);
    var ans = d / p;
    return {q:"You invest <strong>$"+d+"</strong> in a stock priced at <strong>$"+p+"</strong> a share. How many shares do you get?", round:"Round to 4 decimal places.", suf:"shares", ans:ans, tol:0.0002, rel:0.005,
      sol:"$"+d+" ÷ $"+p+" = <strong>"+fmt(ans,4)+" shares</strong>"};
  }},
  {key:"recover", label:"Gain needed to recover", lesson:3, gen:function(){
    var d = pick([10,15,20,25,30,35,40,45,50,60,70,80]);
    var ans = d / (100 - d) * 100;
    return {q:"A stock falls <strong>"+d+"%</strong>. What percent gain does it need to get back to its starting price?", round:"Round to 1 decimal place.", suf:"%", ans:ans, tol:0.11,
      sol:"Start at $100. After a "+d+"% drop it's $"+(100-d)+".<br>Needed gain: "+d+" ÷ "+(100-d)+" × 100 = <strong>"+fmt(ans,1)+"%</strong>"};
  }},
  {key:"mcap", label:"Market cap", lesson:2, gen:function(){
    var p = rnd(5, 400), s = pick([40,85,120,250,600,1200,2500,4000]);
    var ans = p * s / 1000;
    return {q:"A stock trades at <strong>$"+p+"</strong> and the company has <strong>"+fmt(s,0)+" million</strong> shares outstanding. What's its market cap, in billions?", round:"Round to 2 decimal places.", pre:"$", suf:"billion", ans:ans, tol:0.01, rel:0.003,
      sol:"$"+p+" × "+fmt(s,0)+",000,000 = $"+fmt(p*s,0)+" million = <strong>$"+fmt(ans,2)+" billion</strong>"};
  }},
  {key:"eps", label:"Earnings per share", lesson:4, gen:function(){
    var ni = rnd(20, 900), s = rnd(10, 400);
    var ans = ni / s;
    return {q:"A company's net income is <strong>$"+ni+" million</strong> and it has <strong>"+s+" million</strong> shares. What's its EPS?", round:"Round to the nearest cent.", pre:"$", ans:ans, tol:0.011,
      sol:"$"+ni+"M ÷ "+s+"M shares = <strong>$"+fmt(ans,2)+" per share</strong>"};
  }},
  {key:"pe", label:"P/E ratio", lesson:4, gen:function(){
    var eps = rnd(50, 800) / 100, price = Math.max(1, Math.round(eps * rnd(8, 45)));
    var ans = price / eps;
    return {q:"A stock costs <strong>$"+price+"</strong> and its EPS is <strong>$"+fmt(eps,2)+"</strong>. What's its P/E ratio?", round:"Round to 1 decimal place.", ans:ans, tol:0.11,
      sol:"$"+price+" ÷ $"+fmt(eps,2)+" = <strong>"+fmt(ans,1)+"</strong>. Investors pay about $"+fmt(ans,0)+" for each $1 of yearly profit."};
  }},
  {key:"yield", label:"Dividend yield", lesson:4, gen:function(){
    var p = rnd(15, 250), d = Math.max(0.05, Math.round(p * rnd(5, 60) / 1000 * 100) / 100);
    var ans = d / p * 100;
    return {q:"A stock costs <strong>$"+p+"</strong> and pays <strong>$"+fmt(d,2)+"</strong> per share in dividends each year. What's its dividend yield?", round:"Round to 2 decimal places.", suf:"%", ans:ans, tol:0.011,
      sol:"$"+fmt(d,2)+" ÷ $"+p+" × 100 = <strong>"+fmt(ans,2)+"%</strong>"};
  }},
  {key:"margin", label:"Profit margin", lesson:4, gen:function(){
    var rev = rnd(200, 5000), ni = Math.max(1, Math.round(rev * rnd(2, 30) / 100));
    var ans = ni / rev * 100;
    return {q:"A company has revenue of <strong>$"+fmt(rev,0)+" million</strong> and net income of <strong>$"+fmt(ni,0)+" million</strong>. What's its profit margin?", round:"Round to 1 decimal place.", suf:"%", ans:ans, tol:0.11,
      sol:"$"+fmt(ni,0)+"M ÷ $"+fmt(rev,0)+"M × 100 = <strong>"+fmt(ans,1)+"%</strong>. It keeps about "+fmt(ans,0)+" cents of each sales dollar."};
  }},
  {key:"total", label:"Total return with dividends", lesson:4, gen:function(){
    var a = rnd(10, 100), b; do { b = Math.round(a * (1 + rnd(-20, 50) / 100)); } while(b <= 0);
    var dv = rnd(20, 300) / 100, ans = (b - a + dv) / a * 100;
    return {q:"You bought a share at <strong>$"+a+"</strong>, collected <strong>$"+fmt(dv,2)+"</strong> in dividends, and sold it at <strong>$"+b+"</strong>. What's your total return?", round:"Round to 1 decimal place.", suf:"%", ans:ans, tol:0.11,
      sol:"Price change: $"+b+" − $"+a+" = "+usd(b-a,2)+"<br>Plus dividends: "+usd(b-a,2)+" + $"+fmt(dv,2)+" = "+usd(b-a+dv,2)+"<br>"+usd(b-a+dv,2)+" ÷ $"+a+" × 100 = <strong>"+fmt(ans,1)+"%</strong>"};
  }},
  {key:"fee", label:"Fund fees", lesson:5, gen:function(){
    var amt = pick([500,1000,2500,4000,5000,10000,25000]), er = pick([0.03,0.05,0.1,0.2,0.4,0.5,0.75,1]);
    var ans = amt * er / 100;
    return {q:"You have <strong>$"+fmt(amt,0)+"</strong> in a fund with an expense ratio of <strong>"+er+"%</strong>. How much do you pay in fees this year?", round:"Round to the nearest cent.", pre:"$", ans:ans, tol:0.011,
      sol:"$"+fmt(amt,0)+" × "+er+" ÷ 100 = <strong>$"+fmt(ans,2)+"</strong>"};
  }},
  {key:"dca", label:"Dollar-cost averaging", lesson:6, gen:function(){
    var amt = pick([20,30,40,50,60,100]), ps = [pick([4,5,8,10,12]), pick([5,6,8,10,15,20]), pick([4,5,8,10,12,25])];
    var sh = ps.map(function(p){ return amt / p; }), tot = sh.reduce(function(s, v){ return s + v; }, 0);
    var ans = amt * 3 / tot;
    return {q:"You invest <strong>$"+amt+"</strong> a month for three months. The price is <strong>$"+ps[0]+"</strong>, then <strong>$"+ps[1]+"</strong>, then <strong>$"+ps[2]+"</strong>. What's your average cost per share?", round:"Round to the nearest cent.", pre:"$", ans:ans, tol:0.011, rel:0.002,
      sol:"Shares bought: "+sh.map(function(s){ return fmt(s, 3).replace(/\.?0+$/,""); }).join(" + ")+" = "+fmt(tot,3)+"<br>Total spent: $"+(amt*3)+"<br>$"+(amt*3)+" ÷ "+fmt(tot,3)+" = <strong>$"+fmt(ans,2)+"</strong>"};
  }},
  {key:"r72", label:"Rule of 72", lesson:7, gen:function(){
    var r = pick([2,3,4,6,8,9,10,12]), ans = 72 / r;
    return {q:"Money grows <strong>"+r+"%</strong> a year. Using the Rule of 72, about how many years until it doubles?", round:"Round to 1 decimal place.", suf:"years", ans:ans, tol:0.11,
      sol:"72 ÷ "+r+" = <strong>"+fmt(ans,1)+" years</strong>"};
  }},
  {key:"compound", label:"Compound growth", lesson:7, gen:function(){
    var P = pick([100,250,500,1000,2000]), r = pick([5,6,7,8,10]), n = pick([5,10,15,20,30]);
    var ans = P * Math.pow(1 + r / 100, n);
    return {q:"You invest <strong>$"+fmt(P,0)+"</strong> once and it grows <strong>"+r+"%</strong> a year, compounding yearly. What's it worth after <strong>"+n+" years</strong>?", round:"Round to the nearest dollar.", pre:"$", ans:ans, tol:1, rel:0.003,
      sol:"$"+fmt(P,0)+" × (1 + 0."+(r < 10 ? "0" + r : r)+")<sup>"+n+"</sup> = $"+fmt(P,0)+" × "+fmt(Math.pow(1 + r/100, n), 4)+" = <strong>"+usd(ans)+"</strong>"};
  }},
  {key:"real", label:"Real return", lesson:7, gen:function(){
    var r = pick([4,5,6,7,8,9,10,12]), i = pick([1,2,3,4,5,6]), ans = r - i;
    return {q:"Your investments returned <strong>"+r+"%</strong> this year, and inflation was <strong>"+i+"%</strong>. About what was your real return?", round:"Use the simple estimate: return − inflation.", suf:"%", ans:ans, tol:0.05,
      sol:r+"% − "+i+"% = <strong>"+ans+"%</strong>. That's how much more your money can actually buy."};
  }},
  {key:"netpay", label:"Net pay", lesson:12, gen:function(){
    var h = rnd(6, 25), w = pick([10,11,12,13,14,15,16,17,18,20]), gross = h * w, tax = Math.round(gross * 0.0765 * 100) / 100, ans = gross - tax;
    return {q:"You work <strong>"+h+" hours</strong> at <strong>$"+w+" an hour</strong>. Payroll taxes take 7.65%. What's your net pay, ignoring income tax?", round:"Round to the nearest cent.", pre:"$", ans:ans, tol:0.011,
      sol:"Gross: "+h+" × $"+w+" = $"+fmt(gross,2)+"<br>Taxes: $"+fmt(gross,2)+" × 0.0765 = $"+fmt(tax,2)+"<br>Net: $"+fmt(gross,2)+" − $"+fmt(tax,2)+" = <strong>$"+fmt(ans,2)+"</strong>"};
  }},
  {key:"saverate", label:"Savings rate", lesson:12, gen:function(){
    var inc = pick([150,200,250,300,400,500,600,800]), sv = Math.min(inc - 10, rnd(2, 30) * 5), ans = sv / inc * 100;
    return {q:"You take home <strong>$"+inc+"</strong> a month and save or invest <strong>$"+sv+"</strong> of it. What's your savings rate?", round:"Round to 1 decimal place.", suf:"%", ans:ans, tol:0.11,
      sol:"$"+sv+" ÷ $"+inc+" × 100 = <strong>"+fmt(ans,1)+"%</strong>"};
  }},
  {key:"bond", label:"Bond interest", lesson:13, gen:function(){
    var face = pick([500,1000,2000,5000]), c = pick([2,3,3.5,4,4.5,5,6]), n = pick([2,3,5,10]), yr = face * c / 100, ans = yr * n;
    return {q:"You buy a <strong>$"+fmt(face,0)+"</strong> bond with a <strong>"+c+"%</strong> coupon and a <strong>"+n+"-year</strong> maturity. How much interest does it pay in total over its life?", round:"Round to the nearest cent.", pre:"$", ans:ans, tol:0.011,
      sol:"Each year: $"+fmt(face,0)+" × "+c+"% = $"+fmt(yr,2)+"<br>Over "+n+" years: $"+fmt(yr,2)+" × "+n+" = <strong>$"+fmt(ans,2)+"</strong>, plus your $"+fmt(face,0)+" back at the end."};
  }}
];
var gymSel = $("#gym-topic");
gymSel.innerHTML = '<option value="mix">Mixed: all topics</option>' + GYM.map(function(g){ return '<option value="'+g.key+'">'+g.label+' (Lesson '+g.lesson+')</option>'; }).join("");
var gymCur = null, gymDone = false, gymStats = {ok:0, total:0, streak:0};
function newProblem(){
  var key = gymSel.value;
  var type = key === "mix" ? pick(GYM) : GYM.filter(function(g){ return g.key === key; })[0];
  gymCur = type.gen(); gymCur.type = type; gymDone = false;
  $("#gym-label").textContent = type.label;
  $("#gym-lesson").innerHTML = '<a href="#m'+type.lesson+'">Lesson '+type.lesson+'</a>';
  $("#gym-q").innerHTML = gymCur.q;
  $("#gym-round").textContent = gymCur.round;
  $("#gym-pre").textContent = gymCur.pre || "";
  $("#gym-suf").textContent = gymCur.suf || "";
  $("#gym-answer").value = "";
  $("#gym-fb").innerHTML = "";
}
function parseAns(s){
  s = String(s).replace(/[−–—]/g, "-").replace(/[,$%\s]/g, "").replace(/shares?|years?|billion/gi, "");
  if(s === "" || s === "-" || s === ".") return NaN;
  return Number(s);
}
$("#gym-form").addEventListener("submit", function(e){
  e.preventDefault();
  if(!gymCur) return;
  var v = parseAns($("#gym-answer").value);
  if(!isFinite(v)){ $("#gym-fb").innerHTML = '<p><span class="verdict no">Enter a number</span>Type just the number, like 12.5 or -8.</p>'; return; }
  var ok = Math.abs(v - gymCur.ans) <= Math.max(gymCur.tol || 0, Math.abs(gymCur.ans) * (gymCur.rel || 0));
  if(!gymDone){
    gymStats.total++;
    if(ok){ gymStats.ok++; gymStats.streak++; } else { gymStats.streak = 0; }
    gymDone = true;
    $("#gym-ok").textContent = gymStats.ok; $("#gym-total").textContent = gymStats.total; $("#gym-streak").textContent = gymStats.streak;
  }
  $("#gym-fb").innerHTML = '<p><span class="verdict '+(ok?"ok":"no")+'">'+(ok?"Correct":"Not quite")+'</span>'+(ok?"Nice work. Here's the full working:":"Here's how to work it out:")+'</p><div class="sol">'+gymCur.sol+'</div>';
});
$("#gym-new").addEventListener("click", function(){ newProblem(); $("#gym-answer").focus(); });
gymSel.addEventListener("change", newProblem);
newProblem();

})(window.FS);
