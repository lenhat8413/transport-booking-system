const DEMO_PASSWORD = '123456';

const AIRLINES = [
  { name: 'Vietnam Airlines', iata_code: 'VN', logo_url: 'public/uploads/logo-1774634055537-326573428.jpg' },
  { name: 'VietJet Air', iata_code: 'VJ', logo_url: 'public/uploads/logo-1774634085600-121929155.jpg' },
  { name: 'Bamboo Airways', iata_code: 'QH', logo_url: 'public/uploads/logo-1774634105747-647973408.jpg' },
];

const AIRPORTS = [
  { iata_code: 'HAN', name: 'Noi Bai International Airport', city: 'Ha Noi', country: 'Vietnam' },
  { iata_code: 'SGN', name: 'Tan Son Nhat International Airport', city: 'TP. Ho Chi Minh', country: 'Vietnam' },
  { iata_code: 'DAD', name: 'Da Nang International Airport', city: 'Da Nang', country: 'Vietnam' },
  { iata_code: 'CXR', name: 'Cam Ranh International Airport', city: 'Khanh Hoa', country: 'Vietnam' },
  { iata_code: 'PQC', name: 'Phu Quoc International Airport', city: 'Phu Quoc', country: 'Vietnam' },
  { iata_code: 'HPH', name: 'Cat Bi International Airport', city: 'Hai Phong', country: 'Vietnam' },
  { iata_code: 'VCA', name: 'Can Tho International Airport', city: 'Can Tho', country: 'Vietnam' },
  { iata_code: 'HUI', name: 'Phu Bai International Airport', city: 'Hue', country: 'Vietnam' },
  { iata_code: 'THD', name: 'Tho Xuan Airport', city: 'Thanh Hoa', country: 'Vietnam' },
  { iata_code: 'DLI', name: 'Lien Khuong Airport', city: 'Da Lat', country: 'Vietnam' },
  { iata_code: 'BMV', name: 'Buon Ma Thuot Airport', city: 'Dak Lak', country: 'Vietnam' },
  { iata_code: 'UIH', name: 'Phu Cat Airport', city: 'Quy Nhon', country: 'Vietnam' },
  { iata_code: 'VCL', name: 'Chu Lai Airport', city: 'Quang Nam', country: 'Vietnam' },
];

