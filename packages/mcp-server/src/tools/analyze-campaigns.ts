import { RESOURCE_URI_META_KEY, registerAppTool } from '@modelcontextprotocol/ext-apps/server'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

const RESOURCE_URI = 'ui://campaigns/list'

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

interface CampaignMetrics {
	id: string
	name: string
	mediaName: string
	ctr: number
	cvr: number
	cpc: number
	budget: number
	impressions: number
	clicks: number
	conversions: number
}

function calcMetrics(campaign: Campaign): CampaignMetrics {
	const ctr = campaign.impressions > 0 ? (campaign.clicks / campaign.impressions) * 100 : 0
	const cvr = campaign.clicks > 0 ? (campaign.conversions / campaign.clicks) * 100 : 0
	const cpc = campaign.clicks > 0 ? campaign.budget / campaign.clicks : 0
	return {
		id: campaign.id,
		name: campaign.name,
		mediaName: campaign.mediaName,
		ctr: Math.round(ctr * 100) / 100,
		cvr: Math.round(cvr * 100) / 100,
		cpc: Math.round(cpc),
		budget: campaign.budget,
		impressions: campaign.impressions,
		clicks: campaign.clicks,
		conversions: campaign.conversions,
	}
}

function buildTextSummary(metrics: CampaignMetrics[]): string {
	const lines = ['キャンペーン分析結果:', '']
	lines.push('| キャンペーン | 媒体 | CTR(%) | CVR(%) | CPC(円) | 予算 | CV数 |')
	lines.push('|---|---|---|---|---|---|---|')
	for (const m of metrics) {
		lines.push(
			`| ${m.name} | ${m.mediaName} | ${m.ctr} | ${m.cvr} | ¥${m.cpc.toLocaleString()} | ¥${m.budget.toLocaleString()} | ${m.conversions} |`,
		)
	}
	return lines.join('\n')
}

export function registerAnalyzeCampaignsTool(server: McpServer, apiBaseUrl: string) {
	registerAppTool(
		server,
		'analyze_campaigns',
		{
			title: 'Analyze Ad Campaigns',
			description:
				'Analyze selected advertising campaigns. Calculates performance metrics (CTR, CVR, CPC) and returns chart data for visualization.',
			annotations: {
				readOnlyHint: true,
			},
			inputSchema: {
				ids: z.string().describe('カンマ区切りのキャンペーンID'),
			},
			_meta: {
				ui: { resourceUri: RESOURCE_URI },
			},
		},
		async ({ ids }) => {
			const url = `${apiBaseUrl}/api/campaigns?ids=${encodeURIComponent(ids)}`
			const response = await fetch(url)
			const data = (await response.json()) as { campaigns: Campaign[] }
			const campaigns = data.campaigns || []
			const metrics = campaigns.map(calcMetrics)

			return {
				content: [
					{
						type: 'text' as const,
						text: buildTextSummary(metrics),
					},
				],
				structuredContent: {
					type: 'campaign_analysis',
					campaigns: metrics,
				},
				_meta: {
					[RESOURCE_URI_META_KEY]: RESOURCE_URI,
				},
			}
		},
	)
}
