
import logger from "./logger";
import config from "../config";

const { TWILIO_SID, TWILIO_TOKEN, TWILIO_PHONE_NUMBER } = config;
const twilioClient = require('twilio')(TWILIO_SID, TWILIO_TOKEN);

const sendMessage = async (number: string, message: string) => {
    // console.log(config);
    // return twilioClient.messages.create({
    //     body: message,
    //     from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
    //     to: `whatsapp:${number}`
    // });

    return twilioClient.messages
        .create({
            body: message,
            from: 'whatsapp:'+TWILIO_PHONE_NUMBER,
            to: 'whatsapp:'+number
        });
};

export default {sendMessage};
