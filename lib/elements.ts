import { PathLike } from "fs";
import { html } from ".";
import ExtendedReadable from "./extended-readable";
import { map } from "./map";
import * as fs from "fs";

export type Attributes = {
	[attribute: string]: string | Promise<string>;
};

export function refresh(timeout: number = 0) {
	return html/* HTML */ ` <meta http-equiv="refresh" content="${timeout}" />`;
}

export function redirect(url: string) {
	return html/* HTML */ `<meta
		http-equiv="Refresh"
		content="0; url='${url}'"
	/>`;
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

export function attributes(attrs: Attributes = {}) {
	return map(
		Object.entries(attrs),
		async ([attr, value]) =>
			html`${attr}="${(await value).replace(/"/g, "&quot;")}"`
	);
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
