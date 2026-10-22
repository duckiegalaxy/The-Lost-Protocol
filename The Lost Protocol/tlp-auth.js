// =============================================================================
// THE LOST PROTOCOL — AUTHENTICATION, PROFILE & PROGRESS SYNC ENGINE
// =============================================================================
// Supports:
// 1. Supabase Cloud Backend (free-tier PostgreSQL + Auth with RLS)
// 2. Local / Demo Mode fallback when cloud credentials are not yet configured
// 3. Independent Learner Profiles with Automatic Learning-Path Assignment
// 4. Strict progress isolation per (User, Learner, Path, Difficulty)
// 5. Conservative, recoverable legacy save migration
// =============================================================================

(function() {
  'use strict';

  // Grade Range to Learning Path Mapping
  const GRADE_TO_PATH = {
    'g16': 'g16',     // Grades 1–6 (Ages 6–12)
    'g710': 'g710',   // Grades 7–10 (Ages 12–16)
    'g1112': 'g1112', // Grades 11–12 (Ages 16–18)
    'adult': 'adult'  // College & Adults
  };

  const PATH_INFO = {
    'g16': { label: 'Grades 1–6', age: 'Ages 6–12', desc: 'Visual analogies, gentle guidance, and playful exploration' },
    'g710': { label: 'Grades 7–10', age: 'Ages 12–16', desc: 'Structured logic, computational problem-solving, and clear code flow' },
    'g1112': { label: 'Grades 11–12', age: 'Ages 16–18', desc: 'Computer science principles, syntax parallels, and state analysis' },
    'adult': { label: 'College & Adult', age: 'Higher Ed & Self-Taught', desc: 'Software engineering depth, memory mental models, and technical precision' }
  };

  const DIFF_INFO = {
    'beg': { label: 'Beginner', desc: '5 hearts in boss fights, coach step guidance, generous par' },
    'int': { label: 'Intermediate', desc: 'Standard balanced difficulty, 3 hearts in boss fights' },
    'pro': { label: 'Professional', desc: 'Terminal mode, code view, 2 hearts in boss fights' }
  };

  // Helper for SHA-256 in browser (used for local password verification in demo mode)
  async function sha256(str) {
    if (typeof crypto !== 'undefined' && crypto.subtle && typeof TextEncoder !== 'undefined') {
      const buffer = new TextEncoder().encode(str);
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback hash
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
      this.mode = 'local'; // 'cloud' or 'local'
      this.currentUser = null;
      this.activeLearner = null;
      this.initialized = false;
      this.initPromise = null;
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
          this.supabase = window.supabase.createClient(url, key);
          this.mode = 'cloud';
          // Check existing session
          const { data: { session }, error } = await this.supabase.auth.getSession();
          if (session && session.user && !error) {
            await this._loadCloudUser(session.user);
          }
        } catch (err) {
          console.warn('[TLP Auth] Failed to initialize Supabase, falling back to local mode:', err);
          this.mode = 'local';
          this._loadLocalSession();
        }
      } else {
        this.mode = 'local';
        this._loadLocalSession();
      }

      // Check query param for learner override (e.g., from Parent Dashboard: webgame.html?learnerId=xyz)
      if (typeof window !== 'undefined' && window.location) {
        const params = new URLSearchParams(window.location.search);
        const lId = params.get('learnerId') || params.get('learner');
        if (lId) {
          const l = await this.getLearnerById(lId);
          if (l) this.setActiveLearner(l);
        }
      }

      this.initialized = true;
      return { mode: this.mode, user: this.currentUser, learner: this.activeLearner };
    }

    isCloudConfigured() {
      return this.mode === 'cloud';
    }

    // -------------------------------------------------------------------------
    // USER SESSIONS
    // -------------------------------------------------------------------------
    async _loadCloudUser(supabaseUser) {
      try {
        const { data: profile } = await this.supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .maybeSingle();

        this.currentUser = {
          id: supabaseUser.id,
          email: supabaseUser.email,
          role: (profile && profile.role) || 'learner',
          displayName: (profile && profile.display_name) || supabaseUser.email.split('@')[0]
        };

        // Load active learner
        const learners = await this.getLearners(this.currentUser.id);
        const savedLId = localStorage.getItem('tlp-active-learner-id');
        this.activeLearner = learners.find(l => l.id === savedLId) || learners[0] || null;
      } catch (e) {
        console.error('[TLP Auth] Error loading cloud profile:', e);
      }
    }

    _loadLocalSession() {
      try {
        const rawUser = localStorage.getItem('tlp-local-session-user');
        if (rawUser) {
          this.currentUser = JSON.parse(rawUser);
          const learners = this._getLocalLearners(this.currentUser.id);
          const savedLId = localStorage.getItem('tlp-active-learner-id');
          this.activeLearner = learners.find(l => l.id === savedLId) || learners[0] || null;
        } else {
          this.currentUser = null;
          this.activeLearner = null;
        }
      } catch (e) {
        this.currentUser = null;
        this.activeLearner = null;
      }
    }

    getCurrentUser() {
      return this.currentUser;
    }

    getActiveLearner() {
      if (this.activeLearner) return this.activeLearner;
      // Default guest learner if none active
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
      this.activeLearner = learner;
      if (learner && learner.id) {
        try {
          localStorage.setItem('tlp-active-learner-id', learner.id);
          if (learner.assignedPath) localStorage.setItem('tlp-path', learner.assignedPath);
          if (learner.currentDiff) localStorage.setItem('tlp-diff', learner.currentDiff);
          if (learner.name) localStorage.setItem('tlp-name', learner.name);
        } catch (e) {}
      }
    }

    // -------------------------------------------------------------------------
    // REGISTRATION & AUTHENTICATION
    // -------------------------------------------------------------------------
    resolvePathFromGrade(gradeRange) {
      return GRADE_TO_PATH[gradeRange] || null;
    }

    getPathInfo(path) {
      return PATH_INFO[path] || PATH_INFO['g710'];
    }

    getDiffInfo(diff) {
      return DIFF_INFO[diff] || DIFF_INFO['int'];
    }

    async registerUser({ email, password, role, displayName, learnerName, gradeRange, currentDiff }) {
      await this.init();
      email = (email || '').trim().toLowerCase();
      displayName = (displayName || '').trim() || (email.split('@')[0]);
      role = role === 'parent' ? 'parent' : 'learner';
      const assignedPath = this.resolvePathFromGrade(gradeRange) || 'g710';
      const diff = ['beg', 'int', 'pro'].includes(currentDiff) ? currentDiff : 'int';

      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address.');
      }
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      if (this.isCloudConfigured()) {
        // Real Supabase Auth Registration
        const { data: authData, error: authErr } = await this.supabase.auth.signUp({
          email,
          password
        });
        if (authErr) throw authErr;
        const user = authData.user;
        if (!user) throw new Error('Account creation failed. Please check backend email settings.');

        // Insert Profile
        const { error: profErr } = await this.supabase
          .from('profiles')
          .upsert({
            id: user.id,
            role,
            display_name: displayName
          });
        if (profErr) console.warn('[TLP Auth] Could not create profile row:', profErr);

        // If Learner role, create initial learner profile
        let initialLearner = null;
        if (role === 'learner') {
          const lName = (learnerName || '').trim() || displayName || 'Student';
          const { data: lData, error: lErr } = await this.supabase
            .from('learners')
            .insert({
              user_id: user.id,
              parent_user_id: null,
              name: lName,
              grade_range: gradeRange || 'g710',
              assigned_path: assignedPath,
              current_diff: diff
            })
            .select()
            .single();
          if (!lErr && lData) initialLearner = lData;
        }

        this.currentUser = { id: user.id, email: user.email, role, displayName };
        if (initialLearner) this.setActiveLearner(initialLearner);
        return { user: this.currentUser, learner: initialLearner, requiresEmailConfirmation: !authData.session };
      } else {
        // Local Demo Mode Registration
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
            currentDiff: diff
          });
        }

        this.currentUser = { id: newUserId, email, role, displayName };
        localStorage.setItem('tlp-local-session-user', JSON.stringify(this.currentUser));
        if (initialLearner) this.setActiveLearner(initialLearner);
        return { user: this.currentUser, learner: initialLearner, requiresEmailConfirmation: false };
      }
    }

    async loginUser({ email, password }) {
      await this.init();
      email = (email || '').trim().toLowerCase();
      if (!email || !password) throw new Error('Please provide both email and password.');

      if (this.isCloudConfigured()) {
        const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (!data || !data.user) throw new Error('Login failed. Please check credentials.');
        await this._loadCloudUser(data.user);
        return { user: this.currentUser, learner: this.activeLearner };
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
          displayName: matched.displayName || matched.email.split('@')[0]
        };
        localStorage.setItem('tlp-local-session-user', JSON.stringify(this.currentUser));
        const learners = this._getLocalLearners(this.currentUser.id);
        this.activeLearner = learners[0] || null;
        if (this.activeLearner) this.setActiveLearner(this.activeLearner);
        return { user: this.currentUser, learner: this.activeLearner };
      }
    }

    async logoutUser() {
      if (this.isCloudConfigured() && this.supabase) {
        try { await this.supabase.auth.signOut(); } catch (e) {}
      }
      this.currentUser = null;
      this.activeLearner = null;
      try {
        localStorage.removeItem('tlp-local-session-user');
        localStorage.removeItem('tlp-active-learner-id');
      } catch (e) {}
      return true;
    }

    // -------------------------------------------------------------------------
    // LEARNER MANAGEMENT
    // -------------------------------------------------------------------------
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
      parentUserId = parentUserId || (this.currentUser && this.currentUser.id);
      if (!parentUserId) throw new Error('Must be logged in to create a learner profile.');
      name = (name || '').trim();
      if (!name) throw new Error('Learner profile must have a name.');

      const assignedPath = this.resolvePathFromGrade(gradeRange);
      if (!assignedPath) throw new Error('Please select a valid school-grade range.');
      const diff = ['beg', 'int', 'pro'].includes(currentDiff) ? currentDiff : 'int';

      if (this.isCloudConfigured()) {
        const { data, error } = await this.supabase
          .from('learners')
          .insert({
            user_id: parentUserId,
            parent_user_id: parentUserId,
            name,
            grade_range: gradeRange,
            assigned_path: assignedPath,
            current_diff: diff
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
          currentDiff: diff
        });
      }
    }

    async updateLearnerProfile(learnerId, updates) {
      if (updates.gradeRange) {
        updates.assignedPath = this.resolvePathFromGrade(updates.gradeRange) || updates.assignedPath;
      }

      if (this.isCloudConfigured()) {
        const { data, error } = await this.supabase
          .from('learners')
          .update({
            name: updates.name,
            grade_range: updates.gradeRange,
            assigned_path: updates.assignedPath,
            current_diff: updates.currentDiff
          })
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
            assignedPath: updates.assignedPath || list[idx].assignedPath,
            currentDiff: updates.currentDiff || list[idx].currentDiff,
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
    }

    // -------------------------------------------------------------------------
    // PROGRESS IDENTIFICATION & PERSISTENCE
    // -------------------------------------------------------------------------
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
      const p = pathOverride || (this.activeLearner && this.activeLearner.assignedPath) || localStorage.getItem('tlp-path') || 'g710';
      const d = diffOverride || (this.activeLearner && this.activeLearner.currentDiff) || localStorage.getItem('tlp-diff') || 'int';
      return this.buildSaveKey(u, l, p, d, itemKey);
    }

    // Read/write single item with strict isolation
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

    // Full progress bundle sync for cloud and dashboard
    async getProgressBundle(learnerId, path, diff) {
      const u = this.currentUser ? this.currentUser.id : 'guest';
      const l = learnerId || (this.activeLearner ? this.activeLearner.id : 'default');
      const p = path || 'g710';
      const d = diff || 'int';

      // 1. Try cloud if configured
      if (this.isCloudConfigured() && u !== 'guest') {
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
              updatedAt: data.updated_at
            };
          }
        } catch (e) {
          console.warn('[TLP Auth] Cloud progress fetch failed:', e);
        }
      }

      // 2. Local fallback
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
          updatedAt: new Date().toISOString()
        };
      } catch (e) {
        return { prog: {}, ach: [], badges: [], draft: null, bossState: null };
      }
    }

    async saveProgressBundle(learnerId, path, diff, bundle) {
      const u = this.currentUser ? this.currentUser.id : 'guest';
      const l = learnerId || (this.activeLearner ? this.activeLearner.id : 'default');
      const p = path || 'g710';
      const d = diff || 'int';

      // Local write
      try {
        if (bundle.prog) localStorage.setItem(this.buildSaveKey(u, l, p, d, 'prog'), JSON.stringify(bundle.prog));
        if (bundle.ach) localStorage.setItem(this.buildSaveKey(u, l, p, d, 'ach'), JSON.stringify(bundle.ach));
        if (bundle.badges) localStorage.setItem(this.buildSaveKey(u, l, p, d, 'badges'), JSON.stringify(bundle.badges));
        if (bundle.draft !== undefined) localStorage.setItem(this.buildSaveKey(u, l, p, d, 'draft'), JSON.stringify(bundle.draft));
        if (bundle.bossState !== undefined) localStorage.setItem(this.buildSaveKey(u, l, p, d, 'boss'), JSON.stringify(bundle.bossState));
      } catch (e) {}

      // Cloud write if authenticated
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
            updated_at: new Date().toISOString()
          });
        } catch (e) {
          console.warn('[TLP Auth] Cloud progress upsert failed:', e);
        }
      }
    }

    // -------------------------------------------------------------------------
    // CONSERVATIVE LEGACY MIGRATION & RECOVERY
    // -------------------------------------------------------------------------
    migrateLegacySaves() {
      try {
        const migrationStatus = localStorage.getItem('tlp-migration-status');
        if (migrationStatus) {
          const status = JSON.parse(migrationStatus);
          if (status.migrated) {
            return { status: 'already_migrated', details: status };
          }
        }

        // 1. Snapshot all legacy keys
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

        // 2. Permanently backup and archive legacy state (NEVER deleted)
        localStorage.setItem('tlp-legacy-backup', JSON.stringify(legacySnapshot));
        localStorage.setItem('tlp-legacy-archive', JSON.stringify({
          archivedAt: new Date().toISOString(),
          keysCount: Object.keys(legacySnapshot).length,
          data: legacySnapshot
        }));

        // 3. Determine target for initial migration (guest / default)
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

        // 4. Mark migration complete so it never runs repeatedly
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

    // Explicit recovery tool: lets player import archived legacy progress to current learner/path
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

    // -------------------------------------------------------------------------
    // INTERNAL LOCAL STORAGE HELPERS
    // -------------------------------------------------------------------------
    _getLocalAccounts() {
      try {
        return JSON.parse(localStorage.getItem('tlp-local-accounts') || '[]');
      } catch (e) {
        return [];
      }
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

    _createLocalLearner({ userId, parentUserId, name, gradeRange, assignedPath, currentDiff }) {
      const list = this._getLocalLearners();
      const newLearner = {
        id: 'lrn_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
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
        createdAt: new Date().toISOString()
      };
      list.push(newLearner);
      localStorage.setItem('tlp-local-learners', JSON.stringify(list));
      return newLearner;
    }
  }

  window.TLP_AUTH = new TLPAuthEngine();
  // Auto-run conservative legacy migration early
  try {
    window.TLP_AUTH.migrateLegacySaves();
  } catch (e) {}

})();
