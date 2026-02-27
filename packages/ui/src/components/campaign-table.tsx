import type { BadgeProps } from './ui/badge'
import { Badge } from './ui/badge'
import { Checkbox } from './ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'

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

interface CampaignTableProps {
	campaigns: Campaign[]
	selected: Set<string>
	onToggleSelect: (id: string) => void
	onToggleAll: () => void
}

const platformVariantMap: Record<string, BadgeProps['variant']> = {
	Google: 'google',
	Instagram: 'instagram',
	TikTok: 'tiktok',
	Facebook: 'facebook',
	X: 'x',
	YouTube: 'youtube',
}

const statusVariantMap: Record<string, BadgeProps['variant']> = {
	active: 'active',
	paused: 'paused',
	completed: 'completed',
}

const statusLabelMap: Record<string, string> = {
	active: '配信中',
	paused: '一時停止',
	completed: '完了',
}

function formatBudget(n: number): string {
	return `\u00a5${n.toLocaleString('ja-JP')}`
}

function formatNumber(n: number): string {
	return n.toLocaleString('ja-JP')
}

export function CampaignTable({
	campaigns,
	selected,
	onToggleSelect,
	onToggleAll,
}: CampaignTableProps) {
	const allSelected = campaigns.length > 0 && selected.size === campaigns.length

	return (
		<div className="rounded-lg border border-border">
			<Table>
				<TableHeader>
					<TableRow className="bg-muted/50">
						<TableHead className="w-[40px]">
							<Checkbox
								checked={allSelected}
								onCheckedChange={onToggleAll}
								aria-label="すべて選択"
							/>
						</TableHead>
						<TableHead>キャンペーン名</TableHead>
						<TableHead>媒体</TableHead>
						<TableHead>ステータス</TableHead>
						<TableHead className="text-right">予算</TableHead>
						<TableHead className="text-right">表示回数</TableHead>
						<TableHead className="text-right">クリック</TableHead>
						<TableHead className="text-right">CV</TableHead>
						<TableHead>期間</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{campaigns.length === 0 ? (
						<TableRow>
							<TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
								条件に一致するキャンペーンがありません
							</TableCell>
						</TableRow>
					) : (
						campaigns.map((c) => (
							<TableRow key={c.id} data-state={selected.has(c.id) ? 'selected' : undefined}>
								<TableCell>
									<Checkbox
										checked={selected.has(c.id)}
										onCheckedChange={() => onToggleSelect(c.id)}
										aria-label={`${c.name}を選択`}
									/>
								</TableCell>
								<TableCell className="max-w-[280px] truncate font-medium">{c.name}</TableCell>
								<TableCell>
									<Badge variant={platformVariantMap[c.platform] ?? 'secondary'}>
										{c.platform}
									</Badge>
								</TableCell>
								<TableCell>
									<Badge variant={statusVariantMap[c.status] ?? 'outline'}>
										{statusLabelMap[c.status] ?? c.status}
									</Badge>
								</TableCell>
								<TableCell className="text-right tabular-nums">{formatBudget(c.budget)}</TableCell>
								<TableCell className="text-right tabular-nums">
									{formatNumber(c.impressions)}
								</TableCell>
								<TableCell className="text-right tabular-nums">{formatNumber(c.clicks)}</TableCell>
								<TableCell className="text-right tabular-nums">
									{formatNumber(c.conversions)}
								</TableCell>
								<TableCell className="whitespace-nowrap text-xs text-muted-foreground">
									{c.startDate} ~ {c.endDate}
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	)
}
