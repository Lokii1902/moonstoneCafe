const Joi = require('joi');

const validateRequest = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

const schemas = {
    contactMessage: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        email: Joi.string().email().required(),
        phone: Joi.string().pattern(/^[0-9]+$/).min(10).max(15).allow(''),
        subject: Joi.string().max(200).allow(''),
        message: Joi.string().min(10).required()
    }),
    reservation: Joi.object({
        name: Joi.string().required(),
        phone: Joi.string().required(),
        date: Joi.date().iso().required(),
        time: Joi.string().required(),
        guests: Joi.number().integer().min(1).max(50).required()
    }),
    menuItem: Joi.object({
        category_id: Joi.number().required(),
        name: Joi.string().required(),
        description: Joi.string().allow(''),
        price: Joi.number().positive().required(),
        is_veg: Joi.boolean().required(),
        image_url: Joi.string().uri().allow(''),
        is_available: Joi.boolean()
    })
};

module.exports = { validateRequest, schemas };
