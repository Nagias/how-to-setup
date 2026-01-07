// Sample data cleared by user request
export const sampleSetups = [];
export const sampleBlogs = [];

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
