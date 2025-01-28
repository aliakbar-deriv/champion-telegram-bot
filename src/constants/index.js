// Web App Data Types
const WebAppDataTypes = {
    TRADE: 'trade',
    ERROR: 'error'
};

// Trade Actions
const TradeActions = {
    BUY: 'buy',
    SELL: 'sell'
};

// Bot Action Types
const BotActionTypes = {
    ABOUT: 'about',
    TRADE: 'trade',
    HELP: 'help'
};

// Message Templates
const MessageTemplates = {
    WELCOME: '✨ Welcome to Champion Trade - Where Your Financial Success Begins!\n\nWe\'re delighted to have you join our community of successful traders. At Champion Trade, we understand that every trade is a step towards your financial goals, and we\'re here to support your journey every step of the way.\n\nOur state-of-the-art platform offers you:\n\n🔹 Real-time market intelligence with live updates\n🔹 Advanced charting suite with professional indicators\n🔹 Swift and precise trade execution\n🔹 Diverse portfolio opportunities across global markets\n🔹 Sophisticated risk management solutions\n🔹 Enterprise-grade security protocols\n🔹 Dedicated 24/7 expert assistance\n\n🚀 Try our Champion Trader telegram app now and experience trading like never before!\n➡️ %WEB_APP_URL%\n\nYour path to financial excellence starts here. We invite you to explore our comprehensive trading environment and take the first step towards achieving your investment goals. 🌟',

    TRADE_PROMPT: '💫 Ready to Excel in the Markets?\n\nAt Champion Trade, we\'ve crafted an exceptional trading experience that combines power with precision:\n\n• Comprehensive market analysis with real-time insights\n• Professional-grade charting with advanced technical tools\n• Seamless execution with institutional-grade speed\n• Global market access with diverse opportunities\n• Advanced risk management with protective features\n• Bank-level security for your peace of mind\n\nWe\'re ready to support your trading success. Let\'s begin this rewarding journey together! ✨',

    HELP_GUIDE: '🤝 We\'re Here to Support Your Trading Journey\n\nWe understand that navigating the financial markets requires the right support at the right time. Our dedicated team is committed to ensuring your trading experience is smooth and successful.\n\nOur comprehensive Support Center provides:\n• Expert guidance through detailed FAQs\n• Professional video tutorials and trading guides\n• Personal assistance via live chat\n• Swift technical support\n• Round-the-clock professional assistance\n\nYour success is our priority. Click the Support button below to connect with our expert team - we\'re here to help you thrive! 💫',

    ABOUT: '🌟 Champion Trade - Your Trusted Partner in Financial Markets\n\nWe\'re committed to empowering traders with:\n• Professional-grade trading tools and advanced analytics\n• Extensive access to global financial markets\n• Competitive pricing and efficient execution\n• Industry-leading security measures\n• Dedicated expert support and market insights\n• Comprehensive educational resources\n\nJoin our growing community of successful traders who have chosen Champion Trade as their trusted partner in their financial journey. Together, we\'ll help you achieve your trading goals. ✨',

    ERROR: {
        GENERAL: 'We apologize for the inconvenience. Our team has been notified, and we\'re working to resolve this. Please try again in a moment.',
        INVALID_DATA: 'We noticed an issue with the data received. Please try your action again.',
        TRADE_PROCESSING: 'We encountered a brief issue processing your trade. Please retry your transaction.',
        WEB_APP: 'We apologize for the temporary disruption. Please try your request again.'
    }
};

module.exports = {
    WebAppDataTypes,
    TradeActions,
    BotActionTypes,
    MessageTemplates
};
