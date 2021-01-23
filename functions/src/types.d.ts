interface CreatePostcardQuery {
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
    postcards?: Postcard[],
}

interface GetAllPostcardsQuery {
    key?: string,
}

interface SendGridSecrets {
    apikey: string,
    templateid: string,
    senderemail: string,
}

export {
    CreatePostcardQuery,
    NotificationData,
    Postcard,
    UserData,
    GetAllPostcardsQuery,
    SendGridSecrets,
}
