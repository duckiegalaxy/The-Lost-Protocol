/* =============================================================================
   HOME PAGE SCRIPT  (js/script.js)
   -----------------------------------------------------------------------------
   Powers index.html only: the intro sequence, the animated background, the mood
   swatches, the hash router for the About view, the home tally and the feedback
   modal. The game itself lives in webgame.html and js/pages/webgame.js.
   
   If you add markup to index.html, add its behaviour here rather than inline.
   Areas in this file:
     - mood state and the install button
     - intro sequence and title effects
     - the rain canvas and reduced-effects handling
     - the hash router (home / about me)
     - the home tally
     - the feedback modal and its offline queue
   ============================================================================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const still = matchMedia('(prefers-reduced-motion:reduce)').matches;
const MOODS = [["Ocean", 200], ["Dusk", 265], ["Rose", 340], ["Amber", 32], ["Moss", 145]];
let hue = 200;
let auto = true;
let saved = null;

try {
    saved = localStorage.getItem('tlp-mood');
} catch (e) {
}

if (saved && saved !== 'auto') {
    auto = false;
    hue = +saved;
}

const setHue = h => {
    hue = h;
    root.style.setProperty('--h', h.toFixed(1));
};

$('#themes').insertAdjacentHTML('beforeend', MOODS.map(([n, h]) => `<button class="sw" data-v="${h}" title="${n}" aria-label="${n}" style="background:hsl(${h} 75% 58%)"></button>`).join('') + '<button class="sw auto" data-v="auto" title="Drift between moods" aria-label="Drift between moods"></button>');

function mark() {
    $$('.sw').forEach(s => s.classList.toggle('on', auto ? s.dataset.v === 'auto' : s.dataset.v == String(hue)));
}

let tw;
let tweening = false;

function goHue(t) {
    cancelAnimationFrame(tw);
    tweening = true;
    const s0 = hue;
    const d = ((t - s0 + 540) % 360) - 180;
    const t0 = performance.now();
    (function f(n) {
        const k = Math.min(1, (n - t0) / 700);
        const e = 1 - Math.pow(1 - k, 3);
        setHue((s0 + d * e + 360) % 360);
        if (k < 1) {
            tw = requestAnimationFrame(f);
        } else {
            tweening = false;
        }
    })(t0);
}

$$('.sw').forEach(s => s.onclick = () => {
    const v = s.dataset.v;
    auto = v === 'auto';
    goHue(auto ? (hue + 90 + Math.random() * 120) % 360 : +v);
    try {
        localStorage.setItem('tlp-mood', v);
    } catch (e) {
    }
    mark();
});

setHue(hue);
mark();

setInterval(() => {
    if (auto && !still && !tweening) {
        setHue((hue + .6) % 360);
    }
}, 50);

const cv = $('#rain');
const cx = cv.getContext('2d');
const GL = '01{}[]<>/=+;()#$%&LOGIC';
const fs = 16;
let cols = [];
let mx = -999;
let bgt = 0;
let bgm = [8, 12, 16];

/* -----------------------------------------------------------------------------
   Background canvas
   The rain loop is the only per-frame work on this page. It stops when the tab
   is hidden or when reduced effects are on, so it never burns battery in the
   background.
   -------------------------------------------------------------------------- */
function fit() {
    cv.width = innerWidth;
    cv.height = innerHeight;
    cols = Array.from({ length: Math.ceil(cv.width / fs) }, () => Math.random() * cv.height / fs);
}

addEventListener('resize', fit);
addEventListener('pointermove', e => mx = e.clientX);
fit();

function rain() {
    if (document.hidden || document.body.classList.contains('calm')) {
        return;
    }
    const nw = performance.now();
    if (nw - bgt > 400) {
        bgt = nw;
        bgm = getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g) || [8, 12, 16];
    }
    const m = bgm;
    const light = (+m[0] + +m[1] + +m[2]) > 400;
    cx.fillStyle = `rgba(${m[0]},${m[1]},${m[2]},.13)`;
    cx.fillRect(0, 0, cv.width, cv.height);
    cx.font = fs + 'px monospace';
    cols.forEach((y, i) => {
        const x = i * fs;
        const near = Math.max(0, 1 - Math.abs(x - mx) / 160);
        cx.fillStyle = `hsl(${hue + (i % 9) * 7} 85% ${(light ? 36 : 60) + near * (light ? -12 : 18)}%)`;
        cx.fillText(GL[Math.random() * GL.length | 0], x, y * fs);
        cols[i] = y * fs > cv.height && Math.random() > .975 ? 0 : y + .45 + near * .5;
    });
}

