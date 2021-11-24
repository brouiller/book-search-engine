const { User } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const pikachu = await User.findOne({ _id: context?.user?._id }).select('-__v -password');
        return pikachu;
      }
      throw new AuthenticationError("Please log in.");
    },
  },

  Mutation: {
    addUser: async (parent, pikachu) => {
      const user = await User.create(pikachu);
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("No user found with this email address");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (parent, { bookData }, context) => {
      if (context.user) {
        const book = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: bookData } },
          {new: true}
        );

        return book;
      }
      throw new AuthenticationError("Please log in!");
    },
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const book = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: bookId } } },
          {new: true}
        );

        return book;
      }
      throw new AuthenticationError("Please log in!");
    },
  },
};

module.exports = resolvers;
