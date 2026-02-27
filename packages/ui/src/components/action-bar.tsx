import { Badge } from './ui/badge'
import { Button } from './ui/button'

interface ActionBarProps {
	count: number
	onAnalyze: () => void
}

export function ActionBar({ count, onAnalyze }: ActionBarProps) {
	return (
		<div className="mt-4 mb-2 flex items-center justify-between rounded-lg border-2 border-primary/20 bg-muted px-4 py-3">
			<div className="flex items-center gap-2">
				<Badge variant="default" className="text-sm">
					{count}件選択中
				</Badge>
				<span className="text-xs text-muted-foreground">選択したキャンペーンをAIが分析します</span>
			</div>
			<Button onClick={onAnalyze} size="sm" className="font-semibold">
				分析する
			</Button>
		</div>
	)
}
