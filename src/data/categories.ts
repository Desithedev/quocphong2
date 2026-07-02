export interface Category {
  name: string;
  startId: number;
  endId: number;
  description: string;
}

export const CATEGORIES: Category[] = [
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