let rl = 0;

function loop(t) {
    if (t - rl > 50) {
        rl = t;
        rain();
    }
    requestAnimationFrame(loop);
}

if (!still) {
    requestAnimationFrame(loop);
}

let lastG = 0;
let lastB = 0;

function glyph(x, y, dx, dy, dur) {
    const g = document.createElement('span');
    g.className = 'glyph';
    g.textContent = GL[Math.random() * GL.length | 0];
    g.style.cssText = `left:${x}px;top:${y}px`;
    document.body.appendChild(g);
    g.animate([{ transform: 'translate(0,0) scale(1)', opacity: .95 }, { transform: `translate(${dx}px,${dy}px) scale(.4) rotate(${dx}deg)`, opacity: 0 }], { duration: dur, easing: 'ease-out' }).onfinish = () => g.remove();
}

addEventListener('pointermove', e => {
    if (still || document.body.classList.contains('calm')) {
        return;
    }
    root.style.setProperty('--px', (e.clientX / innerWidth * 2 - 1).toFixed(3));
    root.style.setProperty('--py', (e.clientY / innerHeight * 2 - 1).toFixed(3));
    const n = performance.now();
    if (n - lastG > 45 && e.pointerType === 'mouse') {
        lastG = n;
        glyph(e.clientX + 8, e.clientY + 8, (Math.random() - .5) * 30, 28 + Math.random() * 30, 800);
    }
    if (n - lastB > 30) {
        lastB = n;
        $$('.btn').forEach(b => {
            const r = b.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            if (Math.abs(dx) < r.width / 2 + 90 && Math.abs(dy) < r.height / 2 + 90) {
                b.style.setProperty('--bx', dx * .18 + 'px');
                b.style.setProperty('--by', dy * .3 + 'px');
            } else {
                b.style.setProperty('--bx', '0px');
                b.style.setProperty('--by', '0px');
            }
        });
    }
});

addEventListener('pointerdown', e => {
    if (still || document.body.classList.contains('calm') || e.target.closest('.btn,.sw')) {
        return;
    }
    for (let i = 0; i < 9; i++) {
        const a = i / 9 * 6.28 + Math.random() * .5;
        const d = 50 + Math.random() * 60;
        glyph(e.clientX, e.clientY, Math.cos(a) * d, Math.sin(a) * d, 700);
    }
});

addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    $('#prog').style.width = (h > 0 ? scrollY / h * 100 : 0) + '%';
}, { passive: true });

function split(el) {
    el.setAttribute('aria-label', el.textContent);
    const walk = n => [...n.childNodes].forEach(c => {
        if (c.nodeType === 3) {
            const f = document.createDocumentFragment();
            c.textContent.split(' ').forEach((w, i, a) => {
                if (w) {
                    const ws = document.createElement('span');
                    ws.className = 'w';
                    ws.setAttribute('aria-hidden', 'true');
                    [...w].forEach(ch => {
                        const l = document.createElement('span');
                        l.className = 'lt';
                        l.textContent = ch;
                        ws.append(l);
                    });
                    f.append(ws);
                }
                if (i < a.length - 1) {
                    f.append(' ');
                }
            });
            c.replaceWith(f);
        } else {
            walk(c);
        }
    });
    walk(el);
}

const rio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) {
        e.target.classList.add('in');
        rio.unobserve(e.target);
        setTimeout(() => e.target.style.transitionDelay = '', 1400);
    }
}), { threshold: .15 });

function reveals(c) {
    $$('.facts,.label', c).forEach((el, i) => {
        el.classList.add('rv');
        el.style.transitionDelay = (i % 4) * .1 + 's';
        rio.observe(el);
    });
}

