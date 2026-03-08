// Utility functions

// Session storage management (encrypted in production)
window.QuizSession = {
    save: (quizData) => {
        try {
            // In production, encrypt this data
            sessionStorage.setItem('currentQuiz', JSON.stringify(quizData));
        } catch (e) {
            console.error('Failed to save quiz session:', e);
        }
    },
    
    load: () => {
        try {
            const data = sessionStorage.getItem('currentQuiz');
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Failed to load quiz session:', e);
            return null;
        }
    },
    
    clear: () => {
        sessionStorage.removeItem('currentQuiz');
    }
};

// Timer management
window.QuizTimer = {
    start: (durationSeconds, onTick, onComplete) => {
        const endTime = Date.now() + durationSeconds * 1000;
        
        const interval = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
            
            onTick(remaining);
            
            if (remaining <= 0) {
                clearInterval(interval);
                onComplete();
            }
        }, 1000);
        
        return interval;
    },
    
    format: (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
};

// Error handler
window.ErrorHandler = {
    handle: (error, context = '') => {
        console.error(`Error in ${context}:`, error);
        
        // Show user-friendly message
        const errorDiv = document.getElementById('globalError');
        if (errorDiv) {
            errorDiv.textContent = error.message || 'An unexpected error occurred';
            errorDiv.classList.remove('hidden');
            
            setTimeout(() => {
                errorDiv.classList.add('hidden');
            }, 5000);
        }
        
        // Log to monitoring service (in production)
        if (window.Sentry) {
            Sentry.captureException(error, { extra: { context } });
        }
    }
};

// Loading state
window.LoadingState = {
    show: (elementId = 'loadingSpinner') => {
        const el = document.getElementById(elementId);
        if (el) el.classList.remove('hidden');
    },
    
    hide: (elementId = 'loadingSpinner') => {
        const el = document.getElementById(elementId);
        if (el) el.classList.add('hidden');
    }
};

// Format currency
window.formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
};

// Debounce function for search inputs
window.debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};