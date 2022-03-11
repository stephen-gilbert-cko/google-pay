const route = require("express").Router();
const ckoPublicKey = "pk_test_8e82cd18-8a67-49cc-9274-951c7ca97cf4";
const ckoSecretKey = "sk_test_f110e35a-5b8a-42dc-8cea-e8c9e366fab6";
const { Checkout } = require("checkout-sdk-node");
const cko = new Checkout(ckoSecretKey, { pk: ckoPublicKey });

route.post("/payWithToken", async (req, res) => {
  const payment = await cko.payments.request({
    source: {
      token: req.body.token,
    },
    currency: "GBP",
    amount: 400, // pence
    reference: "TEST-ORDER",
  });
  res.send(payment);
});

// Get payment details
route.post("/getPaymentById", async (req, res) => {
  try {
    const details = await cko.payments.get(req.body.id);
    res.send(details);
  } catch (error) {
    res.send(500, error);
  }
});

// !!! Google Pay  ==>

route.post("/payWithGoogle", async (req, res) => {
  const { signature, protocolVersion, signedMessage } = req.body;

  let tokenResponse;

  console.log("Google token: ", req.body);

  try {
    tokenResponse = await cko.tokens.request({
      // type:"googlepay" is inferred
      token_data: {
        signature,
        protocolVersion,
        signedMessage,
      },
    });
  } catch (error) {
    res.send(500, error);
  }

  console.log("CKO token: ", tokenResponse.token);

  /* Do payment request w/ token */
  const token = tokenResponse.token;

  try {
    const payment = await cko.payments.request({
      source: {
        token: token,
      },
      currency: "GBP",
      amount: 400, // pence
      reference: "GPAY-TEST",
    });
    res.send(payment);
  } catch (error) {
    res.send(500, error);
  }
});

// <== !!! Google Pay

module.exports = route;
