export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4">Meeting App</h1>
        <p className="text-xl mb-8">Họp trực tuyến chuyên nghiệp</p>
        <a
          href="/login"
          className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-100"
        >
          Bắt đầu ngay
        </a>
      </div>
    </div>
  );
}
