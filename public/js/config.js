// Configuration Constants

// Chat Widget Configuration
window.ChatWidgetConfig = {
    webhook: {
        url: 'https://rajkpillai.app.n8n.cloud/webhook/a85a5d4a-d06e-4caf-b17e-877b81d15c5b/chat',
        route: 'general'
    },
    style: {
        primaryColor: '#2563eb',
        secondaryColor: '#7c3aed',
        position: 'right',
        backgroundColor: '#ffffff',
        fontColor: '#333333'
    }
};

// CSV file paths to try (in order of preference)
const csvPaths = [
    'data/uploads/departments.csv',
    'data/departments.csv',
    'departments.csv'
];

// Application state
let knowledgeData = {};
let allResources = [];
let currentActiveLink = null;
let searchTimeout = null;
let faqData = [];