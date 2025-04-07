// Função para bloquear as abas para usuários não logados
function blockTabsForNonLoggedInUsers() {
    // Placeholder: Adicione aqui a lógica pra bloquear abas se necessário
    // Exemplo: Desativar abas específicas pra usuários não logados
    const tabs = document.querySelectorAll('.details-tabs .tab');
    tabs.forEach(tab => {
        if (!isUserLoggedIn() && tab.dataset.tab !== 'sobre') { // Exemplo: só a aba "Sobre" é permitida
            tab.classList.add('disabled');
        }
    });
}

// Função para lidar com a troca de abas
function setupTabSwitching() {
    const tabs = document.querySelectorAll('.details-tabs .tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('disabled')) return; // Impede a troca de aba se estiver desativada

            // Remove a classe 'active' de todas as abas
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Exibe o conteúdo correspondente à aba selecionada
            const activeTab = tab.dataset.tab;
            document.querySelectorAll('[data-content]').forEach(content => {
                content.style.display = content.dataset.content === activeTab ? 'block' : 'none';
            });
        });
    });
}

// Eventos para o Popup
document.addEventListener('DOMContentLoaded', () => {
    // Fechar o popup ao clicar no botão de fechar ou no overlay
    document.getElementById('closePopup')?.addEventListener('click', closePopup);
    document.getElementById('popupOverlay')?.addEventListener('click', (event) => {
        if (event.target === document.getElementById('popupOverlay')) {
            closePopup();
        }
    });

    // Adiciona eventos aos botões "Cadastrar Startup"
    const startupBtn = document.querySelector('.startup-btn');
    if (startupBtn) {
        startupBtn.addEventListener('click', (e) => {
            handleStartupClick(e); // Usa a função do app.js
        });
    }

    // Adiciona eventos aos botões "Investir"
    const investButtons = document.querySelectorAll('.invest-button');
    if (investButtons) {
        investButtons.forEach((button) => {
            button.addEventListener('click', (e) => {
                if (!isUserLoggedIn()) {
                    e.preventDefault();
                    openPopup();
                }
            });
        });
    }

    // Redirecionar para hubLogin.html ao clicar no botão "Login" do popup
    const popupLoginButton = document.getElementById('popupLoginButton');
    if (popupLoginButton) {
        popupLoginButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'hubLogin.html';
        });
    }

    // Redirecionar para hubCadastro.html ao clicar no botão "Cadastro" do popup
    const popupCadastroButton = document.getElementById('popupCadastroButton');
    if (popupCadastroButton) {
        popupCadastroButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'hubCadastro.html';
        });
    }

    // Bloqueia as abas para usuários não logados
    blockTabsForNonLoggedInUsers();

    // Configura a troca de abas
    setupTabSwitching();

    // Aplica o estado "disabled" aos botões "Investir" se o usuário não estiver logado
    document.querySelectorAll('.invest-button').forEach(button => {
        if (!isUserLoggedIn()) {
            button.classList.add('disabled');
        } else {
            button.classList.remove('disabled');
        }
    });
});