split($('.hero h1'));
reveals($('#home'));

const ttl = $('#ttl');

"The Lost Protocol".split('').forEach((c, i) => {
    const s = document.createElement('span');
    s.textContent = c === ' ' ? '\u00a0' : c;
    s.style.animationDelay = (.2 + i * .05) + 's';
    s.style.animationPlayState = 'paused';
    ttl.appendChild(s);
});

let t1 = setTimeout(() => {
    $('#intro').classList.add('two');
    $$('#ttl span').forEach(s => s.style.animationPlayState = 'running');
}, 5300);

function leave() {
    clearTimeout(t1);
    try {
        localStorage.setItem('tlp-seen', '1');
    } catch (e) {
    }
    $('#intro').classList.add('out');
    setTimeout(() => $('#intro').remove(), 1000);
}

$('#enter').onclick = leave;
$('#skip').onclick = leave;

try {
    if (localStorage.getItem('tlp-seen')) {
        clearTimeout(t1);
        $('#intro').remove();
    }
} catch (e) {
}

$('#replay').onclick = e => {
    e.preventDefault();
    try {
        localStorage.removeItem('tlp-seen');
    } catch (x) {
    }
    location.reload();
};

// "Reduce visual effects" toggle: saved setting and the shared logic live in tlp-common.js
function fxSet() {
    if (window.TLP) { TLP.FX.apply(); }
}

$('#fx').onclick = () => {
    if (window.TLP) { TLP.FX.set(!TLP.FX.get()); }
};

fxSet();

/* "install app": Chromium browsers fire beforeinstallprompt once the site is
   installable. The event is kept so the header button can offer it, and the
   button never appears when the game already runs as an installed app.
   iPhone and iPad have no install prompt, so there the button explains the
   manual Share > Add to Home Screen step instead. iPadOS reports a desktop
   user agent, so touch support is part of that check. */
const installBtn = $('#install');
const installTip = $('#installTip');
const alreadyInstalled = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const iosDevice = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let installEvent = null;
let installTipTimer = 0;

function showInstallTip() {
    installTip.hidden = false;
    clearTimeout(installTipTimer);
    installTipTimer = setTimeout(() => {
        installTip.hidden = true;
    }, 6000);
}

if (installBtn && !alreadyInstalled) {
    if (iosDevice) {
        installBtn.hidden = false;
        installBtn.addEventListener('click', showInstallTip);
        installTip.addEventListener('click', () => {
            installTip.hidden = true;
        });
    } else {
        addEventListener('beforeinstallprompt', e => {
            e.preventDefault();
            installEvent = e;
            installBtn.hidden = false;
        });
        installBtn.addEventListener('click', async () => {
            if (!installEvent) {
                return;
            }
            installEvent.prompt();
            await installEvent.userChoice;
            installEvent = null;
            installBtn.hidden = true;
        });
        addEventListener('appinstalled', () => {
            installEvent = null;
            installBtn.hidden = true;
        });
    }
}
const ME={photo:"assets/Screenshot_20261013_112542.jpg",name:"Joumana Amir Eldeeb",lines:[
"I'm Joumana, a final-year student at the Faculty of Computer Studies. The Lost Protocol is my final-year project, supervised by Dr. Ramadan Babers.",
"I picked this idea because programming can feel abstract when you are just starting out. Loops, variables and logic are much easier to understand when you can watch a little robot do exactly what your code says.",
"I built The Lost Protocol as a web game so anyone can play it in a browser with nothing to install. It has five sections, twenty chapters and five guardians to defeat, plus optional Bonus sections: four Mastery missions and a sixth guardian.",
"If you are new to coding, I hope this makes it feel a lot less scary. Thanks for stopping by."]};
function meView(){
const el=$('#aboutme');
el.innerHTML=`<div class="wrap"><div class="me"><div><div class="frame"><i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i><label class="photo empty" id="ph" tabindex="0" aria-label="Add your picture"><img id="phimg" alt="Portrait of ${ME.name}" hidden><span id="phtxt">Click to add your picture<small>JPG or PNG</small></span><input id="phin" type="file" accept="image/*" hidden></label></div><span class="cap">${ME.name}</span></div><div class="me-text"><span class="kick">about me</span><h1>Hi, I'm <em>${ME.name.split(' ')[0]}</em></h1>${ME.lines.map(t=>`<p>${t}</p>`).join('')}<a class="btn" href="#/">← Back to the game</a></div></div></div>`;
const img=$('#phimg'),txt=$('#phtxt');
const show=src=>{img.onerror=()=>{img.hidden=true;txt.hidden=false;$('#ph').classList.add('empty')};img.src=src;img.hidden=false;txt.hidden=true;$('#ph').classList.remove('empty')};
let saved='';try{saved=localStorage.getItem('tlp-photo')||''}catch(e){}
if(ME.photo||saved)show(ME.photo||saved);
$('#ph').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('#phin').click()}});
$('#phin').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();
r.onload=()=>{const im=new Image();im.onload=()=>{const m=Math.min(1,900/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*m);c.height=Math.round(im.height*m);c.getContext('2d').drawImage(im,0,0,c.width,c.height);const d=c.toDataURL('image/jpeg',.85);show(d);try{localStorage.setItem('tlp-photo',d)}catch(x){}};im.src=r.result};
r.readAsDataURL(f)}}

