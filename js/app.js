// src/js/app.js

// Limpa o cache do navegador ao carregar a página
if ('caches' in window) {
  caches.keys().then(cacheNames => {
    cacheNames.forEach(cacheName => {
      caches.delete(cacheName);
    });
  });
}

// State management
let currentCategory = 'Todas';
let searchQuery = '';
let startups = [];
let stories = [];
let currentStoryIndex = 0; // Índice pra rastrear o story atual
let storyTimer; // Timer pra fechar o modal automaticamente

// DOM Elements
const startupGrid = document.getElementById('startupGrid');
const categoryFilter = document.getElementById('categoryFilter');
const modal = document.getElementById('startupModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const searchInput = document.getElementById('searchInput');
const storiesContainer = document.getElementById('storiesContainer');
const storyModal = document.getElementById('storyModal');
const storyImage = document.getElementById('storyImage');
const storyLogo = document.getElementById('storyLogo');
const storyName = document.getElementById('storyName');

// Auth Functions
function isUserLoggedIn() {
  return localStorage.getItem('isLoggedIn') === 'true';
}

function openPopup() {
  const popup = document.getElementById('loginPopup');
  const overlay = document.getElementById('popupOverlay');
  if (popup && overlay) {
    popup.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else {
    console.error('Popup ou overlay não encontrados:', { popup, overlay });
  }
}

function closePopup() {
  const popup = document.getElementById('loginPopup');
  const overlay = document.getElementById('popupOverlay');
  if (popup && overlay) {
    popup.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  } else {
    console.error('Popup ou overlay não encontrados:', { popup, overlay });
  }
}

function logout() {
  localStorage.setItem('isLoggedIn', 'false');
  localStorage.removeItem('token');
  updateNavButtons();
  renderStartups();
  console.log('Usuário deslogado, isLoggedIn:', localStorage.getItem('isLoggedIn'));
}

// Separar categorias principais e secundárias
let mainCategories = ['Todas'];
let extraCategories = [];
let showExtraCategories = false;

// Função para truncar texto longo
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

// Render category filters
function renderCategories(categories) {
  // Remove "Todas" do array de categorias pra evitar duplicação
  const filteredCategories = categories.filter(category => category !== 'Todas');

  mainCategories = ['Todas', ...filteredCategories.slice(0, 3)];
  extraCategories = filteredCategories.slice(3);

  const mainCategoriesHTML = mainCategories.map(category => `
    <button class="category-button ${category === currentCategory ? 'active' : ''}"
            onclick="filterByCategory('${category}')">
      ${category}
    </button>
  `).join('');

  const extraCategoriesHTML = extraCategories.map(category => `
    <button class="category-button ${category === currentCategory ? 'active' : ''}"
            onclick="filterByCategory('${category}')">
      ${category}
    </button>
  `).join('');

  categoryFilter.innerHTML = `
    <div class="main-categories">
      ${mainCategoriesHTML}
      <button class="category-button more-filters" onclick="toggleExtraCategories(event)">
        <span>${showExtraCategories ? 'Menos filtros' : 'Mais filtros'}</span>
        <i class="fas fa-chevron-${showExtraCategories ? 'up' : 'down'}"></i>
      </button>
    </div>
    <div class="extra-categories-container ${showExtraCategories ? 'show' : ''}">
      <div class="extra-categories">
        ${extraCategoriesHTML}
      </div>
    </div>
  `;
}

function toggleExtraCategories(event) {
  event.preventDefault();
  event.stopPropagation();
  showExtraCategories = !showExtraCategories;
  renderCategories(categoriesData);
}

function filterByCategory(category) {
  currentCategory = category;
  renderCategories(categoriesData);
  renderStartups();
}

// Adicionar evento de input para pesquisa em tempo real
if (searchInput) {
  searchInput.addEventListener('input', debounce(handleSearch, 300));
}

function handleSearch(e) {
  searchQuery = e.target.value.toLowerCase().trim();
  renderStartups();
}

// Função de debounce para otimizar a pesquisa
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Filter and search startups
function getFilteredStartups() {
  return startups.filter(startup => {
    const matchesCategory = currentCategory === 'Todas' || startup.categoria === currentCategory;
    const matchesSearch = !searchQuery || (
      startup.nome.toLowerCase().includes(searchQuery) ||
      startup.descricao.toLowerCase().includes(searchQuery) ||
      startup.categoria.toLowerCase().includes(searchQuery)
    );
    return matchesCategory && matchesSearch;
  });
}

// Render startup cards
function renderStartups() {
  const filteredStartups = getFilteredStartups();

  startupGrid.innerHTML = filteredStartups.map(startup => `
    <div class="startup-card">
      <div class="card-image">
        <img src="${startup.image}" alt="${startup.nome}" class="card-background-image">
        <div class="card-logo">
          <img src="${startup.logo}" alt="${startup.nome} logo" class="card-logo-image">
        </div>
      </div>
      <div class="card-content">
        <div class="card-header">
          <h3 class="card-title">${startup.nome}</h3>
          <span class="card-category">${startup.categoria}</span>
        </div>
        <p class="card-description">${truncateText(startup.descricao, 100)}</p>
        <div class="card-stats">
        </div>
        <div class="card-actions">
          <button class="details-button ${!isUserLoggedIn() ? 'disabled' : ''}" 
                  onclick="${isUserLoggedIn() ? `openModal(${startup.id})` : 'openPopup()'}">
            Ver detalhes
          </button>
          <div class="action-buttons">
            <button class="action-button" onclick="shareStartup(${startup.id})">
              ${shareIcon}
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Modal functions
function openModal(startupId) {
  if (!isUserLoggedIn()) {
    openPopup();
    return;
  }

  const startup = startups.find(s => s.id === startupId);
  if (!startup) return;

  // Converte o URL do YouTube pro formato embed
  let embedUrl = startup.media?.video;
  if (embedUrl && embedUrl.includes('watch?v=')) {
    const videoId = embedUrl.split('v=')[1]?.split('&')[0]; // Extrai o ID do vídeo
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
  }

  modalTitle.textContent = startup.nome;
  modalBody.innerHTML = `
    <div class="startup-info">
      <div class="startup-image">
        <img src="${startup.image}" alt="${startup.nome}" onerror="this.src='https://via.placeholder.com/800x300?text=Imagem+Indisponível';">
      </div>
      <div class="info-content">
        <h3>Sobre a empresa</h3>
        <p>${startup.descricao}</p>
        <p><br><strong>Estágio:</strong> ${startup.estagio}</p>
      </div>
    </div>

    ${startup.team ? `
      <div class="team-section">
        <h3>Equipe</h3>
        <div class="team-grid">
          ${startup.team.map(member => `
            <div class="team-member">
              <img src="${member.photo}" alt="${member.name}">
              <div class="team-member-name">${member.name}</div>
              <div class="team-member-role">${member.role}</div>
              <p>${member.bio}</p>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    ${startup.roadmap ? `
      <div class="roadmap-section">
        <h3>Roadmap</h3>
        <div class="roadmap-timeline">
          ${startup.roadmap.map(item => `
            <div class="roadmap-item">
              <div class="roadmap-date">${item.date}</div>
              <div class="roadmap-milestone">${item.milestone}</div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    ${startup.documents ? `
      <div class="documents-section">
        <h3>Documentos</h3>
        <div class="document-list">
          ${startup.documents.map(doc => `
            <a href="${doc.url}" target="_blank" rel="noopener noreferrer" 
               class="document-link">
              ${fileIcon} ${doc.name}
            </a>
          `).join('')}
        </div>
      </div>
    ` : ''}

    ${embedUrl ? `
      <div class="video-container">
        <h3>Vídeo de apresentação</h3>
        <div class="video-wrapper">
          <iframe src="${embedUrl}" 
                  title="YouTube video player" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowfullscreen></iframe>
        </div>
      </div>
    ` : ''}
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function shareStartup(startupId) {
  const startup = startups.find(s => s.id === startupId);
  if (!startup) return;

  if (navigator.share) {
    navigator.share({
      title: startup.nome,
      text: startup.descricao,
      url: window.location.href,
    }).then(() => {
      const startup = startups.find(s => s.id === startupId);
      if (startup) {
        startup.shares = (startup.shares || 0) + 1;
      }
      renderStartups();
    }).catch(err => {
      console.log('Error sharing:', err);
    });
  }
}

function adicionarStory() {
  if (!isUserLoggedIn()) {
    openPopup();
    return;
  }
  alert('Envie sua foto pra gente pelo Gmail: contato@sua-startup.com');
}

// Handle "Anunciar Startup" button
function handleStartupClick(event) {
  if (!isUserLoggedIn()) {
    event.preventDefault();
    openPopup();
  } else {
    window.location.href = 'https://docs.google.com/forms/d/e/1FAIpQLSeRmpdxnDUe7ehnR-dDX7QTpS1JXgwIfYcP-yTkCNSqpx9EHQ/viewform?usp=dialog';
  }
}

// Icons (SVG)
const heartIcon = (filled) => `
  <svg width="20" height="20" fill="${filled ? 'currentColor' : 'none'}" 
       stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
`;

const shareIcon = `
  <svg width="20" height="20" fill="none" stroke="currentColor" 
       stroke-width="2" viewBox="0 0 24 24">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
    <polyline points="16 6 12 2 8 6"/>
    <line x1="12" y1="2" x2="12" y2="15"/>
  </svg>
`;

const fileIcon = `
  <svg width="20" height="20" fill="none" stroke="currentColor" 
       stroke-width="2" viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
`;

// Função para renderizar os stories

// Event Listeners
let categoriesData = [];

document.addEventListener('DOMContentLoaded', () => {
  // Adiciona cache-busting a todos os recursos estáticos
  const timestamp = new Date().getTime();
  
  // Atualiza links de CSS
  document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
    const href = link.getAttribute('href');
    if (href && !href.includes('?_=')) {
      link.setAttribute('href', `${href}?_=${timestamp}`);
    }
  });

  // Atualiza scripts
  document.querySelectorAll('script[src]').forEach(script => {
    const src = script.getAttribute('src');
    if (src && !src.includes('?_=')) {
      script.setAttribute('src', `${src}?_=${timestamp}`);
    }
  });

  // Atualiza imagens
  document.querySelectorAll('img[src]').forEach(img => {
    const src = img.getAttribute('src');
    if (src && !src.includes('?_=')) {
      img.setAttribute('src', `${src}?_=${timestamp}`);
    }
  });

  document.getElementById('closePopup')?.addEventListener('click', closePopup);
  document.getElementById('popupOverlay')?.addEventListener('click', (event) => {
    if (event.target === document.getElementById('popupOverlay')) {
      closePopup();
    }
  });

  document.getElementById('popupLoginButton')?.addEventListener('click', () => {
    window.location.href = 'hubLogin.html';
  });

  document.getElementById('popupCadastroButton')?.addEventListener('click', () => {
    window.location.href = 'hubCadastro.html';
  });

  const startupBtn = document.querySelector('.nav-button.primary');
  if (startupBtn) {
    startupBtn.addEventListener('click', handleStartupClick);
  }

  fetch(`data/startups.json?_=${new Date().getTime()}`)
    .then(response => {
      if (!response.ok) throw new Error('Erro ao carregar startups.json: ' + response.statusText);
      return response.json();
    })
    .then(data => {
      startups = data.startups;
      categoriesData = data.categories;
      renderCategories(categoriesData);
      renderStartups();
    })
    .catch(error => console.error('Erro ao carregar dados:', error));
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    closeModal();
  }
});

storyModal.addEventListener('click', (e) => {
  if (e.target === storyModal) {
    closeStoryModal();
  }
});

document.getElementById('investirButton').onclick = function() {
  window.location.href = 'emBreve.html';
};

const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const menuOverlay = document.querySelector('.menu-overlay');

function toggleMenu() {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
  menuOverlay.classList.toggle('active');
  document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
}

hamburger.addEventListener('click', toggleMenu);
menuOverlay.addEventListener('click', toggleMenu);