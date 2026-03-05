export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Booking {
  id: number;
  [key: string]: any;
}

export interface Ticket {
  id: number;
  name: string;
  price: number;
  quantity: number;
  [key: string]: any;
}

export interface Activity {
  id: number;
  activityName: string;
  description: string;
  experienceId: number | null;
  activityCost: number;
  activityStartDateTime: string;
  geom: {
    crs: {
      type: string;
      properties: {
        name: string;
      };
    };
    type: string;
    coordinates: [number, number];
  };
  color: any;
  activityFor: string;
  address: string | null;
  activityEndDateTime: string;
  instagramUrl: string | null;
  twitterUrl: string | null;
  facebookUrl: string | null;
  googleUrl: string | null;
  streamLink: string;
  activitySequenceNumber: any;
  activityLocation: string;
  isOnline: boolean;
  isDisabled: boolean;
  isLocationVisible: boolean;
  controlBy: string;
  vendorId: any;
  age: number;
  creatorId: number;
  settingId: number;
  reportCount: number;
  ageGroups: string;
  promo: string;
  includes: string;
  meta: any;
  isDeleted: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  isAdmin?: boolean;
  activityPicture?: {
    media: string;
    mediaType: string;
  } | null;
}

export interface Experience {
  id: number;
  title: string;
  description: string;
  likeCount: number;
  commentCount: number;
  reportCount: number;
  experienceOwnerId: number;
  experienceCost: number;
  experienceFor: string;
  controlBy: string;

  freeExpCost: number;
  isOnline: boolean;
  isLocationVisible: boolean;
  geom: {
    crs: {
      type: string;
      properties: {
        name: string;
      };
    };
    type: string;
    coordinates: [number, number];
  };
  address: string;
  isProtected: boolean;
  password: string | null;
  location: string | null;
  color: Record<string, string>;
  eventMap: any;
  instagramUrl: string | null;
  twitterUrl: string | null;
  facebookUrl: string | null;
  googleUrl: string | null;
  streamLink: string;
  settingId: number;
  experienceStartDateTime: string;
  experienceEndDateTime: string;
  meta: any;
  isPined: boolean;
  isDisabled: boolean;
  isDeleted: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  expPicture: {
    media: string;
    mediaType: string;
    mediaFor: string;
  } | null;
  userDetail: {
    id: number;
    userName: string;
    firstName: string;
    lastName: string | null;
    middleName: string | null;
    profilePicture: {
      media: string | null;
      mediaType: string;
      mediaFor: string;
    } | null;
  };
  inviteDetails: Array<{
    id: number;
    invitationStatus: string;
    InviteUserDetails: {
      id: number;
      userName: string;
      profilePicture: {
        media: string | null;
      } | null;
    } | null;
  }>;
  setting: {
    id: number;
    settingType: string;
    experienceView: string;
    experienceJoin: string;
    activityView: string;
    activityJoin: string;
    meta: any;
    showNotification: any;
    isDeleted: boolean;
    createdBy: string;
    updatedBy: string;
    postView: string;
    collaborators: string;
    settingFor: any;
    parentId: any;
    createdAt: string;
    updatedAt: string;
  };
  isPurchased: boolean;
  isAdmin: boolean;
  isLikedByMe: boolean;
  tickets?: Ticket[];
  activities?: Activity[];
}
