/**
 * Formats a message template by replacing placeholders with provided parameters
 * @param {string} template - The message template containing placeholders
 * @param {Object} params - Object containing parameter values to replace placeholders
 * @returns {string} Formatted message with replaced parameters
 */
function formatMessage(template, params) {
    if (!template || typeof template !== 'string') {
        return template;
    }

    return Object.entries(params).reduce((message, [key, value]) => {
        const placeholder = `%${key}%`;
        return message.replace(new RegExp(placeholder, 'g'), value || '');
    }, template);
}

module.exports = {
    formatMessage
};
