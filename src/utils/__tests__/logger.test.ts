
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from '../logger';

// Mock console methods
const mockConsole = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

Object.assign(console, mockConsole);

describe('logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should log debug messages', () => {
    logger.debug('Debug message', { data: 'test' });
    
    expect(mockConsole.debug).toHaveBeenCalledWith(
      '[DEBUG]',
      'Debug message',
      { data: 'test' }
    );
  });

  it('should log info messages', () => {
    logger.info('Info message', { data: 'test' });
    
    expect(mockConsole.info).toHaveBeenCalledWith(
      '[INFO]',
      'Info message',
      { data: 'test' }
    );
  });

  it('should log warning messages', () => {
    logger.warn('Warning message', { data: 'test' });
    
    expect(mockConsole.warn).toHaveBeenCalledWith(
      '[WARN]',
      'Warning message',
      { data: 'test' }
    );
  });

  it('should log error messages', () => {
    logger.error('Error message', { data: 'test' });
    
    expect(mockConsole.error).toHaveBeenCalledWith(
      '[ERROR]',
      'Error message',
      { data: 'test' }
    );
  });

  it('should handle messages without extra data', () => {
    logger.info('Simple message');
    
    expect(mockConsole.info).toHaveBeenCalledWith(
      '[INFO]',
      'Simple message'
    );
  });
});
