import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken"
// import { sendEmail } from "../utils/mail.js"

const generateAccessandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh token",
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  const userExist = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (userExist) {
    throw new ApiError(409, "User with email or username already exist");
  }

  const user = await User.create({
    username,
    email,
    password,
    isEmailVerified: false,
  });

  const { unhashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();
  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  // await sendEmail({
  //     email: user?.email,
  //     subject: "Please verify your email",
  //     mailgenContent: emailVerificationMailgenContent(
  //         user.username,
  //         `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unhashedToken}`
  //     ),
  // })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -accessToken -emailVerificationToken -emailVerificationExpiry",
  );

  if (!createdUser) {
    throw new ApiError(
      500,
      "Something went wrong while registering the new user",
    );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { user: createdUser },
        "User registered successfully and verification mail send to ur mail",
      ),
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(404, "Email is required ");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User with this email does not exist");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid Password");
  }

  const { accessToken, refreshToken } = await generateAccessandRefreshToken(
    user._id,
  );

  const loggedinUser = await User.findById(user._id).select(
    "-password -refreshToken -accessToken -emailVerificationToken -emailVerificationExpiry",
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          User: loggedinUser,
          refreshToken,
          accessToken,
        },
        "User Logged in successfully",
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: "",
      },
    },
    {
      new: true,
    },
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const getCurrentUser = asyncHandler( async(req,res)=>{
    res.status(200)
        .json(
            new ApiResponse(200,req.user,"Current User fetched Successfully")
        )
})

const verifyEmail = asyncHandler( async(req,res) => {
    const { emailVerificationToken } = req.params;
    if(!emailVerificationToken){
        throw new ApiError(400, "Verification token is invalid or expired")
    }

    let hashedToken = crypto
            .createHash("sha256")
            .update(unhashedToken)
            .digest("hex")

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: {$gt: Date.now()}
    })        

    if(!user){
        throw new ApiError(400, "Verification token is invalid or expired")
    }

    user.emailVerificationExpiry = undefined
    user.emailVerificationToken = undefined
    user.isEmailVerified = true
    await user.save({validateBeforeSave: false})

    res.status(200)
        .json(
            new ApiResponse(200,{},"Email Verified successfully")
        )
})

const resendEmailVerification = asyncHandler( async(req,res) => {
    const user = User.findById(req.user._id);
    if(!user){
        throw new ApiError(401,"User does not exist");
    }
    if(user.isEmailVerified){
        throw new ApiError(401,"User already Verified");
    }


    //token resend pending and email send also pending
    res.send(200)
        .json(
            new ApiResponse(200,{},"Verification email sent again")
        )

})

const refreshToken = asyncHandler( async(req,res)=>{
    const refreshToken = req?.cookies.refreshToken;
    if(!refreshToken){
        throw new ApiError(401, "Invalid Refresh Token");
    }

    const decodedRefreshToken = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);
    const user = User.findById(decodedRefreshToken?._id);
    if(!user){
                throw new ApiError(401, "Invalid Refresh Token");
    }

    if(refreshToken !== user?.refreshToken){
        throw new ApiError(401, "Refresh token is expired")
    }

    const options = {
        httpOnly: true,
        secure: true
    }

    const {accessToken, refreshToken: newRefreshToken} = await generateAccessandRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken", newRefreshToken,options)        
        .json(
            new ApiResponse(200,{accessToken, refreshToken: newRefreshToken}
                ," Access Token refreshed"
            )
        )
})

export { registerUser, loginUser, logoutUser, getCurrentUser,verifyEmail, resendEmailVerification, refreshToken };
