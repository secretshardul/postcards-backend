import * as functions from 'firebase-functions'
import * as express from 'express'
import * as cors from 'cors'
import * as admin from 'firebase-admin'
import { Query } from './types'

admin.initializeApp()
const db = admin.firestore()

const usersCol = db.collection('users')

const app = express()
app.use(cors({ origin: true }))

app.post('/', async (req, res) => {
    const query = req.query as Query
    console.log('Query params', query)

    const userData = await getUserData(query.key)
    console.log('User data', userData)

    res.send('Hello world')
})

async function getUserData(key: string) {
    const response = await usersCol.doc(key).get()
    return response.data()
}
export const api = functions.region('asia-south1').https.onRequest(app)
