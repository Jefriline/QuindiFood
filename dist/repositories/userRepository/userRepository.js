"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class UserRepository {
    static add(ru) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = 'INSERT INTO user (name, email, password) VALUES (?, ?, ?)';
            //
        });
    }
}
exports.default = UserRepository;
// Este lo pongo por si sirve:
//import { UserDto } from '../Dto/UserDto';
// import { getRepository } from 'typeorm';
// export class UserRepository {
//     private userRepository = getRepository(UserDto);
//     async findByEmail(email: string): Promise<UserDto | undefined> {
//         return this.userRepository.findOne({ where: { email } });
//     }
//     async findById(id: number): Promise<UserDto | undefined> {
//         return this.userRepository.findOne(id);
//     }
//     async save(user: UserDto): Promise<UserDto> {
//         return this.userRepository.save(user);
//     }
//     async update(id: number, user: Partial<UserDto>): Promise<UserDto> {
//         await this.userRepository.update(id, user);
//         return this.userRepository.findOne(id);
//     }
// }
