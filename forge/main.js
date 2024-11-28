export function $(name, ...mods) {
	const el = document.createElement(name);
	const toAppend = [];

	for (const mod of mods) {
		if (Array.isArray(mod)) {
			const type = mod[0];
			if (type === 0) el[mod[1]] = mod[2];
			else if (type === 1) el.id = mod[1];
			else if (type === 2) el.classList.add(mod[1]);
			else if (type === 3) el.setAttribute(mod[1], mod[2]);
			else throw new Error();
		} else if (mod instanceof Node || typeof mod === 'string')
			toAppend.push(mod);
		else if (mod === null);
		else throw new Error();
	}

	el.append(...toAppend);
	return el;
}

$.prop = (name, value) => [0, name, value];
$.id = (name) => [1, name];
$.class = (name) => [2, name];
$.attr = (name, value) => [3, name, value];
