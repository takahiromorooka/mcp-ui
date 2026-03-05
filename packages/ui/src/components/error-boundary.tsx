import { Component, type ReactNode } from 'react'

interface Props {
	children: ReactNode
}

interface State {
	hasError: boolean
	error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props)
		this.state = { hasError: false, error: null }
	}

	static getDerivedStateFromError(error: Error) {
		return { hasError: true, error }
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="mx-auto max-w-[600px] p-8">
					<h2 className="mb-2 text-sm font-semibold text-destructive">エラーが発生しました</h2>
					<pre className="overflow-auto rounded border bg-muted p-3 text-xs">
						{this.state.error?.message}
						{'\n'}
						{this.state.error?.stack}
					</pre>
				</div>
			)
		}
		return this.props.children
	}
}
