const Event = require('../../models/event');
const User = require('../../models/user');


module.exports = {
    events: async () => {
        try {
            const events = await Event.find().populate({
                path: 'creator',
                populate: {
                    path: 'createdEvents',
                    model: 'Event'
                }
            });

            const modevent = events.map(event => {
                // return { ...event._doc, _id: event._doc._id.toString() };
                return {
                    ...event._doc,
                    _id: event.id,
                    date: new Date(event._doc.date).toISOString(),
                    creator: { ...event._doc.creator._doc, password: null }
                };
            });

            return modevent;

        } catch (err) {
            console.log(err);
            throw err;
        }
    },
    createEvent: async ({ eventInput }, req) => {

        try {
            if (!req.isAuth) {
                throw new Error('Unauthenticated');
            }

            const event = new Event({
                title: eventInput.title,
                description: eventInput.description,
                price: +eventInput.price,
                date: new Date(eventInput.date),
                creator: req.userId
            });

            await event.save();

            const user = await User.findById(req.userId);

            if (!user) {
                throw new Error('User exists already');
            }

            user.createdEvents.push(event);

            await user.save();

            return { ...event._doc, _id: event.id, date: new Date(event._doc.date).toISOString() };

        } catch (err) {
            console.log(err);
            throw err;
        }

    }
};