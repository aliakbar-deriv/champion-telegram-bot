const BaseCommand = require('../baseCommand');
const Logger = require('../../../utils/logger');

// Mock dependencies
jest.mock('../../../utils/logger');

describe('BaseCommand', () => {
  let baseCommand;
  let mockBot;
  let mockCtx;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock bot
    mockBot = {
      command: jest.fn()
    };

    // Create mock context
    mockCtx = {
      reply: jest.fn().mockResolvedValue(true),
      message: {
        text: '/testcommand'
      },
      from: {
        id: 123,
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        language_code: 'en'
      }
    };

    baseCommand = new BaseCommand(mockBot);
  });

  describe('register', () => {
    it('should register command handler with bot', () => {
      baseCommand.register('test');

      expect(mockBot.command).toHaveBeenCalledWith('test', expect.any(Function));
    });

    it('should bind handle method to command', async () => {
      // Create a child class that implements handle
      class TestCommand extends BaseCommand {
        async handle(ctx) {
          await ctx.reply('Test response');
        }
      }
      
      const testCommand = new TestCommand(mockBot);
      const handleSpy = jest.spyOn(testCommand, 'handle');
      testCommand.register('test');

      // Get the registered handler function
      const handler = mockBot.command.mock.calls[0][1];
      
      // Call the handler
      await handler(mockCtx);

      expect(handleSpy).toHaveBeenCalledWith(mockCtx);
      expect(mockCtx.reply).toHaveBeenCalledWith('Test response');
    });
  });

  describe('handle', () => {
    it('should throw error when not implemented', async () => {
      // Create a new instance without implementing handle
      const command = new BaseCommand(mockBot);
      
      await expect(command.handle(mockCtx))
        .rejects
        .toThrow('Command handler must implement handle method');
    });

    it('should allow implementation by child class', async () => {
      // Create a child class that implements handle
      class TestCommand extends BaseCommand {
        async handle(ctx) {
          await ctx.reply('Test response');
        }
      }
      
      const testCommand = new TestCommand(mockBot);
      await testCommand.handle(mockCtx);

      expect(mockCtx.reply).toHaveBeenCalledWith('Test response');
    });
  });

  describe('getUserInfo', () => {
    it('should extract user info from context', () => {
      const userInfo = baseCommand.getUserInfo(mockCtx);

      expect(userInfo).toEqual({
        id: 123,
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        languageCode: 'en'
      });
    });

    it('should handle missing optional user fields', () => {
      const partialCtx = {
        from: {
          id: 123,
          username: 'testuser'
          // first_name, last_name, and language_code are missing
        }
      };

      const userInfo = baseCommand.getUserInfo(partialCtx);

      expect(userInfo).toEqual({
        id: 123,
        username: 'testuser',
        firstName: undefined,
        lastName: undefined,
        languageCode: undefined
      });
    });
  });

  describe('handleError', () => {
    it('should log error and send error message', async () => {
      const error = new Error('Test error');
      
      await baseCommand.handleError(mockCtx, error);

      // Verify error was logged
      expect(Logger.error).toHaveBeenCalledWith(
        'Command error: Test error',
        expect.objectContaining({
          command: '/testcommand',
          user: expect.objectContaining({
            id: 123,
            username: 'testuser'
          }),
          error: expect.objectContaining({
            message: error.message,
            stack: error.stack
          })
        })
      );

      // Verify error message was sent to user
      expect(mockCtx.reply).toHaveBeenCalledWith(
        'Sorry, there was an error processing your command. Please try again.'
      );
    });
  });
});
