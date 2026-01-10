
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    limit,
    getDoc,
    setDoc,
    serverTimestamp,
    arrayUnion,
    arrayRemove,
    increment
} from 'firebase/firestore';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth';
import {
    ref,
    uploadBytesResumable,
    uploadBytes,
    getDownloadURL
} from 'firebase/storage';
import { db, auth, storage } from '../firebase';
import { sampleSetups, sampleBlogs } from '../data/sampleData';

// Collections References
const setupsCol = collection(db, 'setups');
const blogsCol = collection(db, 'blogs');
const usersCol = collection(db, 'users');
const commentsCol = collection(db, 'comments');
const newsletterCol = collection(db, 'newsletter');

// ==========================================
// DANH SÁCH ADMIN (Thêm email của bạn vào đây)
// ==========================================
export const ADMIN_EMAILS = [
    'admin@deskhub.com',
    'thanhdat.rces@gmail.com' // <-- Thay bằng email của bạn
];

export const api = {
    // Fetch all initial data with optimizations
    getData: async () => {
        try {
            // Setups - Limit to 50 most recent, ordered by creation date
            const setupsQuery = query(
                setupsCol,
                orderBy('createdAt', 'desc'),
                limit(50)
            );
            const setupSnapshot = await getDocs(setupsQuery);
            const setups = setupSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Blogs - Limit to 20 most recent
            const blogsQuery = query(
                blogsCol,
                orderBy('createdAt', 'desc'),
                limit(20)
            );
            const blogSnapshot = await getDocs(blogsQuery);
            const blogs = blogSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Comments - Only fetch when needed, not on initial load
            // Skip comments for faster initial load
            const comments = {};

            return { setups, blogs, comments };
        } catch (error) {
            console.error("Error getting data (using fallback):", error);
            // Fallback to local data if Firestore fails
            return {
                setups: sampleSetups,
                blogs: sampleBlogs,
                comments: {}
            };
        }
    },

    // Auth
    login: async (email, password) => {
        try {
            // Check if trying to login as admin hardcoded fallback
            // Firebase Auth doesn't have "username" login by default, usually Email
            // But for compatibility with existing UI (username input), we might need to adjust.
            // For now, assume username is email or append domain
            const emailToUse = email.includes('@') ? email : `${email}@deskhub.com`;

            const userCredential = await signInWithEmailAndPassword(auth, emailToUse, password);
            const user = userCredential.user;

            // Get extra user info from Firestore
            let userData = {};
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    userData = userDoc.data();
                }

                // Tự động cấp quyền Admin nếu email nằm trong danh sách whitelist
                const isAdminEmail = ADMIN_EMAILS.includes(user.email) || ADMIN_EMAILS.includes(emailToUse);
                if (isAdminEmail && userData.role !== 'admin') {
                    console.log(`Auto-promoting ${user.email} to Admin`);
                    await updateDoc(doc(db, 'users', user.uid), { role: 'admin' });
                    userData.role = 'admin';
                }
            } catch (firestoreError) {
                console.warn("Firestore access failed (offline?):", firestoreError);
                // Fallback: Check admin email purely based on Auth email if Firestore fails
                if (ADMIN_EMAILS.includes(user.email) || ADMIN_EMAILS.includes(emailToUse)) {
                    userData.role = 'admin';
                }
            }

            return {
                id: user.uid,
                email: user.email,
                displayName: user.displayName || userData.displayName || email,
                photoURL: user.photoURL || userData.avatar,
                role: userData.role || 'user'
            };
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    register: async (userData) => {
        try {
            const { email, password, username, displayName } = userData;
            // Create Auth User
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, {
                displayName: displayName
            });

            // Create Firestore User Doc
            const newUserDoc = {
                username,
                displayName,
                email,
                role: ADMIN_EMAILS.includes(email) ? 'admin' : 'user', // Tự động set role admin nếu email trong whitelist
                avatar: `https://ui-avatars.com/api/?name=${displayName}`,
                createdAt: new Date().toISOString()
            };

            await setDoc(doc(db, 'users', user.uid), newUserDoc);

            return { success: true, user: { id: user.uid, ...newUserDoc } };
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    logout: async () => {
        await signOut(auth);
    },

    // Interactions
    toggleLike: async (setupId, userId) => {
        try {
            const setupRef = doc(db, 'setups', setupId);
            const setupSnap = await getDoc(setupRef);

            if (setupSnap.exists()) {
                const data = setupSnap.data();
                const likes = data.likes || [];
                const alreadyLiked = likes.some(l => (l.userId === userId || l === userId));

                let newLikes;
                if (alreadyLiked) {
                    newLikes = likes.filter(l => (l.userId !== userId && l !== userId));
                } else {
                    newLikes = [...likes, { userId, timestamp: new Date().toISOString() }];
                }

                await updateDoc(setupRef, { likes: newLikes });
                return { success: true, likes: newLikes };
            }
        } catch (error) {
            console.error(error);
        }
        return { success: false };
    },

    toggleSave: async (setupId, userId) => {
        try {
            const setupRef = doc(db, 'setups', setupId);
            const setupSnap = await getDoc(setupRef);

            if (setupSnap.exists()) {
                const data = setupSnap.data();
                const saves = data.saves || [];
                const alreadySaved = saves.some(s => (s.userId === userId || s === userId));

                let newSaves;
                if (alreadySaved) {
                    newSaves = saves.filter(s => (s.userId !== userId && s !== userId));
                } else {
                    newSaves = [...saves, { userId, timestamp: new Date().toISOString() }];
                }

                await updateDoc(setupRef, { saves: newSaves });
                return { success: true, saves: newSaves };
            }
        } catch (error) {
            console.error(error);
        }
        return { success: false };
    },

    addComment: async (setupId, commentData) => {
        try {
            const newComment = {
                setupId,
                text: commentData.text,
                author: commentData.author,
                userId: commentData.userId,
                avatar: commentData.avatar,
                timestamp: new Date().toISOString()
            };

            const docRef = await addDoc(commentsCol, newComment);

            // Increment comment count
            const setupRef = doc(db, 'setups', setupId);
            await updateDoc(setupRef, {
                comments: increment(1)
            });

            return { id: docRef.id, ...newComment };
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    // Setup Management
    addSetup: async (setupData) => {
        try {
            console.log('🔵 addSetup called with data:', setupData);

            // Validate required fields
            if (!setupData.title || !setupData.caption) {
                throw new Error('Missing required fields: title or caption');
            }

            const newSetup = {
                ...setupData,
                likes: [],
                saves: [],
                comments: 0,
                createdAt: new Date().toISOString()
            };

            console.log('🔵 Calling addDoc with data:', JSON.stringify(newSetup, null, 2));
            const docRef = await addDoc(setupsCol, newSetup);
            console.log('✅ Setup added successfully with ID:', docRef.id);

            return { success: true, setup: { id: docRef.id, ...newSetup } };
        } catch (error) {
            console.error('❌ addSetup FAILED:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('Full error:', JSON.stringify(error, null, 2));

            // Provide specific error messages
            if (error.code === 'permission-denied') {
                return { success: false, message: 'Permission denied. Check Firestore Security Rules.' };
            } else if (error.code === 'unavailable') {
                return { success: false, message: 'Network error. Check your internet connection.' };
            }

            return { success: false, message: error.message || 'Unknown error occurred' };
        }
    },

    deleteSetup: async (setupId) => {
        try {
            await deleteDoc(doc(db, 'setups', setupId));
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateSetup: async (setupId, updates) => {
        try {
            const setupRef = doc(db, 'setups', setupId);
            await updateDoc(setupRef, updates);
            // Return updated data manually roughly as updateDoc doesn't return it
            return { success: true, setup: { id: setupId, ...updates } };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // Blog Management
    addBlog: async (blog) => {
        try {
            console.log('🔵 addBlog called with data:', blog);

            // Validate required fields
            if (!blog.title || !blog.excerpt || !blog.content) {
                throw new Error('Missing required fields: title, excerpt, or content');
            }

            const newBlog = {
                ...blog,
                views: 0,
                publishedAt: new Date().toISOString()
            };

            console.log('🔵 Calling addDoc with data:', JSON.stringify(newBlog, null, 2));
            const docRef = await addDoc(blogsCol, newBlog);
            console.log('✅ Blog added successfully with ID:', docRef.id);

            return { ...newBlog, id: docRef.id };
        } catch (error) {
            console.error('❌ addBlog FAILED:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);

            if (error.code === 'permission-denied') {
                throw new Error('Permission denied. Check Firestore Security Rules.');
            }

            throw error;
        }
    },

    subscribeNewsletter: async (sub) => {
        try {
            await addDoc(newsletterCol, {
                ...sub,
                timestamp: new Date().toISOString()
            });
            return { success: true };
        } catch (error) {
            console.error(error);
            return { success: false };
        }
    },

    incrementBlogView: async (blogId) => {
        try {
            const blogRef = doc(db, 'blogs', blogId);
            await updateDoc(blogRef, {
                views: increment(1)
            });
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    },

    deleteBlog: async (blogId) => {
        try {
            await deleteDoc(doc(db, 'blogs', blogId));
            return { success: true };
        } catch (error) {
            console.error(error);
            return { success: false };
        }
    },

    updateBlog: async (blogId, updates) => {
        try {
            const blogRef = doc(db, 'blogs', blogId);
            await updateDoc(blogRef, updates);
            return { success: true, blog: { id: blogId, ...updates } };
        } catch (error) {
            return { success: false };
        }
    },

    uploadFile: async (file) => {
        try {
            // Simple upload for images
            const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
            const metadata = { contentType: file.type };

            console.log(`Starting image upload for ${file.name}`);
            const snapshot = await uploadBytes(storageRef, file, metadata);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        } catch (error) {
            console.error("Upload failed:", error);
            if (error.code === 'storage/unauthorized') {
                throw new Error("Không có quyền tải lên (Lỗi Storage Rules)");
            }
            // Helper for CORS/Network issues which often appear as 'storage/unknown' or generic errors
            if (error.message.includes('network') || error.code === 'storage/retry-limit-exceeded' || error.code === 'storage/unknown') {
                console.warn("Potential CORS or Network issue. Ensure cors.json is configured on the bucket.");
            }
            throw error;
        }
    },

    uploadVideo: async (file, onProgress) => {
        return new Promise((resolve, reject) => {
            const storageRef = ref(storage, `videos/${Date.now()}_${file.name}`);
            const metadata = { contentType: file.type };
            const uploadTask = uploadBytesResumable(storageRef, file, metadata);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    if (onProgress) onProgress(progress);
                },
                (error) => {
                    console.error("Video upload failed:", error);
                    if (error.code === 'storage/unauthorized') {
                        reject(new Error("Không có quyền tải lên video (Lỗi Storage Rules)"));
                    } else if (error.code === 'storage/canceled') {
                        reject(new Error("Đã hủy tải lên"));
                    } else {
                        reject(error);
                    }
                },
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve(downloadURL);
                    } catch (err) {
                        reject(err);
                    }
                }
            );
        });
    }
};
