import express from "express";

import whatsappCtrl from "./../controllers/whatsapp";

const router = express.Router();

router.route("/").get(whatsappCtrl.redirect);

export default router;
