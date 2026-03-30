import arcjet, { tokenBucket } from "@arcjet/node";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    tokenBucket({
      mode: "LIVE",
      refillRate: 5,     // tokens per second
      interval: 1,
      capacity: 10,      // burst allowed
    }),
  ],
});

export default aj;