/* -----------------------------------------------------------------------------
   Router
   Hash-only routing (#/about) because the site is plain files on a static
   host. Unknown hashes fall back to the home view.
   -------------------------------------------------------------------------- */
function route() {
    const ab = location.hash.replace('#/', '') === 'about';
    $('#home').hidden = ab;
    $('#aboutme').hidden = !ab;
    document.title = ab ? 'The Lost Protocol · About me' : 'The Lost Protocol';
    if (ab) {
        meView();
    }
    const abLink = $('#navAbout');
    if (abLink) {
        abLink.classList.toggle('on', ab);
    }
    scrollTo({ top: 0, behavior: 'auto' });
}

addEventListener('hashchange', route);
route();


function glitchTick() {
    if (!document.body.classList.contains('calm') && !still && !document.hidden) {
        $$('.glitch').forEach(g => {
            g.classList.add('on');
            setTimeout(() => g.classList.remove('on'), 380);
        });
        if (Math.random() < .35) {
            document.body.classList.add('zap');
            setTimeout(() => document.body.classList.remove('zap'), 240);
        }
    }
    setTimeout(glitchTick, 3500 + Math.random() * 5000);
}

setTimeout(glitchTick, 1800);

const TALLY_URL = 'https://script.google.com/macros/s/AKfycbwvRM3L2nG52o5t1Rfzu0qFn1zKEN3JZTFTVHHt9ehh3eyla89hO9wR2Wp_WpmEVs3t/exec';
let remoteT = null;

function renderTally() {
    const el = $('#tally');
    if (!el) return;
    let P = {};
    try {
        P = JSON.parse(localStorage.getItem('tlp-players') || '{}');
    } catch (e) {}
    const c = { beg: 0, int: 0, pro: 0 };
    Object.values(P).forEach(v => { if (c[v] !== undefined) c[v]++; });
    if (remoteT) Object.assign(c, remoteT);
    el.innerHTML = (c.beg + c.int + c.pro) ?
        `Players so far: <b>${c.beg}</b> beginner${c.beg === 1 ? '' : 's'} · <b>${c.int}</b> intermediate · <b>${c.pro}</b> professional${c.pro === 1 ? '' : 's'}` :
        'No players yet. Pick a level in the game and be the first.';
}

renderTally();

if (TALLY_URL) {
    fetch(TALLY_URL).then(r => r.json()).then(t => {
        if (t && typeof t.beg === 'number') {
            remoteT = t;
            renderTally();
        }
    }).catch(() => {});
}

const FB = { rating: 0, tags: [] };

/* -----------------------------------------------------------------------------
   Feedback modal
   Submits through TLP_AUTH when online and queues the entry in localStorage
   when it fails, so a reviewer never loses a comment on a flaky network.
   -------------------------------------------------------------------------- */
