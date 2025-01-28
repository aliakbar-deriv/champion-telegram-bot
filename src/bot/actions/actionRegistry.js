const BaseRegistry = require('../registry/baseRegistry');

class ActionRegistry extends BaseRegistry {
  constructor() {
    super('Action');
  }
}

// Create singleton instance
const actionRegistry = new ActionRegistry();

module.exports = actionRegistry;
