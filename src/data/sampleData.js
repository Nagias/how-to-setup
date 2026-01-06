// Sample data với filter tiếng Việt
export const sampleSetups = [
    {
        id: 1,
        title: "Góc Làm Việc Tối Giản",
        caption: "Đường nét sạch sẽ và ánh sáng tự nhiên cho công việc tập trung",
        mainImage: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800",
        images: [
            {
                url: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800",
                products: [
                    { x: 50, y: 30, name: "MacBook Pro 16\"", link: "#", price: "60.000.000đ" },
                    { x: 70, y: 60, name: "Magic Keyboard", link: "#", price: "2.500.000đ" }
                ]
            },
            {
                url: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800",
                products: [
                    { x: 40, y: 50, name: "Đèn Bàn", link: "#", price: "2.000.000đ" }
                ]
            }
        ],
        filters: {
            colorTone: "neutral",
            budget: "premium",
            gender: "neutral",
            purpose: "productivity",
            size: "medium"
        },
        likes: [],
        comments: 0,
        saves: [],
        tags: ["tối-giản", "trắng", "ánh-sáng-tự-nhiên", "năng-suất"],
        thumbnailVideo: "https://videos.pexels.com/video-files/3209663/3209663-hd_1920_1080_25fps.mp4",
        author: {
            name: "Sarah Chen",
            avatar: "https://i.pravatar.cc/150?img=1"
        },
        createdAt: "2026-01-01T10:00:00Z"
    },
    {
        id: 2,
        title: "Trạm Gaming Cyberpunk",
        caption: "RGB tràn ngập cho trải nghiệm gaming tối thượng",
        mainImage: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800",
        images: [
            {
                url: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800",
                products: [
                    { x: 50, y: 40, name: "Màn Hình Gaming 34\"", link: "#", price: "22.000.000đ" },
                    { x: 30, y: 70, name: "Bàn Phím RGB", link: "#", price: "4.000.000đ" }
                ]
            }
        ],
        filters: {
            colorTone: "cool",
            budget: "premium",
            gender: "masculine",
            purpose: "gaming",
            size: "large"
        },
        likes: [],
        comments: 0,
        saves: [],
        tags: ["gaming", "rgb", "tối", "cyberpunk"],
        thumbnailVideo: "https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_30fps.mp4",
        author: {
            name: "Alex Rivera",
            avatar: "https://i.pravatar.cc/150?img=2"
        },
        createdAt: "2026-01-02T14:30:00Z"
    },
    {
        id: 3,
        title: "Góc Sáng Tạo Ấm Cúng",
        caption: "Tông màu ấm và cây xanh cho cảm hứng sáng tạo",
        mainImage: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800",
        images: [
            {
                url: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800",
                products: [
                    { x: 60, y: 50, name: "Bàn Gỗ", link: "#", price: "8.500.000đ" },
                    { x: 80, y: 30, name: "Cây Cảnh", link: "#", price: "600.000đ" }
                ]
            }
        ],
        filters: {
            colorTone: "warm",
            budget: "mid-range",
            gender: "feminine",
            purpose: "creative",
            size: "small"
        },
        likes: [],
        comments: 0,
        saves: [],
        tags: ["ấm-cúng", "cây-xanh", "gỗ", "sáng-tạo"],
        author: {
            name: "Emma Thompson",
            avatar: "https://i.pravatar.cc/150?img=3"
        },
        createdAt: "2026-01-03T09:15:00Z"
    },
    {
        id: 4,
        title: "Văn Phòng Tại Nhà Hiện Đại",
        caption: "Setup chuyên nghiệp cho làm việc từ xa xuất sắc",
        mainImage: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800",
        images: [
            {
                url: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800",
                products: [
                    { x: 50, y: 50, name: "Ghế Ergonomic", link: "#", price: "15.000.000đ" },
                    { x: 40, y: 30, name: "Giá Đỡ Màn Hình", link: "#", price: "3.200.000đ" }
                ]
            }
        ],
        filters: {
            colorTone: "neutral",
            budget: "premium",
            gender: "neutral",
            purpose: "work-from-home",
            size: "medium"
        },
        likes: [],
        comments: 0,
        saves: [],
        tags: ["chuyên-nghiệp", "ergonomic", "hiện-đại", "văn-phòng"],
        author: {
            name: "Michael Park",
            avatar: "https://i.pravatar.cc/150?img=4"
        },
        createdAt: "2026-01-04T11:45:00Z"
    },
    {
        id: 5,
        title: "Setup Tiết Kiệm Cho Người Mới",
        caption: "Giá cả phải chăng nhưng không thiếu phong cách",
        mainImage: "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=800",
        images: [
            {
                url: "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=800",
                products: [
                    { x: 50, y: 40, name: "Màn Hình Giá Rẻ", link: "#", price: "5.000.000đ" },
                    { x: 60, y: 70, name: "Bàn Phím Cơ Bản", link: "#", price: "700.000đ" }
                ]
            }
        ],
        filters: {
            colorTone: "neutral",
            budget: "budget",
            gender: "neutral",
            purpose: "productivity",
            size: "small"
        },
        likes: [],
        comments: 0,
        saves: [],
        tags: ["tiết-kiệm", "người-mới", "đơn-giản", "phải-chăng"],
        author: {
            name: "Jordan Lee",
            avatar: "https://i.pravatar.cc/150?img=5"
        },
        createdAt: "2026-01-05T08:20:00Z"
    },
    {
        id: 6,
        title: "Sức Mạnh Hai Màn Hình",
        caption: "Năng suất tối đa với setup hai màn hình",
        mainImage: "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800",
        images: [
            {
                url: "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800",
                products: [
                    { x: 40, y: 40, name: "Màn Hình 27\" (Trái)", link: "#", price: "10.000.000đ" },
                    { x: 60, y: 40, name: "Màn Hình 27\" (Phải)", link: "#", price: "10.000.000đ" }
                ]
            }
        ],
        filters: {
            colorTone: "cool",
            budget: "mid-range",
            gender: "neutral",
            purpose: "productivity",
            size: "large"
        },
        likes: [],
        comments: 0,
        saves: [],
        tags: ["hai-màn-hình", "năng-suất", "chuyên-nghiệp", "công-nghệ"],
        author: {
            name: "Chris Anderson",
            avatar: "https://i.pravatar.cc/150?img=6"
        },
        createdAt: "2026-01-05T15:30:00Z"
    }
];

