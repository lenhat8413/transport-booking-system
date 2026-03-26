'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import axios from 'axios';
import {
    Plane, Train, ArrowRight, Filter, ChevronLeft,
    ChevronRight, Loader2, AlertCircle, MapPin
} from 'lucide-react';
import Link from 'next/link';

function SearchResults() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // 1. Lấy dữ liệu từ URL
    const type = searchParams.get('type') || 'flight';
    const origin = searchParams.get('origin') || '';
    const destination = searchParams.get('destination') || '';
    const departureDate = searchParams.get('departure_date') || '';
    const passengers = searchParams.get('passengers') || '1';
    const seatClass = searchParams.get('seat_class') || 'economy';
    const page = parseInt(searchParams.get('page') || '1');

    // State
    const [results, setResults] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State cho Filter (Local)
    const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');

    // Hàm cập nhật URL
    const updateFilters = (newParams: Record<string, string | number>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(newParams).forEach(([key, value]) => {
            if (value) params.set(key, value.toString());
            else params.delete(key);
        });
        router.push(`${pathname}?${params.toString()}`);
    };

    useEffect(() => {
        const fetchResults = async () => {
            if (!origin || !destination || !departureDate) {
                setLoading(false);
                return;
            }
            setLoading(true);
            setError('');
            try {
                const query = new URLSearchParams(searchParams.toString()).toString();
                // Endpoint linh hoạt theo type
                const endpoint = type === 'flight'
                    ? `${process.env.NEXT_PUBLIC_API_URL}/flights/search?${query}`
                    : `${process.env.NEXT_PUBLIC_API_URL}/train-trips/search?${query}`;

                const response = await axios.get(endpoint);
                if (response.data.success) {
                    setResults(response.data.data.items);
                    setTotal(response.data.data.total);
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Không tìm thấy chuyến đi phù hợp.');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [searchParams, type, origin, destination, departureDate]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">

            {/* --- CỘT TRÁI: BỘ LỌC --- */}
            <aside className="w-full md:w-1/4 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                    <div className="flex items-center gap-2 font-bold text-lg mb-6 text-gray-800 border-b pb-4">
                        <Filter size={20} className="text-blue-600" /> Bộ lọc tìm kiếm
                    </div>

                    {/* Lọc Giá */}
                    <div className="mb-8">
                        <h4 className="font-semibold text-gray-700 mb-4 uppercase text-xs tracking-wider">Khoảng giá (VND)</h4>
                        <div className="space-y-3">
                            <input
                                type="number" placeholder="Giá thấp nhất"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                            />
                            <input
                                type="number" placeholder="Giá cao nhất"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                            />
                            <button
                                onClick={() => updateFilters({ min_price: minPrice, max_price: maxPrice, page: 1 })}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
                            >
                                Áp dụng
                            </button>
                        </div>
                    </div>

                    {/* Lọc Hãng/Đơn vị */}
                    <div className="mb-6">
                        <h4 className="font-semibold text-gray-700 mb-4 uppercase text-xs tracking-wider">
                            {type === 'flight' ? 'Hãng hàng không' : 'Hãng tàu hỏa'}
                        </h4>
                        <div className="space-y-3">
                            {(type === 'flight' ? ['VN', 'VJ', 'QH'] : ['SE']).map(code => (
                                <label key={code} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        onChange={(e) => updateFilters({ airlines: e.target.checked ? code : '', page: 1 })}
                                    />
                                    <span className="text-gray-600 group-hover:text-blue-600 font-medium transition-colors">
                                        {code === 'VN' ? 'Vietnam Airlines' : code === 'VJ' ? 'Vietjet Air' : code === 'QH' ? 'Bamboo Airways' : 'Đường Sắt Việt Nam'}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => router.push(`${pathname}?type=${type}&origin=${origin}&destination=${destination}&departure_date=${departureDate}`)}
                        className="w-full text-sm text-red-500 font-bold py-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        Xóa tất cả bộ lọc
                    </button>
                </div>
            </aside>

            {/* --- CỘT PHẢI: DANH SÁCH --- */}
            <main className="flex-1">
                {/* Header Tóm tắt chuyến đi */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-3xl p-8 mb-8 shadow-xl relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <div className="flex items-center gap-4 text-2xl md:text-3xl font-black uppercase tracking-tight">
                                {origin} <ArrowRight className="text-blue-300" /> {destination}
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-blue-100 font-medium bg-blue-800/30 w-fit px-4 py-1 rounded-full text-sm">
                                {type === 'flight' ? <Plane size={16} /> : <Train size={16} />}
                                <span>{new Date(departureDate).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' })}</span>
                                <span className="mx-1">•</span>
                                <span>{passengers} Khách</span>
                            </div>
                        </div>
                        <div className="bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/20 text-center">
                            <div className="text-xs uppercase font-bold text-blue-200 mb-1">Hạng chỗ</div>
                            <div className="font-black text-xl capitalize">{seatClass === 'business' ? 'Thương gia' : 'Phổ thông'}</div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center py-32 text-blue-600">
                        <Loader2 size={64} className="animate-spin mb-4" />
                        <p className="font-bold animate-pulse text-lg">Đang tìm chuyến đi tốt nhất cho bạn...</p>
                    </div>
                ) : error ? (
                    <div className="bg-white border-2 border-dashed border-gray-200 p-16 rounded-3xl text-center">
                        <AlertCircle size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{error}</h3>
                        <p className="text-gray-500">Thử thay đổi ngày đi hoặc địa điểm khác bạn nhé!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Tìm thấy {total} kết quả</p>
                            <div className="text-sm text-blue-600 font-bold hover:underline cursor-pointer">Sắp xếp theo giá tốt nhất</div>
                        </div>

                        {results.map((trip: any) => (
                            <div key={trip._id} className="group bg-white border border-gray-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-2xl transition-all duration-300 border-l-8 border-l-orange-500 relative overflow-hidden">

                                {/* Cột 1: Hãng/Đơn vị */}
                                <div className="w-full md:w-1/4">
                                    <div className="text-xs font-bold text-blue-600 uppercase mb-2 block tracking-widest">
                                        {type === 'flight' ? 'Airline' : 'Train Operator'}
                                    </div>
                                    <div className="font-black text-xl text-gray-800 leading-tight">
                                        {type === 'flight' ? trip.airline_id?.name : (trip.train_id?.name || 'Đường Sắt VN')}
                                    </div>
                                    <div className="mt-2 inline-flex items-center px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-500 uppercase tracking-widest border border-gray-200">
                                        {type === 'flight' ? trip.airline_id?.iata_code : trip.train_id?.train_number}
                                    </div>
                                </div>

                                {/* Cột 2: Thời gian & Lộ trình */}
                                <div className="flex-1 flex justify-between items-center w-full px-4 md:px-10">
                                    <div className="text-center min-w-[80px]">
                                        <div className="text-3xl font-black text-gray-900 mb-1">
                                            {new Date(trip.departure_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter bg-gray-50 py-1 rounded-md border border-gray-100">{origin}</div>
                                    </div>

                                    <div className="flex-1 px-4 flex flex-col items-center">
                                        <div className="w-full border-t-2 border-dashed border-gray-200 relative mb-1">
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 transition-transform group-hover:scale-125 duration-500">
                                                {type === 'flight' ? (
                                                    <Plane size={24} className="text-blue-500" />
                                                ) : (
                                                    <Train size={24} className="text-blue-500" />
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Trực tiếp</span>
                                    </div>

                                    <div className="text-center min-w-[80px]">
                                        <div className="text-3xl font-black text-gray-900 mb-1">
                                            {new Date(trip.arrival_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter bg-gray-50 py-1 rounded-md border border-gray-100">{destination}</div>
                                    </div>
                                </div>

                                {/* Cột 3: Giá & Nút chọn */}
                                <div className="w-full md:w-1/4 text-center md:text-right md:border-l md:pl-8 border-gray-100">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Giá mỗi khách từ</div>
                                    <div className="text-3xl font-black text-orange-500 drop-shadow-sm">
                                        {new Intl.NumberFormat('vi-VN').format(trip.prices?.[seatClass] || 0)}
                                        <span className="text-sm ml-1">₫</span>
                                    </div>

                                    <Link
                                        href={type === 'flight' ? `/flights/${trip._id}` : `/train-trips/${trip._id}`}
                                        className="mt-4 w-full bg-orange-500 text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 block text-center active:translate-y-1"
                                    >
                                        Chọn ngay
                                    </Link>
                                    <div className="text-[9px] text-gray-400 mt-2 font-bold italic">*Giá đã bao gồm thuế phí</div>
                                </div>
                            </div>
                        ))}

                        {/* --- PHÂN TRANG --- */}
                        {total > 0 && (
                            <div className="flex justify-center items-center gap-6 mt-16 pb-12">
                                <button
                                    disabled={page <= 1}
                                    onClick={() => updateFilters({ page: page - 1 })}
                                    className="w-12 h-12 flex items-center justify-center rounded-2xl border-2 border-gray-200 disabled:opacity-20 hover:border-blue-500 hover:text-blue-600 transition-all bg-white shadow-sm"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Trang</span>
                                    <span className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-200">{page}</span>
                                </div>
                                <button
                                    disabled={results.length < 10 || page * 10 >= total}
                                    onClick={() => updateFilters({ page: page + 1 })}
                                    className="w-12 h-12 flex items-center justify-center rounded-2xl border-2 border-gray-200 disabled:opacity-20 hover:border-blue-500 hover:text-blue-600 transition-all bg-white shadow-sm"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default function SearchPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFD] pt-24">
            <Suspense fallback={
                <div className="flex justify-center items-center h-[60vh]">
                    <Loader2 className="animate-spin text-blue-600" size={48} />
                </div>
            }>
                <SearchResults />
            </Suspense>
        </div>
    );
}