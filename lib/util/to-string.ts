export default function toString(val: any) {
	if (Array.isArray(val)) {
		return val.join("");
	} else if (val == null) {
		return "";
	}
	return val.toString();
}
