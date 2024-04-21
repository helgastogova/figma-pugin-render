import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import axios from 'axios'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

app.post('/generate', async (req, res) => {
  try {
    const { initialPrompt } = req.body
    console.log(`Generating text for prompt: ${initialPrompt}`)

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo',
        max_tokens: 1500,
        messages: [{ role: 'user', content: initialPrompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      },
    )

    console.log('Response:', response.data)
    res.json(response.data)
  } catch (error) {
    console.error('Error response:', error.response?.data || 'Unknown error')
    res.status(500).send(error.response?.data || { message: 'An unknown error occurred' })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
