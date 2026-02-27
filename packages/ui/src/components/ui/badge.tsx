import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
	'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
	{
		variants: {
			variant: {
				default: 'border-transparent bg-primary text-primary-foreground shadow',
				secondary: 'border-transparent bg-secondary text-secondary-foreground',
				destructive: 'border-transparent bg-destructive text-destructive-foreground shadow',
				outline: 'text-foreground',
				google: 'border-transparent bg-[#e8f0fe] text-[#4285f4] dark:bg-[rgba(66,133,244,0.15)]',
				instagram: 'border-transparent bg-[#fce4ec] text-[#e1306c] dark:bg-[rgba(225,48,108,0.15)]',
				tiktok:
					'border-transparent bg-[#e8e8e8] text-[#010101] dark:bg-[rgba(255,255,255,0.08)] dark:text-[#e9ecef]',
				facebook: 'border-transparent bg-[#e7f3ff] text-[#1877f2] dark:bg-[rgba(24,119,242,0.15)]',
				x: 'border-transparent bg-[#e8e8e8] text-[#14171a] dark:bg-[rgba(255,255,255,0.08)] dark:text-[#e9ecef]',
				youtube: 'border-transparent bg-[#fee] text-[#ff0000] dark:bg-[rgba(255,0,0,0.12)]',
				active:
					'border-transparent bg-[#d3f9d8] text-[#2b8a3e] dark:bg-[rgba(47,158,68,0.15)] dark:text-[#51cf66]',
				paused:
					'border-transparent bg-[#fff3bf] text-[#e67700] dark:bg-[rgba(230,119,0,0.15)] dark:text-[#ffc078]',
				completed:
					'border-transparent bg-[#e9ecef] text-[#495057] dark:bg-[rgba(73,80,87,0.25)] dark:text-[#909296]',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
)

export interface BadgeProps
	extends HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
	return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
