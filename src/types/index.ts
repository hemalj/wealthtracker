// User types
export type {
  User,
  UserPreferences,
  DashboardLayout,
  DashboardWidget,
  WidgetType,
  NotificationSettings,
  UserRole,
  AuthState,
  LoginCredentials,
  SignupCredentials,
  UpdateProfileInput,
} from './user.types'

// Account types
export type {
  Account,
  AccountType,
  CreateAccountInput,
  UpdateAccountInput,
  AccountSummary,
} from './account.types'

// Transaction types (investment portfolio tracking)
export type {
  Transaction,
  TransactionType,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilters,
  TransactionSummary,
  BulkTransactionImport,
  CSVColumnMapping,
} from './transaction.types'

// Re-export transaction type labels and descriptions
export {
  transactionTypeLabels,
  transactionTypeDescriptions,
} from './transaction.types'

// Re-export Currency from account types (used in multiple places)
export type { Currency } from './account.types'

// Symbol types (static autocomplete data)
export type { SymbolEntry, SymbolOption } from './symbol.types'
