import mongoose, { Schema, type InferSchemaType } from "mongoose"
import { SAMPLE_MODE } from "../config/env"

const NoteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    content: { type: String, required: true, trim: true },
  },
  { timestamps: true },
)

type MemNote = {
  _id: string
  userId: string
  content: string
  createdAt: Date
  updatedAt: Date
}

const memNotes: MemNote[] = []

function genId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}


const NoteMemModel = {
  find(filter: { userId?: any }) {
    const uid = filter.userId?.toString?.() ?? String(filter.userId)
    const arr = memNotes.filter((n) => (!uid ? true : n.userId === uid))
    return {
      sort(_sort: any) {
        return arr.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      },
    }
  },
  async create(data: { userId: any; content: string }) {
    const uid = data.userId?.toString?.() ?? String(data.userId)
    const doc: MemNote = {
      _id: genId(),
      userId: uid,
      content: data.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    memNotes.unshift(doc)
    return doc as any
  },
  async findOneAndUpdate(filter: { _id?: any; userId?: any }, update: { content: string }, options: { new?: boolean } = {}) {
    const id = filter._id?.toString?.() ?? String(filter._id)
    const uid = filter.userId?.toString?.() ?? String(filter.userId)
    const idx = memNotes.findIndex((n) => n._id === id && (!uid || n.userId === uid))
    if (idx === -1) return null
    
    const note = memNotes[idx]
    note.content = update.content
    note.updatedAt = new Date()
    
    return note as any
  },
  async findOneAndDelete(filter: { _id?: any; userId?: any }) {
    const id = filter._id?.toString?.() ?? String(filter._id)
    const uid = filter.userId?.toString?.() ?? String(filter.userId)
    const idx = memNotes.findIndex((n) => n._id === id && (!uid || n.userId === uid))
    if (idx === -1) return null
    const [removed] = memNotes.splice(idx, 1)
    return removed as any
  },
}

export type NoteDoc = InferSchemaType<typeof NoteSchema> & { _id: mongoose.Types.ObjectId }
// Keep mongoose export for real DB, fallback to mem in SAMPLE_MODE
export const Note = SAMPLE_MODE ? (NoteMemModel as any) : mongoose.model("Note", NoteSchema)
