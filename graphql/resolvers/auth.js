const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../../models/user');



module.exports = {
    createUser: async ({ userInput }) => {
        try {
            const user = await User.findOne({ email: userInput.email });
            if (user) {
                throw new Error('User exists already');
            }

            const hasedPassword = await bcrypt.hash(userInput.password, 12);

            const newUser = new User({
                email: userInput.email,
                password: hasedPassword
            });

            await newUser.save();

            return { ...newUser._doc, password: null, _id: newUser.id };

        } catch (err) {
            throw err
        }
    },
    login: async ({ email, password }) => {

        const user = await User.findOne({ email: email });

        if (!user) {
            throw new Error('User does not exist!');
        }

        const isEqual = await bcrypt.compare(password, user.password);

        if (!isEqual) {
            throw new Error('Password is incorrect!');
        }
        const token = jwt.sign({ userId: user.id, email: email }, 'somesupersecretkey', { expiresIn: '1h' });

        return { userId: user.id, token: token, tokenExpiration: 1 };

    }
};