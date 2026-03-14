import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'

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

interface AnalysisData {
	type: 'campaign_analysis'
	campaigns: CampaignMetrics[]
}

const COLORS = {
	ctr: '#3b82f6',
	cvr: '#10b981',
	budget: '#8b5cf6',
	conversions: '#f59e0b',
}

function truncateName(name: string, max = 12) {
	return name.length > max ? `${name.slice(0, max)}…` : name
}

export function AnalysisChart({ data, onClose }: { data: AnalysisData; onClose: () => void }) {
	const chartData = data.campaigns.map((c) => ({
		name: truncateName(c.name),
		CTR: c.ctr,
		CVR: c.cvr,
	}))

	const budgetData = data.campaigns.map((c) => ({
		name: truncateName(c.name),
		'予算(万円)': Math.round(c.budget / 10000),
		CV数: c.conversions,
	}))

	return (
		<div className="mt-4 rounded-lg border bg-card p-4">
			<div className="mb-3 flex items-center justify-between">
				<h2 className="text-sm font-semibold">キャンペーン分析チャート</h2>
				<button
					type="button"
					onClick={onClose}
					className="rounded px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted"
				>
					閉じる
				</button>
			</div>
			<div className="grid gap-6 md:grid-cols-2">
				<div>
					<h3 className="mb-2 text-xs font-medium text-muted-foreground">
						パフォーマンス比較（CTR・CVR %）
					</h3>
					<ResponsiveContainer width="100%" height={280}>
						<BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="name" tick={{ fontSize: 11 }} />
							<YAxis tick={{ fontSize: 11 }} />
							<Tooltip />
							<Legend wrapperStyle={{ fontSize: 12 }} />
							<Bar dataKey="CTR" fill={COLORS.ctr} radius={[3, 3, 0, 0]} />
							<Bar dataKey="CVR" fill={COLORS.cvr} radius={[3, 3, 0, 0]} />
						</BarChart>
					</ResponsiveContainer>
				</div>
				<div>
					<h3 className="mb-2 text-xs font-medium text-muted-foreground">予算 vs CV数</h3>
					<ResponsiveContainer width="100%" height={280}>
						<BarChart data={budgetData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="name" tick={{ fontSize: 11 }} />
							<YAxis yAxisId="left" tick={{ fontSize: 11 }} />
							<YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
							<Tooltip />
							<Legend wrapperStyle={{ fontSize: 12 }} />
							<Bar yAxisId="left" dataKey="予算(万円)" fill={COLORS.budget} radius={[3, 3, 0, 0]} />
							<Bar yAxisId="right" dataKey="CV数" fill={COLORS.conversions} radius={[3, 3, 0, 0]} />
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>
		</div>
	)
}
