import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import logger from "@/utils/logger";
import { sendResponse } from "@/utils/response.util";
import { MESSAGES } from "@/constants/messages";
import { getErrorMessage } from "@/utils/common.utils";

/**
 * @name loginPartner
 * @description
 * Authenticate service partner users and return a JWT token.
 * Only active service partners can log in through this route.
 * @access Private
 */
export const loginPartner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.loginPartner(req.body);

    return sendResponse(res, MESSAGES.AUTH.LOGIN_SUCCESS, result);
  } catch (error: unknown) {
    logger.error(`Login error: ${getErrorMessage(error)}`);
    next(error);
  }
};

/**
 * @name forgotPasswordPartner
 * @description
 * Initiate the password reset process for service partner users.
 * Generates a password reset token and sends it to the user's email.
 * Only active service partners can request a password reset through this route.
 * @access Private
 */
export const forgotPasswordPartner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const data = await authService.requestPasswordReset(email);

    return sendResponse(res, MESSAGES.AUTH.PASSWORD_RESET_TOKEN_SENT, data);
  } catch (error: unknown) {
    logger.error(`Forgot password error: ${getErrorMessage(error)}`);
    next(error);
  }
};

/**
 * @name resetPasswordPartner
 * @description
 * Reset the password for a service partner user using the provided reset token and new password.
 * Validates the reset token and updates the user's password if valid.
 * Only active service partners can reset their password through this route.
 * @access Private
 */
export const resetPasswordPartner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.resetPasswordPartner(req.body);

    return sendResponse(res, MESSAGES.AUTH.PASSWORD_RESET_SUCCESS, result);
  } catch (error: unknown) {
    logger.error(`Reset password error: ${getErrorMessage(error)}`);
    next(error);
  }
};

/**
 * @name logoutPartner
 * @description
 * Logout a service partner user by invalidating their JWT token.
 * Removes the token from the user's record to prevent further use.
 * Only active service partners can log out through this route.
 * @access Private
 */
export const logoutPartner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    await authService.logout(userId);

    return sendResponse(res, MESSAGES.AUTH.LOGOUT_SUCCESS);
  } catch (error: unknown) {
    logger.error(`Logout error: ${getErrorMessage(error)}`);
    next(error);
  }
};
