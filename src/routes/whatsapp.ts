import express from "express";

import whatsappCtrl from "./../controllers/whatsapp";

const router = express.Router();

router.route("/message").post(whatsappCtrl.message);
router.route("/wbusers").post(whatsappCtrl.getWBUsersList);
router.route("/message_status").post(whatsappCtrl.updateChatStatus); //update customer message status - sent|delivered|red
router.route("/").get(whatsappCtrl.redirect);

export default router;
