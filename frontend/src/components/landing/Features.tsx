import { MaterialSymbol } from "../ui/MaterialSymbol";

export function Features() {
  return (
    <section className="py-24 px-6 bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-on-surface mb-4">
            Mọi thứ bạn cần cho một cuộc họp hiệu quả
          </h2>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            Các tính năng được thiết kế để giúp bạn tận dụng tối đa thời gian họp, từ video chất lượng cao đến tóm tắt thông minh và cộng tác thời gian thực. Tất cả những gì bạn cần để làm việc hiệu quả, ngay trong một nền tảng duy nhất.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
          {/* Feature 1: Video Meetings (Large) */}
          <div className="md:col-span-2 md:row-span-2 bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/50 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-fixed rounded-full blur-[80px] -mr-32 -mt-32 opacity-50 group-hover:opacity-70 transition-opacity"></div>
            <div className="w-12 h-12 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center mb-4 z-10 shadow-sm">
              <MaterialSymbol icon="video_camera_front" filled className="text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-on-surface mb-2 z-10">
              Meeting Video Chất Lượng Cao
            </h3>
            <p className="text-on-surface-variant max-w-2xl z-10 mb-8">
              Trải nghiệm họp video mượt mà với âm thanh rõ ràng, video HD và khả năng thích ứng thông minh để đảm bảo kết nối ổn định ngay cả trong điều kiện mạng yếu.
            </p>
            <div className="mt-auto z-10 rounded-lg overflow-hidden border border-outline-variant/30 h-48 bg-surface-container">
              <img
                alt="Video meeting interface preview"
                className="w-full h-full object-cover opacity-90"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuABXTAV9FBIxjSdAc4xkwi5xnHIkoqjz5YYzBek5eCfqUgLGwNH9E6IeaqxSxBVxK5bs2PSZur1RfVx6QpfZlXrFaXpMIV6A4P2JioP5j8JCFsyoyRreLFHkHs9Dxi_y7D72RoqSLYY-115FJkN7eNrgTf0Bq0-yXroXlunkVE0RxfPzKrxj9IiptPAhNxfliKN_hpi3Vk052uBaNgrof3drYRTocBdGUANjKotL6KIAtfxtfzM8neW4mc8iO2G8Gd-rfHXbaqYKXzb"
              />
            </div>
          </div>

          {/* Feature 2: AI Summaries */}
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/50 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center mb-4">
              <MaterialSymbol icon="auto_awesome" filled />
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">Tóm Tắt AI</h3>
            <p className="text-sm text-on-surface-variant flex-grow">
              Tự động ghi lại các mục hành động, quyết định quan trọng và tóm tắt ngắn gọn để bạn có thể tập trung vào cuộc trò chuyện, không cần ghi chú.
            </p>
          </div>

          {/* Feature 3: Realtime Chat */}
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/50 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-surface-variant text-on-surface-variant flex items-center justify-center mb-4">
              <MaterialSymbol icon="chat" filled />
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">Realtime Chat</h3>
            <p className="text-sm text-on-surface-variant flex-grow">
              Giao tiếp liền mạch với đồng nghiệp trong cuộc họp thông qua trò chuyện tích hợp, hoàn hảo để chia sẻ liên kết, tài liệu hoặc bình luận mà không làm gián đoạn luồng cuộc họp.
            </p>
          </div>

          {/* Feature 4: Whiteboard */}
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/50 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center mb-4">
              <MaterialSymbol icon="draw" filled />
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">Whiteboard tương tác</h3>
            <p className="text-sm text-on-surface-variant flex-grow">
              Cộng tác trực quan với bảng trắng kỹ thuật số tích hợp, hoàn hảo cho việc động não, lập kế hoạch và giải thích ý tưởng trong thời gian thực.
            </p>
          </div>

          {/* Feature 5: Screen Sharing */}
          <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/50 shadow-sm hover:shadow-md transition-shadow flex items-center gap-6">
            <div className="flex-1">
              <div className="w-10 h-10 rounded-lg bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center mb-4">
                <MaterialSymbol icon="present_to_all" filled />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">Chia sẻ màn hình liền mạch</h3>
              <p className="text-sm text-on-surface-variant">
                Chia sẻ toàn bộ màn hình, cửa sổ ứng dụng cụ thể hoặc tab trình duyệt mà không có độ trễ. Ghi chú trực tiếp lên nội dung đã chia sẻ để có những bài thuyết trình rõ ràng hơn.
              </p>
            </div>
            <div className="hidden sm:block w-48 h-32 bg-surface-container rounded-lg border border-outline-variant/30 flex-shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-surface-variant to-surface flex items-center justify-center">
                <MaterialSymbol icon="monitor" className="text-outline-variant text-5xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}