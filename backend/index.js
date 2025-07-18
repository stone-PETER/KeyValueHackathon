// Cloud Function or Express route
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.isAdmin = functions.https.onRequest(async (req, res) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  if (!idToken) return res.status(401).send("Unauthorized");

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const email = decoded.email;
    const adminDoc = await admin.firestore().collection("admins").doc(email).get();
    if (adminDoc.exists) {
      return res.status(200).json({ isAdmin: true });
    } else {
      return res.status(403).json({ isAdmin: false });
    }
  } catch (err) {
    return res.status(401).send("Unauthorized");
  }
});