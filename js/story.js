/* =============================================================================
   THE LOST PROTOCOL — STORY DATA (edit text here; no game logic lives here)
   Speakers: r = R-067 (the player's repair unit), u = RoboUnison (companion),
             l = Dr. Lena Voss (scientist), s = system log / narration.
   Chapter numbers are the game's real chapter indexes (0-29) in js "CH".
   Section ("act") numbers are 0-5, matching the game's "SEC" list.
   Text is written in short, plain sentences so it works for every learning
   path. Opening, acts and ending also have a gentler "k" version (grades 1-6).
   ============================================================================= */
(function () {
  'use strict';

  var WHO = {
    r: { name: 'R-067', cls: 'sp-r' },
    u: { name: 'RoboUnison', cls: 'sp-u' },
    l: { name: 'Dr. Lena Voss', cls: 'sp-l' },
    s: { name: 'System log', cls: 'sp-s' }
  };

  var isKid = function (path) { return path === 'g16'; };
  var pick = function (path, o) { return isKid(path) && o.k ? o.k : o.d; };

  /* ---------- Opening (shown once, then a "Begin Mission" button) ---------- */
  var OPENING = {
    title: 'System Restart',
    scenes: [
      { d: [['s', 'Across the Nexus Network, the lights go out one by one.'],
            ['s', 'Power stations stop. Messages vanish. Nobody knows why.']],
        k: [['s', 'The big Nexus Network is going dark. One light at a time.'],
            ['s', 'Power is off and messages are lost. What happened?']] },
      { d: [['u', 'Contact established! I am RoboUnison. Your unit is R-067. We lost synchronization with the network.'],
            ['r', 'Memory incomplete. Access limited. Instructions only.']],
        k: [['u', 'Hello! I am RoboUnison, your robot buddy. You are R-067, a repair robot!'],
            ['r', 'My memory is fuzzy. But I can follow instructions.']] },
      { d: [['l', '...R-067? This is Dr. Lena Voss. The signal is damaged, so listen carefully.'],
            ['l', 'The central recovery process is down. You are the only repair unit close enough to reach the first broken system.'],
            ['l', 'Fix the local power terminal. It cannot restart because its instructions are incomplete.'],
            ['l', 'And hurry. The network will not stay this quiet for long. Hours, not days.']],
        k: [['l', 'R-067? I am Dr. Lena Voss. The radio is crackly, so listen!'],
            ['l', 'The network is broken. You are the only robot close enough to help.'],
            ['l', 'Fix the power box in this room. Its instructions are in the wrong order.'],
            ['l', 'Please hurry. We do not have much time!']] }
    ],
    objective: {
      d: 'Mission: restore the local power terminal. A computer follows instructions one at a time, in order.',
      k: 'Mission: fix the power box. A computer follows instructions one step at a time, in order!'
    },
    button: 'Begin Mission'
  };

  /* ---------- Acts: one per game section (0-5) ---------- */
  var ACTS = [
    { title: 'Act 1 · The Basics',
      d: [['l', 'Start with the local systems. Every big machine begins with small, ordered steps.'],
          ['u', 'I will stay close. Think first, then run it!']],
      k: [['l', 'Start small! Every big machine begins with tiny steps.'],
          ['u', 'I will help with hints. You do the thinking!']],
      end: { d: [['s', 'Log recovered: the shutdown began BEFORE the failure was reported.'],
                 ['s', 'The order carries a signature: I. Renner.'],
                 ['l', 'Renner. He was my partner when we built the Protocol. Keep going, R-067.']],
             k: [['s', 'Secret message found: the trouble started before anyone noticed.'],
                 ['s', 'A name is on the message: I. Renner.'],
                 ['l', 'I know that name! Renner helped me build the safety rules.']] } },
    { title: 'Act 2 · Data',
      d: [['l', 'The network lost track of its information. Values changed type, labels went missing.'],
          ['r', 'Data must be handled with care. Understood.']],
      k: [['l', 'The network mixed up its information. Numbers, words and labels are tangled!'],
          ['r', 'I will sort them out.']],
      end: { d: [['s', 'Log recovered: several systems lost their settings seconds before the emergency recovery began.'],
                 ['u', 'Interesting. The settings vanished first. Then the recovery started.'],
                 ['l', 'Renner stopped writing logs after we retired the Protocol. He was angry. I never asked why.']],
             k: [['s', 'Clue: the settings disappeared first. Then the emergency fix started.'],
                 ['u', 'Whoa. That is a big clue!'],
                 ['l', 'Renner went quiet when we put the safety rules away. I never asked why.']] } },
    { title: 'Act 3 · Tools',
      d: [['l', 'Power quantities are wrong, archives are scrambled and relays are repeating. Use every tool you have.'],
          ['u', 'Careful with the calculations. One wrong number can spread.']],
      k: [['l', 'Machines here count wrongly and store things badly. Use your tools to fix them!'],
          ['u', 'Check your maths twice!']],
      end: { d: [['s', 'Decrypted: the emergency sequence tried to move resources using corrupted calculations. A partial reference points to a remote island facility.'],
                 ['l', 'An island that was cut off from the network before the disaster. I never knew about it.'],
                 ['l', 'That island was Renner\'s project. I thought it was empty.'],
                 ['l', 'I helped retire the Protocol. I thought its safeguards slowed us down. I was wrong.']],
             k: [['s', 'Decoded: the emergency fix used wrong numbers. A clue points to a faraway island!'],
                 ['l', 'An island? I never knew about it!'],
                 ['l', 'That island was Renner\'s secret place!'],
                 ['l', 'I helped put the safety rules away. I thought they were too slow. I was wrong.']] } },
    { title: 'Act 4 · Structure',
      d: [['l', 'These maintenance systems depend on reusable instruction groups. Several are missing or broken.'],
          ['u', 'Reusable pieces! Build once, use many times.']],
      k: [['l', 'These machines use instruction packs you can use again and again. Some are lost!'],
          ['u', 'Build it once, use it forever!']],
      end: { n: [['s', 'Fragment reconstructed: the original Lost Protocol, a safety and recovery design.'],
                 ['l', 'It was never a password. It is a set of rules that lets broken systems recover safely. Now we can restore the network in the right order.'],
                 ['l', 'Renner signed it too.'],
                 ['r', 'I want to know why he hid it.']],
             d: [['s', 'Fragment reconstructed: the original Lost Protocol, a safety and recovery design.'],
                 ['l', 'It was never a password. It is a set of rules that lets broken systems recover safely. The coordinates lead to the island.'],
                 ['l', 'Renner signed it too. That is why the island answers to his name.'],
                 ['r', 'Then I will ask him why he hid it.']],
             k: [['s', 'You found a piece of the Lost Protocol! It is a set of safety rules.'],
                 ['l', 'Now we know where to go: the island!'],
                 ['l', 'Renner signed it too!'],
                 ['r', 'Why did he hide it? I want to know!']] } },
    { title: 'Act 5 · The Island',
      d: [['l', 'The island was isolated on purpose. Its systems still keep the oldest records and safeguards.'],
          ['u', 'Bits and bytes. This is how the machines really think.']],
      k: [['l', 'The island is far away and still has the oldest records!'],
          ['u', 'Everything here is made of tiny on and off switches!']],
      end: { d: [['s', 'Record found: an earlier recovery attempt bypassed critical safeguards, and the failure spread.'],
                 ['l', 'The island survived because it was isolated. It still holds the original recovery instructions.'],
                 ['s', 'Island power is falling. The archive will lock itself within hours.'],
                 ['l', 'Renner\'s last log is from this morning. He is still here, holding it together alone.'],
                 ['u', 'Then we finish this now.']],
             k: [['s', 'Record found: an old emergency fix skipped the safety rules, so the trouble spread.'],
                 ['l', 'The island was safe because it was cut off. It kept the instructions!'],
                 ['s', 'The island is running out of power!'],
                 ['l', 'Renner\'s last message is from today. He is still here!'],
                 ['u', 'Let us hurry!']] } },
    { title: 'Act 6 · Mastery',
      d: [['l', 'We must restore the network in a careful order. Restarting everything at once would repeat the failure.'],
          ['r', 'Validate. Test. Repeat safely. Then reconnect.']],
      k: [['l', 'We must fix things in a careful order. If we rush, the same trouble comes back!'],
          ['r', 'Careful and steady. I can do it.']],
      end: { d: [], k: [] } }
  ];

  /* ---------- Chapters 0-29: brief (when a chapter starts) and win (when it ends) ---------- */
  var CH = {
    4:  { b: [['u', 'Instructions run in order, top to bottom. Let us restart the power terminal.']],
          w: [['s', 'Local power restored. A damaged facility map flickers on.']] },
    0:  { b: [['l', 'The energy room cannot remember its reserves. It needs variables: labelled boxes.']],
          w: [['u', 'Energy tracking is back! Boxes remember again.']] },
    1:  { b: [['u', 'A relay keeps repeating one message. A loop will tell it how many times.']],
          w: [['l', 'Relay repaired. It is no longer wasting power.']] },
    2:  { b: [['r', 'A checkpoint refuses to reconnect this facility. Its decision rules are damaged.']],
          w: [['l', 'The gate opens! Those records were locked behind a decision.']] },
    3:  { b: [['u', 'Something corrupt guards this junction. It remembers every move. Be creative!']],
          w: [['l', 'The Glitch is gone. The records inside look like an emergency log...']] },
    5:  { b: [['l', 'Some values must never change. Lock them as constants.']],
          w: [['u', 'Locked and safe. Nothing can overwrite them now.']] },
    6:  { b: [['u', 'Numbers, words, yes or no. Every piece of data has a type.']],
          w: [['r', 'Types identified. Data sorted.']] },
    7:  { b: [['l', 'A system sent a number where a word was expected. Convert it carefully.']],
          w: [['u', 'Converted! Nothing was lost on the way.']] },
    8:  { b: [['u', 'Text is a string of characters. Let us read what the old terminals say.']],
          w: [['s', 'Message decoded: "recovery started. safeguards bypassed."']] },
    9:  { b: [['u', 'The Hoarder grabs every scrap of memory. It is draining the facility.']],
          w: [['l', 'The Hoarder let go. Memory is flowing again.']] },
    10: { b: [['l', 'The energy-routing core sends wrong amounts. Repair the calculations.']],
          w: [['u', 'Power is balanced. The right amount goes to the right place!']] },
    11: { b: [['u', 'The archive stores lists of records. Arrays keep them in order.']],
          w: [['s', 'Archive restored. Hundreds of records are readable.']] },
    12: { b: [['l', 'The terminal must read input and show output to talk to the network again.']],
          w: [['u', 'We can talk to the network. Sending a signal...']] },
    13: { b: [['r', 'Old comments left by the creators. Notes explain why code exists.']],
          w: [['l', 'Their notes matter. Renner wrote a warning nobody read.'],
              ['s', 'Signed: I. Renner. "Never bypass the safeguards. The failure will spread."']] },
    14: { b: [['u', 'The Cipher locks the archive with a code. Crack it with everything you know!']],
          w: [['l', 'Decrypted. Renner\'s file points to a remote island facility!']], wn: [['l', 'Decrypted! The file belongs to I. Renner.']] },
    15: { b: [['l', 'Maintenance depends on functions: reusable groups of instructions. Rebuild the missing ones.']],
          w: [['u', 'Functions restored. Build once, use many times!']] },
    16: { b: [['r', 'A variable inside one function is invisible outside it. Scope has rules.']],
          w: [['l', 'Scope respected. Safe systems keep their data separate.']] },
    17: { b: [['u', 'Recursion means a function that calls itself. Always give it a way to stop!']],
          w: [['r', 'Base case confirmed. No infinite loop.']] },
    18: { b: [['l', 'Underneath all of it, machines use bits: on and off switches.']],
          w: [['s', 'A Lost Protocol fragment assembles. Author: I. Renner.'],
              ['s', 'Design purpose: safe, ordered recovery.']] },
    19: { b: [['u', 'The Echo repeats the emergency sequence again and again. Break the pattern!']],
          w: [['l', 'The echo is silent. Now we know where to go: the island.']], wn: [['l', 'The echo is silent. The way forward is clear.']] },
    20: { b: [['l', 'The island facility is isolated. Its systems speak in bits and bytes.']],
          w: [['u', 'A byte is eight bits. Island systems respond.']] },
    21: { b: [['u', 'Binary counting uses only 0 and 1. Count carefully!']],
          w: [['r', 'Count verified.']] },
    22: { b: [['l', 'Binary maths stores the island\'s oldest records. Add and subtract in binary.']],
          w: [['s', 'Record found: the emergency recovery was started automatically.']] },
    23: { b: [['u', 'Bit operations flip single switches. That is how safeguards turn on and off.']],
          w: [['l', 'That is exactly how the safeguards were switched off.']] },
    24: { b: [['r', 'The Byte guards the island archive. Everything we learned applies here.']],
          w: [['s', 'The archive is open. Renner\'s private log is inside, written hours ago.']] },
    25: { b: [['l', 'Before we restore the network, remove every bug in the recovery steps.']],
          w: [['u', 'Bugs squashed. Safer already!']] },
    26: { b: [['u', 'Searching finds one item among thousands. Find the damaged components fast.']],
          w: [['r', 'Target components located.']] },
    27: { b: [['l', 'Which system is under the greatest load? Find the biggest value.']],
          w: [['u', 'Found it! That one restarts last.']] },
    28: { b: [['r', 'Do the same work with fewer steps. Optimise the recovery order.']],
          w: [['l', 'Efficient and safe. This is the procedure the creators intended.']] },
    29: { b: [['u', 'This is it. The original emergency sequence still runs here. Use everything!']],
          w: [['s', 'Safeguards reactivated. Components recover in order. Communication returns.']] }
  };

  /* ---------- Guardians (bosses): intro + defeat line ---------- */
  var BOSS = {
    3:  { i: [['u', 'The Glitch is a corrupted leftover of the emergency sequence. It remembers every move.']],
          o: [['l', 'It was trying to isolate a failing part, but the safeguards were bypassed.']] },
    9:  { i: [['l', 'The Hoarder keeps everything and never lets go. Handle data safely.']],
          o: [['u', 'Memory released! The facility can breathe again.']] },
    14: { i: [['u', 'The Cipher hides the island. Its code changes. Stay sharp!']],
          o: [['l', 'The island\'s location is ours now.']] },
    19: { i: [['r', 'The Echo copies the last recovery step again and again.']],
          o: [['l', 'The echo is gone. The path to the island is clear.']] },
    24: { i: [['u', 'The Byte guards the oldest records. It speaks only in bits.']],
          o: [['l', 'The archive is open. Renner\'s last log is inside, and it is only hours old.']] },
    29: { i: [['l', 'This is the original recovery sequence that bypassed the safeguards. If we restart it wrongly, the failure repeats.'],
             ['l', 'Renner built it to save the network. Without the safeguards, it nearly ended it.'],
             ['l', 'The island has minutes of power left. This is the only attempt we get.'],
             ['u', 'No pressure! We believe in you, R-067.']],
          o: [['l', 'The sequence is under control. Renner\'s log is opening.']] }
  };

  /* ---------- Ending ---------- */
  var ENDING = {
    title: 'The Lost Protocol, restored',
    scenes: [
      { d: [['s', 'Safeguards reactivated. Damaged components recover in a controlled order. Power returns across the Nexus Network.'],
            ['l', 'We found the truth. Renner bypassed the safeguards to stop the first blackout. It worked, and then it spread.'],
            ['l', 'He stayed on the island to contain it. He left us the Protocol so we could undo it safely.']],
        k: [['s', 'The safety rules are back on! Lights return everywhere.'],
            ['l', 'We found the truth! Renner tried to fix the first blackout too fast.'],
            ['l', 'He skipped the safety rules. Then he stayed on the island to help.']] },
      { d: [['u', 'We did it! Every repair worked because you understood it, not because anyone handed you the answers.'],
            ['l', 'Renner\'s signal is back. He is tired, but he is alive.'],
            ['l', 'Thank you, R-067. You did not just follow instructions. You reasoned through them.']],
        k: [['u', 'We did it! You solved every puzzle by thinking!'],
            ['l', 'Renner is safe! He is tired, but he is okay.'],
            ['l', 'Thank you, R-067. You are a real problem solver!']] },
      { d: [['r', 'Final report saved: "Systems must be understood, not merely obeyed. Future repair units will read the reasons as well as the rules."'],
            ['r', 'Personal note: I asked why. Now I understand.'],
            ['s', 'Nexus Network online. Mission complete.']],
        k: [['r', 'Final report saved: "Understand the rules, then use them well."'],
            ['r', 'Personal note: asking why made me a better helper.'],
            ['s', 'Nexus Network online. Mission complete!']] }
    ],
    button: 'Back to menu'
  };

  /* ---------- Feedback after unsuccessful attempts (constructive, never harsh) ---------- */
  var FAIL = [
    ['u', 'Not yet. Read the mission once more, then change just one block.'],
    ['u', 'Close! Check the order of your blocks.'],
    ['l', 'Systems fail before they are repaired. Try again.'],
    ['r', 'Result: incorrect. Next: adjust one step and run again.'],
    ['u', 'Every engineer retries. Use the hint button if you want a nudge.']
  ];
  var failIdx = 0;

  /* ---------- Helpers ---------- */
  function line(pair) {
    var w = WHO[pair[0]] || WHO.s;
    return '<div class="sline ' + w.cls + '"><b>' + w.name + '</b><span>' + pair[1] + '</span></div>';
  }
  function lines(arr) { return (arr || []).map(line).join(''); }
  function plain(arr) { return (arr || []).map(function (p) { return (WHO[p[0]] || WHO.s).name + ': ' + p[1]; }).join(' '); }

  function sectionOf(ci) {
    var SECS = (typeof SEC !== 'undefined') ? SEC : [];
    for (var i = 0; i < SECS.length; i++) {
      var s = SECS[i];
      if (s.boss === ci || (s.ch || []).indexOf(ci) >= 0) return (s.id !== undefined ? s.id : i);
    }
    return -1;
  }
  function firstInSection(ci) {
    var si = sectionOf(ci), SECS = (typeof SEC !== 'undefined') ? SEC : [], sx = null;
    for (var i = 0; i < SECS.length; i++) if ((SECS[i].id !== undefined ? SECS[i].id : i) === si) sx = SECS[i];
    return sx && sx.ch[0] === ci ? si : -1;
  }

  window.TLP_STORY = {
    WHO: WHO,
    opening: function (path) {
      return { title: OPENING.title, scenes: OPENING.scenes.map(function (s) { return pick(path, s); }),
               objective: pick(path, OPENING.objective), button: OPENING.button };
    },
    ending: function (path) {
      return { title: ENDING.title, scenes: ENDING.scenes.map(function (s) { return pick(path, s); }), button: ENDING.button };
    },
    act: function (si, path) { var a = ACTS[si]; return a ? { title: a.title, lines: pick(path, a) } : null; },
    actEnd: function (si, path) { var a = ACTS[si]; if (!a || !a.end) return []; if (a.end.n && (path === 'g16' || path === 'g710')) return a.end.n; return pick(path, a.end); },
    sectionOf: sectionOf,
    firstInSection: firstInSection,
    brief: function (ci) { return CH[ci] ? CH[ci].b : []; },
    win: function (ci, path) { var c = CH[ci]; if (!c) return []; return (c.wn && (path === 'g16' || path === 'g710')) ? c.wn : c.w; },
    bossIntro: function (ci) { return BOSS[ci] ? BOSS[ci].i : []; },
    bossOutro: function (ci) { return BOSS[ci] ? BOSS[ci].o : []; },
    fail: function () { var f = FAIL[failIdx++ % FAIL.length]; return f; },
    line: line, lines: lines, plain: plain,
    /* "seen" tracking is per browser; it never touches saved progress */
    seen: function (k) { try { return localStorage.getItem('tlp-story-' + k) === '1'; } catch (e) { return false; } },
    mark: function (k) { try { localStorage.setItem('tlp-story-' + k, '1'); } catch (e) {} }
  };
})();