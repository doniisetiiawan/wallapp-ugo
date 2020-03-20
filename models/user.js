import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

import validator from '../lib/validator';

const { Schema } = mongoose;

const User = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    validate: [
      {
        validator: validator.validate('isAlphanumeric'),
        msg: 'username must be alphanumeric',
      },
      {
        validator: validator.validate('isLength', 4, 255),
        msg: 'username must have 4-255 chars',
      },
    ],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: validator.validate('isEmail'),
  },
});

User.plugin(passportLocalMongoose);

export default mongoose.model('User', User);