function openFb() {
    $('#fb').hidden = false;
    $('#fbform').hidden = false;
    $('#fbok').hidden = true;
    $('#fbnote').textContent = '';
    setTimeout(() => $('#fbmsg').focus(), 60);
}

function closeFb() {
    $('#fb').hidden = true;
}

function fbQueue() {
    try {
        return JSON.parse(localStorage.getItem('tlp-fb-queue') || '[]');
    } catch (e) {
        return [];
    }
}

function fbPost(p) {
    return fetch(TALLY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(p)
    }).then(r => r.text()).then(t => {
        let r;
        try {
            r = JSON.parse(t);
        } catch (e) {
            throw new Error('The link did not answer like the sheet script. Check that it ends with /exec and that access is set to Anyone.');
        }
        if (!r || r.error) throw new Error('The script replied "' + (r && r.error) + '". The deployed script may be an older version: choose Deploy, Manage deployments, edit, New version.');
        return r;
    });
}

function fbFlush() {
    if (!TALLY_URL) return;
    const q = fbQueue();
    if (!q.length) return;
    try {
        localStorage.setItem('tlp-fb-queue', '[]');
    } catch (e) {}
    q.forEach(p => fbPost(p).catch(() => {
        try {
            localStorage.setItem('tlp-fb-queue', JSON.stringify(fbQueue().concat([p])));
        } catch (e) {}
    }));
}

function fbSubmit(e) {
    e.preventDefault();
    if ($('#fbhp').value) return;
    const msg = $('#fbmsg').value.trim();
    if (!FB.rating && msg.length < 3) {
        $('#fbnote').textContent = 'Please pick a star rating or write a few words.';
        return;
    }
    let last = 0;
    try {
        last = +localStorage.getItem('tlp-fb-last') || 0;
    } catch (err) {}
    if (Date.now() - last < 20000) {
        $('#fbnote').textContent = 'You just sent one. Please wait a moment before sending another.';
        return;
    }
    let level = '';
    try {
        level = localStorage.getItem('tlp-diff') || '';
    } catch (err) {}
    const p = {
        type: 'feedback',
        rating: FB.rating,
        tags: FB.tags.join(', '),
        message: msg.slice(0, 800),
        name: $('#fbname').value.trim().slice(0, 40),
        ageGroup: ($('#fbage') ? $('#fbage').value : ''),
        level,
        page: 'home',
        time: new Date().toISOString()
    };
    const btn = $('#fbsend');
    btn.disabled = true;
    const done = text => {
        try {
            localStorage.setItem('tlp-fb-last', String(Date.now()));
        } catch (err) {}
        $('#fbokmsg').textContent = text;
        $('#fbform').hidden = true;
        $('#fbok').hidden = false;
        $('#fbf').reset();
        FB.rating = 0;
        FB.tags = [];
        $$('#fbstars button,#fbchips button').forEach(b => b.classList.remove('on'));
        btn.disabled = false;
    };
    if (!TALLY_URL) {
        try {
            localStorage.setItem('tlp-fb-queue', JSON.stringify(fbQueue().concat([p])));
        } catch (err) {}
        done('Saved on this device. It will be sent to the project sheet as soon as it is connected.');
        return;
    }
    fbPost(p).then(() => { if (window.TLP_AUTH && window.TLP_AUTH.saveFeedbackCopy) { window.TLP_AUTH.saveFeedbackCopy(p); } done('Your feedback was sent. Thank you for helping us improve.'); }).catch(err => {
        try {
            localStorage.setItem('tlp-fb-queue', JSON.stringify(fbQueue().concat([p])));
        } catch (e2) {}
        done('It was saved on this device and will be retried next time you open the site. Reason: ' + (err && err.message ? err.message : 'could not reach the link') + ' (if it says Failed to fetch, the link or its access setting is wrong).');
    });
}

