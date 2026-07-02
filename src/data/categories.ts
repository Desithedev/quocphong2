export interface Category {
  name: string;
  startId: number;
  endId: number;
  description: string;
}

export const CATEGORIES: Category[] = [
  { 
    name: 'Chương 1: Đối tượng, phương pháp nghiên cứu GDQP&AN', 
    startId: 1, 
    endId: 10, 
    description: 'Ý nghĩa, phương pháp luận nghiên cứu môn học GDQP&AN đối với sinh viên sau khi ra trường' 
  },
  { 
    name: 'Chương 2: Tư tưởng Hồ Chí Minh & Học thuyết Mác-Lênin về Quân sự', 
    startId: 11, 
    endId: 20, 
    description: 'Lực lượng nòng cốt, bản chất quân đội, nguyên tắc xây dựng và ba chức năng cơ bản của Quân đội nhân dân Việt Nam' 
  },
  { 
    name: 'Chương 3: Nền quốc phòng toàn dân & an ninh nhân dân', 
    startId: 21, 
    endId: 40, 
    description: 'Thế trận, tiềm lực chính trị - tinh thần, kinh tế, khoa học công nghệ, quân sự và an ninh' 
  },
  { 
    name: 'Chương 4: Chiến tranh nhân dân bảo vệ Tổ quốc', 
    startId: 41, 
    endId: 50, 
    description: 'Thế trận, lực lượng, quan điểm cơ bản và các mặt trận chính trong chiến tranh nhân dân' 
  },
  { 
    name: 'Chương 5: Xây dựng lực lượng vũ trang nhân dân', 
    startId: 51, 
    endId: 60, 
    description: 'Quan điểm, nguyên tắc cơ bản, vai trò lãnh đạo tuyệt đối trực tiếp của Đảng đối với lực lượng vũ trang' 
  },
  { 
    name: 'Chương 6: Kết hợp phát triển KT-XH với QP-AN', 
    startId: 61, 
    endId: 70, 
    description: 'Nội dung, giải pháp kết hợp phát triển kinh tế với củng cố quốc phòng, an ninh và đối ngoại' 
  },
  { 
    name: 'Chương 7: Nghệ thuật quân sự Việt Nam', 
    startId: 71, 
    endId: 80, 
    description: 'Truyền thống đánh giặc của tổ tiên, chiến lược quân sự, chiến dịch, chiến thuật và ba mũi giáp công' 
  },
  {
    name: 'Bài 8: Bảo vệ chủ quyền lãnh thổ, biên giới và biển đảo',
    startId: 81,
    endId: 90,
    description: 'Lực lượng nòng cốt, quyền tài phán, vùng nội thủy và quan điểm bảo vệ chủ quyền biển, đảo'
  },
  {
    name: 'Bài 9: Lực lượng dân quân tự vệ & Dự bị động viên',
    startId: 91,
    endId: 100,
    description: 'Xây dựng dân quân tự vệ, lực lượng dự bị động viên, quân nhân dự bị và động viên quốc phòng'
  },
  {
    name: 'Bài 10: Phong trào toàn dân bảo vệ an ninh Tổ quốc',
    startId: 101,
    endId: 105,
    description: 'Vị trí chiến lược, đặc điểm, nội dung xây dựng và các cuộc vận động quần chúng bảo vệ Tổ quốc'
  },
  {
    name: 'Bài 11: Bảo vệ an ninh quốc gia & Trật tự an toàn xã hội',
    startId: 106,
    endId: 110,
    description: 'Giữ gìn trật tự công cộng, phòng chống tội phạm, quan điểm chỉ đạo và trách nhiệm sinh viên'
  },
  {
    name: 'Bài 6 (QP2): An toàn thông tin mạng & An ninh không gian mạng',
    startId: 111,
    endId: 120,
    description: 'Đặc điểm an toàn thông tin, phòng chống vi phạm pháp luật trên không gian mạng và trách nhiệm của sinh viên'
  },
  {
    name: 'Bài 7 (QP2): An ninh phi truyền thống',
    startId: 121,
    endId: 140,
    description: 'Tác động của an ninh phi truyền thống đến các lĩnh vực kinh tế, chính trị, văn hóa xã hội, đối ngoại và quốc phòng an ninh'
  },
  {
    name: 'CĐ 1 (QP2): Phòng, chống "Diễn biến hòa bình" & Bạo loạn lật đổ',
    startId: 141,
    endId: 160,
    description: 'Thủ đoạn, âm mưu chống phá cách mạng Việt Nam và phương châm, nguyên tắc, giải pháp xử lý bạo loạn'
  },
  {
    name: 'CĐ 2 (QP2): Phòng, chống địch lợi dụng vấn đề dân tộc, tôn giáo',
    startId: 161,
    endId: 180,
    description: 'Chính sách dân tộc, tôn giáo của Đảng và Nhà nước, đặc điểm tôn giáo Việt Nam và bài trừ mê tín dị đoan'
  },
  {
    name: 'CĐ 3 (QP2): Phòng, chống vi phạm pháp luật về bảo vệ môi trường',
    startId: 181,
    endId: 190,
    description: 'Thực trạng, nguyên nhân vi phạm pháp luật môi trường, biến đổi khí hậu và trách nhiệm của sinh viên'
  },
  {
    name: 'CĐ 4 (QP2): Bảo đảm trật tự an toàn giao thông',
    startId: 191,
    endId: 200,
    description: 'Khái niệm, giải pháp bảo đảm trật tự an toàn giao thông và trách nhiệm công dân của người học'
  },
  {
    name: 'CĐ 5 (QP2): Phòng, chống tội phạm xâm hại danh dự, nhân phẩm',
    startId: 201,
    endId: 210,
    description: 'Cơ sở pháp lý, hành vi xâm hại uy tín danh dự và các biện pháp nâng cao nhận thức, đạo đức'
  }
];

export function getCategoryForQuestionId(id: number): Category | undefined {
  return CATEGORIES.find(c => id >= c.startId && id <= c.endId);
}
