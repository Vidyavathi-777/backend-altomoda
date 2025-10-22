const express = require("express");
const router = express.Router();
const authController = require("../../controllers/auth.controller");

const {protect} = require("../../middlewares/auth.middleware");
const { validate } = require("../../middlewares/validation.middleware");
const { authLimiter } = require("../../middlewares/rateLimit.middleware");
const validators = require("../../utils/validators");


router.post(
  "/signup",
  authLimiter,
  validate(validators.signupSchema),
  authController.signup
);
router.post(
  "/login",
  authLimiter,
  validate(validators.loginSchema),
  authController.login
);
router.post("/refresh", authController.refreshToken);
router.post("/logout", protect, authController.logout);
router.get("/me", protect, authController.getMe);
router.post(
  "/me/addresses",
  protect,
  validate(validators.addressSchema),
  authController.addAddress
);
router.put("/me/addresses/:addressId", protect, authController.updateAddress);
router.delete(
  "/me/addresses/:addressId",
  protect,
  authController.deleteAddress
);

module.exports = router;
