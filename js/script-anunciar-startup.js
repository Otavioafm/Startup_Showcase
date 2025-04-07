// Gerenciamento de membros da equipe
function addTeamMember() {
    const container = document.getElementById('teamMembers');
    const memberDiv = document.createElement('div');
    memberDiv.className = 'item-row';
    memberDiv.innerHTML = `
        <input type="text" placeholder="Nome" class="form-input">
        <input type="text" placeholder="Cargo" class="form-input">
        <input type="text" placeholder="URL da foto" class="form-input">
        <button type="button" class="btn-delete" onclick="this.parentElement.remove()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
        </button>
    `;
    container.appendChild(memberDiv);
}

// Gerenciamento de itens do roadmap
function addRoadmapItem() {
    const container = document.getElementById('roadmapItems');
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item-row';
    itemDiv.innerHTML = `
        <input type="text" placeholder="Quarter (ex: Q1)" class="form-input">
        <input type="text" placeholder="Ano" class="form-input">
        <input type="text" placeholder="Descrição" class="form-input">
        <button type="button" class="btn-delete" onclick="this.parentElement.remove()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
        </button>
    `;
    container.appendChild(itemDiv);
}

// Gerenciamento de documentos
document.getElementById('documentInput').addEventListener('change', function(e) {
    const files = Array.from(e.target.files || []);
    const container = document.getElementById('documentList');
    
    if (files.length + container.children.length > 3) {
        alert('Você pode enviar no máximo 3 documentos.');
        return;
    }

    files.forEach(file => {
        const docDiv = document.createElement('div');
        docDiv.className = 'document-item';
        docDiv.innerHTML = `
            <span>${file.name}</span>
            <button type="button" class="btn-delete" onclick="this.parentElement.remove()">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
            </button>
        `;
        container.appendChild(docDiv);
    });
});

// Manipulação do formulário
function handleSubmit(event) {
    event.preventDefault();
    // Aqui você pode adicionar a lógica para enviar os dados do formulário
    console.log('Formulário enviado');
}

// Melhorar a experiência de upload
document.querySelectorAll('.upload-area').forEach(area => {
    area.addEventListener('dragover', e => {
        e.preventDefault();
        area.style.borderColor = 'var(--primary-purple)';
        area.style.backgroundColor = 'var(--light-purple)';
    });

    area.addEventListener('dragleave', e => {
        e.preventDefault();
        area.style.borderColor = 'var(--border-color)';
        area.style.backgroundColor = 'transparent';
    });

    area.addEventListener('drop', e => {
        e.preventDefault();
        area.style.borderColor = 'var(--border-color)';
        area.style.backgroundColor = 'transparent';
        
        const input = area.querySelector('input[type="file"]');
        if (input) {
            input.files = e.dataTransfer.files;
            input.dispatchEvent(new Event('change'));
        }
    });
});