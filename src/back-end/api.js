const route = require("express").Router();
const ckoPublicKey = 'pk_test_7d8d24fc-ffdb-4efc-b945-a19847ce319a';
const ckoSecretKey = 'sk_test_bf908821-87a2-43bf-9e9f-77a1d4fffed2';
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

route.post('/payWithGoogle', async (req, res) => {
  const {
      signature,
      protocolVersion,
      signedMessage
  } = req.body;

  let tokenResponse;

  console.log('Google token: ', req.body)

  try {
      tokenResponse = await cko.tokens.request({
          // type:"googlepay" is inferred
          token_data: {
              signature,
              protocolVersion,
              signedMessage
          }
      });
  } catch (error) {
      res.send(500, error);
  }

  console.log('CKO token: ', tokenResponse.token);

  /* Do payment request w/ token */
  const token = tokenResponse.token;

  try {
      const payment = await cko.payments.request({
          source: {
              // type:"token" is inferred
              token: token
          },
          currency: 'GBP',
          amount: 1000, // pence
          reference: 'GPAY-TEST'
      });
      res.send(payment);
  } catch (error) {
      res.send(500, error);
  }
});

// <== !!! Google Pay

module.exports = route;
