const { User, Book } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return await User.findOne({ _id: context?.user?._id }).populate(
          "savedBooks"
        );
      }
      throw new AuthenticationError("Please log in.");
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
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
  },
  saveBook: async (parent, { args }, context) => {
    if (context.user) {
      const book = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $addToSet: { savedBooks: args } }
      );

      return book;
    }
    throw new AuthenticationError("Please log in!");
  },
  removeBook: async (parent, {args}, context) => {
    if (context.user) {
      const book = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $pull: { savedBooks: { bookId: args }} }
      );

      return book;
    }
    throw new AuthenticationError("Please log in!");
  },
};

module.exports = resolvers;
