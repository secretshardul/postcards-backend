type Query = {
    title: string, body: string, imageUrl?: string, key: string
}

type Postcard = {
    title: string, body: string, imageUrl?: string, time: Date
}
type UserData = {
    fcmToken: string,
    postcards?: Postcard[]
}

export { Query, Postcard, UserData }