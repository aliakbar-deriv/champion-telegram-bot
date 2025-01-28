require('dotenv').config();
const Logger = require('../utils/logger');

/**
 * Configuration schema definition
 * @type {Object}
 */
const configSchema = {
  env: {
    type: 'string',
    enum: ['development', 'staging', 'production'],
    default: 'production'
  },
  bot: {
    token: {
      type: 'string',
      required: true,
      envKey: 'BOT_TOKEN'
    },
    webAppUrl: {
      type: 'string',
      required: true,
      validate: (value) => value.startsWith('https://'),
      envKey: 'WEBAPP_URL'
    },
    webAppHostUrl: {
      type: 'string',
      required: true,
      validate: (value) => value.startsWith('https://'),
      envKey: 'WEBAPP_HOST_URL'
    }
  },
  urls: {
    support: {
      type: 'string',
      default: 'https://champion.trade/support'
    },
    learnMore: {
      type: 'string',
      default: 'https://champion.trade/'
    }
  },
  logging: {
    level: {
      type: 'string',
      enum: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'NONE'],
      default: 'WARN',
      envKey: 'LOG_LEVEL'
    }
  }
};

/**
 * Validate a configuration value against its schema
 * @param {*} value - Configuration value
 * @param {Object} schema - Value schema
 * @param {string} path - Configuration path for error messages
 * @throws {Error} If validation fails
 */
function validateValue(value, schema, path) {
  // Check type
  if (schema.type && typeof value !== schema.type) {
    throw new Error(`Invalid type for ${path}: expected ${schema.type}, got ${typeof value}`);
  }

  // Check enum values
  if (schema.enum && !schema.enum.includes(value)) {
    throw new Error(`Invalid value for ${path}: must be one of [${schema.enum.join(', ')}]`);
  }

  // Run custom validation
  if (schema.validate && !schema.validate(value)) {
    throw new Error(`Validation failed for ${path}`);
  }
}

/**
 * Build configuration object with validation
 * @param {Object} schema - Configuration schema
 * @param {Object} env - Environment variables
 * @param {string} [prefix=''] - Current path prefix for nested objects
 * @returns {Object} Validated configuration object
 */
function buildConfig(schema, env, prefix = '') {
  const config = {};

  for (const [key, value] of Object.entries(schema)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && !value.type) {
      // Nested configuration object
      config[key] = buildConfig(value, env, path);
    } else {
      // Get value from environment using envKey if specified
      const envKey = value.envKey || key.toUpperCase();
      let configValue = env[envKey];

      // Handle required values
      if (value.required && configValue === undefined) {
        throw new Error(`Missing required environment variable: ${envKey}`);
      }

      // Use default if no value provided
      if (configValue === undefined && 'default' in value) {
        configValue = value.default;
      }

      // Validate value if present
      if (configValue !== undefined) {
        validateValue(configValue, value, path);
        config[key] = configValue;
      }
    }
  }

  return config;
}

// Build and validate configuration
let config;
try {
  config = buildConfig(configSchema, process.env);
  Logger.debug('Configuration loaded successfully', { env: config.env });
} catch (error) {
  Logger.error('Configuration error:', error);
  throw error;
}

// Freeze configuration to prevent modifications
Object.freeze(config);
Object.keys(config).forEach(key => {
  if (typeof config[key] === 'object') {
    Object.freeze(config[key]);
  }
});

module.exports = config;
