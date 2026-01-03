/* Portfolio script: load projects, render cards, filter */
(function(){
  const projectsGrid = document.getElementById('projectsGrid');
  const tagChipsEl = document.getElementById('tagChips');
  const searchInput = document.getElementById('searchInput');
  const filterCategory = document.getElementById('filterCategory');
  const yearEl = document.getElementById('year');
  const themeToggle = document.getElementById('themeToggle');
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  yearEl.textContent = new Date().getFullYear();

  // Theme toggle
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  document.documentElement.classList.toggle('light', prefersLight);
  themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('light');
  });

  // Mobile nav
  navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  // Debounce helper
  function debounce(fn, ms){
    let t; return function(...args){ clearTimeout(t); t = setTimeout(() => fn.apply(this, args), ms); };
  }

  // State
  let allProjects = [];
  let activeTags = new Set();

  // Fetch and init
  fetch('assets/data/projects.json')
    .then(r => r.json())
    .then(data => {
      allProjects = data;
      buildCategoryOptions(allProjects);
      buildTagChips(allProjects);
      renderProjects(allProjects);
      projectsGrid.setAttribute('aria-busy', 'false');
    })
    .catch(err => {
      projectsGrid.innerHTML = '<p>Failed to load projects. Ensure projects.json exists.</p>';
      projectsGrid.setAttribute('aria-busy', 'false');
      console.error(err);
    });

  function buildTagChips(items){
    const tags = new Set();
    items.forEach(p => (p.tags || []).forEach(t => tags.add(t)));
    tagChipsEl.innerHTML = '';
    Array.from(tags).sort().forEach(tag => {
      const chip = document.createElement('button');
      chip.className = 'tag-chip';
      chip.textContent = tag;
      chip.setAttribute('data-tag', tag);
      chip.addEventListener('click', () => {
        const t = chip.getAttribute('data-tag');
        if(activeTags.has(t)) { activeTags.delete(t); chip.classList.remove('active'); }
        else { activeTags.add(t); chip.classList.add('active'); }
        applyFilters();
      });
      tagChipsEl.appendChild(chip);
    });
  }

  function buildCategoryOptions(items){
    const cats = new Set();
    items.forEach(p => cats.add((p.category || 'other')));
    // Reset to just "All"
    filterCategory.innerHTML = '';
    const allOpt = document.createElement('option'); allOpt.value = 'all'; allOpt.textContent = 'All'; filterCategory.appendChild(allOpt);
    Array.from(cats).sort().forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c.charAt(0).toUpperCase() + c.slice(1);
      filterCategory.appendChild(opt);
    });
  }

  const onSearch = debounce(() => applyFilters(), 150);
  searchInput.addEventListener('input', onSearch);
  filterCategory.addEventListener('change', applyFilters);

  function applyFilters(){
    const q = (searchInput.value || '').trim().toLowerCase();
    const cat = filterCategory.value;
    const filtered = allProjects.filter(p => {
      // Category
      const catOk = cat === 'all' || (p.category || 'other') === cat;
      // Query across title/desc/tags/skills
      const blob = [p.title, p.description, ...(p.tags||[]), ...(p.skills||[])].join(' ').toLowerCase();
      const qOk = !q || blob.includes(q);
      // Tags active must be subset
      const tagOk = activeTags.size === 0 || (p.tags || []).some(t => activeTags.has(t));
      return catOk && qOk && tagOk;
    });
    renderProjects(filtered);
  }

  function renderProjects(items){
    projectsGrid.innerHTML = '';
    if(!items.length){
      projectsGrid.innerHTML = '<p>No projects matched the filters.</p>';
      return;
    }
    items.forEach(p => projectsGrid.appendChild(projectCard(p)));
  }

  function projectCard(p){
    const card = document.createElement('article');
    card.className = 'card';

    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    const imgSrc = p.cardImage || p.image;
    thumb.textContent = imgSrc ? '' : (p.category?.toUpperCase() || 'PROJECT');
    if(imgSrc){
      thumb.style.backgroundImage = `url(${imgSrc})`;
      thumb.style.backgroundSize = 'cover';
      // allow custom position (e.g., 'left center') to keep the train in focus
      thumb.style.backgroundPosition = p.imagePosition || 'center center';
    }
    card.appendChild(thumb);

    const content = document.createElement('div');
    content.className = 'content';

    const h3 = document.createElement('h3'); h3.textContent = p.title; content.appendChild(h3);

    // Short description (truncated) to surface keywords
    const desc = document.createElement('p');
    const rawDesc = p.description || '';
    const shortDesc = rawDesc.length > 140 ? rawDesc.slice(0, 137) + '…' : rawDesc;
    if(shortDesc) { desc.textContent = shortDesc; content.appendChild(desc); }

    // Meta chips (prefer tags, else skills)
    const meta = document.createElement('div'); meta.className = 'meta';
    const chipsSrc = (p.tags && p.tags.length ? p.tags : (p.skills || []));
    (chipsSrc || []).slice(0, 3).forEach(s => {
      const span = document.createElement('span');
      span.className = 'skill';
      span.textContent = s;
      meta.appendChild(span);
    });
    if(meta.childElementCount) content.appendChild(meta);

    // Single primary action only: prefer Details, else Repo, else Live
    const actions = document.createElement('div'); actions.className = 'actions';
    const primaryHref = p.details || p.repo || p.link || null;
    if(primaryHref){ const a = linkBtn(p.details ? 'Details' : (p.repo ? 'Repo' : 'Live'), primaryHref); actions.appendChild(a); }
    content.appendChild(actions);

    card.appendChild(content);

    // Make entire card clickable if details exist (optional)
    if(p.details){
      card.classList.add('clickable');
      card.tabIndex = 0; // keyboard focusable
      const go = () => window.location.href = p.details;
      card.addEventListener('click', (e) => {
        // avoid double navigation when clicking action buttons
        const tag = ((e.target && e.target.tagName) || '').toLowerCase();
        if(tag !== 'a' && tag !== 'button') go();
      });
      card.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
      });
    }
    return card;
  }

  function linkBtn(label, href){
    const a = document.createElement('a'); a.className = 'btn'; a.textContent = label; a.href = href; a.target = '_blank'; a.rel = 'noopener'; return a;
  }
})();
