import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../src/models/user.models.js";
import { UserRolesEnum } from "../src/utils/constants.js";

dotenv.config({path: ".env"});

const email = process.argv[2]?.trim().toLowerCase();

if(!email){
    throw new Error("An account email is required")
}

try {
    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findOneAndUpdate(
        {email},
        {role: UserRolesEnum.ADMIN},
        {returnDocument: "after",runValidators: true}
    );

    if(!user){
        throw new Error("No account exists with that email")
    }

    console.log(`Admin role granted to ${user.email}`);
} finally {
    await mongoose.disconnect().catch(() => {});
}
