const { regex } = require('./config');

export const validateLength = (object, lengths) => object?.length >= lengths?.min && object?.length <= lengths?.max;
export const invalidLength = (name, lengths) => `${name} has to be ${lengths?.min} - ${lengths?.max} characters.`;

export const validateEmail = (email) => regex.email.test(email);
export const invalidEmail = 'Invalid email address.';

export const validateUsername = (username) => regex.username.test(username);
export const invalidUsername = 'Username must only have letters and numbers.';

export const validatePassword = (password) => regex.password.test(password);
export const invalidPassword = 'Password must have one uppercase letter, one lowercase letter, one number, and one special character (@, #, \\, $, &, !, ?).';

export const validateServerNickname = (nickname) => regex.server_nickname.test(nickname);
export const invalidServerNickname = 'Nickname must only have letters, numbers, and spaces.';