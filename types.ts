export interface PoseSuggestion {
  id: string;
  title: string;
  description: string;
  tips: string[];
  angle: string;
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
  }[];
}