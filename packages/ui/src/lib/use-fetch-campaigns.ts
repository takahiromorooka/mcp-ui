import type { App } from '@modelcontextprotocol/ext-apps'
import { useCallback, useRef, useState } from 'react'
import { extractTextFromContent, parseCampaignsAndMedia } from './parse-campaigns'

interface Campaign {
	id: string
	name: string
	mediaId: string
	mediaName: string
	status: string
	budget: number
	impressions: number
	clicks: number
	conversions: number
	startDate: string
	endDate: string
}

interface FetchFilters {
	search?: string
	media_id?: string
	status?: string
}

export function useFetchCampaigns(app: App | null) {
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const fetchIdRef = useRef(0)

	const fetchCampaigns = useCallback(
		async (filters: FetchFilters): Promise<Campaign[] | null> => {
			if (!app) return null

			const id = ++fetchIdRef.current
			setIsLoading(true)
			setError(null)

			try {
				const args: Record<string, string> = {}
				if (filters.search) args.search = filters.search
				if (filters.media_id) args.media_id = filters.media_id
				if (filters.status) args.status = filters.status

				const result = await app.callServerTool({
					name: 'list_campaigns',
					arguments: args,
				})

				if (id !== fetchIdRef.current) return null

				if (result.isError) {
					setError('データの取得に失敗しました')
					return null
				}

				const text = extractTextFromContent(result.content)
				if (text) {
					const parsed = parseCampaignsAndMedia(text)
					return parsed?.campaigns ?? null
				}
				return null
			} catch (err) {
				if (id !== fetchIdRef.current) return null
				setError(err instanceof Error ? err.message : 'データの取得に失敗しました')
				return null
			} finally {
				if (id === fetchIdRef.current) {
					setIsLoading(false)
				}
			}
		},
		[app],
	)

	return { isLoading, error, fetchCampaigns, clearError: () => setError(null) }
}
