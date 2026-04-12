export async function checkHostExpiry(user) {
  let message = null;
  let updated = false;

  if (
    user.role === "host" &&
    user.status === "confirmed" &&
    user.hostExpiryDate &&
    user.hostExpiryDate < new Date()
  ) {
    user.status = "pending";
    user.hostExpiryDate = null;

    await user.save(); // 🔥 SAVE CHANGE

    updated = true;

    message =
      "Your 6-month hosting period has ended. Your account is now pending. Please renew to continue hosting.";
  }

  return { user, message, updated };
}