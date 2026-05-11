import { ProfileUpdateType } from "@/enums/servicePartner.enum";
import * as servicePartnerRepository from "../repositories/servicePartner.repository";
import { STATUS_CODE } from "@/enums";
import { ApiError } from "@/utils/apiError.util";
import { MESSAGES } from "@/constants/messages";
import {
  ServicePartnerProfileResponse,
  UpdateMyProfilePayload,
} from "@/interfaces/servicePartner.interface";
import {
  CLOUDINARY_FOLDERS,
  getCloudinaryThumbnail,
  uploadImage,
} from "@/utils/cloudinary.util";
import { BCRYPT_SALT_ROUNDS } from "@/constants";
import bcrypt from "bcrypt";
import { Transaction } from "sequelize";
import sequelize from "@/configs/db";

/**
 * @name getMyProfile
 * @description
 * Fetch logged-in service partner profile details.
 * @access Private
 */
export const getMyProfile = async (userId: number) => {
  try {
    const data =
      await servicePartnerRepository.findServicePartnerProfileByUserId(userId);

    if (!data) {
      throw new ApiError(
        STATUS_CODE.NOT_FOUND,
        MESSAGES.EXPERT.NOT_FOUND_PARTNER
      );
    }

    const partner = data.get({ plain: true });
    const result: ServicePartnerProfileResponse = {
      id: partner.user.id,
      name: partner.user.name,
      country_code: partner.user.countryCode ?? "",
      mobile_number: partner.user.mobileNumber ?? "",
      email: partner.user.email ?? "",
      permanent_address: partner.permanentAddress ?? "",
      residential_address: partner.residentialAddress ?? "",
      role: partner.user.role?.name ?? "",
      profile_image: {
        url: partner.user.profileImage ?? null,
        thumbnail: partner.user.profileImage
          ? getCloudinaryThumbnail(partner.user.profileImage)
          : null,
        public_id: partner.user.cloudinaryId ?? null,
      },
    };
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * @name updateMyProfile
 * @description
 * Updates logged-in service partner profile based on update type:
 * contact, password, or avatar image.
 * @access Private
 */
export const updateMyProfile = async (
  userId: number,
  userRole: string,
  payload: UpdateMyProfilePayload,
  profileImageFile?: Express.Multer.File
) => {
  const t: Transaction = await sequelize.transaction();

  try {
    const user = await servicePartnerRepository.findUserById(userId, t);
    if (!user) {
      throw new ApiError(STATUS_CODE.NOT_FOUND, MESSAGES.USER.NOT_FOUND);
    }
    const servicePartner =
      await servicePartnerRepository.findServicePartnerByUserIdFull(userId, t);
    if (!servicePartner) {
      throw new ApiError(
        STATUS_CODE.NOT_FOUND,
        MESSAGES.EXPERT.NOT_FOUND_PARTNER
      );
    }

    switch (payload.type) {
      case ProfileUpdateType.CONTACT: {
        user.mobileNumber = payload.mobile;
        user.email = payload.email;

        servicePartner.permanentAddress = payload.permanent_address;
        servicePartner.residentialAddress = payload.residential_address;

        await user.save({ transaction: t });
        await servicePartner.save({ transaction: t });

        break;
      }
      case ProfileUpdateType.PASSWORD: {
        const isMatch = await bcrypt.compare(
          payload.current_password,
          user.password
        );

        if (!isMatch) {
          throw new ApiError(
            STATUS_CODE.BAD_REQUEST,
            MESSAGES.SERVICE_PARTNER.INVALID_CURRENT_PASSWORD
          );
        }

        const isSameAsOld = await bcrypt.compare(
          payload.password,
          user.password
        );

        if (isSameAsOld) {
          throw new ApiError(
            STATUS_CODE.BAD_REQUEST,
            MESSAGES.SERVICE_PARTNER.NEW_PASSWORD_SAME_AS_OLD
          );
        }

        if (payload.password !== payload.password_confirmation) {
          throw new ApiError(
            STATUS_CODE.BAD_REQUEST,
            MESSAGES.SERVICE_PARTNER.PASSWORD_MISMATCH
          );
        }

        const hashedPassword = await bcrypt.hash(
          payload.password,
          BCRYPT_SALT_ROUNDS
        );

        user.password = hashedPassword;
        await user.save({ transaction: t });

        break;
      }
      case ProfileUpdateType.IMAGE: {
        if (!profileImageFile) {
          throw new ApiError(
            STATUS_CODE.BAD_REQUEST,
            MESSAGES.SERVICE_PARTNER.PROFILE_IMG_REQUIRED
          );
        }
        const result = await uploadImage(
          profileImageFile,
          `${CLOUDINARY_FOLDERS.SERVICE_PARTNER}/profile_images`
        );
        user.profileImage = result.url;
        user.cloudinaryId = result.publicId;

        await user.save({ transaction: t });

        break;
      }
      default:
        throw new ApiError(
          STATUS_CODE.BAD_REQUEST,
          MESSAGES.SERVICE_PARTNER.INVALID_UPDATE_TYPE
        );
    }
    await t.commit();
    const result: ServicePartnerProfileResponse = {
      id: user.id,
      name: user.name,
      country_code: user.countryCode ?? "",
      mobile_number: user.mobileNumber,
      email: user.email,
      permanent_address: servicePartner.permanentAddress ?? "",
      residential_address: servicePartner.residentialAddress ?? "",
      role: userRole || "",
      profile_image: {
        url: user.profileImage || null,
        thumbnail: user.profileImage
          ? getCloudinaryThumbnail(user.profileImage)
          : null,
        public_id: user.cloudinaryId || null,
      },
    };
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};
