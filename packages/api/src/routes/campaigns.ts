import { Hono } from 'hono'
import { mockCampaigns } from '../data/mock-campaigns'
import { mockMedia } from '../data/mock-media'
import type { CampaignWithMedia, Status } from '../types/campaign'

const mediaMap = new Map(mockMedia.map((m) => [m.id, m.name]))

const campaignRoutes = new Hono()

campaignRoutes.get('/', (c) => {
	const mediaId = c.req.query('media_id')
	const status = c.req.query('status') as Status | undefined
	const search = c.req.query('search')
	const ids = c.req.query('ids')

	let filtered = mockCampaigns

	if (ids) {
		const idSet = new Set(ids.split(',').map((id) => id.trim()))
		filtered = filtered.filter((camp) => idSet.has(camp.id))
	}

	if (mediaId) {
		filtered = filtered.filter((camp) => camp.mediaId === mediaId)
	}

	if (status) {
		filtered = filtered.filter((camp) => camp.status === status)
	}

	if (search) {
		const query = search.toLowerCase()
		filtered = filtered.filter((camp) => camp.name.toLowerCase().includes(query))
	}

	const campaigns: CampaignWithMedia[] = filtered.map((camp) => ({
		...camp,
		mediaName: mediaMap.get(camp.mediaId) ?? camp.mediaId,
	}))

	return c.json({
		campaigns,
		total: campaigns.length,
	})
})

export { campaignRoutes }
