import * as functions from 'firebase-functions'
import * as express from 'express'
import * as cors from 'cors'
import * as admin from 'firebase-admin'
import { NotificationData, Query, UserData } from './types'

admin.initializeApp()
const db = admin.firestore()
const fcm = admin.messaging()

const usersCol = db.collection('users')

const app = express()
app.use(cors({ origin: true }))

app.post('/', async (req, res) => {
    const query = req.query as Query
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

async function getUserData(key: string): Promise<UserData | undefined> {
    const response = await usersCol.doc(key).get()
    return response.data() as UserData | undefined
}
export const api = functions.region('asia-south1').https.onRequest(app)
