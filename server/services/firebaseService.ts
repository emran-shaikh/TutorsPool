// Firebase Service - Secure configuration using environment variables
import * as admin from 'firebase-admin';

interface FirebaseConfig {
  projectId: string;
  privateKey: string;
  clientEmail: string;
  privateKeyId: string;
  clientId: string;
  authUri: string;
  tokenUri: string;
}

class FirebaseService {
  private firestore: admin.firestore.Firestore;
  private config: FirebaseConfig | null = null;
  private initialized: boolean = false;

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    try {
      // Load Firebase Admin SDK configuration from environment variables
      this.config = {
        projectId: process.env.FIREBASE_PROJECT_ID || '',
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
        privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID || '',
        clientId: process.env.FIREBASE_CLIENT_ID || '',
        authUri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
        tokenUri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token'
      };

      // Validate required fields
      const requiredFields = ['projectId', 'privateKey', 'clientEmail'];
      const missingFields = requiredFields.filter(field => !this.config![field as keyof FirebaseConfig]);

      if (missingFields.length > 0) {
        console.warn(`⚠️  Firebase Admin SDK: Missing required environment variables: ${missingFields.join(', ')}`);
        this.config = null;
        return;
      }

      this.initializeFirebase();
      
    } catch (error) {
      console.error('❌ Failed to load Firebase configuration:', error);
      this.config = null;
    }
  }

  private initializeFirebase() {
    if (!this.config) {
      console.log('🚫 Firebase Admin SDK not configured - check environment variables');
      return;
    }

    try {
      // Initialize Firebase Admin SDK with environment variables
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.config.projectId,
          privateKey: this.config.privateKey,
          clientEmail: this.config.clientEmail,
          privateKeyId: this.config.privateKeyId,
          clientId: this.config.clientId,
          authUri: this.config.authUri,
          tokenUri: this.config.tokenUri
        }),
        projectId: this.config.projectId,
        storageBucket: `${this.config.projectId}.firebasestorage.app`
      });

      this.firestore = admin.firestore();
      this.initialized = true;
      console.log('🔥 Firebase Admin SDK initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Admin SDK:', error);
      this.config = null;
      this.initialized = false;
    }
  }

  // Check if Firebase is properly configured
  isConfigured(): boolean {
    return this.initialized && this.config !== null;
  }

  // Get Firestore instance
  getFirestore(): admin.firestore.Firestore | null {
    if (this.isConfigured()) {
      return this.firestore;
    }
    console.warn('⚠️  Firebase not configured - Firestore unavailable');
    return null;
  }

  // User Management
  async createUser(userData: any) {
    if (!this.isConfigured()) {
      throw new Error('Firebase not configured');
    }

    try {
      const userDoc = {
        ...userData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        id: this.firestore.collection('users').doc().id
      };

      await this.firestore.collection('users').doc(userDoc.id).set(userDoc);
      return userDoc;
    } catch (error) {
      console.error('Firebase createUser error:', error);
      throw error;
    }
  }

  async getUserById(id: string) {
    if (!this.isConfigured()) {
      console.log('Firebase not configured - skipping getUserById');
      return null;
    }

    try {
      const userDoc = await this.firestore.collection('users').doc(id).get();
      if (!userDoc.exists) {
        return null;
      }
      return userDoc.data();
    } catch (error) {
      console.error('Firebase getUserById error:', error);
      return null;
    }
  }

  async getUserByEmail(email: string) {
    if (!this.isConfigured()) {
      console.log('Firebase not configured - skipping getUserByEmail');
      return null;
    }

    try {
      const userSnapshot = await this.firestore
        .collection('users')
        .where('email', '==', email)
        .limit(1)
        .get();

      if (userSnapshot.empty) {
        return null;
      }

      return userSnapshot.docs[0].data();
    } catch (error) {
      console.error('Firebase getUserByEmail error:', error);
      return null;
    }
  }

  async updateUser(id: string, updates: any) {
    if (!this.isConfigured()) {
      throw new Error('Firebase not configured');
    }

    try {
      const updateData = {
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await this.firestore.collection('users').doc(id).update(updateData);
      return true;
    } catch (error) {
      console.error('Firebase updateUser error:', error);
      throw error;
    }
  }

  async deleteUser(id: string) {
    if (!this.isConfigured()) {
      throw new Error('Firebase not configured');
    }

    try {
      await this.firestore.collection('users').doc(id).delete();
      return true;
    } catch (error) {
      console.error('Firebase deleteUser error:', error);
      throw error;
    }
  }

  // Collection Management Methods
  async getAllUsers() {
    if (!this.isConfigured()) {
      console.log('Firebase not configured - skipping getAllUsers');
      return [];
    }

    try {
      const snapshot = await this.firestore.collection('users').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Firebase getAllUsers error:', error);
      return [];
    }
  }

  // Tutor Management
  async createTutor(tutorData: any) {
    if (!this.isConfigured()) {
      throw new Error('Firebase not configured');
    }

    try {
      const tutorDoc = {
        ...tutorData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        id: this.firestore.collection('tutors').doc().id
      };

      await this.firestore.collection('tutors').doc(tutorDoc.id).set(tutorDoc);
      return tutorDoc;
    } catch (error) {
      console.error('Firebase createTutor error:', error);
      throw error;
    }
  }

  async getAllTutors() {
    if (!this.isConfigured()) {
      console.log('Firebase not configured - skipping getAllTutors');
      return [];
    }

    try {
      const snapshot = await this.firestore.collection('tutors').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Firebase getAllTutors error:', error);
      return [];
    }
  }

  // Utility method to clear all data (for testing/reset)
  async clearAllData() {
    if (!this.isConfigured()) {
      console.log('Firebase not configured - skipping clearAllData');
      return;
    }

    try {
      const collections = ['users', 'tutors', 'students', 'bookings'];
      
      for (const collection of collections) {
        const snapshot = await this.firestore.collection(collection).get();
        const batch = this.firestore.batch();
        
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
        console.log(`🗑️  Cleared ${collection} collection`);
      }
    } catch (error) {
      console.error('Firebase clearAllData error:', error);
      throw error;
    }
  }
}

export const firebaseService = new FirebaseService();
export default firebaseService;
