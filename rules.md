# Code Rules

## 1. Quy tắc chung
- Code phải dễ đọc, dễ hiểu, ưu tiên khả năng bảo trì lâu dài
- Không viết code theo cảm tính, không “chạy được là xong”
- Không để code chết (unused code, commented code lâu dài)
- Không `console.log` / debug trong code production

## 2. Design Pattern & Maintainability
- Code **bắt buộc** áp dụng design pattern phù hợp để dễ mở rộng và bảo trì
- Tuân thủ các nguyên tắc **SOLID**
- Tách rõ các tầng:
  - UI
  - Business Logic
  - Data / API

- Không trộn logic nghiệp vụ vào UI / component
- Ưu tiên **composition hơn inheritance**
- Tránh tight coupling giữa các module

- Các pattern khuyến khích sử dụng:
  - Clean Architecture / Layered Architecture
  - Service Pattern
  - Repository Pattern
  - Factory Pattern
  - Observer / Pub-Sub (event, state)
  - Singleton (chỉ dùng khi thật sự cần)

## 3. Object-Oriented Programming (OOP)
- Code phải được tổ chức theo **hướng đối tượng khi phù hợp**
- Mỗi class / object chỉ có **một trách nhiệm duy nhất** (SRP)
- Áp dụng các nguyên tắc OOP:
  - Encapsulation
  - Abstraction
  - Inheritance (hạn chế)
  - Polymorphism

- Logic phức tạp phải được đóng gói trong:
  - Service
  - Manager
  - Domain Object

- Code OOP phải:
  - Dễ test
  - Dễ mở rộng
  - Không phụ thuộc chặt vào implementation cụ thể

## 4. Frontend Consistency & Page Linking
- Các trang frontend **phải liên kết logic và UI thống nhất**, không được rời rạc
- Không tạo trang hoạt động độc lập nếu không nằm trong flow chung
- Routing phải rõ ràng, xuyên suốt toàn bộ hệ thống

- Bắt buộc tái sử dụng:
  - Layout chung
  - Component chung (Button, Form, Modal, Table…)
- Không copy UI giữa các trang

- State dùng chung phải được quản lý tập trung
  - Context / Redux / Zustand / Pinia (tùy stack)
- Tránh truyền props lòng vòng nhiều tầng

## 5. Theme & UI Rules
- Không code UI theo hứng cá nhân
- Mọi giao diện phải tuân theo **theme / design system chung**
- Không hardcode:
  - Màu sắc
  - Font
  - Spacing
  - Kích thước

- Theme phải được cấu hình tập trung (config / token)
- Thay đổi theme chỉ sửa ở **một nơi duy nhất**

## 6. Environment & API Address
- **Tuyệt đối không hardcode `localhost`** trong code frontend
- Mọi API endpoint phải lấy từ:
  - Biến môi trường
  - File config chung

- Không commit file `.env`
- Code phải chạy được trên nhiều môi trường **không cần sửa source**

## 7. Quy tắc đặt tên
- Biến, hàm: `camelCase`
- Component / Class: `PascalCase`
- Hằng số: `UPPER_SNAKE_CASE`
- Tên phải có ý nghĩa, không dùng tên mơ hồ

## 8. Function & Logic
- Hàm chỉ làm **một việc duy nhất**
- Tránh hàm quá dài
- Tránh lồng `if-else` quá sâu
- Tách logic phức tạp thành hàm / class nhỏ

## 9. Comment
- Comment để **giải thích lý do**, không giải thích code hiển nhiên
- Không để comment sai hoặc lỗi thời
- Xóa comment không còn giá trị

## 10. Error Handling
- Luôn xử lý lỗi rõ ràng
- Không bỏ qua lỗi một cách im lặng
- Thông báo lỗi phải dễ debug

## 11. Những điều cấm ❌
- Hardcode `localhost`, API URL, token
- Copy code mà không hiểu
- Viết code rải rác, không theo kiến trúc
- Sửa code người khác mà không thông báo
