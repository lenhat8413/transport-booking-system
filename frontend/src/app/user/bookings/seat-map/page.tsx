"use client";

import React, { useState, useEffect, useCallback } from 'react';
import './seat-map.css';

interface Seat {
  id: string;
  row: number;
  col: string;
  status: 'empty' | 'selected' | 'held' | 'booked';
  price: number;
}

const SEAT_PRICE = 450000;

export default function SeatMapPage() {
  const [seatsData, setSeatsData] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [holdTimeRemaining, setHoldTimeRemaining] = useState<number>(15 * 60);
  const [isCounting, setIsCounting] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const rows = 10;
      const columns = ["A", "B", "C", "D"];
      const data: Seat[] = [];

      for (let r = 1; r <= rows; r++) {
        columns.forEach((col) => {
          const rand = Math.random();
          let status: Seat['status'] = "empty";
          if (rand < 0.15) status = "booked";
          else if (rand > 0.85) status = "held";

          data.push({
            id: `${r}${col}`,
            row: r,
            col: col,
            status: status,
            price: SEAT_PRICE,
          });
        });
      }
      setSeatsData(data);
    }, 500);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCounting && holdTimeRemaining > 0) {
      interval = setInterval(() => {
        setHoldTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (holdTimeRemaining <= 0) {
      setIsCounting(false);
    }
    return () => clearInterval(interval);
  }, [isCounting, holdTimeRemaining]);

  const handleTimeout = useCallback(() => {
    alert("Đã hết thời gian giữ ghế. Vui lòng chọn lại.");
    setSeatsData((prevData) =>
      prevData.map((seat) =>
        selectedSeats.some((s) => s.id === seat.id)
          ? { ...seat, status: "empty" }
          : seat
      )
    );
    setSelectedSeats([]);
    setIsCounting(false);
    setHoldTimeRemaining(15 * 60);
  }, [selectedSeats]);

  const toggleSeatSelection = (targetSeat: Seat) => {
    if (targetSeat.status === 'booked' || targetSeat.status === 'held') return;

    const isSelected = selectedSeats.some(s => s.id === targetSeat.id);
    let newSelected: Seat[];

    if (isSelected) {
      newSelected = selectedSeats.filter(s => s.id !== targetSeat.id);
      setSeatsData(prev => prev.map(s => s.id === targetSeat.id ? { ...s, status: 'empty' } : s));
    } else {
      newSelected = [...selectedSeats, { ...targetSeat, status: 'selected' }];
      setSeatsData(prev => prev.map(s => s.id === targetSeat.id ? { ...s, status: 'selected' } : s));
    }

    setSelectedSeats(newSelected);

    if (newSelected.length > 0 && !isCounting) {
      setIsCounting(true);
      setHoldTimeRemaining(15 * 60);
    } else if (newSelected.length === 0) {
      setIsCounting(false);
    }
  };

  const removeSeat = (seatId: string) => {
    const seatTarget = seatsData.find(s => s.id === seatId);
    if (seatTarget) toggleSeatSelection({...seatTarget, status: 'selected'});
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) return;
    setIsProcessing(true);
    setTimeout(() => {
      const seatIds = selectedSeats.map(s => s.id).join(", ");
      alert(`Giữ ghế thành công!\nCác ghế: ${seatIds}\nChuyển sang trang nhập thông tin hành khách...`);
      setIsProcessing(false);
    }, 800);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  // Group seats by row
  const rowsData: Record<number, Seat[]> = {};
  seatsData.forEach(seat => {
    if (!rowsData[seat.row]) rowsData[seat.row] = [];
    rowsData[seat.row].push(seat);
  });

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <div className="app-container">
        {/* Header */}
        <header className="page-header">
          <button className="back-link" aria-label="Quay lại">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h1>Chọn ghế chuyến đi</h1>
        </header>

        <div className="main-content">
          {/* Left Column */}
          <div className="left-panel">
            {/* Trip Info */}
            <section className="trip-info-card card">
              <div className="trip-header">
                <span className="trip-code">
                  <i className="fa-solid fa-plane-departure"></i> VJ123
                </span>
                <span className="trip-status">Đang mở bán</span>
              </div>
              <div className="trip-details">
                <div className="route">
                  <div className="location">
                    <strong>SGN</strong>
                    <span className="city">TP. Hồ Chí Minh</span>
                  </div>
                  <div className="path-connector">
                    <i className="fa-solid fa-arrow-right"></i>
                  </div>
                  <div className="location">
                    <strong>HAN</strong>
                    <span className="city">Hà Nội</span>
                  </div>
                </div>
                <div className="time-info">
                  <div className="time-item">
                    <i className="fa-regular fa-calendar"></i>
                    <span>15/10/2026</span>
                  </div>
                  <div className="time-item">
                    <i className="fa-regular fa-clock"></i>
                    <span>10:30 (Dự kiến đến 12:40)</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Legend */}
            <section className="legend-area card">
              <h3>Chú thích</h3>
              <div className="legend-items">
                <div className="legend-item">
                  <div className="seat-badge empty"></div> Ghế trống
                </div>
                <div className="legend-item">
                  <div className="seat-badge selected"></div> Đang chọn
                </div>
                <div className="legend-item">
                  <div className="seat-badge held"></div> Đang giữ
                </div>
                <div className="legend-item">
                  <div className="seat-badge booked"></div> Đã đặt / Ko bán
                </div>
              </div>
            </section>

            {/* Seat Map */}
            <section className="seat-map-wrapper card">
              <div className="map-header">
                <h3>Sơ đồ ghế ngồi</h3>
                <p>Vui lòng click vào ghế trống để chọn.</p>
              </div>

              <div className="seat-map-container">
                <div className="seat-map-grid" id="seat-map-grid">
                  {Object.keys(rowsData).map((rowIndexStr) => {
                    const rowIndex = Number(rowIndexStr);
                    const row = rowsData[rowIndex];
                    const leftGroup = row.filter(s => ["A", "B"].includes(s.col));
                    const rightGroup = row.filter(s => ["C", "D"].includes(s.col));

                    return (
                      <div key={rowIndex} className="seat-row">
                        <div className="seat-group">
                          {leftGroup.map(seat => (
                            <div 
                              key={seat.id}
                              className={`seat status-${seat.status}`}
                              title={`Ghế ${seat.id} - ${formatCurrency(seat.price)}`}
                              onClick={() => toggleSeatSelection(seat)}
                            >
                              {seat.status === 'booked' ? <i className="fa-solid fa-xmark"></i> : seat.id}
                            </div>
                          ))}
                        </div>
                        <div className="row-label">{rowIndex}</div>
                        <div className="seat-group">
                          {rightGroup.map(seat => (
                            <div 
                              key={seat.id}
                              className={`seat status-${seat.status}`}
                              title={`Ghế ${seat.id} - ${formatCurrency(seat.price)}`}
                              onClick={() => toggleSeatSelection(seat)}
                            >
                              {seat.status === 'booked' ? <i className="fa-solid fa-xmark"></i> : seat.id}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="right-panel">
            <div className="summary-card card sticky">
              <h2>Chi tiết đặt chỗ</h2>

              {isCounting && (
                <div className="countdown-wrapper" id="countdown-wrapper">
                  <div className="countdown-label">
                    <i className="fa-regular fa-clock"></i> Thời gian giữ ghế
                  </div>
                  <div className="countdown-timer" id="timer-display">{formatTime(holdTimeRemaining)}</div>
                </div>
              )}

              <div className="selected-seats-info">
                <h3>Ghế đã chọn (<span id="selected-count">{selectedSeats.length}</span>)</h3>
                <div className="selected-list" id="selected-seats-list">
                  {selectedSeats.length === 0 ? (
                    <div className="empty-state">Chưa có ghế nào được chọn</div>
                  ) : (
                    selectedSeats.map(seat => (
                      <div key={seat.id} className="selected-seat-item">
                        <div>Ghế <strong>{seat.id}</strong></div>
                        <div>{formatCurrency(seat.price)}
                          <button 
                            className="btn-remove-seat" 
                            aria-label="Xóa ghế"
                            onClick={() => removeSeat(seat.id)}
                            data-id={seat.id}
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="price-summary">
                <div className="price-row">
                  <span>Tạm tính</span>
                  <strong id="total-price">{formatCurrency(totalPrice)}</strong>
                </div>
              </div>

              <div className="action-buttons">
                <button className="btn btn-secondary"><i className="fa-solid fa-arrow-left"></i> Quay lại</button>
                <button 
                  className="btn btn-primary" 
                  id="btn-continue"
                  disabled={selectedSeats.length === 0 || isProcessing}
                  onClick={handleContinue}
                >
                  {isProcessing ? (
                    <><i className="fa-solid fa-spinner fa-spin"></i> Đang xử lý...</>
                  ) : (
                    <>Tiếp tục <i className="fa-solid fa-arrow-right"></i></>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
