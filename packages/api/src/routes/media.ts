import { Hono } from 'hono'
import { mockMedia } from '../data/mock-media'

const mediaRoutes = new Hono()

mediaRoutes.get('/', (c) => {
	return c.json({
		media: mockMedia,
	})
})

export { mediaRoutes }
