/**
 * UUID Validation Utility
 * 
 * Provides validation for UUID format to ensure consistency across the system.
 * All transaction IDs, user IDs, and other entity IDs should be in UUID v4 format.
 */

export class UUIDValidator {
  // UUID v4 format regex
  private static readonly UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  // Old format detection (e.g., TXN-2024-001)
  private static readonly OLD_FORMAT_REGEX = /^[A-Z]+-\d{4}-\d{3,}$/;

  /**
   * Validate if string is a valid UUID v4 format
   * @param value - String to validate
   * @returns true if valid UUID, false otherwise
   */
  static isValid(value: string): boolean {
    if (!value || typeof value !== 'string') {
      return false;
    }
    return this.UUID_REGEX.test(value);
  }

  /**
   * Check if string matches old format (e.g., TXN-2024-001)
   * @param value - String to check
   * @returns true if matches old format, false otherwise
   */
  static isOldFormat(value: string): boolean {
    if (!value || typeof value !== 'string') {
      return false;
    }
    return this.OLD_FORMAT_REGEX.test(value);
  }

  /**
   * Validate UUID and throw error if invalid
   * @param value - UUID string to validate
   * @param fieldName - Name of the field being validated (for error messages)
   * @throws {Error} If UUID is invalid
   */
  static validateOrThrow(value: string, fieldName: string = 'ID'): void {
    if (!this.isValid(value)) {
      throw new Error(
        `${fieldName} must be a valid UUID format (e.g., 550e8400-e29b-41d4-a716-446655440000). ` +
        `Received: ${value}`
      );
    }
  }

  /**
   * Validate multiple UUIDs at once
   * @param values - Array of UUID strings
   * @param fieldName - Name of the field being validated
   * @returns Object with validation results
   */
  static validateMany(values: string[], fieldName: string = 'ID'): {
    valid: string[];
    invalid: string[];
    errors: string[];
  } {
    const valid: string[] = [];
    const invalid: string[] = [];
    const errors: string[] = [];

    values.forEach((value, index) => {
      if (this.isValid(value)) {
        valid.push(value);
      } else {
        invalid.push(value);
        errors.push(`${fieldName}[${index}] is invalid: ${value}`);
      }
    });

    return { valid, invalid, errors };
  }

  /**
   * Get example UUID for documentation/testing
   * @returns Example UUID string
   */
  static getExample(): string {
    return '550e8400-e29b-41d4-a716-446655440000';
  }

  /**
   * Format error message for invalid UUID
   * @param value - Invalid value
   * @param fieldName - Field name
   * @returns Formatted error message
   */
  static formatError(value: string, fieldName: string = 'ID'): string {
    if (this.isOldFormat(value)) {
      return (
        `${fieldName} format is outdated. ` +
        `Old format (${value}) is no longer supported. ` +
        `Please use UUID format (e.g., ${this.getExample()})`
      );
    }
    
    return (
      `${fieldName} must be a valid UUID format. ` +
      `Received: ${value}. ` +
      `Example: ${this.getExample()}`
    );
  }
}

/**
 * Express middleware for validating UUID in request parameters
 * @param paramName - Name of the parameter to validate
 * @returns Express middleware function
 */
export const validateUUIDParam = (paramName: string) => {
  return (req: any, res: any, next: any) => {
    const value = req.params[paramName];
    
    if (!value) {
      return res.status(400).json({
        success: false,
        message: `Parameter '${paramName}' is required`,
        statusCode: 400
      });
    }

    if (!UUIDValidator.isValid(value)) {
      return res.status(400).json({
        success: false,
        message: UUIDValidator.formatError(value, paramName),
        statusCode: 400
      });
    }

    next();
  };
};

/**
 * Express middleware for validating UUID in request body
 * @param fieldName - Name of the field to validate
 * @param required - Whether the field is required
 * @returns Express middleware function
 */
export const validateUUIDBody = (fieldName: string, required: boolean = true) => {
  return (req: any, res: any, next: any) => {
    const value = req.body[fieldName];

    if (!value && required) {
      return res.status(400).json({
        success: false,
        message: `Field '${fieldName}' is required`,
        statusCode: 400
      });
    }

    if (value && !UUIDValidator.isValid(value)) {
      return res.status(400).json({
        success: false,
        message: UUIDValidator.formatError(value, fieldName),
        statusCode: 400
      });
    }

    next();
  };
};

export default UUIDValidator;