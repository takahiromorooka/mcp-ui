module.exports = {
	apps: [
		{
			name: 'mcp-api',
			script: 'pnpm',
			args: 'dev:api',
			cwd: '/home/moro/mcp-ui',
		},
		{
			name: 'mcp-server',
			script: 'pnpm',
			args: 'dev:mcp',
			cwd: '/home/moro/mcp-ui',
		},
		{
			name: 'mcp-tunnel',
			script: 'cloudflared',
			args: 'tunnel --url http://localhost:8788',
			cwd: '/home/moro/mcp-ui',
			restart_delay: 5000,
		},
	],
}
