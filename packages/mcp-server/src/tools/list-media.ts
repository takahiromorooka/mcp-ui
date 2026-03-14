import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

export function registerListMediaTool(server: McpServer, apiBaseUrl: string) {
	server.tool('list_media', 'List all available advertising media/platforms.', {}, async () => {
		const url = `${apiBaseUrl}/api/media`
		const response = await fetch(url)
		const data = await response.json()

		return {
			content: [
				{
					type: 'text' as const,
					text: JSON.stringify(data, null, 2),
				},
			],
		}
	})
}
