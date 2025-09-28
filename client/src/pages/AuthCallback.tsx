import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../lib/api"

function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const success = api.handleGoogleCallback()
    if (success) {
      navigate("/dashboard")
    } else {
      // Handle the case where the token is missing or invalid
      navigate("/login?error=google_callback_failed")
    }
  }, [navigate])

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <p>Please wait, authenticating...</p>
    </div>
  )
}

export default AuthCallback
