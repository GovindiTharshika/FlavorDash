import express from 'express'
import path from 'path'

const app = express()
const port = process.env.PORT || 5000

app.use(express.static(path.join(process.cwd(), 'dist')))

// Fallback to serve index.html for any unmatched route
app.use((req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'))
})

app.listen(port, () => console.log(`Frontend server listening on http://localhost:${port}`))
