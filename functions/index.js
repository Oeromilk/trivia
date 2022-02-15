const functions = require('firebase-functions');
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

exports.addNewPoints = functions.firestore.document('/users/{docId}/questions-answered/{docIdTwo}')
    .onCreate((snap, context) => {
        var userRef = db.collection('users').doc(context.params.docId);
        var newPoints;
        userRef.get().then(doc => {
            newPoints = doc.data().achievementPoints + (snap.data().questionInfo.difficulty * 10);
            
            return userRef.update({achievementPoints: newPoints});
        })
        return "adding new points";
    })

exports.countTheOfficeTriviaQuestions = functions.firestore.document('/theOfficeTriviaQuestions/{docId}')
    .onCreate((snap, context) => {
        const countRef = db.collection('theOfficeTriviaQuestions').doc('count');
        
        return countRef.update({count: admin.firestore.FieldValue.increment(1)})
    })