
interface WBUsers {
    phone_number: string | null,
    profile_name: string | null,
    
    _1_status: string | null, //sent | failed
    _1_answer: string | null,
    _1_twilo_status: string | null,
    _1_sid: string | null,

    _2_status: string | null, //sent | failed
    _2_answer: string | null,
    _2_twilo_status: string | null,
    _2_sid: string | null,

    _3_status: string | null, //sent | failed
    _3_answer: string | null,
    _3_twilo_status: string | null,
    _3_sid: string | null,

    user_name: string | null
    createdAt?: string;
    updatedAt?: string;
}

export default WBUsers;