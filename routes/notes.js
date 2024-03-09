const express = require("express");
const router = express.Router();
var fetchuser = require("../middleware/fetchuser");
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");

//Route 1 : Get All Notes using : Get "/api/notes/fetchallnotes required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

//Route 2 : Create  Notes using : post "/api/notes/addnotes required
router.post(
  "/addnotes",
  fetchuser,
  [
    body("title", "Title cannot be empty").exists(),
    body("description", "Description should be atleast 5 charactes").exists(),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      //check validations
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });

      const saveNote = await note.save();

      res.json(saveNote);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  }
);
//Route 3 : updar an exitsting Notes using : post "/api/notes/updatenote" required
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;
  try {
    // Create a newNote object
    const newNote = {};
    if (title) newNote.title = title;
    if (description) newNote.description = description;
    if (tag) newNote.tag = tag;

    // Find the note to be updated and update it
    const note = await Notes.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ error: "Not allowed to update this note" });
    }

    const updatedNote = await Notes.findByIdAndUpdate(req.params.id, newNote, {
      new: true,
    });

    res.json({ note: updatedNote });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// Route 4: Delete an existing note using DELETE "/api/notes/deletenote/:id"
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    // Find the note to be deleted
    const note = await Notes.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Check if the user is the owner of the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ error: "Not allowed to delete this note" });
    }

    // Delete the note
    await Notes.findByIdAndDelete(req.params.id);

    // Send a success message
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
