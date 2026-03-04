import { useApp } from '@modelcontextprotocol/ext-apps/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ActionBar } from './components/action-bar'
import { AnalysisChart } from './components/analysis-chart'
import { CampaignTable } from './components/campaign-table'
import { FilterBar } from './components/filter-bar'
import { extractTextFromContent, parseCampaigns } from './lib/parse-campaigns'

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

type AnalysisData = {
	type: 'campaign_analysis'
	campaigns: {
		id: string
		name: string
		platform: string
		ctr: number
		cvr: number
		cpc: number
		budget: number
		impressions: number
		clicks: number
		conversions: number
	}[]
}

export function App() {
	const [campaigns, setCampaigns] = useState<Campaign[]>([])
	const [filterName, setFilterName] = useState('')
	const [filterPlatform, setFilterPlatform] = useState('')
	const [filterStatus, setFilterStatus] = useState('')
	const [selected, setSelected] = useState<Set<string>>(new Set())
	const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
	const loadedRef = useRef(false)

	// Refで最新のsetterを保持（クロージャから安全に参照するため）
	const setCampaignsRef = useRef(setCampaigns)
	const setAnalysisDataRef = useRef(setAnalysisData)
	setCampaignsRef.current = setCampaigns
	setAnalysisDataRef.current = setAnalysisData

	// ツール結果をパースしてstateにセットする共通処理
	const handleToolResult = useCallback(
		(params: { content?: unknown; structuredContent?: unknown }) => {
			if (loadedRef.current) return

			const sc = params.structuredContent as { type?: string } | undefined
			if (sc?.type === 'campaign_analysis') {
				setAnalysisDataRef.current(sc as AnalysisData)
				return
			}

			const text = extractTextFromContent(params.content)
			if (text) {
				const arr = parseCampaigns(text)
				if (arr) {
					setCampaignsRef.current(arr)
					loadedRef.current = true
				}
			}
		},
		[],
	)

	// (1) 直接postMessageパーシング: SDKのtransportを迂回してtool-resultを直接キャプチャ
	useEffect(() => {
		const handler = (event: MessageEvent) => {
			const data = event.data
			if (typeof data !== 'object' || data === null) return
			if (data.method === 'ui/notifications/tool-result' && data.params) {
				handleToolResult(data.params)
			}
		}
		window.addEventListener('message', handler)
		return () => window.removeEventListener('message', handler)
	}, [handleToolResult])

	// (2) ontoolresult: SDKの正規コールバック（Claude互換）
	const { app, isConnected } = useApp({
		appInfo: { name: 'CampaignDashboard', version: '0.1.0' },
		capabilities: {},
		onAppCreated: (createdApp) => {
			createdApp.ontoolresult = (params) => {
				handleToolResult(params)
			}
		},
	})

	// (3) callServerTool: 接続後に能動的にデータを取得
	useEffect(() => {
		if (!app || !isConnected || loadedRef.current) return
		app
			.callServerTool({ name: 'list_campaigns', arguments: {} })
			.then((result) => {
				if (!result.isError) handleToolResult(result)
			})
			.catch(() => {})
	}, [app, isConnected, handleToolResult])

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
		const ids = [...selected].join(',')
		await app.sendMessage({
			role: 'user',
			content: [
				{
					type: 'text',
					text: `analyze_campaignsツールを使って、以下のIDのキャンペーンを分析してください。分析結果をもとに改善提案もお願いします。\n\nids: ${ids}`,
				},
			],
		})
	}, [app, selected])

	if (!isConnected) {
		return (
			<div className="flex flex-col items-center justify-center p-16 text-muted-foreground">
				<div className="h-7 w-7 animate-spin rounded-full border-3 border-muted border-t-primary" />
				<p className="mt-3 text-sm">接続中...</p>
			</div>
		)
	}

	if (campaigns.length === 0 && !analysisData) {
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
			{analysisData && <AnalysisChart data={analysisData} onClose={() => setAnalysisData(null)} />}
		</div>
	)
}
