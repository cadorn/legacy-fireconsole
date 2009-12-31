
exports.testEncoderDefault = require("./encoder/default");

if (require.main == module)
    require("os").exit(require("test").run(exports));

