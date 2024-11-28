/*
 * Copyright (c) 2024 nataliemeow
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 * 1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 *    misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 */

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
