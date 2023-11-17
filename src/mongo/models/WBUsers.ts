import mongoose from "mongoose";
import { WBUsers } from "../../@types/index";

const { Schema } = mongoose;

const wbUser = new Schema<WBUsers>(
  {
    phone_number: { type: String },
    profile_name: { type: String },
      
    _1_status:{ type: String }, //sent | failed
    _1_answer:{ type: String },
    _1_twilo_status:{ type: String },
    _1_sid: { type: String },

    _2_status: { type: String }, //sent | failed
    _2_answer: { type: String },
    _2_twilo_status: { type: String },
    _2_sid: { type: String },

    _3_status: { type: String }, //sent | failed
    _3_answer: { type: String },
    _3_twilo_status: { type: String },
    _3_sid: { type: String },

    user_name:{ type: String },
  },
  {
    timestamps: true,
  }
);

const WbUser = mongoose.model("WbUser", wbUser);
export default WbUser;
