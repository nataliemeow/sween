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

import { $ } from './forge.js';

const ids = ['scroller', 'body', 'gutter', 'area', 'input', 'viewLayer', 'selectLayer', 'selection', 'caret'];
const classes = ['root', 'focused', 'lineNumber', 'Keyword', 'Number', 'String', 'Character', 'Boolean', 'Variable', 'Constant', 'Type', 'Function', 'Punctuator', 'Directive', 'Comment'];
let nEditors = 0;

export class Sween {
	constructor({ rootE, noGutter, zIndex, prefix, debug }) {
		this.i = nEditors++;

		prefix ||= '\u0160'; // frowny S (cry about it 'caron' enjoyers)

		this.ids = {};
		for (const [i, id] of ids.entries())
			this.ids[id] = `${prefix}${this.i}-${debug ? id : i}`;
		this.classes = {};
		for (const [i, cls] of classes.entries())
			this.classes[cls] = `${prefix}${this.i}-${debug ? cls : i}`;

		this.noGutter = !!noGutter;

		this.rootE = rootE;
		this.rootE.classList.add(this.classes.root);
		this.rootE.append(
			this.scrollerE = $('div', $.id(this.ids.scroller),
				this.bodyE = $('div', $.id(this.ids.body),
					this.noGutter ? null :
						this.gutterE = $('div', $.id(this.ids.gutter), $.attr('aria-hidden', 'true')),
					this.areaE = $('div', $.id(this.ids.area),
						this.inputE = $('textarea', $.id(this.ids.input),
							$.attr('autocapitalize', 'off'),
							$.attr('autocomplete', 'off'),
							$.attr('autocorrect', 'off'),
							$.attr('spellcheck', 'false'),
							$.attr('rows', '1')
						),
						this.viewLayerE = $('div', $.id(this.ids.viewLayer), $.attr('aria-hidden', 'true')),
						this.selectLayerE = $('div', $.id(this.ids.selectLayer),
							$.attr('aria-hidden', 'true'),
							this.caret()
						)
					)
				)
			)
		);

		this.rootE.addEventListener('keydown', e => {
			if (e.key === 'Tab') {
				if (e.shiftKey) return;
				e.preventDefault();
				this.insert('\t');
			}

			if (e.key === 'Enter') {
				if (e.shiftKey) return;
				e.preventDefault();

				const value = this.inputE.value;

				let lineStart = this.inputE.selectionEnd;
				while (value[--lineStart] !== '\n' && value[lineStart]);

				let indentLevel = 0;
				while (value[lineStart + (++indentLevel)] === '\t');
				indentLevel--;

				this.insert('\n' + '\t'.repeat(this.indent(indentLevel)));
			}
		});

		this.inputE.addEventListener('focus', () => {
			this.rootE.classList.add(this.classes.focused);
		});
		this.inputE.addEventListener('blur', () => {
			this.rootE.classList.remove(this.classes.focused);
		});
		this.inputE.addEventListener('selectionchange', () => this.refreshSelect());
		this.inputE.addEventListener('input', () => this.refresh());

		this.zIndex = zIndex || 0;
		document.head.appendChild($('style', this.styles()));

		this.refresh();
	}

	insert(text) {
		const value = this.inputE.value;
		const start = this.inputE.selectionStart;
		const end = this.inputE.selectionEnd;

		this.inputE.value = value.slice(0, start) + text + value.slice(end);

		this.inputE.selectionStart = this.inputE.selectionEnd = end + text.length;

		this.refresh();
	}

	indent() {
		// will be replaced by language extension
		// placeholder: set indent level to 0
		return 0;
	}

	render() {
		// will be replaced by language extension
		// placeholder: don't highlight
		this.viewLayerE.append(this.inputE.value);
	}

	startLine() {
		if (this.noGutter) return;
		return $('span', $.class(this.classes.lineNumber), (this.lineNumber++).toString());
	}

	refresh() {
		this.refreshSelect();

		for (let el; el = this.viewLayerE.firstChild;) el.remove();
		this.lineNumber = 1;
		this.viewLayerE.append(this.startLine());
		this.render();
		this.gutterE.style.flexBasis = (Math.log10(this.lineNumber) | 0) + 1 + 'ch';

		/*
		// need to resize to 0px to get accurate scrollHeight
		this.inputE.style.height = '0px';
		this.bodyE.style.height = this.inputE.scrollHeight + 'px';
		this.inputE.st1yle.height = '100%';
		*/
	}

