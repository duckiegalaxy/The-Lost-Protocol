(function () {
  'use strict';

  var MIN = 10;



  var COMMON = {
    '1234567890': 1, 'password123': 1, 'qwertyuiop': 1, '123456789': 1,
    '12345678': 1, '12345678910': 1, 'password1': 1, 'iloveyou': 1,
    'princess': 1, 'sunshine': 1, 'football': 1, 'charlie': 1, 'aa123456': 1,
    'qwerty123': 1, 'letmein123': 1, 'welcome123': 1, 'admin12345': 1,
    'abc123456': 1, 'password12': 1, 'superman': 1, 'batman123': 1,
    'trustno1': 1, 'whatever': 1, 'qazwsxedc': 1, '1q2w3e4r5t': 1,
    'zaq12wsx': 1, 'michael123': 1, 'jennifer1': 1, 'computer1': 1,
    'starwars1': 1, 'shadow123': 1, 'baseball1': 1, 'soccer123': 1,
    'monkey123': 1, 'dragon123': 1, 'master123': 1, 'freedom1': 1,
    'hello12345': 1, 'test123456': 1, 'temppassword': 1, 'changeme12': 1,
    'lostprotocol': 1, 'theprotocol': 1, 'robounison': 1, 'lostprotocol1': 1
  };



  function score(pw) {
    pw = String(pw || '');
    if (!pw) return 0;
    var s = 0;
    if (pw.length >= MIN) s++;
    if (pw.length >= 14) s++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;

    if (pw.length >= 20) s = Math.max(s, 3);
    return Math.min(4, s);
  }

  function toHex(buf) {
    var b = new Uint8Array(buf), out = '';
    for (var i = 0; i < b.length; i++) out += ('0' + b[i].toString(16)).slice(-2);
    return out.toUpperCase();
  }

  async function sha1(text) {
    if (!window.crypto || !crypto.subtle || !window.TextEncoder) return '';
    var buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(text));
    return toHex(buf);
  }




  async function breachCount(pw) {
    var timer = null;
    try {
      var hex = await sha1(pw);
      if (!hex) return { checked: false, count: 0 };
      var prefix = hex.slice(0, 5), suffix = hex.slice(5);
      var ctl = new AbortController();
      timer = setTimeout(function () { ctl.abort(); }, 3500);
      var res = await fetch('https://api.pwnedpasswords.com/range/' + prefix, {
        signal: ctl.signal,
        headers: { 'Add-Padding': 'true' }
      });
      clearTimeout(timer);
      if (!res.ok) return { checked: false, count: 0 };
      var text = await res.text();
      var lines = text.split('\n');
      for (var i = 0; i < lines.length; i++) {
        var parts = lines[i].trim().split(':');
        if (parts[0] && parts[0].toUpperCase() === suffix) {
          return { checked: true, count: parseInt(parts[1], 10) || 1 };
        }
      }
      return { checked: true, count: 0 };
    } catch (e) {
      clearTimeout(timer);
      return { checked: false, count: 0 };
    }
  }


  async function check(pw) {
    pw = String(pw || '');
    var strength = score(pw);
    if (pw.length < MIN) {
      return { ok: false, msg: 'Use a password of at least ' + MIN + ' characters. A short sentence works well.', strength: strength, checked: false };
    }
    if (COMMON[pw.toLowerCase()]) {
      return { ok: false, msg: 'That password is too common. Add a few unrelated words to make it unique.', strength: strength, checked: false };
    }
    var b = await breachCount(pw);
    if (b.checked && b.count > 0) {
      return { ok: false, msg: 'This password appears in a known data breach. Pick a different one, for example three unrelated words.', strength: strength, checked: true };
    }
    return { ok: true, msg: b.checked ? '' : 'Could not reach the breach check. You can continue, but a longer passphrase is safer.', strength: strength, checked: b.checked };
  }

  window.TLP_PASSWORD = { MIN: MIN, score: score, check: check };
})();
