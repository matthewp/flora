import { PathLike } from "fs";
import { html } from ".";
import ExtendedReadable from "./extended-readable";
import { map } from "./map";
import * as fs from "fs";
import { v4 as uuid } from "uuid";

type StringLike = string | number | boolean | ReadableStream | ExtendedReadable;

export type Attributes = {
	[attribute: string]: StringLike | Promise<StringLike> | undefined;
};

export function refresh(timeout: number = 0) {
	return html/* HTML */ ` <meta http-equiv="refresh" content="${timeout}" />`;
}

export function redirect(url: string): string {
	return /* HTML */ `<meta http-equiv="Refresh" content="0; url='${url}'" />`;
}

export function document(content: ExtendedReadable): ExtendedReadable {
	return html/* HTML */ `<!DOCTYPE html>
		<html>
			<meta charset="utf-8" />
			${content}
		</html>`;
}

export function link(text: string | ExtendedReadable, href: string) {
	return html/* HTML */ `<a href="${href}">${text}</a>`;
}

const sanitizeAttribute = (value?: string) =>
	value ? value.replace(/"/g, "&quot;") : "";

export function attributes(attrs: Attributes = {}) {
	return map(Object.entries(attrs), async ([attr, value_promise]) => {
		let value = await value_promise;
		if (typeof value === "string") {
			value = sanitizeAttribute(value);
			// TODO: think of a way to replace also within streams
		}
		return value ? html`${attr}="${value}" ` : "";
	});
}

type Option = {
	name: string;
	value: string;
	attrs?: Attributes;
};

export function select(
	name: string,
	options: Promise<Option[]>,
	attrs: { [attribute: string]: string } = {},
	placeholder?: string
) {
	const ret = html/* HTML */ `<select
		id="${name}"
		name="${name}"
		${attributes(attrs)}
	>
		${placeholder
			? html/* HTML */ `<option value="" disabled selected hidden>
					${placeholder}
			  </option>`
			: ""}
		${options.then((options) =>
			map(
				options,
				(option) =>
					html/* HTML */ `<option
						value="${option.value}"
						${attributes(option.attrs)}
					>
						${option.name}
					</option>`
			)
		)}
	</select>`;
	ret.metadata.name = name;
	ret.metadata.id = name;
	return ret;
}

export function script(path: PathLike): ExtendedReadable {
	const file = fs.createReadStream(path);
	return html/* HTML */ `<script>
		${file};
	</script>`;
}

const DefaultInputOptions = {
	type: "text",
	required: true,
	placeholder: "text",
	value: null as string | null,
	attrs: {} as Attributes,
	style: "",
};

export function input(
	name: string,
	options: Partial<typeof DefaultInputOptions>
) {
	options = { ...DefaultInputOptions, ...options };
	const ret = html/* HTML */ `<input
		type="${options.type}"
		${options.required ? "required" : ""}
		placeholder="${options.placeholder}"
		name="${name}"
		id=${name}
		${attributes(options.attrs)}
		${options.value ? `value="${options.value}"` : ""}
	/>`;
	ret.metadata.id = name;
	ret.metadata.name = name;
	return ret;
}

type TextareaOptions = {
	id?: string;
	rows?: number;
	cols?: number;
	disabled?: boolean;
	placeholder?: string;
	value?: string;
};

export function textarea(
	name: string,
	options: TextareaOptions
): ExtendedReadable {
	const unrolled_options: Attributes = { ...options };
	const disabled = unrolled_options.disabled || false;
	delete unrolled_options.disabled;
	unrolled_options.name = name;
	if (!unrolled_options.id) {
		unrolled_options.id = name;
	}
	const value = unrolled_options.value || "";
	delete unrolled_options.value;
	const ret = html/* HTML */ `<textarea
		${attributes(unrolled_options)}
		${disabled ? "disabled" : ""}
	>
${value}</textarea
	>`;

	ret.metadata.id = unrolled_options.id as string;
	ret.metadata.name = unrolled_options.name;
	return ret;
}

export function checkbox(
	name: string,
	{ onChange }: { onChange?: string } = {}
): ExtendedReadable {
	return html/* HTML */ `<input
		type="checkbox"
		id="${name}"
		name=${name}
		onChange="${sanitizeAttribute(onChange)}"
	/>`;
}

export function checkboxWithLabel(name: string, label: string) {
	return html/* HTML */ `<label for="${name}"
		>${checkbox(name)} ${label}</label
	>`;
}

export function checkForMore(
	name: string,
	label: string,
	content: StringLike,
	{ onChange }: { onChange?: string } = {}
) {
	return html/* HTML */ `<style>
			.check-for-more__container {
				display: grid;
				grid-template-columns: 26px 1fr;
			}
			.check-for-more__container > input {
				grid-column: 1;
				grid-row: 1;
				margin: 5px 0;
			}
			.check-for-more__container > .check-for-more__content {
				grid-column: 1/3;
			}
			.check-for-more__container > label {
				grid-row: 1;
				margin: 5px 0 1px 0;
			}
			.check-for-more__content {
				display: none;
			}
			*:checked ~ .check-for-more__content {
				display: block;
			}
		</style>
		<div class="check-for-more__container">
			<label for="${name}">${label}</label> ${checkbox(name, {
				onChange,
			})}
			<script>
				${
					/*to run the handler in the case the browser pre-fills the checkbox on load*/ ""
				};
				window.addEventListener("load", function () {
					(function () {
						${onChange};
					}.apply(${name}));
				});
			</script>
			<section class="check-for-more__content">${content}</section>
		</div>`;
}

export async function cond(
	predicate: () => boolean | Promise<boolean>,
	content: StringLike
): Promise<StringLike> {
	const res = await predicate();
	if (res) {
		return content;
	} else {
		return "";
	}
}

export class Loader {
	id: string;
	private delay = 65;
	constructor(
		public color: string = "hsl(268, 40%, 42%)",
		public message: string = "Please wait..."
	) {
		this.id = "loader" + uuid().replace(/-/g, "_");
	}

	private box(index: number) {
		return /* HTML */ `<div
				class="loading-box"
				style="animation-delay: ${this.delay * index}ms"
			></div>
			<div class="loading-shadow"></div>`;
	}

	private style() {
		return /* HTML */ `<style>
			@keyframes jump {
				0% {
					transform: translateY(0);
				}
				7% {
					transform: scaleY(0.8) scaleX(1.2) translateY(2px);
				}
				10% {
					transform: scaleY(0.8) scaleX(1.2) translateY(2px);
				}
				19% {
					transform: scaleX(0.9) scaleY(1.1) translateY(-0.5rem);
				}
				37% {
					transform: translateY(-1rem);
				}
				55% {
					transform: scaleX(0.9) scaleY(1.1) translateY(-0.5rem);
				}
				70% {
					transform: scaleY(0.8) scaleX(1.2) translateY(2px);
				}
				100% {
					transform: translateY(0);
				}
			}
			@keyframes shadow-jump {
				0% {
					transform: scaleX(1);
				}
				7% {
					transform: scaleX(1.2);
				}
				10% {
					transform: scaleX(1.2);
				}
				19% {
					transform: scaleX(0.9);
				}
				37% {
					transform: scaleX(1);
				}
				55% {
					transform: scaleX(0.9);
				}
				70% {
					transform: scaleX(0.8);
				}
				100% {
					transform: scaleX(1);
				}
			}

			.loading-boxes {
				text-align: center;
				padding-top: 4rem;
			}

			.loading-box {
				width: 1rem;
				height: 1rem;
				background-color: ${this.color};
				display: inline-block;
				vertical-align: bottom;
				animation: jump 700ms;
				animation-iteration-count: infinite;
				z-index: 1;
				position: relative;
			}

			.loading-shadow {
				display: inline-block;
				margin-right: 1rem;
				width: 1rem;
				margin-left: -1rem;
				box-shadow: -4px 6px 2px 1px rgba(0, 0, 0, 0.16);
				/* animation: shadow-jump 700ms;
				animation-iteration-count: infinite;
				z-index: 0;
				position: relative;
                */
			}

			.loading-message {
				margin-top: 10px;
				text-align: center;
			}
		</style> `;
	}

	public start() {
		let ret = this.style();
		ret += `<div class="loading-container" id=${this.id}>`;
		ret += `<div class="loading-boxes" >`;
		for (let i = 1; i <= 4; i++) {
			ret += this.box(i);
		}
		ret += `</div>`;
		ret += `<div class="loading-message">${this.message}</div>`;
		ret += `</div>`;
		return ret;
	}

	public stop() {
		return /* HTML */ ` <style>
			#${this.id} {
				display: none;
			}
		</style>`;
	}
}

export function fileDrop(name: string, accept?: string[]) {
	return /* HTML */ ` <style>
			.file-drop {
				border: 2px dashed #aeacac;
				margin-top: 18px;
				position: relative;
				height: 90px;
				transition: border-color 200ms;
			}

			.file-drop:hover {
				border-color: #777;
			}

			.file-drop input,
			.file-drop label {
				position: absolute;
				height: 100%;
				width: 100%;
				top: 0;
			}

			.file-drop input {
				opacity: 0;
				cursor: pointer;
			}

			.file-drop--label::after {
				content: var(
					--filename,
					"Przeciągnij i upuść pliki tutaj lub, kliknij aby wybrać plik z dysku"
				);
				display: block;
				height: 100%;
				width: 100%;
				display: flex;
				flex-flow: row nowrap;
				align-items: center;
				justify-content: center;
			}
		</style>
		<div class="file-drop form-element">
			<label class="file-drop--label"> </label>
			<input
				type="${name}"
				name="${name}"
				${accept ? `accept="${accept.join(",")}"` : ""}
				required
				onchange="filename = this.value.split('\\\\').slice(-1)[0]; this.parentElement.style.setProperty('--filename', '\\'' + filename + '\\'')"
			/>
		</div>`;
}
