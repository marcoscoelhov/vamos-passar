
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCacheManager } from '../useCacheManager';

// Mock Date.now for consistent testing
const mockNow = 1640995200000; // 2022-01-01T00:00:00.000Z
vi.spyOn(Date, 'now').mockImplementation(() => mockNow);

describe('useCacheManager', () => {
  it('should set and get cache entries', () => {
    const { result } = renderHook(() => useCacheManager<string>());

    act(() => {
      result.current.setCacheEntry('test-key', 'test-value');
    });

    const cachedValue = result.current.getCacheEntry('test-key');
    expect(cachedValue).toBe('test-value');
  });

  it('should return null for expired cache entries', () => {
    const { result } = renderHook(() => useCacheManager<string>());

    act(() => {
      result.current.setCacheEntry('test-key', 'test-value');
    });

    // Mock time advancing beyond cache duration (5 minutes)
    vi.spyOn(Date, 'now').mockImplementation(() => mockNow + 6 * 60 * 1000);

    const cachedValue = result.current.getCacheEntry('test-key');
    expect(cachedValue).toBeNull();
  });

  it('should invalidate specific cache entries', () => {
    const { result } = renderHook(() => useCacheManager<string>());

    act(() => {
      result.current.setCacheEntry('test-key-1', 'value-1');
      result.current.setCacheEntry('test-key-2', 'value-2');
    });

    act(() => {
      result.current.invalidateCache('test-key-1');
    });

    expect(result.current.getCacheEntry('test-key-1')).toBeNull();
    expect(result.current.getCacheEntry('test-key-2')).toBe('value-2');
  });

  it('should clear all cache entries', () => {
    const { result } = renderHook(() => useCacheManager<string>());

    act(() => {
      result.current.setCacheEntry('test-key-1', 'value-1');
      result.current.setCacheEntry('test-key-2', 'value-2');
    });

    act(() => {
      result.current.invalidateCache();
    });

    expect(result.current.getCacheEntry('test-key-1')).toBeNull();
    expect(result.current.getCacheEntry('test-key-2')).toBeNull();
  });
});
