import { Readable } from "stream";

export default class ExtendedReadable extends Readable {
	public metadata = {};
	constructor(...args: ConstructorParameters<typeof Readable>) {
		super(...args);
	}
}
