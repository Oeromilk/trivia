const functions = require('firebase-functions');
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

exports.calculatePoints = functions.firestore.document('/users/{docId}/questions-answered/{docId}')
    .onCreate((snap, context) => {
        var userRef = db.collection('users').doc(context.params.docId);
        var newPoints;
        userRef.get().then(doc => {
            newPoints = doc.data().achievementPoints + (snap.data().difficulty * 10);
            functions.logger.log(newPoints);
            return userRef.update({achievementPoints: newPoints});
        })
    })