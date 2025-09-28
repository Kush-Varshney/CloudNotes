"use client"

import { type FormEvent, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { api } from "../lib/api"
import { validateEmail, validateName, validateDateOfBirth, validateOTP } from "../lib/validation"

export default function SignUp() {
  const [showOtp, setShowOtp] = useState(false)
  const [form, setForm] = useState({ name: "", dob: "", email: "" })
  const [otp, setOtp] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [showOtpField, setShowOtpField] = useState(false)
  const navigate = useNavigate()

  async function onStart(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    
    // Validate form fields
    const errors: Record<string, string> = {}
    const nameError = validateName(form.name)
    const dobError = validateDateOfBirth(form.dob)
    const emailError = validateEmail(form.email)
    
    if (nameError) errors.name = nameError.message
    if (dobError) errors.dob = dobError.message
    if (emailError) errors.email = emailError.message
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    
    try {
      setLoading(true)
      await api.signupStart(form)
      setShowOtpField(true)
    } catch (err: any) {
      setError(err?.error || "Failed to start signup")
    } finally {
      setLoading(false)
    }
  }

  async function onVerify(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    
    // Validate OTP
    const otpError = validateOTP(otp)
    if (otpError) {
      setFieldErrors({ otp: otpError.message })
      return
    }
    
    try {
      setLoading(true)
      await api.signupVerify({ email: form.email, otp })
      navigate("/dashboard")
    } catch (err: any) {
      setError(err?.error || "Failed to verify OTP")
      // Clear OTP field on error to allow retry
      setOtp("")
    } finally {
      setLoading(false)
    }
  }

  async function onResendOtp() {
    setError(null)
    setFieldErrors({})
    
    try {
      setLoading(true)
      await api.signupStart(form)
    } catch (err: any) {
      setError(err?.error || "Failed to resend OTP")
    } finally {
      setLoading(false)
    }
  }

  function onStartOver() {
    setShowOtpField(false)
    setForm({ name: "", dob: "", email: "" })
    setOtp("")
    setError(null)
    setFieldErrors({})
    setShowOtp(false)
  }

  return (
    <main className="auth-container">
      <div className="auth-card">
        <div className="logo-section">
          <div className="logo">
            <div className="logo-icon">
              <img src="/images/logo.svg" alt="CloudNotes logo" width="47" height="32" />
            </div>
            <span className="logo-text">CloudNotes</span>
          </div>
        </div>
        
        <h1 className="title">Sign up</h1>
        <p className="subtitle">Sign up to enjoy the feature of CloudNotes</p>

        <form className="grid gap" onSubmit={showOtpField ? onVerify : onStart}>
          <label>
            <span>Your Name</span>
            <input 
              required 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              className={fieldErrors.name ? "error" : ""}
              placeholder="Jonas Khanwald"
              disabled={showOtpField}
            />
            {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
          </label>
          
          <label>
            <span>Date of Birth</span>
            <div className="date-input-wrapper">
              <span className="calendar-icon">📅</span>
              <input
                type="date"
                required
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
                className={fieldErrors.dob ? "error" : ""}
                disabled={showOtpField}
              />
            </div>
            {fieldErrors.dob && <span className="field-error">{fieldErrors.dob}</span>}
          </label>
          
          <label>
            <span>Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={fieldErrors.email ? "error" : ""}
              placeholder="jonas_kahnwald@gmail.com"
              disabled={showOtpField}
            />
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </label>

          {showOtpField && (
            <label>
              <span>OTP</span>
              <div className="otp-input-wrapper">
                <input
                  type={showOtp ? "text" : "password"}
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={fieldErrors.otp ? "error" : ""}
                  placeholder="Enter 6-digit OTP"
                />
                <button
                  type="button"
                  className="otp-toggle"
                  onClick={() => setShowOtp(!showOtp)}
                >
                  {showOtp ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {fieldErrors.otp && <span className="field-error">{fieldErrors.otp}</span>}
            </label>
          )}
          
          {error && <p className="error">{String(error)}</p>}
          <button className="btn primary" type="submit" disabled={loading}>
            {loading 
              ? (showOtpField ? "Verifying..." : "Sending OTP...") 
              : (showOtpField ? "Sign up" : "Get OTP")
            }
          </button>
          {showOtpField && (
            <p className="muted">
              <button type="button" className="link" onClick={onResendOtp} disabled={loading}>
                Resend OTP
              </button>
            </p>
          )}
          
          <p className="muted">
            {showOtpField ? (
              <>Wrong email? <button type="button" className="link" onClick={onStartOver}>Start over</button></>
            ) : (
              <>Already have an account? <Link to="/login">Sign in</Link></>
            )}
          </p>
        </form>
      </div>

      <div className="illustration hide-sm">
        <div className="illustration-content"></div>
      </div>
    </main>
  )
}
