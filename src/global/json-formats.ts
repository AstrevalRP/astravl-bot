export interface RoleMessageObject {
	roleMessage : {
		id: string;
		roles: Object
	}
};
// From : https://www.geeksforgeeks.org/how-to-convert-map-to-json-in-typescript/
export function mapToObj(map: Map<any, any>): { [key: string]: any } {
    const obj: { [key: string]: any } = {};
    map.forEach((value, key) => {
        obj[key] = value;
    });
    return obj;
}
export function objToMap(jsonObj: Object): Map<string, any> {
    return new Map<string, any>(Object.entries(jsonObj));
}