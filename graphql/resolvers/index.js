const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');


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
    bookings: async () => {
        try {
            const bookings = await Booking.find().populate('user').populate('event');

            return bookings.map(booking => {
                console.log(booking);

                return {
                    ...booking._doc,
                    _id: booking.id,
                    createdAt: new Date(booking.createdAt).toISOString(),
                    updatedAt: new Date(booking.updatedAt).toISOString()
                }
            });
        } catch (err) {
            throw err;
        }
    },
    createEvent: async ({ eventInput }) => {

        try {
            const event = new Event({
                title: eventInput.title,
                description: eventInput.description,
                price: +eventInput.price,
                date: new Date(eventInput.date),
                creator: "5e08bd5153293b0c8c6446c4"
            });

            await event.save();

            const user = await User.findById("5e08bd5153293b0c8c6446c4");

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

    },
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
    bookEvent: async ({ eventId }) => {
        const fetchedEvent = await Event.findById(eventId);
        const booking = new Booking({
            user: "5e08bd5153293b0c8c6446c4",
            event: fetchedEvent
        });

        const result = await booking.save();

        return {
            ...result._doc,
            _id: result.id,
            createdAt: new Date(result.createdAt).toISOString(),
            updatedAt: new Date(result.updatedAt).toISOString()
        };
    },
    cancelBooking: async ({ bookingId }) => {
        try {
            const booking = await Booking.findById(bookingId).populate("event");
            const event = { ...booking.event._doc, _id: booking.event.id };
            await Booking.deleteOne({ _id: bookingId });
            return event;
        } catch (err) {
            throw err;
        }
    }
};