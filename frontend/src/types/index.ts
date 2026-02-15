export interface Zone {
  id: string;
  name: string;
  nameAmharic: string;
  nameSiltigna: string;
  description: string;
  descriptionAmharic: string;
  descriptionSiltigna: string;
  coordinator?: string;
  population?: number;
  area?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface MembershipPlan {
  id: string;
  name: string;
  nameAmharic: string;
  nameSiltigna: string;
  description: string;
  descriptionAmharic: string;
  descriptionSiltigna: string;
  fee: number;
  duration: number;
  benefits: string[];
  benefitsAmharic: string[];
  benefitsSiltigna: string[];
  order: number;
}

export interface Event {
  id: string;
  title: string;
  titleAmharic?: string;
  titleSiltigna?: string;
  description: string;
  descriptionAmharic?: string;
  descriptionSiltigna?: string;
  startDate: Date;
  endDate: Date;
  location: string;
  zone?: string;
  image?: string;
  isFeatured: boolean;
}

export interface News {
  id: string;
  title: string;
  titleAmharic?: string;
  titleSiltigna?: string;
  content: string;
  contentAmharic?: string;
  contentSiltigna?: string;
  category: 'culture' | 'development' | 'education' | 'diaspora' | 'general';
  image?: string;
  author: string;
  createdAt: Date;
  views: number;
}