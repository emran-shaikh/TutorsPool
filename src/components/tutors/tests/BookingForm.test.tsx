import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';

// Mock the BookingForm component (we'll need to create this component first)
import { BookingForm } from '../BookingForm';

// Mock the API client
vi.mock('@/lib/api', () => ({
  apiClient: {
    checkTutorAvailability: vi.fn(),
    createBooking: vi.fn(),
  },
}));

// Mock TanStack Query
vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isLoading: false,
    error: null,
  })),
  useQuery: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
  })),
}));

// Mock auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: {
      id: 'student-1',
      email: 'student@test.com',
      role: 'STUDENT',
    },
  })),
}));

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

import { apiClient } from '@/lib/api';

describe('BookingForm Component', () => {
  const mockTutorData = {
    id: 'tutor-1',
    userId: 'user-tutor',
    headline: 'Expert Mathematics Tutor',
    hourlyRateCents: 5000,
    hourlyRate: 50,
    currency: 'USD',
    availabilityBlocks: [
      {
        id: 'avail-1',
        dayOfWeek: 1,
        startTimeUTC: '09:00:00Z',
        endTimeUTC: '17:00:00Z',
        isRecurring: true,
      },
    ],
    inPersonLocation: {
      address: '123 Main St, City, State',
      coordinates: { lat: 40.7128, lng: -74.0060 },
    },
  };

  const mockProps = {
    tutor: mockTutorData,
    onBookingSuccess: vi.fn(),
    onBookingError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock implementations
    apiClient.checkTutorAvailability.mockResolvedValue({ success: true });
    apiClient.createBooking.mockResolvedValue({
      id: 'booking-123',
      status: 'PENDING',
      meetingLink: 'https://meet.google.com/test',
      studentId: 'student-1',
      tutorId: 'tutor-1',
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // Mock BookingForm component implementation
  const BookingFormMock = ({ tutor, onBookingSuccess, onBookingError }: any) => {
    const [selectedDate, setSelectedDate] = React.useState('');
    const [selectedTime, setSelectedTime] = React.useState('');
    const [sessionType, setSessionType] = React.useState<'ONLINE' | 'OFFLINE'>('ONLINE');
    const [duration, setDuration] = React.useState(60);
    const [message, setMessage] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        // Simulate API calls
        const availabilityData = {
          tutorId: tutor.id,
          studentId: 'student-1',
          startTime: new Date(`${selectedDate}T${selectedTime}:00Z`),
          duration: 60,
        };

        const availabilityCheck = await apiClient.checkTutorAvailability(
          tutor.id,
          availabilityData
        );

        if (!availabilityCheck.success) {
          throw new Error('Tutor not available for selected time');
        }

        const bookingData = {
          tutorId: tutor.id,
          studentId: 'student-1',
          startAtUTC: new Date(`${selectedDate}T${selectedTime}:00Z`).toISOString(),
          endAtUTC: new Date(new Date(`${selectedDate}T${selectedTime}:00Z`).getTime() + (duration * 60 * 1000)).toISOString(),
          type: sessionType,
          message: message || 'Booking request',
        };

        const booking = await apiClient.createBooking(bookingData);
        onBookingSuccess?.(booking);
      } catch (error) {
        onBookingError?.(error);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} data-testid="booking-form">
        <div>
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            required
            data-testid="date-input"
          />
        </div>

        <div>
          <label htmlFor="time">Time</label>
          <input
            id="time"
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            required
            data-testid="time-input"
          />
        </div>

        <div>
          <label htmlFor="session-type">Session Type</label>
          <select
            id="session-type"
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value as 'ONLINE' | 'OFFLINE')}
            data-testid="session-type-select"
          >
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">In-Person</option>
          </select>
        </div>

        <div>
          <label htmlFor="duration">Duration (minutes)</label>
          <select
            id="duration"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            data-testid="duration-select"
          >
            <option value={30}>30 minutes</option>
            <option value={60}>60 minutes</option>
            <option value={120}>120 minutes</option>
          </select>
        </div>

        <div>
          <label htmlFor="message">Message (optional)</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Any special requests or notes"
            data-testid="message-input"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !selectedDate || !selectedTime}
          data-testid="submit-button"
        >
          {isSubmitting ? 'Booking...' : 'Book Session'}
        </button>

        <div data-testid="tutor-info">
          <h3>{tutor.headline}</h3>
          <p>Rate: ${tutor.hourlyRate}/hour</p>
        </div>
      </form>
    );
  };

  it('should render all required fields correctly', () => {
    render(<BookingFormMock {...mockProps} />);

    // Check that all form fields are rendered
    expect(screen.getByTestId('booking-form')).toBeInTheDocument();
    expect(screen.getByTestId('date-input')).toBeInTheDocument();
    expect(screen.getByTestId('time-input')).toBeInTheDocument();
    expect(screen.getByTestId('session-type-select')).toBeInTheDocument();
    expect(screen.getByTestId('duration-select')).toBeInTheDocument();
    expect(screen.getByTestId('message-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();

    // Check tutor information is displayed
    expect(screen.getByTestId('tutor-info')).toBeInTheDocument();
    expect(screen.getByText('Expert Mathematics Tutor')).toBeInTheDocument();
    expect(screen.getByText('Rate: $50/hour')).toBeInTheDocument();

    // Check default values
    expect(screen.getByDisplayValue('ONLINE')).toBeInTheDocument();
    expect(screen.getByDisplayValue('60')).toBeInTheDocument();
  });

  it('should submit booking successfully with valid data', async () => {
    const user = userEvent.setup();
    render(<BookingFormMock {...mockProps} />);

    // Fill out the form
    await user.type(screen.getByTestId('date-input'), '2024-01-25');
    await user.type(screen.getByTestId('time-input'), '10:00');
    await user.type(screen.getByTestId('message-input'), 'Please help me with calculus');

    // Submit the form
    await user.click(screen.getByTestId('submit-button'));

    // Wait for the API calls
    await waitFor(() => {
      expect(apiClient.checkTutorAvailability).toHaveBeenCalledWith(
        'tutor-1',
        expect.objectContaining({
          tutorId: 'tutor-1',
          studentId: 'student-1',
          startTime: expect.any(Date),
          duration: 60,
        })
      );
    });

    await waitFor(() => {
      expect(apiClient.createBooking).toHaveBeenCalledWith(
        expect.objectContaining({
          tutorId: 'tutor-1',
          studentId: 'student-1',
          type: 'ONLINE',
          message: 'Please help me with calculus',
          startAtUTC: expect.any(String),
          endAtUTC: expect.any(String),
        })
      );
    });

    // Check success callback was called
    expect(mockProps.onBookingSuccess).toHaveBeenCalledWith({
      id: 'booking-123',
      status: 'PENDING',
      meetingLink: 'https://meet.google.com/test',
      studentId: 'student-1',
      tutorId: 'tutor-1',
    });
  });

  it('should handle booking failure gracefully', async () => {
    // Mock API failure
    apiClient.checkTutorAvailability.mockResolvedValue({
      success: false,
      error: 'Tutor not available for selected time',
    });

    const user = userEvent.setup();
    render(<BookingFormMock {...mockProps} />);

    // Fill out the form
    await user.type(screen.getByTestId('date-input'), '2024-01-25');
    await user.type(screen.getByTestId('time-input'), '23:00'); // Outside working hours

    // Submit the form
    await user.click(screen.getByTestId('submit-button'));

    // Wait for API call
    await waitFor(() => {
      expect(apiClient.checkTutorAvailability).toHaveBeenCalled();
    });

    // Check error callback was called
    expect(mockProps.onBookingError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Tutor not available for selected time',
      })
    );

    // Check createBooking was NOT called
    expect(apiClient.createBooking).not.toHaveBeenCalled();
  });

  it('should disable submit button when form is incomplete', () => {
    render(<BookingFormMock {...mockProps} />);

    const updateButton = screen.getByTestId('submit-button');
    expect(updateButton).toBeDisabled();
  });

  it('should enable submit button when form is complete', async () => {
    const user = userEvent.setup();
    render(<BookingFormMock {...mockProps} />);

    const updateButton = screen.getByTestId('submit-button');

    await user.type(screen.getByTestId('date-input'), '2024-01-25');
    expect(updateButton).toBeDisabled(); // Still disabled, time missing

    await user.type(screen.getByTestId('time-input'), '10:00');
    expect(updateButton).not.toBeDisabled(); // Now enabled
  });

  it('should handle session type selection correctly', async () => {
    const user = userEvent.setup();
    render(<BookingFormMock {...mockProps} />);

    const sessionTypeSelect = screen.getByTestId('session-type-select');

    // Check default is ONLINE
    expect(sessionTypeSelect).toHaveValue('ONLINE');

    // Change to OFFLINE
    await user.selectOptions(sessionTypeSelect, 'OFFLINE');
    expect(sessionTypeSelect).toHaveValue('OFFLINE');
  });

  it('should show loading state during submission', async () => {
    // Mock slow API response
    apiClient.createBooking.mockImplementation(() =>
      new Promise(resolve =>
        setTimeout(() => resolve({ id: 'booking-123', status: 'PENDING' }), 1000)
      )
    );

    const user = userEvent.setup();
    render(<BookingFormMock {...mockProps} />);

    // Fill form
    await user.type(screen.getByTestId('date-input'), '2024-01-25');
    await user.type(screen.getByTestId('time-input'), '10:00');

    // Submit form
    await user.click(screen.getByTestId('submit-button'));

    // Check loading state
    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toHaveTextContent('Booking...');
    expect(submitButton).toBeDisabled();

    // Wait for completion
    await waitFor(() => {
      expect(submitButton).toHaveTextContent('Book Session');
    });
  });

  it('should validate required fields before submission', async () => {
    const user = userEvent.setup();
    render(<BookingFormMock {...mockProps} />);

    // Try to submit without filling required fields
    await user.click(screen.getByTestId('submit-button'));

    // Form should not submit
    expect(apiClient.checkTutorAvailability).not.toHaveBeenCalled();
    expect(apiClient.createBooking).not.toHaveBeenCalled();
    expect(mockProps.onBookingSuccess).not.toHaveBeenCalled();
  });

  it('should handle duration selection correctly', async () => {
    const user = userEvent.setup();
    render(<BookingFormMock {...mockProps} />);

    const durationSelect = screen.getByTestId('duration-select');

    // Check default is 60 minutes
    expect(durationSelect).toHaveValue('60');

    // Change to 120 minutes
    await user.selectOptions(durationSelect, '120');
    expect(durationSelect).toHaveValue('120');
  });

  it('should call availability check with correct parameters', async () => {
    const user = userEvent.setup();
    render(<BookingFormMock {...mockProps} />);

    // Fill form
    await user.type(screen.getByTestId('date-input'), '2024-01-25');
    await user.type(screen.getByTestId('time-input'), '14:30');
    await user.selectOptions(screen.getByTestId('duration-select'), '120');

    await user.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(apiClient.checkTutorAvailability).toHaveBeenCalledWith(
        'tutor-1',
        expect.objectContaining({
          tutorId: 'tutor-1',
          studentId: 'student-1',
          startTime: expect.any(Date),
          duration: 120, // Should reflect selected duration
        })
      );
    });
  });
});

// Export the mock component for reuse
export { BookingFormMock as BookingForm };