const FLIGHT_ROUTE_TEMPLATES = [
  { from: 'HAN', to: 'SGN', duration_minutes: 130, economy: 1680000, business: 3690000, departure_hour: 6, departure_minute: 0 },
  { from: 'SGN', to: 'HAN', duration_minutes: 135, economy: 1720000, business: 3720000, departure_hour: 20, departure_minute: 15 },
  { from: 'HAN', to: 'DAD', duration_minutes: 85, economy: 1180000, business: 2450000, departure_hour: 7, departure_minute: 15 },
  { from: 'DAD', to: 'HAN', duration_minutes: 90, economy: 1210000, business: 2490000, departure_hour: 18, departure_minute: 10 },
  { from: 'SGN', to: 'DAD', duration_minutes: 95, economy: 1230000, business: 2520000, departure_hour: 6, departure_minute: 35 },
  { from: 'DAD', to: 'SGN', duration_minutes: 100, economy: 1260000, business: 2560000, departure_hour: 20, departure_minute: 45 },
  { from: 'HAN', to: 'CXR', duration_minutes: 110, economy: 1480000, business: 3050000, departure_hour: 8, departure_minute: 20 },
  { from: 'CXR', to: 'HAN', duration_minutes: 115, economy: 1510000, business: 3090000, departure_hour: 16, departure_minute: 0 },
  { from: 'SGN', to: 'PQC', duration_minutes: 65, economy: 980000, business: 2150000, departure_hour: 9, departure_minute: 10 },
  { from: 'PQC', to: 'SGN', duration_minutes: 70, economy: 1010000, business: 2190000, departure_hour: 17, departure_minute: 30 },
  { from: 'HAN', to: 'HPH', duration_minutes: 40, economy: 780000, business: 1720000, departure_hour: 11, departure_minute: 5 },
  { from: 'HPH', to: 'HAN', duration_minutes: 40, economy: 790000, business: 1730000, departure_hour: 14, departure_minute: 20 },
  { from: 'SGN', to: 'VCA', duration_minutes: 55, economy: 920000, business: 2020000, departure_hour: 6, departure_minute: 50 },
  { from: 'VCA', to: 'SGN', duration_minutes: 55, economy: 930000, business: 2030000, departure_hour: 19, departure_minute: 10 },
  { from: 'HAN', to: 'HUI', duration_minutes: 70, economy: 960000, business: 2050000, departure_hour: 10, departure_minute: 40 },
  { from: 'HUI', to: 'HAN', duration_minutes: 75, economy: 990000, business: 2090000, departure_hour: 15, departure_minute: 45 },
  { from: 'HAN', to: 'THD', duration_minutes: 55, economy: 860000, business: 1890000, departure_hour: 12, departure_minute: 15 },
  { from: 'THD', to: 'HAN', duration_minutes: 55, economy: 870000, business: 1900000, departure_hour: 13, departure_minute: 50 },
  { from: 'SGN', to: 'BMV', duration_minutes: 60, economy: 950000, business: 2080000, departure_hour: 7, departure_minute: 55 },
  { from: 'BMV', to: 'SGN', duration_minutes: 60, economy: 960000, business: 2090000, departure_hour: 18, departure_minute: 15 },
  { from: 'DAD', to: 'UIH', duration_minutes: 55, economy: 900000, business: 1940000, departure_hour: 8, departure_minute: 50 },
  { from: 'UIH', to: 'DAD', duration_minutes: 55, economy: 910000, business: 1950000, departure_hour: 16, departure_minute: 40 },
  { from: 'SGN', to: 'VCL', duration_minutes: 85, economy: 1150000, business: 2390000, departure_hour: 11, departure_minute: 35 },
  { from: 'VCL', to: 'SGN', duration_minutes: 85, economy: 1160000, business: 2400000, departure_hour: 15, departure_minute: 20 },
  { from: 'HAN', to: 'DLI', duration_minutes: 105, economy: 1360000, business: 2890000, departure_hour: 9, departure_minute: 25 },
  { from: 'DLI', to: 'HAN', duration_minutes: 110, economy: 1390000, business: 2930000, departure_hour: 14, departure_minute: 10 },
];

const FLIGHT_BATCHES = [
  { month: 6, day_start: 5, hour_offset: 0 },
  { month: 7, day_start: 8, hour_offset: 1 },
];

const TRAIN_STATIONS = [
  { name: 'Ga Ha Noi', city: 'Ha Noi' },
  { name: 'Ga Vinh', city: 'Nghe An' },
  { name: 'Ga Dong Hoi', city: 'Quang Binh' },
  { name: 'Ga Hue', city: 'Thua Thien Hue' },
  { name: 'Ga Da Nang', city: 'Da Nang' },
  { name: 'Ga Tam Ky', city: 'Quang Nam' },
  { name: 'Ga Quang Ngai', city: 'Quang Ngai' },
  { name: 'Ga Dieu Tri', city: 'Binh Dinh' },
  { name: 'Ga Tuy Hoa', city: 'Phu Yen' },
  { name: 'Ga Nha Trang', city: 'Khanh Hoa' },
  { name: 'Ga Thap Cham', city: 'Ninh Thuan' },
  { name: 'Ga Bien Hoa', city: 'Dong Nai' },
  { name: 'Ga Sai Gon', city: 'TP. Ho Chi Minh' },
];

