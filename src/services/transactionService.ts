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
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type {
  Transaction,
  TransactionType,
  CreateTransactionInput,
  UpdateTransactionInput,
} from '@/types'

// Root-level transactions collection (flat structure per data model)
const transactionsCollection = collection(db, 'transactions')

// Create a new transaction
export const createTransaction = async (
  userId: string,
  input: CreateTransactionInput
): Promise<Transaction> => {
  const transactionData = {
    userId,
    accountId: input.accountId,
    symbol: input.symbol.toUpperCase(),
    type: input.type,
    date: Timestamp.fromDate(input.date),
    quantity: input.quantity,
    unitPrice: input.unitPrice,
    totalAmount: input.totalAmount,
    currency: input.currency,
    fees: input.fees || 0,
    commission: input.commission || 0,
    mer: input.mer,
    notes: input.notes || null,
    splitRatio: input.splitRatio || null,
    cashInLieu: input.cashInLieu,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  const docRef = await addDoc(transactionsCollection, transactionData)

  return {
    id: docRef.id,
    userId,
    accountId: input.accountId,
    symbol: input.symbol.toUpperCase(),
    type: input.type,
    date: input.date,
    quantity: input.quantity,
    unitPrice: input.unitPrice,
    totalAmount: input.totalAmount,
    currency: input.currency,
    fees: input.fees || 0,
    commission: input.commission || 0,
    mer: input.mer,
    notes: input.notes,
    splitRatio: input.splitRatio,
    cashInLieu: input.cashInLieu,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

// Get a single transaction by ID
export const getTransaction = async (
  transactionId: string
): Promise<Transaction | null> => {
  const docRef = doc(transactionsCollection, transactionId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  return mapFirestoreToTransaction(docSnap.id, docSnap.data())
}

// Get all transactions for a user
export const getUserTransactions = async (
  userId: string,
  limitCount = 100
): Promise<Transaction[]> => {
  const q = query(
    transactionsCollection,
    where('userId', '==', userId),
    orderBy('date', 'desc'),
    limit(limitCount)
  )

  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => mapFirestoreToTransaction(doc.id, doc.data()))
}

// Get transactions for a specific account
export const getAccountTransactions = async (
  userId: string,
  accountId: string
): Promise<Transaction[]> => {
  const q = query(
    transactionsCollection,
    where('userId', '==', userId),
    where('accountId', '==', accountId),
    orderBy('date', 'asc')
  )

  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => mapFirestoreToTransaction(doc.id, doc.data()))
}

// Get transactions for a specific symbol across all accounts
export const getSymbolTransactions = async (
  userId: string,
  symbol: string
): Promise<Transaction[]> => {
  const q = query(
    transactionsCollection,
    where('userId', '==', userId),
    where('symbol', '==', symbol.toUpperCase()),
    orderBy('date', 'asc')
  )

  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => mapFirestoreToTransaction(doc.id, doc.data()))
}

// Get transactions by type
export const getTransactionsByType = async (
  userId: string,
  type: TransactionType
): Promise<Transaction[]> => {
  const q = query(
    transactionsCollection,
    where('userId', '==', userId),
    where('type', '==', type),
    orderBy('date', 'desc')
  )

  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => mapFirestoreToTransaction(doc.id, doc.data()))
}

// Get transactions within a date range
export const getTransactionsByDateRange = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Transaction[]> => {
  const q = query(
    transactionsCollection,
    where('userId', '==', userId),
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('date', '<=', Timestamp.fromDate(endDate)),
    orderBy('date', 'desc')
  )

  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => mapFirestoreToTransaction(doc.id, doc.data()))
}

// Update a transaction
export const updateTransaction = async (
  transactionId: string,
  input: UpdateTransactionInput
): Promise<void> => {
  const docRef = doc(transactionsCollection, transactionId)

  const updateData: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  }

  if (input.accountId !== undefined) updateData.accountId = input.accountId
  if (input.symbol !== undefined) updateData.symbol = input.symbol.toUpperCase()
  if (input.type !== undefined) updateData.type = input.type
  if (input.date !== undefined) updateData.date = Timestamp.fromDate(input.date)
  if (input.quantity !== undefined) updateData.quantity = input.quantity
  if (input.unitPrice !== undefined) updateData.unitPrice = input.unitPrice
  if (input.totalAmount !== undefined) updateData.totalAmount = input.totalAmount
  if (input.currency !== undefined) updateData.currency = input.currency
  if (input.fees !== undefined) updateData.fees = input.fees
  if (input.commission !== undefined) updateData.commission = input.commission
  if (input.mer !== undefined) updateData.mer = input.mer
  if (input.notes !== undefined) updateData.notes = input.notes
  if (input.splitRatio !== undefined) updateData.splitRatio = input.splitRatio
  if (input.cashInLieu !== undefined) updateData.cashInLieu = input.cashInLieu

  await updateDoc(docRef, updateData)
}

// Delete a transaction
export const deleteTransaction = async (transactionId: string): Promise<void> => {
  const docRef = doc(transactionsCollection, transactionId)
  await deleteDoc(docRef)
}

// Bulk create transactions (for CSV import)
export const bulkCreateTransactions = async (
  userId: string,
  transactions: CreateTransactionInput[]
): Promise<Transaction[]> => {
  const results: Transaction[] = []

  // Process in batches of 500 to avoid Firestore limits
  const batchSize = 500
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map((input) => createTransaction(userId, input))
    )
    results.push(...batchResults)
  }

  return results
}

// Helper function to map Firestore document to Transaction type
function mapFirestoreToTransaction(
  id: string,
  data: Record<string, unknown>
): Transaction {
  return {
    id,
    userId: data.userId as string,
    accountId: data.accountId as string,
    symbol: data.symbol as string,
    type: data.type as TransactionType,
    date: (data.date as Timestamp)?.toDate() || new Date(),
    quantity: data.quantity as number | undefined,
    unitPrice: data.unitPrice as number | undefined,
    totalAmount: data.totalAmount as number | undefined,
    currency: data.currency as string,
    fees: data.fees as number | undefined,
    commission: data.commission as number | undefined,
    mer: data.mer as number | undefined,
    notes: data.notes as string | undefined,
    splitRatio: data.splitRatio as string | undefined,
    cashInLieu: data.cashInLieu as number | undefined,
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
  }
}

// Calculate total cost basis for a symbol (for buy transactions)
export const calculateCostBasis = (transactions: Transaction[]): number => {
  return transactions
    .filter((t) => t.type === 'buy' || t.type === 'initial_position')
    .reduce((sum, t) => {
      const cost = (t.quantity || 0) * (t.unitPrice || 0) + (t.fees || 0) + (t.commission || 0)
      return sum + cost
    }, 0)
}

// Calculate total dividends received
export const calculateTotalDividends = (transactions: Transaction[]): number => {
  return transactions
    .filter((t) => t.type === 'dividend')
    .reduce((sum, t) => sum + (t.totalAmount || 0), 0)
}

// Get unique symbols from transactions
export const getUniqueSymbols = (transactions: Transaction[]): string[] => {
  const symbols = new Set(transactions.map((t) => t.symbol))
  return Array.from(symbols).sort()
}
