import express from 'express';
import { isAuthorized } from '../middleware/authMiddleware.js';
import {collection,query,where,getDocs,doc, getDoc} from 'firebase/firestore';
import { dbRef } from '../config/config.js';

const router = express.Router();

//Get-Route chats
//Skal kunne retunere en liste alle chars
router.get('/', isAuthorized(1), async (req, res) => {
    try {
        const snapShot = await getDocs(collection(dbRef, 'chats'));

        const chats = snapShot.docs.map (doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(chats)
    } catch (error) {
        console.error(error)
        res.status(500).json({
            error: 'Could not retrieve chats'
        })
    }
})

//GET-Route ID
router.get('/:id', async (req, res) => {
    try {
        const chatRef = doc(dbRef, 'chats', req.params.id);
        const snapShot = await getDoc(chatRef)

        if (!snapShot.exists()) {
            return res.status(404).json({
                error: 'Chats not found'
            });
        }

        const chat = {
            id: snapShot.id,
            ...snapShot.data()
        };

        res.status(200).json(chat);


    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Server fail'
        });
    }
});

//GET-route ID:messages
router.get('/:id/messages', async (req, res) => {
    try {
        const chatId = req.params.id;

        const chatRef = doc(dbRef, 'chats', chatId);
        const chatSnapshot = await getDoc(chatRef);

        if (!chatSnapshot.exists()) {
            return res.status(404).json({
                error: 'Chat not found'
            });
        }

        const messagesRef = collection(dbRef, 'messages');

        const q = query(
            messagesRef,
            where('chatAffiliation', '==', chatId)
        );

        const snapshot = await getDocs(q);

        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(messages);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// GET-route Hent en specifik besked fra en chat
router.get('/:chatId/messages/:messageId', isAuthorized(1), async (req, res) => {
    try {
        const chatId = req.params.chatId;
        const messageId = req.params.messageId;

        // Find beskeden i Firestore
        const messageRef = doc(dbRef, 'messages', messageId);
        const snapshot = await getDoc(messageRef);

        // Tjek om beskeden eksisterer
        if (!snapshot.exists()) {
            return res.status(404).json({
                error: 'Message not found'
            });
        }

        // Tjek om beskeden tilhører den angivne chat
        if (snapshot.data().chatAffiliation !== chatId) {
            return res.status(404).json({
                error: 'Message not found in this chat'
            });
        }

        const message = {
            id: snapshot.id,
            ...snapshot.data()
        };

        res.status(200).json(message);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

export default router