import { heightResponsive, widthResponsive } from "../helper"
import profilePicture from '../assets/pp.jfif'
import { Icon } from "@iconify/react";
import { useState } from "react";
import ChartGizi from "../Utils/ChartGizi";

const Home = () => {
    const [giziIntake, setGiziIntake] = useState('hari')


    const todayHistory = [
        {jam: '10:00', makanan: 'Kopi ABC', waktu: 'sarapan', energi: 100},
        {jam: '12:30', makanan: 'Kopiko 78', waktu: 'makan siang', energi: 120},
        {jam: '15:50', makanan: 'Teh Kotak', waktu: 'cemilan', energi: 80}
    ]

    return(
        <div className="w-screen font-['Poppins'] no-scrollbar flex flex-col items-center justify-center"
  style={{
    height: "100%",
    overflowY: "auto",
    paddingBottom: 110,
  }}>

            {/* Profile container */}
            <div className="flex flex-row gap-4 m-4 items-center " style={{ width: widthResponsive(352), height: heightResponsive(75)}}>
                <div className="w-[56px] h-[56px] rounded-full flex items-center overflow-hidden justify-center">
                    <img src={profilePicture} className="object-cover w-full h-full"/>
                </div>

                <div className="flex flex-col justify-center h-full w-56">
                    <h2 className="text-[12px] text-gray-600">Welcome back</h2>
                    <h3 className="text-[16px] font-semibold">M. Taufik</h3>
                </div>

                <Icon icon='clarity:notification-line' fontSize={32}/>
            </div>

            {/* main container */}
            <div className="flex flex-col w-full gap-10 h-full px-8">
                    <div className="flex flex-col h-full w-full gap-4">
                        <h2 className="text-lg font-semibold">Today's Status & Activity</h2>
                            <div className="bg-white rounded-lg flex flex-col items-start p-4 justify-center gap-8 border border-2 border-[var(--Primary-color)]" style={{ width: widthResponsive(352), height: heightResponsive(300)}}>

                                <div className="bg-white flex flex-row items-center justify-start px-2 gap-2 border-2 rounded-xl border-[var(--Primary-color)]" style={{ width: widthResponsive(250), height: heightResponsive(48)}}>
                                    <div className="w-3 h-3 bg-[var(--Primary-color)] rounded-full"></div>
                                    <h2 className="text-md font-medium">Kondisi terpantau baik</h2>
                                </div>

                                {/* Text */}
                                <div className="flex items-center justify-center flex-col gap-2" style={{ width: widthResponsive(300), height: heightResponsive(100)}}>
                                    <h2 className="font-semibold text-2xl">Pilihan kecil hari ini, <span className="text-[var(--Primary-color)]">dampak besar nanti.</span></h2>
                                    <p className="text-gray-500 text-sm text-justify">Konsumsi gula harianmu masih aman. Kamu punya sisa batas 18g untuk hari ini.</p>
                                </div>
                                <div className="flex flex-row items-center justify-start gap-4" style={{ width: widthResponsive(330), height: heightResponsive(60)}}>
                                    <button className="bg-[var(--Primary-color)] flex flex-row items-center justify-start gap-2 px-2 rounded-xl" style={{width: widthResponsive(140), height: heightResponsive(50)}}>
                                        <Icon color="white" icon={'boxicons:scan'} fontSize={24} />
                                        <h2 className="text-white font-medium text-xs">Scan Produk</h2>
                                    </button>

                                    <button className="bg-white border-[var(--Primary-color)] border-2 flex flex-row items-center justify-start gap-2 px-2 rounded-xl" style={{width: widthResponsive(140), height: heightResponsive(50)}}>
                                        <Icon color="var(--Primary-color)" icon={'basil:document-outline'} fontSize={24} />
                                        <h2 className="text-[var(--Primary-color)] text-xs font-medium">Lihat laporan</h2>
                                    </button>
                                </div>
                            </div>
                    </div>


                    {/* Gizi Harian */}
                    <div className="bg-white border-2 p-2 flex flex-col rounded-lg gap-6 border-[var(--Primary-color)]" style={{width: widthResponsive(352), height: heightResponsive(280)}}>
                        <div className="flex flex-row items-center justify-between" style={{width: widthResponsive(330), height: heightResponsive(50)}}>
                            <div style={{width: widthResponsive(150), height: heightResponsive(50)}}>
                                <h2 className="text-base font-medium">Ringkasan gizi</h2>
                                <p className="text-gray-500 font-regular text-xs">Diperbarui 11 menit lalu</p>
                            </div>

                            <div className="flex flex-row items-center justify-center gap-2" style={{width: widthResponsive(150), height: heightResponsive(50)}}>
                                <button onClick={() => setGiziIntake('hari')} className={` ${giziIntake == 'hari' ? "bg-[var(--Primary-color)] text-white" : "bg-white border-1 border-[var(--Primary-color)] text-[var(--Primary-color)]"} rounded-md text-[10px]`} style={{width: widthResponsive(60), height: heightResponsive(30)}}>Hari</button>
                                <button onClick={() => setGiziIntake('minggu')} className={`${giziIntake == 'minggu' ? "bg-[var(--Primary-color)] text-white" : "bg-white border-1 border-[var(--Primary-color)] text-[var(--Primary-color)]"} rounded-md text-[10px]`} style={{width: widthResponsive(60), height: heightResponsive(30)}}>Minggu</button>
                                <button onClick={() => setGiziIntake('bulan')} className={` ${giziIntake == 'bulan' ? "bg-[var(--Primary-color)] text-white" : "bg-white border-1 border-[var(--Primary-color)] text-[var(--Primary-color)]"} rounded-md text-[10px]`} style={{width: widthResponsive(60), height: heightResponsive(30)}}>Bulan</button>
                            </div>
                        </div>


                        {/* Chart */}
                        <div className="flex flex-row items-center justify-center gap-4" style={{width: widthResponsive(330), height: heightResponsive(130)}}>
                            <ChartGizi/>
                        </div>
                    </div>

                    {/* History */}
                    <div className="bg-white border-2 items-center justify-center p-2 flex flex-col rounded-lg gap-4 border-[var(--Primary-color)]" style={{width: widthResponsive(352), height: heightResponsive(250)}}>
                        <div className="flex flex-row items-center justify-between" style={{width: widthResponsive(330), height: heightResponsive(50)}}>
                            <div style={{width: widthResponsive(200), height: heightResponsive(50)}}>
                                <h2 className="text-base font-medium">Konsumsi hari ini</h2>
                                <p className="text-gray-500 font-regular text-xs">3 dari 4 waktu makan tercatat</p>
                            </div>

                            <div className="flex flex-row items-center justify-center gap-2" style={{width: widthResponsive(100), height: heightResponsive(50)}}>
                                <h2 className="text-xs text-gray-500">Lihat semua</h2>
                            </div>
                        </div>

                        <div
                          className="flex gap-4 flex-col items-center justify-start overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                          style={{ width: widthResponsive(352), height: heightResponsive(150) }}
                        >
                          {todayHistory.map((items, index) => (
                            <div
                              key={index}
                              className="shrink-0 bg-white p-2 rounded-md flex flex-row items-center justify-between border border-[var(--Primary-color)]"
                              style={{ width: widthResponsive(310), height: heightResponsive(50) }}
                            >
                              <h2 className="text-xs text-gray-500 font-medium">{items.jam}</h2>
                              <Icon icon="andrsrxn:clock-hour-eight" fontSize={24} color="var(--Primary-color)" />
                              <div style={{ width: widthResponsive(200), height: heightResponsive(50) }}>
                                <div className="w-[60%] h-full text-gray-500 items-start justify-center flex flex-col">
                                  <h2 className="text-sm font-medium">{items.makanan}</h2>
                                  <p className="text-xs font-regular">
                                    {items.waktu} - <span>{items.energi}</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                    </div>

                    <div className="bg-white border-2 items-center p-2 flex flex-col rounded-lg gap-2 border-[var(--Primary-color)]" style={{width: widthResponsive(352), height: heightResponsive(200)}}>
                        <div className="flex flex-row items-center justify-between" style={{width: widthResponsive(300), height: heightResponsive(50)}}>
                                <h2 className="text-base font-medium">Batas kesehatanmu</h2>
                                <h2 className="text-xs text-gray-500">Ubah</h2>
                        </div>

                        <div className="flex flex-col items-center justify-center gap-4" style={{width: widthResponsive(300), height: heightResponsive(120)}}>
                            <div className="flex flex-row items-center p-2 bg-[#FFCB7E]/50 rounded-lg gap-2 justify-start" style={{width: widthResponsive(300), height: heightResponsive(50)}}>
                                <Icon icon='ic:outline-gpp-good' fontSize={32} color="var(--Primary-color)"/>
                                <div className="h-full flex justify-center flex-col">
                                    <h2 className="text-sm font-medium">Pradiabetes</h2>
                                    <p className="text-xs font-regular">Batas gula maks. 50g/hari</p>
                                </div>
                            </div>

                            <div className="flex flex-row items-center p-2 bg-[#F5F5F5] rounded-lg gap-2 justify-start" style={{width: widthResponsive(300), height: heightResponsive(50)}}>
                                <Icon icon='akar-icons:health' fontSize={24}/>
                                <div className="h-full flex justify-center flex-col">
                                    <h2 className="text-sm font-medium">Kolesterol</h2>
                                    <p className="text-xs font-regular">Dalam batas normal</p>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>
        </div>
    )
}

export default Home