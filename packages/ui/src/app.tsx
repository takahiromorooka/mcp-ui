import { useApp } from '@modelcontextprotocol/ext-apps/react'
import { useCallback, useEffect, useState } from 'react'
import { ActionBar } from './components/action-bar'
import { CampaignTable } from './components/campaign-table'
import { FilterBar } from './components/filter-bar'

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

export function App() {
	const { app, isConnected } = useApp({
		appInfo: { name: 'CampaignDashboard', version: '0.1.0' },
		capabilities: {},
	})

	const [campaigns, setCampaigns] = useState<Campaign[]>([])
	const [filterName, setFilterName] = useState('')
	const [filterPlatform, setFilterPlatform] = useState('')
	const [filterStatus, setFilterStatus] = useState('')
	const [selected, setSelected] = useState<Set<string>>(new Set())

	useEffect(() => {
		if (!app) return
		app.ontoolresult = (params) => {
			if (!params.content) return
			const textContent = params.content.find((c: { type: string }) => c.type === 'text')
			if (textContent && 'text' in textContent) {
				try {
					const parsed = JSON.parse(textContent.text as string)
					setCampaigns(parsed.campaigns || parsed)
				} catch {
					// ignore
				}
			}
		}
	}, [app])

	const filtered = campaigns.filter((c) => {
		const matchesName = filterName === '' || c.name.toLowerCase().includes(filterName.toLowerCase())
		const matchesPlatform = filterPlatform === '' || c.platform === filterPlatform
		const matchesStatus = filterStatus === '' || c.status === filterStatus
		return matchesName && matchesPlatform && matchesStatus
	})

	const toggleSelect = useCallback((id: string) => {
		setSelected((prev) => {
			const next = new Set(prev)
			if (next.has(id)) next.delete(id)
			else next.add(id)
			return next
		})
	}, [])

	const toggleAll = useCallback(() => {
		setSelected((prev) => {
			if (prev.size === filtered.length) return new Set()
			return new Set(filtered.map((c) => c.id))
		})
	}, [filtered])

	const handleAnalyze = useCallback(async () => {
		if (!app || selected.size === 0) return
		const selectedCampaigns = campaigns.filter((c) => selected.has(c.id))
		const dataJson = JSON.stringify(selectedCampaigns, null, 2)
		await app.sendMessage({
			role: 'user',
			content: [
				{
					type: 'text',
					text: `以下の${selectedCampaigns.length}件のキャンペーンを詳しく分析してください。各キャンペーンのパフォーマンス（CTR、CVR等）を算出し、改善提案をお願いします。\n\n\`\`\`json\n${dataJson}\n\`\`\``,
				},
			],
		})
	}, [app, selected, campaigns])

	if (!isConnected) {
		return (
			<div className="flex flex-col items-center justify-center p-16 text-muted-foreground">
				<div className="h-7 w-7 animate-spin rounded-full border-3 border-muted border-t-primary" />
				<p className="mt-3 text-sm">接続中...</p>
			</div>
		)
	}

	if (campaigns.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center p-16 text-muted-foreground">
				<div className="h-7 w-7 animate-spin rounded-full border-3 border-muted border-t-primary" />
				<p className="mt-3 text-sm">キャンペーンデータを取得中...</p>
			</div>
		)
	}

	return (
		<div className="mx-auto max-w-[1200px] p-4">
			<h1 className="mb-4 text-lg font-semibold">キャンペーンダッシュボード</h1>
			<FilterBar
				filterName={filterName}
				filterPlatform={filterPlatform}
				filterStatus={filterStatus}
				onNameChange={setFilterName}
				onPlatformChange={setFilterPlatform}
				onStatusChange={setFilterStatus}
			/>
			<div className="mb-2 text-xs text-muted-foreground">
				{campaigns.length}件中 {filtered.length}件表示
			</div>
			<CampaignTable
				campaigns={filtered}
				selected={selected}
				onToggleSelect={toggleSelect}
				onToggleAll={toggleAll}
			/>
			{selected.size > 0 && <ActionBar count={selected.size} onAnalyze={handleAnalyze} />}
		</div>
	)
}
