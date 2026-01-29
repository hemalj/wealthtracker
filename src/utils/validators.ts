// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Password strength validation
export const getPasswordStrength = (password: string): {
  score: number
  feedback: string
} => {
  let score = 0
  const feedback: string[] = []

  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('Password should be at least 8 characters')
  }

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include both uppercase and lowercase letters')
  }

  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push('Include at least one number')
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include at least one special character')
  }

  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
  const feedbackText = feedback.length > 0 ? feedback.join('. ') : 'Excellent password!'

  return {
    score,
    feedback: `${strengthLabels[score]}: ${feedbackText}`,
  }
}

// Account number validation (basic)
export const isValidAccountNumber = (accountNumber: string): boolean => {
  // Remove spaces and dashes
  const cleaned = accountNumber.replace(/[\s-]/g, '')
  // Must be between 8 and 17 digits
  return /^\d{8,17}$/.test(cleaned)
}

// Amount validation
export const isValidAmount = (amount: number): boolean => {
  return !isNaN(amount) && isFinite(amount) && amount >= 0
}

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Phone number validation (basic)
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/
  return phoneRegex.test(phone)
}
