/** Routes for authentication */

const jsonschema = require("jsonschema");

const express = require("express");
const router = new express.Router();
const { ExpressError, BadRequestError }= require("../expressError");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const userRegisterSchema = require("../schemas/userRegister.json");
const User = require("../models/userModel");

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, email} => {token}.
 *
 */

router.post(`/register`, async (req, res, next) => {
    try {
        // Check if request is valid, if not throw error
        const validator = jsonschema.validate(req.body, userRegisterSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        
        // token payload includes username property
        const { username } = await User.register(req.body)
        let token = jwt.sign({username}, SECRET_KEY);
        return res.json({token})
    } catch (e) {
        return next(e)
    }
});

/** POST /login - login: {username, password} => {token} **/

router.post(`/login`, async(req, res, next) => {
    try {
        let {username, password} = req.body;
        if (await User.authenticate(username, password)) {
            let token = jwt.sign({username}, SECRET_KEY);
            return res.json({token});
        } else {
            throw new ExpressError("Invalid username/password", 400);
        }
    } catch(e) {
        return next(e);
    }
});

module.exports = router;