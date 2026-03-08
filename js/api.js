// API module with security checks and error handling

// Get all exams (public)
window.getExams = async () => {
    try {
        const snapshot = await db.collection('exams').get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching exams:', error);
        throw new Error('Failed to load exams');
    }
};

// Get categories for an exam (public)
window.getCategories = async (examId) => {
    try {
        const snapshot = await db.collection('categories')
            .where('examId', '==', examId)
            .get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw new Error('Failed to load categories');
    }
};

// Get questions for a category (public)
window.getQuestions = async (categoryId) => {
    try {
        const snapshot = await db.collection('questions')
            .where('categoryId', '==', categoryId)
            .get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching questions:', error);
        throw new Error('Failed to load questions');
    }
};

// Get all questions (for random test) with limit
window.getAllQuestions = async (limit = 100) => {
    try {
        const snapshot = await db.collection('questions')
            .limit(limit)
            .get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching questions:', error);
        throw new Error('Failed to load questions');
    }
};

// Get user purchases (protected)
window.getUserPurchases = async (userId) => {
    if (!userId) throw new Error('User ID required');
    
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) return [];
        return userDoc.data().purchasedExams || [];
    } catch (error) {
        console.error('Error fetching purchases:', error);
        throw new Error('Failed to load purchase data');
    }
};

// Check if user can access exam
window.canAccessExam = async (userId, examId) => {
    if (!userId) return false;
    
    try {
        const exam = await db.collection('exams').doc(examId).get();
        if (!exam.exists) return false;
        
        // Free exams are accessible to all
        if (exam.data().price === 0) return true;
        
        // Check purchases
        const purchases = await getUserPurchases(userId);
        return purchases.includes(examId);
    } catch (error) {
        console.error('Error checking access:', error);
        return false;
    }
};

// Add purchase after successful payment (secured by server)
window.addPurchase = async (userId, examId) => {
    if (!userId || !examId) throw new Error('Missing required data');
    
    try {
        await db.collection('users').doc(userId).update({
            purchasedExams: firebase.firestore.FieldValue.arrayUnion(examId)
        });
        
        // Log purchase
        await db.collection('purchases').add({
            userId,
            examId,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            amount: (await db.collection('exams').doc(examId).get()).data().price
        });
        
        return true;
    } catch (error) {
        console.error('Error adding purchase:', error);
        throw new Error('Failed to record purchase');
    }
};

// Get random questions for test
window.getRandomQuestions = async (count = 25) => {
    try {
        const allQuestions = await getAllQuestions(100);
        
        // Shuffle and take 'count' questions
        const shuffled = allQuestions.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, allQuestions.length));
    } catch (error) {
        console.error('Error getting random questions:', error);
        throw new Error('Failed to create random test');
    }
};