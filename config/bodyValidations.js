const sanitizations = {
  user: {
    login: {
      type: "object",
      properties: {
        email: { type: "string", rules: ["trim", "lower"] },
      },
    },
    save: {
      type: "object",
      properties: {
        nickname: { type: "string", rules: ["trim", "title"] },
        email: { type: "string", rules: ["trim", "lower"] },
      },
    },
  },
};

const validations = {
  user: {
    login: {
      type: "object",
      properties: {
        email: { type: "string", pattern: "email" },
        password: { type: "string", minLength: 1 },
      },
    },
    save: {
      type: "object",
      properties: {
        nickname: { type: "string", minLength: 1 },
        email: { type: "string", pattern: "email" },
        password: { type: "string", minLength: 8 },
      },
    },
  },
};

module.exports = {
  sanitizations,
  validations,
};
