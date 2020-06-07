const functions = require("firebase-functions");
const app = require("express")();
const FBAuth = require("./util/fbAuth");
const { db } = require("./util/admin");
const cors = require("cors");
app.use(cors());

const {
	getAllScreams,
	postOneScream,
	getScream,
	commentOnScream,
	likeScream,
	unlikeScream,
	deleteScream,
} = require("./handlers/screams");
const {
	signup,
	login,
	uploadImage,
	addUserDetails,
	getAuthenticatedUser,
	getUserDetails,
	markNotificationsRead,
} = require("./handlers/users");

app.get("/screams", getAllScreams);
app.post("/scream", FBAuth, postOneScream);
app.get("/scream/:screamId", getScream);
app.delete("/scream/:screamId", FBAuth, deleteScream);
app.get("/scream/:screamId/like", FBAuth, likeScream);
app.get("/scream/:screamId/unlike", FBAuth, unlikeScream);
app.post("/scream/:screamId/comment", FBAuth, commentOnScream);

app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);
app.get("/user:handle", getUserDetails);
app.post("notification", FBAuth, markNotificationsRead);

exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions.firestore
	.document("likes/{id}")
	.onCreate((snapshot) => {
		db.doc(`/screams/${snapshot.data().screamId}`)
			.get()
			.then((doc) => {
				if (doc.exists) {
					return db.doc(`/notifications/${snapshot.id}`).set({
						createdAt: new Date().toISOString(),
						recipient: doc.data().userHandle,
						sender: snapshot.data().userHandle,
						type: "like",
						read: false,
						screamId: doc.id,
					});
				}
			})
			.then(() => {
				return;
			})
			.catch((err) => {
				console.error(err);
				return;
			});
	});

exports.deleteNotificationOnUnlike = functions.firestore
	.document("likes/{id}")
	.onDelete((snapshot) => {
		db.doc(`/notifications/${snapshot.id}`)
			.delete()
			.then(() => {
				return;
			})
			.catch((err) => {
				console.error(err);
				return;
			});
	});

exports.createNotificationOnComment = functions.firestore
.document("likes/{id}")
.onCreate((snapshot) => {
	db.doc(`/screams/${snapshot.data().screamId}`)
		.get()
		.then((doc) => {
			if (doc.exists) {
				return db.doc(`/notifications/${snapshot.id}`).set({
					createdAt: new Date().toISOString(),
					recipient: doc.data().userHandle,
					sender: snapshot.data().userHandle,
					type: "like",
					read: false,
					screamId: doc.id,
				});
			}
		})
		.then(() => {
			return;
		})
		.catch((err) => {
			console.error(err);
			return;
		});
});

// exports.onUserImageChange = functions
//     .firestore.document('/users/{userId')
//     .onUpdate((change) => {
//         if(change.before.data().imageUrl !== change.after.data().imageUrl) {
//             const batch = db.batch();
//             return db
//                 .collection('screams')
//                 .where('userHandle', '==', change.before.data().handle)
//                 .get()
//                 .then((data) => {
//                     data.forEach((doc) => {
//                         const scream = db.doc(`/screams/${doc.id}`);
//                         batch.update(scream, { userImage: change.after.data().imageUrl });
//                     });
//                     return batch.commit();
//                 });
//         } else return true;
//     });