// Sample blogs
export const sampleBlogs = [
    {
        id: 1,
        title: "10 Mẹo Thiết Yếu Cho Setup Bàn Làm Việc Đầu Tiên",
        slug: "10-meo-thiet-yeu-setup-ban-lam-viec",
        excerpt: "Bắt đầu hành trình setup bàn làm việc? Đây là những mẹo cần biết để tạo không gian làm việc hiệu quả và phong cách.",
        coverImage: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=1200",
        content: `
      <h2>Giới Thiệu</h2>
      <p>Tạo setup bàn làm việc đầu tiên có thể khiến bạn choáng ngợp. Với quá nhiều lựa chọn và phong cách, bạn nên bắt đầu từ đâu? Hướng dẫn này sẽ đưa bạn qua những cân nhắc thiết yếu.</p>
      
      <h3>1. Bắt Đầu Với Ergonomics</h3>
      <p>Sức khỏe của bạn là ưu tiên hàng đầu. Đầu tư vào một chiếc ghế tốt và đảm bảo màn hình ở tầm mắt. Cổ tay của bạn nên thẳng khi gõ phím.</p>
      
      <h3>2. Ánh Sáng Quan Trọng</h3>
      <p>Ánh sáng tự nhiên là lý tưởng, nhưng một chiếc đèn bàn tốt là thiết yếu cho làm việc buổi tối. Cân nhắc đèn LED ánh sáng ấm để giảm mỏi mắt.</p>
      
      <h3>3. Quản Lý Dây Cáp</h3>
      <p>Không gì phá hỏng một setup đẹp bằng dây cáp rối. Sử dụng kẹp dây, ống quấn hoặc khay quản lý dây dưới bàn.</p>
    `,
        author: {
            name: "Admin",
            avatar: "https://i.pravatar.cc/150?img=10"
        },
        category: "Hướng Dẫn",
        tags: ["người-mới", "mẹo", "ergonomics"],
        readTime: 8,
        publishedAt: "2026-01-01T10:00:00Z",
        views: 3421
    },
    {
        id: 2,
        title: "Tâm Lý Học Màu Sắc Trong Không Gian Làm Việc",
        slug: "tam-ly-hoc-mau-sac-khong-gian-lam-viec",
        excerpt: "Khám phá cách các màu sắc khác nhau có thể ảnh hưởng đến tâm trạng, năng suất và sáng tạo trong không gian làm việc của bạn.",
        coverImage: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1200",
        content: `
      <h2>Màu Sắc Ảnh Hưởng Công Việc Như Thế Nào</h2>
      <p>Màu sắc trong không gian làm việc có tác động sâu sắc đến trạng thái tinh thần và năng suất của bạn.</p>
      
      <h3>Xanh Dương: Tập Trung và Bình Tĩnh</h3>
      <p>Tông màu xanh dương thúc đẩy sự tập trung và giảm căng thẳng. Hoàn hảo cho công việc phân tích.</p>
      
      <h3>Tông Màu Ấm: Sáng Tạo</h3>
      <p>Cam và vàng kích thích sáng tạo và năng lượng. Tuyệt vời cho các chuyên gia sáng tạo.</p>
    `,
        author: {
            name: "Admin",
            avatar: "https://i.pravatar.cc/150?img=10"
        },
        category: "Thiết Kế",
        tags: ["màu-sắc", "tâm-lý", "thiết-kế"],
        readTime: 6,
        publishedAt: "2026-01-03T14:00:00Z",
        views: 2156
    }
];

