import Express from "express";
import { verifyRequestOfWebhook } from "../middleware/verifyWebhook";
const router = new Express.Router();

router.post("/cashfree/wh", verifyRequestOfWebhook, async (req, res) => {
    console.log("/cashfree/wh");
})

router.post("/paymentWh", verifyRequestOfWebhook, async (req, res) => {
    console.log("🚀 ~ file: sharePDF.js:13 ~ router.post ~ paymentWh", paymentWh)
})

router.post("/paymentSubscription", verifyRequestOfWebhook, async (req, res) => {
    console.log("🚀 ~ file: sharePDF.js:24 ~ router.post ~ paymentSubscription", paymentSubscription)
})

module.exports = router;