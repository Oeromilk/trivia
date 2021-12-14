const functions = require('firebase-functions');
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

exports.calculatePoints = functions.firestore.document('/users/{docId}')
    .onUpdate((snap, context) => {
        var beforeAnswered = snap.before.data().questionsAnswered;
        var afterAnswered = snap.after.data().questionsAnswered;
        var currentTotal = snap.before.data().achievementPoints;
        var diff = afterAnswered.filter((x) => !beforeAnswered.find(y => x.id === y.id ));

        if(diff.length > 0){
            diff.forEach(question => {
            currentTotal += (question.difficulty * 10);
        })

            functions.logger.log("updated total", currentTotal);
            return db.collection('users').doc(snap.after.id).update({
            achievementPoints: currentTotal
            })
        } else {
            return currentTotal
        }    
    })