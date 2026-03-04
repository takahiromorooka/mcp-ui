import type { App } from '@modelcontextprotocol/ext-apps'
import { useCallback, useRef, useState } from 'react'
import { extractTextFromContent, parseCampaigns } from './parse-campaigns'

interface Campaign {
	id: string
	name: string
	platform: string
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
	platform?: string
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
				if (filters.platform) args.platform = filters.platform
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
				if (text) return parseCampaigns(text)
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
