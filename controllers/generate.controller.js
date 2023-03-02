// change the imprt statments to inport
import { Configuration, OpenAIApi } from 'openai'
import admin from 'firebase-admin'

// require('dotenv').config()

if (admin.apps.length === 0) {
	admin.initializeApp({
		credential: admin.credential.cert({
			projectId: 'gpt3-app',
			clientEmail: 'firebase-adminsdk-wnvy3@gpt3-app.iam.gserviceaccount.com',
			privateKey:
				'-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCuSlZZGDy1409a\nEGtJxtNL9iGJmGjbvEgtwrvU4iyM8kiTcCfpYHjlUtiwi7ekk1KFmNoKT4ChvLLo\nFUz9F5WJgPy4OJqChlIsvc1OSJyGARC7Xi8PuzoQDmTs6qXfLg8Yn/ESuj2XI18p\nWaTshIOUItgc0PyS3GBcRctIT+arOqJN2CK5biBTEVXtcaqA90vB3JVvQ05GEXYl\neiiU1oLOdA+PkZyv2axczGLqnhq0P5QBaBSA3kOpJd3Vmgm3gEWWb3nlJZRwGTRy\nnZT/ZClpxTA2tOlfdcwXI5Dd1DbUke7DmFSxZ/CAZuK/RB4tPxSSZ34jqJB2jAae\nQOaXoZa/AgMBAAECggEAGa078V4/u3AkhZk7pR/UizFUmYfJku23GH7C20cC1zTu\nekIgryIWTXqaD9BVmrpVgvcU0EYMJke9d7GDqRmrXxmQobc9FBOj0ZGYyHqsDJXl\nmCT0+/VSRYFJXxnmm+2WLcOKaX7kifqdD2N0h5+yHsXPXtdvDlfHHnDt1NZonjsD\nzpvIXUoqwSdyiIreif2akwdOvmJ5YeG1a9ZjY/sIt8gZL+Xj8/dAuVlVGAtOw8r0\nRAcSja7d57eqfU2mp4mQ4h5QGFl/WPEU7IdxNY5Wru1I5m/0fW+LbPMgrwcbQQO9\nSwby6N9hURUC19hRzwg5vFpaFKfiiAbUNhmpNYjHEQKBgQDfTFiJxnOJL8Qol2R2\n0xxD81QuF97oO/FkgR+EAX4gtbUTv+e2x5CRL5KcGHLySpaODiW/oL/oGQSBqi25\nS24WrFfLssjC/VvArFiIfRXbq8CgAZn7Gvy4iPPtXahDMytQhaWpxWqeeDrb6QOI\nApDBIZ9bxArT8Ff8GfjbxaCGaQKBgQDH0KSBuGTH49inK/ZDsp/ccDkT2sRcl0LL\nk1YurmEI9Xx8RnloEncQgHQ63bfnPJ5+zhOSE/hmQm1K9l0EKSRVr/eJ9cK479oQ\nsvvZOsEoxg16EzJYXoJwlSURqlXxjyHiO2VmEVdVQSS8tJnKmoTxS0me8Iv3cT9A\nIaZfosge5wKBgCdOOQeHdy7eyZibjYOdBYyweFDkwsf+RS97yyBhYuI/GfCwBwmV\nd00XIqd3ZkRf/MBknSBuG1mvjauFWScUr/wtugaRIeWw00XHEI519jMEuJNxtLkO\ntw2EjetqYQPzLdyuqcqIhYv/fdzX11dJnFFiqbptd7p2xAYMTFHjJ66BAoGBAIGK\nipxu5yeQV81Jewa4r1tChj6Q/ezpQ6yngKAS/WXJgUMwjVUjY32XScNAKxIHAtpC\nz/1MZSYmuqR2xCcGZUAILPuMEQnEtiNNZmmW5dOBUwtplqIj430JtFaXj9Bjcxww\nVbSuWWg0K5ULoQjw1G961+frG1L4YIE7T5mA9yzRAoGBAKED1Qot6XCOryMSL1tK\nygG1u5LZ+i5WnLP1jNJdzNq1bhsekdjR0Cs/T+Z7nepktf3hjCh6l32K5FIR/KTK\nx27CzrC5P4FK30wN5o5M6NsCu3xMYCp0X6SrqXBnriL5dsurEq1P24TFaBUgcVXQ\n9ARg1uPeQbNCsf5HD3RWbwFA\n-----END PRIVATE KEY-----\n'
		})
	})
}

