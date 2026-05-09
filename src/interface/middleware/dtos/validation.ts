import { Request, Response, NextFunction } from 'express';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export const UseRequestDto = (dto: any) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> => {
    if (!req.body) return next();
    
    // Convert plain object to DTO class instance for validation
    const dtoInstance = plainToInstance(dto, req.body, {
      excludeExtraneousValues: false,
    });
    
    // Validate the DTO instance
    const validationErrors = await validate(dtoInstance, {
      whitelist: true,
    });
    
    if (validationErrors?.length > 0) {
      return res.status(400).json({
        error: {
          code: 400,
          errors: validationErrors.map(e => ({
            field: e.property,
            errors: Object.values(e.constraints || {}),
          })),
        },
      });
    }
    
    // Convert back to plain object for the service layer
    req.body = instanceToPlain(dtoInstance);
    
    return next();
  };
};
export const UseResponseDto = (dto: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    res.locals.responseDTO = dto;

    // Override res.json to automatically transform response
    const originalJson = res.json;
    res.json = function (body: any) {
      if (body && body.data && res.locals.responseDTO) {
        // Transform the data using the DTO
        if (typeof res.locals.responseDTO === 'function') {
          body.data = new res.locals.responseDTO(body.data);
        } else {
          body.data = plainToInstance(res.locals.responseDTO, body.data, {
            excludeExtraneousValues: true,
          });
        }
      }
      return originalJson.call(this, body);
    };

    return next();
  };
};
