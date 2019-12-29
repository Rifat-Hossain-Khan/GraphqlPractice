const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');


module.exports = {
    events: () => {
        return Event.find().populate({
            path: 'creator',
            populate: {
                path: 'createdEvents',
                model: 'Event'
            }
        })
            .then(events => {
                return events.map(event => {
                    // return { ...event._doc, _id: event._doc._id.toString() };
                    return { ...event._doc, _id: event.id, date: new Date(event._doc.date).toISOString(), creator: { ...event._doc.creator._doc, password: null } };
                });
            }).catch(err => {
                console.log(err);
                throw err;
            });
    },
    createEvent: ({ eventInput }) => {
        const event = new Event({
            title: eventInput.title,
            description: eventInput.description,
            price: +eventInput.price,
            date: new Date(eventInput.date),
            creator: "5e085e3b7b5850374c3a9cb5"
        });
        let createdEvent;
        return event.save()
            .then((event) => {
                createdEvent = { ...event._doc, _id: event.id, date: new Date(event._doc.date).toISOString() };
                return User.findById("5e085e3b7b5850374c3a9cb5")
                // console.log(event);
                // return { ...event._doc, _id: event._doc._id.toString() };
                // return { ...event._doc, _id: event.id };
            })
            .then(user => {
                if (!user) {
                    throw new Error('User exists already');
                }

                user.createdEvents.push(event);
                return user.save();
            })
            .then(result => {
                return createdEvent;
            })
            .catch(err => {
                console.log(err);
                throw err;
            });

    },
    createUser: ({ userInput }) => {
        return User.findOne({ email: userInput.email })
            .then(user => {
                if (user) {
                    throw new Error('User exists already');
                }
                return bcrypt.hash(userInput.password, 12)
            })
            .then(hasedPassword => {
                const user = new User({
                    email: userInput.email,
                    password: hasedPassword
                });
                return user.save();
            })
            .then(result => {
                return { ...result._doc, password: null, _id: result.id };
            })
            .catch(err => { throw err });
    }
};