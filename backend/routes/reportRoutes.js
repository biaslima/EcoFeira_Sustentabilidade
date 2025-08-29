const express = require("express");
const router = express.Router();
const Report = require("../models/report");

// Criar denúncia
router.post("/", async (req, res) => {
  try {
    const report = new Report({ ...req.body, status: "pending" });
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Listar denúncias aprovadas
router.get("/", async (req, res) => {
  try {
    const reports = await Report.find({ status: "approved" }).sort({
      date: -1,
    });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar denúncias pendentes (admin)
router.get("/pending", async (req, res) => {
  try {
    const reports = await Report.find({ status: "pending" }).sort({ date: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Aprovar denúncia (admin)
router.put("/approve/:id", async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deletar denúncia (admin)
router.delete("/:id", async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: "Denúncia apagada" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
