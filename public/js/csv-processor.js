// CSV Processing Module

async function loadDataFromCSV() {
    showLoading('Checking for data files...');

    for (const path of csvPaths) {
        try {
            console.log(`🔍 Trying to load from: ${path}`);
            updateLoadingStatus(`Trying ${path}...`);
            
            const response = await fetch(path);
            
            if (response.ok) {
                const csvContent = await response.text();
                
                if (csvContent && csvContent.trim().length > 0) {
                    console.log(`✅ Found data at: ${path}`);
                    await processCSVData(csvContent, path);
                    await loadFAQData();
                    return; // Success! Exit the function
                }
            } else {
                console.log(`❌ Failed: ${path} - ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.log(`❌ Error loading ${path}:`, error.message);
        }
    }

    // If we get here, no data source worked
    showError('Could not find data file. Please ensure data/uploads/departments.csv exists.');
}

async function processCSVData(csvContent, sourcePath) {
    try {
        updateLoadingStatus('Processing CSV data...');
        
        const lines = csvContent.trim().split('\n');
        
        if (lines.length < 2) {
            throw new Error('CSV file must contain at least a header row and one data row');
        }

        // Parse headers
        const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
        const requiredHeaders = ['department', 'section', 'name'];
        
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
            throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
        }

        // Create header mapping
        const headerMap = {};
        headers.forEach((header, index) => {
            headerMap[header] = index;
        });

        // Parse data
        const newKnowledgeData = {};
        const newAllResources = [];
        let validRows = 0;

        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            if (values.length < headers.length) continue;

            const department = values[headerMap.department]?.trim() || '';
            const section = values[headerMap.section]?.trim() || '';
            const name = values[headerMap.name]?.trim() || '';
            const logo = values[headerMap.logo]?.trim() || '';
            const url = values[headerMap.url]?.trim() || '';

            if (!department || !section || !name) continue;

            // Initialize department and section
            if (!newKnowledgeData[department]) {
                newKnowledgeData[department] = {};
            }
            if (!newKnowledgeData[department][section]) {
                newKnowledgeData[department][section] = [];
            }

            const resource = { name, logo, url, department, section };
            newKnowledgeData[department][section].push(resource);
            newAllResources.push(resource);
            validRows++;
        }

        if (validRows === 0) {
            throw new Error('No valid data rows found in CSV file');
        }

        // Store data
        knowledgeData = newKnowledgeData;
        allResources = newAllResources;

        // Update UI
        hideLoading();
        showDataSourceIndicator(sourcePath, validRows);
        updateStats();
        renderKnowledgeBase();
        showInterface();

        console.log(`✅ Loaded ${validRows} resources from ${sourcePath}`);

    } catch (error) {
        showError(`Failed to process CSV: ${error.message}`);
    }
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result.map(item => item.replace(/^"|"$/g, ''));
}

function refreshData() {
    console.log('🔄 Refreshing data...');
    knowledgeData = {};
    allResources = [];
    currentActiveLink = null;
    
    // Clear search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    
    // Reload data
    loadDataFromCSV();
}

// Make refreshData available globally
window.loadDataFromCSV = loadDataFromCSV;