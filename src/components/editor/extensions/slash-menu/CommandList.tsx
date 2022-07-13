import React, { useEffect, useState, useRef, useLayoutEffect } from 'react'
import { stopPrevent } from '../../../../utils'
import { updateScrollView } from '../../../../utils/updateScrollView'

import './styles/CommandList.scss'

interface CommandListProps {
	items: any[]
	command: Function
	event: any
}

export const CommandList: React.FC<CommandListProps> = ({ items, command, event }) => {
	const [selectedIndex, setSelectedIndex] = useState(0)

	const commandListContainer = useRef<HTMLDivElement>(null)

	useEffect(() => setSelectedIndex(0), [items])

	useLayoutEffect(() => {
		// Get Container
		const container = commandListContainer?.current || null
		// Get active/selected item from list
		const item = (container!.children[selectedIndex] as HTMLElement) || null
		// Update the scroll position
		updateScrollView(container, item)
	}, [selectedIndex])

	const onKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'ArrowUp') {
			stopPrevent(event)
			upHandler()
			return true
		}

		if (event.key === 'ArrowDown') {
			stopPrevent(event)
			downHandler()
			return true
		}

		if (event.key === 'Enter') {
			stopPrevent(event)
			enterHandler()
			return true
		}

		return false
	}

	useEffect(() => {
		onKeyDown(event)
	}, [event])

	const upHandler = () => {
		setSelectedIndex((selectedIndex + items.length - 1) % items.length)
	}

	const downHandler = () => {
		setSelectedIndex((selectedIndex + 1) % items.length)
	}

	const enterHandler = () => {
		selectItem(selectedIndex)
	}

	const selectItem = (index: number) => {
		const item = items[index]

		if (item) setTimeout(() => command(item))
	}

	return (
		<div ref={commandListContainer} className='items hide-scrollbar'>
			{items.length ? (
				<>
					{items.map((item, index) => {
						return (
							<article
								className={`item flex ${index === selectedIndex ? 'is-selected' : ''}`}
								key={index}
								onClick={() => selectItem(index)}
								onMouseEnter={() => setSelectedIndex(index)}
							>
								<span className='flex align-center gap-8px'>
									{item.icon()}{' '}
									<span dangerouslySetInnerHTML={{ __html: item.highlightedTitle || item.title }} />
								</span>
								{item.shortcut && <code>{item.shortcut}</code>}
							</article>
						)
					})}
				</>
			) : (
				<div className='item'> No result </div>
			)}
		</div>
	)
}