const TRAIN_TRIP_TEMPLATES = [
  { train_number: 'SE1', name: 'Tau Thong Nhat SE1', from: 'Ga Ha Noi', to: 'Ga Sai Gon', departure: [2026, 6, 6, 20, 55], duration_minutes: 1945, economy: 1250000, business: 1980000 },
  { train_number: 'SE2', name: 'Tau Thong Nhat SE2', from: 'Ga Sai Gon', to: 'Ga Ha Noi', departure: [2026, 6, 7, 19, 30], duration_minutes: 2020, economy: 1260000, business: 1990000 },
  { train_number: 'SE3', name: 'Tau Thong Nhat SE3', from: 'Ga Ha Noi', to: 'Ga Da Nang', departure: [2026, 6, 9, 22, 0], duration_minutes: 995, economy: 780000, business: 1320000 },
  { train_number: 'SE4', name: 'Tau Thong Nhat SE4', from: 'Ga Da Nang', to: 'Ga Ha Noi', departure: [2026, 6, 10, 13, 15], duration_minutes: 1000, economy: 790000, business: 1330000 },
  { train_number: 'SE5', name: 'Tau Thong Nhat SE5', from: 'Ga Ha Noi', to: 'Ga Nha Trang', departure: [2026, 6, 12, 21, 30], duration_minutes: 1250, economy: 960000, business: 1580000 },
  { train_number: 'SE6', name: 'Tau Thong Nhat SE6', from: 'Ga Nha Trang', to: 'Ga Ha Noi', departure: [2026, 6, 14, 20, 10], duration_minutes: 1250, economy: 970000, business: 1590000 },
  { train_number: 'SE7', name: 'Tau Thong Nhat SE7', from: 'Ga Sai Gon', to: 'Ga Da Nang', departure: [2026, 6, 16, 6, 0], duration_minutes: 975, economy: 860000, business: 1440000 },
  { train_number: 'SE8', name: 'Tau Thong Nhat SE8', from: 'Ga Da Nang', to: 'Ga Sai Gon', departure: [2026, 6, 17, 7, 10], duration_minutes: 975, economy: 870000, business: 1450000 },
  { train_number: 'SNT1', name: 'Tau Sai Gon - Nha Trang SNT1', from: 'Ga Sai Gon', to: 'Ga Nha Trang', departure: [2026, 7, 2, 21, 0], duration_minutes: 525, economy: 560000, business: 960000 },
  { train_number: 'SNT2', name: 'Tau Nha Trang - Sai Gon SNT2', from: 'Ga Nha Trang', to: 'Ga Sai Gon', departure: [2026, 7, 3, 20, 40], duration_minutes: 525, economy: 570000, business: 970000 },
  { train_number: 'NA1', name: 'Tau Ha Noi - Vinh NA1', from: 'Ga Ha Noi', to: 'Ga Vinh', departure: [2026, 7, 6, 22, 15], duration_minutes: 355, economy: 430000, business: 760000 },
  { train_number: 'NA2', name: 'Tau Vinh - Ha Noi NA2', from: 'Ga Vinh', to: 'Ga Ha Noi', departure: [2026, 7, 7, 21, 45], duration_minutes: 355, economy: 440000, business: 770000 },
  { train_number: 'DN1', name: 'Tau Da Nang - Quang Ngai DN1', from: 'Ga Da Nang', to: 'Ga Quang Ngai', departure: [2026, 7, 10, 8, 0], duration_minutes: 140, economy: 250000, business: 430000 },
  { train_number: 'DN2', name: 'Tau Quang Ngai - Da Nang DN2', from: 'Ga Quang Ngai', to: 'Ga Da Nang', departure: [2026, 7, 10, 16, 15], duration_minutes: 140, economy: 250000, business: 430000 },
  { train_number: 'QB1', name: 'Tau Hue - Dong Hoi QB1', from: 'Ga Hue', to: 'Ga Dong Hoi', departure: [2026, 7, 12, 7, 25], duration_minutes: 190, economy: 280000, business: 460000 },
  { train_number: 'QB2', name: 'Tau Dong Hoi - Hue QB2', from: 'Ga Dong Hoi', to: 'Ga Hue', departure: [2026, 7, 12, 15, 10], duration_minutes: 190, economy: 280000, business: 460000 },
];

