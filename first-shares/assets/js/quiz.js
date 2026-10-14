/* First Shares · quizzes and the final exam */
(function(FS){
"use strict";

var $ = FS.$, $$ = FS.$$, el = FS.el, fmt = FS.fmt, usd = FS.usd, hashStr = FS.hashStr, seeded = FS.seeded, state = FS.state, save = FS.save, VIEWS = FS.VIEWS, viewLabel = FS.viewLabel, LETTERS = FS.LETTERS, QUIZZES = FS.QUIZZES;

function buildQuiz(box){
  var id = box.getAttribute("data-quiz");
  var qs = QUIZZES[id];
  var deferred = id === "exam";
  var total = qs.length;
  var need = deferred ? Math.ceil(total * 0.8) : Math.ceil(total * 0.8);
  var answered = 0, correct = 0, picks = {};

  var head = el("div","quiz-head");
  var h = el("h3", null, deferred ? "Exam questions" : "Check yourself");
  var meta = el("span","quiz-meta");
  head.appendChild(h); head.appendChild(meta);
  var list = el("div","q-list");
  var footer = el("div");
  box.innerHTML = ""; box.appendChild(head); box.appendChild(list); box.appendChild(footer);

  function updateMeta(){
    if(deferred){
      meta.textContent = answered + " of " + total + " answered";
    } else {
      meta.textContent = answered < total ? (total + " questions · pass with " + need + " · " + correct + " right so far") : (correct + " / " + total);
    }
  }

  function render(){
    answered = 0; correct = 0; picks = {};
    list.innerHTML = ""; footer.innerHTML = "";
    qs.forEach(function(q, qi){
      var rand = seeded(hashStr(id + ":" + qi));
      var order = q[1].map(function(_, i){ return i; });
      if(q[1].length > 2){
        for (var i = order.length - 1; i > 0; i--){ var j = Math.floor(rand() * (i + 1)); var t = order[i]; order[i] = order[j]; order[j] = t; }
      }
      var card = el("div","q");
      card.appendChild(el("div","q-n", (deferred ? "QUESTION " : "Q") + (qi+1)));
      card.appendChild(el("p","q-prompt", q[0]));
      var opts = el("div","opts");
      var exp = el("div","explain"); exp.hidden = true;
      order.forEach(function(oi, pos){
        var b = el("button","opt", '<span class="ol">'+LETTERS[pos]+'</span><span>'+q[1][oi]+'</span>');
        b.type = "button";
        b.setAttribute("data-oi", oi);
        b.addEventListener("click", function(){
          if(deferred){
            if(box.classList.contains("graded")) return;
            if(picks[qi] == null) answered++;
            picks[qi] = oi;
            $$(".opt", opts).forEach(function(o){ o.classList.toggle("sel", o === b); o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
            updateMeta(); updateGradeBtn();
          } else {
            if(picks[qi] != null) return;
            picks[qi] = oi; answered++;
            var ok = oi === 0;
            if(ok) correct++;
            reveal(opts, exp, q, oi);
            updateMeta();
            if(answered === total) finish();
          }
        });
        opts.appendChild(b);
      });
      card.appendChild(opts); card.appendChild(exp);
      list.appendChild(card);
    });
    if(deferred){
      var row = el("div","result");
      row.innerHTML = '<p>Answer every question, then grade your exam.</p>';
      var gb = el("button","btn btn-primary","Grade my exam"); gb.type = "button"; gb.id = "grade-btn"; gb.disabled = true;
      gb.addEventListener("click", grade);
      row.appendChild(gb); footer.appendChild(row);
    }
    box.classList.remove("graded");
    updateMeta();
  }

  function updateGradeBtn(){ var gb = $("#grade-btn", footer); if(gb) gb.disabled = answered < total; }

  function reveal(opts, exp, q, oi){
    $$(".opt", opts).forEach(function(o){
      var v = +o.getAttribute("data-oi");
      o.disabled = true;
      o.classList.remove("sel");
      if(v === 0) o.classList.add("ok");
      else if(v === oi) o.classList.add("no");
      else o.classList.add("dim");
    });
    var ok = oi === 0;
    exp.innerHTML = '<span class="verdict '+(ok?"ok":"no")+'">'+(ok?"Correct":"Not quite")+'</span>' + q[2];
    exp.hidden = false;
  }

  function grade(){
    correct = 0;
    $$(".q", list).forEach(function(card, qi){
      var oi = picks[qi];
      if(oi === 0) correct++;
      reveal($(".opts", card), $(".explain", card), qs[qi], oi);
    });
    box.classList.add("graded");
    finish();
    var r = $(".result", footer); if(r) r.scrollIntoView({block:"nearest"});
  }

  function finish(){
    var pct = Math.round(correct / total * 100);
    var passed = correct >= need;
    state.best[id] = Math.max(state.best[id] || 0, correct);
    if(passed && !deferred){ state.passed[id] = true; }
    if(deferred){ state.exam = {score: correct, total: total}; }
    save(); FS.refreshProgress();
    footer.innerHTML = "";
    var r = el("div","result");
    var msg;
    if(deferred){
      var band = pct >= 90 ? "Excellent. You're ready to make a real plan." : pct >= 80 ? "Strong. Review the ones you missed, then build your plan." : pct >= 60 ? "Good start. Revisit the lessons behind the questions you missed." : "Go back through the lessons, then try again.";
      msg = '<p><span class="chip '+(passed?"ok":"no")+'">'+correct+' / '+total+' · '+pct+'%</span> '+band+'</p>';
    } else {
      msg = '<p><span class="chip '+(passed?"ok":"no")+'">'+(passed?"Passed":"Not yet")+'</span> You got '+correct+' of '+total+'. '+(passed?"Lesson complete.":"You need "+need+" to pass. Reread the explanations and try again.")+'</p>';
    }
    r.innerHTML = msg;
    var acts = el("div","result-actions");
    var again = el("button","btn", deferred ? "Retake exam" : "Try again"); again.type = "button";
    again.addEventListener("click", function(){ render(); box.scrollIntoView({block:"start"}); });
    acts.appendChild(again);
    if(!deferred && passed){
      var idx = VIEWS.indexOf(id);
      var nextId = VIEWS[idx+1];
      if(nextId){
        var nx = el("a","btn btn-primary", "Next: " + viewLabel(nextId) + " →");
        nx.href = "#" + nextId; acts.appendChild(nx);
      }
    }
    if(deferred){
      var pl = el("a","btn btn-primary","Build my plan →"); pl.href = "#plan"; acts.appendChild(pl);
    }
    r.appendChild(acts);
    footer.appendChild(r);
  }

  render();
}
$$(".quiz").forEach(buildQuiz);

})(window.FS);
