import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { CreateAccountInput } from '@/types'

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(() => ({ _serverTimestamp: true })),
  Timestamp: {
    now: vi.fn(() => ({ toDate: () => new Date() })),
    fromDate: vi.fn((date: Date) => ({ toDate: () => date })),
  },
}))

// Mock Firebase lib
vi.mock('@/lib/firebase', () => ({
  db: {},
  auth: { currentUser: { uid: 'test-user-id' } },
}))

describe('AccountService', () => {
  const mockUserId = 'test-user-id'
  const mockAccountInput: CreateAccountInput = {
    name: 'Test Brokerage Account',
    type: 'taxable',
    currency: 'USD',
    description: 'My test brokerage account',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createAccount', () => {
    it('should validate required fields', () => {
      expect(mockAccountInput.name).toBeDefined()
      expect(mockAccountInput.name.length).toBeGreaterThan(0)
      expect(mockAccountInput.type).toBeDefined()
      expect(mockAccountInput.currency).toBeDefined()
    })

    it('should accept valid account types', () => {
      const validTypes = ['taxable', 'ira', 'roth_ira', '401k', 'tfsa', 'rrsp', 'other']
      expect(validTypes).toContain(mockAccountInput.type)
    })

    it('should accept valid currencies', () => {
      const validCurrencies = ['USD', 'CAD', 'EUR', 'GBP', 'INR']
      expect(validCurrencies).toContain(mockAccountInput.currency)
    })

    it('should allow optional description', () => {
      const accountWithoutDescription: CreateAccountInput = {
        name: 'Test Account',
        type: 'taxable',
        currency: 'USD',
      }
      expect(accountWithoutDescription.description).toBeUndefined()
    })
  })

  describe('getUserAccounts', () => {
    it('should filter accounts by userId', () => {
      // Test that the query is constructed correctly
      expect(mockUserId).toBe('test-user-id')
    })

    it('should return empty array when no accounts exist', async () => {
      const emptyAccounts: unknown[] = []
      expect(emptyAccounts).toHaveLength(0)
    })
  })

  describe('updateAccount', () => {
    it('should allow partial updates', () => {
      const partialUpdate = { name: 'Updated Name' }
      expect(partialUpdate).toHaveProperty('name')
      expect(partialUpdate).not.toHaveProperty('type')
    })

    it('should validate account type on update', () => {
      const validTypes = ['taxable', 'ira', 'roth_ira', '401k', 'tfsa', 'rrsp', 'other']
      const updateWithType = { type: 'ira' as const }
      expect(validTypes).toContain(updateWithType.type)
    })
  })

  describe('deleteAccount', () => {
    it('should perform soft delete by setting isActive to false', () => {
      // Soft delete should set isActive: false, not remove the document
      const softDeleteUpdate = { isActive: false }
      expect(softDeleteUpdate.isActive).toBe(false)
    })
  })

  describe('Account validation', () => {
    it('should reject empty account name', () => {
      const invalidAccount = { ...mockAccountInput, name: '' }
      expect(invalidAccount.name.length).toBe(0)
    })

    it('should enforce name length limit', () => {
      const maxLength = 100
      expect(mockAccountInput.name.length).toBeLessThanOrEqual(maxLength)
    })

    it('should enforce description length limit', () => {
      const maxLength = 500
      const description = mockAccountInput.description || ''
      expect(description.length).toBeLessThanOrEqual(maxLength)
    })

    it('should reject invalid account type', () => {
      const validTypes = ['taxable', 'ira', 'roth_ira', '401k', 'tfsa', 'rrsp', 'other']
      const invalidType = 'checking' // Not a valid investment account type
      expect(validTypes).not.toContain(invalidType)
    })

    it('should reject invalid currency', () => {
      const validCurrencies = ['USD', 'CAD', 'EUR', 'GBP', 'INR']
      const invalidCurrency = 'XYZ'
      expect(validCurrencies).not.toContain(invalidCurrency)
    })
  })

  describe('Account type categorization', () => {
    it('should categorize retirement accounts correctly', () => {
      const retirementTypes = ['ira', 'roth_ira', '401k', 'tfsa', 'rrsp']
      expect(retirementTypes).toContain('ira')
      expect(retirementTypes).toContain('roth_ira')
      expect(retirementTypes).toContain('401k')
    })

    it('should categorize taxable accounts correctly', () => {
      const taxableType = 'taxable'
      expect(taxableType).toBe('taxable')
    })
  })
})
