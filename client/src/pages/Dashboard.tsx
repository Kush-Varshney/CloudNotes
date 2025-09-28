"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import TopBar from "@/components/TopBar"
import { api } from "@/lib/api"

type User = { id: string; name: string; email: string }

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [notes, setNotes] = useState<{ id: string; content: string; createdAt: string }[]>([])
  const [content, setContent] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")

  useEffect(() => {
    // Fetch user info and notes
    ;(async () => {
      try {
        setLoading(true)
        console.log("Fetching user data...")
        const [userRes, notesRes] = await Promise.all([
          api.me(),
          api.notes.list()
        ])
        console.log("User response:", userRes)
        console.log("Notes response:", notesRes)
        setUser(userRes.user)
        setNotes(notesRes.notes)
      } catch (e: any) {
        console.error("Error fetching user data:", e)
        console.error("Error details:", e.error, e.status)
        if (e.error === "Unauthorized" || e.status === 401) {
          setError("Please sign in to continue")
          navigate("/login")
        } else {
          setError(e?.error || "Failed to load data")
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  function openNoteModal() {
    setShowNoteModal(true)
    setContent("")
  }

  function startEditing(note: { id: string; content: string }) {
    setEditingNote(note.id)
    setEditContent(note.content)
  }

  function cancelEditing() {
    setEditingNote(null)
    setEditContent("")
  }

  async function saveEdit() {
    if (!editingNote || !editContent.trim()) return
    
    try {
      await updateNote(editingNote, editContent)
      setEditingNote(null)
      setEditContent("")
    } catch (err: any) {
      setError(err?.error || "Failed to update note")
    }
  }

  async function createNote() {
    setError(null)
    if (!content.trim()) return
    
    try {
      setCreating(true)
      const { note } = await api.notes.create({ content })
      setNotes((prev) => [note, ...prev])
      setContent("")
      setShowNoteModal(false)
    } catch (e: any) {
      setError(e?.error || "Failed to create note")
    } finally {
      setCreating(false)
    }
  }

  async function updateNote(id: string, content: string) {
    setError(null)
    try {
      const { note } = await api.notes.update(id, { content })
      setNotes((prev) => prev.map((n) => n.id === id ? note : n))
    } catch (e: any) {
      setError(e?.error || "Failed to update note")
    }
  }

  async function deleteNote(id: string) {
    setError(null)
    try {
      await api.notes.remove(id)
      setNotes((prev) => prev.filter((n) => n.id !== id))
    } catch (e: any) {
      setError(e?.error || "Failed to delete note")
    }
  }

  if (loading) {
    return (
      <>
        <TopBar />
        <main className="container dashboard">
          <div className="stack">
            <div className="card welcome">
              <div className="loading-spinner">Loading...</div>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <TopBar />
      <main className="dashboard-container">
        <div className="dashboard-content">
          <div className="welcome-card">
            <h2 className="welcome-title">Welcome{user ? `, ${user.name}` : ""}!</h2>
            {user && <p className="welcome-email">Email: {user.email}</p>}
          </div>

          <button 
            className="create-note-btn" 
            onClick={openNoteModal}
            disabled={creating}
          >
            Create Note
          </button>

          <div className="notes-section">
            <h3 className="notes-title">Notes</h3>
            <div className="notes-list">
              {notes.map((n, index) => (
                <div key={n.id} className="dashboard-note-card">
                  {editingNote === n.id ? (
                    <div className="note-edit-form">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="note-edit-textarea"
                        rows={3}
                        placeholder="Edit your note..."
                      />
                      <div className="note-edit-actions">
                        <button className="btn-secondary-small" onClick={cancelEditing}>
                          Cancel
                        </button>
                        <button className="btn-primary-small" onClick={saveEdit}>
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="note-content">
                        <span className="note-text">Note {index + 1}</span>
                        <p className="note-preview">{n.content}</p>
                      </div>
                      <div className="note-actions">
                        <button 
                          className="edit-btn"
                          onClick={() => startEditing(n)}
                          title="Edit note"
                        >
                          ✏️
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => deleteNote(n.id)}
                          title="Delete note"
                        >
                          🗑️
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {notes.length === 0 && <p className="no-notes">No notes yet. Create your first note above.</p>}
            </div>
          </div>
          
          {error && <p className="error">{error}</p>}
        </div>
      </main>

      {/* Note Creation Modal */}
      {showNoteModal && (
        <div className="modal-overlay" onClick={() => setShowNoteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Note</h3>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              className="note-textarea"
              rows={6}
            />
            <div className="modal-actions">
              <button 
                className="btn secondary" 
                onClick={() => setShowNoteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn primary" 
                onClick={createNote}
                disabled={creating || !content.trim()}
              >
                {creating ? "Creating..." : "Create Note"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
