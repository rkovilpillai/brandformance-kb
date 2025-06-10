// UI Management Module

function showLoading(message) {
    document.getElementById('loadingSection').classList.remove('hidden');
    document.getElementById('errorSection').classList.add('hidden');
    document.getElementById('knowledgeBase').classList.add('hidden');
    document.getElementById('statsSection').classList.add('hidden');
    document.getElementById('dataSourceIndicator').classList.add('hidden');
    updateLoadingStatus(message);
}

function updateLoadingStatus(message) {
    const statusEl = document.getElementById('loadingStatus');
    if (statusEl) statusEl.textContent = message;
}

function hideLoading() {
    document.getElementById('loadingSection').classList.add('hidden');
}

function showError(message) {
    document.getElementById('errorSection').classList.remove('hidden');
    document.getElementById('loadingSection').classList.add('hidden');
    document.getElementById('knowledgeBase').classList.add('hidden');
    document.getElementById('statsSection').classList.add('hidden');
    document.getElementById('dataSourceIndicator').classList.add('hidden');
    document.getElementById('errorMessage').textContent = message;
}

function showInterface() {
    document.getElementById('knowledgeBase').classList.remove('hidden');
    document.getElementById('statsSection').classList.remove('hidden');
    document.getElementById('errorSection').classList.add('hidden');
}

function showDataSourceIndicator(path, resourceCount) {
    const indicator = document.getElementById('dataSourceIndicator');
    const pathEl = document.getElementById('sourcePath');
    const timeEl = document.getElementById('sourceTime');
    
    if (pathEl) pathEl.textContent = path;
    if (timeEl) timeEl.textContent = `• ${resourceCount} resources • ${new Date().toLocaleString()}`;
    if (indicator) indicator.classList.remove('hidden');
}

function updateStats() {
    const departmentCount = Object.keys(knowledgeData).length;
    let sectionCount = 0;
    let resourceCount = 0;

    Object.values(knowledgeData).forEach(department => {
        sectionCount += Object.keys(department).length;
        Object.values(department).forEach(section => {
            resourceCount += section.length;
        });
    });

    document.getElementById('departmentCount').textContent = departmentCount;
    document.getElementById('sectionCount').textContent = sectionCount;
    document.getElementById('resourceCount').textContent = resourceCount;
}

function renderKnowledgeBase() {
    const sidebarContent = document.getElementById('sidebarContent');
    sidebarContent.innerHTML = '';

    // Add FAQ section first
    const faqSection = document.createElement('div');
    faqSection.className = 'department-section';
    
    const faqHeader = document.createElement('div');
    faqHeader.className = 'department-header';
    faqHeader.innerHTML = `
        <span>❓ FAQ</span>
        <span class="department-toggle">▼</span>
    `;
    
    const faqContent = document.createElement('div');
    faqContent.className = 'department-content expanded';
    
    const faqLink = document.createElement('a');
    faqLink.href = '#';
    faqLink.className = 'section-link';
    faqLink.innerHTML = `
        <div class="resource-icon">📋</div>
        <span>Frequently Asked Questions</span>
    `;
    faqLink.onclick = (e) => {
        e.preventDefault();
        showFAQSection(faqLink);
    };
    
    faqContent.appendChild(faqLink);
    faqHeader.onclick = () => toggleDepartment(faqContent, faqHeader.querySelector('.department-toggle'));
    
    faqSection.appendChild(faqHeader);
    faqSection.appendChild(faqContent);
    sidebarContent.appendChild(faqSection);

    // Add existing departments
    Object.entries(knowledgeData).forEach(([departmentName, sections]) => {
        const departmentDiv = document.createElement('div');
        departmentDiv.className = 'department-section';

        const departmentHeader = document.createElement('div');
        departmentHeader.className = 'department-header';
        departmentHeader.innerHTML = `
            <span>🏢 ${departmentName}</span>
            <span class="department-toggle">▼</span>
        `;

        const departmentContent = document.createElement('div');
        departmentContent.className = 'department-content expanded';

        Object.entries(sections).forEach(([sectionName, resources]) => {
            const sectionLink = document.createElement('a');
            sectionLink.href = '#';
            sectionLink.className = 'section-link';
            sectionLink.innerHTML = `
                <div class="resource-icon">📁</div>
                <span>${sectionName} (${resources.length})</span>
            `;
            sectionLink.onclick = (e) => {
                e.preventDefault();
                showSection(departmentName, sectionName, resources, sectionLink);
            };
            departmentContent.appendChild(sectionLink);
        });

        departmentHeader.onclick = () => toggleDepartment(departmentContent, departmentHeader.querySelector('.department-toggle'));
        
        departmentDiv.appendChild(departmentHeader);
        departmentDiv.appendChild(departmentContent);
        sidebarContent.appendChild(departmentDiv);
    });
}

