const {ApolloServer} = require('apollo-server');
const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');
// setting mongoose
const mongoose = require('mongoose');
require('dotenv').config();
// Loading controller
const { findOrCreateUser } = require('./controllers/userController');

mongoose
    .connect(process.env.MONGO_URI, {useNewUrlParser: true})
    .then(() => console.log('DB connected'))
    .catch(error => console.error(error));

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({req}) => {
        let authToken = null;
        let currentUser = null;
        try {
            authToken = req.headers.authorization;

            if(authToken) {
                // find or create user
                currentUser = await findOrCreateUser(authToken);
            }
        } catch(err) {
            console.error(`Unable to authenticate user with token ${err}`);
        }

        return {currentUser};
    }
})

server
    .listen()
    .then(({url}) => console.log(`Server listening on ${url}`))