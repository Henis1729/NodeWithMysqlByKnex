import { PubSub } from 'graphql-subscriptions'
import { USER_EVENTS } from './events'

export const EVENTS = {
    USER: USER_EVENTS,
}

export default new PubSub()