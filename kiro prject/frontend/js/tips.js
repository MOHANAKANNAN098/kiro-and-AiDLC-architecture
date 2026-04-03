// tips.js — Safety Tips Module
// Requirements: 6.1, 6.2, 6.3, 6.4, 6.5

const TipsModule = (() => {
  const CATEGORY_LABELS = {
    'situational-awareness': 'Situational Awareness',
    'digital-safety':        'Digital Safety',
    'travel-safety':         'Travel Safety',
    'self-defense':          'Self-Defense'
  };

  let _container = null;

  function _buildCard(tip) {
    const label = CATEGORY_LABELS[tip.category] || tip.category;
    return `
      <div class="col-sm-6 col-lg-4">
        <div class="glass-card tip-card h-100">
          <span class="tip-category-icon" aria-hidden="true"><i class="${tip.icon}"></i></span>
          <span class="tip-category-badge">${label}</span>
          <h4>${tip.title}</h4>
          <p>${tip.description}</p>
        </div>
      </div>`;
  }

  function render(container) {
    _container = container;
    _container.innerHTML = TIPS_DATA.map(_buildCard).join('');
  }

  function filterByCategory(cat) {
    if (!_container) return;
    const filtered = cat === 'all' ? TIPS_DATA : TIPS_DATA.filter(t => t.category === cat);
    _container.innerHTML = filtered.map(_buildCard).join('');
  }

  function _initFilter() {
    const group = document.getElementById('tips-filter');
    if (!group) return;
    group.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-category]');
      if (!btn) return;
      group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterByCategory(btn.dataset.category);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('tips-container');
    if (container) render(container);
    _initFilter();
  });

  return { render, filterByCategory };
})();
