const Joi = require('joi');

const validators = {
  signupSchema: Joi.object({
    name: Joi.string().required().min(2).max(100),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(8),
    phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
  }),

  loginSchema: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  addressSchema: Joi.object({
    label: Joi.string().optional(),
    line1: Joi.string().required(),
    line2: Joi.string().optional().allow(''),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.string().pattern(/^[0-9]{6}$/).required(),
    country: Joi.string().default('India'),
    isDefault: Joi.boolean().default(false),
  }),

  checkoutSchema: Joi.object({
    cartId: Joi.string().optional(),
    items: Joi.array().items(
      Joi.object({
        sku: Joi.string().required(),
        qty: Joi.number().integer().min(1).required(),
      })
    ).optional(),
    customer: Joi.object({
      id: Joi.string().optional(),
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    }).required(),
    shippingAddressId: Joi.string().required(),
    billingAddressId: Joi.string().required(),
    paymentMethod: Joi.string().valid('card', 'upi', 'netbanking', 'wallet').required(),
  }),

  pricingOverrideSchema: Joi.object({
    type: Joi.string().valid('brand', 'category', 'sku').required(),
    target: Joi.string().required(),
    rule: Joi.object({
      marginPct: Joi.number().optional(),
      fixedMarkup: Joi.number().optional(),
      roundingStrategy: Joi.string().optional(),
    }).required(),
    active: Joi.boolean().default(true),
    priority: Joi.number().default(0),
  }),
};

module.exports = validators;