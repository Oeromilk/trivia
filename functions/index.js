const functions = require('firebase-functions');
const admin = require("firebase-admin");
admin.initializeApp();

exports.calculatePoints = functions.firestore
    .document('users/{docId}/questionsAnswered')
    .onWrite((change, context) => {
        console.log(context);
        let beforePoints = change.before.data().achievementPoints;
        let answered = change.after.data().questionsAnswered;
        
        answered.forEach(question => {
            admin.firestore.CollectionReference('theOfficeTriviaQuestions').document(question)
                .get().then((doc) => {
                    beforePoints = beforePoints + doc.data().difficulty;
                })
        })

        admin.firestore.CollectionReference('users').document(change.id).update({achievementPoints: beforePoints});
    })
