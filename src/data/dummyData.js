// Dummy data for development
export const users = [
  {
    id: 1,
    username: 'johndoe',
    displayName: 'John Doe',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Digital artist & creator 🎨 Sharing my journey',
    isVerified: true,
    followerCount: 15420,
    followingCount: 892,
    postCount: 234,
    isOnline: true,
    isPremium: true,
    user_type: 'creator',
    is_verified: true
  },
  {
    id: 2,
    username: 'sarahartist',
    displayName: 'Sarah Wilson',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Photographer | Travel enthusiast 📸 ✈️',
    isVerified: false,
    followerCount: 8340,
    followingCount: 456,
    postCount: 189,
    isOnline: false,
    isPremium: true,
    user_type: 'creator',
    is_verified: true
  },
  {
    id: 3,
    username: 'miketech',
    displayName: 'Mike Chen',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Tech reviewer & gadget enthusiast 💻',
    isVerified: true,
    followerCount: 23890,
    followingCount: 234,
    postCount: 567,
    isOnline: true,
    isPremium: false,
    user_type: 'fan',
    is_verified: false
  },
  {
    id: 4,
    username: 'fanuser',
    displayName: 'Fan User',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Just here to enjoy great content! 😊',
    isVerified: false,
    followerCount: 120,
    followingCount: 340,
    postCount: 0,
    isOnline: true,
    isPremium: false,
    user_type: 'fan',
    is_verified: false
  }
]

export const posts = [
  {
    id: 1,
    userId: 1,
    user: users[0],
    content: 'Just finished this amazing digital artwork! What do you think? 🎨',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=600',
        thumbnail: 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=300'
      }
    ],
    isPremium: false,
    price: null,
    likeCount: 342,
    commentCount: 28,
    shareCount: 15,
    isLiked: false,
    isSaved: false,
    createdAt: new Date('2024-01-15T10:30:00'),
    tags: ['art', 'digital', 'creative']
  },
  {
    id: 2,
    userId: 2,
    user: users[1],
    content: 'Exclusive behind-the-scenes content from my latest photoshoot! 📸',
    media: [
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=600',
        thumbnail: 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=300'
      },
      {
        type: 'image',
        url: 'https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=600',
        thumbnail: 'https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=300'
      }
    ],
    isPremium: true,
    price: 4.99,
    likeCount: 156,
    commentCount: 12,
    shareCount: 8,
    isLiked: true,
    isSaved: true,
    createdAt: new Date('2024-01-14T15:45:00'),
    tags: ['photography', 'behind-the-scenes', 'premium']
  }
]

export const stories = [
  {
    id: 1,
    userId: 1,
    user: users[0],
    media: {
      type: 'image',
      url: 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    isViewed: false,
    createdAt: new Date('2024-01-15T08:00:00')
  },
  {
    id: 2,
    userId: 2,
    user: users[1],
    media: {
      type: 'image',
      url: 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    isViewed: true,
    createdAt: new Date('2024-01-15T09:30:00')
  }
]

export const notifications = [
  {
    id: 1,
    type: 'like',
    fromUser: users[1],
    post: posts[0],
    isRead: false,
    createdAt: new Date('2024-01-15T14:30:00')
  },
  {
    id: 2,
    type: 'follow',
    fromUser: users[2],
    isRead: false,
    createdAt: new Date('2024-01-15T13:45:00')
  },
  {
    id: 3,
    type: 'comment',
    fromUser: users[1],
    post: posts[0],
    comment: 'Amazing work! Love the colors.',
    isRead: true,
    createdAt: new Date('2024-01-15T12:20:00')
  },
  {
    id: 4,
    type: 'purchase',
    fromUser: users[2],
    post: posts[1],
    amount: 4.99,
    isRead: true,
    createdAt: new Date('2024-01-14T16:00:00')
  }
]

export const messages = [
  {
    id: 1,
    participants: [users[0], users[1]],
    lastMessage: {
      id: 1,
      senderId: 2,
      content: 'Hey! Love your latest artwork 🎨',
      createdAt: new Date('2024-01-15T15:30:00'),
      isRead: false
    },
    unreadCount: 2
  },
  {
    id: 2,
    participants: [users[0], users[2]],
    lastMessage: {
      id: 2,
      senderId: 3,
      content: 'Thanks for the collaboration!',
      createdAt: new Date('2024-01-15T10:45:00'),
      isRead: true
    },
    unreadCount: 0
  }
]

export const conversation = [
  {
    id: 1,
    senderId: 2,
    content: 'Hey! Love your latest artwork 🎨',
    createdAt: new Date('2024-01-15T15:30:00'),
    isRead: false
  },
  {
    id: 2,
    senderId: 2,
    content: 'Would love to collaborate sometime!',
    createdAt: new Date('2024-01-15T15:31:00'),
    isRead: false
  },
  {
    id: 3,
    senderId: 1,
    content: 'Thank you so much! I\'d love to collaborate too',
    createdAt: new Date('2024-01-15T15:35:00'),
    isRead: true
  },
  {
    id: 4,
    senderId: 1,
    content: 'Let me know when you\'re free to chat about ideas',
    createdAt: new Date('2024-01-15T15:36:00'),
    isRead: true
  }
]

export const categories = [
  { id: 1, name: 'Art & Design', count: 1234, icon: '🎨' },
  { id: 2, name: 'Photography', count: 892, icon: '📸' },
  { id: 3, name: 'Technology', count: 567, icon: '💻' },
  { id: 4, name: 'Fashion', count: 445, icon: '👗' },
  { id: 5, name: 'Music', count: 334, icon: '🎵' },
  { id: 6, name: 'Fitness', count: 223, icon: '💪' }
]

export const trendingTags = [
  { tag: 'digitalart', count: 2345 },
  { tag: 'photography', count: 1890 },
  { tag: 'tech', count: 1567 },
  { tag: 'creative', count: 1234 },
  { tag: 'design', count: 1098 },
  { tag: 'art', count: 987 }
]