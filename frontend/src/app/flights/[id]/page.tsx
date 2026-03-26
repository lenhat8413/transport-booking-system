'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import {
    Plane, Clock, Briefcase, ShieldCheck, ChevronLeft,
    Info, Users, Ticket, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';

export default function FlightDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const [flight, setFlight] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedClass, setSelectedClass] = useState('economy');

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/flights/${id}`);
                if (response.data.success) setFlight(response.data.data);
            } catch (err) {
                console.error("Lỗi lấy chi tiết:", err);
            } finally { setLoading(false); }
        };
        fetchDetail();
    }, [id]);

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
    );

    if (!flight) return <div className="text-center py-20 font-bold">Không tìm thấy thông tin chuyến bay.</div>;

    // Tính toán giá dựa trên hạng ghế đã chọn
    const currentPrice = flight.prices?.[selectedClass] || flight.prices?.economy;

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="max-w-6xl mx-auto px-4">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium">
                    <span className="hover:text-blue-600 cursor-pointer" onClick={() => router.push('/')}>Search Results</span>
                    <span>→</span>
                    <span className="text-gray-800 font-bold">Trip detail</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* --- CỘT TRÁI: CHI TIẾT CHUYẾN BAY --- */}
                    <div className="lg:col-span-2 space-y-6 bg-white rounded-xl shadow-sm border border-blue-200 p-8">
                        <h1 className="text-3xl font-black text-gray-800 mb-2">Trip details</h1>
                        <p className="text-gray-500 font-medium mb-8">
                            Route: {flight.departure_airport_id?.iata_code} → {flight.arrival_airport_id?.iata_code} • Date: {new Date(flight.departure_time).toLocaleDateString('vi-VN')}
                        </p>

                        {/* 1. Tóm tắt chuyến bay (Dashed Box) */}
                        <div className="border-2 border-dashed border-blue-100 rounded-xl p-6 relative">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center font-black text-blue-600 border border-blue-100 italic">VN</div>
                                    <div>
                                        <div className="font-black text-gray-800">{flight.airline_id?.name}</div>
                                        <div className="text-xs text-gray-500 font-bold">{flight.flight_number} • {selectedClass === 'economy' ? 'Economy' : 'Business'} • Non-stop</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-12">
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-gray-800">{new Date(flight.departure_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase">{flight.departure_airport_id?.iata_code} ({flight.departure_airport_id?.city})</div>
                                    </div>
                                    <div className="w-20 border-t border-gray-300"></div>
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-gray-800">{new Date(flight.arrival_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase">{flight.arrival_airport_id?.iata_code} ({flight.arrival_airport_id?.city})</div>
                                    </div>
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="flex gap-2 mt-6">
                                {['Non-stop', '2h 15m', 'Carry-on 7kg'].map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-[10px] font-black text-gray-500 uppercase">{tag}</span>
                                ))}
                            </div>
                        </div>

                        {/* 2. Thông tin hãng (Grid) */}
                        <div className="pt-4">
                            <h3 className="font-black text-blue-800 bg-blue-50 w-fit px-2 py-1 rounded text-sm mb-4">Thông tin hãng</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="border border-blue-100 rounded-xl p-4">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Hãng bay</p>
                                    <p className="font-bold text-gray-800">{flight.airline_id?.name}</p>
                                </div>
                                <div className="border border-blue-100 rounded-xl p-4">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Số hiệu chuyến bay</p>
                                    <p className="font-bold text-gray-800">{flight.flight_number}</p>
                                </div>
                                <div className="border border-blue-100 rounded-xl p-4">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Máy bay</p>
                                    <p className="font-bold text-gray-800">Airbus A321</p>
                                </div>
                                <div className="border border-blue-100 rounded-xl p-4 bg-blue-50/30">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Hạng vé</p>
                                    <p className="font-bold text-blue-600 capitalize">{selectedClass}</p>
                                </div>
                            </div>
                        </div>

                        {/* 3. Chính sách hành lý */}
                        <div className="pt-4">
                            <h3 className="font-black text-blue-800 bg-blue-50 w-fit px-2 py-1 rounded text-sm mb-4">Chính sách hành lý / quy định</h3>
                            <ul className="space-y-2 text-sm text-gray-600 font-medium">
                                <li className="flex items-start gap-2">• Hành lý xách tay: 7kg/người (01 kiện).</li>
                                <li className="flex items-start gap-2">• Hành lý ký gửi: tùy hạng vé (có thể mua thêm).</li>
                                <li className="flex items-start gap-2">• Có mặt trước giờ bay 60-90 phút để làm thủ tục.</li>
                                <li className="flex items-start gap-2">• Đổi/huỷ: áp dụng theo điều kiện của hạng vé đã chọn.</li>
                            </ul>
                        </div>

                        {/* 4. Chọn Hạng ghế (Chỉ hiển thị những gì có trong Database) */}
                        <div className="pt-4">
                            <h3 className="font-black text-blue-800 bg-blue-50 w-fit px-2 py-1 rounded text-sm mb-4">Hạng ghế</h3>
                            <div className="space-y-3">
                                {[
                                    { id: 'economy', name: 'Economy', desc: 'Giá tốt • Phù hợp đa số' },
                                    { id: 'premium', name: 'Premium Economy', desc: 'Rộng hơn • Ưu tiên check-in' },
                                    { id: 'business', name: 'Business', desc: 'Ưu tiên • Phòng chờ' }
                                ]
                                    // 🔥 BƯỚC QUAN TRỌNG: Chỉ giữ lại những hạng ghế có giá trị trong flight.prices
                                    .filter(cls => flight.prices && flight.prices[cls.id])
                                    .map((cls) => (
                                        <label key={cls.id} className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${selectedClass === cls.id ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-300'}`}>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="radio"
                                                    name="seatClass"
                                                    className="w-5 h-5 accent-blue-600"
                                                    checked={selectedClass === cls.id}
                                                    onChange={() => setSelectedClass(cls.id)}
                                                />
                                                <div>
                                                    <div className="font-black text-gray-800">{cls.name}</div>
                                                    <div className="text-xs text-gray-500 font-medium">{cls.desc}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-blue-600 font-black px-4 py-1 bg-white border border-blue-100 rounded-full text-xs">
                                                    From {new Intl.NumberFormat('vi-VN').format(flight.prices[cls.id])}đ
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
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Hạng ghế đã chọn</p>
                                    <p className="font-black text-gray-800 text-lg capitalize">{selectedClass}</p>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Giá</p>
                                    <div className="text-3xl font-black text-blue-600">
                                        {new Intl.NumberFormat('vi-VN').format(currentPrice)}đ
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">from / pax</p>
                                </div>

                                <button
                                    onClick={() => router.push(`/booking/seat-selection?flightId=${flight._id}&class=${selectedClass}`)}
                                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
                                >
                                    Chọn ghế
                                </button>

                                <button
                                    onClick={() => router.back()}
                                    className="w-full bg-white text-gray-800 border-2 border-gray-100 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
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