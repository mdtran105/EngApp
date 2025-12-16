import express from 'express'
import { dictionaryController } from '../controller/dictionary.controller'
const dictionaryRoute = express.Router()

// // global middlewares
// chatRoute.use(verifyUser)
// chatRoute.use(preventInActiveUser)

// Dictionary search
dictionaryRoute.post('/', dictionaryController.searchDictionary)
dictionaryRoute.post('/translate', dictionaryController.translate)

// Searched words history
dictionaryRoute.get('/history/:userId', dictionaryController.getSearchedWords)
dictionaryRoute.get('/history/:userId/most-searched', dictionaryController.getMostSearchedWords)
dictionaryRoute.delete('/history/:userId/:word', dictionaryController.deleteSearchedWord)

export default dictionaryRoute
