(function () {
  const $ = (id) => document.getElementById(id);
  const list = $('results'), q = $('q'), domainsEl = $('domains');
  let all = [], domain = 'All';
  const saved = new Set();

  async function load() {
    $('error').hidden = true;
    try {
      const res = await fetch('data/internships.json');
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      all = Array.isArray(data) ? data : data.internships;
      buildDomains();
      render();
    } catch (e) {
      list.replaceChildren();
      $('empty').hidden = true;
      $('count').textContent = '';
      $('error').hidden = false;
    }
  }

  function buildDomains() {
    const names = ['All', ...new Set(all.map((i) => i.domain))];
    domainsEl.replaceChildren();
    names.forEach((n) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = n;
      b.setAttribute('aria-pressed', String(n === domain));
      b.addEventListener('click', () => { domain = n; buildDomains(); render(); });
      domainsEl.append(b);
    });
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function card(i) {
    const li = el('li');
    const a = el('article', 'card');
    a.append(el('h2', '', i.title), el('p', 'company', i.domain));
    const meta = el('ul', 'meta');
    [i.location, i.mode, i.openings + (i.openings === 1 ? ' opening' : ' openings')].forEach((t) => meta.append(el('li', '', t)));
    const tags = el('ul', 'tags');
    tags.setAttribute('aria-label', 'Skills');
    i.skills.forEach((s) => tags.append(el('li', '', s)));
    const btn = el('button', 'btn', saved.has(i.id) ? 'Saved' : 'Save');
    btn.type = 'button';
    btn.setAttribute('aria-pressed', String(saved.has(i.id)));
    btn.setAttribute('aria-label', (saved.has(i.id) ? 'Unsave ' : 'Save ') + i.title + '');
    btn.addEventListener('click', () => {
      saved.has(i.id) ? saved.delete(i.id) : saved.add(i.id);
      const on = saved.has(i.id);
      btn.textContent = on ? 'Saved' : 'Save';
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', (on ? 'Unsave ' : 'Save ') + i.title + '');
    });
    a.append(meta, tags, btn);
    li.append(a);
    return li;
  }

  function render() {
    const term = q.value.trim().toLowerCase();
    const out = all.filter((i) =>
      (domain === 'All' || i.domain === domain) &&
      (!term || [i.title, i.domain, i.mode, i.location, ...i.skills].join(' ').toLowerCase().includes(term)));
    list.replaceChildren(...out.map(card));
    $('empty').hidden = out.length > 0;
    $('count').textContent = out.length + (out.length === 1 ? ' internship' : ' internships') + ' found';
  }

  q.addEventListener('input', render);
  $('search-form').addEventListener('submit', (e) => e.preventDefault());
  $('search-form').addEventListener('reset', () => { domain = 'All'; setTimeout(() => { buildDomains(); render(); }); });
  $('retry').addEventListener('click', load);
  load();
})();