$('#fbBtn').onclick = openFb;
$('#fbx').onclick = closeFb;
$('#fbBug').onclick = () => { closeFb(); if (window.TLP) { TLP.openBugReport('Home page'); } };
$('#fbdone').onclick = closeFb;
$('#fb').addEventListener('click', e => { if (e.target.id === 'fb') closeFb(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#fb').hidden) closeFb(); });
$('#fbf').addEventListener('submit', fbSubmit);
$('#fbstars').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    FB.rating = +b.dataset.v;
    $$('#fbstars button').forEach(s => s.classList.toggle('on', +s.dataset.v <= FB.rating));
});
$('#fbchips').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    b.classList.toggle('on');
    FB.tags = $$('#fbchips button.on').map(x => x.textContent);
});
fbFlush();

/* -----------------------------------------------------------------------------
   Today card
   The game menu already knows the streak and the daily goals, but a returning
   player lands here first. This card reads the same per-learner save keys and
   offers one next step. It never calls TLP_STREAK.check(), so opening the home
   page alone does not count as a day played.
   -------------------------------------------------------------------------- */
function dayStamp() {
    const d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}

function savedProgressItem(item) {
    try {
        if (!window.TLP_AUTH || !TLP_AUTH.getActiveSaveKey) return null;
        return localStorage.getItem(TLP_AUTH.getActiveSaveKey(item));
    } catch (e) {
        return null;
    }
}

async function renderToday() {
    const card = $('#today');
    if (!card) return;
    let user = null;
    let learner = null;
    try {
        if (window.TLP_AUTH) {
            await TLP_AUTH.init();
            user = TLP_AUTH.getCurrentUser();
            learner = TLP_AUTH.getActiveLearner();
        }
    } catch (e) {
    }
    // Parents and educators are heading for their own area, not the game.
    if (user && user.role === 'parent') {
        card.hidden = true;
        return;
    }

    const who = $('#tcWho');
    who.textContent = learner && !learner.isGuest && learner.name
        ? 'for ' + String(learner.name).trim().split(' ')[0]
        : '';

    const streak = window.TLP_STREAK
        ? TLP_STREAK.get()
        : { count: 0, last: '', next: null, left: 0 };
    const today = window.TLP_STREAK ? TLP_STREAK.today() : dayStamp();
    $('#tcStreak').textContent = String(streak.count || 0);
    if (!streak.count) {
        $('#tcStreakNote').textContent = 'Your streak starts with one mission.';
    } else if (streak.last !== today) {
        $('#tcStreakNote').textContent = 'day streak · play today to keep it';
    } else if (streak.next) {
        $('#tcStreakNote').textContent = 'day streak · ' + streak.left + ' day' + (streak.left === 1 ? '' : 's') + ' to ' + streak.next.name;
    } else {
        $('#tcStreakNote').textContent = 'day streak · every milestone earned';
    }

    let daily = null;
    try {
        daily = JSON.parse(savedProgressItem('daily') || 'null');
    } catch (e) {
    }
    if (daily && daily.date === dayStamp() && Array.isArray(daily.ids)) {
        const goals = daily.goals || {};
        const claimed = daily.claimed || [];
        const done = daily.ids.filter((id) => (daily.prog[id] || 0) >= (goals[id] || Infinity)).length;
        const ready = daily.ids.filter((id) => claimed.indexOf(id) < 0 && (daily.prog[id] || 0) >= (goals[id] || Infinity)).length;
        if (!done) {
            $('#tcDaily').textContent = '3';
            $('#tcDailyNote').textContent = 'daily goals today';
        } else {
            $('#tcDaily').textContent = done + '/3';
            $('#tcDailyNote').textContent = ready
                ? ready + ' reward' + (ready === 1 ? '' : 's') + ' ready to claim'
                : claimed.length >= 3 ? 'all daily goals complete' : 'daily goals done';
        }
    } else {
        $('#tcDaily').textContent = '3';
        $('#tcDailyNote').textContent = 'daily goals waiting today';
    }

    let started = false;
    try {
        const progress = JSON.parse(savedProgressItem('prog') || 'null');
        started = !!(progress && Object.keys(progress).length);
    } catch (e) {
    }
    $('#tcGoLabel').textContent = started ? 'Continue' : 'Start the first mission';
    card.hidden = false;
}

renderToday();