<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>The Lost Protocol · Play</title>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,800;1,9..144,800&family=DM+Sans:wght@400;500;700&family=Caveat:wght@600&display=swap" rel="stylesheet">
<style>
:root{--h:200;--bg:hsl(var(--h) 26% 8%);--fg:#f3efe8;--mut:hsl(var(--h) 12% 76%);--line:rgba(255,255,255,.14);--a:hsl(var(--h) 80% 64%);--b:hsl(calc(var(--h) + 45) 85% 72%);--ink:#0b0f14;--bad:#ef7a8c;--ok:#4fc98a;
--serif:'Fraunces',Georgia,serif;--sans:'DM Sans',system-ui,sans-serif;--hand:'Caveat','Segoe Print',cursive;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
@media (prefers-color-scheme:light){:root{--bg:hsl(var(--h) 45% 95%);--fg:#17202b;--mut:hsl(var(--h) 18% 30%);--line:rgba(20,30,45,.18);--a:hsl(var(--h) 75% 34%);--b:hsl(calc(var(--h) + 45) 70% 36%);--ink:#fff;--bad:#b8324b;--ok:#1b7a4c}}
*{box-sizing:border-box;margin:0}
body{min-height:100vh;background:linear-gradient(120deg,color-mix(in srgb,var(--a) 14%,var(--bg)),var(--bg) 45%,color-mix(in srgb,var(--b) 11%,var(--bg)));color:var(--fg);font:16px/1.6 var(--sans);transition:background .8s}
h1,h2,h3{font-family:var(--serif);line-height:1.1}
.wrap{max-width:1180px;margin:0 auto;padding:0 20px 50px}
.top{display:flex;justify-content:space-between;align-items:center;padding:18px 0;border-bottom:1px solid var(--line);margin-bottom:26px;gap:12px;flex-wrap:wrap}
.logo{font:italic 800 22px var(--serif)}.hud{display:flex;gap:18px;align-items:center;font-size:14px;color:var(--mut)}.hud b{color:var(--fg);font:800 20px var(--serif)}
.hand{font:600 20px var(--hand);color:var(--a)}
.card{background:color-mix(in srgb,var(--bg) 74%,transparent);border:1px solid var(--line);border-radius:18px;padding:20px;backdrop-filter:blur(8px)}
.btn{border:0;border-radius:999px;padding:12px 26px;background:var(--a);color:var(--ink);font:700 15px var(--sans);cursor:pointer;transition:transform .2s,box-shadow .2s}
.btn:hover{transform:translateY(-2px) rotate(-.5deg);box-shadow:4px 5px 0 var(--b)}.btn.ghost{background:none;color:var(--fg);border:1px solid var(--line)}
 .btn:disabled{opacity:.4;pointer-events:none}
.back-site{display:flex;justify-content:center;padding:0 20px 36px;margin-top:8px}
.back-site a{display:inline-block;text-decoration:none;text-align:center;background:#8F243D;color:#F0E5E8;border:1px solid #C77A91;border-radius:999px;padding:12px 26px;font:700 15px var(--sans);transition:transform .2s,background .2s,box-shadow .2s}
.back-site a:hover{background:#3A183B;transform:translateY(-2px);box-shadow:4px 5px 0 #C77A91}
code{font:600 13px monospace;background:color-mix(in srgb,var(--a) 20%,transparent);padding:1px 7px;border-radius:6px}
input,select{font:inherit;color:inherit}
/* menu */
.hero h1{font-size:clamp(40px,8vw,84px);font-style:italic;margin:6px 0 12px}.hero p{color:var(--mut);max-width:620px}
.how{display:flex;gap:14px;flex-wrap:wrap;margin:26px 0}.how span{border-left:3px solid var(--a);padding:2px 14px;color:var(--mut);font-size:15px}
.who{margin:10px 0 26px;display:flex;gap:10px;align-items:center}.who input{background:transparent;border:0;border-bottom:2px solid var(--a);padding:4px 6px;width:180px}
.chs{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px}
.ch h3{font-size:28px;margin:4px 0 6px}.ch p{color:var(--mut);font-size:14px;margin-bottom:14px}.ch.lock{opacity:.55}
.lvls{display:grid;gap:8px}.lb{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-radius:12px;border:1px solid var(--line);background:none;color:var(--fg);font:600 15px var(--sans);cursor:pointer;transition:transform .2s,border-color .2s}
.lb:hover:not(:disabled){transform:translateX(6px);border-color:var(--a)}.lb:disabled{opacity:.45;cursor:not-allowed}.lb small{color:var(--a);font-weight:500}
/* game */
.game{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:20px;align-items:start}
@media(max-width:900px){.game{grid-template-columns:1fr}}
.col{display:grid;gap:16px}
.learn{animation:up .6s}.learn h2{font-size:28px;margin:2px 0 8px}.learn p{color:var(--mut)}.learn .mis{margin-top:12px;padding:12px 14px;border-radius:12px;background:color-mix(in srgb,var(--a) 14%,transparent);color:var(--fg)}
.diff{font:700 11px var(--sans);letter-spacing:.1em;text-transform:uppercase;border:1px solid var(--line);border-radius:99px;padding:2px 10px;margin-left:8px;color:var(--mut)}
.track{--p:0;--g:3;position:relative;display:grid;grid-template-columns:repeat(9,1fr);height:104px;border-radius:14px;border:1px solid var(--line);overflow:hidden;background:linear-gradient(0deg,color-mix(in srgb,var(--a) 14%,transparent),transparent 70%)}
.track i{border-right:1px dashed var(--line);font:11px var(--sans);color:var(--mut);display:grid;align-items:end;text-align:center;font-style:normal}
.chip{position:absolute;bottom:8px;left:calc(var(--g)*100%/9);width:calc(100%/9);text-align:center;font:800 28px var(--serif);color:var(--b);animation:fl 2s ease-in-out infinite}
.bot{position:absolute;bottom:8px;left:calc(var(--p)*100%/9);width:calc(100%/9);display:grid;place-items:center;transition:left .55s cubic-bezier(.3,1.3,.5,1)}
.bd{position:relative;width:36px;height:30px;background:var(--a);border-radius:11px 11px 6px 6px;transition:background .3s}
.bd:before{content:"";position:absolute;left:8px;top:9px;width:6px;height:6px;border-radius:50%;background:var(--ink);box-shadow:14px 0 var(--ink);animation:bl 4s infinite}
.bd:after{content:"";position:absolute;left:16px;top:-10px;width:3px;height:10px;background:var(--b)}
.walk .bd{animation:wk .28s infinite}.win .bd{background:var(--b);animation:jp .7s 3}.oops .bd{animation:sk .5s}
.bub{position:absolute;bottom:100%;margin-bottom:12px;white-space:nowrap;background:var(--fg);color:var(--bg);padding:2px 12px;border-radius:10px;font:700 13px var(--sans);animation:pop .3s}
.mem{display:flex;gap:10px;flex-wrap:wrap;min-height:58px;align-items:center}
.box{border:2px solid var(--a);border-radius:10px;padding:2px 14px;font:600 13px var(--sans);color:var(--mut)}.box b{display:block;font:italic 800 22px var(--serif);color:var(--a);min-height:30px}.box.pop{animation:pop .5s}
.lab{font:700 12px var(--sans);letter-spacing:.14em;text-transform:uppercase;color:var(--mut);margin-bottom:8px}
#msg{min-height:50px;padding:12px 16px;border-radius:12px;border:1px solid var(--line);color:var(--mut)}#msg.bad{border-color:var(--bad);color:var(--fg);animation:sk .5s}#msg.hint{border-color:var(--b);color:var(--fg)}
.bar{display:flex;gap:10px;flex-wrap:wrap}
.work{display:grid;grid-template-columns:150px 1fr;gap:14px}@media(max-width:600px){.work{grid-template-columns:1fr}}
#pal{border:2px dashed transparent;border-radius:12px;padding:4px}#pal.over{border-color:var(--bad)}
.blk{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:8px 12px;border-radius:10px;color:#0b0f14;font:700 14px var(--sans);cursor:grab;margin:6px 0;box-shadow:0 3px 0 rgba(0,0,0,.3);animation:pop .3s;transition:transform .2s}
.set,.change{background:hsl(calc(var(--h) + 25) 85% 68%)}.move{background:hsl(calc(var(--h) + 100) 80% 70%)}.say{background:hsl(calc(var(--h) + 170) 75% 74%)}.rep{background:hsl(calc(var(--h) + 240) 80% 72%);display:block}
.blk.run{outline:3px solid var(--fg);transform:scale(1.04)}
.blk select,.blk input{border:0;border-radius:6px;padding:1px 6px;background:#fff;color:#111;width:auto}.blk input{width:58px}.blk input:disabled{opacity:.4}
.zone{min-height:150px;border:2px dashed var(--line);border-radius:14px;padding:6px 10px;transition:.2s}.zone.over{border-color:var(--a);background:color-mix(in srgb,var(--a) 12%,transparent)}
.zone.in{min-height:46px;margin-top:6px;background:rgba(0,0,0,.14);padding:2px 8px}
.empty{color:var(--mut);font-size:14px;padding:50px 10px;text-align:center}
.modal{position:fixed;inset:0;z-index:50;display:grid;place-items:center;background:color-mix(in srgb,var(--bg) 82%,transparent);backdrop-filter:blur(8px);padding:20px}
.pan{width:min(460px,100%);text-align:center;border:1px solid var(--a);border-radius:22px;background:var(--bg);padding:34px;animation:pop .5s}.pan h2{font-size:34px;font-style:italic;margin-bottom:8px}.pan p{color:var(--mut);margin-bottom:18px}
.stars{font-size:38px;color:var(--b);letter-spacing:8px;margin:6px 0}
.spark{position:fixed;z-index:60;width:9px;height:9px;border-radius:2px;pointer-events:none}
.track{counter-reset:c -1}.track i{position:relative}.track i:before{counter-increment:c;content:counter(c);position:absolute;top:5px;left:0;right:0;text-align:center;font:700 12px var(--sans);color:var(--mut)}
.track i:first-child:after{content:"START";font:700 9px var(--sans);letter-spacing:.1em;padding-bottom:4px}.track i.vis{background:color-mix(in srgb,var(--b) 20%,transparent)}
.chip small{display:block;font:700 9px var(--sans);letter-spacing:.1em;color:var(--mut)}
.goals{list-style:none;padding:0;display:grid;gap:6px;margin:12px 0}.goals li{display:flex;gap:10px;align-items:center;padding:8px 12px;border-radius:10px;border:1px solid var(--line);font-size:14px;color:var(--fg);transition:.3s}
.goals li:before{content:"";flex:none;width:18px;height:18px;border-radius:5px;border:2px solid var(--mut);display:grid;place-items:center;font-size:12px}.goals li.ok{border-color:var(--ok)}.goals li.ok:before{content:"✓";background:var(--ok);border-color:var(--ok);color:#fff}
.goals li.tip{color:var(--mut);border-style:dashed}.goals li.tip:before{display:none}
.btn.sm{padding:6px 16px;font-size:13px}
.if{background:hsl(calc(var(--h) + 310) 75% 76%);display:block}.else{display:block;margin-top:8px}
#boss{display:grid;gap:14px}.bh{display:flex;gap:14px;align-items:center}
.bf{flex:none;width:54px;height:46px;border-radius:14px 14px 8px 8px;background:var(--bad);position:relative}.bf:before{content:"";position:absolute;left:12px;top:15px;width:8px;height:8px;border-radius:50%;background:var(--ink);box-shadow:20px 0 var(--ink)}
.hpb{height:14px;border-radius:8px;border:1px solid var(--line);overflow:hidden}.hpb i{display:block;height:100%;background:var(--bad);transition:width .6s}
.hrt{font-size:22px;letter-spacing:4px;color:var(--bad)}.hrt s{text-decoration:none;opacity:.25}
.bm{list-style:none;padding:0;display:grid;gap:6px;font-size:14px;margin:0}.bm li{padding:6px 10px;border:1px solid var(--line);border-radius:8px;color:var(--mut)}.bm li b{color:var(--fg)}
#boss.zap{animation:sk .5s;border-color:var(--bad)}
.pan.big{width:min(560px,100%);max-height:92vh;overflow:auto}.learned{text-align:left;border:1px solid var(--line);border-radius:14px;padding:14px 18px;margin-bottom:18px}.learned ul{margin:8px 0 12px;padding-left:20px;color:var(--fg)}.learned li{margin:6px 0}
.tools{display:flex;gap:9px;align-items:center}.tools small{font:600 17px var(--hand);color:var(--mut);margin-right:4px}
.sw{width:20px;height:20px;border-radius:50%;border:2px solid transparent;cursor:pointer;padding:0;outline:1px solid var(--line);transition:transform .2s}.sw:hover{transform:scale(1.2)}.sw.on{border-color:var(--bg);outline:2px solid var(--fg)}
.sw.auto{background:conic-gradient(from 90deg,#e86a6a,#e8c46a,#6ae88f,#6ac4e8,#a46ae8,#e86a6a)}.sw.auto.on{animation:swspin 3s linear infinite}
a.logo{color:inherit;text-decoration:none;transition:color .2s}a.logo:hover{color:var(--a)}
@keyframes swspin{to{transform:rotate(360deg)}}
.track.maze{display:block;overflow:visible;height:calc(var(--rows)*62px)}
.track.maze i{position:absolute;left:calc(var(--x)*100%/var(--cols));top:calc(var(--y)*100%/var(--rows));width:calc(100%/var(--cols));height:calc(100%/var(--rows));border:1px dashed var(--line);border-radius:8px;background:color-mix(in srgb,var(--a) 8%,transparent)}
.track.maze i.vis{background:color-mix(in srgb,var(--b) 24%,transparent)}
.track.maze .chip{bottom:auto;left:calc(var(--gx)*100%/var(--cols));top:calc(var(--gy)*100%/var(--rows));width:calc(100%/var(--cols));height:calc(100%/var(--rows));display:grid;place-items:center;align-content:center}
.track.maze .bot{bottom:auto;left:calc(var(--px)*100%/var(--cols));top:calc(var(--py)*100%/var(--rows));width:calc(100%/var(--cols));height:calc(100%/var(--rows));transition:left .55s cubic-bezier(.3,1.3,.5,1),top .55s cubic-bezier(.3,1.3,.5,1)}
.wall{position:absolute;left:calc(var(--x)*100%/var(--cols));top:calc(var(--y)*100%/var(--rows));width:calc(100%/var(--cols));height:calc(100%/var(--rows));border-radius:8px;background:repeating-linear-gradient(45deg,color-mix(in srgb,var(--fg) 14%,transparent) 0 5px,transparent 5px 10px);border:1px solid var(--line);pointer-events:none}
.bd{scale:var(--f,1) 1}
.learned .why{list-style:none;padding:0;margin:8px 0 10px}.why{list-style:none;padding:0;margin:10px 0 0;display:grid;gap:6px;text-align:left}.why li{padding:8px 12px;border:1px solid var(--line);border-radius:10px;font-size:14px;color:var(--mut)}.why li b{color:var(--fg)}
#toast{position:fixed;top:calc(var(--hudh,0px) + 12px);left:50%;translate:-50% 0;z-index:45;width:min(680px,calc(100% - 24px));max-height:58vh;overflow:auto;padding:14px 16px 12px;border-radius:14px;border:1px solid var(--b);background:var(--bg);color:var(--fg);box-shadow:0 14px 40px rgba(0,0,0,.35);animation:tdrop .35s}
#toast.bad{border-color:var(--bad)}#toast.ok{border-color:var(--ok)}#toast .btn{margin-top:10px}#toast ul{margin-top:8px}
#boss{position:fixed;top:0;left:0;right:0;z-index:42;display:flex;flex-wrap:wrap;align-items:center;gap:8px 22px;padding:8px 18px;border-radius:0 0 18px 18px;border-width:0 0 1px;background:color-mix(in srgb,var(--bg) 93%,transparent);box-shadow:0 8px 30px rgba(0,0,0,.25)}
#boss .nm{min-width:210px;flex:1 1 230px}#boss .nm b{font:italic 800 18px var(--serif)}#boss .nm small{color:var(--mut);margin-left:8px}
#boss .tnt{font:600 17px var(--hand);color:var(--bad);min-height:22px}
#boss .mw{flex:1 1 260px;min-width:0}.mcs{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px}
.mc{flex:none;max-width:210px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;padding:3px 9px;border:1px solid var(--line);border-radius:99px;color:var(--mut)}.mc b{color:var(--bad)}
.bb{--s:10px;font-size:var(--s);position:relative;width:7em;height:7em;flex:none;animation:bfloat 3s ease-in-out infinite}
.bb .bh2{position:absolute;left:.5em;right:.5em;bottom:.4em;top:1.6em;background:var(--bad);border-radius:1.4em 1.4em .8em .8em;box-shadow:inset 0 -.6em 0 rgba(0,0,0,.18),0 0 1.6em color-mix(in srgb,var(--bad) 55%,transparent)}
.bb .eye{position:absolute;top:1.5em;width:1.2em;height:1.2em;border-radius:50%;background:#fff;box-shadow:0 0 .8em #fff,0 0 1.6em var(--bad);animation:eyep 1.6s ease-in-out infinite}
.bb .eye:nth-child(1){left:1.2em}.bb .eye:nth-child(2){right:1.2em}
.bb .mouth{position:absolute;left:1.3em;right:1.3em;bottom:.9em;height:.9em;background:#14060a;clip-path:polygon(0 0,12% 100%,25% 0,37% 100%,50% 0,62% 100%,75% 0,87% 100%,100% 0)}
.bb .ant{position:absolute;top:0;left:1.4em;width:.5em;height:1.8em;background:var(--bad);transform:rotate(-18deg);border-radius:.3em}.bb .ant.r{left:auto;right:1.4em;transform:rotate(18deg)}
.bb.hurt{animation:bhurt .55s}.bb.atk{animation:batk .6s}.bb.laugh{animation:bhurt 1s infinite}
.bb.dead{animation:none;filter:grayscale(1) brightness(.55);transform:rotate(-14deg) translateY(.6em)}
.bb.dead .eye{background:none;box-shadow:none;animation:none}.bb.dead .eye:before{content:"✕";position:absolute;inset:0;display:grid;place-items:center;color:#c8c8c8;font:700 1.4em sans-serif}
.bb.sil .bh2{background:#0b0b12;box-shadow:none}.bb.sil .ant{background:#0b0b12}.bb.sil .mouth{background:#000}.bb.sil .eye{background:var(--ec);box-shadow:0 0 1em var(--ec),0 0 2.4em var(--ec)}
.h{position:relative;display:inline-block;width:1.05em;height:1em;line-height:1;margin-right:.15em;vertical-align:middle;color:var(--bad)}
.h i{position:absolute;left:0;top:0;font-style:normal;line-height:1;letter-spacing:0}.h i:first-child{clip-path:inset(0 50% 0 0)}.h i:last-child{clip-path:inset(0 0 0 50%)}
.h.empty{opacity:.2}.h.brk i:first-child{animation:hbl 1.1s ease-in forwards}.h.brk i:last-child{animation:hbr 1.1s ease-in forwards}
.orb{position:fixed;z-index:80;width:18px;height:18px;border-radius:50%;pointer-events:none}.vig{position:fixed;inset:0;z-index:90;pointer-events:none}
.dmg{position:fixed;z-index:90;font:800 28px var(--serif);color:#ff6b81;text-shadow:0 2px 0 #000;pointer-events:none}
#cine{--fg:#f3efe8;--line:rgba(255,255,255,.28);position:fixed;inset:0;z-index:70;display:grid;place-items:center;background:#05060a;color:#e8e8f0;overflow:auto;padding:16px;animation:cfade .8s}
#cine .stage{position:relative;width:min(900px,100%);min-height:min(560px,90vh);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:6px}
#cine.c-intro{background:radial-gradient(circle at 50% 40%,#3a0d16,#05060a 70%)}#cine.c-lose{background:radial-gradient(circle at 50% 40%,#3a0a0a,#050205 72%)}
#cine.c-win{background:radial-gradient(circle at 50% 60%,#3a0d16,#05060a 70%)}#cine.c-win.dark{background:#020308;transition:background 2s}
.ctitle{font:italic 800 clamp(34px,7vw,72px)/1.05 var(--serif);margin:10px 0;color:#ffd9a0;text-shadow:0 0 30px #ff9a3c}.c-lose .ctitle{color:#ff9aa8;text-shadow:0 0 30px #ef3c50}
.csub{max-width:560px;color:#c9cbe0;margin-bottom:14px}.cb{display:grid;place-items:center;min-height:8em}
.intro-bot{animation:brise 1.2s ease-out}.c-win.dark .ctitle{opacity:0;transition:opacity 1s}
.clines{min-height:96px}.clines p{margin:6px 0;font:italic 600 clamp(18px,3.4vw,28px) var(--serif);color:#c9cbe0;animation:cfade 1.2s}.clines small{display:block;margin-top:10px;letter-spacing:.3em;text-transform:uppercase;color:#7c7f99;font:600 12px var(--sans)}
.sw1,.sw2,.sw3{position:absolute;opacity:0;transition:opacity 1.8s}.sw1{left:3%;top:6%}.sw2{right:3%;top:2%}.sw3{left:40%;top:0}.sw1.on,.sw2.on,.sw3.on{opacity:1}
.frag{position:absolute;left:50%;top:40%;width:14px;height:14px;background:var(--bad);border-radius:3px;pointer-events:none}
.cskip{position:absolute;top:14px;right:16px;background:none;border:1px solid #444;color:#9a9cb4;border-radius:99px;padding:4px 14px;cursor:pointer;font:600 12px var(--sans)}
.bighearts{font-size:84px;line-height:1}.bighearts .h{margin:0 .12em}
@keyframes tdrop{from{opacity:0;translate:-50% -20px}}
@keyframes bfloat{50%{transform:translateY(-.5em)}}
@keyframes eyep{50%{transform:scale(.7);opacity:.7}}
@keyframes bhurt{0%,100%{transform:translateX(0);filter:none}20%{transform:translateX(-.6em);filter:brightness(2.5)}40%{transform:translateX(.6em)}60%{transform:translateX(-.4em);filter:brightness(2)}80%{transform:translateX(.4em)}}
@keyframes batk{30%{transform:translateX(1.4em) scale(1.35);filter:brightness(1.8)}100%{transform:none}}
@keyframes hbl{20%{transform:translate(-.08em,0)}to{transform:translate(-.5em,1.5em) rotate(-35deg);opacity:0}}
@keyframes hbr{20%{transform:translate(.08em,0)}to{transform:translate(.5em,1.7em) rotate(35deg);opacity:0}}
@keyframes cfade{from{opacity:0}}
@keyframes brise{from{opacity:0;transform:translateY(80px) scale(.5)}}
@media(min-width:1101px){.game{grid-template-columns:minmax(0,.95fr) minmax(0,1fr) minmax(0,1.2fr)}}
@media(min-width:901px) and (max-width:1100px){.game{grid-template-columns:1fr 1fr}.game>.col:nth-child(3){grid-column:1/-1}}
.wrap:has(#game:not([hidden])){max-width:1480px}
#dim{position:fixed;inset:0;z-index:3;pointer-events:none;background:radial-gradient(ellipse at 50% 35%,transparent 22%,#03040f 100%);opacity:var(--dim,.5);transition:opacity 4s}
#chs{display:block}.sec{margin:34px 0 10px}.sec h2{font-size:30px}.sec h2 .hand{font-size:24px;margin-right:8px}.sd{color:var(--mut);margin:2px 0 14px}
.ch.bossc{border-color:var(--bad)}.ch.bossc h3{color:var(--bad)}
.guard{display:flex;gap:16px;align-items:center;flex-wrap:wrap;padding:12px 18px;border:1px solid var(--line);border-radius:16px;margin-bottom:6px;background:color-mix(in srgb,var(--bg) 70%,transparent)}
.gd{display:grid;justify-items:center;gap:2px;color:var(--mut);font-size:11px}.gd.dead{opacity:.7}.gtxt{display:grid;margin-left:auto;text-align:right}.gtxt span{color:var(--mut);font-size:13px}
.note{background:hsl(calc(var(--h) + 60) 20% 82%)}.ask{background:hsl(calc(var(--h) + 130) 70% 76%)}.calc{background:hsl(calc(var(--h) + 190) 75% 74%)}.join{background:hsl(calc(var(--h) + 280) 70% 78%)}.cast{background:hsl(calc(var(--h) + 330) 70% 78%)}.pick{background:hsl(calc(var(--h) + 20) 85% 76%)}.def{background:hsl(calc(var(--h) + 215) 75% 74%);display:block}.call{background:hsl(calc(var(--h) + 215) 60% 82%)}.bit{background:hsl(calc(var(--h) + 150) 75% 70%)}
.chip.hit{animation:chiphit .9s}@keyframes chiphit{40%{transform:scale(1.5) rotate(20deg);filter:brightness(1.6)}}
.bb.k1 .bh2,.bb.k1 .ant{background:#e8a23a}.bb.k1 .eye{box-shadow:0 0 .8em #fff,0 0 1.6em #e8a23a}
.bb.k2 .bh2,.bb.k2 .ant{background:#9b5cf0}.bb.k2 .eye{box-shadow:0 0 .8em #fff,0 0 1.6em #9b5cf0}
.bb.k3 .bh2,.bb.k3 .ant{background:#35c9e8}.bb.k3 .eye{box-shadow:0 0 .8em #fff,0 0 1.6em #35c9e8}
#cine.c-win.dawn{background:radial-gradient(circle at 50% 50%,#fff3c4,#f6b94a 45%,#6b3a10 100%);transition:background 2.5s}.c-win.dawn .ctitle,.c-win.dawn .clines p{color:#3a2200;text-shadow:none}.c-win.dawn .clines small{color:#6b4a14}
#cine.c-badge{background:radial-gradient(circle at 50% 40%,#2a2150,#05060a 72%)}
.bwrap{position:relative;width:170px;height:170px;display:grid;place-items:center;margin-bottom:6px}.bwrap.mini{width:90px;height:90px}
.bico{position:relative;z-index:2;width:78%;height:78%;border-radius:50%;display:grid;place-items:center;font-size:72px;background:radial-gradient(circle at 35% 30%,#fff3,#0004),var(--bg2,#3a2f6b);border:4px solid var(--bc,#ffd36a);box-shadow:0 0 30px var(--bc,#ffd36a)}.mini .bico{font-size:38px;border-width:3px}
.rays{position:absolute;inset:-40%;border-radius:50%;background:repeating-conic-gradient(from 0deg,var(--bc,#ffd36a) 0 6deg,transparent 6deg 20deg);opacity:.25;animation:rot 12s linear infinite;-webkit-mask:radial-gradient(circle,transparent 30%,#000 32%,transparent 70%);mask:radial-gradient(circle,transparent 30%,#000 32%,transparent 70%)}
.ring{position:absolute;inset:0;border-radius:50%;border:3px solid var(--bc,#ffd36a);opacity:0}
.bd1{--bc:#ff6b7f;--bg2:#5a1f33}.bd2{--bc:#6adfff;--bg2:#1d3f5c}.bd3{--bc:#b46bff;--bg2:#3a2266}.bd4{--bc:#ffd36a;--bg2:#6a4a14}
.bd1 .bico{animation:bd1 1.5s cubic-bezier(.2,1.3,.4,1)}.bd2 .bico{animation:bd2 1.3s ease-out}.bd2 .ring{animation:shock 1.4s .5s ease-out 2}.bd3 .bico{animation:bd3 1.6s ease-out,glowp 1.6s 1.6s ease-in-out infinite}.bd4 .bico{animation:bd4 1.8s cubic-bezier(.2,1,.3,1)}.bd4 .ring{animation:shock 1.6s .8s ease-out infinite}
.mini.bd1 .bico,.mini.bd2 .bico,.mini.bd3 .bico,.mini.bd4 .bico{animation-duration:1.2s}.mini .rays{display:none}
@keyframes rot{to{transform:rotate(360deg)}}@keyframes shock{from{opacity:.9;transform:scale(.8)}to{opacity:0;transform:scale(2)}}@keyframes glowp{50%{box-shadow:0 0 60px var(--bc),0 0 10px #fff}}
@keyframes bd1{from{transform:rotate(-720deg) scale(0);opacity:0}}@keyframes bd2{0%{transform:translateY(-300px);opacity:0}60%{transform:translateY(0)}75%{transform:translateY(-30px)}100%{transform:none}}@keyframes bd3{from{transform:perspective(500px) rotateY(540deg) scale(.3);opacity:0}}@keyframes bd4{from{transform:translateY(240px) scale(.2);opacity:0;filter:brightness(3)}}
#achs{position:fixed;top:12px;right:12px;z-index:95;display:grid;gap:8px;pointer-events:none}
.achp{display:flex;gap:12px;align-items:center;min-width:250px;max-width:330px;padding:10px 16px 10px 10px;border-radius:16px;background:var(--bg);color:var(--fg);border:1px solid var(--b);box-shadow:0 10px 36px rgba(0,0,0,.35);animation:achin .6s cubic-bezier(.2,1.2,.4,1)}.achp.out{animation:achout .5s forwards}
.achp small{display:block;font:700 10px var(--sans);letter-spacing:.14em;text-transform:uppercase;color:var(--a)}.achp b{display:block;font:italic 800 18px var(--serif)}.achp span{color:var(--mut);font-size:13px}
.aico{flex:none;width:52px;height:52px;border-radius:14px;display:grid;place-items:center;font-size:28px;background:color-mix(in srgb,var(--a) 22%,transparent);border:1px solid var(--line)}
@keyframes achin{from{transform:translateX(120%);opacity:0}}@keyframes achout{to{transform:translateX(120%);opacity:0}}
.x1{animation:x1 .9s}.x2{animation:x2 1s}.x3{animation:x3 1s}.x4{animation:x4 .9s}.x5{animation:x5 1s}.x6{animation:x6 1.2s}.x7{animation:x7 .8s}.x8{animation:x8 1s}.x9{animation:x9 1.2s}.x10{animation:x10 1s}.x11{animation:x11 1.1s}.x12{animation:x12 1.2s}
@keyframes x1{0%{transform:scale(0)}60%{transform:scale(1.4)}100%{transform:scale(1)}}@keyframes x2{from{transform:rotate(0) scale(.2)}to{transform:rotate(720deg) scale(1)}}@keyframes x3{0%{transform:translateY(-70px);opacity:0}60%{transform:translateY(8px)}80%{transform:translateY(-6px)}100%{transform:none}}@keyframes x4{from{transform:translateX(80px);opacity:0}}@keyframes x5{from{transform:perspective(300px) rotateX(90deg)}}@keyframes x6{0%,100%{box-shadow:0 0 0 var(--a)}50%{box-shadow:0 0 28px var(--a)}}@keyframes x7{20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}@keyframes x8{from{transform:scale(3);filter:blur(8px);opacity:0}}@keyframes x9{20%{transform:rotate(-40deg)}50%{transform:rotate(30deg)}80%{transform:rotate(-12deg)}}@keyframes x10{30%{transform:scale(1.25,.75)}50%{transform:scale(.8,1.2)}70%{transform:scale(1.1,.9)}}@keyframes x11{0%{transform:skew(0)}30%{transform:skew(-14deg)}60%{transform:skew(10deg)}100%{transform:none}}@keyframes x12{10%,30%{transform:scale(.9) rotate(-5deg)}20%,40%,60%,80%{transform:scale(1.2) rotate(5deg)}50%,70%{transform:scale(1.2) rotate(-5deg)}100%{transform:none}}
#lib{position:fixed;inset:0;z-index:60;display:grid;place-items:center;padding:16px;background:color-mix(in srgb,var(--bg) 80%,transparent);backdrop-filter:blur(8px);animation:pop .3s}
.lpan{width:min(900px,100%);max-height:90vh;overflow:auto;border:1px solid var(--a);border-radius:22px;background:var(--bg);padding:22px}.lh{display:flex;justify-content:space-between;align-items:center}.lh h2{font-size:32px;font-style:italic}
.ltabs{display:flex;gap:8px;margin:14px 0}.ltabs button{border:1px solid var(--line);background:none;color:var(--fg);border-radius:99px;padding:6px 16px;font:700 14px var(--sans);cursor:pointer}.ltabs button.on{background:var(--a);color:var(--ink);border-color:var(--a)}
.lgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px}.lc{display:grid;justify-items:center;text-align:center;gap:6px;padding:16px 12px;border:1px solid var(--line);border-radius:16px;cursor:pointer}.lc b{font:italic 800 17px var(--serif)}.lc span{font-size:13px;color:var(--mut)}.lc.lk{opacity:.55;cursor:default}.lc.lk .aico{filter:grayscale(1)}
.lc.big{padding:20px 12px}
.bot[data-m=hop].walk .bd{animation:mhop .3s infinite}.bot[data-m=bounce].walk .bd{animation:mbounce .35s infinite}.bot[data-m=glide].walk .bd{animation:mglide .5s ease-in-out infinite}.bot[data-m=spin].walk .bd{animation:mspin .55s linear infinite}.bot[data-m=wobble].walk .bd{animation:mwob .2s infinite}
@keyframes mhop{50%{transform:translateY(-12px)}}@keyframes mbounce{0%,100%{transform:scale(1,1)}30%{transform:scale(1.2,.8) translateY(2px)}60%{transform:scale(.85,1.2) translateY(-10px)}}@keyframes mglide{50%{transform:translateY(-3px) skewX(-8deg)}}@keyframes mspin{to{transform:rotate(360deg)}}@keyframes mwob{50%{transform:rotate(10deg)}0%,100%{transform:rotate(-10deg)}}
.track[data-sk="1"] .wall{background:radial-gradient(circle,color-mix(in srgb,var(--fg) 22%,transparent) 2px,transparent 3px) 0 0/10px 10px}.track[data-sk="2"] .wall{background:repeating-linear-gradient(90deg,color-mix(in srgb,var(--fg) 14%,transparent) 0 4px,transparent 4px 9px)}.track[data-sk="3"] .wall{background:repeating-linear-gradient(135deg,color-mix(in srgb,var(--a) 22%,transparent) 0 6px,transparent 6px 12px)}
body[data-sec="1"] .track{box-shadow:0 0 22px color-mix(in srgb,var(--a) 25%,transparent)}body[data-sec="2"] .track{animation:tglow 4s ease-in-out infinite}body[data-sec="3"] .track{animation:tglow 3s ease-in-out infinite;filter:hue-rotate(0deg)}body[data-sec="3"] .chip{animation:fl 1.4s ease-in-out infinite}
@keyframes tglow{50%{box-shadow:0 0 34px color-mix(in srgb,var(--b) 50%,transparent)}}
.dps{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;margin:8px 0}.dp{text-align:left;border:1px solid var(--line);background:color-mix(in srgb,var(--bg) 70%,transparent);color:var(--fg);border-radius:16px;padding:14px 16px;cursor:pointer;display:grid;gap:6px;transition:transform .2s,border-color .2s}.dp:hover{transform:translateY(-3px);border-color:var(--a)}.dp.on{border-color:var(--a);box-shadow:0 0 0 2px var(--a)}.dp b{font:italic 800 20px var(--serif)}.dp span{font-size:13px;color:var(--mut)}
#cine .dp{color:#f3efe8;background:rgba(255,255,255,.06)}#cine .dp span{color:#c9cbe0}
#tally{margin:4px 0 18px;font-size:13px;color:var(--mut)}#tally b{color:var(--fg)}
body.d-beg .blk{font-size:15px;padding:8px 13px;border-radius:16px}body.d-beg .card{border-radius:24px}body.d-beg .bd{width:44px;height:38px}body.d-beg .track i{border-style:solid}
body.d-pro{font-family:'JetBrains Mono','Courier New',monospace}body.d-pro .card{border-radius:6px;border-color:var(--a);box-shadow:0 0 0 1px color-mix(in srgb,var(--a) 28%,transparent),inset 0 0 30px rgba(0,0,0,.2)}body.d-pro .blk{border-radius:3px;box-shadow:none;border:1px solid rgba(0,0,0,.45);font-family:inherit}body.d-pro .btn,body.d-pro .dp{border-radius:4px}body.d-pro .track{border-radius:4px;background:repeating-linear-gradient(0deg,transparent 0 11px,color-mix(in srgb,var(--a) 14%,transparent) 11px 12px)}body.d-pro .track.fog i:before{opacity:0}body.d-pro h1,body.d-pro h2,body.d-pro h3{font-family:'JetBrains Mono','Courier New',monospace;font-style:normal}
.while{display:block;background:hsl(calc(var(--h) + 240) 80% 72%)}
#bolt{position:fixed;right:16px;bottom:16px;z-index:56}
#bfab{position:relative;width:62px;height:62px;border-radius:50%;border:2px solid var(--a);background:var(--bg);cursor:pointer;display:grid;place-items:center;box-shadow:0 8px 28px rgba(0,0,0,.3);transition:transform .25s}#bfab:hover{transform:scale(1.1) rotate(-5deg)}#bfab.on{box-shadow:0 0 24px var(--a)}
.bping{position:absolute;inset:-6px;border-radius:50%;border:2px solid var(--a);animation:bping 2.4s ease-out infinite;pointer-events:none}#bfab.on .bping{display:none}@keyframes bping{from{opacity:.8;transform:scale(.9)}to{opacity:0;transform:scale(1.35)}}
.bface{position:relative;display:block;width:36px;height:28px;border-radius:9px 9px 6px 6px;background:var(--a);--ey:#fff}.bface .eye{position:absolute;top:9px;width:7px;height:7px;border-radius:50%;background:var(--ey);box-shadow:0 0 8px var(--ey);animation:bl 4s infinite}.bface .eye:nth-of-type(1){left:8px}.bface .eye:nth-of-type(2){right:8px}.bface .ant{position:absolute;left:16px;top:-9px;width:3px;height:9px;background:var(--b)}.bface .ant:after{content:"";position:absolute;left:-2px;top:-5px;width:7px;height:7px;border-radius:50%;background:var(--b);animation:led 1.2s infinite}
.bface[data-m=ok]{--ey:#7dffb2}.bface[data-m=bad]{--ey:#ff5d73;animation:sk .5s}.bface[data-m=warn]{--ey:#ffd36a}@keyframes led{50%{opacity:.25}}
#bpan{position:absolute;right:0;bottom:78px;width:min(360px,92vw);height:min(470px,70vh);display:flex;flex-direction:column;border:1px solid var(--a);border-radius:18px;background:color-mix(in srgb,var(--bg) 94%,#000);box-shadow:0 18px 60px rgba(0,0,0,.45);overflow:hidden;animation:pop .35s;font-family:'Courier New',monospace}
#bpan:before{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(255,255,255,.035) 0 1px,transparent 1px 3px);z-index:2}
.bhd{display:flex;gap:12px;align-items:center;padding:12px 14px;border-bottom:1px solid var(--line);background:color-mix(in srgb,var(--a) 14%,transparent)}.bhd b{display:block;letter-spacing:.2em;font-size:15px}.bhd small{color:var(--mut);font-size:11px;letter-spacing:.1em}.bhd button{margin-left:auto;background:none;border:0;color:var(--fg);cursor:pointer;font-size:16px}.bhd button+button{margin-left:0}
#blog{flex:1;overflow:auto;padding:12px;display:grid;gap:8px;align-content:start}
.bm2{padding:8px 11px;border-radius:10px;font-size:13px;line-height:1.45;max-width:88%;word-break:break-word}.bm2.rb{background:color-mix(in srgb,var(--a) 16%,transparent);border:1px solid color-mix(in srgb,var(--a) 40%,transparent);letter-spacing:.03em}.bm2.rb.bad{border-color:var(--bad);background:color-mix(in srgb,var(--bad) 14%,transparent);animation:sk .4s}.bm2.rb.warn{border-color:#ffd36a}.bm2.me{justify-self:end;background:var(--a);color:var(--ink)}.bm2.think{opacity:.7;animation:led .6s infinite}
.bin{display:flex;gap:8px;padding:10px;border-top:1px solid var(--line)}.bin input{flex:1;background:transparent;border:1px solid var(--line);border-radius:8px;padding:8px 10px;font:13px 'Courier New',monospace;color:var(--fg)}.bin button{border:0;border-radius:8px;background:var(--a);color:var(--ink);font:700 12px 'Courier New',monospace;padding:0 14px;cursor:pointer}
.bnote{padding:0 12px 8px;font-size:11px;color:var(--mut);letter-spacing:.05em}
.base{background:hsl(calc(var(--h) + 75) 70% 74%)}
.bb.k4 .bh2,.bb.k4 .ant{background:#3ddc84}.bb.k4 .eye{box-shadow:0 0 .8em #fff,0 0 1.6em #3ddc84}
.bb.k5 .bh2,.bb.k5 .ant{background:#f2c94c}.bb.k5 .eye{box-shadow:0 0 .8em #fff,0 0 1.6em #f2c94c}
.bd5{--bc:#3ddc84;--bg2:#12402a}.bd6{--bc:#f2c94c;--bg2:#5a4210}
.bd5 .bico{animation:bd5 1.3s steps(9)}.bd5 .ring{animation:shock 1s .6s steps(5) 3}.bd6 .bico{animation:bd6 2s cubic-bezier(.2,1.2,.4,1)}.bd6 .ring{animation:shock 1.6s .8s ease-out infinite}
@keyframes bd5{from{clip-path:inset(0 100% 0 0);filter:hue-rotate(90deg)}to{clip-path:inset(0 0 0 0)}}@keyframes bd6{0%{transform:scale(0) rotate(-180deg);opacity:0}60%{transform:scale(1.45) rotate(14deg)}100%{transform:none}}
.sw4,.sw5{position:absolute;opacity:0;transition:opacity 1.8s}.sw4{left:20%;top:24%}.sw5{right:20%;top:28%}.sw4.on,.sw5.on{opacity:1}
body.d-beg .btn{font-size:17px;padding:14px 30px}
body.d-pro{--bg:#060b0e;--fg:#cdeedd;--mut:#7fa392;--line:rgba(120,255,180,.22);--ink:#04110a}
.cv{margin:12px 0 0;padding:10px 12px;border:1px solid var(--line);border-radius:4px;background:#02080a;color:#6dffa8;font:12px/1.5 monospace;white-space:pre-wrap;max-height:170px;overflow:auto}
@media(min-width:601px){.work{grid-template-columns:150px minmax(0,1fr)}}
@media(min-width:1101px){.game{grid-template-columns:minmax(0,.88fr) minmax(0,.95fr) minmax(0,1.4fr)}}
.blk{min-width:0;max-width:100%}.blk select,.blk input{max-width:100%;min-width:0}.zone{min-width:0}.cv{overflow-wrap:anywhere}
.col{min-width:0;grid-template-columns:minmax(0,1fr)}.card{min-width:0}.work>div{min-width:0}
body.d-beg{--bg:#140f33;--fg:#fff8ef;--mut:#d6cdf2;--line:rgba(255,255,255,.2);--ink:#1b1030;background:radial-gradient(circle at 15% 8%,#4a2a92,transparent 42%),radial-gradient(circle at 88% 18%,#0e6b8c,transparent 38%),radial-gradient(circle at 50% 96%,#8a2a70,transparent 44%),#140f33}
body.d-beg .card{border-radius:30px;border:2px solid rgba(255,255,255,.16);background:rgba(255,255,255,.07);box-shadow:0 10px 36px rgba(0,0,0,.28)}
body.d-beg .blk{border:2px solid rgba(255,255,255,.55);box-shadow:0 4px 0 rgba(0,0,0,.35);transition:transform .2s}body.d-beg .blk:hover{animation:wig .5s}
body.d-beg .blk.set:before,body.d-beg .blk.change:before{content:'📦 '}body.d-beg .blk.move:before{content:'👣 '}body.d-beg .blk.say:before{content:'💬 '}body.d-beg .blk.rep:before,body.d-beg .blk.while:before{content:'🔁 '}body.d-beg .blk.if:before{content:'❓ '}body.d-beg .blk.note:before{content:'📝 '}body.d-beg .blk.ask:before{content:'🎤 '}body.d-beg .blk.calc:before{content:'🧮 '}body.d-beg .blk.join:before{content:'🧵 '}body.d-beg .blk.def:before,body.d-beg .blk.call:before{content:'🧩 '}body.d-beg .blk.bit:before{content:'💡 '}body.d-beg .blk.pick:before{content:'📚 '}body.d-beg .blk.cast:before,body.d-beg .blk.base:before{content:'🔄 '}
body.d-beg .btn{border-radius:999px;font-weight:800;box-shadow:0 5px 0 rgba(0,0,0,.35)}body.d-beg .btn:active{transform:translateY(3px);box-shadow:0 2px 0 rgba(0,0,0,.35)}
body.d-beg h1,body.d-beg h2,body.d-beg .logo{background:linear-gradient(90deg,#ffd36a,#ff8fcf,#7ad9ff,#ffd36a);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:rainbow 8s linear infinite}
body.d-beg .bot{animation:bobble 2.4s ease-in-out infinite}body.d-beg .bd{box-shadow:0 0 18px color-mix(in srgb,var(--b) 60%,transparent)}
body.d-beg .blk.glow{animation:blkglow 1.4s ease-in-out infinite}body.d-beg .track{border-radius:22px}
#bfx{position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden}#bfx i{position:absolute;bottom:-40px;font-style:normal;opacity:.55;animation:floatup linear infinite}
.coach{display:flex;gap:12px;margin-top:14px;padding:12px 14px;border-radius:22px;background:color-mix(in srgb,var(--b) 16%,transparent);border:2px dashed color-mix(in srgb,var(--b) 55%,transparent);animation:pop .5s}.coach .cface{padding-top:12px}.coach .cbody{flex:1;font-size:14px}.csteps{margin:6px 0 10px;padding-left:20px;display:grid;gap:5px}.csteps li{animation:pop .4s}
@keyframes wig{25%{transform:rotate(-3deg)}75%{transform:rotate(3deg)}}@keyframes rainbow{to{background-position:300% 0}}@keyframes bobble{50%{margin-top:-4px}}@keyframes blkglow{50%{box-shadow:0 0 0 3px #ffd36a,0 0 22px #ffd36a}}@keyframes floatup{from{transform:translateY(0) rotate(0);opacity:0}10%{opacity:.6}to{transform:translateY(-115vh) rotate(360deg);opacity:0}}
body.d-pro.glitchy .card,body.d-pro.glitchy .top{animation:pglitch .38s steps(4)}body.d-pro.glitchy h2,body.d-pro.glitchy h3,body.d-pro.glitchy .logo{text-shadow:3px 0 #ff2bd6,-3px 0 #00e5ff}
@keyframes pglitch{0%{transform:translate(-3px,0) skewX(-1deg);filter:hue-rotate(40deg)}25%{transform:translate(4px,1px);clip-path:inset(0 0 40% 0)}50%{transform:translate(-2px,-1px);clip-path:inset(30% 0 0 0)}75%{transform:translate(3px,0);filter:saturate(2)}100%{transform:none;clip-path:none;filter:none}}
body.d-beg,body.d-pro{--a:hsl(var(--h) 80% 66%);--b:hsl(calc(var(--h) + 45) 85% 74%);--bad:#ef7a8c;--ok:#4fc98a}
[hidden]{display:none!important}
@keyframes up{from{opacity:0;transform:translateY(20px)}}
@keyframes pop{from{opacity:0;transform:scale(.85)}}
@keyframes fl{50%{transform:translateY(-6px) rotate(8deg)}}
@keyframes bl{0%,94%,100%{transform:scaleY(1)}97%{transform:scaleY(.1)}}
@keyframes wk{50%{transform:translateY(-4px) rotate(-5deg)}}
@keyframes jp{40%{transform:translateY(-34px) rotate(180deg)}80%{transform:translateY(0) rotate(360deg)}}
@keyframes sk{20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition-duration:.01s!important}}
</style>
</head>
<body>
<div id="dim"></div><div id="achs"></div>
<div class="wrap">
  <div class="top"><a class="logo" href="index.html">The Lost Protocol</a><div class="tools" id="themes"><small>mood:</small></div>
    <div class="hud"><span>Player <b id="pn">Player</b></span><span>Score <b id="sc">0</b></span><button class="btn ghost sm" id="libb">🏆 Library</button><button class="btn ghost sm" id="sndg" title="Sound on/off">🔊</button><button class="btn ghost" id="exit" hidden>Exit to menu</button></div></div>

  <div id="menu">
    <div class="hero"><span class="hand">web edition</span><h1>Restore the protocol.</h1>
      <p>Drag blocks together to give your robot instructions. Each chapter teaches one idea, and each mission is a small puzzle only your logic can solve.</p></div>
    <div class="how"><span>1. Read the short lesson</span><span>2. Drag blocks into your script</span><span>3. Press Run and watch the robot</span></div>
    <div class="who"><span class="hand">Your name:</span><input id="name" maxlength="14" value="Player" aria-label="Your name"></div>
    <div id="pick"></div><div id="tally"></div>
<div class="chs" id="chs"></div>
  </div>

  <div id="game" class="game" hidden>
    <div class="col">
      <div class="card learn" id="learn"></div>
    </div>
    <div class="col mid">
      <div class="card"><div class="track" id="track"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><div class="chip">✦<small>GOAL</small></div><div class="bot" id="bot"><div class="bd"></div></div></div></div>
      <div class="card"><div class="lab">Memory boxes (variables)</div><div class="mem" id="mem"></div></div>
      <div class="card" id="boss" hidden></div>
      <div id="msg"></div>
    </div>
    <div class="col"><div class="card">
      <div class="work">
        <div><div class="lab">Blocks</div><div id="pal"></div></div>
        <div><div class="lab">Your script</div><div class="zone" id="area" data-z="root"></div></div>
      </div>
      <div class="bar" style="margin-top:16px"><button class="btn" id="run">Run ▶</button><button class="btn ghost" id="reset">Reset</button><button class="btn ghost" id="hint">Hint</button></div>
    </div></div>
  </div>
</div>
<div class="back-site"><a href="index.html">Go back to the main page</a></div>
<div id="toast" hidden></div>
<div class="modal" id="res" hidden><div class="pan" id="pan"></div></div>

<script>
let __D='';try{__D=localStorage.getItem('tlp-diff')||''}catch(e){}
const __raw=(()=>{const g=Storage.prototype.getItem,s=Storage.prototype.setItem,r=Storage.prototype.removeItem,NS=/^tlp-(prog|draft|boss\d*|ach|badges)$/,m=k=>NS.test(k)?k+'@'+(__D||'x'):k;
 Storage.prototype.getItem=function(k){return g.call(this,m(k))};Storage.prototype.setItem=function(k,v){return s.call(this,m(k),v)};Storage.prototype.removeItem=function(k){return r.call(this,m(k))};return{g,s,r}})();
function migrate(d){try{['prog','ach','badges'].forEach(k=>{const old=__raw.g.call(localStorage,'tlp-'+k),nk='tlp-'+k+'@'+d;if(old!=null){if(__raw.g.call(localStorage,nk)==null)__raw.s.call(localStorage,nk,old);__raw.r.call(localStorage,'tlp-'+k)}})}catch(e){}}
if(__D)migrate(__D);
const CH=[
{n:'Chapter 1',t:'Variables',d:'Labelled boxes that remember things.',L:[
 {t:'A labelled box',df:'Easy',learn:'A <b>variable</b> is a labelled box that remembers a value. <code>set steps to 3</code> puts 3 in the box called <b>steps</b>. Then <code>move steps</code> uses whatever is inside it.',mis:'The chip is 3 cells away. Get the robot to it.',vars:{steps:0},allow:['set','move'],goal:3,par:2,hints:['The robot only goes as far as the number you give it.','The steps box is empty (0). Fill it before moving.','Set steps to 3, then move by steps.']},
 {t:'Change the box',df:'Easy',learn:'<code>change steps by 3</code> adds 3 to what is already in the box instead of replacing it. Handy when you know how much <i>more</i> you need.',mis:'The chip is 7 cells away, and steps already holds 4.',vars:{steps:4},allow:['change','move'],goal:7,par:2,hints:['Check the Memory boxes. What is in steps right now?','You need 7 and have 4. How much is missing?','Change steps by 3, then move by steps.']},
 {t:'Boxes hold words too',df:'Medium',learn:'A variable can hold text as well as numbers. <code>say name</code> makes the robot speak whatever is in the box called <b>name</b>.',mis:'Teach the robot its name, Nova, then make it say it out loud.',vars:{name:''},allow:['set','say'],goal:null,say:'Nova',par:2,hints:['The box called name is empty. The robot cannot say what it does not know.','Put the word in the box, then say the box.','Set name to Nova (capital N), then say name.']},
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
const NARRATION={};
let S={ci:0,li:0,script:[],hint:0,run:false,id:0,prog:{},name:'Player'};
try{S.prog=JSON.parse(localStorage.getItem('tlp-prog')||'{}');S.name=localStorage.getItem('tlp-name')||'Player'}catch(e){}
const save=()=>{try{localStorage.setItem('tlp-prog',JSON.stringify(S.prog));localStorage.setItem('tlp-name',S.name)}catch(e){}};
const lv=()=>CH[S.ci].L[S.li],key=(c,l)=>c+'-'+l,score=()=>Object.values(S.prog).reduce((a,b)=>a+b*100,0);
const done=c=>CH[c].L.every((_,l)=>S.prog[key(c,l)]);
const MOODS=[["Ocean",200],["Dusk",265],["Rose",340],["Amber",32],["Moss",145]],still=matchMedia('(prefers-reduced-motion:reduce)').matches;
let hue=200,auto=true,tw,tweening=false,saved=null;
try{saved=localStorage.getItem('tlp-mood')}catch(e){}
if(saved&&saved!=='auto'){auto=false;hue=+saved}
const setHue=h=>{hue=h;document.documentElement.style.setProperty('--h',h.toFixed(1))};
$('#themes').insertAdjacentHTML('beforeend',MOODS.map(([n,h])=>`<button class="sw" data-v="${h}" title="${n}" aria-label="${n}" style="background:hsl(${h} 75% 58%)"></button>`).join('')+'<button class="sw auto" data-v="auto" title="Drift between moods" aria-label="Drift between moods"></button>');
function mark(){document.querySelectorAll('.sw').forEach(s=>s.classList.toggle('on',auto?s.dataset.v==='auto':s.dataset.v==String(hue)))}
function goHue(t){cancelAnimationFrame(tw);tweening=true;const s0=hue,d=((t-s0+540)%360)-180,t0=performance.now();(function f(n){const k=Math.min(1,(n-t0)/700),e=1-Math.pow(1-k,3);setHue((s0+d*e+360)%360);if(k<1)tw=requestAnimationFrame(f);else tweening=false})(t0)}
document.querySelectorAll('.sw').forEach(s=>s.onclick=()=>{const v=s.dataset.v;auto=v==='auto';goHue(auto?(hue+90+Math.random()*120)%360:+v);try{localStorage.setItem('tlp-mood',v)}catch(e){}mark()});
setHue(hue);mark();
setInterval(()=>{if(auto&&!still&&!tweening)setHue((hue+.6)%360)},50);

function hud(){$('#pn').textContent=S.name;$('#sc').textContent=score();setLight()}
function play(c,l,k){S.ci=c;S.li=l;S.script=[];S.hint=0;if(lv().boss)bossRound(k);try{const d=JSON.parse(localStorage.getItem('tlp-draft')||'null');if(!k&&d&&d.k===c+'-'+l&&Array.isArray(d.s)){S.script=d.s;S.id=Math.max(S.id,...(function m(a){return a.flatMap(b=>[b.id,...m(b.c),...m(b.e||[])])})(d.s),0)}}catch(e){}if(!S.script.length&&lv().start)S.script=lv().start();$('#menu').hidden=true;$('#game').hidden=false;document.body.dataset.sec=Math.max(0,SEC.findIndex(s=>s.ch.includes(c)||s.boss===c));track.dataset.sk=Math.random()*4|0;if(DIFF==='beg'&&!lv().boss)setTimeout(coachInit,0);$('#exit').hidden=false;$('#res').hidden=true;
 const L=lv();$('#learn').innerHTML=`<span class="hand">${CH[c].n} · ${CH[c].t}</span><span class="diff">${L.df}</span><h2>${L.t}</h2><p>${L.learn}</p><div class="mis"><b>Mission:</b> ${L.mis}</div><ul class="goals" id="goals"></ul><button class="btn ghost sm" id="nar">Narrate lesson</button>`;$('#nar').onclick=narrate;
 $('#learn').style.animation='none';void $('#learn').offsetWidth;$('#learn').style.animation='';
 layout();track.classList.toggle('fog',DIFF==='pro'&&!!mazeP);tp('--g',L.goal==null?-5:L.goal);
 $('#pal').innerHTML=L.allow.map(t=>`<div class="blk pal ${t}" draggable="true" data-new="${t}">${NAMES[t]}</div>`).join('');
 reset();render();bossUI()}
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
 return `<div class="blk ${b.t}" draggable="true" ${d}>${h}</div>`}
function render(){try{localStorage.setItem('tlp-draft',JSON.stringify({k:S.ci+'-'+S.li,s:S.script}))}catch(e){}$('#area').innerHTML=S.script.length?S.script.map(blk).join(''):'<div class="empty">Drag blocks here</div>'}
function find(id,arr=S.script){for(let i=0;i<arr.length;i++){if(arr[i].id===id)return{arr,i,b:arr[i]};const r=find(id,arr[i].c)||find(id,arr[i].e||[]);if(r)return r}return null}
const kids=b=>b.c.concat(b.e||[]),count=a=>a.reduce((n,b)=>n+1+count(kids(b)),0),has=(a,t)=>a.some(b=>b.t===t||has(kids(b),t));
const holds=(b,id)=>kids(b).some(x=>x.id===id||holds(x,id));
const dt=e=>e.dataTransfer;
document.addEventListener('dragstart',e=>{const b=e.target.closest&&e.target.closest('.blk');if(!b)return;dt(e).setData('text/plain',b.dataset.new?'n:'+b.dataset.new:'m:'+b.dataset.id)});
document.addEventListener('dragover',e=>{const z=e.target.closest('.zone,#pal');if(!z)return;e.preventDefault();$$('.over').forEach(x=>x.classList.remove('over'));z.classList.add('over')});
const $$=s=>[...document.querySelectorAll(s)];
document.addEventListener('dragend',()=>$$('.over').forEach(x=>x.classList.remove('over')));
document.addEventListener('drop',e=>{$$('.over').forEach(x=>x.classList.remove('over'));
 const data=dt(e).getData('text/plain');if(!data||S.run)return;const [k,v]=data.split(':'),z=e.target.closest('.zone'),inPal=e.target.closest('#pal');
 if(inPal){if(k==='m'){const f=find(+v);if(f){f.arr.splice(f.i,1);render()}}return}
 if(!z)return;e.preventDefault();
 const zid=z.dataset.z,zn=parseInt(zid),arr=zid==='root'?S.script:zid.endsWith('e')?find(zn).b.e:find(zn).b.c;
 let idx=[...z.children].filter(c=>c.classList.contains('blk')&&e.clientY>c.getBoundingClientRect().top+c.getBoundingClientRect().height/2).length;
 if(k==='n'){arr.splice(idx,0,mk(v))}
 else{const f=find(+v);if(!f||(zid!=='root'&&(zn===f.b.id||holds(f.b,zn))))return;if(f.arr===arr&&f.i<idx)idx--;f.arr.splice(f.i,1);arr.splice(idx,0,f.b)}
 render();snd('tick');puff(e.clientX,e.clientY)});
function edit(e){const t=e.target;if(!t.dataset.k)return;const f=find(+t.dataset.id);if(!f)return;f.b[t.dataset.k]=t.value;if(e.type==='change'&&(t.dataset.k==='src'||t.dataset.k==='idx'||t.dataset.k==='j'||t.dataset.k==='rv'||t.dataset.k==='rv2'))render()}
$('#area').addEventListener('input',edit);$('#area').addEventListener('change',edit);

let env={},pos=0,said=null;
const bot=$('#bot'),track=$('#track');
function mem(pop){$('#mem').innerHTML=Object.entries(env).length?Object.entries(env).map(([k,v])=>`<div class="box ${k===pop?'pop':''}">${k}${isC(k)?' 🔒':''}<b>${fmt(v)}</b></div>`).join(''):'<span style="color:var(--mut);font-size:14px">No variables in this mission.</span>'}
function reset(){S.run=false;useCase(0);bot.className='bot';$$('.bub').forEach(x=>x.remove());$$('.blk.run').forEach(x=>x.classList.remove('run'));mem();msg('Drag blocks into your script, then press Run.')}
const val=v=>v.trim()===''||isNaN(+v)?v:+v;
async function exec(list){for(const b of list){if(!S.run)return;const el=$('.blk[data-id="'+b.id+'"]');el&&el.classList.add('run');await sleep(500);
 if((b.t==='set'||b.t==='change')&&isC(b.v)){fail('🔒 '+b.v+' is a constant. A constant is set once and can never change, so '+b.t+' is not allowed on it.');el&&el.classList.remove('run');return}
 if(b.t==='move'&&b.src!=='#'&&lv().strict&&typeof env[b.src]!=='number'){fail('The box "'+b.src+'" holds '+(typeof env[b.src]==='string'?'the word "'+env[b.src]+'"':'something that is not a number')+', but move needs a number. Check the type, or convert it first.');el&&el.classList.remove('run');return}
 if(b.t==='set'){env[b.v]=val(String(b.val));mem(b.v)}
 if(b.t==='change'){env[b.v]=(+env[b.v]||0)+(+b.n||0);mem(b.v)}
 if(b.t==='move'){const n=b.src==='#'?+b.n||0:+env[b.src]||0,np=Math.max(0,Math.min(8,pos+n));
  if(np!==pos+n){bot.classList.add('oops');setTimeout(()=>bot.classList.remove('oops'),600)}
  for(let c=Math.min(pos,np);c<=Math.max(pos,np);c++)track.children[c].classList.add('vis');pos=np;bot.classList.add('walk');tp('--p',pos);snd('step');{const r=bot.getBoundingClientRect();puff(r.left+r.width/2,r.top+r.height*.8,3)}await sleep(600);bot.classList.remove('walk');chk();{const G=cases()[cc];if(G.goal!=null&&pos===G.goal&&pos>0){snd('chime');goalFx()}}}
 if(b.t==='say'){said=String(env[b.src]??'');$$('.bub').forEach(x=>x.remove());const u=document.createElement('div');u.className='bub';u.textContent=said||'…';bot.appendChild(u);chk();await sleep(500)}
 if(b.t==='rep'){for(let i=0;i<Math.min(+b.n||0,12)&&S.run;i++)await exec(b.c)}
 if(b.t==='if'){await exec(cond(b)?b.c:b.e)}
 if(b.t==='while'){let g=0;while(S.run&&cond(b)&&g++<40){await exec(b.c)}}

 if(b.t==='ask'){env[b.v]=val(String(INP??''));mem(b.v)}
 if(b.t==='calc'){const x=+env[b.src]||0,n=+b.n||0;env[b.v]=b.op==='+'?x+n:b.op==='-'?x-n:b.op==='*'?x*n:b.op==='/'?(n?Math.floor(x/n):0):b.op==='&'?x&n:b.op==='|'?x|n:b.op==='^'?x^n:b.op==='<<'?x<<n:b.op==='>>'?x>>n:(n?x%n:0);mem(b.v)}
 if(b.t==='join'){env[b.v]=String(env[b.src]??'')+String(env[b.src2]??'');mem(b.v)}
 if(b.t==='cast'){const x=env[b.v];env[b.v]=b.to==='number'?(isNaN(+x)?0:+x):String(x);mem(b.v)}
 if(b.t==='pick'){const a=env[b.src],i=(b.idx==='#'?+b.n:+env[b.idx])-1;env[b.v]=Array.isArray(a)?(a[i]??0):0;mem(b.v)}
 if(b.t==='bit'){onBits.add(+b.n);const t=[...onBits].reduce((a,c)=>a+c,0);env.total=t;env.bin=t.toString(2);mem('total')}
 if(b.t==='base'){const x=env[b.src];env[b.v]=b.to==='bin'?Math.max(0,Math.floor(+x||0)).toString(2):(parseInt(String(x),2)||0);mem(b.v)}
 if(b.t==='def'){FN[b.v]=b}
 if(b.t==='call'){const f=FN[b.v];if(!f){fail('The function "'+b.v+'" is not defined yet. Define it above the place where you call it.');el&&el.classList.remove('run');return}if(++fdepth>30){fail('Too many nested calls. A recursive function needs a stopping rule (a base case).');el&&el.classList.remove('run');return}const keep=env;env={...env};await exec(f.c);env=keep;if(onBits.size){const t=[...onBits].reduce((a,c)=>a+c,0);env.total=t;env.bin=t.toString(2)}fdepth--;mem()}
 el&&el.classList.remove('run')}}
async function run(){if(S.run)return;reset();S.err=null;bot.dataset.m=['hop','bounce','glide','spin','wobble'][Math.random()*5|0];const L=lv();if(!S.script.length){msg('Add some blocks to your script first.','bad');return}
 if(DIFF==='pro'&&!L.boss&&count(S.script)>L.par+2){msg('Professional rules: use at most '+(L.par+2)+' blocks for this mission.','bad');return}
 if(L.cap&&count(S.script)>L.cap){msg('This mission allows at most '+L.cap+' blocks. Try a loop.','bad');return}
 if(L.boss&&(bossWait||bossRepeat()))return;
 S.run=true;$('#run').disabled=true;const CS=cases(),miss=[];
 for(let i=0;i<CS.length&&S.run;i++){const X=CS[i];if(i){await sleep(800);bot.className='bot'}useCase(i);if(CS.length>1)msg('<b>Test '+(i+1)+' of '+CS.length+'</b>');
  await exec(S.script);
  if(S.run){const t=CS.length>1?'Test '+(i+1)+': the robot ':'The robot ';
   if(X.goal!=null&&pos!==X.goal)miss.push(`${t}stopped at cell ${pos}, but it needed cell ${X.goal}.`);
   if(X.say!=null&&said!==X.say)miss.push(said==null?`${t}never said anything.`:`${t}said "${said}", but needed "${X.say}".`);
   if(miss.length)break}}
 const was=S.run;S.run=false;$('#run').disabled=false;if(!was){if(S.err){bot.classList.add('oops');snd('err');msg(S.err,'bad');S.err=null}return}
 
 
 if(L.needs&&!has(S.script,'rep'))miss.push('This mission wants a loop. Try using a repeat block.');
 if(L.rule&&!L.rule.f(S.script))miss.push('Round rule not met: '+L.rule.txt+'.');
 if(miss.length){bot.classList.add('oops');snd('err');msg(miss.join(' ')+' Check your blocks and try again, or ask for a hint.'+(DIFF==='beg'?' You are doing great! The Coach steps on the left can help.':''),'bad');return}
 if(L.boss)return bossHit();
 bot.classList.add('win');sparks();const n=count(S.script),st=n<=L.par+PB()?3:n<=L.par+PB()+1?2:1,k=key(S.ci,S.li);S.prog[k]=Math.max(S.prog[k]||0,st);save();hud();checkAch();snd('win');if(DIFF==='beg')cheer();
 msg('<b>Correct! Protocol restored.</b> Here is what each block in your code did:'+whyList());await sleep(2600);finish(st,n)}
function sparks(){const r=bot.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;for(let i=0;i<30;i++){const s=document.createElement('span');s.className='spark';s.style.cssText=`left:${x}px;top:${y}px;background:${i%2?'var(--a)':'var(--b)'}`;document.body.appendChild(s);const a=Math.random()*6.28,d=80+Math.random()*180;s.animate([{transform:'translate(0,0)',opacity:1},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d+50}px) rotate(${Math.random()*500}deg)`,opacity:0}],{duration:1100,easing:'ease-out'}).onfinish=()=>s.remove()}}
function finish(st,n){hideToast();try{localStorage.removeItem('tlp-draft')}catch(e){}const L=CH[S.ci].L,last=S.li===L.length-1,all=CH.every(c=>!c.L||done(CH.indexOf(c)));
 let title='Mission complete',txt=`You used ${n} block${n>1?'s':''}. ${st===3?'Perfect, that is the tidiest solution.':'Can you solve it with fewer blocks for three stars?'}`,go='Next mission',nx=()=>play(S.ci,S.li+1);
 if(last&&lv().boss){const kd=SEC.filter(s=>done(s.boss)).length;title='Guardian defeated';txt='You beat '+nice(bi().name)+' with '+st+' heart'+(st>1?'s':'')+' left. '+(kd<SEC.length?(SEC.length-kd)+' guardian'+(SEC.length-kd>1?'s remain':' remains')+' in the dark, but the light is growing.':'All the guardians are gone. The protocol is restored and the light is back.')+' Score: '+score()+'.';go=kd<SEC.length?'Next section':'Back to menu';nx=()=>{const nc=nextOf(S.ci);nc!=null?play(nc,0):menu()}}
 else if(last){const nc=nextOf(S.ci);title='Chapter complete';txt+=' You finished '+CH[S.ci].t+'.'+(nc!=null?' Next: '+CH[nc].t+'.':'');go=nc!=null?(CH[nc].L[0].boss?'Face the boss':'Next chapter'):'Back to menu';nx=nc!=null?()=>play(nc,0):menu}
 $('#pan').innerHTML=`<span class="hand">${lv().boss?'Boss defeated':n+' blocks'} · +${st*100} points</span><h2>${title}</h2><div class="stars">${'★'.repeat(st)}${'☆'.repeat(3-st)}</div><p>${txt}</p>${whyHTML()}${last?learnedHTML(S.ci):''}<div class="bar" style="justify-content:center"><button class="btn" id="nx">${go}</button><button class="btn ghost" id="rt">Play again</button></div>`;
 $('#pan').classList.toggle('big',true);$('#res').hidden=false;$('#nx').onclick=()=>{stopSay();$('#res').hidden=true;nx()};$('#rt').onclick=()=>{stopSay();$('#res').hidden=true;reset()}
 if(last){confetti();$('#lis').onclick=()=>sayLearned(S.ci);sayLearned(S.ci)}}
let cc=0;
const cases=()=>{const c=lv().cases||[{vars:{},goal:lv().goal,say:lv().say}];return DIFF==='beg'&&!lv().boss?c.slice(0,1):c};
function useCase(i){cc=i;const X=cases()[i];INP=X.input;onBits=new Set();FN={};fdepth=0;env={...lv().vars,...X.vars};pos=0;said=null;tp('--p',0);tp('--g',X.goal==null?-5:X.goal);$$('.track i').forEach(c=>c.classList.remove('vis'));$$('.bub').forEach(x=>x.remove());goals();mem()}
function goals(){const L=lv(),CS=cases(),X=CS[cc],g=[];
 if(CS.length>1)g.push(['tip','Test '+(cc+1)+' of '+CS.length+': '+Object.entries(X.vars).map(([k,v])=>k+' = '+v).join(', ')+(X.input!=null?(Object.keys(X.vars).length?', ':'')+'the player types '+X.input:'')+'. One script must pass every test.']);
 if(X.goal!=null)g.push([X.goal?'pos':'tip',X.goal?'Reach the chip at cell '+X.goal:'Stay at the start']);
 if(X.say!=null)g.push(['say','Say "'+X.say+'"']);
 if(L.needs)g.push(['loop','Use a repeat block']);
 if(L.rule)g.push(['rule',(L.boss?'Round rule: ':'Also: ')+L.rule.txt]);
 g.push(['tip',L.boss?'Stars come from your hearts. Keep your hearts for more stars.':'For 3 stars use '+(L.par+PB())+' blocks or fewer'+(DIFF==='pro'?' (limit: '+(L.par+2)+')':'')]);
 $('#goals').innerHTML=g.map(([k,t])=>`<li class="${k==='tip'?'tip':''}" data-g="${k}">${t}</li>`).join('');chk()}
function chk(){const X=cases()[cc],on=(k,v)=>{const e=$('#goals [data-g="'+k+'"]');e&&e.classList.toggle('ok',v)};on('pos',pos===X.goal);on('say',said===X.say);on('loop',has(S.script,'rep'));lv().rule&&on('rule',lv().rule.f(S.script))}
let au;
function narrate(){if(speechSynthesis.speaking||(au&&!au.paused)){speechSynthesis.cancel();au&&au.pause();return}
 const k=key(S.ci,S.li);if(NARRATION[k]){au=new Audio(NARRATION[k]);au.play();return}
 const L=lv(),u=new SpeechSynthesisUtterance(L.learn.replace(/<[^>]+>/g,'')+' Your mission: '+L.mis);u.rate=.95;speechSynthesis.speak(u)}
$('#run').onclick=run;$('#reset').onclick=reset;$('#exit').onclick=()=>{S.run=false;menu()};
$('#hint').onclick=()=>{const h=lv().hints,mx=DIFF==='pro'?Math.min(1,h.length):h.length;if(S.hint<mx)S.hint++;msg(`<b>Hint ${S.hint}/${mx}:</b> ${h[S.hint-1]}`,'hint')};
$('#chs').onclick=e=>{const b=e.target.closest('.lb');if(b&&!b.disabled)play(+b.dataset.c,+b.dataset.l)};
$('#name').oninput=e=>{S.name=e.target.value.trim()||'Player';save();hud()};
const any=(a,f)=>a.some(b=>f(b)||any(kids(b),f));
const LEARN=[
 ['A variable is a labelled box that remembers a value.','set puts a value in the box. change adds to it: change by 3 is addition, and change by minus 1 is subtraction.','Boxes can hold numbers or words, and a box only keeps its latest value, so the order of your blocks matters.','You can have many boxes, each with its own label.'],
 ['A loop repeats blocks so you write a step once and run it many times.','Loops and variables work together: a variable can count laps, or grow a little every time round.','Blocks outside a loop run once, and a loop inside a loop multiplies: 2 times 2 times 2 makes 8 steps.'],
 ['An if block asks a yes or no question, and else runs when the answer is no.','Conditions compare with more than, less than, or exactly equal.','Your script must work for every test case, not just one.','You can put an if inside an else for three outcomes, and an if inside a loop to decide again every lap.'],
 ['Variables, loops and logic are strongest when you combine them.','There is almost always more than one way to solve a problem, so you can write fresh code instead of repeating yourself.','Reading what a program remembers and does is how you plan, test and fix your code like a real programmer.']];
const learnedHTML=c=>`<div class="learned"><b>What you learned in ${CH[c].t.replace('Boss: ','')}</b><ul>${LEARN[c].map(x=>'<li>'+x+'</li>').join('')}</ul><button class="btn ghost sm" id="lis">Listen again</button></div>`;
function stopSay(){try{speechSynthesis.cancel();au&&au.pause()}catch(e){}}
function sayLearned(c){stopSay();try{if(NARRATION['ch'+c]){au=new Audio(NARRATION['ch'+c]);au.play().catch(()=>{});return}
 const u=new SpeechSynthesisUtterance('Congratulations '+S.name+'! You finished '+CH[c].n+', '+CH[c].t.replace('Boss: ','')+'. Here is what you learned. '+LEARN[c].join(' '));u.rate=.95;speechSynthesis.speak(u)}catch(e){}}
function confetti(){if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;for(let i=0;i<140;i++){const e=document.createElement('span');e.className='spark';e.style.cssText=`left:${Math.random()*innerWidth}px;top:-14px;width:${6+Math.random()*7}px;height:${10+Math.random()*8}px;background:hsl(${Math.random()*360} 85% 62%)`;document.body.appendChild(e);e.animate([{transform:'translate(0,0) rotate(0)'},{transform:`translate(${(Math.random()-.5)*240}px,${innerHeight+40}px) rotate(${Math.random()*900}deg)`}],{duration:2200+Math.random()*2200,delay:Math.random()*900,easing:'cubic-bezier(.2,.6,.4,1)',fill:'backwards'}).onfinish=()=>e.remove()}}

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
 if(k==='--p'){const o=+track.style.getPropertyValue('--px');if(v===0)bot.style.setProperty('--f',1);else if(c[0]<o)bot.style.setProperty('--f',-1);else if(c[0]>o)bot.style.setProperty('--f',1);track.style.setProperty('--px',c[0]);track.style.setProperty('--py',c[1])}
 else{track.style.setProperty('--gx',c[0]);track.style.setProperty('--gy',c[1])}}
function whyList(){const seen={},rows=[];(function w(a){a.forEach(b=>{if(!seen[b.t]){seen[b.t]=1;rows.push(`<li><b>${one(b)}</b>: ${WHY[b.t]}</li>`)}w(kids(b))})})(S.script);return '<ul class="why">'+rows.join('')+'</ul>'}
function whyHTML(){const L=lv();return `<div class="learned"><b>What each block did in your code</b>${whyList()}${L.boss?'':'<p style="margin:8px 0 0;font-size:14px"><b style="color:var(--fg)">The idea:</b> '+L.learn+'</p>'}</div>`}
let bossWait=false,introPending=false,tauntT='',tauntX=0,mute=false,AC=null;
try{mute=localStorage.getItem('tlp-mute')==='1'}catch(e){}
const TAUNTS=['Boxes? I eat boxes for breakfast.','Loops. I have seen them all.','Decisions, decisions...','This ends here, little robot.'];
function showToast(t,cls,label,cb){const T=$('#toast');T.className=cls||'';T.innerHTML='<div>'+t+'</div><button class="btn sm" id="tx">'+(label||'Dismiss')+'</button>';T.hidden=false;$('#tx').onclick=()=>{T.hidden=true;if(cb)cb()}}
function hideToast(){$('#toast').hidden=true}
function msg(t,c=''){if(c==='hint'||c==='bad'||/^<b>(Correct|Direct)/.test(t)){showToast(t,c||'ok');return}hideToast();const m=$('#msg');m.className=c;m.innerHTML=t}
function fly(a,b,col,ms){return new Promise(r=>{try{const A=a.getBoundingClientRect(),Z=b.getBoundingClientRect(),o=document.createElement('i'),ax=A.left+A.width/2,ay=A.top+A.height/2;o.className='orb';o.style.cssText=`left:${ax-9}px;top:${ay-9}px;background:${col};box-shadow:0 0 14px ${col},0 0 30px ${col}`;document.body.appendChild(o);o.animate([{transform:'translate(0,0) scale(.7)'},{transform:`translate(${Z.left+Z.width/2-ax}px,${Z.top+Z.height/2-ay}px) scale(1.6)`}],{duration:ms||480,easing:'ease-in'}).onfinish=()=>{o.remove();r()}}catch(e){r()}})}
function dmg(t,el){const R=el.getBoundingClientRect(),d=document.createElement('b');d.className='dmg';d.textContent=t;d.style.cssText=`left:${R.left+R.width/2}px;top:${R.top}px`;document.body.appendChild(d);d.animate([{transform:'translate(-50%,0)',opacity:1},{transform:'translate(-50%,-50px)',opacity:0}],{duration:900}).onfinish=()=>d.remove()}
function vig(c){const v=document.createElement('i');v.className='vig';v.style.boxShadow=`inset 0 0 130px 50px ${c||'rgba(239,60,80,.8)'}`;document.body.appendChild(v);v.animate([{opacity:0},{opacity:1},{opacity:0}],{duration:600}).onfinish=()=>v.remove()}
function taunt(t){tauntT=t;const e=$('#tnt');if(e)e.textContent=t;clearTimeout(tauntX);tauntX=setTimeout(()=>{tauntT='';const e=$('#tnt');if(e)e.textContent=''},4200)}
const bossBot=(cls,st,id)=>`<div${id?` id="${id}"`:''} class="bb ${cls||''}"${st?` style="${st}"`:''}><i class="ant"></i><i class="ant r"></i><div class="bh2"><i class="eye"></i><i class="eye"></i><i class="mouth"></i></div></div>`;
const hearts=(n,brk)=>Array.from({length:B.max||3},(_,i)=>i).map(i=>`<span class="h ${i<n?'':(i===n&&brk?'brk':'empty')}"><i>♥</i><i>♥</i></span>`).join('');
function hudFit(){const b=$('#boss'),h=(b.hidden||$('#game').hidden)?0:b.offsetHeight;document.body.style.paddingTop=h?h+'px':'';document.documentElement.style.setProperty('--hudh',h+'px')}
addEventListener('resize',hudFit);
function cine(html,cls){uncine();const c=document.createElement('div');c.id='cine';c.className=cls||'';c.innerHTML=html;document.body.appendChild(c);return c}
function uncine(){const c=$('#cine');if(c)c.remove()}
function bossRepeat(){const old=B.mem.find(m=>m.g===sig(S.script));if(!old)return false;bossWait=true;B.me--;bossAttack(old);return true}
async function bossAttack(old){try{
 taunt(['I remember this one!','Same trick again? Predictable.','You already showed me that.'][Math.floor(Math.random()*3)]);bossDraw(false,true);
 const bb=$('#bb');bb.classList.add('atk');snd('zap');await fly(bb,$('#hearts'),'#ff4d6a',520);
 snd('crack');vig();bossDraw(true);bot.classList.add('oops');const z=$('#boss');z.classList.remove('zap');void z.offsetWidth;z.classList.add('zap');
 await sleep(900);
 if(B.me<=0){defeatScene();return}
 msg(`<b>The Glitch remembers!</b> You already used this exact attack in Round ${old.r}. It blocked you and hit back: −1 heart (${B.me} left). Build a brand-new attack.`,'bad')}finally{bossWait=false}}

const SEC=[
 {t:'The Basics',d:'How programs think: steps, boxes, repeats and decisions.',ch:[4,0,1,2],boss:3},
 {t:'Data',d:'What information is, and how to handle it safely.',ch:[5,6,7,8],boss:9},
 {t:'Tools',d:'Do more with less code: maths, lists, input and notes.',ch:[10,11,12,13],boss:14},
 {t:'Structure',d:'Build bigger programs from small reusable parts.',ch:[15,16,17,18],boss:19},
 {t:'Bits and Bytes',d:'Go deep on the switches inside every computer.',ch:[20,21,22,23],boss:24},
 {t:'Mastery',d:'Debug, search and optimise like a real programmer.',ch:[25,26,27,28],boss:29}];
const BC=['#ef7a8c','#e8a23a','#9b5cf0','#35c9e8','#3ddc84','#f2c94c'];
const L1=(t,df,learn,mis,o)=>Object.assign({t,df,learn,mis,vars:{},allow:[],par:2,hints:[]},o);
CH.push(
{n:'',t:'Programming',d:'A program is a list of instructions run in order.',L:[
 L1('Step by step','Easy','A <b>program</b> is a list of instructions. The computer follows them one at a time, from the top to the bottom.','Walk 2 cells, then make the robot say hello.',{vars:{word:'hello'},allow:['move','say'],goal:2,say:'hello',par:2,hints:['Two instructions: one walks, one speaks.','Use move for walking and say for the word.','Move 2, then say word.']}),
 L1('Order matters','Easy','Changing the <b>order</b> changes the result. A box must be filled <i>before</i> you read it.','Say the name Nova, then walk 3 cells.',{vars:{word:'',steps:0},allow:['set','say','move'],goal:3,say:'Nova',par:4,path:'hook',hints:['If you say the box while it is empty, nothing comes out.','Fill word first, then say it.','Set word to Nova, say word, set steps to 3, move steps.']})]},
{n:'',t:'Constants',d:'Boxes that are locked and never change.',L:[
 L1('A locked box','Easy','A <b>constant</b> is a box whose value is fixed. Once it is set, nothing can change it. A lock 🔒 appears on it.','lap is a constant holding 2. Reach the chip at cell 4 using lap. Do not try to change it.',{vars:{lap:2},consts:['lap'],allow:['change','move','rep'],goal:4,par:2,path:'snake',hints:['You may only read a constant, never change it.','Moving by lap twice gives 4.','Repeat 2 times: move lap. Or move lap twice.']}),
 L1('Safe settings','Medium','Constants protect important settings, like speed or gravity, so no other part of the program can break them.','speed is a constant holding 3. Reach cell 9? The track ends at 8, so reach the chip at cell 6 using speed.',{vars:{speed:3},consts:['speed'],allow:['change','move','rep'],goal:6,par:2,path:'s',hints:['6 is two lots of speed.','A repeat block saves typing.','Repeat 2: move speed.']})]},
{n:'',t:'Data Types',d:'Numbers, words and why they are different.',L:[
 L1('Numbers and words','Easy','Every value has a <b>type</b>. A number like 4 can be used for maths and moving. A word like "four" is text. Moving needs a number.','count is a number and label is a word. Reach cell 4, then say the word.',{strict:true,vars:{count:4,label:'four'},allow:['move','say'],goal:4,say:'four',par:2,path:'maze',hints:['One box is a number and one is a word.','Move needs the number box. Say can speak the word box.','Move count, then say label.']}),
 L1('Pick the right box','Medium','Choosing the wrong type causes an error. A good programmer checks what type a box holds before using it.','Move with the numbers, then say the word two.',{strict:true,vars:{a:2,b:'two',c:5},allow:['move','say'],goal:7,say:'two',par:3,path:'stairs',hints:['Which boxes hold numbers?','2 + 5 = 7.','Move a, move c, say b.']})]},
{n:'',t:'Type Casting',d:'Turning one type into another.',L:[
 L1('Word to number','Easy','<b>Type casting</b> converts a value from one type to another. The word "3" looks like a number but is still text until you convert it.','s holds the word "3". Turn it into a number and reach cell 3.',{strict:true,vars:{s:'3'},allow:['cast','move'],goal:3,par:2,path:'hook',hints:['Moving with a word causes an error.','Convert s to a number first.','Turn s into number, then move s.']}),
 L1('Two words','Medium','You can cast several boxes. Convert each one before you use it for maths or movement.','a holds "2" and b holds "4", both words. Reach cell 6.',{strict:true,vars:{a:'2',b:'4'},allow:['cast','move'],goal:6,par:4,path:'snake',hints:['Both boxes are words.','Convert each one separately.','Turn a into number, turn b into number, move a, move b.']})]},
{n:'',t:'Strings',d:'Working with pieces of text.',L:[
 L1('Glue words together','Easy','A <b>string</b> is text. <b>Joining</b> strings glues them end to end. Joining "Hello" and "Nova" gives "HelloNova".','Make the robot say Hello Nova (with the space).',{vars:{a:'Hello',sp:' ',b:'Nova',out:''},allow:['join','say'],say:'Hello Nova',par:3,path:'s',hints:['You need three pieces: a, the space, and b.','Join in two steps, storing into out.','Join a and sp into out, join out and b into out, say out.']}),
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
 L1('A full row','Easy','A <b>bit</b> is one on/off switch. Each bit has a value: 1, 2, 4, 8... A <b>byte</b> is 8 bits. Adding the values of the switches that are on gives the number.','Switch on the bits worth 1, 2, 4 and 8, then say the total.',{vars:{total:0,bin:'0'},allow:['bit','say'],cases:[{vars:{},say:'15'}],par:5,hints:['Four switches, all on.','Each bit block switches on one value.','Bit 1, bit 2, bit 4, bit 8, then say total.']}),
 L1('The big switch','Medium','A byte has 8 bits worth 1, 2, 4, 8, 16, 32, 64 and 128. The biggest switch is 128. All eight on makes 255, the largest byte.','Make 130 with as few bit switches as you can, then say the total.',{vars:{total:0,bin:'0'},allow:['bit','say'],cases:[{vars:{},say:'130'}],par:3,hints:['130 is 128 plus something.','130 - 128 = 2.','Bit 128, bit 2, say total.']}),
 L1('Spot the pattern','Medium','Writing the switches as 1 (on) and 0 (off) gives the <b>binary</b> form. 5 is 101: a 4, no 2 and a 1.','Make 5 with bits and say its binary form from the bin box.',{vars:{total:0,bin:'0'},allow:['bit','say'],cases:[{vars:{},say:'101'}],par:3,hints:['5 = 4 + 1.','bin writes the switches as 1 and 0.','Bit 4, bit 1, say bin.']})]},
{n:'',t:'Binary Counting',d:'Converting between normal numbers and binary.',L:[
 L1('Decimal to binary','Easy','You can convert a normal number into binary text. 6 in binary is 110.','n holds 6. Convert it to binary and say the result.',{vars:{n:6,b:''},allow:['base','say'],cases:[{vars:{},say:'110'}],par:2,path:'hook',hints:['Use the convert block.','Choose "to binary" and store in b.','Convert n to binary into b, then say b.']}),
 L1('Binary to decimal','Medium','Reading binary the other way: each digit is a switch. 101 means 4 + 0 + 1 = 5.','b holds the binary word 101. Convert it to a number and walk that far.',{vars:{b:'101',n:0},allow:['base','move'],goal:5,par:2,path:'snake',hints:['Convert from binary to a number.','Store the number in n.','Convert b from binary into n, then move n.']}),
 L1('There and back','Hard','Converting there and back should give the same number. Programmers use this to check their work.','n holds 4. Convert it to binary and say it, then convert it back and walk that far.',{vars:{n:4,b:'',m:0},allow:['base','move','say'],cases:[{vars:{},goal:4,say:'100'}],par:4,path:'s',hints:['Two conversions, in opposite directions.','The word goes in b, the number comes back in m.','Convert n to binary into b, say b, convert b from binary into m, move m.']})]},
{n:'',t:'Binary Maths',d:'Adding and shifting numbers in binary.',L:[
 L1('Add two binary numbers','Medium','To add binary numbers, convert them first. 11 is 3 and 10 is 2, so together they make 5.','a holds 11 and b holds 10 (binary words). Convert both and walk their sum.',{vars:{a:'11',b:'10',x:0,y:0},allow:['base','move'],goal:5,par:4,path:'maze',hints:['Convert each word to a number.','Walk both numbers one after the other.','Convert a into x, convert b into y, move x, move y.']}),
 L1('Shift left doubles','Medium','Shifting every bit one place <b>left</b> doubles the number. 3 (011) becomes 6 (110).','a holds 3. Shift it left by 1 and walk the result.',{vars:{a:3,r:0},allow:['calc','move'],goal:6,par:2,path:'stairs',rule:{txt:'use a shift operator.',f:s=>any(s,b=>b.t==='calc'&&(b.op==='<<'||b.op==='>>'))},hints:['Shift left means multiply by two.','Use calculate with the shift left operator.','Calculate r = a shift left 1, then move r.']}),
 L1('Shift right halves','Hard','Shifting <b>right</b> halves the number and drops the remainder.','a holds 8. Shift it right by 1, then walk the result twice.',{vars:{a:8,r:0},allow:['calc','move'],goal:8,par:3,path:'hook',rule:{txt:'use a shift operator.',f:s=>any(s,b=>b.t==='calc'&&(b.op==='<<'||b.op==='>>'))},hints:['Half of 8 is 4.','Walk 4 twice makes 8.','Calculate r = a shift right 1, move r, move r.']})]},
{n:'',t:'Bit Operations',d:'AND, OR and XOR work on every bit at once.',L:[
 L1('AND keeps what both share','Medium','Bitwise <b>AND</b> keeps a bit only if it is on in both numbers. 5 is 101 and 3 is 011, so only the last bit survives: 001, which is 1.','a holds 5. Combine it with 3 using AND and walk the result.',{vars:{a:5,r:0},allow:['calc','move'],goal:1,par:2,path:'s',rule:{txt:'use the AND operator.',f:s=>any(s,b=>b.t==='calc'&&b.op==='&')},hints:['Both bits must be on.','Pick AND (bits) in the calculate block.','Calculate r = a AND 3, then move r.']}),
 L1('OR keeps what either has','Medium','Bitwise <b>OR</b> keeps a bit if it is on in either number. 101 OR 010 gives 111, which is 7.','a holds 5. Combine it with 2 using OR and walk the result.',{vars:{a:5,r:0},allow:['calc','move'],goal:7,par:2,path:'maze',rule:{txt:'use the OR operator.',f:s=>any(s,b=>b.t==='calc'&&b.op==='|')},hints:['Either bit being on is enough.','Pick OR (bits).','Calculate r = a OR 2, then move r.']}),
 L1('XOR keeps the differences','Hard','Bitwise <b>XOR</b> keeps a bit only if the numbers <i>differ</i> there. 101 XOR 011 gives 110, which is 6.','a holds 5. Combine it with 3 using XOR and walk the result.',{vars:{a:5,r:0},allow:['calc','move'],goal:6,par:2,path:'stairs',rule:{txt:'use the XOR operator.',f:s=>any(s,b=>b.t==='calc'&&b.op==='^')},hints:['A bit is kept only when the two differ.','Pick XOR (bits).','Calculate r = a XOR 3, then move r.']})]},
{n:'',t:'The Byte',d:'The fifth guardian guards the binary vault.',L:[{t:'The Byte',df:'Boss',learn:'',mis:'',vars:{},allow:['set','change','move','say','rep','if','bit','base','calc'],boss:1,par:99,hints:[]}]},
{n:'',t:'Debugging',d:'Find the mistake in a script that is almost right.',L:[
 L1('The missing step','Easy','A <b>bug</b> is a mistake in code. Debugging means finding it and fixing it. This script has one.','The script should reach cell 6, but it stops at cell 3. Fix it.',{vars:{steps:3},allow:['move','say'],goal:6,par:2,start:()=>[BK('move',{src:'steps'})],hints:['Run it and watch where the robot stops.','It only walks once.','Add a second move steps.']}),
 L1('Too far','Medium','Bugs are often a wrong number. Read the script slowly and work out what it does.','The script should reach cell 5, but it walks too far. Fix it.',{vars:{},allow:['rep','move'],goal:5,par:2,path:'snake',start:()=>[BK('rep',{n:3},[BK('move',{n:2})])],hints:['3 laps of 2 is 6.','Change the numbers.','Repeat 5 times and move 1.']}),
 L1('Wrong order','Medium','Order matters. A box must be filled before you read it, so the order of blocks can be the bug.','The robot should say Nova, but it says nothing. Fix the order.',{vars:{word:''},allow:['set','say'],cases:[{vars:{},say:'Nova'}],par:2,path:'maze',start:()=>[BK('say',{src:'word'}),BK('set',{v:'word',val:'Nova'})],hints:['What is in word when it is said?','Drag the set block above the say block.','Set word to Nova first, then say word.']})]},
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
LEARN[20]=['A bit is an on/off switch with a value. A byte is 8 bits.','The bit values are 1, 2, 4, 8, 16, 32, 64 and 128. Add the ones that are on.','The biggest number in one byte is 255.'];
LEARN[21]=['Binary writes a number using only 0 and 1.','You can convert a number to binary and back again.','Each binary digit is a switch worth double the one to its right.'];
LEARN[22]=['To add binary numbers, convert them to normal numbers first or add column by column.','Shifting left multiplies by two. Shifting right halves.','Computers do maths with bits very fast.'];
LEARN[23]=['AND keeps a bit only if it is on in both numbers.','OR keeps a bit if it is on in either number.','XOR keeps a bit only if the two numbers differ.'];
LEARN[24]=['Bits, binary conversion and bit operations work together.','You switched bits, converted bases and combined numbers.','A guardian that remembers teaches you to try fresh solutions.'];
LEARN[25]=['A bug is a mistake in code, and debugging is finding and fixing it.','Read the code slowly and work out what each line does.','Typical bugs are wrong numbers, missing steps and wrong order.'];
LEARN[26]=['A search checks items one by one until it finds a match.','The position of the match is often the answer.','A search can also answer yes or no.'];
LEARN[27]=['To find the biggest, remember the best so far and replace it when you see a better one.','The same idea finds the smallest.','Starting values matter: pick one that cannot win.'];
LEARN[28]=['Optimising means doing the same job with less code.','Loops replace repeated blocks and are easier to change.','Shorter code has fewer places for bugs to hide.'];
LEARN[29]=['Every idea you learned can combine into bigger programs.','You searched, compared, looped and used functions together.','Every guardian is gone and the light is back.'];

SEC.forEach((s,si)=>{s.ch.forEach((c,i)=>CH[c].n='Section '+(si+1)+' · Chapter '+(i+1));CH[s.boss].n='Section '+(si+1)+' · Boss'});
const ORDER=SEC.flatMap(s=>[...s.ch,s.boss]),nextOf=c=>ORDER[ORDER.indexOf(c)+1];
const anyProg=c=>CH[c].L.some((_,l)=>S.prog[key(c,l)]);
const isOpen=c=>{const i=ORDER.indexOf(c);return i<1||done(ORDER[i-1])||ORDER.slice(i).some(anyProg)};
LEARN[4]=['A program is a list of instructions that run in order, top to bottom.','Changing the order can change the result: fill a box before you read it.','Blocks are simple instructions you can combine into bigger ideas.'];
LEARN[5]=['A constant is a box whose value never changes after it is set.','Constants protect important settings, like speed or gravity, from accidental changes.','You can read a constant as often as you like, but not change it.'];
LEARN[6]=['Every value has a type, such as a number or a word.','Numbers can be used for maths and moving. Words are text.','Using the wrong type causes an error, so check what a box holds.'];
LEARN[7]=['Type casting converts a value from one type to another.','The word 3 looks like a number but is text until you convert it.','Convert before you use a value for maths.'];
LEARN[8]=['A string is text, a list of characters.','Joining strings glues them end to end.','Loops and joining build long text one piece at a time.'];
LEARN[9]=['Data has types, locks and shapes, and you can combine them.','You turned words into numbers, glued strings and used constants.','A guardian that remembers teaches you to try fresh solutions.'];
LEARN[10]=['Operators calculate: plus, minus, times, divide, and remainder.','The remainder is what is left after dividing.','Operators let one value be built from others.'];
LEARN[11]=['An array is a list stored in one box. Items are numbered from 1.','Pick an item by its number.','A loop with a counter can walk the whole list.'];
LEARN[12]=['Input is information coming into a program, and output is what it shows or says.','A program should work for any input, not just one.','Reading input then answering is how apps talk to people.'];
LEARN[13]=['A comment is a note for humans that the computer ignores.','Good comments explain why, not only what.','Comments make code easier to read and fix later.'];
LEARN[14]=['Operators, arrays, input and comments work together.','You calculated, listed, listened and explained your code.','A guardian that remembers teaches you to try fresh solutions.'];
LEARN[15]=['A function is a named group of blocks. Define it once, call it many times.','Functions remove repetition and keep code tidy.','A function can use the boxes around it.'];
LEARN[16]=['Scope is where a variable exists.','A change made inside a function stays inside it.','The outside box is global and stays safe from accidents.'];
LEARN[17]=['Recursion is a function calling itself.','It needs a base case, a rule that tells it when to stop.','Each call works on a smaller problem.'];
LEARN[18]=['A bit is an on/off switch with a value: 1, 2, 4, 8 and so on.','Add the values of the switches that are on to get a number. 8 bits make a byte.','Binary writes numbers using only 0 and 1.'];
LEARN[19]=['Functions, scope, recursion and bits are the strongest tools of all.','You can now build programs from small reusable pieces.','Every guardian is gone and the light is back.'];

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
const BAD=[{t:'Glitch Slayer',ico:'🛡️',cls:'bd1'},{t:'Data Keeper',ico:'💎',cls:'bd2'},{t:'Cipher Cracker',ico:'🗝️',cls:'bd3'},{t:'Light Bringer',ico:'☀️',cls:'bd4'}];
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
const WHY={set:'Puts a value into a labelled box (a variable). Whatever was there before is replaced.',change:'Adds to the number already in the box. Use a negative number to take away.',move:'Walks the robot forward along the path. Give it a number, or pick a box to use the value inside it.',say:'Makes the robot speak whatever is inside the box you choose.',rep:'Runs the blocks inside it again and again, so you only write the step once.',if:'Asks a yes or no question. If yes, the blocks under then run. If no, the else blocks run.',note:'A comment. The computer ignores it, but people reading your code understand it.',ask:'Input: waits for what the player types and stores it in a box.',calc:'An operator block: calculates a new value (plus, minus, times, divide or remainder).',join:'Glues two pieces of text together into one string.',cast:'Type casting: converts a box from one type to another, like a word into a number.',pick:'Reads one item from an array (a list in a box) by its number.',def:'Defines a function: a named group of blocks that does nothing until it is called.',call:'Calls a function: runs the blocks stored under its name.',bit:'Switches on one bit. The total is the sum of every bit that is on.',while:'Repeats the blocks inside for as long as its condition stays true, then stops.',base:'Converts a value between a normal number and binary text, in either direction.'};
const tx=b=>{const k=b.c.map(tx).join('; '),e=(b.e||[]).map(tx).join('; ');return b.t==='rep'?`repeat ${b.n} {${k}}`:b.t==='if'?`if ${b.v} ${b.op} ${b.n}${b.j&&b.j!=='none'?' '+b.j+' '+b.v2+' '+b.op2+' '+b.n2:''} {${k}} else {${e}}`:b.t==='while'?`while ${b.v} ${b.op} ${b.n} {${k}}`:b.t==='def'?`define ${b.v} {${k}}`:one(b)};
const sg=b=>[b.t,b.v,b.val,b.src,b.src2,b.to,b.idx,b.op,+b.n,b.rv,b.rv2,b.j,b.v2,b.op2,b.n2,b.c.map(sg),b.e.map(sg)],sig=a=>JSON.stringify(a.map(sg));
function snd(k){if(mute)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const t=AC.currentTime;
 const tone=(f,d,w,v,s,f2)=>{const o=AC.createOscillator(),g=AC.createGain();o.type=w||'square';o.frequency.setValueAtTime(f,t+(s||0));if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+(s||0)+d);g.gain.setValueAtTime(v||.12,t+(s||0));g.gain.exponentialRampToValueAtTime(.001,t+(s||0)+d);o.connect(g);g.connect(AC.destination);o.start(t+(s||0));o.stop(t+(s||0)+d)};
 const SF={hit:()=>{tone(520,.18,'sawtooth',.14,0,120);tone(90,.25,'square',.12,.02)},zap:()=>tone(900,.4,'sawtooth',.1,0,120),crack:()=>{tone(180,.2,'square',.15,0,60);tone(1200,.08,'triangle',.1,.02,400)},intro:()=>[110,98,82].forEach((f,i)=>tone(f,.5,'sawtooth',.12,i*.28)),lose:()=>[392,330,262,196].forEach((f,i)=>tone(f,.45,'triangle',.16,i*.32)),win:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.3,'square',.1,i*.15)),ominous:()=>{tone(70,1.8,'sawtooth',.1,0,55);tone(74,1.8,'sawtooth',.08,0,58)},boom:()=>tone(120,.7,'sawtooth',.18,0,30),
  tick:()=>tone(520,.06,'triangle',.05),step:()=>tone(240,.05,'triangle',.04),chime:()=>{tone(784,.18,'sine',.07);tone(1175,.3,'sine',.06,.09)},err:()=>tone(150,.22,'sawtooth',.07,0,90),ach:()=>[784,988,1319].forEach((f,i)=>tone(f,.22,'sine',.07,i*.1)),
  b1:()=>{tone(300,.5,'sawtooth',.09,0,1200);[523,659,784,1047].forEach((f,i)=>tone(f,.35,'square',.07,.45+i*.1))},b2:()=>[1319,1568,2093,1568,2637].forEach((f,i)=>tone(f,.45,'sine',.08,i*.12)),b3:()=>{[0,.08,.16].forEach(s=>tone(120,.05,'square',.09,s));[392,494,587,784].forEach(f=>tone(f,.9,'triangle',.06,.35))},b4:()=>{[262,330,392,523].forEach(f=>tone(f,1.4,'sawtooth',.05,0));[523,659,784,1047,1319].forEach((f,i)=>tone(f,.5,'square',.06,.5+i*.14))}};
 SF[k]&&SF[k]()}catch(e){}}
function toggleMute(){mute=!mute;try{localStorage.setItem('tlp-mute',mute?'1':'0')}catch(e){}const g=$('#sndg');if(g)g.textContent=mute?'🔇':'🔊';const s=$('#snd');if(s)s.textContent='Sound: '+(mute?'off':'on')}
function puff(x,y,n){if(still)return;for(let i=0;i<(n||6);i++){const s=document.createElement('span');s.className='spark';s.style.cssText=`left:${x}px;top:${y}px;width:5px;height:5px;background:${i%2?'var(--a)':'var(--b)'}`;document.body.appendChild(s);const a=Math.random()*6.28,d=14+Math.random()*26;s.animate([{transform:'translate(0,0)',opacity:.9},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d}px)`,opacity:0}],{duration:520,easing:'ease-out'}).onfinish=()=>s.remove()}}
function goalFx(){const c=track.querySelector('.chip');if(!c)return;const r=c.getBoundingClientRect();puff(r.left+r.width/2,r.top+r.height/2,10);c.classList.add('hit');setTimeout(()=>c.classList.remove('hit'),900)}
function setLight(){try{const k=SEC.filter(s=>done(s.boss)).length;document.documentElement.style.setProperty('--dim',[.5,.42,.34,.26,.18,.09,0][k])}catch(e){}}
function chCard(ci){const c=CH[ci],open=isOpen(ci);return `<div class="card ch ${c.L[0].boss?'bossc ':''}${open?'':'lock'}"><span class="hand">${c.n}${open?'':' · locked'}</span><h3>${c.t}</h3><p>${c.d}</p><div class="lvls">${c.L.map((l,li)=>`<button class="lb" data-c="${ci}" data-l="${li}" ${open&&(li===0||S.prog[key(ci,li-1)])?'':'disabled'}>${li+1}. ${l.t}<small>${'★'.repeat(S.prog[key(ci,li)]||0)||l.df}</small></button>`).join('')}</div></div>`}
function menu(){$('#menu').hidden=false;$('#game').hidden=true;hudFit();$('#exit').hidden=true;$('#name').value=S.name;delete document.body.dataset.sec;hud();renderPick();renderTally();
 const kd=SEC.filter(s=>done(s.boss)).length;
 $('#chs').innerHTML=`<div class="guard">${SEC.map((_,i)=>`<div class="gd ${i<kd?'dead':''}">${bossBot(i<kd?'dead k'+i:'sil','--s:5px;--ec:'+BC[i])}<small>${i<kd?'defeated':'watching'}</small></div>`).join('')}<div class="gtxt"><b>${SEC.length-kd} of ${SEC.length} guardians alive</b><span>Light restored: ${kd} of ${SEC.length}</span></div></div>`+SEC.map((s,si)=>`<section class="sec"><h2><span class="hand">Section ${si+1}</span> ${s.t}</h2><p class="sd">${s.d}</p><div class="chs">${[...s.ch,s.boss].map(chCard).join('')}</div></section>`).join('')}
const bi=()=>BOSSES[S.ci],bkey=()=>S.ci===3?'tlp-boss':'tlp-boss'+S.ci;
function bossRound(k){if(!k){let o=null;try{o=JSON.parse(localStorage.getItem(bkey())||'null')}catch(e){}B=o&&o.hp>0&&o.me>0?o:(introPending=true,{r:0,hp:100,me:DH(),max:DH(),mem:[]})}Object.assign(lv(),bi().rounds[B.r])}
function bossDraw(brk,pre){try{if(B.hp<=0||B.me<=0)localStorage.removeItem(bkey());else localStorage.setItem(bkey(),JSON.stringify(B))}catch(e){}
 $('#boss').innerHTML=`${bossBot('k'+bi().k,'--s:7px','bb')}<div class="nm"><b>${bi().name}</b><small>Round ${Math.min(B.r+1,4)} of 4 · ${Math.max(B.hp,0)} / 100 HP</small><div class="hpb"><i style="width:${Math.max(B.hp,0)}%"></i></div><div class="tnt" id="tnt">${tauntT}</div></div><div><div class="lab" style="margin:0 0 4px">Your HP</div><span class="hrt" id="hearts">${hearts(B.me+(pre?1:0),brk)}</span></div><div class="mw"><div class="lab" style="margin:0 0 4px">${nice(bi().name)} remembers</div><div class="mcs">${B.mem.length?B.mem.map(m=>`<span class="mc" title="Round ${m.r}: ${m.t}"><b>R${m.r}</b> ${m.t}</span>`).join(''):'<span class="mc">nothing yet</span>'}</div></div><button class="btn sm ghost" id="snd">Sound: ${mute?'off':'on'}</button>`;
 $('#snd').onclick=toggleMute;hudFit()}
function bossUI(){const on=!!lv().boss;$('#boss').hidden=!on;if(on){tauntT=bi().taunts[B.r]||'';bossDraw();if(introPending){introPending=false;bossIntro()}}else hudFit()}
function bossIntro(){snd('intro');cine(`<div class="stage"><div class="intro-bot">${bossBot('k'+bi().k,'--s:16px')}</div><h2 class="ctitle">${bi().name}</h2><p class="csub">${bi().intro} It has 100 HP and it <b>remembers every attack that lands</b>. Use the same attack twice and it strikes back and breaks one of your hearts. There are 4 rounds, so be creative and use everything you have learned.</p><button class="btn" id="cgo">Fight!</button></div>`,'c-intro');$('#cgo').onclick=()=>{snd('hit');uncine()}}
async function bossHit(){bossWait=true;try{const n=count(S.script);B.mem.push({r:B.r+1,g:sig(S.script),t:S.script.map(tx).join('; ')});try{localStorage.removeItem('tlp-draft')}catch(e){}
 await fly(bot,$('#bb'),'#6ae8ff',460);snd('hit');dmg('−25',$('#bb'));B.hp-=25;bot.classList.add('win');sparks();bossDraw();$('#bb').classList.add('hurt');
 if(B.hp<=0){const st=Math.max(1,Math.round(B.me*3/(B.max||3))),k=key(S.ci,0),bk=bi().k;S.prog[k]=Math.max(S.prog[k]||0,st);save();hud();msg('The guardian is defeated!');await sleep(700);await winScene(bk);await badgeScene(bk);checkAch();finish(st,n);return}
 taunt(['Ow! I will remember that.','You got me. Not again though.','Nearly there... for you.'][Math.min(B.r,2)]);
 await new Promise(r=>showToast('<b>Direct hit! −25 HP.</b> The guardian memorises this attack. If you use it again, it will hit back.<br>What each block did:'+whyList(),'','Next round ▶',r));
 B.r++;play(S.ci,0,1)}finally{bossWait=false}}
function defeatScene(){snd('lose');vig();cine(`<div class="stage"><div class="bighearts">${[0,1,2].map(()=>'<span class="h"><i>♥</i><i>♥</i></span>').join('')}</div><div class="cb">${bossBot('laugh k'+bi().k,'--s:12px')}</div><h2 class="ctitle">You were defeated</h2><p class="csub">${nice(bi().name)} remembered every move you made. Read its memory next time and try something it has never seen.</p><div class="bar" style="justify-content:center"><button class="btn" id="cagain">Fight again</button><button class="btn ghost" id="cmenu">Back to menu</button></div></div>`,'c-lose');
 const hs=document.querySelectorAll('#cine .h');hs.forEach((h,i)=>setTimeout(()=>{h.classList.add('brk');snd('crack')},500+i*650));
 $('#cagain').onclick=()=>{try{localStorage.removeItem(bkey())}catch(e){}uncine();play(S.ci,0)};$('#cmenu').onclick=()=>{uncine();menu()}}
function winScene(k){let skip=false;return new Promise(res=>{const end=()=>{skip=true;uncine();setLight();res()};
 const others=SEC.map((_,i)=>i).filter(i=>i!==k),sz=[9,13,8,10,11];
 const small=others.map((j,n)=>`<div class="sw${n+1}">${bossBot(j<k?'dead k'+j:'sil','--s:'+sz[n]+'px;--ec:'+BC[j])}</div>`).join('');
 const c=cine(`<button class="cskip" id="cskip">Skip</button><div class="stage">${small}<div style="height:90px"></div><div id="cb" class="cb">${bossBot('hurt k'+k,'--s:15px')}</div><h2 id="ct" class="ctitle"></h2><div id="cl" class="clines"></div><button class="btn" id="cgo" hidden>Continue</button></div>`,'c-win');
 $('#cskip').onclick=end;$('#cgo').onclick=end;
 const Z=async ms=>{await sleep(ms);if(skip)throw 0};
 (async()=>{try{
  snd('boom');vig('rgba(255,255,255,.9)');
  for(let i=0;i<18;i++){const f=document.createElement('i');f.className='frag';c.querySelector('.stage').appendChild(f);const a=Math.random()*6.28,d=140+Math.random()*180;f.animate([{transform:'translate(0,0) rotate(0)',opacity:1},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d+60}px) rotate(${Math.random()*540}deg)`,opacity:0}],{duration:1100,easing:'ease-out'}).onfinish=()=>f.remove()}
  await Z(750);$('#cb').innerHTML=bossBot('dead k'+k,'--s:15px');$('#ct').textContent=['FIRST','SECOND','THIRD','FOURTH','FIFTH','FINAL'][k]+' GUARDIAN DEFEATED';snd('win');await Z(2600);
  c.classList.add('dark');snd('ominous');await Z(1400);
  for(const s of ['.sw1','.sw2','.sw3','.sw4','.sw5']){c.querySelector(s).classList.add('on');await Z(1000)}
  const R=SEC.length-1-k,L=$('#cl'),lines=k<SEC.length-1?[[nice(bi().name)+' is down.',1500],['But it was only the '+['first','second','third','fourth','fifth'][k]+'.',1700],[R+' more '+(R>1?'are':'is')+' awake...',1800]]:[['The last guardian is down.',1500],['The darkness is breaking...',1700],['The light is back.',1800]];
  for(const [t,ms] of lines){const p=document.createElement('p');p.textContent=t;L.appendChild(p);await Z(ms)}
  if(k<SEC.length-1)L.insertAdjacentHTML('beforeend','<small>the light grows a little brighter</small>');else{c.classList.remove('dark');c.classList.add('dawn')}
  setLight();$('#cgo').hidden=false}catch(e){}})()})}
function badgeScene(k){return new Promise(res=>{let b=[];try{b=JSON.parse(localStorage.getItem('tlp-badges')||'[]')}catch(e){}if(!b.includes(k)){b.push(k);try{localStorage.setItem('tlp-badges',JSON.stringify(b))}catch(e){}}
 const x=BAD[k];snd('b'+(k+1));cine(`<div class="stage"><div class="bwrap ${x.cls}"><i class="rays"></i><i class="ring"></i><i class="ring r2"></i><div class="bico">${x.ico}</div></div><h2 class="ctitle">Badge earned!</h2><p class="csub"><b>${x.t}</b><br>${nice(bi().name)} defeated</p><button class="btn" id="cgo">Awesome!</button></div>`,'c-badge');
 $('#cgo').onclick=()=>{uncine();res()};for(let i=0;i<24;i++)setTimeout(()=>puff(innerWidth/2+(Math.random()-.5)*160,innerHeight/2-60+(Math.random()-.5)*120,2),i*60)})}
const ACH=[
 {t:'Boot Sequence',ico:'⚡',need:100,an:'x1'},{t:'Warming Up',ico:'🔥',need:300,an:'x2'},{t:'Bit by Bit',ico:'🧩',need:600,an:'x3'},{t:'Circuit Runner',ico:'🏃',need:1000,an:'x4'},{t:'Logic Spark',ico:'💡',need:1500,an:'x5'},{t:'Code Weaver',ico:'🧵',need:2500,an:'x6'},{t:'Debugger',ico:'🐞',need:4000,an:'x7'},{t:'Protocol Hacker',ico:'🕶️',need:6000,an:'x8'},{t:'System Architect',ico:'🏛️',need:9000,an:'x9'},
 {t:'Perfectionist',ico:'🌟',d:'Get 3 stars on 10 missions',f:()=>Object.values(S.prog).filter(v=>v>=3).length>=10,an:'x10'},
 {t:'Chapter Closer',ico:'📘',d:'Finish 5 chapters',f:()=>ORDER.filter(c=>CH[c].L.every((_,l)=>S.prog[key(c,l)])).length>=5,an:'x11'},
 {t:'Guardian Hunter',ico:'🎯',d:'Defeat 2 guardians',f:()=>SEC.filter(s=>done(s.boss)).length>=2,an:'x12'}];
ACH.forEach(a=>{if(a.need){a.d='Reach '+a.need+' score';a.f=()=>score()>=a.need;a.req='Requires '+a.need+' score'}else a.req='Requires: '+a.d});
const ach=()=>{try{return JSON.parse(localStorage.getItem('tlp-ach')||'[]')}catch(e){return[]}},badges=()=>{try{return JSON.parse(localStorage.getItem('tlp-badges')||'[]')}catch(e){return[]}};
let achQ=[],achBusy=false;
function checkAch(silent){const have=ach(),got=ACH.filter(a=>!have.includes(a.t)&&a.f());if(!got.length)return;try{localStorage.setItem('tlp-ach',JSON.stringify(have.concat(got.map(a=>a.t))))}catch(e){}if(!silent){got.forEach(a=>achQ.push(a));runQ()}}
function runQ(){if(achBusy||!achQ.length)return;achBusy=true;popAch(achQ.shift());setTimeout(()=>{achBusy=false;runQ()},4300)}
function popAch(a){snd('ach');const e=document.createElement('div');e.className='achp';e.innerHTML=`<div class="aico ${a.an}">${a.ico}</div><div><small>Achievement unlocked</small><b>${a.t}</b><span>${a.d}</span></div>`;$('#achs').appendChild(e);setTimeout(()=>e.classList.add('out'),3700);setTimeout(()=>e.remove(),4300)}
function openLib(tab){tab=tab||'ach';const have=ach(),bg=badges();
 const cards=tab==='ach'?ACH.map(a=>{const u=have.includes(a.t);return `<div class="lc ${u?'':'lk'}"><div class="aico ${u?a.an:''}">${u?a.ico:'🔒'}</div><b>${u?a.t:'Locked'}</b><span>${u?a.d:a.req}</span></div>`}).join(''):BAD.map((b,i)=>{const u=bg.includes(i),nm=BOSSES[SEC[i].boss].name;return `<div class="lc big ${u?'':'lk'}"><div class="bwrap mini ${u?b.cls:''}"><div class="bico">${u?b.ico:'🔒'}</div></div><b>${u?b.t:'Locked'}</b><span>${u?'Earned by defeating '+nm:'Requires: defeat '+nm}</span></div>`}).join('');
 let l=$('#lib');if(!l){l=document.createElement('div');l.id='lib';document.body.appendChild(l)}
 l.innerHTML=`<div class="lpan"><div class="lh"><h2>Library</h2><button class="btn ghost sm" id="lx">Close</button></div><div class="ltabs"><button class="${tab==='ach'?'on':''}" data-t="ach">Achievements ${have.length}/${ACH.length}</button><button class="${tab==='bd'?'on':''}" data-t="bd">Badges ${bg.length}/${BAD.length}</button></div><div class="lgrid">${cards}</div></div>`;
 l.querySelectorAll('.ltabs button').forEach(b=>b.onclick=()=>openLib(b.dataset.t));$('#lx').onclick=()=>l.remove();
 l.querySelectorAll('.lc:not(.lk)').forEach(c=>c.onclick=()=>{const i=c.querySelector('.aico,.bwrap'),cl=i&&[...i.classList].find(x=>/^(x\d+|bd\d)$/.test(x));if(cl){i.classList.remove(cl);void i.offsetWidth;i.classList.add(cl)}})}
$('#libb').onclick=()=>openLib();$('#sndg').onclick=toggleMute;$('#sndg').textContent=mute?'🔇':'🔊';
$('#run').addEventListener('click',()=>snd('tick'));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const l=$('#lib');if(l)l.remove()}});
checkAch(true);{const b=badges();SEC.forEach((s,i)=>{if(done(s.boss)&&!b.includes(i))b.push(i)});try{localStorage.setItem('tlp-badges',JSON.stringify(b))}catch(e){}}

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
const DIFFS={beg:{n:'Beginner',d:'New to coding. A friendly look, a tip on every mission, extra room for stars and 5 hearts in boss fights.'},int:{n:'Intermediate',d:'Some experience. The standard game: balanced hints, stars and 3 hearts in boss fights.'},pro:{n:'Professional',d:'Experienced. A terminal look, hidden cell numbers, a block limit, one hint per mission and only 2 hearts in boss fights.'}};
let DIFF='';try{DIFF=localStorage.getItem('tlp-diff')||''}catch(e){}
const DH=()=>DIFF==='beg'?5:DIFF==='pro'?2:3,PB=()=>DIFF==='beg'?2:0;
const TALLY_URL='';
function applyDiff(){document.body.classList.remove('d-beg','d-int','d-pro');if(DIFF)document.body.classList.add('d-'+DIFF);try{cvUpdate()}catch(e){}try{bfxUpdate()}catch(e){}}
const players=()=>{try{return JSON.parse(localStorage.getItem('tlp-players')||'{}')}catch(e){return{}}};
let lastReg=null,remoteT=null;
function regPlayer(){if(!DIFF)return;const P=players();if(lastReg&&lastReg!==S.name)delete P[lastReg];P[S.name]=DIFF;lastReg=S.name;try{localStorage.setItem('tlp-players',JSON.stringify(P))}catch(e){}renderTally();
 if(TALLY_URL)fetch(TALLY_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({id:pid(),name:S.name,diff:DIFF})}).then(r=>r.json()).then(t=>{if(t&&typeof t.beg==='number'){remoteT=t;renderTally()}}).catch(()=>{})}
const pid=()=>{let p='';try{p=localStorage.getItem('tlp-pid')||'';if(!p){p=Math.random().toString(36).slice(2)+Date.now().toString(36);localStorage.setItem('tlp-pid',p)}}catch(e){}return p||'anon'};
function loadRemote(){if(TALLY_URL)fetch(TALLY_URL).then(r=>r.json()).then(t=>{if(t&&typeof t.beg==='number'){remoteT=t;renderTally()}}).catch(()=>{})}
function renderTally(){const el=$('#tally');if(!el)return;const c=remoteT||Object.values(players()).reduce((a,v)=>(a[v]=(a[v]||0)+1,a),{beg:0,int:0,pro:0});
 el.innerHTML=`Players so far: <b>${c.beg||0}</b> beginner${c.beg===1?'':'s'} · <b>${c.int||0}</b> intermediate · <b>${c.pro||0}</b> professional${c.pro===1?'':'s'}`}
function pickCards(){return Object.entries(DIFFS).map(([k,v])=>`<button class="dp ${DIFF===k?'on':''}" data-d="${k}"><b>${v.n}</b><span>${v.d}</span></button>`).join('')}
function renderPick(){const el=$('#pick');if(!el)return;el.innerHTML=`<div class="lab">Your level</div><div class="dps">${pickCards()}</div>`;el.querySelectorAll('.dp').forEach(b=>b.onclick=()=>{setDiff(b.dataset.d);snd('chime')})}
function pickModal(){cine(`<div class="stage"><h2 class="ctitle">Choose your level</h2><p class="csub">The missions are the same, but the look, the help and the rules change. You can switch any time from the menu.</p><div class="dps">${pickCards()}</div></div>`,'c-intro');
 document.querySelectorAll('#cine .dp').forEach(b=>b.onclick=()=>{setDiff(b.dataset.d);snd('win');uncine()})}
$('#name').addEventListener('change',regPlayer);
const KB={
 prog:{kw:['program','instruction','algorithm','code','coding'],t:['A program is a list of instructions that the computer follows in order, one at a time.','Order matters. Reading a box before you fill it gives an empty result.','Look at the mission. Which instruction must come first, and why?']},
 var:{kw:['variable','box','memory box','store','set block','change block'],t:['A variable is a labelled box that remembers a value.','SET puts a value in. CHANGE adds to the value already inside, and a negative number takes away.','Which box does your mission use? What should be inside it before you read it?']},
 const:{kw:['constant','lock','locked','never change'],t:['A constant is a box that is set once and can never change. The lock icon marks it.','You may read a constant as often as you like. Trying to change it causes an error.','Which boxes in your mission are locked? Which blocks only read them?']},
 if:{kw:['if','else','condition','and or','logic','decision','compare','boolean'],t:['An if block asks a yes or no question. Yes runs the blocks under then. No runs the else blocks.','AND needs both conditions true. OR needs at least one. Use the + condition menu to add a second condition.','Say your rule out loud in plain words. Which parts are joined by AND, and which by OR?']},
 arr:{kw:['array','list','item','index'],t:['An array is a list stored in one box. Items are numbered from 1.','The pick block reads one item by its number. A counter box can supply that number inside a loop.','How many items are there? What should the counter do each lap?']},
 loop:{kw:['loop','repeat','while','again','lap','iterate'],t:['A loop runs blocks again and again so you write the step once. Repeat uses a fixed count. While uses a condition.','A while loop needs something inside that changes its condition, or it never stops.','What do you want to happen every lap? What changes from lap to lap?']},
 fn:{kw:['function','define','call','recipe','reuse'],t:['A function is a named group of blocks. Defining it stores it. Calling it runs it.','Define first, then call. A function can read the boxes around it.','What small job do you repeat? What name would you give it?']},
 rec:{kw:['recursion','recursive','itself','base case'],t:['Recursion means a function calls itself. Each call solves a smaller piece.','Every recursive function needs a base case, a rule that tells it to stop.','What is the smallest case where nothing more is needed? What shrinks each call?']},
 scope:{kw:['scope','local','global'],t:['Scope is where a variable lives. Changes made inside a function stay inside it.','The box outside is global. A function works on its own copy.','After the function ends, what does the outside box still hold?']},
 str:{kw:['string','text','join','glue','word '],t:['A string is text. Joining glues two strings end to end.','Join stores its result in a box, so you can join the result again.','Which pieces do you need? In what order should they be glued?']},
 type:{kw:['type','number or word','data type','strict'],t:['Every value has a type, such as a number or a word. Moving needs a number.','The wrong type causes an error. Check what a box holds before you use it.','Which of your boxes hold numbers, and which hold words?']},
 cast:{kw:['cast','convert','turn into'],t:['Type casting converts a value from one type to another, like a word into a number.','The word 3 looks like a number but is still text until you convert it.','Which box is text but needs to act like a number?']},
 op:{kw:['operator','calculate','maths','math','remainder','multiply','divide','plus','minus'],t:['Operators calculate new values: plus, minus, times, divide and remainder.','The calculate block reads one box, applies the operator with a number, and stores the result in a box.','What do you start with, and what do you need to end with? Which operator connects them?']},
 cmt:{kw:['comment','note'],t:['A comment is a note for humans. The computer ignores it.','Good comments explain why, not only what.','If a stranger read your blocks, which part would confuse them?']},
 io:{kw:['input','output','ask','say block','player types'],t:['Input is information that comes into a program. Output is what the program says or shows.','Your script must work for every input, not just one. Watch the test numbers.','What does the player type, and what should happen with it?']},
 bit:{kw:['bit','byte','binary'],t:['A bit is an on/off switch with a value: 1, 2, 4, 8 and so on. 8 bits make a byte.','Add the values of the switches that are on. Binary writes a number using only 0 and 1.','Which switch values add up to your target number?']},
 boss:{kw:['boss','guardian','heart','remember','glitch','hoarder','cipher','echo'],t:['A guardian remembers every attack that lands. Repeating it costs you a heart.','Each round asks for a different idea. Read the round rule on the left.','Compare your idea to the memory list at the top. What have you not tried yet?']},
 game:{kw:['star','score','hint','level','badge','achievement','library','robot','track','cell'],t:['Stars come from using few blocks. Hints appear in order and never give the full solution.','Achievements unlock with score. Badges come from defeating guardians.','What are you trying to find out? Tell me and I can point you in the right direction.']}};
const CT={'Programming':'prog','Variables':'var','Constants':'const','Loops':'loop','If Statements':'if','Data Types':'type','Type Casting':'cast','Strings':'str','Operators':'op','Arrays':'arr','Input and Output':'io','Comments':'cmt','Functions':'fn','Scope':'scope','Recursion':'rec','Bits and Binary':'bit'};
const BOLT={asked:[],tier:{},last:null,voice:false,open:false};
const norm=s=>s.toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim(),rpick=a=>a[Math.random()*a.length|0];
const sim=(a,b)=>{const A=new Set(a.split(' ')),B2=new Set(b.split(' '));let i=0;A.forEach(x=>{if(B2.has(x))i++});return i/Math.max(A.size,B2.size,1)};
function curTopic(){try{const c=CH[S.ci];return c&&!$('#game').hidden?CT[c.t]||(c.L[0].boss?'boss':null):null}catch(e){return null}}
const stem=w=>w.replace(/s$/,'');
function detect(n){const T=' '+n.split(' ').map(stem).join(' ')+' ';let best=null,sc=0;for(const [id,k] of Object.entries(KB)){let s=0;k.kw.forEach(w=>{const p=w.trim().split(' ').map(stem).join(' ');if(T.includes(' '+p+' ')||(p.length>=6&&T.includes(p)))s+=p.length>3?2:1});if(s>sc){sc=s;best=id}}return sc?best:null}
function boltReply(q){const n=norm(q);if(!n)return['BEEP. EMPTY TRANSMISSION. SEND A QUERY.','warn'];
 if(BOLT.asked.some(a=>sim(a,n)>=.8))return[rpick(['DUPLICATE QUERY DETECTED. I WILL NOT REPEAT MYSELF. ASK ME TO EXPLAIN A DIFFERENT PART, OR TEST YOUR IDEA IN THE PUZZLE AND TELL ME WHAT HAPPENED.','QUERY ALREADY PROCESSED. REPEATING IT WILL NOT HELP, HUMAN. TRY SOMETHING NEW.']),'bad'];
 BOLT.asked.push(n);
 if(/^(hi|hello|hey|yo|greetings|good (morning|evening|afternoon))\b/.test(n))return['GREETINGS, HUMAN. I AM BOLT-9, A CLUE UNIT. I EXPLAIN PROGRAMMING IDEAS. I NEVER GIVE ANSWERS. ASK ME ABOUT A CONCEPT.','ok'];
 if(/\b(thanks|thank you|thx)\b/.test(n))return['YOU ARE WELCOME. GRATITUDE LOGGED. NOW GO SOLVE SOMETHING.','ok'];
 if(/\b(who are you|what are you|your name)\b/.test(n))return['I AM BOLT-9, A HINT UNIT BUILT TO EXPLAIN IDEAS, NEVER TO SOLVE THEM. MY MEMORY CONTAINS ONLY THIS GAME.','ok'];
 const direct=/(the answer|solution|solve (it|this)|give me the (code|answer)|tell me the (code|answer)|which blocks|what blocks|what (should|do) i (put|use|drag|do)|just tell|do it for me|show me how to (win|finish|pass)|cheat|complete (it|this) for me)/.test(n);
 let id=detect(n);const follow=/(explain|more|further|why|how come|dont understand|confus|example|elaborate|deeper|stuck|help)/.test(n);
 if(!id&&(follow||direct))id=BOLT.last||curTopic();
 if(direct){const t=id||curTopic();return['REQUEST DENIED. I DO NOT GIVE ANSWERS DIRECTLY. '+(t?'THE IDEA YOU NEED IS: '+KB[t].t[0].toUpperCase()+' THINK ABOUT IT, THEN ASK ME TO EXPLAIN FURTHER.':'TELL ME WHICH IDEA YOU ARE STUCK ON AND I WILL EXPLAIN IT.'),'bad']}
 if(!id)return[rpick(['ERROR: TOPIC NOT FOUND. I AM NOT BUILT TO ANSWER THAT. I ONLY DISCUSS PROGRAMMING IDEAS FROM THIS GAME: VARIABLES, LOOPS, LOGIC, FUNCTIONS AND MORE.','OUT OF RANGE. MY MEMORY CONTAINS ONLY THE TOPICS OF THIS GAME. I CANNOT HELP WITH THAT.']),'bad'];
 BOLT.last=id;const t=Math.min((BOLT.tier[id]??-1)+1,3);BOLT.tier[id]=t;
 if(t>2)return['I HAVE NO DEEPER EXPLANATION FOR THIS TOPIC. THE NEXT STEP IS YOURS: TRY IT IN THE PUZZLE AND TELL ME WHAT HAPPENED.','warn'];
 return[(t===0?'QUERY ACCEPTED. ':t===1?'EXPANDING EXPLANATION. ':'FINAL CLUE. ')+KB[id].t[t],'ok']}
let bT=0;
function blip(){if(mute||!AC)return;try{const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime;o.type='square';o.frequency.value=380+Math.random()*180;g.gain.setValueAtTime(.018,t);g.gain.exponentialRampToValueAtTime(.001,t+.03);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+.03)}catch(e){}}
function boltSay(txt,mood){const log=$('#blog'),m=document.createElement('div');m.className='bm2 rb '+(mood||'');log.appendChild(m);const face=$('#bpan .bface');if(face){face.dataset.m=mood||'ok';clearTimeout(bT);bT=setTimeout(()=>face.dataset.m='',2200)}
 if(mood==='bad')snd('err');let i=0;const iv=setInterval(()=>{m.textContent='▮ '+txt.slice(0,++i);if(i%3===0)blip();log.scrollTop=log.scrollHeight;if(i>=txt.length){clearInterval(iv);if(BOLT.voice&&window.speechSynthesis){try{const u=new SpeechSynthesisUtterance(txt.toLowerCase());u.pitch=.1;u.rate=.85;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}}}},mood==='bad'?14:20)}
function boltSend(){const inp=$('#bq'),q=inp.value.trim();if(!q)return;inp.value='';const log=$('#blog'),u=document.createElement('div');u.className='bm2 me';u.textContent=q;log.appendChild(u);log.scrollTop=log.scrollHeight;
 const th=document.createElement('div');th.className='bm2 rb think';th.textContent='▮ PROCESSING...';log.appendChild(th);log.scrollTop=log.scrollHeight;
 setTimeout(()=>{th.remove();const [t,m]=boltReply(q);boltSay(t,m)},550+Math.random()*350)}
function boltUI(){const w=document.createElement('div');w.id='bolt';w.innerHTML=`<button id="bfab" aria-label="Open BOLT-9 hint robot"><span class="bface" data-m=""><i class="ant"></i><i class="eye"></i><i class="eye"></i></span><span class="bping"></span></button><div id="bpan" hidden><div class="bhd"><span class="bface" data-m=""><i class="ant"></i><i class="eye"></i><i class="eye"></i></span><div><b>BOLT-9</b><small id="bst">HINT UNIT · ONLINE</small></div><button id="bvoice" title="Robot voice on/off">🔈</button><button id="bx" aria-label="Close">✕</button></div><div id="blog"></div><div class="bin"><input id="bq" placeholder="TRANSMIT QUERY..." maxlength="140" autocomplete="off"><button id="bsend">SEND</button></div><div class="bnote">Clues only. I never give answers.</div></div>`;document.body.appendChild(w);
 $('#bfab').onclick=()=>{const p=$('#bpan');p.hidden=!p.hidden;$('#bfab').classList.toggle('on',!p.hidden);if(!p.hidden){snd('chime');if(!BOLT.open){BOLT.open=true;boltSay('BOOT SEQUENCE COMPLETE. I AM BOLT-9. I EXPLAIN IDEAS BUT I NEVER GIVE ANSWERS. ASK ME ABOUT A CONCEPT FROM THE GAME.','ok')}$('#bq').focus()}};
 $('#bx').onclick=()=>{$('#bpan').hidden=true;$('#bfab').classList.remove('on')};$('#bsend').onclick=boltSend;$('#bq').onkeydown=e=>{if(e.key==='Enter')boltSend()};
 $('#bvoice').onclick=()=>{BOLT.voice=!BOLT.voice;$('#bvoice').textContent=BOLT.voice?'🔊':'🔈';if(!BOLT.voice&&window.speechSynthesis)speechSynthesis.cancel()}}
boltUI();applyDiff();renderTally();loadRemote();
{const P=players();if(P[S.name])lastReg=S.name}
if(!DIFF)setTimeout(pickModal,300);

const BK=(t,p,c,e)=>Object.assign(mk(t),p||{},{c:c||[],e:e||[]});
BAD.push({t:'Vault Breaker',ico:'🔐',cls:'bd5'},{t:'Origin Slayer',ico:'👑',cls:'bd6'});
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
const _snd=snd;snd=function(k){if(k!=='b5'&&k!=='b6')return _snd(k);if(mute)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const t=AC.currentTime,T=(f,d,w,v,s)=>{const o=AC.createOscillator(),g=AC.createGain();o.type=w;o.frequency.setValueAtTime(f,t+s);g.gain.setValueAtTime(v,t+s);g.gain.exponentialRampToValueAtTime(.001,t+s+d);o.connect(g);g.connect(AC.destination);o.start(t+s);o.stop(t+s+d)};
 if(k==='b5')[262,330,392,523,659,784,1047].forEach((f,i)=>T(f,.18,'square',.07,i*.07));else{[196,247,294,392].forEach(f=>T(f,2,'sawtooth',.05,0));[523,659,784,1047,1319,1568].forEach((f,i)=>T(f,.7,'triangle',.08,.4+i*.12))}}catch(e){}};
const _render=render;render=function(){_render.apply(this,arguments);cvUpdate()};
function cvUpdate(){let el=$('#cv');if(DIFF!=='pro'){if(el)el.hidden=true;return}if(!el){const w=$('#area')&&$('#area').closest('.card');if(!w)return;el=document.createElement('pre');el.id='cv';el.className='cv';w.appendChild(el)}el.hidden=false;el.textContent='// your program\n'+(S.script.length?S.script.map(tx).join('\n'):'(empty)')}
function cheer(){const r=bot.getBoundingClientRect();for(let i=0;i<4;i++)setTimeout(()=>puff(r.left+r.width/2,r.top,10),i*180)}

function setDiff(d){if(d===DIFF)return;try{save()}catch(e){}DIFF=d;__D=d;try{localStorage.setItem('tlp-diff',d)}catch(e){}migrate(d);try{S.prog=JSON.parse(localStorage.getItem('tlp-prog')||'{}')}catch(e){S.prog={}}applyDiff();regPlayer();checkAch(true);{const b=badges();SEC.forEach((s,i)=>{if(done(s.boss)&&!b.includes(i))b.push(i)});try{localStorage.setItem('tlp-badges',JSON.stringify(b))}catch(e){}}renderPick();menu()}
function coachInit(){const L0=$('#learn');if(!L0||L0.querySelector('.coach'))return;const h=lv().hints||[];let n=1;
 const box=document.createElement('div');box.className='coach';box.innerHTML='<div class="cface"><span class="bface" data-m="ok"><i class="ant"></i><i class="eye"></i><i class="eye"></i></span></div><div class="cbody"><b>Coach Bolt says:</b><ol class="csteps"></ol><button class="btn sm" id="cnext">Show me the next step</button></div>';L0.appendChild(box);
 const ol=box.querySelector('.csteps'),nx=box.querySelector('#cnext'),add=()=>{if(n>h.length)return;const li=document.createElement('li');li.textContent=h[n-1];ol.appendChild(li);n++;if(n>h.length)nx.hidden=true;snd('tick')};
 const intro=document.createElement('li');intro.innerHTML='Read the mission above. Then drag the <b>glowing</b> blocks into your script and press Run.';ol.appendChild(intro);add();nx.onclick=add;
 const txt=h.join(' ').toLowerCase();document.querySelectorAll('#pal .blk').forEach(p=>{const t=[...p.classList].find(c=>NAMES[c]);if(t&&txt.includes(NAMES[t].split(' ')[0].toLowerCase()))p.classList.add('glow')})}
puff=function(x,y,n){if(still)return;for(let i=0;i<(n||6);i++){const s=document.createElement('span');s.className='spark';const a=Math.random()*6.28,d=14+Math.random()*(DIFF==='beg'?44:26);
 if(DIFF==='beg'){s.textContent=['⭐','✨','💜','💙','🌟'][i%5];s.style.cssText=`left:${x}px;top:${y}px;font-size:${12+Math.random()*10}px;background:none;width:auto;height:auto`}else s.style.cssText=`left:${x}px;top:${y}px;width:5px;height:5px;background:${i%2?'var(--a)':'var(--b)'}`;
 document.body.appendChild(s);s.animate([{transform:'translate(0,0)',opacity:.95},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d}px) rotate(${Math.random()*200}deg)`,opacity:0}],{duration:DIFF==='beg'?820:520,easing:'ease-out'}).onfinish=()=>s.remove()}};
cheer=function(){const r=bot.getBoundingClientRect();for(let i=0;i<7;i++)setTimeout(()=>puff(r.left+r.width/2,r.top,14),i*150)};
function bfxUpdate(){let e=$('#bfx');if(DIFF!=='beg'){if(e)e.remove();return}if(e)return;e=document.createElement('div');e.id='bfx';e.setAttribute('aria-hidden','true');const em=['⭐','✨','🌈','💫','🎈','💜','🌟'];for(let i=0;i<16;i++){const s=document.createElement('i');s.textContent=em[i%em.length];s.style.cssText=`left:${(i*6.3+Math.random()*4)%100}%;font-size:${14+Math.random()*18}px;animation-duration:${14+Math.random()*14}s;animation-delay:${-Math.random()*20}s`;e.appendChild(s)}document.body.appendChild(e)}
let pgT=0;function proGlitch(){if(DIFF==='pro'&&!still&&!document.hidden&&!$('#game').hidden){document.body.classList.add('glitchy');setTimeout(()=>document.body.classList.remove('glitchy'),380)}pgT=setTimeout(proGlitch,22000+Math.random()*26000)}
pgT=setTimeout(proGlitch,15000);
bfxUpdate();

menu();
</script>
</body>
</html>