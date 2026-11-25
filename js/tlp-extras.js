(function () {
  'use strict';
  if (window.TLP_EXTRAS) return;


  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function dhash(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function esc(t) {
    return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function getPath() {
    try { return localStorage.getItem('tlp-path') || 'g710'; } catch (e) { return 'g710'; }
  }
  function getScore() {
    try {
      var sc = document.getElementById('sc');
      return sc ? parseInt(sc.textContent, 10) || 0 : 0;
    } catch (e) { return 0; }
  }
  function getStars() {
    try {
      var prog = JSON.parse(localStorage.getItem('tlp-prog') || '{}');
      return Object.values(prog).reduce(function (a, b) { return a + (b || 0); }, 0);
    } catch (e) { return 0; }
  }
  function addBonus(pts) {

    try {
      if (window.addBonus) { window.addBonus(pts); return; }

      var sc = document.getElementById('sc');
      if (sc) sc.textContent = String((parseInt(sc.textContent, 10) || 0) + pts);
    } catch (e) {}
  }
  function playSnd(name) {
    try { if (window.snd) window.snd(name); } catch (e) {}
  }








  var MEMORY_QS = [

    { ci:0, q:'What does a "repeat 3 times" block do to the instructions inside it?', a:'Runs them 3 times', wrong:['Runs them once','Skips them','Runs them randomly'] },
    { ci:0, q:'What is a variable in programming?', a:'A named container that holds a value', wrong:['A type of loop','A fixed number','A button in the game'] },
    { ci:0, q:'What happens when you press Run in the game?', a:'The robot follows your block instructions', wrong:['The game saves','The hints reset','The score doubles'] },
    { ci:0, q:'Which block type makes the robot say something?', a:'Say', wrong:['Move','Set','Repeat'] },
    { ci:0, q:'What is a bug in programming?', a:'An error that makes the program behave wrongly', wrong:['A fast program','A special command','A type of variable'] },

    { ci:1, q:'What is a string in programming?', a:'A sequence of characters treated as text', wrong:['A type of loop','A list of numbers','A kind of robot'] },
    { ci:1, q:'True or False in programming is called a what?', a:'Boolean', wrong:['Integer','String','Variable'] },
    { ci:1, q:'What is an integer?', a:'A whole number with no decimal part', wrong:['Any number','A piece of text','A list'] },
    { ci:1, q:'What does "type casting" mean?', a:'Converting a value from one type to another', wrong:['Throwing a value away','Naming a variable','Running the program twice'] },

    { ci:2, q:'What is a function in programming?', a:'A named reusable block that does one job', wrong:['A type of variable','A special loop','A game level'] },
    { ci:2, q:'What is "scope" in programming?', a:'The region of code where a variable exists', wrong:['The speed of a program','The size of an array','The name of a function'] },
    { ci:2, q:'What does "debugging" mean?', a:'Finding and fixing errors in a program', wrong:['Running a program faster','Adding more features','Deleting variables'] },
    { ci:2, q:'What is a parameter?', a:'A named value a function accepts as input', wrong:['The result a function returns','A type of loop','A variable outside a function'] },

    { ci:3, q:'What is an array?', a:'An ordered list of values stored under one name', wrong:['A single number','A type of condition','A named function'] },
    { ci:3, q:'What does recursion mean?', a:'A function that calls itself to solve a problem', wrong:['A loop that never ends','A program with no bugs','A very long variable name'] },
    { ci:3, q:'What is the difference between a loop and recursion?', a:'A loop repeats using a counter; recursion repeats by calling itself', wrong:['There is no difference','Loops are faster always','Recursion uses more variables'] },

    { ci:4, q:'How many bits are in one byte?', a:'8', wrong:['4','16','2'] },
    { ci:4, q:'What is binary?', a:'A number system using only 0 and 1', wrong:['A system using 0 to 9','A type of string','A special loop'] },
    { ci:4, q:'What is 5 in binary?', a:'101', wrong:['110','011','100'] },
    { ci:4, q:'What does a bit store?', a:'A single 0 or 1', wrong:['One character','A whole number','A list'] }
  ];

  function getAvailableQuestions() {

    var prog = {};
    try { prog = JSON.parse(localStorage.getItem('tlp-prog') || '{}'); } catch (e) {}
    var maxCi = 0;
    Object.keys(prog).forEach(function (k) {
      var ci = parseInt(k.split('-')[0], 10);
      if (!isNaN(ci) && ci > maxCi) maxCi = ci;
    });
    return MEMORY_QS.filter(function (q) { return q.ci <= maxCi; });
  }

  function getTodayQuestion() {
    var pool = getAvailableQuestions();
    if (!pool.length) pool = MEMORY_QS.filter(function (q) { return q.ci === 0; });
    var seed = dhash(today() + getPath());
    return pool[seed % pool.length];
  }

  function getMemoryState() {
    var key = 'tlp-extras-memory:' + today();
    try { return JSON.parse(localStorage.getItem(key) || 'null') || { answered: false, correct: false }; } catch (e) { return { answered: false, correct: false }; }
  }

  function saveMemoryState(state) {
    try { localStorage.setItem('tlp-extras-memory:' + today(), JSON.stringify(state)); } catch (e) {}
  }

  function renderMemory() {
    var el = document.getElementById('tlp-memory');
    if (!el) return;
    var state = getMemoryState();
    var q = getTodayQuestion();

    if (state.answered) {
      el.innerHTML = '<div class="mem-card mem-done">' +
        '<b>' + (state.correct ? 'Memory refreshed — +50 points' : 'Not quite, but you saw the answer') + '</b>' +
        '<p class="mem-q">' + esc(q.q) + '</p>' +
        '<p class="mem-ans">Answer: <strong>' + esc(q.a) + '</strong></p></div>';
      return;
    }


    var opts = [q.a].concat(q.wrong).sort(function () { return dhash(today() + q.q) % 3 - 1; });

    el.innerHTML = '<div class="mem-card">' +
      '<div class="mem-top"><span class="mem-label">Memory refresh</span><span class="mem-sub">One question · takes 10 seconds</span></div>' +
      '<p class="mem-q">' + esc(q.q) + '</p>' +
      '<div class="mem-opts">' + opts.map(function (o) {
        return '<button type="button" class="mem-opt" data-ans="' + esc(o) + '" data-correct="' + (o === q.a ? '1' : '0') + '">' + esc(o) + '</button>';
      }).join('') + '</div>' +
      '</div>';

    el.querySelectorAll('.mem-opt').forEach(function (btn) {
      btn.onclick = function () {
        var correct = btn.dataset.correct === '1';
        var state = { answered: true, correct: correct };
        saveMemoryState(state);

        el.querySelectorAll('.mem-opt').forEach(function (b) {
          b.disabled = true;
          if (b.dataset.correct === '1') b.classList.add('mem-right');
          else if (b === btn && !correct) b.classList.add('mem-wrong');
        });
        if (correct) { addBonus(50); playSnd('ach'); }
        setTimeout(function () { renderMemory(); }, 1200);
      };
    });
  }






  var CHALLENGES = [
    { id:'c-seq',   title:'Sequence Puzzle',    pts:250, desc:'Complete the pattern: 2, 4, 8, 16, __. What is the rule?',    answer:'32',   hint:'Each number is doubled.',          type:'input' },
    { id:'c-loop',  title:'Loop Counter',       pts:250, desc:'A loop runs "print hello" 4 times. How many times does "hello" appear in the output?', answer:'4', hint:'One print per run.', type:'input' },
    { id:'c-bool',  title:'Boolean Logic',      pts:250, desc:'true AND false = ?',         answer:'false',  hint:'AND is only true when BOTH sides are true.',  type:'choice', choices:['true','false','maybe','error'] },
    { id:'c-var',   title:'Variable Trace',     pts:250, desc:'x = 5. x = x + 3. x = x * 2. What is x?', answer:'16', hint:'Do each step in order.', type:'input' },
    { id:'c-bit',   title:'Binary Conversion',  pts:250, desc:'What is the decimal value of binary 1010?', answer:'10', hint:'8 + 0 + 2 + 0 = ?',           type:'input' },
    { id:'c-func',  title:'Function Output',    pts:250, desc:'def double(n): return n * 2. What does double(7) return?', answer:'14', hint:'7 multiplied by 2.',     type:'input' },
    { id:'c-scope', title:'Scope Question',     pts:250, desc:'A variable x is created inside a function. Can code outside the function use x?', answer:'No', hint:'Local variables are only visible inside their function.', type:'choice', choices:['Yes','No','Sometimes','Only in loops'] }
  ];

  function getTodayChallenge() {
    var seed = dhash(today() + 'challenge' + getPath());
    return CHALLENGES[seed % CHALLENGES.length];
  }

  function getChallengeState() {
    var key = 'tlp-extras-challenge:' + today();
    try { return JSON.parse(localStorage.getItem(key) || 'null') || { done: false, correct: false }; } catch (e) { return { done: false, correct: false }; }
  }

  function saveChallengeState(state) {
    try { localStorage.setItem('tlp-extras-challenge:' + today(), JSON.stringify(state)); } catch (e) {}
  }

  function renderChallenge() {
    var el = document.getElementById('tlp-challenge');
    if (!el) return;
    var ch = getTodayChallenge();
    var state = getChallengeState();

    if (state.done) {
      el.innerHTML = '<div class="ch-card ch-done">' +
        '<b>' + (state.correct ? 'Challenge conquered — +250 points' : 'Attempted — come back tomorrow for a new one') + '</b>' +
        '<p class="ch-desc">' + esc(ch.desc) + '</p>' +
        '<p class="ch-hint">Answer: <strong>' + esc(ch.answer) + '</strong></p></div>';
      return;
    }

    var inputHtml = '';
    if (ch.type === 'choice') {
      var seed2 = dhash(today() + ch.id);
      var shuffled = ch.choices.slice().sort(function () { return (dhash(today() + this) % 3) - 1; }, ch.id);
      inputHtml = '<div class="ch-choices">' + ch.choices.map(function (c) {
        return '<button type="button" class="ch-opt" data-ans="' + esc(c) + '">' + esc(c) + '</button>';
      }).join('') + '</div>';
    } else {
      inputHtml = '<div class="ch-input-row"><input type="text" id="ch-ans" class="ch-input" placeholder="Your answer" autocomplete="off" maxlength="40"><button type="button" class="btn sm" id="ch-submit">Check</button></div>' +
        '<button type="button" class="ch-hint-btn" id="ch-hint">Show hint</button>' +
        '<p class="ch-hint-text" id="ch-hint-text" hidden>' + esc(ch.hint) + '</p>';
    }

    el.innerHTML = '<div class="ch-card"><div class="ch-top"><span class="ch-label">Daily Challenge</span><span class="ch-pts">+' + ch.pts + ' pts</span></div>' +
      '<b class="ch-title">' + esc(ch.title) + '</b>' +
      '<p class="ch-desc">' + esc(ch.desc) + '</p>' +
      inputHtml + '<p class="ch-msg" id="ch-msg"></p></div>';

    function checkAnswer(given) {
      var correct = given.trim().toLowerCase() === ch.answer.toLowerCase();
      saveChallengeState({ done: true, correct: correct });
      if (correct) { addBonus(ch.pts); playSnd('win'); }
      else playSnd('err');
      setTimeout(renderChallenge, 900);
    }

    if (ch.type === 'choice') {
      el.querySelectorAll('.ch-opt').forEach(function (btn) {
        btn.onclick = function () {
          var given = btn.dataset.ans;
          el.querySelectorAll('.ch-opt').forEach(function (b) { b.disabled = true; });
          var correct = given.toLowerCase() === ch.answer.toLowerCase();
          btn.classList.add(correct ? 'ch-right' : 'ch-wrong');
          if (!correct) {
            var rightBtn = el.querySelector('.ch-opt[data-ans="' + ch.answer + '"]');
            if (rightBtn) rightBtn.classList.add('ch-right');
          }
          saveChallengeState({ done: true, correct: correct });
          if (correct) { addBonus(ch.pts); playSnd('win'); }
          else playSnd('err');
          setTimeout(renderChallenge, 1200);
        };
      });
    } else {
      var submitBtn = document.getElementById('ch-submit');
      var hintBtn = document.getElementById('ch-hint');
      var hintText = document.getElementById('ch-hint-text');
      var ansInput = document.getElementById('ch-ans');
      if (submitBtn) submitBtn.onclick = function () { if (ansInput && ansInput.value.trim()) checkAnswer(ansInput.value); };
      if (ansInput) ansInput.onkeydown = function (e) { if (e.key === 'Enter' && ansInput.value.trim()) checkAnswer(ansInput.value); };
      if (hintBtn && hintText) hintBtn.onclick = function () { hintText.hidden = false; hintBtn.hidden = true; };
    }
  }





  function writeHomeSnapshot() {
    try {
      var prog = {};
      try { prog = JSON.parse(localStorage.getItem('tlp-prog') || '{}'); } catch (e) {}
      var totalStars = Object.values(prog).reduce(function (a, b) { return a + (b || 0); }, 0);
      var totalDone = Object.keys(prog).length;
      var streak = 0;
      try {
        if (window.TLP_STREAK) {
          streak = TLP_STREAK.get().count;
        } else {
          var lid = 'guest';
          try {
            var l = window.TLP_AUTH && TLP_AUTH.getActiveLearner && TLP_AUTH.getActiveLearner();
            if (l && l.id && !l.isGuest) lid = l.id;
          } catch (e2) {}
          var strData = JSON.parse(localStorage.getItem('tlp-streak:' + lid) || 'null');
          if (strData) streak = strData.count || 0;
        }
      } catch (e) {}
      var name = '';
      try {
        var auth = window.TLP_AUTH;
        if (auth) {
          var learner = auth.getActiveLearner && auth.getActiveLearner();
          name = (learner && !learner.isGuest && learner.name) || (auth.getCurrentUser && auth.getCurrentUser() && auth.getCurrentUser().displayName) || localStorage.getItem('tlp-name') || '';
        } else {
          name = localStorage.getItem('tlp-name') || '';
        }
      } catch (e) {}
      var snapshot = {
        name: String(name).trim().slice(0, 30),
        stars: totalStars,
        done: totalDone,
        streak: streak,
        path: getPath(),
        ts: Date.now()
      };
      localStorage.setItem('tlp-home-snapshot', JSON.stringify(snapshot));
    } catch (e) {}
  }





  function injectExtrasContainers() {
    var daily = document.getElementById('daily');
    if (!daily) return;


    var dashrow = daily.parentElement;
    if (!dashrow) return;


    if (!document.getElementById('tlp-memory')) {
      var memEl = document.createElement('div');
      memEl.id = 'tlp-memory';
      memEl.style.cssText = 'margin:12px 0';
      dashrow.after(memEl);
    }


    if (!document.getElementById('tlp-challenge')) {
      var chEl = document.createElement('div');
      chEl.id = 'tlp-challenge';
      chEl.style.cssText = 'margin:12px 0';
      var memRef = document.getElementById('tlp-memory');
      if (memRef) memRef.after(chEl);
      else dashrow.after(chEl);
    }
  }




  function injectCSS() {
    if (document.getElementById('tlp-extras-css')) return;
    var css = [

      '.mem-card{border:1px solid color-mix(in srgb,var(--b,#9fa0ff) 35%,var(--line,rgba(255,255,255,.13)));border-radius:16px;padding:16px 18px;background:color-mix(in srgb,var(--b,#9fa0ff) 7%,transparent);animation:memIn .4s cubic-bezier(.2,1.4,.4,1) both}',
      '@keyframes memIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}',
      '.mem-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}',
      '.mem-label{font:700 11px var(--sans,system-ui);letter-spacing:.12em;text-transform:uppercase;color:var(--b,#9fa0ff)}',
      '.mem-sub{font-size:12px;color:var(--mut,#aab)}',
      '.mem-q{font-size:14.5px;line-height:1.55;color:var(--fg,#f3efe8);margin:0 0 12px;font-weight:500}',
      '.mem-opts{display:flex;flex-wrap:wrap;gap:7px}',
      '.mem-opt{padding:9px 16px;border-radius:12px;border:1px solid var(--line,rgba(255,255,255,.13));background:rgba(255,255,255,.04);color:var(--fg,#f3efe8);font:500 13.5px var(--sans,system-ui);cursor:pointer;transition:background .15s,border-color .15s,transform .15s}',
      '.mem-opt:hover:not(:disabled){background:color-mix(in srgb,var(--b,#9fa0ff) 14%,transparent);border-color:color-mix(in srgb,var(--b,#9fa0ff) 50%,transparent);transform:translateY(-1px)}',
      '.mem-opt.mem-right{background:color-mix(in srgb,#3ddc84 20%,transparent);border-color:#3ddc84;color:#3ddc84}',
      '.mem-opt.mem-wrong{background:color-mix(in srgb,#ef7a8c 20%,transparent);border-color:#ef7a8c;color:#ef7a8c}',
      '.mem-card.mem-done{opacity:.9}',
      '.mem-card.mem-done .mem-icon{font-size:28px;margin-bottom:6px}',
      '.mem-card.mem-done b{display:block;font:800 15px var(--serif,"Fraunces",Georgia,serif);font-style:italic;margin-bottom:6px}',
      '.mem-ans{font-size:13px;color:var(--mut,#aab);margin-top:4px}',

      '.ch-card{border:1px solid color-mix(in srgb,var(--a,#5ac8e8) 35%,var(--line,rgba(255,255,255,.13)));border-radius:16px;padding:16px 18px;background:color-mix(in srgb,var(--a,#5ac8e8) 7%,transparent);animation:memIn .4s cubic-bezier(.2,1.4,.4,1) both}',
      '.ch-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}',
      '.ch-label{font:700 11px var(--sans,system-ui);letter-spacing:.12em;text-transform:uppercase;color:var(--a,#5ac8e8)}',
      '.ch-pts{font:800 13px var(--sans,system-ui);color:var(--a,#5ac8e8)}',
      '.ch-title{display:block;font:800 17px var(--serif,"Fraunces",Georgia,serif);font-style:italic;margin-bottom:8px}',
      '.ch-desc{font-size:14.5px;line-height:1.55;color:var(--fg,#f3efe8);margin:0 0 12px}',
      '.ch-choices{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:8px}',
      '.ch-opt{padding:9px 16px;border-radius:12px;border:1px solid var(--line,rgba(255,255,255,.13));background:rgba(255,255,255,.04);color:var(--fg,#f3efe8);font:500 13.5px var(--sans,system-ui);cursor:pointer;transition:background .15s,border-color .15s,transform .15s}',
      '.ch-opt:hover:not(:disabled){background:color-mix(in srgb,var(--a,#5ac8e8) 14%,transparent);border-color:color-mix(in srgb,var(--a,#5ac8e8) 50%,transparent);transform:translateY(-1px)}',
      '.ch-opt.ch-right{background:color-mix(in srgb,#3ddc84 20%,transparent);border-color:#3ddc84;color:#3ddc84}',
      '.ch-opt.ch-wrong{background:color-mix(in srgb,#ef7a8c 20%,transparent);border-color:#ef7a8c;color:#ef7a8c}',
      '.ch-input-row{display:flex;gap:8px;margin-bottom:8px}',
      '.ch-input{flex:1;min-height:40px;padding:0 12px;border-radius:10px;border:1px solid var(--line,rgba(255,255,255,.13));background:rgba(255,255,255,.05);color:var(--fg,#f3efe8);font:15px var(--sans,system-ui)}',
      '.ch-input:focus{outline:none;border-color:var(--a,#5ac8e8);box-shadow:0 0 0 3px color-mix(in srgb,var(--a,#5ac8e8) 20%,transparent)}',
      '.ch-hint-btn{background:none;border:0;color:var(--mut,#aab);font:500 13px var(--sans,system-ui);cursor:pointer;text-decoration:underline;text-underline-offset:3px;padding:2px 0}',
      '.ch-hint-text{font-size:13px;color:var(--mut,#aab);font-style:italic;margin:4px 0;line-height:1.5}',
      '.ch-msg{font-size:13px;min-height:1em;color:var(--mut,#aab)}',
      '.ch-card.ch-done .ch-icon{font-size:28px;margin-bottom:6px}',
      '.ch-card.ch-done b{display:block;font:800 15px var(--serif,"Fraunces",Georgia,serif);font-style:italic;margin-bottom:6px}',
      '.ch-hint{font-size:13px;color:var(--mut,#aab);margin-top:4px}'
    ].join('\n');
    var st = document.createElement('style');
    st.id = 'tlp-extras-css';
    st.textContent = css;
    document.head.appendChild(st);
  }




  function renderAll() {
    injectExtrasContainers();
    renderMemory();
    renderChallenge();
    writeHomeSnapshot();
  }


  function hookMenu() {
    var orig = window.menu;
    if (typeof orig !== 'function') return;
    window.menu = function () {
      orig.apply(this, arguments);
      try { renderAll(); } catch (e) {}
    };
    var m = document.getElementById('menu');
    if (m && !m.hidden) {
      try { renderAll(); } catch (e) {}
    }
  }

  injectCSS();


  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(hookMenu, 100); });
  } else {
    setTimeout(hookMenu, 100);
  }

  window.TLP_EXTRAS = {
    renderAll: renderAll,
    writeHomeSnapshot: writeHomeSnapshot
  };
})();
