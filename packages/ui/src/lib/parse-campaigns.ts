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

/**
 * ツール結果からキャンペーン配列を安全にパースする。
 * Claude/ChatGPT間のレスポンス形式差異（二重JSONエンコード等）に対応。
 */
export function parseCampaigns(value: unknown): Campaign[] | null {
	const data = typeof value === 'string' ? safeParse(value) : value
	if (Array.isArray(data)) return data
	if (data && typeof data === 'object' && 'campaigns' in data) {
		const campaigns = (data as { campaigns: unknown }).campaigns
		if (Array.isArray(campaigns)) return campaigns
	}
	return null
}

function safeParse(text: string): unknown {
	try {
		const parsed = JSON.parse(text)
		// 二重JSONエンコード対応: パース結果がまだ文字列なら再パース
		if (typeof parsed === 'string') return safeParse(parsed)
		return parsed
	} catch {
		return null
	}
}

/**
 * tool-resultのcontentからテキストを抽出する。
 * contentが配列でない場合にも対応。
 */
export function extractTextFromContent(content: unknown): string | null {
	if (Array.isArray(content)) {
		const textContent = content.find(
			(c: { type?: string }) => c && typeof c === 'object' && c.type === 'text',
		)
		if (textContent && 'text' in textContent) {
			return String(textContent.text)
		}
	}
	// contentが直接テキストオブジェクトの場合
	if (content && typeof content === 'object' && 'type' in content && 'text' in content) {
		return String((content as { text: unknown }).text)
	}
	// contentが文字列の場合
	if (typeof content === 'string') return content
	return null
}
