import { UserDAO } from '../dao/UserDAO';

const userDAO = new UserDAO();

export const findUsersByKeyword = async (keyword: string) => {
  return userDAO.findByKeyword(keyword);
};
