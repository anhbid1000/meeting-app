
// FakeDAO để giả lập việc lấy thông tin user từ database
export class UserDAO {
  async findById(id: string) {
    // Mock data: giả lập user tồn tại
    return {
      _id: id,
      name: 'Duy Binh',
      email: 'duybinh@uit.edu.vn',
      plan: 'pro' // hoặc 'standard'
    };
  }
}