const configuration = new Configuration({
	apiKey: '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'
})
const openai = new OpenAIApi(configuration)

async function createCompletion(req, res) {
	const body = JSON.parse(req.body)
	if (!configuration.apiKey) {
		res.status(401).json({ error: 'API key not found' })
		return
	}

	if (req.method !== 'POST') {
		res.status(405).json({ error: 'Method Not Allowed' })
		return
	}

	if (!body.auth) {
		res.status(401).json({ error: 'Authorisation header not found' })
		return
	}
	console.log(`Handler auth header: ${req.headers.authorization}`)
	const token = body.auth
	if (!token) {
		return res.status(401).json({ message: 'Bearer token not found.' })
	}
	console.log(`Token: ${token}`)

	try {
		const { uid } = await admin.auth().verifyIdToken(token)
		console.log(`User uid: ${uid}`)
	} catch (error) {
		console.log(`verifyIdToken error: ${error}`)
		res
			.status(401)
			.json({ message: `Error while verifying token. Error: ${error}` })
	}

	let exceeded = false

	try {
		const { uid } = await admin.auth().verifyIdToken(body.auth)
		const usageRef = admin.firestore().collection('usage').doc(uid)

		await usageRef
			.get()
			.then((snapshot) => {
				if (snapshot.exists && snapshot.data().count >= 25) {
					console.log('Usage limit exceeded')
					exceeded = true
					res.status(403).json({ message: 'Usage limit exceeded' })
					return
				}

				// If not, increment usage counter and return data
				return usageRef.set(
					{ count: (snapshot.exists ? snapshot.data().count : 0) + 1 },
					{ merge: true }
				)
			})
			.catch((error) => {
				return res.status(500).send('Server error')
			})
	} catch (error) {
		console.log(`Usage limit error: ${error}`)
		res.status(401).json({ message: `Usage limit error: ${error}` })
		return
	}
	if (!exceeded) {
		try {
			res.setHeader('Cache-Control', 'no-cache')
			res.setHeader('Content-Type', 'text/event-stream')
			res.setHeader('Connection', 'keep-alive')
			res.setHeader('Access-Control-Allow-Origin', '*')
			res.setHeader('X-Accel-Buffering', 'no')
			res.flushHeaders()

			const getText = async (callback) => {
				const data = {
					model: body.model || 'text-davinci-003',
					prompt: body.text,
					temperature: body.temperature || 0.7,
					top_p: body.top_p || 1,
					frequency_penalty: body.frequency_penalty || 0,
					presence_penalty: body.presence_penalty || 0,
					max_tokens: body.max_tokens || 256,
					stream: true
				}
				console.log(data)
				const completion = await openai.createCompletion(data, {
					responseType: 'stream'
				})

				return new Promise((resolve) => {
					let result = ''
					completion.data.on('data', (data) => {
						const json = data?.toString()?.slice(6)

						if (json === '[DONE]\n\n') {
							res.write('[DONE]\n\n')
							resolve(result)
							res.end()
						} else {
							const token = JSON.parse(json)?.choices?.[0]?.text
							result += token
							callback(token)
						}
					})
				})
			}

			console.log(
				await getText((c) => {
					process.stdout.write(c)
					res.write(c)
				})
			)

			req.on('close', () => {
				res.end()
				console.log('Connection closed')
			})

			req.on('end', () => {
				res.end()
				console.log('Connection ended')
			})
		} catch (error) {
			// Consider adjusting the error handling logic for your use case
			if (error.response) {
				console.error(error.response.status, error.response.data)
				res.status(error.response.status).json(error.response.data)
			} else {
				console.error(`Error with OpenAI API request: ${error.message}`)
				res.status(500).json({
					error: {
						message: 'An error occurred during your request.'
					}
				})
			}
		}
	}
}

export default createCompletion
