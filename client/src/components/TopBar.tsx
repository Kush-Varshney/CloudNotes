"use client"

import { Link, useNavigate } from "react-router-dom"
import { api } from "@/lib/api"

export default function TopBar() {
  const navigate = useNavigate()

  async function onSignOut() {
    try {
      await api.logout()
    } catch {}
    navigate("/login")
  }

  return (
    <header className="dashboard-topbar">
      <div className="topbar-left">
        <div className="dashboard-logo">
          <img src="/images/logo.svg" alt="CloudNotes logo" width="47" height="32" />
        </div>
        <h1 className="dashboard-title">Dashboard</h1>
      </div>
      <button className="sign-out-btn" onClick={onSignOut}>
        Sign Out
      </button>
    </header>
  )
}
