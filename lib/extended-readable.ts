import { Readable } from "stream";

export default class ExtendedReadable extends Readable {
	public metadata: { [field: string]: any } = {};
	constructor(...args: ConstructorParameters<typeof Readable>) {
		super(...args);
	}
}
