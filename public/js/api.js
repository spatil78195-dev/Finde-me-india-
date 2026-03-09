// ====================== API HELPER ======================
const API_BASE = '/api';

function getToken() { return localStorage.getItem('fmi_token'); }
function getUser() {
  const u = localStorage.getItem('fmi_user');
  return u ? JSON.parse(u) : null;
}
function setAuth(token, user) {
  localStorage.setItem('fmi_token', token);
  localStorage.setItem('fmi_user', JSON.stringify(user));
}
function clearAuth() {
  localStorage.removeItem('fmi_token');
  localStorage.removeItem('fmi_user');
}

async function apiRequest(method, path, data = null, isFormData = false) {
  const opts = {
    method,
    headers: {}
  };
  const token = getToken();
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;

  if (data) {
    if (isFormData) {
      opts.body = data;
    } else {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(data);
    }
  }

  const res = await fetch(`${API_BASE}${path}`, opts);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Request failed');
  return json;
}

const api = {
  auth: {
    signup: (d) => apiRequest('POST', '/auth/signup', d),
    login: (d) => apiRequest('POST', '/auth/login', d),
    me: () => apiRequest('GET', '/auth/me')
  },
  persons: {
    add: (fd) => apiRequest('POST', '/persons', fd, true),
    list: (q = '') => apiRequest('GET', `/persons${q}`),
    stats: () => apiRequest('GET', '/persons/stats'),
    my: () => apiRequest('GET', '/persons/my'),
    get: (id) => apiRequest('GET', `/persons/${id}`)
  },
  admin: {
    persons: (q = '') => apiRequest('GET', `/admin/persons${q}`),
    companies: () => apiRequest('GET', '/admin/companies'),
    users: () => apiRequest('GET', '/admin/users'),
    setStatus: (id, status) => apiRequest('PATCH', `/admin/persons/${id}/status`, { status }),
    assign: (id, companyId) => apiRequest('PATCH', `/admin/persons/${id}/assign`, { companyId }),
    delete: (id) => apiRequest('DELETE', `/admin/persons/${id}`),
    sightings: () => apiRequest('GET', '/admin/sightings')
  },
  company: {
    persons: () => apiRequest('GET', '/company/persons'),
    markPrinted: (id) => apiRequest('PATCH', `/company/persons/${id}/printed`)
  },
  sightings: {
    report: (personId, fd) => apiRequest('POST', `/sightings/${personId}`, fd, true),
    forPerson: (personId) => apiRequest('GET', `/sightings/person/${personId}`)
  }
};

// ====================== NAVBAR RENDER ======================
function renderNavbar(activePage = '') {
  const user = getUser();
  const navLinks = [
    { href: '/index.html', label: '🏠 Home', key: 'home' },
    { href: '/add-person.html', label: '➕ Add Case', key: 'add' },
    { href: '/dashboard.html', label: '📋 My Cases', key: 'dashboard' },
    { href: '/all-cases.html', label: '🖨️ Print Cases', key: 'all-cases' }
  ];
  if (user && user.role === 'admin') navLinks.push({ href: '/admin.html', label: '⚙️ Admin', key: 'admin' });
  if (user && (user.role === 'company' || user.role === 'admin')) navLinks.push({ href: '/company.html', label: '📦 Company', key: 'company' });

  const linksHTML = navLinks.map(l =>
    `<a href="${l.href}" class="${activePage === l.key ? 'active' : ''}">${l.label}</a>`
  ).join('');

  let authArea = '';
  if (user) {
    authArea = `
      <div class="user-chip">👤 ${user.name} <span class="badge badge-verified" style="margin-left:4px;">${user.role}</span></div>
      <button class="btn btn-ghost btn-sm" onclick="logout()">Logout</button>`;
  } else {
    authArea = `<a href="/login.html" class="btn btn-primary btn-sm">Login</a>`;
  }

  const navbar = document.getElementById('navbar');
  if (navbar) {
    navbar.innerHTML = `
      <a href="/index.html" class="navbar-brand">
        <div class="brand-icon">🔍</div>
        Find Me India
      </a>
      <div class="hamburger" onclick="toggleMobileMenu()">☰</div>
      <div class="nav-content" id="mobileNavContent">
        <nav class="navbar-nav">${linksHTML}</nav>
        <div class="navbar-actions">
          <div id="authNavArea">${authArea}</div>
        </div>
      </div>`;
  }
}

window.toggleMobileMenu = function() {
  const nav = document.getElementById('mobileNavContent');
  if (nav) nav.classList.toggle('active');
};

function logout() {
  clearAuth();
  window.location.href = '/index.html';
}

function requireAuth(redirectTo = '/login.html') {
  if (!getToken()) { window.location.href = redirectTo; return false; }
  return true;
}
function requireRole(roles, redirectTo = '/index.html') {
  const user = getUser();
  if (!user || !roles.includes(user.role)) { window.location.href = redirectTo; return false; }
  return true;
}

// ====================== UTILS ======================
function statusBadge(status) {
  const classes = { pending: 'badge-pending', verified: 'badge-verified', printed: 'badge-printed', found: 'badge-found' };
  const icons = { pending: '⏳', verified: '✅', printed: '📦', found: '🎉' };
  return `<span class="badge ${classes[status] || ''}">${icons[status] || ''} ${status}</span>`;
}
function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function showAlert(el, msg, type = 'error') {
  el.innerHTML = `<div class="alert alert-${type}">
    ${type === 'success' ? '✅' : '❌'} ${msg}
  </div>`;
}
function getParamId() {
  return new URLSearchParams(window.location.search).get('id');
}
function photoUrl(filename) {
  if (!filename) return null;
  if (filename.startsWith('data:')) return filename;
  return `/uploads/${filename}`;
}
