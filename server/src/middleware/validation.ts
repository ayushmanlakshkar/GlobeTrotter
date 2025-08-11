import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const registerSchema = Joi.object({
  first_name: Joi.string().min(2).max(255).required(),
  last_name: Joi.string().min(2).max(255).required(),
  username: Joi.string().min(3).max(255).alphanum().required(),
  email: Joi.string().email().required(),
  phone_number: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
  city: Joi.string().min(2).max(255).required(),
  country: Joi.string().min(2).max(255).required(),
  password: Joi.string().min(8).max(128).required(),
  avatar_url: Joi.string().uri().optional(),
  additional_info: Joi.string().max(1000).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const validateRegister = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = registerSchema.validate(req.body);
  
  if (error) {
    res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details.map(detail => detail.message)
    });
    return;
  }
  
  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = loginSchema.validate(req.body);
  
  if (error) {
    res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details.map(detail => detail.message)
    });
    return;
  }
  
  next();
};
