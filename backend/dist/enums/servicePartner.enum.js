"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalAction = exports.ServicePartnerStatus = exports.VerificationStatus = exports.LanguageEnum = exports.Proficiency = exports.Gender = void 0;
var Gender;
(function (Gender) {
    Gender["MALE"] = "Male";
    Gender["FEMALE"] = "Female";
})(Gender || (exports.Gender = Gender = {}));
var Proficiency;
(function (Proficiency) {
    Proficiency["BEGINNER"] = "Beginner";
    Proficiency["INTERMEDIATE"] = "Intermediate";
    Proficiency["EXPERT"] = "Expert";
})(Proficiency || (exports.Proficiency = Proficiency = {}));
var LanguageEnum;
(function (LanguageEnum) {
    LanguageEnum["ENGLISH"] = "English";
    LanguageEnum["HINDI"] = "Hindi";
    LanguageEnum["SPANISH"] = "Spanish";
    LanguageEnum["FRENCH"] = "French";
    LanguageEnum["GERMAN"] = "German";
    // Add more as needed
})(LanguageEnum || (exports.LanguageEnum = LanguageEnum = {}));
var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["PENDING"] = "Pending";
    VerificationStatus["VERIFIED"] = "Verified";
    VerificationStatus["REJECTED"] = "Rejected";
})(VerificationStatus || (exports.VerificationStatus = VerificationStatus = {}));
var ServicePartnerStatus;
(function (ServicePartnerStatus) {
    ServicePartnerStatus["ACTIVE"] = "Active";
    ServicePartnerStatus["INACTIVE"] = "Inactive";
    ServicePartnerStatus["SUSPENDED"] = "Suspended";
})(ServicePartnerStatus || (exports.ServicePartnerStatus = ServicePartnerStatus = {}));
var ApprovalAction;
(function (ApprovalAction) {
    ApprovalAction["APPROVE"] = "approve";
    ApprovalAction["REJECT"] = "reject";
})(ApprovalAction || (exports.ApprovalAction = ApprovalAction = {}));
