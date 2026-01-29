import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Account, AccountType, Currency, CreateAccountInput, UpdateAccountInput } from '@/types'

// Root-level accounts collection (flat structure per data model)
const accountsCollection = collection(db, 'accounts')

// Create a new account
export const createAccount = async (
  userId: string,
  input: CreateAccountInput
): Promise<Account> => {
  const accountData = {
    userId,
    name: input.name,
    type: input.type,
    currency: input.currency,
    description: input.description || null,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  const docRef = await addDoc(accountsCollection, accountData)

  return {
    id: docRef.id,
    userId,
    name: input.name,
    type: input.type,
    currency: input.currency,
    description: input.description,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

// Get all accounts for a user
export const getAccounts = async (userId: string): Promise<Account[]> => {
  const q = query(
    accountsCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return mapFirestoreToAccount(doc.id, data)
  })
}

// Get accounts by type
export const getAccountsByType = async (
  userId: string,
  type: AccountType
): Promise<Account[]> => {
  const q = query(
    accountsCollection,
    where('userId', '==', userId),
    where('type', '==', type),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return mapFirestoreToAccount(doc.id, data)
  })
}

// Get active accounts only
export const getActiveAccounts = async (userId: string): Promise<Account[]> => {
  const q = query(
    accountsCollection,
    where('userId', '==', userId),
    where('isActive', '==', true),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return mapFirestoreToAccount(doc.id, data)
  })
}

// Get a single account by ID
export const getAccount = async (
  accountId: string
): Promise<Account | null> => {
  const docRef = doc(accountsCollection, accountId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  return mapFirestoreToAccount(docSnap.id, docSnap.data())
}

// Update an account
export const updateAccount = async (
  accountId: string,
  input: UpdateAccountInput
): Promise<void> => {
  const docRef = doc(accountsCollection, accountId)

  const updateData: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  }

  if (input.name !== undefined) updateData.name = input.name
  if (input.type !== undefined) updateData.type = input.type
  if (input.currency !== undefined) updateData.currency = input.currency
  if (input.description !== undefined) updateData.description = input.description
  if (input.isActive !== undefined) updateData.isActive = input.isActive

  await updateDoc(docRef, updateData)
}

// Delete an account (soft delete by setting isActive to false)
export const deleteAccount = async (accountId: string): Promise<void> => {
  const docRef = doc(accountsCollection, accountId)
  await updateDoc(docRef, {
    isActive: false,
    updatedAt: serverTimestamp(),
  })
}

// Hard delete an account
export const hardDeleteAccount = async (accountId: string): Promise<void> => {
  const docRef = doc(accountsCollection, accountId)
  await deleteDoc(docRef)
}

// Helper function to map Firestore document to Account type
function mapFirestoreToAccount(id: string, data: Record<string, unknown>): Account {
  return {
    id,
    userId: data.userId as string,
    name: data.name as string,
    type: data.type as AccountType,
    currency: (data.currency as Currency) || 'USD',
    description: data.description as string | undefined,
    isActive: data.isActive as boolean ?? true,
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
  }
}

// Get account type display info
export const getAccountTypeInfo = (type: AccountType): {
  label: string
  description: string
} => {
  const typeInfo: Record<AccountType, { label: string; description: string }> = {
    taxable: { label: 'Taxable', description: 'Standard brokerage account' },
    ira: { label: 'IRA', description: 'Individual Retirement Account' },
    roth_ira: { label: 'Roth IRA', description: 'Roth Individual Retirement Account' },
    '401k': { label: '401(k)', description: 'Employer-sponsored retirement plan' },
    tfsa: { label: 'TFSA', description: 'Tax-Free Savings Account (Canada)' },
    rrsp: { label: 'RRSP', description: 'Registered Retirement Savings Plan (Canada)' },
    other: { label: 'Other', description: 'Other investment account' },
  }

  return typeInfo[type]
}
