interface Query {
    title?: string, body?: string, imageUrl?: string, key?: string
}

interface NotificationData {
    title: string, body: string, imageUrl?: string
}
interface Postcard extends NotificationData {
    time: Date
}
interface UserData {
    fcmToken: string,
    postcards?: Postcard[]
}

export { Query, NotificationData, Postcard, UserData }