const USER_TEMPLATES = [
  {
    full_name: 'Admin He Thong',
    email: 'admin@traveladmin.vn',
    phone: '0900000001',
    gender: 'Nam',
    role: 'ADMIN',
    status: 'ACTIVE',
    nationality: { code: 'VN', name: 'Vietnam' },
    id_card: '079000000001',
    address: {
      country_code: 'VN',
      country_name: 'Vietnam',
      city: 'Ha Noi',
      district: 'Ba Dinh',
      address_detail: '12 Pho Truc Bach',
      full_address: '12 Pho Truc Bach, Ba Dinh, Ha Noi, Vietnam',
    },
    preferences: {
      notifications: { contact_email: 'admin@traveladmin.vn', contact_phone: '0900000001' },
      terms: { agree_terms: true, agree_privacy: true, agree_data: true },
    },
    created_at: vnDate(2026, 3, 1, 8, 0),
    updated_at: vnDate(2026, 4, 10, 8, 0),
  },
  {
    full_name: 'Le Ha Anh',
    email: 'le.haanh@demo.vn',
    phone: '0901234567',
    gender: 'Nữ',
    role: 'USER',
    status: 'ACTIVE',
    nationality: { code: 'VN', name: 'Vietnam' },
    id_card: '079123456701',
    address: {
      country_code: 'VN',
      country_name: 'Vietnam',
      city: 'TP. Ho Chi Minh',
      district: 'Quan 3',
      address_detail: '88 Nguyen Dinh Chieu',
      full_address: '88 Nguyen Dinh Chieu, Quan 3, TP. Ho Chi Minh, Vietnam',
    },
    preferences: {
      notifications: { contact_email: 'le.haanh@demo.vn', contact_phone: '0901234567' },
      settings: { seat_preference: 'aisle' },
      terms: { agree_terms: true, agree_privacy: true, agree_data: true },
    },
    created_at: vnDate(2026, 3, 15, 9, 0),
    updated_at: vnDate(2026, 4, 10, 9, 0),
  },
  {
    full_name: 'Tran Linh Chi',
    email: 'tran.linhchi@demo.vn',
    phone: '0912345678',
    gender: 'Nữ',
    role: 'USER',
    status: 'ACTIVE',
    nationality: { code: 'VN', name: 'Vietnam' },
    id_card: '079234567802',
    address: {
      country_code: 'VN',
      country_name: 'Vietnam',
      city: 'Da Nang',
      district: 'Hai Chau',
      address_detail: '45 Bach Dang',
      full_address: '45 Bach Dang, Hai Chau, Da Nang, Vietnam',
    },
    preferences: {
      notifications: { contact_email: 'tran.linhchi@demo.vn', contact_phone: '0912345678' },
      terms: { agree_terms: true, agree_privacy: true, agree_data: true },
    },
    created_at: vnDate(2026, 3, 22, 10, 30),
    updated_at: vnDate(2026, 4, 9, 10, 30),
  },
  {
    full_name: 'Pham Khang Minh',
    email: 'pham.khangminh@demo.vn',
    phone: '0923456789',
    gender: 'Nam',
    role: 'USER',
    status: 'ACTIVE',
    nationality: { code: 'VN', name: 'Vietnam' },
    id_card: '079345678903',
    address: {
      country_code: 'VN',
      country_name: 'Vietnam',
      city: 'Can Tho',
      district: 'Ninh Kieu',
      address_detail: '120 Hoa Binh',
      full_address: '120 Hoa Binh, Ninh Kieu, Can Tho, Vietnam',
    },
    preferences: {
      notifications: { contact_email: 'pham.khangminh@demo.vn', contact_phone: '0923456789' },
      terms: { agree_terms: true, agree_privacy: true, agree_data: true },
    },
    created_at: vnDate(2026, 4, 5, 14, 0),
    updated_at: vnDate(2026, 4, 11, 14, 0),
  },
  {
    full_name: 'Doan Ngoc Tram',
    email: 'doan.ngoctram@demo.vn',
    phone: '0934567890',
    gender: 'Nữ',
    role: 'USER',
    status: 'BLOCKED',
    nationality: { code: 'VN', name: 'Vietnam' },
    id_card: '079456789004',
    address: {
      country_code: 'VN',
      country_name: 'Vietnam',
      city: 'Hai Phong',
      district: 'Ngo Quyen',
      address_detail: '15 Le Hong Phong',
      full_address: '15 Le Hong Phong, Ngo Quyen, Hai Phong, Vietnam',
    },
    preferences: {
      notifications: { contact_email: 'doan.ngoctram@demo.vn', contact_phone: '0934567890' },
      terms: { agree_terms: true, agree_privacy: true, agree_data: true },
    },
    created_at: vnDate(2026, 4, 7, 11, 15),
    updated_at: vnDate(2026, 4, 7, 11, 15),
  },
];

