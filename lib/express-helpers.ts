import { Response } from "express";

export function streamResponse(
	stream: ExtendedReadable,
	res: Response,
	type = "text/html; charset=utf-8"
) {
	res.setHeader("Content-Type", type);
	res.setHeader("Transfer-Encoding", "chunked");
	stream.on("data", (data: any) => res.write(data));
	stream.on("end", () => res.end());
}
