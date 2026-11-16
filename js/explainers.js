/* =============================================================================
   LESSON EXPLAINERS  (js/explainers.js)
   -----------------------------------------------------------------------------
   Small animated diagrams that sit at the top of a lesson card. Each scene is
   a few labelled parts revealed one step at a time; the narration reads the
   caption for the step that is on screen, so the voice and the picture always
   agree. Nothing here changes a mission, a score or a saved result.

   Public API (window.TLP_EXPLAIN):
     html(chapter)     figure markup for a chapter index, or '' if none
     mount(figure, ch) fill the figure with its scene and controls
     narrate(onend)    speak the scene steps from the current one
     stop()            stop speech and leave the picture where it is
     mounted()         the mounted state, or null
   ============================================================================= */
(function () {
  'use strict';

  const el = (cls, at, html) => '<span class="ex-el ' + cls + '" data-at="' + at + '">' + html + '</span>';
  const ln = (at, cls) => '<i class="ex-el ln ' + (cls || '') + '" data-at="' + at + '"></i>';
  const text = (s) => String(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  /* ---------------------------------------------------------------------------
     Scenes. One entry per idea, not per chapter: chapters that teach the same
     idea share a scene, so the diagrams stay consistent across age paths.
     ------------------------------------------------------------------------ */
  const SCENES = {
    box: {
      name: 'A variable',
      stage: '<div class="ex-row">' + el('nd bx', 0, '<b>score</b><i>7</i>') + ln(1) + el('chip', 1, '+ 3') + ln(1) + el('nd bx', 2, '<b>score</b><i>10</i>') + '</div>',
      steps: [
        'A variable is a labelled box. This one is called score.',
        'set puts a value inside. The box now remembers 7.',
        'change adds to it. 7 plus 3 makes 10, and the old value is gone.'
      ]
    },
    loop: {
      name: 'A loop',
      stage: '<div class="ex-stack">' + el('frame', 0, el('nd bx', 0, '<b>move 1</b>')) + el('chip', 1, 'run again') + el('chip', 2, 'lap 1 · 2 · 3') + '</div>',
      steps: [
        'A loop writes a step once.',
        'The arrow sends the computer back to the top of the loop.',
        'Three laps later it stops. One step was written and it ran three times.'
      ]
    },
    fork: {
      name: 'A decision',
      stage: '<div class="ex-stack">' + el('q', 0, 'power &gt; 4 ?') + el('branches', 1, '<span class="nd bx">move 6</span><span class="nd bx ghost">move 3</span>') + el('chip', 2, 'else runs instead') + '</div>',
      steps: [
        'An if block asks a yes-or-no question.',
        'If the answer is yes, the top path runs.',
        'If it is no, the else path runs instead. Only one branch ever runs.'
      ]
    },
    boss: {
      name: 'A boss round',
      stage: '<div class="ex-row">' + el('glitch', 0, 'The Glitch') + el('mini', 1, 'box') + el('mini', 1, 'loop') + el('mini', 2, 'if') + '</div>',
      steps: [
        'A boss round tests everything at once, not just the newest block.',
        'It blocks an attack it has seen before, so repeating yourself costs a heart.',
        'Change the plan each round: use a box, a loop and a decision together.'
      ]
    },
    seq: {
      name: 'A program',
      stage: '<div class="ex-row">' + el('nd bx', 0, '<b>1</b> read') + ln(1) + el('nd bx', 1, '<b>2</b> move') + ln(2) + el('nd bx', 2, '<b>3</b> say') + '</div>',
      steps: [
        'A program runs from top to bottom.',
        'Each step finishes before the next one starts.',
        'Change the order and you change the result.'
      ]
    },
    lock: {
      name: 'A constant',
      stage: '<div class="ex-row">' + el('nd bx lock', 0, '<b>gravity</b><i>9.8</i>') + el('chip', 1, 'constant') + el('mini bad', 2, 'change ✕') + '</div>',
      steps: [
        'A constant is a box that is set once.',
        'It still has a name and a value you can read.',
        'But nothing may change it later, so important settings stay safe.'
      ]
    },
    type: {
      name: 'Types',
      stage: '<div class="ex-row">' + el('type num', 0, '7<small>number</small>') + el('type txt', 1, '"7"<small>text</small>') + '</div>',
      steps: [
        'Every value has a type.',
        '7 is a number, so maths works on it.',
        'In quotes, "7" is text. It looks the same, but maths fails on it.'
      ]
    },
    cast: {
      name: 'Casting',
      stage: '<div class="ex-row">' + el('type txt', 0, '"3"') + ln(1) + el('conv', 1, 'cast') + ln(2) + el('type num', 2, '3') + '</div>',
      steps: [
        'Type casting converts a value from one type to another.',
        'The word 3 goes in.',
        'A real number comes out, ready for maths.'
      ]
    },
    string: {
      name: 'A string',
      stage: '<div class="ex-row">' + el('bead', 0, 'he') + el('bead', 1, 'llo') + el('nd str', 2, 'hello') + '</div>',
      steps: [
        'A string is text: a list of characters.',
        'Joining glues two strings together end to end.',
        'he and llo become hello. Long words are built one piece at a time.'
      ]
    },
    op: {
      name: 'Operators',
      stage: '<div class="ex-stack">' + el('nd sum', 0, '<b>7 + 3</b>') + el('chip', 1, '= 10') + el('chip', 2, '10 remainder 3 = 1') + '</div>',
      steps: [
        'Operators calculate with values.',
        'Plus, minus, times and divide combine numbers.',
        'Remainder keeps what is left over. 10 remainder 3 is 1.'
      ]
    },
    array: {
      name: 'An array',
      stage: '<div class="ex-row">' + el('slot', 0, '<small>1</small>4') + el('slot', 1, '<small>2</small>8') + el('slot', 2, '<small>3</small>2') + '</div>',
      steps: [
        'An array is a list kept in one box.',
        'Each item has a position, numbered from one.',
        'Pick item 2 and you get the value in that slot, here 8.'
      ]
    },
    io: {
      name: 'Input and output',
      stage: '<div class="ex-row">' + el('nd person', 0, 'you') + ln(1) + el('nd bx', 1, '<b>program</b>') + ln(2) + el('nd screen', 2, 'answer') + '</div>',
      steps: [
        'Input is information coming in.',
        'The program works on it.',
        'Output is what the person sees or hears.'
      ]
    },
    note: {
      name: 'A comment',
      stage: '<div class="ex-row">' + el('nd code', 0, 'move 2') + el('sticky', 1, 'why?') + el('mini', 2, 'the computer skips it') + '</div>',
      steps: [
        'A comment is a note for humans.',
        'The computer skips it completely.',
        'Write why you did something, not just what the line already says.'
      ]
    },
    func: {
      name: 'A function',
      stage: '<div class="ex-row">' + el('nd machine', 0, '<b>walk()</b>') + el('chip', 1, 'call') + el('chip', 1, 'call') + el('chip', 2, 'same steps every time') + '</div>',
      steps: [
        'A function is a named group of blocks.',
        'Define it once, with the steps inside.',
        'Call it as many times as you like. Each call runs the same steps.'
      ]
    },
    scope: {
      name: 'Scope',
      stage: '<div class="ex-row">' + el('room', 0, '<b>outside</b><i>score 5</i>') + el('room inner', 1, '<b>inside</b><i>score 9</i>') + el('chip', 2, 'outside is still 5') + '</div>',
      steps: [
        'Scope is where a variable exists.',
        'A change made inside a function stays inside.',
        'Outside, the original value is untouched.'
      ]
    },
    recurs: {
      name: 'Recursion',
      stage: '<div class="ex-row">' + el('mirror', 0, 'call 1') + el('mirror', 1, 'call 2') + el('mirror', 2, 'base case') + '</div>',
      steps: [
        'Recursion is a function calling itself.',
        'Each call works on a smaller piece of the problem.',
        'A base case tells it when to stop, or it would run forever.'
      ]
    },
    bits: {
      name: 'Bits',
      stage: '<div class="ex-row">' + el('bit on', 0, '1') + el('bit on', 1, '2') + el('bit on', 2, '4') + el('bit', 2, '8') + el('nd sum', 2, '= 7') + '</div>',
      steps: [
        'A bit is a switch that is on or off.',
        'Each position is worth double the one before: 1, 2, 4 and 8.',
        'Add the values that are on. 4 plus 2 plus 1 makes 7.'
      ]
    },
    sum: {
      name: 'Binary addition',
      stage: '<div class="ex-stack">' + el('bitsrow', 0, '<span class="bit on">0</span><span class="bit on">1</span><span class="bit">0</span><span class="bit on">1</span>') + el('bitsrow', 1, '<span class="bit on">0</span><span class="bit">0</span><span class="bit on">1</span><span class="bit on">1</span>') + el('bitsrow res', 2, '<span class="bit on">1</span><span class="bit">0</span><span class="bit">0</span><span class="bit">0</span>') + '</div>',
      steps: [
        'Binary numbers add like normal numbers.',
        'Line up the bits and add each column from the right.',
        'Carry a pair into the next column, just like tens.'
      ]
    },
    gate: {
      name: 'A logic gate',
      stage: '<div class="ex-row">' + el('nd in', 0, 'A on') + el('nd in', 0, 'B off') + el('nd gate', 1, 'AND') + el('lamp', 2, 'off') + '</div>',
      steps: [
        'A logic gate takes one or two signals.',
        'AND gives ON only when both inputs are ON.',
        'One ON input is not enough, so the bulb stays dark.'
      ]
    },
    bug: {
      name: 'Debugging',
      stage: '<div class="ex-stack">' + el('nd code', 0, 'move 2') + el('nd code broken', 1, 'move 9') + el('nd code', 1, 'say go') + el('chip', 2, 'fix the step that does not fit') + '</div>',
      steps: [
        'A bug is a mistake in a program.',
        'Read it slowly and say what each line does.',
        'Find the step that does not match the job, then fix that step.'
      ]
    },
    search: {
      name: 'Searching',
      stage: '<div class="ex-row">' + el('slot', 0, '<small>1</small>4') + el('slot', 1, '<small>2</small>8') + el('slot', 2, '<small>3</small>2') + el('slot', 3, '<small>4</small>9') + el('chip', 2, 'found at 4') + '</div>',
      steps: [
        'A search looks for one value in a list.',
        'Start at the first item and check in order.',
        'Stop when you find it, or when the list ends.'
      ]
    },
    best: {
      name: 'Finding the biggest',
      stage: '<div class="ex-row bars">' + el('bar', 0, '') + el('bar tall', 1, '') + el('bar short', 1, '') + el('bar best', 2, '') + '</div>',
      steps: [
        'To find the biggest, keep the best so far.',
        'Compare each new item with the best.',
        'Replace the best only when you see something bigger.'
      ]
    },
    slim: {
      name: 'Optimising',
      stage: '<div class="ex-row">' + el('stack', 0, '<b>move</b><b>move</b><b>move</b><b>move</b>') + ln(1) + el('nd loopbox', 2, '<b>repeat ×4</b><small>move</small>') + '</div>',
      steps: [
        'Repeated blocks make a program long.',
        'A loop does the same job with one block.',
        'Shorter code is easier to read and has fewer places for bugs.'
      ]
    }
  };

  /* Chapter index to scene. Boss chapters get the boss scene, and chapters
     that teach the same idea share a scene on purpose. */
  const MAP = ['box', 'loop', 'fork', 'boss', 'seq', 'lock', 'type', 'cast', 'string', 'boss',
    'op', 'array', 'io', 'note', 'boss', 'func', 'scope', 'recurs', 'bits', 'boss',
    'bits', 'bits', 'sum', 'gate', 'boss', 'bug', 'search', 'best', 'slim', 'boss'];

  let cur = null;

  function setStep(n) {
    if (!cur) return;
    const steps = cur.scene.steps;
    const step = Math.max(0, Math.min(steps.length - 1, n));
    cur.step = step;
    cur.stage.dataset.step = step;
    cur.stage.querySelectorAll('[data-at]').forEach((node) => {
      const at = +node.dataset.at;
      node.classList.toggle('on', at <= step);
      node.classList.toggle('now', at === step);
      node.classList.toggle('future', at > step);
    });
    cur.cap.innerHTML = steps[step];
    cur.count.textContent = (step + 1) + ' / ' + steps.length;
    cur.dots.querySelectorAll('i').forEach((d, i) => d.classList.toggle('on', i <= step));
    cur.prev.disabled = step === 0;
    cur.next.disabled = step === steps.length - 1;
  }

  function mount(fig, chapter) {
    const id = MAP[chapter];
    const scene = SCENES[id];
    if (!fig || !scene) return null;
    fig.dataset.scene = id;
    fig.innerHTML =
      '<div class="ex-head"><span class="ex-k">' + scene.name + '</span><span class="ex-dots">' +
        scene.steps.map(() => '<i></i>').join('') + '</span><span class="ex-count">1 / ' + scene.steps.length + '</span></div>' +
      '<div class="ex-stage" data-step="0">' + scene.stage + '</div>' +
      '<div class="ex-foot"><p class="ex-cap"></p><span class="ex-ctl">' +
        '<button class="ex-btn" data-x="prev" type="button" aria-label="Previous step">Back</button>' +
        '<button class="ex-btn" data-x="next" type="button" aria-label="Next step">Next</button></span></div>';
    cur = {
      fig, scene, step: 0, playing: false,
      stage: fig.querySelector('.ex-stage'), cap: fig.querySelector('.ex-cap'),
      count: fig.querySelector('.ex-count'), dots: fig.querySelector('.ex-dots'),
      prev: fig.querySelector('[data-x="prev"]'), next: fig.querySelector('[data-x="next"]')
    };
    cur.prev.onclick = () => { stop(); setStep(cur.step - 1); };
    cur.next.onclick = () => { stop(); setStep(cur.step + 1); };
    setStep(0);
    return cur;
  }

  function stop() {
    if (cur) cur.playing = false;
    try { if (window.TLP && TLP.Voice) TLP.Voice.stop(); } catch (e) {}
  }

  function narrate(onend) {
    if (!cur) { if (onend) onend(); return; }
    stop();
    if (cur.step >= cur.scene.steps.length - 1) setStep(0);
    const from = cur.step, steps = cur.scene.steps.slice(from);
    cur.playing = true;
    const finish = () => { if (!cur) return; cur.playing = false; if (onend) onend(); };
    if (window.TLP && TLP.Voice && TLP.Voice.speakSteps) {
      TLP.Voice.speakSteps(steps.map(text), (i) => setStep(from + i), finish);
    } else {
      steps.forEach((s, i) => setTimeout(() => setStep(from + i), i * 2400));
      setTimeout(finish, steps.length * 2400);
    }
  }

  window.TLP_EXPLAIN = {
    has: (chapter) => !!SCENES[MAP[chapter]],
    html: (chapter) => SCENES[MAP[chapter]] ? '<figure class="ex" id="ex" aria-label="Lesson explainer"></figure>' : '',
    mount,
    narrate,
    stop,
    mounted: () => (cur && cur.fig.isConnected ? cur : null)
  };
})();
