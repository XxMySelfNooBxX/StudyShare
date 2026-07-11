import { calculateUrgency, TaskUrgency, getDaysUntilDue } from '../urgencyCalculator';

describe('urgencyCalculator', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    // Fix current time to 2024-07-10 for tests
    jest.setSystemTime(new Date('2024-07-10T12:00:00Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('calculateUrgency', () => {
    it('returns SAFE when due date is null', () => {
      expect(calculateUrgency(null)).toBe(TaskUrgency.SAFE);
    });

    it('returns CRITICAL when overdue', () => {
      const overdue = new Date('2024-07-09T12:00:00Z');
      expect(calculateUrgency(overdue)).toBe(TaskUrgency.CRITICAL);
    });

    it('returns CRITICAL when due in 3 days or less', () => {
      const dueIn3Days = new Date('2024-07-13T12:00:00Z');
      expect(calculateUrgency(dueIn3Days)).toBe(TaskUrgency.CRITICAL);
    });

    it('returns WARNING when due in 4 to 7 days', () => {
      const dueIn5Days = new Date('2024-07-15T12:00:00Z');
      expect(calculateUrgency(dueIn5Days)).toBe(TaskUrgency.WARNING);
      
      const dueIn7Days = new Date('2024-07-17T12:00:00Z');
      expect(calculateUrgency(dueIn7Days)).toBe(TaskUrgency.WARNING);
    });

    it('returns SAFE when due in more than 7 days', () => {
      const dueIn10Days = new Date('2024-07-20T12:00:00Z');
      expect(calculateUrgency(dueIn10Days)).toBe(TaskUrgency.SAFE);
    });
  });

  describe('getDaysUntilDue', () => {
    it('returns null if no due date', () => {
      expect(getDaysUntilDue(null)).toBeNull();
    });

    it('returns correct days difference', () => {
      const dueIn5Days = new Date('2024-07-15T12:00:00Z');
      expect(getDaysUntilDue(dueIn5Days)).toBe(5);
    });
  });
});
