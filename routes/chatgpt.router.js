import { Router } from 'express'
// const { Router } = require('express')

import createCompletionWithChatGPT  from '../controllers/chatgpt.controller.js'

const chatGptRouter = Router()

chatGptRouter.post('/', createCompletionWithChatGPT)

export default chatGptRouter 
