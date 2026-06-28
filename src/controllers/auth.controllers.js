import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/user.models.js";
// import { sendEmail } from "../utils/mail.js"

const generateAccessandRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId);
        const refreshToken = user.generateRefreshToken();
        const accessToken = user.generateAccessToken();
        user.refreshToken = refreshToken;

        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh token")
    }
}

const registerUser = asyncHandler( async(req,res) => {
    const {username, email, password, role} = req.body

    const userExist = await User.findOne({
        $or: [{username},{email}]
    })

    if(userExist){
        throw new ApiError(409, "User with email or username already exist");
    }


    const user = await User.create({
        username,
        email,
        password,
        isEmailVerified: false
    })

    const {unhashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken()
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    
    await user.save({validateBeforeSave: false})

    // await sendEmail({
    //     email: user?.email,
    //     subject: "Please verify your email",
    //     mailgenContent: emailVerificationMailgenContent(
    //         user.username,
    //         `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unhashedToken}`
    //     ),
    // })

    const createdUser = await  User.findById(user._id).select(
        "-password -refreshToken -accessToken -emailVerificationToken -emailVerificationExpiry"
    )

    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the new user")
    }

    return res.status(201).json(
        new ApiResponse(200,
            {user: createdUser},
            "User registered successfully and verification mail send to ur mail"
        )
    )
})

const loginUser = asyncHandler( async(req,res) => {
    const {email, password} = req.body;

    if(!email){
        throw new ApiError(404, "Email is required ")
    }

    const user = await User.findOne({email});
    if(!user){
        throw new ApiError(404, "User with this email does not exist")
    }

    
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if(!isPasswordCorrect){
        throw new ApiError(401, "Invalid Password")
    }


    const {accessToken, refreshToken} = await generateAccessandRefreshToken(user._id);


    const loggedinUser = await User.findById(user._id).select(
                "-password -refreshToken -accessToken -emailVerificationToken -emailVerificationExpiry"
    )

    const options = {
        httpOnly: true,
        secure: true
    }


    res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(200,{
                User: loggedinUser,
                refreshToken,
                accessToken,
            },
            "User Logged in successfully")
        )
})

export {
    registerUser,
    loginUser
};