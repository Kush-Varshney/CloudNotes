export interface ValidationError {
  field: string
  message: string
}

export function validateEmail(email: string): ValidationError | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) return { field: "email", message: "Email is required" }
  if (!emailRegex.test(email)) return { field: "email", message: "Please enter a valid email address" }
  return null
}

export function validatePassword(password: string): ValidationError | null {
  if (!password) return { field: "password", message: "Password is required" }
  if (password.length < 8) return { field: "password", message: "Password must be at least 8 characters long" }
  if (!/[A-Z]/.test(password)) return { field: "password", message: "Password must contain at least one uppercase letter" }
  if (!/[0-9]/.test(password)) return { field: "password", message: "Password must contain at least one number" }
  return null
}

export function validateName(name: string): ValidationError | null {
  if (!name) return { field: "name", message: "Name is required" }
  if (name.length < 2) return { field: "name", message: "Name must be at least 2 characters long" }
  if (name.length > 80) return { field: "name", message: "Name must be less than 80 characters" }
  return null
}

export function validateDateOfBirth(dob: string): ValidationError | null {
  if (!dob) return { field: "dob", message: "Date of birth is required" }
  const date = new Date(dob)
  const now = new Date()
  const age = now.getFullYear() - date.getFullYear()
  
  if (isNaN(date.getTime())) return { field: "dob", message: "Please enter a valid date" }
  if (age < 13) return { field: "dob", message: "You must be at least 13 years old" }
  if (age > 120) return { field: "dob", message: "Please enter a valid date of birth" }
  return null
}

export function validateOTP(otp: string): ValidationError | null {
  if (!otp) return { field: "otp", message: "OTP is required" }
  if (!/^\d{6}$/.test(otp)) return { field: "otp", message: "OTP must be 6 digits" }
  return null
}

export function validateNoteContent(content: string): ValidationError | null {
  if (!content.trim()) return { field: "content", message: "Note content is required" }
  if (content.length > 5000) return { field: "content", message: "Note content must be less than 5000 characters" }
  return null
}
