export interface Campaign {
	id: string
	name: string
	platform: Platform
	status: Status
	budget: number
	impressions: number
	clicks: number
	conversions: number
	startDate: string
	endDate: string
}

export type Platform = 'Google' | 'Instagram' | 'TikTok' | 'Facebook' | 'X' | 'YouTube'
export type Status = 'active' | 'paused' | 'completed'
