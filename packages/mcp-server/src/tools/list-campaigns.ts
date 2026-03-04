import {
	RESOURCE_MIME_TYPE,
	RESOURCE_URI_META_KEY,
	registerAppResource,
	registerAppTool,
} from '@modelcontextprotocol/ext-apps/server'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { UI_HTML } from '../ui/html'

const RESOURCE_URI = 'ui://campaigns/list'

export function registerListCampaignsTool(server: McpServer, apiBaseUrl: string) {
	// UIリソースハンドラ登録（ホストがresources/readで取得する）
	registerAppResource(
		server,
		'Campaign List UI',
		RESOURCE_URI,
		{ mimeType: RESOURCE_MIME_TYPE },
		async () => ({
			contents: [
				{
					uri: RESOURCE_URI,
					mimeType: RESOURCE_MIME_TYPE,
					text: UI_HTML,
				},
			],
		}),
	)

	// ツール登録（_meta.ui.resourceUriでUI宣言）
	registerAppTool(
		server,
		'list_campaigns',
		{
			title: 'List Ad Campaigns',
			description:
				'Search and filter advertising campaigns. Use list_media tool first to get available media IDs. Returns campaign data with an interactive search/filter UI.',
			inputSchema: {
				media_id: z.string().optional().describe('Filter by media ID (e.g. media-001)'),
				status: z
					.enum(['active', 'paused', 'completed'])
					.optional()
					.describe('Filter by campaign status'),
				search: z.string().optional().describe('Search campaign by name'),
			},
			_meta: {
				ui: { resourceUri: RESOURCE_URI },
			},
		},
		async ({ media_id, status, search }) => {
			const params = new URLSearchParams()
			if (media_id) params.set('media_id', media_id)
			if (status) params.set('status', status)
			if (search) params.set('search', search)

			const queryString = params.toString()
			const url = `${apiBaseUrl}/api/campaigns${queryString ? `?${queryString}` : ''}`
			const response = await fetch(url)
			const data = await response.json()

			return {
				content: [
					{
						type: 'text' as const,
						text: JSON.stringify(data, null, 2),
					},
				],
				_meta: {
					[RESOURCE_URI_META_KEY]: RESOURCE_URI,
				},
			}
		},
	)
}
