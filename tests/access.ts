import Assert = require('assert');
import Bluebird = require('bluebird');
import webdriver = require('selenium-webdriver');
import helpers = require('./helpers');
import Request = require('request-promise');
import Errors = require('request-promise/errors');

describe('basic routes', function() {
  this.timeout(5000);

  it('should access to /', function() {
    return helpers.withChrome(function(driver) {
      return Bluebird.resolve(driver.get(`http://john:password@localhost:3000`))
        .then(function() {
            return Bluebird.resolve(
              driver.wait(webdriver.until.elementLocated(webdriver.By.css(".helper")), 5000));
          });
        });
  });

  it('should access to /ping', function() {
    return helpers.withChrome(function(driver) {
      return Bluebird.resolve(driver.get(`http://john:password@localhost:3000/ping`))
        .then(function() {
            return Bluebird.resolve(
              driver.wait(webdriver.until.elementLocated(webdriver.By.css("p")), 5000))
          })
          .then(function(el) {
            return Bluebird.resolve(driver.wait(webdriver.until.elementTextContains(el, 'pong'), 5000));
          });
        });
  });

  describe('should access to /delegate', function() {
    it('get', function() {
      return helpers.withChrome(function(driver) {
        return Bluebird.resolve(driver.get(`http://john:password@localhost:3000/delegate`))
          .then(function() {
            return Bluebird.resolve(
              driver.wait(webdriver.until.elementLocated(webdriver.By.css("p")), 5000))
          })
          .then(function(el) {
            return Bluebird.resolve(driver.wait(webdriver.until.elementTextContains(el, 'This endpoint'), 5000));
          });
      });
    });

    it('post', function() {
      return helpers.withChrome(function(driver) {
        return Request({ uri: 'http://john:password@localhost:3000/delegate', json: true, method: 'POST' })
          .then(function(res: any) {
            return Bluebird.reject(new Error('should not succeed'));
          })
          .catch(Errors.StatusCodeError, function(err: Errors.StatusCodeError) {
            if (err.statusCode == 406) {
              return Bluebird.resolve();
            }
            return Bluebird.reject(new Error('bad error'));
          });
      });
    });
  });

  describe('should not access to /delegate', function() {
    it('get', function() {
      return helpers.withChrome(function(driver) {
        return Bluebird.resolve(driver.get(`http://john:password@localhost:3002/delegate`))
          .then(function() {
              return Bluebird.resolve(
                driver.wait(webdriver.until.elementLocated(webdriver.By.css("body")), 5000))
            })
            .then(function(el) {
              return Bluebird.resolve(driver.wait(webdriver.until.elementTextContains(el, 'Cannot GET /delegate'), 5000));
            });
          });
    });
    it('post', function() {
      return helpers.withChrome(function(driver) {
        return Request({ uri: 'http://john:password@localhost:3002/delegate', json: true, method: 'POST' })
          .then(function(res: any) {
            return Bluebird.reject(new Error('should not succeed'));
          })
          .catch(Errors.StatusCodeError, function(err: Errors.StatusCodeError) {
            if (err.statusCode == 404) {
              return Bluebird.resolve();
            }
            return Bluebird.reject(new Error('bad error'));
          });
      });
    });
  });
});
