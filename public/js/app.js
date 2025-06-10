// Main Application Module

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Knowledge Base...');
    setupEventListeners();
    // Note: loadDataFromCSV() will be called by firebase-auth.js after authentication
});

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    
    // Search events
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (searchInput) {
                searchInput.focus();
            }
        }
        if (e.key === 'Escape') {
            if (searchInput) {
                searchInput.value = '';
                handleSearch({ target: { value: '' } });
            }
        }
    });

    console.log('📡 Event listeners configured');
}

// Make key functions available globally for onclick handlers
window.refreshData = refreshData;
window.closeChatWidget = closeChatWidget;
window.copyToClipboard = copyToClipboard;
window.toggleFAQ = toggleFAQ;

console.log('📚 Knowledge Base app loaded and ready!');