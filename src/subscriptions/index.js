import { PubSub } from 'graphql-subscriptions'
import { USER_EVENTS, BLOG_EVENTS } from './events'

export const EVENTS = {
    USER: USER_EVENTS,
    BLOG: BLOG_EVENTS,
}

export default new PubSub()