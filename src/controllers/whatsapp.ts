import { Request, Response } from "express";
import config from "../config";
import twilioHelper from "../utils/twilio";
import WBUsers from "../mongo/models/WBUsers";

const { WHATSAPP_NUMBER, WHATSAPP_TEXT } = config;
const url = `https://wa.me/+91${WHATSAPP_NUMBER}/?text=${WHATSAPP_TEXT}`;
const encodedUrl = encodeURI(url);
const { MessagingResponse } = require('twilio').twiml;
const twiml = new MessagingResponse();

const db:any = [];

const questions = {
  _greetings: {
    display: (name: string) => "જયશ્રી કૃષ્ણ" + name
  },
  _1: {
    display: `કલ્યાણ કૃપા ફોઉન્ડેશન દ્વારા  આયોજિત "પુષ્ટિ પંચતત્ત્વ મહોત્સવ" અંતર્ગત અવસરમાં આપશ્રી નીચે મુજબ પ્રસંગમાં ઉપસ્થિત થવા ઇચ્છુક છો`,
    error_display: "Please reply with number from below",
    options: "1.સત્સંગ અને મહાપ્રસાદ \n2.સાંસ્કૃતિક કાર્યક્રમ\n3.સંપૂર્ણ મહોત્સવ",
    accepted_answers: ["1", "2", "3"]
  },
  _2: {
    display: `"પુષ્ટિ પંચતત્વ મહોત્સવ" નિમિત્તે સંયોજિત નિશુલ્ક બસસેવાનો લાભ લેવા ઇચ્છુક છો?`,
    error_display: "Please reply with number from below",
    options: "1.હા  \n2.ના",
    accepted_answers: ["yes", "no", "1", "2"]
  },
  _3: {
    display: "Choose an item.",
    error_display: "Please reply with number from below",
    options: `1.નિઝામપુરા\n2.કારેલીબાગ\n3.વાઘોડિયા રોડ\n4.તરસાલી\n5.માંજલપુર\n6.કલાલી\n7.અકોટા\n8.ગોત્રી`,
    accepted_answers: ["1", "2", "3", "4", "5", "6", "7", "8"]
  },
  _help: {
    display: "How can i help you",
    error_display: "Please reply with number from below, select your choise?",
    options: "1.Option 1\n2.Option\n3.Option\n4.Option\n5.Option\n6.Option",
    accepted_answers: ["1", "2", "3", "4", "5", "6"]
  },
  _end: {
    display: "END",
  },
}

const footer = `
  Created by XYZ
`

const redirect = (req: Request, res: Response) => {
  return res.redirect(301, encodedUrl);
};

const updateUser = (number: string, data: any) => {
  // for (let user of db) {
  //   if (user.phone_number === number) {
  //     user = { ...user, ...data };
  //   }
  // }
  let index = db.findIndex((o: any) => o.phone_number === number);
  db[index] = {
    ...db[index],
    ...data
  }
}


const getPhoneNumber = (phoneNumber: string) => {
  return phoneNumber.split(":")[1];
}

const isMessageSent = (status: string|null) => {
  return ["sent", "delivered", "read"].includes(status || "");
}

const updateChatStatus = async (req: Request, res: Response) => {
  const reqBody = req.body;
  const smsSid = reqBody.SmsSid;
  const userContact = getPhoneNumber(req.body?.From);
  const findFilter = { phone_number: userContact };
  const userExists = await WBUsers.findOne(findFilter);

  if (userExists) {
    if (userExists._1_sid === smsSid) {
      await WBUsers.updateOne(findFilter, { _1_status: reqBody.MessageStatus });
    } else if (userExists._2_sid === smsSid) {
      await WBUsers.updateOne(findFilter, { _2_status: reqBody.MessageStatus });
    } else if (userExists._3_sid === smsSid) {
      await WBUsers.updateOne(findFilter, { _3_status: reqBody.MessageStatus });
    }
  }
  // console.log("reqBody", reqBody);
  return res.status(200).send(twiml.message("").toString());
}


const message = async (req: Request, res: Response) => {
  // console.log(req.body);
  const reqBody = req.body;
  const userContact = getPhoneNumber(req.body?.From);
  const userMessage = req.body.Body;
  const userFilter = { phone_number: userContact };

  const userExists = await WBUsers.findOne(userFilter);

  if (!userExists) {
    await twilioHelper.sendMessage(userContact, questions._greetings.display(""));
    await twilioHelper.sendMessage(userContact, `${questions._1.display} \n${questions._1.options}`);
    
    await WBUsers.create({
      phone_number: userContact,
      profile_name: reqBody.ProfileName,

      _1_status: "sent",
      _1_answer: null,
      _1_sid: reqBody.SmsSid,
    });
  } else {

    console.log('userExists', userExists);

    if (isMessageSent(userExists._1_status) && !userExists._2_status && !userExists._3_status) {
      //QUESTION 1
      if (!questions._1.accepted_answers.includes(userMessage)) {
        await twilioHelper.sendMessage(userContact, questions._1.error_display);
      } else {
        await twilioHelper.sendMessage(userContact, `${questions._2.display} \n${questions._2.options}`);
        await WBUsers.updateOne(userFilter, {
        //   _1_status: "sent",
          _1_answer: userMessage,
          _2_sid: reqBody.SmsSid,
          _2_status: "sent",
        })
      }
    }

    if (isMessageSent(userExists._2_status) && !userExists._3_status) {
      //QUESTION 2
      if (!questions._2.accepted_answers.includes(String(userMessage).toLowerCase())) {
        await twilioHelper.sendMessage(userContact, questions._2.error_display);
      } else {
        let dataToUpdate = { _2_answer: ["yes", "1"].includes(userMessage) ? "1" : "2" }
        if (String(userMessage).toLowerCase() === "yes" || String(userMessage).toLowerCase() === "1") {
          await twilioHelper.sendMessage(userContact, `${questions._3.display} \n${questions._3.options}`);
        }
        await WBUsers.updateOne(userFilter, {
        //  _2_status: "sent",
          _2_answer: userMessage,
          _3_sid: reqBody.SmsSid,
          _3_status: "sent",
        })
        updateUser(userContact, dataToUpdate);
      }
    }

    if (isMessageSent(userExists._3_status) && !userExists._3_answer) {
      //QUESTION 3
      if (!questions._3.accepted_answers.includes(userMessage)) {
        // updateUser(userContact, { _2_status: "sent", _2_answer: "" });
        await twilioHelper.sendMessage(userContact, questions._2.error_display);
      } else {
        await WBUsers.updateOne(userFilter, {
          // _3_status: "sent",
          _3_answer: userMessage,
        })
        // updateUser(userContact, { _3_status: "received", _3_answer: userMessage });
        await twilioHelper.sendMessage(userContact, questions._end.display);
      }
    }
   }
  return res.status(200).send(twiml.message("").toString());
};

export default { redirect, message, updateChatStatus };
