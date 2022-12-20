const router = require("express").Router();
const sharePDF = require('./sharePDF');

router.use('/', sharePDF);

module.exports = router;