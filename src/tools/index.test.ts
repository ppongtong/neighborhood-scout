import { describe, it, expect } from 'vitest';
import { handleToolCall, getAffordability } from './index';

describe('getAffordability', () => {
  it('should return Highly Affordable for low rent-to-budget ratios', () => {
    expect(getAffordability(5000, 2000)).toBe('Highly Affordable'); // 40%
  });

  it('should return Affordable for ratios up to 80%', () => {
    expect(getAffordability(3000, 2100)).toBe('Affordable'); // 70%
  });

  it('should return Moderate for ratios up to 100%', () => {
    expect(getAffordability(2000, 1900)).toBe('Moderate'); // 95%
  });

  it('should return Expensive for ratios up to 125%', () => {
    expect(getAffordability(2000, 2400)).toBe('Expensive'); // 120%
  });

  it('should return Unaffordable for high ratios', () => {
    expect(getAffordability(2000, 3000)).toBe('Unaffordable'); // 150%
  });
});

describe('handleToolCall - calculate_budget_fit', () => {
  it('should calculate budget fit correctly', async () => {
    const args = {
      neighborhood: 'Jersey City',
      user_budget: 5000,
      average_rent: 2500,
    };
    const result = await handleToolCall('calculate_budget_fit', args);
    expect(result.neighborhood).toBe('Jersey City');
    expect(result.score).toBe('10.0'); // (5000/2500)*100 = 200, 200/20 = 10
    expect(result.verdict).toBe('Highly Affordable');
  });

  it('should handle expensive neighborhoods', async () => {
    const args = {
      neighborhood: 'Manhattan',
      user_budget: 2000,
      average_rent: 4000,
    };
    const result = await handleToolCall('calculate_budget_fit', args);
    expect(result.score).toBe('2.5'); // (2000/4000)*100 = 50, 50/20 = 2.5
    expect(result.verdict).toBe('Unaffordable');
  });
});

describe('handleToolCall - other tools', () => {
  it('should handle save_favorite', async () => {
    const args = { neighborhood: 'The Heights', reason: 'Great vibe' };
    const result = await handleToolCall('save_favorite', args);
    expect(result.status).toBe('success');
    expect(result.message).toContain('The Heights');
  });

  it('should handle generate_comparison_matrix', async () => {
    const neighborhoods = [{ name: 'A', safety_score: 8 }, { name: 'B', safety_score: 7 }];
    const result = await handleToolCall('generate_comparison_matrix', { neighborhoods });
    expect(result.matrix).toEqual(neighborhoods);
  });

  it('should throw error for unknown tools', async () => {
    await expect(handleToolCall('unknown', {})).rejects.toThrow('Tool unknown not found');
  });
});
