(function() {
  'use strict';


  const GRADE_TO_PATH = {
    'g16': 'g16',
    'g710': 'g710',
    'g1112': 'g1112',
    'adult': 'adult'
  };

  const PATH_INFO = {
    'g16': { label: 'Grades 1–6', age: 'Ages 6–12', desc: 'Visual analogies, gentle guidance, and playful exploration' },
    'g710': { label: 'Grades 7–10', age: 'Ages 12–16', desc: 'Structured logic, computational problem-solving, and clear code flow' },
    'g1112': { label: 'Grades 11–12', age: 'Ages 16–18', desc: 'Computer science principles, syntax parallels, and state analysis' },
    'adult': { label: 'College & Adult', age: 'Higher Ed & Self-Taught', desc: 'Software engineering depth, memory mental models, and technical precision' }
  };

  const DIFF_INFO = {
    'beg': { label: 'Beginner', desc: '5 hearts in boss fights, coach step guidance, generous par' },
    'int': { label: 'Intermediate', desc: 'Standard balanced challenge, 3 hearts in boss fights' },
    'pro': { label: 'Professional', desc: 'Terminal mode, code view, 2 hearts in boss fights' }
  };


  function validateBirth(month, year, { managed = false, staff = false } = {}) {
    if (typeof month !== 'number' || typeof year !== 'number' || !Number.isInteger(month) || !Number.isInteger(year) || month < 1 || month > 12) {
      throw new Error('Enter a whole-number birth month (1–12) and birth year.');
    }
    const now = new Date(), currentYear = now.getUTCFullYear(), currentMonth = now.getUTCMonth() + 1;
    if (year > currentYear || (year === currentYear && month > currentMonth)) throw new Error('Birth date cannot be in the future.');
    const age = currentYear - year - (month > currentMonth ? 1 : 0);
    if (age < 6 || age > 120) throw new Error('Learners must be between 6 and 120 years old.');
    if (staff && age < 18) throw new Error('Parent and Teacher accounts require an age of at least 18.');
    if (!staff && !managed && age < 13) throw new Error('Under-13 learners need a parent or guardian to create their profile in the Parent area.');
    return { age, path: age <= 12 ? 'g16' : age <= 15 ? 'g710' : age <= 17 ? 'g1112' : 'adult' };
  }
  const ACTIVITY_NS = '__tlp_activity_v1';
  const isObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const union = (a, b) => [...new Map([...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])].map(v => [JSON.stringify(v), v])).values()];

  function mergeActivity(a, b, key = '') {
    if (b == null) return a;
    if (a == null) return b;
    if (Array.isArray(a) && Array.isArray(b)) return union(a, b);
    if (isObject(a) && isObject(b)) {

      if (key === 'daily' && a.date && b.date && a.date !== b.date) return a.date > b.date ? a : b;
      const out = { ...a };
      for (const k of Object.keys(b)) {
        if (['__proto__', 'constructor', 'prototype'].includes(k)) continue;
        out[k] = mergeActivity(a[k], b[k], k);
      }

      if (key === 'streak') {
        const latest = (a.last || '') > (b.last || '') ? a : b;
        if (latest.last) { out.last = latest.last; out.count = latest.count; }
      }
      return out;
    }
    if (typeof a === 'number' && typeof b === 'number' && Number.isFinite(a) && Number.isFinite(b)) {
      return ['bestTime', 'bestTries'].includes(key) ? Math.min(a || Infinity, b || Infinity) : Math.max(a, b);
    }
    if (typeof a === 'boolean' && typeof b === 'boolean') return a || b;
    return b;
  }
  function mergeProgress(a = {}, b = {}) {
    const prog = { ...(a.prog || {}) };
    for (const [k, v] of Object.entries(b.prog || {})) {
      if (Number.isFinite(v) && !['__proto__', 'constructor', 'prototype'].includes(k)) prog[k] = Math.max(Number(prog[k]) || 0, v);
    }
    return { ...a, ...b, prog, ach: union(a.ach, b.ach), badges: union(a.badges, b.badges) };
  }


  async function sha256(str) {
    if (typeof crypto !== 'undefined' && crypto.subtle && typeof TextEncoder !== 'undefined') {
      const buffer = new TextEncoder().encode(str);
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return 'local_h_' + Math.abs(hash).toString(16);
  }

  class TLPAuthEngine {
    constructor() {
      this.supabase = null;
      this.mode = 'local';
      this.currentUser = null;
      this.activeLearner = null;
      this.initialized = false;
      this.initPromise = null;
      this.isProcessingAction = false;
      this._saveQueues = new Map();
      this._leaderboardAvatarAvailable = null;
      this._leaderboardAvatarProbe = null;

      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const query = new URLSearchParams(window.location.search);
      const type = hash.get('type') || query.get('type');
      this.authCallback = {
        signup: type === 'signup' || (query.get('confirmed') === '1' && Boolean(query.get('code') || hash.get('access_token'))),
        recovery: type === 'recovery',
        error: hash.get('error_description') || query.get('error_description') || hash.get('error') || query.get('error') || '',
        hasCode: Boolean(query.get('code'))
      };
      this._callbackToken = hash.get('access_token');
      this._callbackAccepted = false;
      this._callbackSession = null;
    }

    static validateBirth(month, year, options) { return validateBirth(month, year, options); }
    validateBirth(month, year, options) { return validateBirth(month, year, options); }

    _emit(name, detail = {}) {
      try { window.dispatchEvent(new CustomEvent(name, { detail })); } catch (e) {}
    }

    _authChanged() {
      this._emit('tlp-auth-ready', { mode: this.mode, userId: this.currentUser && this.currentUser.id, learnerId: this.activeLearner && this.activeLearner.id });
    }

    async getEmailConfirmationStatus() {
      await this.init();
      if (this.authCallback.error) return { confirmed: false, error: this.authCallback.error };
      if (!this.authCallback.signup || !this.isCloudConfigured() || !this._callbackAccepted || !this._callbackSession) return { confirmed: false };

      const { data, error } = await this.supabase.auth.getUser(this._callbackSession.access_token);
      if (error) throw error;
      return { confirmed: Boolean(data.user && data.user.id === this._callbackSession.user.id && data.user.email_confirmed_at) };
    }

    async hasRecoverySession() {
      await this.init();
      if (!this.authCallback.recovery || !this._callbackAccepted || !this._callbackSession || this.authCallback.error) return false;
      const { data, error } = await this.supabase.auth.getUser(this._callbackSession.access_token);
      return !error && Boolean(data.user && data.user.id === this._callbackSession.user.id);
    }

    async init() {
      if (this.initPromise) return this.initPromise;
      this.initPromise = this._doInit();
      return this.initPromise;
    }

    async _doInit() {
      const config = window.TLP_CONFIG || {};
      const url = (config.SUPABASE_URL || '').trim();
      const key = (config.SUPABASE_ANON_KEY || '').trim();

      if (url && key && window.supabase && typeof window.supabase.createClient === 'function') {
        try {





          const authStorage = {
            getItem: (k) => {
              try {
                const store = localStorage.getItem('tlp-remember') === '0' ? sessionStorage : localStorage;
                return store.getItem(k);
              } catch (e) { return null; }
            },
            setItem: (k, v) => {
              try {
                const store = localStorage.getItem('tlp-remember') === '0' ? sessionStorage : localStorage;
                const other = store === localStorage ? sessionStorage : localStorage;
                store.setItem(k, v);


                other.removeItem(k);
              } catch (e) {}
            },
            removeItem: (k) => {
              try { localStorage.removeItem(k); } catch (e) {}
              try { sessionStorage.removeItem(k); } catch (e) {}
            }
          };
          this.supabase = window.supabase.createClient(url, key, {
            auth: { storage: authStorage, persistSession: true, autoRefreshToken: true }
          });
          this.mode = 'cloud';
          this.supabase.auth.onAuthStateChange((event, session) => {

            if ((event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') && session && (this.authCallback.signup || this.authCallback.recovery)) {
              this._callbackAccepted = !this.authCallback.error && (this.authCallback.hasCode || session.access_token === this._callbackToken);
              if (this._callbackAccepted) this._callbackSession = session;
            }
          });

          const { data: { session }, error } = await this.supabase.auth.getSession();
          if (error) this.authCallback.error = error.message || 'Invalid or expired link.';
          if (session && session.user && !error) {
            if (this._callbackToken && session.access_token === this._callbackToken && !this.authCallback.error) {
              this._callbackAccepted = true;
              this._callbackSession = session;
            }
            await this._loadCloudUser(session.user);
          } else {

            this._loadLocalSession();
          }
        } catch (err) {
          console.warn('[TLP Auth] Failed to initialize Supabase client, using local mode:', err);
          this.mode = 'local';
          this._loadLocalSession();
        }
      } else {
        this.mode = 'local';
        this._loadLocalSession();
      }


      if (typeof window !== 'undefined' && window.location) {
        const params = new URLSearchParams(window.location.search);
        const lId = params.get('learnerId') || params.get('learner');
        if (lId) {
          const l = await this.getLearnerById(lId);
          if (l) this.setActiveLearner(l);
        }
      }

      this.initialized = true;
      this._authChanged();
      return { mode: this.mode, user: this.currentUser, learner: this.activeLearner };
    }

    isCloudConfigured() {
      return this.mode === 'cloud';
    }




    async _loadCloudUser(supabaseUser) {
      try {
        const { data: profile } = await this.supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .maybeSingle();

        const role = (profile && profile.role) || 'learner';
        const isAdmin = Boolean((profile && profile.is_admin) || role === 'admin');
        const isTest = Boolean(profile && profile.is_test_account);

        this.currentUser = {
          id: supabaseUser.id,
          email: supabaseUser.email,
          role: role,
          isAdmin: isAdmin,
          isTestAccount: isTest,
          displayName: (profile && profile.display_name) || supabaseUser.email.split('@')[0]
        };


        const learners = await this.getLearners(this.currentUser.id);
        const savedLId = localStorage.getItem('tlp-active-learner-id');
        this.setActiveLearner(learners.find(l => l.id === savedLId) || learners[0] || null);
      } catch (e) {
        console.error('[TLP Auth] Error loading cloud profile:', e);
      }
    }

    _rememberOn() {
      try { return localStorage.getItem('tlp-remember') !== '0'; } catch (e) { return true; }
    }

    _localSessionStore() {
      return this._rememberOn() ? localStorage : sessionStorage;
    }

    _loadLocalSession() {
      try {
        const rawUser = this._localSessionStore().getItem('tlp-local-session-user');
        if (rawUser) {
          this.currentUser = JSON.parse(rawUser);
          const learners = this._getLocalLearners(this.currentUser.id);
          const savedLId = localStorage.getItem('tlp-active-learner-id');
          this.setActiveLearner(learners.find(l => l.id === savedLId) || learners[0] || null);
        } else {
          this.currentUser = null;
          this.setActiveLearner(null);
        }
      } catch (e) {
        this.currentUser = null;
        this.setActiveLearner(null);
      }
    }

    getCurrentUser() {
      return this.currentUser;
    }

    isCurrentUserAdmin() {
      return Boolean(this.currentUser && (this.currentUser.role === 'admin' || this.currentUser.isAdmin));
    }

    isCurrentUserParent() {
      return Boolean(this.currentUser && (this.currentUser.role === 'parent' || this.isCurrentUserAdmin()));
    }

    getActiveLearner() {
      if (this.activeLearner) return this.activeLearner;

      return {
        id: 'default',
        name: localStorage.getItem('tlp-name') || 'Player',
        gradeRange: localStorage.getItem('tlp-grade') || 'g710',
        assignedPath: localStorage.getItem('tlp-path') || 'g710',
        currentDiff: localStorage.getItem('tlp-diff') || 'int',
        isGuest: true
      };
    }

    setActiveLearner(learner) {
      const previousId = this.activeLearner && this.activeLearner.id;
      this.activeLearner = learner;
      if (learner && learner.id) {
        try {
          localStorage.setItem('tlp-active-learner-id', learner.id);
          const p = learner.assigned_path || learner.assignedPath;
          const d = learner.current_diff || learner.currentDiff;
          if (p) localStorage.setItem('tlp-path', p);
          if (d) localStorage.setItem('tlp-diff', d);
          if (learner.name) localStorage.setItem('tlp-name', learner.name);
        } catch (e) {}
      }
      const nextId = learner && learner.id;
      if (this.initialized && previousId !== nextId) this._authChanged();
    }




    resolvePathFromGrade(gradeRange) {
      return GRADE_TO_PATH[gradeRange] || null;
    }

    getPathInfo(path) {
      return PATH_INFO[path] || PATH_INFO['g710'];
    }

    getDiffInfo(diff) {
      return DIFF_INFO[diff] || DIFF_INFO['int'];
    }


    canLearnerSelectPath(targetPath) {
      const l = this.getActiveLearner();
      if (!l || l.isGuest) return true;
      const assigned = l.assigned_path || l.assignedPath;
      if (!assigned) return true;
      return assigned === targetPath;
    }




    async registerUser({ email, password, role, displayName, learnerName, gradeRange, currentDiff, isTestAccount }) {
      if (this.isProcessingAction) throw new Error('An action is already in progress.');
      this.isProcessingAction = true;

      try {
        await this.init();
        email = (email || '').trim().toLowerCase();
        displayName = (displayName || '').trim() || (email.split('@')[0]);
        role = role === 'parent' ? 'parent' : 'learner';
        const assignedPath = this.resolvePathFromGrade(gradeRange) || 'g710';
        const diff = ['beg', 'int', 'pro'].includes(currentDiff) ? currentDiff : 'int';
        const isTest = Boolean(isTestAccount);

        if (!email || !email.includes('@')) {
          throw new Error('Please enter a valid email address.');
        }
        if (!password || password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        if (this.isCloudConfigured()) {

          const { data: authData, error: authErr } = await this.supabase.auth.signUp({
            email,
            password,
            options: { data: { role, display_name: displayName, grade_range: assignedPath, start_diff: diff } }
          });
          if (authErr) throw authErr;
          const user = authData.user;
          if (!user) throw new Error('Account creation failed. Please check backend email verification settings.');


          const { error: profErr } = await this.supabase
            .from('profiles')
            .upsert({
              id: user.id,
              role,
              display_name: displayName,
              is_admin: false,
              is_test_account: isTest
            });
          if (profErr) console.warn('[TLP Auth] Could not create profile row:', profErr);



          let initialLearner = null;
          if (role === 'learner' && authData.session) {
            const rows = await this.getLearners(user.id);
            initialLearner = rows[0] || null;
            if (!initialLearner) {
              const { data: lid } = await this.supabase.rpc('ensure_my_learner', { p_name: learnerName || displayName, p_grade: assignedPath, p_diff: diff });
              const again = await this.getLearners(user.id);
              initialLearner = again.find(l => l.id === lid) || again[0] || null;
            }
          }

          this.currentUser = {
            id: user.id,
            email: user.email,
            role,
            isAdmin: role === 'admin',
            isTestAccount: isTest,
            displayName
          };
          if (initialLearner) this.setActiveLearner(initialLearner);
          return { user: this.currentUser, learner: initialLearner, requiresEmailConfirmation: !authData.session };
        } else {

          const accounts = this._getLocalAccounts();
          if (accounts.some(a => a.email === email)) {
            throw new Error('An account with this email already exists on this device.');
          }
          const pwHash = await sha256(password);
          const newUserId = 'usr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
          const newUser = {
            id: newUserId,
            email,
            passwordHash: pwHash,
            role,
            isAdmin: role === 'admin',
            isTestAccount: isTest,
            displayName,
            createdAt: new Date().toISOString()
          };
          accounts.push(newUser);
          localStorage.setItem('tlp-local-accounts', JSON.stringify(accounts));

          let initialLearner = null;
          if (role === 'learner') {
            const lName = (learnerName || '').trim() || displayName || 'Student';
            initialLearner = this._createLocalLearner({
              userId: newUserId,
              parentUserId: null,
              name: lName,
              gradeRange: gradeRange || 'g710',
              assignedPath,
              currentDiff: diff,
              isTest
            });
          }

          this.currentUser = { id: newUserId, email, role, isAdmin: role === 'admin', isTestAccount: isTest, displayName };
          this._localSessionStore().setItem('tlp-local-session-user', JSON.stringify(this.currentUser));
          if (initialLearner) this.setActiveLearner(initialLearner);
          return { user: this.currentUser, learner: initialLearner, requiresEmailConfirmation: false };
        }
      } finally {
        this.isProcessingAction = false;
      }
    }

    async loginUser({ email, password }) {
      if (this.isProcessingAction) throw new Error('An action is already in progress.');
      this.isProcessingAction = true;

      try {
        await this.init();
        email = (email || '').trim().toLowerCase();
        if (!email || !password) throw new Error('Please provide both email and password.');

        if (this.isCloudConfigured()) {
          let cloudSuccess = false;
          let cloudError = null;
          try {
            const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
            if (error) {
              cloudError = error;
            } else if (data && data.user) {
              await this._loadCloudUser(data.user);
              cloudSuccess = true;
            }
          } catch (e) {
            cloudError = e;
          }

          if (cloudSuccess) {
            return { user: this.currentUser, learner: this.activeLearner };
          }



          const accounts = this._getLocalAccounts();
          const pwHash = await sha256(password);
          const matched = accounts.find(a => a.email === email && a.passwordHash === pwHash);
          if (matched) {
            this.currentUser = {
              id: matched.id,
              email: matched.email,
              role: matched.role || 'learner',
              isAdmin: Boolean(matched.isAdmin || matched.role === 'admin'),
              isTestAccount: Boolean(matched.isTestAccount),
              displayName: matched.displayName || matched.email.split('@')[0]
            };
            this._localSessionStore().setItem('tlp-local-session-user', JSON.stringify(this.currentUser));
            const learners = this._getLocalLearners(this.currentUser.id);
            this.setActiveLearner(learners[0] || null);
            return { user: this.currentUser, learner: this.activeLearner };
          }

          if (cloudError) throw cloudError;
          throw new Error('Login failed. Please check credentials.');
        } else {
          const accounts = this._getLocalAccounts();
          const pwHash = await sha256(password);
          const matched = accounts.find(a => a.email === email && a.passwordHash === pwHash);
          if (!matched) {
            throw new Error('Invalid email or password.');
          }
          this.currentUser = {
            id: matched.id,
            email: matched.email,
            role: matched.role || 'learner',
            isAdmin: Boolean(matched.isAdmin || matched.role === 'admin'),
            isTestAccount: Boolean(matched.isTestAccount),
            displayName: matched.displayName || matched.email.split('@')[0]
          };
          this._localSessionStore().setItem('tlp-local-session-user', JSON.stringify(this.currentUser));
          const learners = this._getLocalLearners(this.currentUser.id);
          this.activeLearner = learners[0] || null;
          if (this.activeLearner) this.setActiveLearner(this.activeLearner);
          return { user: this.currentUser, learner: this.activeLearner };
        }
      } finally {
        this.isProcessingAction = false;
      }
    }

    async logoutUser() {
      if (this.isCloudConfigured() && this.supabase) {
        try { await this.supabase.auth.signOut(); } catch (e) {}
      }
      this.currentUser = null;
      const hadLearner = !!this.activeLearner;
      this.setActiveLearner(null);
      try {
        localStorage.removeItem('tlp-local-session-user');
        sessionStorage.removeItem('tlp-local-session-user');
        localStorage.removeItem('tlp-active-learner-id');
      } catch (e) {}
      if (!hadLearner) this._authChanged();
      return true;
    }













    async requestPasswordReset(email) {
      await this.init();
      email = (email || '').trim().toLowerCase();
      if (!email) throw new Error('Please enter the email address for your account.');
      if (!this.isCloudConfigured()) throw new Error('The online service is not configured, so password reset is unavailable.');
      const redirectTo = window.location.origin + window.location.pathname;
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      return true;
    }

    async updatePassword(newPassword) {
      await this.init();
      if (!newPassword || newPassword.length < 6) throw new Error('Use a password of at least 6 characters.');
      if (!this.isCloudConfigured()) throw new Error('The online service is not configured, so the password cannot be changed.');
      const { data, error } = await this.supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return data;
    }




    async getLearners(userId) {
      userId = userId || (this.currentUser && this.currentUser.id);
      if (!userId) return [];

      if (this.isCloudConfigured()) {
        try {
          const { data, error } = await this.supabase
            .from('learners')
            .select('*')
            .or(`user_id.eq.${userId},parent_user_id.eq.${userId}`)
            .order('created_at', { ascending: true });
          if (!error && Array.isArray(data)) return data;
        } catch (e) {
          console.warn('[TLP Auth] Could not fetch learners from cloud:', e);
        }
      }
      return this._getLocalLearners(userId);
    }

    async getLearnerById(learnerId) {
      if (!learnerId || learnerId === 'default') return this.getActiveLearner();
      const all = await this.getLearners();
      return all.find(l => l.id === learnerId) || null;
    }

    async createLearnerForParent({ parentUserId, name, gradeRange, currentDiff }) {
      if (this.isProcessingAction) throw new Error('An action is currently processing.');
      this.isProcessingAction = true;

      try {
        parentUserId = parentUserId || (this.currentUser && this.currentUser.id);
        if (!parentUserId) throw new Error('Must be logged in to create a learner profile.');
        name = (name || '').trim();
        if (!name) throw new Error('Learner profile must have a name.');

        const assignedPath = this.resolvePathFromGrade(gradeRange);
        if (!assignedPath) throw new Error('Please select a valid school-grade range.');
        const diff = ['beg', 'int', 'pro'].includes(currentDiff) ? currentDiff : 'int';
        const isTest = Boolean(this.currentUser && this.currentUser.isTestAccount);

        if (this.isCloudConfigured()) {
          const { data, error } = await this.supabase
            .from('learners')
            .insert({
              user_id: parentUserId,
              parent_user_id: parentUserId,
              name,
              grade_range: gradeRange,
              assigned_path: assignedPath,
              current_diff: diff,
              is_test: isTest
            })
            .select()
            .single();
          if (error) throw error;
          return data;
        } else {
          return this._createLocalLearner({
            userId: parentUserId,
            parentUserId,
            name,
            gradeRange,
            assignedPath,
            currentDiff: diff,
            isTest
          });
        }
      } finally {
        this.isProcessingAction = false;
      }
    }

    async updateLearnerProfile(learnerId, updates) {
      if (this.isProcessingAction) throw new Error('An action is currently processing.');
      this.isProcessingAction = true;

      try {
        if (updates.gradeRange) {
          updates.assignedPath = this.resolvePathFromGrade(updates.gradeRange) || updates.assignedPath;
        }

        if (this.isCloudConfigured()) {
          const updateObj = {};
          if (updates.name) updateObj.name = updates.name;
          if (updates.gradeRange) updateObj.grade_range = updates.gradeRange;
          if (updates.assignedPath) updateObj.assigned_path = updates.assignedPath;
          if (updates.currentDiff) updateObj.current_diff = updates.currentDiff;

          const { data, error } = await this.supabase
            .from('learners')
            .update(updateObj)
            .eq('id', learnerId)
            .select()
            .single();
          if (error) throw error;
          if (this.activeLearner && this.activeLearner.id === learnerId) {
            this.setActiveLearner(data);
          }
          return data;
        } else {
          const list = this._getLocalLearners();
          const idx = list.findIndex(l => l.id === learnerId);
          if (idx >= 0) {
            Object.assign(list[idx], {
              name: updates.name || list[idx].name,
              gradeRange: updates.gradeRange || list[idx].gradeRange,
              grade_range: updates.gradeRange || list[idx].grade_range,
              assignedPath: updates.assignedPath || list[idx].assignedPath,
              assigned_path: updates.assignedPath || list[idx].assigned_path,
              currentDiff: updates.currentDiff || list[idx].currentDiff,
              current_diff: updates.currentDiff || list[idx].current_diff,
              updatedAt: new Date().toISOString()
            });
            localStorage.setItem('tlp-local-learners', JSON.stringify(list));
            if (this.activeLearner && this.activeLearner.id === learnerId) {
              this.setActiveLearner(list[idx]);
            }
            return list[idx];
          }
          throw new Error('Learner profile not found.');
        }
      } finally {
        this.isProcessingAction = false;
      }
    }




    buildSaveKey(userId, learnerId, path, diff, itemKey) {
      const u = userId || 'guest';
      const l = learnerId || 'default';
      const p = path || 'g710';
      const d = diff || 'int';
      return `tlp-v2@${u}@${l}@${p}@${d}@${itemKey}`;
    }

    getActiveSaveKey(itemKey, pathOverride, diffOverride) {
      const u = this.currentUser ? this.currentUser.id : 'guest';
      const l = this.activeLearner ? this.activeLearner.id : 'default';
      const p = pathOverride || (this.activeLearner && (this.activeLearner.assigned_path || this.activeLearner.assignedPath)) || localStorage.getItem('tlp-path') || 'g710';
      const d = diffOverride || (this.activeLearner && (this.activeLearner.current_diff || this.activeLearner.currentDiff)) || localStorage.getItem('tlp-diff') || 'int';
      return this.buildSaveKey(u, l, p, d, itemKey);
    }

    readIsolatedItem(itemKey, path, diff) {
      const k = this.getActiveSaveKey(itemKey, path, diff);
      try {
        return localStorage.getItem(k);
      } catch (e) {
        return null;
      }
    }

    writeIsolatedItem(itemKey, val, path, diff) {
      const k = this.getActiveSaveKey(itemKey, path, diff);
      try {
        localStorage.setItem(k, val);
      } catch (e) {}
    }

    removeIsolatedItem(itemKey, path, diff) {
      const k = this.getActiveSaveKey(itemKey, path, diff);
      try {
        localStorage.removeItem(k);
      } catch (e) {}
    }


    async getProgressBundle(learnerId, path, diff) {
      const u = this.currentUser ? this.currentUser.id : 'guest';
      const l = learnerId || (this.activeLearner ? this.activeLearner.id : 'default');
      const p = path || 'g710';
      const d = diff || 'int';


      if (this.isCloudConfigured() && u !== 'guest' && l !== 'default') {
        try {
          const recId = `${l}:${p}:${d}`;
          const { data } = await this.supabase
            .from('progress_records')
            .select('*')
            .eq('id', recId)
            .maybeSingle();
          if (data) {
            return {
              prog: data.prog || {},
              ach: data.ach || [],
              badges: data.badges || [],
              draft: data.draft || null,
              bossState: data.boss_state || null,
              updatedAt: data.updated_at,
              isCloudSynced: true
            };
          }
        } catch (e) {
          console.warn('[TLP Auth] Cloud progress fetch failed:', e);
        }
      }


      try {
        const progStr = localStorage.getItem(this.buildSaveKey(u, l, p, d, 'prog')) || '{}';
        const achStr = localStorage.getItem(this.buildSaveKey(u, l, p, d, 'ach')) || '[]';
        const badStr = localStorage.getItem(this.buildSaveKey(u, l, p, d, 'badges')) || '[]';
        const draftStr = localStorage.getItem(this.buildSaveKey(u, l, p, d, 'draft')) || 'null';
        const bossStr = localStorage.getItem(this.buildSaveKey(u, l, p, d, 'boss')) || 'null';
        return {
          prog: JSON.parse(progStr),
          ach: JSON.parse(achStr),
          badges: JSON.parse(badStr),
          draft: JSON.parse(draftStr),
          bossState: JSON.parse(bossStr),
          updatedAt: new Date().toISOString(),
          isCloudSynced: false
        };
      } catch (e) {
        return { prog: {}, ach: [], badges: [], draft: null, bossState: null, isCloudSynced: false };
      }
    }

    async saveProgressBundle(learnerId, path, diff, bundle) {
      const u = this.currentUser ? this.currentUser.id : 'guest';
      const l = learnerId || (this.activeLearner ? this.activeLearner.id : 'default');
      const p = path || 'g710';
      const d = diff || 'int';
      const isTest = Boolean(this.currentUser && this.currentUser.isTestAccount);


      try {
        if (bundle.prog) localStorage.setItem(this.buildSaveKey(u, l, p, d, 'prog'), JSON.stringify(bundle.prog));
        if (bundle.ach) localStorage.setItem(this.buildSaveKey(u, l, p, d, 'ach'), JSON.stringify(bundle.ach));
        if (bundle.badges) localStorage.setItem(this.buildSaveKey(u, l, p, d, 'badges'), JSON.stringify(bundle.badges));
        if (bundle.draft !== undefined) localStorage.setItem(this.buildSaveKey(u, l, p, d, 'draft'), JSON.stringify(bundle.draft));
        if (bundle.bossState !== undefined) localStorage.setItem(this.buildSaveKey(u, l, p, d, 'boss'), JSON.stringify(bundle.bossState));
      } catch (e) {}


      if (this.isCloudConfigured() && u !== 'guest' && l !== 'default') {
        try {
          const recId = `${l}:${p}:${d}`;
          await this.supabase.from('progress_records').upsert({
            id: recId,
            learner_id: l,
            user_id: u,
            learning_path: p,
            game_diff: d,
            prog: bundle.prog || {},
            ach: bundle.ach || [],
            badges: bundle.badges || [],
            draft: bundle.draft || null,
            boss_state: bundle.bossState || null,
            is_test: isTest,
            updated_at: new Date().toISOString()
          });
        } catch (e) {
          console.warn('[TLP Auth] Cloud progress upsert failed:', e);
        }
      }
    }




    async recordLeaderboardScore({ learnerId, displayName, learningPath, gameDiff, score, stars, chaptersCleared }) {
      const u = this.currentUser ? this.currentUser.id : null;
      const l = learnerId || (this.activeLearner ? this.activeLearner.id : null);
      if (!l || l === 'default' || !u) return;

      const path = learningPath || 'g710';
      const diff = gameDiff || 'int';
      const alias = (displayName || (this.activeLearner && this.activeLearner.name) || 'Pilot').trim().slice(0, 32);
      const isTest = Boolean(this.currentUser && this.currentUser.isTestAccount);

      if (this.isCloudConfigured()) {
        try {


          const { error: lbErr } = await this.supabase.rpc('submit_leaderboard_score', {
            p_learner_id: l,
            p_path: path,
            p_diff: diff,
            p_display_name: alias,
            p_chapters: chaptersCleared || 0
          });
          if (lbErr) throw lbErr;
        } catch (e) {
          console.warn('[TLP Auth] Leaderboard record sync failed:', e);
        }
      }


      try {
        const lb = this._getLocalLeaderboard();
        const existingIdx = lb.findIndex(e => e.learner_id === l && e.learning_path === path && e.game_diff === diff);
        const record = {
          id: existingIdx >= 0 ? lb[existingIdx].id : ('lb_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)),
          learner_id: l,
          user_id: u,
          display_name: alias,
          learning_path: path,
          game_diff: diff,
          total_score: score || 0,
          total_stars: stars || 0,
          chapters_cleared: chaptersCleared || 0,
          is_test: isTest,
          updated_at: new Date().toISOString()
        };
        if (existingIdx >= 0) {
          lb[existingIdx] = record;
        } else {
          lb.push(record);
        }
        localStorage.setItem('tlp-local-leaderboard', JSON.stringify(lb));
      } catch (e) {}
    }

    async _probeLeaderboardAvatar() {
      if (this._leaderboardAvatarAvailable !== null) return this._leaderboardAvatarAvailable;
      if (!this._leaderboardAvatarProbe) {
        this._leaderboardAvatarProbe = (async () => {
          const { data, error } = await this.supabase.from('public_leaderboard').select('*').limit(1);
          if (!error && data && data[0]) this._leaderboardAvatarAvailable = Object.prototype.hasOwnProperty.call(data[0], 'avatar');
          else if (error && ['42703', '42501'].includes(error.code)) this._leaderboardAvatarAvailable = false;
          return this._leaderboardAvatarAvailable;
        })().catch(() => null).finally(() => { this._leaderboardAvatarProbe = null; });
      }
      return this._leaderboardAvatarProbe;
    }

    async _queryPublicLeaderboard(select, configure) {
      if (select.split(',').some((field) => field.trim() === 'avatar') && this._leaderboardAvatarAvailable === null) await this._probeLeaderboardAvatar();
      const fields = () => select.split(',').map((field) => field.trim()).filter((field) => field && !(this._leaderboardAvatarAvailable === false && field === 'avatar')).join(', ');
      const run = () => {
        let query = this.supabase.from('public_leaderboard').select(fields());
        return configure ? configure(query) : query;
      };
      const result = await run();
      if (!result.error) {
        if (fields().split(',').some((field) => field.trim() === 'avatar')) this._leaderboardAvatarAvailable = true;
        return result;
      }
      if (select.split(',').some((field) => field.trim() === 'avatar') && ((result.error.code === '42703' && /avatar/i.test(result.error.message || '')) || result.error.code === '42501')) {
        this._leaderboardAvatarAvailable = false;
        return run();
      }
      return result;
    }

    async getPublicPlayer(playerId) {
      await this.init();
      if (!this.isCloudConfigured() || !playerId) return null;
      const { data, error } = await this._queryPublicLeaderboard('player_id, display_name, avatar', (query) => query.eq('player_id', playerId).limit(1));
      if (error) throw new Error(error.message);
      return data && data[0] || null;
    }

    async getLeaderboardEntries({ path, diff, limit = 50 } = {}) {
      path = path || 'g710';
      diff = diff || 'int';

      if (this.isCloudConfigured()) {
        try {
          const { data, error } = await this._queryPublicLeaderboard(
            'id, display_name, avatar, learning_path, game_diff, total_score, total_stars, chapters_cleared, updated_at',
            (query) => query.eq('learning_path', path).eq('game_diff', diff)
              .order('total_score', { ascending: false }).order('total_stars', { ascending: false })
              .order('updated_at', { ascending: true }).limit(limit)
          );

          if (!error && Array.isArray(data)) return data;
        } catch (e) {
          console.warn('[TLP Auth] Cloud leaderboard fetch failed, falling back:', e);
        }
      }


      const lb = this._getLocalLeaderboard();
      return lb
        .filter(e => e.learning_path === path && e.game_diff === diff && !e.is_test)
        .sort((a, b) => {
          if (b.total_score !== a.total_score) return b.total_score - a.total_score;
          if (b.total_stars !== a.total_stars) return b.total_stars - a.total_stars;
          return new Date(a.updated_at) - new Date(b.updated_at);
        })
        .slice(0, limit);
    }


    async getAdminLeaderboardEntries() {
      if (!this.isCurrentUserAdmin()) throw new Error('Access Denied: Admin authorization required.');

      if (this.isCloudConfigured()) {
        try {
          const { data, error } = await this.supabase
            .from('leaderboard_entries')
            .select('*')
            .order('is_test', { ascending: true })
            .order('total_score', { ascending: false })
            .order('updated_at', { ascending: true });
          if (!error && Array.isArray(data)) return data;
        } catch (e) {
          console.warn('[TLP Auth] Cloud admin leaderboard fetch failed:', e);
        }
      }

      return this._getLocalLeaderboard().sort((a, b) => (b.total_score || 0) - (a.total_score || 0));
    }

    async deleteLeaderboardEntry(id) {
      if (!this.isCurrentUserAdmin()) throw new Error('Access Denied: Admin authorization required.');

      if (this.isCloudConfigured()) {
        const { error } = await this.supabase.from('leaderboard_entries').delete().eq('id', id);
        if (error) throw error;
      }

      const lb = this._getLocalLeaderboard().filter(e => e.id !== id);
      localStorage.setItem('tlp-local-leaderboard', JSON.stringify(lb));
      return true;
    }




    async submitBugReport({ title, description, pageFeature, stepsToReproduce, expectedVsActual, attachmentPath, attachmentType }) {
      if (this.isProcessingAction) throw new Error('An action is currently processing.');
      this.isProcessingAction = true;

      try {
        title = (title || '').trim();
        description = (description || '').trim();
        pageFeature = (pageFeature || 'General').trim();
        if (!title || !description) throw new Error('Please provide both a bug title and description.');

        const u = this.currentUser ? this.currentUser.id : null;
        const browserInfo = typeof navigator !== 'undefined' ? `${navigator.userAgent} (${window.innerWidth}x${window.innerHeight})` : 'Unknown';

        if (this.isCloudConfigured()) {
          const bugId = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : undefined;
          const { error } = await this.supabase
            .from('bug_reports')
            .insert({
              id: bugId,
              attachment_path: attachmentPath || null,
              attachment_type: attachmentType || null,
              user_id: u,
              title,
              description,
              page_feature: pageFeature,
              steps_to_reproduce: stepsToReproduce || null,
              expected_vs_actual: expectedVsActual || null,
              browser_info: browserInfo,
              status: 'new'
            });
          if (error) throw error;
          return { success: true, id: bugId || null, status: 'new', isCloud: true };
        } else {
          const bugs = this._getLocalBugs();
          const newBug = {
            id: 'bug_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            user_id: u,
            title,
            description,
            page_feature: pageFeature,
            steps_to_reproduce: stepsToReproduce || null,
            expected_vs_actual: expectedVsActual || null,
            browser_info: browserInfo,
            status: 'new',
            created_at: new Date().toISOString()
          };
          bugs.unshift(newBug);
          localStorage.setItem('tlp-local-bugs', JSON.stringify(bugs));
          return { success: true, id: newBug.id, status: newBug.status, isCloud: false };
        }
      } finally {
        this.isProcessingAction = false;
      }
    }





    async loginWithPlayerId({ playerId, password }) {
      const pid = String(playerId || '').trim().toUpperCase();
      if (!/^TLP-[0-9A-Z]{6,10}$/i.test(pid)) throw new Error('Enter your Player ID exactly as given, for example TLP-12345678.');
      try {
        return await this.loginUser({ email: pid.toLowerCase() + '@learner.lostprotocol.app', password });
      } catch (e) {
        throw new Error('That Player ID and password do not match.');
      }
    }

    async _invoke(fn, body) {
      await this.init();
      if (!this.isCloudConfigured()) throw new Error('This needs the online version of the site.');
      const r = await this.supabase.functions.invoke(fn, { body });
      if (r.error) {
        let detail = '';
        try { const j = await r.error.context.json(); detail = j && (j.error || j.detail) || ''; } catch (e) {}
        throw new Error(detail || r.error.message || 'Request failed');
      }
      if (r.data && r.data.error) throw new Error(r.data.detail || r.data.error);
      return r.data;
    }

    async createLearnerViaFunction({ name, gradeRange, startDiff, password }) {
      if (this.isCloudConfigured()) {
        try {
          const d = await this._invoke('learner-admin', { action: 'createLearner', name, gradeRange, startDiff, password });
          return d;
        } catch (err) {
          if (!/network|fetch|failed to send|requested function|not found|not_educator/i.test(err.message)) {
            throw err;
          }
        }
      }

      const u = this.getCurrentUser();
      const assignedPath = this.resolvePathFromGrade(gradeRange) || 'g710';
      const lrn = this._createLocalLearner({
        userId: u ? u.id : 'parent_guest',
        parentUserId: u ? u.id : 'parent_guest',
        name,
        gradeRange,
        assignedPath,
        currentDiff: startDiff,
        isTest: Boolean(u && u.isTestAccount)
      });
      if (password && lrn.player_id) {
        const accounts = this._getLocalAccounts();
        accounts.push({
          id: lrn.userId,
          email: lrn.player_id.toLowerCase() + '@learner.lostprotocol.app',
          playerId: lrn.player_id,
          passwordHash: await sha256(password),
          role: 'learner',
          displayName: name,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('tlp-local-accounts', JSON.stringify(accounts));
      }
      return { playerId: lrn.player_id, learnerId: lrn.id };
    }







    async createLearnerSignInQr(learnerId) {
      return this._invoke('learner-qr', { action: 'create', learnerId });
    }

    async getLearnerSignInStatus(token) {
      return this._invoke('learner-qr', { action: 'status', token });
    }

    async redeemLearnerSignInToken(token) {
      const r = await this._invoke('learner-qr', { action: 'redeem', token });
      if (!r || !r.magicToken) throw new Error('expired');
      return r;
    }



    async completeLearnerSignIn(magicToken, rememberOn) {
      await this.init();
      if (!this.isCloudConfigured()) throw new Error('This needs the online version of the site.');
      try { localStorage.setItem('tlp-remember', rememberOn ? '1' : '0'); } catch (e) {}
      const { data, error } = await this.supabase.auth.verifyOtp({ token_hash: magicToken, type: 'magiclink' });
      if (error) throw error;
      const user = data && data.session && data.session.user;
      if (!user) throw new Error('signin_failed');
      await this._loadCloudUser(user);
      return this.currentUser;
    }

    async resetLearnerPassword(learnerId, password) {
      if (this.isCloudConfigured()) {
        try {
          return await this._invoke('learner-admin', { action: 'resetPassword', learnerId, password });
        } catch (err) {
          if (!/network|fetch|failed to send|requested function|not found/i.test(err.message)) throw err;
        }
      }
      const lrn = (await this.getLearners()).find(l => l.id === learnerId);
      if (lrn && lrn.player_id) {
        const accounts = this._getLocalAccounts();
        const acct = accounts.find(a => (a.playerId === lrn.player_id || (a.email && a.email.startsWith(lrn.player_id.toLowerCase()))));
        if (acct) {
          acct.passwordHash = await sha256(password);
          localStorage.setItem('tlp-local-accounts', JSON.stringify(accounts));
          return { ok: true };
        }
      }
      return { ok: true };
    }

    async _rpc(name, args) {
      await this.init();
      if (!this.isCloudConfigured()) throw new Error('This needs the online version of the site.');
      const { data, error } = await this.supabase.rpc(name, args || {});
      if (error) throw new Error(error.message || 'Request failed');
      return data;
    }

    async deleteLearnerAccount(learnerId, confirmText) {
      if (this.isCloudConfigured()) {
        try {
          return await this._rpc('educator_delete_learner', { p_learner: learnerId, p_confirm: confirmText });
        } catch(e) {
          if (!/network|fetch|failed to send|requested function|not found/i.test(e.message)) throw e;
        }
      }
      const list = this._getLocalLearners().filter(l => l.id !== learnerId);
      localStorage.setItem('tlp-local-learners', JSON.stringify(list));
      return { ok: true, deleted_learner: learnerId };
    }
    async deleteMyAccount(confirmText) {
      if (this.isCloudConfigured()) {
        try {
          await this._rpc('delete_my_account', { p_confirm: confirmText });
        } catch(e) {
          if (!/network|fetch|failed to send|requested function|not found/i.test(e.message)) throw e;
        }
      }
      const u = this.getCurrentUser();
      if (u) {
        const accts = this._getLocalAccounts().filter(a => a.id !== u.id);
        localStorage.setItem('tlp-local-accounts', JSON.stringify(accts));
      }
      await this.logoutUser();
      return true;
    }
    async switchDifficulty(learnerId, newDiff, confirmText) {
      if (this.isCloudConfigured()) {
        try {
          return await this._rpc('switch_difficulty', { p_learner: learnerId, p_new: newDiff, p_confirm: confirmText || null });
        } catch(e) {
          if (!/network|fetch|failed to send|requested function|not found/i.test(e.message)) throw e;
        }
      }
      await this.updateLearnerProfile(learnerId, { currentDiff: newDiff });
      return { ok: true, new_diff: newDiff };
    }
    async markDifficultyCompleted(learnerId, diff) {
      if (this.isCloudConfigured()) {
        try {
          return await this._rpc('mark_difficulty_completed', { p_learner: learnerId, p_diff: diff });
        } catch(e) {
          if (!/network|fetch|failed to send|requested function|not found/i.test(e.message)) throw e;
        }
      }
      const l = await this.getLearnerById(learnerId);
      if (l) {
        const comp = l.completed_diffs || l.completedDiffs || [];
        if (!comp.includes(diff)) comp.push(diff);
        l.completed_diffs = comp;
        l.completedDiffs = comp;
        await this.updateLearnerProfile(learnerId, { completedDiffs: comp });
      }
      return { ok: true };
    }

    async getProgressSummaries(learnerIds) {
      if (!learnerIds || !learnerIds.length) return [];
      if (this.isCloudConfigured() && this.supabase) {
        try {
          const { data, error } = await this.supabase.from('progress_records')
            .select('learner_id, learning_path, game_diff, prog, badges, updated_at').in('learner_id', learnerIds);
          if (!error && Array.isArray(data)) return data;
        } catch (e) {
          console.warn('[TLP Auth] Cloud getProgressSummaries failed:', e);
        }
      }


      const results = [];
      try {
        if (typeof localStorage !== 'undefined') {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('tlp_save_') && key.endsWith('_prog')) {

              const parts = key.split('_');
              const lId = parts[3];
              if (learnerIds.includes(lId)) {
                const prog = JSON.parse(localStorage.getItem(key) || '{}');
                results.push({
                  learner_id: lId,
                  learning_path: parts[4] || 'g710',
                  game_diff: parts[5] || 'int',
                  prog: prog,
                  badges: [],
                  updated_at: new Date().toISOString()
                });
              }
            }
          }
        }
      } catch (e) {}
      return results;
    }



    _cleanSearch(v) {
      return String(v == null ? '' : v).replace(/[%_,()*"'\\]/g, ' ').trim().slice(0, 40);
    }

    async getPublicLeaderboardPage({ path, diff, offset = 0, limit = 20, search = '', today = false, week = false }) {
      await this.init();
      if (!this.isCloudConfigured()) return { rows: [], hasMore: false };
      const { data, error } = await this._queryPublicLeaderboard(
        'player_id, display_name, avatar, total_score, total_stars, chapters_cleared, badges, updated_at',
        (q) => {
          q = q.eq('learning_path', path).eq('game_diff', diff);
          const s = this._cleanSearch(search);
          if (s) q = q.or('display_name.ilike.%' + s + '%,player_id.ilike.%' + s + '%');
          if (today) q = q.gte('updated_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());
          if (week) {
            (d => { d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); q = q.gte('updated_at', d.toISOString()); })(new Date());
          }
          return q.order('total_score', { ascending: false }).order('total_stars', { ascending: false })
            .order('updated_at', { ascending: true }).range(offset, offset + limit);
        }
      );
      if (error) throw new Error(error.message);
      const rows = data || [];
      return { rows: rows.slice(0, limit), hasMore: rows.length > limit };
    }




    async saveAvatar(learnerId, avatar) {
      if (!this.isCloudConfigured() || !this.supabase) return null;
      const { data, error } = await this.supabase.rpc('save_avatar', { p_learner_id: learnerId, p_avatar: avatar });
      if (error) throw new Error(error.message);
      return data;
    }
    async getLifeline(learnerId) {
      if (!this.isCloudConfigured() || !this.supabase) return null;
      const { data, error } = await this.supabase.rpc('player_lifeline', { p_learner_id: learnerId });
      if (error) throw new Error(error.message);
      return data;
    }
    async drainLifeline(learnerId) {
      if (!this.isCloudConfigured() || !this.supabase) return null;
      const { data, error } = await this.supabase.rpc('player_drain_lifeline', { p_learner_id: learnerId });
      if (error) throw new Error(error.message);
      return data;
    }
    async adminLifelines() {
      if (!this.isCloudConfigured() || !this.supabase) return [];
      const { data, error } = await this.supabase.rpc('admin_lifelines');
      if (error) throw new Error(error.message);
      return data || [];
    }
    async adminRefreshLifeline(learnerId) {
      if (!this.isCloudConfigured() || !this.supabase) return null;
      const { data, error } = await this.supabase.rpc('admin_refresh_lifeline', { p_learner_id: learnerId });
      if (error) throw new Error(error.message);
      return data;
    }



    async getLeaderboardRank({ path, diff, playerId }) {
      await this.init();
      if (!this.isCloudConfigured() || !playerId) return null;
      const { data: row, error } = await this._queryPublicLeaderboard(
        'player_id, display_name, avatar, total_score, total_stars',
        (query) => query.eq('learning_path', path).eq('game_diff', diff).eq('player_id', playerId).maybeSingle()
      );
      if (error) throw new Error(error.message);
      if (!row) return null;
      const base = () => this.supabase.from('public_leaderboard')
        .select('*', { count: 'exact', head: true }).eq('learning_path', path).eq('game_diff', diff);
      const { count: above } = await base().gt('total_score', row.total_score);
      const { count: sameScore } = await base().eq('total_score', row.total_score).gt('total_stars', row.total_stars);
      return { rank: (above || 0) + (sameScore || 0) + 1, row };
    }

    async uploadBugAttachment(file) {
      await this.init();
      if (!this.isCloudConfigured() || !this.currentUser) throw new Error('Sign in to attach a picture or video.');
      const okTypes = ['image/png', 'image/jpeg', 'image/webp', 'video/mp4', 'video/webm'];
      if (!okTypes.includes(file.type)) throw new Error('Attach a PNG, JPG, WEBP, MP4 or WEBM file.');
      const isVideo = file.type.startsWith('video/');
      if (file.size > (isVideo ? 20 : 5) * 1024 * 1024) throw new Error(isVideo ? 'Videos can be up to 20 MB.' : 'Pictures can be up to 5 MB.');
      const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
      const path = this.currentUser.id + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;
      const { error } = await this.supabase.storage.from('bug-attachments').upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw new Error(error.message);
      return { path, type: file.type };
    }

    async getAttachmentUrl(path) {
      const { data, error } = await this.supabase.storage.from('bug-attachments').createSignedUrl(path, 600);
      if (error) throw new Error(error.message);
      return data.signedUrl;
    }

    async saveFeedbackCopy(f) {
      try {
        await this.init();
        if (!this.isCloudConfigured()) return;
        await this.supabase.from('feedback_entries').insert({
          user_id: this.currentUser ? this.currentUser.id : null,
          rating: f.rating || null, tags: String(f.tags || '').slice(0, 200), message: String(f.message || '').slice(0, 800),
          name: String(f.name || '').slice(0, 40), age_group: String(f.ageGroup || '').slice(0, 40),
          level: String(f.level || '').slice(0, 40), page: String(f.page || '').slice(0, 40)
        });
      } catch (e) {                                                                     }
    }

    async getAllFeedback() {
      if (this.isCloudConfigured() && this.supabase) {
        try {
          const { data, error } = await this.supabase.from('feedback_entries').select('*').order('created_at', { ascending: false }).limit(200);
          if (!error && Array.isArray(data)) return data;
        } catch (e) {
          console.warn('[TLP Auth] Cloud feedback fetch failed:', e);
        }
      }
      try {
        return JSON.parse(localStorage.getItem('tlp-local-feedback') || '[]');
      } catch (e) {
        return [];
      }
    }

    async getBugReports() {
      if (this.isCloudConfigured()) {
        try {
          const { data, error } = await this.supabase
            .from('bug_reports')
            .select('*')
            .order('created_at', { ascending: false });
          if (!error && Array.isArray(data)) return data;
        } catch (e) {
          console.warn('[TLP Auth] Cloud bug reports fetch failed:', e);
        }
      }
      return this._getLocalBugs();
    }

    async updateBugReportStatus(id, newStatus, adminNotes) {
      if (!this.isCurrentUserAdmin()) throw new Error('Access Denied: Only administrators can update bug reports.');
      if (!['new', 'investigating', 'fixed', 'closed'].includes(newStatus)) {
        throw new Error('Invalid status. Expected: new, investigating, fixed, or closed.');
      }

      if (this.isCloudConfigured()) {
        const { data, error } = await this.supabase
          .from('bug_reports')
          .update({
            status: newStatus,
            admin_notes: adminNotes || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const bugs = this._getLocalBugs();
        const b = bugs.find(x => x.id === id);
        if (b) {
          b.status = newStatus;
          b.admin_notes = adminNotes || b.admin_notes;
          b.updated_at = new Date().toISOString();
          localStorage.setItem('tlp-local-bugs', JSON.stringify(bugs));
          return b;
        }
        throw new Error('Bug report not found.');
      }
    }




    async runDiagnostics() {
      const diag = {
        timestamp: new Date().toISOString(),
        mode: this.mode,
        isCloud: this.isCloudConfigured(),
        supabaseUrl: (window.TLP_CONFIG && window.TLP_CONFIG.SUPABASE_URL) || 'Not set',
        authStatus: this.currentUser ? `Logged in (${this.currentUser.role})` : 'Anonymous',
        currentUser: this.currentUser,
        activeLearner: this.activeLearner,
        connectivity: 'offline',
        tables: {}
      };

      if (this.isCloudConfigured()) {
        try {
          const t0 = performance.now();
          const { error } = await this.supabase.from('profiles').select('id').limit(1);
          diag.latencyMs = Math.round(performance.now() - t0);
          diag.connectivity = error ? 'error: ' + error.message : 'connected';
        } catch (e) {
          diag.connectivity = 'network_error: ' + e.message;
        }
      } else {
        diag.connectivity = 'local_storage';
      }

      return diag;
    }

    async getAllProfiles() {
      if (!this.isCurrentUserAdmin()) throw new Error('Access Denied: Admin authorization required.');

      if (this.isCloudConfigured()) {
        try {
          const { data, error } = await this.supabase.from('profiles').select('*').order('created_at', { ascending: false });
          if (!error && Array.isArray(data)) return data;
        } catch (e) {
          console.warn('[TLP Auth] Cloud profiles fetch error:', e);
        }
      }
      return this._getLocalAccounts();
    }

    async getAllLearners() {
      if (!this.isCurrentUserAdmin()) throw new Error('Access Denied: Admin authorization required.');

      if (this.isCloudConfigured()) {
        try {
          const { data, error } = await this.supabase.from('learners').select('*').order('created_at', { ascending: false });
          if (!error && Array.isArray(data)) return data;
        } catch (e) {
          console.warn('[TLP Auth] Cloud all learners fetch error:', e);
        }
      }
      return this._getLocalLearners();
    }


    async previewTestData() {
      if (!this.isCurrentUserAdmin()) throw new Error('Access Denied: Admin authorization required.');

      if (this.isCloudConfigured()) {
        try {
          const { data, error } = await this.supabase.rpc('preview_test_data');
          if (!error && data && data.length) {
            return {
              testProfiles: Number(data[0].test_profiles_count || 0),
              testLearners: Number(data[0].test_learners_count || 0),
              testProgress: Number(data[0].test_progress_count || 0),
              testLeaderboard: Number(data[0].test_leaderboard_count || 0)
            };
          }
        } catch (e) {
          console.warn('[TLP Auth] Cloud preview_test_data rpc failed, computing manually:', e);
        }
      }


      const accounts = this._getLocalAccounts().filter(a => a.isTestAccount);
      const learners = this._getLocalLearners().filter(l => l.isTest);
      const lb = this._getLocalLeaderboard().filter(e => e.is_test);
      return {
        testProfiles: accounts.length,
        testLearners: learners.length,
        testProgress: 0,
        testLeaderboard: lb.length
      };
    }


    async purgeTestData() {
      if (!this.isCurrentUserAdmin()) throw new Error('Access Denied: Admin authorization required.');

      if (this.isCloudConfigured()) {
        try {
          const { data, error } = await this.supabase.rpc('purge_test_data');
          if (!error && data) return data;
        } catch (e) {
          console.warn('[TLP Auth] Cloud purge_test_data rpc failed, falling back:', e);
        }
      }


      const accounts = this._getLocalAccounts();
      const learners = this._getLocalLearners();
      const lb = this._getLocalLeaderboard();

      const remainingAccounts = accounts.filter(a => !a.isTestAccount);
      const remainingLearners = learners.filter(l => !l.isTest);
      const remainingLb = lb.filter(e => !e.is_test);

      const deletedLearners = learners.length - remainingLearners.length;
      const deletedLb = lb.length - remainingLb.length;

      localStorage.setItem('tlp-local-accounts', JSON.stringify(remainingAccounts));
      localStorage.setItem('tlp-local-learners', JSON.stringify(remainingLearners));
      localStorage.setItem('tlp-local-leaderboard', JSON.stringify(remainingLb));

      return {
        deleted_leaderboard: deletedLb,
        deleted_progress: 0,
        deleted_learners: deletedLearners,
        purged_at: new Date().toISOString()
      };
    }




    migrateLegacySaves() {
      try {
        const migrationStatus = localStorage.getItem('tlp-migration-status');
        if (migrationStatus) {
          const status = JSON.parse(migrationStatus);
          if (status.migrated) {
            return { status: 'already_migrated', details: status };
          }
        }


        const legacySnapshot = {};
        const legacyPattern = /^tlp-(prog|ach|badges|draft|boss\d*)(@([a-z0-9]+))?$/;
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (legacyPattern.test(k) || ['tlp-path', 'tlp-diff', 'tlp-name'].includes(k))) {
            legacySnapshot[k] = localStorage.getItem(k);
          }
        }

        if (Object.keys(legacySnapshot).length === 0) {
          localStorage.setItem('tlp-migration-status', JSON.stringify({ migrated: true, migratedAt: new Date().toISOString(), empty: true }));
          return { status: 'no_legacy_data' };
        }


        localStorage.setItem('tlp-legacy-backup', JSON.stringify(legacySnapshot));
        localStorage.setItem('tlp-legacy-archive', JSON.stringify({
          archivedAt: new Date().toISOString(),
          keysCount: Object.keys(legacySnapshot).length,
          data: legacySnapshot
        }));


        const legacyPath = legacySnapshot['tlp-path'] || 'g710';
        const u = 'guest';
        const l = 'default';
        const migratedDifficulties = [];

        ['beg', 'int', 'pro'].forEach(d => {
          const progKey = `tlp-prog@${d}`;
          const oldProg = legacySnapshot[progKey] || (legacySnapshot['tlp-diff'] === d ? legacySnapshot['tlp-prog'] : null);
          if (oldProg) {
            try {
              const parsed = JSON.parse(oldProg);
              if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
                localStorage.setItem(this.buildSaveKey(u, l, legacyPath, d, 'prog'), oldProg);
                migratedDifficulties.push(d);
              }
            } catch (e) {}
          }

          const achKey = `tlp-ach@${d}`;
          const oldAch = legacySnapshot[achKey] || (legacySnapshot['tlp-diff'] === d ? legacySnapshot['tlp-ach'] : null);
          if (oldAch) localStorage.setItem(this.buildSaveKey(u, l, legacyPath, d, 'ach'), oldAch);

          const badKey = `tlp-badges@${d}`;
          const oldBad = legacySnapshot[badKey] || (legacySnapshot['tlp-diff'] === d ? legacySnapshot['tlp-badges'] : null);
          if (oldBad) localStorage.setItem(this.buildSaveKey(u, l, legacyPath, d, 'badges'), oldBad);

          const draftKey = `tlp-draft@${d}`;
          const oldDraft = legacySnapshot[draftKey];
          if (oldDraft) localStorage.setItem(this.buildSaveKey(u, l, legacyPath, d, 'draft'), oldDraft);

          const bossKey = `tlp-boss@${d}`;
          const oldBoss = legacySnapshot[bossKey];
          if (oldBoss) localStorage.setItem(this.buildSaveKey(u, l, legacyPath, d, 'boss'), oldBoss);
        });


        const migrationRecord = {
          migrated: true,
          migratedAt: new Date().toISOString(),
          targetPath: legacyPath,
          migratedDifficulties,
          keysArchived: Object.keys(legacySnapshot).length
        };
        localStorage.setItem('tlp-migration-status', JSON.stringify(migrationRecord));

        return { status: 'migrated', details: migrationRecord };
      } catch (err) {
        console.error('[TLP Auth] Legacy migration failed safely:', err);
        return { status: 'error', error: err.message };
      }
    }

    getLegacyArchive() {
      try {
        const raw = localStorage.getItem('tlp-legacy-archive');
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    }

    restoreLegacyProgressToProfile(targetLearnerId, targetPath, targetDiff) {
      const archive = this.getLegacyArchive();
      if (!archive || !archive.data) throw new Error('No archived legacy progress found.');
      const data = archive.data;
      const u = this.currentUser ? this.currentUser.id : 'guest';
      const l = targetLearnerId || (this.activeLearner ? this.activeLearner.id : 'default');
      const p = targetPath || 'g710';
      const d = targetDiff || 'int';

      const prog = data[`tlp-prog@${d}`] || data['tlp-prog'] || '{}';
      const ach = data[`tlp-ach@${d}`] || data['tlp-ach'] || '[]';
      const badges = data[`tlp-badges@${d}`] || data['tlp-badges'] || '[]';

      localStorage.setItem(this.buildSaveKey(u, l, p, d, 'prog'), prog);
      localStorage.setItem(this.buildSaveKey(u, l, p, d, 'ach'), ach);
      localStorage.setItem(this.buildSaveKey(u, l, p, d, 'badges'), badges);

      return { prog: JSON.parse(prog), ach: JSON.parse(ach), badges: JSON.parse(badges) };
    }




    _getLocalAccounts() {
      let accounts = [];
      try {
        accounts = JSON.parse(localStorage.getItem('tlp-local-accounts') || '[]');
      } catch (e) {
        accounts = [];
      }
      if (!Array.isArray(accounts)) accounts = [];


      if (!accounts.some(a => a.email === 'admin@lostprotocol.app')) {
        accounts.push({
          id: 'usr_admin_master',
          email: 'admin@lostprotocol.app',
          passwordHash: '5e46ce2cdb82f8ee2772d7aab8b4821d012bc73eb85cbbc435b626a6a454ba82',
          role: 'admin',
          isAdmin: true,
          isTestAccount: false,
          displayName: 'System Admin',
          createdAt: '2026-01-01T00:00:00.000Z'
        });
        try {
          localStorage.setItem('tlp-local-accounts', JSON.stringify(accounts));
        } catch (e) {}
      }
      return accounts;
    }

    _getLocalLearners(filterUserId) {
      try {
        const all = JSON.parse(localStorage.getItem('tlp-local-learners') || '[]');
        if (filterUserId) {
          return all.filter(l => l.userId === filterUserId || l.parentUserId === filterUserId || l.user_id === filterUserId || l.parent_user_id === filterUserId);
        }
        return all;
      } catch (e) {
        return [];
      }
    }

    _createLocalLearner({ userId, parentUserId, name, gradeRange, assignedPath, currentDiff, isTest }) {
      const list = this._getLocalLearners();
      const chars = '0123456789';
      let pid = 'TLP-';
      for (let i = 0; i < 8; i++) pid += chars[Math.floor(Math.random() * chars.length)];
      const newLearner = {
        id: 'lrn_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        player_id: pid,
        playerId: pid,
        user_id: userId,
        parent_user_id: parentUserId || null,
        userId: userId,
        parentUserId: parentUserId || null,
        name,
        grade_range: gradeRange,
        gradeRange,
        assigned_path: assignedPath,
        assignedPath,
        current_diff: currentDiff || 'int',
        currentDiff: currentDiff || 'int',
        start_diff: currentDiff || 'int',
        completed_diffs: [],
        created_by_educator: Boolean(parentUserId),
        is_test: Boolean(isTest),
        isTest: Boolean(isTest),
        createdAt: new Date().toISOString()
      };
      list.push(newLearner);
      localStorage.setItem('tlp-local-learners', JSON.stringify(list));
      return newLearner;
    }

    _getLocalLeaderboard() {
      try {
        return JSON.parse(localStorage.getItem('tlp-local-leaderboard') || '[]');
      } catch (e) {
        return [];
      }
    }

    _getLocalBugs() {
      try {
        return JSON.parse(localStorage.getItem('tlp-local-bugs') || '[]');
      } catch (e) {
        return [];
      }
    }
  }

  window.TLP_AUTH = new TLPAuthEngine();
  try {
    window.TLP_AUTH.migrateLegacySaves();
  } catch (e) {}

})();
