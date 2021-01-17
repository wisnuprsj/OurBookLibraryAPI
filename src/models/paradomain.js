const mongoose = require("mongoose");

const paraDomainSchema = mongoose.Schema({
  domainId: {
    type: String,
    required: true,
  },
  data: [
    {
      fullName: {
        type: String,
      },
    },
  ],
});

const ParaDomain = mongoose.model("ParaDomain", paraDomainSchema);

module.exports = ParaDomain;
