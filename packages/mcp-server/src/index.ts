import { StreamableHTTPTransport } from '@hono/mcp'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { Hono } from 'hono'
import { registerAnalyzeCampaignsTool } from './tools/analyze-campaigns'
import { registerListCampaignsTool } from './tools/list-campaigns'
import { registerListMediaTool } from './tools/list-media'

type Bindings = {
	API_BASE_URL: string
}

const app = new Hono<{ Bindings: Bindings }>()

const server = new McpServer({
	name: 'ad-campaigns-mcp',
	version: '0.1.0',
})

const transport = new StreamableHTTPTransport()

app.all('/mcp', async (c) => {
	const apiBaseUrl = c.env.API_BASE_URL || 'http://localhost:8787'

	if (!server.isConnected()) {
		registerListMediaTool(server, apiBaseUrl)
		registerListCampaignsTool(server, apiBaseUrl)
		registerAnalyzeCampaignsTool(server, apiBaseUrl)
		await server.connect(transport)
	}

	return transport.handleRequest(c)
})

app.get('/health', (c) => {
	return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default app
