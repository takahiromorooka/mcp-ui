export interface Media {
	id: string
	name: string
}

export interface Campaign {
	id: string
	name: string
	mediaId: string
	status: Status
	budget: number
	impressions: number
	clicks: number
	conversions: number
	startDate: string
	endDate: string
}

export interface CampaignWithMedia extends Campaign {
	mediaName: string
}

export type Status = 'active' | 'paused' | 'completed'
