export interface User {
    isLogged?: boolean;
    profile?: { [key: string] : unknown },
    tokens?: { [key: string]: string }
}