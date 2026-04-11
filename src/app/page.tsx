import './globals.css';

export default function LandingPage() {
  return (
    <div className="main-container">
      <div className="hero-section">
        <div className="bot-card">
          <div className="status-indicator">
            <span className="status-dot"></span>
            Trực tuyến 24/7
          </div>
          <h1>Trợ lý cá nhân của Tín Nguyễn</h1>
          <p className="description">
            Hệ thống trợ lý thông minh tích hợp quản lý tài chính, nhắc việc, 
            biên bản họp và tra cứu lịch âm dương chuyên nghiệp.
          </p>
          <a 
            href="https://t.me/Trolycanhan1bot" 
            target="_blank" 
            rel="noopener noreferrer"
            className="cta-button"
          >
            Trò chuyện với tôi trên Telegram
          </a>
        </div>
      </div>
    </div>
  );
}
