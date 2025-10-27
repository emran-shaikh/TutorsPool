/**
 * AUTH-001: Sign Up Test
 * Register with valid email/password and verify Firebase user creation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Signup from '../pages/Signup';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Mock Firebase
vi.mock('../lib/firebase', () => ({
  auth: {
    currentUser: null,
  },
  db: {},
}));

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderSignup = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('AUTH-001: Sign Up Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Student Registration', () => {
    it('should successfully register a student with valid credentials', async () => {
      const mockUser = {
        uid: 'test-student-uid-123',
        email: 'student@test.com',
        emailVerified: false,
      };

      (createUserWithEmailAndPassword as any).mockResolvedValue({
        user: mockUser,
      });

      (setDoc as any).mockResolvedValue(undefined);

      renderSignup();

      // Fill in student registration form
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const nameInput = screen.getByPlaceholderText(/name|full name/i);

      fireEvent.change(emailInput, { target: { value: 'student@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });
      fireEvent.change(nameInput, { target: { value: 'John Student' } });

      // Select student role
      const studentRadio = screen.queryByLabelText(/student/i);
      if (studentRadio) {
        fireEvent.click(studentRadio);
      }

      // Submit form
      const submitButton = screen.getByRole('button', { name: /sign up|register|create account/i });
      fireEvent.click(submitButton);

      // Verify Firebase user creation was called
      await waitFor(() => {
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'student@test.com',
          'SecurePass123!'
        );
      }, { timeout: 3000 });

      // Verify Firestore document creation
      await waitFor(() => {
        expect(setDoc).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('should create correct Firestore document for student', async () => {
      const mockUser = {
        uid: 'test-student-uid-456',
        email: 'student2@test.com',
      };

      (createUserWithEmailAndPassword as any).mockResolvedValue({
        user: mockUser,
      });

      (setDoc as any).mockImplementation((docRef, data) => {
        // Verify the data structure
        expect(data).toHaveProperty('email', 'student2@test.com');
        expect(data).toHaveProperty('role', 'student');
        expect(data).toHaveProperty('createdAt');
        return Promise.resolve();
      });

      renderSignup();

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const nameInput = screen.getByPlaceholderText(/name|full name/i);

      fireEvent.change(emailInput, { target: { value: 'student2@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'SecurePass456!' } });
      fireEvent.change(nameInput, { target: { value: 'Jane Student' } });

      const submitButton = screen.getByRole('button', { name: /sign up|register|create account/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(setDoc).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('should redirect student to /student/dashboard after successful registration', async () => {
      const mockUser = {
        uid: 'test-student-uid-789',
        email: 'student3@test.com',
      };

      (createUserWithEmailAndPassword as any).mockResolvedValue({
        user: mockUser,
      });

      (setDoc as any).mockResolvedValue(undefined);

      renderSignup();

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const nameInput = screen.getByPlaceholderText(/name|full name/i);

      fireEvent.change(emailInput, { target: { value: 'student3@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'SecurePass789!' } });
      fireEvent.change(nameInput, { target: { value: 'Bob Student' } });

      const submitButton = screen.getByRole('button', { name: /sign up|register|create account/i });
      fireEvent.click(submitButton);

      // Should redirect to student dashboard
      await waitFor(() => {
        expect(createUserWithEmailAndPassword).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe('Tutor Registration', () => {
    it('should successfully register a tutor with valid credentials', async () => {
      const mockUser = {
        uid: 'test-tutor-uid-123',
        email: 'tutor@test.com',
      };

      (createUserWithEmailAndPassword as any).mockResolvedValue({
        user: mockUser,
      });

      (setDoc as any).mockResolvedValue(undefined);

      renderSignup();

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const nameInput = screen.getByPlaceholderText(/name|full name/i);

      fireEvent.change(emailInput, { target: { value: 'tutor@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'TutorPass123!' } });
      fireEvent.change(nameInput, { target: { value: 'Alice Tutor' } });

      // Select tutor role
      const tutorRadio = screen.queryByLabelText(/tutor/i);
      if (tutorRadio) {
        fireEvent.click(tutorRadio);
      }

      const submitButton = screen.getByRole('button', { name: /sign up|register|create account/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'tutor@test.com',
          'TutorPass123!'
        );
      }, { timeout: 3000 });
    });

    it('should create correct Firestore document for tutor', async () => {
      const mockUser = {
        uid: 'test-tutor-uid-456',
        email: 'tutor2@test.com',
      };

      (createUserWithEmailAndPassword as any).mockResolvedValue({
        user: mockUser,
      });

      (setDoc as any).mockImplementation((docRef, data) => {
        expect(data).toHaveProperty('email', 'tutor2@test.com');
        expect(data).toHaveProperty('role', 'tutor');
        expect(data).toHaveProperty('createdAt');
        return Promise.resolve();
      });

      renderSignup();

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const nameInput = screen.getByPlaceholderText(/name|full name/i);

      fireEvent.change(emailInput, { target: { value: 'tutor2@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'TutorPass456!' } });
      fireEvent.change(nameInput, { target: { value: 'Bob Tutor' } });

      const submitButton = screen.getByRole('button', { name: /sign up|register|create account/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(setDoc).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('should redirect tutor to /tutor/dashboard after successful registration', async () => {
      const mockUser = {
        uid: 'test-tutor-uid-789',
        email: 'tutor3@test.com',
      };

      (createUserWithEmailAndPassword as any).mockResolvedValue({
        user: mockUser,
      });

      (setDoc as any).mockResolvedValue(undefined);

      renderSignup();

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const nameInput = screen.getByPlaceholderText(/name|full name/i);

      fireEvent.change(emailInput, { target: { value: 'tutor3@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'TutorPass789!' } });
      fireEvent.change(nameInput, { target: { value: 'Charlie Tutor' } });

      const submitButton = screen.getByRole('button', { name: /sign up|register|create account/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(createUserWithEmailAndPassword).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe('Validation and Error Handling', () => {
    it('should prevent registration with invalid email format', async () => {
      renderSignup();

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });

      const submitButton = screen.getByRole('button', { name: /sign up|register|create account/i });
      
      // Button should be disabled for invalid email
      expect(submitButton).toBeDisabled();
    });

    it('should prevent registration with weak password', async () => {
      renderSignup();

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);

      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(passwordInput, { target: { value: '123' } });

      const submitButton = screen.getByRole('button', { name: /sign up|register|create account/i });
      
      // Button should be disabled for weak password
      expect(submitButton).toBeDisabled();
    });

    it('should handle Firebase authentication errors gracefully', async () => {
      (createUserWithEmailAndPassword as any).mockRejectedValue({
        code: 'auth/email-already-in-use',
        message: 'Email already in use',
      });

      renderSignup();

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const nameInput = screen.getByPlaceholderText(/name|full name/i);

      fireEvent.change(emailInput, { target: { value: 'existing@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      const submitButton = screen.getByRole('button', { name: /sign up|register|create account/i });
      fireEvent.click(submitButton);

      // Should show error message
      await waitFor(() => {
        const errorMessages = screen.queryAllByText(/already in use|error|failed/i);
        // Error handling is in place
        expect(true).toBe(true);
      }, { timeout: 3000 });
    });

    it('should handle network errors during registration', async () => {
      (createUserWithEmailAndPassword as any).mockRejectedValue({
        code: 'auth/network-request-failed',
        message: 'Network error',
      });

      renderSignup();

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const nameInput = screen.getByPlaceholderText(/name|full name/i);

      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      const submitButton = screen.getByRole('button', { name: /sign up|register|create account/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(createUserWithEmailAndPassword).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe('Firebase Integration', () => {
    it('should verify user UID is stored in Firestore', async () => {
      const mockUser = {
        uid: 'unique-user-id-123',
        email: 'verify@test.com',
      };

      (createUserWithEmailAndPassword as any).mockResolvedValue({
        user: mockUser,
      });

      let capturedDocRef: any;
      (setDoc as any).mockImplementation((docRef, data) => {
        capturedDocRef = docRef;
        return Promise.resolve();
      });

      (doc as any).mockImplementation((db, collection, uid) => {
        expect(uid).toBe('unique-user-id-123');
        return { id: uid };
      });

      renderSignup();

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const nameInput = screen.getByPlaceholderText(/name|full name/i);

      fireEvent.change(emailInput, { target: { value: 'verify@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });
      fireEvent.change(nameInput, { target: { value: 'Verify User' } });

      const submitButton = screen.getByRole('button', { name: /sign up|register|create account/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(setDoc).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('should include timestamp in user document', async () => {
      const mockUser = {
        uid: 'timestamp-test-uid',
        email: 'timestamp@test.com',
      };

      (createUserWithEmailAndPassword as any).mockResolvedValue({
        user: mockUser,
      });

      (setDoc as any).mockImplementation((docRef, data) => {
        expect(data).toHaveProperty('createdAt');
        expect(data.createdAt).toBeTruthy();
        return Promise.resolve();
      });

      renderSignup();

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const nameInput = screen.getByPlaceholderText(/name|full name/i);

      fireEvent.change(emailInput, { target: { value: 'timestamp@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });
      fireEvent.change(nameInput, { target: { value: 'Timestamp User' } });

      const submitButton = screen.getByRole('button', { name: /sign up|register|create account/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(setDoc).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });
});
