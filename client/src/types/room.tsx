export interface Room {
    _id: string;
    name: string;
    password?: string;
    members: {
        userId: string;
        role: "admin" | "member";
        joinedAt: string;
    }[];
    screensharePermission: "Admin Only" | "Everyone";
    createdAt: string;
}
