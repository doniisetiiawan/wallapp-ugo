import validator from 'validator';
import extend from 'extend';
import memoize from 'memoizejs';

const customValidator = extend({}, validator);

customValidator.validate = function (method) {
  if (!customValidator[method]) {
    throw new Error('validator method does not exist');
  }

  // get an array of the arguments except the first one (the method name)
  // eslint-disable-next-line prefer-rest-params
  const args = Array.prototype.slice.call(arguments, 1);

  // eslint-disable-next-line prefer-spread
  return (value) => customValidator[method].apply(
    customValidator,
    Array.prototype.concat(value, args),
  );
};

customValidator.validate = memoize(
  customValidator.validate,
);

export default customValidator;
