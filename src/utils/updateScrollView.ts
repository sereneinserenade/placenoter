export const updateScrollView = (container: HTMLElement | null, item: HTMLElement | null) => {
	if (item && container) {
		//Get the height f the list container
		const ContainerHeight = container.offsetHeight;
		const itemHeight = item ? item.offsetHeight : 0;

		//Calculate item distance from top and bottom
		const top = item.offsetTop;
		const bottom = top + itemHeight;

		if (top < container.scrollTop) {
			container.scrollTop -= container.scrollTop - top + 5;
		} else if (bottom > ContainerHeight + container.scrollTop) {
			container.scrollTop += bottom - ContainerHeight - container.scrollTop + 5;
		}
	}
};
