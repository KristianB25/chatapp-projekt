import User from '../models/userModel.js';
import {collection,doc,setDoc,getDocs,getDoc,query,where} from 'firebase/firestore';
import { dbRef } from '../config/config.js';


const usersCollection = collection(dbRef, 'users');

// Opret bruger
async function insertUser(user) {
    const userRef = doc(dbRef, 'users', user.userid);

    await setDoc(userRef, {
        userid: user.userid,
        username: user.username,
        password: user.password,
        creationDate: user.creationDate,
        level: user.level
    });
}

// Hent alle brugere
async function getUsers() {
    const snapshot = await getDocs(usersCollection);

    const users = snapshot.docs.map(doc => {
        const u = doc.data();

        return new User(
            u.userid,
            u.username,
            u.password,
            u.creationDate,
            u.level
        );
    });

    return users;
}

// Hent bruger via username
async function getUserByUsername(username) {
    const q = query(
        usersCollection,
        where('username', '==', username)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return null;
    }

    const doc = snapshot.docs[0];
    const u = doc.data();

    return new User(
        u.userid,
        u.username,
        u.password,
        u.creationDate,
        u.level
    );
}

export { insertUser, getUsers, getUserByUsername };