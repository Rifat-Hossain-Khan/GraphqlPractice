const Booking = require('../../models/booking');
const Event = require('../../models/event');


module.exports = {
    bookings: async (req) => {
        try {
            if (!req.isAuth) {
                throw new Error('Unauthenticated');
            }
            const bookings = await Booking.find().populate('user').populate('event');

            return bookings.map(booking => {
                // console.log(booking);

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
    bookEvent: async ({ eventId }, req) => {
        try {
            if (!req.isAuth) {
                throw new Error('Unauthenticated');
            }
            const fetchedEvent = await Event.findById(eventId);
            const booking = new Booking({
                user: req.userId,
                event: fetchedEvent
            });

            const result = await booking.save();

            return {
                ...result._doc,
                _id: result.id,
                createdAt: new Date(result.createdAt).toISOString(),
                updatedAt: new Date(result.updatedAt).toISOString()
            };
        } catch (err) {
            throw err;
        }
    },
    cancelBooking: async ({ bookingId }, req) => {
        try {
            if (!req.isAuth) {
                throw new Error('Unauthenticated');
            }
            const booking = await Booking.findById(bookingId).populate("event");
            const event = { ...booking.event._doc, _id: booking.event.id };
            await Booking.deleteOne({ _id: bookingId });
            return event;
        } catch (err) {
            throw err;
        }
    }
};