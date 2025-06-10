// Search Handler Module

function handleSearch(e) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        filterResources(e.target.value);
    }, 300);
}

function filterResources(searchTerm) {
    if (!searchTerm.trim()) {
        renderKnowledgeBase();
        return;
    }

    const filteredData = {};
    const term = searchTerm.toLowerCase();

    // Search in departments
    Object.entries(knowledgeData).forEach(([dept, sections]) => {
        Object.entries(sections).forEach(([section, resources]) => {
            const matchingResources = resources.filter(resource =>
                resource.name.toLowerCase().includes(term) ||
                resource.department.toLowerCase().includes(term) ||
                resource.section.toLowerCase().includes(term) ||
                (resource.url && resource.url.toLowerCase().includes(term))
            );

            if (matchingResources.length > 0) {
                if (!filteredData[dept]) filteredData[dept] = {};
                filteredData[dept][section] = matchingResources;
            }
        });
    });

    // Search in FAQs
    const matchingFAQs = faqData.filter(faq =>
        faq.question.toLowerCase().includes(term) ||
        faq.answer.toLowerCase().includes(term) ||
        faq.category.toLowerCase().includes(term) ||
        faq.subCategory.toLowerCase().includes(term)
    );

    // Render results
    const sidebarContent = document.getElementById('sidebarContent');
    sidebarContent.innerHTML = '';

    // Add FAQ results if any
    if (matchingFAQs.length > 0) {
        const faqSection = document.createElement('div');
        faqSection.className = 'department-section';
        
        const faqHeader = document.createElement('div');
        faqHeader.className = 'department-header';
        faqHeader.innerHTML = `<span>❓ FAQ (${matchingFAQs.length} matches)</span>`;
        
        const faqContent = document.createElement('div');
        faqContent.className = 'department-content expanded';
        
        const faqLink = document.createElement('a');
        faqLink.href = '#';
        faqLink.className = 'section-link';
        faqLink.innerHTML = `
            <div class="resource-icon">📋</div>
            <span>Search Results</span>
        `;
        faqLink.onclick = (e) => {
            e.preventDefault();
            showFilteredFAQs(matchingFAQs, searchTerm, faqLink);
        };
        
        faqContent.appendChild(faqLink);
        faqSection.appendChild(faqHeader);
        faqSection.appendChild(faqContent);
        sidebarContent.appendChild(faqSection);
    }

    // Add filtered departments
    renderFilteredResults(filteredData);
}

function renderFilteredResults(filteredData) {
    const sidebarContent = document.getElementById('sidebarContent');
    
    // If no existing content and no filtered data, show no results
    if (sidebarContent.children.length === 0 && Object.keys(filteredData).length === 0) {
        sidebarContent.innerHTML = '<div class="no-results">No resources found</div>';
        return;
    }

    // Add filtered departments to existing content (FAQ results may already be there)
    Object.entries(filteredData).forEach(([departmentName, sections]) => {
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