// import { Router } from 'express';

import { Router } from 'express'
import createCompletion  from '../controllers/generate.controller.js'

const generateRouter = Router()

generateRouter.post('/', createCompletion)

export default generateRouter 
