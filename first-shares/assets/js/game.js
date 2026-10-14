/* First Shares · the ten-year test */
(function(FS){
"use strict";

var $ = FS.$, $$ = FS.$$, el = FS.el, fmt = FS.fmt, usd = FS.usd, hashStr = FS.hashStr, seeded = FS.seeded, state = FS.state, save = FS.save, LETTERS = FS.LETTERS, viewLabel = FS.viewLabel, lineChart = FS.lineChart, short$ = FS.short$;

var G_MARKET = [0.12, 0.08, -0.28, 0.22, 0.15, -0.08, 0.18, 0.10, 0.06, 0.14];
var G_SAVE = 0.03, G_FEE = 0.01;
var G_TAGS = {smart:["Smart move","ok"], risky:["Risky","no"], costly:["Costly","no"], neutral:["Your call","mid"]};
function gNew(){ return {y:0, index:500, savings:0, monthly:50, fee:false, outYear:-1, hist:[500], log:[]}; }
function gTotal(s){ return s.index + s.savings; }
var G_EVENTS = [
  function(s){ return {title:"Your first account",
    story:"You and a parent open a custodial account. You start with $500 in an S&amp;P 500 index fund, with $50 a month going in automatically. A friend shows you a trading app with confetti, streaks and a leaderboard.",
    choices:[
      {label:"Leave it on autopilot.", tag:"smart", fx:{}, fb:"Boring is good. Your money is diversified, cheap and working while you do other things.", l:"m8"},
      {label:"Move $250 into day trading to grow it faster.", tag:"risky", fx:{side:{amt:250, r:-0.30, name:"Day trading account"}}, fb:"Most day traders lose money. A year of small losses and bad timing shrank your $250 to $175.", l:"m9"},
      {label:"Switch to a \"premium\" fund with a 1% yearly fee. Its ad says it beats the market.", tag:"costly", fx:{fee:true}, fb:"Most active funds trail their index over time. From now on, 1% comes out of your return every single year.", l:"m5"}
    ]}; },
  function(s){ return {title:"The hype stock",
    story:"A stock everyone at school is talking about is up 400% this year. Videos say it's \"going to the moon.\"",
    choices:[
      {label:"Ignore it and stick to the plan.", tag:"smart", fx:{}, fb:"The FOMO passed. Your plan kept running.", l:"m6"},
      {label:"Put $200 into it.", tag:"risky", fx:{side:{amt:200, r:-0.60, name:"Hype stock"}}, fb:"You bought near the top. By the end of the year it had fallen 60%, and your $200 was worth $80.", l:"m9"},
      {label:"Put half your account into it.", tag:"risky", fx:{side:{amt:0.5, r:-0.60, name:"Hype stock"}}, fb:"Half your account, down 60%. This is how concentration and FOMO combine into a big loss.", l:"m6"}
    ]}; },
  function(s){ return {title:"The crash",
    story:"The market falls 28% this year. Headlines call it the worst year in a decade. Your balance drops every time you check it.",
    choices:[
      {label:"Keep investing " + usd(s.monthly) + " a month as planned.", tag:"smart", fx:{}, fb:"Your monthly money bought shares on sale. That pays off when prices recover.", l:"m6"},
      {label:"Pause your monthly investing until things calm down.", tag:"costly", fx:{pause:true}, fb:"You stopped buying during the year shares were cheapest. That money got spent instead.", l:"m6"},
      {label:"Sell everything and move it to savings.", tag:"costly", fx:{out:"next"}, fb:"You locked in the drop. Because it never felt safe, you'll also sit out next year in savings.", l:"m6"}
    ]}; },
  function(s){ return {title:"Your first real job",
    story:(s.outYear === s.y ? "Your money is still in savings after last year's sell-off, waiting for things to feel safe. You'll buy back in at the end of this year. " : "") + "You start a part-time job that pays about $300 a month after taxes.",
    choices:[
      {label:"Raise your investing to $100 a month.", tag:"smart", fx:{monthly:100}, fb:"Investing a third of your pay while you have few bills is a huge head start.", l:"m12"},
      {label:"Keep investing $50 a month and spend the rest.", tag:"neutral", fx:{monthly:50}, fb:"A fair balance. You're still investing, and you have money to enjoy.", l:"m12"},
      {label:"Stop investing for now and spend it all.", tag:"costly", fx:{monthly:0}, fb:"More fun money now, but you've switched off your biggest advantage: time.", l:"m7"}
    ]}; },
  function(s){ return {title:"The signals group",
    story:"An influencer you follow sells a $49-a-month Discord with \"can't-miss\" stock alerts. The screenshots show members making 300%.",
    choices:[
      {label:"Skip it.", tag:"smart", fx:{}, fb:"Guaranteed returns and paid signals are red flags. Your plan kept compounding instead.", l:"m9"},
      {label:"Join for a year and trade $500 on their alerts.", tag:"costly", fx:{cut:588, side:{amt:500, r:-0.20, name:"Alert trades"}}, fb:"The $588 in fees came out of money you would have invested, and the alerts lost 20%.", l:"m9"},
      {label:"Join and use margin to double your trades.", tag:"risky", fx:{cut:588, side:{amt:500, r:-0.78, name:"Alert trades on margin"}}, fb:"With borrowed money, a 35% drop in the picks wiped out most of your $500, and the broker sold you out in a margin call.", l:"m9"}
    ]}; },
  function(s){
    var lev = {label:"Move $1,000 into a 3x leveraged ETF.", tag:"risky", fx:{side:{amt:1000, r:-0.35, name:"3x leveraged ETF"}}, fb:"It triples daily moves and resets every day. In a choppy year that ended down 8%, it lost 35%.", l:"m5"};
    if(s.fee) return {title:"A choppy year",
      story:"The market zigzags all year and ends down 8%. A coworker says a 3x leveraged ETF is the fastest way to grow. You also notice your fund has charged you 1% a year since you were 16.",
      choices:[
        {label:"Switch to a low-fee index fund, and skip the leveraged ETF.", tag:"smart", fx:{fee:false}, fb:"Same stocks for a fraction of the cost. That choice pays you every year from now on.", l:"m5"},
        {label:"Stay put with your current fund.", tag:"costly", fx:{}, fb:"The 1% fee keeps coming out every year, in up years and down years.", l:"m5"},
        lev
      ]};
    return {title:"A choppy year",
      story:"The market zigzags all year and ends down 8%. A coworker says a 3x leveraged ETF is the fastest way to grow.",
      choices:[
        {label:"Stay put.", tag:"smart", fx:{}, fb:"Down years are normal. Staying put was the whole job.", l:"m6"},
        lev
      ]};
  },
  function(s){ return {title:"Graduation money",
    story:"You graduate and get $2,000 in gifts.",
    choices:[
      {label:"Invest all $2,000 in your index fund.", tag:"smart", fx:{lump:{index:2000}}, fb:"Money invested early has the most time to grow.", l:"m7"},
      {label:"Put $1,000 in an emergency fund and invest $1,000.", tag:"smart", fx:{lump:{index:1000, savings:1000}}, fb:"A cash cushion means a surprise bill never forces you to sell investments at a bad time.", l:"m12"},
      {label:"Spend it on a trip with friends.", tag:"neutral", fx:{}, fb:"It's your money, and memories matter. Just know the trade-off: $2,000 growing 7% a year from 22 to 65 would be about $36,700.", l:"m7"}
    ]}; },
  function(s){
    var keep = s.monthly > 0
      ? {label:"Keep investing " + usd(s.monthly) + " a month.", tag:"neutral", fx:{}, fb:"When income rises but investing doesn't, the difference quietly turns into stuff. That's called lifestyle creep.", l:"m12"}
      : {label:"Keep spending it all, and start investing later.", tag:"costly", fx:{}, fb:"Later keeps getting later. Every year you wait is a year of compounding you can't get back.", l:"m7"};
    return {title:"A full-time job",
      story:"You land a full-time job. After taxes and bills, you could invest up to $400 a month.",
      choices:[
        {label:"Invest $300 a month.", tag:"smart", fx:{monthly:300}, fb:"You're investing a big share of your pay early. That's how the steady path pulls ahead.", l:"m12"},
        {label:"Invest $150 a month.", tag:"neutral", fx:{monthly:150}, fb:"A solid amount, and you can raise it later.", l:"m12"},
        keep
      ]};
  },
  function(s){ return {title:"The coin",
    story:"Your group chat is full of a new crypto coin that's \"about to 50x.\" Its creators are giving away merch to early buyers.",
    choices:[
      {label:"Pass.", tag:"smart", fx:{}, fb:"No profits, no business, lots of hype. Passing cost you nothing.", l:"m9"},
      {label:"Put in $500 for fun.", tag:"risky", fx:{side:{amt:500, r:-0.90, name:"The coin"}}, fb:"The creators sold their coins and disappeared, which is called a rug pull. The coin fell 90%.", l:"m9"},
      {label:"Put in $3,000 to really make it count.", tag:"risky", fx:{side:{amt:3000, r:-0.90, name:"The coin"}}, fb:"The creators sold their coins and disappeared. The coin fell 90%, taking most of your $3,000 with it.", l:"m9"}
    ]}; },
  function(s){ return {title:"The prediction",
    story:"Your account is at an all-time high. A coworker says, \"The market is due for a crash. Sell now and lock in your gains.\"",
    choices:[
      {label:"Stay invested.", tag:"smart", fx:{}, fb:"Nobody can reliably predict crashes. Staying in means you get the good years too.", l:"m6"},
      {label:"Sell everything and wait for the crash.", tag:"costly", fx:{out:"now"}, fb:"The crash didn't come. The market rose 14% while your money sat in savings.", l:"m6"}
    ]}; }
];
function gPlay(s, fx){
  var y = s.y, r = G_MARKET[y], res = {r:r, start:gTotal(s)};
  if(fx.fee != null) s.fee = fx.fee;
  if(fx.monthly != null) s.monthly = fx.monthly;
  if(fx.lump){ s.index += fx.lump.index || 0; s.savings += fx.lump.savings || 0; res.lump = fx.lump; }
  var contrib = fx.pause ? 0 : s.monthly * 12;
  if(fx.cut){ res.cut = Math.min(contrib, fx.cut); contrib -= res.cut; }
  res.contrib = contrib; res.paused = !!fx.pause;
  res.fee = s.fee; res.fundR = r - (s.fee ? G_FEE : 0);
  if(fx.side){
    var amt = fx.side.amt <= 1 ? s.index * fx.side.amt : Math.min(s.index, fx.side.amt);
    s.index -= amt; res.side = {name:fx.side.name, from:amt, to:amt * (1 + fx.side.r)};
  }
  res.out = s.outYear === y || fx.out === "now";
  if(res.out) s.index = s.index * (1 + G_SAVE) + contrib * (1 + G_SAVE / 2);
  else s.index = s.index * (1 + res.fundR) + contrib * (1 + res.fundR / 2);
  if(res.side) s.index += res.side.to;
  s.savings *= 1 + G_SAVE;
  if(fx.out === "next") s.outYear = y + 1;
  s.y++; s.hist.push(gTotal(s));
  res.end = gTotal(s);
  return res;
}
function gSteady(){ var s = gNew(); for (var y = 0; y < 10; y++) gPlay(s, G_EVENTS[y](s).choices[0].fx); return s; }
function gPct(v){ return '<span class="' + (v >= 0 ? "up" : "down") + '">' + (v >= 0 ? "+" : "−") + fmt(Math.abs(v * 100), 0) + "%</span>"; }
var game = null, gPhase = "intro", gEv = null, gOrder = null, gPick = null, gRes = null;
function gHud(){
  var s = game, cells = "";
  for (var i = 0; i < 10; i++){ var l = s.log[i]; cells += '<span class="' + (l ? "t-" + l.tag : (i === s.y && gPhase === "choose" ? "now" : "")) + '"></span>'; }
  return '<div class="game-hud">' +
    '<div class="stat"><div class="sl">Age</div><div class="sv num">' + (16 + s.y) + '</div></div>' +
    '<div class="stat"><div class="sl">Account value</div><div class="sv num">' + usd(gTotal(s)) + '</div></div>' +
    '<div class="stat"><div class="sl">Investing each month</div><div class="sv num">' + usd(s.monthly) + '</div></div>' +
  '</div><div class="ytrack" aria-hidden="true">' + cells + '</div>';
}
function gScroll(sel){ var e = $(sel); if(e && e.getBoundingClientRect().top < 0) e.scrollIntoView({block:"start"}); }
function gOutcome(){
  var c = gEv.choices[gPick], r = gRes, t = G_TAGS[c.tag], rows = "";
  function row(k, v){ rows += '<dt>' + k + '</dt><dd>' + v + '</dd>'; }
  row("Market this year", gPct(r.r));
  if(r.out) row("Your money", "In savings, earning 3%");
  else if(r.fee) row("Your fund, after its 1% fee", gPct(r.fundR));
  if(r.lump && r.lump.index) row("Gift money invested", usd(r.lump.index));
  if(r.lump && r.lump.savings) row("Gift money to savings", usd(r.lump.savings));
  if(r.side) row(r.side.name, usd(r.side.from) + " → " + usd(r.side.to));
  row("Added this year", r.paused ? "Paused" : usd(r.contrib) + (r.cut ? " (after " + usd(r.cut) + " in fees)" : ""));
  var ch = r.end - r.start;
  rows += '<dt class="tot">Account value</dt><dd class="tot">' + usd(r.end) + ' <span class="' + (ch >= 0 ? "up" : "down") + '">(' + (ch >= 0 ? "+" : "−") + usd(Math.abs(ch)) + ')</span></dd>';
  return '<div class="gout" id="g-out"><p><span class="chip ' + t[1] + '">' + t[0] + '</span> ' + c.fb + ' <a href="#' + c.l + '">' + viewLabel(c.l) + '</a></p><dl class="gres">' + rows + '</dl>' +
    '<div><button class="btn btn-primary" id="g-next" type="button">' + (game.y >= 10 ? "See your results →" : "Next year →") + '</button></div></div>';
}
function gRender(){
  var root = $("#game-root");
  if(gPhase === "intro"){
    root.innerHTML = '<div class="gcard"><p class="kicker">How it works</p><h3>Ten years, ten decisions</h3>' +
      '<ul class="gstory"><li>Each year brings one situation and two or three choices.</li><li>After you choose, you see what the market did and what your choice cost or earned.</li><li>At 26, you\'re compared with the steady path: someone who makes the first smart choice every year.</li></ul>' +
      '<p class="hint">Market returns in this game are made up, shaped like real history: mostly up years, one crash and a couple of down years.</p>' +
      '<div style="margin-top:16px"><button class="btn btn-primary" id="g-start" type="button">Start at age 16 →</button></div>' +
      (state.gameBest ? '<p class="hint" style="margin-top:12px">Your best finish so far: ' + usd(state.gameBest) + ' at age 26.</p>' : "") + '</div>';
    $("#g-start").addEventListener("click", function(){ game = gNew(); gPhase = "choose"; gEv = null; gRender(); gScroll("#game-root"); });
    return;
  }
  if(gPhase === "final"){ gFinal(root); return; }
  if(gPhase === "choose" && !gEv){
    gEv = G_EVENTS[game.y](game);
    var rand = seeded(hashStr("game" + game.y + ":" + gEv.choices.length));
    gOrder = gEv.choices.map(function(_, i){ return i; });
    for (var i = gOrder.length - 1; i > 0; i--){ var j = Math.floor(rand() * (i + 1)), t = gOrder[i]; gOrder[i] = gOrder[j]; gOrder[j] = t; }
  }
  var y = gPhase === "choose" ? game.y : game.y - 1;
  var html = gHud() + '<div class="gcard"><p class="kicker">Year ' + (y + 1) + ' of 10 · Age ' + (16 + y) + '</p><h3>' + gEv.title + '</h3><p class="gstory">' + gEv.story + '</p><div class="opts" id="g-opts">';
  gOrder.forEach(function(ci, pos){
    var c = gEv.choices[ci], cls = "opt" + (gPhase === "outcome" ? (ci === gPick ? " sel" : " dim") : "");
    html += '<button type="button" class="' + cls + '" data-ci="' + ci + '"' + (gPhase === "outcome" ? " disabled" : "") + '><span class="ol">' + LETTERS[pos] + '</span><span>' + c.label + '</span></button>';
  });
  html += '</div>' + (gPhase === "outcome" ? gOutcome() : "") + '</div>';
  root.innerHTML = html;
  if(gPhase === "choose"){
    $$("#g-opts .opt").forEach(function(b){
      b.addEventListener("click", function(){
        gPick = +b.getAttribute("data-ci");
        var c = gEv.choices[gPick];
        gRes = gPlay(game, c.fx);
        game.log.push({age:16 + game.y - 1, title:gEv.title, label:c.label, tag:c.tag, l:c.l});
        gPhase = "outcome"; gRender();
        var o = $("#g-out"); if(o) o.scrollIntoView({block:"nearest"});
      });
    });
  } else {
    $("#g-next").addEventListener("click", function(){
      if(game.y >= 10) gPhase = "final"; else { gPhase = "choose"; gEv = null; }
      gRender(); gScroll("#game-root");
    });
  }
}
function gFinal(root){
  var steady = gSteady(), you = gTotal(game), st = gTotal(steady), f = Math.pow(1.07, 39);
  var smart = game.log.filter(function(l){ return l.tag === "smart"; }).length;
  var persona = smart >= 9 ? ["The steady compounder", "You stuck to the plan almost every time. That's the whole secret."]
    : smart >= 6 ? ["Learning fast", "A few detours, but the core habits are there."]
    : ["Expensive lessons", "Better to learn these with pretend money. Every one of these mistakes is common in real life."];
  state.gameBest = Math.max(state.gameBest || 0, you); save(); FS.refreshProgress();
  var diff = you - st;
  var diffTxt = Math.abs(diff) < 1 ? "You matched the steady path." : "You finished " + usd(Math.abs(diff)) + (diff < 0 ? " behind" : " ahead of") + " the steady path.";
  root.innerHTML = gHud() + '<div class="gcard gfinal"><p class="kicker">Results · Age 26</p><h3>' + persona[0] + '</h3>' +
    '<p class="gstory">' + persona[1] + ' You made ' + smart + ' smart move' + (smart === 1 ? "" : "s") + ' out of 10. ' + diffTxt + '</p>' +
    '<div class="calc-out">' +
      '<div class="stat"><div class="sl"><span class="swatch sw1"></span>Your account</div><div class="sv num">' + usd(you) + '</div></div>' +
      '<div class="stat"><div class="sl"><span class="swatch sw2"></span>Steady path</div><div class="sv num">' + usd(st) + '</div></div>' +
      '<div class="stat"><div class="sl">Difference</div><div class="sv num ' + (diff < -0.5 ? "down" : "") + '">' + (diff < -0.5 ? "−" : "") + usd(Math.abs(diff)) + '</div></div>' +
    '</div>' +
    '<p class="calc-sum">If both accounts then sit untouched until 65, growing 7% a year, yours becomes about <strong>' + usd(Math.round(you * f / 100) * 100) + '</strong> and the steady path about <strong>' + usd(Math.round(st * f / 100) * 100) + '</strong>.</p>' +
    '<div class="legend"><span><i style="background:var(--series-1)"></i>You</span><span><i style="background:var(--series-2)"></i>Steady path</span></div>' +
    '<div class="chart-box" id="g-box"><svg class="chart" id="g-svg" role="img" aria-label="Your account value compared with the steady path, ages 16 to 26"></svg><div class="tip" id="g-tip" hidden></div></div>' +
    '<h4 class="g-h4">Your ten decisions</h4>' +
    '<ol class="glog">' +
    game.log.map(function(l){ var t = G_TAGS[l.tag]; return '<li><span class="glog-age">Age ' + l.age + '</span><div><strong>' + l.title + '</strong><span>' + l.label + '</span></div><span class="chip ' + t[1] + '">' + t[0] + '</span></li>'; }).join("") +
    '</ol>' +
    '<div class="result-actions"><button class="btn btn-primary" id="g-again" type="button">Play again</button><a class="btn" href="#plan">Build my real plan →</a></div></div>';
  $("#g-again").addEventListener("click", function(){ game = gNew(); gPhase = "choose"; gEv = null; gRender(); gScroll("#game-root"); });
  drawGameChart();
}
function drawGameChart(){
  if(gPhase !== "final" || !game || !$("#g-svg")) return;
  var steady = gSteady();
  lineChart({svg:$("#g-svg"), box:$("#g-box"), tip:$("#g-tip"), n:11, from0:true, endLabels:true, h:250, hN:210,
    series:[{name:"You", c:1, values:game.hist}, {name:"Steady path", c:2, values:steady.hist}],
    fmtAxis:function(v){ return short$(v); }, fmtEnd:short$, fmtTip:function(v){ return usd(v); },
    xLabel:function(i, narrow){ return i % (narrow ? 5 : 2) === 0 ? "Age " + (16 + i) : null; },
    tipTitle:function(i){ return "Age " + (16 + i); }});
}
gRender();

FS.redraw.game = drawGameChart;

})(window.FS);
