import { Router } from "express";
import authorize from "../middlewares/auth.middleware.js";
//import createSubscription, {
  //cancelUserSubscription,
  //deleteUserSubscription,
  //getSubscription,
  //getSubscriptions,
  //getUpcomingUserSubscriptions,
  ///getUserSubscriptions,
  //updateUserSubscription,
//} from "../controllers/subscription.controller.js";

const subscriptionRouter = Router();

subscriptionRouter.get("/upcoming-renewals", authorize, getUpcomingUserSubscriptions);

subscriptionRouter.get("/", getSubscriptions);

subscriptionRouter.get("/:id", authorize, getSubscription);

subscriptionRouter.post("/", authorize, createSubscription);

subscriptionRouter.put("/:id", authorize, updateUserSubscription);

subscriptionRouter.delete("/:id", authorize, deleteUserSubscription);

subscriptionRouter.get("/user/:id", authorize, getUserSubscriptions);

subscriptionRouter.put("/:id/cancel", authorize, cancelUserSubscription);


export default subscriptionRouter;
