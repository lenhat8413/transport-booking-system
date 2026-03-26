'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  Train, Clock, Briefcase, ShieldCheck, ChevronLeft, 
  Info, Users, Ticket, CheckCircle2, AlertCircle, Loader2, ArrowRight 
} from 'lucide-react';

export default function TrainTripDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('economy');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/train-trips/${id}`);
        if (response.data.success) {
          setTrip(response.data.data);
          // Tự động chọn hạng ghế đầu tiên có sẵn trong DB
          if (response.data.data.prices) {
            const availableClasses = Object.keys(response.data.data.prices);
            if (availableClasses.length > 0) setSelectedClass(availableClasses[0]);
          }
        }
      } catch (err) {
        console.error("Lỗi lấy chi tiết tàu:", err);
      } finally { setLoading(false); }
    };
    fetchDetail();
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <Loader2 className="animate-spin text-orange-600" size={48} />
    </div>
  );

  if (!trip) return <div className="text-center py-20 font-bold">Không tìm thấy thông tin chuyến tàu này.</div>;

  const currentPrice = trip.prices?.[selectedClass] || 0;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Breadcrumb - Giống Figma */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium">
          <span className="hover:text-orange-600 cursor-pointer" onClick={() => router.push('/search?type=train')}>Search Results</span>
          <span>→</span>
          <span className="text-gray-800 font-bold">Trip detail</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* --- CỘT TRÁI: CHI TIẾT CHUYẾN TÀU --- */}
          <div className="lg:col-span-2 space-y-6 bg-white rounded-xl shadow-sm border border-orange-200 p-8">
            <h1 className="text-3xl font-black text-gray-800 mb-2">Trip details</h1>
            <p className="text-gray-500 font-medium mb-8">
              Route: {trip.departure_station_id?.name} → {trip.arrival_station_id?.name} • Date: {new Date(trip.departure_time).toLocaleDateString('vi-VN')}
            </p>

            {/* 1. Tóm tắt chuyến tàu (Dashed Box) */}
            <div className="border-2 border-dashed border-orange-100 rounded-xl p-6 relative">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center font-black text-orange-600 border border-orange-100 italic text-xl">
                     <Train size={24} />
                   </div>
                   <div>
                     <div className="font-black text-gray-800">{trip.train_id?.name || 'Đường Sắt Việt Nam'}</div>
                     <div className="text-xs text-gray-500 font-bold">Mã tàu: {trip.train_id?.train_number} • {selectedClass.toUpperCase()}</div>
                   </div>
                </div>

                <div className="flex items-center gap-12">
                   <div className="text-center">
                      <div className="text-2xl font-black text-gray-800">{new Date(trip.departure_time).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">{trip.departure_station_id?.name}</div>
                   </div>
                   <div className="flex flex-col items-center">
                      <div className="w-20 border-t-2 border-dashed border-orange-200"></div>
                      <span className="text-[10px] font-bold text-orange-400 mt-1 uppercase tracking-tighter">Hành trình</span>
                   </div>
                   <div className="text-center">
                      <div className="text-2xl font-black text-gray-800">{new Date(trip.arrival_time).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">{trip.arrival_station_id?.name}</div>
                   </div>
                </div>
              </div>
            </div>

            {/* 2. Thông tin hãng (Grid) */}
            <div className="pt-4">
               <h3 className="font-black text-orange-800 bg-orange-50 w-fit px-2 py-1 rounded text-sm mb-4">Thông tin tàu</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div className="border border-orange-100 rounded-xl p-4">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Đơn vị vận hành</p>
                    <p className="font-bold text-gray-800">{trip.train_id?.name || 'Đường Sắt VN'}</p>
                  </div>
                  <div className="border border-orange-100 rounded-xl p-4">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Số hiệu chuyến</p>
                    <p className="font-bold text-gray-800">{trip.train_id?.train_number}</p>
                  </div>
                  <div className="border border-orange-100 rounded-xl p-4">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Loại tàu</p>
                    <p className="font-bold text-gray-800">Tàu khách SE</p>
                  </div>
                  <div className="border border-orange-100 rounded-xl p-4 bg-orange-50/30">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Hạng vé đang chọn</p>
                    <p className="font-bold text-orange-600 capitalize">{selectedClass}</p>
                  </div>
               </div>
            </div>

            {/* 3. Chính sách hành lý */}
            <div className="pt-4">
               <h3 className="font-black text-orange-800 bg-orange-50 w-fit px-2 py-1 rounded text-sm mb-4">Quy định hành lý & Di chuyển</h3>
               <ul className="space-y-2 text-sm text-gray-600 font-medium">
                  <li className="flex items-start gap-2">• Hành lý xách tay: Tối đa 20kg/người.</li>
                  <li className="flex items-start gap-2">• Có mặt tại ga ít nhất 30 phút trước giờ tàu chạy.</li>
                  <li className="flex items-start gap-2">• Xuất trình CCCD hoặc Passport khi lên tàu.</li>
                  <li className="flex items-start gap-2">• Đổi/huỷ: Theo quy định hiện hành của ngành đường sắt.</li>
               </ul>
            </div>

            {/* 4. Chọn Hạng ghế (LOGIC FILTER Ở ĐÂY) */}
            <div className="pt-4">
               <h3 className="font-black text-orange-800 bg-orange-50 w-fit px-2 py-1 rounded text-sm mb-4">Hạng ghế có sẵn</h3>
               <div className="space-y-3">
                  {[
                    { id: 'economy', name: 'Ghế ngồi cứng/mềm', desc: 'Điều hòa • Giá tiết kiệm' },
                    { id: 'premium', name: 'Giường nằm Khoang 6', desc: 'Thoải mái • Có gối mền' },
                    { id: 'business', name: 'Giường nằm Khoang 4', desc: 'Cao cấp • Không gian riêng' }
                  ]
                  // 🔥 CHỈ HIỆN NHỮNG HẠNG GHẾ CÓ GIÁ TRONG DATABASE
                  .filter(cls => trip.prices && trip.prices[cls.id])
                  .map((cls) => (
                    <label key={cls.id} className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${selectedClass === cls.id ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500' : 'border-gray-200 hover:border-orange-300'}`}>
                      <div className="flex items-center gap-4">
                         <input 
                            type="radio" 
                            name="trainClass" 
                            className="w-5 h-5 accent-orange-600" 
                            checked={selectedClass === cls.id} 
                            onChange={() => setSelectedClass(cls.id)} 
                         />
                         <div>
                            <div className="font-black text-gray-800">{cls.name}</div>
                            <div className="text-xs text-gray-500 font-medium">{cls.desc}</div>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="text-orange-600 font-black px-4 py-1 bg-white border border-orange-100 rounded-full text-xs">
                           {new Intl.NumberFormat('vi-VN').format(trip.prices[cls.id])}đ
                         </div>
                      </div>
                    </label>
                  ))}
               </div>
            </div>
          </div>

          {/* --- CỘT PHẢI: SUMMARY SIDEBAR --- */}
          <aside className="space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-2xl font-black text-gray-800 mb-8 uppercase tracking-tighter">Summary</h2>
              
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                   <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Loại vé đã chọn</p>
                   <p className="font-black text-gray-800 text-lg capitalize">{selectedClass}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                   <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Tổng cộng</p>
                   <div className="text-3xl font-black text-orange-600">
                     {new Intl.NumberFormat('vi-VN').format(currentPrice)}đ
                   </div>
                   <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">per passenger</p>
                </div>

                <button 
                  onClick={() => router.push(`/booking/seat-selection?tripId=${trip._id}&class=${selectedClass}&type=train`)}
                  className="w-full bg-orange-500 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 active:scale-95 flex items-center justify-center gap-2"
                >
                  Chọn chỗ ngồi <ArrowRight size={18} />
                </button>

                <button 
                  onClick={() => router.back()}
                  className="w-full bg-white text-gray-800 border-2 border-gray-100 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-50 transition-all text-sm"
                >
                  Quay lại kết quả
                </button>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}