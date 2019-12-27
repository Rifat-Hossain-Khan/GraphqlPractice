const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require('mongoose');

const Event = require('./models/event');

const app = express();

app.use(bodyParser.json());

app.use("/graphql", graphqlHttp({
    schema: buildSchema(`

        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return Event.find().
                then(events => {
                    return events.map(event => {
                        // return { ...event._doc, _id: event._doc._id.toString() };
                        return { ...event._doc, _id: event.id };
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
                date: new Date(eventInput.date)
            });

            return event.save()
                .then((event) => {
                    // console.log(event);
                    // return { ...event._doc, _id: event._doc._id.toString() };
                    return { ...event._doc, _id: event.id };
                }).catch(err => {
                    console.log(err);
                    throw err;
                });

        }
    },
    graphiql: true
}));

mongoose.connect('mongodb://localhost:27017/graphqlprac', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        app.listen(3000, () => {
            console.log("The server is running on port 3000");
        });
    })
    .catch(err => console.log(err));
