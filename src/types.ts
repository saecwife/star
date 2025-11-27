export interface PoseSuggestion {
  id: string;
  title: string;
  description: string;
  tips: string[];
  angle: string;
  props: { name: string; checked: boolean }[]; // 新增道具物件陣列
  imageUrl?: string;
  isImageLoading: boolean;
  imageError?: boolean;
}

export interface PoseResponse {
  environmentDescription: string;
  modelDescription?: string;
  poses: {
    title: string;
    description: string;
    tips: string[];
    angle: string;
    props: string[]; // API 回傳的原始字串陣列
  }[];
}