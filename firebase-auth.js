import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
getAuth,
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
signOut,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
apiKey: "AIzaSyB-eQmzso5KJ4iY_Fg4myZDL79qzgwrK1Y",
authDomain: "studyhub-76a27.firebaseapp.com",
projectId: "studyhub-76a27",
storageBucket: "studyhub-76a27.firebasestorage.app",
messagingSenderId: "719706431165",
appId: "1:719706431165:web:ec007d12c23205797561d4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

window.studyHubAuth = {
auth,
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
signOut,
onAuthStateChanged
};
