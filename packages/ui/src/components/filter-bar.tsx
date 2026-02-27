import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface FilterBarProps {
	filterName: string
	filterPlatform: string
	filterStatus: string
	onNameChange: (value: string) => void
	onPlatformChange: (value: string) => void
	onStatusChange: (value: string) => void
}

const platforms = ['Google', 'Instagram', 'TikTok', 'Facebook', 'X', 'YouTube'] as const
const statuses = [
	{ value: 'active', label: '配信中' },
	{ value: 'paused', label: '一時停止' },
	{ value: 'completed', label: '完了' },
] as const

export function FilterBar({
	filterName,
	filterPlatform,
	filterStatus,
	onNameChange,
	onPlatformChange,
	onStatusChange,
}: FilterBarProps) {
	return (
		<div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/40 p-3">
			<Input
				type="text"
				placeholder="キャンペーン名で検索..."
				value={filterName}
				onChange={(e) => onNameChange(e.target.value)}
				className="min-w-[180px] flex-1 bg-background"
			/>
			<Select
				value={filterPlatform || undefined}
				onValueChange={(v) => onPlatformChange(v === '__all__' ? '' : v)}
			>
				<SelectTrigger className="w-[150px] bg-background">
					<SelectValue placeholder="全媒体" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="__all__">全媒体</SelectItem>
					{platforms.map((p) => (
						<SelectItem key={p} value={p}>
							{p}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<Select
				value={filterStatus || undefined}
				onValueChange={(v) => onStatusChange(v === '__all__' ? '' : v)}
			>
				<SelectTrigger className="w-[150px] bg-background">
					<SelectValue placeholder="全ステータス" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="__all__">全ステータス</SelectItem>
					{statuses.map((s) => (
						<SelectItem key={s.value} value={s.value}>
							{s.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	)
}
