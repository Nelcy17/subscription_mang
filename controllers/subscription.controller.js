import Subscription from "../models/subscription.model.js";
import { workflowClient } from "../config/upstash.js";
import { SERVER_URL } from "../config/env.js";

export const getSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find();
    res.status(200).json({
      success: true,
      data: subscriptions,
    });
  } catch (err) {
    next(err);
  }
};

export const getSubscription = async (req, res, next) => {
  try {
    const id = req.params.id;
    const subscription = await Subscription.findById(id);
    if (!subscription) {
      const error = new Error("Subscription not found");
      error.status = 404;
      throw error;
    }
    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserSubscription = async (req, res, next) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    const subscription = await Subscription.findById(id);

    if (!subscription) {
      const error = new Error("Subscription not found");
      error.status = 404;
      throw error;
    }
  
    if (subscription.user.toString() !== req.user.id.toString()) {
      const error = new Error(
        "You are not authorized to update this subscription"
      );
      error.status = 403;
      throw error;
    }
    Object.assign(subscription, updates);
    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      data: subscription,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUserSubscription = async(req, res, next) =>{
  try{
    const id = req.params.id;
    const subscription = await Subscription.findById(id);
    if (!subscription) {
      const error = new Error("Subscription not found");
      error.status = 404;
      throw error;
      }
      if (subscription.user.toString() !== req.user.id.toString()) {
        const error = new Error(
          "You are not authorized to delete this subscription"
          );
          error.status = 403;
          throw error;
          }
          await Subscription.findByIdAndDelete(id);
          res.status(200).json({
            success: true,
            message: "Subscription deleted successfully",
            });
          
  }catch(err){
    next(err);
  }
};

export let cancelUserSubscription = async(req, res, next)=>{
  try{
    const id = req.params.id;
    const subscription = await Subscription.findById(id);

    if(!subscription){
      const error = new Error("Subscription not found");
      error.status = 404;
      throw error;
    }
    if (subscription.user.toString() !== req.user.id.toString()) {
      const error = new Error(
        "You are not authorized to cancel this subscription"
        );
        error.status = 403;
        throw error;
        }
        subscription.status = "cancelled";
        await subscription.save();
        res.status(200).json({
          success: true,
          message: "Subscription cancelled successfully",
          data:subscription
          });


  }catch(err){
    next(err);
  }
}

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
    });

    const { workflowRunId } = await workflowClient.trigger({
      url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
      body: {
        subscriptionId: subscription.id,
      },
      headers: {
        "content-type": "application/json",
      },
      retries: 0,
    });

    res.status(201).json({
      success: true,
      data: { subscription, workflowRunId },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserSubscriptions = async (req, res, next) => {
  try {
    // Check if the user is the same as the one in the token
    console.log(req);
    if (req.user.id !== req.params.id) {
      const error = new Error("You are not the owner of this account");
      error.status = 401;
      throw error;
    }

    const subscriptions = await Subscription.find({ user: req.params.id });

    res.status(200).json({ success: true, data: subscriptions });
  } catch (e) {
    next(e);
  }
};

export const getUpcomingUserSubscriptions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    console.log(userId);

    // Find active subscriptions that are due for renewal in the future
    const upcomingSubscriptions = await Subscription.find({
      user: userId,
      status: { $ne: "cancelled" },  // Exclude canceled subscriptions
      renewalDate: { $gte: today }, // Renewal date is in the future
    }).sort({ renewalDate: 1 }); // Sort by nearest renewal date first

    console.log(upcomingSubscriptions);

    res.status(200).json({
      success: true,
      data: upcomingSubscriptions,
    });
  } catch (err) {
    next(err);
  }
};


export default createSubscription;
