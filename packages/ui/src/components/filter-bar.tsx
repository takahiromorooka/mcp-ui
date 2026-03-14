import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface Media {
	id: string
	name: string
}

interface FilterBarProps {
	media: Media[]
	filterName: string
	filterMediaId: string
	filterStatus: string
	onNameChange: (value: string) => void
	onMediaIdChange: (value: string) => void
	onStatusChange: (value: string) => void
}

const statuses = [
	{ value: 'active', label: '配信中' },
	{ value: 'paused', label: '一時停止' },
	{ value: 'completed', label: '完了' },
] as const

export function FilterBar({
	media,
	filterName,
	filterMediaId,
	filterStatus,
	onNameChange,
	onMediaIdChange,
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
				value={filterMediaId || undefined}
				onValueChange={(v) => onMediaIdChange(v === '__all__' ? '' : v)}
			>
				<SelectTrigger className="w-[180px] bg-background">
					<SelectValue placeholder="全媒体" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="__all__">全媒体</SelectItem>
					{media.map((m) => (
						<SelectItem key={m.id} value={m.id}>
							{m.name}
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
