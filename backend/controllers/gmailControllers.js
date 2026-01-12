import gmailAccounts from "../models/gmailAccounts.js";

export const connectedAccounts = async (req, res) => {
  try {
    const accounts = await gmailAccounts
      .find({
        user: req.user._id,
        isActive: true,
      })
      .select("emailAddress createdAt");

    if (accounts.length === 0) {
      return res.status(404).json({
        message: "No Gmail accounts connected",
        accounts: [],
      });
    }

    res.status(200).json({
      message: "Fetched accounts successfully",
      accounts,
    });
  } catch (error) {
    console.error("Accounts fetch error:", error);
    res.status(500).json({
      message: "Accounts fetch error",
    });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await gmailAccounts.findOneAndUpdate(
      {
        _id: id,
        user: req.user._id, // security check
      },
      { isActive: false },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.json({ message: "Account disconnected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to disconnect account" });
  }
};


