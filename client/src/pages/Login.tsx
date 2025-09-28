"use client"

import { type FormEvent, useState, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { api } from "@/lib/api"
import { validateEmail, validateOTP } from "@/lib/validation"

export default function Login() {
  const [showOtp, setShowOtp] = useState(false)
  const [form, setForm] = useState({ email: "", keepSignedIn: true })
  const [otp, setOtp] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [showOtpField, setShowOtpField] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Handle Google OAuth errors
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      switch (errorParam) {
        case 'google_auth_failed':
          setError('Google authentication failed. Please try again.')
          break
        case 'no_user':
          setError('No user found after Google authentication.')
          break
        case 'callback_error':
          setError('An error occurred during Google authentication.')
          break
        default:
          setError('An unknown error occurred.')
      }
    }
  }, [searchParams])

  async function onStart(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    
    // Validate email
    const emailError = validateEmail(form.email)
    if (emailError) {
      setFieldErrors({ email: emailError.message })
      return
    }
    
    try {
      setLoading(true)
      const res = await api.loginStart({ email: form.email })
      setShowOtpField(true)
    } catch (err: any) {
      setError(err?.error || "Failed to send OTP")
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
      await api.loginVerify({ email: form.email, otp, keepSignedIn: form.keepSignedIn })
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
      const res = await api.loginStart({ email: form.email })
      setError(null)
    } catch (err: any) {
      setError(err?.error || "Failed to resend OTP")
    } finally {
      setLoading(false)
    }
  }

  function onStartOver() {
    setShowOtpField(false)
    setForm({ email: "", keepSignedIn: true })
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
        
        <h1 className="title">Sign in</h1>

        <form className="grid gap" onSubmit={showOtpField ? onVerify : onStart}>
          <label>
            <span>Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={fieldErrors.email ? "error" : ""}
              disabled={showOtpField}
            />
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </label>

          {!showOtpField && (
            <label className="check">
              <input
                type="checkbox"
                checked={form.keepSignedIn}
                onChange={(e) => setForm({ ...form, keepSignedIn: e.target.checked })}
              />
              <span>Keep me logged in</span>
            </label>
          )}

          {showOtpField && (
            <label>
              <span>OTP</span>
              <div className="otp-input-wrapper">
                <input
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
              : (showOtpField ? "Sign in" : "Get OTP")
            }
          </button>

          {!showOtpField && (
            <>
              <div className="muted">
                New here? <Link to="/">Create one</Link>
              </div>
              
              <div className="divider">
                <span>or</span>
              </div>
              
              <a href="/auth/google" className="btn ghost google">
                <img src="/images/google-logo.svg" alt="Google" width="20" height="20" />
                Continue with Google
              </a>
            </>
          )}

          {showOtpField && (
            <div className="muted">
              <button type="button" className="link" onClick={onResendOtp} disabled={loading}>
                Resend OTP
              </button>
            </div>
          )}

          {showOtpField && (
            <div className="muted">
              Wrong email? <button type="button" className="link" onClick={onStartOver}>Start over</button>
            </div>
          )}
        </form>
      </div>

      <div className="illustration hide-sm">
        <div className="illustration-content"></div>
      </div>
    </main>
  )
}
