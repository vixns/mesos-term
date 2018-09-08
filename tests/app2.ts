import AppsHelpers = require('./apps_helpers');

describe('app2 (label GRANTED_TO harry, no root)', function() {
  describe('authorizations disabled', function() {
    describe('user john', function() {
      AppsHelpers.testInteractionsWithTerminal(3001, 'john', 'app2');
    });
  });

  describe('authorizations enabled', function() {
    describe('admins are enabled', function() {
      describe('super admin user john', function() {
        AppsHelpers.testInteractionsWithTerminal(3000, 'john', 'app2');
      });

      describe('user harry', function() {
        AppsHelpers.testInteractionsWithTerminal(3000, 'harry', 'app2');
      });

      describe('grant access button is displayed to john', function() {
        AppsHelpers.testShouldSeeGrantAccessButton(3000, 'john', 'app2');
      })

      describe('grant access button is not displayed to harry', function() {
        AppsHelpers.testShouldNotSeeGrantAccessButton(3000, 'harry', 'app2');
      })

      describe('user james', function() {
        AppsHelpers.testUnauthorizedUser(3000, 'james', 'app2');
      });
    });

    describe('admins are disabled', function() {
      describe('super admin user john', function() {
        AppsHelpers.testInteractionsWithTerminal(3002, 'john', 'app2');
      });

      describe('user harry', function() {
        AppsHelpers.testUnauthorizedUser(3002, 'harry', 'app2');
      });

      describe('user james', function() {
        AppsHelpers.testUnauthorizedUser(3002, 'james', 'app2');
      });
    });
  });
});