	caret() {
		return this.caretE = $('span', $.id(this.ids.caret), '.');
	}

	refreshSelect() {
		const start = this.inputE.selectionStart;
		const end = this.inputE.selectionEnd;
		const dir = this.inputE.selectionDirection;

		const toAppend = [];

		for (let el; el = this.selectLayerE.firstChild;) el.remove();
		toAppend.push(this.inputE.value.slice(0, start));

		if (dir === 'backward') toAppend.push(this.caret());

		toAppend.push($('span',
			$.id(this.ids.selection),
			this.inputE.value.slice(start, end)
		));

		if (dir === 'forward') toAppend.push(this.caret());

		this.selectLayerE.append(...toAppend);
	}

	styles() {
		return `
#${this.ids.scroller} {
	box-sizing: border-box;
	height: 100%;
	border: 1px solid #ccc;
	overflow: scroll;
}
#${this.ids.body} {
	display: flex;
	position: relative;
	min-height: 100%;
	font: 16px 'Liberation Mono', 'Fira Mono', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', 'Roboto Mono', 'Consolas', 'Monaco', 'Menlo', monospace;
	line-height: 1.3;
	white-space: pre-wrap;
	overflow-wrap: break-word;
	tab-size: 2;
}
.${this.classes.root}.${this.classes.focused} #${this.ids.scroller} {
	outline: 1px dotted #111;
}
#${this.ids.gutter}, #${this.ids.area} {
	width: 100%;
}
#${this.ids.area}, #${this.ids.selectLayer}, #${this.classes.lineNumber} {
	user-select: none;
	-webkit-user-select: none;
}
#${this.ids.gutter} {
	flex-grow: 0;
	flex-shrink: 0;
	background: #f6f6f6;
	padding-left: 20px;
	border-right: 1px solid #ccc;
}
.${this.classes.lineNumber} {
	display: block;
	box-sizing: border-box;
	position: absolute;
	width: 800px;
	left: -800px;
	padding-right: 8px;
	white-space: nowrap;
	text-align: right;
	color: #888;
	text-shadow: 0 1px 0 #e4e4e4;
}

#${this.ids.viewLayer}, #${this.ids.selectLayer}, textarea#${this.ids.input} {
	box-sizing: border-box;
	padding-left: 5px;
}
#${this.ids.area} {
	flex: 1;
	min-width: 0;
	position: relative;
	background: #fff;
}
#${this.ids.selectLayer}, #${this.ids.input} {
	position: absolute;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
}
#${this.ids.viewLayer} {
	min-width: 0;
	height: 100%;
	overflow: hidden; /* line numbers */
}
#${this.ids.selectLayer} {
	z-index: ${this.zIndex + 1};
	color: transparent;
}
#${this.ids.input} {
	z-index: ${this.zIndex + 2};
	padding: 0;
	margin: 0;
	border: 0;
	opacity: 0;
	font: inherit;
	resize: none;
}
#${this.ids.selection} {
	background: #46a2f340;
}
@keyframes caretFlash {
	0% { background: #000; }
	50% { background: #0000; }
}
#${this.ids.caret} {
	position: absolute;
	display: inline-block;
	width: 1px;
	color: transparent;
}
.${this.classes.root}.${this.classes.focused} #${this.ids.caret} {
	animation: caretFlash 1.5s steps(1) infinite;
}

${this.theme()}
`;
	}

	theme() {
		return `
.${this.classes.Keyword} { color: #b41074; }
.${this.classes.Number} { color: #128054; }
.${this.classes.String} { color: #ba1616; }
.${this.classes.Type} { color: #00669e; }
.${this.classes.Constant} { color: #128054; }
.${this.classes.Boolean} { color: #a93666; }
.${this.classes.Function} { color: #0044de; }
.${this.classes.Comment} { color: #666666; font-style: italic; }
`;
	}
}

export function createSween(opts, ...mixins) {
	// apply mixins iteratively
	let cls = Sween;
	for (const mixin of mixins)
		cls = mixin(cls);

	return new cls(opts);
}
