import express from "express";

import whatsappCtrl from "./../controllers/whatsapp";

const router = express.Router();

router.route("/message").post(whatsappCtrl.message);
router.route("/").get(whatsappCtrl.redirect);

export default router;
