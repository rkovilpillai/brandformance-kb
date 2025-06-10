// Firebase Authentication Module - Using CDN with compatibility mode

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyB-bdAONBUY-kQGkJ5UxVKujU8Ynjsj3Uo",
    authDomain: "brandformance-wiki.firebaseapp.com",
    projectId: "brandformance-wiki",
    storageBucket: "brandformance-wiki.firebasestorage.app",
    messagingSenderId: "1005063131067",
    appId: "1:1005063131067:web:6731584b268779207cbe9e"
};

// Wait for Firebase to be loaded from CDN
document.addEventListener('DOMContentLoaded', function() {
    // Check if Firebase is loaded
    if (typeof firebase === 'undefined') {
        console.error('Firebase not loaded. Make sure to include Firebase scripts before this module.');
        return;
    }
    
    setupAuthentication();
});

function setupAuthentication() {
    // Initialize Firebase
    const app = firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const provider = new firebase.auth.GoogleAuthProvider();

    // Store auth functions globally so other scripts can use them
    window.firebaseAuth = {
        signIn: () => auth.signInWithPopup(provider),
        signOut: () => auth.signOut(),
        onAuthStateChanged: (callback) => auth.onAuthStateChanged(callback)
    };

    const authModal = document.getElementById('authModal');
    const knowledgeBase = document.getElementById('knowledgeBase');
    const statsSection = document.getElementById('statsSection');
    const dataSourceIndicator = document.getElementById('dataSourceIndicator');
    const userInfo = document.getElementById('userInfo');
    const signOutBtn = document.getElementById('signOutBtn');

    // Auth state listener with domain restriction
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log('User signed in:', user.email);
            
            // Check if user email is from allowed domain
            const allowedDomains = ['seedtag.com'];
            const userEmail = user.email.toLowerCase();
            const userDomain = userEmail.split('@')[1];
            
            if (allowedDomains.includes(userDomain)) {
                // User is from allowed domain - grant access
                console.log('✅ Access granted for:', user.email);
                
                // Show main content
                authModal.classList.add('hidden');
                knowledgeBase.classList.remove('hidden');
                statsSection.classList.remove('hidden');
                showChatWidget();
                
                // Show user info
                if (userInfo) {
                    userInfo.innerHTML = `
                        <div class="user-avatar">
                            <img src="${user.photoURL || ''}" alt="${user.displayName || user.email}" onerror="this.style.display='none'">
                            <span>${user.displayName || user.email}</span>
                        </div>
                    `;
                    userInfo.classList.remove('hidden');
                }
                
                // Load the knowledge base data
                if (window.loadDataFromCSV) {
                    window.loadDataFromCSV();
                }
            } else {
                // User is NOT from allowed domain - deny access
                console.log('❌ Access denied for:', user.email);
                
                // Show error message
                showDomainError(user.email, userDomain);
                
                // Sign out the user
                auth.signOut().catch(console.error);
            }
        } else {
            // User is signed out
            console.log('User signed out');
            hideChatWidget();
            
            // Hide main content, show auth modal
            authModal.classList.remove('hidden');
            knowledgeBase.classList.add('hidden');
            statsSection.classList.add('hidden');
            dataSourceIndicator.classList.add('hidden');
            
            if (userInfo) {
                userInfo.classList.add('hidden');
            }
            
            // Hide any error messages
            const domainError = document.getElementById('domainError');
            if (domainError) {
                domainError.remove();
            }
        }
    });

    // Function to show domain restriction error
    function showDomainError(email, domain) {
        // Remove any existing error
        const existingError = document.getElementById('domainError');
        if (existingError) {
            existingError.remove();
        }
        
        // Create error message
        const errorDiv = document.createElement('div');
        errorDiv.id = 'domainError';
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 32px;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.3);
            z-index: 10001;
            text-align: center;
            max-width: 400px;
            width: 90%;
            border: 2px solid #ef4444;
        `;
        
        errorDiv.innerHTML = `
            <div style="color: #ef4444; font-size: 2rem; margin-bottom: 16px;">🚫</div>
            <h3 style="color: #dc2626; margin-bottom: 16px; font-size: 1.2rem;">Access Restricted</h3>
            <p style="color: #6b7280; margin-bottom: 8px;">
                Access to this knowledge base is restricted to <strong>@seedtag.com</strong> email addresses.
            </p>
            <p style="color: #6b7280; margin-bottom: 24px; font-size: 0.9rem;">
                You signed in with: <strong>${email}</strong><br>
                Domain: <strong>@${domain}</strong>
            </p>
            <button onclick="this.parentElement.remove()" 
                    style="background: #ef4444; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600;">
                Close
            </button>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (document.getElementById('domainError')) {
                errorDiv.remove();
            }
        }, 5000);
    }

    // Sign in button
    document.getElementById('googleSignIn').addEventListener('click', async () => {
        try {
            console.log('Attempting to sign in...');
            await auth.signInWithPopup(provider);
        } catch (error) {
            console.error('Sign in error:', error);
            
            let errorMessage = error.message;
            if (error.code === 'auth/popup-blocked') {
                errorMessage = 'Popup was blocked by browser. Please allow popups for this site.';
            } else if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = 'Sign-in popup was closed by user.';
            } else if (error.code === 'auth/cancelled-popup-request') {
                errorMessage = 'Sign-in request was cancelled.';
            }
            
            alert('Sign in failed: ' + errorMessage);
        }
    });

    // Sign out button
    if (signOutBtn) {
        signOutBtn.addEventListener('click', async () => {
            try {
                await auth.signOut();
                console.log('User signed out successfully');
            } catch (error) {
                console.error('Sign out error:', error);
            }
        });
    }
}