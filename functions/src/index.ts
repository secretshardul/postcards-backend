import * as functions from 'firebase-functions'
import * as express from 'express'
import * as cors from 'cors'
import * as admin from 'firebase-admin'
import {
    NotificationData,
    CreatePostcardQuery,
    UserData,
    GetAllPostcardsQuery,
    Postcard
} from './types'

admin.initializeApp()
const db = admin.firestore()
const fcm = admin.messaging()
const usersCol = db.collection('users')

const app = express()
app.use(cors({ origin: true }))

async function getUserData(key: string): Promise<UserData | undefined> {
    const response = await usersCol.doc(key).get()
    return response.data() as UserData | undefined
}

/**
 * Create a new postcard
 * Send push notification and store data to Firestore
 */
app.post('/', async (req, res) => {
    const query = req.query as CreatePostcardQuery
    console.log('Query params', query)
    const { title, body, key, imageUrl } = query

    if (!key) {
        return res.status(401).send('Missing key')
    } else if (!title) {
        return res.status(400).send('Missing "title" query parameter')
    } else if (!body) {
        return res.status(400).send('Missing "body" query parameter')
    } else {
        const userData = await getUserData(key)
        console.log('User data', userData)

        if (!userData) {
            return res.status(401).send('Invalid key')
        }

        const notification: NotificationData = {
            title,
            body
        }
        if (imageUrl) {
            notification['imageUrl'] = imageUrl
        }

        await fcm.send({
            notification,
            token: userData.fcmToken
        })

        await usersCol.doc(key).update({
            postcards: admin.firestore.FieldValue.arrayUnion({
                ...notification,
                time: new Date()
            })
        })

        return res.status(201).send()
    }
})

/**
 * Get all postcards for a given user
 */
app.get('/', async (req, res) => {
    const { key } = req.query as GetAllPostcardsQuery
    if (!key) {
        return res.status(401).send('Missing key')
    }
    const userData = await getUserData(key)
    if (!userData) {
        return res.status(401).send('Invalid key')
    }

    return res.status(200).send(userData.postcards)
})

/**
 * Get postcard for a user with the given ID
 */
app.get('/:postcardId', async (req, res) => {
    const key = req.query.key as string | undefined
    const postcardId = req.params.postcardId as string | undefined
    if (!key) {
        return res.status(401).send('Missing key')
    } else if (!postcardId) {
        return res.status(400).send('Postcard ID not provided')
    }

    // Convert ID to index number
    const postcardIndex = Number(postcardId)
    if (isNaN(postcardIndex)) {
        return res.status(400).send('Postcard ID is not a number')
    }

    // Fetch user data from Firestore, using key
    const userData = await getUserData(key)
    if (!userData) {
        return res.status(401).send('Invalid key')
    }

    // Check if postcards array is present
    const postcards = userData.postcards
    if (!postcards) {
        return res.status(404).send('No postcards for user')
    }

    // Check if postcard present for given index
    const postcard: Postcard | undefined = postcards[postcardIndex]
    if (!postcard) {
        return res.status(404).send('No postcard for given ID')
    }

    return res.status(200).send(postcard)
})

export const api = functions.region('asia-south1').https.onRequest(app)
