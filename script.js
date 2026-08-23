/* ============================================
   KOINA — Main Script (Supabase Live Version)
   - Auth guard on all pages
   - Navbar shows user name + red Logout button
   - Admin/Mod link only for staff
   - Logout redirects to login
   ============================================ */

// ── Page Loader ──
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('page-loader');
    if (loader) loader.classList.add('hidden');
  }, 1200);
});

// ── Navbar scroll ──
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ── Hamburger ──
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
  document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });
  document.addEventListener('click', (e) => {
    if (!hamburger?.contains(e.target) && !mobileMenu?.contains(e.target)) {
      hamburger?.classList.remove('open');
      mobileMenu?.classList.remove('open');
    }
  });
}

// ── Scroll Reveal ──
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), entry.target.dataset.delay || 0);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((el, i) => {
    if (!el.dataset.delay) el.dataset.delay = (i % 4) * 100;
    observer.observe(el);
  });
}

// ── Active Nav ──
function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    if (link.getAttribute('href') === path) link.classList.add('active');
  });
}

// ── Utilities ──
function timeAgo(dateStr) {
  const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
function getInitials(name) {
  if (!name) return '?';
  const p = name.trim().split(' ');
  return (p[0]?.[0] || '') + (p[1]?.[0] || p[0]?.[1] || '');
}
function escapeHtml(text) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(text));
  return d.innerHTML;
}
function setLoading(btn, loading) {
  if (!btn) return;
  btn.disabled = loading;
  const t = btn.querySelector('.btn-text');
  const l = btn.querySelector('.btn-loader');
  if (t) t.style.display = loading ? 'none' : 'inline';
  if (l) l.style.display = loading ? 'inline' : 'none';
}

// ── Global state ──
let _currentUser = null;
let _currentProfile = null;

