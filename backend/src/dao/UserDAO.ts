import User, { IUser } from '../models/User.model';
import { BaseDAO } from './BaseDAO';

export class UserDAO extends BaseDAO<IUser> {
  constructor() {
    super(User);
  }

  async findByKeyword(keyword: string) {
    return this.model.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
      ],
    }).select("name email avatar role").lean();
  }
}