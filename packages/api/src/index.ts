import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { campaignRoutes } from './routes/campaigns'

const app = new Hono()

app.use('*', cors())

app.get('/health', (c) => {
	return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.route('/api/campaigns', campaignRoutes)

export default app