const PAYMENT_METHOD_TEMPLATES = [
  { email: 'le.haanh@demo.vn', card_type: 'Visa', bank_name: 'Vietcombank', card_holder: 'LE HA ANH', last4: '2345', expiry: '08/28', is_default: true },
  { email: 'le.haanh@demo.vn', card_type: 'Mastercard', bank_name: 'Techcombank', card_holder: 'LE HA ANH', last4: '7788', expiry: '02/29', is_default: false },
  { email: 'tran.linhchi@demo.vn', card_type: 'JCB', bank_name: 'ACB', card_holder: 'TRAN LINH CHI', last4: '1024', expiry: '11/27', is_default: true },
  { email: 'pham.khangminh@demo.vn', card_type: 'Visa', bank_name: 'MB Bank', card_holder: 'PHAM KHANG MINH', last4: '5566', expiry: '05/30', is_default: true },
];

const VOUCHER_TEMPLATES = [
  { code: 'HEVANG200', discount_type: 'FIXED', discount_value: 200000, min_order_value: 1500000, max_discount: 200000, usage_limit: 200, used_count: 12, expiry_date: vnDate(2026, 12, 31, 23, 59), is_active: true },
  { code: 'BAYHE15', discount_type: 'PERCENTAGE', discount_value: 15, min_order_value: 2000000, max_discount: 350000, usage_limit: 150, used_count: 27, expiry_date: vnDate(2026, 8, 31, 23, 59), is_active: true },
  { code: 'TAUVIET10', discount_type: 'PERCENTAGE', discount_value: 10, min_order_value: 800000, max_discount: 180000, usage_limit: 120, used_count: 9, expiry_date: vnDate(2026, 11, 30, 23, 59), is_active: true },
  { code: 'WELCOME50K', discount_type: 'FIXED', discount_value: 50000, min_order_value: 500000, max_discount: 50000, usage_limit: 500, used_count: 44, expiry_date: vnDate(2026, 12, 31, 23, 59), is_active: true },
  { code: 'FLASHSALEAPR', discount_type: 'FIXED', discount_value: 100000, min_order_value: 300000, max_discount: 100000, usage_limit: 50, used_count: 50, expiry_date: vnDate(2026, 4, 5, 23, 59), is_active: false },
];

function pad(value) {
  return String(value).padStart(2, '0');
}

function vnDate(year, month, day, hour = 0, minute = 0) {
  return new Date(`${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00+07:00`);
}

function buildBookingContact({ full_name, email, phone, id_card }) {
  return {
    full_name: full_name || '',
    email: email || '',
    phone: phone || '',
    id_card: id_card || '',
  };
}

module.exports = {
  AIRLINES,
  AIRPORTS,
  BOOKING_CONTACT_FACTORY: buildBookingContact,
  DEMO_PASSWORD,
  FLIGHT_BATCHES,
  FLIGHT_ROUTE_TEMPLATES,
  PAYMENT_METHOD_TEMPLATES,
  TRAIN_STATIONS,
  TRAIN_TRIP_TEMPLATES,
  USER_TEMPLATES,
  VOUCHER_TEMPLATES,
  vnDate,
};
