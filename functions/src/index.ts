import * as functions from 'firebase-functions'
import * as express from 'express'
import * as cors from 'cors'

const app = express()
app.use(cors({ origin: true }))

app.post('/', (req, res) => {
    res.send('Hello world')
})

export const api = functions.region('asia-south1').https.onRequest(app)
