// Authentication module with security best practices

// Auth state observer
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in
        updateUIForAuthenticatedUser(user);
        
        // Store session securely (HttpOnly cookies would be better, but this is client-side)
        sessionStorage.setItem('userAuthenticated', 'true');
        sessionStorage.setItem('userEmail', user.email);
        
        // Redirect if on auth page
        if (window.location.pathname.includes('auth.html')) {
            window.location.href = 'dashboard.html';
        }
    } else {
        // User is signed out
        updateUIForUnauthenticatedUser();
        sessionStorage.removeItem('userAuthenticated');
        sessionStorage.removeItem('userEmail');
        
        // Protect routes
        const protectedRoutes = ['dashboard.html', 'profile.html', 'quiz.html', 'results.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (protectedRoutes.includes(currentPage)) {
            window.location.href = 'auth.html?redirect=' + encodeURIComponent(currentPage);
        }
    }
});

function updateUIForAuthenticatedUser(user) {
    const userMenu = document.getElementById('userMenu');
    if (userMenu) {
        userMenu.innerHTML = `
            <span class="user-email">${user.email}</span>
            <button class="btn btn-outline" onclick="logout()">Logout</button>
        `;
    }
    
    // Update nav active states
    updateNavActiveState();
}

function updateUIForUnauthenticatedUser() {
    const userMenu = document.getElementById('userMenu');
    if (userMenu) {
        userMenu.innerHTML = `
            <a href="auth.html" class="btn btn-primary">Login / Sign up</a>
        `;
    }
}

// Login with email/password
window.loginWithEmail = async (email, password) => {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        // Log the login event (security audit)
        await logSecurityEvent('login', userCredential.user.uid);
        
        // Redirect to dashboard or previous page
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect') || 'dashboard.html';
        window.location.href = redirect;
    } catch (error) {
        showError(error.message);
    }
};

// Sign up with email/password
window.signUpWithEmail = async (email, password) => {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Create user document in Firestore
        await db.collection('users').doc(userCredential.user.uid).set({
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            purchasedExams: [],
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Log signup
        await logSecurityEvent('signup', userCredential.user.uid);
        
        window.location.href = 'dashboard.html';
    } catch (error) {
        showError(error.message);
    }
};

// Google Sign-in
window.loginWithGoogle = async () => {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const userCredential = await auth.signInWithPopup(provider);
        
        // Check if user exists, if not create document
        const userDoc = await db.collection('users').doc(userCredential.user.uid).get();
        if (!userDoc.exists) {
            await db.collection('users').doc(userCredential.user.uid).set({
                email: userCredential.user.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                purchasedExams: [],
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // Update last login
            await db.collection('users').doc(userCredential.user.uid).update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        await logSecurityEvent('google_login', userCredential.user.uid);
        
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect') || 'dashboard.html';
        window.location.href = redirect;
    } catch (error) {
        showError(error.message);
    }
};

// Logout
window.logout = async () => {
    try {
        await auth.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        showError(error.message);
    }
};

// Security: Log events for audit
async function logSecurityEvent(eventType, userId) {
    try {
        await db.collection('securityLogs').add({
            type: eventType,
            userId: userId,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            ip: 'forwarded', // In production, get from server
            userAgent: navigator.userAgent
        });
    } catch (e) {
        console.warn('Failed to log security event:', e);
    }
}

// Helper to show errors
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
        setTimeout(() => errorDiv.classList.add('hidden'), 5000);
    } else {
        alert(message);
    }
}

// Update navigation active state
function updateNavActiveState() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}