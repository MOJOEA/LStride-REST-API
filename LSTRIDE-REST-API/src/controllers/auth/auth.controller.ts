import { Request, Response } from "express";

import { register, login, loginWithGoogle } from "../../services/auth/auth.service";

import { registerSchema, loginSchema, googleLoginSchema } from "../../Validation/auth/auth.validation";


export const registerController = async (
  req: Request,
  res: Response,
) => {
  try {
    const data = registerSchema.parse(req.body);

    const result = await register(
      data.name,
      data.gender,
      data.email,
      data.password,
    );

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.message === "EMAIL_ALREADY_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const loginController = async (
  req: Request,
  res: Response,
) => {
  try {
    const data = loginSchema.parse(req.body);

    const result = await login(
      data.email,
      data.password,
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    switch (error.message) {
      case "INVALID_CREDENTIALS":
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });

      case "ACCOUNT_USES_GOOGLE":
        return res.status(400).json({
          success: false,
          message: "This account uses Google login",
        });

      case "ACCOUNT_NOT_ACTIVE":
        return res.status(403).json({
          success: false,
          message: "Account is not active",
        });

      default:
        return res.status(400).json({
          success: false,
          message: error.message,
        });
    }
  }
};

export const googleLoginController = async (
  req: Request,
  res: Response,
) => {
  try {
    const data = googleLoginSchema.parse(req.body);

    const result = await loginWithGoogle(
      data.idToken,
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    switch (error.message) {
      case "INVALID_GOOGLE_TOKEN":
      case "GOOGLE_ACCOUNT_DATA_MISSING":
      case "GOOGLE_EMAIL_NOT_VERIFIED":
        return res.status(401).json({
          success: false,
          message: "Invalid Google account",
        });

      case "EMAIL_ALREADY_REGISTERED":
        return res.status(409).json({
          success: false,
          message:
            "Email already registered. Please login with your existing method.",
        });

      case "ACCOUNT_NOT_ACTIVE":
        return res.status(403).json({
          success: false,
          message: "Account is not active",
        });

      default:
        return res.status(400).json({
          success: false,
          message: error.message,
        });
    }
  }
};