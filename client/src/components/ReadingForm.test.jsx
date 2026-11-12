import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReadingForm from './ReadingForm';
import { api } from '../api';

// Pretend the server: these fake functions replace the real API calls
vi.mock('../api', () => ({
  api: { addReading: vi.fn(), updateReading: vi.fn() },
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('ReadingForm', () => {
  test('shows the date, time slot and value fields', () => {
    render(<ReadingForm onSaved={() => {}} />);
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Time slot')).toBeInTheDocument();
    expect(screen.getByLabelText('Glucose value (mg/dl)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add reading' })).toBeInTheDocument();
  });

  test('shows the server error message when saving fails', async () => {
    api.addReading.mockRejectedValue(new Error('Please enter a glucose value.'));
    const user = userEvent.setup();
    render(<ReadingForm onSaved={() => {}} />);

    await user.click(screen.getByRole('button', { name: 'Add reading' }));

    expect(await screen.findByText('Please enter a glucose value.')).toBeInTheDocument();
  });

  test('on success it sends the reading, clears the value and calls onSaved', async () => {
    api.addReading.mockResolvedValue({});
    const onSaved = vi.fn();
    const user = userEvent.setup();
    render(<ReadingForm onSaved={onSaved} />);

    const valueInput = screen.getByLabelText('Glucose value (mg/dl)');
    await user.type(valueInput, '120');
    await user.click(screen.getByRole('button', { name: 'Add reading' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    expect(api.addReading).toHaveBeenCalledWith(
      expect.objectContaining({ slot: 'morning', value: '120' })
    );
    expect(valueInput).toHaveValue('');
  });

  test('in edit mode it is pre-filled and updates the existing reading', async () => {
    api.updateReading.mockResolvedValue({});
    const onSaved = vi.fn();
    const user = userEvent.setup();
    const reading = { id: 7, date: '2026-11-10', slot: 'after_lunch', value: 150 };
    render(<ReadingForm reading={reading} onSaved={onSaved} onCancel={() => {}} />);

    expect(screen.getByLabelText('Date')).toHaveValue('2026-11-10');
    expect(screen.getByLabelText('Glucose value (mg/dl)')).toHaveValue('150');

    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(api.updateReading).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ slot: 'after_lunch', value: '150' })
    );
  });
});