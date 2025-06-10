// FAQ Handler Module

// Load FAQ data
async function loadFAQData() {
    try {
        const response = await fetch('data/faq.csv');
        if (!response.ok) {
            console.log('FAQ data not found, skipping FAQ section');
            return;
        }
        
        const csvContent = await response.text();
        if (csvContent && csvContent.trim().length > 0) {
            processFAQData(csvContent);
        }
    } catch (error) {
        console.log('Error loading FAQ data:', error);
    }
}

// Process FAQ CSV data
function processFAQData(csvContent) {
    try {
        const lines = csvContent.trim().split('\n');
        if (lines.length < 2) return;

        const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
        const headerMap = {};
        headers.forEach((header, index) => {
            headerMap[header.replace(/\s+/g, '')] = index;
        });

        faqData = [];
        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            if (values.length < headers.length) continue;

            const faq = {
                question: values[headerMap.question]?.trim() || '',
                answer: values[headerMap.answer]?.trim() || '',
                category: values[headerMap.category]?.trim() || '',
                subCategory: values[headerMap.subcategory]?.trim() || ''
            };

            if (faq.question && faq.answer) {
                faqData.push(faq);
            }
        }

        console.log(`✅ Loaded ${faqData.length} FAQ items`);
    } catch (error) {
        console.error('Error processing FAQ data:', error);
    }
}

// Show FAQ section
function showFAQSection(linkElement) {
    // Update active link styling
    if (currentActiveLink) {
        currentActiveLink.classList.remove('active');
    }
    linkElement.classList.add('active');
    currentActiveLink = linkElement;

    // Update content header
    document.getElementById('contentTitle').textContent = 'Frequently Asked Questions';
    document.getElementById('contentBreadcrumb').textContent = `FAQ (${faqData.length} questions)`;
    
    // Show FAQ content
    const contentBody = document.getElementById('contentBody');
    
    if (faqData.length === 0) {
        contentBody.innerHTML = `
            <div class="welcome-message">
                <h3>❓ FAQ Section</h3>
                <p>FAQ data is being loaded or not available yet.</p>
            </div>
        `;
        return;
    }

    // Group FAQs by category
    const faqsByCategory = {};
    faqData.forEach(faq => {
        if (!faqsByCategory[faq.category]) {
            faqsByCategory[faq.category] = [];
        }
        faqsByCategory[faq.category].push(faq);
    });

    // Render FAQ content
    contentBody.innerHTML = `
        <div class="faq-container">
            <div class="faq-header">
                <h3>💡 Find answers to common questions</h3>
                <div class="faq-search">
                    <input type="text" id="faqSearch" placeholder="Search FAQs..." class="search-input">
                </div>
            </div>
            <div id="faqContent" class="faq-content"></div>
        </div>
    `;

    renderFAQContent(faqsByCategory);
    setupFAQSearch();
}

// Render FAQ content
function renderFAQContent(faqsByCategory) {
    const faqContent = document.getElementById('faqContent');
    faqContent.innerHTML = '';

    Object.entries(faqsByCategory).forEach(([category, faqs]) => {
        const categorySection = document.createElement('div');
        categorySection.className = 'faq-category';
        
        const categoryHeader = document.createElement('h4');
        categoryHeader.className = 'faq-category-title';
        categoryHeader.textContent = `📂 ${category} (${faqs.length})`;
        categorySection.appendChild(categoryHeader);

        faqs.forEach((faq, index) => {
            const faqItem = document.createElement('div');
            faqItem.className = 'faq-item';
            faqItem.innerHTML = `
                <div class="faq-question" onclick="toggleFAQ(this)">
                    <span class="faq-question-text">${escapeHtml(faq.question)}</span>
                    <span class="faq-toggle">▼</span>
                </div>
                <div class="faq-answer">
                    <div class="faq-answer-content">
                        ${formatFAQAnswer(faq.answer)}
                        ${faq.subCategory ? `<div class="faq-tags"><span class="faq-tag">${escapeHtml(faq.subCategory)}</span></div>` : ''}
                    </div>
                </div>
            `;
            categorySection.appendChild(faqItem);
        });

        faqContent.appendChild(categorySection);
    });
}

// Format FAQ answer (convert line breaks and handle formatting)
function formatFAQAnswer(answer) {
    return escapeHtml(answer)
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

// Toggle FAQ item
function toggleFAQ(questionElement) {
    const faqItem = questionElement.parentElement;
    const answer = faqItem.querySelector('.faq-answer');
    const toggle = questionElement.querySelector('.faq-toggle');
    
    const isOpen = faqItem.classList.contains('open');
    
    if (isOpen) {
        faqItem.classList.remove('open');
        toggle.textContent = '▼';
    } else {
        faqItem.classList.add('open');
        toggle.textContent = '▲';
    }
}

// Setup FAQ search
function setupFAQSearch() {
    const searchInput = document.getElementById('faqSearch');
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filterFAQs(e.target.value);
        }, 300);
    });
}

// Filter FAQs based on search
function filterFAQs(searchTerm) {
    if (!searchTerm.trim()) {
        // Show all FAQs grouped by category
        const faqsByCategory = {};
        faqData.forEach(faq => {
            if (!faqsByCategory[faq.category]) {
                faqsByCategory[faq.category] = [];
            }
            faqsByCategory[faq.category].push(faq);
        });
        renderFAQContent(faqsByCategory);
        return;
    }

    const term = searchTerm.toLowerCase();
    const filteredFAQs = faqData.filter(faq =>
        faq.question.toLowerCase().includes(term) ||
        faq.answer.toLowerCase().includes(term) ||
        faq.category.toLowerCase().includes(term) ||
        faq.subCategory.toLowerCase().includes(term)
    );

    // Group filtered results
    const filteredByCategory = {};
    filteredFAQs.forEach(faq => {
        if (!filteredByCategory[faq.category]) {
            filteredByCategory[faq.category] = [];
        }
        filteredByCategory[faq.category].push(faq);
    });

    if (Object.keys(filteredByCategory).length === 0) {
        document.getElementById('faqContent').innerHTML = `
            <div class="no-results">
                <h4>No FAQs found</h4>
                <p>No questions match your search: "${escapeHtml(searchTerm)}"</p>
            </div>
        `;
    } else {
        renderFAQContent(filteredByCategory);
    }
}

function showFilteredFAQs(faqs, searchTerm, linkElement) {
    // Similar to showFAQSection but with filtered results
    if (currentActiveLink) {
        currentActiveLink.classList.remove('active');
    }
    linkElement.classList.add('active');
    currentActiveLink = linkElement;

    document.getElementById('contentTitle').textContent = 'FAQ Search Results';
    document.getElementById('contentBreadcrumb').textContent = `Found ${faqs.length} FAQs matching "${searchTerm}"`;
    
    const faqsByCategory = {};
    faqs.forEach(faq => {
        if (!faqsByCategory[faq.category]) {
            faqsByCategory[faq.category] = [];
        }
        faqsByCategory[faq.category].push(faq);
    });

    const contentBody = document.getElementById('contentBody');
    contentBody.innerHTML = `<div id="faqContent" class="faq-content"></div>`;
    renderFAQContent(faqsByCategory);
}