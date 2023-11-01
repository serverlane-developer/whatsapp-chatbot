import express from "express";
import whatsappRoutes from "./whatsapp";

const router = express.Router();

router.use("/whatsapp", whatsappRoutes);

export default router;
