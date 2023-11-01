import { Request, Response } from "express";
import config from "../config";

const { WHATSAPP_NUMBER, WHATSAPP_TEXT } = config;
const url = `https://wa.me/+91${WHATSAPP_NUMBER}/?text=${WHATSAPP_TEXT}`;
const encodedUrl = encodeURI(url);

const redirect = (req: Request, res: Response) => {
  return res.redirect(301, encodedUrl);
};

export default { redirect };
