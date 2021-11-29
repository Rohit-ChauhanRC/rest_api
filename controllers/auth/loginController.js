import Joi from "joi";
import { User } from "../../models";
import { CustomErrorHandler, JwtService } from "../../services";
import bcrypt from 'bcrypt'

const loginController = {
  async login(req, res, next) {
    // validation
    const loginSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),

    });

    const { error } = loginSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    try {
      const user = await User.findOne({
        email: req.body.email
      });

      if (!user) {
        return next(CustomErrorHandler.wrongCredentials());
      }
      console.log(user);
      console.log(req.body.password);
      // compare the password
      const match = await bcrypt.compare(req.body.password, user.password);

      if (!match) {
        return next(CustomErrorHandler.wrongCredentials());
      }

      // token generate
      const access_token = JwtService.sign({ _id: user._id, role: user.role });

      res.json({ access_token: access_token });
    } catch (err) {
      return next(err);
    }
  }
}

export default loginController;