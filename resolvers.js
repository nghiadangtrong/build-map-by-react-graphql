const { AuthenticationError, PubSub } = require('apollo-server');
const Pin = require('./models/Pin')
// const authenticated = next => (root, args, ctx, info) => {
//     if(!ctx.currentUser) {
//         throw new AuthenticationError();
//     }

//     return next(root, args, ctx, info);
// }

const pubsub = new PubSub();
const PIN_ADDED = "PIN_ADDED";
const PIN_DELETED = "PIN_DELETED";
const PIN_UPDATED = "PIN_UPDATED";

const authenticated = function (next) {

    return function (root, args, ctx, info) {
        // Nếu không phải user thì dừng
        if(!ctx.currentUser) {
            throw new AuthenticationError();
        }

        // Thực hiện tiếp đối với hàm khai báo
        return next(root, args, ctx, info);  
    }
}

module.exports = {
    Query: {
        me: authenticated((root, arg, ctx) => ctx.currentUser),
        getPins: async (root, arg, ctx) => {
            const pins = await Pin
                .find({})
                .populate('author')
                .populate('comments.author')
            return pins
        }
    },
    Mutation: {
        createPin: authenticated(async (root, args, ctx) => {
            console.log("in createPIn")
            const newPin = await new Pin({
                ...args.input,
                author: ctx.currentUser._id
            }).save();
            
            console.log('newPin', JSON.stringify(newPin, null, 2))
            const pinAdded = await Pin.populate(newPin, 'author')
            console.log('pinAdded', pinAdded)
            
            pubsub.publish(PIN_ADDED, {pinAdded})
            
            return pinAdded;
        }),
        deletePin: authenticated(async (root, args, ctx) => {

            console.log('da vao day', args.pinId)
            const pinDeleted = await Pin.findOneAndDelete({_id: args.pinId}).exec()

            pubsub.publish(PIN_DELETED, {pinDeleted})

            return pinDeleted
        }),
        createComment: authenticated(async (root, args, ctx) => {
            const newComment = {
                text: args.text,
                author: ctx.currentUser._id
            }

            const pinUpdated = await Pin.findOneAndUpdate(
                {_id: args.pinId},
                { $push: {comments: newComment}},
                { new : true }
            ).populate('author')
            .populate('comments.author')

            pubsub.publish(PIN_UPDATED, {pinUpdated})
            
            return pinUpdated;
        })
    },
    Subscription: {
        pinAdded: {
            subscribe: () => pubsub.asyncIterator(PIN_ADDED)
        },
        pinDeleted: {
            subscribe: () => pubsub.asyncIterator(PIN_DELETED)
        },
        pinUpdated: {
            subscribe: () => pubsub.asyncIterator(PIN_UPDATED)
        }
    }
}