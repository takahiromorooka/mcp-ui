import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { campaignRoutes } from './routes/campaigns'
import { mediaRoutes } from './routes/media'

const app = new Hono()

app.use('*', cors())

app.get('/health', (c) => {
	return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.route('/api/campaigns', campaignRoutes)
app.route('/api/media', mediaRoutes)

export default app
