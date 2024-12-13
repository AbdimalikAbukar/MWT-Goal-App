const express = require("express");
const {
  sendFriendReq,
  acceptFriendReq,
  getFriends,
  renderAddFriendForm,
  renderConfirmRemoveFriend,
  declineFriendRequest,
} = require("../controllers/friend");
const Friend = require("../models/friend");
const Goal = require("../models/goal");
const authMiddleware = require("../authMiddleware");

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Send a friend request
router.post("/request", sendFriendReq);

// Accept a friend request
router.put("/accept/:requestId", acceptFriendReq);

// Get the list of friends
router.get("/", getFriends);

// Remove a friend based on friendId
router.delete("/:friendId", async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.id;

    console.log(
      "Attempting to remove friend. User ID:",
      userId,
      "Friend ID:",
      friendId
    );

    const friendRelationship = await Friend.findOne({
      $or: [
        { user: userId, friend: friendId },
        { user: friendId, friend: userId },
      ],
      status: "accepted",
    });

    console.log("Friendship found:", friendRelationship);

    if (!friendRelationship) {
      return res.status(404).send("Friendship not found or not accepted");
    }

    await Friend.findOneAndDelete({
      _id: friendRelationship._id,
    });

    res.redirect("/api/friends");
  } catch (error) {
    console.error("Error deleting friend:", error);
    res.status(500).send("Server error");
  }
});

// Render the Add Friend form
router.get("/add", renderAddFriendForm);

// Render the Confirm Remove Friend form
router.get("/confirm_remove/:friendId", renderConfirmRemoveFriend);

// Route for sharing a goal with friends
router.get("/share/:goalId", async (req, res) => {
  try {
    const goalId = req.params.goalId;
    const userId = req.user.id;

    const friends = await Friend.find({ user: userId })
      .populate("friend", "username email")
      .where("status")
      .equals("accepted");

    if (!friends.length) {
      return res.status(404).send("No friends found for sharing the goal.");
    }

    const goal = await Goal.findById(goalId);

    if (!goal) {
      return res.status(404).send("Goal not found.");
    }

    res.render("share_goal", {
      goal,
      friends,
    });
  } catch (err) {
    console.error("Error fetching friends for sharing goal:", err);
    res.status(500).send("Error fetching friends.");
  }
});

// Route for declining/removing a pending friend request
router.delete("/decline/:requestId", declineFriendRequest);

module.exports = router;