function showSection(departmentName, sectionName, resources, linkElement) {
    // Update active link styling
    if (currentActiveLink) {
        currentActiveLink.classList.remove('active');
    }
    linkElement.classList.add('active');
    currentActiveLink = linkElement;

    // Update content header
    document.getElementById('contentTitle').textContent = `${departmentName} - ${sectionName}`;
    document.getElementById('contentBreadcrumb').textContent = `${departmentName} > ${sectionName} (${resources.length} resources)`;
    
    // Show resources in grid
    const contentBody = document.getElementById('contentBody');
    
    if (resources.length === 0) {
        contentBody.innerHTML = `
            <div class="welcome-message">
                <h3>📂 ${sectionName}</h3>
                <p>This section doesn't contain any resources yet.</p>
            </div>
        `;
        return;
    }

    contentBody.innerHTML = '<div class="content-grid"></div>';
    const contentGrid = contentBody.querySelector('.content-grid');

    resources.forEach(resource => {
        const resourceCard = document.createElement('div');
        resourceCard.className = 'resource-card';
        resourceCard.innerHTML = `
            <div class="resource-header">
                <div class="resource-icon">
                    ${getIconForResource(resource.logo)}
                </div>
                <div class="resource-info">
                    <h4>${escapeHtml(resource.name)}</h4>
                    <p>Resource from ${escapeHtml(sectionName)}</p>
                </div>
            </div>
            <div class="resource-actions">
                <a href="${escapeHtml(resource.url || '#')}" target="_blank" 
                   class="btn btn-primary" ${!resource.url ? 'style="opacity:0.5;pointer-events:none;"' : ''}>
                    🔗 Open Resource
                </a>
                <button class="btn btn-secondary" onclick="copyToClipboard('${escapeHtml(resource.url || '')}')" 
                        ${!resource.url ? 'disabled style="opacity:0.5;"' : ''}>
                    📋 Copy Link
                </button>
            </div>
        `;
        contentGrid.appendChild(resourceCard);
    });
}

function getIconForResource(logo) {
    const iconMap = {
        'ppt.svg': '📊',
        'pptx': '📊',
        'sheets.svg': '📈',
        'xlsx': '📈',
        'xls': '📈',
        'doc.svg': '📝',
        'docx': '📝',
        'pdf.svg': '📄',
        'pdf': '📄',
        'json.svg': '⚙️',
        'json': '⚙️',
        'video.svg': '🎥',
        'mp4': '🎥',
        'studio.png': '🎨',
        'xandr.png': '📱',
        'dv360.png': '📺',
        'bulkUpload.png': '⬆️',
        'appScript.png': '⚙️',
        'dataStudio.svg': '📊'
    };

    if (!logo) return '📄';
    if (iconMap[logo]) return iconMap[logo];
    
    const extension = logo.split('.').pop()?.toLowerCase();
    return iconMap[extension] || '📄';
}

function toggleDepartment(departmentContent, toggleIcon) {
    const isExpanded = departmentContent.classList.contains('expanded');
    
    if (isExpanded) {
        departmentContent.classList.remove('expanded');
        toggleIcon.textContent = '▶';
    } else {
        departmentContent.classList.add('expanded');
        toggleIcon.textContent = '▼';
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function copyToClipboard(text) {
    if (!text) return;
    
    navigator.clipboard.writeText(text).then(() => {
        // Show temporary success message
        const tempMsg = document.createElement('div');
        tempMsg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideInFromRight 0.3s ease-out;
        `;
        tempMsg.textContent = '✅ Link copied to clipboard!';
        document.body.appendChild(tempMsg);
        
        setTimeout(() => {
            tempMsg.remove();
        }, 3000);
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            alert('Link copied to clipboard!');
        } catch (error) {
            alert('Failed to copy link');
        }
        
        document.body.removeChild(textArea);
    });
}