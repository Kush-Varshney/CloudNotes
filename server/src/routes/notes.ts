import { Router } from "express"
import { Note } from "../models/Note"
import { createNoteSchema } from "../utils/validators"
import type { Request, Response } from "express"

const router = Router()

// GET /notes
router.get("/", async (req: Request, res: Response) => {
  const userId = req.auth!.sub
  const notes = await Note.find({ userId }).sort({ createdAt: -1 })
  return res.json({ notes: notes.map((n: any) => ({ id: n._id, content: n.content, createdAt: n.createdAt })) })
})

// POST /notes
router.post("/", async (req: Request, res: Response) => {
  const parse = createNoteSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })

  const userId = req.auth!.sub
  const note = await Note.create({ userId, content: parse.data.content })
  return res.status(201).json({ note: { id: note._id, content: note.content, createdAt: note.createdAt } })
})

// PUT /notes/:id
router.put("/:id", async (req: Request, res: Response) => {
  const parse = createNoteSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })

  const userId = req.auth!.sub
  const { id } = req.params
  
  // Find and update the note
  const note = await Note.findOneAndUpdate(
    { _id: id, userId },
    { content: parse.data.content },
    { new: true }
  )
  
  if (!note) return res.status(404).json({ error: "Note not found" })
  return res.json({ note: { id: note._id, content: note.content, createdAt: note.createdAt } })
})

// DELETE /notes/:id
router.delete("/:id", async (req: Request, res: Response) => {
  const userId = req.auth!.sub
  const { id } = req.params
  const deleted = await Note.findOneAndDelete({ _id: id, userId })
  if (!deleted) return res.status(404).json({ error: "Note not found" })
  return res.json({ message: "Deleted" })
})

export default router