// Filter options - TIẾNG VIỆT
export const filterOptions = {
    colorTone: [
        { value: "warm", label: "Tông Màu Ấm", description: "Gỗ, be, ánh sáng dịu" },
        { value: "cool", label: "Tông Màu Lạnh", description: "Trắng, xám, ánh sáng xanh" },
        { value: "neutral", label: "Trung Tính / Tối Giản", description: "Sạch sẽ và đơn giản" }
    ],
    budget: [
        { value: "budget", label: "Tiết Kiệm", description: "Dưới 10 triệu" },
        { value: "mid-range", label: "Tầm Trung", description: "10 - 50 triệu" },
        { value: "premium", label: "Cao Cấp", description: "Trên 50 triệu" }
    ],
    gender: [
        { value: "masculine", label: "Nam Tính", description: "Mạnh mẽ và cá tính" },
        { value: "feminine", label: "Nữ Tính", description: "Nhẹ nhàng và thanh lịch" },
        { value: "neutral", label: "Trung Tính", description: "Phù hợp mọi người" }
    ],
    purpose: [
        { value: "work-from-home", label: "Làm Việc Tại Nhà", description: "Làm việc từ xa chuyên nghiệp" },
        { value: "gaming", label: "Gaming", description: "Chơi game và giải trí" },
        { value: "creative", label: "Sáng Tạo / Thiết Kế", description: "Công việc sáng tạo" },
        { value: "productivity", label: "Năng Suất", description: "Hiệu quả tối đa" }
    ],
    size: [
        { value: "small", label: "Không Gian Nhỏ", description: "Setup nhỏ gọn" },
        { value: "medium", label: "Trung Bình", description: "Kích thước bàn tiêu chuẩn" },
        { value: "large", label: "Lớn / Studio", description: "Setup rộng rãi" }
    ]
};

// Initialize data
export const initializeData = () => {
    // Initialize admin account
    const users = JSON.parse(localStorage.getItem('deskhub_users') || '[]');
    if (!users.find(u => u.role === 'admin')) {
        const adminUser = {
            id: 'admin_001',
            username: 'admin',
            password: 'admin123',
            displayName: 'Admin',
            avatar: 'https://i.pravatar.cc/150?img=10',
            role: 'admin',
            createdAt: new Date().toISOString()
        };
        users.push(adminUser);
        localStorage.setItem('deskhub_users', JSON.stringify(users));
    }

    // Initialize setups
    if (!localStorage.getItem('deskhub_setups')) {
        localStorage.setItem('deskhub_setups', JSON.stringify(sampleSetups));
    }

    // Initialize blogs
    if (!localStorage.getItem('deskhub_blogs')) {
        localStorage.setItem('deskhub_blogs', JSON.stringify(sampleBlogs));
    }

    // Initialize user collections
    if (!localStorage.getItem('deskhub_collections')) {
        localStorage.setItem('deskhub_collections', JSON.stringify({}));
    }

    // Initialize newsletter subscribers
    if (!localStorage.getItem('deskhub_newsletter')) {
        localStorage.setItem('deskhub_newsletter', JSON.stringify([]));
    }
};
