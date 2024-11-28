import { Sween } from '../sween/main.js';
import { $ } from '../forge/main.js';
import jsTokens from 'https://cdn.jsdelivr.net/npm/js-tokens@9.0.1/+esm'

const map = {
	StringLiteral: 'String',
	NoSubstitutionTemplate: 'String',
	TemplateHead: 'String',
	TemplateMiddle: 'String',
	TemplateTail: 'String',
	RegularExpressionLiteral: 'String',
	MultiLineComment: 'Comment',
	SingleLineComment: 'Comment',
	HashbangComment: 'Comment',
	// IdentifierName: 'Variable',
	PrivateIdentifier: 'Variable',
	NumericLiteral: 'Number',
	Punctuator: 'Punctuator',
	Invalid: 'Invalid'
};

const keywords = new Set(['async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'export', 'extends', 'false', 'finally', 'for', 'function', 'from', 'if', 'import', 'in', 'instanceof', 'let', 'new', 'null', 'of', 'return', 'static', 'super', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield']);
const indentChars = new Set('[()[{!%^&*+=-|<>\/.]');

export const langJS = Base => class extends Base {
	render() {
		const nodes = [];

		const tokens = Array.from(jsTokens(this.inputE.value));

		// whether the next token is a property name or not
		let prop = false;
		for (const [i, { value, type }] of tokens.entries()) {
			if (type === 'WhiteSpace' || type === 'LineTerminatorSequence') {
				nodes.push(value);
				if (type === 'LineTerminatorSequence') nodes.push(this.startLine());
				continue;
			}

			let cls;
			if (type === 'IdentifierName') {
				if (value === 'true' || value === 'false')
					cls = 'Boolean';
				else if (keywords.has(value) && !prop)
					cls = 'Keyword';
				else if (i + 1 in tokens && tokens[i + 1].value === '(')
					cls = 'Function';
				else if (/^[_$]*[A-Z]+$/.test(value))
					cls = 'Constant';
				else if (/^[_$]*[A-Z]/.test(value))
					cls = 'Type';
				else
					cls = 'Variable';
			} else
				cls = map[type];

			prop = value === '.';

			for (const [i, line] of value.split('\n').entries()) {
				if (i > 0) {
					nodes.push('\n');
					nodes.push(this.startLine());
				}
				nodes.push($('span', $.prop('className', this.classes[cls]), line));
			}
		}

		nodes.push('\n');
		this.viewLayerE.append.apply(this.viewLayerE, nodes);
	}

	indent(level) {
		const char = this.inputE.value[this.inputE.selectionEnd - 1];
		if (indentChars.has(char)) return level + 1;
		if (char === '`') return 0;
		return level;
	}
};
