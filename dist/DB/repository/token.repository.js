"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenRepository = void 0;
const database_repository_js_1 = require("./database.repository.js");
class TokenRepository extends database_repository_js_1.DatabaseRepository {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
}
exports.TokenRepository = TokenRepository;
