var _ = require('lodash-node');
var co = require('co');
var instapromise = require('instapromise');
var inquirer = require('inquirer');

var api = require('../api');
var password = require('../password');
var userSettings = require('../userSettings');

module.exports = {
  name: 'adduser',
  description: "Creates a user on exp.host",
  help: "",
  runAsync: co.wrap(function *(env) {
    var argv = env.argv;
    var args = argv._;
    var [_cmd, username, cleartextPassword, email, phoneNumber] = args;
    username = username || argv.username;
    cleartextPassword = cleartextPassword || argv.password
    email = email || argv.email;
    phoneNumber = phoneNumber || argv.phoneNumber;

    var settingsData = yield userSettings.readFileAsync();

    var questions = [];

    if (!username) {
      questions.push({
        type: 'input',
        name: 'username',
        message: 'username',
        default: settingsData.username,
        validate: function (val) {
          // TODO: Validate username here
          return true;
        },
      });
    }

    if (!cleartextPassword) {
      questions.push({
        type: 'password',
        name: 'cleartextPassword',
        message: 'password',
        validate: function (val) {
          // TODO: Validate
          return true;
        },
      });
    }

    if (!email) {
      questions.push({
        type: 'input',
        name: 'email',
        message: "E-mail address",
        default: settingsData.email,
      });
    }

    if (!phoneNumber) {
      questions.push({
        type: 'input',
        name: 'phoneNumber',
        message: 'Mobile phone number',
        default: settingsData.phoneNumber,
      });
    }

    // TODO: Make this more of a Promise/yieldable situation so we can continue inline here
    inquirer.prompt(questions, function (answers) {
      var data = {
        username: username || answers.username,
        cleartextPassword: cleartextPassword || answers.cleartextPassword,
        email: email || answers.email,
        phoneNumber: phoneNumber || answers.phoneNumber,
      };

      // Store only the hashed version of someone's password
      data.hashedPassword = password.hashPassword(data.cleartextPassword);
      delete data.cleartextPassword;
      console.log("data=", data);
      // TODO: Call the API. Write the settings file

      var result = yield api.callMethodAsync('adduser', data);
      console.log("result=", result);
    });

  }),
};