// ════════════════════════════════════════
//  AUTH GUARD + NAVBAR
// ════════════════════════════════════════
async function initPage() {
  // Check session
  const { data: { session } } = await _supabase.auth.getSession();

  if (!session) {
    window.location.href = 'login.html';
    return;
  }

  _currentUser = session.user;

  // Load profile from DB
  const { data: profile } = await _supabase
    .from('profiles')
    .select('*')
    .eq('id', _currentUser.id)
    .single();

  _currentProfile = profile;

  const displayName = profile?.display_name || _currentUser.email?.split('@')[0] || 'User';
  const role = profile?.role || 'member';
  const initials = getInitials(displayName);
  const isStaff = ['admin', 'moderator'].includes(role);

  // ── Desktop Navbar ──
  const navUser = document.getElementById('nav-user');
  if (navUser) {
    navUser.innerHTML = `
      <div style="display:flex;align-items:center;gap:7px;">
        <div style="width:30px;height:30px;border-radius:50%;background:var(--gold);color:var(--navy);display:flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:700;flex-shrink:0;">${initials}</div>
        <span style="color:rgba(255,255,255,0.88);font-weight:600;font-size:0.88rem;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${displayName}</span>
      </div>
      ${isStaff ? `
        <a href="admin.html" style="display:inline-flex;align-items:center;gap:4px;background:rgba(244,196,48,0.15);border:1px solid rgba(244,196,48,0.4);color:var(--gold);font-size:0.76rem;font-weight:700;padding:5px 11px;border-radius:99px;text-decoration:none;transition:0.2s;">⚙️ Admin</a>
      ` : ''}
      <button onclick="logout()" style="display:inline-flex;align-items:center;gap:5px;background:rgba(229,62,62,0.18);border:1.5px solid rgba(229,62,62,0.4);color:#fc8181;font-size:0.78rem;font-weight:700;padding:5px 13px;border-radius:99px;cursor:pointer;transition:0.2s;font-family:'DM Sans',sans-serif;" onmouseover="this.style.background='rgba(229,62,62,0.35)';this.style.color='#fff'" onmouseout="this.style.background='rgba(229,62,62,0.18)';this.style.color='#fc8181'">
        🚪 Logout
      </button>
    `;
  }

  // ── Mobile Navbar ──
  const mobileNav = document.getElementById('nav-user-mobile');
  if (mobileNav) {
    mobileNav.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;padding:4px 0 10px;">
        <div style="width:38px;height:38px;border-radius:50%;background:var(--gold);color:var(--navy);display:flex;align-items:center;justify-content:center;font-size:0.85rem;font-weight:700;flex-shrink:0;">${initials}</div>
        <div>
          <div style="color:white;font-weight:600;font-size:0.92rem;">${displayName}</div>
          <div style="color:rgba(255,255,255,0.42);font-size:0.7rem;text-transform:uppercase;letter-spacing:1.5px;">${role}</div>
        </div>
      </div>
      ${isStaff ? `<a href="admin.html" style="display:block;color:var(--gold);font-weight:600;font-size:0.9rem;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);">⚙️ Admin Panel</a>` : ''}
      <button onclick="logout()" style="margin-top:10px;width:100%;padding:11px;background:rgba(229,62,62,0.18);border:1.5px solid rgba(229,62,62,0.4);color:#fc8181;border-radius:8px;font-size:0.9rem;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;">
        🚪 Logout
      </button>
    `;
  }

  // Load notifications badge
  loadNotifBadge();
}

// ── Logout ──
async function logout() {
  await _supabase.auth.signOut();
  window.location.href = 'login.html';
}

// ── Notification badge ──
async function loadNotifBadge() {
  if (!_currentUser) return;
  const { count } = await _supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', _currentUser.id)
    .eq('is_read', false);

  if (count > 0) {
    const dot = document.getElementById('notif-dot');
    if (dot) dot.style.display = 'block';
  }
}

// ── Notify admins/mods ──
async function notifyStaff(type, title, message) {
  const { data: staff } = await _supabase
    .from('profiles')
    .select('id')
    .in('role', ['admin', 'moderator']);
  if (!staff?.length) return;
  await _supabase.from('notifications').insert(
    staff.map(s => ({ user_id: s.id, type, title, message, created_at: new Date().toISOString() }))
  );
}

// ════════════════════════════════════════
//  HOME
// ════════════════════════════════════════
async function initHome() {
  if (!document.getElementById('stat-members')) return;
  try {
    const [{ count: mc }, { count: sc }] = await Promise.all([
      _supabase.from('profiles').select('*', { count: 'exact', head: true }),
      _supabase.from('skill_profiles').select('*', { count: 'exact', head: true }).eq('status', 'approved')
    ]);
    const mEl = document.getElementById('stat-members');
    const sEl = document.getElementById('stat-skills');
    if (mEl) mEl.textContent = mc ? `${mc}+` : '0';
    if (sEl) sEl.textContent = sc ? `${sc}+` : '0';
  } catch (_) {}
}

// ════════════════════════════════════════
//  MARKETPLACE — only approved skills
// ════════════════════════════════════════
let allSkillProfiles = [];

function renderCards(data) {
  const grid = document.getElementById('marketplace-grid');
  const countEl = document.getElementById('results-count');
  if (!grid) return;
  if (countEl) countEl.textContent = `Showing ${data.length} approved skill${data.length !== 1 ? 's' : ''}`;
  if (!data.length) {
    grid.innerHTML = `<div class="no-results"><div class="icon">🔍</div><p>No approved profiles yet. Check back soon!</p></div>`;
    return;
  }
  grid.innerHTML = data.map(p => {
    const name = p.profiles?.display_name || 'Anonymous';
    const church = p.profiles?.church || '';
    const location = p.profiles?.location || '';
    return `
    <div class="profile-card reveal" data-category="${p.category}">
      <div class="card-banner"><span class="card-category-badge">${p.category}</span></div>
      <div class="card-avatar">${getInitials(name)}</div>
      <div class="card-body">
        <div class="card-name">${name}</div>
        <div class="card-skill">${p.skill}</div>
        <div class="card-meta">
          ${church ? `<span>⛪ ${church}</span>` : ''}
          ${location ? `<span>📍 ${location}</span>` : ''}
        </div>
        <p class="card-desc">${p.description || ''}</p>
        <a href="https://wa.me/${p.whatsapp}?text=Hi+${encodeURIComponent(name)},+I+found+you+on+KOINA+and+I%27d+love+to+connect!" target="_blank" class="btn-whatsapp">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Contact on WhatsApp
        </a>
      </div>
    </div>`;
  }).join('');
  initScrollReveal();
}

async function initMarketplace() {
  if (!document.getElementById('marketplace-grid')) return;
  const { data } = await _supabase
    .from('skill_profiles')
    .select('*, profiles(display_name, church, location)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });
  allSkillProfiles = data || [];
  renderCards(allSkillProfiles);

  let currentFilter = 'All', currentSearch = '';
  function filter() {
    let filtered = allSkillProfiles;
    if (currentFilter !== 'All') filtered = filtered.filter(p => p.category === currentFilter);
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      filtered = filtered.filter(p =>
        p.skill?.toLowerCase().includes(q) ||
        p.profiles?.display_name?.toLowerCase().includes(q) ||
        p.profiles?.church?.toLowerCase().includes(q) ||
        p.profiles?.location?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }
    renderCards(filtered);
  }
  document.querySelectorAll('.filter-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
      tag.classList.add('active');
      currentFilter = tag.dataset.filter;
      filter();
    });
  });
  document.getElementById('skill-search')?.addEventListener('input', e => {
    currentSearch = e.target.value.trim();
    filter();
  });
}

// ════════════════════════════════════════
//  SUBMIT FORM — goes to pending
// ════════════════════════════════════════
async function initSubmitForm() {
  const form = document.getElementById('profile-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const get = n => form.querySelector(`[name="${n}"]`)?.value.trim();
    const skill = get('skill'), category = get('category'), church = get('church');
    const location = get('location'), description = get('description');
    const whatsapp = get('whatsapp')?.replace(/[\s+\-()]/g, '');

    let valid = true;
    ['skill', 'church', 'location', 'whatsapp', 'description'].forEach(name => {
      const input = form.querySelector(`[name="${name}"]`);
      const group = input?.closest('.form-group');
      if (!input?.value.trim()) { group?.classList.add('has-error'); valid = false; }
      else group?.classList.remove('has-error');
    });
    if (!valid) return;

    const btn = document.getElementById('submit-btn');
    setLoading(btn, true);

    if (church || location) {
      await _supabase.from('profiles').update({ church, location }).eq('id', _currentUser.id);
    }

    const { error } = await _supabase.from('skill_profiles').insert({
      user_id: _currentUser.id,
      skill, category, description, whatsapp,
      status: 'pending',
      created_at: new Date().toISOString()
    });

    setLoading(btn, false);

    if (error) {
      const errEl = document.getElementById('submit-error');
      if (errEl) { errEl.textContent = 'Error: ' + error.message; errEl.style.display = 'block'; }
      return;
    }

    await notifyStaff('new_skill', '🆕 New skill submission', `${_currentProfile?.display_name || 'A member'} submitted "${skill}" for review.`);
    document.getElementById('success-modal')?.classList.add('open');
  });

  document.getElementById('modal-close')?.addEventListener('click', () => { window.location.href = 'marketplace.html'; });
  document.getElementById('success-modal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('success-modal')) document.getElementById('success-modal').classList.remove('open');
  });
}

// ════════════════════════════════════════
//  CONNECTION HUB
// ════════════════════════════════════════
let hubFilter = 'All';

function renderRequests(requests) {
  const list = document.getElementById('requests-list');
  if (!list) return;
  const filtered = hubFilter === 'All' ? requests : requests.filter(r => r.category === hubFilter);
  if (!filtered.length) {
    list.innerHTML = '<p style="text-align:center;color:var(--gray);padding:3rem;">No approved requests yet.</p>';
    return;
  }
  list.innerHTML = filtered.map(r => `
    <div class="request-card">
      <div class="request-header"><h4>${r.title}</h4><span class="request-badge">${r.category}</span></div>
      <p class="request-desc">${r.description}</p>
      <div class="request-footer">
        <div class="request-meta">
          <span>👤 ${r.profiles?.display_name || 'Anonymous'}</span>
          ${r.profiles?.church ? `<span>⛪ ${r.profiles.church}</span>` : ''}
          <span>🕐 ${timeAgo(r.created_at)}</span>
        </div>
        <a href="https://wa.me/${r.contact}?text=Hi,+I+saw+your+request+on+KOINA+and+I+can+help!" target="_blank" class="btn btn-sm btn-primary">Respond 💬</a>
      </div>
    </div>`).join('');
}

async function initHub() {
  if (!document.getElementById('requests-list')) return;

  async function loadRequests() {
    const { data } = await _supabase
      .from('requests')
      .select('*, profiles(display_name, church)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    renderRequests(data || []);
  }
  await loadRequests();

  _supabase.channel('requests-rt')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'requests' }, () => loadRequests())
    .subscribe();

  document.querySelectorAll('.filter-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
      tag.classList.add('active');
      hubFilter = tag.dataset.filter;
      loadRequests();
    });
  });

  document.getElementById('hub-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const title = form.querySelector('[name="req-title"]').value.trim();
    const category = form.querySelector('[name="req-category"]').value;
    const description = form.querySelector('[name="req-desc"]').value.trim();
    const contact = form.querySelector('[name="req-contact"]').value.trim().replace(/[\s+\-()]/g, '');
    const errEl = document.getElementById('hub-error');

    if (!title || !description || !contact) {
      if (errEl) { errEl.textContent = 'Please fill in all required fields.'; errEl.style.display = 'block'; }
      return;
    }
    if (errEl) errEl.style.display = 'none';

    const btn = document.getElementById('hub-submit-btn');
    setLoading(btn, true);

    const { error } = await _supabase.from('requests').insert({
      user_id: _currentUser.id, title, category, description, contact,
      status: 'pending', created_at: new Date().toISOString()
    });

    setLoading(btn, false);

    if (error) {
      if (errEl) { errEl.textContent = 'Error: ' + error.message; errEl.style.display = 'block'; }
      return;
    }

    form.reset();
    await notifyStaff('new_request', '🆕 New hub request', `${_currentProfile?.display_name || 'A member'} posted "${title}" for review.`);

    const btn2 = document.getElementById('hub-submit-btn');
    if (btn2) {
      btn2.innerHTML = '<span class="btn-text">✅ Submitted for Review!</span>';
      btn2.style.background = '#48bb78';
      setTimeout(() => {
        btn2.innerHTML = '<span class="btn-text">Post Request 📢</span><span class="btn-loader" style="display:none">Posting...</span>';
        btn2.style.background = '';
        btn2.disabled = false;
      }, 3000);
    }
  });
}

// ════════════════════════════════════════
//  COMMUNITY POSTS
// ════════════════════════════════════════
let activePostTag = 'General';

function renderPosts(posts) {
  const feed = document.getElementById('post-feed');
  if (!feed) return;
  if (!posts?.length) {
    feed.innerHTML = '<p style="text-align:center;color:var(--gray);padding:3rem;">No approved posts yet. Be the first to share!</p>';
    return;
  }
  feed.innerHTML = posts.map(p => {
    const name = p.profiles?.display_name || 'Anonymous';
    return `
    <div class="post-item" id="post-${p.id}">
      <div class="post-header">
        <div class="post-avatar">${getInitials(name)}</div>
        <div class="post-author-info">
          <div class="name">${name}</div>
          <div class="time">${timeAgo(p.created_at)}</div>
        </div>
      </div>
      <span class="post-tag">${p.tag || 'General'}</span>
      <p class="post-content">${escapeHtml(p.content)}</p>
      <div class="post-actions">
        <button class="post-action-btn like-btn" data-id="${p.id}" data-likes="${p.likes || 0}">❤️ <span class="like-count">${p.likes || 0}</span></button>
        <button class="post-action-btn comment-toggle" data-id="${p.id}">💬 Comments</button>
      </div>
      <div class="comments-section" id="comments-${p.id}">
        <div class="comment-list" id="comment-list-${p.id}"></div>
        <div class="comment-input-row">
          <input type="text" placeholder="Write a comment..." id="comment-input-${p.id}" />
          <button class="btn btn-sm btn-dark submit-comment" data-id="${p.id}">Post</button>
        </div>
      </div>
    </div>`;
  }).join('');
  bindPostEvents();
}

function bindPostEvents() {
  document.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const liked = btn.classList.toggle('liked');
      const count = btn.querySelector('.like-count');
      let likes = parseInt(btn.dataset.likes);
      likes = liked ? likes + 1 : likes - 1;
      btn.dataset.likes = likes; count.textContent = likes;
      await _supabase.from('posts').update({ likes }).eq('id', btn.dataset.id);
    });
  });
  document.querySelectorAll('.comment-toggle').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const section = document.getElementById(`comments-${id}`);
      if (!section) return;
      const isOpen = section.classList.toggle('open');
      if (isOpen) await loadComments(id);
    });
  });
  document.querySelectorAll('.submit-comment').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const input = document.getElementById(`comment-input-${id}`);
      if (!input?.value.trim()) return;
      await _supabase.from('comments').insert({
        post_id: id, user_id: _currentUser.id,
        content: input.value.trim(), created_at: new Date().toISOString()
      });
      input.value = '';
      await loadComments(id);
    });
  });
}

async function loadComments(postId) {
  const { data } = await _supabase.from('comments').select('*, profiles(display_name)').eq('post_id', postId).order('created_at', { ascending: true });
  const list = document.getElementById(`comment-list-${postId}`);
  if (!list || !data) return;
  list.innerHTML = data.map(c => {
    const name = c.profiles?.display_name || 'Anonymous';
    return `<div class="comment"><div class="comment-avatar">${getInitials(name)}</div><div class="comment-bubble"><div class="author">${name}</div><div class="text">${escapeHtml(c.content)}</div></div></div>`;
  }).join('');
}

async function initCommunity() {
  if (!document.getElementById('post-feed')) return;

  const displayName = _currentProfile?.display_name || 'You';
  const avatarEl = document.getElementById('current-user-avatar');
  const nameEl = document.getElementById('current-user-name');
  if (avatarEl) avatarEl.textContent = getInitials(displayName);
  if (nameEl) nameEl.textContent = displayName;

  async function loadPosts() {
    const { data } = await _supabase
      .from('posts')
      .select('*, profiles(display_name)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(30);
    renderPosts(data || []);
  }
  await loadPosts();

  _supabase.channel('posts-rt')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, () => loadPosts())
    .subscribe();

  document.querySelectorAll('.tag-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.tag-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activePostTag = pill.dataset.tag;
    });
  });

  document.getElementById('post-btn')?.addEventListener('click', async () => {
    const textarea = document.getElementById('post-textarea');
    const content = textarea?.value.trim();
    if (!content) return;

    const btn = document.getElementById('post-btn');
    btn.disabled = true;

    const { error } = await _supabase.from('posts').insert({
      user_id: _currentUser.id, content,
      tag: activePostTag, status: 'pending',
      likes: 0, created_at: new Date().toISOString()
    });

    if (!error) {
      if (textarea) textarea.value = '';
      await notifyStaff('new_post', '📝 New community post', `${_currentProfile?.display_name || 'A member'} posted in the community. Review in admin panel.`);
      const notice = document.createElement('div');
      notice.style.cssText = 'background:rgba(72,187,120,0.1);border:1px solid rgba(72,187,120,0.3);border-radius:12px;padding:1rem 1.25rem;font-size:0.9rem;color:#276749;margin-bottom:1rem;';
      notice.textContent = '✅ Post submitted! It will appear after admin review.';
      document.getElementById('post-feed')?.insertBefore(notice, document.getElementById('post-feed').firstChild);
      setTimeout(() => notice.remove(), 5000);
    }
    btn.disabled = false;
  });
}

// ════════════════════════════════════════
//  LIVE CHAT
// ════════════════════════════════════════
const chatRooms = [
  { id: 'general',     name: 'General 🌍',       icon: '🌍', color: '#F4C430' },
  { id: 'prayer',      name: 'Prayer Room 🙏',    icon: '🙏', color: '#7c3aed' },
  { id: 'music',       name: 'Music Ministry 🎵', icon: '🎵', color: '#0891b2' },
  { id: 'creative',    name: 'Creatives Hub 🎨',  icon: '🎨', color: '#d97706' },
  { id: 'business',    name: 'Business 💼',        icon: '💼', color: '#059669' },
  { id: 'testimonies', name: 'Testimonies 🔥',    icon: '🔥', color: '#dc2626' },
];

let activeRoom = 'general';
let chatChannel = null;

function renderRoomList() {
  const list = document.getElementById('room-list');
  if (!list) return;
  list.innerHTML = chatRooms.map(r => `
    <div class="chat-room-item ${r.id === activeRoom ? 'active' : ''}" data-room="${r.id}">
      <div class="room-icon" style="background:${r.color}22;color:${r.color};font-size:1.2rem;">${r.icon}</div>
      <div class="room-info"><div class="room-name">${r.name}</div></div>
    </div>`).join('');
  list.querySelectorAll('.chat-room-item').forEach(item => {
    item.addEventListener('click', () => {
      activeRoom = item.dataset.room;
      renderRoomList();
      loadRoomMessages(activeRoom);
    });
  });
}

function appendMessage(m, scroll = true) {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  const isMine = m.user_id === _currentUser?.id;
  const name = m.profiles?.display_name || 'Anonymous';
  const time = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const div = document.createElement('div');
  div.className = `chat-msg ${isMine ? 'mine' : ''}`;
  div.innerHTML = `
    <div class="msg-avatar" style="${isMine ? 'background:var(--gold);color:var(--navy)' : ''}">${getInitials(isMine ? (_currentProfile?.display_name || 'Me') : name)}</div>
    <div class="msg-content">
      <div class="author">${isMine ? 'You' : name}</div>
      <div class="msg-bubble">${escapeHtml(m.content)}</div>
      <div class="msg-time">${time}</div>
    </div>`;
  container.appendChild(div);
  if (scroll) container.scrollTop = container.scrollHeight;
}

async function loadRoomMessages(roomId) {
  const room = chatRooms.find(r => r.id === roomId);
  if (!room) return;
  const titleEl = document.getElementById('chat-room-title');
  const iconEl  = document.getElementById('chat-room-icon');
  if (titleEl) titleEl.textContent = room.name;
  if (iconEl) { iconEl.textContent = room.icon; iconEl.style.color = room.color; }

  const container = document.getElementById('chat-messages');
  if (container) container.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--gray);font-size:0.88rem;">Loading...</div>';

  if (chatChannel) await _supabase.removeChannel(chatChannel);

  const { data } = await _supabase
    .from('chat_messages')
    .select('*, profiles(display_name)')
    .eq('room', roomId)
    .order('created_at', { ascending: true })
    .limit(60);

  if (container) container.innerHTML = '';
  if (!data?.length) {
    if (container) container.innerHTML = `<div class="system-msg"><span>No messages yet in this room. Say hello! 👋</span></div>`;
  } else {
    data.forEach(m => appendMessage(m, false));
    if (container) container.scrollTop = container.scrollHeight;
  }

  chatChannel = _supabase.channel(`chat-${roomId}`)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public',
      table: 'chat_messages', filter: `room=eq.${roomId}`
    }, async (payload) => {
      const { data: msg } = await _supabase
        .from('chat_messages')
        .select('*, profiles(display_name)')
        .eq('id', payload.new.id)
        .single();
      if (msg) appendMessage(msg);
    })
    .subscribe();
}

async function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const text = input?.value.trim();
  if (!text || !_currentUser) return;
  input.value = '';
  await _supabase.from('chat_messages').insert({
    user_id: _currentUser.id, room: activeRoom,
    content: text, created_at: new Date().toISOString()
  });
}

async function initChat() {
  if (!document.getElementById('chat-messages')) return;
  renderRoomList();
  await loadRoomMessages(activeRoom);
  document.getElementById('chat-send')?.addEventListener('click', sendChatMessage);
  document.getElementById('chat-input')?.addEventListener('keypress', e => {
    if (e.key === 'Enter') { e.preventDefault(); sendChatMessage(); }
  });
}

// ════════════════════════════════════════
//  INIT ALL
// ════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
  setActiveNav();
  initScrollReveal();
  await initPage();
  await initHome();
  await initMarketplace();
  await initSubmitForm();
  await initHub();
  await initCommunity();
  await initChat();
});
