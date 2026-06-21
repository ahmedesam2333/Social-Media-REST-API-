"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const database_repository_js_1 = require("./database.repository.js");
const error_response_js_1 = require("../../utils/response/error.response.js");
class UserRepository extends database_repository_js_1.DatabaseRepository {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
    async createUser({ data, options, }) {
        const [user] = (await this.model.create(data, options)) || [];
        if (!user)
            throw new error_response_js_1.BadRequestException("Fail to Signup User");
        return user;
    }
}
exports.UserRepository = UserRepository;
