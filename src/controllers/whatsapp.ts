import { Request, Response } from "express";
import config from "../config";
import twilioHelper from "../utils/twilio";
import WBUsers from "../mongo/models/WBUsers";
import path from 'path';
import moment from "moment";

const { WHATSAPP_NUMBER, WHATSAPP_TEXT } = config;
const url = `https://wa.me/+91${WHATSAPP_NUMBER}/?text=${WHATSAPP_TEXT}`;
const encodedUrl = encodeURI(url);
const { MessagingResponse } = require('twilio').twiml;
const twiml = new MessagingResponse();

const questions = {
  _greetings: {
    display: (name: string) => "જય શ્રી કૃષ્ણ " + name
  },
  _1: {
    display: `કલ્યાણ કૃપા ફોઉન્ડેશન દ્વારા  આયોજિત "પુષ્ટિ પંચતત્ત્વ મહોત્સવ" અંતર્ગત અવસરમાં આપશ્રી નીચે મુજબ પ્રસંગમાં ઉપસ્થિત થવા ઇચ્છુક છો`,
    error_display: "Please reply with number from below",
    options: "1.સત્સંગ અને મહાપ્રસાદ \n2.સાંસ્કૃતિક કાર્યક્રમ\n3.સંપૂર્ણ મહોત્સવ",
    optionsx:  ["સત્સંગ અને મહાપ્રસાદ", "સાંસ્કૃતિક કાર્યક્રમ", "સંપૂર્ણ મહોત્સવ"],
    accepted_answers: ["1", "2", "3"]
  },
  _2: {
    display: `"પુષ્ટિ પંચતત્વ મહોત્સવ 2023" નિમિત્તે સંયોજિત નિશુલ્ક બસસેવાનો લાભ લેવા ઇચ્છુક છો?`,
    error_display: "Please reply with number from below",
    options: "1.હા  \n2.ના",
    accepted_answers: ["yes", "no", "1", "2"],
    _no_answered_response: "Thankyou for, you choose no",
  },
  _3: {
    display: "બસ સેવા સ્થળ.",
    error_display: "Please reply with number from below",
    options: `1.નિઝામપુરા\n2.કારેલીબાગ\n3.વાઘોડિયા રોડ\n4.તરસાલી\n5.માંજલપુર\n6.કલાલી\n7.અકોટા\n8.ગોત્રી`,
    optionsx: ["નિઝામપુરા", "કારેલીબાગ", "વાઘોડિયા રોડ", "તરસાલી", "માંજલપુર", "કલાલી", "અકોટા", "ગોત્રી"],
    accepted_answers: ["1", "2", "3", "4", "5", "6", "7", "8"]
  },
  _help: {
    display: "How can i help you",
    error_display: "Please reply with number from below, select your choise?",
    options: "1.Option 1\n2.Option\n3.Option\n4.Option\n5.Option\n6.Option",
    accepted_answers: ["1", "2", "3", "4", "5", "6"]
  },
  _end: {
    display: "આભાર",
  },
}

const redirect = (req: Request, res: Response) => {
  return res.redirect(301, encodedUrl);
};

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
  return res.status(200).send(twiml.message("").toString());
}


const message = async (req: Request, res: Response) => {
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

    if (isMessageSent(userExists._1_status) && !userExists._2_status && !userExists._3_status) {
      //QUESTION 1 - Reply
      if (!questions._1.accepted_answers.includes(userMessage)) {
        await twilioHelper.sendMessage(userContact, `${questions._1.error_display} \n${questions._1.options}`);
      } else {
        await twilioHelper.sendMessage(userContact, `${questions._2.display} \n${questions._2.options}`);
        await WBUsers.updateOne(userFilter, {
          _1_answer: userMessage,
          _2_sid: reqBody.SmsSid,
          _2_status: "sent",
        })
      }
    }

    if (isMessageSent(userExists._2_status) && !userExists._3_status) {
      //QUESTION 2 - Reply
      if (!questions._2.accepted_answers.includes(String(userMessage).toLowerCase())) {
        await twilioHelper.sendMessage(userContact, `${questions._2.error_display}\n${questions._2.options}`);
      } else {
        if (String(userMessage).toLowerCase() === "yes" || String(userMessage).toLowerCase() === "1") {
          await twilioHelper.sendMessage(userContact, `${questions._3.display} \n${questions._3.options}`);
          await WBUsers.updateOne(userFilter, {
            _2_answer: userMessage,
            _3_sid: reqBody.SmsSid,
            _3_status: "sent",
          });
        } else {
          await twilioHelper.sendMessage(userContact, `${questions._end}`);
          await WBUsers.updateOne(userFilter, {
            _2_answer: userMessage,
          });
        }
      }
    }

    if (isMessageSent(userExists._3_status) && !userExists._3_answer) {
      //QUESTION 3 - reply
      if (!questions._3.accepted_answers.includes(userMessage)) {
        await twilioHelper.sendMessage(userContact, questions._2.error_display);
      } else {
        await WBUsers.updateOne(userFilter, {
          _3_answer: userMessage,
        })
        // updateUser(userContact, { _3_status: "received", _3_answer: userMessage });
        await twilioHelper.sendMessage(userContact, questions._end.display);
      }
    }
   }
  return res.status(200).send(twiml.message("").toString());
};

const getAnswer = (options: any, number: string) => { 
  return options[Number(number) - 1];
}

const getWBUsersList =async  (req: Request, res: Response) => {
  const usersList = await WBUsers.find({});
  for (let user of usersList) {
    if (user._1_answer) {
      user._1_answer = getAnswer(questions._1.optionsx, user._1_answer);
    }
    if (user._2_answer === "1") {
      if (user._3_answer) {
        user._3_answer = getAnswer(questions._3.optionsx, user._3_answer);
      } else {
        user._3_answer = "no"
      }
    } else {
      user._3_answer = "--"
    }
    user.createdAt = moment(user.createdAt).format("lll");
  }
  return res.status(200).json(usersList);
}

const list =async  (req: Request, res: Response) => {
  return res
    .set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
    .sendFile(path.join(__dirname, '../../view/wbusers.html'));
}

export default { redirect, message, updateChatStatus, getWBUsersList,list };
