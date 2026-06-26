import Mailgen from "mailgen";

const emailVerificationMailgenContent = (username,emailVerificationUrl) => {
    return {
        body: {
      username,
      intro: "Welcome! Please verify your email address to activate your account.",
      action: {
        instructions:
          "Click the button below to verify your email address.",
        button: {
          color: "#22BC66",
          text: "Verify Email",
          link: emailVerificationUrl,
        },
      },
      outro:
        "If you didn't create an account, you can safely ignore this email.",
    },
}
}

const forgotPasswordMailgenContent = (username,forgotPasswordUrl) => {
      return {
    body: {
      username,
      intro: "We received a request to reset your password.",
      action: {
        instructions:
          "Click the button below to reset your password. This link will expire in 15 minutes.",
        button: {
          color: "#DC4D2F",
          text: "Reset Password",
          link: forgotPasswordUrl,
        },
      },
      outro:
        "If you didn't request a password reset, you can safely ignore this email.",
    },
  };

}

export {emailVerificationMailgenContent,forgotPasswordMailgenContent }