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

const createTripSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(1000).optional(),
  start_date: Joi.date().iso().required(),
  end_date: Joi.date().iso().greater(Joi.ref('start_date')).required(),
  cover_photo: Joi.string().uri().optional(),
  is_public: Joi.boolean().optional()
});

const addTripStopSchema = Joi.object({
  city_id: Joi.string().uuid().required(),
  start_date: Joi.date().iso().required(),
  end_date: Joi.date().iso().greater(Joi.ref('start_date')).required(),
  order_index: Joi.number().integer().min(0).optional()
});

const addTripActivitySchema = Joi.object({
  activity_id: Joi.string().uuid().required(),
  date: Joi.date().iso().required(),
  time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  min_cost_override: Joi.number().min(0).optional(),
  max_cost_override: Joi.number().min(0).optional()
});

const suggestedActivitiesSchema = Joi.object({
  city_id: Joi.string().uuid().required(),
  category: Joi.string().valid(
    'sightseeing', 'food', 'adventure', 'shopping', 'entertainment', 
    'culture', 'nature', 'sports', 'nightlife', 'relaxation'
  ).optional(),
  min_cost: Joi.number().min(0).optional(),
  max_cost: Joi.number().min(0).optional(),
  limit: Joi.number().integer().min(1).max(100).optional()
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

export const validateCreateTrip = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = createTripSchema.validate(req.body);
  
  if (error) {
    res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details.map(detail => detail.message)
    });
    return;
  }
  
  next();
};

export const validateAddTripStop = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = addTripStopSchema.validate(req.body);
  
  if (error) {
    res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details.map(detail => detail.message)
    });
    return;
  }
  
  next();
};

export const validateAddTripActivity = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = addTripActivitySchema.validate(req.body);
  
  if (error) {
    res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details.map(detail => detail.message)
    });
    return;
  }
  
  next();
};

export const validateSuggestedActivities = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = suggestedActivitiesSchema.validate(req.query);
  
  if (error) {
    res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details.map(detail => detail.message)
    });
    return;
  }
  
  next();
};
