class UserProfileDto {
    private _id: number;

    constructor(id: number) {
        this._id = id;
    }

    get id(): number {
        return this._id;
    }

    set id(id: number) {
        this._id = id;
    }
}

export default UserProfileDto; 