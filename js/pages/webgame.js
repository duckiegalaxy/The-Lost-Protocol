let PATH = 'g710';
try { PATH = localStorage.getItem('tlp-path') || 'g710'; } catch(e) {}
let DIFF = 'int';
try { DIFF = localStorage.getItem('tlp-diff') || 'int'; } catch(e) {}
let __D = DIFF;

const __raw = (() => {
  const g = Storage.prototype.getItem, s = Storage.prototype.setItem, r = Storage.prototype.removeItem;
  const NS = /^tlp-(prog|draft|boss\d*|ach|badges|runs|bonus-points|daily)$/;
  const m = (k) => {
    if (!NS.test(k)) return k;
    const itemKey = k.replace(/^tlp-/, '');


    if (window.__adminPreview) return `tlp-preview@${PATH || 'g710'}@${DIFF || 'int'}@${itemKey}`;
    if (window.TLP_AUTH && typeof window.TLP_AUTH.getActiveSaveKey === 'function') {
      return window.TLP_AUTH.getActiveSaveKey(itemKey, PATH, DIFF);
    }
    return `tlp-v2@guest@default@${PATH || 'g710'}@${DIFF || 'int'}@${itemKey}`;
  };
  Storage.prototype.getItem = function(k) { return g.call(this, m(k)); };
  Storage.prototype.setItem = function(k, v) { return s.call(this, m(k), v); };
  Storage.prototype.removeItem = function(k) { return r.call(this, m(k)); };
  return { g, s, r, m };
})();


function storyBrief(){try{document.querySelectorAll('.coach').forEach(x=>x.remove());if(!window.TLP_STORY||S.li!==0)return;const c=S.ci,el=$('#learn');if(!el)return;let h='';const si=TLP_STORY.firstInSection(c);
 const a=si>=0?TLP_STORY.act(si,PATH):null;




 let justEnd=null;if(window.__justActEnd!=null){justEnd=window.__justActEnd;window.__justActEnd=null}
 if(a&&si>0&&!S._skipActCine&&justEnd!==si&&!$('#sc-body'))storyScenes({title:a.title,scenes:[a.lines],button:'Begin'},()=>{});
 if(si>=0&&a)h+='<b class="actt">'+a.title+'</b>'+TLP_STORY.lines(a.lines)
 if(lv().boss)h+=TLP_STORY.lines(TLP_STORY.bossIntro(c));
 h+=TLP_STORY.lines(TLP_STORY.brief(c));if(!h)return;
 const d=document.createElement('div');d.className='story';d.innerHTML=h;const m=el.querySelector('.mis');if(m)m.after(d);else el.appendChild(d)}catch(e){}}
function storyOutcome(last,skipAct){try{if(!window.TLP_STORY||!last)return;const c=S.ci;let h='';
 if(lv().boss)h+=TLP_STORY.lines(TLP_STORY.bossOutro(c));
 h+=TLP_STORY.lines(TLP_STORY.win(c,PATH));
 const si=TLP_STORY.sectionOf(c);const _sx=SEC.find(x=>x.id===si);if(!skipAct&&_sx&&_sx.boss===c)h+=TLP_STORY.lines(TLP_STORY.actEnd(si,PATH));
 if(!h)return;const d=document.createElement('div');d.className='story';d.innerHTML=h;const p=$('#pan p');if(p)p.after(d)}catch(e){}}
function storyFail(){try{if(!window.TLP_STORY)return'';const f=TLP_STORY.fail();return ' <i>'+TLP_STORY.WHO[f[0]].name+': '+f[1]+'</i>'}catch(e){return''}}




function storyScenes(o,done){
 const art={
  s:'<span class="cs-term"><b></b><b></b><b></b><i></i></span>',
  r:'<span class="cs-bot r"><span class="cs-head"><i></i><i></i><b></b></span><span class="cs-ant"></span><span class="cs-halo"></span></span>',
  u:'<span class="cs-bot u"><span class="cs-head"><i></i><i></i><b></b></span><span class="cs-halo"></span></span>',
  l:'<span class="cs-radio"><span class="cs-waves"><i></i><i></i><i></i><i></i><i></i></span><b>VOSS · COMMS</b></span>'
 };
 const c=cine(`<div class="stage cs-stage"><div class="cs-bg" aria-hidden="true"><i class="cs-grid"></i><i class="cs-scan"></i>${'<b></b>'.repeat(6)}</div>`+
  `<h2 class="ctitle cs-title">${o.title}</h2>`+
  `<div class="cs-scene" id="sc-scene" data-who="s"><div class="cs-port" id="sc-port" aria-hidden="true"></div>`+
  `<div class="cs-say"><div class="sbody" id="sc-body"></div><div class="cs-live" id="sc-live" aria-live="polite"></div></div></div>`+
  `${o.objective?`<div class="sobj" id="sc-obj" hidden>${o.objective}</div>`:''}`+
  `<div class="cs-dots" id="sc-dots" aria-hidden="true">${o.scenes.map(()=>'<span class="cs-dot"></span>').join('')}</div>`+
  `<div class="bar cs-bar"><button class="btn ghost sm" id="sc-listen" type="button"><i class=ic-volume></i> Listen</button><button class="btn ghost sm" id="sc-stop" type="button">Stop voice</button><button class="btn ghost sm" id="sc-skip" type="button">Skip</button><button class="btn" id="sc-next" type="button">Show all</button></div></div>`,'c-story');
 const stage=c.querySelector('#sc-scene'),port=c.querySelector('#sc-port'),body=c.querySelector('#sc-body'),live=c.querySelector('#sc-live'),
       dots=[...c.querySelectorAll('.cs-dot')],nx=c.querySelector('#sc-next'),obj=c.querySelector('#sc-obj');
 const beats=[];o.scenes.forEach((sc,si)=>sc.forEach(p=>beats.push({who:p[0],text:p[1],si})));
 let i=0,timer=null,full='',span=null,arLine=null;
 const last=()=>i===beats.length-1;
 const halt=()=>{if(timer){clearInterval(timer);timer=null}};
 const syncArabic=()=>{if(arLine){arLine.remove();arLine=null}if(!window.TLP_ARABIC||!TLP_ARABIC.isActive()||!span)return;const ar=TLP_ARABIC.t(full);if(!ar||ar===full)return;arLine=document.createElement('div');arLine.className='ar-line show';arLine.dir='rtl';arLine.lang='ar';arLine.textContent=ar;span.parentElement.appendChild(arLine)};
 const stopArabic=()=>window.removeEventListener('tlp-arabic-change',syncArabic);
 const idle=()=>{nx.textContent=last()?o.button:'Next';if(last()&&obj)obj.hidden=false};
 const reveal=()=>{halt();if(span){span.textContent=full;span.classList.remove('typing')}stage.classList.remove('typing');idle()};
 const say=()=>{const b=beats[i],prevWho=stage.dataset.who;stage.dataset.who=b.who;port.innerHTML=art[b.who]||art.s;
  stage.classList.remove('swap');void stage.offsetWidth;stage.classList.add('swap');
  if(prevWho!==b.who&&!still){const r=port.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,7,['var(--a)','var(--b)','#ffd36a'])}
  const box=document.createElement('div');box.innerHTML=TLP_STORY.line([b.who,b.text]);
  const ln=box.firstElementChild;ln.classList.add('ar-bilingual');span=ln.querySelector('span');body.replaceChildren(ln);
  full=b.text;live.textContent=window.TLP_ARABIC?TLP_ARABIC.t(TLP_STORY.plain([[b.who,b.text]])):TLP_STORY.plain([[b.who,b.text]]);
  window.addEventListener('tlp-arabic-change',syncArabic);syncArabic();
  dots.forEach((d,k)=>d.classList.toggle('on',k<=b.si));
  if(still){idle();return}
  const chars=Array.from(full);let n=0;span.textContent='';span.classList.add('typing');stage.classList.add('typing');nx.textContent='Show all';
  timer=setInterval(()=>{n++;span.textContent=chars.slice(0,n).join('');if(n>=chars.length){halt();span.classList.remove('typing');stage.classList.remove('typing');idle()}},22)};
 const end=()=>{halt();stopArabic();document.removeEventListener('keydown',key);try{TLP.Voice.stop()}catch(e){}uncine();done()};
 const key=e=>{if(e.key==='Escape')end()};
 nx.onclick=()=>{if(timer){snd('tap');reveal();return}snd('chime');if(!last()){i++;say()}else end()};
 c.querySelector('.cs-scene').onclick=()=>{if(timer){snd('tap');reveal()}};
 c.querySelector('#sc-skip').onclick=end;
 c.querySelector('#sc-listen').onclick=()=>{try{TLP.Voice.speak(TLP_STORY.plain([[beats[i].who,beats[i].text]]))}catch(e){}};
 c.querySelector('#sc-stop').onclick=()=>{try{TLP.Voice.stop()}catch(e){}try{stopSay()}catch(e){}};
 document.addEventListener('keydown',key);
 say();nx.focus()}
function storyOpening(force){if(!window.TLP_STORY||(!force&&TLP_STORY.seen('intro'))||$('#sc-body'))return;storyScenes(TLP_STORY.opening(PATH),()=>{TLP_STORY.mark('intro');play(ORDER[0],0)})}
function storyEnding(next){if(!window.TLP_STORY)return next();storyScenes(TLP_STORY.ending(PATH),()=>{TLP_STORY.mark('ending');difficultyCelebration(next)})}
window.storyOpening=storyOpening;



function watchStory(spec,pathOverride){
 if(!window.TLP_STORY)return;
 const wp=pathOverride||new URLSearchParams(location.search).get('path');
 const path=(wp&&PATHS_CFG[wp])?wp:PATH;
 const p=String(spec||'').split('-'),kind=p[0],n=+p[1];
 let o=null;
 try{
  if(kind==='opening')o=TLP_STORY.opening(path);
  else if(kind==='ending')o=TLP_STORY.ending(path);
  else if(kind==='act'&&n>=0){const a=TLP_STORY.act(n,path,true);if(a)o={title:a.title,scenes:[a.lines],button:'Close'}}
  else if(kind==='actend'&&n>=0){const el=TLP_STORY.actEnd(n,path,true);if(el&&el.length)o={title:'Act '+(n+1)+' · complete',scenes:[el],button:'Close'}}
  else if(kind==='brief'&&CH[n]){const b=TLP_STORY.brief(n);if(b&&b.length)o={title:CH[n].n+' · briefing',scenes:[b],button:'Close'}}
  else if(kind==='win'&&CH[n]){const w=TLP_STORY.win(n,path);if(w&&w.length)o={title:CH[n].n+' · complete',scenes:[w],button:'Close'}}
  else if(kind==='bossin'&&CH[n]){const b=TLP_STORY.bossIntro(n);if(b&&b.length)o={title:CH[n].n+' · guardian',scenes:[b],button:'Close'}}
  else if(kind==='bossout'&&CH[n]){const b=TLP_STORY.bossOutro(n);if(b&&b.length)o={title:CH[n].n+' · defeated',scenes:[b],button:'Close'}}
 }catch(e){}
 if(o&&o.scenes&&o.scenes.length)storyScenes(o,()=>{});
}


async function openLeaderboard(){let m=$('#lbm');
 if(!m){m=document.createElement('div');m.id='lbm';m.className='tlpm';m.hidden=true;m.innerHTML='<div class="tlpm-pan" role="dialog" aria-modal="true" aria-labelledby="lbt"><button class="tlpm-x" type="button" aria-label="Close" id="lbx">✕</button><h2 id="lbt">Leaderboard</h2><p class="s" id="lbs"></p><div id="lbl" aria-live="polite"></div></div>';document.body.appendChild(m);
  const cl=()=>{m.hidden=true};$('#lbx').onclick=cl;m.addEventListener('click',e=>{if(e.target===m)cl()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!m.hidden)cl()})}
 m.hidden=false;const dn={beg:'Beginner',int:'Intermediate',pro:'Pro'}[DIFF||'int']||'';
 $('#lbs').textContent=(PATHS_CFG[PATH]?PATHS_CFG[PATH].n:'')+' · '+dn+' · your score: '+score();
 const box=$('#lbl');box.textContent='Loading...';
 try{const rows=await TLP_AUTH.getLeaderboardEntries({path:PATH,diff:DIFF||'int',limit:20});
  if(!rows||!rows.length){box.textContent='No scores yet. Finish a mission to be the first!';return}
  const me=TLP.esc(S.name||'');
  box.innerHTML='<ol style="list-style:none;margin:0;padding:0">'+rows.map((r,i)=>{const rk=rows.findIndex(x=>x.total_score===r.total_score&&x.total_stars===r.total_stars)+1;const mine=r.display_name===S.name&&r.total_score===score();
   return '<li style="display:flex;gap:10px;align-items:center;padding:8px 6px;border-bottom:1px solid var(--line);'+(mine?'font-weight:800;color:var(--a)':'')+'"><b style="width:2.2em">#'+rk+'</b><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis">'+TLP.esc(r.display_name)+(mine?' (you)':'')+'</span><span>'+r.total_score+' pts</span><small style="opacity:.7">★'+r.total_stars+'</small></li>'}).join('')+'</ol>'}
 catch(e){box.textContent='Could not load the leaderboard. Please try again later.'}}
function lbSubmit(l){try{if(!window.TLP_AUTH||!TLP_AUTH.recordLeaderboardScore||!DIFF)return;const stars=Object.values(S.prog).reduce((a,b)=>a+b,0);
 return TLP_AUTH.recordLeaderboardScore({learnerId:l.id,displayName:l.name||S.name,learningPath:PATH,gameDiff:DIFF,score:score(),stars,chaptersCleared:CH.filter((c,i)=>c.L&&done(i)).length})}catch(e){}}

function syncCurrentToCloud() {


  if (window.__adminPreview) return;
  if (window.TLP_AUTH && typeof window.TLP_AUTH.saveProgressBundle === 'function') {
    const l = window.TLP_AUTH.getActiveLearner();
    if (l && l.id && !l.isGuest) {
      window.TLP_AUTH.saveProgressBundle(l.id, PATH, DIFF, {
        prog: S.prog,
        ach: ach(),
        badges: badges(),
        draft: null,
        bossState: null
      }).then(() => lbSubmit(l)).catch(() => {});
    }
  }
}







const PATH_CONTENT = {"4-0":{"g16":{"learn":"Robots follow orders one by one, like following a treasure map or a recipe! First walk, then speak.","mis":"Walk forward 2 squares, then make R-067 say hello!","hints":["First tell the robot to move, then tell it to speak.","Use the move block for 2 steps, and the say block for hello.","Stack move 2 on top, then say word underneath."]},"g710":{"learn":"A <b>program</b> is an ordered sequence of instructions. The computer executes them sequentially from top to bottom.","mis":"Direct R-067 to walk 2 cells, then output \"hello\".","hints":["Execution order is top-to-bottom.","Use a move block followed by a say block.","Place move 2 first, then say word."]},"g1112":{"learn":"In imperative programming, statements execute deterministically in sequential order. Each statement alters the program state.","mis":"Execute a 2-unit translation on R-067, followed by a console output of the word variable.","hints":["The execution flow is strictly linear.","Sequence: translate position by 2, then invoke standard output.","Stack move 2 followed by say word."]},"adult":{"learn":"Programs are deterministic execution pipelines. The instruction pointer advances sequentially, updating state at each discrete step.","mis":"Direct R-067 to advance 2 track units, then emit the string stored in word to system telemetry.","hints":["Instruction sequence dictates state transitions.","Invoke move 2 to alter position state, then say word for telemetry.","Ensure move precedes say in the call stack."]}},"4-1":{"g16":{"learn":"Order is super important! You cannot read an empty notebook, and R-067 cannot broadcast its designation before it is written in memory!","mis":"Store \"R-067\" into the word box first, broadcast it, then walk 3 steps.","hints":["Fill the word box with R-067 before telling the robot to say it!","Saying an empty box outputs nothing. Fill it first!","Order: set word to R-067, say word, set steps to 3, move steps."]},"g710":{"learn":"Changing the order changes the result. A variable must be assigned a value <i>before</i> you read or output it.","mis":"Broadcast unit ID R-067 as a status message, then walk 3 cells.","hints":["Referencing uninitialized variables results in empty output.","Fill word first with R-067, then broadcast it.","Set word to R-067, say word, set steps to 3, move steps."]},"g1112":{"learn":"Sequential dependency: an operation that consumes a variable depends on the assignment that initializes it.","mis":"Initialize word with \"R-067\", output the identifier, then initialize steps with 3 and perform the movement.","hints":["Avoid reading unassigned memory. Initialize word prior to invocation.","Assignment -> Output -> Assignment -> Movement.","Sequence: set word to R-067, say word, set steps to 3, move steps."]},"adult":{"learn":"Temporal coupling: accessing state before initialization violates safety invariants and produces undefined or null output.","mis":"Store \"R-067\" in word, transmit the telemetry packet, then allocate 3 to steps and advance the unit.","hints":["Ensure write-before-read invariant for word.","Pipeline: write word -> transmit word -> write steps -> translate steps.","Set word to R-067, say word, set steps to 3, move steps."]}},"4-2":{"g16":{"learn":"Big journeys are made of small steps in a row! Use the three boxes a, b, and c to walk all the way to cell 6.","mis":"Walk using box a, then box b, then box c to reach the glowing chip at cell 6!","hints":["Each box has part of the distance: 1 + 2 + 3 = 6.","Use three move blocks, one for each box.","Move a, then move b, then move c."]},"g710":{"learn":"Programs chain multiple statements together to achieve a combined result. Each instruction executes from the current position.","mis":"Move by variable a, then b, then c in order to reach cell 6.","hints":["The robot accumulates displacement across all three instructions.","1 + 2 + 3 = 6 cells.","Sequence: move a, move b, move c."]},"g1112":{"learn":"Cumulative state mutation: sequential invocations of a state-altering method accumulate side effects on the environment.","mis":"Sequence three movement instructions referencing parameters a, b, and c to reach index 6.","hints":["Position accumulates: pos = pos + a + b + c.","Execute move sequentially for each discrete variable.","Order: move a -> move b -> move c."]},"adult":{"learn":"Stateful composition: consecutive function calls mutate the robot's spatial coordinate vector incrementally.","mis":"Dispatch three consecutive move operations consuming variables a (1), b (2), and c (3) to terminate at coordinate 6.","hints":["State accumulates additively across discrete dispatch cycles.","Verify total delta equals target coordinate offset (1 + 2 + 3 = 6).","Stack: move a, move b, move c."]}},"0-0":{"g16":{"learn":"A <b>variable</b> is like a labelled lunchbox or toy chest. You stick a label on it, put something inside, and use it whenever you need!","mis":"Put the number 3 into the steps box, then move R-067 to the chip.","hints":["The steps box starts at 0. Fill it up first!","Use set steps to 3, then move steps.","Set steps to 3, then move by steps."]},"g710":{"learn":"A <b>variable</b> is a named storage location in memory. <code>set steps to 3</code> assigns 3 to <b>steps</b>, which can then be passed into commands like <code>move</code>.","mis":"The chip is 3 cells away. Store 3 in steps and move R-067 to it.","hints":["The variable steps holds 0 initially.","Assign a value with set, then read it with move.","Set steps to 3, then move by steps."]},"g1112":{"learn":"Variables bind an identifier to a typed memory location. Assignment writes a value to memory; expression evaluation reads it.","mis":"Assign scalar 3 to identifier steps, then invoke move using steps as parameter.","hints":["Initialize the variable before referencing its evaluation.","Pattern: steps = 3; move(steps);","Set steps to 3, then move by steps."]},"adult":{"learn":"Memory allocation and variable assignment. An identifier acts as a symbolic reference to a mutable value stored in the runtime environment.","mis":"Mutate the runtime state by assigning 3 to steps, then supply steps as operand to move.","hints":["Environment defaults steps to 0. Write the target value first.","Evaluate steps dynamically within the displacement routine.","Set steps to 3, then move by steps."]}},"0-1":{"g16":{"learn":"<code>change steps by 3</code> adds more to what is already inside the box! It is like dropping 3 more marbles into your jar.","mis":"Steps already holds 4. Add enough to reach the chip at cell 7, then move!","hints":["You have 4 and need 7. How many more do you need?","4 + 3 = 7. Change steps by 3.","Change steps by 3, then move by steps."]},"g710":{"learn":"Incremental assignment: <code>change steps by 3</code> adds 3 to the existing value without replacing it. Useful when you know the required difference.","mis":"The chip is 7 cells away, and steps already holds 4. Increment steps and move.","hints":["Check the Memory box for steps. It already contains 4.","Calculate the delta needed: 7 - 4 = 3.","Change steps by 3, then move by steps."]},"g1112":{"learn":"Compound assignment (the <code>+=</code> operation). Modifies an existing memory cell by an arithmetic delta rather than reinitializing it.","mis":"Apply an in-place addition of 3 to steps, then execute movement using steps.","hints":["Pattern: steps += 3; move(steps);","Target is 7; initial is 4; delta is +3.","Change steps by 3, then move by steps."]},"adult":{"learn":"In-place state mutation vs re-binding. The change instruction performs an arithmetic accumulator update on the active stack variable.","mis":"Perform an accumulator mutation on steps to offset from 4 to 7, then dispatch move.","hints":["Apply relative delta (+3) rather than absolute overwrite.","State transition: steps (4) -> steps + 3 = 7.","Change steps by 3, then move by steps."]}},"0-2":{"g16":{"learn":"Boxes do not just hold numbers—they can hold words too! When R-067 sends a system broadcast, it reads the word stored in its name box.","mis":"Store the robot designation, R-067, in the name box and transmit it as a system output.","hints":["Words inside boxes are called strings.","Store R-067 in the name box first, then broadcast it.","Set name to R-067, then say name."]},"g710":{"learn":"Variables can store text strings as well as numbers. <code>say name</code> outputs a system message with whatever text is currently stored in <b>name</b>.","mis":"Store the robot designation, R-067, in the name box and transmit it as a system output.","hints":["The box called name is empty initially.","Store R-067 in the box, then output the box.","Set name to R-067, then say name."]},"g1112":{"learn":"String data types: variables are dynamically typed to store string literals. The standard output block dereferences the string variable.","mis":"Store the string literal \"R-067\" in variable name and transmit via say.","hints":["Assign the alphanumeric literal to the identifier.","Pattern: name = \"R-067\"; print(name);","Set name to R-067, then say name."]},"adult":{"learn":"String primitive storage and IO stream emission. Variables hold references to character sequences rendered by the telemetry subsystem.","mis":"Bind the string literal \"R-067\" to name and emit it to system standard output.","hints":["Assign string representation of unit ID to symbol name.","Emit telemetry via standard output block.","Set name to R-067, then say name."]}},"0-3":{"g16":{"learn":"You can use one box for two different jobs! Put 5 in steps, walk 5 squares, then have R-067 announce how far it walked.","mis":"The chip is 5 cells away. Move there, then say how many steps you moved.","hints":["Fill steps with 5 once.","Use steps to move, then use steps to say.","Set steps to 5, move by steps, say steps."]},"g710":{"learn":"Reusability: once a variable is assigned, it can be passed into multiple operations without needing to be re-declared.","mis":"The chip is 5 cells away. Move there, then say how many steps you moved.","hints":["One variable can serve as an argument for both move and say.","Assign once, consume twice.","Set steps to 5, move by steps, say steps."]},"g1112":{"learn":"Variable reuse and single source of truth. Referencing a single variable across multiple statements prevents duplication and synchronization bugs.","mis":"Set steps to 5, pass it to move, and log it to standard output.","hints":["Maintain DRY principle using steps.","Sequence: steps = 5 -> move(steps) -> print(steps).","Set steps to 5, move by steps, say steps."]},"adult":{"learn":"Parametric reuse and immutable state consumption across multiple downstream consumers.","mis":"Initialize steps to 5 and supply it as the operand to both translation and telemetry routines.","hints":["Write steps once, read sequentially by translation and logging engines.","Eliminate magic numbers by referencing the variable identifier.","Set steps to 5, move by steps, say steps."]}},"0-4":{"g16":{"learn":"You can have lots of boxes, each with its own special sticker! Use the first box for part of the walk, and the second box for the rest.","mis":"The chip is 7 cells away. Walk 4 cells using the first box, then 3 using the second box.","hints":["Two boxes for two parts: 4 + 3 = 7.","Fill first with 4, and second with 3.","Set first to 4, set second to 3, move by first, move by second."]},"g710":{"learn":"Multiple variables: programs manage distinct variables for different roles, keeping data organized and independent.","mis":"The chip is 7 cells away. Walk 4 cells using the first box, then 3 using the second box.","hints":["Two walks, so two boxes. 7 is 4 plus 3.","Fill both boxes, then walk with each.","Set first to 4, set second to 3, move by first, move by second."]},"g1112":{"learn":"Managing multi-variable state spaces. Each distinct identifier holds an independent memory cell that must be initialized before evaluation.","mis":"Allocate 4 to first and 3 to second, sequencing translations to achieve composite displacement 7.","hints":["Two independent variables: first = 4, second = 3.","Execute composite movement: move(first); move(second);","Set first to 4, set second to 3, move by first, move by second."]},"adult":{"learn":"Multi-register state allocation and sequential aggregation of independent parameters.","mis":"Allocate and assign values 4 and 3 to distinct symbols first and second, dispatching incremental movements to target offset 7.","hints":["Maintain clean separation of concerns between coordinate deltas.","Total vector magnitude = first + second = 7.","Set first to 4, set second to 3, move by first, move by second."]}},"0-5":{"g16":{"learn":"A box only remembers what is inside right now. When you change it, the old number is replaced! Order matters!","mis":"The chip is at cell 5 and steps holds 3. Walk 3, change the box so it holds 2, walk again. Finish by saying what the box holds.","hints":["Walk first while steps is 3!","Take away 1 by changing steps by -1.","Move by steps, change steps by -1, move by steps, say steps."]},"g710":{"learn":"State over time: variable values change during program execution. The order in which you read and modify a variable dictates your program's behavior.","mis":"The chip is at cell 5 and steps holds 3. Walk 3, change the box so it holds 2, walk again. Finish by saying what the box holds.","hints":["Walk first with the 3, then change the box.","Changing by a negative number takes away.","Move by steps, change steps by -1, move by steps, say steps."]},"g1112":{"learn":"Temporal state mutation and trace tables. Tracking variable evaluation at each step of the execution lifecycle.","mis":"Traverse by current steps (3), decrement by 1, execute second traversal, and output final state.","hints":["Trace steps: 3 -> move(3) -> steps += -1 (now 2) -> move(2) -> print(2).","Negative change acts as arithmetic subtraction.","Move by steps, change steps by -1, move by steps, say steps."]},"adult":{"learn":"Mutable state transitions and step-wise trace analysis. Understanding how sequential imperative operations modify state over time.","mis":"Execute translation against initial state (3), apply decrement mutation (-1), translate remaining delta, and log final state.","hints":["Account for temporal state progression in execution trace.","Mutate state in-place between translation dispatches.","Move by steps, change steps by -1, move by steps, say steps."]}},"1-0":{"g16":{"learn":"A <b>loop</b> repeats your instructions over and over, like singing a song chorus! Put your walk block inside the repeat block.","mis":"The chip is 4 cells away. Walk one cell at a time using a loop.","hints":["Four identical steps is a job for a loop!","Put a move 1 block inside the repeat block.","Repeat 4 times: move 1."]},"g710":{"learn":"A <b>loop</b> repeats the blocks inside it. <code>repeat 4</code> with <code>move 1</code> inside executes 4 times, keeping your script short and tidy.","mis":"The chip is 4 cells away. Walk one cell at a time using a loop.","hints":["Four identical steps is a job for a loop.","Put a move block inside the repeat block.","Repeat 4 times: move 1."]},"g1112":{"learn":"Definite iteration: fixed-count loops execute a code block an exact number of times. Loop constructs prevent code duplication.","mis":"Implement a bounded loop of 4 iterations to translate 1 unit per iteration.","hints":["Use iteration to satisfy DRY principle.","Loop invariant: step displacement = 1; iterations = 4.","Repeat 4 times: move 1."]},"adult":{"learn":"Loop unrolling vs iteration abstraction. Fixed-counter loops encapsulate repeated block execution, maintaining constant cyclomatic complexity.","mis":"Constrain code size to par by encapsulating unit translation within a 4-cycle loop construct.","hints":["Avoid statement repetition; encapsulate in loop body.","Total displacement = loop count × step size = 4 × 1.","Repeat 4 times: move 1."]}},"1-1":{"g16":{"learn":"Loops and boxes make a great team! Store the step size in a box once, then loop that step to walk far.","mis":"The chip is 8 cells away. Use a variable for the step size and a loop to repeat it.","hints":["8 is 4 steps of 2, or 2 steps of 4. Pick one!","Put the step size in steps, then loop move steps.","Set steps to 2, repeat 4 times: move by steps."]},"g710":{"learn":"Loops and variables work well together. Store the size of a step once in a variable, then repeat movement using that variable.","mis":"The chip is 8 cells away. Use a variable for the step size and a loop to repeat it.","hints":["8 is 4 steps of 2, or 2 steps of 4. Pick one.","Put the step size in the box, then loop a move that uses the box.","Set steps to 2, repeat 4 times: move by steps."]},"g1112":{"learn":"Parameterized iteration. Combining state parameters with loop constructs allows modular scaling of execution effects.","mis":"Parameterize step stride via steps variable and iterate to achieve total translation 8.","hints":["Decompose 8 into factor pairs: 4 × 2 or 2 × 4.","Initialize parameter steps, then iterate movement.","Set steps to 2, repeat 4 times: move by steps."]},"adult":{"learn":"Parametric loop execution. Decoupling stride magnitude from iteration control allows dynamic calibration of algorithm throughput.","mis":"Store stride coefficient in steps and dispatch bounded loop to traverse 8 grid units.","hints":["Factorization: Stride × Iterations = 8.","Define steps as stride operand within the loop body.","Set steps to 2, repeat 4 times: move by steps."]}},"1-2":{"g16":{"learn":"A loop can count for you! Every time the robot takes a lap, add 1 to your count box.","mis":"Reach the chip at cell 6. Each lap, add 1 to count. Finish by saying count.","hints":["6 cells in 3 laps of 2!","Put move 2 and change count by 1 inside the loop.","Repeat 3: move 2, change count by 1. Then say count."]},"g710":{"learn":"A loop can update a variable every time round. That is how programs count items, track scores, or accumulate values.","mis":"Reach the chip at cell 6. Each lap, add 1 to count. Finish by saying count.","hints":["6 cells in 3 laps of 2.","Put the change block inside the loop with the move.","Repeat 3: move 2, change count by 1. Then say count."]},"g1112":{"learn":"Loop counters: incrementing an accumulator variable within the loop body to track iteration progress or event frequency.","mis":"Reach target coordinate 6 in 3 iterations, incrementing counter count per cycle, then log count.","hints":["Place accumulator update inside the loop scope.","Post-loop evaluation of count must equal 3.","Repeat 3: move 2, change count by 1. Then say count."]},"adult":{"learn":"Iteration telemetry and accumulator state patterns. Incremental counter updates across loop cycles provide runtime audit trails.","mis":"Traverse 6 track units across 3 discrete loop cycles, instrumenting counter count at each iteration, then emit telemetry.","hints":["Increment count within loop body: count = count + 1.","Output count outside loop termination boundary.","Repeat 3: move 2, change count by 1. Then say count."]}},"1-3":{"g16":{"learn":"Loops can count backwards like a rocket launch: 3, 2, 1, BLASTOFF! Use negative numbers to count down.","mis":"fuel starts at 4. Each lap, move 1 and use 1 fuel. When fuel reaches 0, say fuel.","hints":["4 laps of 1 cell uses all 4 fuel.","Change fuel by -1 each lap.","Repeat 4: move 1, change fuel by -1. Then say fuel."]},"g710":{"learn":"Counting down: change a variable by a negative number inside a loop. This models decreasing resources like fuel, health, or time.","mis":"fuel starts at 4. Each lap, move 1 and use 1 fuel. When fuel reaches 0, say fuel.","hints":["4 laps of 1 cell will consume all 4 fuel.","Inside the loop: move 1, change fuel by -1.","Repeat 4: move 1, change fuel by -1. Then say fuel."]},"g1112":{"learn":"Decrementing accumulators. Decreasing a state variable across iterations models resource depletion and countdown timers.","mis":"Iterate 4 cycles: translate 1 unit, decrement fuel by 1, and output terminal state of fuel.","hints":["Use change by -1 to simulate decrement (fuel--).","State transitions: 4 -> 3 -> 2 -> 1 -> 0.","Repeat 4: move 1, change fuel by -1. Then say fuel."]},"adult":{"learn":"Resource depletion modeling via negative accumulator deltas. Tracking state decay to a terminal zero condition across iterations.","mis":"Model fuel consumption across 4 translation cycles by applying delta -1 per iteration, emitting final state.","hints":["In-loop mutation: fuel += -1.","Ensure say block is placed post-termination, outside loop block.","Repeat 4: move 1, change fuel by -1. Then say fuel."]}},"1-4":{"g16":{"learn":"Loops can make things grow faster and faster! Add to your step size inside the loop to speed up.","mis":"steps starts at 1. Each lap, move by steps, then add 1 to steps. Reach cell 6.","hints":["First lap moves 1, second moves 2, third moves 3: 1 + 2 + 3 = 6!","Three laps will do it.","Repeat 3: move by steps, change steps by 1."]},"g710":{"learn":"Accelerating loops: modifying the step size variable inside the loop changes how far each lap moves.","mis":"steps starts at 1. Each lap, move by steps, then add 1 to steps. Reach cell 6.","hints":["1 + 2 + 3 = 6. You need 3 laps.","Change steps after moving so lap 1 starts at 1.","Repeat 3: move by steps, change steps by 1."]},"g1112":{"learn":"Non-linear step series: mutating the loop step variable inside the body produces arithmetic progression in cumulative displacement.","mis":"Execute 3 iterations where displacement steps increases by 1 each cycle, reaching coordinate 6.","hints":["Sequence sum: S = 1 + 2 + 3 = 6.","Order within loop: move(steps) before steps += 1.","Repeat 3: move by steps, change steps by 1."]},"adult":{"learn":"Dynamic step modulation and arithmetic sequence generation within iteration kernels.","mis":"Simulate uniform acceleration over 3 cycles by incrementing stride operand steps by 1 each iteration to reach position 6.","hints":["Displacement vector increases monotonically: delta = [1, 2, 3].","Execute move using current state prior to incrementing.","Repeat 3: move by steps, change steps by 1."]}},"1-5":{"g16":{"learn":"You can skip numbers when you count: 2, 4, 6, 8! Change your number box by 2 every turn.","mis":"pos starts at 0. Walk 2 cells three times, and keep pos matching your cell number. Finish by saying pos.","hints":["Three hops of 2 brings you to cell 6.","Change pos by 2 on each hop.","Repeat 3: move 2, change pos by 2. Then say pos."]},"g710":{"learn":"Stepping by values other than 1. Changing by 2 tracks even numbers or coordinate hops.","mis":"pos starts at 0. Walk 2 cells three times, and keep pos matching your cell number. Finish by saying pos.","hints":["Three laps of 2 cells reaches 6.","Update pos by 2 inside the loop.","Repeat 3: move 2, change pos by 2. Then say pos."]},"g1112":{"learn":"Step-stride accumulators: incrementing an accumulator by step size k > 1 to track coordinate offsets or sample intervals.","mis":"Traverse 6 units in 3 cycles of 2, updating pos accumulator by 2 each cycle, emitting final pos.","hints":["State invariant: pos equals current grid coordinate after each iteration.","pos increments: 0 -> 2 -> 4 -> 6.","Repeat 3: move 2, change pos by 2. Then say pos."]},"adult":{"learn":"Stride synchronization: maintaining parity between physical simulation coordinates and logical position registers.","mis":"Instrument 3 iterations of 2-unit movements with equivalent register mutations (pos += 2), emitting final telemetry.","hints":["Synchronize coordinate state: pos = pos + 2 per iteration.","Emit pos to telemetry post loop exit.","Repeat 3: move 2, change pos by 2. Then say pos."]}},"1-6":{"g16":{"learn":"Saying something inside a loop repeats the speech on EVERY lap! Saying it outside only speaks once at the end.","mis":"Reach cell 6 with a loop, but say the word ONLY ONCE after the walk is finished.","hints":["Move goes INSIDE the repeat loop.","Say goes OUTSIDE underneath the loop.","Repeat 3: move 2. Say word."]},"g710":{"learn":"Scope of repetition: blocks inside the loop run every lap; blocks outside after the loop run only once after it finishes.","mis":"Reach cell 6 with a loop, but say the word ONLY ONCE after the walk is finished.","hints":["Put the move block inside the repeat block.","Place the say block below the loop, not inside it.","Repeat 3: move 2. Say word."]},"g1112":{"learn":"Loop boundary and post-loop execution. Distinguishing between statements within iteration scope and sequential statements following termination.","mis":"Execute 3 movement iterations to reach index 6, then execute single output of word post-termination.","hints":["Statements inside the curly braces repeat; statements outside execute once.","Structure: loop { move(2) }; print(word);","Repeat 3: move 2. Say word."]},"adult":{"learn":"Control flow boundaries: separating the iterative kernel from post-loop consolidation and telemetry.","mis":"Confine spatial translation to loop scope, ensuring telemetry emission executes strictly once post-loop.","hints":["Prevent redundant IO operations inside iterative kernel.","Displacement in loop; emission outside loop.","Repeat 3: move 2. Say word."]}},"1-7":{"g16":{"learn":"An <b>accumulator</b> is a savings jar where you keep adding coins. Total grows with every lap!","mis":"total starts at 0. Loop 3 times: walk 2 cells and add 2 to total. Then walk 1 more cell outside the loop and say total.","hints":["Inside loop: move 2, change total by 2.","Outside loop: move 1, say total.","Repeat 3: move 2, change total by 2. Outside: move 1, say total."]},"g710":{"learn":"The <b>accumulator</b> pattern: maintaining a running sum across multiple loop iterations, then utilizing the total afterwards.","mis":"total starts at 0. Loop 3 times: walk 2 cells and add 2 to total. Then walk 1 more cell outside the loop and say total.","hints":["Accumulate 2 in total during each of the 3 laps (giving 6).","Outside the loop, take the final 1 step and report total.","Repeat 3: move 2, change total 2. Move 1, say total."]},"g1112":{"learn":"The accumulator design pattern: initializing a sum register to 0, updating it within loop scope, and consuming it in post-loop logic.","mis":"Iterate 3 times: move 2 and accumulate 2 to total; follow with single 1-unit translation and output total.","hints":["Accumulator invariant: total = sum(delta_i) for i in 1..3 = 6.","Total grid displacement = 3 × 2 + 1 = 7.","Repeat 3: move 2, change total 2. Move 1, say total."]},"adult":{"learn":"The canonical accumulator pattern. Aggregating partial sums over bounded iterations with subsequent post-processing.","mis":"Implement loop accumulator totaling 6 over 3 iterations, execute terminal unit offset, and emit total register.","hints":["total tracks iterative displacement sum (6).","Execute move 1 outside loop without updating total.","Repeat 3: move 2, change total 2. Move 1, say total."]}},"2-0":{"g16":{"learn":"An <b>if block</b> is like a fork in the road! If the door is open, walk through. If not, take the other path.","mis":"If power is more than 3, go to cell 6. Otherwise go to cell 2. Pass both tests!","hints":["The robot checks power automatically in each test.","Put move 6 under then, and move 2 under else.","If power is more than 3: move 6, else: move 2."]},"g710":{"learn":"An <b>if / else block</b> evaluates a boolean condition. If true, the top branch runs; if false, the else branch runs.","mis":"If power is more than 3, go to cell 6. Otherwise go to cell 2. Pass both tests!","hints":["Check the condition: power > 3.","Put move 6 in the then branch, move 2 in the else branch.","If power is more than 3: move 6, else: move 2."]},"g1112":{"learn":"Binary conditional branching (if/else). Evaluates a boolean relational predicate to select one of two mutually exclusive execution branches.","mis":"Branch based on relational predicate (power > 3): dispatch move 6 if true, move 2 if false.","hints":["Both test cases must pass without modifying script.","Pattern: if (power > 3) move(6); else move(2);","If power is more than 3: move 6, else: move 2."]},"adult":{"learn":"Deterministic conditional branching. Relational operators evaluate environment state to direct the instruction pointer to alternate basic blocks.","mis":"Evaluate condition power > 3 to route execution between coordinate targets 6 (then) and 2 (else).","hints":["Condition determines branch selection per test vector.","Branch A: displacement = 6; Branch B: displacement = 2.","If power is more than 3: move 6, else: move 2."]}},"2-1":{"g16":{"learn":"Branches can set words too! If it is hot, put \"hot\" in your box. If it is cold, put \"cold\" in your box.","mis":"If temp is more than 20 say hot. Otherwise say cold. Pass both tests!","hints":["Set word to hot in the first branch, and cold in the else branch.","Put say word AFTER the if block so it always speaks.","If temp > 20: set word hot, else: set word cold. Say word."]},"g710":{"learn":"Branches can assign variables. Set a different word in each branch, then output word after the decision is complete.","mis":"If temp is more than 20 the robot says hot. Otherwise it says cold.","hints":["Assign word differently depending on the condition.","Say word after the if/else block finishes.","If temp > 20: set word hot, else: set word cold. Say word."]},"g1112":{"learn":"Variable assignment within conditional branches followed by unified standard output.","mis":"Conditionally assign string literal (\"hot\" vs \"cold\") to word based on temp > 20, then output word.","hints":["De-duplicate output: execute say word once following branch convergence.","Structure: if (temp > 20) word = \"hot\" else word = \"cold\"; print(word);","If temp > 20: set word hot, else: set word cold. Say word."]},"adult":{"learn":"Branch-dependent register assignment with convergent telemetry emission.","mis":"Evaluate temp > 20 to bind appropriate status string to word, emitting via say at branch join point.","hints":["Convergent flow: assign symbol in branches, emit once downstream.","Test case 1: temp 30 -> \"hot\"; Test case 2: temp 5 -> \"cold\".","If temp > 20: set word hot, else: set word cold. Say word."]}},"2-2":{"g16":{"learn":"Branches do not have to do the same kind of job! One branch can shout a warning, while the other walks.","mis":"If fuel is under 4, stay put and say low. Otherwise walk as far as fuel allows.","hints":["Under 4: set word to low and say it.","Otherwise: move by fuel.","If fuel is less than 4: set word to low, say word. Else: move by fuel."]},"g710":{"learn":"Heterogeneous branches: each branch can execute completely different instruction types (e.g. movement vs telemetry).","mis":"If fuel is under 4 the robot stays put and says low. Otherwise it walks as far as fuel allows.","hints":["The low-fuel branch needs a word assignment and say block.","The else branch moves by variable fuel.","If fuel is less than 4: set word to low, say word. Else: move by fuel."]},"g1112":{"learn":"Divergent branch behavior and dynamic variable evaluation. Handling fallback error states vs standard execution pathways.","mis":"Implement guard condition (fuel < 4): emit warning telemetry and halt; otherwise translate position by fuel.","hints":["Guard pattern: handle low resource exception first.","Else branch invokes move(fuel).","If fuel is less than 4: set word to low, say word. Else: move by fuel."]},"adult":{"learn":"Guard clauses and heterogeneous branch execution. Directing flow to warning telemetry or state translation based on resource threshold.","mis":"Evaluate fuel < 4: trigger warning notification if true; execute variable translation move(fuel) if false.","hints":["Condition: fuel < 4.","Branch A: write \"low\" -> transmit; Branch B: translate(fuel).","If fuel is less than 4: set word to low, say word. Else: move by fuel."]}},"2-3":{"g16":{"learn":"What if you have three choices? Nest an if inside the else! It is like choosing between Door 1, Door 2, or Door 3.","mis":"Code 1 goes to cell 2. Code 2 goes to cell 5. Any other code goes to cell 8.","hints":["Two questions split three choices!","First ask: is code 1? In else, ask: is code 2?","If code = 1: move 2, else: if code = 2: move 5, else: move 8."]},"g710":{"learn":"Multi-way selection: nesting an if inside an else branch allows choosing between three or more distinct outcomes.","mis":"Code 1 opens the near door (cell 2). Code 2 opens the middle door (cell 5). Any other code opens the far door (cell 8).","hints":["Two questions are required to resolve three branches.","Place the second if inside the else of the first.","If code is exactly 1: move 2, else: if code is exactly 2: move 5, else: move 8."]},"g1112":{"learn":"Multi-branch conditionals (if / else if / else chain). Partitioning state space across discrete equivalence classes.","mis":"Construct nested conditional chain matching code values {1 -> 2, 2 -> 5, default -> 8}.","hints":["Equivalent to switch/match or if-elif-else construct.","Nest second if block in first else block.","If code is exactly 1: move 2, else: if code is exactly 2: move 5, else: move 8."]},"adult":{"learn":"Multi-case decision trees and cascading conditional dispatch. Partitioning input signals across distinct targets.","mis":"Implement conditional cascade evaluating code: route 1 to cell 2, 2 to cell 5, and remaining inputs to cell 8.","hints":["Verify all 3 test vectors pass through matching branch paths.","Cascade depth = 2 decisions.","If code is exactly 1: move 2, else: if code is exactly 2: move 5, else: move 8."]}},"2-4":{"g16":{"learn":"Loops and ifs together are super powerful! On every single lap, the robot asks a question before moving.","mis":"Low power (under 5): walk 1 cell, 3 times. Full power: walk 2 cells, 3 times.","hints":["Put the if block INSIDE the repeat loop.","Inside loop: if power > 4: move 2, else: move 1.","Repeat 3: if power is more than 4: move 2, else: move 1."]},"g710":{"learn":"Combining loops and conditions: placing an if block inside a loop causes the decision to be re-evaluated on every iteration.","mis":"Low power (under 5): walk 1 cell, three times. Full power: walk 2 cells, three times.","hints":["The decision lives inside the repeat loop.","Check power > 4 to distinguish low from full power.","Repeat 3: if power is more than 4: move 2, else: move 1."]},"g1112":{"learn":"Conditional evaluation within iteration kernels. Dynamically adapting loop step behavior based on runtime environment variables.","mis":"Nest conditional inside 3-iteration loop: if power > 4 move 2, else move 1.","hints":["Loop wraps conditional statement.","Case 1 (power 1): 3 × 1 = 3; Case 2 (power 9): 3 × 2 = 6.","Repeat 3: if power is more than 4: move 2, else: move 1."]},"adult":{"learn":"Iterative conditional execution. Evaluating invariant or variant predicates per loop cycle to determine stride parameters.","mis":"Encapsulate conditional stride selection within a 3-cycle loop kernel to satisfy both power levels.","hints":["Predicate: power > 4 selects between stride 2 and stride 1.","Both test cases evaluate correctly within single loop block.","Repeat 3: if power is more than 4: move 2, else: move 1."]}},"2-5":{"g16":{"learn":"<b>AND</b> means BOTH locks must open! The robot only moves if power is high AND shield is strong.","mis":"Go to cell 6 only if power > 4 AND shield > 1. Otherwise go to cell 2. Pass all 3 tests!","hints":["Both things must be true at once!","Use the + button on the if block and choose AND.","If power > 4 AND shield > 1: move 6, else: move 2."]},"g710":{"learn":"Logical <b>AND</b>: compound conditions where both expressions must evaluate to true for the branch to run.","mis":"Go to cell 6 only if power is more than 4 AND shield is more than 1. Otherwise go to cell 2. Pass all three tests.","hints":["Select AND in the + condition menu on the if block.","Both sub-conditions must be satisfied.","If power > 4 AND shield > 1: move 6, else move 2."]},"g1112":{"learn":"Logical conjunction (AND operator, <code>&&</code>). Evaluates compound boolean predicates; true only if both operands are true.","mis":"Apply logical conjunction (power > 4 AND shield > 1): translate 6 on true, 2 on false across all test vectors.","hints":["Truth table: T AND T -> T; T AND F -> F; F AND T -> F.","Configure compound if block with AND joiner.","If power > 4 AND shield > 1: move 6, else move 2."]},"adult":{"learn":"Boolean algebraic conjunction (AND). Short-circuit logic requiring both state variables to exceed respective threshold limits.","mis":"Formulate compound predicate (power > 4 && shield > 1) directing flow to cell 6 (conjunction met) or cell 2 (fallback).","hints":["Verify predicate against all 3 test configurations.","Operands: power > 4; shield > 1; joiner: and.","If power > 4 AND shield > 1: move 6, else move 2."]}},"2-6":{"g16":{"learn":"<b>OR</b> means either key works! If the first is true, OR the second is true, the robot gets to go!","mis":"Go to cell 5 if power is 9 OR shield is more than 5. Otherwise go to cell 1. Pass all 3 tests!","hints":["Just one true condition is enough for OR!","Use the + button on the if block and choose OR.","If power = 9 OR shield > 5: move 5, else: move 1."]},"g710":{"learn":"Logical <b>OR</b>: compound conditions where the branch runs if <i>at least one</i> expression is true.","mis":"Go to cell 5 if power is exactly 9 OR shield is more than 5. Otherwise go to cell 1. Pass all three tests.","hints":["Select OR in the + condition menu.","If either condition matches, the then branch executes.","If power = 9 OR shield > 5: move 5, else move 1."]},"g1112":{"learn":"Logical disjunction (OR operator, <code>||</code>). Evaluates compound boolean expressions; true if at least one operand evaluates to true.","mis":"Construct compound conditional using logical OR (power == 9 OR shield > 5) routing to target 5 vs 1.","hints":["Truth table: F OR F -> F; all other permutations -> T.","Configure compound if block with OR joiner.","If power = 9 OR shield > 5: move 5, else move 1."]},"adult":{"learn":"Boolean algebraic disjunction (OR). Evaluates alternative preconditions, allowing either criterion to authorize primary branch traversal.","mis":"Implement disjunction (power == 9 || shield > 5) directing unit to coordinate 5 on match, 1 on complete failure.","hints":["At least one operand must satisfy threshold.","Sub-predicates: power = 9, shield > 5; joiner: or.","If power = 9 OR shield > 5: move 5, else move 1."]}},"2-7":{"g16":{"learn":"You can test if a number is inside a safe zone: bigger than the bottom limit AND smaller than the top limit!","mis":"Go to cell 3 only if power is more than 2 AND less than 8. Otherwise stay at cell 0. Pass all 3 tests!","hints":["Both limits test the same power box!","Power must be > 2 AND power < 8.","If power > 2 AND power < 8: move 3."]},"g710":{"learn":"Range checking: compare the same variable twice using AND to verify it falls within an acceptable numeric range.","mis":"Go to cell 3 only if power is more than 2 AND less than 8. Otherwise stay at the start. Pass all three tests.","hints":["Check both lower bound (> 2) and upper bound (< 8).","Use the same variable power in both parts of the condition.","If power > 2 AND power < 8: move 3."]},"g1112":{"learn":"Range validation predicates: implementing numeric interval boundary checks <code>(min < x && x < max)</code>.","mis":"Verify power satisfies open interval (2, 8) using compound conjunction; advance 3 units on pass.","hints":["Compound predicate: power > 2 AND power < 8.","Leave else branch empty to satisfy \"stay at start\" requirement.","If power > 2 AND power < 8: move 3."]},"adult":{"learn":"Interval boundary verification and range clamping logic using compound relational conjunctions.","mis":"Assert state invariant: 2 < power < 8 via compound predicate (power > 2 && power < 8) to trigger 3-unit translation.","hints":["Ensure both lower and upper bounds reference symbol power.","No else branch required; false evaluates to zero displacement.","If power > 2 AND power < 8: move 3."]}},"8-0":{"g16":{"learn":"A <b>string</b> is just letters or words! The <b>join</b> block glues two words together like putting train cars together.","mis":"Combine the stored pieces into a system broadcast: UNIT R-067 (with the space).","hints":["Glue three pieces in two steps: a, sp, and b.","First join a and sp into out.","Join a and sp into out, join out and b into out, say out."]},"g710":{"learn":"A <b>string</b> is text. <b>Joining</b> strings concatenates them end to end. Joining \"UNIT\", a space, and \"R-067\" gives \"UNIT R-067\".","mis":"Combine the stored pieces into a system broadcast: UNIT R-067 (with the space).","hints":["You need three pieces: a, the space sp, and b.","Join in two steps, storing into out.","Join a and sp into out, join out and b into out, say out."]},"g1112":{"learn":"String concatenation operations. Joining discrete character sequences into an aggregated string buffer.","mis":"Concatenate identifiers a, sp, and b into buffer out and emit to standard output.","hints":["Binary concatenation requires two sequential operations.","out = a + sp; out = out + b; print(out);","Join a and sp into out, join out and b into out, say out."]},"adult":{"learn":"String concatenation and buffer accumulation. Composing formatted telemetry payloads from discrete memory tokens.","mis":"Compose formatted system identifier \"UNIT R-067\" by sequentially concatenating tokens a, sp, and b into out.","hints":["Buffer mutation: out = concat(a, sp) -> concat(out, b).","Verify delimiter whitespace is included.","Join a and sp into out, join out and b into out, say out."]}},"8-1":{"g16":{"learn":"Loops can build words too! Join a word to your box inside a loop to make it longer and longer.","mis":"Make the robot broadcast hahaha.","hints":["hahaha is ha repeated 3 times!","Inside loop: join out and s into out.","Repeat 3: join out and s into out. Then say out."]},"g710":{"learn":"Loops and string concatenation: repeatedly joining text inside a loop constructs repetitive or growing text patterns.","mis":"Make the robot say hahaha.","hints":["hahaha is the token ha repeated three times.","Join out and s into out on each lap.","Repeat 3: join out and s into out. Then say out."]},"g1112":{"learn":"Iterative string accumulation. Appending substring tokens to an accumulator buffer across bounded iterations.","mis":"Accumulate token s (\"ha\") across 3 iterations into string buffer out, outputting \"hahaha\".","hints":["Buffer pattern: out = out + s inside loop body.","Place say out after loop termination.","Repeat 3: join out and s into out. Then say out."]},"adult":{"learn":"Iterative string concatenation and memory buffer growth within bounded loops.","mis":"Execute 3 string append operations of token s into accumulator buffer out, emitting the final payload.","hints":["Accumulator starts empty (\"\"). Each iteration appends s.","Verify termination condition yields exact string \"hahaha\".","Repeat 3: join out and s into out. Then say out."]}},"8-2":{"g16":{"learn":"You can build complicated patterns by gluing pieces one by one! Store each piece into out before adding the next.","mis":"Build and broadcast the pattern <-> from pieces a, c, and b.","hints":["Order of pieces: a (<), c (-), c (-), and b (>).","Join step by step into out.","Join a and c into out, join out and c into out, join out and b into out, say out."]},"g710":{"learn":"Multi-step string composition: chaining multiple joins together to build structured text formats.","mis":"Say <-> built from the pieces a, c and b.","hints":["Four pieces in order: a, c, c, b.","Join step by step into out.","Join a and c into out, join out and c into out, join out and b into out, say out."]},"g1112":{"learn":"Sequential string assembly. Constructing structured token sequences through step-wise concatenation.","mis":"Sequence concatenation operations using components a, c, c, b to generate \"<->\", then emit.","hints":["Accumulate in out across 3 sequential join instructions.","Pattern: a + c -> + c -> + b.","Join a and c into out, join out and c into out, join out and b into out, say out."]},"adult":{"learn":"Structured string payload construction through linear concatenation pipeline.","mis":"Assemble structured token sequence \"<->\" by piping components a, c, and b through accumulator out.","hints":["Component c is referenced twice in sequence.","Emit composite payload to telemetry.","Join a and c into out, join out and c into out, join out and b into out, say out."]}},"8-3":{"g16":{"t":"Echo builder (bonus)","df":"Bonus","learn":"Bonus challenge! R-067 wants to broadcast a double signal beacon. Use a loop to join \"beep\" two times, then broadcast the signal.","mis":"Build the beacon message \"beepbeep\" using a repeat loop, then say it.","hints":["Start with an empty out box.","Repeat 2 times: join out and s into out.","After the loop finishes, say out."],"vars":{"s":"beep","out":""},"allow":["join","rep","say"],"cases":[{"vars":{},"say":"beepbeep"}],"par":3,"path":"stairs"},"g710":{"learn":"Bonus mission. Combine casting, loops and joining: a word that is a number, a word that is text, and a loop to build both results.","mis":"n holds the word 2 and s holds go. Walk 2 cells twice, and say gogo. Convert first!","hints":["n is text, so convert it.","Each lap does two things.","Cast n. Repeat 2: join out and s into out, move n. Say out."]},"g1112":{"learn":"Composite bonus challenge: explicit type coercion, string accumulation, and spatial translation executed within a single loop kernel.","mis":"Cast string n to numeric type, iterate twice to translate by n and concatenate s into out, then emit out.","hints":["Coerce n from string to integer before passing to move.","Inside loop: out += s; move(n);","Cast n. Repeat 2: join out and s into out, move n. Say out."]},"adult":{"learn":"Advanced bonus challenge: type casting primitives, accumulator concatenation, and state translation within concurrent iteration loops.","mis":"Perform explicit type coercion on symbol n, execute 2-cycle loop multiplexing translation and string concatenation, emitting out.","hints":["Enforce type safety: convert n to numeric primitive prior to evaluation.","Loop body couples spatial translation and buffer append.","Cast n. Repeat 2: join out and s into out, move n. Say out."]}},"15-0":{"g16":{"learn":"A <b>function</b> is like giving a recipe a name! You write down the recipe once, and whenever you say its name, R-067 cooks it up!","mis":"Define the recipe hop to move 2 cells. Call hop three times to reach cell 6!","hints":["Define hop first, then call it later!","Put move 2 inside define hop.","Define hop: move 2. Repeat 3: call hop."]},"g710":{"learn":"A <b>function</b> is a named group of blocks. Define it once, then <b>call</b> it whenever you need that action performed.","mis":"Define hop as moving 2 cells. Call hop three times to reach cell 6.","hints":["Define first, call afterwards.","Hop does one thing: move 2.","Define hop with move 2 inside. Then repeat 3: call hop."]},"g1112":{"learn":"Function abstraction and procedural modularity. Defining reusable subroutines to encapsulate logic and prevent code duplication.","mis":"Encapsulate 2-unit translation in procedure hop; invoke 3 times to achieve displacement 6.","hints":["Declaration: define hop { move(2) }","Invocation: repeat 3 { call hop }","Define hop with move 2 inside. Then repeat 3: call hop."]},"adult":{"learn":"Subroutine declaration and call stack invocation. Encapsulating discrete operations into named procedures for reusability.","mis":"Declare procedure hop encapsulating move 2, dispatching 3 invocations to traverse 6 units.","hints":["Subroutine declaration does not execute until invoked.","Combine loop construct with procedure call.","Define hop: move 2. Repeat 3: call hop."]}},"15-1":{"g16":{"learn":"A recipe can use whatever ingredients are on the table! When you change the steps box, your hop recipe takes bigger or smaller steps.","mis":"Define hop to move by steps. Call it with steps at 3, then with steps at 4 to reach cell 7.","hints":["Define hop: move by steps.","Set steps to 3, call hop, change steps to 4, call hop.","Define hop (move steps). Set steps 3, call hop, change steps by 1, call hop."]},"g710":{"learn":"Parametric behavior: a function can read global variables, allowing the same procedure to produce different outputs when state changes.","mis":"Define hop to move by steps. Call it with steps 3, then with steps 4 to reach cell 7.","hints":["Hop moves by whatever steps holds.","Change steps between the two calls.","Define hop (move steps). Set steps 3, call hop, change steps by 1, call hop."]},"g1112":{"learn":"Procedures accessing ambient variable state. Mutating state between successive procedure invocations.","mis":"Define procedure hop reading steps; invoke with steps = 3, then mutate steps to 4 and invoke again.","hints":["Procedure body: move(steps).","Sequence: steps = 3 -> hop() -> steps = 4 -> hop().","Define hop (move steps). Set steps 3, call hop, change steps by 1, call hop."]},"adult":{"learn":"State-dependent procedure execution. Procedures referencing shared mutable environment state dynamically reflect runtime state changes.","mis":"Declare procedure hop dependent on variable steps; mutate steps between invocations to yield 3 + 4 = 7 displacement.","hints":["Avoid hardcoded literals in procedure body; reference steps.","State transition between calls: steps (3) -> steps (4).","Define hop (move steps). Set steps 3, call hop, change steps by 1, call hop."]}},"15-2":{"g16":{"learn":"Programs can have lots of different recipes! One recipe for short hops, and one recipe for long jumps.","mis":"Define short (move 2) and long (move 3). Call long once and short twice to reach cell 7.","hints":["Define both recipes first!","3 + 2 + 2 = 7.","Define short and long, then call long, short, short."]},"g710":{"learn":"Multiple procedures: declaring multiple distinct functions, each tailored for a specific task, and composing them to solve problems.","mis":"Define short (move 2) and long (move 3). Call long once and short twice to reach cell 7.","hints":["Define both functions at the start of your script.","3 + 2 + 2 = 7.","Define short and long, then call long, short, short."]},"g1112":{"learn":"Composition of multiple procedures. Decomposing complex tasks into multiple specialized functional primitives.","mis":"Declare procedures short (stride 2) and long (stride 3); sequence invocations to achieve target displacement 7.","hints":["Composite call sequence: long() + short() + short() = 3 + 2 + 2 = 7.","Define both procedures prior to invocation.","Define short and long, then call long, short, short."]},"adult":{"learn":"Modular procedural composition and functional decomposition into discrete primitives.","mis":"Declare distinct procedures short (move 2) and long (move 3), composing calls to synthesize exact displacement 7.","hints":["Ensure procedure names are bound correctly in symbol table.","Invocation sequence: long, short, short.","Define short and long, then call long, short, short."]}},"25-0":{"g16":{"learn":"A <b>bug</b> is a mistake hiding in your code! <b>Debugging</b> is like being a detective finding what is missing.","mis":"The robot should reach cell 6, but it stops at cell 3. Find the missing step and fix it!","hints":["Press Run and watch what happens.","It only takes one walk of 3 steps.","Add a second move steps block!"]},"g710":{"learn":"A <b>bug</b> is an error in code, and <b>debugging</b> is finding and correcting it. Here, a necessary instruction is missing.","mis":"The script should reach cell 6, but it stops at cell 3. Fix it.","hints":["Run the program and observe where R-067 halts.","It only moves once by steps (3).","Add a second move steps."]},"g1112":{"learn":"Software debugging and defect identification: diagnosing incomplete algorithms where a required state mutation is omitted.","mis":"Trace execution failure (halts at index 3 instead of target 6) and supply missing operational instruction.","hints":["Static analysis: current script performs 1 translation of 3 units.","Delta required: 6 - 3 = 3 units.","Add a second move steps."]},"adult":{"learn":"Algorithmic defect triage: identifying missing operations in linear execution pipelines through runtime trace analysis.","mis":"Diagnose coordinate deficit (pos = 3 vs target = 6) and patch execution pipeline with requisite translation.","hints":["Observe discrepancy between actual and expected terminal state.","Add additional move steps to fulfill postcondition.","Add a second move steps."]}},"25-1":{"g16":{"learn":"Bugs are often just a wrong number! Read the instructions carefully and change the numbers so R-067 stops right on the chip.","mis":"The robot walks too far and overshoots cell 5! Fix the numbers in the script.","hints":["3 laps of 2 steps walks 6 squares—that is 1 too many!","Change the repeat to 5 and the step to 1.","Repeat 5 times and move 1."]},"g710":{"learn":"Off-by-one and boundary bugs: errors often stem from incorrect loop counts or step parameters. Adjust the values to match the goal.","mis":"The script should reach cell 5, but it walks too far. Fix it.","hints":["3 laps of 2 equals 6 (overshoot).","Adjust loop count and step size to total exactly 5.","Repeat 5 times and move 1."]},"g1112":{"learn":"Parameter tuning and loop boundary errors. Correcting arithmetic divergence between loop specification and target invariants.","mis":"Resolve overshoot defect (displacement 6 vs target 5) by recalibrating loop parameters.","hints":["Current: 3 × 2 = 6. Target: 5.","Recalibrate: 5 iterations of 1 unit.","Repeat 5 times and move 1."]},"adult":{"learn":"Boundary condition calibration and arithmetic defect resolution. Refactoring loop coefficients to eliminate overshoot.","mis":"Mitigate coordinate overshoot defect by re-parameterizing loop counter and step operand to terminate at coordinate 5.","hints":["Identify parameter defect in repeat construct.","Factorization target = 5. Set repeat 5, move 1.","Repeat 5 times and move 1."]}},"25-2":{"g16":{"learn":"Order matters! If you try to speak an empty box before putting words inside, nothing comes out! Put things in the right order.","mis":"The robot should output its designation R-067, but the readout is empty. Fix the order!","hints":["Look at what is inside word when say happens.","Put the set block ABOVE the say block.","Set word to R-067 first, then say word."]},"g710":{"learn":"Sequence errors: reading or outputting a variable before it is initialized yields empty or unexpected results. Re-order the blocks.","mis":"The robot should output its designation R-067, but the readout is empty. Fix the order.","hints":["What is stored in word at the moment say executes?","Drag the set block above the say block.","Set word to R-067 first, then say word."]},"g1112":{"learn":"Temporal ordering defects: resolving uninitialized read errors by reordering statements into proper definition-use chains.","mis":"Rectify sequence defect causing null output by ensuring assignment precedes dereference.","hints":["Definition-use anomaly: use occurs before definition.","Invert block order: assignment first, emission second.","Set word to R-067 first, then say word."]},"adult":{"learn":"Temporal anti-pattern: uninitialized memory access. Refactoring pipeline order to re-establish the write-before-read invariant.","mis":"Reorder execution sequence to eliminate null read defect, ensuring unit designation R-067 is bound prior to emission.","hints":["Identify premature read of uninitialized register word.","Reorder: set word to R-067 -> say word.","Set word to R-067 first, then say word."]}}};
const CH=[
{n:'Chapter 1',t:'Variables',d:'Labelled boxes that remember things.',L:[
 {t:'A labelled box',df:'Easy',learn:'A <b>variable</b> is a labelled box that remembers a value. <code>set steps to 3</code> puts 3 in the box called <b>steps</b>. Then <code>move steps</code> uses whatever is inside it.',mis:'The chip is 3 cells away. Get the robot to it.',vars:{steps:0},allow:['set','move'],goal:3,par:2,hints:['The robot only goes as far as the number you give it.','The steps box is empty (0). Fill it before moving.','Set steps to 3, then move by steps.']},
 {t:'Change the box',df:'Easy',learn:'<code>change steps by 3</code> adds 3 to what is already in the box instead of replacing it. Handy when you know how much <i>more</i> you need.',mis:'The chip is 7 cells away, and steps already holds 4.',vars:{steps:4},allow:['change','move'],goal:7,par:2,hints:['Check the Memory boxes. What is in steps right now?','You need 7 and have 4. How much is missing?','Change steps by 3, then move by steps.']},

 {t:'Boxes hold words too',df:'Medium',learn:'A variable can hold text as well as numbers. <code>say name</code> outputs a system message with whatever text is stored in the box called <b>name</b>.',mis:'Store the robot designation, R-067, in the name box and transmit it as a system output.',vars:{name:''},allow:['set','say'],goal:null,say:'R-067',par:2,hints:['The box called name is empty. The robot cannot output what is not in memory.','Store R-067 in the box, then output the box.','Set name to R-067, then say name.']},
 {t:'Put it together',df:'Medium',learn:'Real programs mix these ideas: store a value, use it, then report it. One box can do several jobs.',mis:'The chip is 5 cells away. Move there, then say how many steps you moved.',vars:{steps:0},allow:['set','change','move','say'],goal:5,say:'5',par:3,hints:['You need to move 5 and then say that same number.','Use one box for both jobs: move by it, then say it.','Set steps to 5, move by steps, say steps.']},
 {t:'Two boxes',df:'Medium',learn:'You can have many variables, each with its own label. Use the right box for the right job.',mis:'The chip is 7 cells away. Walk 4 cells using the first box, then 3 using the second box.',vars:{first:0,second:0},allow:['set','move'],goal:7,par:4,hints:['Two walks, so two boxes. 7 is 4 plus 3.','Fill both boxes, then walk with each.','Set first to 4, set second to 3, move by first, move by second.']},
 {t:'The box changes over time',df:'Hard',learn:'A box only holds its <i>current</i> value. When you change it, the old value is gone, so order matters.',mis:'The chip is at cell 5 and steps holds 3. Walk 3, change the box so it holds 2, walk again. Finish by saying what the box holds.',vars:{steps:3},allow:['change','move','say'],goal:5,say:'2',par:4,hints:['Walk first with the 3, then change the box.','Changing by a negative number takes away.','Move by steps, change steps by -1, move by steps, say steps.']}]},
{n:'Chapter 2',t:'Loops',d:'Say it once, repeat it as many times as you like.',L:[
 {t:'Repeat after me',df:'Easy',learn:'A <b>loop</b> repeats the blocks inside it. <code>repeat 4</code> with <code>move 1</code> inside walks four times, and you only write the step once. Drop blocks inside the loop.',mis:'The chip is 4 cells away. Walk one cell at a time using a loop.',vars:{},allow:['rep','move'],goal:4,par:2,needs:1,hints:['Four identical steps is a job for a loop.','Put a move block inside the repeat block.','Repeat 4 times: move 1.']},
 {t:'Loops and boxes',df:'Medium',learn:'Loops and variables work well together. Store the size of a step once, then repeat it.',mis:'The chip is 8 cells away. Use a variable for the step size and a loop to repeat it.',vars:{steps:0},allow:['set','rep','move'],goal:8,par:3,needs:1,hints:['8 is 4 steps of 2, or 2 steps of 4. Pick one.','Put the step size in the box, then loop a move that uses the box.','Set steps to 2, repeat 4 times: move by steps.']},
 {t:'Count the laps',df:'Medium',learn:'A loop can update a variable every time round. That is how programs count things.',mis:'Reach the chip at cell 6. Each lap, add 1 to count. Finish by saying count.',vars:{count:0},allow:['rep','change','move','say'],goal:6,say:'3',par:4,needs:1,hints:['6 cells is three moves of 2.','Inside the loop: one move and one change.','Repeat 3: change count by 1, move 2. Then say count.']},
 {t:'Loop, then a little more',df:'Medium',learn:'Blocks outside a loop run once, before or after it. Mix both.',mis:'The chip is 7 cells away. Do three double steps with a loop, then one extra step on its own.',vars:{},allow:['rep','move'],goal:7,par:3,needs:1,hints:['3 double steps make 6. You need 7.','The leftover step goes outside the loop.','Repeat 3: move 2. Then move 1.']},
 {t:'A loop inside a loop',df:'Hard',learn:'A loop can sit inside another loop. The inner one runs completely every time the outer one goes round.',mis:'The chip is 8 cells away. Use two loops, one inside the other, with only move blocks.',vars:{},allow:['rep','move'],goal:8,par:3,needs:1,hints:['2 times 2 times 2 is 8.','Drop a repeat inside a repeat, and a move inside that.','Repeat 2: repeat 2: move 2.']},
 {t:'The growing step',df:'Hard',learn:'Change a variable inside a loop and every lap behaves differently. Same blocks, different result.',mis:'Reach the chip at cell 6. steps starts at 1. Each lap: walk steps, then make steps one bigger. Finish by saying steps.',vars:{steps:1},allow:['rep','move','change','say'],goal:6,say:'4',par:4,needs:1,hints:['1 + 2 + 3 = 6, so three laps.','Walk first, then grow the box, all inside the loop.','Repeat 3: move steps, change steps by 1. Then say steps.']}]},
{n:'Chapter 3',t:'Logic',d:'Decisions with if and else. Your script is tested more than once.',L:[
 {t:'If and else',df:'Medium',learn:'An <b>if</b> block asks a yes or no question. If yes, the blocks inside run. If no, the <b>else</b> blocks run. Your script is tested several times, so it must work for every case.',mis:'Low battery (under 5): walk 2 cells. Charged battery (5 or more): walk 5 cells. One script must pass both tests.',vars:{battery:0},allow:['if','move'],par:3,cases:[{vars:{battery:2},goal:2},{vars:{battery:8},goal:5}],hints:['Imagine running it with battery 2, then with battery 8.','Ask a question about battery and give each answer its own move.','If battery is more than 4: move 5, else move 2.']},
 {t:'Say what you see',df:'Medium',learn:'Branches can do anything, not just move. Set a different word in each branch, then say it after the if.',mis:'If temp is more than 20 the robot says hot. Otherwise it says cold.',vars:{temp:0,word:''},allow:['if','set','say'],par:4,cases:[{vars:{temp:30},say:'hot'},{vars:{temp:5},say:'cold'}],hints:['The say block only speaks the box called word.','Fill word differently in each branch.','If temp is more than 20: set word to hot, else set word to cold. Then say word.']},
 {t:'Not enough power',df:'Hard',learn:'Each branch can hold several blocks, and conditions can use less than as well as more than.',mis:'If fuel is under 4 the robot stays put and says low. Otherwise it walks as far as fuel allows.',vars:{fuel:0,word:''},allow:['if','set','say','move'],par:4,cases:[{vars:{fuel:2},goal:0,say:'low'},{vars:{fuel:7},goal:7}],hints:['Two very different behaviours: one speaks, one walks.','The low branch needs a word and a say. The other just moves.','If fuel is less than 4: set word to low, say word. Else: move by fuel.']},
 {t:'Two doors',df:'Hard',learn:'Put an if inside the else of another if to choose between three outcomes.',mis:'Code 1 opens the near door (cell 2). Code 2 opens the middle door (cell 5). Any other code opens the far door (cell 8).',vars:{code:0},allow:['if','move'],par:5,cases:[{vars:{code:1},goal:2},{vars:{code:2},goal:5},{vars:{code:3},goal:8}],hints:['Two questions are needed to split three outcomes.','The second question lives inside the else of the first.','If code is exactly 1: move 2, else: if code is exactly 2: move 5, else: move 8.']},
 {t:'Loops and decisions',df:'Hard',learn:'Loops and ifs combine. A decision inside a loop is made again every lap.',mis:'Low power (under 5): walk 1 cell, three times. Full power: walk 2 cells, three times.',vars:{power:0},allow:['rep','if','move'],par:4,needs:1,cases:[{vars:{power:1},goal:3},{vars:{power:9},goal:6}],hints:['The only difference between the cases is the size of each step.','Put the decision inside the loop so it is asked every lap.','Repeat 3: if power is more than 4: move 2, else: move 1.']}]}];
CH.push({n:'Chapter 4',t:'Boss: The Glitch',d:'A boss that remembers every attack. Use variables, loops and logic together, and never repeat yourself.',L:[{t:'The Glitch',df:'Boss',learn:'',mis:'',vars:{steps:0,power:0,count:0},allow:['set','change','move','say','rep','if'],boss:1,par:99,hints:[]}]});





const $=s=>document.querySelector(s),sleep=ms=>new Promise(r=>setTimeout(r,ms));
const NAMES={set:'set',change:'change',move:'move',say:'say',rep:'repeat',if:'if / else',note:'note',ask:'ask player',calc:'calculate',join:'join words',cast:'turn into',pick:'item of list',while:'repeat while',base:'convert base',def:'define function',call:'call function',bit:'switch on bit'};
const NARRATION={
  '4-0':'A program is a list of instructions. The robot follows them from top to bottom. Move forward two squares, then say hello.',
  '4-1':'A box must contain a value before the robot can use it. Store R-067 in the word box, say it, then move three squares.',
  '4-2':'A program can use several boxes in order. Move by box a, then box b, then box c. One plus two plus three reaches square six.',
  '0-0':'A variable is a named box that stores a value. Put three in the steps box, then use steps to tell the robot how far to move.',
  '0-1':'The change block adds to the value already in a box. Steps holds four, so add three to make seven, then move by steps.',
  '0-2':'Variables can store words as well as numbers. Store R-067 in the name box, then say the value of name.',
  '0-3':'One variable can be used more than once. Put five in steps, move by steps, then say steps to report the distance.',
  '0-4':'Different variables can store different parts of a task. Put four in first and three in second. Move by first, then move by second.',
  '0-5':'The order of instructions matters because values can change while a program runs. Move three squares, subtract one from steps, move two more, then say steps.',
  '1-0':'A loop repeats the instructions inside it. Put move one inside repeat four to walk four squares.',
  '1-1':'A loop can use a value from a box each time it repeats. Store two in steps, then repeat four moves by steps to walk eight squares.',
  '1-2':'A variable can count how many times a loop has run. Repeat three times. Each lap, move two squares and add one to count. Then say count.',
  '1-3':'Subtracting inside a loop can count down. Fuel starts at four. Repeat four times: move one square and subtract one from fuel. Then say fuel.',
  '1-4':'Changing a value inside a loop changes what happens on the next lap. Steps starts at one. Repeat three times: move by steps, then add one to steps.',
  '1-5':'A loop can add two each time instead of one. Repeat three times: move two squares and add two to pos. Then say pos.',
  '1-6':'Instructions inside a loop repeat, but instructions after it run only once. Repeat three moves of two squares. Put say word outside the loop.',
  '1-7':'An accumulator is a variable that keeps a running total. Repeat three times: move two squares and add two to total. After the loop, move one more square and say total.',
  '2-0':'An if block chooses between two sets of instructions. If power is more than three, move six squares. Otherwise, move two squares.',
  '2-1':'Each branch can store a different value. If temp is more than twenty, store hot in word. Otherwise, store cold. Then say word after the if block.',
  '2-2':'The two branches can do different jobs. If fuel is less than four, store low in word and say it. Otherwise, move by fuel.',
  '2-3':'Nested if blocks can choose between three outcomes. Code one moves two squares, code two moves five, and any other code moves eight.',
  '2-4':'A decision inside a loop is checked again on every lap. Repeat three times. If power is more than four, move two squares. Otherwise, move one.',
  '2-5':'The AND condition is true only when both comparisons are true. If power is more than four and shield is more than one, move six squares. Otherwise, move two.',
  '2-6':'The OR condition is true when at least one comparison is true. If power is nine or shield is more than five, move five squares. Otherwise, move one.',
  '2-7':'Two comparisons can check whether a number is inside a range. If power is more than two and less than eight, move three squares.',
  '8-0':'A string is text. The join block places two strings next to each other. Join UNIT, a space, and R-067 to make UNIT R-067, then say it.',
  '8-1':'A loop can build a string by joining text each time. Repeat three joins of out and ha. After the loop, say out to get hahaha.',
  '8-2':'Several join blocks can build a longer pattern. Join the pieces in this order: a, c, c, b. Then say out to produce the arrow.',
  '8-3':'For this bonus mission, use a loop to join beep twice. When the loop finishes, say out to produce beepbeep.',
  '15-0':'A function is a named group of instructions. Define hop to move two squares. Then call hop three times to reach square six.',
  '15-1':'A function can read a variable, so its behaviour changes when the variable changes. Define hop to move by steps. Set steps to three, call hop, change steps to four, then call hop again.',
  '15-2':'A program can define different functions for different jobs. Define short to move two squares and long to move three. Call long once, then short twice.',
  '25-0':'A bug is an error in a program. This program stops at square three instead of six. Add a second move steps block to cover the missing three squares.',
  '25-1':'The loop currently moves six squares, but the target is five. Change it to five repeats of one square so the robot stops at the chip.',
  '25-2':'The robot says nothing because it reads the word box before a value is stored. Move the set block above the say block.'
};
const NARRATION_AR={
  '4-0':'البرنامج قائمة تعليمات. يتبعها الروبوت من الأعلى إلى الأسفل. تحرك مربعين إلى الأمام، ثم قل مرحباً.',
  '4-1':'يجب أن يحتوي الصندوق على قيمة قبل أن يستخدمها الروبوت. خزّن R-067 في صندوق الكلمات، قلها، ثم تحرك ثلاثة مربعات.',
  '4-2':'يمكن للبرنامج أن يستخدم عدة صناديق بالترتيب. تحرك بمقدار الصندوق a، ثم b، ثم c. واحد زائد اثنين زائد ثلاثة يصل إلى المربع السادس.',
  '0-0':'المتغير صندوق له اسم يخزّن قيمة. ضع 3 في صندوق steps، ثم استخدم steps لتخبر الروبوت كم سيتحرك.',
  '0-1':'تضيف كتلة change إلى القيمة الموجودة بالفعل في الصندوق. يحتوي steps على 4، لذا أضف 3 ليصبح 7، ثم تحرك بمقدار steps.',
  '0-2':'يمكن للمتغيرات أن تخزّن الكلمات والأرقام. خزّن R-067 في صندوق name، ثم قل قيمة name.',
  '0-3':'يمكن استخدام المتغير الواحد أكثر من مرة. ضع 5 في steps، تحرك بمقدار steps، ثم قل steps لتعلن المسافة.',
  '0-4':'يمكن لمتغيرات مختلفة أن تخزّن أجزاء مختلفة من المهمة. ضع 4 في first و3 في second. تحرك بمقدار first، ثم بمقدار second.',
  '0-5':'ترتيب التعليمات مهم لأن القيم قد تتغير أثناء تشغيل البرنامج. تحرك ثلاثة مربعات، واطرح 1 من steps، ثم تحرك مربعين، وقل steps.',
  '1-0':'تكرر الحلقة التعليمات الموجودة داخلها. ضع تحرك مربعاً واحداً داخل كرر 4 لتسير أربعة مربعات.',
  '1-1':'يمكن للحلقة أن تستخدم قيمة من صندوق في كل تكرار. خزّن 2 في steps، ثم كرر 4 تحركات بمقدار steps لتسير ثمانية مربعات.',
  '1-2':'يمكن للمتغير أن يعدّ مرات تشغيل الحلقة. كرر 3 مرات. في كل دورة، تحرك مربعين وأضف 1 إلى count. ثم قل count.',
  '1-3':'يمكن للطرح داخل الحلقة أن يعدّ تنازلياً. يبدأ fuel عند 4. كرر 4 مرات: تحرك مربعاً واحداً واطرح 1 من fuel. ثم قل fuel.',
  '1-4':'تغيير قيمة داخل الحلقة يغيّر ما يحدث في الدورة التالية. يبدأ steps عند 1. كرر 3 مرات: تحرك بمقدار steps، ثم أضف 1 إلى steps.',
  '1-5':'يمكن للحلقة أن تضيف 2 في كل مرة بدلاً من 1. كرر 3 مرات: تحرك مربعين وأضف 2 إلى pos. ثم قل pos.',
  '1-6':'تتكرر التعليمات داخل الحلقة، لكن التعليمات بعدها تعمل مرة واحدة. كرر 3 تحركات بمقدار مربعين. ضع قل word خارج الحلقة.',
  '1-7':'المجمع متغير يحتفظ بمجموع متراكم. كرر 3 مرات: تحرك مربعين وأضف 2 إلى total. بعد الحلقة، تحرك مربعاً آخر وقل total.',
  '2-0':'تختار كتلة if بين مجموعتين من التعليمات. إذا كانت power أكبر من 3، فتحرك ستة مربعات. وإلا، فتحرك مربعين.',
  '2-1':'يمكن لكل فرع أن يخزّن قيمة مختلفة. إذا كانت temp أكبر من 20، فخزّن hot في word. وإلا، فخزّن cold. ثم قل word بعد كتلة if.',
  '2-2':'يمكن للفرعين أن يقوميا بمهمتين مختلفتين. إذا كان fuel أقل من 4، فخزّن low في word وقلها. وإلا، فتحرك بمقدار fuel.',
  '2-3':'يمكن لكتل if المتداخلة أن تختار بين ثلاثة نتائج. يحرك code one مربعين، وcode two خمسة، وأي رمز آخر ثمانية.',
  '2-4':'يُفحص القرار داخل الحلقة من جديد في كل دورة. كرر 3 مرات. إذا كانت power أكبر من 4، فتحرك مربعين. وإلا، فتحرك مربعاً واحداً.',
  '2-5':'شرط AND صحيح فقط عندما تكون المقارنتان صحيحتين. إذا كانت power أكبر من 4 وshield أكبر من 1، فتحرك ستة مربعات. وإلا، فتحرك مربعين.',
  '2-6':'شرط OR صحيح عندما تكون مقارنة واحدة على الأقل صحيحة. إذا كانت power تساوي 9 أو shield أكبر من 5، فتحرك خمسة مربعات. وإلا، فتحرك مربعاً واحداً.',
  '2-7':'يمكن لمقارنتين فحص ما إذا كان الرقم داخل نطاق. إذا كانت power أكبر من 2 وأقل من 8، فتحرك ثلاثة مربعات.',
  '8-0':'النص سلسلة من المحارف. تضع كتلة join نصين جنباً إلى جنب. صِل UNIT ومسافة وR-067 لتحصل على UNIT R-067، ثم قل النتيجة.',
  '8-1':'يمكن للحلقة أن تبني نصاً بوصل أجزائه في كل تكرار. كرر وصل out مع ha ثلاث مرات. بعد الحلقة، قل out فتحصل على hahaha.',
  '8-2':'يمكن لعدة كتل join أن تبني نمطاً أطول. صِل الأجزاء بهذا الترتيب: a، ثم c، ثم c، ثم b. بعدها قل out لسماع النص الناتج.',
  '8-3':'في هذه المهمة الإضافية، استخدم حلقة لوصل beep مرتين. عندما تنتهي الحلقة، قل out فتحصل على beepbeep.',
  '15-0':'الدالة مجموعة تعليمات لها اسم. عرّف hop ليتحرك مربعين. ثم نادِ hop ثلاث مرات للوصول إلى المربع السادس.',
  '15-1':'يمكن للدالة أن تقرأ متغيراً، فيتغيّر سلوكها عندما يتغيّر المتغير. عرّف hop ليتحرك بمقدار steps. اضبط steps على 3، ونادِ hop، وغيّر steps إلى 4، ثم نادِ hop مرة أخرى.',
  '15-2':'يمكن للبرنامج أن يعرّف دوال مختلفة لمهام مختلفة. عرّف short ليتحرك مربعين وlong ليتحرك ثلاثة. نادِ long مرة، ثم short مرتين.',
  '25-0':'الخطأ البرمجي هو خطأ في البرنامج. يتوقف هذا البرنامج عند المربع 3 بدلاً من 6. أضف كتلة move steps ثانية لقطع الثلاثة مربعات الناقصة.',
  '25-1':'تتحرك الحلقة ستة مربعات الآن، لكن الهدف خمسة. غيّرها إلى خمس تكرارات بمقدار مربع واحد ليصل الروبوت إلى الشريحة.',
  '25-2':'لا يقول الروبوت شيئاً لأنه يقرأ صندوق الكلمات قبل تخزين قيمة فيه. انقل كتلة set فوق كتلة say.'
};
let S={ci:0,li:0,script:[],hint:0,run:false,id:0,prog:{},name:'Player',lastPts:0,lastRunPts:0,runT0:0,missionTimer:null,missionTimeLeft:0,fewestBlocksTarget:null,reverseEngineerData:null};
let modeRun=null;
try{S.prog=JSON.parse(localStorage.getItem('tlp-prog')||'{}');S.name=localStorage.getItem('tlp-name')||'Player'}catch(e){}
const save=()=>{try{localStorage.setItem('tlp-prog',JSON.stringify(S.prog));localStorage.setItem('tlp-name',S.name)}catch(e){}try{syncCurrentToCloud()}catch(e){}};
const key=(c,l)=>c+'-'+l;










function runsAll(){try{return JSON.parse(localStorage.getItem('tlp-runs')||'{}')}catch(e){return{}}}
function saveRuns(r){try{localStorage.setItem('tlp-runs',JSON.stringify(r))}catch(e){}}
function runRec(k){return runsAll()[k]||{}}
function bonusPoints(){try{return Number(localStorage.getItem('tlp-bonus-points')||0)||0}catch(e){return 0}}
function addBonus(n){try{localStorage.setItem('tlp-bonus-points',String(bonusPoints()+n))}catch(e){}}
function bumpTry(k){const r=runsAll(),x=r[k]||{tries:0};x.tries=(x.tries||0)+1;x.last=Date.now();r[k]=x;saveRuns(r);return x}
function score(){return Object.entries(S.prog).reduce((a,[k,v])=>{const r=runRec(k);const p=r&&typeof r.points==='number'?r.points:Number(v)*100;return a+(isFinite(p)?p:0)},0)+bonusPoints()}



function hardMode(){try{return !!(pref('hard',false)&&(PATH==='g1112'||PATH==='adult'))}catch(e){return false}}
function completeLevel(k,st,meta){
 meta=meta||{};
 const r=runsAll(),x=r[k]||{},tries=Math.max(1,x.tries||1),old=typeof x.points==='number'?x.points:0;
 const first=!x.done,mult=Math.max(.55,1-.09*(tries-1));
 let pts=Math.round(st*100*mult);
 if(first&&tries===1)pts+=40;
 if(meta.timeLeft)pts+=Math.round(meta.timeLeft)*3;
 if(meta.hardcore)pts=Math.round(pts*1.5);
 if(meta.noHit)pts+=60;
 x.points=Math.max(old,pts);x.done=true;
 x.bestTries=Math.min(x.bestTries||99,tries);
 x.first=x.first||!!(first&&tries===1);
 x.noHit=x.noHit||!!meta.noHit;
 x.hard=x.hard||!!meta.hardcore;
 if(meta.ms)x.bestTime=Math.min(x.bestTime||1e9,meta.ms);
 x.last=Date.now();r[k]=x;saveRuns(r);S.lastPts=x.points;S.lastRunPts=pts;return x.points;
}
const rawLv=()=>CH[S.ci].L[S.li];
const lv=()=>{const base=rawLv();if(!base||base.boss)return base;const k=key(S.ci,S.li),adapt=(PATH_CONTENT[k]&&PATH_CONTENT[k][PATH])||null;return adapt?Object.assign({},base,adapt):base};
const isBonus=l=>!!(l&&(l.bonus||(l.t&&l.t.toLowerCase().includes('bonus'))));
const done=c=>{const req=CH[c].L.filter(l=>!isBonus(l));return req.length?req.every(l=>S.prog[key(c,CH[c].L.indexOf(l))]):CH[c].L.every((_,l)=>S.prog[key(c,l)])};





const MOODS=[["Ocean",200],["Dusk",265],["Rose",340],["Amber",32],["Moss",145]];let still=matchMedia('(prefers-reduced-motion:reduce)').matches||(window.TLP?TLP.FX.get():false);window.addEventListener('tlp-fx-change',e=>{still=e.detail.on||matchMedia('(prefers-reduced-motion:reduce)').matches});
const UI_BGS=[['auto','Node field'],['orbs','Soft orbs'],['grid','Blueprint grid'],['griddrift','Grid drift'],['stars','Starfield'],['rain','Code rain'],['aurora','Aurora'],['sunset','Sunset'],['circuit','Circuit board'],['nebula','Nebula'],['bokeh','Bokeh drift'],['none','No background']];
const UI_SITEBGS=[['auto','Classic orbs + grid'],['stars','Starfield'],['aurora','Aurora sky'],['waves','Wave lines'],['nebula','Nebula drift'],['matrix','Digital rain'],['bokeh','Bokeh'],['orbit','Orbit nodes'],['comets','Comet shower'],['fireflies','Fireflies'],['prism','Prism'],['none','Clean flat']];
const UI_FONTS=[['','Default'],['mono','Monospace'],['serif','Classic serif'],['round','Rounded'],['hand','Handwriting'],['cond','Condensed'],['type','Typewriter'],['eleg','Elegant'],['tech','Tech'],['play','Playful'],['gothic','Gothic'],['script','Script']];
const UI_COLORS=[['','Theme default'],['warm','Warm cream'],['mint','Mint'],['ice','Ice blue'],['rose','Rose'],['amber','Amber'],['viol','Violet'],['mono','Terminal green'],['cyan','Cyan'],['gold','Gold'],['snow','Snow']];
const UI_EFFECTS=[['','None'],['glow','Soft glow'],['flow','Color flow'],['pulse','Breathing glow'],['rainbow','Rainbow'],['sparkle','Sparkle'],['scan','Shine sweep'],['wave','Color wave']];
const UI_SCALES=[['sm','Compact'],['md','Comfortable'],['lg','Large']];
const UI_PRESETS={Protocol:['auto','', '', ''],Harbor:['orbs','round','ice','glow'],Aurora:['aurora','tech','mint','pulse'],Blueprint:['griddrift','mono','ice','flow'],Minimal:['none','serif','','glow']};
const uiDraftKeys=['bgfx','font','fontcolor','textfx','surface','blocks','uiscale'];
const uiChoice=(key,options,def)=>{const v=pref(key,def);return options.some(x=>x[0]===v)?v:def};




const UI_PREMIUM={
 'bgfx:stars':{t:'Earn 15 stars',ok:s=>s.stars>=15},
 'bgfx:griddrift':{t:'3 days with the game',ok:s=>s.age>=3},
 'bgfx:rain':{t:'Earn 25 stars',ok:s=>s.stars>=25},
 'bgfx:aurora':{t:'7-day streak',ok:s=>s.streak>=7},
 'font:eleg':{t:'Earn 30 stars',ok:s=>s.stars>=30},
 'font:tech':{t:'7-day streak',ok:s=>s.streak>=7},
 'font:play':{t:'3 days with the game',ok:s=>s.age>=3},
 'fontcolor:viol':{t:'Clear 2 chapters',ok:s=>s.ch>=2},
 'fontcolor:mono':{t:'5-day streak',ok:s=>s.streak>=5},
 'textfx:flow':{t:'Earn 40 stars',ok:s=>s.stars>=40},
 'textfx:pulse':{t:'Clear 4 chapters',ok:s=>s.ch>=4},
 'surface:outlined':{t:'Defeat a guardian',ok:s=>s.badges>=1},
 'blocks:outline':{t:'Earn 20 stars',ok:s=>s.stars>=20},
 'blocks:sharp':{t:'5-day streak',ok:s=>s.streak>=5},
 'blocks:neon':{t:'Earn 10 stars',ok:s=>s.stars>=10},
 'bgfx:sunset':{t:'Earn 10 stars',ok:s=>s.stars>=10},
 'bgfx:circuit':{t:'5-day streak',ok:s=>s.streak>=5},
 'font:gothic':{t:'Earn 15 stars',ok:s=>s.stars>=15},
 'font:script':{t:'3-day account',ok:s=>s.age>=3},
 'fontcolor:cyan':{t:'Earn 10 stars',ok:s=>s.stars>=10},
 'fontcolor:gold':{t:'Earn 20 stars',ok:s=>s.stars>=20},
 'textfx:rainbow':{t:'Earn 30 stars',ok:s=>s.stars>=30},
 'textfx:sparkle':{t:'4-day account',ok:s=>s.age>=4},
 'textfx:scan':{t:'Earn 15 stars',ok:s=>s.stars>=15},
 'textfx:wave':{t:'5-day streak',ok:s=>s.streak>=5},
 'surface:neon':{t:'Earn 15 stars',ok:s=>s.stars>=15},
 'blocks:glow':{t:'Earn 10 stars',ok:s=>s.stars>=10},
 'sitebg:matrix':{t:'Earn 20 stars',ok:s=>s.stars>=20},
 'sitebg:nebula':{t:'5-day streak',ok:s=>s.streak>=5},
 'sitebg:orbit':{t:'Clear 3 chapters',ok:s=>s.ch>=3},
 'sitebg:comets':{t:'Earn 30 stars',ok:s=>s.stars>=30},
 'sitebg:fireflies':{t:'7-day streak',ok:s=>s.streak>=7},
 'sitebg:prism':{t:'Clear 10 chapters',ok:s=>s.ch>=10}
};
let uiModal=null,uiDraft={},uiViewPlayer=false,uiChoices=[['bgfx',UI_BGS],['sitebg',UI_SITEBGS],['font',UI_FONTS],['fontcolor',UI_COLORS],['textfx',UI_EFFECTS],['surface',[['glass'],['solid'],['outlined'],['neon']]],['blocks',[['soft'],['sharp'],['outline'],['neon'],['ghost'],['glow']]],['uiscale',[['sm'],['md'],['lg']]]];
function uiSnapshot(){return {bgfx:uiChoice('bgfx',UI_BGS,'auto'),sitebg:uiChoice('sitebg',UI_SITEBGS,'auto'),font:uiChoice('font',UI_FONTS,''),fontcolor:uiChoice('fontcolor',UI_COLORS,''),textfx:uiChoice('textfx',UI_EFFECTS,''),surface:uiChoice('surface',[['glass'],['solid'],['outlined'],['neon']],'glass'),blocks:uiChoice('blocks',[['soft'],['sharp'],['outline'],['neon'],['ghost'],['glow']],'soft'),uiscale:uiChoice('uiscale',[['sm'],['md'],['lg']],'md'),ambient:pref('ambientfx',true),goal:pref('goalfx',true),robot:pref('robotfx',true)}}
const UI_PREFIX={bgfx:'bg-',font:'fnt-',fontcolor:'ftc-',textfx:'txf-',surface:'surf-',blocks:'blks-',uiscale:'uiz-'};




function uiClasses(d,el){
 el=el||document.body;
 const styled=uiChoices.filter(([k])=>UI_PREFIX[k]);
 const all=styled.flatMap(([k,opts])=>opts.map(([v])=>[k,v]));
 el.classList.remove(...all.map(([k,v])=>UI_PREFIX[k]+v),'ui-ambient','ui-goal','ui-robot');
 all.forEach(([k,v])=>{if(d[k]===v)el.classList.add(UI_PREFIX[k]+v)});
 ['ambient','goal','robot'].forEach(k=>el.classList.toggle('ui-'+k,!!d[k]));
}
function uiIsAdmin(){try{return !!(window.TLP_AUTH&&TLP_AUTH.isCurrentUserAdmin&&TLP_AUTH.isCurrentUserAdmin())}catch(e){return false}}
function uiStats(){
 let st={ch:0,stars:0,streak:0,badges:0};
 try{if(window.TLP_AVATAR&&TLP_AVATAR.stats)st=Object.assign(st,TLP_AVATAR.stats())}catch(e){}
 let born=0;
 try{born=+localStorage.getItem('tlp-firstseen')||0;if(!born){born=Date.now();localStorage.setItem('tlp-firstseen',String(born))}}catch(e){}
 try{const l=window.TLP_AUTH&&TLP_AUTH.getActiveLearner?TLP_AUTH.getActiveLearner():null;const c=l&&(l.created_at||l.createdAt);if(c){const t=+new Date(c);if(t>born)born=t}}catch(e){}
 return {ch:st.ch||0,stars:st.stars||0,streak:st.streak||0,badges:st.badges||0,age:born?Math.floor((Date.now()-born)/86400000):0};
}
function uiPremiumOK(cat,v,stats){
 const p=UI_PREMIUM[cat+':'+v];if(!p)return true;
 if(uiIsAdmin()&&!uiViewPlayer)return true;
 if(uiViewPlayer)return false;
 return p.ok(stats||uiStats());
}
function syncUIChoices(){
 if(!uiModal)return;
 uiModal.querySelectorAll('.ui-bg-choice').forEach(b=>{
  const on=String(uiDraft[b.dataset.uiKey]??'')===b.dataset.uiValue;
  b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false');
 });
 const site=$('#uiSitePreview',uiModal);if(site)site.dataset.siteBg=String(uiDraft.sitebg||'auto');
 uiModal.querySelectorAll('.ui-preset').forEach(b=>{
  const p=UI_PRESETS[b.dataset.preset],on=p&&['bgfx','font','fontcolor','textfx'].every((k,i)=>uiDraft[k]===p[i]);
  b.classList.toggle('on',!!on);b.setAttribute('aria-pressed',on?'true':'false');
 });
}
function syncUIDraft(){uiChoices.forEach(([k])=>{const el=$('#ui-'+k,uiModal);if(el)el.value=String(uiDraft[k]??'')});['ambient','goal','robot'].forEach(k=>{const c=$('#ui-'+k+'Check',uiModal);if(c)c.checked=!!uiDraft[k]});syncUIChoices()}
function applyUIDraft(){uiClasses(uiDraft,uiModal);syncUIChoices()}
function openUI(){
 if(!uiModal){uiModal=document.createElement('div');uiModal.id='uiModal';uiModal.className='tlpm ui-modal';uiModal.hidden=true;uiModal.innerHTML='<div class="tlpm-pan ui-pan"><header class="ui-head"><div><span class="lab">YOUR SPACE</span><h2>Make it yours</h2><p>Try a look here first. Nothing changes until you save.</p></div><button class="tlpm-x" id="uiClose" type="button" aria-label="Close customization"><i class=ic-close></i></button></header><div class="ui-adminrow" id="uiAdminRow" hidden><label class="setrow"><span><b>Admin preview</b><small>See the menu locked like a brand-new player</small></span><input type="checkbox" id="uiViewPlayer" aria-label="View appearance menu as a player"></label></div><div class="ui-presets" aria-label="Appearance presets">'+Object.entries(UI_PRESETS).map(([n,v])=>'<button class="ui-preset" type="button" data-preset="'+n+'" aria-label="Preview '+n+' preset"><span class="ui-preset-art" aria-hidden="true"></span><b>'+n+'</b><small>Preview</small></button>').join('')+'</div><div class="ui-stage" aria-label="Live appearance preview"><div class="ui-preview-label">PREVIEW · SAMPLE LEVEL</div><div class="ui-preview-top"><i></i><span>PLAY</span><b>R-067</b><em>Mood</em></div><div class="ui-preview-track"><div class="ui-preview-cell"></div><div class="ui-preview-cell"></div><div class="ui-preview-cell"></div><div class="ui-preview-cell goal"></div><div class="ui-preview-bot">'+(window.TLP_AVATAR?TLP_AVATAR.svg(TLP_AVATAR.get(),60):'')+'</div></div><div class="ui-preview-floor"></div><div class="ui-preview-goals"><span>✦ Reach cell 4</span><span>♥ 3 tries</span></div><div class="ui-preview-mem"><i>pos</i><b>0</b><i>steps</i><b>2</b></div><div class="ui-preview-text">R-067 is ready.<br>Drag a block. Press Run.</div><div class="ui-preview-script"><span>Move 2</span><span>Say hello</span></div></div>'+uiBackgroundPicker()+uiRow('textfx','Heading effects',UI_EFFECTS,'Gentle glow or color motion; no flashing.')+'<div class="setlab">Typography & color</div>'+uiRow('font','Typeface',UI_FONTS,'Applied to the game and menus.')+uiRow('fontcolor','Text color',UI_COLORS,'Main text tint in light and dark themes.')+uiRow('uiscale','Text size',UI_SCALES,'Base text size across the game.')+'<div class="setlab">Panels & blocks</div>'+uiRow('surface','Panel style',[['glass','Glass'],['solid','Solid'],['outlined','Outlined'],['neon','Neon']],'Surface treatment across game panels.')+uiRow('blocks','Block style',[['soft','Rounded'],['sharp','Angular'],['outline','Outlined'],['neon','Neon glow'],['ghost','Ghost'],['glow','Idle glow']],'Shape of code blocks.')+'<div class="setlab">Motion</div>'+['ambient','goal','robot'].map(k=>'<label class="setrow"><span><b>'+({ambient:'Ambient motion',goal:'Goal pulse',robot:'Robot idle motion'})[k]+'</b><small>'+({ambient:'Move memory boxes, goal and scene details gently.',goal:'Highlight the destination throughout a run.',robot:'Your selected avatar animation while waiting.'})[k]+'</small></span><input type="checkbox" id="ui-'+k+'Check" aria-label="'+({ambient:'Ambient motion',goal:'Goal pulse',robot:'Robot idle motion'})[k]+'"></label>').join('')+'<small class="ui-note">Reduced effects and your device’s motion preference always take priority. For stronger backgrounds, use Ambient motion and keep Reduce visual effects off.</small><div class="tlpm-row ui-actions"><button class="tlpm-btn" id="uiReset" type="button">Reset preview</button><button class="tlpm-btn pri" id="uiApply" type="button">Apply appearance</button></div></div>';document.body.appendChild(uiModal);const uiRevert=()=>{uiModal.hidden=true};uiModal.addEventListener('click',e=>{if(e.target===uiModal)uiRevert()});uiModal.querySelector('#uiClose').onclick=uiRevert;uiModal.querySelector('#uiReset').onclick=()=>{uiDraft=uiSnapshot();syncUIDraft();applyUIDraft()};uiModal.querySelector('#uiApply').onclick=()=>{uiChoices.forEach(([k])=>{const el=$('#ui-'+k,uiModal);if(el&&typeof uiDraft[k]==='string'&&uiPremiumOK(k,el.value,uiStats()))setPref(k,el.value)});['ambient','goal','robot'].forEach(k=>{const c=$('#ui-'+k+'Check',uiModal);setPref(k==='ambient'?'ambientfx':k==='goal'?'goalfx':'robotfx',c.checked)});uiModal.hidden=true;applyPrefs();snd('chime')};uiChoices.forEach(([k])=>{const el=$('#ui-'+k,uiModal);if(el)el.onchange=()=>{uiDraft[k]=el.value;applyUIDraft()}});uiModal.querySelectorAll('.ui-bg-choice').forEach(b=>b.onclick=()=>{uiDraft[b.dataset.uiKey]=b.dataset.uiValue;syncUIDraft();applyUIDraft()});['ambient','goal','robot'].forEach(k=>{const c=$('#ui-'+k+'Check',uiModal);if(c)c.onchange=()=>{uiDraft[k]=c.checked;applyUIDraft()}});uiModal.querySelectorAll('.ui-preset').forEach(b=>b.onclick=()=>{const p=UI_PRESETS[b.dataset.preset];if(p){uiDraft.bgfx=p[0];uiDraft.font=p[1];uiDraft.fontcolor=p[2];uiDraft.textfx=p[3];syncUIDraft();applyUIDraft()}})}
 uiDraft=uiSnapshot();syncUIDraft();applyUIDraft();uiModal.hidden=false;uiModal.querySelector('.tlpm-pan').scrollTop=0;
 const _ar=$('#uiAdminRow');if(_ar&&uiIsAdmin()){_ar.hidden=false;if(!_ar.dataset.wired){_ar.dataset.wired='1';const _vp=$('#uiViewPlayer');_vp.checked=uiViewPlayer;_vp.onchange=()=>{uiViewPlayer=_vp.checked;uiModal.remove();uiModal=null;openUI()}}}
}
const uiRow=(key,label,options,note)=>{const st=uiStats();return '<label class="setrow ui-row"><span><b>'+label+'</b><small>'+note+'</small></span><select id="ui-'+key+'" aria-label="'+label+'">'+options.map(([v,n])=>{const p=UI_PREMIUM[key+':'+v];if(p&&!uiPremiumOK(key,v,st))return '<option value="'+v+'" disabled title="Locked — '+p.t+'">Locked · '+n+' · '+p.t+'</option>';return '<option value="'+v+'"'+(p?' data-prem="1"':'')+(String(uiDraft[key])===v?' selected':'')+'>'+n+'</option>'}).join('')+'</select></label>'};
const uiChoiceCards=(key,label,options,note)=>{
 const st=uiStats();
 const cards=options.map(([v,n])=>{
  const p=UI_PREMIUM[key+':'+v],locked=!!p&&!uiPremiumOK(key,v,st),on=String(uiDraft[key]??'')===v;
  const status=locked?'Locked · '+p.t:p?'Premium':'Included';
  return '<button class="ui-bg-choice'+(on?' on':'')+'" type="button" data-ui-key="'+key+'" data-ui-value="'+v+'" aria-pressed="'+(on?'true':'false')+'" aria-label="'+n+(locked?'. Locked: '+p.t:'')+'" title="'+(locked?'Locked — '+p.t:n)+'"'+(locked?' disabled':'')+'><span class="ui-bg-art" data-art="'+key+':'+v+'" aria-hidden="true"><i></i></span><b>'+n+'</b><small class="'+(locked?'is-locked':'')+'">'+status+'</small></button>';
 }).join('');
 return '<section class="ui-choice-section"><div class="ui-choice-head"><b>'+label+'</b><small>'+note+'</small></div><select id="ui-'+key+'" aria-label="'+label+'" hidden>'+options.map(([v,n])=>'<option value="'+v+'"'+(String(uiDraft[key])===v?' selected':'')+'>'+n+'</option>').join('')+'</select><div class="ui-bg-grid">'+cards+'</div></section>';
};
const uiBackgroundPicker=()=>'<div class="setlab">Background &amp; atmosphere</div><div class="ui-background-layout"><div class="ui-background-picker">'+uiChoiceCards('bgfx','Game background',UI_BGS,'Scenery inside missions.')+uiChoiceCards('sitebg','Site background',UI_SITEBGS,'Backdrop across menus and lessons.')+'</div><aside class="ui-site-card" aria-label="Site background preview"><div class="ui-site-art" id="uiSitePreview" data-site-bg="auto"><div class="ui-site-window"><div class="ui-site-window-top"><i></i><i></i><i></i></div><div class="ui-site-window-body"><b></b><span></span><span></span><em>PLAY</em></div></div><small>BACKDROP PREVIEW</small></div><div class="ui-site-caption"><b>One backdrop, every page</b><p>Preview the atmosphere here, then apply it to the whole site.</p></div></aside></div>';

let hue=200,auto=true,tw,tweening=false,saved=null;
try{saved=localStorage.getItem('tlp-mood')}catch(e){}
if(saved&&saved!=='auto'){auto=false;hue=+saved}
const setHue=h=>{hue=h;document.documentElement.style.setProperty('--h',h.toFixed(1))};
$('#themes').insertAdjacentHTML('beforeend',MOODS.map(([n,h])=>`<button class="sw" data-v="${h}" title="${n}" aria-label="${n}" style="background:hsl(${h} 75% 58%)"></button>`).join('')+'<button class="sw auto" data-v="auto" title="Drift between moods" aria-label="Drift between moods"></button>');
function mark(){document.querySelectorAll('.sw').forEach(s=>s.classList.toggle('on',auto?s.dataset.v==='auto':s.dataset.v==String(hue)))}
function goHue(t){cancelAnimationFrame(tw);tweening=true;const s0=hue,d=((t-s0+540)%360)-180,t0=performance.now();(function f(n){const k=Math.min(1,(n-t0)/700),e=1-Math.pow(1-k,3);setHue((s0+d*e+360)%360);if(k<1)tw=requestAnimationFrame(f);else tweening=false})(t0)}
document.querySelectorAll('.sw').forEach(s=>s.onclick=()=>{const v=s.dataset.v;auto=v==='auto';goHue(auto?(hue+90+Math.random()*120)%360:+v);try{localStorage.setItem('tlp-mood',v)}catch(e){}mark();

  pulse(s, 1.3, 200);
  const rect = s.getBoundingClientRect();
  burst(rect.left + rect.width/2, rect.top + rect.height/2, 10, ['var(--a)', 'var(--b)', 'var(--ok)', '#ffd36a']);
  ringBurst(rect.left + rect.width/2, rect.top + rect.height/2, s.style.backgroundColor || 'var(--a)', 3);
});
setHue(hue);mark();
setInterval(()=>{if(auto&&!still&&!tweening)setHue((hue+.6)%360)},50);



(function(){


 const panel=$('#hudMore'),themes=$('#themes'),logo=$('.top .logo');

 if(!panel||!themes||!logo)return;

 const mq=matchMedia('(max-width:520px)');

 const place=()=>{

  if(mq.matches){if(themes.parentElement!==panel)panel.insertBefore(themes,panel.firstChild)}

  else if(themes.parentElement===panel)logo.insertAdjacentElement('afterend',themes);
 };

 place();


 if(mq.addEventListener)mq.addEventListener('change',place);else mq.addListener(place);

 window.addEventListener('resize',place);
})();






function hud(){$('#pn').textContent=S.name;$('#sc').textContent=score();setLight()}
function play(c,l,k){stopNarration();stopBossClock();S._skipActCine=!!window.__skipActCine;window.__skipActCine=false;try{if(!modeRun)sessionStorage.setItem('tlp-resume',JSON.stringify({c:c,l:l}))}catch(e){}S.ci=c;S.li=l;S.script=[];S.hint=0;S.lastPts=0;S.runT0=0;if(lv().boss)bossRound(k);try{const d=JSON.parse(localStorage.getItem('tlp-draft')||'null');if(!k&&d&&d.k===PATH+'-'+DIFF+'-'+c+'-'+l&&Array.isArray(d.s)){S.script=d.s;S.hint=typeof d.h==='number'?d.h:0;S.id=Math.max(S.id,...(function m(a){return a.flatMap(b=>[b.id,...m(b.c),...m(b.e||[])])})(d.s),0)}}catch(e){}if(!S.script.length&&lv().start)S.script=lv().start();$('#menu').hidden=true;$('#game').hidden=false;$('#game').classList.remove('level-enter');void $('#game').offsetWidth;$('#game').classList.add('level-enter');setTimeout(()=>$('#game').classList.remove('level-enter'),760);document.body.dataset.sec=Math.max(0,SEC.findIndex(s=>s.ch.includes(c)||s.boss===c));track.dataset.sk=Math.random()*4|0;{const _lg=lv();track.style.setProperty('--p','0');track.style.setProperty('--g',_lg.goal!=null?_lg.goal:-5);}const firstTour=!lv().boss&&!tourSeen();if(firstTour)setTimeout(()=>runTour(),320);else if(pref('guide',true)&&!lv().boss)setTimeout(coachInit,0);$('#exit').hidden=false;$('#res').hidden=true; const L=lv();$('#learn').innerHTML=lessonCard(L,c);mountLesson(c);$('#nar').onclick=narrate;
  $('#learn').style.animation='none';void $('#learn').offsetWidth;$('#learn').style.animation='';storyBrief();
  layout();track.classList.toggle('fog',DIFF==='pro'&&!!mazeP);tp('--g',L.goal?L.goal:-5);
  $('#pal').innerHTML=L.allow.map(t=>`<div class="blk pal ${t}" draggable="true" data-new="${t}" tabindex="0" role="button" aria-label="Add ${NAMES[t]} to the end of the script">${NAMES[t]}</div>`).join('');

  $$('#pal .pal').forEach(p=>{p.onclick=e=>{if(S.run)return;e.stopPropagation();addBlockToEnd(p.dataset.new)}});
  reset();render();bossUI();if(lv().boss)startBossClock();if(window.TLP_PRESENCE)TLP_PRESENCE.setActivity('Playing '+CH[c].t+' · '+L.df);initAmbientBackground();window.scrollTo({top:0,left:0,behavior:'instant'});}
function addBlockToEnd(type) {
  if (S.run) return;
  const b = mk(type);
  S.script.push(b);
  render();
  focusBlock(b.id);
  snd('tick');

  requestAnimationFrame(() => {
    const el = document.querySelector(`.blk[data-id="${b.id}"]`);
    if (el) pulse(el, 1.2, 200);
  });
}


let ambientStarted=false;
function initAmbientBackground() {
  if (ambientStarted) return;
  ambientStarted = true;
  const canvas = document.getElementById('ambientCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
  window.addEventListener('resize', resize);
  resize();
  const nodes = [];
  const stars = [];
  const drops = [];
  const pathColors = {
    'g16': ['#ffd36a', '#ff8fcf', '#7ad9ff'],
    'g710': ['#35c9e8', '#9b5cf0', '#ff6b7f'],
    'g1112': ['#e8a23a', '#3ddc84', '#f2c94c'],
    'adult': ['#ff6b7f', '#35c9e8', '#9b5cf0']
  };
  const colors = pathColors[PATH] || pathColors['g710'];
  const COUNT = Math.min(46, Math.max(26, Math.floor(innerWidth / 34)));

  function spawn(anywhere) {
    return { x: Math.random()*canvas.width, y:anywhere?Math.random()*canvas.height:canvas.height+30,
      r:1.4+Math.random()*2.6, vx:(Math.random()-.5)*.22, vy:-(.12+Math.random()*.3),
      c:colors[Math.floor(Math.random()*colors.length)], ph:Math.random()*Math.PI*2 };
  }
  for(let i=0;i<COUNT;i++)nodes.push(spawn(true));
  for(let i=0;i<90;i++)stars.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:.4+Math.random()*1.4,ph:Math.random()*Math.PI*2});
  for(let i=0;i<55;i++)drops.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,l:8+Math.random()*18,v:.7+Math.random()*1.4,c:colors[i%colors.length]});
  const LINK=130;
  function drawNodes(){
    ctx.lineWidth=1;
    for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
      const a=nodes[i],b=nodes[j],dx=a.x-b.x,dy=a.y-b.y,d2=dx*dx+dy*dy;
      if(d2>LINK*LINK)continue;const k=1-Math.sqrt(d2)/LINK;
      ctx.strokeStyle='rgba(140,180,255,'+(k*.10).toFixed(3)+')';ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
    }
    nodes.forEach(n=>{const g=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r*4);g.addColorStop(0,n.c);g.addColorStop(.35,n.c+'aa');g.addColorStop(1,n.c+'00');ctx.globalAlpha=.5+Math.sin(n.ph)*.18;ctx.fillStyle=g;ctx.beginPath();ctx.arc(n.x,n.y,n.r*4,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1})
  }
  function drawGridDrift(){
    ctx.strokeStyle='rgba(120,190,255,.07)';ctx.lineWidth=1;const s=52,off=(performance.now()/28)%s;
    for(let x=-s;x<canvas.width+s;x+=s){ctx.beginPath();ctx.moveTo(x+off*.2,0);ctx.lineTo(x-off*.2,canvas.height);ctx.stroke()}
    for(let y=0;y<canvas.height+s;y+=s){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(canvas.width,y+off*.1);ctx.stroke()}
  }
  function drawStars(){stars.forEach(s=>{ctx.globalAlpha=.2+Math.sin(s.ph)*.16;ctx.fillStyle='#cfe8ff';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill()});ctx.globalAlpha=1}
  function drawRain(){drops.forEach(d=>{ctx.strokeStyle=d.c+'55';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(d.x,d.y);ctx.lineTo(d.x-2,d.y+d.l);ctx.stroke()})}
  const nebul=colors.map((c,i)=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:120+Math.random()*160,c,vx:(Math.random()-.5)*.15,vy:(Math.random()-.5)*.1,ph:i*2.1}));
  const bok=Array.from({length:26},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:8+Math.random()*26,c:colors[Math.floor(Math.random()*colors.length)],vx:(Math.random()-.5)*.3,vy:-(.05+Math.random()*.25),ph:Math.random()*6.28}));
  function drawNebula(){nebul.forEach(n=>{const g=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r);g.addColorStop(0,n.c+'2e');g.addColorStop(.6,n.c+'12');g.addColorStop(1,n.c+'00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,Math.PI*2);ctx.fill()})}
  function drawBokeh(){bok.forEach(b=>{const a=.05+.09*Math.abs(Math.sin(b.ph));ctx.globalAlpha=a;ctx.fillStyle=b.c;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill()});ctx.globalAlpha=1}
  function frame(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const body=document.body,bg=body.dataset.bgfx||'auto';
    const active=['auto','griddrift','stars','rain','nebula','bokeh'].includes(bg)&&!document.documentElement.classList.contains('reduce-fx');
    if(active){
      if(bg==='auto'||bg==='griddrift'){nodes.forEach(n=>{n.x+=n.vx;n.y+=n.vy;n.ph+=.02;if(n.y<-30||n.x<-30||n.x>canvas.width+30)Object.assign(n,spawn(false));});if(bg==='auto')drawNodes();else drawGridDrift()}
      else if(bg==='stars')stars.forEach(s=>{s.ph+=.015});
      else if(bg==='rain')drops.forEach(d=>{d.y+=d.v;if(d.y>canvas.height+20){d.y=-20;d.x=Math.random()*canvas.width}});
      else if(bg==='nebula'){nebul.forEach(n=>{n.x+=n.vx;n.y+=n.vy;n.ph+=.008;if(n.x<-n.r)n.x=canvas.width+n.r;if(n.x>canvas.width+n.r)n.x=-n.r;if(n.y<-n.r)n.y=canvas.height+n.r;if(n.y>canvas.height+n.r)n.y=-n.r});drawNebula()}
      else if(bg==='bokeh'){bok.forEach(b=>{b.x+=b.vx;b.y+=b.vy;b.ph+=.03;if(b.y<-40){b.y=canvas.height+40;b.x=Math.random()*canvas.width}if(b.x<-40)b.x=canvas.width+40;if(b.x>canvas.width+40)b.x=-40});drawBokeh()}
      if(bg!=='griddrift'&&bg!=='nebula'&&bg!=='bokeh')drawStars();if(bg==='rain')drawRain();
      requestAnimationFrame(frame);
    }else setTimeout(()=>requestAnimationFrame(frame),500);
  }
  requestAnimationFrame(frame);
}
const first=()=>Object.keys(lv().vars)[0]||'';
const mk=t=>{const o={id:++S.id,t,v:first(),val:t==='note'?'':'0',n:t==='rep'?2:t==='if'?4:1,src:t==='move'?'#':first(),src2:first(),to:t==='base'?'bin':'number',op:t==='calc'?'+':'>',idx:'#',j:'none',v2:first(),op2:'>',n2:0,rv:'#',rv2:'#',c:[],e:[]};if(t==='def'||t==='call')o.v=(lv().fns||[''])[0];if(t==='pick')o.v=Object.keys(lv().vars)[1]||first();return o};
const vopt=(sel,num)=>(num?['#']:[]).concat(Object.keys(lv().vars)).map(v=>`<option value="${v}"${v==sel?' selected':''}>${v==='#'?'a number':v}</option>`).join('');
function blk(b){const d=`data-id="${b.id}"`;let h='';
 if(b.t==='set')h=`set <select ${d} data-k="v">${vopt(b.v)}</select> to <input ${d} data-k="val" value="${b.val}">`;
 if(b.t==='change')h=`change <select ${d} data-k="v">${vopt(b.v)}</select> by <input type="number" ${d} data-k="n" value="${b.n}">`;
 if(b.t==='move')h=`move <select ${d} data-k="src">${vopt(b.src,1)}</select> <input type="number" ${d} data-k="n" value="${b.n}" ${b.src==='#'?'':'disabled'}> steps`;
 if(b.t==='say')h=`say <select ${d} data-k="src">${vopt(b.src)}</select>`;
 if(b.t==='if')h=`if <select ${d} data-k="v">${vopt(b.v)}</select> <select ${d} data-k="op">${[['>','is more than'],['<','is less than'],['=','is exactly']].map(o=>`<option value="${o[0]}"${b.op===o[0]?' selected':''}>${o[1]}</option>`).join('')}</select> <select ${d} data-k="rv">${vopt(b.rv,1)}</select> <input type="number" ${d} data-k="n" value="${b.n}" ${!b.rv||b.rv==='#'?'':'disabled'}>${cext(b,d)} then<div class="zone in" data-z="${b.id}">${b.c.map(blk).join('')}</div><b class="else">else</b><div class="zone in" data-z="${b.id}e">${b.e.map(blk).join('')}</div>`;
 if(b.t==='rep')h=`repeat <input type="number" ${d} data-k="n" value="${b.n}"> times<div class="zone in" data-z="${b.id}">${b.c.map(blk).join('')}</div>`;

 if(b.t==='note')h=`note <input ${d} data-k="val" value="${b.val}" placeholder="explain in words" style="width:170px">`;
 if(b.t==='ask')h=`ask the player, store in <select ${d} data-k="v">${vopt(b.v)}</select>`;
 if(b.t==='calc')h=`set <select ${d} data-k="v">${vopt(b.v)}</select> to <select ${d} data-k="src">${vopt(b.src)}</select> <select ${d} data-k="op">${sopt([['+','+'],['-','−'],['*','×'],['/','÷'],['%','remainder'],['&','AND (bits)'],['|','OR (bits)'],['^','XOR (bits)'],['<<','shift left'],['>>','shift right']],b.op)}</select> <input type="number" ${d} data-k="n" value="${b.n}">`;
 if(b.t==='join')h=`join <select ${d} data-k="src">${vopt(b.src)}</select> and <select ${d} data-k="src2">${vopt(b.src2)}</select> into <select ${d} data-k="v">${vopt(b.v)}</select>`;
 if(b.t==='cast')h=`turn <select ${d} data-k="v">${vopt(b.v)}</select> into <select ${d} data-k="to">${sopt([['number','a number'],['word','a word']],b.to)}</select>`;
 if(b.t==='pick')h=`set <select ${d} data-k="v">${vopt(b.v)}</select> to item <select ${d} data-k="idx">${vopt(b.idx,1)}</select> <input type="number" ${d} data-k="n" value="${b.n}" ${b.idx==='#'?'':'disabled'}> of <select ${d} data-k="src">${vopt(b.src)}</select>`;
 if(b.t==='base')h=`convert <select ${d} data-k="src">${vopt(b.src)}</select> <select ${d} data-k="to">${sopt([['bin','to binary'],['dec','from binary to a number']],b.to)}</select> into <select ${d} data-k="v">${vopt(b.v)}</select>`;
 if(b.t==='while')h=`repeat while <select ${d} data-k="v">${vopt(b.v)}</select> <select ${d} data-k="op">${sopt(OPS,b.op)}</select> <select ${d} data-k="rv">${vopt(b.rv,1)}</select> <input type="number" ${d} data-k="n" value="${b.n}" ${!b.rv||b.rv==='#'?'':'disabled'}>${cext(b,d)}<div class="zone in" data-z="${b.id}">${b.c.map(blk).join('')}</div>`;
 if(b.t==='def')h=`define function <select ${d} data-k="v">${fo(b.v)}</select><div class="zone in" data-z="${b.id}">${b.c.map(blk).join('')}</div>`;
 if(b.t==='call')h=`call <select ${d} data-k="v">${fo(b.v)}</select>`;
 if(b.t==='bit')h=`switch on bit worth <select ${d} data-k="n">${sopt([[1,1],[2,2],[4,4],[8,8],[16,16],[32,32],[64,64],[128,128]],b.n)}</select>`;
 return `<div class="blk ${b.t}" draggable="true" ${d} tabindex="0" role="group" aria-label="${NAMES[b.t]||b.t}. Alt and arrow keys move it, Delete removes it." title="Alt + arrow keys move this block. Delete removes it.">${h}</div>`}
function render(){try{localStorage.setItem('tlp-draft',JSON.stringify({k:PATH+'-'+DIFF+'-'+S.ci+'-'+S.li,s:S.script,h:S.hint}))}catch(e){}$('#area').innerHTML=S.script.length?S.script.map(blk).join(''):'<div class="empty">Drag or tap blocks here</div>'}
function find(id,arr=S.script){for(let i=0;i<arr.length;i++){if(arr[i].id===id)return{arr,i,b:arr[i]};const r=find(id,arr[i].c)||find(id,arr[i].e||[]);if(r)return r}return null}
const kids=b=>b.c.concat(b.e||[]),count=a=>a.reduce((n,b)=>n+1+count(kids(b)),0),has=(a,t)=>a.some(b=>b.t===t||has(kids(b),t));
const holds=(b,id)=>kids(b).some(x=>x.id===id||holds(x,id));
const dt=e=>e.dataTransfer;






document.addEventListener('dragstart',e=>{const b=e.target.closest&&e.target.closest('.blk');if(!b)return;dt(e).setData('text/plain',b.dataset.new?'n:'+b.dataset.new:'m:'+b.dataset.id)});
document.addEventListener('dragover',e=>{const z=e.target.closest('.zone,#pal');if(!z)return;e.preventDefault();$$('.over').forEach(x=>x.classList.remove('over'));z.classList.add('over')});
const $$=s=>[...document.querySelectorAll(s)];
document.addEventListener('dragend',()=>$$('.over').forEach(x=>x.classList.remove('over')));


function place(data,x,y){
 if(!data||S.run||!/^[nm]:/.test(data))return false;
 const el=document.elementFromPoint(x,y)||document.body;
 const z=el.closest('.zone'),inPal=el.closest('#pal');
 if(inPal){const f=data[0]==='m'?find(+data.slice(2)):null;if(f){f.arr.splice(f.i,1);render()}return !!f}
 if(!z)return false;
 const [k,v]=data.split(':');
 const zid=z.dataset.z,zn=parseInt(zid),arr=zid==='root'?S.script:zid.endsWith('e')?find(zn).b.e:find(zn).b.c;
 let idx=[...z.children].filter(c=>c.classList.contains('blk')&&y>c.getBoundingClientRect().top+c.getBoundingClientRect().height/2).length;
 if(k==='n'){arr.splice(idx,0,mk(v))}
 else{const f=find(+v);if(!f||(zid!=='root'&&(zn===f.b.id||holds(f.b,zn))))return false;if(f.arr===arr&&f.i<idx)idx--;f.arr.splice(f.i,1);arr.splice(idx,0,f.b)}
 render();return true;
}
document.addEventListener('drop',e=>{$$('.over').forEach(x=>x.classList.remove('over'));
 const data=dt(e).getData('text/plain');if(!data||S.run)return;e.preventDefault();
 if(place(data,e.clientX,e.clientY)){snd('tick');puff(e.clientX,e.clientY)}});







let TDRAG=null;
function ghostOf(el){
 const g=el.cloneNode(true);
 g.classList.remove('pal','run','glow','over');
 g.classList.add('bt-ghost');
 g.removeAttribute('draggable');
 g.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id'));
 g.style.width=el.getBoundingClientRect().width+'px';
 document.body.appendChild(g);
 return g;
}
function markAt(x,y){
 $$('.over').forEach(z=>z.classList.remove('over'));
 const t=document.elementFromPoint(x,y),z=t&&t.closest('.zone,#pal');
 if(z)z.classList.add('over');
}
function cleanupDrag(){
 if(TDRAG&&TDRAG.ghost)TDRAG.ghost.remove();
 if(TDRAG&&TDRAG.el&&TDRAG.el.isConnected)TDRAG.el.draggable=true;
 document.body.classList.remove('bt-dragging');
 $$('.over').forEach(z=>z.classList.remove('over'));
 TDRAG=null;
}
function startHold(st,x,y){
 TDRAG=st;
 st.timer=setTimeout(()=>{
  if(TDRAG!==st)return;
  st.live=true;st.el.draggable=false;
  st.ghost=ghostOf(st.el);
  st.ghost.style.transform='translate('+(x-st.dx)+'px,'+(y-st.dy)+'px)';
  document.body.classList.add('bt-dragging');
  try{navigator.vibrate&&navigator.vibrate(12)}catch(err){}
  markAt(x,y);
 },240);
}
function moveGhost(x,y){
 if(!TDRAG||!TDRAG.live)return;
 TDRAG.ghost.style.transform='translate('+(x-TDRAG.dx)+'px,'+(y-TDRAG.dy)+'px)';
 markAt(x,y);

 const m=70;if(y<m)scrollBy(0,-14);else if(y>innerHeight-m)scrollBy(0,14);
}
function dropGhost(x,y){
 const st=TDRAG;if(!st)return false;
 if(!st.live)return false;
 if(st.ghost)st.ghost.remove();
 document.body.classList.remove('bt-dragging');
 $$('.over').forEach(z=>z.classList.remove('over'));
 const ok=place(st.data,x,y);
 if(st.el&&st.el.isConnected)st.el.draggable=true;
 TDRAG=null;
 if(ok){snd('tick');puff(x,y)}
 return ok;
}


document.addEventListener('touchstart',e=>{
 if(S.run||TDRAG||e.touches.length!==1)return;
 if(e.target.closest('input,select,textarea,button,a'))return;
 const el=e.target.closest('.blk');if(!el)return;
 const t=e.touches[0],r=el.getBoundingClientRect(),pal=el.classList.contains('pal');
 startHold({x0:t.clientX,y0:t.clientY,id:t.identifier,el,pal,live:false,
  data:pal?'n:'+el.dataset.new:'m:'+el.dataset.id,ghost:null,
  dx:t.clientX-r.left,dy:t.clientY-r.top},t.clientX,t.clientY);
},{passive:true});
document.addEventListener('touchmove',e=>{
 if(!TDRAG||e.touches.length!==1)return;
 const t=e.touches[0];if(t.identifier!==TDRAG.id)return;
 if(!TDRAG.live){
  if(Math.hypot(t.clientX-TDRAG.x0,t.clientY-TDRAG.y0)>10){clearTimeout(TDRAG.timer);TDRAG=null}
  return;
 }
 e.preventDefault();
 moveGhost(t.clientX,t.clientY);
},{passive:false});
document.addEventListener('touchend',e=>{
 if(!TDRAG)return;
 const t=[...e.changedTouches].find(x=>x.identifier===TDRAG.id);if(!t)return;
 const st=TDRAG;clearTimeout(st.timer);
 if(st.live){dropGhost(t.clientX,t.clientY);return}
 TDRAG=null;

 if(st.pal&&Math.hypot(t.clientX-st.x0,t.clientY-st.y0)<12){
  const b=mk(st.el.dataset.new);S.script.push(b);render();focusBlock(b.id);snd('tick');
 }
},{passive:true});
document.addEventListener('touchcancel',()=>cleanupDrag(),{passive:true});

document.addEventListener('pointerdown',e=>{
 if(e.pointerType!=='pen'||S.run||TDRAG)return;
 if(e.target.closest('input,select,textarea,button,a'))return;
 const el=e.target.closest('.blk');if(!el)return;
 const r=el.getBoundingClientRect(),pal=el.classList.contains('pal');
 startHold({x0:e.clientX,y0:e.clientY,id:e.pointerId,el,pal,live:false,
  data:pal?'n:'+el.dataset.new:'m:'+el.dataset.id,ghost:null,
  dx:e.clientX-r.left,dy:e.clientY-r.top},e.clientX,e.clientY);
});
document.addEventListener('pointermove',e=>{
 if(!TDRAG||e.pointerId!==TDRAG.id)return;
 if(!TDRAG.live){
  if(Math.hypot(e.clientX-TDRAG.x0,e.clientY-TDRAG.y0)>10){clearTimeout(TDRAG.timer);TDRAG=null}
  return;
 }
 e.preventDefault();moveGhost(e.clientX,e.clientY);
},{passive:false});
document.addEventListener('pointerup',e=>{
 if(!TDRAG||e.pointerId!==TDRAG.id)return;
 const st=TDRAG;clearTimeout(st.timer);
 if(st.live){dropGhost(e.clientX,e.clientY);return}
 TDRAG=null;
 if(st.pal&&Math.hypot(e.clientX-st.x0,e.clientY-st.y0)<12){
  const b=mk(st.el.dataset.new);S.script.push(b);render();focusBlock(b.id);snd('tick');
 }
},{passive:true});
document.addEventListener('pointercancel',e=>{if(TDRAG&&e.pointerId===TDRAG.id){clearTimeout(TDRAG.timer);cleanupDrag()}},{passive:true});


document.addEventListener('contextmenu',e=>{if(TDRAG&&TDRAG.live)e.preventDefault()});
document.addEventListener('dragstart',e=>{if(TDRAG)e.preventDefault()},true);



function focusBlock(id){const el=document.querySelector('.blk[data-id="'+id+'"]');if(el)el.focus()}
document.addEventListener('keydown',e=>{
 if(e.target.closest('input,select,textarea'))return;
 const pal=e.target.closest('.blk.pal');
 if(pal&&(e.key==='Enter'||e.key===' ')){
  e.preventDefault();if(S.run)return;
  const b=mk(pal.dataset.new);S.script.push(b);render();focusBlock(b.id);snd('tick');return;
 }
 const el=e.target.closest('#area .blk');if(!el)return;
 const f=find(+el.dataset.id);if(!f)return;
if(e.key==='Delete'||e.key==='Backspace'){
   e.preventDefault();if(S.run)return;

   const rect = el.getBoundingClientRect();
   burst(rect.left + rect.width/2, rect.top + rect.height/2, 12, ['var(--bad)', '#ff6b7f', 'var(--a)']);
   screenFlash('var(--bad)', 80);
   shake(el, 8, 200);
   f.arr.splice(f.i,1);render();snd('tap');return;
  }
if((e.key==='ArrowUp'||e.key==='ArrowDown')&&e.altKey){
   e.preventDefault();if(S.run)return;
   const j=f.i+(e.key==='ArrowDown'?1:-1);if(j<0||j>=f.arr.length)return;
   const t=f.arr[f.i];f.arr[f.i]=f.arr[j];f.arr[j]=t;render();focusBlock(el.dataset.id);snd('tick');

   pulse(el, 1.1, 150);
   const rect = el.getBoundingClientRect();
   burst(rect.left + rect.width/2, rect.top + rect.height/2, 6, ['var(--a)', 'var(--b)']);
  }
});
function edit(e){const t=e.target;if(!t.dataset.k)return;const f=find(+t.dataset.id);if(!f)return;f.b[t.dataset.k]=t.value;if(e.type==='change'&&(t.dataset.k==='src'||t.dataset.k==='idx'||t.dataset.k==='j'||t.dataset.k==='rv'||t.dataset.k==='rv2'))render()}
$('#area').addEventListener('input',edit);$('#area').addEventListener('change',edit);



$('#area').addEventListener('click',e=>{
 if(S.run||TDRAG)return;
 if(e.target.closest('input,select,textarea,button,a,label'))return;
 const el=e.target.closest('.blk');if(!el)return;
 const zn=e.target.closest('.zone.in');
 if(zn&&el.contains(zn))return;
 const f=find(+el.dataset.id);if(!f)return;
 const r=el.getBoundingClientRect();
 burst(r.left+r.width/2,r.top+r.height/2,10,['var(--a)','var(--b)']);
 f.arr.splice(f.i,1);render();snd('tap');
});







let env={},pos=0,said=null,lastMove=null,lastSay=null;
const bot=$('#bot'),track=$('#track');



function syncBotAvatar(){
 try{
  if(!window.TLP_AVATAR||!bot)return;
  const bd=bot.querySelector('.bd');if(!bd)return;
  bd.className='bd av-skin';
  const cfg=window.TLP_AVATAR.get();
  const fx=window.TLP_AVATAR.fxEnabled&&window.TLP_AVATAR.fxEnabled()&&pref('robotfx',true);
  bd.innerHTML='<span class="av-in '+TLP_AVATAR.animClass(cfg,fx)+'">'+TLP_AVATAR.svg(cfg,64)+'</span>';
 }catch(e){}
}
document.addEventListener('tlp-avatar-change',()=>{syncBotAvatar();if(uiModal&&!uiModal.hidden)uiModal.querySelector('.ui-preview-bot').innerHTML=window.TLP_AVATAR?TLP_AVATAR.svg(window.TLP_AVATAR.get(),60):''});
window.addEventListener('tlp-fx-change',syncBotAvatar);
syncBotAvatar();
$('#uiOpen').onclick=openUI;


function clearBad(){$$('.blk.badblk').forEach(x=>x.classList.remove('badblk'));$$('#track i.stop').forEach(x=>x.classList.remove('stop'))}
function markBad(id,cell){clearBad();const el=id!=null?$('.blk[data-id="'+id+'"]'):null;if(el){el.classList.add('badblk');setTimeout(()=>el.classList.remove('badblk'),2800)}if(cell!=null&&track.children[cell]){const c=track.children[cell];c.classList.add('stop');setTimeout(()=>c.classList.remove('stop'),1800)}}
function mem(pop){$('#mem').innerHTML=Object.entries(env).length?Object.entries(env).map(([k,v])=>`<div class="box ${k===pop?'pop':''}">${k}${isC(k)?' <i class=ic-lock></i>':''}<b>${fmt(v)}</b></div>`).join(''):'<span style="color:var(--mut);font-size:14px">No variables in this mission.</span>';

  if (pop) {
    requestAnimationFrame(() => {
      const box = $('#mem').querySelector(`.box.pop`);
      if (box) {
        pulse(box, 1.15, 300);
        const rect = box.getBoundingClientRect();
        burst(rect.left + rect.width/2, rect.top + rect.height/2, 8, ['var(--ok)', '#ffd36a', 'var(--a)']);
      }
    });
  }
}
function reset(){S.run=false;stopMissionTimer();useCase(0);lastMove=null;lastSay=null;clearBad();bot.className='bot';$$('.bub').forEach(x=>x.remove());$$('.blk.run').forEach(x=>x.classList.remove('run'));mem();msg('Drag blocks into your script, then press Run.')}


function stepRobot(d){if(S.run||mazeP)return;const np=Math.max(0,Math.min(8,pos+d));if(np===pos){snd('tick');return}for(let c=Math.min(pos,np);c<=Math.max(pos,np);c++)track.children[c].classList.add('vis');pos=np;lastMove={c:pos,id:null};tp('--p',pos);bot.classList.add('walk');setTimeout(()=>bot.classList.remove('walk'),600);snd('step');if(np>0)ringBurst(track.children[np].getBoundingClientRect().left+track.children[np].offsetWidth/2,track.children[np].getBoundingClientRect().top+track.children[np].offsetHeight/2,'var(--a)',1)}
{const _sb=document.getElementById('stepB'),_sf=document.getElementById('stepF');if(_sb)_sb.onclick=()=>stepRobot(-1);if(_sf)_sf.onclick=()=>stepRobot(1)}
const val=v=>v.trim()===''||isNaN(+v)?v:+v;
async function exec(list){for(const b of list){if(!S.run)return;const el=$('.blk[data-id="'+b.id+'"]');el&&el.classList.add('run');if(el){pulse(el,1.08,200);const rect=el.getBoundingClientRect();burst(rect.left+rect.width/2,rect.top+rect.height/2,4,['var(--a)','var(--b)'])}await sleep(500);
  if((b.t==='set'||b.t==='change')&&isC(b.v)){S.errId=b.id;fail(b.v+' is a constant. A constant is set once and can never change, so '+b.t+' is not allowed on it.');el&&el.classList.remove('run');return}
  if(b.t==='move'&&b.src!=='#'&&lv().strict&&typeof env[b.src]!=='number'){S.errId=b.id;fail('The box "'+b.src+'" holds '+(typeof env[b.src]==='string'?'the word "'+env[b.src]+'"':'something that is not a number')+', but move needs a number. Check the type, or convert it first.');el&&el.classList.remove('run');return}
  if(b.t==='set'){env[b.v]=val(String(b.val));mem(b.v);if(el){ringBurst(el.getBoundingClientRect().left+el.offsetWidth/2,el.getBoundingClientRect().top+el.offsetHeight/2,'var(--ok)',2)}}
  if(b.t==='change'){env[b.v]=(+env[b.v]||0)+(+b.n||0);mem(b.v);if(el){ringBurst(el.getBoundingClientRect().left+el.offsetWidth/2,el.getBoundingClientRect().top+el.offsetHeight/2,'var(--a)',2)}}
  if(b.t==='move'){const n=b.src==='#'?+b.n||0:+env[b.src]||0,np=Math.max(0,Math.min(8,pos+n));
   if(np!==pos+n){bot.classList.add('oops');setTimeout(()=>bot.classList.remove('oops'),600)}
   for(let c=Math.min(pos,np);c<=Math.max(pos,np);c++)track.children[c].classList.add('vis');pos=np;lastMove={c:pos,id:b.id};bot.classList.add('walk');tp('--p',pos);snd('step');{const r=bot.getBoundingClientRect();puff(r.left+r.width/2,r.top+r.height*.8,3)}await sleep(600);bot.classList.remove('walk');chk();{const G=cases()[cc];if(G.goal!=null&&pos===G.goal&&pos>0){snd('chime');goalFx()}}}
  if(b.t==='say'){said=String(env[b.src]??'');lastSay={s:said,id:b.id};$$('.bub').forEach(x=>x.remove());const u=document.createElement('div');u.className='bub';u.textContent=said||'…';bot.appendChild(u);pulse(bot,1.05,200);chk();await sleep(500)}
  if(b.t==='rep'){for(let i=0;i<Math.min(+b.n||0,12)&&S.run;i++)await exec(b.c)}
  if(b.t==='if'){await exec(cond(b)?b.c:b.e)}
  if(b.t==='while'){let g=0;while(S.run&&cond(b)&&g++<40){await exec(b.c)}}

  if(b.t==='ask'){env[b.v]=val(String(INP??''));mem(b.v)}
  if(b.t==='calc'){
   const bitOp=['&','|','^','<<','>>'].includes(b.op),raw=env[b.src],n=+b.n||0;
   if(bitOp){const error=binaryCalcError(b.op,raw,n);if(error){S.errId=b.id;fail(error);el&&el.classList.remove('run');return}}
   const x=+raw||0;
   env[b.v]=bitOp?binaryCalc(b.op,x,n):b.op==='+'?x+n:b.op==='-'?x-n:b.op==='*'?x*n:b.op==='/'?(n?Math.floor(x/n):0):(n?x%n:0);
   mem(b.v);if(el){burst(el.getBoundingClientRect().left+el.offsetWidth/2,el.getBoundingClientRect().top+el.offsetHeight/2,8,['var(--a)','var(--b)','#ffd36a'])}
  }
  if(b.t==='join'){env[b.v]=String(env[b.src]??'')+String(env[b.src2]??'');mem(b.v)}
  if(b.t==='cast'){const x=env[b.v];env[b.v]=b.to==='number'?(isNaN(+x)?0:+x):String(x);mem(b.v)}
  if(b.t==='pick'){const a=env[b.src],i=(b.idx==='#'?+b.n:+env[b.idx])-1;env[b.v]=Array.isArray(a)?(a[i]??0):0;mem(b.v)}
  if(b.t==='bit'){onBits.add(+b.n);const t=[...onBits].reduce((a,c)=>a+c,0);env.total=t;env.bin=t.toString(2);mem('total');if(el){ringBurst(el.getBoundingClientRect().left+el.offsetWidth/2,el.getBoundingClientRect().top+el.offsetHeight/2,'#ffd36a',3)}}
  if(b.t==='base'){const x=env[b.src];if(b.to==='bin'){if(!Number.isInteger(+x)||+x<0||+x>255){S.errId=b.id;fail('Convert to binary needs a whole number from 0 to 255. The box "'+b.src+'" does not contain one.');el&&el.classList.remove('run');return}env[b.v]=(+x).toString(2)}else{const raw=String(x??'').trim();if(!/^[01]+$/.test(raw)||parseInt(raw,2)>255){S.errId=b.id;fail('Convert from binary needs only 0 and 1, with a value no greater than 255. Check the box "'+b.src+'".');el&&el.classList.remove('run');return}env[b.v]=parseInt(raw,2)}mem(b.v)}
  if(b.t==='def'){FN[b.v]=b}
  if(b.t==='call'){const f=FN[b.v];if(!f){S.errId=b.id;fail('The function "'+b.v+'" is not defined yet. Define it above the place where you call it.');el&&el.classList.remove('run');return}if(++fdepth>30){S.errId=b.id;fail('Too many nested calls. A recursive function needs a stopping rule (a base case).');el&&el.classList.remove('run');return}const keep=env;env={...env};await exec(f.c);env=keep;if(onBits.size){const t=[...onBits].reduce((a,c)=>a+c,0);env.total=t;env.bin=t.toString(2)}fdepth--;mem()}
  el&&el.classList.remove('run')}}


let missionTimerInterval = null;
function startMissionTimer(ms) {
  if (missionTimerInterval) clearInterval(missionTimerInterval);
  S.missionTimeLeft = ms;
  updateMissionTimerDisplay();
  missionTimerInterval = setInterval(() => {
    S.missionTimeLeft -= 100;
    updateMissionTimerDisplay();
    if (S.missionTimeLeft <= 0) {
      clearInterval(missionTimerInterval);
      failMission('Time ran out!');
    }
  }, 100);
}
function stopMissionTimer() {
  if (missionTimerInterval) {
    clearInterval(missionTimerInterval);
    missionTimerInterval = null;
  }
  const el = document.querySelector('.mission-timer');
  if (el) el.remove();
}
function updateMissionTimerDisplay() {
  let el = document.querySelector('.mission-timer');
  if (!el) {
    el = document.createElement('div');
    el.className = 'mission-timer';
    el.setAttribute('aria-live', 'polite');
    const hud = document.querySelector('.hud');
    if (hud) hud.appendChild(el);
  }
  const sec = Math.ceil(S.missionTimeLeft / 1000);
  el.textContent = `⏱ ${sec}s`;
  el.classList.toggle('warn', S.missionTimeLeft <= 5000);
}
function failMission(reason) {
  S.run = false;
  msg(reason, 'bad');
  stopMissionTimer();
  setTimeout(() => {
    stopBossClock();
    stopNarration();
    document.querySelectorAll('.coach').forEach(x=>x.remove());
    $('#menu').hidden=false;
    $('#game').hidden=true;
    hudFit();
    $('#exit').hidden=true;
    $('#name').value=S.name;
    delete document.body.dataset.sec;
    hud();
    renderPick();
    renderContinue();
    renderTally();
    renderStreak();
    renderDaily();
  }, 1500);
}

async function run(){if(S.run)return;reset();S.err=null;S.errId=null;bot.dataset.m=['hop','bounce','glide','spin'][Math.random()*4|0];const L=lv();if(!S.script.length){msg('Add some blocks to your script first.','bad');return}try{if(!modeRun&&window.TLP_ECONOMY)TLP_ECONOMY.track('run',1)}catch(e){}

  if (L.timed && PATH==='adult' && DIFF==='pro') {
    startMissionTimer(L.timed);
    S.fewestBlocksTarget = L.fewestBlocks || null;
    S.reverseEngineerData = L.reverseEngineer || null;
  }
  if(DIFF==='pro'&&!L.boss&&count(S.script)>L.par+2){msg('Professional rules: use at most '+(L.par+2)+' blocks for this mission.','bad');return}
  if(hardMode()&&!L.boss&&count(S.script)>L.par+1){msg('Hardcore rule: this mission allows at most '+(L.par+1)+' blocks. Try a tighter solution.','bad');return}
  if(L.cap&&count(S.script)>L.cap){msg('This mission allows at most '+L.cap+' blocks. Try a loop.','bad');return}
  if(L.boss&&(bossWait||bossRepeat()))return;
  if(!modeRun)bumpTry(key(S.ci,S.li));S.runT0=Date.now();

  screenFlash('var(--a)', 100);
  pulse($('#run'), 1.1, 150);
  S.run=true;$('#run').disabled=true;const CS=cases(),miss=[];let badGoal=false,badSay=false;
  for(let i=0;i<CS.length&&S.run;i++){const X=CS[i];if(i){await sleep(800);bot.className='bot'}useCase(i);if(CS.length>1)msg('<b>Test '+(i+1)+' of '+CS.length+'</b>');
    await exec(S.script);
    if(S.run){const t=CS.length>1?'Test '+(i+1)+': the robot ':'The robot ';
     if(X.goal!=null&&pos!==X.goal){miss.push(`${t}stopped at cell ${pos}, but it needed cell ${X.goal}.`);badGoal=true}
     if(X.say!=null&&said!==X.say){miss.push(said==null?`${t}never said anything.`:`${t}said "${said}", but needed "${X.say}".`);badSay=true}
     if(miss.length)break}}
  const was=S.run;S.run=false;$('#run').disabled=false;if(!was){if(S.err){markBad(S.errId,null);bot.classList.add('oops');snd('err');msg(S.err,'bad');S.err=null;S.errId=null}return}

  if(L.needs&&!has(S.script,'rep'))miss.push('This mission wants a loop. Try using a repeat block.');
  if(L.rule&&!L.rule.f(S.script))miss.push('Round rule not met: '+L.rule.txt+'.');
  if(miss.length){if(badSay)markBad(lastSay&&lastSay.id,null);else if(badGoal)markBad(lastMove&&lastMove.id,pos);bot.classList.add('oops');snd('err');const tries=runRec(key(S.ci,S.li)).tries||0;let lifeNote='';if(!modeRun&&window.TLP_LIFE){if(tries>=3&&(tries-3)%3===0)lifeNote=' Careful: one more failed try on this mission will cost 1 lifeline. Take a breath or use a hint.';else if(tries>=4&&(tries-4)%3===0){if(TLP_LIFE.state().left>0){TLP_LIFE.drain('retries');lifeNote=' You lost 1 lifeline after repeated tries. It refills at the daily reset.'}else lifeNote=' Your lifeline is empty. It refills at the daily reset.'}}msg(miss.join(' ')+' '+(kidMode()?'Almost! Take a breath, change one block and try again. You can do it!':(DIFF==='beg'?'Check your blocks and try again, or ask for a hint. You are doing great!'+((PATH==='g16'||PATH==='g710')?' The Coach steps can help.':''):'Check your blocks and try again, or ask for a hint.'))+lifeNote+storyFail(),'bad');return}
  if(L.boss)return bossHit();
  if(modeRun){bot.classList.add('win');sparks();snd('win');stopMissionTimer();const mn=count(S.script),ms=mn<=L.par+PB()?3:mn<=L.par+PB()+1?2:1;msg('<b>Challenge solved.</b> Your campaign record was not changed.','good');await sleep(650);completeModeStage(ms,mn);return}

  if (S.fewestBlocksTarget && count(S.script) <= S.fewestBlocksTarget) {
    S.lastRunPts = (S.lastRunPts||0) + 100;
    msg('Fewest blocks bonus! +100 points', 'good');
  }

  if (S.reverseEngineerData) {
    const rev = S.reverseEngineerData;
    let ok = true;
    if (rev.vars) {
      for (const [k, v] of Object.entries(rev.vars)) {
        if (env[k] !== v) ok = false;
      }
    }
    if (rev.pos !== undefined && pos !== rev.pos) ok = false;
    if (rev.say !== undefined && said !== rev.say) ok = false;
    if (ok) {
      S.lastRunPts = (S.lastRunPts||0) + 150;
      msg('Reverse engineer bonus! +150 points', 'good');
    }
  }
  bot.classList.add('win');sparks();const n=count(S.script),st=n<=L.par+PB()?3:n<=L.par+PB()+1?2:1,k=key(S.ci,S.li);S.prog[k]=Math.max(S.prog[k]||0,st);completeLevel(k,st,{hardcore:hardMode(),ms:Date.now()-S.runT0});save();hud();dailyFromWin(st,S.lastRunPts);try{if(window.TLP_ECONOMY){TLP_ECONOMY.track('level',1);TLP_ECONOMY.track('stars',st);if(st===3)TLP_ECONOMY.track('perfect',1);TLP_ECONOMY.earn(15+st*10,'mission complete')}}catch(e){}checkAch();snd('win');if(DIFF==='beg')cheer();
  stopMissionTimer();
  msg('<b>Correct! Protocol restored.</b> Here is what each block in your code did:'+whyList());await sleep(2600);finish(st,n)}





function sparks(){if(still)return;const r=bot.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;for(let i=0;i<30;i++){const s=document.createElement('span');s.className='spark';s.style.cssText=`left:${x}px;top:${y}px;background:${i%2?'var(--a)':'var(--b)'}`;document.body.appendChild(s);const a=Math.random()*6.28,d=80+Math.random()*180;s.animate([{transform:'translate(0,0)',opacity:1},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d+50}px) rotate(${Math.random()*500}deg)`,opacity:0}],{duration:1100,easing:'ease-out'}).onfinish=()=>s.remove()}}
function finish(st,n){hideToast();try{localStorage.removeItem('tlp-draft')}catch(e){}try{sessionStorage.removeItem('tlp-resume')}catch(e){}try{localStorage.removeItem('tlp-bossend'+S.ci)}catch(e){}const L=CH[S.ci].L,last=S.li===L.length-1,all=CH.every(c=>!c.L||done(CH.indexOf(c)));
  let title='Mission complete',txt=`You used ${n} block${n>1?'s':''}. ${st===3?'Perfect, that is the tidiest solution.':'Can you solve it with fewer blocks for three stars?'}`,go='Next mission',nx=()=>play(S.ci,S.li+1);
  const curBonus=isBonus(lv()),nextIsBonus=!last&&isBonus(L[S.li+1]);
  if(last&&lv().boss){


   const isMainEnd=S.ci===mainBoss(),left=mainSecs().filter(s=>!done(s.boss)).length,isBonusBoss=SEC.some(s=>s.bonus&&s.boss===S.ci);
   title=isMainEnd?'Main story complete':'Guardian defeated';
   txt='You beat '+nice(bi().name)+' with '+st+' heart'+(st>1?'s':'')+' left. '+(isMainEnd?'Every main guardian is down and the light is coming back. The final scene is next.':left?left+' main guardian'+(left>1?'s are':' is')+' still awake, but the light is growing.':(isBonusBoss?'All the guardians, main and bonus, are gone. The protocol is restored and the light is back.':'All the main guardians are down. The bonus guardian is optional.'))+' Score: '+score()+'.';
   go=isMainEnd?'See the ending':(nextOf(S.ci)!=null?'Next section':'Back to menu');
   nx=isMainEnd?()=>menu():()=>{const nc=nextOf(S.ci);nc!=null?play(nc,0):menu()};
  }
  else if(curBonus){const nc=nextOf(S.ci);title='Bonus complete';txt='You solved the bonus challenge! '+txt+(nc!=null?' Next: '+CH[nc].t+'.':'');go=nc!=null?(CH[nc].L[0].boss?'Face the boss':'Next chapter'):'Back to menu';nx=nc!=null?()=>play(nc,0):menu}
  else if(last){const nc=nextOf(S.ci);title='Chapter complete';txt+=' You finished '+CH[S.ci].t+'.'+(nc!=null?' Next: '+CH[nc].t+'.':'');go=nc!=null?(CH[nc].L[0].boss?'Face the boss':'Next chapter'):'Back to menu';nx=nc!=null?()=>play(nc,0):menu}
  else if(nextIsBonus){const nc=nextOf(S.ci);title='Chapter core complete';txt+=' You finished the core missions of '+CH[S.ci].t+'! Next chapter is unlocked, or try the optional bonus mission.';go='Bonus mission';nx=()=>play(S.ci,S.li+1)}
  if(last&&lv().boss&&S.ci===mainBoss()){const _n=nx;nx=()=>storyEnding(_n)}



  let actEnd=null;
  try{if(window.TLP_STORY&&last&&lv().boss){const si=TLP_STORY.sectionOf(S.ci),sx=SEC.find(x=>x.id===si);if(sx&&sx.boss===S.ci){const el=TLP_STORY.actEnd(si,PATH);if(el&&el.length){const a=TLP_STORY.act(si,PATH);actEnd={title:(a?a.title:'Section')+' · complete',lines:el,si:si}}}}}catch(e){}
  if(actEnd){const _n2=nx;nx=()=>{window.__justActEnd=actEnd.si+1;storyScenes({title:actEnd.title,scenes:[actEnd.lines],button:'Continue'},()=>_n2())}}
  const showLearned=last||nextIsBonus||curBonus;


  let nextName='';
  if(last&&lv().boss){const nc=nextOf(S.ci);nextName=S.ci===mainBoss()?'The final scene':(nc!=null?CH[nc].t:'')}
  else if(!last)nextName=CH[S.ci].L[S.li+1].t;
  else {const nc=nextOf(S.ci);nextName=nc!=null?CH[nc].t:''}
  const ds=dailyState(),dl=ds.ids.filter(id=>(ds.prog[id]||0)>=(ds.goals&&ds.goals[id]||Infinity)).length;
  const payoff=`<div class="payoff"><span><small>This run</small><b>+${S.lastRunPts||st*100} points</b></span><span><small>Stars here</small><b>${st} / 3</b></span><span><small>Daily goals</small><b>${dl} of 3</b></span></div>`;
  const nextLine=nextName?`<p class="nextup"><span>Next up</span> <b>${nextName}</b></p>`:'';
  $('#pan').innerHTML=`<span class="hand">${lv().boss?'Boss defeated':n+' blocks'} · +${S.lastPts||st*100} points</span><h2>${title}</h2><div class="stars">${'★'.repeat(st)}${'☆'.repeat(3-st)}</div>${payoff}<p>${txt}</p>${whyHTML()}${showLearned?learnedHTML(S.ci):''}${nextLine}<div class="bar" style="justify-content:center"><button class="btn" id="nx">${go}</button><button class="btn ghost" id="rt">Play again</button></div>`;
  $('#pan').classList.toggle('big',true);storyOutcome(last,!!actEnd);$('#res').hidden=false;$('#nx').onclick=()=>{stopSay();$('#res').hidden=true;nx()};$('#rt').onclick=()=>{stopSay();$('#res').hidden=true;reset()}

  const botRect = bot.getBoundingClientRect();
  const botCenterX = botRect.left + botRect.width / 2;
  const botCenterY = botRect.top + botRect.height / 2;
  if (st === 3) {
    confettiBurst(botCenterX, botCenterY, 150);
    starBurst(botCenterX, botCenterY, 30);
    ringBurst(botCenterX, botCenterY, 'var(--ok)', 4);
    screenFlash('var(--ok)', 200);
  } else if (st === 2) {
    confettiBurst(botCenterX, botCenterY, 80);
    starBurst(botCenterX, botCenterY, 15);
    ringBurst(botCenterX, botCenterY, 'var(--a)', 3);
  } else {
    burst(botCenterX, botCenterY, 40, ['var(--a)', 'var(--b)', '#ffd36a']);
  }
  if(showLearned){confetti();$('#lis').onclick=()=>sayLearned(S.ci);sayLearned(S.ci)}
  if(kidMode()){const p=document.createElement('p');p.className='kidpraise';p.textContent=kidPraise();const bar=$('#pan .bar');if(bar)bar.before(p);kidBurst()}}
let cc=0;
const cases=()=>{const c=lv().cases||[{vars:{},goal:lv().goal,say:lv().say}];return DIFF==='beg'&&!lv().boss?c.slice(0,1):c};
function useCase(i){cc=i;const X=cases()[i];INP=X.input;onBits=new Set();FN={};fdepth=0;env={...lv().vars,...X.vars};pos=0;said=null;lastMove=null;lastSay=null;tp('--p',0);tp('--g',X.goal?X.goal:-5);track.classList.toggle('goal-active',Number(X.goal)>0);clearBad();$$('.track i').forEach(c=>c.classList.remove('vis'));$$('.bub').forEach(x=>x.remove());goals();mem()}
function goals(){const L=lv(),CS=cases(),X=CS[cc],g=[];
  if(CS.length>1)g.push(['tip','Test '+(cc+1)+' of '+CS.length+': '+Object.entries(X.vars).map(([k,v])=>k+' = '+v).join(', ')+(X.input!=null?(Object.keys(X.vars).length?', ':'')+'the player types '+X.input:'')+'. One script must pass every test.']);
  if(X.goal!=null)g.push([X.goal?'pos':'tip',X.goal?'Reach the chip at cell '+X.goal:'Stay at the start']);
  if(X.say!=null)g.push(['say','Say "'+X.say+'"']);
  if(L.needs)g.push(['loop','Use a repeat block']);
  if(L.rule)g.push(['rule',(L.boss?'Round rule: ':'Also: ')+L.rule.txt]);
  g.push(['tip',L.boss?'Stars come from your hearts. Keep your hearts for more stars.':'For 3 stars use '+(L.par+PB())+' blocks or fewer'+(DIFF==='pro'?' (limit: '+(L.par+2)+')':'')]);

  const html = g.map(([k,t])=>`<li class="${k==='tip'?'tip':''}" data-g="${k}">${t}</li>`).join('');
  if (PATH === 'g16') {

    let firstIncompleteIdx = -1;
    for (let i = 0; i < g.length; i++) {
      const [k] = g[i];
      if (k !== 'tip') {
        firstIncompleteIdx = i;
        break;
      }
    }
    if (firstIncompleteIdx >= 0) {
      $('#goals').innerHTML = html;

      const items = $('#goals').querySelectorAll('li');
      items.forEach((item, i) => {
        if (i > firstIncompleteIdx) item.style.display = 'none';
      });
      chk();
      return;
    }
  }
  $('#goals').innerHTML = html;chk()}
function chk(){const X=cases()[cc],on=(k,v)=>{const e=$('#goals [data-g="'+k+'"]');if(e){const wasOk=e.classList.contains('ok');e.classList.toggle('ok',v);if(v&&!wasOk){pulse(e,1.1,300);const rect=e.getBoundingClientRect();burst(rect.left+rect.width/2,rect.top+rect.height/2,10,['var(--ok)','#ffd36a']);screenFlash('var(--ok)',80);}}};on('pos',pos===X.goal);on('say',said===X.say);on('loop',has(S.script,'rep'));lv().rule&&on('rule',lv().rule.f(S.script))}
let au=null,narrating=false,binaryArabicHandler=null,binaryArabicDraw=null;
function sectionArt(c){const si=SEC.findIndex(s=>s.ch.includes(c)||s.boss===c);return si<0?'':`<figure class="sec-art" aria-hidden="true"><img src="assets/art/sec${si+1}.jpg" alt="" loading="lazy" decoding="async"></figure>`}
const BINARY_LAB_CHAPTERS=new Set([18,20,21,22,23]);
const BIN_BIT_VALUES=[128,64,32,16,8,4,2,1];
const binBits=(n,width=8)=>Math.max(0,Math.floor(Number(n)||0)).toString(2).padStart(width,'0');
const binDigits=(n,width=8)=>binBits(n,width).split('').map(Number);
const binWhole=(v,max=255)=>typeof v==='number'&&Number.isInteger(v)&&v>=0&&v<=max;
function binaryCalc(op,x,y){
  if(op==='+')return x+y;
  if(op==='<<')return x*2**y;
  if(op==='>>')return Math.floor(x/2**y);
  if(op==='&')return x&y;
  if(op==='|')return x|y;
  return x^y;
}
function binaryCalcError(op,x,y){
  if(!binWhole(x)||!binWhole(y)||((op==='<<'||op==='>>')&&y>7))return 'Use whole numbers from 0 to 255. A shift can move at most 7 places.';
  if(op==='<<'&&binaryCalc(op,x,y)>255)return 'That left shift would make '+binaryCalc(op,x,y)+', which is larger than one byte (255). Use a smaller number or fewer places.';
  return '';
}
function binaryLab(c){
  if(!BINARY_LAB_CHAPTERS.has(c))return '';
  const mode=c===21?'convert':(c===22||c===23)?'operators':'bits';
  const intro=mode==='convert'?'Try both directions. The place values show how the answer is built.'
    :mode==='operators'?'Change the numbers and operator. Compare each bit before and after the operation.'
    :'Turn switches on and off. Each switch adds its place value to the total.';
  let controls='',readout='';
  if(mode==='bits'){
    controls='<div class="binlab-controls"><span>Click a switch to turn it on or off.</span><button class="btn ghost sm" type="button" data-bin-clear>Clear</button></div>';
    readout='<div class="binlab-readout"><div><small>Decimal</small><b data-bin-dec-out>0</b></div><div dir="ltr"><small>Binary</small><b data-bin-bin-out>00000000</b></div></div><div class="binlab-switches" data-bin-switches dir="ltr"></div>';
  }else if(mode==='convert'){
    controls='<div class="binlab-controls"><label>Decimal<input type="number" min="0" max="255" step="1" inputmode="numeric" data-bin-dec value="13" aria-label="Decimal value" aria-describedby="binlabExplain"></label><label>Binary<input type="text" inputmode="numeric" pattern="[01]+" maxlength="8" value="1101" data-bin-bin aria-label="Binary value" aria-describedby="binlabExplain"></label><button class="btn ghost sm" type="button" data-bin-clear>Clear</button></div>';
    readout='<div class="binlab-readout"><div><small>Decimal</small><b data-bin-dec-out>13</b></div><div dir="ltr"><small>Binary</small><b data-bin-bin-out>1101</b></div></div><div class="binlab-grid-wrap" data-bin-grid></div>';
  }else{
    const op=c===23?(S.li===1?'|':S.li===2?'^':'&'):(S.li===1?'<<':S.li===2?'>>':'+');
    const options=c===23?[['&','AND'],['|','OR'],['^','XOR']]:[['+','Add'],['<<','Shift left'],['>>','Shift right']];
    controls='<div class="binlab-controls"><label>A<input type="number" min="0" max="255" step="1" inputmode="numeric" data-bin-a value="'+(c===23?5:3)+'" aria-label="First number" aria-describedby="binlabExplain"></label><select data-bin-op aria-label="Binary operation" aria-describedby="binlabExplain">'+options.map(([v,t])=>'<option value="'+v+'"'+(v===op?' selected':'')+'>'+t+'</option>').join('')+'</select><label>B<input type="number" min="0" max="255" step="1" inputmode="numeric" data-bin-b value="'+(c===23?3:1)+'" aria-label="Second number" aria-describedby="binlabExplain"></label></div>';
    readout='<div class="binlab-readout"><div><small>Result</small><b data-bin-result>0</b></div><div dir="ltr"><small>Binary</small><b data-bin-bin-out>00000000</b></div></div><div class="binlab-grid-wrap" data-bin-grid></div>';
  }
  return '<section class="binlab" data-bin-mode="'+mode+'" aria-labelledby="binlabTitle"><div class="binlab-head"><div><span class="binlab-k">Practice tool</span><h3 id="binlabTitle">Binary lab</h3><p>'+intro+'</p></div><button class="btn ghost sm" type="button" data-bin-example>Try an example</button></div>'+controls+readout+'<p class="binlab-explain" id="binlabExplain" data-bin-explain aria-live="polite"></p></section>';
}
function binaryGrid(rows,values){
  return '<div class="binlab-grid" dir="ltr" style="--bit-cols:'+values.length+'"><span class="binlab-corner"></span>'+values.map(v=>'<small>'+v+'</small>').join('')+rows.map(r=>'<b class="'+r.cls+'">'+r.label+'</b>'+r.bits.map(bit=>'<i class="'+(bit?'on':'')+'">'+bit+'</i>').join('')).join('')+'</div>';
}
function binaryValues(width){return Array.from({length:width},(_,i)=>2**(width-1-i))}
function binaryExplain(n,width=8){
  if(!n)return width===8?'All eight switches are off, so the value is 0.':'All '+width+' switches are off, so the value is 0.';
  const bits=binDigits(n,width),values=binaryValues(width),on=values.filter((_,i)=>bits[i]);
  return 'Place values build the number: '+on.join(' + ')+' = '+n+'. Binary writes an on switch as 1 and an off switch as 0.';
}
function binaryAdditionRows(x,y,width){
  const a=binDigits(x,width),b=binDigits(y,width),carry=Array(width).fill(0);let held=0;
  for(let i=width-1;i>=0;i--){carry[i]=held;held=Math.floor((a[i]+b[i]+held)/2)}
  const carryLabel=window.TLP_ARABIC?TLP_ARABIC.t('carry'):'carry';
  return [{label:'A',bits:a,cls:''},{label:'B',bits:b,cls:''},{label:carryLabel,bits:carry,cls:'carry'}];
}
function initBinaryLab(){
  if(binaryArabicHandler){window.removeEventListener('tlp-arabic-change',binaryArabicHandler);binaryArabicHandler=null;binaryArabicDraw=null}
  const root=$('#learn .binlab');if(!root)return;
  binaryArabicHandler=()=>{if(binaryArabicDraw)binaryArabicDraw()};window.addEventListener('tlp-arabic-change',binaryArabicHandler);
  const mode=root.dataset.binMode;
  const explain=root.querySelector('[data-bin-explain]');
  const decOut=root.querySelector('[data-bin-dec-out]');
  const binOut=root.querySelector('[data-bin-bin-out]');
  const grid=root.querySelector('[data-bin-grid]');
  const example=root.querySelector('[data-bin-example]');
  const clear=root.querySelector('[data-bin-clear]');
  const showError=(text)=>{root.classList.add('invalid');root.querySelectorAll('input,select').forEach(x=>x.setAttribute('aria-invalid','true'));if(explain)explain.textContent=text};
  const clearError=()=>{root.classList.remove('invalid');root.querySelectorAll('[aria-invalid]').forEach(x=>x.setAttribute('aria-invalid','false'))};
  const validNumber=(v,max=255)=>v!==''&&Number.isInteger(Number(v))&&Number(v)>=0&&Number(v)<=max;
  if(mode==='bits'){
    const holder=root.querySelector('[data-bin-switches]');
    let total=0;
    holder.innerHTML=BIN_BIT_VALUES.map(v=>'<button type="button" class="bin-bit" data-bit="'+v+'" aria-pressed="false" aria-label="Bit worth '+v+', off" aria-describedby="binlabExplain"><small>'+v+'</small><b>0</b></button>').join('');
    const draw=()=>{
      holder.querySelectorAll('[data-bit]').forEach(b=>{const value=Number(b.dataset.bit),on=total&value;b.classList.toggle('on',!!on);b.setAttribute('aria-pressed',on?'true':'false');b.querySelector('b').textContent=on?'1':'0';const label='Bit worth '+value+', '+(on?'on':'off');b.setAttribute('aria-label',window.TLP_ARABIC?TLP_ARABIC.t(label):label)});
      decOut.textContent=total;binOut.textContent=binBits(total);explain.textContent=binaryExplain(total);
    };
    holder.onclick=e=>{const b=e.target.closest('[data-bit]');if(!b)return;total^=Number(b.dataset.bit);draw()};
    if(clear)clear.onclick=()=>{total=0;draw()};
    if(example)example.onclick=()=>{total=5;draw()};
    binaryArabicDraw=draw;draw();
    return;
  }
  if(mode==='convert'){
    const dec=root.querySelector('[data-bin-dec]'),bin=root.querySelector('[data-bin-bin]');
    const draw=n=>{
      clearError();decOut.textContent=n;binOut.textContent=n.toString(2);
      const label=window.TLP_ARABIC?TLP_ARABIC.t('bits'):'bits';
      grid.innerHTML=binaryGrid([{label,bits:binDigits(n),cls:''}],binaryValues(8));explain.textContent=binaryExplain(n);
    };
    const fromDecimal=()=>{
      if(!validNumber(dec.value)){showError('Enter a whole number from 0 to 255.');return}
      const n=Number(dec.value);bin.value=n.toString(2);draw(n);
    };
    const fromBinary=()=>{
      const raw=bin.value.trim();
      if(!/^[01]+$/.test(raw)||parseInt(raw,2)>255){showError('Binary uses only 0 and 1, with a value no greater than 255.');return}
      const n=parseInt(raw,2);dec.value=String(n);draw(n);
    };
    dec.oninput=fromDecimal;bin.oninput=fromBinary;
    if(clear)clear.onclick=()=>{dec.value='0';bin.value='0';draw(0)};
    if(example)example.onclick=()=>{dec.value='13';bin.value='1101';draw(13)};
    binaryArabicDraw=()=>{if(validNumber(dec.value))draw(Number(dec.value))};draw(13);
    return;
  }
  const a=root.querySelector('[data-bin-a]'),b=root.querySelector('[data-bin-b]'),op=root.querySelector('[data-bin-op]');
  const result=root.querySelector('[data-bin-result]');
  const symbols={'+':'+','<<':'<<','>>':'>>','&':'&','|':'|','^':'^'};
  const draw=()=>{
    const x=Number(a.value),y=Number(b.value),shift=op.value==='<<'||op.value==='>>';b.max=shift?'7':'255';
    const error=binaryCalcError(op.value,x,y);if(error){showError(error);return}
    const n=binaryCalc(op.value,x,y);let text;
    if(op.value==='+')text='Add each column from the right. When a column totals 2, write 0 and carry 1 into the next column. If a carry makes the total 3, write 1 and carry 1 again: 1 + 1 + 1 = 11 in binary.';
    else if(op.value==='<<')text='Shifting left by '+y+' appends '+y+' '+(y===1?'zero':'zeros')+'. It multiplies '+x+' by '+2**y+', giving '+n+'.';
    else if(op.value==='>>')text='Shifting right by '+y+' drops the last '+y+' bit'+(y===1?'':'s')+'. It divides '+x+' by '+2**y+' and keeps only the whole part, giving '+n+'.';
    else if(op.value==='&')text='AND keeps a 1 only where both rows contain 1. Every other result bit is 0.';
    else if(op.value==='|')text='OR keeps a 1 wherever either row contains 1. A result bit is 0 only when both input bits are 0.';
    else text='XOR keeps a 1 only where the two rows differ. Matching bits become 0.';
    const width=Math.max(8,n.toString(2).length),label=key=>window.TLP_ARABIC?TLP_ARABIC.t(key):key;
    clearError();result.textContent=x+' '+label(symbols[op.value])+' '+y+' = '+n;binOut.textContent=n.toString(2);
    const rows=op.value==='+'?binaryAdditionRows(x,y,width):[{label:'A',bits:binDigits(x,width),cls:''}];
    if(op.value!=='+'&&op.value!=='<<'&&op.value!=='>>')rows.push({label:'B',bits:binDigits(y,width),cls:''});
    rows.push({label:'=',bits:binDigits(n,width),cls:'res'});
    grid.innerHTML=binaryGrid(rows,binaryValues(width));explain.textContent=text;
  };
  a.oninput=draw;b.oninput=draw;op.onchange=draw;
  if(example)example.onclick=()=>{const values={'+':[7,3],'<<':[64,1],'>>':[13,1],'&':[5,3],'|':[5,2],'^':[5,3]};[a.value,b.value]=values[op.value];draw()};
  binaryArabicDraw=draw;draw();
}
function lessonCard(L,c){const ex=(!L.boss&&window.TLP_EXPLAIN)?TLP_EXPLAIN.html(c):'';return `${S.li===0?sectionArt(c):''}<span class="hand">${CH[c].n} · ${CH[c].t}</span><span class="diff">${L.df}</span><h2>${L.t}</h2>${ex}<p>${L.learn}</p>${binaryLab(c)}<div class="mis"><b>Mission:</b> ${L.mis}</div><button class="btn ghost sm" id="nar">Narrate lesson</button><ul class="goals" id="goals"></ul>`}
function mountLesson(c){const f=$('#ex');if(f&&window.TLP_EXPLAIN)TLP_EXPLAIN.mount(f,c);initBinaryLab()}
function narrationLabel(){const b=$('#nar');if(!b)return;b.textContent=narrating?'Stop narration':'Narrate lesson';b.setAttribute('aria-pressed',narrating?'true':'false');b.classList.toggle('on',narrating)}
function stopNarration(){narrating=false;try{TLP.Voice.stop()}catch(e){}if(au){try{au.pause()}catch(e){}au=null}try{if(window.TLP_EXPLAIN)TLP_EXPLAIN.stop()}catch(e){}narrationLabel()}
function narrationText(){const L=lv(),k=key(S.ci,S.li);if(PATH==='g16'&&NARRATION[k])return window.TLP_ARABIC&&TLP_ARABIC.isActive()?(NARRATION_AR[k]||TLP_ARABIC.t(NARRATION[k])):NARRATION[k];return String(L.learn||'').replace(/<[^>]+>/g,' ')+' Your mission: '+String(L.mis||'').replace(/<[^>]+>/g,' ')}
function speakNarration(done){try{if(window.TLP&&TLP.Voice&&TLP.Voice.speak){TLP.Voice.speak(narrationText(),done);return}}catch(e){}done()}
function narrate(){
  if(narrating){stopNarration();return}

  const narBtn = $('#nar');
  if (narBtn) {
    pulse(narBtn, 1.1, 200);
    const rect = narBtn.getBoundingClientRect();
    burst(rect.left + rect.width/2, rect.top + rect.height/2, 8, ['var(--b)', 'var(--a)', '#ffd36a']);
  }


  const k=key(S.ci,S.li);
  const done=()=>{if(!narrating)return;narrating=false;au=null;narrationLabel()};
  if(PATH==='g16'&&NARRATION[k]){
   narrating=true;narrationLabel();speakNarration(done);return;
  }
  const ex=window.TLP_EXPLAIN&&TLP_EXPLAIN.mounted();
  if(ex){
   narrating=true;narrationLabel();
   TLP_EXPLAIN.narrate(()=>{if(!narrating)return;narrating=false;narrationLabel()});
   return;
  }
  narrating=true;narrationLabel();
  speakNarration(done);
}
$('#run').onclick=run;
$('#reset').onclick=()=>{const resetBtn=$('#reset');if(resetBtn){pulse(resetBtn,1.1,150);const rect=resetBtn.getBoundingClientRect();burst(rect.left+rect.width/2,rect.top+rect.height/2,8,['var(--a)','var(--b)'])}reset()};
$('#adminPrev').onclick=openAdminPreview;
$('#bugOpen').onclick=()=>TLP.openBugReport('Game');
$('#exit').onclick=()=>{S.run=false;menu()};
$('#friendsBtn').onclick=()=>{location.href='friends.html'};
$('#menuToggle').onclick=toggleMenu;
$('#topMenuToggle').onclick=toggleMenu;
$('#hint').onclick=()=>{if(hardMode()){msg('Hardcore mode has no hints. Trust your own logic.','bad');return}const h=lv().hints,mx=Math.max(1,Math.min(DIFF==='pro'?1:h.length,{g16:99,g710:99,g1112:2,adult:1}[PATH]||99,h.length));if(S.hint<mx){S.hint++;const hintBtn = $('#hint');if(hintBtn){pulse(hintBtn,1.1,200);const rect=hintBtn.getBoundingClientRect();burst(rect.left+rect.width/2,rect.top+rect.height/2,10,['var(--b)','var(--a)','#ffd36a']);ringBurst(rect.left+rect.width/2,rect.top+rect.height/2,'var(--b)',2)}msg(`<b>Hint ${S.hint}/${mx}:</b> ${h[S.hint-1]}`,'hint')}};
$('#chs').onclick=e=>{const b=e.target.closest('.lb');if(b&&!b.disabled){if(b){pulse(b,1.1,150);const rect=b.getBoundingClientRect();burst(rect.left+rect.width/2,rect.top+rect.height/2,10,['var(--a)','var(--b)','var(--ok)'])}play(+b.dataset.c,+b.dataset.l)}};
$('#name').oninput=e=>{S.name=e.target.value.trim()||'Player';save();hud()};
const any=(a,f)=>a.some(b=>f(b)||any(kids(b),f));
const LEARN=(window.TLP_STORY&&TLP_STORY.learnAll())||[];
const learnedHTML=c=>`<div class="learned"><b>What you learned in ${CH[c].t.replace('Boss: ','')}</b><ul>${LEARN[c].map(x=>'<li>'+x+'</li>').join('')}</ul><button class="btn ghost sm" id="lis">Listen again</button></div>`;
function stopSay(){narrating=false;try{TLP.Voice.stop()}catch(e){}if(au){try{au.pause()}catch(e){}au=null}narrationLabel()}
function sayLearned(c){stopSay();try{if(NARRATION['ch'+c]){au=new Audio(NARRATION['ch'+c]);au.play().catch(()=>{});return}
 TLP.Voice.speak('Congratulations '+S.name+'! You finished '+CH[c].n+', '+CH[c].t.replace('Boss: ','')+'. Here is what you learned. '+LEARN[c].join(' '))}catch(e){}}
function confetti(){if(matchMedia('(prefers-reduced-motion:reduce)').matches||still)return;for(let i=0;i<140;i++){const e=document.createElement('span');e.className='spark';e.style.cssText=`left:${Math.random()*innerWidth}px;top:-14px;width:${6+Math.random()*7}px;height:${10+Math.random()*8}px;background:hsl(${Math.random()*360} 85% 62%)`;document.body.appendChild(e);e.animate([{transform:'translate(0,0) rotate(0)'},{transform:`translate(${(Math.random()-.5)*240}px,${innerHeight+40}px) rotate(${Math.random()*900}deg)`}],{duration:2200+Math.random()*2200,delay:Math.random()*900,easing:'cubic-bezier(.2,.6,.4,1)',fill:'backwards'}).onfinish=()=>e.remove()}}
function confettiBurst(x, y, count = 100) {
  if (still || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  for (let i = 0; i < count; i++) {
    const e = document.createElement('span');
    e.className = 'spark';
    const hue = Math.random() * 360;
    e.style.cssText = `left:${x}px;top:${y}px;width:${4 + Math.random() * 8}px;height:${6 + Math.random() * 10}px;background:hsl(${hue} 85% 60%);transform:rotate(${Math.random()*360}deg)`;
    document.body.appendChild(e);
    const dx = (Math.random() - 0.5) * 400;
    const dy = innerHeight - y + 50 + Math.random() * 200;
    e.animate([
      { transform: `translate(0,0) rotate(${Math.random()*360}deg) scale(1)`, opacity: 1 },
      { transform: `translate(${dx}px,${dy}px) rotate(${Math.random()*1080}deg) scale(0.2)`, opacity: 0 }
    ], { duration: 1800 + Math.random() * 1500, delay: Math.random() * 600, easing: 'cubic-bezier(0.2,0.6,0.4,1)' }).onfinish = () => e.remove();
  }
}
function starBurst(x, y, count = 20) {
  if (still || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const stars = ['★', '✦', '✧', '✨', '⭐'];
  for (let i = 0; i < count; i++) {
    const e = document.createElement('span');
    e.className = 'spark';
    e.textContent = stars[i % stars.length];
    e.style.cssText = `left:${x}px;top:${y}px;font-size:${16 + Math.random() * 12}px;color:hsl(${Math.random()*60 + 40} 90% 60%);text-shadow:0 0 8px currentColor`;
    document.body.appendChild(e);
    const a = Math.random() * 6.28;
    const d = 80 + Math.random() * 150;
    e.animate([
      { transform: `translate(0,0) rotate(${Math.random()*360}deg) scale(0.5)`, opacity: 0 },
      { transform: `translate(${Math.cos(a)*d*0.3}px,${Math.sin(a)*d*0.3 - 50}px) rotate(${Math.random()*360}deg) scale(1.2)`, opacity: 1, offset: 0.3 },
      { transform: `translate(${Math.cos(a)*d}px,${Math.sin(a)*d + 30}px) rotate(${Math.random()*720}deg) scale(0.3)`, opacity: 0 }
    ], { duration: 1200 + Math.random() * 800, easing: 'cubic-bezier(0.2,0.8,0.4,1)' }).onfinish = () => e.remove();
  }
}
function burst(x, y, count = 50, colors = ['var(--a)', 'var(--b)', 'var(--ok)', '#ffd36a', '#7ad9ff']) {
  if (still || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    s.className = 'spark';
    const color = colors[i % colors.length];
    s.style.cssText = `left:${x}px;top:${y}px;width:${4 + Math.random() * 6}px;height:${4 + Math.random() * 6}px;background:${color}`;
    document.body.appendChild(s);
    const a = Math.random() * 6.28;
    const d = 60 + Math.random() * 200;
    s.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${Math.cos(a)*d}px,${Math.sin(a)*d}px) rotate(${Math.random()*720}deg) scale(0.3)`, opacity: 0 }
    ], { duration: 800 + Math.random() * 600, easing: 'cubic-bezier(0.2,0.6,0.4,1)' }).onfinish = () => s.remove();
  }
}
function ringBurst(x, y, color = 'var(--a)', rings = 3) {
  if (still || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  for (let r = 0; r < rings; r++) {
    const s = document.createElement('span');
    s.className = 'spark';
    s.style.cssText = `left:${x}px;top:${y}px;width:20px;height:20px;border:3px solid ${color};border-radius:50%;background:transparent`;
    document.body.appendChild(s);
    s.animate([
      { transform: 'scale(0.1)', opacity: 1, borderWidth: '4px' },
      { transform: 'scale(3)', opacity: 0, borderWidth: '0px' }
    ], { duration: 600 + r * 150, delay: r * 100, easing: 'ease-out' }).onfinish = () => s.remove();
  }
}
function screenFlash() {                                                         }
function shake(element, intensity = 10, duration = 400) {
  if (still || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const keyframes = [
    { transform: 'translateX(0)' },
    { transform: `translateX(-${intensity}px)` },
    { transform: `translateX(${intensity}px)` },
    { transform: `translateX(-${intensity*0.5}px)` },
    { transform: `translateX(${intensity*0.5}px)` },
    { transform: 'translateX(0)' }
  ];
  element.animate(keyframes, { duration, easing: 'ease-out' });
}
function pulse(element, scale = 1.15, duration = 300) {
  if (still || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  element.animate([
    { transform: 'scale(1)' },
    { transform: `scale(${scale})` },
    { transform: 'scale(1)' }
  ], { duration, easing: 'cubic-bezier(0.2,1.2,0.4,1)' });
}
function floatUp(element, distance = -80, duration = 1000) {
  if (still || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  element.animate([
    { transform: 'translateY(0)', opacity: 1 },
    { transform: `translateY(${distance}px)`, opacity: 0 }
  ], { duration, easing: 'cubic-bezier(0.2,0.6,0.4,1)' });
}







let B={r:0,hp:100,me:3,mem:[]};
const BR=[
 {t:'The Glitch · Round 1: Variable strike',learn:'The Glitch is a bug that eats code. It has <b>100 HP</b> and you have a limited number of <b>hearts</b>. Every attack that lands takes 25 HP, but The Glitch <b>memorises it</b>. Repeat an attack and it blocks you and hits back, costing a heart. Round 1: it is at cell 6. Strike with a <b>variable</b>.',mis:'Reach The Glitch at cell 6 by storing the distance in a box and moving by the box.',cases:[{vars:{},goal:6}],par:2,rule:{txt:'set or change a box, then move by that box.',f:s=>(has(s,'set')||has(s,'change'))&&any(s,b=>b.t==='move'&&b.src!=='#')},hints:['You need 6 steps. Where could the 6 live?','Put 6 in a box, then move by the box.','Set steps to 6, then move by steps.']},
 {t:'The Glitch · Round 2: Loop strike',learn:'<b>Round 2.</b> The Glitch remembers your first attack, so you cannot reuse it. It is still at cell 6. Strike again, this time with a <b>loop</b>.',mis:'Reach cell 6 using a repeat block. Check the memory list so you do not repeat an old attack.',cases:[{vars:{},goal:6}],par:2,rule:{txt:'use a repeat block.',f:s=>has(s,'rep')},hints:['Break 6 into equal steps.','Put a move inside a repeat.','Repeat 3: move 2.']},
 {t:'The Glitch · Round 3: Logic strike',learn:'<b>Round 3.</b> The Glitch changes position depending on its power, so your attack is tested twice. Use <b>if and else</b>.',mis:'If power is more than 4 it hides at cell 6, otherwise it is at cell 3. One script must hit both.',cases:[{vars:{power:2},goal:3},{vars:{power:8},goal:6}],par:3,rule:{txt:'use an if / else block.',f:s=>has(s,'if')},hints:['Imagine power 2, then power 8.','Ask a question about power and give each answer its own move.','If power is more than 4: move 6, else move 3.']},
 {t:'The Glitch · Round 4: Finishing blow',learn:'<b>Round 4: the final blow.</b> Combine <b>everything</b>: a variable, a loop and a decision, in one attack the Glitch has never seen.',mis:'Three laps. Each lap add 1 to count, then walk 1 cell if power is under 5, or 2 cells if it is 5 or more. Finish by saying count.',cases:[{vars:{power:1},goal:3,say:'3'},{vars:{power:9},goal:6,say:'3'}],par:6,rule:{txt:'use a variable, a repeat and an if together.',f:s=>has(s,'rep')&&has(s,'if')&&(has(s,'set')||has(s,'change'))},hints:['Three laps means a repeat of 3.','Inside the loop: change count, then an if that picks the step size.','Repeat 3: change count by 1, if power is more than 4: move 2, else move 1. Then say count.']}];

const PATHS={
 hook:{cols:5,rows:3,c:[[0,0],[1,0],[2,0],[3,0],[4,0],[4,1],[4,2],[3,2],[2,2]]},
 snake:{cols:5,rows:3,c:[[0,0],[1,0],[2,0],[3,0],[4,0],[4,1],[3,1],[2,1],[1,1]]},
 s:{cols:5,rows:3,c:[[0,0],[1,0],[2,0],[2,1],[2,2],[3,2],[4,2],[4,1],[4,0]]},
 maze:{cols:5,rows:3,c:[[0,1],[0,0],[1,0],[2,0],[2,1],[2,2],[3,2],[4,2],[4,1]]},
 stairs:{cols:5,rows:4,c:[[0,3],[1,3],[1,2],[2,2],[2,1],[3,1],[3,0],[4,0],[4,1]]}};
[[null,null,null,'hook','snake','s'],['snake','hook','s','maze','stairs','maze'],['stairs','s','maze','hook','snake']].forEach((r,ci)=>r.forEach((p,li)=>{if(p)CH[ci].L[li].path=p}));
['maze','stairs','s','snake'].forEach((p,i)=>BR[i].path=p);
let mazeP=null;
function layout(){const T=track,P=PATHS[lv().path];mazeP=P||null;T.classList.toggle('maze',!!P);$$('.wall').forEach(w=>w.remove());if(!P)return;
 T.style.setProperty('--cols',P.cols);T.style.setProperty('--rows',P.rows);
 P.c.forEach((c,i)=>{T.children[i].style.setProperty('--x',c[0]);T.children[i].style.setProperty('--y',c[1])});
 for(let y=0;y<P.rows;y++)for(let x=0;x<P.cols;x++)if(!P.c.some(c=>c[0]===x&&c[1]===y)){const w=document.createElement('b');w.className='wall';w.style.cssText='--x:'+x+';--y:'+y;T.appendChild(w)}}
function tp(k,v){track.style.setProperty(k,v);if(!mazeP)return;const c=v<0?[-9,-9]:mazeP.c[Math.min(8,v)];
  if(k==='--p'){const o=+track.style.getPropertyValue('--px');if(v===0)bot.style.setProperty('--f',1);else if(c[0]<o)bot.style.setProperty('--f',-1);else if(c[0]>o)bot.style.setProperty('--f',1);track.style.setProperty('--px',c[0]);track.style.setProperty('--py',c[1]);

    if (v >= 0 && v <= 8) {
      const cell = track.children[v];
      if (cell) {
        cell.classList.add('vis');
        pulse(cell, 1.2, 200);
        ringBurst(cell.getBoundingClientRect().left + cell.offsetWidth/2, cell.getBoundingClientRect().top + cell.offsetHeight/2, 'var(--a)', 2);
      }
    }
  }
  else{track.style.setProperty('--gx',c[0]);track.style.setProperty('--gy',c[1])}}
function whyList(){const seen={},rows=[];(function w(a){a.forEach(b=>{if(!seen[b.t]){seen[b.t]=1;rows.push(`<li><b>${one(b)}</b>: ${WHY[b.t]}</li>`)}w(kids(b))})})(S.script);return '<ul class="why">'+rows.join('')+'</ul>'}
function whyHTML(){const L=lv();return `<div class="learned"><b>What each block did in your code</b>${whyList()}${L.boss?'':'<p style="margin:8px 0 0;font-size:14px"><b style="color:var(--fg)">The idea:</b> '+L.learn+'</p>'}</div>`}
let bossWait=false,introPending=false,tauntT='',tauntX=0,mute=false,AC=null;
try{mute=localStorage.getItem('tlp-mute')==='1'}catch(e){}
const TAUNTS=['Boxes? I eat boxes for breakfast.','Loops. I have seen them all.','Decisions, decisions...','This ends here, little robot.'];
function showToast(t,cls,label,cb){const T=$('#toast');T.className=cls||'';T.innerHTML='<div>'+t+'</div><button class="btn sm" id="tx">'+(label||'Dismiss')+'</button>';T.hidden=false;$('#tx').onclick=()=>{T.hidden=true;if(cb)cb()}}
function hideToast(){$('#toast').hidden=true}
function msg(t,c=''){if(c==='hint'||c==='bad'||/^<b>(Correct|Direct)/.test(t)){showToast(t,c||'ok');return}hideToast();const m=$('#msg');m.className=c;m.innerHTML=t}
function fly(a,b,col,ms){if(still)return Promise.resolve();return new Promise(r=>{try{const A=a.getBoundingClientRect(),Z=b.getBoundingClientRect(),o=document.createElement('i'),ax=A.left+A.width/2,ay=A.top+A.height/2;o.className='orb';o.style.cssText=`left:${ax-9}px;top:${ay-9}px;background:${col};box-shadow:0 0 14px ${col},0 0 30px ${col}`;document.body.appendChild(o);o.animate([{transform:'translate(0,0) scale(.7)'},{transform:`translate(${Z.left+Z.width/2-ax}px,${Z.top+Z.height/2-ay}px) scale(1.6)`}],{duration:ms||480,easing:'ease-in'}).onfinish=()=>{o.remove();r()}}catch(e){r()}})}
function dmg(t,el){const R=el.getBoundingClientRect(),d=document.createElement('b');d.className='dmg';d.textContent=t;d.style.cssText=`left:${R.left+R.width/2}px;top:${R.top}px`;document.body.appendChild(d);if(still){setTimeout(()=>d.remove(),900);return}d.animate([{transform:'translate(-50%,0)',opacity:1},{transform:'translate(-50%,-50px)',opacity:0}],{duration:900}).onfinish=()=>d.remove()}
function vig(){                                                             }
function taunt(t){tauntT=t;const e=$('#tnt');if(e)e.textContent=t;clearTimeout(tauntX);tauntX=setTimeout(()=>{tauntT='';const e=$('#tnt');if(e)e.textContent=''},4200)}
const bossBot=(cls,st,id)=>`<div${id?` id="${id}"`:''} class="bb ${cls||''}"${st?` style="${st}"`:''}><i class="ant"></i><i class="ant r"></i><div class="bh2"><i class="eye"></i><i class="eye"></i><i class="mouth"></i></div></div>`;
const hearts=(n,brk)=>Array.from({length:B.max||3},(_,i)=>i).map(i=>`<span class="h ${i<n?'':(i===n&&brk?'brk':'empty')}"><i>♥</i><i>♥</i></span>`).join('');
function hudFit(){const b=$('#boss'),h=(b.hidden||$('#game').hidden)?0:b.offsetHeight;document.body.style.paddingTop=h?h+'px':'';document.documentElement.style.setProperty('--hudh',h+'px')}
addEventListener('resize',hudFit);
function cine(html,cls){uncine();const c=document.createElement('div');c.id='cine';c.className=cls||'';c.innerHTML=html;document.body.appendChild(c);return c}
function uncine(){const c=$('#cine');if(c)c.remove()}
function bossRepeat(){const old=B.mem.find(m=>m.g===sig(S.script));if(!old)return false;bossWait=true;B.me--;B.lost=(B.lost||0)+1;bossAttack(old);return true}
async function bossAttack(old){try{
  taunt(['I remember this one!','Same trick again? Predictable.','You already showed me that.'][Math.floor(Math.random()*3)]);bossDraw(false,true);
  const bb=$('#bb');bb.classList.add('atk');snd('zap');

  const bbRect = bb.getBoundingClientRect();
  ringBurst(bbRect.left + bbRect.width/2, bbRect.top + bbRect.height/2, '#ff4d6a', 4);
  burst(bbRect.left + bbRect.width/2, bbRect.top + bbRect.height/2, 25, ['#ff4d6a', '#ff6b7f', '#ffd36a']);
  screenFlash('#ff4d6a', 200);
  await fly(bb,$('#hearts'),'#ff4d6a',520);
  snd('crack');vig();bossDraw(true);bot.classList.add('oops');const z=$('#boss');z.classList.remove('zap');void z.offsetWidth;z.classList.add('zap');

  const hearts = $('#hearts').querySelectorAll('.h');
  if (hearts[B.me]) {
    hearts[B.me].classList.add('brk');
    shake(hearts[B.me], 10, 400);
  }
  await sleep(900);
  if(B.me<=0){defeatScene();return}
  msg(`<b>The Glitch remembers!</b> You already used this exact attack in Round ${old.r}. It blocked you and hit back: −1 heart (${B.me} left). Build a brand-new attack.`,'bad')}finally{bossWait=false}}








const SEC=[
 {t:'The Basics',d:'How programs think: steps, boxes, repeats and decisions.',ch:[4,0,1,2],boss:3},
 {t:'Data',d:'What information is, and how to handle it safely.',ch:[5,6,7,8],boss:9},
 {t:'Tools',d:'Do more with less code: maths, lists, input and notes.',ch:[10,11,12,13],boss:14},
 {t:'Structure',d:'Build bigger programs from small reusable parts.',ch:[15,16,17,18],boss:19},
 {t:'Bits and Bytes',d:'Go deep on the switches inside every computer.',ch:[20,21,22,23],boss:24},
 {t:'Mastery',d:'Optional bonus: debug, search and optimise like a real programmer.',ch:[25,26,27,28],boss:29,bonus:true}];
const BC=['#ef7a8c','#e8a23a','#9b5cf0','#35c9e8','#3ddc84','#f2c94c'];
const L1=(t,df,learn,mis,o)=>Object.assign({t,df,learn,mis,vars:{},allow:[],par:2,hints:[]},o);
CH.push(
{n:'',t:'Programming',d:'A program is a list of instructions run in order.',L:[
 L1('Step by step','Easy','A <b>program</b> is a list of instructions. The computer follows them one at a time, from the top to the bottom.','Walk 2 cells, then make the robot say hello.',{vars:{word:'hello'},allow:['move','say'],goal:2,say:'hello',par:2,hints:['Two instructions: one walks, one speaks.','Use move for walking and say for the word.','Move 2, then say word.']}),

 L1('Order matters','Easy','Changing the <b>order</b> changes the result. A box must be filled <i>before</i> you read it.','Broadcast unit ID R-067 as a status message, then walk 3 cells.',{vars:{word:'',steps:0},allow:['set','say','move'],goal:3,say:'R-067',par:4,path:'hook',hints:['If you output the box while it is empty, nothing comes out.','Fill word first with R-067, then broadcast it.','Set word to R-067, say word, set steps to 3, move steps.']})]},
{n:'',t:'Constants',d:'Boxes that are locked and never change.',L:[
 L1('A locked box','Easy','A <b>constant</b> is a box whose value is fixed. Once it is set, nothing can change it. A lock <i class=ic-lock></i> appears on it.','lap is a constant holding 2. Reach the chip at cell 4 using lap. Do not try to change it.',{vars:{lap:2},consts:['lap'],allow:['change','move','rep'],goal:4,par:2,path:'snake',hints:['You may only read a constant, never change it.','Moving by lap twice gives 4.','Repeat 2 times: move lap. Or move lap twice.']}),
 L1('Safe settings','Medium','Constants protect important settings, like speed or gravity, so no other part of the program can break them.','speed is a constant holding 3. Reach cell 9? The track ends at 8, so reach the chip at cell 6 using speed.',{vars:{speed:3},consts:['speed'],allow:['change','move','rep'],goal:6,par:2,path:'s',hints:['6 is two lots of speed.','A repeat block saves typing.','Repeat 2: move speed.']})]},
{n:'',t:'Data Types',d:'Numbers, words and why they are different.',L:[
 L1('Numbers and words','Easy','Every value has a <b>type</b>. A number like 4 can be used for maths and moving. A word like "four" is text. Moving needs a number.','count is a number and label is a word. Reach cell 4, then say the word.',{strict:true,vars:{count:4,label:'four'},allow:['move','say'],goal:4,say:'four',par:2,path:'maze',hints:['One box is a number and one is a word.','Move needs the number box. Say can speak the word box.','Move count, then say label.']}),
 L1('Pick the right box','Medium','Choosing the wrong type causes an error. A good programmer checks what type a box holds before using it.','Move with the numbers, then say the word two.',{strict:true,vars:{a:2,b:'two',c:5},allow:['move','say'],goal:7,say:'two',par:3,path:'stairs',hints:['Which boxes hold numbers?','2 + 5 = 7.','Move a, move c, say b.']})]},
{n:'',t:'Type Casting',d:'Turning one type into another.',L:[
 L1('Word to number','Easy','<b>Type casting</b> converts a value from one type to another. The word "3" looks like a number but is still text until you convert it.','s holds the word "3". Turn it into a number and reach cell 3.',{strict:true,vars:{s:'3'},allow:['cast','move'],goal:3,par:2,path:'hook',hints:['Moving with a word causes an error.','Convert s to a number first.','Turn s into number, then move s.']}),
 L1('Two words','Medium','You can cast several boxes. Convert each one before you use it for maths or movement.','a holds "2" and b holds "4", both words. Reach cell 6.',{strict:true,vars:{a:'2',b:'4'},allow:['cast','move'],goal:6,par:4,path:'snake',hints:['Both boxes are words.','Convert each one separately.','Turn a into number, turn b into number, move a, move b.']})]},
{n:'',t:'Strings',d:'Working with pieces of text.',L:[

 L1('Glue words together','Easy','A <b>string</b> is text. <b>Joining</b> strings glues them end to end. Joining "UNIT", a space, and "R-067" gives "UNIT R-067".','Combine the stored pieces into a system broadcast: UNIT R-067 (with the space).',{vars:{a:'UNIT',sp:' ',b:'R-067',out:''},allow:['join','say'],say:'UNIT R-067',par:3,path:'s',hints:['You need three pieces: a, the space, and b.','Join in two steps, storing into out.','Join a and sp into out, join out and b into out, say out.']}),
 L1('Repeat a word','Medium','Loops and strings work well together. Joining inside a loop builds longer text one piece at a time.','Make the robot say hahaha.',{vars:{s:'ha',out:''},allow:['join','rep','say'],say:'hahaha',par:3,path:'maze',hints:['hahaha is ha three times.','Join out and s into out, three times.','Repeat 3: join out and s into out. Then say out.']})]},
{n:'',t:'The Hoarder',d:'The first guardian of Data. It hoards everything you do.',L:[{t:'The Hoarder',df:'Boss',learn:'',mis:'',vars:{},allow:['set','change','move','say','rep','if','cast','join'],boss:1,par:99,hints:[]}]},
{n:'',t:'Operators',d:'Maths and comparisons inside your code.',L:[
 L1('Do the maths','Easy','<b>Operators</b> like + − × ÷ calculate new values. <code>r = a × 2</code> doubles a.','a holds 3. Double it into r and reach cell 6.',{vars:{a:3,r:0},allow:['calc','move'],goal:6,par:2,path:'stairs',hints:['6 is 3 times 2.','Use calculate: r = a × 2.','Calculate r from a times 2, then move r.']}),
 L1('The remainder','Medium','The <b>remainder</b> operator gives what is left after dividing. 8 divided by 3 leaves 2.','a holds 8. Use the remainder of dividing by 3 and reach cell 2.',{vars:{a:8,r:0},allow:['calc','move'],goal:2,par:2,path:'maze',hints:['8 = 3 + 3 + 2.','Pick the remainder operator.','Calculate r = a remainder 3, then move r.']})]},
{n:'',t:'Arrays',d:'One box that holds a whole list.',L:[
 L1('A numbered list','Easy','An <b>array</b> is a list in one box. Items are numbered from 1. <code>item 2 of list</code> gets the second one.','list holds 4, 2, 1. Take the second item and reach cell 2.',{vars:{list:[4,2,1],x:0},allow:['pick','move'],goal:2,par:2,path:'hook',hints:['The list has three numbers.','Item 2 is the middle one.','Set x to item 2 of list, then move x.']}),
 L1('Walk the list','Hard','A loop with a counter can visit every item of an array one by one. This is how programs process lists.','list holds 3, 1, 2. Walk each item in turn and reach cell 6.',{vars:{list:[3,1,2],i:0,x:0},allow:['pick','change','rep','move'],goal:6,par:4,path:'snake',hints:['Three items means three laps.','i counts the lap number: use it as the item number.','Repeat 3: change i by 1, set x to item i of list, move x.']})]},
{n:'',t:'Input and Output',d:'Listening to the user and answering back.',L:[
 L1('Ask, then act','Easy','<b>Input</b> is information that comes into a program, like a number the user types. <b>Output</b> is what the program shows or says.','The player types a number. Walk exactly that far.',{vars:{n:0},allow:['ask','move'],cases:[{vars:{},input:2,goal:2},{vars:{},input:5,goal:5}],par:2,path:'s',hints:['The number changes every test.','Ask stores what was typed in a box.','Ask into n, then move n.']}),
 L1('Echo','Easy','Input and output together make a conversation. Read the input, then speak it back.','The player types a name. Make the robot say it back.',{vars:{name:''},allow:['ask','say'],cases:[{vars:{},input:'Ada',say:'Ada'},{vars:{},input:'Bo',say:'Bo'}],par:2,path:'maze',hints:['Store the input in a box first.','Then say that box.','Ask into name, then say name.']})]},
{n:'',t:'Comments',d:'Notes for humans that the computer ignores.',L:[
 L1('Notes for humans','Easy','A <b>comment</b> is a note in your code. The computer ignores it, but people reading your code understand it faster.','steps holds 3. Reach cell 3 and leave a note explaining what you did.',{vars:{steps:3},allow:['note','move'],goal:3,par:2,path:'stairs',rule:{txt:'add a note block with some text.',f:s=>any(s,b=>b.t==='note'&&b.val.trim().length>2)},hints:['The note does not change what the robot does.','Add a move and also a note.','Move steps, and write a note such as: walk to the chip.']}),
 L1('Explain your loop','Medium','Good comments say <i>why</i>, not just what. Put a note near tricky code like a loop.','Reach cell 6 with a loop and add a note that explains it.',{vars:{},allow:['note','rep','move'],goal:6,par:3,path:'hook',rule:{txt:'use a repeat block and add a note with text.',f:s=>has(s,'rep')&&any(s,b=>b.t==='note'&&b.val.trim().length>2)},hints:['6 is three lots of 2.','Repeat 3: move 2.','Add a note too, like: repeat to walk 6 cells.']})]},
{n:'',t:'The Cipher',d:'The second guardian waits at the end of the Tools section.',L:[{t:'The Cipher',df:'Boss',learn:'',mis:'',vars:{},allow:['set','change','move','say','rep','if','calc','pick','ask','note'],boss:1,par:99,hints:[]}]},
{n:'',t:'Functions',d:'Name a recipe once and reuse it.',L:[
 L1('Name a recipe','Medium','A <b>function</b> is a named group of blocks. Define it once, then <b>call</b> it whenever you need it.','Define hop as moving 2 cells. Call hop three times to reach cell 6.',{fns:['hop'],allow:['def','call','rep','move'],goal:6,par:4,path:'s',hints:['Define first, call afterwards.','Hop does one thing: move 2.','Define hop with move 2 inside. Then repeat 3: call hop.']}),
 L1('Reuse it','Hard','A function can read the boxes around it, so the same recipe gives different results when the boxes change.','Define hop to move by steps. Call it with steps 3, then with steps 4 to reach cell 7.',{vars:{steps:0},fns:['hop'],allow:['def','call','set','change','move'],goal:7,par:6,path:'stairs',hints:['Hop moves by whatever steps holds.','Change steps between the two calls.','Define hop (move steps). Set steps 3, call hop, change steps by 1, call hop.']})]},
{n:'',t:'Scope',d:'Where a box lives and who can see it.',L:[
 L1('Local boxes','Hard','<b>Scope</b> is where a variable exists. A change made inside a function stays inside it. Outside, the original box is untouched.','steps holds 2. The function boost sets steps to 5 and moves. Then move steps outside. Reach cell 7.',{vars:{steps:2},fns:['boost'],allow:['def','call','set','move'],goal:7,par:5,path:'maze',hints:['Boost works on its own copy of steps.','Outside, steps is still 2.','Define boost: set steps 5, move steps. Call boost. Move steps.']}),
 L1('Global stays global','Hard','The box outside the function is <b>global</b>. A function cannot change it by accident, which keeps programs safe.','steps holds 1. Define and call boost (it sets steps to 4), then reach cell 5 with a loop using steps.',{vars:{steps:1},fns:['boost'],allow:['def','call','set','rep','move'],goal:5,par:5,path:'snake',rule:{txt:'define and call a function.',f:s=>has(s,'def')&&has(s,'call')},hints:['After boost, steps outside is still 1.','5 laps of 1 reach the chip.','Define boost (set steps 4). Call boost. Repeat 5: move steps.']})]},
{n:'',t:'Recursion',d:'A function that calls itself.',L:[
 L1('Calling yourself','Hard','<b>Recursion</b> means a function calls itself. It needs a <b>base case</b>, a rule that tells it when to stop, or it would never end.','n holds 3. Define walk: if n is more than 0, move 1, lower n by 1 and call walk again. Reach cell 3.',{vars:{n:3},fns:['walk'],allow:['def','call','if','move','change'],goal:3,par:6,path:'s',rule:{txt:'call the function from inside itself.',f:s=>any(s,b=>b.t==='def'&&has(b.c,'call'))},hints:['The if block is the stopping rule.','Inside walk: move 1, change n by -1, call walk.','Define walk: if n > 0 [move 1, change n by -1, call walk]. Then call walk.']}),
 L1('Bigger steps','Hard','The same recursive function works for different starting values. The base case keeps it safe every time.','Same idea, but each call moves 2. Pass two tests: n is 2, then n is 3.',{vars:{n:0},fns:['walk'],allow:['def','call','if','move','change'],cases:[{vars:{n:2},goal:4},{vars:{n:3},goal:6}],par:6,path:'hook',rule:{txt:'call the function from inside itself.',f:s=>any(s,b=>b.t==='def'&&has(b.c,'call'))},hints:['Same shape as before.','Move 2 instead of 1.','Define walk: if n > 0 [move 2, change n by -1, call walk]. Then call walk.']})]},
{n:'',t:'Bits and Binary',d:'How computers store numbers with on/off switches.',L:[
 L1('Bits are switches','Medium','A <b>bit</b> is an on/off switch. Each bit has a value: 1, 2, 4, 8... Add up the switches that are on. 8 bits make one <b>byte</b>.','Make the number 5 by switching on the right bits, then walk that far.',{vars:{total:0,bin:'0'},allow:['bit','move'],goal:5,par:3,path:'stairs',hints:['5 = 4 + 1.','Switch on bit 4 and bit 1.','Switch on bit 4, switch on bit 1, move total.']}),
 L1('Read it in binary','Hard','<b>Binary</b> writes a number using only 0 and 1, one digit per bit. 6 is 110: a 4, a 2, and no 1.','Make 6 with bits, walk to it and say its binary form from the bin box.',{vars:{total:0,bin:'0'},allow:['bit','move','say'],goal:6,say:'110',par:4,path:'maze',hints:['6 = 4 + 2.','bin always shows the binary form.','Bit 4, bit 2, move total, say bin.']})]},
{n:'',t:'The Echo',d:'The final guardian. It repeats everything.',L:[{t:'The Echo',df:'Boss',learn:'',mis:'',vars:{},allow:['set','change','move','say','rep','if','def','call','bit'],boss:1,par:99,hints:[]}]}
);
CH.push(
{n:'',t:'Bits and Bytes',d:'The on/off switches inside every computer.',L:[
 L1('A full row','Easy','A <b>bit</b> stores either 0 or 1. In an 8-bit <b>byte</b>, the places from right to left are worth 1, 2, 4, 8, 16, 32, 64 and 128. Add the values where the bit is 1. All eight off makes 0; all eight on makes 255.','Switch on the bits worth 1, 2, 4 and 8, then say the total.',{vars:{total:0,bin:'0'},allow:['bit','say'],cases:[{vars:{},say:'15'}],par:5,hints:['Read the place values from right to left: 1, 2, 4, 8.','15 needs all four of those switches: 8 + 4 + 2 + 1.','Bit 1, bit 2, bit 4, bit 8, then say total.']}),
 L1('The big switch','Medium','Each place is worth twice the place to its right. The largest bit in a byte is 128. The number 130 is 128 + 2, so its binary form is <code>10000010</code>: only two switches need to be on.','Make 130 with as few bit switches as you can, then say the total.',{vars:{total:0,bin:'0'},allow:['bit','say'],cases:[{vars:{},say:'130'}],par:3,hints:['Start with the largest place that fits: 128.','130 - 128 = 2, so one more switch is enough.','Bit 128, bit 2, say total.']}),
 L1('Spot the pattern','Medium','Binary writes an on switch as 1 and an off switch as 0. Read the digits from right to left using their place values. <code>00000101</code> means 4 + 1 = 5. Leading zeros do not change the value.','Make 5 with bits and say its binary form from the bin box.',{vars:{total:0,bin:'0'},allow:['bit','say'],cases:[{vars:{},say:'101'}],par:3,hints:['Which two place values add to 5?','Turn on 4 and 1. The bin box removes the unused leading zeros.','Bit 4, bit 1, say bin.']})]},
{n:'',t:'Binary Counting',d:'Converting between normal numbers and binary.',L:[
 L1('Decimal to binary','Easy','To convert a decimal number, start at the largest place value and decide whether each switch is needed. For 6, the 4 and 2 places are on, so 6 is <code>110</code>. You can also keep subtracting the largest place value that fits.','n holds 6. Convert it to binary and say the result.',{vars:{n:6,b:''},allow:['base','say'],cases:[{vars:{},say:'110'}],par:2,path:'hook',hints:['6 is made from 4 + 2, with no 1.','Use the convert block, choose "to binary", and store the text in b.','Convert n to binary into b, then say b.']}),
 L1('Binary to decimal','Medium','To read binary as a decimal number, write the place values above the digits, multiply each place by its 0 or 1, then add. For <code>00101</code>, only 4 and 1 are on, so the value is 5.','b holds the binary word 101. Convert it to a number and walk that far.',{vars:{b:'101',n:0},allow:['base','move'],goal:5,par:2,path:'snake',hints:['101 has a 1 in the 4 place and the 1 place.','Choose "from binary to a number" and store the result in n.','Convert b from binary into n, then move n.']}),
 L1('There and back','Hard','A round-trip conversion is a useful check. Convert the number in n to binary text in b, then convert b back into m. The final number should match the original. Leading zeros may appear or disappear, but the value stays the same.','n holds 4. Convert it to binary and say it, then convert it back and walk that far.',{vars:{n:4,b:'',m:0},allow:['base','move','say'],cases:[{vars:{},goal:4,say:'100'}],par:4,path:'s',hints:['First choose "to binary" and store in b.','After saying b, choose "from binary to a number" and store in m.','Convert n to binary into b, say b, convert b from binary into m, move m.']})]},
{n:'',t:'Binary Maths',d:'Adding and shifting numbers in binary.',L:[
 L1('Add two binary numbers','Medium','Binary addition follows the same place-value rules as decimal addition. Add from the right. If a column totals 2, write 0 and carry 1 to the next column. For <code>11 + 10</code>, the result is <code>101</code>, which is 3 + 2 = 5.','a holds 11 and b holds 10 (binary words). Convert both and walk their sum.',{vars:{a:'11',b:'10',x:0,y:0},allow:['base','move'],goal:5,par:4,path:'maze',hints:['Convert each binary word into a normal number first.','11 is 3 and 10 is 2. Moving by both values walks 5 cells.','Convert a into x, convert b into y, move x, move y.']}),
 L1('Shift left doubles','Medium','Shifting every bit one place <b>left</b> appends a zero and doubles the number. For example, 3 is <code>11</code>; shift left once and it becomes <code>110</code>, which is 6. Shifting left k places multiplies by 2 to the power of k.','a holds 3. Shift it left by 1 and walk the result.',{vars:{a:3,r:0},allow:['calc','move'],goal:6,par:2,path:'stairs',rule:{txt:'shift the number left.',f:s=>any(s,b=>b.t==='calc'&&b.op==='<<')},hints:['One left shift means 3 × 2.','In the calculate block, choose "shift left" and use 1.','Calculate r = a shift left 1, then move r.']}),
 L1('Shift right halves','Hard','Shifting <b>right</b> removes bits from the right end and divides by 2 for each place. It keeps only the whole part, so an odd number loses its remainder. For example, 8 is <code>1000</code>; shift right once and it becomes <code>100</code>, which is 4.','a holds 8. Shift it right by 1, then walk the result twice.',{vars:{a:8,r:0},allow:['calc','move'],goal:8,par:3,path:'hook',rule:{txt:'shift the number right.',f:s=>any(s,b=>b.t==='calc'&&b.op==='>>')},hints:['One right shift turns 8 into 4.','Choose "shift right" in the calculate block.','Calculate r = a shift right 1, move r, move r.']})]},
{n:'',t:'Bit Operations',d:'AND, OR and XOR work on every bit at once.',L:[
 L1('AND keeps what both share','Medium','Bitwise <b>AND</b> compares two numbers one column at a time. The result bit is 1 only when both input bits are 1. For 5 (<code>101</code>) and 3 (<code>011</code>), only the last column has two 1s, so the result is <code>001</code>, which is 1.','a holds 5. Combine it with 3 using AND and walk the result.',{vars:{a:5,r:0},allow:['calc','move'],goal:1,par:2,path:'s',rule:{txt:'use the AND operator.',f:s=>any(s,b=>b.t==='calc'&&b.op==='&')},hints:['Compare the columns: 1 AND 0 is 0, 0 AND 1 is 0, and 1 AND 1 is 1.','Pick AND (bits) in the calculate block.','Calculate r = a AND 3, then move r.']}),
 L1('OR keeps what either has','Medium','Bitwise <b>OR</b> keeps a 1 whenever at least one input bit is 1. It returns 0 only when both bits are 0. For 5 (<code>101</code>) and 2 (<code>010</code>), every column has a 1 in one row, so the result is <code>111</code>, which is 7.','a holds 5. Combine it with 2 using OR and walk the result.',{vars:{a:5,r:0},allow:['calc','move'],goal:7,par:2,path:'maze',rule:{txt:'use the OR operator.',f:s=>any(s,b=>b.t==='calc'&&b.op==='|')},hints:['Either row can supply the 1 in each column.','Pick OR (bits) in the calculate block.','Calculate r = a OR 2, then move r.']}),
 L1('XOR keeps the differences','Hard','Bitwise <b>XOR</b> keeps a 1 only when the two input bits are different. Matching bits become 0. For 5 (<code>101</code>) and 3 (<code>011</code>), the columns differ in the first two places, so the result is <code>110</code>, which is 6.','a holds 5. Combine it with 3 using XOR and walk the result.',{vars:{a:5,r:0},allow:['calc','move'],goal:6,par:2,path:'stairs',rule:{txt:'use the XOR operator.',f:s=>any(s,b=>b.t==='calc'&&b.op==='^')},hints:['Keep a bit when one row has 1 and the other has 0.','Pick XOR (bits) in the calculate block.','Calculate r = a XOR 3, then move r.']})]},
{n:'',t:'The Byte',d:'The fifth guardian guards the binary vault.',L:[{t:'The Byte',df:'Boss',learn:'',mis:'',vars:{},allow:['set','change','move','say','rep','if','bit','base','calc'],boss:1,par:99,hints:[]}]},
{n:'',t:'Debugging',d:'Find the mistake in a script that is almost right.',L:[
 L1('The missing step','Easy','A <b>bug</b> is a mistake in code. Debugging means finding it and fixing it. This script has one.','The script should reach cell 6, but it stops at cell 3. Fix it.',{vars:{steps:3},allow:['move','say'],goal:6,par:2,start:()=>[BK('move',{src:'steps'})],hints:['Run it and watch where the robot stops.','It only walks once.','Add a second move steps.']}),
 L1('Too far','Medium','Bugs are often a wrong number. Read the script slowly and work out what it does.','The script should reach cell 5, but it walks too far. Fix it.',{vars:{},allow:['rep','move'],goal:5,par:2,path:'snake',start:()=>[BK('rep',{n:3},[BK('move',{n:2})])],hints:['3 laps of 2 is 6.','Change the numbers.','Repeat 5 times and move 1.']}),

 L1('Wrong order','Medium','Order matters. A box must be filled before you read it, so the order of blocks can be the bug.','The robot should output its designation R-067, but the readout is empty. Fix the order.',{vars:{word:''},allow:['set','say'],cases:[{vars:{},say:'R-067'}],par:2,path:'maze',start:()=>[BK('say',{src:'word'}),BK('set',{v:'word',val:'R-067'})],hints:['What is in word when the robot attempts to output it?','Drag the set block above the say block.','Set word to R-067 first, then say word.']})]},
{n:'',t:'Searching',d:'Walk through a list to find what you need.',L:[
 L1('Find the 8','Hard','A <b>search</b> looks at each item in turn until it finds a match. The item number is the answer.','Walk to the position of the number 8 in the list. Pass all three tests.',{vars:{list:[3,8,5],i:0,x:0},allow:['rep','change','pick','if','move'],cases:[{vars:{list:[3,8,5]},goal:2},{vars:{list:[8,1,1]},goal:1},{vars:{list:[2,2,8]},goal:3}],par:5,path:'stairs',hints:['Look at each item and compare it.','i is the position. Move by i when x is 8.','Repeat 3: change i by 1, pick x item i, if x = 8 then move i.']}),
 L1('Is it there?','Hard','A search can also answer yes or no. Start with a guess of no and change it when you find the item.','Say yes if the list holds a 6, otherwise say no. Pass both tests.',{vars:{list:[2,6,4],i:0,x:0,found:'no'},allow:['rep','change','pick','if','set','say'],cases:[{vars:{list:[2,6,4]},say:'yes'},{vars:{list:[1,1,1]},say:'no'}],par:6,hints:['found starts as no.','Set found to yes only when you spot the 6.','Repeat 3: change i, pick x, if x = 6 then set found to yes. Say found.']})]},
{n:'',t:'Finding the Biggest',d:'Keep track of the best item so far.',L:[
 L1('The biggest','Hard','To find the biggest, remember the best so far and replace it whenever you see something bigger.','Walk to the biggest number in the list. Pass all three tests.',{vars:{list:[3,7,2],i:0,x:0,best:0},allow:['rep','change','pick','if','calc','move'],cases:[{vars:{list:[3,7,2]},goal:7},{vars:{list:[5,1,8]},goal:8},{vars:{list:[4,4,6]},goal:6}],par:6,path:'maze',hints:['best starts at 0.','If x is more than best, copy x into best.','Repeat 3: change i, pick x, if x > best then calculate best = x + 0. Then move best.']}),
 L1('The smallest','Hard','The same idea works for the smallest. Start with a number that is bigger than everything.','Walk to the smallest number in the list. Pass all three tests.',{vars:{list:[5,2,7],i:0,x:0,best:9},allow:['rep','change','pick','if','calc','move'],cases:[{vars:{list:[5,2,7]},goal:2},{vars:{list:[6,4,3]},goal:3},{vars:{list:[1,8,5]},goal:1}],par:6,path:'s',hints:['best starts bigger than any item.','Replace best when x is smaller.','Repeat 3: change i, pick x, if x < best then calculate best = x + 0. Then move best.']})]},
{n:'',t:'Optimising',d:'Solve it with fewer blocks.',L:[
 L1('Shortest laugh','Hard','<b>Optimising</b> means doing the same job with less. A loop can replace many repeated blocks.','Say hahahaha (ha four times) using at most 3 blocks.',{vars:{s:'ha',out:''},allow:['join','rep','say'],cases:[{vars:{},say:'hahahaha'}],par:3,cap:3,hints:['Do not write four join blocks.','One loop does the joining.','Repeat 4: join out and s into out. Say out.']}),
 L1('Shortest walk','Hard','Loops are not just shorter, they are safer to change later. Change one number instead of many blocks.','Reach cell 8 using a repeat block and at most 2 blocks.',{vars:{steps:2},allow:['rep','move','set'],goal:8,par:2,cap:2,path:'snake',rule:{txt:'use a repeat block.',f:s=>has(s,'rep')},hints:['8 is four lots of steps.','Two blocks: a repeat and a move.','Repeat 4: move steps.']})]},
{n:'',t:'The Origin',d:'The final guardian. Everything you have learned leads here.',L:[{t:'The Origin',df:'Boss',learn:'',mis:'',vars:{},allow:['set','change','move','say','rep','while','if','calc','pick','note','def','call','bit','base','join','cast','ask'],boss:1,par:99,hints:[]}]}
);
CH[4].L.push(L1('Three in a row','Medium','Programs often run several instructions in a row. Each one builds on the last.','a, b and c hold 1, 2 and 3. Walk each of them in order to reach cell 6.',{vars:{a:1,b:2,c:3},allow:['move','say'],goal:6,par:3,path:'maze',hints:['Three instructions.','One move for each box.','Move a, move b, move c.']}));
CH[5].L.push(L1('Lock and key','Medium','A program can mix locked constants with ordinary variables that do change.','base is a constant holding 2. Walk base twice, then set extra to 3 and walk extra. Reach cell 7.',{vars:{base:2,extra:0},consts:['base'],allow:['set','change','move','rep'],goal:7,par:4,path:'maze',hints:['base never changes.','Walk base twice, then use extra.','Repeat 2: move base. Set extra to 3. Move extra.']}));
CH[6].L.push(L1('Odd one out','Hard','Values that look alike can have different types. Check each box before you use it.','a and c are numbers, b and d are words. Walk the two numbers and say the word 3.',{strict:true,vars:{a:3,b:'3',c:2,d:'two'},allow:['move','say'],goal:5,say:'3',par:3,path:'s',hints:['Two boxes hold numbers.','The word 3 is in b.','Move a, move c, say b.']}));
CH[7].L.push(L1('Cast and loop','Hard','Once a box is a number, you can use it anywhere a number fits, even inside a loop.','s holds the word 2. Convert it and walk it three times.',{strict:true,vars:{s:'2'},allow:['cast','rep','move'],goal:6,par:3,path:'stairs',hints:['Convert first.','Then loop.','Turn s into number. Repeat 3: move s.']}));
CH[8].L.push(L1('Both ends','Medium','Joining can be done in many steps. Each join stores its result so you can join again.','Say <-> built from the pieces a, c and b.',{vars:{a:'<',b:'>',c:'-',out:''},allow:['join','say'],say:'<-->',par:4,path:'snake',hints:['Four pieces in order: a, c, c, b.','Join step by step into out.','Join a and c into out, join out and c into out, join out and b into out, say out.']}));
CH[10].L.push(L1('Two rounds of maths','Hard','You can chain calculations. The result of one step becomes the input of the next.','a holds 2. Double it, double it again, then walk the result.',{vars:{a:2,r:0},allow:['calc','move'],goal:8,par:3,path:'stairs',hints:['2 doubled twice is 8.','Use r for both steps.','Calculate r = a x 2, calculate r = r x 2, move r.']}),L1('Divide it','Medium','Division gives the whole-number part of the answer.','a holds 9. Divide it by 3 and walk the result.',{vars:{a:9,r:0},allow:['calc','move'],goal:3,par:2,path:'s',hints:['9 split in three.','Use the divide operator.','Calculate r = a ÷ 3, then move r.']}));
CH[11].L.push(L1('Two picks','Medium','You can read several items from the same array, one by one.','list holds 1, 5, 2, 6. Walk item 2 then item 3 to reach cell 7.',{vars:{list:[1,5,2,6],x:0},allow:['pick','move'],goal:7,par:4,path:'maze',hints:['5 + 2 = 7.','Pick twice, move twice.','Pick x item 2, move x, pick x item 3, move x.']}));
CH[12].L.push(L1('Double the input','Medium','Programs usually do something with the input before they answer.','The player types a number. Double it and walk that far. Pass both tests.',{vars:{n:0,r:0},allow:['ask','calc','move'],cases:[{vars:{},input:2,goal:4},{vars:{},input:3,goal:6}],par:3,path:'stairs',hints:['Ask first, then calculate.','Store the double in r.','Ask into n, calculate r = n x 2, move r.']}),L1('Say it twice','Medium','Strings and input work together: join what the player typed with itself.','The player types a name. Say it twice with no space between. Pass both tests.',{vars:{name:'',out:''},allow:['ask','join','say'],cases:[{vars:{},input:'Ada',say:'AdaAda'},{vars:{},input:'Bo',say:'BoBo'}],par:3,path:'s',hints:['Ask, join, say.','Join name with itself.','Ask into name, join name and name into out, say out.']}));
CH[15].L.push(L1('Two recipes','Hard','A program can define several functions, each with its own job.','Define short (move 2) and long (move 3). Call long once and short twice to reach cell 7.',{fns:['short','long'],allow:['def','call','move'],goal:7,par:7,path:'maze',hints:['Define both first.','3 + 2 + 2 = 7.','Define short and long, then call long, short, short.']}));
CH[16].L.push(L1('Inside only','Hard','A box changed inside a function stays changed only inside it. Outside, nothing happened.','count holds 0. Define a function that adds 3 to count and walks count. Call it, then say count. The robot should reach cell 3 and say 0.',{vars:{count:0},fns:['grow'],allow:['def','call','change','move','say'],cases:[{vars:{},goal:3,say:'0'}],par:5,path:'snake',hints:['count outside stays 0.','Do both things inside the function.','Define grow: change count by 3, move count. Call grow. Say count.']}));
CH[17].L.push(L1('Stop and say','Hard','The base case can do something useful, like announcing that it has finished.','n holds 3. Define walk: if n is more than 0, move 1, lower n and call walk. Otherwise say word.',{vars:{n:3,word:'done'},fns:['walk'],allow:['def','call','if','move','change','say'],cases:[{vars:{},goal:3,say:'done'}],par:7,path:'stairs',rule:{txt:'call the function from inside itself.',f:s=>any(s,b=>b.t==='def'&&has(b.c,'call'))},hints:['The else part is the base case.','Say only once, when n reaches 0.','Define walk: if n > 0 [move 1, change n by -1, call walk] else [say word]. Call walk.']}));
CH[18].L.push(L1('Make 13','Hard','Numbers bigger than the track can still be built and read. Use the say block instead of moving.','Make 13 with bits and say its binary form.',{vars:{total:0,bin:'0'},allow:['bit','say'],cases:[{vars:{},say:'1101'}],par:4,hints:['13 = 8 + 4 + 1.','Three switches.','Bit 8, bit 4, bit 1, say bin.']}));

SEC.forEach((s,si)=>{s.ch.forEach((c,i)=>CH[c].n=(s.bonus?'Bonus':'Section '+(si+1))+' · Chapter '+(i+1));CH[s.boss].n=(s.bonus?'Bonus':'Section '+(si+1))+' · Boss'});
const ORDER=SEC.flatMap(s=>[...s.ch,s.boss]),nextOf=c=>ORDER[ORDER.indexOf(c)+1];
const SEC0=SEC.map((s,i)=>({...s,id:i,ch:s.ch.slice()}));
function applyHidden(){


 const admin=!!window.__adminPreview;
 const hid=admin?[]:((window.TLP&&TLP.HIDDEN&&TLP.HIDDEN[PATH])||[]);SEC.length=0;
 SEC0.forEach(x=>{const ch=x.ch.filter(c=>!hid.includes(c));if(!ch.length&&hid.includes(x.boss))return;SEC.push({...x,ch})});
 ORDER.length=0;SEC.forEach(x=>{x.ch.forEach(c=>ORDER.push(c));if(!hid.includes(x.boss))ORDER.push(x.boss)});



 CH.forEach(c=>{if(!c.L)return;c.L.forEach(l=>{if(l.__kidOpt){delete l.bonus;delete l.__kidOpt}})});
 if(!admin&&PATH==='g16')CH.forEach(c=>{if(!c.L)return;c.L.forEach(l=>{if(l.df==='Hard'&&!l.boss){l.bonus=1;l.__kidOpt=1}})});
}

const mainSecs=()=>SEC.filter(s=>!s.bonus);
const mainBoss=()=>{const m=mainSecs();return m.length?m[m.length-1].boss:null};

const anyProg=c=>CH[c].L.some((_,l)=>S.prog[key(c,l)]);
const isOpen=c=>{if(window.__adminPreview)return true;const i=ORDER.indexOf(c);return i<1||done(ORDER[i-1])||ORDER.slice(i).some(anyProg)};

const RD=(t,learn,mis,cases,par,rule,hints,path,o)=>Object.assign({t,learn,mis,cases,par,rule,hints,path,vars:{},consts:[],strict:false,fns:[]},o||{});
const B2=[
 RD('The Hoarder · Round 1: Constant strike','The Hoarder hoards data. It has <b>100 HP</b> and <b>remembers every attack that lands</b>. Round 1: it is at cell 6. The constant <code>lap</code> holds 3 and can never change. Strike using lap.','Reach cell 6 by moving by lap inside a repeat block.',[{vars:{},goal:6}],2,{txt:'move by lap inside a repeat block.',f:s=>has(s,'rep')&&any(s,b=>b.t==='move'&&b.src==='lap')},['lap is 3 and it is locked.','6 is two lots of lap.','Repeat 2: move lap.'],'maze',{vars:{lap:3},consts:['lap']}),
 RD('The Hoarder · Round 2: Casting strike','<b>Round 2.</b> The box s holds the <i>word</i> 4. Moving needs a number, so convert first.','Reach cell 4 with s. Convert it before you move.',[{vars:{},goal:4}],2,{txt:'turn a box into a number first.',f:s=>has(s,'cast')},['Moving by a word is an error.','Cast s into a number.','Turn s into number, then move s.'],'stairs',{vars:{s:'4'},strict:true}),
 RD('The Hoarder · Round 3: String strike','<b>Round 3.</b> The Hoarder is weak to words. Glue strings together.','Make the robot say GoGo by joining strings.',[{vars:{},say:'GoGo'}],3,{txt:'use a join block.',f:s=>has(s,'join')},['GoGo is Go twice.','Join g and g into out.','Join g and g into out, then say out.'],'s',{vars:{g:'Go',out:''}}),
 RD('The Hoarder · Round 4: Finishing blow','<b>Final blow.</b> Combine <b>everything</b>: convert, loop and join, in one attack it has never seen.','Reach cell 6 and say ababab. Convert s, then loop to move and to join.',[{vars:{},goal:6,say:'ababab'}],6,{txt:'use a cast, a repeat and a join together.',f:s=>has(s,'cast')&&has(s,'rep')&&has(s,'join')},['Three laps again.','Cast s first, then one loop does both jobs.','Turn s into number. Repeat 3: move s, join out and g into out. Say out.'],'snake',{vars:{s:'2',g:'ab',out:''},strict:true})];
const B3=[
 RD('The Cipher · Round 1: Operator strike','The Cipher hides behind maths. It has <b>100 HP</b> and <b>remembers every attack that lands</b>. Round 1: it is at cell 8, and a holds 4.','Reach cell 8 by calculating with a.',[{vars:{},goal:8}],2,{txt:'use a calculate block.',f:s=>has(s,'calc')},['8 is 4 times 2.','Calculate r = a × 2.','Calculate r from a × 2, then move r.'],'maze',{vars:{a:4,r:0}}),
 RD('The Cipher · Round 2: List strike','<b>Round 2.</b> The Cipher is guarded by a list. Walk through every item.','list holds 2, 3, 1. Walk every item to reach cell 6.',[{vars:{},goal:6}],4,{txt:'use a pick block inside a repeat.',f:s=>has(s,'pick')&&has(s,'rep')},['Three items, three laps.','Use i as the item number.','Repeat 3: change i by 1, pick item i into x, move x.'],'stairs',{vars:{list:[2,3,1],i:0,x:0}}),
 RD('The Cipher · Round 3: Input strike','<b>Round 3.</b> The Cipher asks questions. The player types a number n. If it is more than 5, go to cell 8, otherwise go exactly n.','Pass both tests using ask and if.',[{vars:{},input:3,goal:3},{vars:{},input:9,goal:8}],5,{txt:'use ask and if together.',f:s=>has(s,'ask')&&has(s,'if')},['Two different behaviours.','Ask first, then decide.','Ask into n. If n > 5: move 8, else move n.'],'s',{vars:{n:0}}),
 RD('The Cipher · Round 4: Finishing blow','<b>Final blow.</b> Ask, calculate and explain with a note, all in one new attack.','The player types a number. Double it and walk. Add a note.',[{vars:{},input:2,goal:4},{vars:{},input:3,goal:6}],4,{txt:'use ask, calculate and a note with text.',f:s=>has(s,'ask')&&has(s,'calc')&&any(s,b=>b.t==='note'&&b.val.trim().length>2)},['Ask, double, walk.','Write a short note too.','Ask into n, calculate r = n × 2, move r, add a note.'],'snake',{vars:{n:0,r:0}})];
const B4=[
 RD('The Echo · Round 1: Function strike','The Echo repeats everything. It has <b>100 HP</b> and <b>remembers every attack that lands</b>. Round 1: reach cell 6 with a function.','Define hop (move 2) and call it to reach cell 6.',[{vars:{},goal:6}],4,{txt:'define and call a function.',f:s=>has(s,'def')&&has(s,'call')},['Define first, call after.','Hop moves 2.','Define hop: move 2. Repeat 3: call hop.'],'maze',{fns:['hop']}),
 RD('The Echo · Round 2: Scope strike','<b>Round 2.</b> Boxes inside a function stay inside it. steps holds 1 outside.','Define and call boost (it sets steps to 4), then reach cell 5 with a loop over steps.',[{vars:{},goal:5}],5,{txt:'define a function, call it and use a repeat.',f:s=>has(s,'def')&&has(s,'call')&&has(s,'rep')},['Outside, steps is still 1.','5 laps of 1.','Define boost (set steps 4). Call boost. Repeat 5: move steps.'],'stairs',{vars:{steps:1},fns:['boost']}),
 RD('The Echo · Round 3: Recursion strike','<b>Round 3.</b> The Echo is weak to itself. Make a function that calls itself.','Define walk so it calls itself until n reaches 0. Pass both tests.',[{vars:{n:3},goal:3},{vars:{n:5},goal:5}],6,{txt:'call the function from inside itself.',f:s=>any(s,b=>b.t==='def'&&has(b.c,'call'))},['The if block is the stopping rule.','Inside walk: move 1, lower n, call walk.','Define walk: if n > 0 [move 1, change n by -1, call walk]. Call walk.'],'s',{vars:{n:0},fns:['walk']}),
 RD('The Echo · Round 4: Finishing blow','<b>Final blow.</b> Show it you understand bits: switch on three of them.','Make 7 with bits, walk there and say its binary form.',[{vars:{},goal:7,say:'111'}],5,{txt:'switch on at least three bits.',f:s=>cnt(s,'bit')>=3},['7 = 4 + 2 + 1.','bin shows the binary form.','Bit 4, bit 2, bit 1, move total, say bin.'],'snake',{vars:{total:0,bin:'0'}})];
const BOSSES={
 3:{k:0,name:'THE GLITCH',rounds:BR,taunts:TAUNTS,intro:'A bug that eats code.'},
 9:{k:1,name:'THE HOARDER',rounds:B2,taunts:['Everything you own is mine.','Locked. Typed. Glued. Ha.','You cannot cast me away.','Hoard it all!'],intro:'It hoards every scrap of data.'},
 14:{k:2,name:'THE CIPHER',rounds:B3,taunts:['Solve me, if you can.','Lists, sums, secrets...','Ask me anything. I will not answer.','Decode this!'],intro:'It hides behind numbers and secrets.'},
 19:{k:3,name:'THE ECHO',rounds:B4,taunts:['Echo... echo... echo...','I call myself. Can you?','Scope cannot save you.','The last switch is mine.'],intro:'It repeats everything you do.'}};
const BAD=[{t:'Glitch Slayer',ico:'<i class=ic-shield></i>',cls:'bd1'},{t:'Data Keeper',ico:'<i class=ic-gem></i>',cls:'bd2'},{t:'Cipher Cracker',ico:'<i class=ic-key></i>',cls:'bd3'},{t:'Light Bringer',ico:'<i class=ic-sun></i>',cls:'bd4'}];
const nice=n=>n.toLowerCase().replace(/(^|\s)\w/g,c=>c.toUpperCase());
const cnt=(a,t)=>a.reduce((n,b)=>n+(b.t===t?1:0)+cnt(kids(b),t),0);
let INP,onBits=new Set(),FN={},fdepth=0;
const isC=k=>(lv().consts||[]).includes(k);
const fmt=v=>Array.isArray(v)?'['+v.join(', ')+']':v===''?'':v;
function fail(m){S.err=m;S.run=false}
const fo=sel=>(lv().fns||[]).map(f=>`<option value="${f}"${f==sel?' selected':''}>${f}</option>`).join('');
const sopt=(a,sel)=>a.map(([v,t])=>`<option value="${v}"${v==sel?' selected':''}>${t}</option>`).join('');
const OPW={'>':'is more than','<':'is less than','=':'is exactly'};
const one=b=>({set:`set ${b.v} to ${b.val}`,change:`change ${b.v} by ${b.n}`,move:`move ${b.src==='#'?b.n:b.src}`,say:`say ${b.src}`,rep:`repeat ${b.n} times`,if:`if ${b.v} ${OPW[b.op]||b.op} ${b.rv&&b.rv!=='#'?b.rv:b.n}${b.j&&b.j!=='none'?' '+b.j+' '+b.v2+' '+(OPW[b.op2]||b.op2)+' '+b.n2:''}`,while:`repeat while ${b.v} ${OPW[b.op]||b.op} ${b.rv&&b.rv!=='#'?b.rv:b.n}`,base:`convert ${b.src} ${b.to==='bin'?'to binary':'from binary'} into ${b.v}`,note:`note: ${b.val||'...'}`,ask:`ask the player into ${b.v}`,calc:`set ${b.v} to ${b.src} ${b.op} ${b.n}`,join:`join ${b.src} and ${b.src2} into ${b.v}`,cast:`turn ${b.v} into ${b.to}`,pick:`set ${b.v} to item ${b.idx==='#'?b.n:b.idx} of ${b.src}`,def:`define ${b.v}`,call:`call ${b.v}`,bit:`switch on bit ${b.n}`})[b.t]||b.t;
const WHY={set:'Puts a value into a labelled box (a variable). Whatever was there before is replaced.',change:'Adds to the number already in the box. Use a negative number to take away.',move:'Walks the robot forward along the path. Give it a number, or pick a box to use the value inside it.',say:'Makes the robot speak whatever is inside the box you choose.',rep:'Runs the blocks inside it again and again, so you only write the step once.',if:'Asks a yes or no question. If yes, the blocks under then run. If no, the else blocks run.',note:'A comment. The computer ignores it, but people reading your code understand it.',ask:'Input: waits for what the player types and stores it in a box.',calc:'Calculates a new value. Plus, minus, times, divide and remainder work on numbers. AND, OR and XOR compare each binary bit. Shift left doubles once per place; shift right divides and drops the remainder.',join:'Glues two pieces of text together into one string.',cast:'Type casting: converts a box from one type to another, like a word into a number.',pick:'Reads one item from an array (a list in a box) by its number.',def:'Defines a function: a named group of blocks that does nothing until it is called.',call:'Calls a function: runs the blocks stored under its name.',bit:'Switches on one bit. Its place value is added to the total. The binary box shows every place as 1 or 0.',while:'Repeats the blocks inside for as long as its condition stays true, then stops.',base:'Converts a whole number from 0 to 255 into binary text, or reads binary text made only of 0 and 1 back into a number. Invalid input stops the program instead of silently becoming zero.'};
const tx=b=>{const k=b.c.map(tx).join('; '),e=(b.e||[]).map(tx).join('; ');return b.t==='rep'?`repeat ${b.n} {${k}}`:b.t==='if'?`if ${b.v} ${b.op} ${b.n}${b.j&&b.j!=='none'?' '+b.j+' '+b.v2+' '+b.op2+' '+b.n2:''} {${k}} else {${e}}`:b.t==='while'?`while ${b.v} ${b.op} ${b.n} {${k}}`:b.t==='def'?`define ${b.v} {${k}}`:one(b)};
const sg=b=>[b.t,b.v,b.val,b.src,b.src2,b.to,b.idx,b.op,+b.n,b.rv,b.rv2,b.j,b.v2,b.op2,b.n2,b.c.map(sg),b.e.map(sg)],sig=a=>JSON.stringify(a.map(sg));
function snd(k){if(mute)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const t=AC.currentTime;


 const fxv=window.TLP_VOL?TLP_VOL.factor('fx'):1;if(fxv<=0)return;
 const tone=(f,d,w,v,s,f2)=>{const o=AC.createOscillator(),g=AC.createGain();o.type=w||'square';o.frequency.setValueAtTime(f,t+(s||0));if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+(s||0)+d);g.gain.setValueAtTime((v||.12)*fxv,t+(s||0));g.gain.exponentialRampToValueAtTime(.001,t+(s||0)+d);o.connect(g);g.connect(AC.destination);o.start(t+(s||0));o.stop(t+(s||0)+d)};
 const SF={hit:()=>{tone(520,.18,'sawtooth',.14,0,120);tone(90,.25,'square',.12,.02)},zap:()=>tone(900,.4,'sawtooth',.1,0,120),crack:()=>{tone(180,.2,'square',.15,0,60);tone(1200,.08,'triangle',.1,.02,400)},intro:()=>[110,98,82].forEach((f,i)=>tone(f,.5,'sawtooth',.12,i*.28)),lose:()=>[392,330,262,196].forEach((f,i)=>tone(f,.45,'triangle',.16,i*.32)),win:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.3,'square',.1,i*.15)),ominous:()=>{tone(70,1.8,'sawtooth',.1,0,55);tone(74,1.8,'sawtooth',.08,0,58)},boom:()=>tone(120,.7,'sawtooth',.18,0,30),
  tick:()=>tone(520,.06,'triangle',.05),step:()=>tone(240,.05,'triangle',.04),chime:()=>{tone(784,.18,'sine',.07);tone(1175,.3,'sine',.06,.09)},err:()=>tone(150,.22,'sawtooth',.07,0,90),ach:()=>[784,988,1319].forEach((f,i)=>tone(f,.22,'sine',.07,i*.1)),
  b1:()=>{tone(300,.5,'sawtooth',.09,0,1200);[523,659,784,1047].forEach((f,i)=>tone(f,.35,'square',.07,.45+i*.1))},b2:()=>[1319,1568,2093,1568,2637].forEach((f,i)=>tone(f,.45,'sine',.08,i*.12)),b3:()=>{[0,.08,.16].forEach(s=>tone(120,.05,'square',.09,s));[392,494,587,784].forEach(f=>tone(f,.9,'triangle',.06,.35))},b4:()=>{[262,330,392,523].forEach(f=>tone(f,1.4,'sawtooth',.05,0));[523,659,784,1047,1319].forEach((f,i)=>tone(f,.5,'square',.06,.5+i*.14))}};
 SF[k]&&SF[k]()}catch(e){}}
function toggleMute(){mute=!mute;try{localStorage.setItem('tlp-mute',mute?'1':'0')}catch(e){}const g=$('#sndg');if(g)g.innerHTML=mute?'<i class=ic-mute></i>':'<i class=ic-volume></i>';const s=$('#snd');if(s)s.textContent='Sound: '+(mute?'off':'on')}
function puff(x,y,n){if(still)return;burst(x,y,n||6,['var(--a)','var(--b)','#ffd36a'])}
function goalFx(){
 const animate=!still&&document.body.classList.contains('ui-goal')&&!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 const c=track.querySelector('.chip');if(!c)return;
 track.classList.remove('goal-found');bot.classList.remove('celebrate');void track.offsetWidth;
 if(animate){const r=c.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;burst(x,y,32,['var(--ok)','#ffd36a','#7ad9ff','#fff']);ringBurst(x,y,'var(--ok)',4);c.classList.add('hit')}
 track.classList.add('goal-found');bot.classList.add('celebrate');
 setTimeout(()=>{c.classList.remove('hit');track.classList.remove('goal-found');bot.classList.remove('celebrate')},animate?1100:650)
}
function setLight(){try{const k=mainSecs().filter(s=>done(s.boss)).length;document.documentElement.style.setProperty('--dim',[.5,.42,.34,.26,.18,0][k])}catch(e){}}
function chCard(ci){const c=CH[ci],open=isOpen(ci);return `<div class="card ch ${c.L[0].boss?'bossc ':''}${open?'':'lock'}"><span class="hand">${c.n}${open?'':' · locked'}</span><h3>${c.t}</h3><p>${c.d}</p><div class="lvls">${c.L.map((l,li)=>`<button class="lb" data-c="${ci}" data-l="${li}" ${open&&(window.__adminPreview||li===0||S.prog[key(ci,li-1)])?'':'disabled'}>${li+1}. ${l.t}<small>${'★'.repeat(S.prog[key(ci,li)]||0)||l.df}</small></button>`).join('')}</div></div>`}


function renderStreak(){const el=$('#streak');if(!el||!window.TLP_STREAK)return;try{el.innerHTML=TLP_STREAK.cardHtml()}catch(e){}}
function showStreak(m,amount){
  if(!m||!window.TLP_STREAK)return;
  snd('ach');
  const d=document.createElement('div');d.className='tlpm streak-reward-modal';
  d.innerHTML='<div class="tlpm-pan" role="dialog" aria-modal="true" aria-labelledby="tsT">'+TLP_STREAK.popHtml(m,amount)+'<div class="tlpm-row"><button class="tlpm-btn pri" id="tsOk" type="button">Keep going</button></div></div>';
  document.body.appendChild(d);

  requestAnimationFrame(() => {
    const pan = d.querySelector('.tlpm-pan');
    if (pan) {
      const rect = pan.getBoundingClientRect();
      confettiBurst(rect.left + rect.width/2, rect.top + rect.height/2, 80);
      starBurst(rect.left + rect.width/2, rect.top + rect.height/2, 25);
      ringBurst(rect.left + rect.width/2, rect.top + rect.height/2, 'var(--ok)', 5);
      screenFlash('var(--ok)', 250);
    }
  });
  const close=()=>d.remove();
  d.querySelector('#tsOk').onclick=close;
  d.addEventListener('click',e=>{if(e.target===d)close()});
  setTimeout(()=>{const b=d.querySelector('#tsOk');if(b)b.focus()},40);
}
function streakCheck(){
 if(!window.TLP_STREAK)return;
 try{const r=TLP_STREAK.check();renderStreak();if(r.fresh&&r.milestone){const base=TLP_STREAK.reward(r.milestone),amount=window.TLP_ECONOMY?TLP_ECONOMY.earnAmount(base):base;if(window.TLP_ECONOMY)TLP_ECONOMY.earn(base,'streak milestone');setTimeout(()=>showStreak(r.milestone,amount),700)}}catch(e){}
}






const DAILY_DEFS=[
 {id:'clear2',t:'Clear 2 missions',goal:2,ev:'clear',pts:150},
 {id:'stars6',t:'Earn 6 stars',goal:6,ev:'stars',pts:150},
 {id:'points600',t:'Earn 600 points',goal:600,ev:'points',pts:150},
 {id:'perfect1',t:'Get 3 stars on a mission',goal:1,ev:'perfect',pts:200},
 {id:'nohint1',t:'Clear a mission without a hint',goal:1,ev:'nohint',pts:200},
 {id:'say1',t:'Use a say block in a mission',goal:1,ev:'say',pts:150},
 {id:'loop1',t:'Use a repeat block in a mission',goal:1,ev:'loop',pts:150},
 {id:'boss1',t:'Defeat a guardian',goal:1,ev:'boss',pts:300,when:()=>SEC.some(s=>isOpen(s.boss))}
];
const DAILY_BY_ID={};DAILY_DEFS.forEach(d=>{DAILY_BY_ID[d.id]=d;d.sparks=25+Math.round(d.pts/10)});
function dhash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function dToday(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function dailyIds(){
 const pool=DAILY_DEFS.filter(d=>!d.when||d.when()).slice();
 let seed=dhash(dToday()+'|'+PATH+'|'+DIFF);
 for(let i=pool.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);const tmp=pool[i];pool[i]=pool[j];pool[j]=tmp}
 return pool.slice(0,3).map(d=>d.id);
}
function dailyState(){
 const t=dToday();
 let d=null;try{d=JSON.parse(localStorage.getItem('tlp-daily')||'null')}catch(e){}
 if(!d||d.date!==t||d.path!==PATH||d.diff!==DIFF||!Array.isArray(d.ids)||d.ids.some(id=>!DAILY_BY_ID[id])){
  d={date:t,path:PATH,diff:DIFF,ids:dailyIds(),prog:{},claimed:[],bonusGiven:false,sparksClaimed:[],sparksBonusGiven:false};
  try{localStorage.setItem('tlp-daily',JSON.stringify(d))}catch(e){}
 }


 if(!d.goals||typeof d.goals!=='object'){
  d.goals={};d.ids.forEach(id=>{d.goals[id]=DAILY_BY_ID[id].goal});
  try{localStorage.setItem('tlp-daily',JSON.stringify(d))}catch(e){}
 }


 let migrated=!Array.isArray(d.sparksClaimed)||typeof d.sparksBonusGiven!=='boolean';
 if(!Array.isArray(d.sparksClaimed))d.sparksClaimed=[];
 if(typeof d.sparksBonusGiven!=='boolean')d.sparksBonusGiven=false;
 if(window.TLP_ECONOMY){
  d.claimed.forEach(id=>{if(d.sparksClaimed.includes(id)||!DAILY_BY_ID[id])return;TLP_ECONOMY.earn(DAILY_BY_ID[id].sparks,'daily mission',true);d.sparksClaimed.push(id);migrated=true});
  if(d.bonusGiven&&!d.sparksBonusGiven&&d.ids.every(id=>d.claimed.includes(id))){TLP_ECONOMY.earn(100,'all daily missions',true);d.sparksBonusGiven=true;migrated=true}
 }
 if(migrated)saveDaily(d);
 return d;
}
function saveDaily(d){try{localStorage.setItem('tlp-daily',JSON.stringify(d))}catch(e){}}
function dailyEvent(ev,val){
 if(!val)return;
 const st=dailyState();let changed=false;
 st.ids.forEach(id=>{const d=DAILY_BY_ID[id];if(!d||d.ev!==ev||st.claimed.includes(id))return;const before=st.prog[id]||0,after=Math.min(d.goal,before+val);if(after!==before){st.prog[id]=after;changed=true}});
 if(changed){saveDaily(st);renderDaily()}
}
function dailyFromWin(st,pts){
 dailyEvent('clear',1);dailyEvent('stars',st);dailyEvent('points',pts||0);dailyEvent('perfect',st===3?1:0);
 if(S.hint===0)dailyEvent('nohint',1);
 if(has(S.script,'rep'))dailyEvent('loop',1);
 if(has(S.script,'say'))dailyEvent('say',1);
 if(lv().boss)dailyEvent('boss',1);
}
function claimDaily(id){
  const st=dailyState(),d=DAILY_BY_ID[id];
  if(!d||st.claimed.includes(id)||(st.prog[id]||0)<d.goal)return;
  st.claimed.push(id);addBonus(d.pts);
  const allDone=!st.bonusGiven&&st.ids.every(x=>st.claimed.includes(x));
  if(allDone){st.bonusGiven=true;addBonus(200)}
  const sparksAwarded=window.TLP_ECONOMY?TLP_ECONOMY.earnAmount(d.sparks):0;
  let bonusAwarded=0;
  if(window.TLP_ECONOMY){
   TLP_ECONOMY.earn(d.sparks,'daily mission');st.sparksClaimed.push(id);
   if(allDone&&!st.sparksBonusGiven){TLP_ECONOMY.earn(100,'all daily missions');st.sparksBonusGiven=true;bonusAwarded=TLP_ECONOMY.earnAmount(100)}
  }
  saveDaily(st);renderDaily();hud();snd('ach');checkAch();
  const row=document.querySelector(`[data-daily="${id}"]`);
  if(row){row.classList.add('just-claimed');const rect=row.getBoundingClientRect();confettiBurst(rect.left+rect.width/2,rect.top+rect.height/2,50);ringBurst(rect.left+rect.width/2,rect.top+rect.height/2,'var(--ok)',3);setTimeout(()=>row.classList.remove('just-claimed'),1200)}
  showDailyReward(d,allDone,sparksAwarded,bonusAwarded);
  msg('<b>Daily reward claimed.</b> +'+d.pts+' points and +'+sparksAwarded+' Sparks.','ok');
}
function showDailyReward(d,allDone,sparksAwarded,bonusAwarded){
 const host=$('#daily .daily');if(!host)return;
 const old=host.querySelector('.daily-payoff');if(old)old.remove();
 const payoff=document.createElement('div');payoff.className='daily-payoff';payoff.setAttribute('role','status');
 payoff.innerHTML='<div class="daily-payoff-art" aria-hidden="true">★</div><div><small>CONGRATS! MISSION COMPLETE</small><b>'+d.t+'</b><span>+'+d.pts+' points · +'+sparksAwarded+' Sparks'+(allDone?' · +200 points · +'+bonusAwarded+' Sparks bonus':'')+'</span></div><button class="btn ghost sm" type="button" aria-label="Close reward">Got it</button>';
 host.appendChild(payoff);payoff.querySelector('button').onclick=()=>payoff.remove();
 if(!still){const r=payoff.getBoundingClientRect();confettiBurst(r.left+r.width/2,r.top+r.height/2,allDone?75:40);starBurst(r.left+r.width/2,r.top+r.height/2,allDone?20:10)}
}


let __avMounted=false;
function mountAvatarLife(){
 try{if(!__avMounted&&window.TLP_AVATAR){__avMounted=true;TLP_AVATAR.mount($('#avSlot'))}}
 catch(e){}
 try{const el=$('#life');if(el&&!el._lfMounted&&window.TLP_LIFE){el._lfMounted=true;TLP_LIFE.mount(el)}}catch(e){}
}
function renderStatusStrip(){
 const el=$('#statusStrip');if(!el)return;
 try{
  const prog=JSON.parse(localStorage.getItem('tlp-prog')||'{}');
  let ch=0,st=0;Object.keys(prog).forEach(k=>{const n=Number(prog[k])||0;if(n>=1){ch++;st+=Math.min(3,n)}});
  const av=window.TLP_AVATAR?TLP_AVATAR.get():null;
  const avHtml=av?TLP_AVATAR.mini(av,30):'';
  el.hidden=false;
  el.innerHTML='<span class="ss-av">'+avHtml+'</span><span class="ss-txt"><b>'+(window.TLP?TLP.esc(S.name||'Player'):S.name||'Player')+'</b><small>'+ch+' chapters · '+st+' stars</small></span><span class="ss-stats"><span>'+ch+' ch</span><span>'+st+' ★</span></span>';
 }catch(e){el.hidden=true}
}
function renderDaily(){
 const el=$('#daily');if(!el)return;
 const st=dailyState(),all=st.ids.every(id=>st.claimed.includes(id));
 const rows=st.ids.map(id=>{
  const d=DAILY_BY_ID[id],n=Math.min(d.goal,st.prog[id]||0),done=n>=d.goal,claimed=st.claimed.includes(id);
  return '<div class="dmi'+(done?' done':'')+(done&&!claimed?' ready':'')+(claimed?' claimed':'')+'" data-daily="'+id+'"><div class="dmt"><b>'+d.t+'</b><span>'+n+' / '+d.goal+' · '+d.pts+' points · '+d.sparks+' Sparks</span></div><div class="dbar"><i style="width:'+Math.round(n/d.goal*100)+'%"></i></div>'+
   (claimed?'<span class="dclaim got">✓ Claimed</span>':done?'<button class="dclaim" data-claim="'+id+'" type="button">Claim reward</button>':'<span class="dclaim wait">In progress</span>')+'</div>';
 });
 el.innerHTML='<div class="daily"><div class="dhead"><b>Daily missions</b><span>New set every day</span></div><div class="dlist">'+rows.join('')+'</div><div class="dfoot">'+(all&&st.sparksBonusGiven?'All three complete. +200 points and +100 Sparks bonus earned.':'Claim all three for +200 extra points and +100 Sparks.')+'</div></div>';
}
(function(){const el=$('#daily');if(!el)return;el.addEventListener('click',e=>{const b=e.target.closest('[data-claim]');if(b)claimDaily(b.dataset.claim)})})();

function toggleMenu(){const h=$('#hud'),b1=$('#menuToggle'),b2=$('#topMenuToggle');if(!h)return;if(h.hidden){h.hidden=false;[b1,b2].forEach(b=>{if(b){b.textContent=b===b1?'◀':'☰';b.title='Hide HUD';b.setAttribute('aria-label','Hide HUD')}});}else{h.hidden=true;[b1,b2].forEach(b=>{if(b){b.textContent=b===b1?'▶':'☰';b.title='Display HUD';b.setAttribute('aria-label','Display HUD')}});}}
function modeMonth(){const d=new Date();return d.getUTCFullYear()+'-'+String(d.getUTCMonth()+1).padStart(2,'0')}
function modeShuffle(list,seed){let h=0;for(let i=0;i<seed.length;i++)h=(h*31+seed.charCodeAt(i))>>>0;const a=list.slice();for(let i=a.length-1;i>0;i--){h=(h*1664525+1013904223)>>>0;const j=h%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function modeCandidates(kind){const all=[];CH.forEach((chapter,c)=>chapter.L.forEach((level,l)=>{if(level.boss||!Array.isArray(level.allow))return;if(kind==='debug'&&!level.start)return;if(kind==='loop'&&!(level.needs||level.allow.includes('rep')||level.allow.includes('while')))return;if(kind==='monthly'&&level.start)return;all.push({c:c,l:l,allow:level.allow.slice()})}));return all}
function modeLevels(kind){const month=modeMonth(),items=modeCandidates(kind);return modeShuffle(items,month+':'+kind).slice(0,3)}
function modeRecordKey(kind){return 'tlp-mode-best:'+kind+':'+modeMonth()+':'+PATH+':'+DIFF}
function readModeBest(kind){try{return JSON.parse(localStorage.getItem(modeRecordKey(kind))||'null')}catch(e){return null}}
function renderModeHall(){const defs=[['debug','modeDebug','modeDebugCommands'],['loop','modeLoop','modeLoopCommands'],['monthly','modeMonthly','modeMonthlyCommands']];defs.forEach(([kind,buttonId,commandsId])=>{const button=document.getElementById(buttonId),commands=document.getElementById(commandsId);if(!button)return;button.onclick=()=>startMode(kind,false);const levels=modeLevels(kind),set=[...new Set(levels.flatMap(x=>x.allow))].sort();if(commands)commands.innerHTML=set.slice(0,6).map(x=>'<i>'+((NAMES&&NAMES[x])||x)+'</i>').join('')});const reset=document.getElementById('modeResetLabel');if(reset)reset.textContent='Rotation '+modeMonth()+' UTC';const best=document.getElementById('modeBestLine');if(best){const b=readModeBest('monthly');best.textContent=b?'Monthly Protocol personal best: '+b.points+' points. Best run saved on this device.':'Monthly puzzles rotate for everyone; personal bests and replays are saved on this device.'}}
function startMode(kind,replay){try{sessionStorage.removeItem('tlp-resume')}catch(e){}const saved=replay?readModeBest(kind):null;const queue=replay&&saved&&Array.isArray(saved.levels)?saved.levels:modeLevels(kind);if(!queue.length){msg('This challenge set is not available yet.','bad');return}modeRun={kind:kind,title:{debug:'Debug Rush',loop:'Loop Lab',monthly:'Monthly Protocol'}[kind]||'Challenge',queue:queue,index:0,points:0,scripts:[],replay:!!replay,saved:saved,returnSpot:{c:S.ci,l:S.li}};showModeStage()}
function showModeStage(){if(!modeRun)return;const item=modeRun.queue[modeRun.index];S.ci=item.c;S.li=item.l;play(item.c,item.l,true);if(modeRun.replay&&modeRun.saved&&modeRun.saved.scripts&&modeRun.saved.scripts[modeRun.index]){S.script=JSON.parse(JSON.stringify(modeRun.saved.scripts[modeRun.index]));const ids=(function walk(a){return a.flatMap(b=>[b.id,...walk(b.c||[]),...walk(b.e||[])])})(S.script);S.id=Math.max(S.id,...ids,0);render()}}
function completeModeStage(st,n){if(!modeRun)return;const current=modeRun;current.scripts.push(JSON.parse(JSON.stringify(S.script)));current.points+=Math.max(50,500-n*25+st*50);if(++current.index<current.queue.length){showModeStage();return}if(current.replay){S.ci=current.returnSpot.c;S.li=current.returnSpot.l;modeRun=null;menu();toast('Best-run replay complete. No campaign score changed.');return}const old=readModeBest(current.kind),record={points:current.points,month:modeMonth(),path:PATH,diff:DIFF,levels:current.queue,scripts:current.scripts},newBest=!old||record.points>old.points;if(newBest){try{localStorage.setItem(modeRecordKey(current.kind),JSON.stringify(record))}catch(e){}}const best=readModeBest(current.kind);S.ci=current.returnSpot.c;S.li=current.returnSpot.l;modeRun=null;const replayButton=best&&best.scripts?'<button type="button" id="modeReplayBest">Replay best run</button>':'';$('#pan').innerHTML='<span class="hand">'+current.title+' - '+current.queue.length+' puzzles</span><h2>'+(newBest?'New personal best':'Challenge complete')+'</h2><div class="payoff"><span><small>This run</small><b>'+record.points+' points</b></span><span><small>Personal best</small><b>'+(best?best.points:record.points)+' points</b></span><span><small>Season</small><b>'+modeMonth()+'</b></span></div><p>Every puzzle is solved. Campaign stars, scores, and chapter unlocks were left unchanged.</p><div class="mode-result"><button class="primary" id="modeAgain">Play this mode again</button>'+replayButton+'<button id="modeMap">Chapter map</button></div>';$('#pan').classList.add('big');$('#res').hidden=false;document.getElementById('modeAgain').onclick=()=>{document.getElementById('res').hidden=true;startMode(current.kind,false)};document.getElementById('modeMap').onclick=()=>{document.getElementById('res').hidden=true;menu()};const replay=document.getElementById('modeReplayBest');if(replay)replay.onclick=()=>{document.getElementById('res').hidden=true;startMode(current.kind,true)};renderModeHall()}
function menu(){if(modeRun){S.ci=modeRun.returnSpot.c;S.li=modeRun.returnSpot.l}modeRun=null;try{sessionStorage.removeItem('tlp-resume')}catch(e){}try{localStorage.removeItem('tlp-bossend'+S.ci)}catch(e){}stopBossClock();stopNarration();stopMissionTimer();document.querySelectorAll('.coach').forEach(x=>x.remove());try{window.TLP_MUSIC&&TLP_MUSIC.setTheme(PATH)}catch(e){};const hudEl=$('#hud');if(hudEl)hudEl.hidden=false;$('#menu').hidden=false;$('#game').hidden=true;window.scrollTo({top:0,left:0,behavior:'instant'});hudFit();$('#exit').hidden=true;$('#name').value=S.name;delete document.body.dataset.sec;hud();renderPick();renderModeHall();renderContinue();renderTally();renderStreak();renderDaily();renderStatusStrip();mountAvatarLife();if(window.TLP_PRESENCE)TLP_PRESENCE.setActivity('On the chapter map · '+(PATHS_CFG[PATH]?PATHS_CFG[PATH].n:''));


  const MS=mainSecs(),kd=MS.filter(s=>done(s.boss)).length;
  $('#chs').innerHTML=`<div class="guard">${MS.map(s=>`<div class="gd ${done(s.boss)?'dead':''}">${bossBot(done(s.boss)?'dead k'+s.id:'sil','--s:5px;--ec:'+BC[s.id])}<small>${done(s.boss)?'defeated':'watching'}</small></div>`).join('')}<div class="gtxt"><b>${MS.length-kd} of ${MS.length} guardians alive</b><span>Light restored: ${kd} of ${MS.length}</span></div></div>`+MS.map((s,si)=>`<section class="sec"><h2><span class="hand">Section ${si+1}</span> ${s.t}</h2><p class="sd">${s.d}</p><div class="chs">${[...s.ch,s.boss].map(chCard).join('')}</div></section>`).join('')}
const bi=()=>BOSSES[S.ci],bkey=()=>S.ci===3?'tlp-boss':'tlp-boss'+S.ci;








let bossT=null,bossEnd=0;
function bossTimerOn(){return PATH!=='g16'&&DIFF!=='beg'}
function bossSecs(){return Math.round(({beg:150,int:120,pro:90}[DIFF]||120)*(hardMode()?.55:1))}
function bossPaused(){try{return !!(document.hidden||$('#cine')||$('#menu')&&!$('#menu').hidden||document.querySelector('.tlpm:not([hidden])')||bossWait)}catch(e){return false}}
function bossRemaining(){if(!bossTimerOn()||!bossEnd)return 0;return Math.max(0,(bossEnd-Date.now())/1000)}
function stopBossClock(){if(bossT)clearInterval(bossT);bossT=null;bossEnd=0;const el=$('#btime');if(el)el.textContent=''}
function startBossClock(){
 stopBossClock();
 if(!bossTimerOn()||!(lv()&&lv().boss))return;
 let savedEnd=0;try{savedEnd=+(B&&B._end)||0;if(!savedEnd)savedEnd=+localStorage.getItem('tlp-bossend'+S.ci)||0}catch(e){}
 if(savedEnd && savedEnd>Date.now()){bossEnd=savedEnd}else{bossEnd=Date.now()+bossSecs()*1000}
 const tick=()=>{
  if(!bossT)return;
  if(bossPaused()){bossEnd+=500;return}
  const left=Math.max(0,Math.ceil((bossEnd-Date.now())/1000)),el=$('#btime');
  if(el){el.textContent=left+'s left';el.classList.toggle('low',left<=15)}
  try{localStorage.setItem('tlp-bossend'+S.ci,String(bossEnd))}catch(e){}
  if(left<=0&&!(B.hp<=0||B.me<=0)){
   B.me--;B.lost=(B.lost||0)+1;bossDraw();snd('err');
   msg('<b>Time ran out.</b> The guardian took one of your hearts. '+Math.max(0,B.me)+' left.','bad');
   if(B.me<=0){stopBossClock();defeatScene();return}
   bossEnd=Date.now()+bossSecs()*1000;
   try{localStorage.setItem('tlp-bossend'+S.ci,String(bossEnd))}catch(e){}
  }
 };
 bossT=setInterval(tick,500);tick();
}
function bossRound(k){if(!k){let o=null;try{o=JSON.parse(localStorage.getItem(bkey())||'null')}catch(e){}B=o&&o.hp>0&&o.me>0?o:(introPending=true,{r:0,hp:100,me:DH(),max:DH(),mem:[],lost:0});try{const se=+localStorage.getItem('tlp-bossend'+S.ci)||0;if(se>Date.now())B._end=se}catch(e){}}Object.assign(lv(),bi().rounds[B.r])}
function bossDraw(brk,pre){try{if(B.hp<=0||B.me<=0){localStorage.removeItem(bkey());localStorage.removeItem('tlp-bossend'+S.ci)}else localStorage.setItem(bkey(),JSON.stringify(B))}catch(e){}
 $('#boss').innerHTML=`${bossBot('k'+bi().k,'--s:7px','bb')}<div class="nm"><b>${bi().name}</b><small>Round ${Math.min(B.r+1,4)} of 4 · ${Math.max(B.hp,0)} / 100 HP</small>${bossTimerOn()?'<span class="btime" id="btime"></span>':''}<div class="hpb"><i style="width:${Math.max(B.hp,0)}%"></i></div><div class="tnt" id="tnt">${tauntT}</div></div><div><div class="lab" style="margin:0 0 4px">Your HP</div><span class="hrt" id="hearts">${hearts(B.me+(pre?1:0),brk)}</span></div><div class="mw"><div class="lab" style="margin:0 0 4px">${nice(bi().name)} remembers</div><div class="mcs">${B.mem.length?B.mem.map(m=>`<span class="mc" title="Round ${m.r}: ${m.t}"><b>R${m.r}</b> ${m.t}</span>`).join(''):'<span class="mc">nothing yet</span>'}</div></div><button class="btn sm ghost" id="snd">Sound: ${mute?'off':'on'}</button>`;
 $('#snd').onclick=toggleMute;hudFit()}
function bossUI(){const on=!!lv().boss;$('#boss').hidden=!on;try{window.TLP_MUSIC&&TLP_MUSIC.setTheme(on?'boss':PATH)}catch(e){}if(on){tauntT=bi().taunts[B.r]||'';bossDraw();if(introPending){introPending=false;bossIntro()}}else hudFit()}
function bossIntro(){snd('intro');cine(`<div class="stage"><div class="intro-bot">${bossBot('k'+bi().k,'--s:16px')}</div><h2 class="ctitle">${bi().name}</h2><p class="csub">${bi().intro} It has 100 HP and it <b>remembers every attack that lands</b>. Use the same attack twice and it strikes back and breaks one of your hearts. There are 4 rounds, so be creative and use everything you have learned.</p><button class="btn" id="cgo">Fight!</button></div>`,'c-intro');$('#cgo').onclick=()=>{snd('hit');uncine()}}
async function bossHit(){bossWait=true;const left=bossRemaining();stopBossClock();try{const n=count(S.script);B.mem.push({r:B.r+1,g:sig(S.script),t:S.script.map(tx).join('; ')});try{localStorage.removeItem('tlp-draft')}catch(e){}
  await fly(bot,$('#bb'),'#6ae8ff',460);snd('hit');dmg('−25',$('#bb'));B.hp-=25;bot.classList.add('win');sparks();bossDraw();$('#bb').classList.add('hurt');

  const bbRect = $('#bb').getBoundingClientRect();
  burst(bbRect.left + bbRect.width/2, bbRect.top + bbRect.height/2, 30, ['#ff6b7f', '#ffd36a', 'var(--a)']);
  ringBurst(bbRect.left + bbRect.width/2, bbRect.top + bbRect.height/2, '#ff6b7f', 3);
  screenFlash('#ff6b7f', 150);
  shake($('#bb'), 15, 500);
  if(B.hp<=0){const st=Math.max(1,Math.round(B.me*3/(B.max||3))),k=key(S.ci,0),bk=bi().k;S.prog[k]=Math.max(S.prog[k]||0,st);completeLevel(k,st,{timeLeft:left,hardcore:hardMode(),noHit:(B.lost||0)===0,ms:S.runT0?Date.now()-S.runT0:0});save();hud();dailyFromWin(st,S.lastRunPts);try{if(window.TLP_ECONOMY){TLP_ECONOMY.track('level',1);TLP_ECONOMY.track('stars',st);if(st===3)TLP_ECONOMY.track('perfect',1)}}catch(e){}msg('The guardian is defeated!');try{window.TLP_ECONOMY&&TLP_ECONOMY.guardianDown()}catch(e){}await sleep(700);await winScene(bk);await badgeScene(bk);checkAch();finish(st,n);return}
  taunt(['Ow! I will remember that.','You got me. Not again though.','Nearly there... for you.'][Math.min(B.r,2)]);
  await new Promise(r=>showToast('<b>Direct hit! −25 HP.</b> The guardian memorises this attack. If you use it again, it will hit back.<br>What each block did:'+whyList(),'','Next round ▶',r));
  B.r++;play(S.ci,0,1)}finally{bossWait=false}}
function defeatScene(){stopBossClock();snd('lose');vig();try{window.TLP_LIFE&&TLP_LIFE.drain('defeat')}catch(e){}cine(`<div class="stage"><div class="bighearts">${[0,1,2].map(()=>'<span class="h"><i>♥</i><i>♥</i></span>').join('')}</div><div class="cb">${bossBot('laugh k'+bi().k,'--s:12px')}</div><h2 class="ctitle">You were defeated</h2><p class="csub">${nice(bi().name)} remembered every move you made. Read its memory next time and try something it has never seen.</p><div class="bar" style="justify-content:center"><button class="btn" id="cagain">Fight again</button><button class="btn ghost" id="cmenu">Back to menu</button></div></div>`,'c-lose');
 const hs=document.querySelectorAll('#cine .h');hs.forEach((h,i)=>setTimeout(()=>{h.classList.add('brk');snd('crack');vig('rgba(239,60,80,.4)')},500+i*650));
 setTimeout(()=>{const bb=$('#cine .bb');if(bb)shake(bb,9,500)},1500);setTimeout(()=>vig('rgba(239,60,80,.3)'),2400);
 $('#cagain').onclick=()=>{try{localStorage.removeItem(bkey())}catch(e){}try{localStorage.removeItem('tlp-bossend'+S.ci)}catch(e){}uncine();play(S.ci,0)};$('#cmenu').onclick=()=>{uncine();menu()}}
function winScene(k){let skip=false;return new Promise(res=>{const end=()=>{skip=true;uncine();setLight();res()};


 const bonus=!!(SEC[k]&&SEC[k].bonus),cast=bonus?SEC:mainSecs();
 const others=cast.map((_,i)=>i).filter(i=>i!==k),sz=[9,13,8,10,11];
 const small=others.map((j,n)=>`<div class="sw${n+1}">${bossBot(j<k?'dead k'+cast[j].id:'sil','--s:'+sz[n]+'px;--ec:'+BC[cast[j].id])}</div>`).join('');
 const c=cine(`<button class="cskip" id="cskip">Skip</button><div class="stage">${small}<div style="height:90px"></div><div id="cb" class="cb">${bossBot('hurt k'+k,'--s:15px')}</div><h2 id="ct" class="ctitle"></h2><div id="cl" class="clines"></div><button class="btn" id="cgo" hidden>Continue</button></div>`,'c-win');
 $('#cskip').onclick=end;$('#cgo').onclick=end;
 const Z=async ms=>{await sleep(ms);if(skip)throw 0};
 (async()=>{try{
  snd('boom');vig('rgba(255,255,255,.9)');
  const stageEl=c.querySelector('.stage'),cbEl=$('#cb'),cr=cbEl.getBoundingClientRect(),sr=stageEl.getBoundingClientRect();
  const sh=document.createElement('i');sh.className='cshock';sh.style.left=(cr.left-sr.left+cr.width/2)+'px';sh.style.top=(cr.top-sr.top+cr.height/2)+'px';stageEl.appendChild(sh);setTimeout(()=>sh.remove(),1000);
  shake(stageEl,12,700);
  for(let i=0;!still&&i<28;i++){const f=document.createElement('i');f.className='frag';stageEl.appendChild(f);const a=Math.random()*6.28,d=140+Math.random()*200;f.animate([{transform:'translate(0,0) rotate(0)',opacity:1},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d+70}px) rotate(${Math.random()*540}deg)`,opacity:0}],{duration:1100+Math.random()*300,easing:'ease-out'}).onfinish=()=>f.remove()}
  await Z(550);cbEl.classList.add('dying');snd('crack');await Z(700);
  cbEl.classList.remove('dying');cbEl.innerHTML=bossBot('dead k'+k,'--s:15px');$('#ct').textContent=bonus?'BONUS GUARDIAN DEFEATED':['FIRST','SECOND','THIRD','FOURTH','FIFTH'][k]+' GUARDIAN DEFEATED';snd('win');await Z(2600);
  if(bonus){
   const L=$('#cl');for(const [t,ms] of [[nice(bi().name)+' is down.',1300],['Every mission in the protocol is complete.',1500]]){const p=document.createElement('p');p.textContent=t;L.appendChild(p);await Z(ms)}
  }else{
   c.classList.add('dark');snd('ominous');await Z(1400);
   for(const s of ['.sw1','.sw2','.sw3','.sw4','.sw5']){c.querySelector(s).classList.add('on');await Z(1000)}
   const total=mainSecs().length,R=total-1-k,L=$('#cl'),lines=k<total-1?[[nice(bi().name)+' is down.',1500],['But it was only the '+['first','second','third','fourth','fifth'][k]+'.',1700],[R+' more '+(R>1?'are':'is')+' awake...',1800]]:[['The last guardian is down.',1500],['The darkness is breaking...',1700],['The light is back.',1800]];
   for(const [t,ms] of lines){const p=document.createElement('p');p.textContent=t;L.appendChild(p);await Z(ms)}
   if(k<total-1)L.insertAdjacentHTML('beforeend','<small>the light grows a little brighter</small>');else{c.classList.remove('dark');c.classList.add('dawn')}
  }
  setLight();$('#cgo').hidden=false}catch(e){}})()})}
function badgeScene(k){return new Promise(res=>{let b=[];try{b=JSON.parse(localStorage.getItem('tlp-badges')||'[]')}catch(e){}if(!b.includes(k)){b.push(k);try{localStorage.setItem('tlp-badges',JSON.stringify(b))}catch(e){}}
 const x=BAD[SEC[k]?SEC[k].id:k];snd('b'+((SEC[k]?SEC[k].id:k)+1));cine(`<div class="stage"><div class="bwrap ${x.cls}"><i class="rays"></i><i class="ring"></i><i class="ring r2"></i><div class="bico bhead">${bossBot('k'+BOSSES[(SEC[k]||SEC0[k]).boss].k,'--s:8px')}</div></div><h2 class="ctitle">Badge earned!</h2><p class="csub"><b>${x.t}</b><br>${nice(bi().name)} defeated</p><button class="btn" id="cgo">Awesome!</button></div>`,'c-badge');
 $('#cgo').onclick=()=>{uncine();res()};for(let i=0;i<24;i++)setTimeout(()=>puff(innerWidth/2+(Math.random()-.5)*160,innerHeight/2-60+(Math.random()-.5)*120,2),i*60)})}







const botIco=(k,cls)=>bossBot(cls||('k'+k),'--s:3px');
const streakDays=()=>{try{return TLP_STREAK.get().best||0}catch(e){return 0}};
const ACH=[
 {t:'Boot Sequence',ico:'<i class=ic-bolt></i>',need:100,an:'x1'},{t:'Warming Up',ico:'<i class=ic-flame></i>',need:300,an:'x2'},{t:'Bit by Bit',ico:'<i class=ic-puzzle></i>',need:600,an:'x3'},{t:'Circuit Runner',ico:'<i class=ic-bolt></i>',need:1000,an:'x4'},{t:'Logic Spark',ico:'<i class=ic-bulb></i>',need:1500,an:'x5'},{t:'Code Weaver',ico:'<i class=ic-puzzle></i>',need:2500,an:'x6'},{t:'Debugger',ico:'<i class=ic-bug></i>',need:4000,an:'x7'},{t:'Protocol Hacker',ico:'<i class=ic-shield></i>',need:6000,an:'x8'},{t:'System Architect',ico:'<i class=ic-shield></i>',need:9000,an:'x9'},
 {t:'Perfectionist',ico:'<i class=ic-star></i>',d:'Get 3 stars on 10 missions',f:()=>Object.values(S.prog).filter(v=>v>=3).length>=10,an:'x10'},
 {t:'Chapter Closer',ico:'<i class=ic-book></i>',d:'Finish 5 chapters',f:()=>ORDER.filter(c=>CH[c].L.every((_,l)=>S.prog[key(c,l)])).length>=5,an:'x11'},
 {t:'Guardian Hunter',ico:'<i class=ic-target></i>',d:'Defeat 2 guardians',f:()=>SEC.filter(s=>done(s.boss)).length>=2,an:'x12'},

 {t:'Streak Starter',ico:botIco(1),d:'Play 3 days in a row',f:()=>streakDays()>=3,an:'x13',rar:'common'},
 {t:'Week Signal',ico:botIco(3,'k3'),d:'Keep a 7 day streak',f:()=>streakDays()>=7,an:'x14',rar:'rare'},
 {t:'Month of Logic',ico:botIco(9,'k9'),d:'Keep a 30 day streak',f:()=>streakDays()>=30,an:'x15',rar:'rare'},
 {t:'Century Circuit',ico:botIco(14,'k14'),d:'Keep a 100 day streak',f:()=>streakDays()>=100,an:'x16',rar:'epic'},
 {t:'Protocol Keeper',ico:botIco(29,'k29'),d:'Keep a 365 day streak',f:()=>streakDays()>=365,an:'x17',rar:'legendary'},
 {t:'First Try',ico:botIco(4,'k4'),d:'Clear a mission on your first attempt',f:()=>Object.values(runsAll()).some(r=>r.first),an:'x18',rar:'common'},
 {t:'Untouchable',ico:botIco(19,'k19'),d:'Beat a guardian without losing a heart',f:()=>Object.values(runsAll()).some(r=>r.noHit),an:'x19',rar:'epic'},
 {t:'Hardcore Protocol',ico:botIco(24,'k24'),d:'Clear a mission with hardcore rules on',f:()=>Object.values(runsAll()).some(r=>r.hard),an:'x20',rar:'epic'},
 {t:'Daily Protocol',ico:botIco(2,'k2'),d:'Claim all three daily missions in one day',f:()=>{try{const d=dailyState();return d.ids.every(id=>d.claimed.includes(id))}catch(e){return false}},an:'x13',rar:'rare'},
 {t:'Quick Circuit',ico:botIco(5,'k5'),d:'Finish a mission in under 20 seconds',f:()=>Object.values(runsAll()).some(r=>r.bestTime&&r.bestTime<20000),an:'x18',rar:'rare'},
 {t:'Night Shift',ico:botIco(6,'k6'),d:'Play between midnight and 4 in the morning',f:()=>{const h=new Date().getHours();return h<4},an:'x13',rar:'common'},
];
ACH.forEach(a=>{if(a.need){a.d='Reach '+a.need+' score';a.f=()=>score()>=a.need;a.req='Requires '+a.need+' score'}else a.req='Requires: '+a.d});
const ach=()=>{try{return JSON.parse(localStorage.getItem('tlp-ach')||'[]')}catch(e){return[]}},badges=()=>{try{return JSON.parse(localStorage.getItem('tlp-badges')||'[]')}catch(e){return[]}};
let achQ=[],achBusy=false;
function checkAch(silent){const have=ach(),got=ACH.filter(a=>!have.includes(a.t)&&a.f());if(!got.length)return;try{localStorage.setItem('tlp-ach',JSON.stringify(have.concat(got.map(a=>a.t))))}catch(e){}if(!silent){got.forEach(a=>achQ.push(a));runQ()}}
function runQ(){if(achBusy||!achQ.length)return;achBusy=true;popAch(achQ.shift());setTimeout(()=>{achBusy=false;runQ()},4300)}
const RARNAME={common:'Common',rare:'Rare',epic:'Epic',legendary:'Legendary'};
function popAch(a){snd('ach');const e=document.createElement('div');e.className='achp'+(a.rar?' rar-'+a.rar:'');const tag=a.rar?RARNAME[a.rar]+' achievement':'Achievement unlocked';e.innerHTML=`<div class="aico ${a.an}">${a.ico}</div><div><small>${tag}</small><b>${a.t}</b><span>${a.d}</span></div>`;$('#achs').appendChild(e);

  requestAnimationFrame(() => {
    const rect = e.getBoundingClientRect();
    confettiBurst(rect.left + rect.width/2, rect.top + rect.height/2, 60);
    starBurst(rect.left + rect.width/2, rect.top + rect.height/2, 20);
    ringBurst(rect.left + rect.width/2, rect.top + rect.height/2, a.rar==='legendary' ? '#ffd36a' : a.rar==='epic' ? '#9b5cf0' : a.rar==='rare' ? '#35c9e8' : 'var(--ok)', 4);
    screenFlash(a.rar==='legendary' ? '#ffd36a' : a.rar==='epic' ? '#9b5cf0' : a.rar==='rare' ? '#35c9e8' : 'var(--ok)', 200);
  });
  setTimeout(()=>e.classList.add('out'),3700);setTimeout(()=>e.remove(),4300)}





function openLib(tab){
  tab=tab||'ach';const have=ach(),bg=badges();
  let content = '';
  if (tab==='ach') {
    content = `<div class="lgrid">${ACH.map(a=>{const u=have.includes(a.t);return `<div class="lc ${u?'':'lk'} rar-${a.rar||'common'}"><div class="aico ${u?a.an:''}">${u?a.ico:'<i class=ic-lock></i>'}</div><b>${u?a.t:'Locked'}${a.rar?'<em class="rar">'+RARNAME[a.rar]+'</em>':''}</b><span>${u?a.d:a.req}</span></div>`}).join('')}</div>`;
  } else if (tab==='bd') {
    content = `<div class="lgrid">${SEC.map(sx=>{const i=sx.id,b=BAD[i],u=bg.includes(i),nm=BOSSES[sx.boss].name;return `<div class="lc big ${u?'':'lk'}"><div class="bwrap mini ${u?b.cls:''}"><div class="bico ${u?'bhead':''}">${u?bossBot('k'+BOSSES[sx.boss].k,'--s:4px'):'<i class=ic-lock></i>'}</div></div><b>${u?b.t:'Locked'}</b><span>${u?'Earned by defeating '+nm:'Requires: defeat '+nm}</span></div>`}).join('')}</div>`;
  } else if (tab==='legacy') {
    const archive = window.TLP_AUTH ? window.TLP_AUTH.getLegacyArchive() : null;
    const count = archive && archive.data ? Object.keys(archive.data).length : 0;
    content = `<div style="text-align:left;padding:16px;background:rgba(0,0,0,0.25);border-radius:14px;border:1px solid var(--line);">
      <h3 style="font-size:20px;margin-bottom:8px;"><i class=ic-box></i> Legacy Browser Save Recovery</h3>
      <p style="color:var(--mut);font-size:14px;margin-bottom:12px;">The Lost Protocol preserves all previous browser progress in a safe archive. If you have legacy progress from earlier versions before multi-learner accounts, you can restore it here into your active profile (<b>${PATHS_CFG[PATH].n} · ${DIFFS[DIFF].n}</b>).</p>
      <div style="font-size:13px;margin-bottom:14px;">Status: <b>${count > 0 ? `${count} archived legacy keys available` : 'No unmigrated legacy saves found'}</b></div>
      ${count > 0 ? `<button class="btn sm" id="btnRestoreLegacy">Restore Legacy Progress to This Profile</button>` : ''}
    </div>`;
  }
  let l=$('#lib');if(!l){l=document.createElement('div');l.id='lib';document.body.appendChild(l)}
  l.innerHTML=`<div class="lpan"><div class="lh"><h2>Library</h2><button class="btn ghost sm" id="lx">Close</button></div><div class="ltabs"><button class="${tab==='ach'?'on':''}" data-t="ach">Achievements ${have.length}/${ACH.length}</button><button class="${tab==='bd'?'on':''}" data-t="bd">Badges ${bg.length}/${BAD.length}</button><button class="${tab==='legacy'?'on':''}" data-t="legacy">Legacy Saves</button></div>${content}</div>`;
  l.querySelectorAll('.ltabs button').forEach(b=>b.onclick=()=>openLib(b.dataset.t));$('#lx').onclick=()=>l.remove();
  const resBtn = l.querySelector('#btnRestoreLegacy');
  if (resBtn) {
    resBtn.onclick = () => {
      try {
        const res = window.TLP_AUTH.restoreLegacyProgressToProfile(null, PATH, DIFF);
        S.prog = JSON.parse(localStorage.getItem('tlp-prog') || '{}');
        save();
        alert(`Successfully restored legacy progress (${Object.keys(res.prog).length} missions)!`);
        openLib('legacy');
        menu();
      } catch(err) {
        alert('Restore error: ' + err.message);
      }
    };
  }
  l.querySelectorAll('.lc:not(.lk)').forEach(c=>c.onclick=()=>{const i=c.querySelector('.aico,.bwrap'),cl=i&&[...i.classList].find(x=>/^(x\d+|bd\d)$/.test(x));if(cl){i.classList.remove(cl);void i.offsetWidth;i.classList.add(cl)}});
}
$('#libb').onclick=()=>openLib();$('#sndg').onclick=toggleMute;$('#sndg').innerHTML=mute?'<i class=ic-mute></i>':'<i class=ic-volume></i>';



(function(){

 const btn=$('#moreBtn'),panel=$('#hudMore');

 if(!btn||!panel)return;

 const close=()=>{panel.hidden=true;btn.setAttribute('aria-expanded','false')};


 btn.onclick=e=>{e.stopPropagation();const open=panel.hidden;panel.hidden=!open;btn.setAttribute('aria-expanded',String(open))};

 panel.addEventListener('click',e=>{if(e.target.closest('.hm'))close()});

 document.addEventListener('click',e=>{if(!panel.hidden&&!panel.contains(e.target)&&!btn.contains(e.target))close()});

 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){close();btn.focus()}});
})();
$('#run').addEventListener('click',()=>snd('tick'));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const l=$('#lib');if(l)l.remove()}});
checkAch(true);{const b=badges();SEC.forEach(s=>{if(done(s.boss)&&!b.includes(s.id))b.push(s.id)});try{localStorage.setItem('tlp-badges',JSON.stringify(b))}catch(e){}}

const ev=(v,op,n,rv)=>{const x=+env[v],m=rv&&rv!=='#'?+env[rv]:+n;return op==='>'?x>m:op==='<'?x<m:x===m};
const cond=b=>{const a=ev(b.v,b.op,b.n,b.rv);return !b.j||b.j==='none'?a:b.j==='and'?a&&ev(b.v2,b.op2,b.n2,b.rv2):a||ev(b.v2,b.op2,b.n2,b.rv2)};
const OPS=[['>','is more than'],['<','is less than'],['=','is exactly']];
const cext=(b,d)=>`<select ${d} data-k="j">${sopt([['none','+ condition'],['and','AND'],['or','OR']],b.j)}</select>`+(b.j&&b.j!=='none'?` <select ${d} data-k="v2">${vopt(b.v2)}</select> <select ${d} data-k="op2">${sopt(OPS,b.op2)}</select> <select ${d} data-k="rv2">${vopt(b.rv2,1)}</select> <input type="number" ${d} data-k="n2" value="${b.n2}" ${!b.rv2||b.rv2==='#'?'':'disabled'}>`:'');
CH[1].L.push(
 L1('Keep going while...','Medium','A <b>while</b> loop repeats <i>as long as</i> its condition is true. You do not say how many times: the condition decides.','fuel holds 3. Move 1 while fuel is more than 0, and use up 1 fuel each time. Reach cell 3.',{vars:{fuel:3},allow:['while','move','change'],goal:3,par:3,path:'hook',rule:{txt:'use a while block.',f:s=>has(s,'while')},hints:['The loop should stop when fuel runs out.','Inside the loop: move 1, then lower fuel.','While fuel > 0: move 1, change fuel by -1.']}),
 L1('Count to the edge','Hard','A while loop needs something inside that changes the condition, or it would never stop.','x holds 0. While x is less than 5, add 1 to x and move 1. Reach cell 5.',{vars:{x:0},allow:['while','move','change'],goal:5,par:3,path:'snake',rule:{txt:'use a while block.',f:s=>has(s,'while')},hints:['x is the counter.','Change x inside the loop.','While x < 5: change x by 1, move 1.']}));
CH[2].L.push(
 L1('Both at once','Hard','<b>AND</b> joins two conditions. The block runs only when <i>both</i> are true. Use the + condition menu on an if block.','Go to cell 6 only if power is more than 4 AND shield is more than 1. Otherwise go to cell 2. Pass all three tests.',{vars:{power:0,shield:0},allow:['if','move'],cases:[{vars:{power:6,shield:3},goal:6},{vars:{power:6,shield:0},goal:2},{vars:{power:2,shield:3},goal:2}],par:3,path:'stairs',rule:{txt:'use an if with AND.',f:s=>any(s,b=>b.t==='if'&&b.j==='and')},hints:['Two things must be true at once.','Pick AND in the + condition menu.','If power > 4 AND shield > 1: move 6, else move 2.']}),
 L1('Either one','Hard','<b>OR</b> joins two conditions. The block runs when <i>at least one</i> is true.','Go to cell 5 if power is exactly 9 OR shield is more than 5. Otherwise go to cell 1. Pass all three tests.',{vars:{power:0,shield:0},allow:['if','move'],cases:[{vars:{power:9,shield:0},goal:5},{vars:{power:2,shield:7},goal:5},{vars:{power:2,shield:2},goal:1}],par:3,path:'maze',rule:{txt:'use an if with OR.',f:s=>any(s,b=>b.t==='if'&&b.j==='or')},hints:['Either condition is enough.','Pick OR in the + condition menu.','If power = 9 OR shield > 5: move 5, else move 1.']}),
 L1('The safe zone','Hard','You can compare the same box twice. Power must be inside a range: bigger than one number AND smaller than another.','Go to cell 3 only if power is more than 2 AND less than 8. Otherwise stay at the start. Pass all three tests.',{vars:{power:0},allow:['if','move'],cases:[{vars:{power:5},goal:3},{vars:{power:1},goal:0},{vars:{power:9},goal:0}],par:2,path:'s',rule:{txt:'use an if with AND.',f:s=>any(s,b=>b.t==='if'&&b.j==='and')},hints:['Two limits on the same box.','The second condition can use the same variable.','If power > 2 AND power < 8: move 3.']}));
CH[8].L.push(L1('Word builder (bonus)','Hard','Bonus mission. Combine casting, loops and joining: a word that is a number, a word that is text, and a loop to build both results.','n holds the word 2 and s holds go. Walk 2 cells twice, and say gogo. Convert first!',{strict:true,vars:{n:'2',s:'go',out:''},allow:['cast','join','rep','move','say'],cases:[{vars:{},goal:4,say:'gogo'}],par:5,path:'stairs',hints:['n is text, so convert it.','Each lap does two things.','Cast n. Repeat 2: join out and s into out, move n. Say out.']}));
CH[13].L.push(L1('Documented loop (bonus)','Hard','Bonus mission. Walk through a list with a loop, and explain your work with a note.','list holds 1, 2, 2. Walk every item to reach cell 5, and leave a note.',{vars:{list:[1,2,2],i:0,x:0},allow:['pick','change','rep','move','note'],goal:5,par:5,path:'snake',rule:{txt:'use pick, a repeat and a note with text.',f:s=>has(s,'pick')&&has(s,'rep')&&any(s,b=>b.t==='note'&&b.val.trim().length>2)},hints:['Three items, three laps.','i is the item number.','Repeat 3: change i by 1, pick x item i of list, move x. Add a note.']}));
CH[18].L.push(L1('Lights function (bonus)','Hard','Bonus mission. Put three bit switches inside one function, call it, then read the result in binary.','Define lights to switch on bits 4, 2 and 1. Call it, walk to total, and say bin.',{vars:{total:0,bin:'0'},fns:['lights'],allow:['bit','def','call','move','say'],cases:[{vars:{},goal:7,say:'111'}],par:7,path:'maze',rule:{txt:'define and call a function and switch on three bits.',f:s=>has(s,'def')&&has(s,'call')&&cnt(s,'bit')>=3},hints:['Bits 4 + 2 + 1 = 7.','The function holds the three bits.','Define lights: bit 4, bit 2, bit 1. Call lights. Move total. Say bin.']}));






const PATHS_CFG={
 g16:{n:'Grades 1–6',age:'Ages 6–12',d:'Visual analogies, gentle step-by-step guidance, and playful exploration.'},
 g710:{n:'Grades 7–10',age:'Ages 12–16',d:'Structured logic, computational problem-solving, and clear code flow.'},
 g1112:{n:'Grades 11–12',age:'Ages 16–18',d:'Computer science principles, syntax parallels, and state analysis.'},
 adult:{n:'College & Adult',age:'Higher Ed & Self-Taught',d:'Software engineering depth, memory mental models, and technical precision.'}
};
try{PATH=localStorage.getItem('tlp-path')||'g710'}catch(e){}
if(!PATHS_CFG[PATH])PATH='g710';
function setPath(p){
 if(!PATHS_CFG[p])return;
 if(p===PATH){applyHidden();applyPathVisuals();updateHudLearner();return}
 PATH=p;
 try{save()}catch(e){}
 try{localStorage.setItem('tlp-path',p)}catch(e){}
 try{S.prog=JSON.parse(localStorage.getItem('tlp-prog')||'{}')}catch(e){S.prog={}}
 applyPathVisuals();
 checkAch(true);
 {const b=badges();SEC.forEach(s=>{if(done(s.boss)&&!b.includes(s.id))b.push(s.id)});try{localStorage.setItem('tlp-badges',JSON.stringify(b))}catch(e){}}
 renderPick();
 updateHudLearner();
 if(!$('#game').hidden&&!lv().boss){
  const L=lv(),c=S.ci;
  $('#learn').innerHTML=lessonCard(L,c);mountLesson(c);
  $('#nar').onclick=narrate;goals();
  if(pref('guide',true)&&!lv().boss)setTimeout(coachInit,0);
 }
 syncCurrentToCloud();
}
const DIFFS={beg:{n:'Beginner',d:'New to coding. A friendly look, a tip on every mission, extra room for stars and 5 hearts in boss fights.'},int:{n:'Intermediate',d:'Some experience. The standard game: balanced hints, stars and 3 hearts in boss fights.'},pro:{n:'Professional',d:'Experienced. A terminal look, hidden cell numbers, a block limit, one hint per mission and only 2 hearts in boss fights.'}};







function settingsKey(){
 let id='guest';
 try{const l=TLP_AUTH.getActiveLearner();id=(l&&l.id)||'guest'}catch(e){}
 return 'tlp-settings:'+id;
}
function settingsAll(){
 try{
  const own=JSON.parse(localStorage.getItem(settingsKey())||'{}');



  const k=settingsKey();
  let merged={};
  if(k!=='tlp-settings:default'){
   try{merged=JSON.parse(localStorage.getItem('tlp-settings:default')||'{}')}catch(e){}
  }


  try{
   const l=window.TLP_AUTH&&TLP_AUTH.getActiveLearner?TLP_AUTH.getActiveLearner():null;
   const lk=l&&l.avatar&&l.avatar.look;
   if(lk&&typeof lk==='object')merged=Object.assign(merged,lk);
  }catch(e){}
  return Object.assign(merged,own);
 }catch(e){return{}}
}
function pref(k,def){const v=settingsAll()[k];return v===undefined?def:v}
function setPref(k,v){const p=settingsAll();p[k]=v;try{localStorage.setItem(settingsKey(),JSON.stringify(p))}catch(e){}applyPrefs();try{window.dispatchEvent(new Event('tlp-prefs-change'))}catch(e){}try{if(window.TLP_AVATAR&&TLP_AVATAR.setLook)TLP_AVATAR.setLook({[k]:v})}catch(e){}}


window.addEventListener('tlp-auth-ready',()=>{try{applyPrefs()}catch(e){}});


function kidMode(){return PATH==='g16'&&pref('kidfx',true)&&!(window.TLP&&TLP.FX.get())}
function applyPrefs(){
 applyLook();
 document.body.classList.toggle('kid-fx',kidMode());


 document.body.classList.toggle('amb-fx',pref('ambientfx',true)&&!(window.TLP&&TLP.FX.get()));


 document.body.classList.toggle('hardcore',hardMode());


 if(!window.TLP_AFK)window.TLP_AFK={};
 window.TLP_AFK.ms=DIFF==='pro'?180000:240000;
 window.TLP_AFK.enabled=()=>PATH==='adult'&&(DIFF==='int'||DIFF==='pro')&&pref('afk',true);
 window.TLP_AFK.disable=()=>setPref('afk',false);
 applyLook();
}



const FONT_KEYS=['','mono','serif','round','hand','cond','type','eleg','tech','play','gothic','script'];
const BG_KEYS=['auto','orbs','grid','griddrift','stars','rain','aurora','sunset','circuit','nebula','bokeh','none'];
const FTC_KEYS=['','warm','mint','ice','rose','amber','viol','mono','cyan','gold','snow'];
const TXF_KEYS=['','glow','flow','pulse','rainbow','sparkle','scan','wave'];
const SURF_KEYS=['glass','solid','outlined','neon'];
const BLKS_KEYS=['soft','sharp','outline','neon','ghost','glow'];
const USCALE_KEYS=['sm','md','lg'];
function applyLook(){
 const b=document.body;
 const ok=(cat,v)=>uiPremiumOK(cat,v);
 b.classList.remove(...BG_KEYS.filter(k=>k!=='auto').map(k=>'bg-'+k),'bgx-orbs','bgx-grid','bgx-none');
 const bg=pref('bgfx','auto');const bgOK=BG_KEYS.includes(bg)&&bg!=='auto'&&ok('bgfx',bg);
 if(bgOK)b.classList.add('bg-'+bg);
 b.dataset.bgfx=bgOK?bg:'auto';
 b.classList.remove(...FONT_KEYS.filter(Boolean).map(k=>'fnt-'+k));
 const f=pref('font','');if(FONT_KEYS.includes(f)&&f&&ok('font',f))b.classList.add('fnt-'+f);
 b.classList.remove(...FTC_KEYS.filter(Boolean).map(k=>'ftc-'+k));
 const c=pref('fontcolor','');if(FTC_KEYS.includes(c)&&c&&ok('fontcolor',c))b.classList.add('ftc-'+c);
 b.classList.remove(...TXF_KEYS.filter(Boolean).map(k=>'txf-'+k));
 const t=pref('textfx','');if(TXF_KEYS.includes(t)&&t&&ok('textfx',t))b.classList.add('txf-'+t);
 b.classList.remove(...SURF_KEYS.map(k=>'surf-'+k));
 const sf=pref('surface','glass');if(SURF_KEYS.includes(sf)&&ok('surface',sf))b.classList.add('surf-'+sf);
 b.classList.remove(...BLKS_KEYS.map(k=>'blks-'+k));
 const bl=pref('blocks','soft');if(BLKS_KEYS.includes(bl)&&ok('blocks',bl))b.classList.add('blks-'+bl);
 b.classList.remove(...USCALE_KEYS.map(k=>'uiz-'+k));
 const us=pref('uiscale','md');if(USCALE_KEYS.includes(us))b.classList.add('uiz-'+us);
 b.classList.toggle('ui-goal',pref('goalfx',true));
 b.classList.toggle('ui-robot',pref('robotfx',true));
 b.classList.toggle('ui-ambient',pref('ambientfx',true)&&!(window.TLP&&TLP.FX.get()));
}



let breakMin=0,breakT=null;
function startBreakClock(){
 if(breakT)return;
 breakT=setInterval(()=>{
  if(document.hidden)return;
  if(!kidMode()||!pref('breaks',true)){breakMin=0;return}
  if($('#brk')||$('#cine')||document.querySelector('.tlpm:not([hidden])'))return;
  if(++breakMin>=breakEvery()){breakMin=0;showBreak()}
 },60000);
}
function breakEvery(){const n=Number(pref('breakmin',15));return [10,15,20,30].includes(n)?n:15}
function showBreak(){
 if($('#brk'))return;
 const every=breakEvery();
 const p=document.createElement('div');p.id='brk';p.className='tlpm';
 p.innerHTML='<div class="tlpm-pan breakpan" role="dialog" aria-modal="true" aria-labelledby="brkT"><div class="breakbot" aria-hidden="true">⭐</div><h2 id="brkT">Time for a quick break!</h2><p>You have been solving puzzles for '+every+' minutes. Stand up, stretch your arms, look out of the window and drink some water. Your robot will wait for you.</p><div class="tlpm-row"><button class="tlpm-btn pri" id="brkOk" type="button">I am back</button><button class="tlpm-btn" id="brkOff" type="button">Do not remind me</button></div></div>';
 document.body.appendChild(p);
 const ok=$('#brkOk'),off=$('#brkOff');
 if(ok)ok.onclick=()=>{p.remove();snd('chime')};
 if(off)off.onclick=()=>{setPref('breaks',false);p.remove()};
}

const KID_PRAISE=['You are a star!','Brilliant work!','High five!','Amazing thinking!','You did it!','Superb!'];
function kidPraise(){return KID_PRAISE[Math.floor(Math.random()*KID_PRAISE.length)]}
function kidBurst(){
 if(still||!kidMode())return;
 const host=$('#pan')||document.body,r=host.getBoundingClientRect();
 for(let i=0;i<22;i++){
  const s=document.createElement('span');s.className='kidspark';
  s.textContent=['⭐','🌟','💫','❤️','✨'][i%5];
  s.style.cssText=`left:${r.left+r.width/2+(Math.random()-.5)*240}px;top:${r.top+Math.random()*80}px`;
  document.body.appendChild(s);
  const a=Math.random()*6.28,d=60+Math.random()*160;
  s.animate([{transform:'translate(0,0) scale(.6)',opacity:0},{transform:'translate(0,-10px) scale(1)',opacity:1,offset:.15},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d}px) rotate(${Math.random()*360}deg)`,opacity:0}],{duration:1400+Math.random()*500,easing:'ease-out'}).onfinish=()=>s.remove();
 }
}
try{DIFF=localStorage.getItem('tlp-diff')||'int'}catch(e){}
const DH=()=>hardMode()?1:((DIFF==='beg'?5:DIFF==='pro'?2:3)+({g16:2,g710:1}[PATH]||0)),PB=()=>(DIFF==='beg'?2:0)+({g16:2,g710:1}[PATH]||0);






const TALLY_URL='';
function applyPathVisuals(){
 document.body.classList.remove('path-g16','path-g710','path-g1112','path-adult');
 const p=PATH||'g710';
 document.body.classList.add('path-'+p);
 bfxUpdate();
 try{applyPrefs()}catch(e){}

 try{window.TLP_MUSIC&&TLP_MUSIC.setTheme(PATH)}catch(e){}
}
function applyDiff(){document.body.classList.remove('d-beg','d-int','d-pro');if(DIFF)document.body.classList.add('d-'+DIFF);try{applyPrefs()}catch(e){}try{cvUpdate()}catch(e){}}
function bonusState(){try{const l=TLP_AUTH.getActiveLearner();const ok=!!window.__adminPreview||!!((l&&(l.completed_diffs||[]).length)||(mainSecs().length&&mainSecs().every(x=>done(x.boss))));const b=$('#bonusLink');if(b){if(!b._h){b._h=1;b.addEventListener('click',e=>{if(b.classList.contains('lockedx')){e.preventDefault();msg('The Bonus sections unlock after you finish the main story.','bad')}})}b.classList.toggle('lockedx',!ok);b.title=ok?'Open the Bonus sections':'Unlocks after you finish the main story';b.setAttribute('aria-disabled',!ok);}}catch(e){}}
function updateHudLearner(){try{bonusState()}catch(e){}
 const pn=$('#pn');if(pn)pn.textContent=S.name||'Player';
 const badge=$('#pathBadge');if(badge&&PATHS_CFG[PATH]){badge.textContent=PATHS_CFG[PATH].n;badge.title=PATHS_CFG[PATH].age+' · '+PATHS_CFG[PATH].d}
 const acc=$('#accountLink');
 if(acc&&window.TLP_AUTH){
  const user=window.TLP_AUTH.getCurrentUser();
  if(user){


   acc.textContent=user.role==='parent'?'Parent Area':'Account';
   acc.href=user.role==='parent'?'parent.html':'auth.html';
   acc.title='Signed in as '+user.displayName+' — account and sync';
  }else{
   acc.textContent='Account';
   acc.href='auth.html';
   acc.title='Account and sync';
  }
 }
}
const players=()=>{try{return JSON.parse(localStorage.getItem('tlp-players')||'{}')}catch(e){return{}}};
let lastReg=null,remoteT=null;
function regPlayer(){if(!DIFF)return;const P=players();if(lastReg&&lastReg!==S.name)delete P[lastReg];P[S.name]=DIFF;lastReg=S.name;try{localStorage.setItem('tlp-players',JSON.stringify(P))}catch(e){}renderTally();
 if(TALLY_URL)fetch(TALLY_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({id:pid(),name:S.name,diff:DIFF})}).then(r=>r.json()).then(t=>{if(t&&typeof t.beg==='number'){remoteT=t;renderTally()}}).catch(()=>{})}
const pid=()=>{let p='';try{p=localStorage.getItem('tlp-pid')||'';if(!p){p=Math.random().toString(36).slice(2)+Date.now().toString(36);localStorage.setItem('tlp-pid',p)}}catch(e){}return p||'anon'};
function loadRemote(){if(TALLY_URL)fetch(TALLY_URL).then(r=>r.json()).then(t=>{if(t&&typeof t.beg==='number'){remoteT=t;renderTally()}}).catch(()=>{})}
function renderTally(){const el=$('#tally');if(!el)return;const c=remoteT||Object.values(players()).reduce((a,v)=>(a[v]=(a[v]||0)+1,a),{beg:0,int:0,pro:0});
 el.innerHTML=`Players so far: <b>${c.beg||0}</b> beginner${c.beg===1?'':'s'} · <b>${c.int||0}</b> intermediate · <b>${c.pro||0}</b> professional${c.pro===1?'':'s'}`}
function pathCards(){return Object.entries(PATHS_CFG).map(([k,v])=>`<button class="dp ${PATH===k?'on':''}" data-path="${k}"><b>${v.n}</b><span>${v.age} · ${v.d}</span></button>`).join('')}
function diffCards(){return Object.entries(DIFFS).map(([k,v])=>`<button class="dp ${DIFF===k?'on':''}" data-d="${k}"><b>${v.n}</b><span>${v.d}</span></button>`).join('')}

function openAdminPreview(){let m=$('#apm');
 if(!m){m=document.createElement('div');m.id='apm';m.className='tlpm';m.hidden=true;document.body.appendChild(m);m.addEventListener('click',e=>{if(e.target===m)m.hidden=true});document.addEventListener('keydown',e=>{if(e.key==='Escape')m.hidden=true})}
 m.innerHTML=`<div class="tlpm-pan" role="dialog" aria-modal="true" aria-labelledby="apt"><button class="tlpm-x" type="button" id="apx" aria-label="Close"><i class=ic-close></i></button><h2 id="apt">Admin preview</h2><p class="s">Open any chapter or level, under any age version and difficulty. Nothing here is saved to a learner.</p>
 <div class="lab">Age version</div><div class="tlpm-row" style="justify-content:flex-start;flex-wrap:wrap">${Object.entries(PATHS_CFG).map(([k,v])=>`<button class="tlpm-btn${PATH===k?' pri':''}" data-path="${k}" type="button">${v.n}</button>`).join('')}</div>
 <div class="lab">Difficulty</div><div class="tlpm-row" style="justify-content:flex-start;flex-wrap:wrap">${Object.entries(DIFFS).map(([k,v])=>`<button class="tlpm-btn${DIFF===k?' pri':''}" data-d="${k}" type="button">${v.n}</button>`).join('')}</div>
 <div>${ORDER.map(c=>`<div style="margin:8px 0"><b>${CH[c].n||''} ${CH[c].t}</b><div class="tlpm-row" style="justify-content:flex-start;margin-top:6px">${CH[c].L.map((_,li)=>`<button class="tlpm-btn" data-c="${c}" data-l="${li}" type="button">Level ${li+1}</button>`).join('')}</div></div>`).join('')}</div><div class="tlpm-row" style="justify-content:flex-start">${SEC.map(x=>`<button class="tlpm-btn" data-badge="${x.id}" type="button">Badge ${x.id+1}</button>`).join('')}</div></div>`;
 m.hidden=false;$('#apx').onclick=()=>{m.hidden=true};
 m.querySelectorAll('button[data-path]').forEach(b=>b.onclick=()=>{setPath(b.dataset.path);applyHidden();if(!$('#menu').hidden)menu();openAdminPreview()});
 m.querySelectorAll('button[data-d]').forEach(b=>b.onclick=()=>{setDiff(b.dataset.d);openAdminPreview()});
 m.querySelectorAll('button[data-c]').forEach(b=>b.onclick=()=>{m.hidden=true;play(+b.dataset.c,+b.dataset.l)});
 m.querySelectorAll('button[data-badge]').forEach(b=>b.onclick=()=>{m.hidden=true;try{badgeScene(+b.dataset.badge)}catch(e){}})}




function nextTarget(){
 for(const c of ORDER){ if(!done(c)) return c }
 return -1;
}
function nextLevel(c){
 const L=CH[c].L;
 for(let i=0;i<L.length;i++){ if(!isBonus(L[i])&&!S.prog[key(c,i)]) return i }
 return 0;
}
function renderContinue(){
 const box=$('#cont'),name=$('#contName'),btn=$('#contBtn');
 if(!box||!name||!btn)return;
 if(window.__adminPreview){box.hidden=true;return}
 const c=nextTarget();
 if(c<0){box.hidden=true;return}
 const l=nextLevel(c);
 box.hidden=false;
 name.textContent=(CH[c].n?CH[c].n+' · ':'')+CH[c].L[l].t;
 btn.onclick=()=>{
  if(!Object.keys(S.prog).length&&window.TLP_STORY&&!TLP_STORY.seen('intro')){storyOpening();return}
  play(c,l);
 };
}
function renderPick(){const el=$('#pick');if(!el)return;
 const pc=PATHS_CFG[PATH]||{n:'',age:'',d:''};
 el.innerHTML=`<div class="lab">Your learning path</div><div class="psum"><b>${pc.n}</b><span>${pc.age} · ${pc.d}</span></div><div class="lab" style="margin-top:14px">Your difficulty</div><div class="psum"><b>${DIFFS[DIFF].n}</b><span>${DIFFS[DIFF].d}</span><button class="btn ghost sm" id="chDiff" type="button">Difficulty settings</button></div>`;
 const b=$('#chDiff');if(b)b.onclick=openDiffSettings}
const ladderOk=l=>{const dn=(l&&l.completed_diffs)||[],st=(l&&(l.start_diff))||DIFF;return d=>d===st||dn.includes(d)||(d==='int'&&dn.includes('beg'))||(d==='pro'&&dn.includes('int'))||dn.includes('pro')};
function openDiffSettings(){let m=$('#dsm');
 if(!m){m=document.createElement('div');m.id='dsm';m.className='tlpm';m.hidden=true;document.body.appendChild(m);m.addEventListener('click',e=>{if(e.target===m)m.hidden=true});document.addEventListener('keydown',e=>{if(e.key==='Escape')m.hidden=true})}
 const admin=!!window.__adminPreview;
 const l=window.TLP_AUTH&&TLP_AUTH.getActiveLearner();const ok=admin?(()=>true):ladderOk(l);let pend=null;
 m.innerHTML=`<div class="tlpm-pan" role="dialog" aria-modal="true" aria-labelledby="dst"><button class="tlpm-x" type="button" id="dsx" aria-label="Close"><i class=ic-close></i></button><h2 id="dst">Difficulty</h2><p class="s">${admin?'Preview only. Switching here does not change any learner account.':'Finish one difficulty to unlock the next. Picking a locked one starts this learner over.'}</p>${['beg','int','pro'].map(d=>`<button class="dsopt" data-d="${d}" type="button"><b>${DIFFS[d].n}</b><span>${DIFFS[d].d}</span><em>${d===DIFF?'Current':admin?'Preview. Nothing is saved.':ok(d)?'Keeps your progress.':'Locked. Starts over.'}</em></button>`).join('')}<div id="dsconf" hidden><div class="warnx">Changing to <b id="dsname"></b> wipes this learner's progress, stars and leaderboard entries. Type <b>RESET MY PROGRESS</b> to go ahead.</div><input id="dstxt" autocomplete="off" aria-label="Confirmation sentence"><div class="tlpm-row"><button class="tlpm-btn" id="dscancel" type="button">Cancel</button><button class="tlpm-btn pri" id="dsgo" type="button" disabled>Reset and change</button></div></div><p class="tlpm-note" id="dsmsg" role="status" aria-live="polite"></p></div>`;
 m.hidden=false;const msg=t=>{$('#dsmsg').textContent=t};
 $('#dsx').onclick=()=>{m.hidden=true};
 m.querySelectorAll('.dsopt').forEach(b=>b.onclick=async()=>{const d=b.dataset.d;if(d===DIFF)return;msg('');
  if(admin){setDiff(d);m.hidden=true;return}
  if(!l||l.isGuest||!TLP_AUTH.isCloudConfigured()){setDiff(d);m.hidden=true;return}
  if(ok(d)){try{msg('Switching...');await TLP_AUTH.switchDifficulty(l.id,d);location.reload()}catch(e){msg(e.message)}}
  else{pend=d;$('#dsname').textContent=DIFFS[d].n;$('#dsconf').hidden=false;$('#dstxt').value='';$('#dsgo').disabled=true;$('#dstxt').focus()}});
 $('#dstxt').oninput=()=>{$('#dsgo').disabled=$('#dstxt').value!=='RESET MY PROGRESS'};
 $('#dscancel').onclick=()=>{$('#dsconf').hidden=true;pend=null};
 $('#dsgo').onclick=async()=>{try{msg('Resetting...');await TLP_AUTH.switchDifficulty(l.id,pend,'RESET MY PROGRESS');
   try{Object.keys(localStorage).filter(k=>k.indexOf(l.id)>=0).forEach(k=>localStorage.removeItem(k))}catch(e){}location.reload()}catch(e){msg(e.message)}}}



function openSettings(){
 let m=$('#stm');
 if(!m){m=document.createElement('div');m.id='stm';m.className='tlpm';m.hidden=true;document.body.appendChild(m);m.addEventListener('click',e=>{if(e.target===m)m.hidden=true});document.addEventListener('keydown',e=>{if(e.key==='Escape')m.hidden=true})}
 const row=(id,on,title,desc)=>'<label class="setrow" for="'+id+'"><span><b>'+title+'</b><small>'+desc+'</small></span><input type="checkbox" id="'+id+'"'+(on?' checked':'')+'></label>';
 const music=window.TLP_MUSIC?row('setMusic',TLP_MUSIC.isEnabled(),'Music','Background music. It changes with your age and gets faster as you play.'):'';
 const hard=PATH==='g1112'||PATH==='adult'?row('setHard',hardMode(),'Hardcore mode','No hints, fewer blocks, faster guardians. 1.5× score.'):'';
 m.innerHTML='<div class="tlpm-pan" role="dialog" aria-modal="true" aria-labelledby="stt"><button class="tlpm-x" type="button" id="stx" aria-label="Close"><i class=ic-close></i></button><h2 id="stt">Settings</h2><p class="s">Saved on this device for this learner.</p>'+
  '<div class="setlab">Volume</div>'+(window.TLP_VOL?TLP_VOL.ui():'')+
  '<div class="setlab">Appearance</div>'+
  '<label class="setrow" for="setTheme"><span><b>Theme</b><small>Auto follows this device. Light is easier in a bright room.</small></span><select id="setTheme">'+
    [['auto','Auto'],['light','Light'],['dark','Dark']].map(o=>'<option value="'+o[0]+'"'+(window.TLP_THEME&&TLP_THEME.pref()===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></label>'+
  '<div class="tlpm-row" style="margin:4px 0 6px"><button class="tlpm-btn" id="setLook" type="button">Customize appearance…</button><small class="ui-note" style="margin:0">Backgrounds, fonts, colors and styles with live preview.</small></div>'+
  '<div class="setlab">Game</div>'+
  row('setGuide',pref('guide',true),'Guided steps','A tip list on every mission.')+
  row('setKid',pref('kidfx',PATH==='g16'),'Extra animations','More stars and celebrations.')+
  row('setAmbient',pref('ambientfx',true),'Ambient animations','Gentle motion on the track, memory boxes, and cards.')+
  row('setBreaks',pref('breaks',PATH==='g16'),'Break reminders','A reminder to stretch and drink water.')+
  '<label class="setrow" for="setBreakMin"><span><b>Break every</b><small>How often the reminder appears.</small></span><select id="setBreakMin">'+[10,15,20,30].map(m=>'<option value="'+m+'"'+(m===breakEvery()?' selected':'')+'>'+m+' min</option>').join('')+'</select></label>'+
  row('setAfk',pref('afk',true),'Idle surprise',PATH==='g16'?'A playful robot pop-up if you stop for a while.':'A short scare if you stop playing for too long.')+
  music+hard+
  '<div class="tlpm-row"><button class="tlpm-btn" id="setDiff" type="button">Difficulty</button><button class="tlpm-btn" id="setStory" type="button">Opening story</button><button class="tlpm-btn" id="setTour" type="button">How to play</button><button class="tlpm-btn pri" id="setClose" type="button">Close</button></div></div>';
 m.hidden=false;
 {const pan=m.querySelector('.tlpm-pan');if(pan)pan.scrollTop=0}
 $('#stx').onclick=()=>{m.hidden=true};
 $('#setClose').onclick=()=>{m.hidden=true};
 $('#setDiff').onclick=()=>{m.hidden=true;openDiffSettings()};
 $('#setStory').onclick=()=>{m.hidden=true;try{storyScenes(TLP_STORY.opening(PATH),()=>TLP_STORY.mark('intro'))}catch(e){}};
 $('#setTour').onclick=()=>{m.hidden=true;runTour(true)};
 const wire=(id,key)=>{const el=$('#'+id);if(el)el.onchange=()=>setPref(key,el.checked)};
 wire('setGuide','guide');wire('setKid','kidfx');wire('setAmbient','ambientfx');wire('setBreaks','breaks');wire('setAfk','afk');
 const bm=$('#setBreakMin');if(bm)bm.onchange=()=>{setPref('breakmin',Number(bm.value));breakMin=0};
 if(window.TLP_VOL)TLP_VOL.wire(m,kind=>snd(kind));
 const tsel=$('#setTheme');if(tsel)tsel.onchange=()=>{if(window.TLP_THEME)TLP_THEME.set(tsel.value);snd('chime')};
 const sl=$('#setLook');if(sl)sl.onclick=()=>{m.hidden=true;openUI()};
 const mus=$('#setMusic');if(mus)mus.onchange=()=>{TLP_MUSIC.setEnabled(mus.checked);snd('chime')};
 wire('setHard','hard');
 {const sh=$('#setHard');if(sh)sh.onchange=()=>{setPref('hard',sh.checked);if(sh.checked)document.querySelectorAll('.coach').forEach(x=>x.remove())}}
}
async function difficultyCelebration(next){
 try{const l=TLP_AUTH.getActiveLearner();if(l&&!l.isGuest){const r=await TLP_AUTH.markDifficultyCompleted(l.id,DIFF);l.completed_diffs=r}}catch(e){}
 const t=(DIFF==='beg'?'You finished the game on Beginner. Intermediate is now unlocked.':DIFF==='int'?'You finished the game on Intermediate. Professional is now unlocked.':'Congratulations, you finished the game as a Professional. If you want to go back and try Beginner and Intermediate, you can do that from the difficulty settings.')+' The Bonus sections are now unlocked from the top bar.';
 const c=cine(`<div class="stage"><h2 class="ctitle">Difficulty complete</h2><p class="csub">${t}</p><div class="bar" style="justify-content:center"><button class="btn" id="dc-ok" type="button">Continue</button></div></div>`);
 c.querySelector('#dc-ok').onclick=()=>{uncine();next()}}
function pickModal(){
 cine(`<div class="stage"><h2 class="ctitle">Welcome to The Lost Protocol</h2><p class="csub">Choose your learning path and gameplay difficulty. Both can be switched anytime from the menu without resetting progress.</p><div class="lab">1. Choose your learning path</div><div class="dps" id="m-paths">${pathCards()}</div><div class="lab" style="margin-top:14px">2. Choose your difficulty</div><div class="dps" id="m-diffs">${diffCards()}</div><div style="margin-top:16px;text-align:right"><button class="btn" id="m-start">Confirm & Begin</button></div></div>`,'c-intro');
 document.querySelectorAll('#m-paths .dp').forEach(b=>b.onclick=()=>{setPath(b.dataset.path);document.querySelectorAll('#m-paths .dp').forEach(x=>x.classList.toggle('on',x===b));snd('chime')});
 document.querySelectorAll('#m-diffs .dp').forEach(b=>b.onclick=()=>{setDiff(b.dataset.d);document.querySelectorAll('#m-diffs .dp').forEach(x=>x.classList.toggle('on',x===b));snd('chime')});
 const b=$('#m-start');if(b)b.onclick=()=>{if(!DIFF)setDiff('int');snd('win');uncine();storyOpening()}}
$('#name').addEventListener('change',regPlayer);
const setBtn=$('#setOpen');if(setBtn)setBtn.onclick=openSettings;
const avBtn=$('#avOpen');if(avBtn)avBtn.onclick=()=>{try{window.TLP_AVATAR&&TLP_AVATAR.open()}catch(e){}};

window.addEventListener('tlp-fx-change',()=>{try{applyPrefs()}catch(e){}});
applyHidden();applyDiff();renderTally();loadRemote();
{const P=players();if(P[S.name])lastReg=S.name}


const BK=(t,p,c,e)=>Object.assign(mk(t),p||{},{c:c||[],e:e||[]});
BAD.push({t:'Vault Breaker',ico:'<i class=ic-lock></i>',cls:'bd5'},{t:'Origin Slayer',ico:'<i class=ic-crown></i>',cls:'bd6'});
const B5=[
 RD('The Byte · Round 1: Switch strike','The Byte lives in the vault of ones and zeros. It has <b>100 HP</b> and <b>remembers every attack that lands</b>. Round 1: switch bits to make 6, walk there and say its binary form.','Make 6 with bit switches, walk to cell 6 and say bin.',[{vars:{},goal:6,say:'110'}],4,{txt:'switch on at least two bits.',f:s=>cnt(s,'bit')>=2},['4 + 2 = 6.','bin shows the binary form.','Bit 4, bit 2, move total, say bin.'],'maze',{vars:{total:0,bin:'0'}}),
 RD('The Byte · Round 2: Conversion strike','<b>Round 2.</b> The Byte speaks both languages. Convert there and back.','n holds 5. Convert it to binary and say it, then convert it back and walk it.',[{vars:{},goal:5,say:'101'}],5,{txt:'convert at least twice.',f:s=>cnt(s,'base')>=2},['One conversion each way.','The word goes in b, the number comes back in m.','Convert n to binary into b, say b, convert b from binary into m, move m.'],'stairs',{vars:{n:5,b:'',m:0}}),
 RD('The Byte · Round 3: Operation strike','<b>Round 3.</b> Strike with a bitwise operator.','a holds 6. Combine it with 3 using a bitwise operator so the robot reaches cell 2.',[{vars:{},goal:2}],2,{txt:'use a bitwise or shift operator.',f:s=>any(s,b=>b.t==='calc'&&['&','|','^','<<','>>'].includes(b.op))},['6 is 110 and 3 is 011.','Only the middle bit is on in both.','Calculate r = a AND 3, then move r.'],'s',{vars:{a:6,r:0}}),
 RD('The Byte · Round 4: Finishing blow','<b>Final blow.</b> Shift, convert and say, all in one attack it has never seen.','n holds 3. Shift it left by 1, say the result in binary, and walk the result.',[{vars:{},goal:6,say:'110'}],4,{txt:'use a left shift and a conversion.',f:s=>any(s,b=>b.t==='calc'&&b.op==='<<')&&has(s,'base')},['3 shifted left is 6.','Convert 6 to binary to say it.','Calculate r = n shift left 1, convert r to binary into b, say b, move r.'],'snake',{vars:{n:3,r:0,b:''}})];
const B6=[
 RD('The Origin · Round 1: Search strike','The Origin is the first bug, and every other guardian came from it. It has <b>100 HP</b> and <b>remembers every attack that lands</b>. Round 1: find the 8.','Walk to the position of the number 8 in the list. Pass all three tests.',[{vars:{list:[3,8,5]},goal:2},{vars:{list:[8,1,1]},goal:1},{vars:{list:[2,2,8]},goal:3}],5,{txt:'use pick, a repeat and an if.',f:s=>has(s,'pick')&&has(s,'rep')&&has(s,'if')},['Look at each item.','Move by i when x is 8.','Repeat 3: change i, pick x item i, if x = 8 then move i.'],'maze',{vars:{list:[3,8,5],i:0,x:0}}),
 RD('The Origin · Round 2: Logic strike','<b>Round 2.</b> The Origin only opens when two things are true.','Go to cell 4 only if power is more than 2 AND shield is more than 1. Otherwise stay. Pass all three tests.',[{vars:{power:5,shield:3},goal:4},{vars:{power:1,shield:3},goal:0},{vars:{power:5,shield:0},goal:0}],3,{txt:'use an if with AND.',f:s=>any(s,b=>b.t==='if'&&b.j==='and')},['Both conditions at once.','Use the + condition menu.','If power > 2 AND shield > 1: move 4.'],'stairs',{vars:{power:0,shield:0}}),
 RD('The Origin · Round 3: Echo strike','<b>Round 3.</b> Defeat it with a function that calls itself.','Define walk so it calls itself until n reaches 0. Pass both tests.',[{vars:{n:4},goal:4},{vars:{n:2},goal:2}],6,{txt:'call the function from inside itself.',f:s=>any(s,b=>b.t==='def'&&has(b.c,'call'))},['The if block is the stopping rule.','Move, lower n, call walk.','Define walk: if n > 0 [move 1, change n by -1, call walk]. Call walk.'],'s',{vars:{n:0},fns:['walk']}),
 RD('The Origin · Round 4: Finishing blow','<b>Final blow.</b> Find the biggest item, explain it with a note, and combine everything you know.','Walk to the biggest number in the list and add a note. Pass both tests.',[{vars:{list:[2,8,4]},goal:8},{vars:{list:[7,1,3]},goal:7}],7,{txt:'use pick, repeat, if, calculate and a note with text.',f:s=>has(s,'pick')&&has(s,'rep')&&has(s,'if')&&has(s,'calc')&&any(s,b=>b.t==='note'&&b.val.trim().length>2)},['Remember the best so far.','If x is bigger, copy it into best.','Repeat 3: change i, pick x, if x > best then calculate best = x + 0. Move best. Add a note.'],'snake',{vars:{list:[2,8,4],i:0,x:0,best:0}})];
BOSSES[24]={k:4,name:'THE BYTE',rounds:B5,taunts:['Zero. One. Zero. One.','Count me if you can.','I flip, you fall.','The vault stays shut.'],intro:'It lives in the vault of ones and zeros.'};
BOSSES[29]={k:5,name:'THE ORIGIN',rounds:B6,taunts:['I was the first bug.','Search me. Debug me. You cannot.','Everything leads back to me.','This is where it began.'],intro:'The first bug, the one every other guardian came from.'};
const _snd=snd;snd=function(k){if(k!=='b5'&&k!=='b6')return _snd(k);if(mute)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const t=AC.currentTime,fxv=window.TLP_VOL?TLP_VOL.factor('fx'):1;if(fxv<=0)return;const T=(f,d,w,v,s)=>{const o=AC.createOscillator(),g=AC.createGain();o.type=w;o.frequency.setValueAtTime(f,t+s);g.gain.setValueAtTime(v*fxv,t+s);g.gain.exponentialRampToValueAtTime(.001,t+s+d);o.connect(g);g.connect(AC.destination);o.start(t+s);o.stop(t+s+d)};
 if(k==='b5')[262,330,392,523,659,784,1047].forEach((f,i)=>T(f,.18,'square',.07,i*.07));else{[196,247,294,392].forEach(f=>T(f,2,'sawtooth',.05,0));[523,659,784,1047,1319,1568].forEach((f,i)=>T(f,.7,'triangle',.08,.4+i*.12))}}catch(e){}};
const _render=render;render=function(){_render.apply(this,arguments);cvUpdate()};





function cvUpdate(){let el=$('#cv');if(DIFF!=='pro'){if(el)el.hidden=true;return}if(!el){const w=$('#area')&&$('#area').closest('.card');if(!w)return;el=document.createElement('pre');el.id='cv';el.className='cv';w.appendChild(el)}el.hidden=false;el.textContent='// your program\n'+(S.script.length?S.script.map(tx).join('\n'):'(empty)')}
function cheer(){const r=bot.getBoundingClientRect();for(let i=0;i<4;i++)setTimeout(()=>puff(r.left+r.width/2,r.top,10),i*180)}

function setDiff(d){
  if(d===DIFF)return;
  try{save()}catch(e){}
  DIFF=d;__D=d;
  try{localStorage.setItem('tlp-diff',d)}catch(e){}
  try{S.prog=JSON.parse(localStorage.getItem('tlp-prog')||'{}')}catch(e){S.prog={}}
  applyDiff();
  applyPathVisuals();
  regPlayer();
  checkAch(true);
  {const b=badges();SEC.forEach(s=>{if(done(s.boss)&&!b.includes(s.id))b.push(s.id)});try{localStorage.setItem('tlp-badges',JSON.stringify(b))}catch(e){}}
  renderPick();
  updateHudLearner();
  menu();
  syncCurrentToCloud();
}
function coachInit(){if(!pref('guide',true)||hardMode())return;const L0=$('#learn');if(!L0||document.querySelector('.coach'))return;const h=lv().hints||[];let n=1;
 const box=document.createElement('div');box.className='coach';box.innerHTML='<div class="cface"><span class="bface" data-m="ok"><i class="ant"></i><i class="eye"></i><i class="eye"></i></span></div><div class="cbody"><b>Coach says:</b><ol class="csteps"></ol><button class="btn sm" id="cnext">Show me the next step</button><button class="coach-off" id="coff" type="button">Don\'t show tips</button></div>';document.body.appendChild(box);
 const ol=box.querySelector('.csteps'),nx=box.querySelector('#cnext'),add=()=>{if(n>h.length)return;const li=document.createElement('li');li.textContent=h[n-1];ol.appendChild(li);n++;if(n>h.length)nx.hidden=true;snd('tick')};
 const intro=document.createElement('li');intro.innerHTML='Read the mission above. Then drag the <b>glowing</b> blocks into your script and press Run.';ol.appendChild(intro);add();nx.onclick=add;
 const off=box.querySelector('#coff');if(off)off.onclick=()=>{setPref('guide',false);document.querySelectorAll('.coach').forEach(x=>x.remove());msg('Guided steps are off. You can turn them back on in Settings.','hint')};
 const txt=h.join(' ').toLowerCase();document.querySelectorAll('#pal .blk').forEach(p=>{const t=[...p.classList].find(c=>NAMES[c]);if(t&&txt.includes(NAMES[t].split(' ')[0].toLowerCase()))p.classList.add('glow')})}





const tourSeen=()=>{try{return localStorage.getItem('tlp-tour')==='1'}catch(e){return true}};
function runTour(force){
 if(document.querySelector('.tour'))return;
 if(!force&&(tourSeen()||window.__adminPreview||!$('#game')||$('#game').hidden))return;
 if(!$('#pal')||!$('#area')||!$('#run')||!$('#hint'))return;
 const steps=[
  {sel:'#pal',t:'Your blocks',d:'These are the moves you can use. Tap one to add it to the end, or hold and drag it where you want it. On a computer you can drag with the mouse too.'},
  {sel:'#area',t:'Your script',d:'Your plan lives here. The robot runs it from top to bottom, one block at a time.'},
  {sel:'#run',t:'Run',d:'Press Run to watch the robot try your plan. If it gets it wrong, change one block and run again. Nothing breaks.'},
  {sel:'#hint',t:'Stuck?',d:'Hint gives you one nudge. The Coach on the left walks you through the steps, one at a time.'}
 ];
 let i=0;
 const last=()=>i===steps.length-1;
 const ov=document.createElement('div');ov.className='tour';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','tourT');
 ov.innerHTML='<div class="tour-hole" aria-hidden="true"></div><div class="tour-card"><span class="tk" id="tourK"></span><h3 id="tourT"></h3><p id="tourD"></p><div class="tour-bar"><button class="tour-skip" id="tourSkip" type="button">Skip</button><span class="tour-dots" id="tourDots" aria-hidden="true"></span><span class="tour-btns"><button class="btn ghost sm" id="tourBack" type="button">Back</button><button class="btn sm" id="tourNext" type="button">Next</button></span></div></div>';
 document.body.appendChild(ov);
 const hole=ov.querySelector('.tour-hole'),card=ov.querySelector('.tour-card');
 const measure=()=>{
  const st=steps[i],el=$(st.sel);if(!el)return;
  const r=el.getBoundingClientRect();
  hole.style.left=(r.left-8)+'px';hole.style.top=(r.top-8)+'px';
  hole.style.width=(r.width+16)+'px';hole.style.height=(r.height+16)+'px';
  $('#tourK').textContent='Step '+(i+1)+' of '+steps.length;
  $('#tourT').textContent=st.t;$('#tourD').textContent=st.d;
  $('#tourDots').innerHTML=steps.map((_,n)=>'<i class="'+(n===i?'on':'')+'"></i>').join('');
  $('#tourBack').disabled=i===0;
  $('#tourNext').textContent=last()?'Start playing':'Next';
  const h=card.offsetHeight,w=card.offsetWidth;
  let top=r.bottom+14;
  if(top+h>innerHeight-10)top=r.top-h-14;
  top=Math.min(Math.max(10,top),Math.max(10,innerHeight-h-10));
  card.style.left=Math.min(Math.max(8,r.left+r.width/2-w/2),innerWidth-w-8)+'px';
  card.style.top=top+'px';
 };
 const show=()=>{
  const el=$(steps[i].sel);if(!el)return;
  if(el.getBoundingClientRect().top<10||el.getBoundingClientRect().bottom>innerHeight-10)el.scrollIntoView({block:'center'});
  card.style.visibility='hidden';measure();card.style.visibility='';
 };
 const close=()=>{try{localStorage.setItem('tlp-tour','1')}catch(e){}ov.remove();document.removeEventListener('keydown',key);window.removeEventListener('resize',show);window.removeEventListener('scroll',measure)};
 const next=()=>{if(last())close();else{i++;show()}};
 ov.querySelector('#tourNext').onclick=next;
 ov.querySelector('#tourBack').onclick=()=>{if(i>0){i--;show()}};
 ov.querySelector('#tourSkip').onclick=close;
 const key=e=>{
  if(e.key==='Escape'){e.preventDefault();close();return}
  if(e.key!=='Tab')return;
  const f=[...ov.querySelectorAll('button')].filter(b=>!b.disabled);
  const k=f.indexOf(document.activeElement);
  e.preventDefault();f[(k+(e.shiftKey?-1:1)+f.length)%f.length].focus();
 };
 document.addEventListener('keydown',key);
 window.addEventListener('resize',show);
 window.addEventListener('scroll',measure,{passive:true});
 show();setTimeout(()=>ov.querySelector('#tourNext').focus(),60);
}
puff=function(x,y,n){
  if(still)return;
  for(let i=0;i<(n||6);i++){
    const s=document.createElement('span');s.className='spark';const a=Math.random()*6.28,d=14+Math.random()*(PATH==='g16'?44:26);
    if(PATH==='g16'){
      s.innerHTML=['<i class=ic-star></i>','<i class=ic-sparkle></i>','<i class=ic-heart></i>','<i class=ic-heart></i>','<i class=ic-star></i>'][i%5];
      s.style.cssText=`left:${x}px;top:${y}px;font-size:${12+Math.random()*10}px;background:none;width:auto;height:auto`;
    }else if(PATH==='g710'){
      s.style.cssText=`left:${x}px;top:${y}px;width:6px;height:6px;border-radius:2px;background:${i%2?'var(--a)':'var(--b)'};box-shadow:0 0 8px var(--a)`;
    }else if(PATH==='g1112'){
      s.style.cssText=`left:${x}px;top:${y}px;width:4px;height:4px;border-radius:0;background:${i%2?'var(--a)':'#7df9ff'}`;
    }else{
      s.style.cssText=`left:${x}px;top:${y}px;width:3px;height:8px;border-radius:1px;background:${i%2?'#ffc83b':'var(--b)'};opacity:.85`;
    }
    document.body.appendChild(s);
    s.animate([{transform:'translate(0,0)',opacity:.95},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d}px) rotate(${Math.random()*200}deg)`,opacity:0}],{duration:PATH==='g16'?820:520,easing:'ease-out'}).onfinish=()=>s.remove();
  }
};
cheer=function(){const r=bot.getBoundingClientRect();for(let i=0;i<7;i++)setTimeout(()=>puff(r.left+r.width/2,r.top,14),i*150)};


if(bot)bot.addEventListener('click',()=>{
 if(!kidMode())return;
 const r=bot.getBoundingClientRect();puff(r.left+r.width/2,r.top,8);snd('tick');
 $$('.bub').forEach(x=>x.remove());
 const u=document.createElement('div');u.className='bub';u.textContent=kidPraise();bot.appendChild(u);
 setTimeout(()=>u.remove(),1600);
});

function bfxUpdate(){}
let pgT=0;function proGlitch(){if(DIFF==='pro'&&!still&&!document.hidden&&!$('#game').hidden){document.body.classList.add('glitchy');setTimeout(()=>document.body.classList.remove('glitchy'),380)}}pgT=setTimeout(proGlitch,22000+Math.random()*26000);
pgT=setTimeout(proGlitch,15000);

let contHandled=false;
async function initGameSession(){
  if(window.TLP_AUTH){
    try{
      await window.TLP_AUTH.init();
      const u=window.TLP_AUTH.getCurrentUser();
      if(window.TLP_AUTH.isCloudConfigured()){




        if(u&&u.role==='parent'&&!u.isAdmin){location.replace('parent.html');return}
        if(u&&u.isAdmin){window.__adminPreview=true}
      }
      const l=window.TLP_AUTH.getActiveLearner();


      if(l && !window.__adminPreview){
        const lp=l.assigned_path||l.assignedPath, ld=l.current_diff||l.currentDiff;
        if(lp && PATHS_CFG[lp]) PATH = lp;
        if(ld && ['beg','int','pro'].includes(ld)){ DIFF = ld; __D = DIFF; }
      }


      const accountName=window.__adminPreview?(u&&u.displayName)||'':(l&&!l.isGuest&&l.name)||(u&&u.displayName)||'';
      if(accountName){S.name=String(accountName).trim().slice(0,32)||'Player';try{localStorage.setItem('tlp-name',S.name)}catch(e){}}
      const who=document.querySelector('.who');
      if(who&&u&&u.role==='learner')who.hidden=true;
      try{S.prog=JSON.parse(localStorage.getItem('tlp-prog')||'{}')}catch(e){S.prog={}}
      if(window.TLP_AUTH.isCloudConfigured() && l && !l.isGuest && !window.__adminPreview){
        try{
          const cloudBundle = await window.TLP_AUTH.getProgressBundle(l.id, PATH, DIFF);
          if(cloudBundle && cloudBundle.prog && Object.keys(cloudBundle.prog).length > Object.keys(S.prog).length){
            S.prog = Object.assign({}, S.prog, cloudBundle.prog);
            save();
          }
        }catch(e){}
      }
    }catch(e){}
  }



  const resumePending=(()=>{try{return JSON.parse(sessionStorage.getItem('tlp-resume')||'null')}catch(e){return null}})();
  try{
    if(!DIFF){DIFF='int';__D=DIFF}
    applyHidden();applyDiff();applyPathVisuals();applyPrefs();
    startBreakClock();updateHudLearner();renderPick();streakCheck();
  }catch(e){}
  try{menu()}catch(e){}
  if(window.__adminPreview){const ap=$('#adminPrev');if(ap)ap.hidden=false}


  const params=new URLSearchParams(location.search);
  const want=Number(params.get('bonus')||0);
  const wantContinue=params.get('continue')==='1';
  const wantWatch=params.get('watch');
  try{
    if(wantWatch){
      contHandled=true;
      try{history.replaceState(null,'',location.pathname)}catch(e){}
      setTimeout(()=>{if(!$('#sc-body'))watchStory(wantWatch,params.get('path'))},80);
    }else if(want&&SEC.some(s=>s.bonus&&(s.ch.includes(want)||s.boss===want))&&(window.__adminPreview||mainSecs().every(s=>done(s.boss)))){
      try{history.replaceState(null,'',location.pathname)}catch(e){}
      setTimeout(()=>{if(!$('#sc-body'))play(want,0)},80);
    }else if(wantContinue&&!window.__adminPreview&&!contHandled){
      contHandled=true;
      try{history.replaceState(null,'',location.pathname)}catch(e){}
      setTimeout(()=>{
        if($('#sc-body'))return;
        const c=nextTarget();
        if(c<0)return;
        if(!Object.keys(S.prog).length&&window.TLP_STORY&&!TLP_STORY.seen('intro')){try{storyOpening()}catch(e){}return}
        play(c,nextLevel(c));
      },80);
    }else if(resumePending&&CH[resumePending.c]&&CH[resumePending.c].L&&CH[resumePending.c].L[resumePending.l]){

      if(done(resumePending.c)){try{sessionStorage.removeItem('tlp-resume')}catch(e){}}
      else{



        contHandled=true;window.__skipActCine=true;
        setTimeout(()=>{if(!$('#sc-body'))play(resumePending.c,resumePending.l)},80);
      }
    }
  }catch(e){}
  try{if(!Object.keys(S.prog).length&&!window.__adminPreview&&!wantContinue&&!contHandled)setTimeout(()=>{try{if(!$('#cine'))storyOpening()}catch(e){}},500)}catch(e){}
}

window.addEventListener('DOMContentLoaded', initGameSession);
initGameSession();


(function(){const chs=document.getElementById('chs');if(!chs)return;let busy=false;
 function build(){if(busy)return;const secs=[...chs.querySelectorAll(':scope>.sec')];if(secs.length<2||chs.querySelector('.hs-track'))return;busy=true;
  const track=document.createElement('div');track.className='hs-track';track.tabIndex=0;track.setAttribute('role','region');track.setAttribute('aria-label','Game sections. Use the arrow keys or swipe.');
  secs[0].before(track);secs.forEach(x=>track.appendChild(x));
  const nav=document.createElement('div');nav.className='hs-nav';nav.innerHTML='<button type="button" class="hs-prev" aria-label="Previous section">←</button><span class="hs-lbl" aria-live="polite"></span><span class="hs-dots" aria-hidden="true">'+secs.map(()=>'<i></i>').join('')+'</span><button type="button" class="hs-next" aria-label="Next section">→</button>';
  track.before(nav);
  const prev=nav.querySelector('.hs-prev'),next=nav.querySelector('.hs-next'),dots=[...nav.querySelectorAll('.hs-dots i')],lbl=nav.querySelector('.hs-lbl');
  const idx=()=>Math.max(0,Math.min(secs.length-1,Math.round(track.scrollLeft/Math.max(1,track.clientWidth+16))));
  const upd=()=>{const i=idx();dots.forEach((d,k)=>d.classList.toggle('on',k===i));prev.disabled=i===0;next.disabled=i===secs.length-1;lbl.textContent='Section '+(i+1)+' of '+secs.length};
  const go=i=>{i=Math.max(0,Math.min(secs.length-1,i));track.scrollTo({left:i*(track.clientWidth+16),behavior:document.documentElement.classList.contains('reduce-fx')?'auto':'smooth'})};
  prev.onclick=()=>go(idx()-1);next.onclick=()=>go(idx()+1);
  track.addEventListener('scroll',()=>{clearTimeout(track._t);track._t=setTimeout(upd,60)},{passive:true});
  track.addEventListener('keydown',e=>{if(e.target!==track)return;if(e.key==='ArrowLeft'){e.preventDefault();go(idx()-1)}else if(e.key==='ArrowRight'){e.preventDefault();go(idx()+1)}});
  nav.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){go(idx()-1)}else if(e.key==='ArrowRight'){go(idx()+1)}});

  let start=0;try{start=Math.min(secs.length-1,mainSecs().filter(s=>done(s.boss)).length)}catch(e){}
  track.style.scrollBehavior='auto';requestAnimationFrame(()=>{track.scrollLeft=start*(track.clientWidth+16);upd();track.style.scrollBehavior=''});upd();busy=false}
 new MutationObserver(()=>{if(!busy&&!chs.querySelector('.hs-track'))build()}).observe(chs,{childList:true});build();
 window.addEventListener('resize',()=>{const t=chs.querySelector('.hs-track');if(t)t.dispatchEvent(new Event('scroll'))});
})();







(function initConsole(){
 const btn=document.getElementById('conBtn');if(!btn)return;
 let el=null,out=null,inp=null;const hist=[];let hi=-1;
 function line(txt,cls){if(!out)return;const d=document.createElement('div');d.className='tcon-line'+(cls?' '+cls:'');d.textContent=txt;out.appendChild(d);out.scrollTop=out.scrollHeight}
 function build(){
  if(el)return;
  el=document.createElement('div');el.id='tcon';el.className='tcon';el.hidden=true;
  el.innerHTML='<div class="tcon-head"><span class="tcon-dots" aria-hidden="true"><i></i><i></i><i></i></span><b>R-067 console</b><button type="button" class="tcon-x" aria-label="Close console">×</button></div><div class="tcon-out" id="tconOut" aria-live="polite"></div><div class="tcon-chips">'+['help','status','stars','streak','hint','glitch'].map(c=>'<button type="button" data-cmd="'+c+'">'+c+'</button>').join('')+'</div><form class="tcon-in"><span aria-hidden="true">&gt;</span><input id="tconIn" autocomplete="off" spellcheck="false" aria-label="Console command"></form>';
  document.body.appendChild(el);
  out=el.querySelector('#tconOut');inp=el.querySelector('#tconIn');
  el.querySelector('.tcon-x').onclick=close;
  el.querySelector('.tcon-chips').onclick=e=>{const b=e.target.closest('[data-cmd]');if(b)run(b.dataset.cmd)};
  el.querySelector('form').onsubmit=e=>{e.preventDefault();run(inp.value);inp.value=''};
  inp.addEventListener('keydown',e=>{
   if(e.key==='Enter'){e.preventDefault();run(inp.value);inp.value='';return}
   if(e.key==='ArrowUp'){e.preventDefault();if(hist.length){hi=hi<0?hist.length-1:Math.max(0,hi-1);inp.value=hist[hi]||''}}
   if(e.key==='ArrowDown'){e.preventDefault();if(hist.length){hi=hi<0?hist.length:Math.min(hist.length,hi+1);inp.value=hi>=hist.length?'':hist[hi]}}
   if(e.key==='Tab'){e.preventDefault();const m=Object.keys(CMDS).filter(c=>c.indexOf(inp.value.trim())===0);if(m.length===1)inp.value=m[0]+' '}
  });
  line('R-067 console ready. Type help for commands.','tcon-dim');
 }
 function open(){build();el.hidden=false;btn.setAttribute('aria-expanded','true');setTimeout(()=>inp&&inp.focus(),0)}
 function close(){if(!el)return;el.hidden=true;btn.setAttribute('aria-expanded','false')}
 function toggle(){el&&!el.hidden?close():open()}
 const CMDS={
  help(){line('help           this list');line('status         name, path, difficulty, score');line('stars          stars earned');line('streak         current and best streak');line('hint           use one hint in the current mission');line('menu           back to the chapter map');line('story          replay the opening');line('friends        open the friend list');line('music on|off   background music');line('sound          sound on or off');line('glitch         a small display glitch');line('clear          clear this console')},
  status(){const l=window.TLP_AUTH&&TLP_AUTH.getActiveLearner&&TLP_AUTH.getActiveLearner();line('Player: '+S.name+(l&&l.player_id?' ('+l.player_id+')':''));line('Path: '+(PATHS_CFG[PATH]?PATHS_CFG[PATH].n:PATH));line('Difficulty: '+(DIFFS[DIFF]?DIFFS[DIFF].n:DIFF));line('Score: '+score());line('Missions with a star: '+Object.values(S.prog).filter(v=>Number(v)>0).length)},
  whoami(){const l=window.TLP_AUTH&&TLP_AUTH.getActiveLearner&&TLP_AUTH.getActiveLearner();line(l&&l.player_id?'You are '+S.name+', Player ID '+l.player_id+'.':'You are '+S.name+' on this device.')},
  score(){line('Total score: '+score())},
  stars(){const n=Object.values(S.prog).reduce((a,v)=>a+Math.min(3,Number(v)||0),0);line('Stars: '+n)},
  streak(){const s=window.TLP_STREAK&&TLP_STREAK.get?TLP_STREAK.get():null;if(!s)return line('Streak data is not available.','tcon-bad');line('Streak: '+s.count+' day'+(s.count===1?'':'s')+'. Best: '+s.best+'.');line(s.next?'Next reward in '+s.left+' day'+(s.left===1?'':'s')+': '+s.next.name:'All milestones earned.')},
  hint(){if(document.getElementById('game').hidden)return line('Open a mission first.','tcon-bad');const b=document.getElementById('hint');if(!b)return line('No hint button in this mission.','tcon-bad');b.click();line('Hint requested.','tcon-ok')},
  menu(){close();menu()},
  story(){try{storyScenes(TLP_STORY.opening(PATH),()=>TLP_STORY.mark('intro'));line('Replaying the opening.','tcon-ok')}catch(e){line('Story is not available here.','tcon-bad')}},
  friends(){location.href='friends.html'},
  music(a){if(!window.TLP_MUSIC)return line('Music is not available here.','tcon-bad');const on=String(a[0]||'').toLowerCase()!=='off';TLP_MUSIC.setEnabled(on);line('Music '+(on?'on':'off')+'.','tcon-ok')},
  sound(){toggleMute();line('Sound '+(mute?'off':'on')+'.','tcon-ok')},
  glitch(){document.body.classList.add('zap');setTimeout(()=>document.body.classList.remove('zap'),420);line('Display glitch fired.','tcon-ok')},
  clear(){out.innerHTML=''}
 };
 function run(raw){
  const text=String(raw||'').trim();if(!text)return;
  line('> '+text,'tcon-you');hist.push(text);hi=-1;
  const parts=text.split(/\s+/),key=parts[0].toLowerCase(),args=parts.slice(1);
  if(CMDS[key]){try{CMDS[key](args)}catch(e){line('Error: '+(e&&e.message||e),'tcon-bad')}}
  else line('Unknown command: '+key+'. Type help.','tcon-bad');
 }
 btn.setAttribute('aria-expanded','false');
 btn.onclick=toggle;
 document.addEventListener('keydown',e=>{
  const tag=(document.activeElement&&document.activeElement.tagName)||'';
  if(e.key==='Escape'&&el&&!el.hidden){close();return}
  if(e.key==='`'&&!/INPUT|TEXTAREA|SELECT/.test(tag)){e.preventDefault();toggle()}
 });
 window.TLP_CONSOLE={open:open,close:close,run:run};
})();
