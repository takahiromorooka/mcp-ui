import { Hono } from 'hono'
import { mockCampaigns } from '../data/mock-campaigns'
import type { Platform, Status } from '../types/campaign'

const campaignRoutes = new Hono()

campaignRoutes.get('/', (c) => {
	const platform = c.req.query('platform') as Platform | undefined
	const status = c.req.query('status') as Status | undefined
	const search = c.req.query('search')

	let filtered = mockCampaigns

	if (platform) {
		filtered = filtered.filter((camp) => camp.platform === platform)
	}

	if (status) {
		filtered = filtered.filter((camp) => camp.status === status)
	}

	if (search) {
		const query = search.toLowerCase()
		filtered = filtered.filter((camp) => camp.name.toLowerCase().includes(query))
	}

	return c.json({
		campaigns: filtered,
		total: filtered.length,
	})
})

export { campaignRoutes }
