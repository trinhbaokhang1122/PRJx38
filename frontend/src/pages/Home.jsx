import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// ICONS
import { 
  FaShippingFast, FaShieldAlt, FaWallet, FaBoxOpen, 
  FaTruck, FaLock, FaUsers, FaSearch 
} from "react-icons/fa";

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [trackingCode, setTrackingCode] = useState("");

  const handleTrack = () => {
    if (!trackingCode.trim()) return alert("Vui lòng nhập mã đơn hàng");
    navigate(`/orders/${trackingCode}`);
  };

  const css = `
    :root {
      --primary: #0F4C75;
      --accent: #3282B8;
      --dark: #1B262C;
      --light: #BBE1FA;
      --white: #ffffff;
      --gray-bg: #F8F9FA;
    }

    * { box-sizing: border-box; }
    
    body, #root { 
      background: var(--white); 
      margin: 0; 
      font-family: 'Inter', 'Segoe UI', sans-serif; 
      color: var(--dark);
      line-height: 1.6;
    }

    /* ANIMATIONS */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate { opacity: 0; animation: fadeInUp 0.8s ease-out forwards; }
    .delay-1 { animation-delay: .1s; }
    .delay-2 { animation-delay: .2s; }
    .delay-3 { animation-delay: .3s; }

    /* HEADER SECTION */
    .hero-section {
      text-align: center;
      padding: 120px 20px 160px;
      background: linear-gradient(135deg, #0F4C75 0%, #1B262C 100%);
      color: var(--white);
      position: relative;
      clip-path: polygon(0 0, 100% 0, 100% 90%, 50% 100%, 0 90%);
    }

    .hero-title { 
      font-size: clamp(2rem, 5vw, 3.5rem); 
      font-weight: 800; 
      margin: 0 0 20px; 
      line-height: 1.1; 
      letter-spacing: -1px;
    }

    .hero-subtitle { 
      font-size: 1.2rem; 
      opacity: 0.9; 
      margin-bottom: 40px; 
      max-width: 600px; 
      margin-left: auto; 
      margin-right: auto; 
    }

    /* ĐỒNG BỘ 3 NÚT CÙNG MÀU XANH + VIỀN TRẮNG */
    .home-btns { 
      display: flex; 
      justify-content: center; 
      gap: 15px; 
      flex-wrap: wrap; 
    }

    .home-btn {
      min-width: 200px;
      height: 52px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      text-decoration: none;
      font-weight: 700;
      font-size: 1rem;
      border-radius: 8px;
      transition: all 0.3s ease;
      cursor: pointer;
      
      /* Đồng bộ style cho toàn bộ nút ở Banner */
      background: var(--accent);
      border: 2px solid rgba(255, 255, 255, 0.4); 
      color: var(--white);
    }

    .home-btn:hover {
      background: #2a6d9b; 
      border-color: var(--white); 
      transform: translateY(-3px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.2);
      color: var(--white);
    }

    /* Đảm bảo class primary không gây lệch màu */
    .home-btn-primary {
      background: var(--accent) !important;
    }

    /* SECTION HEADER */
    .section-header {
      text-align: center;
      margin-bottom: 60px;
      width: 100%;
    }

    .section-title {
      font-size: 2.2rem;
      font-weight: 800;
      position: relative;
      display: inline-block;
      margin: 0;
    }

    .section-title::after {
      content: '';
      position: absolute;
      bottom: -12px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 4px;
      background: var(--accent);
      border-radius: 2px;
    }

    /* FEATURES ROW */
    .features-row {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 30px;
      max-width: 1200px;
      margin: -80px auto 0;
      padding: 0 20px 80px;
      position: relative;
      z-index: 10;
    }

    .feature-card {
      flex: 1;
      min-width: 300px;
      max-width: 360px;
      background: var(--white);
      padding: 40px 30px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      transition: 0.3s;
    }

    .feature-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 15px 35px rgba(0,0,0,0.15);
    }

    .icon-box {
      font-size: 3rem;
      color: var(--accent);
      margin-bottom: 20px;
    }

    /* PROCESS SECTION */
    .process-section {
      padding: 100px 20px;
      background: var(--gray-bg);
    }

    .steps-grid {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 25px;
      max-width: 1100px;
      margin: 0 auto;
    }

    .step-card {
      flex: 1;
      min-width: 220px;
      background: var(--white);
      padding: 30px 20px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    }

    .step-num {
      width: 50px;
      height: 50px;
      background: var(--primary);
      color: var(--white);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      font-weight: 800;
      font-size: 1.2rem;
    }

    /* TRACKING BOX */
    .tracking-section {
      padding: 100px 20px;
    }

    .tracking-box {
      max-width: 600px;
      margin: 0 auto;
      padding: 45px;
      background: var(--white);
      border-radius: 20px;
      text-align: center;
      box-shadow: 0 20px 50px rgba(0,0,0,0.1);
      border: 1px solid #eee;
    }

    .tracking-input-wrapper {
      margin-top: 30px;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .track-input {
      width: 100%;
      padding: 18px 20px;
      border-radius: 10px;
      border: 2px solid #ddd;
      font-size: 1.1rem;
      outline: none;
      text-align: center;
    }

    .track-input:focus { border-color: var(--accent); }

    .track-btn {
      background: var(--primary);
      color: var(--white);
      border: none;
      padding: 18px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 1.1rem;
      cursor: pointer;
      transition: 0.3s;
    }

    .track-btn:hover { background: var(--accent); }

    /* FOOTER */
    .footer {
      background: #111B21;
      color: #94A3B8;
      padding: 80px 20px 40px;
    }

    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 40px;
    }

    .footer-title { color: #fff; font-weight: 800; font-size: 1.3rem; margin-bottom: 20px; }
    .footer-links { list-style: none; padding: 0; }
    .footer-links li { margin-bottom: 12px; }
    .footer-links a { color: #94A3B8; text-decoration: none; transition: 0.2s; }
    .footer-links a:hover { color: #fff; padding-left: 5px; }

    @media (max-width: 768px) {
      .hero-section { padding: 80px 20px 100px; }
      .home-btn { width: 100%; }
      .features-row { margin-top: 0; }
    }
  `;

  return (
    <div className="main-container">
      <style>{css}</style>

      {/* HERO / HEADER SECTION */}
      <section className="hero-section">
        <div className="animate">
          <h1 className="hero-title">Dịch vụ vận chuyển nhà toàn quốc</h1>
          <p className="hero-subtitle">Giải pháp vận tải nhanh chóng, an toàn và tối ưu chi phí cho mọi gia đình Việt.</p>

          <div className="home-btns">
            <Link className="home-btn" to="/orders">Xem đơn hàng</Link>
            <Link className="home-btn home-btn-primary" to="/create-order">
              <FaTruck /> Tạo đơn hàng
            </Link>
            <Link className="home-btn" to="/create-team">
              <FaUsers /> Tạo đội vận chuyển
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES ROW */}
      <div className="features-row">
        <div className="feature-card animate delay-1">
          <FaShippingFast className="icon-box" />
          <h3>Nhanh chóng</h3>
          <p>Cam kết giao hàng hỏa tốc trong vòng 24–48 giờ trên toàn quốc.</p>
        </div>
        <div className="feature-card animate delay-2">
          <FaShieldAlt className="icon-box" />
          <h3>An toàn</h3>
          <p>Hàng hóa được đóng gói cẩn thận và bảo hiểm 100% giá trị.</p>
        </div>
        <div className="feature-card animate delay-3">
          <FaWallet className="icon-box" />
          <h3>Tiết kiệm</h3>
          <p>Bảng giá công khai, cạnh tranh, tuyệt đối không phát sinh phí ẩn.</p>
        </div>
      </div>

      {/* PROCESS SECTION */}
      <section className="process-section">
        <div className="section-header animate">
          <h2 className="section-title">Quy trình dịch vụ</h2>
        </div>
        <div className="steps-grid">
          {[
            { n: 1, t: "Tạo đơn hàng" },
            { n: 2, t: "Đóng gói hàng" },
            { n: 3, t: "Vận chuyển" },
            { n: 4, t: "Giao tận tay" }
          ].map((s, i) => (
            <div key={i} className={`step-card animate delay-${i}`}>
              <div className="step-num">{s.n}</div>
              <div style={{ fontWeight: 700 }}>{s.t}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TRACKING BOX */}
      <section className="tracking-section animate">
        <div className="tracking-box">
          <FaSearch style={{fontSize: '2rem', color: 'var(--accent)'}} />
          <h2 className="tracking-title">Tra cứu đơn hàng</h2>
          <p>Theo dõi hành trình đơn hàng của bạn theo thời gian thực</p>
          <div className="tracking-input-wrapper">
            <input
              className="track-input"
              placeholder="Nhập mã vận đơn (VD: DH123...)"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
            />
            <button className="track-btn" onClick={handleTrack}>Tra cứu hành trình</button>
          </div>
        </div>
      </section>

      {/* EXTRA SERVICES */}
      <section className="process-section" style={{background: '#fff'}}>
        <div className="section-header animate">
          <h2 className="section-title">Dịch vụ mở rộng</h2>
        </div>
        <div className="steps-grid">
          <div className="step-card animate delay-1">
            <FaBoxOpen className="icon-box" style={{fontSize: '2rem'}} />
            <div style={{fontWeight: 700}}>Đóng gói chuyên nghiệp</div>
          </div>
          <div className="step-card animate delay-2">
            <FaLock className="icon-box" style={{fontSize: '2rem'}} />
            <div style={{fontWeight: 700}}>Bảo hiểm giá trị cao</div>
          </div>
          <div className="step-card animate delay-3">
            <FaTruck className="icon-box" style={{fontSize: '2rem'}} />
            <div style={{fontWeight: 700}}>Vận chuyển hàng đặc thù</div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-container">
          <div>
            <div className="footer-title">zkayexe Logistics</div>
            <p>Vận chuyển bằng cái tâm, nâng tầm dịch vụ. Chúng tôi tự hào là đơn vị vận chuyển nhà hàng đầu Việt Nam.</p>
            <p>Hotline: 0866.925.975</p>
          </div>
          <div>
            <div className="footer-title">Liên kết nhanh</div>
            <ul className="footer-links">
              <li><Link to="/">Trang chủ</Link></li>
              <li><Link to="/about">Về chúng tôi</Link></li>
              <li><Link to="/services">Dịch vụ</Link></li>
              <li><Link to="/contact">Hỗ trợ khách hàng</Link></li>
            </ul>
          </div>
          <div>
            <div className="footer-title">Văn phòng</div>
            <p>Vịnh Hạ Long, Quảng Ninh, Việt Nam</p>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d119175.14371987515!2d107.0305888!3d20.9413632!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314a513511111111%3A0x1111111111111111!2zSOG6oSBMb25nLCBRdeG6o25nIE5pbmgsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1700000000000" 
              style={{width: '100%', height: '150px', borderRadius: '8px', border: 'none', marginTop: '10px'}}
              title="map"
            ></iframe>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;